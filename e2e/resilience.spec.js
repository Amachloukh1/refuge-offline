import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function offline(page) {
  await page.route("**/*", (r) =>
    ["localhost", "127.0.0.1"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
}

test("urgence, préparation honnête, contrôle des fichiers et pause IA sans Internet", async ({
  page,
}) => {
  await offline(page);
  await page.goto("/#readiness");
  await expect(page.locator(".readiness-dashboard")).toContainText("0 / 6");
  await page
    .getByRole("button", { name: "Urgence maintenant", exact: true })
    .click();
  await expect(page.locator(".emergency-scenario")).toHaveCount(8);
  await page.getByRole("button", { name: "Saignement", exact: true }).click();
  await expect(page.locator(".first-aid-brief")).toContainText(
    "pressez fermement",
  );
  await page.keyboard.press("Escape");
  await page.goto("/#system");
  await page
    .getByRole("button", { name: "Vérifier les fichiers", exact: true })
    .click();
  await expect(page.locator(".system-check [role=status]")).toContainText(
    "terminé",
    { timeout: 20000 },
  );
  await expect(page.locator(".check-failed")).toHaveCount(0);
  await page.goto("/#energy");
  await page.getByLabel("Mode éco", { exact: true }).check();
  await expect(page.locator(".app-shell")).toHaveClass(/eco-mode/);
  await page.goto("/#assistant");
  await expect(
    page.getByRole("button", { name: "Envoyer", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveClass(/eco-mode/);
  await page
    .getByRole("button", { name: "Réactiver l’IA", exact: true })
    .first()
    .click();
  await expect(page.locator(".studio-embedded")).toBeVisible();
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await page.goto("/#emergency");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator(".emergency-scenario")).toHaveCount(8);
});

test("rotation, consommation, repas, lieux et restauration prévisualisée", async ({
  page,
}) => {
  await offline(page);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#inventory");
  await page
    .getByRole("button", { name: "Ajouter un produit", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Produit", { exact: true })
    .fill("Pois prêts à manger");
  await dialog.getByLabel("Quantité", { exact: true }).fill("5");
  await dialog.locator('select[name="category"]').selectOption("food");
  await dialog.getByLabel("Emplacement", { exact: true }).fill("Placard A");
  await dialog.locator('select[name="dateType"]').selectOption("best-before");
  await dialog.locator('input[type="date"]').fill("2030-12-01");
  await dialog
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Enregistrer une consommation Pois prêts à manger",
      exact: true,
    })
    .click();
  await dialog.getByLabel("Quantité consommée", { exact: true }).fill("2");
  await dialog
    .getByRole("button", { name: "Enregistrer", exact: true })
    .click();
  await expect(
    page.locator("tbody tr").filter({ hasText: "Pois prêts à manger" }),
  ).toContainText("3");
  await page
    .getByRole("button", { name: "Repas sans cuisson", exact: true })
    .click();
  await page
    .getByLabel("Nom du repas", { exact: true })
    .fill("Repas de réserve");
  const foodId = await page
    .locator(".meal-ingredients option")
    .filter({ hasText: /Pois prêts/ })
    .getAttribute("value");
  await page.locator(".meal-ingredients select").selectOption(foodId);
  await page.locator(".meal-ingredients input").fill("1");
  await page
    .getByRole("button", { name: "Enregistrer le modèle", exact: true })
    .click();
  await expect(page.locator(".meal-planner")).toContainText("Repas de réserve");
  await page.goto("/#maps");
  const places = page.getByTestId("personal-places");
  await places.getByLabel("Nom", { exact: true }).fill("Rendez-vous de test");
  await places.getByLabel("Latitude", { exact: true }).fill("51.05");
  await places.getByLabel("Longitude", { exact: true }).fill("13.73");
  await places
    .getByLabel("Notes / itinéraire papier", { exact: true })
    .fill("Exemple fictif pour le test");
  await places
    .getByRole("button", { name: "Ajouter le lieu", exact: true })
    .click();
  await expect(page.locator(".maplibregl-marker")).toHaveCount(1);
  await page.goto("/#settings");
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exporter mes données", exact: true })
    .click();
  const file = await downloaded;
  const state = JSON.parse(await readFile(await file.path(), "utf8"));
  expect(state.places[0].name).toBe("Rendez-vous de test");
  expect(state.meals[0].name).toBe("Repas de réserve");
  expect(
    state.stock.find((x) => x.name === "Pois prêts à manger").quantity,
  ).toBe(3);
  state.people = 3;
  await page
    .getByTestId("data-restore")
    .locator('input[type="file"]')
    .setInputFiles({
      name: "refuge-test.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(state)),
    });
  await expect(page.locator(".restore-preview")).toContainText("3 personnes");
  const saved = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Sauvegarder l’état actuel puis restaurer",
      exact: true,
    })
    .click();
  await saved;
  await page.reload();
  await page.goto("/#inventory");
  await expect(
    page.getByLabel("Adultes de référence", { exact: true }),
  ).toHaveValue("3");
  await expect(page.locator("tbody")).toContainText("Placard A");
  expect(errors).toEqual([]);
});

test("une migration refusée conserve les données originales sans les écraser", async ({
  page,
}) => {
  const raw = JSON.stringify({
    version: 1,
    lang: "fr",
    people: 2,
    days: 10,
    stock: "invalid",
    family: { meeting: "À préserver" },
  });
  await page.addInitScript(
    (value) => localStorage.setItem("refuge.v1", value),
    raw,
  );
  await page.goto("/#settings");
  await expect(
    page.getByText(/Les données enregistrées n’ont pas pu être chargées/),
  ).toBeVisible();
  await page.getByLabel("Langue de l’interface").selectOption("de");
  expect(await page.evaluate(() => localStorage.getItem("refuge.v1"))).toBe(
    raw,
  );
});
