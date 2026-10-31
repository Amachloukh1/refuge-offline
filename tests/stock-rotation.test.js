import test from "node:test";
import assert from "node:assert/strict";
import {
  dateStatus,
  rotationItems,
  consumeStock,
  validateMeal,
} from "../src/stock-rotation.js";

test("stock dates use local calendar days including DST and reject impossible dates", () => {
  const today = new Date(2026, 9, 25, 0, 30);
  assert.equal(dateStatus({ date: "2026-10-25" }, today), "today");
  assert.equal(dateStatus({ date: "2026-10-24" }, today), "overdue");
  assert.equal(dateStatus({ date: "2026-11-01" }, today), "soon");
  assert.equal(dateStatus({ date: "2026-11-02" }, today), "later");
  assert.equal(dateStatus({ date: "2026-02-30" }, today), "none");
});

test("rotation prioritizes dated positive stocks and leaves source order intact", () => {
  const items = [
    { id: "none", quantity: 1 },
    { id: "late", quantity: 1, date: "2027-01-01" },
    { id: "empty", quantity: 0, date: "2025-01-01" },
    { id: "first", quantity: 2, date: "2026-01-01" },
  ];
  assert.deepEqual(
    rotationItems(items).map((i) => i.id),
    ["first", "late", "none"],
  );
  assert.equal(items[0].id, "none");
});

test("consumption rejects zero, negative, nonfinite and excessive amounts without changing stock", () => {
  const items = [{ id: "a", quantity: 2, unit: "kg", key: "rice" }];
  for (const amount of [0, -1, NaN, Infinity, 2.01])
    assert.equal(consumeStock(items, "a", amount), null);
  assert.equal(consumeStock(items, "missing", 1), null);
  assert.equal(items[0].quantity, 2);
});

test("consumption preserves metadata, avoids decimal residue and limits recent history", () => {
  const items = [
    {
      id: "a",
      quantity: 0.3,
      key: "rice",
      location: "pantry",
      consumptions: Array.from({ length: 10 }, () => ({
        amount: 1,
        at: "2026-01-01T00:00:00.000Z",
      })),
    },
  ];
  const result = consumeStock(
    items,
    "a",
    0.1,
    new Date("2026-10-31T12:00:00Z"),
  );
  assert.equal(result[0].quantity, 0.2);
  assert.equal(result[0].key, "rice");
  assert.equal(result[0].location, "pantry");
  assert.equal(result[0].consumptions.length, 10);
  assert.equal(result[0].consumptions[0].amount, 0.1);
  assert.equal(consumeStock(result, "a", 0.2)[0].quantity, 0);
});

test("meal validates combined ingredient amounts, food categories and use-by dates", () => {
  const stock = [
    { id: "a", category: "food", quantity: 2 },
    { id: "b", category: "health", quantity: 5 },
    {
      id: "c",
      category: "food",
      quantity: 1,
      dateType: "use-by",
      date: "2026-10-30",
    },
  ];
  const today = new Date(2026, 9, 31);
  assert.equal(
    validateMeal(
      stock,
      [
        { id: "a", amount: 1 },
        { id: "a", amount: 1 },
      ],
      today,
    ),
    true,
  );
  for (const lines of [
    [],
    [{ id: "a", amount: 3 }],
    [
      { id: "a", amount: 1.5 },
      { id: "a", amount: 1 },
    ],
    [{ id: "b", amount: 1 }],
    [{ id: "missing", amount: 1 }],
    [{ id: "c", amount: 1 }],
    [{ id: "a", amount: 0 }],
  ])
    assert.equal(validateMeal(stock, lines, today), false);
});
