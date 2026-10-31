import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { createStudio } from "../server/studio.js";
test("Local Studio embarqué : conversation durable, vrai job, références, corbeille et restauration", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "refuge-studio-"));
  let studio;
  let server;
  const start = async () => {
    studio = createStudio({
      root,
      generate: async (p, s, partial) => {
        assert.equal(p.messages.at(-1).content, "Test préparation");
        assert.ok(p.messages.every((m) => m.content.length <= 4000));
        partial("Réponse");
        return {
          content: "Réponse avec source" + "x".repeat(4100),
          remote: true,
          references: [
            { id: "water", title: "Eau", href: "#library?view=water" },
          ],
        };
      },
    });
    server = http.createServer((req, res) =>
      studio.handle(
        req,
        res,
        new URL(req.url, "http://localhost").pathname,
        async (r) => {
          let b = "";
          for await (const c of r) b += c;
          return JSON.parse(b);
        },
        (r, status, obj) => {
          r.writeHead(status, { "Content-Type": "application/json" });
          r.end(JSON.stringify(obj));
        },
      ),
    );
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    return "http://127.0.0.1:" + server.address().port + "/local-studio";
  };
  const stop = async () => {
    await new Promise((r) => server.close(r));
    studio.close();
  };
  let base = await start();
  const call = async (p, method = "GET", data) => {
    const r = await fetch(base + p, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    return { status: r.status, data: await r.json() };
  };
  try {
    const c = await call("/api/conversations", "POST", { title: "Essai" });
    assert.equal(c.status, 201);
    const cid = c.data.id;
    const invalid = await call("/api/chat", "POST", {
      conversation_id: cid,
      content: "x",
      model: "untrusted",
    });
    assert.equal(invalid.status, 400);
    const j = await call("/api/chat", "POST", {
      conversation_id: cid,
      content: "Test préparation",
      model: "local-chat-fast",
      language: "fr",
      planning: { people: 4, days: 10, water: 24 },
    });
    assert.equal(j.status, 202);
    for (let n = 0; n < 20; n++) {
      const job = (await call("/v1/jobs/" + j.data.id)).data;
      if (job.status === "completed") break;
      await new Promise((r) => setTimeout(r, 10));
    }
    const thread = (await call("/api/conversations/" + cid)).data;
    assert.equal(thread.messages.length, 2);
    assert.equal(thread.messages[1].references[0].id, "water");
    assert.equal(thread.messages[1].remote, true);
    await stop();
    base = await start();
    assert.equal(
      (await call("/api/conversations/" + cid)).data.messages[1].content,
      "Réponse avec source" + "x".repeat(4100),
    );
    assert.equal(
      (await call("/api/conversations/" + cid, "DELETE")).status,
      200,
    );
    assert.equal((await call("/api/conversations")).data.length, 0);
    assert.equal(
      (await call("/api/conversations?deleted=true")).data.length,
      1,
    );
    await call("/api/conversations/" + cid + "/restore", "POST");
    assert.equal((await call("/api/conversations")).data.length, 1);
    const next = await call("/api/chat", "POST", {
      conversation_id: cid,
      content: "Test préparation",
      model: "local-chat-fast",
    });
    assert.equal(next.status, 202);
    for (let n = 0; n < 20; n++) {
      const j = (await call("/v1/jobs/" + next.data.id)).data;
      if (j.status === "completed") {
        assert.equal(j.result.remote, true);
        break;
      }
      assert.notEqual(j.status, "failed");
      await new Promise((r) => setTimeout(r, 10));
    }
  } finally {
    await stop();
    await rm(root, { recursive: true, force: true });
  }
});
