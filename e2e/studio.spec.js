import { test, expect } from "@playwright/test";
import path from "node:path";
import os from "node:os";
test("pièce jointe locale et choix local/distant verrouillé pendant un envoi", async ({
  page,
}) => {
  const cid = "a".repeat(32),
    jid = "b".repeat(32);
  let finished = false,
    posted;
  const task = () => ({
    id: jid,
    status: finished ? "completed" : "running",
    kind: "chat",
    model: "local-chat-fast",
    conversation_id: cid,
    partial: finished ? "" : "Texte réel simulé pour le test du contrat",
    position: null,
    error: null,
    result: finished ? { content: "Réponse de test" } : null,
  });
  await page.route("**/local-studio/**", async (route) => {
    const r = route.request(),
      p = new URL(r.url()).pathname;
    let data;
    if (p.endsWith("/api/chat")) {
      posted = r.postDataJSON();
      data = task();
    } else if (p.includes("/v1/jobs/")) data = task();
    else if (p.endsWith("/conversations") && r.method() === "POST") {
      await new Promise((resolve) => setTimeout(resolve, 250));
      data = { id: cid };
    } else if (p.endsWith("/conversations"))
      data = [{ id: cid, title: "Essai contrat" }];
    else
      data = {
        id: cid,
        title: "Essai contrat",
        active_job: finished ? null : jid,
        messages: [
          { role: "user", content: "Essai contrat" },
          ...(finished
            ? [{ role: "assistant", content: "Réponse de test", remote: false }]
            : []),
        ],
      };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  await page.goto("/#assistant");
  await page
    .getByRole("button", { name: "Nouvelle conversation", exact: true })
    .click();
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "preparation.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Liste locale : eau, lampe, documents."),
    });
  await expect(
    page.getByRole("textbox", { name: "Posez votre question…", exact: true }),
  ).toHaveValue(/Liste locale/);
  await page
    .getByRole("textbox", { name: "Posez votre question…", exact: true })
    .fill("Essai contrat");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(
    page.locator(".studio-connection .ai-mode-switch button").nth(1),
  ).toBeDisabled();
  await expect.poll(() => posted?.mode).toBe("local");
  finished = true;
  await expect(page.locator(".job-status")).toContainText("Terminé");
  await expect(
    page.locator(".studio-connection .ai-mode-switch button").nth(1),
  ).toBeEnabled();
});
test("véritable Assistant Local Studio intégré : génération CPU, historique, corbeille et arabe hors réseau", async ({
  page,
}) => {
  test.setTimeout(210000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) =>
    ["127.0.0.1", "localhost"].includes(new URL(r.request().url()).hostname)
      ? r.continue()
      : r.abort(),
  );
  await page.goto("/#assistant");
  await expect(
    page.getByRole("heading", { name: "Local Studio", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".studio-embedded iframe")).toHaveCount(0);
  await expect(page.locator('a[href^="https://2ki.space"]')).toHaveCount(0);
  await page
    .getByRole("button", { name: "Nouvelle conversation", exact: true })
    .click();
  const text =
    "Test REFUGE intégré : 4 adultes, 10 jours, 24 litres disponibles. Combien de litres manquent ? Réponds en deux phrases.";
  await page
    .getByRole("textbox", { name: "Posez votre question…", exact: true })
    .fill(text);
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(page.locator(".job-status")).toContainText("Terminé", {
    timeout: 180000,
  });
  await expect(
    page.locator(".message.assistant .message-content"),
  ).toContainText("56");
  await expect(page.locator(".studio-references a").first()).toBeVisible();
  await page.screenshot({
    path: path.join(os.tmpdir(), "refuge-qa", "local-studio-integrated.png"),
    fullPage: true,
  });
  await page.reload();
  await page
    .locator(".thread-item")
    .filter({ hasText: "Test REFUGE intégré" })
    .first()
    .click();
  await expect(
    page.locator(".message.assistant .message-content"),
  ).toContainText("56");
  const deletion = page
    .getByRole("button", { name: /^Supprimer Test REFUGE intégré/ })
    .first();
  await deletion.click();
  await page
    .getByRole("button", { name: "Ouvrir la corbeille", exact: true })
    .click();
  await page
    .getByRole("button", { name: /^Restaurer Test REFUGE intégré/ })
    .first()
    .click();
  await page.getByLabel("Langue de l’interface").selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(
    page.getByRole("button", { name: "محادثة جديدة", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
