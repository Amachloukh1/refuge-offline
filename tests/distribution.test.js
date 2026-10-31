import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { distributable, distributionFiles } from "../scripts/prepare-share.mjs";
test("friend distribution excludes credentials and personal state at every depth", () => {
  for (const p of [
    ".env",
    "private/refuge-donnees.json",
    "data/local-studio.sqlite",
    "data/local-studio.sqlite-wal",
    "content/nested/.env",
    "runtime/own-ollama.log",
    "runtime/ollama.pid",
    "runtime/studio-source/.git/config",
    "models/id_ed25519",
    "../.env",
    "src/../.env",
    "C:/secrets",
    "src/file\n.env",
    "data/weather.json/extra",
    "runtime/radio/config.json",
  ])
    assert.equal(distributable(p), false, p);
  for (const p of [
    ".env.example",
    "src/App.jsx",
    "dist/index.html",
    "content/zim/wikipedia_ar.zim",
    "data/weather.json",
    "data/document-index.json",
    "models/blobs/sha256-123",
    "runtime/ollama/ollama.exe",
  ])
    assert.equal(distributable(p), true, p);
});
test("actual scan retains offline resources and indexes while excluding private files", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "refuge-distribute-"));
  try {
    for (const f of [
      ".env",
      ".env.example",
      "private/person.json",
      "data/local-studio.sqlite",
      "data/document-index.json",
      "content/videos/tutorial.mp4",
      "content/nested/.env",
    ]) {
      await mkdir(path.dirname(path.join(dir, f)), { recursive: true });
      await writeFile(path.join(dir, f), "sample");
    }
    const p = await distributionFiles(dir);
    assert.deepEqual(
      p.files.map((f) => f.path).sort(),
      [
        ".env.example",
        "content/videos/tutorial.mp4",
        "data/document-index.json",
      ].sort(),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
