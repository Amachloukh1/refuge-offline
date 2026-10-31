import { test } from "node:test";
import assert from "node:assert/strict";
import { validateState } from "../src/state-schema.js";
const fixture = () => ({
  version: 1,
  lang: "fr",
  people: 2,
  days: 3,
  stock: [
    {
      id: "water",
      name: "Eau",
      quantity: 12,
      unit: "L",
      category: "water",
      date: "2026-12-01",
      location: "Garage",
      dateType: "check",
      consumptions: [],
    },
  ],
  checked: [],
  favorites: [],
  bought: [],
  family: { meeting: "Entrée", contact: "", instructions: "" },
  places: [
    {
      id: "p1",
      name: "Maison",
      latitude: 51,
      longitude: 13,
      notes: "Point de rencontre",
    },
  ],
  meals: [],
});
test("restauration conserve lieux, données de rotation et ignore champs étrangers", () => {
  const v = fixture();
  v.secret = "notallowed";
  const result = validateState(v);
  assert.equal(result.stock[0].location, "Garage");
  assert.equal(result.places[0].name, "Maison");
  assert.equal(result.secret, undefined);
  assert.deepEqual(validateState(result), result);
});
test("import refuse stock corrompu, dates impossibles et coordonnées hors limites", () => {
  for (const mutate of [
    (v) => (v.stock[0].quantity = -1),
    (v) => (v.stock[0].date = "2026-02-30"),
    (v) => (v.places[0].latitude = 100),
    (v) => v.stock.push(v.stock[0]),
    (v) =>
      (v.meals = [
        { id: "m", name: "Repas", ingredients: [{ id: "water", amount: -2 }] },
      ]),
  ]) {
    const v = fixture();
    mutate(v);
    assert.throws(() => validateState(v));
  }
});
