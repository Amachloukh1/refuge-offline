import { Icon, Button, Progress } from "./components";
import refugeCamp from "../server/assets/refuge-camp.jpg";
export function Dashboard({
  t,
  navigate,
  water,
  people,
  foodCount,
  checked,
  onAid,
  shopping,
  bought,
  toggleBought,
}) {
  return (
    <>
      <section className="overview-grid">
        <div className="welcome-panel">
          <div className="welcome-copy">
            <span className="welcome-eyebrow">{t.tagline}</span>
            <h2>
              {t.heroTitle.split("\n").map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </h2>
            <p>{t.heroText}</p>
            <div className="welcome-actions">
              <Button icon="BookOpen" onClick={() => navigate("library")}>
                {t.explore}
              </Button>
              <Button
                icon="MessageCircle"
                variant="outline"
                onClick={() => navigate("assistant")}
              >
                {t.talk}
              </Button>
            </div>
          </div>
          <figure className="refuge-camp">
            <img
              src={refugeCamp}
              width="1536"
              height="1024"
              alt={t.campAlt}
              fetchPriority="high"
            />
            <figcaption>{t.campCaption}</figcaption>
          </figure>
        </div>
        <section className="panel aid-panel">
          <div className="section-title">
            <span className="aid-icon">
              <Icon name="Cross" size={26} />
            </span>
            <div>
              <h2>{t.firstaid}</h2>
              <p>{t.firstaidSub}</p>
            </div>
          </div>
          <div className="aid-rows">
            {[
              ["bleeding", "Droplets"],
              ["burn", "Flame"],
              ["unconscious", "UserRound"],
            ].map(([key, icon]) => (
              <button
                key={key}
                className={`aid-row ${key}`}
                onClick={() => onAid(key)}
              >
                <Icon name={icon} />
                <span>{t[key]}</span>
                <Icon name="ChevronRight" size={17} />
              </button>
            ))}
          </div>
          <Button variant="outline wide" onClick={() => navigate("health")}>
            {t.openFirstaid}
            <Icon name="ChevronRight" size={16} />
          </Button>
        </section>
        <section className="panel autonomy-panel">
          <h2>{t.autonomy}</h2>
          <p className="subline">
            <Icon name="Users" size={19} />
            {t.household} · {people} {t.persons}
          </p>
          <div className="resources">
            <div className="resource">
              <Icon name="Droplets" size={33} />
              <div>
                <h3>{t.water}</h3>
                <strong>{water.stock} L</strong>
                <p>
                  / {t.target} {water.target} L
                </p>
              </div>
              <Progress value={water.percent} />
            </div>
            <div className="resource">
              <Icon name="Utensils" size={33} />
              <div>
                <h3>{t.food}</h3>
                <strong>
                  {foodCount} {t.products}
                </strong>
                <p>{t.foodPlanPending}</p>
              </div>
              <span className="food-planning-note">{t.stock}</span>
            </div>
            <div className="resource">
              <Icon name="ClipboardCheck" size={33} />
              <div>
                <h3>{t.preparation}</h3>
                <strong>{checked.length} / 8</strong>
                <p>{t.stepsDone}</p>
              </div>
              <Progress value={(checked.length / 8) * 100} />
            </div>
          </div>
          <span className="micro-note">{t.demoDetail}</span>
        </section>
        <section className="panel shopping-panel">
          <div className="section-title">
            <Icon name="ShoppingCart" size={31} />
            <div>
              <h2>{t.shopping}</h2>
              <p>{t.shoppingSub}</p>
            </div>
          </div>
          <div className="shopping-rows">
            {shopping.map((item) => (
              <label
                className={bought.includes(item.id) ? "checked" : ""}
                key={item.id}
              >
                <input
                  type="checkbox"
                  checked={bought.includes(item.id)}
                  onChange={() => toggleBought(item.id)}
                />
                <span>{item.label}</span>
                <Icon name="ChevronRight" size={16} />
              </label>
            ))}
          </div>
          <Button
            variant="outline wide"
            onClick={() => navigate("inventory", "shopping")}
          >
            {t.shoppingList}
            <Icon name="ChevronRight" size={16} />
          </Button>
        </section>
      </section>
      <section className="quick-section">
        <h2>{t.quick}</h2>
        <div className="quick-grid">
          {[
            ["library", "BookOpen", t.library, t.libraryText],
            ["maps", "Map", t.offlineMaps, t.mapsText],
            ["prepare", "Users", t.family, t.familyText],
          ].map(([page, icon, title, text]) => (
            <button
              className="quick-card"
              key={page}
              onClick={() =>
                navigate(page, page === "prepare" ? "family" : null)
              }
            >
              <Icon name={icon} size={43} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <Icon name="ChevronRight" size={18} />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
