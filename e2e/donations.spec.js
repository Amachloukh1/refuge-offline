import { test, expect } from "@playwright/test";
test.use({ storageState: { cookies: [], origins: [] } });
test("first-run donation is optional, remembered, and never blocks a direct emergency route", async ({
  page,
}) => {
  await page.goto("/#emergency");
  await expect(page.locator(".donation-dialog")).toHaveCount(0);
  await page.goto("/#home");
  await expect(
    page.getByRole("button", {
      name: "0 — Continuer gratuitement",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "0 — Continuer gratuitement", exact: true })
    .click();
  await expect(page.locator(".donation-dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".donation-dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Faire un don", exact: true }).click();
  await expect(page.locator(".donation-address")).toHaveText(
    "bc1qvze9ne7lnwzhtpmwtg6dfh2pv3qr752j3nvtlk",
  );
  await expect(page.locator(".donation-qr svg")).toHaveCount(1);
  await page.getByRole("button", { name: "SOL", exact: true }).click();
  await expect(page.locator(".donation-address")).toHaveText(
    "7Pv5wAwoh11Bz34jbBNZ63neXexAuLmXY5Lz842RbSyF",
  );
  await page.getByRole("button", { name: "USDT", exact: true }).click();
  await expect(page.locator(".donation-qr")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Copier l’adresse", exact: true }),
  ).toBeDisabled();
});
