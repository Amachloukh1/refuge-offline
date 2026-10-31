import test from "node:test";
import assert from "node:assert/strict";
import { translations } from "../src/i18n.js";
import { guideData } from "../src/data.js";
test("toutes les langues, dont arabe, couvrent les mêmes libellés et fiches locales", () => {
  const keys = Object.keys(translations.fr).sort();
  for (const [lang, strings] of Object.entries(translations)) {
    assert.deepEqual(Object.keys(strings).sort(), keys, lang);
    assert.ok(
      Object.values(strings).every(
        (value) => typeof value === "string" && value.trim(),
      ),
      lang,
    );
    for (const guide of guideData) {
      assert.ok(guide.title[lang]);
      assert.ok(guide.intro[lang]);
      assert.ok(guide.body[lang].length >= 3);
    }
  }
});
