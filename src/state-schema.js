import { translations } from "./i18n.js";
import { checklistIds, guideData } from "./data.js";
import { sanitizeEnergy, sanitizeReadiness } from "./preparedness.js";
const text = (v, max) => typeof v === "string" && v.length <= max;
const num = (v, min, max) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const date = (v) =>
  v === "" ||
  (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
    new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v);
const ids = (v, max = 1000) =>
  Array.isArray(v) && v.length <= max && v.every((x) => text(x, 120));
export function validateState(value) {
  if (
    !value ||
    value.version !== 1 ||
    !translations[value.lang] ||
    !Number.isInteger(value.people) ||
    !num(value.people, 1, 50) ||
    !Number.isInteger(value.days) ||
    !num(value.days, 1, 365)
  )
    throw Error("invalid_backup");
  if (
    !Array.isArray(value.stock) ||
    value.stock.length > 2000 ||
    !ids(value.checked) ||
    !ids(value.favorites) ||
    !ids(value.bought)
  )
    throw Error("invalid_backup");
  const unique = new Set();
  const stock = value.stock.map((p) => {
    if (
      !p ||
      !text(p.id, 100) ||
      !p.id ||
      unique.has(p.id) ||
      !text(p.name, 100) ||
      !num(p.quantity, 0, 1e6) ||
      !["water", "food", "equipment", "health"].includes(p.category) ||
      !["L", "kg", "unit"].includes(p.unit) ||
      !text(p.date ?? "", 10) ||
      !date(p.date || "") ||
      (p.key && !text(translations.fr[p.key], 1000))
    )
      throw Error("invalid_backup");
    unique.add(p.id);
    if (
      (p.location !== undefined && !text(p.location, 100)) ||
      (p.dateType !== undefined &&
        !["check", "best-before", "use-by"].includes(p.dateType))
    )
      throw Error("invalid_backup");
    const consumptions = p.consumptions ?? [];
    if (
      !Array.isArray(consumptions) ||
      consumptions.length > 10 ||
      consumptions.some(
        (x) =>
          !num(x.amount, Number.MIN_VALUE, 1e6) ||
          !text(x.at, 40) ||
          !Number.isFinite(Date.parse(x.at)),
      )
    )
      throw Error("invalid_backup");
    return {
      id: p.id,
      name: p.name,
      ...(p.key ? { key: p.key } : {}),
      quantity: p.quantity,
      unit: p.unit,
      category: p.category,
      date: p.date || "",
      location: p.location || "",
      dateType: p.dateType || "check",
      consumptions: consumptions.map((x) => ({ amount: x.amount, at: x.at })),
    };
  });
  const family = value.family || {};
  if (
    ["meeting", "contact", "instructions"].some(
      (k) => !text(family[k] ?? "", 5000),
    )
  )
    throw Error("invalid_backup");
  const places = value.places ?? [];
  if (
    !Array.isArray(places) ||
    places.length > 100 ||
    places.some(
      (p) =>
        !p ||
        !text(p.id, 100) ||
        !p.id ||
        !text(p.name, 100) ||
        !p.name.trim() ||
        !num(p.latitude, -90, 90) ||
        !num(p.longitude, -180, 180) ||
        !text(p.notes, 2000),
    ) ||
    new Set(places.map((p) => p.id)).size !== places.length
  )
    throw Error("invalid_backup");
  const meals = value.meals ?? [];
  if (
    !Array.isArray(meals) ||
    meals.length > 30 ||
    meals.some(
      (m) =>
        !m ||
        !text(m.id, 100) ||
        !m.id ||
        !text(m.name, 100) ||
        !m.name.trim() ||
        !Array.isArray(m.ingredients) ||
        !m.ingredients.length ||
        m.ingredients.length > 10 ||
        m.ingredients.some(
          (x) => !text(x.id, 100) || !num(x.amount, Number.MIN_VALUE, 1e6),
        ),
    )
  )
    throw Error("invalid_backup");
  return {
    version: 1,
    lang: value.lang,
    people: value.people,
    days: value.days,
    stock,
    checked: [
      ...new Set(value.checked.filter((k) => checklistIds.includes(k))),
    ],
    favorites: [
      ...new Set(
        value.favorites.filter((k) => guideData.some((g) => g.id === k)),
      ),
    ],
    bought: [...new Set(value.bought)],
    family: Object.fromEntries(
      ["meeting", "contact", "instructions"].map((k) => [k, family[k] || ""]),
    ),
    readiness: sanitizeReadiness(value.readiness),
    energy: sanitizeEnergy(value.energy),
    places: places.map(({ id, name, latitude, longitude, notes }) => ({
      id,
      name,
      latitude,
      longitude,
      notes,
    })),
    meals: meals.map(({ id, name, ingredients }) => ({
      id,
      name,
      ingredients: ingredients.map(({ id, amount }) => ({ id, amount })),
    })),
  };
}
