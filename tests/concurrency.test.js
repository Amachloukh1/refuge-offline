import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createApp } from "../server/app.js";
import { aiConfig } from "../server/ai.js";
test("deux corps HTTP simultanés ne lancent pas deux inférences", async () => {
  let inferences = 0;
  const engine = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      inferences++;
      setTimeout(() => {
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            message: { content: "Local answer" },
          }),
        );
      }, 100);
    });
  });
  await new Promise((resolve) => engine.listen(0, "127.0.0.1", resolve));
  const app = createApp({
    config: aiConfig({
      REFUGE_AI_BASE_URL: `http://127.0.0.1:${engine.address().port}/v1`,
    }),
  });
  await new Promise((resolve) => app.listen(0, "127.0.0.1", resolve));
  try {
    const pending = [];
    const requests = Array.from({ length: 2 }, () => {
      let request;
      pending.push(
        new Promise((resolve, reject) => {
          request = http.request(
            {
              hostname: "127.0.0.1",
              port: app.address().port,
              path: "/api/chat",
              method: "POST",
              headers: { "Content-Type": "application/json" },
            },
            (res) => {
              res.resume();
              res.on("end", () => resolve(res.statusCode));
            },
          );
          request.on("error", reject);
        }),
      );
      request.write('{"messages":');
      return request;
    });
    await new Promise((resolve) => setTimeout(resolve, 40));
    for (const request of requests)
      request.end('[{"role":"user","content":"test"}]}');
    assert.deepEqual((await Promise.all(pending)).sort(), [200, 429]);
    assert.equal(inferences, 1);
  } finally {
    await new Promise((resolve) => app.close(resolve));
    await new Promise((resolve) => engine.close(resolve));
  }
});
