import test from "node:test";
import assert from "node:assert/strict";
import { mediaSection, chooseWikiArchive } from "../src/media-navigation.js";
test("legacy media URLs retain their category in the unified media library", () => {
  for (const section of ["videos", "films", "music", "sport"]) {
    assert.equal(mediaSection("#" + section), section);
    assert.equal(mediaSection("#media?view=" + section), section);
  }
  assert.equal(mediaSection("#media?view=unknown"), "videos");
  assert.equal(mediaSection("#media"), "videos");
  assert.equal(mediaSection("#films?view=music"), "films");
});
test("Wikipedia selects an installed language and makes unavailable-language fallback explicit", () => {
  const archives = [
    { filename: "ar.zim", language: "ar" },
    { filename: "fr.zim", language: "fr" },
  ];
  assert.equal(chooseWikiArchive(archives, "ar").filename, "ar.zim");
  assert.equal(chooseWikiArchive(archives, "en").filename, "fr.zim");
  assert.equal(chooseWikiArchive([archives[0]], "en").language, "ar");
  assert.equal(chooseWikiArchive([], "fr"), null);
});
