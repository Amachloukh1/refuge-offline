import test from "node:test";
import assert from "node:assert/strict";
import { rankPassages, validatePlanning } from "../server/knowledge.js";
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
