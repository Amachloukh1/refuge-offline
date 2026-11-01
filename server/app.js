import http from "node:http";
import path from "node:path";
import { readFile, stat, realpath } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { retrieveKnowledge, validatePlanning } from "./knowledge.js";
import { resources } from "./resources.js";
import { serveLocalFile } from "./files.js";
import { readWeather, refreshWeather } from "./weather.js";
import { createStudio } from "./studio.js";
import { createGps } from "./gps.js";
import { createReadiness } from "./readiness.js";
import { createBooks } from "./books.js";
import { createMedia } from "./media-library.js";
import {
  aiConfig,
  remoteStudioConfig,
  status,
  completeChat,
  validateMessages,
} from "./ai.js";
const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2",
};
async function catalog(root) {
  try {
    const list = JSON.parse(
      await readFile(path.join(root, "content/catalog.json"), "utf8"),
    );
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function json(res, code, data) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}
async function body(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 24000) throw new Error("body_too_large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function createApp({
  root = project,
  config = aiConfig(),
  remote = remoteStudioConfig(),
} = {}) {
  let active = false;
  let aiPaused = false;
  let legacyController;
  let studio;
  const gps = createGps();
  const readiness = createReadiness(root);
  const books = createBooks(root);
  const media = createMedia(root);
  const server = http.createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; worker-src 'self' blob:; frame-src http://127.0.0.1:8108 https://players.brightcove.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' https://download.blender.org https://incompetech.com/music/royalty-free/mp3-royaltyfree/; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'self'; base-uri 'none'; form-action 'self'",
    );
    const address = serverAddress(req.headers.host);
    if (!address) {
      json(res, 403, { code: "local_only" });
      return;
    }
    if (
      req.headers.origin &&
      req.headers.origin !== `http://${req.headers.host}`
    ) {
      json(res, 403, { code: "invalid_origin" });
      return;
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(req.url, `http://${req.headers.host}`).pathname,
      );
      if (pathname === "/api/weather" && req.method === "GET") {
        json(res, 200, await readWeather(root));
        return;
      }
      if (pathname === "/api/weather/refresh" && req.method === "POST") {
        const input = await body(req);
        try {
          json(res, 200, await refreshWeather(root, input.city));
        } catch {
          json(res, 503, { code: "weather_unavailable" });
        }
        return;
      }
      pathname = decodeURIComponent(
        new URL(req.url, `http://${req.headers.host}`).pathname,
      );
    } catch {
      json(res, 400, { code: "invalid_path" });
      return;
    }
    try {
      if (pathname === "/api/media" && req.method === "GET") {
        json(res, 200, await media.list());
        return;
      }
      if (pathname === "/api/media/jobs" && req.method === "GET") {
        json(res, 200, media.snapshot());
        return;
      }
      if (pathname === "/api/media/download" && req.method === "POST") {
        try {
          json(res, 202, await media.start((await body(req)).ids));
        } catch (e) {
          json(res, e.message === "download_busy" ? 409 : 400, {
            code: e.message === "download_busy" ? e.message : "invalid_batch",
          });
        }
        return;
      }
      if (pathname === "/api/media/cancel" && req.method === "POST") {
        json(res, 200, media.cancel());
        return;
      }
      if (pathname === "/api/media/import" && req.method === "POST") {
        try {
          const params = Object.fromEntries(
            new URL(req.url, "http://localhost").searchParams,
          );
          json(res, 201, await media.import(req, params));
        } catch (e) {
          if (!res.headersSent && !res.destroyed)
            json(res, 400, {
              code:
                e.message === "import_busy" ? "import_busy" : "import_failed",
            });
        }
        return;
      }
      if (
        pathname.startsWith("/media/files/") &&
        ["GET", "HEAD"].includes(req.method)
      ) {
        const match = pathname.match(
          /^\/media\/files\/([a-z0-9-]{1,80})\.(mp4|webm|mp3|ogg|m4a|wav|flac)$/,
        );
        try {
          if (!match) throw Error("invalid_media");
          const f = await media.file(match[1], match[2]);
          await serveLocalFile(req, res, f.directory, f.filename);
        } catch {
          if (!res.headersSent) json(res, 404, { code: "media_unavailable" });
        }
        return;
      }
      if (pathname === "/api/books" && req.method === "GET") {
        const params = Object.fromEntries(
          new URL(req.url, "http://localhost").searchParams,
        );
        json(res, 200, await books.list(params));
        return;
      }
      if (pathname === "/api/books/jobs" && req.method === "GET") {
        json(res, 200, books.snapshot());
        return;
      }
      if (pathname === "/api/books/download" && req.method === "POST") {
        try {
          const input = await body(req);
          json(res, 202, await books.start(input.ids));
        } catch (e) {
          json(res, e.message === "download_busy" ? 409 : 400, {
            code:
              e.message === "download_busy" ? "download_busy" : "invalid_batch",
          });
        }
        return;
      }
      if (pathname === "/api/books/cancel" && req.method === "POST") {
        json(res, 200, books.cancel());
        return;
      }
      if (
        pathname.startsWith("/books/") &&
        ["GET", "HEAD"].includes(req.method)
      ) {
        const match = pathname.match(
          /^\/books\/((?:pg-\d+|hw-\d{8}))\.(txt|pdf)$/,
        );
        if (!match) {
          json(res, 404, { code: "not_found" });
          return;
        }
        try {
          const f = await books.file(match[1]);
          if (f.book.format !== match[2]) throw Error("invalid_book");
          await serveLocalFile(req, res, f.directory, f.filename);
        } catch {
          if (!res.headersSent) json(res, 404, { code: "book_unavailable" });
        }
        return;
      }
      if (pathname === "/api/readiness" && req.method === "GET") {
        json(res, 200, readiness.snapshot());
        return;
      }
      if (pathname === "/api/energy" && req.method === "POST") {
        let input;
        try {
          input = await body(req);
        } catch {
          json(res, 400, { code: "invalid_energy" });
          return;
        }
        if (!input || typeof input.paused !== "boolean") {
          json(res, 400, { code: "invalid_energy" });
          return;
        }
        aiPaused = input.paused;
        if (aiPaused) {
          studio?.pause();
          legacyController?.abort();
        }
        json(res, 200, { paused: aiPaused });
        return;
      }
      if (pathname === "/api/readiness/check" && req.method === "POST") {
        const input = await body(req);
        if (!input || typeof input.deep !== "boolean") {
          json(res, 400, { code: "invalid_check" });
          return;
        }
        json(res, 202, readiness.start({ deep: input.deep }));
        return;
      }
      if (pathname === "/api/status" && req.method === "GET") {
        json(res, 200, {
          ...(await status(config)),
          remoteConfigured: Boolean(remote),
        });
        return;
      }
      if (pathname === "/api/gps" && req.method === "GET") {
        json(res, 200, gps.snapshot());
        return;
      }
      if (pathname === "/api/gps/refresh" && req.method === "POST") {
        json(res, 202, gps.refresh());
        return;
      }
      if (pathname.startsWith("/local-studio/")) {
        studio ??= createStudio({
          root,
          generate: async (data, signal, onPartial) => {
            if (aiPaused) throw new Error("engine_paused");
            if (active) throw new Error("engine_busy");
            const selected = data.mode === "remote" ? remote : config;
            if (!selected) throw new Error("engine_unavailable");
            active = true;
            try {
              const knowledge = await retrieveKnowledge(
                root,
                data.messages.at(-1).content,
                data.language,
              );
              const content = await completeChat(
                selected,
                data.messages,
                data.language,
                fetch,
                signal,
                knowledge,
                data.planning ? validatePlanning(data.planning) : null,
                onPartial,
              );
              return {
                content,
                references: knowledge.references,
                remote: Boolean(selected.remote),
              };
            } finally {
              active = false;
            }
          },
        });
        await studio.handle(req, res, pathname, body, json);
        return;
      }
      if (pathname === "/api/resources" && req.method === "GET") {
        json(res, 200, await resources(root));
        return;
      }
      if (
        /^\/assets\/(maps|videos|zim)\//.test(pathname) &&
        ["GET", "HEAD"].includes(req.method)
      ) {
        const parts = pathname.slice("/assets/".length).split("/");
        const kind = parts.shift();
        if (!["maps", "videos", "zim"].includes(kind)) {
          json(res, 404, { code: "not_found" });
          return;
        }
        try {
          await serveLocalFile(
            req,
            res,
            path.join(root, "content", kind),
            parts.join("/"),
          );
        } catch {
          if (!res.headersSent) json(res, 404, { code: "not_found" });
        }
        return;
      }
      if (pathname === "/api/documents" && req.method === "GET") {
        const docs = [];
        for (const doc of await catalog(root)) {
          if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(doc.filename || "")) continue;
          try {
            const info = await stat(
              path.join(root, "content/documents", doc.filename),
            );
            if (info.isFile()) docs.push({ ...doc, bytes: info.size });
          } catch {}
        }
        json(res, 200, docs);
        return;
      }
      if (pathname === "/api/chat" && req.method === "POST") {
        if (!req.headers["content-type"]?.startsWith("application/json")) {
          json(res, 415, { code: "json_required" });
          return;
        }
        let data;
        try {
          data = await body(req);
        } catch {
          json(res, 400, { code: "invalid_request" });
          return;
        }
        if (!data || !validateMessages(data.messages)) {
          json(res, 400, { code: "invalid_messages" });
          return;
        }
        if (data.mode && !["local", "remote"].includes(data.mode)) {
          json(res, 400, { code: "invalid_mode" });
          return;
        }
        const selected = data.mode === "remote" ? remote : config;
        if (!selected) {
          json(res, 503, { code: "remote_not_configured" });
          return;
        }
        const planning =
          data.planning === undefined ? null : validatePlanning(data.planning);
        if (data.planning !== undefined && !planning) {
          json(res, 400, { code: "invalid_planning" });
          return;
        }
        const knowledge = await retrieveKnowledge(
          root,
          data.messages.at(-1).content,
          ["fr", "de", "en", "ar"].includes(data.language)
            ? data.language
            : "fr",
        );
        const controller = new AbortController();
        res.on("close", () => controller.abort());
        if (active) {
          json(res, 429, { code: "engine_busy" });
          return;
        }
        if (aiPaused) {
          json(res, 503, { code: "engine_paused" });
          return;
        }
        legacyController = controller;
        active = true;
        try {
          const answer = await completeChat(
            selected,
            data.messages,
            data.language,
            fetch,
            controller.signal,
            knowledge,
            planning,
          );
          if (!res.destroyed)
            json(res, 200, {
              content: answer,
              model: selected.model,
              provider: selected.provider,
              remote: Boolean(selected.remote),
              references: knowledge.references,
            });
        } catch {
          if (!res.destroyed) json(res, 503, { code: "engine_unavailable" });
        } finally {
          active = false;
          legacyController = null;
        }
        return;
      }
      if (pathname.startsWith("/api/")) {
        json(res, 404, { code: "not_found" });
        return;
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        json(res, 405, { code: "method_not_allowed" });
        return;
      }
      let directory = path.join(root, "dist"),
        relative = pathname === "/" ? "index.html" : pathname.slice(1);
      if (pathname.startsWith("/documents/")) {
        directory = path.join(root, "content/documents");
        relative = pathname.slice("/documents/".length);
        if (
          !/^[a-zA-Z0-9_-]+\.pdf$/.test(relative) ||
          !(await catalog(root)).some((d) => d.filename === relative)
        ) {
          json(res, 404, { code: "not_found" });
          return;
        }
      }
      const filename = path.resolve(directory, relative);
      if (
        !filename.startsWith(directory + path.sep) ||
        relative.includes("\\")
      ) {
        json(res, 403, { code: "forbidden" });
        return;
      }
      let resolved;
      try {
        resolved = await realpath(filename);
        const realDirectory = await realpath(directory);
        if (!resolved.startsWith(realDirectory + path.sep))
          throw new Error("path");
      } catch {
        json(res, 404, { code: "not_found" });
        return;
      }
      const file = await readFile(resolved);
      res.writeHead(200, {
        "Content-Type":
          mime[path.extname(filename)] || "application/octet-stream",
        "Content-Length": file.length,
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : file);
    } catch {
      if (!res.headersSent) json(res, 500, { code: "server_error" });
      else res.end();
    }
  });
  server.on("close", () => studio?.close());
  server.on("close", () => gps.close());
  server.on("close", () => books.cancel());
  server.on("close", () => media.cancel());
  return server;
}
function serverAddress(host) {
  try {
    const url = new URL(`http://${host}`);
    return (
      ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) &&
      url.username === "" &&
      url.password === ""
    );
  } catch {
    return false;
  }
}
