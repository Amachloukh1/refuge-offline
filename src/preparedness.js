export const defaultReadiness = Object.freeze({
  waterConfirmed: false,
  food: false,
  personalMeds: false,
  energy: false,
  documents: false,
  evacBag: false,
});
export const defaultEnergy = Object.freeze({
  computerWatts: 60,
  monitorWatts: 25,
  otherWatts: 10,
  capacityWh: 500,
  reservePercent: 20,
  hoursPerDay: 4,
  pricePerKWh: 0.35,
  chargeEfficiency: 85,
  measurementConfirmed: false,
  ecoMode: false,
});
export function sanitizeReadiness(value = {}) {
  return Object.fromEntries(
    Object.keys(defaultReadiness).map((key) => [key, value?.[key] === true]),
  );
}
const bounds = {
  computerWatts: [0, 10000],
  monitorWatts: [0, 10000],
  otherWatts: [0, 100000],
  capacityWh: [0, 1000000],
  reservePercent: [0, 100],
  hoursPerDay: [0, 24],
  pricePerKWh: [0, 100],
  chargeEfficiency: [1, 100],
};
export function sanitizeEnergy(value = {}) {
  return Object.fromEntries(
    Object.entries(defaultEnergy).map(([key, fallback]) => {
      if (typeof fallback === "boolean") return [key, value?.[key] === true];
      const raw = value?.[key];
      const n =
        typeof raw === "number" ||
        (typeof raw === "string" && raw.trim() !== "")
          ? Number(raw)
          : NaN;
      return [
        key,
        Number.isFinite(n)
          ? Math.min(bounds[key][1], Math.max(bounds[key][0], n))
          : fallback,
      ];
    }),
  );
}
export function energyPlan(value) {
  const e = sanitizeEnergy(value);
  const totalWatts = e.computerWatts + e.monitorWatts + e.otherWatts;
  const usableWh = e.capacityWh * (1 - e.reservePercent / 100);
  const hours = totalWatts > 0 ? usableWh / totalWatts : null;
  return {
    totalWatts,
    usableWh,
    hours,
    days: hours !== null && e.hoursPerDay > 0 ? hours / e.hoursPerDay : null,
    chargeCost:
      (e.capacityWh / (e.chargeEfficiency / 100) / 1000) * e.pricePerKWh,
  };
}
export function readinessSummary(value, water) {
  const r = sanitizeReadiness(value);
  const waterReady =
    r.waterConfirmed &&
    Number.isFinite(water?.target) &&
    water.target > 0 &&
    Number.isFinite(water?.stock) &&
    water.stock >= water.target;
  const confirmed =
    Object.keys(r).filter((key) => key !== "waterConfirmed" && r[key]).length +
    Number(waterReady);
  return {
    waterReady,
    confirmed,
    total: 6,
    percent: Math.round((confirmed / 6) * 100),
  };
}
