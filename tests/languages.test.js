import test from "node:test";
import assert from "node:assert/strict";
import { translations } from "../src/i18n.js";
import { guideData } from "../src/data.js";
import { interfaceLanguages, documentLanguages } from "../src/locale-policy.js";
test("les huit langues de l’interface couvrent les mêmes libellés", () => {
  const keys = Object.keys(translations.fr).sort();
  assert.deepEqual(
    Object.keys(translations).sort(),
    [...interfaceLanguages].sort(),
  );
  for (const [lang, strings] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(strings).sort(), keys, lang);
    assert.ok(
      Object.values(strings).every(
        (value) => typeof value === "string" && value.trim(),
      ),
      lang,
    );
  }
});
test("le corpus documentaire reste disponible dans ses quatre langues réelles", () => {
  for (const lang of documentLanguages) {
    for (const guide of guideData) {
      assert.ok(guide.title[lang], `${guide.id}: ${lang}`);
      assert.ok(guide.intro[lang], `${guide.id}: ${lang}`);
      assert.ok(guide.body[lang].length >= 3, `${guide.id}: ${lang}`);
    }
  }
});
