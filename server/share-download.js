import http from "node:http";
import path from "node:path";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { serveLocalFile } from "./files.js";
import { renderSharePage } from "./share-page.js";
import { readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
const illustration = readFileSync(
  new URL("./assets/refuge-camp.jpg", import.meta.url),
);

export function createShareServer(config, { now = () => Date.now() } = {}) {
  const created = Date.parse(config.createdAt),
    expires = Date.parse(config.expiresAt);
  if (
    config.version !== 1 ||
    !Number.isFinite(created) ||
    !Number.isFinite(expires) ||
    expires <= created ||
    expires - created > 7 * 86400000 ||
    !/^refuge$/.test(config.username) ||
    !/^[a-f0-9]{64}$/.test(config.salt) ||
    !/^[a-f0-9]{64}$/.test(config.passwordHash) ||
    !/^[a-f0-9]{64}$/.test(config.sha256) ||
    !/^[A-Za-z0-9_-]{24,80}$/.test(config.token) ||
    !path.isAbsolute(config.file) ||
    !/^[A-Za-z0-9._-]+\.zip$/.test(path.basename(config.file))
  )
    throw Error("Invalid share configuration");
  const prefix = `/refuge/${config.token}`,
    salt = Buffer.from(config.salt, "hex"),
    expected = Buffer.from(config.passwordHash, "hex");
  const active = new Set();
  let failed = 0,
    windowAt = now();
  const server = http.createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    );
    const send = (status, message) => {
      res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(req.method === "HEAD" ? undefined : message);
    };
    let pathname;
    try {
      pathname = new URL(req.url, "http://127.0.0.1").pathname;
    } catch {
      send(400, "Requête invalide");
      return;
    }
    if (
      ![
        prefix,
        prefix + "/",
        prefix + "/download",
        prefix + "/sha256",
        prefix + "/illustration.jpg",
      ].includes(pathname)
    ) {
      send(404, "Introuvable");
      return;
    }
    if (now() >= expires) {
      send(410, "Ce partage REFUGE a expiré.");
      return;
    }
    if (!["GET", "HEAD"].includes(req.method)) {
      res.setHeader("Allow", "GET, HEAD");
      send(405, "Téléchargement uniquement");
      return;
    }
    if (now() - windowAt >= 60000) {
      failed = 0;
      windowAt = now();
    }
    if (failed >= 30) {
      res.setHeader("Retry-After", "60");
      send(429, "Trop de tentatives. Réessayez dans une minute.");
      return;
    }
    let authorized = false;
    const authorization = req.headers.authorization || "";
    if (
      authorization.length <= 800 &&
      /^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization)
    ) {
      const credential = Buffer.from(authorization.slice(6), "base64").toString(
          "utf8",
        ),
        colon = credential.indexOf(":");
      if (
        colon > 0 &&
        credential.slice(0, colon) === config.username &&
        credential.length <= 500
      ) {
        const actual = scryptSync(credential.slice(colon + 1), salt, 32);
        authorized = timingSafeEqual(expected, actual);
      }
    }
    if (!authorized) {
      failed++;
      res.setHeader(
        "WWW-Authenticate",
        'Basic realm="REFUGE temporaire", charset="UTF-8"',
      );
      send(401, "Identifiant refuge et mot de passe requis.");
      return;
    }
    if (pathname === prefix + "/illustration.jpg") {
      res.writeHead(200, {
        "Content-Type": "image/jpeg",
        "Content-Length": illustration.length,
      });
      res.end(req.method === "HEAD" ? undefined : illustration);
      return;
    }
    if (pathname === prefix + "/sha256") {
      send(200, `${config.sha256}  ${path.basename(config.file)}\n`);
      return;
    }
    if (pathname === prefix + "/download") {
      if (req.method === "GET" && active.size >= 8) {
        res.setHeader("Retry-After", "30");
        send(429, "Téléchargements en cours. Réessayez dans 30 secondes.");
        return;
      }
      active.add(res);
      res.on("close", () => active.delete(res));
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${path.basename(config.file)}"`,
      );
      try {
        await serveLocalFile(
          req,
          res,
          path.dirname(config.file),
          path.basename(config.file),
        );
      } catch {
        if (res.headersSent) res.destroy();
        else send(503, "Fichier temporairement indisponible.");
      }
      return;
    }
    const date = new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }).format(expires);
    let archiveSize = "";
    try {
      archiveSize =
        new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(
          (await stat(config.file)).size / 1e9,
        ) + " Go";
    } catch {
      /* The landing page remains available when the NAS is temporarily unavailable. */
    }
    const html = renderSharePage({
      prefix,
      date,
      sha256: config.sha256,
      archiveSize,
    });
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(req.method === "HEAD" ? undefined : html);
  });
  server.headersTimeout = 15000;
  server.requestTimeout = 15000;
  server.keepAliveTimeout = 5000;
  server.maxHeadersCount = 40;
  const timer = setTimeout(
    () => {
      for (const res of active) res.destroy();
      active.clear();
    },
    Math.max(0, expires - now()),
  );
  timer.unref();
  server.on("close", () => clearTimeout(timer));
  return server;
}
