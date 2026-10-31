import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { LocalVideos, LocalWiki } from "./LocalMedia";
import { WeatherRadio } from "./WeatherRadio";
const OfflineMaps = lazy(() => import("./OfflineMaps"));
import { translations, languages } from "./i18n";
import { seedStock, checklistIds, guideData } from "./data";
import { waterPlan } from "./planning";
import {
  Icon,
  Brand,
  PageHeading,
  Notice,
  Modal,
  External,
} from "./components";
import { Dashboard } from "./Dashboard";
import { Library, GuideReader } from "./Library";
import { Inventory } from "./Inventory";
import { Health, Preparation, Settings, DocumentList } from "./Pages";
import { Assistant } from "./StudioAssistant";
import { Hazards } from "./Hazards.jsx";
const pages = [
  ["home", "Home"],
  ["assistant", "MessageCircle"],
  ["library", "BookOpen"],
  ["hazards", "ShieldCheck"],
  ["health", "Cross"],
  ["inventory", "Package"],
  ["maps", "Map"],
  ["weather", "RadioTower"],
  ["videos", "Video"],
  ["wiki", "BookOpen"],
  ["prepare", "ClipboardCheck"],
];
const subtitleKeys = {
  assistant: "assistantSub",
  library: "librarySub",
  hazards: "hazardsSub",
  health: "healthSub",
  inventory: "inventorySub",
  maps: "mapsSub",
  weather: "weatherSub",
  videos: "videosSub",
  wiki: "wikiSub",
  prepare: "prepareSub",
  settings: "settingsSub",
};
const defaults = {
  version: 1,
  lang: "fr",
  people: 4,
  days: 10,
  stock: seedStock,
  checked: ["check1", "check2", "check3"],
  favorites: [],
  bought: [],
  family: { meeting: "", contact: "", instructions: "" },
};
function readState() {
  try {
    const value = JSON.parse(localStorage.getItem("refuge.v1"));
    if (value?.version !== 1) return defaults;
    return {
      ...defaults,
      ...value,
      lang: translations[value.lang] ? value.lang : "fr",
      people:
        Number.isInteger(value.people) && value.people > 0 && value.people <= 50
          ? value.people
          : 4,
      days:
        Number.isInteger(value.days) && value.days > 0 && value.days <= 365
          ? value.days
          : 10,
      stock: Array.isArray(value.stock)
        ? value.stock.filter(
            (i) =>
              typeof i.id === "string" &&
              typeof i.name === "string" &&
              Number.isFinite(i.quantity) &&
              i.quantity >= 0 &&
              ["water", "food", "equipment", "health"].includes(i.category) &&
              ["L", "kg", "unit"].includes(i.unit) &&
              (!i.key || typeof translations.fr[i.key] === "string"),
          )
        : seedStock,
      checked: Array.isArray(value.checked)
        ? [...new Set(value.checked.filter((k) => checklistIds.includes(k)))]
        : defaults.checked,
      favorites: Array.isArray(value.favorites) ? value.favorites : [],
      bought: Array.isArray(value.bought) ? value.bought : [],
      family:
        value.family && typeof value.family === "object"
          ? value.family
          : defaults.family,
    };
  } catch {
    return defaults;
  }
}
function route() {
  const name = location.hash.slice(1).split("?")[0];
  return [...pages.map((p) => p[0]), "settings"].includes(name) ? name : "home";
}
function routeView() {
  return new URLSearchParams(location.hash.split("?")[1] || "").get("view");
}
export default function App() {
  const [state, setState] = useState(readState);
  const [page, setPage] = useState(route);
  const [menu, setMenu] = useState(false);
  const [guide, setGuide] = useState(null);
  const [aid, setAid] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(routeView);
  const [storageError, setStorageError] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState(null);
  const [statusRevision, setStatusRevision] = useState(0);
  const main = useRef(null);
  const menuButton = useRef(null);
  const previousPage = useRef(page);
  const t = translations[state.lang];
  useEffect(() => {
    if (page === "library" && tab) {
      const selected = guideData.find((g) => g.id === tab);
      if (selected) setGuide(selected);
    }
  }, [page, tab]);
  const update = (key, value) =>
    setState((prev) => ({
      ...prev,
      [key]: typeof value === "function" ? value(prev[key]) : value,
    }));
  const toggle = (key, id) =>
    update(key, (prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const navigate = (next, sub = null) => {
    setTab(sub);
    setMenu(false);
    const target = `${next}${sub ? `?view=${encodeURIComponent(sub)}` : ""}`;
    if (location.hash !== `#${target}`) {
      location.hash = target;
      setPage(next);
    } else main.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    try {
      localStorage.setItem("refuge.v1", JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
    document.title = `REFUGE — ${t[page]}`;
  }, [state.lang, page, t]);
  useEffect(() => {
    const handler = () => {
      setPage(route());
      setMenu(false);
      setTab(routeView());
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    if (previousPage.current !== page) {
      main.current?.focus({ preventScroll: true });
      previousPage.current = page;
    }
  }, [page]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/documents", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (Array.isArray(d)) setDocuments(d);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/status", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => {});
    return () => controller.abort();
  }, [page, statusRevision]);
  useEffect(() => {
    if (!menu) return;
    const handler = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menu]);
  const water = waterPlan(state.stock, state.people, state.days);
  const shopping = [
    ...(water.missing > 0 ? [{ id: "water", label: t.waterName }] : []),
    { id: "lamp", label: t.lamp },
    { id: "batteries", label: t.batteries },
  ];
  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refuge-demo.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function searchAll(e) {
    e.preventDefault();
    setSearch(query);
    navigate("library");
  }
  return (
    <div className="app-shell">
      <a
        href="#main-content"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView();
        }}
      >
        {t.quick}
      </a>
      {menu && (
        <button
          className="sidebar-backdrop"
          aria-label={t.close}
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand />
          <p>{t.tagline}</p>
        </div>
        <nav aria-label="REFUGE">
          {pages.map(([key, icon]) => (
            <a
              href={`#${key}`}
              key={key}
              aria-current={page === key ? "page" : undefined}
              className={page === key ? "nav-link active" : "nav-link"}
              onClick={(e) => {
                e.preventDefault();
                navigate(key);
              }}
            >
              <Icon name={icon} size={25} />
              <span>{t[key]}</span>
            </a>
          ))}
        </nav>
        <a
          href="#settings"
          className={`nav-link settings-link ${page === "settings" ? "active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            navigate("settings");
          }}
        >
          <Icon name="Settings" size={24} />
          <span>{t.settings}</span>
        </a>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            ref={menuButton}
            className="icon-button mobile-menu"
            aria-label={t.menu}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            <Icon name="Menu" />
          </button>
          <div className="breadcrumb">
            <span>{t.space}</span>
            <Icon name="ChevronRight" size={15} />
            <strong>{page === "home" ? t.overview : t[page]}</strong>
          </div>
          <div className="topbar-options">
            <label className="language-select">
              <Icon name="Globe" size={20} />
              <span className="sr-only">{t.language}</span>
              <select
                aria-label={t.language}
                value={state.lang}
                onChange={(e) => update("lang", e.target.value)}
              >
                {Object.entries(languages).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <span className="topbar-divider" />
            <button
              className="country-button"
              onClick={() => navigate("settings")}
            >
              <span className="german-flag" />
              {t.country}
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex="-1">
          <PageHeading
            title={page === "home" ? t.title : t[page]}
            subtitle={page === "home" ? t.subtitle : t[subtitleKeys[page]]}
            action={
              <span className="demo-label">
                <Icon name="Eye" size={18} />
                {t.demo}
              </span>
            }
          />
          {storageError && <Notice tone="warning">{t.storageWarning}</Notice>}
          {page === "home" && (
            <>
              <form className="global-search" onSubmit={searchAll}>
                <Icon name="Search" size={25} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.search}
                  aria-label={t.search}
                />
                <button type="submit">{t.searchButton}</button>
              </form>
              <Dashboard
                t={t}
                navigate={navigate}
                water={water}
                people={state.people}
                foodCount={
                  state.stock.filter((item) => item.category === "food").length
                }
                checked={state.checked}
                onAid={setAid}
                shopping={shopping}
                bought={state.bought}
                toggleBought={(id) => toggle("bought", id)}
              />
            </>
          )}
          {page === "library" && (
            <>
              <Library
                key={`${page}-${search}`}
                lang={state.lang}
                t={t}
                initialQuery={search}
                favorites={state.favorites}
                toggleFavorite={(id) => toggle("favorites", id)}
                onRead={setGuide}
                onHazard={(id) => navigate("hazards", id)}
              />
              <DocumentList t={t} documents={documents} />
            </>
          )}
          {page === "hazards" && (
            <Hazards
              key={`hazards-${tab}`}
              t={t}
              lang={state.lang}
              initialId={tab}
            />
          )}{" "}
          {page === "health" && (
            <Health t={t} onAid={setAid} documents={documents} />
          )}{" "}
          {page === "inventory" && (
            <Inventory
              key={`${page}-${tab}`}
              t={t}
              lang={state.lang}
              stock={state.stock}
              setStock={(value) => update("stock", value)}
              people={state.people}
              setPeople={(value) => update("people", value)}
              days={state.days}
              setDays={(value) => update("days", value)}
              water={water}
              shopping={shopping}
              bought={state.bought}
              toggleBought={(id) => toggle("bought", id)}
              initialTab={tab}
            />
          )}{" "}
          {page === "maps" && (
            <Suspense fallback={<p>{t.loading}</p>}>
              <OfflineMaps t={t} />
            </Suspense>
          )}
          {page === "weather" && <WeatherRadio t={t} />}
          {page === "videos" && <LocalVideos t={t} />}
          {page === "wiki" && <LocalWiki t={t} lang={state.lang} />}
          {page === "prepare" && (
            <Preparation
              key={`${page}-${tab}-${state.lang}`}
              t={t}
              checked={state.checked}
              toggleCheck={(id) => toggle("checked", id)}
              family={state.family}
              setFamily={(value) => update("family", value)}
              initialTab={tab}
            />
          )}{" "}
          {page === "assistant" && (
            <Assistant
              key={state.lang}
              t={t}
              lang={state.lang}
              water={water}
              onRead={setGuide}
              navigate={navigate}
              status={status}
              onStatusRefresh={() => setStatusRevision((value) => value + 1)}
              planning={{
                people: state.people,
                days: state.days,
                water: water.stock,
              }}
            />
          )}{" "}
          {page === "settings" && (
            <Settings
              t={t}
              lang={state.lang}
              setLang={(value) => update("lang", value)}
              exportData={exportData}
              status={status}
            />
          )}
        </main>
        <footer>
          <span>{t.footer}</span>
          <span>
            <Icon name="Leaf" size={15} /> REFUGE · {t.tagline}
          </span>
        </footer>
      </div>
      {guide && (
        <GuideReader
          guide={guide}
          lang={state.lang}
          t={t}
          onClose={() => setGuide(null)}
        />
      )}{" "}
      {aid && (
        <Modal t={t} title={t[aid]} onClose={() => setAid(null)}>
          <Notice tone="medical" icon="HeartPulse">
            {t.medicalNotice}
          </Notice>
          <p className="reader-intro">{t.healthSheet}</p>
          <p>{t.healthSheetNote}</p>
          <div className="reference-list">
            {documents
              .filter((d) => d.id.startsWith("drk"))
              .map((d) => (
                <a
                  className="external"
                  href={`/documents/${d.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  key={d.id}
                >
                  <Icon name="BookOpen" size={18} />
                  {d.title} · {d.language.toUpperCase()}
                </a>
              ))}
            <External href="https://www.drk.de/hilfe-in-deutschland/erste-hilfe/">
              DRK · {t.source}
            </External>
          </div>
        </Modal>
      )}
    </div>
  );
}
