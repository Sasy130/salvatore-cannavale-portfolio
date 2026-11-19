import { chromium, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { propertyToday, addDays } from "../../src/features/casa-mia/model.mjs";
const origin = process.env.CASA_MIA_TEST_URL || "http://127.0.0.1:4175";
const output = resolve("outputs/casa-mia-v3");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CASA_MIA_TEST_BROWSER
    ? { executablePath: process.env.CASA_MIA_TEST_BROWSER }
    : {}),
});
const errors = [],
  audits = [];
let page;
async function audit(name, current) {
  const result = await new AxeBuilder({ page: current })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  audits.push({
    name,
    violations: result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
}

async function rangeSelection(current) {
  const base = new Date(propertyToday() + "T12:00:00Z");
  base.setUTCMonth(base.getUTCMonth() + 3, 1);
  const month = base.toISOString().slice(0, 7);
  base.setUTCMonth(base.getUTCMonth() + 1, 0);
  const start = base.toISOString().slice(0, 10);
  const end = addDays(start, 2);
  for (let i = 0; i < 3; i++)
    await current
      .getByRole("button", { name: "Mese successivo", exact: true })
      .click();
  await current.locator('[data-owner-date="' + start + '"]').click();
  await expect(current.locator(".range-start")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await current
    .getByRole("button", { name: "Mese successivo", exact: true })
    .click();
  await current.locator('[data-owner-date="' + end + '"]').click();
  await expect(current.locator(".range-end")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(current.locator(".range-end")).toContainText("Fine");
  await current.screenshot({
    path: resolve(
      output,
      current.viewportSize().width < 600
        ? "mobile-calendar-endpoint.png"
        : "desktop-calendar-endpoint.png",
    ),
    fullPage: true,
  });
  await audit(
    current.viewportSize().width < 600
      ? "mobile-calendar-endpoint"
      : "desktop-calendar-endpoint",
    current,
  );
  await current
    .getByRole("button", { name: "Mese precedente", exact: true })
    .click();
  await expect(current.locator(".range-start")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await current
    .locator(".cm-calendar-toolbar")
    .getByRole("button", { name: "Oggi", exact: true })
    .click();
}

async function enter(current) {
  await current.goto(origin + "/casa-mia/gestione");
  await expect(
    current.getByRole("heading", { name: "Il tuo spazio di gestione." }),
  ).toBeVisible();
  await current.screenshot({
    path: resolve(
      output,
      current.viewportSize().width < 600
        ? "mobile-entrance.png"
        : "desktop-entrance.png",
    ),
    fullPage: true,
  });
  await audit(
    current.viewportSize().width < 600 ? "mobile-entrance" : "desktop-entrance",
    current,
  );
  await current
    .getByRole("button", { name: "Apri la demo interattiva" })
    .click();
  await expect(
    current.getByRole("heading", { name: "Ogni soggiorno, sotto controllo." }),
  ).toBeVisible();
  await expect.poll(() => current.evaluate(() => scrollY)).toBe(0);
}
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    timezoneId: "Europe/Rome",
  });
  page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.screenshot({
    path: resolve(output, "desktop-overview.png"),
    fullPage: true,
  });
  await audit("desktop-overview", page);
  await page.getByRole("button", { name: "Calendario", exact: true }).click();
  await page.screenshot({
    path: resolve(output, "desktop-calendar.png"),
    fullPage: true,
  });
  await rangeSelection(page);
  await expect(page.getByText("Da confermare", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Blocca date", exact: true }).click();
  const start = addDays(propertyToday(), 80),
    end = addDays(start, 45);
  await page.getByLabel("Blocca dal", { exact: true }).fill(start);
  await page.getByLabel("Riapri il", { exact: true }).fill(end);
  await page
    .getByLabel("Motivo del blocco", { exact: true })
    .fill("Blocco prova UI");
  await page
    .getByRole("button", { name: "Controlla le date", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Le date sono disponibili" }),
  ).toBeVisible();
  await page.screenshot({
    path: resolve(output, "desktop-block-review.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Conferma blocco", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.getByRole("button", { name: /Prenotazioni/ }).click();
  await page.getByRole("combobox", { name: /^Stato/ }).selectOption("blocked");
  await page
    .locator(".cm-booking-row")
    .filter({ hasText: "Blocco prova UI" })
    .click();
  await page
    .getByRole("button", { name: "Modifica blocco", exact: true })
    .click();
  await page
    .getByLabel("Blocca dal", { exact: true })
    .fill(addDays(propertyToday(), 4));
  await page
    .getByLabel("Riapri il", { exact: true })
    .fill(addDays(propertyToday(), 7));
  await page
    .getByRole("button", { name: "Controlla le date", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Salva modifiche", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText("Periodi già occupati", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Chiudi finestra", exact: true })
    .click();
  const site = await context.newPage();
  site.on("pageerror", (e) => errors.push(e.message));
  await site.goto(origin + "/demos/dimora-mia/#booking");
  await site.locator("input[name=checkin]").fill(start);
  await site.locator("input[name=checkout]").fill(addDays(start, 3));
  await site.locator("#availability-form button[type=submit]").click();
  await expect(site.locator("#booking-message")).toContainText("occupate");
  await site.close();
  await page
    .getByRole("combobox", { name: /^Stato/ })
    .selectOption("confirmed");
  await page
    .locator(".cm-booking-row")
    .filter({ hasText: "Ospite di esempio" })
    .click();
  await page.getByRole("checkbox", { name: /Casa pronta/ }).click();
  await expect(
    page.getByRole("checkbox", { name: /Casa pronta/ }),
  ).toBeChecked();
  await page.getByRole("checkbox", { name: /Check-in registrato/ }).click();
  await expect(
    page.getByRole("checkbox", { name: /Check-in registrato/ }),
  ).toBeChecked();
  await audit("desktop-stay-operations", page);
  const agenda = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Salva in calendario", exact: true })
    .click();
  expect((await agenda).suggestedFilename()).toMatch(/\.ics$/);
  await page
    .getByRole("button", { name: "Registra incasso", exact: true })
    .click();
  await page.getByLabel("Importo (€)", { exact: true }).fill("100,50");
  await page
    .getByRole("button", { name: "Registra incasso", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(
    page.locator(".cm-booking-row").filter({ hasText: "Ospite di esempio" }),
  ).toContainText("299,50");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Esporta filtrati", exact: true })
    .click();
  const download = await downloadPromise;
  await download.saveAs(resolve(output, "filtered-export.csv"));
  expect(
    await readFile(resolve(output, "filtered-export.csv"), "utf8"),
  ).toContain("Registrato EUR");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Ogni soggiorno, sotto controllo." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Apri la demo interattiva" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: /Prenotazioni/ }).click();
  await page
    .locator(".cm-booking-row")
    .filter({ hasText: "Ospite di esempio" })
    .click();
  await expect(
    page.getByRole("checkbox", { name: /Casa pronta/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /Check-in registrato/ }),
  ).toBeChecked();
  await page.keyboard.press("Escape");
  await page.getByRole("combobox", { name: /^Stato/ }).selectOption("blocked");
  await expect(
    page.locator(".cm-booking-row").filter({ hasText: "Blocco prova UI" }),
  ).toBeVisible();
  await page.screenshot({
    path: resolve(output, "desktop-reservations.png"),
    fullPage: true,
  });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
    timezoneId: "Europe/Rome",
  });
  page = await mobile.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await enter(page);
  await page.screenshot({
    path: resolve(output, "mobile-overview.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await audit("mobile-overview", page);
  await page.getByRole("button", { name: "Calendario", exact: true }).click();
  await page.screenshot({
    path: resolve(output, "mobile-calendar.png"),
    fullPage: true,
  });
  await rangeSelection(page);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Blocca date", exact: true }).click();
  await page
    .getByLabel("Motivo del blocco", { exact: true })
    .fill("Uso personale di prova");
  await page.getByLabel("Blocca dal", { exact: true }).fill(start);
  await page.getByLabel("Riapri il", { exact: true }).fill(addDays(start, 2));
  await page
    .getByRole("button", { name: "Controlla le date", exact: true })
    .click();
  await page.screenshot({
    path: resolve(output, "mobile-block-review.png"),
    fullPage: true,
  });
  await audit("mobile-block-review", page);
  await page
    .getByRole("button", { name: "Conferma blocco", exact: true })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.evaluate(() => {
    const e = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(e, {
      prompt: async () => {
        window.__installRequested = true;
      },
      userChoice: Promise.resolve({ outcome: "accepted" }),
    });
    window.dispatchEvent(e);
  });
  await page.getByRole("button", { name: "Regole", exact: true }).click();
  await page
    .getByRole("button", { name: "Come installarla", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "CASA MIA, sul tuo telefono." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Installa su questo dispositivo" })
    .click();
  expect(await page.evaluate(() => window.__installRequested)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await writeFile(
    resolve(output, "accessibility.json"),
    JSON.stringify(audits, null, 2),
  );
  await writeFile(
    resolve(output, "browser-errors.json"),
    JSON.stringify(errors, null, 2),
  );
  expect(errors).toEqual([]);
  console.log(
    "UI workflows passed: New entrance, cross-month endpoints, stay operations and persistence, 45-night block, conflict rejection, website inventory, receipt, CSV and ICS, touch layout, install prompt simulation and Escape.",
  );
  console.log(
    "Accessibility findings:",
    audits.map((x) => ({ name: x.name, count: x.violations.length })),
  );
  if (audits.some((x) => x.violations.length)) process.exitCode = 2;
} catch (error) {
  if (page)
    await page
      .screenshot({ path: resolve(output, "failure.png"), fullPage: true })
      .catch(() => {});
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
