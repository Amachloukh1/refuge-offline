import test from "node:test";
import assert from "node:assert/strict";
import {
  mediaSection,
  chooseWikiArchive,
  wikiReaderLanguage,
  wikiReaderOrigin,
} from "../src/media-navigation.js";
test("Wikipedia uses the mini-PC address when accessed over the LAN", () => {
  assert.equal(wikiReaderOrigin("192.168.178.50"), "http://192.168.178.50:8108");
  assert.equal(wikiReaderOrigin("localhost"), "http://127.0.0.1:8108");
  assert.equal(wikiReaderOrigin("[::1]"), "http://127.0.0.1:8108");
});
test("embedded wiki reader receives only installed and supported control languages", () => {
  for (const lang of ["fr", "de", "en", "ar"])
    assert.equal(wikiReaderLanguage(lang), lang);
  for (const lang of ["ru", "zh", "es", "pt", "unknown"])
    assert.equal(wikiReaderLanguage(lang), "en");
});
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
