import { test, expect } from "@playwright/test";
import path from "node:path";
import os from "node:os";
import { mkdir } from "node:fs/promises";
const screenshotDir = path.join(os.tmpdir(), "refuge-qa");
test("parcours sans Internet : recherche, stock, persistance, documents et arabe", async ({
  page,
}) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"code":"unavailable"}',
    }),
  );
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const external = [];
  await page.route("**/*", (route) => {
    const u = new URL(route.request().url());
    if (u.pathname.endsWith("/api/chat"))
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"code":"unavailable"}',
      });
    if (["127.0.0.1", "localhost"].includes(u.hostname)) route.continue();
    else {
      external.push(u.href);
      route.abort();
    }
  });
  await page.goto("/");
  await expect(page).toHaveTitle(/REFUGE/);
  await expect(
    page.getByRole("heading", { name: "Prêt pour l’essentiel." }),
  ).toBeVisible();
  await mkdir(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-desktop.png"),
    fullPage: true,
  });
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Mes réserves", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Modifier Eau potable", exact: true })
    .click();
  await page.getByLabel("Quantité", { exact: true }).fill("40");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.locator("tbody")).toContainText("40 L");
  await page
    .getByRole("button", { name: "Ajouter un produit", exact: true })
    .click();
  await page.getByLabel("Produit", { exact: true }).fill("Savon de test");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await page.reload();
  await expect(page.locator("tbody")).toContainText("Savon de test");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Bibliothèque", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Rechercher dans les fiches", exact: true })
    .fill("coupure de courant");
  await expect(page.locator(".guide-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Ajouter aux favoris", exact: true })
    .click();
  await page.getByRole("button", { name: /Favoris/ }).click();
  await expect(page.locator(".guide-card")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Lire la fiche", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const documents = await page.request.get("/api/documents");
  const docs = await documents.json();
  expect(docs).toHaveLength(7);
  const pdf = await page.request.get(
    `/documents/${docs.find((d) => d.language === "ar").filename}`,
  );
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Assistant IA", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Comment préparer une coupure de courant ?",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(
    page.getByText("Le moteur local est indisponible ou non configuré.", {
      exact: false,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Combien d’eau me manque-t-il ?",
      exact: true,
    })
    .click();
  await expect(page.locator(".chat-calculation")).toContainText("40 / 80 L");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Accueil", exact: true })
    .click();
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("heading", { name: "مستعد لما هو أساسي." }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-arabic.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-mobile-arabic.png"),
    animations: "disabled",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "افتح القائمة", exact: true }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "المكتبة", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "المكتبة", exact: true }),
  ).toBeVisible();
  await page.getByLabel("لغة الواجهة").selectOption("fr");
  await page
    .getByRole("button", { name: "Ouvrir le menu", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Accueil", exact: true })
    .click();
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-mobile.png"),
    animations: "disabled",
    fullPage: true,
  });
  // Host antivirus injects its own script into Chrome. It is blocked like all
  // other external traffic and is not an application dependency.
  expect(errors).toEqual([]);
  expect(
    external.filter(
      (url) => new URL(url).hostname !== "gc.kis.v2.scr.kaspersky-labs.com",
    ),
  ).toEqual([]);
});
test("catastrophes détaillées, raccourcis et recherche globale", async ({
  page,
}) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
    route.abort(),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Voir ma liste", exact: true })
    .click();
  await expect(page.locator(".shopping-full")).toBeVisible();
  await page.reload();
  await expect(page.locator(".shopping-full")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Accueil", exact: true })
    .click();
  await page.getByRole("button", { name: /Mon plan familial/ }).click();
  await expect(
    page.getByRole("textbox", { name: "Point de rendez-vous", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Accueil", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "De quoi avez-vous besoin ?", exact: true })
    .fill("tsunami");
  await page.getByRole("button", { name: "Rechercher", exact: true }).click();
  await page
    .locator(".hazards-search-results")
    .getByRole("button", { name: "Tsunami", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Tsunami", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Avant : se préparer", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Après : vivre et se rétablir",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Aller observer la mer.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-tsunami.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Toutes les catastrophes", exact: true })
    .click();
  await expect(page.locator(".hazard-card")).toHaveCount(11);
  await page.getByRole("button", { name: /Canicule/ }).click();
  await expect(page.locator(".hazard-stage.during")).toContainText("confusion");
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.locator(".hazard-detail-heading h2")).not.toHaveText(
    "Canicule",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".sidebar")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: path.join(screenshotDir, "refuge-heat-arabic.png"),
    fullPage: true,
    animations: "disabled",
  });
});
