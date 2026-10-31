import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
const videos = JSON.parse(
  readFileSync(
    new URL("../content/videos.catalog.json", import.meta.url),
    "utf8",
  ),
);
test("catalogue actualisable, recherche et sujets prévus séparés des MP4", async ({
  page,
}) => {
  let refreshed = false;
  await page.route("**/api/resources", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ videos: refreshed ? videos : videos.slice(0, 3) }),
    }),
  );
  await page.goto("/#videos");
  await expect(page.getByTestId("video-management")).toContainText(
    "3 installées",
  );
  refreshed = true;
  await page
    .getByRole("button", { name: "Actualiser le catalogue", exact: true })
    .click();
  await expect(page.getByTestId("video-management")).toContainText(
    "10 installées · 8 avec son",
  );
  await page.setViewportSize({ width: 1440, height: 1100 });
  await mkdir(path.resolve("output"), { recursive: true });
  await page.screenshot({
    path: path.resolve("output/refuge-videos-gestion.png"),
    fullPage: false,
  });
  await page
    .getByLabel("Chercher une vidéo", { exact: true })
    .fill("hemorragie");
  await expect(page.locator("video")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Hémorragie/ })).toBeVisible();
  await page
    .getByRole("button", { name: "Sujets à préparer", exact: true })
    .click();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(
    page.getByText(/Ces sujets ne sont pas encore téléchargés/),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Cuisine simple", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Vidéos installées", exact: true })
    .click();
  await expect(page.locator("video")).toHaveCount(1);
});
