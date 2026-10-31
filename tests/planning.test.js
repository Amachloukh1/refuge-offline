import test from "node:test";
import assert from "node:assert/strict";
import { waterPlan, validStock, normalize } from "../src/planning.js";

test("planning eau : 4 adultes, 10 jours, 24 L disponibles, sans compter les autres unités", () => {
  assert.deepEqual(
    waterPlan(
      [
        { category: "water", quantity: 24, unit: "L" },
        { category: "water", quantity: 100, unit: "kg" },
      ],
      4,
      10,
    ),
    { target: 80, stock: 24, missing: 56, days: 3, percent: 30 },
  );
});
test("un stock supérieur à la cible ne génère pas un achat négatif", () => {
  assert.equal(
    waterPlan([{ category: "water", quantity: 90, unit: "L" }], 4, 10).missing,
    0,
  );
  assert.equal(waterPlan([], 0, 0).days, 0);
});
test("les réserves rejettent quantités négatives, infinies et désignations vides", () => {
  assert.equal(
    validStock({ name: "Eau", quantity: 3, unit: "L", category: "water" }),
    true,
  );
  for (const quantity of [-1, Infinity, NaN])
    assert.equal(
      validStock({ name: "Eau", quantity, unit: "L", category: "water" }),
      false,
    );
  assert.equal(
    validStock({ name: " ", quantity: 3, unit: "L", category: "water" }),
    false,
  );
  assert.equal(
    validStock({ name: "Eau", quantity: 3, unit: "kg", category: "water" }),
    false,
  );
});
test("la recherche ignore accents et casse", () =>
  assert.equal(normalize("RéSERVES"), "reserves"));
