import { lazy, Suspense, useEffect, useState } from "react";
import {
  Video,
  Film,
  Music2,
  Dumbbell,
  Activity,
  PersonStanding,
  Search,
  ArrowUpRight,
  Play,
  Wifi,
  CloudOff,
  X,
} from "lucide-react";
import { LocalVideos } from "./LocalMedia";
import { hubText } from "./media-hub-text";
import { mediaSections } from "./media-navigation";
import "./media-hub.css";
const Entertainment = lazy(() => import("./Entertainment"));
const icons = { videos: Video, films: Film, music: Music2, sport: Dumbbell };
const nhs = "https://www.nhs.uk/better-health/get-active/home-workout-videos/";
const sikana = "https://www.sikana.tv/fr/sport/50-gym-exercises-for-seniors/";
export const sportsVideos = [
  {
    id: "nhs-cardio",
    language: "en",
    publisher: "NHS · Better Health",
    source: nhs,
    videoId: "6216878258001",
  },
  {
    id: "nhs-strength",
    language: "en",
    publisher: "NHS · Better Health",
    source: nhs,
    videoId: "6216876927001",
  },
  {
    id: "nhs-stretching",
    language: "en",
    publisher: "NHS · Better Health",
    source: nhs,
    videoId: "6216878153001",
  },
  {
    id: "sikana-warmup",
    language: "fr",
    publisher: "Sikana · Siel Bleu",
    source: sikana + "gentle-wam-up",
  },
  {
    id: "sikana-stretching",
    language: "fr",
    publisher: "Sikana · Siel Bleu",
    source: sikana + "gentle-stretching-exercise-chair",
  },
  {
    id: "sikana-chair",
    language: "fr",
    publisher: "Sikana · Siel Bleu",
    source: sikana + "how-to-get-up-from-a-chair",
  },
];
function Sports({ lang, onPlay }) {
  const c = hubText[lang];
  const [query, setQuery] = useState(""),
    [language, setLanguage] = useState(""),
    [active, setActive] = useState(null);
  const items = sportsVideos
    .map((v, i) => ({
      ...v,
      title: c.titles[i],
      description: c.descriptions[i],
      index: i,
    }))
    .filter(
      (v) =>
        (!language || v.language === language) &&
        `${v.title} ${v.description} ${v.publisher}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    );
  return (
    <section className="sports-library">
      <div className="sport-intro">
        <span className="hub-icon">
          <Dumbbell />
        </span>
        <div>
          <h2>{c.sport}</h2>
          <p>{c.sportIntro}</p>
        </div>
        <span className="hub-online">
          <Wifi size={14} />
          {c.online}
        </span>
      </div>
      <div className="library-toolbar">
        <div className="input-search">
          <Search size={20} />
          <input
            aria-label={c.search}
            placeholder={c.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          aria-label={c.language}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">{c.all}</option>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>
      <p className="sport-availability">{c.sportNote}</p>
      {active && (
        <div className="sport-player">
          <div>
            <h3>{c.titles[active.index]}</h3>
            <button
              className="icon-button"
              onClick={() => setActive(null)}
              aria-label={c.close}
            >
              <X />
            </button>
          </div>
          <iframe
            key={active.id}
            title={c.titles[active.index]}
            src={`https://players.brightcove.net/4934638104001/SJlzlxhi_default/index.html?videoId=${active.videoId}`}
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            allowFullScreen
          />
          <a href={active.source} target="_blank" rel="noreferrer">
            {c.source} <ArrowUpRight size={14} />
          </a>
        </div>
      )}
      <div className="guide-grid sports-grid">
        {items.map((v) => (
          <article className="guide-card sport-card" key={v.id}>
            <div
              className={"sport-card-art sport-art-" + (v.index % 3)}
              aria-hidden="true"
            >
              {v.index % 3 === 0 ? (
                <Dumbbell size={44} strokeWidth={1.2} />
              ) : v.index % 3 === 1 ? (
                <Activity size={44} strokeWidth={1.2} />
              ) : (
                <PersonStanding size={44} strokeWidth={1.2} />
              )}
            </div>
            <div className="guide-meta">
              {v.publisher} · {v.language.toUpperCase()}
            </div>
            <h2>{v.title}</h2>
            <p>{v.description}</p>
            <span className="sport-online-label">
              <Wifi size={12} />
              {c.online}
            </span>
            {v.videoId ? (
              <button
                className="text-button"
                onClick={() => {
                  onPlay?.();
                  setActive(v);
                }}
              >
                <Play size={16} />
                {c.watch}
              </button>
            ) : (
              <a
                className="text-button"
                href={v.source}
                onClick={() => {
                  onPlay?.();
                  setActive(null);
                }}
                target="_blank"
                rel="noreferrer"
              >
                {c.watch}
                <ArrowUpRight size={16} />
              </a>
            )}
          </article>
        ))}
      </div>
      {!items.length && <p className="hub-empty">{c.empty}</p>}
      <p className="sport-safety">{c.safe}</p>
    </section>
  );
}
export default function MediaHub({
  lang,
  t,
  section = "videos",
  onSection,
  onMusic,
  onFilm,
}) {
  const c = hubText[lang],
    active = mediaSections.includes(section) ? section : "videos";
  const [availability, setAvailability] = useState(null),
    [error, setError] = useState(false),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch("/api/resources", { signal: controller.signal }).then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      }),
      fetch("/api/media", { signal: controller.signal }).then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      }),
    ])
      .then(([r, m]) => {
        setAvailability({
          videos: r.videos.length,
          films: m.filter((x) => x.kind === "films" && x.installed).length,
          music: m.filter((x) => x.kind === "music" && x.installed).length,
        });
        setError(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [revision, active]);
  const count = availability
    ? availability.videos + availability.films + availability.music
    : null;
  return (
    <div className="media-hub">
      <div className="hub-intro">
        <p>{c.intro}</p>
        <span className="hub-local">
          <CloudOff size={15} />
          {count ?? "—"} {c.local}
        </span>
      </div>
      <div
        className="filter-row hub-categories"
        role="group"
        aria-label={c.media}
      >
        {mediaSections.map((key) => {
          const Icon = icons[key];
          return (
            <button
              key={key}
              className={"filter " + (active === key ? "active" : "")}
              onClick={() => onSection(key)}
              aria-pressed={active === key}
            >
              <Icon size={18} />
              {c[key]}
              <span className="hub-count">
                {key === "sport"
                  ? sportsVideos.length
                  : (availability?.[key] ?? "—")}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="hub-error" role="alert">
          {c.error}{" "}
          <button
            className="text-button"
            onClick={() => setRevision((v) => v + 1)}
          >
            {c.retry}
          </button>
        </p>
      )}
      {active === "videos" && <LocalVideos t={t} lang={lang} onPlay={onFilm} />}
      {active === "sport" && <Sports lang={lang} onPlay={onFilm} />}
      {["films", "music"].includes(active) && (
        <Suspense fallback={<p>…</p>}>
          <Entertainment
            key={active}
            compact
            kind={active}
            lang={lang}
            onMusic={onMusic}
            onFilm={onFilm}
            onCount={(kind, count) =>
              setAvailability((prev) =>
                prev && prev[kind] !== count
                  ? { ...prev, [kind]: count }
                  : prev,
              )
            }
          />
        </Suspense>
      )}
    </div>
  );
}
