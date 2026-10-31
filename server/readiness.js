import path from "node:path";
import { readFile, realpath, stat, open, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";

const inside = (base, file) => {
  const rel = path.relative(base, file);
  return (
    rel !== "" &&
    !rel.startsWith(`..${path.sep}`) &&
    rel !== ".." &&
    !path.isAbsolute(rel)
  );
};

// No startup scan: even the light check is an explicit user action.
export function createReadiness(root) {
  let state = {
    status: "idle",
    mode: null,
    progress: { completed: 0, total: 0, bytesRead: 0 },
    counts: { ok: 0, failed: 0, unverified: 0 },
    results: [],
  };
  const snapshot = () => structuredClone(state);
  async function run(deep) {
    const rootReal = await realpath(root);
    const jobs = [];
    const add = (category, base, filename, expected = {}) =>
      jobs.push({ category, base, filename, ...expected });
    for (const [category, catalog, folder] of [
      ["videos", "videos.catalog.json", "videos"],
      ["maps", "maps.catalog.json", "maps"],
      ["wiki", "wiki.catalog.json", "zim"],
      ["documents", "catalog.json", "documents"],
      ["runtime", "runtime.catalog.json", null],
    ]) {
      try {
        const catalogFile = await realpath(path.join(root, "content", catalog));
        if (!inside(rootReal, catalogFile)) throw new Error();
        const entries = JSON.parse(await readFile(catalogFile, "utf8"));
        if (!Array.isArray(entries) || !entries.length) throw new Error();
        for (const item of entries)
          add(
            category,
            folder ? `content/${folder}` : "runtime",
            folder ? item.filename : item.archive?.replace(/^runtime\//, ""),
            { bytes: item.bytes, sha256: item.sha256 },
          );
      } catch {
        add(category, "content", catalog, { invalidCatalog: true });
      }
    }
    // The AI service probe is separate: verify the catalogued model on disk too.
    try {
      const catalogFile = await realpath(
        path.join(root, "content/ai.catalog.json"),
      );
      if (!inside(rootReal, catalogFile)) throw new Error();
      const catalog = JSON.parse(await readFile(catalogFile, "utf8"));
      if (
        !/^[\w.-]+:[\w.-]+$/.test(catalog.model) ||
        !/^[a-f0-9]{64}$/i.test(catalog.digest)
      )
        throw new Error();
      const [name, tag] = catalog.model.split(":");
      const relative = `manifests-v2/ollama.com/library/${name}/${tag}`;
      const manifestFile = await realpath(path.join(root, "models", relative));
      const modelsBase = await realpath(path.join(root, "models"));
      if (
        !inside(rootReal, modelsBase) ||
        !inside(modelsBase, manifestFile) ||
        (await stat(manifestFile)).size > 1024 * 1024
      )
        throw new Error();
      const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
      if (
        !Array.isArray(manifest.layers) ||
        !manifest.layers.some(
          (layer) => layer.mediaType === "application/vnd.ollama.image.model",
        )
      )
        throw new Error();
      const parts = [manifest.config, ...manifest.layers];
      if (
        parts.some(
          (part) =>
            !part ||
            !/^sha256:[a-f0-9]{64}$/i.test(part.digest) ||
            !Number.isSafeInteger(part.size) ||
            part.size < 1,
        ) ||
        parts.reduce((total, part) => total + part.size, 0) !== catalog.bytes
      )
        throw new Error();
      add("model", "models", relative, { sha256: catalog.digest });
      for (const part of parts)
        add("model", "models/blobs", part.digest.replace(":", "-"), {
          bytes: part.size,
          sha256: part.digest.slice(7),
        });
    } catch {
      add("model", "content", "ai.catalog.json", { invalidCatalog: true });
    }
    for (const filename of [
      "dist/index.html",
      "server/index.js",
      "data/document-index.json",
    ])
      add("application", ".", filename);
    const wikiBase = "content/wiki-reader/kiwix-js-4.4.0/dist";
    for (const filename of [
      "index.html",
      "www/index.html",
      "www/js/theme-init.js",
      "www/js/init.js",
      "www/js/bundle.js",
      "www/js/libzim-wasm.js",
      "www/js/libzim-wasm.wasm",
      "www/js/xzdec-wasm.wasm",
      "www/js/zstddec-wasm.wasm",
      "www/css/bootstrap.min.css",
      "www/css/app.css",
      "www/css/transition.css",
    ])
      add("wiki-reader", wikiBase, filename);
    // Enumerate compiled assets so a lone index.html cannot claim a ready build.
    try {
      const assets = await realpath(path.join(root, "dist/assets"));
      if (!inside(rootReal, assets)) throw new Error();
      const names = await readdir(assets);
      const files = names.filter((name) => /\.(js|css)$/.test(name));
      if (!files.some((name) => name.endsWith(".js"))) throw new Error();
      for (const name of files) add("application", "dist/assets", name);
    } catch {
      add("application", ".", "dist/assets", { invalidCatalog: true });
    }
    state.progress.total = jobs.length;
    for (const job of jobs) {
      const result = {
        category: job.category,
        id:
          typeof job.filename === "string"
            ? job.filename.replaceAll("\\", "/").split("/").pop()
            : "invalid-entry",
        status: "failed",
        check: deep ? "sha256" : "size/readability",
      };
      try {
        if (
          job.invalidCatalog ||
          typeof job.filename !== "string" ||
          !job.filename ||
          path.win32.isAbsolute(job.filename) ||
          path.posix.isAbsolute(job.filename) ||
          job.filename.includes("\\")
        )
          throw new Error("invalid_catalog");
        const base = path.resolve(root, job.base);
        const baseReal = await realpath(base);
        if (baseReal !== rootReal && !inside(rootReal, baseReal))
          throw new Error("unsafe_path");
        const candidate = path.resolve(base, job.filename);
        if (!inside(base, candidate)) throw new Error("unsafe_path");
        const file = await realpath(candidate);
        if (!inside(baseReal, file)) throw new Error("unsafe_path");
        const info = await stat(file);
        if (!info.isFile() || info.size === 0)
          throw new Error("missing_or_empty");
        result.bytes = info.size;
        if (
          job.bytes !== undefined &&
          (!Number.isSafeInteger(job.bytes) || info.size !== job.bytes)
        )
          throw new Error("size_mismatch");
        const handle = await open(file, "r");
        try {
          const buffer = Buffer.alloc(1);
          await handle.read(buffer, 0, 1, 0);
        } finally {
          await handle.close();
        }
        if (deep) {
          const hash = createHash("sha256");
          for await (const chunk of createReadStream(file)) {
            hash.update(chunk);
            state.progress.bytesRead += chunk.length;
          }
          if (job.sha256 && !/^[a-f0-9]{64}$/i.test(job.sha256))
            throw new Error("invalid_checksum");
          if (job.sha256 && hash.digest("hex") !== job.sha256.toLowerCase())
            throw new Error("checksum_mismatch");
        }
        result.status = deep && !job.sha256 ? "unverified" : "ok";
        result.message = deep
          ? job.sha256
            ? "Checksum matched."
            : "Readable; no reference checksum available."
          : "Readable; size checked when catalogued. Content integrity not checked.";
      } catch (error) {
        result.message = [
          "invalid_catalog",
          "unsafe_path",
          "missing_or_empty",
          "size_mismatch",
          "invalid_checksum",
          "checksum_mismatch",
        ].includes(error.message)
          ? error.message
          : "missing_or_unreadable";
      }
      state.results.push(result);
      state.counts[result.status]++;
      state.progress.completed++;
    }
    state.status = "completed";
    state.finishedAt = new Date().toISOString();
  }
  return {
    snapshot,
    start({ deep = false } = {}) {
      if (state.status === "running") return snapshot();
      state = {
        status: "running",
        mode: deep === true ? "deep" : "light",
        startedAt: new Date().toISOString(),
        progress: { completed: 0, total: 0, bytesRead: 0 },
        counts: { ok: 0, failed: 0, unverified: 0 },
        results: [],
      };
      void run(deep === true).catch(() => {
        state.status = "failed";
        state.message = "Unable to inspect local resources.";
      });
      return snapshot();
    },
  };
}
