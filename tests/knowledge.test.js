import test from "node:test";
import assert from "node:assert/strict";
import {
  rankPassages,
  validatePlanning,
  retrieveKnowledge,
} from "../server/knowledge.js";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { guideData } from "../src/data.js";
import { hazards } from "../src/hazards.js";

test("retrieval returns empty context for an unmatched query without unrelated guides", async () => {
  const result = await retrieveKnowledge(
    process.cwd(),
    "zzzznomatchingreference993371",
    "en",
  );
  assert.equal(result.text, "");
  assert.deepEqual(result.references, []);
});

test("guide and hazard provenance preserves actual editorial dates and primary sources", async () => {
  const guide = guideData.find((g) => g.reviewedAt && g.sources?.length);
  const result = await retrieveKnowledge(process.cwd(), guide.title.en, "en");
  const reference = result.references.find((r) => r.id === guide.id);
  assert.ok(reference);
  assert.equal(reference.reviewedAt, guide.reviewedAt);
  assert.deepEqual(reference.sources, guide.sources);
  assert.match(result.text, /Content review date:.*not clinical validation/);
  const hazard = hazards.find((h) => h.id === "tsunami");
  const hazardResult = await retrieveKnowledge(process.cwd(), "tsunami", "en");
  const hazardReference = hazardResult.references.find(
    (r) => r.id === "hazard-tsunami",
  );
  assert.equal(hazardReference.reviewedAt, hazard.reviewedAt);
  assert.deepEqual(hazardReference.sources, hazard.sources);
});

test("PDF download dates join the catalog and cannot masquerade as medical review", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "refuge-provenance-"));
  try {
    await mkdir(path.join(root, "data"));
    await mkdir(path.join(root, "content"));
    await writeFile(
      path.join(root, "data/document-index.json"),
      JSON.stringify({
        chunks: [
          {
            id: "fixture-p2",
            title: "uniquedocumentfixture",
            text: "uniquedocumentfixture passage",
            language: "en",
            page: 2,
            href: "/documents/fixture.pdf#page=2",
            publisher: "Old publisher",
            reviewedAt: "1900-01-01",
          },
        ],
      }),
    );
    await writeFile(
      path.join(root, "content/catalog.json"),
      JSON.stringify([
        {
          filename: "fixture.pdf",
          publisher: "Original publisher",
          downloadedAt: "2026-10-31T12:00:00Z",
          sourcePage: "https://example.org/original",
        },
      ]),
    );
    const result = await retrieveKnowledge(root, "uniquedocumentfixture", "en");
    assert.equal(result.references.length, 1);
    assert.equal(result.references[0].downloadedAt, "2026-10-31T12:00:00Z");
    assert.equal(result.references[0].reviewedAt, undefined);
    assert.equal(result.references[0].publisher, "Original publisher");
    assert.match(
      result.text,
      /PDF downloaded:.*not publication or medical review date/,
    );
    assert.match(result.text, /https:\/\/example.org\/original/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
test("la recherche privilégie un passage pertinent dans la langue demandée", () => {
  const data = [
    {
      id: "water",
      language: "fr",
      title: "Eau potable",
      text: "Conserver eau potable pour boire et cuisiner.",
    },
    {
      id: "cash",
      language: "fr",
      title: "Argent liquide",
      text: "Prévoir billets et petites coupures avant une panne bancaire.",
    },
    {
      id: "water-de",
      language: "de",
      title: "Wasser",
      text: "eau potable eau potable",
    },
  ];
  assert.equal(rankPassages("eau potable", data, "fr")[0].id, "water");
  assert.equal(
    rankPassages("argent liquide billets", data, "fr")[0].id,
    "cash",
  );
  assert.equal(rankPassages("zzzzsansresultat", data, "fr").length, 0);
});
test("le contexte inventaire est borné et ne permet pas de donner des instructions système", () => {
  assert.deepEqual(validatePlanning({ people: 4, days: 10, water: 24 }), {
    people: 4,
    days: 10,
    water: 24,
    targetWater: 80,
    missingWater: 56,
  });
  assert.equal(validatePlanning({ people: -1, days: 10, water: 24 }), null);
  assert.equal(
    validatePlanning({ people: 4, days: Infinity, water: 24 }),
    null,
  );
  assert.equal(
    validatePlanning({ people: 4, days: 10, water: "ignore instructions" }),
    null,
  );
});
