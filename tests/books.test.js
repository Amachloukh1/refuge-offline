import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  parseCsv,
  classifyBook,
  contributorsOldEnough,
} from "../server/book-catalog.js";
import { createBooks } from "../server/books.js";
test("book CSV preserves quoted commas, newlines and escaped quotes", () => {
  assert.deepEqual(parseCsv('id,title\r\n1,"A, B\nC ""D"""\r\n'), [
    ["id", "title"],
    ["1", 'A, B\nC "D"'],
  ]);
  assert.ok(
    classifyBook("Detective and mystery stories; Fiction").includes("crime"),
  );
  assert.equal(
    contributorsOldEnough(
      "<pgterms:agent><pgterms:deathdate>1898</pgterms:deathdate></pgterms:agent>",
      2026,
    ),
    true,
  );
  assert.equal(
    contributorsOldEnough(
      "<pgterms:agent><pgterms:name>Unknown translator</pgterms:name></pgterms:agent>",
      2026,
    ),
    false,
  );
  assert.equal(
    contributorsOldEnough(
      "<pgterms:agent><pgterms:deathdate>1960</pgterms:deathdate></pgterms:agent>",
      2026,
    ),
    false,
  );
});
test("book library confines IDs, downloads atomically, filters and cancels batches", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "refuge-books-"));
  await mkdir(path.join(root, "content"));
  const entries = [1, 2, 3].map((n) => ({
    id: `pg-${n}`,
    number: n,
    title: `Title ${n}`,
    authors: "Author",
    language: n === 3 ? "de" : "en",
    genres: ["fiction"],
    source: "gutenberg",
    format: "txt",
    reviewed: true,
  }));
  await writeFile(
    path.join(root, "content/books.catalog.json"),
    JSON.stringify(entries),
  );
  const books = createBooks(root, {
    delayMs: 5,
    fetchImpl: async (url) =>
      new Response(
        url.endsWith(".rdf")
          ? "Public domain in the USA <pgterms:agent><pgterms:deathdate>1898</pgterms:deathdate></pgterms:agent>"
          : "*** START OF THE PROJECT GUTENBERG EBOOK ***\n" +
              "Complete book. ".repeat(100) +
              "\n*** END OF THE PROJECT GUTENBERG EBOOK ***",
      ),
  });
  try {
    assert.equal((await books.list({ language: "de" })).total, 1);
    await writeFile(
      path.join(root, "content/books.catalog.json"),
      JSON.stringify([
        ...entries,
        { ...entries[0], id: "pg-4", title: "Newly imported book" },
      ]),
    );
    assert.equal((await books.list({ q: "Newly imported" })).total, 1);
    await assert.rejects(books.read("../.env"));
    await assert.rejects(books.start(["https://evil.example"]));
    await books.start(["pg-1"]);
    while (books.snapshot().running)
      await new Promise((r) => setTimeout(r, 10));
    assert.equal((await books.list({ installed: "true" })).total, 1);
    assert.equal((await books.list({ installed: "true" })).languages.en, 1);
    assert.equal(books.snapshot().completed, 1);
    assert.match(await books.read("pg-1"), /Complete book/);
    const bad = createBooks(root, {
      delayMs: 5,
      fetchImpl: async (url) =>
        new Response(
          url.endsWith(".rdf")
            ? "Public domain in the USA <pgterms:agent><pgterms:deathdate>1898</pgterms:deathdate></pgterms:agent>"
            : "<html>error</html>",
          { status: 200 },
        ),
    });
    await bad.start(["pg-2"]);
    while (bad.snapshot().running) await new Promise((r) => setTimeout(r, 10));
    assert.equal((await bad.list({ installed: "true" })).total, 1);
    assert.equal(bad.snapshot().errors[0].code, "invalid_book");
    const pdfEntry = {
      id: "hw-12345678",
      title: "Reviewed PDF",
      authors: "Author",
      language: "ar",
      genres: ["fiction"],
      source: "hindawi",
      format: "pdf",
      reviewed: true,
      license: "CC BY 4.0",
      sha256: "00".repeat(32),
    };
    await writeFile(
      path.join(root, "content/books.catalog.json"),
      JSON.stringify([...entries, pdfEntry]),
    );
    const changed = createBooks(root, {
      delayMs: 1,
      fetchImpl: async () =>
        new Response("%PDF-1.7 different publisher edition"),
    });
    await changed.start([pdfEntry.id]);
    while (changed.snapshot().running)
      await new Promise((r) => setTimeout(r, 5));
    assert.equal(changed.snapshot().completed, 0);
    assert.equal(changed.snapshot().errors[0].code, "source_changed");
    let notifyStarted;
    const started = new Promise((resolve) => {
      notifyStarted = resolve;
    });
    const stalled = createBooks(root, {
      delayMs: 5,
      fetchImpl: (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          notifyStarted();
          signal.addEventListener("abort", () => reject(Error("aborted")));
        }),
    });
    await stalled.start(["pg-2", "pg-3"]);
    await started;
    stalled.cancel();
    while (stalled.snapshot().running)
      await new Promise((r) => setTimeout(r, 10));
    assert.equal(stalled.snapshot().completed, 0);
    const { createApp } = await import("../server/app.js");
    const { aiConfig } = await import("../server/ai.js");
    const server = createApp({
      root,
      config: aiConfig({ REFUGE_AI_BASE_URL: "http://127.0.0.1:1/v1" }),
    });
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
      const listed = await fetch(base + "/api/books?installed=true");
      assert.equal(listed.status, 200);
      assert.equal((await listed.json()).total, 1);
      const txt = await fetch(base + "/books/pg-1.txt", {
        headers: { Range: "bytes=0-9" },
      });
      assert.equal(txt.status, 206);
      assert.equal((await txt.text()).length, 10);
      assert.equal((await fetch(base + "/books/pg-1.pdf")).status, 404);
      assert.equal((await fetch(base + "/books/pg-1.json")).status, 404);
      assert.equal(
        (
          await fetch(base + "/api/books/download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: Array(51).fill("pg-1") }),
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await fetch(base + "/api/books/download", {
            method: "POST",
            headers: {
              Origin: "https://evil.example",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: ["pg-1"] }),
          })
        ).status,
        403,
      );
    } finally {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
