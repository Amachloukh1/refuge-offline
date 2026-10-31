// Parse calendar dates without UTC conversion or DST-dependent elapsed hours.
export function calendarDay(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1) return null;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return date.getTime() / 86400000;
}

export function dateStatus(item, today = new Date()) {
  const day = calendarDay(item.date);
  if (day === null) return "none";
  const local = calendarDay(
    `${String(today.getFullYear()).padStart(4, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  );
  const difference = day - local;
  return difference < 0
    ? "overdue"
    : difference === 0
      ? "today"
      : difference <= 7
        ? "soon"
        : "later";
}

export function rotationItems(items) {
  return items
    .filter((item) => Number.isFinite(item.quantity) && item.quantity > 0)
    .slice()
    .sort(
      (a, b) =>
        (calendarDay(a.date) ?? Infinity) - (calendarDay(b.date) ?? Infinity),
    );
}

export function consumeStock(items, id, amount, now = new Date()) {
  const item = items.find((entry) => entry.id === id);
  if (
    !item ||
    !Number.isFinite(item.quantity) ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > item.quantity
  )
    return null;
  const quantity = Number((item.quantity - amount).toPrecision(12));
  return items.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          quantity,
          consumptions: [
            { amount, at: now.toISOString() },
            ...(Array.isArray(entry.consumptions) ? entry.consumptions : []),
          ].slice(0, 10),
        }
      : entry,
  );
}

export function validateMeal(stock, ingredients, today = new Date()) {
  if (!Array.isArray(ingredients) || !ingredients.length) return false;
  const totals = new Map();
  for (const line of ingredients) {
    if (!Number.isFinite(line.amount) || line.amount <= 0) return false;
    totals.set(line.id, (totals.get(line.id) || 0) + line.amount);
  }
  return [...totals].every(([id, amount]) => {
    const item = stock.find((entry) => entry.id === id);
    return (
      item &&
      item.category === "food" &&
      Number.isFinite(item.quantity) &&
      amount <= item.quantity &&
      !(item.dateType === "use-by" && dateStatus(item, today) === "overdue")
    );
  });
}
