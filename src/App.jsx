import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { mediaSections, mediaSection } from "./media-navigation";
import { WeatherRadio } from "./WeatherRadio";
const OfflineMaps = lazy(() => import("./OfflineMaps"));
const Books = lazy(() => import("./Books"));
const MediaHub = lazy(() => import("./MediaHub"));
const Wikipedia = lazy(() => import("./Wikipedia"));
const MusicDock = lazy(() =>
  import("./Entertainment").then((m) => ({ default: m.MusicDock })),
);
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
import {
  EmergencyNow,
  ReadinessDashboard,
  EnergyPlanner,
} from "./Preparedness.jsx";
import { defaultEnergy, defaultReadiness } from "./preparedness.js";
import { validateState } from "./state-schema.js";
import { SystemCheck, DataRestore } from "./SystemTools";
import { FirstAidBrief } from "./FirstAidBrief.jsx";
const pages = [
  ["home", "Home"],
  ["emergency", "Siren"],
  ["readiness", "ClipboardCheck"],
  ["assistant", "MessageCircle"],
  ["library", "BookOpen"],
  ["books", "BookOpen"],
  ["hazards", "ShieldCheck"],
  ["health", "Cross"],
  ["inventory", "Package"],
  ["maps", "Map"],
  ["weather", "RadioTower"],
  ["media", "Video"],
  ["wiki", "BookOpen"],
  ["prepare", "ClipboardCheck"],
  ["energy", "BatteryCharging"],
  ["system", "ShieldCheck"],
];
const subtitleKeys = {
  emergency: "emergencySub",
  readiness: "readinessSub",
  energy: "energySub",
  system: "systemSub",
  assistant: "assistantSub",
  library: "librarySub",
  books: "booksSub",
  hazards: "hazardsSub",
  health: "healthSub",
  inventory: "inventorySub",
  maps: "mapsSub",
  weather: "weatherSub",
  videos: "videosSub",
  media: "mediaSub",
  films: "filmsSub",
  music: "musicSub",
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
  readiness: defaultReadiness,
  energy: defaultEnergy,
  places: [],
  meals: [],
};
let rejectedState = null;
function readState() {
  let raw;
  try {
    raw = localStorage.getItem("refuge.v1");
    if (!raw) return defaults;
    const value = JSON.parse(raw);
    return validateState({ ...defaults, ...value });
  } catch {
    rejectedState = raw || null;
    return defaults;
  }
}
function route() {
  const name = location.hash.slice(1).split("?")[0];
  if (mediaSections.includes(name)) return "media";
  return [...pages.map((p) => p[0]), "settings"].includes(name) ? name : "home";
}
function routeView() {
  const name = location.hash.slice(1).split("?")[0];
  if (name === "media" || mediaSections.includes(name))
    return mediaSection(location.hash);
  return new URLSearchParams(location.hash.split("?")[1] || "").get("view");
}
export default function App() {
  const [musicSession, setMusicSession] = useState(null);
  const [state, setState] = useState(readState);
  const [page, setPage] = useState(route);
  const [menu, setMenu] = useState(false);
  const [guide, setGuide] = useState(null);
  const [aid, setAid] = useState(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(routeView);
  const [storageError, setStorageError] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(Boolean(rejectedState));
  const [powerError, setPowerError] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState(null);
  const [statusRevision, setStatusRevision] = useState(0);
  const main = useRef(null);
  const menuButton = useRef(null);
  const previousPage = useRef(page);
  const t = translations[state.lang];
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/energy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paused: state.energy.ecoMode }),
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error();
        setPowerError(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setPowerError(true);
      });
    return () => controller.abort();
  }, [state.energy.ecoMode]);
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
      ...(["people", "days"].includes(key)
        ? { readiness: { ...defaultReadiness } }
        : key === "stock"
          ? {
              readiness: {
                ...prev.readiness,
                waterConfirmed: false,
                food: false,
                personalMeds: false,
              },
            }
          : {}),
    }));
  const toggle = (key, id) =>
    update(key, (prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  const navigate = (next, sub = null) => {
    if (mediaSections.includes(next)) {
      sub = next;
      next = "media";
    }
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
    if (storageBlocked) return;
    try {
      localStorage.setItem("refuge.v1", JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state, storageBlocked]);
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
    a.download = "refuge-donnees.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function searchAll(e) {
    e.preventDefault();
    setSearch(query);
    navigate("library");
  }
  return (
    <div className={`app-shell${state.energy.ecoMode ? " eco-mode" : ""}`}>
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
            <button
              className="emergency-shortcut"
              onClick={() => navigate("emergency")}
            >
              <Icon name="Siren" size={18} />
              {t.emergency}
            </button>
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
              aria-label={t.country}
              onClick={() => navigate("settings")}
            >
              <span className="german-flag" />
              <span className="country-name">{t.country}</span>
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
                {["home", "inventory"].includes(page) ? t.demo : t.localData}
              </span>
            }
          />
          {storageError && <Notice tone="warning">{t.storageWarning}</Notice>}
          {storageBlocked && (
            <Notice tone="warning">
              <p>{t.storageIncompatible}</p>
              <button
                className="button outline"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([rejectedState], { type: "application/json" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "refuge-original-a-recuperer.json";
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                }}
              >
                {t.exportOriginal}
              </button>
            </Notice>
          )}
          {powerError && state.energy.ecoMode && (
            <Notice tone="warning">{t.pauseFailed}</Notice>
          )}
          {state.energy.ecoMode && (
            <Notice>
              {t.ecoActive}{" "}
              <button
                className="text-button"
                onClick={() =>
                  update("energy", (e) => ({ ...e, ecoMode: false }))
                }
              >
                {t.disableEco}
              </button>
            </Notice>
          )}
          {page === "emergency" && (
            <>
              <button
                className="button outline no-print"
                onClick={() => window.print()}
              >
                {t.printPage}
              </button>
              <EmergencyNow
                lang={state.lang}
                onGuide={(id) => setGuide(guideData.find((g) => g.id === id))}
                onHazard={(id) => navigate("hazards", id)}
                onHealth={setAid}
              />
            </>
          )}
          {page === "readiness" && (
            <ReadinessDashboard
              lang={state.lang}
              water={water}
              people={state.people}
              days={state.days}
              readiness={state.readiness}
              setReadiness={(v) => update("readiness", v)}
              onNavigate={(p) => navigate(p === "checklist" ? "prepare" : p)}
            />
          )}
          {page === "energy" && (
            <EnergyPlanner
              lang={state.lang}
              energy={state.energy}
              setEnergy={(v) => update("energy", v)}
            />
          )}
          {page === "system" && (
            <SystemCheck lang={state.lang} status={status} />
          )}
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
              <div className="panel padded preparedness-actions">
                <button
                  className="button"
                  onClick={() => navigate("readiness")}
                >
                  {t.readiness}
                </button>
                <button
                  className="button outline"
                  onClick={() => navigate("system")}
                >
                  {t.system}
                </button>
                <button
                  className="button outline"
                  onClick={() => navigate("energy")}
                >
                  {t.energy}
                </button>
              </div>
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
              meals={state.meals}
              setMeals={(value) => update("meals", value)}
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
              <OfflineMaps
                t={t}
                lang={state.lang}
                places={state.places}
                setPlaces={(v) => update("places", v)}
              />
            </Suspense>
          )}
          {page === "weather" && <WeatherRadio t={t} />}
          {page === "media" && (
            <Suspense fallback={<p>…</p>}>
              <MediaHub
                section={tab || "videos"}
                onSection={(section) => navigate("media", section)}
                t={t}
                lang={state.lang}
                onMusic={setMusicSession}
                onFilm={() => setMusicSession(null)}
              />
            </Suspense>
          )}
          {page === "books" && (
            <Suspense fallback={<p>…</p>}>
              <Books lang={state.lang} />
            </Suspense>
          )}
          {page === "wiki" && (
            <Suspense fallback={<p>…</p>}>
              <Wikipedia lang={state.lang} />
            </Suspense>
          )}
          {page === "prepare" && (
            <Preparation
              key={`${page}-${tab}-${state.lang}`}
              t={t}
              lang={state.lang}
              bought={state.bought}
              toggleBought={(id) => toggle("bought", id)}
              checked={state.checked}
              toggleCheck={(id) => toggle("checked", id)}
              family={state.family}
              setFamily={(value) => update("family", value)}
              initialTab={tab}
            />
          )}{" "}
          {page === "assistant" &&
            (state.energy.ecoMode ? (
              <Notice>
                {t.ecoActive}
                <button
                  className="button outline"
                  onClick={() =>
                    update("energy", (e) => ({ ...e, ecoMode: false }))
                  }
                >
                  {t.disableEco}
                </button>
              </Notice>
            ) : (
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
            ))}{" "}
          {page === "settings" && (
            <>
              <Settings
                t={t}
                lang={state.lang}
                setLang={(value) => update("lang", value)}
                exportData={exportData}
                status={status}
              />
              <DataRestore
                lang={state.lang}
                exportData={exportData}
                onRestore={(value) => {
                  setState(validateState(value));
                  setStorageBlocked(false);
                  rejectedState = null;
                }}
              />
            </>
          )}
        </main>
        <footer>
          <span>{t.localFooter}</span>
          <span>
            <Icon name="Leaf" size={15} /> REFUGE · {t.tagline}
          </span>
        </footer>
      </div>
      {musicSession && (
        <Suspense fallback={null}>
          <MusicDock
            session={musicSession}
            setSession={setMusicSession}
            lang={state.lang}
          />
        </Suspense>
      )}
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
          <FirstAidBrief kind={aid} lang={state.lang} t={t} />
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
