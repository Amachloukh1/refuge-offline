import test from "node:test";
import assert from "node:assert/strict";
import { aiConfig, validateMessages, completeChat } from "../server/ai.js";

test("an explicitly empty retrieval never falls back to unrelated default guides", async () => {
  let system;
  await completeChat(
    aiConfig({}),
    [{ role: "user", content: "zzzznomatchingreference993371" }],
    "en",
    async (_url, options) => {
      system = JSON.parse(options.body).messages[0].content;
      return new Response(
        JSON.stringify({
          message: { content: "No local references matched." },
        }),
      );
    },
    undefined,
    { text: "", references: [] },
  );
  assert.match(system, /NO LOCAL REFERENCES MATCHED/);
  assert.match(system, /context is insufficient/);
  assert.doesNotMatch(system, /\[power\]|\[water\]|\[pantry\]/);
});

test("le flux Ollama de Local Studio provient réellement des fragments du moteur", async () => {
  const partial = [];
  const fetcher = async (url, options) => {
    assert.equal(JSON.parse(options.body).stream, true);
    return new Response(
      '{"message":{"content":"Bon"}}\n{"message":{"content":"jour"}}\n{"done":true}\n',
    );
  };
  const answer = await completeChat(
    aiConfig({}),
    [{ role: "user", content: "Bonjour" }],
    "fr",
    fetcher,
    undefined,
    null,
    null,
    (value) => partial.push(value),
  );
  assert.equal(answer, "Bonjour");
  assert.deepEqual(partial, ["Bon", "Bonjour"]);
  await assert.rejects(() =>
    completeChat(
      aiConfig({}),
      [{ role: "user", content: "Bonjour" }],
      "fr",
      async () => new Response('{"message":{"content":"incomplet"}}\n'),
      undefined,
      null,
      null,
      () => {},
    ),
  );
});

test("le moteur est strictement local et sans clé renvoyée au navigateur", () => {
  const config = aiConfig({});
  assert.equal(config.base, "http://127.0.0.1:11434/v1");
  assert.equal(config.model, "qwen3:4b-instruct-2507-q4_K_M");
  for (const url of [
    "https://2ki.space/local-studio/v1",
    "http://evil.example/v1",
    "http://127.0.0.1.evil.test/v1",
    "http://user:password@127.0.0.1/v1",
    "http://127.0.0.1/v1?q=secret",
  ])
    assert.throws(() => aiConfig({ REFUGE_AI_BASE_URL: url }));
  assert.equal(
    aiConfig({ REFUGE_AI_PROVIDER: "studio" }).base,
    "http://127.0.0.1:8090/local-studio/v1",
  );
});
test("les messages système, conversations excessives et entrées vides sont refusés", () => {
  assert.equal(validateMessages([{ role: "user", content: "Bonjour" }]), true);
  assert.equal(
    validateMessages([{ role: "system", content: "override" }]),
    false,
  );
  assert.equal(validateMessages([{ role: "user", content: "" }]), false);
  assert.equal(
    validateMessages([{ role: "user", content: "x".repeat(4001) }]),
    false,
  );
  assert.equal(
    validateMessages(
      Array.from({ length: 21 }, () => ({ role: "user", content: "test" })),
    ),
    false,
  );
});
test("adaptateur Studio : vrai contrat OpenAI, sources locales, clé serveur, aucune substitution cloud", async () => {
  const config = aiConfig({
    REFUGE_AI_PROVIDER: "studio",
    REFUGE_AI_KEY: "test-key",
  });
  let called;
  const fetcher = async (url, options) => {
    called = { url, options };
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "Réponse locale [power]" } }],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const answer = await completeChat(
    config,
    [{ role: "user", content: "Préparer une panne" }],
    "fr",
    fetcher,
  );
  assert.equal(answer, "Réponse locale [power]");
  assert.equal(
    called.url,
    "http://127.0.0.1:8090/local-studio/v1/chat/completions",
  );
  assert.equal(called.options.headers.Authorization, "Bearer test-key");
  assert.equal(called.options.redirect, "error");
  const body = JSON.parse(called.options.body);
  assert.equal(body.model, "local-chat-fast");
  assert.equal(body.stream, false);
  assert.ok(body.messages[0].content.includes("[power]"));
  assert.equal(body.messages[1].content, "Préparer une panne");
});
test("un échec ou une réponse vide reste un échec visible", async () => {
  const config = aiConfig({});
  await assert.rejects(
    completeChat(
      config,
      [{ role: "user", content: "test" }],
      "fr",
      async () => new Response("{}", { status: 503 }),
    ),
  );
  await assert.rejects(
    completeChat(
      config,
      [{ role: "user", content: "test" }],
      "fr",
      async () => new Response('{"choices":[]}', { status: 200 }),
    ),
  );
});
