import { test, expect } from "@playwright/test";
test.use({ storageState: { cookies: [], origins: [] } });
test("first-run donation is optional, remembered, and never blocks a direct emergency route", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        async writeText(value) {
          window.__refugeDonationClipboard = value;
        },
      },
    });
  });
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
  await expect(page.locator(".donation-qr svg")).toHaveCount(1);
  await page.getByRole("button", { name: "USDT", exact: true }).click();
  await expect(page.locator(".donation-qr svg")).toHaveCount(1);
  await expect(page.locator(".donation-network")).toContainText(
    "EVM · MetaMask",
  );
  await expect(page.locator(".donation-address")).toHaveText(
    "0x8353B9727D7c6eAB8FC998aB58020030415FdC56",
  );
  await expect(page.locator(".donation-wallet")).toContainText(
    "TRON ou Solana",
  );
  await expect(page.locator(".donation-wallet select")).toHaveCount(0);
  const copy = page.getByRole("button", {
    name: "Copier l’adresse",
    exact: true,
  });
  await expect(copy).toBeEnabled();
  await copy.click();
  await expect(
    page.getByRole("button", { name: "Adresse copiée", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__refugeDonationClipboard)).toBe(
    "0x8353B9727D7c6eAB8FC998aB58020030415FdC56",
  );
});
