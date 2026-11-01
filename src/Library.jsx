import { useState } from "react";
import { Icon, Button, Modal, External, Notice } from "./components";
import { normalize } from "./planning";
import { guideData } from "./data";
import { hazards } from "./hazards.js";
import { contentLanguage } from "./locale-policy.js";
export function GuideReader({ guide, lang, t, onClose }) {
  const sourceLanguage = contentLanguage(lang);
  return (
    <Modal
      title={<span lang={sourceLanguage}>{guide.title[sourceLanguage]}</span>}
      t={t}
      onClose={onClose}
    >
      {sourceLanguage !== lang && <Notice>{t.documentFallback}</Notice>}
      <div className="reader-meta">
        <span>{guide.publisher}</span>
        <span>{t.summary}</span>
        <span>31.10.2026</span>
      </div>
      <p className="reader-intro" lang={sourceLanguage}>
        {guide.intro[sourceLanguage]}
      </p>
      {guide.image && (
        <img
          className="guide-reader-image"
          src={guide.image}
          alt={guide.title[sourceLanguage]}
          lang={sourceLanguage}
        />
      )}
      <ol className="guide-steps" lang={sourceLanguage}>
        {guide.body[sourceLanguage].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ol>
      <Notice icon="BookOpen">{t.printed}</Notice>
      {guide.sources && <Notice>{t.hazardTranslation}</Notice>}
      <div className="reader-source">
        <External href={guide.url}>
          {t.source} · {guide.publisher}
        </External>
        {guide.sources?.slice(1).map((source) => (
          <div key={source.url}>
            <External href={source.url}>{source.label}</External>
          </div>
        ))}
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
  const sourceLanguage = contentLanguage(lang);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const matches = guideData
    .filter(
      (g) =>
        (category === "all" || g.category === category) &&
        (!favOnly || favorites.includes(g.id)) &&
        normalize(
          [
            g.title[sourceLanguage],
            g.intro[sourceLanguage],
            g.body[sourceLanguage].join(" "),
          ].join(" "),
        ).includes(normalize(query)),
    )
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  const hazardMatches =
    query.trim() && !favOnly
      ? hazards.filter((h) =>
          normalize(
            [
              h.keywords,
              h[sourceLanguage].title,
              ...h[sourceLanguage].during,
              ...h[sourceLanguage].avoid,
            ].join(" "),
          ).includes(normalize(query)),
        )
      : [];
  return (
    <>
      {sourceLanguage !== lang && <Notice>{t.documentFallback}</Notice>}
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
          <article className="guide-card" key={g.id} data-guide-id={g.id}>
            {g.image && (
              <img
                className="guide-card-image"
                src={g.image}
                alt=""
                loading="lazy"
              />
            )}
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
            <h2 lang={sourceLanguage}>{g.title[sourceLanguage]}</h2>
            <p lang={sourceLanguage}>{g.intro[sourceLanguage]}</p>
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
              <strong lang={sourceLanguage}>{h[sourceLanguage].title}</strong>
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
