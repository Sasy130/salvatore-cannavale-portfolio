import { chromium, expect } from "@playwright/test";
import { demoData } from "../../src/features/casa-mia/demo.ts";
const origin = process.env.CASA_MIA_TEST_URL || "http://127.0.0.1:4177";
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CASA_MIA_TEST_BROWSER || "/usr/bin/chromium",
});
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });
  await context.addInitScript(() => {
    localStorage.setItem("casa-mia:push-device:v1", "phone");
    Notification.requestPermission = () => {
      throw Error("Unsolicited permission prompt");
    };
    Object.defineProperty(Notification, "permission", {
      configurable: true,
      get: () => "granted",
    });
    Object.defineProperty(navigator.serviceWorker, "getRegistration", {
      value: async () => ({
        pushManager: { getSubscription: async () => ({}) },
      }),
    });
    const original = window.matchMedia.bind(window);
    window.matchMedia = (q) =>
      q === "(display-mode: standalone)"
        ? {
            ...original(q),
            matches: true,
            addEventListener() {},
            removeEventListener() {},
          }
        : original(q);
  });
  const page = await context.newPage();
  let active = true,
    fail = false;
  const data = demoData();
  await page.route("**/api/casa-mia/**", (route) => {
    const path = new URL(route.request().url()).pathname;
    if (route.request().method() !== "GET")
      throw Error("Status checks must not mutate any booking or permission");
    if (path.endsWith("/status"))
      return route.fulfill({ json: { enabled: true, configured: true } });
    if (path.endsWith("/admin/console")) return route.fulfill({ json: data });
    if (path.endsWith("/admin/push"))
      return route.fulfill(
        fail
          ? { status: 503, json: { error: "Unavailable" } }
          : {
              json: {
                configured: true,
                publicKey: null,
                devices: [
                  {
                    id: "phone",
                    active,
                    key_current: true,
                    label: "Android test",
                  },
                ],
                deliveries: [],
              },
            },
      );
    return route.abort();
  });
  await page.goto(origin + "/casa-mia/gestione");
  await expect(
    page.getByText("Avvisi attivi su questo telefono", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Installa sul mio telefono", { exact: true }),
  ).toHaveCount(0);
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw Error("Mobile horizontal overflow");
  await page.screenshot({
    path: "outputs/casa-mia-v3/mobile-live-push.png",
    fullPage: true,
  });
  active = false;
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByText("Collega questo telefono", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(Notification, "permission", {
      configurable: true,
      get: () => "denied",
    });
    window.dispatchEvent(new Event("focus"));
  });
  await expect(
    page.getByText("Notifiche bloccate da Android", { exact: true }),
  ).toBeVisible();
  fail = true;
  await page.evaluate(() => {
    Object.defineProperty(Notification, "permission", {
      configurable: true,
      get: () => "granted",
    });
    window.dispatchEvent(new Event("focus"));
  });
  await expect(
    page.getByText("Stato non verificato", { exact: true }),
  ).toBeVisible();
  await context.close();
  console.log(
    "Push status passed: active phone, server revocation, blocked permission, unreachable server, installed layout and no unsolicited permission requests. All API responses simulated; no real booking or push created.",
  );
} finally {
  await browser.close();
}
