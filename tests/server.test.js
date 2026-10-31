import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { aiConfig } from "../server/ai.js";
async function withServer(run) {
  const server = createApp({
    config: aiConfig({ REFUGE_AI_BASE_URL: "http://127.0.0.1:1/v1" }),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}
test("serveur local : statut indisponible honnête, sans secret ni erreur interne", () =>
  withServer(async (base) => {
    const r = await fetch(`${base}/api/status`);
    assert.equal(r.status, 200);
    const data = await r.json();
    assert.equal(data.available, false);
    assert.equal("key" in data, false);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  }));
test("les origines étrangères et messages système non autorisés sont refusés", () =>
  withServer(async (base) => {
    const r = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: {
        Origin: "https://evil.example",
        "Content-Type": "application/json",
      },
      body: "{}",
    });
    assert.equal(r.status, 403);
    const bad = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "system", content: "test" }] }),
    });
    assert.equal(bad.status, 400);
  }));
test("les fichiers privés et traversées ne sont jamais servis", () =>
  withServer(async (base) => {
    for (const name of [
      "/.env",
      "/package.json",
      "/documents/..%5c..%5cpackage.json",
      "/documents/unknown.pdf",
    ]) {
      const r = await fetch(base + name);
      assert.notEqual(r.status, 200);
    }
  }));
