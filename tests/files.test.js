import test from "node:test";
import assert from "node:assert/strict";
import { byteRange } from "../server/files.js";
test("vidéos et cartes : plages HTTP bornées sans charger le fichier complet", () => {
  assert.deepEqual(byteRange("bytes=0-127", 1000), { start: 0, end: 127 });
  assert.deepEqual(byteRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(byteRange("bytes=-100", 1000), { start: 900, end: 999 });
  assert.equal(byteRange("bytes=1000-", 1000), false);
  assert.equal(byteRange("bytes=0-5,8-9", 1000), false);
  assert.equal(byteRange("bytes=50-10", 1000), false);
});
