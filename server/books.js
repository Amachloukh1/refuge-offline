import path from "node:path";
import {
  readFile,
  writeFile,
  mkdir,
  rename,
  readdir,
  stat,
  realpath,
  unlink,
} from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import { setTimeout as pause } from "node:timers/promises";
import { contributorsOldEnough, validBookId } from "./book-catalog.js";
const normalize = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
export function createBooks(root, { fetchImpl = fetch, delayMs = 2100 } = {}) {
  const dir = path.join(root, "content/books");
  let catalogue, catalogueVersion;
  let job = {
      running: false,
      total: 0,
      completed: 0,
      failed: 0,
      cancelled: false,
      current: null,
      bytes: 0,
      errors: [],
    },
    controller;
  async function catalog() {
    let filename = path.join(root, "content/books.catalog.json"),
      info;
    try {
      info = await stat(filename);
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      filename = path.join(root, "content/books.sources.json");
      info = await stat(filename);
    }
    const version = `${filename}:${info.mtimeMs}:${info.size}`;
    if (!catalogue || catalogueVersion !== version) {
      catalogueVersion = version;
      catalogue = (async () => {
        const entries = JSON.parse(await readFile(filename, "utf8"));
        if (!Array.isArray(entries) || entries.length > 120000)
          throw Error("invalid_catalog");
        return entries.filter(
          (b) =>
            validBookId(b.id) &&
            ["de", "fr", "en", "ar"].includes(b.language) &&
            ["txt", "pdf"].includes(b.format),
        );
      })().catch((e) => {
        catalogue = null;
        throw e;
      });
    }
    return catalogue;
  }
  async function directory() {
    await mkdir(dir, { recursive: true });
    const [base, real] = await Promise.all([realpath(root), realpath(dir)]);
    if (!real.startsWith(base + path.sep)) throw Error("invalid_directory");
    return real;
  }
  async function installed() {
    const found = new Map();
    let names;
    try {
      names = await readdir(dir);
    } catch (e) {
      if (e.code === "ENOENT") return found;
      throw e;
    }
    const entries = new Map((await catalog()).map((b) => [b.id, b]));
    for (const name of names) {
      const id = name.replace(/\.json$/, "");
      if (!name.endsWith(".json") || !entries.has(id)) continue;
      try {
        const receipt = JSON.parse(
          await readFile(path.join(dir, name), "utf8"),
        );
        const book = entries.get(id),
          file = path.join(dir, `${id}.${book.format}`);
        const real = await realpath(file),
          base = await realpath(dir);
        if (!real.startsWith(base + path.sep)) continue;
        const info = await stat(real);
        if (
          info.isFile() &&
          receipt.bytes === info.size &&
          /^[a-f0-9]{64}$/.test(receipt.sha256) &&
          (book.source !== "hindawi" || receipt.sha256 === book.sha256)
        )
          found.set(id, receipt);
      } catch {}
    }
    return found;
  }
  async function list(params = {}) {
    const all = await catalog(),
      saved = await installed();
    const q = normalize(String(params.q || "").slice(0, 180));
    const matches = all.filter(
      (b) =>
        (!params.language ||
          params.language === "all" ||
          b.language === params.language) &&
        (!params.genre ||
          params.genre === "all" ||
          b.genres.includes(params.genre)) &&
        (!q || normalize(`${b.title} ${b.authors}`).includes(q)) &&
        (params.installed !== "true" || saved.has(b.id)),
    );
    const limit = Math.max(
        1,
        Math.min(48, Number.parseInt(params.limit) || 24),
      ),
      offset = Math.max(0, Number.parseInt(params.offset) || 0);
    const languageBooks =
      params.installed === "true" ? all.filter((b) => saved.has(b.id)) : all;
    return {
      total: matches.length,
      catalogTotal: all.length,
      installedTotal: saved.size,
      offset,
      limit,
      items: matches.slice(offset, offset + limit).map((b) => ({
        ...b,
        installed: saved.has(b.id),
        bytes: saved.get(b.id)?.bytes || null,
      })),
      languages: Object.fromEntries(
        ["de", "fr", "en", "ar"].map((l) => [
          l,
          languageBooks.filter((b) => b.language === l).length,
        ]),
      ),
    };
  }
  async function safeFetch(url, signal, max) {
    const allowed = ["www.gutenberg.org", "downloads.hindawi.org"];
    let target = new URL(url);
    for (let n = 0; n < 4; n++) {
      if (
        target.protocol !== "https:" ||
        !allowed.includes(target.hostname) ||
        target.username ||
        target.password
      )
        throw Error("unapproved_source");
      await pause(delayMs, null, { signal });
      const timeout = AbortSignal.any([signal, AbortSignal.timeout(90000)]);
      const response = await fetchImpl(target.href, {
        signal: timeout,
        redirect: "manual",
        headers: {
          "User-Agent": "REFUGE-Offline/0.1 (personal offline library)",
        },
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const next = new URL(response.headers.get("location"), target);
        if (next.protocol === "http:" && next.hostname === target.hostname)
          next.protocol = "https:";
        await response.body?.cancel();
        target = next;
        continue;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw Error(`source_http_${response.status}`);
      }
      const chunks = [];
      let size = 0;
      try {
        for await (const chunk of response.body) {
          size += chunk.length;
          if (size > max) throw Error("book_too_large");
          chunks.push(chunk);
        }
      } catch (e) {
        throw e;
      }
      return Buffer.concat(chunks);
    }
    throw Error("too_many_redirects");
  }
  async function download(book, signal) {
    let url, rights;
    if (book.source === "gutenberg") {
      const n = book.id.slice(3);
      const rdf = (
        await safeFetch(
          `https://www.gutenberg.org/cache/epub/${n}/pg${n}.rdf`,
          signal,
          2000000,
        )
      ).toString("utf8");
      if (!/Public domain in the USA/i.test(rdf) || !contributorsOldEnough(rdf))
        throw Error("rights_review_needed");
      url = `https://www.gutenberg.org/cache/epub/${n}/pg${n}.txt`;
      rights =
        "Gutenberg: public domain in the USA; listed contributors passed the 70-year date check. Check edition and local rights before redistribution.";
    } else if (
      book.source === "hindawi" &&
      book.license === "CC BY 4.0" &&
      book.reviewed === true &&
      /^[a-f0-9]{64}$/.test(book.sha256 || "")
    ) {
      url = `https://downloads.hindawi.org/books/${book.id.slice(3)}.pdf`;
      rights = `CC BY 4.0 — ${book.authors}; Hindawi. License statement in the original PDF.`;
    } else throw Error("rights_review_needed");
    const data = await safeFetch(
      url,
      signal,
      book.format === "pdf" ? 50000000 : 20000000,
    );
    const digest = createHash("sha256").update(data).digest("hex");
    if (book.source === "hindawi" && digest !== book.sha256)
      throw Error("source_changed");
    if (book.format === "pdf") {
      if (data.subarray(0, 5).toString() !== "%PDF-")
        throw Error("invalid_book");
    } else if (
      !/project gutenberg/i.test(data.toString("utf8").slice(0, 12000)) ||
      /^\s*(?:<!doctype|<html)/i.test(data.toString("utf8").slice(0, 200))
    )
      throw Error("invalid_book");
    signal.throwIfAborted();
    const base = await directory();
    const tmp = path.join(
        base,
        `${book.id}.${randomBytes(8).toString("hex")}.partial`,
      ),
      receiptTmp = tmp + ".json";
    try {
      await writeFile(tmp, data, { flag: "wx" });
      signal.throwIfAborted();
      const receipt = {
        id: book.id,
        bytes: data.length,
        sha256: digest,
        downloadedAt: new Date().toISOString(),
        source: url,
        rights,
      };
      await writeFile(receiptTmp, JSON.stringify(receipt, null, 2), {
        flag: "wx",
      });
      signal.throwIfAborted();
      await rename(tmp, path.join(base, `${book.id}.${book.format}`));
      await rename(receiptTmp, path.join(base, `${book.id}.json`));
      job.bytes += data.length;
    } finally {
      await unlink(tmp).catch(() => {});
      await unlink(receiptTmp).catch(() => {});
    }
  }
  async function start(ids) {
    if (job.running) throw Error("download_busy");
    if (
      !Array.isArray(ids) ||
      ids.length < 1 ||
      ids.length > 50 ||
      ids.some((id) => !validBookId(id))
    )
      throw Error("invalid_batch");
    const entries = await catalog(),
      chosen = [...new Set(ids)].map((id) => entries.find((b) => b.id === id));
    if (chosen.some((b) => !b)) throw Error("invalid_batch");
    if (job.running) throw Error("download_busy");
    controller = new AbortController();
    const signal = controller.signal;
    job = {
      running: true,
      total: chosen.length,
      completed: 0,
      failed: 0,
      cancelled: false,
      current: null,
      bytes: 0,
      errors: [],
    };
    void (async () => {
      try {
        const saved = await installed();
        for (const b of chosen) {
          if (signal.aborted) break;
          job.current = b.title;
          try {
            if (!saved.has(b.id)) await download(b, signal);
            job.completed++;
          } catch (e) {
            if (signal.aborted) break;
            job.failed++;
            job.errors.push({
              id: b.id,
              title: b.title,
              code: /^(rights_review_needed|source_changed|invalid_book|book_too_large|source_http_\d+)$/.test(
                e.message,
              )
                ? e.message
                : "download_unavailable",
            });
            job.errors = job.errors.slice(-10);
          }
        }
      } catch {
        job.failed++;
        job.errors.push({ code: "local_storage_unavailable" });
      } finally {
        job.cancelled = signal.aborted;
        job.current = null;
        job.running = false;
      }
    })();
    return snapshot();
  }
  function snapshot() {
    return structuredClone(job);
  }
  function cancel() {
    controller?.abort();
    return snapshot();
  }
  async function file(id) {
    if (!validBookId(id)) throw Error("invalid_book");
    const b = (await catalog()).find((b) => b.id === id),
      saved = await installed();
    if (!b || !saved.has(id)) throw Error("book_not_installed");
    return {
      directory: await directory(),
      filename: `${id}.${b.format}`,
      book: b,
      receipt: saved.get(id),
    };
  }
  async function read(id) {
    const f = await file(id);
    const bytes = await readFile(path.join(f.directory, f.filename));
    if (createHash("sha256").update(bytes).digest("hex") !== f.receipt.sha256)
      throw Error("book_integrity");
    return bytes.toString("utf8");
  }
  return { list, start, cancel, snapshot, file, read };
}
