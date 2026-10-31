import { test, expect } from "@playwright/test";
test("fiches illustrées, vidéos audibles et GPS sans fix restent explicites hors Internet", async ({
  page,
}) => {
  let provideFix = false;
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
  await page.route("**/api/gps/refresh", (r) =>
    r.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify(
        provideFix
          ? {
              status: "fix",
              source: "test fixture",
              latitude: 51.0504,
              longitude: 13.7373,
              receivedAt: new Date().toISOString(),
            }
          : { status: "no_fix", source: "USB NMEA" },
      ),
    }),
  );
  await page.goto("/#library");
  await expect(page.locator(".guide-card-image")).toHaveCount(4);
  await page
    .locator('.guide-card[data-guide-id="energy-budget-offgrid"]')
    .getByRole("button", { name: "Lire la fiche", exact: true })
    .click();
  await expect(page.locator(".guide-reader-image")).toBeVisible();
  await expect(page.locator(".guide-steps li")).toHaveCount(9);
  await page.keyboard.press("Escape");
  await page.goto("/#videos");
  await expect(page.locator("video")).toHaveCount(5);
  await expect(
    page.getByText("Vidéo silencieuse · langue des signes", { exact: true }),
  ).toHaveCount(0);
  const video = page.locator("video").first();
  await video.evaluate((el) => {
    el.muted = true;
    el.volume = 0;
  });
  await page
    .getByRole("button", { name: "Activer le son", exact: true })
    .first()
    .click();
  await expect.poll(() => video.evaluate((el) => el.muted)).toBe(false);
  await expect
    .poll(() => video.evaluate((el) => el.currentTime))
    .toBeGreaterThan(0.1);
  await page
    .getByRole("button", { name: "Toutes les vidéos", exact: true })
    .click();
  await expect(page.locator("video")).toHaveCount(7);
  await expect(
    page.getByText("Vidéo silencieuse · langue des signes", { exact: true }),
  ).toHaveCount(2);
  await page.goto("/#maps");
  await page
    .getByRole("button", { name: "Lire le GPS USB", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Pas encore de position valide",
  );
  await expect(
    page.getByRole("heading", { name: "Préparer Europe et Afrique du Nord" }),
  ).toBeVisible();
  provideFix = true;
  await page
    .getByRole("button", { name: "Lire le GPS USB", exact: true })
    .click();
  await expect(page.locator(".maplibregl-marker")).toBeVisible();
  await page.getByLabel("Langue de l’interface").selectOption("de");
  await expect(page.locator(".maplibregl-marker")).toBeVisible();
});
