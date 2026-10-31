import { test, expect } from "@playwright/test";

test("achats consultables hors Internet, état conservé et calcul énergétique", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
  await page.goto("/#prepare?view=equipment");
  const equipment = page.getByTestId("equipment");
  await expect(equipment).toBeVisible();
  const solar = equipment.locator('[data-equipment-id="solar"]');
  await expect(solar).toContainText("408,00");
  await expect(
    solar.getByRole("link", { name: "Voir sur Amazon.de" }),
  ).toHaveAttribute("href", "https://www.amazon.de/dp/B0BQVYT4WJ");
  await expect(equipment.locator("output")).toHaveText("4.5 h");
  await equipment.getByRole("spinbutton").fill("80");
  await expect(equipment.locator("output")).toHaveText("2.2 h");
  const total = equipment.locator(".equipment-total");
  const before = await total.innerText();
  await solar.getByRole("checkbox").check();
  await expect(total).not.toHaveText(before);
  await page.reload();
  await expect(solar.getByRole("checkbox")).toBeChecked();
  await equipment
    .getByRole("button", {
      name: "Priorité 1 · besoins essentiels",
      exact: true,
    })
    .click();
  await expect(solar).toHaveCount(0);
  await expect(equipment.locator('[data-equipment-id="radio"]')).toBeVisible();
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByTestId("equipment")).toContainText("معدات");
  await expect(page.locator('[data-equipment-id="solar"] input')).toBeChecked();
  expect(errors).toEqual([]);
});
