import { useState } from "react";
import { createLocalId } from "./local-id.js";
import { Button, Notice } from "./components";
import { stockText } from "./stock-text";
import { dateStatus, validateMeal } from "./stock-rotation";

const label = (item, t) =>
  item.key ? t[item.key] || item.name || item.key : item.name;

export function MealPlanner({ t, lang, stock, meals = [], setMeals }) {
  const s = stockText(lang);
  const [name, setName] = useState("");
  const [id, setId] = useState(null);
  const [ingredients, setIngredients] = useState([{ id: "", amount: "" }]);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const food = stock.filter(
    (item) =>
      item.category === "food" &&
      item.quantity > 0 &&
      !(item.dateType === "use-by" && dateStatus(item) === "overdue"),
  );
  function update(index, change) {
    setIngredients((lines) =>
      lines.map((line, i) => (i === index ? { ...line, ...change } : line)),
    );
    setSaved(false);
  }
  function save(e) {
    e.preventDefault();
    const lines = ingredients.map((line) => ({
      id: line.id,
      amount: Number(line.amount),
    }));
    if (
      !name.trim() ||
      name.trim().length > 100 ||
      !validateMeal(stock, lines) ||
      (!id && meals.length >= 30) ||
      typeof setMeals !== "function"
    ) {
      setError(true);
      setSaved(false);
      return;
    }
    const meal = {
      id: id || createLocalId(),
      name: name.trim(),
      ingredients: lines,
    };
    setMeals((previous) =>
      previous.some((entry) => entry.id === meal.id)
        ? previous.map((entry) => (entry.id === meal.id ? meal : entry))
        : [...previous, meal],
    );
    setId(meal.id);
    setError(false);
    setSaved(true);
  }
  return (
    <section className="meal-planner">
      <Notice icon="Utensils">{s.mealNote}</Notice>
      <form className="panel form-stack" onSubmit={save}>
        <h3>{s.meals}</h3>
        <label>
          {s.mealName}
          <input
            required
            maxLength="100"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </label>
        <fieldset className="meal-ingredients">
          <legend>{s.ingredients}</legend>
          {!food.length && <p className="muted">{s.noFood}</p>}
          {ingredients.map((line, index) => {
            const item = stock.find((entry) => entry.id === line.id);
            return (
              <div className="form-row" key={index}>
                <label>
                  {t.product} {index + 1}
                  <select
                    value={line.id}
                    required
                    onChange={(e) =>
                      update(index, { id: e.target.value, amount: "" })
                    }
                  >
                    <option value="">{s.noIngredients}</option>
                    {line.id && !food.some((entry) => entry.id === line.id) && (
                      <option value={line.id} disabled>
                        {item ? label(item, t) : s.unavailable} —{" "}
                        {s.unavailable}
                      </option>
                    )}
                    {food.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {label(entry, t)} ({entry.quantity}{" "}
                        {entry.unit === "unit" ? t.unitLabel : entry.unit})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  {t.quantity}
                  {item
                    ? ` (${item.unit === "unit" ? t.unitLabel : item.unit})`
                    : ""}
                  <input
                    type="number"
                    required
                    min="0.000001"
                    step="any"
                    max={item?.quantity ?? 1000000}
                    value={line.amount}
                    onChange={(e) => update(index, { amount: e.target.value })}
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={ingredients.length === 1}
                  onClick={() => {
                    setIngredients((lines) =>
                      lines.filter((_, i) => i !== index),
                    );
                    setSaved(false);
                  }}
                >
                  {s.removeIngredient} {index + 1}
                </Button>
              </div>
            );
          })}
        </fieldset>
        <Button
          type="button"
          variant="outline"
          disabled={ingredients.length >= 10 || !food.length}
          onClick={() => {
            setIngredients((lines) => [...lines, { id: "", amount: "" }]);
            setSaved(false);
          }}
        >
          {s.addIngredient}
        </Button>
        {error && (
          <p className="error-text" role="alert">
            {s.mealInvalid}
          </p>
        )}
        {saved && <p role="status">{s.mealSaved}</p>}
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setId(null);
              setName("");
              setIngredients([{ id: "", amount: "" }]);
              setError(false);
              setSaved(false);
            }}
          >
            {t.add}
          </Button>
          <Button
            type="submit"
            disabled={!food.length || (!id && meals.length >= 30)}
          >
            {s.saveMeal}
          </Button>
        </div>
      </form>
      <section className="panel">
        <h3>
          {s.savedMeals} ({meals.length}/30)
        </h3>
        {!meals.length && <p className="muted">{s.noMeals}</p>}
        <ul className="rotation-list">
          {meals.map((meal) => (
            <li key={meal.id}>
              <strong>{meal.name}</strong>
              <ul>
                {meal.ingredients.map((line, index) => {
                  const item = stock.find((entry) => entry.id === line.id);
                  return (
                    <li key={index}>
                      {item ? label(item, t) : s.unavailable} · {line.amount}{" "}
                      {item
                        ? item.unit === "unit"
                          ? t.unitLabel
                          : item.unit
                        : ""}
                    </li>
                  );
                })}
              </ul>
              {!validateMeal(stock, meal.ingredients) && (
                <p className="error-text">{s.mealInvalid}</p>
              )}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setId(meal.id);
                    setName(meal.name);
                    setIngredients(
                      meal.ingredients.map((line) => ({ ...line })),
                    );
                    setError(false);
                    setSaved(false);
                  }}
                >
                  {s.loadMeal}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMeals?.((previous) =>
                      previous.filter((entry) => entry.id !== meal.id),
                    );
                    if (id === meal.id) {
                      setId(null);
                      setName("");
                      setIngredients([{ id: "", amount: "" }]);
                      setSaved(false);
                    }
                  }}
                >
                  {s.mealRemove}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
