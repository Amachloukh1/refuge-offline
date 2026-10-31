import { test, expect } from "@playwright/test";
test("Wikipédia française intégrée ouvre son ZIM local automatiquement par petites plages", async ({
  page,
}) => {
  test.setTimeout(120000);
  let ranges = 0;
  let fullArchive = false;
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) => {
    const u = new URL(r.request().url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname)) return r.abort();
    if (/\/archives\/.*\.zim$/.test(u.pathname)) {
      if (r.request().headers().range) ranges++;
      else fullArchive = true;
    }
    return r.continue();
  });
  await page.goto("/#wiki");
  await expect(page.getByLabel("Langue des articles Wikipédia")).toHaveValue(
    "fr",
  );
  const frame = page.frameLocator("iframe.wiki-reader-frame");
  await expect(frame.locator("html")).toHaveAttribute(
    "data-refuge-archive-ready",
    "fr",
    { timeout: 60000 },
  );
  await expect(
    frame.frameLocator("#articleContent").locator("body"),
  ).toContainText(/Wikipédia|Wikipedia/, { timeout: 20000 });
  await frame.locator("#prefix").fill("Berlin");
  await frame.locator("#searchArticles").click();
  await expect(frame.locator("#articleList")).toContainText("Berlin", {
    timeout: 60000,
  });
  await frame
    .locator("#articleList a")
    .filter({ hasText: /^Berlin$/ })
    .first()
    .click();
  await expect(
    frame.frameLocator("#articleContent").locator("body"),
  ).toContainText("Berlin", { timeout: 60000 });
  expect(ranges).toBeGreaterThan(0);
  expect(fullArchive).toBe(false);
  expect(errors).toEqual([]);
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.getByLabel("لغة مقالات ويكيبيديا")).toHaveValue("ar");
  await expect(page.locator("iframe.wiki-reader-frame")).toHaveAttribute(
    "src",
    /refugeArchive=ar/,
  );
  const arabic = page.frameLocator("iframe.wiki-reader-frame");
  await expect(arabic.locator("html")).toHaveAttribute(
    "data-refuge-archive-ready",
    "ar",
    { timeout: 60000 },
  );
  await expect(arabic.locator("#btnHome")).toContainText("الرئيسية");
  await arabic.locator("#prefix").fill("برلين");
  await arabic.locator("#searchArticles").click();
  await expect(arabic.locator("#articleList")).toContainText("برلين", {
    timeout: 30000,
  });
});
