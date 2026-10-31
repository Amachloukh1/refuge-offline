import { useState } from "react";
import { Icon, Button, Notice, External } from "./components";
import { normalize } from "./planning";
import { hazards } from "./hazards.js";
export function Hazards({ t, lang, initialId }) {
  const [selected, setSelected] = useState(initialId || null);
  const [query, setQuery] = useState("");
  const active = hazards.find((h) => h.id === selected);
  function open(id) {
    setSelected(id);
    history.replaceState(null, "", `#hazards?view=${encodeURIComponent(id)}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  if (active) {
    const content = active[lang];
    return (
      <article className="hazard-detail">
        <div className="hazard-toolbar">
          <Button
            icon="ArrowRight"
            variant="outline back-button"
            onClick={() => {
              setSelected(null);
              history.replaceState(null, "", "#hazards");
            }}
          >
            {t.allHazards}
          </Button>
          <Button
            icon="Printer"
            variant="outline"
            onClick={() => window.print()}
          >
            {t.printSheet}
          </Button>
        </div>
        <section className={`hazard-detail-heading ${active.id}`}>
          <span className="hazard-symbol">
            <Icon name={active.icon} size={39} />
          </span>
          <div>
            <h2>{content.title}</h2>
            <p>
              {t.hazardVerified} · {active.reviewedAt} · {t.country}
            </p>
          </div>
        </section>
        <Notice tone="warning" icon="ShieldCheck">
          {t.hazardPriority}
        </Notice>
        <div className="hazard-stages">
          {[
            ["before", "ClipboardCheck"],
            ["during", "ShieldCheck"],
            ["after", "Users"],
            ["avoid", "Cross"],
          ].map(([key, icon]) => (
            <section className={`panel hazard-stage ${key}`} key={key}>
              <div className="hazard-stage-title">
                <span>
                  <Icon name={icon} size={22} />
                </span>
                <h2>{t[`hazard_${key}`]}</h2>
              </div>
              <ol>
                {content[key].map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>
        <section className="panel padded hazard-kit">
          <h2>
            <Icon name="Package" />
            {t.hazard_kit}
          </h2>
          <ul>
            {content.kit.map((item) => (
              <li key={item}>
                <Icon name="Check" size={17} />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="panel padded hazard-references">
          <h2>{t.officialSources}</h2>
          <p>{t.hazardSourceNote}</p>
          <div className="reference-list">
            {active.sources.map((s) => (
              <External key={s.url} href={s.url}>
                {s.label}
              </External>
            ))}
          </div>
          <p className="micro-note">{t.hazardTranslation}</p>
        </section>
      </article>
    );
  }
  const results = hazards.filter((h) =>
    normalize(
      [
        h.keywords,
        h[lang].title,
        ...h[lang].before,
        ...h[lang].during,
        ...h[lang].avoid,
      ].join(" "),
    ).includes(normalize(query)),
  );
  return (
    <>
      <Notice icon="BookOpen">{t.hazardIntro}</Notice>
      <div className="library-toolbar">
        <div className="input-search">
          <Icon name="Search" />
          <input
            aria-label={t.hazardSearch}
            placeholder={t.hazardSearch}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="result-count">
          {results.length} {t.hazardSheets}
        </span>
      </div>
      <div className="hazards-grid">
        {results.map((h) => (
          <button
            className={`hazard-card panel ${h.id}`}
            key={h.id}
            onClick={() => open(h.id)}
          >
            <span className="hazard-symbol">
              <Icon name={h.icon} size={29} />
            </span>
            <div>
              <h2>{h[lang].title}</h2>
              <p>{t.hazardCardText}</p>
            </div>
            <Icon name="ArrowRight" size={20} />
          </button>
        ))}
      </div>
      {results.length === 0 && <p className="empty">{t.noResults}</p>}
    </>
  );
}
