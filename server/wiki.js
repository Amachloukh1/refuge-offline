import http from "node:http";
import path from "node:path";
import { serveLocalFile } from "./files.js";
export function createWikiServer(root) {
  const directory = path.join(root, "content/wiki-reader/kiwix-js-4.4.0/dist");
  return http.createServer(async (req, res) => {
    const host = req.headers.host?.split(":")[0];
    if (!["127.0.0.1", "localhost"].includes(host)) {
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
