import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createApp } from "../server/app.js";
import { createStudio } from "../server/studio.js";
import { aiConfig } from "../server/ai.js";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${server.address().port}`;
}
async function close(server) {
  if (!server?.listening) return;
  await new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  });
}
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
async function call(base, route, data, headers = {}) {
  const response = await fetch(base + route, {
    method: data === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(5000),
  });
  return { status: response.status, data: await response.json() };
}

test(
  "energy endpoint rejects malformed/nonboolean input and foreign origins without changing inference",
  { timeout: 10000 },
  async () => {
    const root = await mkdtemp(
      path.join(os.tmpdir(), "refuge-energy-validation-"),
    );
    const app = createApp({
      root,
      config: aiConfig({ REFUGE_AI_BASE_URL: "http://127.0.0.1:1/v1" }),
      remote: null,
    });
    try {
      const base = await listen(app);
      for (const input of [null, {}, [], { paused: "true" }, { paused: 1 }]) {
        const response = await call(base, "/api/energy", input);
        assert.equal(response.status, 400, JSON.stringify(input));
        assert.equal(response.data.code, "invalid_energy");
      }
      const malformed = await fetch(base + "/api/energy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
        signal: AbortSignal.timeout(5000),
      });
      assert.equal(
        malformed.status,
        400,
        "malformed JSON must be a client error",
      );
      await malformed.json();
      const foreign = await call(
        base,
        "/api/energy",
        { paused: true },
        { Origin: "https://foreign.example" },
      );
      assert.equal(foreign.status, 403);
      assert.equal(foreign.data.code, "invalid_origin");
      const chat = await call(base, "/api/chat", {
        messages: [{ role: "user", content: "water" }],
      });
      assert.equal(chat.status, 503);
      assert.equal(
        chat.data.code,
        "engine_unavailable",
        "rejected input must not pause the engine",
      );
    } finally {
      await close(app);
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "energy pause prevents legacy inference, resume restores it and upstream failure stays distinct",
  { timeout: 10000 },
  async () => {
    const root = await mkdtemp(
      path.join(os.tmpdir(), "refuge-energy-inference-"),
    );
    let calls = 0;
    let unavailable = false;
    const inference = http.createServer(async (req, res) => {
      for await (const _chunk of req) {
      }
      calls++;
      assert.equal(req.url, "/v1/chat/completions");
      res.writeHead(unavailable ? 503 : 200, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify(
          unavailable
            ? { error: "offline" }
            : { choices: [{ message: { content: "Local test response" } }] },
        ),
      );
    });
    let app;
    try {
      const upstream = await listen(inference);
      app = createApp({
        root,
        config: aiConfig({
          REFUGE_AI_PROVIDER: "openai-local",
          REFUGE_AI_BASE_URL: upstream + "/v1",
        }),
        remote: null,
      });
      const base = await listen(app);
      const message = {
        messages: [{ role: "user", content: "water" }],
        language: "en",
      };
      const paused = await call(base, "/api/energy", { paused: true });
      assert.deepEqual(paused, { status: 200, data: { paused: true } });
      const blocked = await call(base, "/api/chat", message);
      assert.equal(blocked.status, 503);
      assert.equal(blocked.data.code, "engine_paused");
      assert.equal(calls, 0, "paused request must never reach inference");
      assert.deepEqual(await call(base, "/api/energy", { paused: false }), {
        status: 200,
        data: { paused: false },
      });
      const resumed = await call(base, "/api/chat", message);
      assert.equal(resumed.status, 200);
      assert.equal(resumed.data.content, "Local test response");
      assert.equal(calls, 1);
      unavailable = true;
      const failed = await call(base, "/api/chat", message);
      assert.equal(failed.status, 503);
      assert.equal(failed.data.code, "engine_unavailable");
      assert.equal(calls, 2);
    } finally {
      await close(app);
      await close(inference);
      await rm(root, { recursive: true, force: true });
    }
  },
);

test(
  "Studio pause aborts the running signal, cancels queued jobs and discards late assistant output",
  { timeout: 10000 },
  async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "refuge-energy-studio-"));
    const started = deferred();
    const release = deferred();
    let generationCount = 0;
    let runningSignal;
    const studio = createStudio({
      root,
      generate: async (_payload, signal, partial) => {
        generationCount++;
        runningSignal = signal;
        partial("Unfinished text");
        started.resolve();
        // Intentionally finish even after abort: a cancelled job must not persist it.
        await release.promise;
        return {
          content: "Late answer that must not be saved",
          references: [],
        };
      },
    });
    const server = http.createServer((req, res) =>
      studio.handle(
        req,
        res,
        new URL(req.url, "http://localhost").pathname,
        async (request) => {
          let text = "";
          for await (const chunk of request) text += chunk;
          return JSON.parse(text);
        },
        (response, status, data) => {
          response.writeHead(status, { "Content-Type": "application/json" });
          response.end(JSON.stringify(data));
        },
      ),
    );
    try {
      const base = await listen(server);
      const first = await call(base, "/local-studio/api/conversations", {
        title: "Running",
      });
      const second = await call(base, "/local-studio/api/conversations", {
        title: "Queued",
      });
      assert.equal(first.status, 201);
      assert.equal(second.status, 201);
      const submit = (cid) =>
        call(base, "/local-studio/api/chat", {
          conversation_id: cid,
          content: "A user message",
          model: "local-chat-fast",
        });
      const running = await submit(first.data.id);
      assert.equal(running.status, 202);
      await started.promise;
      const queued = await submit(second.data.id);
      assert.equal(queued.status, 202);
      const job = (id) => call(base, "/local-studio/v1/jobs/" + id);
      assert.equal((await job(running.data.id)).data.status, "running");
      assert.equal((await job(queued.data.id)).data.status, "queued");
      studio.pause();
      assert.equal(runningSignal.aborted, true);
      for (const jid of [running.data.id, queued.data.id]) {
        const result = (await job(jid)).data;
        assert.equal(result.status, "cancelled");
        assert.equal(result.partial, "");
        assert.equal(result.result, null);
      }
      release.resolve();
      await new Promise((resolve) => setImmediate(resolve));
      assert.equal(generationCount, 1, "queued generation must never start");
      for (const cid of [first.data.id, second.data.id]) {
        const conversation = (
          await call(base, "/local-studio/api/conversations/" + cid)
        ).data;
        assert.equal(conversation.active_job, null);
        assert.deepEqual(
          conversation.messages.map((message) => message.role),
          ["user"],
        );
        assert.equal(conversation.messages[0].content, "A user message");
      }
    } finally {
      release.resolve();
      await new Promise((resolve) => setImmediate(resolve));
      await close(server);
      studio.close();
      await rm(root, { recursive: true, force: true });
    }
  },
);
