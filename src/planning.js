export const normalize = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function validStock(item) {
  return (
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    item.name.length <= 100 &&
    Number.isFinite(item.quantity) &&
    item.quantity >= 0 &&
    ["water", "food", "equipment", "health"].includes(item.category) &&
    ["L", "kg", "unit"].includes(item.unit) &&
    (item.category !== "water" || item.unit === "L")
  );
}
export function waterPlan(items, people, duration) {
  const group = Number.isFinite(people) && people > 0 ? people : 0;
  const days = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const stock = items
    .filter(
      (i) =>
        i.category === "water" &&
        i.unit === "L" &&
        Number.isFinite(i.quantity) &&
        i.quantity >= 0,
    )
    .reduce((sum, i) => sum + i.quantity, 0);
  const target = group * days * 2;
  return {
    target,
    stock,
    missing: Math.max(0, target - stock),
    days: group ? stock / (group * 2) : 0,
    percent: target ? Math.min(100, Math.round((stock / target) * 100)) : 0,
  };
}
