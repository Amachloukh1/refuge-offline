// Embedded adapter for Nexus Local Studio's actual Assistant.tsx API contract.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validatePlanning } from "./knowledge.js";
const id = () => randomUUID().replaceAll("-", "");
const fail = (status, detail) => Object.assign(new Error(detail), { status });
export function createStudio({ root, generate }) {
  mkdirSync(path.join(root, "data"), { recursive: true, mode: 0o700 });
  const filename = path.join(root, "data/local-studio.sqlite");
  const db = new DatabaseSync(filename);
  if (process.platform !== "win32") chmodSync(filename, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY,title TEXT,created INTEGER,deleted INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS messages(id INTEGER PRIMARY KEY,conversation_id TEXT,role TEXT,content TEXT,refs TEXT DEFAULT '[]');
 CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,conversation_id TEXT,status TEXT,payload TEXT,partial TEXT DEFAULT '',result TEXT,error TEXT,created INTEGER);`);
  if (
    !db
      .prepare("PRAGMA table_info(messages)")
      .all()
      .some((c) => c.name === "origin")
  )
    db.exec(
      "ALTER TABLE messages ADD COLUMN origin TEXT NOT NULL DEFAULT 'local'",
    );
  db.prepare(
    "UPDATE jobs SET status='failed',error='Session interrompue ; renvoyez votre message.' WHERE status IN ('queued','running')",
  ).run();
  let pumping = false,
    closed = false,
    controller = null,
    timer;
  const row = (sql, ...args) => db.prepare(sql).get(...args),
    rows = (sql, ...args) => db.prepare(sql).all(...args);
  const conversation = (cid) => {
    const c = row("SELECT * FROM conversations WHERE id=? AND deleted=0", cid);
    if (!c) throw fail(404, "Conversation introuvable");
    return c;
  };
  const job = (jid) => {
    const j = row("SELECT * FROM jobs WHERE id=?", jid);
    if (!j) throw fail(404, "Tâche introuvable");
    return {
      id: j.id,
      conversation_id: j.conversation_id,
      kind: "chat",
      model: "local-chat-fast",
      status: j.status,
      partial: j.partial,
      error: j.error,
      result: j.result ? JSON.parse(j.result) : null,
      position: j.status === "queued" ? 1 : null,
    };
  };
  async function pump() {
    if (pumping || closed) return;
    pumping = true;
    try {
      for (;;) {
        if (closed) break;
        const j = row(
          "SELECT * FROM jobs WHERE status='queued' ORDER BY created LIMIT 1",
        );
        if (!j) break;
        const payload = JSON.parse(j.payload);
        controller = new AbortController();
        db.prepare("UPDATE jobs SET status='running' WHERE id=?").run(j.id);
        try {
          let last = 0;
          const result = await generate(payload, controller.signal, (text) => {
            if (!closed && Date.now() - last > 250) {
              last = Date.now();
              db.prepare(
                "UPDATE jobs SET partial=? WHERE id=? AND status='running'",
              ).run(text, j.id);
            }
          });
          if (closed) break;
          if (job(j.id).status === "cancelled") continue;
          db.exec("BEGIN IMMEDIATE");
          try {
            db.prepare(
              "INSERT INTO messages(conversation_id,role,content,refs,origin) VALUES (?,?,?,?,?)",
            ).run(
              j.conversation_id,
              "assistant",
              result.content,
              JSON.stringify(result.references || []),
              result.remote ? "remote" : "local",
            );
            db.prepare(
              "UPDATE jobs SET status='completed',partial='',result=? WHERE id=?",
            ).run(JSON.stringify(result), j.id);
            db.exec("COMMIT");
          } catch (e) {
            db.exec("ROLLBACK");
            throw e;
          }
        } catch (e) {
          if (closed) break;
          if (e.message === "engine_busy") {
            db.prepare("UPDATE jobs SET status='queued' WHERE id=?").run(j.id);
            timer = setTimeout(pump, 500);
            break;
          }
          if (job(j.id).status !== "cancelled")
            db.prepare(
              "UPDATE jobs SET status='failed',error=? WHERE id=?",
            ).run(
              "Le moteur est indisponible. Vos messages sont conservés ; réessayez.",
              j.id,
            );
        } finally {
          controller = null;
        }
      }
    } finally {
      pumping = false;
    }
  }
  async function handle(req, res, pathname, body, json) {
    const route = pathname.slice("/local-studio".length);
    const method = req.method;
    const send = (status, value) => json(res, status, value);
    try {
      if (route === "/api/conversations" && method === "GET") {
        send(
          200,
          rows(
            "SELECT id,title FROM conversations WHERE deleted=? ORDER BY created DESC LIMIT 100",
            new URL(req.url, "http://localhost").searchParams.get("deleted") ===
              "true"
              ? 1
              : 0,
          ),
        );
        return;
      }
      if (route === "/api/conversations" && method === "POST") {
        const p = await body(req);
        if (
          typeof p?.title !== "string" ||
          !p.title.trim() ||
          p.title.length > 100
        )
          throw fail(400, "Titre invalide");
        if (row("SELECT count(*) n FROM conversations").n >= 1000)
          throw fail(409, "Limite de conversations atteinte");
        const cid = id();
        db.prepare(
          "INSERT INTO conversations(id,title,created) VALUES (?,?,?)",
        ).run(cid, p.title.trim(), Date.now());
        send(201, { id: cid });
        return;
      }
      const c = /^\/api\/conversations\/([a-f0-9]{32})(\/restore)?$/.exec(
        route,
      );
      if (c) {
        if (c[2] && method === "POST") {
          if (!row("SELECT id FROM conversations WHERE id=?", c[1]))
            throw fail(404, "Conversation introuvable");
          db.prepare("UPDATE conversations SET deleted=0 WHERE id=?").run(c[1]);
          send(200, { ok: true });
          return;
        }
        const found = conversation(c[1]);
        if (method === "GET") {
          send(200, {
            id: found.id,
            title: found.title,
            messages: rows(
              "SELECT role,content,refs,origin FROM messages WHERE conversation_id=? ORDER BY id",
              found.id,
            ).map((m) => ({
              role: m.role,
              content: m.content,
              references: JSON.parse(m.refs),
              remote: m.origin === "remote",
            })),
            active_job:
              row(
                "SELECT id FROM jobs WHERE conversation_id=? AND status IN ('queued','running')",
                found.id,
              )?.id || null,
          });
          return;
        }
        if (method === "DELETE") {
          if (
            row(
              "SELECT id FROM jobs WHERE conversation_id=? AND status IN ('queued','running')",
              found.id,
            )
          )
            throw fail(
              409,
              "Annulez la réponse avant de supprimer cette conversation",
            );
          db.prepare("UPDATE conversations SET deleted=1 WHERE id=?").run(
            found.id,
          );
          send(200, { ok: true });
          return;
        }
      }
      if (route === "/api/chat" && method === "POST") {
        const p = await body(req);
        if (
          !p ||
          typeof p.conversation_id !== "string" ||
          typeof p.content !== "string" ||
          !p.content.trim() ||
          p.content.length > 4000 ||
          p.model !== "local-chat-fast" ||
          !["local", "remote"].includes(p.mode || "local") ||
          !["fr", "de", "en", "ar"].includes(p.language || "fr")
        )
          throw fail(400, "Message invalide");
        conversation(p.conversation_id);
        if (p.planning !== undefined && !validatePlanning(p.planning))
          throw fail(400, "Réserves invalides");
        if (
          row(
            "SELECT id FROM jobs WHERE conversation_id=? AND status IN ('queued','running')",
            p.conversation_id,
          )
        )
          throw fail(409, "Une réponse est déjà en cours");
        if (
          row(
            "SELECT count(*) n FROM jobs WHERE status IN ('queued','running')",
          ).n >= 10
        )
          throw fail(429, "File pleine");
        const history = rows(
          "SELECT role,content FROM messages WHERE conversation_id=? ORDER BY id DESC LIMIT 7",
          p.conversation_id,
        ).reverse();
        const last = { role: "user", content: p.content.trim() };
        let size = last.content.length;
        const chosen = [];
        for (const original of history.toReversed()) {
          const m = {
            role: original.role,
            content: original.content.slice(0, 4000),
          };
          if (size + m.content.length > 9000) break;
          chosen.unshift(m);
          size += m.content.length;
        }
        chosen.push(last);
        const jid = id();
        const payload = {
          messages: chosen,
          language: p.language || "fr",
          planning: p.planning,
          mode: p.mode || "local",
        };
        db.exec("BEGIN IMMEDIATE");
        try {
          db.prepare(
            "INSERT INTO messages(conversation_id,role,content) VALUES (?,?,?)",
          ).run(p.conversation_id, "user", last.content);
          db.prepare(
            "INSERT INTO jobs(id,conversation_id,status,payload,created) VALUES (?,?,?,?,?)",
          ).run(
            jid,
            p.conversation_id,
            "queued",
            JSON.stringify(payload),
            Date.now(),
          );
          db.exec("COMMIT");
        } catch (e) {
          db.exec("ROLLBACK");
          throw e;
        }
        send(202, job(jid));
        void pump();
        return;
      }
      const j = /^\/v1\/jobs\/([a-f0-9]{32})(\/cancel)?$/.exec(route);
      if (j) {
        const found = job(j[1]);
        if (method === "GET" && !j[2]) {
          send(200, found);
          return;
        }
        if (method === "POST" && j[2]) {
          if (["queued", "running"].includes(found.status)) {
            db.prepare("UPDATE jobs SET status='cancelled' WHERE id=?").run(
              found.id,
            );
            if (found.status === "running") controller?.abort();
          }
          send(200, { ok: true });
          return;
        }
      }
      send(404, {
        detail: "Fonction non disponible dans cet assistant embarqué",
      });
    } catch (e) {
      send(e.status || 400, {
        detail: e.status ? e.message : "Requête invalide",
      });
    }
  }
  return {
    handle,
    close() {
      closed = true;
      clearTimeout(timer);
      controller?.abort();
      db.close();
    },
  };
}
