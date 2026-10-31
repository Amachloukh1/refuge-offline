import { useState } from "react";
import { Icon, Button, Modal, External, Notice } from "./components";
import { normalize } from "./planning";
import { guideData } from "./data";
import { hazards } from "./hazards.js";
export function GuideReader({ guide, lang, t, onClose }) {
  return (
    <Modal title={guide.title[lang]} t={t} onClose={onClose}>
      <div className="reader-meta">
        <span>{guide.publisher}</span>
        <span>{t.summary}</span>
        <span>31.10.2026</span>
      </div>
      <p className="reader-intro">{guide.intro[lang]}</p>
      <ol className="guide-steps">
        {guide.body[lang].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ol>
      <Notice icon="BookOpen">{t.printed}</Notice>
      <div className="reader-source">
        <External href={guide.url}>
          {t.source} · {guide.publisher}
        </External>
      </div>
    </Modal>
  );
}
export function Library({
  lang,
  t,
  initialQuery = "",
  favorites,
  toggleFavorite,
  onRead,
  onHazard,
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const matches = guideData.filter(
    (g) =>
      (category === "all" || g.category === category) &&
      (!favOnly || favorites.includes(g.id)) &&
      normalize(
        [g.title[lang], g.intro[lang], g.body[lang].join(" ")].join(" "),
      ).includes(normalize(query)),
  );
  const hazardMatches =
    query.trim() && !favOnly
      ? hazards.filter((h) =>
          normalize(
            [
              h.keywords,
              h[lang].title,
              ...h[lang].during,
              ...h[lang].avoid,
            ].join(" "),
          ).includes(normalize(query)),
        )
      : [];
  return (
    <>
      <div className="library-toolbar">
        <div className="input-search">
          <Icon name="Search" />
          <input
            aria-label={t.searchLibrary}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchLibrary}
          />
          {query && (
            <button
              className="icon-button"
              aria-label={t.clearChat}
              onClick={() => setQuery("")}
            >
              <Icon name="X" size={17} />
            </button>
          )}
        </div>
        <Button
          icon="Star"
          variant={`outline ${favOnly ? "selected" : ""}`}
          onClick={() => setFavOnly(!favOnly)}
          aria-pressed={favOnly}
        >
          {t.favorites} <span className="count">{favorites.length}</span>
        </Button>
      </div>
      <div className="filter-row" aria-label={t.filter}>
        {["all", "water", "food", "healthCategory", "equipment"].map((key) => (
          <button
            key={key}
            className={`filter ${category === (key === "healthCategory" ? "health" : key) ? "active" : ""}`}
            onClick={() =>
              setCategory(key === "healthCategory" ? "health" : key)
            }
            aria-pressed={
              category === (key === "healthCategory" ? "health" : key)
            }
          >
            {t[key]}
          </button>
        ))}
        <span className="result-count">
          {matches.length} {t.guides}
        </span>
      </div>
      <div className="guide-grid">
        {matches.map((g) => (
          <article className="guide-card" key={g.id}>
            <div className="guide-top">
              <span className={`topic-icon ${g.category}`}>
                <Icon name={g.icon} size={26} />
              </span>
              <button
                className={`icon-button favorite ${favorites.includes(g.id) ? "is-favorite" : ""}`}
                aria-label={
                  favorites.includes(g.id) ? t.unfavorite : t.favorite
                }
                aria-pressed={favorites.includes(g.id)}
                onClick={() => toggleFavorite(g.id)}
              >
                <Icon name="Star" size={21} />
              </button>
            </div>
            <div className="guide-meta">
              {g.publisher} <span>·</span> {g.time} min
            </div>
            <h2>{g.title[lang]}</h2>
            <p>{g.intro[lang]}</p>
            <button className="text-button" onClick={() => onRead(g)}>
              {t.read}
              <Icon name="ArrowRight" size={18} />
            </button>
          </article>
        ))}
      </div>
      {hazardMatches.length > 0 && (
        <section className="hazards-search-results">
          <h2>{t.hazards}</h2>
          {hazardMatches.map((h) => (
            <button key={h.id} onClick={() => onHazard(h.id)}>
              <Icon name={h.icon} />
              <strong>{h[lang].title}</strong>
              <Icon name="ArrowRight" size={18} />
            </button>
          ))}
        </section>
      )}
      {matches.length === 0 && hazardMatches.length === 0 && (
        <div className="empty panel">
          <Icon name="Search" size={40} />
          <h2>{t.noResults}</h2>
        </div>
      )}
    </>
  );
}
