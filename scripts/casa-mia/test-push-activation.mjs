import { chromium, expect } from "@playwright/test";
import { demoData } from "../../src/features/casa-mia/demo.ts";
const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/bin/chromium",
});
const origin = process.env.CASA_MIA_TEST_URL || "http://127.0.0.1:4178";
try {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    serviceWorkers: "block",
  });
  const publicKey = Buffer.from([4, ...Array(64).fill(1)]).toString(
    "base64url",
  );
  await context.addInitScript(
    ({ publicKey }) => {
      window.__subscription = null;
      window.__permissionRequests = 0;
      Object.defineProperty(Notification, "permission", {
        get: () => "granted",
      });
      Notification.requestPermission = async () => {
        window.__permissionRequests++;
        return "granted";
      };
      window.__testKey = Uint8Array.from(
        atob(publicKey.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      const registration = {
        active: { state: "activated" },
        pushManager: {
          getSubscription: async () => window.__subscription,
          subscribe: () => new Promise(() => {}),
        },
      };
      Object.defineProperty(navigator.serviceWorker, "register", {
        value: async () => registration,
      });
      Object.defineProperty(navigator.serviceWorker, "getRegistration", {
        value: async () => registration,
      });
    },
    { publicKey },
  );
  const page = await context.newPage();
  let registered = false,
    posts = 0;
  await page.route("**/api/casa-mia/**", (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/status"))
      return r.fulfill({ json: { enabled: true, configured: true } });
    if (path.endsWith("/admin/console")) return r.fulfill({ json: demoData() });
    if (path.endsWith("/admin/push/subscribe")) {
      registered = true;
      posts++;
      return r.fulfill({ status: 201, json: { id: "phone", ok: true } });
    }
    if (path.endsWith("/admin/push/test"))
      return r.fulfill({ json: { accepted: 1 } });
    if (path.endsWith("/admin/push"))
      return r.fulfill({
        json: {
          configured: true,
          publicKey,
          devices: registered
            ? [
                {
                  id: "phone",
                  active: true,
                  key_current: true,
                  label: "Android test",
                },
              ]
            : [],
          deliveries: [],
        },
      });
    return r.abort();
  });
  await page.goto(origin + "/casa-mia/gestione");
  await page
    .getByRole("button", { name: "Apri centro notifiche", exact: true })
    .click();
  const button = page.getByRole("button", {
    name: "Attiva avvisi su questo telefono",
    exact: true,
  });
  await button.click();
  await expect(
    page.getByText("Collegamento al servizio notifiche di Android…", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "Android non ha completato" }),
  ).toBeVisible({ timeout: 25000 });
  await expect(button).toBeEnabled();
  if (posts !== 0)
    throw Error(
      "Server must not be registered before native subscription exists",
    );
  // Simulate the native subscription finishing after the UI deadline.
  await page.evaluate(() => {
    window.__subscription = {
      options: { applicationServerKey: window.__testKey.buffer },
      toJSON: () => ({
        endpoint: "https://fcm.googleapis.com/fcm/send/mock",
        keys: { p256dh: "mock", auth: "mock" },
      }),
    };
  });
  await button.click();
  await expect(
    page.getByRole("button", { name: "Avvisi collegati", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Invia prova dal server", exact: true })
    .click();
  await expect(
    page.getByText(
      "Prova accettata dal servizio push. Controlla il telefono.",
      { exact: true },
    ),
  ).toBeVisible();
  if (posts !== 1)
    throw Error("Existing subscription was not recovered exactly once");
  if ((await page.evaluate(() => window.__permissionRequests)) !== 0)
    throw Error("Already granted permission must not prompt again");
  console.log(
    "Push activation regression passed: stalled Android subscription exits loading, retry recovers late subscription, persists device, enables server test; granted permission is reused. Simulated browser/API only.",
  );
  await context.close();
} finally {
  await browser.close();
}
