import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultReadiness,
  defaultEnergy,
  sanitizeReadiness,
  sanitizeEnergy,
  energyPlan,
  readinessSummary,
} from "../src/preparedness.js";

test("example water never counts as personally confirmed readiness", () => {
  assert.equal(
    readinessSummary(defaultReadiness, { stock: 100, target: 20 }).confirmed,
    0,
  );
  assert.equal(
    readinessSummary({ waterConfirmed: true }, { stock: 10, target: 20 })
      .waterReady,
    false,
  );
  assert.equal(
    readinessSummary({ waterConfirmed: true }, { stock: 20, target: 20 })
      .waterReady,
    true,
  );
  assert.equal(
    readinessSummary({ waterConfirmed: true }, { stock: 20, target: 0 })
      .waterReady,
    false,
  );
  assert.equal(
    readinessSummary({ waterConfirmed: true }, { stock: Infinity, target: 20 })
      .waterReady,
    false,
  );
});
test("only explicit booleans confirm household areas and unknown fields are removed", () => {
  const r = sanitizeReadiness({
    food: "true",
    energy: 1,
    documents: true,
    unexpected: true,
  });
  assert.equal(r.food, false);
  assert.equal(r.energy, false);
  assert.equal(r.documents, true);
  assert.equal("unexpected" in r, false);
  const complete = Object.fromEntries(
    Object.keys(defaultReadiness).map((key) => [key, true]),
  );
  assert.deepEqual(readinessSummary(complete, { stock: 20, target: 20 }), {
    waterReady: true,
    confirmed: 6,
    total: 6,
    percent: 100,
  });
});
test("energy calculation includes screen, reserves and planned daily hours", () => {
  const p = energyPlan({
    ...defaultEnergy,
    computerWatts: 60,
    monitorWatts: 30,
    otherWatts: 10,
    capacityWh: 1000,
    reservePercent: 20,
    hoursPerDay: 4,
    chargeEfficiency: 80,
    pricePerKWh: 0.4,
  });
  assert.deepEqual(p, {
    totalWatts: 100,
    usableWh: 800,
    hours: 8,
    days: 2,
    chargeCost: 0.5,
  });
});
test("zero load or zero daily use does not imply infinite autonomy", () => {
  assert.equal(
    energyPlan({ computerWatts: 0, monitorWatts: 0, otherWatts: 0 }).hours,
    null,
  );
  assert.equal(energyPlan({ hoursPerDay: 0 }).days, null);
  assert.equal(energyPlan({ reservePercent: 100 }).hours, 0);
  assert.equal(energyPlan({ capacityWh: 0 }).chargeCost, 0);
});
test("persistent numeric values clamp to finite physical bounds", () => {
  const e = sanitizeEnergy({
    computerWatts: -1,
    monitorWatts: Infinity,
    otherWatts: "42",
    capacityWh: 1e99,
    reservePercent: 150,
    hoursPerDay: 50,
    chargeEfficiency: 0,
    measurementConfirmed: "true",
    ecoMode: true,
  });
  assert.equal(e.computerWatts, 0);
  assert.equal(e.monitorWatts, defaultEnergy.monitorWatts);
  assert.equal(e.otherWatts, 42);
  assert.equal(e.capacityWh, 1000000);
  assert.equal(e.reservePercent, 100);
  assert.equal(e.hoursPerDay, 24);
  assert.equal(e.chargeEfficiency, 1);
  assert.equal(e.measurementConfirmed, false);
  assert.equal(e.ecoMode, true);
  assert.deepEqual(sanitizeEnergy(null), defaultEnergy);
});
