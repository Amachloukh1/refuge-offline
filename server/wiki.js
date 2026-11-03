import http from "node:http";
import path from "node:path";
import { serveLocalFile } from "./files.js";
import { loadList } from "./resources.js";
import { stat } from "node:fs/promises";
import { localNetwork } from "./network.js";
export function createWikiServer(root, { network = localNetwork() } = {}) {
  const directory = path.join(root, "content/wiki-reader/kiwix-js-4.4.0/dist");
  return http.createServer(async (req, res) => {
    if (!network.allows(req)) {
      res.writeHead(403);
      res.end();
      return;
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    // Separate origin: archive content cannot read REFUGE storage or API.
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' data: blob:; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; worker-src 'self' blob:; frame-src 'self' data: blob:; object-src 'none'",
    );
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    try {
      const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
      if (pathname === "/archives/catalog.json") {
        const list = [];
        for (const w of await loadList(root, "content/wiki.catalog.json")) {
          if (!/^[\w.-]+\.zim$/.test(w.filename || "")) continue;
          try {
            const s = await stat(path.join(root, "content/zim", w.filename));
            if (s.isFile() && s.size === w.bytes)
              list.push({
                filename: w.filename,
                language: w.language,
                bytes: s.size,
              });
          } catch {}
        }
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(list));
        return;
      }
      if (pathname.startsWith("/archives/")) {
        const filename = decodeURIComponent(
          pathname.slice("/archives/".length),
        );
        if (
          !/^[\w.-]+\.zim$/.test(filename) ||
          !(await loadList(root, "content/wiki.catalog.json")).some(
            (w) => w.filename === filename,
          )
        )
          throw new Error("not_found");
        await serveLocalFile(
          req,
          res,
          path.join(root, "content/zim"),
          filename,
        );
        return;
      }
      const relative =
        decodeURIComponent(
          new URL(req.url, `http://${req.headers.host}`).pathname,
        ).slice(1) || "index.html";
      await serveLocalFile(req, res, directory, relative);
    } catch {
      if (!res.headersSent) res.writeHead(404);
      res.end();
    }
  });
}
