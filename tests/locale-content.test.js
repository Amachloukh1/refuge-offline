import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import {
  interfaceLanguages,
  documentLanguages,
  contentLanguage,
} from "../src/locale-policy.js";
import { guideData } from "../src/data.js";
import { hazards } from "../src/hazards.js";
import { retrieveKnowledge } from "../server/knowledge.js";
import { hazardReferences } from "../server/references.js";
import { aiConfig, completeChat } from "../server/ai.js";
import { createStudio } from "../server/studio.js";

test("all interface languages resolve complete guides and hazards without fabricated translations", () => {
  for (const lang of interfaceLanguages) {
    const sourceLanguage = contentLanguage(lang);
    assert.equal(
      sourceLanguage,
      documentLanguages.includes(lang) ? lang : "en",
    );
    for (const guide of guideData) {
      assert.ok(guide.title[sourceLanguage]);
      assert.ok(guide.intro[sourceLanguage]);
      assert.ok(guide.body[sourceLanguage].length);
      if (sourceLanguage !== lang) assert.equal(guide.body[lang], undefined);
    }
    for (const hazard of hazards) {
      assert.ok(hazard[sourceLanguage].title);
      for (const stage of ["before", "during", "after", "avoid", "kit"])
        assert.ok(hazard[sourceLanguage][stage].length);
      assert.match(
        hazardReferences("tsunami", lang),
        new RegExp(`Source language: ${sourceLanguage}`),
      );
    }
  }
});

test("new interface languages retrieve English passages and report actual source language", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "refuge-locale-content-"));
  try {
    for (const lang of ["ru", "zh", "es", "pt"]) {
      const result = await retrieveKnowledge(root, guideData[0].title.en, lang);
      assert.equal(result.sourceLanguage, "en");
      const reference = result.references.find((r) => r.id === guideData[0].id);
      assert.ok(reference);
      assert.equal(reference.sourceLanguage, "en");
      assert.equal(reference.title, guideData[0].title.en);
      assert.match(result.text, /Source language: en/);
      const empty = await retrieveKnowledge(
        root,
        "zzzznomatchingreference993371",
        lang,
      );
      assert.equal(empty.text, "");
      assert.deepEqual(empty.references, []);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("AI preserves the chosen reply language with English fallback and unmatched references", async () => {
  for (const lang of interfaceLanguages) {
    for (const knowledge of [null, { text: "", references: [] }]) {
      let system;
      await completeChat(
        aiConfig({}),
        [{ role: "user", content: "Test" }],
        lang,
        async (_url, options) => {
          system = JSON.parse(options.body).messages[0].content;
          return new Response(
            JSON.stringify({ message: { content: "Test response" } }),
          );
        },
        undefined,
        knowledge,
      );
      assert.ok(system.includes(`Answer in ${lang}.`));
      if (!documentLanguages.includes(lang)) {
        assert.match(system, /English reference passages are supplied instead/);
        assert.ok(system.includes(`Keep your answer in ${lang}`));
        assert.doesNotMatch(system, /Answer in fr\./);
        if (knowledge === null)
          assert.ok(system.includes(guideData[0].title.en));
      }
      if (knowledge !== null) {
        assert.match(system, /NO LOCAL REFERENCES MATCHED/);
        assert.doesNotMatch(system, /\[power\]|\[water\]/);
      }
    }
  }
  await assert.rejects(
    () => completeChat(aiConfig({}), [{ role: "user", content: "Test" }], "xx"),
    /invalid_language/,
  );
});

test("Studio accepts all eight language codes and preserves each code for generation", async () => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "refuge-studio-languages-"),
  );
  const received = [];
  const studio = createStudio({
    root,
    generate: async (payload) => {
      received.push(payload.language);
      return { content: "Test response", references: [] };
    },
  });
  const server = http.createServer((req, res) =>
    studio.handle(
      req,
      res,
      new URL(req.url, "http://localhost").pathname,
      async (request) => {
        let value = "";
        for await (const chunk of request) value += chunk;
        return JSON.parse(value);
      },
      (response, status, value) => {
        response.writeHead(status, { "Content-Type": "application/json" });
        response.end(JSON.stringify(value));
      },
    ),
  );
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://127.0.0.1:${server.address().port}/local-studio`;
    const post = async (route, value) =>
      fetch(base + route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
    for (const language of interfaceLanguages) {
      const conversation = await (
        await post("/api/conversations", { title: language })
      ).json();
      const response = await post("/api/chat", {
        conversation_id: conversation.id,
        content: "Test",
        model: "local-chat-fast",
        language,
      });
      assert.equal(response.status, 202, language);
      const job = await response.json();
      for (let attempt = 0; attempt < 50; attempt++) {
        const state = await (await fetch(base + "/v1/jobs/" + job.id)).json();
        assert.notEqual(state.status, "failed");
        if (state.status === "completed") break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }
    assert.deepEqual(received, interfaceLanguages);
    const conversation = await (
      await post("/api/conversations", { title: "Invalid" })
    ).json();
    assert.equal(
      (
        await post("/api/chat", {
          conversation_id: conversation.id,
          content: "Test",
          model: "local-chat-fast",
          language: "xx",
        })
      ).status,
      400,
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    studio.close();
    await rm(root, { recursive: true, force: true });
  }
});
