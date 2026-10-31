import test from "node:test";
import assert from "node:assert/strict";
import { hazardReferences } from "../server/references.js";
import { readFile } from "node:fs/promises";
test("onze fiches détaillées existent dans les quatre langues avec sources datées", async () => {
  const french = JSON.parse(
    await readFile(new URL("../content/hazards.fr.json", import.meta.url)),
  );
  const translations = JSON.parse(
    await readFile(
      new URL("../content/hazards.translations.json", import.meta.url),
    ),
  );
  assert.equal(french.length, 11);
  for (const h of french) {
    assert.equal(h.sources.length, 2);
    assert.ok(h.sources.every((s) => s.url.startsWith("https://")));
    for (const lang of ["fr", "de", "en", "ar"]) {
      const d = lang === "fr" ? h.fr : translations[lang][h.id];
      assert.ok(d.title);
      assert.equal(d.before.length, 3);
      assert.ok(d.during.length >= 4);
      assert.equal(d.after.length, 3);
      assert.equal(d.avoid.length, 3);
      assert.equal(d.kit.length, 4);
    }
  }
});
test("l’assistant reçoit les références pertinentes de chaleur et tsunami en arabe", () => {
  assert.ok(
    hazardReferences(
      "Il fait très chaud, que faire pendant la canicule ?",
      "fr",
    ).includes("[heat]"),
  );
  assert.ok(hazardReferences("خطر تسونامي", "ar").includes("[tsunami]"));
  assert.equal(hazardReferences("Bonjour", "fr"), "");
});
