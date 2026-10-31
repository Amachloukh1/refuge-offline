import { useState } from "react";
import { Icon, Button, Progress, Notice, Modal, External } from "./components";
import { validStock } from "./planning";
import { PurchasePlan } from "./PurchasePlan";
import {
  calendarDay,
  dateStatus,
  rotationItems,
  consumeStock,
} from "./stock-rotation";
import { stockText } from "./stock-text";
import { MealPlanner } from "./MealPlanner";
const categories = ["water", "food", "equipment", "health"];
export const categoryLabel = (category, t) =>
  t[category === "health" ? "healthCategory" : category];
export const stockName = (item, t) =>
  item.key ? t[item.key] || item.name || item.key : item.name;
export function Inventory({
  t,
  lang,
  stock,
  setStock,
  people,
  setPeople,
  days,
  setDays,
  water,
  shopping,
  bought,
  toggleBought,
  initialTab,
  meals = [],
  setMeals,
}) {
  const [tab, setTab] = useState(
    ["shopping", "plan"].includes(initialTab) ? initialTab : "stock",
  );
  const [category, setCategory] = useState("all");
  const s = stockText(lang);
  const [attention, setAttention] = useState(false);
  const [consuming, setConsuming] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  function save(e) {
    e.preventDefault();
    if (!editing.id && stock.length >= 2000) {
      setError(t.invalid);
      return;
    }
    const f = new FormData(e.currentTarget);
    const item = {
      ...editing,
      id: editing.id || crypto.randomUUID(),
      name: String(f.get("name")).trim(),
      quantity: Number(f.get("quantity")),
      unit: f.get("unit"),
      category: f.get("category"),
      date: f.get("date"),
      dateType: f.get("dateType"),
      location: String(f.get("location") || "").trim(),
    };
    // Keep translated seed names until the user actually changes the label.
    if (editing.key && item.name !== stockName(editing, t)) delete item.key;
    if (
      !validStock(item) ||
      (item.date && calendarDay(item.date) === null) ||
      item.location.length > 100 ||
      !["check", "best-before", "use-by"].includes(item.dateType)
    ) {
      setError(t.invalid);
      return;
    }
    setStock((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item],
    );
    setEditing(null);
    setError("");
  }
  function consume(e) {
    e.preventDefault();
    const amount = Number(new FormData(e.currentTarget).get("amount"));
    if (!consumeStock(stock, consuming.id, amount)) {
      setError(s.invalidAmount);
      return;
    }
    setStock((prev) => consumeStock(prev, consuming.id, amount) || prev);
    setConsuming(null);
    setMessage(s.consumed);
    setError("");
  }
  return (
    <>
      <div className="household-controls panel">
        <label>
          {t.people}
          <input
            type="number"
            min="1"
            max="50"
            value={people}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= 1 && n <= 50) setPeople(n);
            }}
          />
        </label>
        <label>
          {t.duration}
          <input
            type="number"
            min="1"
            max="365"
            value={days}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isInteger(n) && n >= 1 && n <= 365) setDays(n);
            }}
          />
        </label>
        <div className="water-calculation">
          <Icon name="Droplets" size={32} />
          <div>
            <strong>
              {Number(water.days.toFixed(1))} {t.days}
            </strong>
            <span>{t.covered}</span>
          </div>
          <div>
            <strong>{water.missing} L</strong>
            <span>{t.missing}</span>
          </div>
        </div>
      </div>
      <Notice icon="Droplets">
        {t.waterNote}{" "}
        <External href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Bevorraten/bevorraten_node.html">
          BBK
        </External>
      </Notice>
      <div className="section-toolbar">
        <div className="tabs">
          <button
            className={tab === "stock" ? "active" : ""}
            onClick={() => setTab("stock")}
          >
            {t.stock}
            <span>{stock.length}</span>
          </button>
          <button
            className={tab === "shopping" ? "active" : ""}
            onClick={() => setTab("shopping")}
          >
            {t.purchases}
          </button>
          <button
            className={tab === "plan" ? "active" : ""}
            onClick={() => setTab("plan")}
          >
            {t.purchasePlan}
          </button>
          <button
            className={tab === "meals" ? "active" : ""}
            onClick={() => setTab("meals")}
          >
            {s.meals}
          </button>
        </div>
        <Button
          icon="Plus"
          onClick={() => {
            setEditing({});
            setError("");
          }}
        >
          {t.add}
        </Button>
      </div>
      {message && <p role="status">{message}</p>}
      {tab === "meals" ? (
        <MealPlanner
          t={t}
          lang={lang}
          stock={stock}
          meals={meals}
          setMeals={setMeals}
        />
      ) : tab === "plan" ? (
        <PurchasePlan
          t={t}
          lang={lang}
          water={water}
          bought={bought}
          toggleBought={toggleBought}
        />
      ) : tab === "stock" ? (
        <>
          <section className="panel stock-rotation" aria-label={s.rotation}>
            <h3>{s.rotation}</h3>
            <p className="muted">{s.rotationNote}</p>
            <label>
              <input
                type="checkbox"
                checked={attention}
                onChange={(e) => setAttention(e.target.checked)}
              />{" "}
              {s.attention}
            </label>
            <ul className="rotation-list">
              {rotationItems(stock)
                .filter(
                  (item) => category === "all" || item.category === category,
                )
                .filter(
                  (item) =>
                    !attention ||
                    ["overdue", "today", "soon"].includes(dateStatus(item)),
                )
                .map((item) => (
                  <li key={item.id}>
                    <strong>{stockName(item, t)}</strong> ·{" "}
                    {s[item.dateType || "check"]} ·{" "}
                    <bdi>{item.date || s.none}</bdi> · {s[dateStatus(item)]}
                    {item.location && (
                      <span className="stock-meta"> · {item.location}</span>
                    )}
                    {item.dateType === "use-by" &&
                      dateStatus(item) === "overdue" && (
                        <p className="error-text">{s.useByWarning}</p>
                      )}
                  </li>
                ))}
            </ul>
            {!rotationItems(stock).some(
              (item) =>
                (category === "all" || item.category === category) &&
                (!attention ||
                  ["overdue", "today", "soon"].includes(dateStatus(item))),
            ) && <p className="muted">{s.emptyRotation}</p>}
          </section>
          <div className="filter-row">
            {["all", ...categories].map((c) => (
              <button
                className={`filter ${c === category ? "active" : ""}`}
                key={c}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? t.all : categoryLabel(c, t)}
              </button>
            ))}
          </div>
          <div className="panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.product}</th>
                  <th>{t.category}</th>
                  <th>{t.quantity}</th>
                  <th>{s.dateType}</th>
                  <th>
                    <span className="sr-only">{t.edit}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stock
                  .filter((i) => category === "all" || i.category === category)
                  .map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className={`mini-topic ${item.category}`}>
                          <Icon
                            name={
                              item.category === "water"
                                ? "Droplets"
                                : item.category === "food"
                                  ? "Utensils"
                                  : item.category === "health"
                                    ? "Cross"
                                    : "Package"
                            }
                            size={19}
                          />
                        </span>
                        <strong>{stockName(item, t)}</strong>
                      </td>
                      <td>{categoryLabel(item.category, t)}</td>
                      <td>
                        {item.quantity}{" "}
                        {item.unit === "unit" ? t.unitLabel : item.unit}
                        {Array.isArray(item.consumptions) &&
                          item.consumptions.length > 0 && (
                            <details className="consumption-log">
                              <summary>{s.recent}</summary>
                              <ul>
                                {item.consumptions
                                  .slice(0, 10)
                                  .map((entry, index) => (
                                    <li key={index}>
                                      {entry.amount}{" "}
                                      {item.unit === "unit"
                                        ? t.unitLabel
                                        : item.unit}{" "}
                                      ·{" "}
                                      {new Date(entry.at).toLocaleString(lang)}
                                    </li>
                                  ))}
                              </ul>
                            </details>
                          )}
                      </td>
                      <td>
                        <span>
                          {s[item.dateType || "check"]} ·{" "}
                          <bdi>{item.date || t.noDate}</bdi>
                        </span>
                        <small className="stock-meta">
                          {s[dateStatus(item)]}
                          {item.location ? ` · ${item.location}` : ""}
                        </small>
                        {item.dateType === "use-by" &&
                          dateStatus(item) === "overdue" && (
                            <small className="error-text">
                              {s.useByWarning}
                            </small>
                          )}
                      </td>
                      <td className="table-actions">
                        <button
                          className="icon-button"
                          disabled={
                            item.quantity <= 0 ||
                            (item.dateType === "use-by" &&
                              dateStatus(item) === "overdue")
                          }
                          aria-label={`${s.consume} ${stockName(item, t)}`}
                          title={s.consume}
                          onClick={() => {
                            setConsuming(item);
                            setError("");
                          }}
                        >
                          <Icon name="Check" size={18} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${t.edit} ${stockName(item, t)}`}
                          onClick={() => {
                            setEditing({ ...item, name: stockName(item, t) });
                            setError("");
                          }}
                        >
                          <Icon name="Pencil" size={18} />
                        </button>
                        <button
                          className="icon-button danger"
                          aria-label={`${t.remove} ${stockName(item, t)}`}
                          onClick={() => {
                            if (window.confirm(t.confirmRemove))
                              setStock((prev) =>
                                prev.filter((i) => i.id !== item.id),
                              );
                          }}
                        >
                          <Icon name="Trash2" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!stock.some(
              (i) => category === "all" || i.category === category,
            ) && <p className="empty-message">{t.emptyStock}</p>}
          </div>
        </>
      ) : (
        <div className="panel shopping-full">
          {shopping.map((item) => (
            <label
              key={item.id}
              className={`shopping-entry ${bought.includes(item.id) ? "checked" : ""}`}
            >
              <input
                type="checkbox"
                checked={bought.includes(item.id)}
                onChange={() => toggleBought(item.id)}
              />
              <span>
                <strong>{item.label}</strong>
                <small>
                  {item.id === "water"
                    ? `${water.missing} L · ${t.missing}`
                    : t.equipmentText}
                </small>
              </span>
              {bought.includes(item.id) && (
                <span className="tag">{t.purchased}</span>
              )}
            </label>
          ))}
          {water.missing === 0 && <Notice icon="Check">{t.enough}</Notice>}
        </div>
      )}
      <p className="muted bottom-note">{t.demoDetail}</p>
      {editing && (
        <Modal
          t={t}
          title={editing.id ? t.editTitle : t.addTitle}
          onClose={() => setEditing(null)}
        >
          <form onSubmit={save} className="form-stack">
            <label>
              {t.product}
              <input
                name="name"
                required
                maxLength="100"
                defaultValue={editing.name || ""}
                autoFocus
              />
            </label>
            <div className="form-row">
              <label>
                {t.quantity}
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  max="1000000"
                  step="any"
                  required
                  defaultValue={editing.quantity ?? 1}
                />
              </label>
              <label>
                {t.unit}
                <select name="unit" defaultValue={editing.unit || "unit"}>
                  <option value="unit">{t.unitLabel}</option>
                  <option value="L">L</option>
                  <option value="kg">kg</option>
                </select>
              </label>
            </div>
            <label>
              {t.category}
              <select
                name="category"
                defaultValue={editing.category || "equipment"}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c, t)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {s.location}
              <input
                name="location"
                maxLength="100"
                defaultValue={editing.location || ""}
              />
            </label>
            <label>
              {s.dateType}
              <select
                name="dateType"
                defaultValue={editing.dateType || "check"}
              >
                {["check", "best-before", "use-by"].map((type) => (
                  <option key={type} value={type}>
                    {s[type]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {s.date}
              <input
                name="date"
                type="date"
                defaultValue={editing.date || ""}
              />
            </label>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                {t.cancel}
              </Button>
              <Button type="submit" icon="Check">
                {t.save}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {consuming && (
        <Modal
          t={t}
          title={`${s.consume} — ${stockName(consuming, t)}`}
          onClose={() => setConsuming(null)}
        >
          <form className="form-stack" onSubmit={consume}>
            <p>
              {t.quantity}:{" "}
              {stock.find((item) => item.id === consuming.id)?.quantity ?? 0}{" "}
              {consuming.unit === "unit" ? t.unitLabel : consuming.unit}
            </p>
            <label>
              {s.amount}
              <input
                name="amount"
                type="number"
                min="0.000001"
                max={
                  stock.find((item) => item.id === consuming.id)?.quantity ?? 0
                }
                step="any"
                required
                autoFocus
              />
            </label>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConsuming(null)}
              >
                {t.cancel}
              </Button>
              <Button type="submit">{t.save}</Button>
            </div>
          </form>
          {Array.isArray(consuming.consumptions) &&
            consuming.consumptions.length > 0 && (
              <div className="consumption-log">
                <h4>{s.recent}</h4>
                <ul>
                  {consuming.consumptions.slice(0, 10).map((entry, index) => (
                    <li key={index}>
                      {entry.amount}{" "}
                      {consuming.unit === "unit" ? t.unitLabel : consuming.unit}{" "}
                      · {new Date(entry.at).toLocaleString(lang)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </Modal>
      )}
    </>
  );
}
