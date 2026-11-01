import {extraVideoText} from "./locales/extra-ui-text.js";
import { useCallback, useEffect, useState } from "react";
import { Icon, Notice, Button, External } from "./components";
const mediaText = {
  fr: [
    "Actualiser le catalogue",
    "Vidéos installées",
    "Sujets à préparer",
    "Chercher une vidéo",
    "Toutes les langues",
    "Tous les sujets",
    "Premiers secours et hygiène",
    "Forêt et bivouac",
    "Préparation du foyer",
    "installées",
    "avec son",
    "Aucune vidéo dans ce filtre. Essayez toutes les langues et tous les sujets.",
    "Ces sujets ne sont pas encore téléchargés. Les liens suivants demandent Internet ; ils ne sont pas des vidéos hors ligne.",
    "Impossible de charger le catalogue. Réessayez ; aucun fichier n’a été supprimé.",
    "Catalogue chargé à",
    "Chargement du catalogue…",
  ],
  de: [
    "Katalog aktualisieren",
    "Installierte Videos",
    "Geplante Themen",
    "Video suchen",
    "Alle Sprachen",
    "Alle Themen",
    "Erste Hilfe und Hygiene",
    "Wald und Camping",
    "Haushaltsvorsorge",
    "installiert",
    "mit Ton",
    "Kein Video für diesen Filter. Alle Sprachen und Themen versuchen.",
    "Diese Themen sind noch nicht heruntergeladen. Die folgenden Links benötigen Internet und sind keine Offline-Videos.",
    "Katalog konnte nicht geladen werden. Erneut versuchen; keine Datei wurde gelöscht.",
    "Katalog geladen um",
    "Katalog wird geladen…",
  ],
  en: [
    "Refresh catalogue",
    "Installed videos",
    "Topics to prepare",
    "Search videos",
    "All languages",
    "All topics",
    "First aid and hygiene",
    "Outdoors and camping",
    "Household preparation",
    "installed",
    "with sound",
    "No videos match these filters. Try all languages and topics.",
    "These topics have not been downloaded. The links below require Internet and are not offline videos.",
    "Could not load the catalogue. Retry; no files were deleted.",
    "Catalogue loaded at",
    "Loading catalogue…",
  ],
  ar: [
    "تحديث الفهرس",
    "الفيديوهات المثبتة",
    "مواضيع للتحضير",
    "بحث عن فيديو",
    "كل اللغات",
    "كل المواضيع",
    "الإسعاف والنظافة",
    "الغابة والتخييم",
    "تحضير المنزل",
    "مثبتة",
    "بصوت",
    "لا توجد فيديوهات مطابقة. جرّب كل اللغات والمواضيع.",
    "هذه المواضيع لم تُحمّل بعد. الروابط التالية تتطلب الإنترنت وليست فيديوهات دون اتصال.",
    "تعذر تحميل الفهرس. أعد المحاولة؛ لم يُحذف أي ملف.",
    "تم تحميل الفهرس في",
    "جارٍ تحميل الفهرس…",
  ],
};
export function LocalVideos({ t, lang = "fr", onPlay }) {
  const c = mediaText[lang] || mediaText.fr;
  const [data, setData] = useState(null);
  const [soundOnly, setSoundOnly] = useState(true);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [topic, setTopic] = useState("all");
  const [tab, setTab] = useState("installed");
  const [error, setError] = useState(false);
  const [loadedAt, setLoadedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const refresh = useCallback(async (signal) => {
    setLoading(true);
    try {
      const r = await fetch("/api/resources", { cache: "no-store", signal });
      if (!r.ok) throw new Error("catalogue");
      const d = await r.json();
      if (!Array.isArray(d.videos)) throw new Error("catalogue");
      setData(d);
      setError(false);
      setLoadedAt(new Date());
    } catch (e) {
      if (e.name !== "AbortError") setError(true);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    const focus = () => {
      if (document.visibilityState === "visible")
        void refresh(controller.signal);
    };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      controller.abort();
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
    };
  }, [refresh]);
  const normal = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const filtered = (data?.videos || []).filter(
    (v) =>
      (!soundOnly || v.audioAudible === true) &&
      (language === "all" || v.language === language) &&
      (topic === "all" || (v.category || "preparation") === topic) &&
      normal(`${v.title} ${v.description} ${v.publisher}`).includes(
        normal(query),
      ),
  );
  return (
    <>
      <section
        className="panel padded video-management"
        data-testid="video-management"
      >
        <h2>
          {data?.videos.length ?? "—"} {c[9]} ·{" "}
          {data?.videos.filter((v) => v.audioAudible === true).length ?? "—"}{" "}
          {c[10]}
        </h2>
        <Button
          variant="outline"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {c[0]}
        </Button>
        <p role="status">
          {loading
            ? c[15]
            : loadedAt
              ? `${c[14]} ${loadedAt.toLocaleTimeString(lang)}`
              : ""}
        </p>
        {error && <p role="alert">{c[13]}</p>}
        <div className="tabs section-tabs">
          <button
            className={tab === "installed" ? "active" : ""}
            onClick={() => setTab("installed")}
          >
            {c[1]}
          </button>
          <button
            className={tab === "planned" ? "active" : ""}
            onClick={() => setTab("planned")}
          >
            {c[2]}
          </button>
        </div>
        {tab === "installed" && (
          <div className="form-row">
            <label>
              {c[3]}
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label>
              {c[4]}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="all">{c[4]}</option>
                {[...new Set((data?.videos || []).map((v) => v.language))]
                  .sort()
                  .map((l) => (
                    <option key={l} value={l}>
                      {{
                        de: "Deutsch",
                        en: "English",
                        fr: "Français",
                        ar: "العربية",
                      }[l] || l}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              {c[5]}
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {[
                  ["all", 5],
                  ["firstaid", 6],
                  ["outdoors", 7],
                  ["preparation", 8],
                ].map(([v, i]) => (
                  <option key={v} value={v}>
                    {c[i]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>
      {tab === "planned" ? (
        <>
          <Notice>{c[12]}</Notice>
          <div className="guide-grid">
            {[
              [
                "cooking",
                "Utensils",
                "videoCooking",
                "https://www.sikana.tv/fr/cooking",
              ],
              [
                "movement",
                "Users",
                "videoMovement",
                "https://www.sikana.tv/fr/sport",
              ],
              [
                "repairs",
                "Package",
                "videoRepairs",
                "https://www.sikana.tv/fr",
              ],
            ].map(([id, icon, description, url]) => (
              <article className="panel" key={id}>
                <div className={`video-cover ${id}`}>
                  <Icon name={icon} size={48} />
                  <span>{t.installLater}</span>
                </div>
                <div className="padded">
                  <h2>{t[id]}</h2>
                  <p>{t[description]}</p>
                  <External href={url}>{t.discover}</External>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <Notice icon="Video">{t.videoLocalNotice}</Notice>
          <Notice>{t.videoAudioHelp}</Notice>
          <div className="filter-row">
            <button
              className={"filter " + (soundOnly ? "active" : "")}
              onClick={() => setSoundOnly(true)}
            >
              {t.withSound}
            </button>
            <button
              className={"filter " + (!soundOnly ? "active" : "")}
              onClick={() => setSoundOnly(false)}
            >
              {t.allVideos}
            </button>
          </div>
          <div className="guide-grid local-video-grid">
            {filtered.map((v) => (
              <article key={v.id} className="panel local-video">
                <video
                  onPlay={onPlay}
                  controls
                  preload="metadata"
                  playsInline
                  aria-label={v.title}
                >
                  <source
                    src={`/assets/videos/${v.filename}`}
                    type="video/mp4"
                  />
                  {v.subtitleFilename && (
                    <track
                      kind="subtitles"
                      src={`/assets/videos/${v.subtitleFilename}`}
                      srcLang="de"
                      label="Deutsch"
                      default
                    />
                  )}
                </video>
                <div className="padded">
                  <h2>{v.title}</h2>
                  {v.description && <p>{v.description}</p>}
                  <span className="tag">
                    {v.audioAudible === false ? t.silentVideo : t.audioVideo}
                  </span>
                  <p>
                    {v.publisher} · {v.language} · {(v.bytes / 1e6).toFixed(0)}{" "}
                    MB
                  </p>
                  <External href={v.sourcePage}>{t.source}</External>
                  {v.audioAudible && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const video = e.currentTarget
                          .closest("article")
                          .querySelector("video");
                        video.muted = false;
                        video.volume = 0.8;
                        void video.play().catch(() => {});
                      }}
                    >
                      {t.soundEnable}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {data && data.videos.length === 0 && <Notice>{t.videoEmpty}</Notice>}
          {data && data.videos.length > 0 && filtered.length === 0 && (
            <Notice>{c[11]}</Notice>
          )}
        </>
      )}
    </>
  );
}
Object.assign(mediaText, extraVideoText);
