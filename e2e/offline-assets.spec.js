import { test, expect } from "@playwright/test";
import path from "node:path";
import os from "node:os";
test("carte Saxe, vidéos locales, météo sauvegardée et plan achats hors réseau", async ({
  page,
}) => {
  const failed = [];
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().includes("/assets/")) failed.push(r.url());
  });
  await page.route("**/*", (route) => {
    const u = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(u.hostname)
      ? route.continue()
      : route.abort();
  });
  await page.goto("/#maps");
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect
    .poll(() => page.locator(".maplibregl-map").getAttribute("class"))
    .toBeTruthy();
  await page.waitForTimeout(5000);
  await page.screenshot({
    path: path.join(os.tmpdir(), "refuge-qa", "sachsen-map.png"),
    fullPage: true,
  });
  await page.goto("/#videos");
  await expect(page.locator("video")).toHaveCount(3);
  const v = page.locator("video").first();
  await v.evaluate((el) => (el.muted = true));
  await v.evaluate((el) => el.play());
  await expect
    .poll(() => v.evaluate((el) => el.currentTime))
    .toBeGreaterThan(0.2);
  await page.goto("/#weather");
  await expect(page.locator(".weather-current")).toContainText("°C");
  await page.goto("/#inventory?view=plan");
  await expect(page.locator(".purchase-card")).toHaveCount(13);
  await page.locator(".purchase-check input").first().check();
  await page.reload();
  await expect(page.locator(".purchase-check input").first()).toBeChecked();
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});
test("Kiwix ouvre réellement un article du ZIM français hors réseau", async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.route("**/*", (r) =>
    new URL(r.request().url()).hostname === "127.0.0.1"
      ? r.continue()
      : r.abort(),
  );
  await page.goto("http://127.0.0.1:8108/");
  await page
    .locator("#archiveFiles")
    .setInputFiles(
      path.resolve("content/zim/wikipedia_fr_all_mini_2026-05.zim"),
    );
  await page.getByRole("button", { name: "Trust Source", exact: true }).click();
  await expect(page.locator("#prefix")).toBeEnabled({ timeout: 60000 });
  await page.locator("#prefix").fill("Berlin");
  await page.locator("#searchArticles").click();
  await page.waitForTimeout(8000);
  await page.screenshot({
    path: path.join(os.tmpdir(), "refuge-qa", "kiwix-search.png"),
    fullPage: true,
  });
  await expect(page.locator("#articleList")).toContainText("Berlin");
  await page
    .locator("#articleList a")
    .filter({ hasText: /^Berlin$/ })
    .first()
    .click();
  await expect(
    page.frameLocator("#articleContent").locator("body"),
  ).toContainText("Berlin", { timeout: 60000 });
});
