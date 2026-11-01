import { useEffect, useState } from "react";
import {
  BookOpen,
  Globe2,
  HardDrive,
  Check,
  CloudOff,
  RotateCw,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { wikiText } from "./wiki-text";
import { chooseWikiArchive } from "./media-navigation";
import "./media-hub.css";
const languageNames = {
  fr: "Français",
  de: "Deutsch",
  en: "English",
  ar: "العربية",
};
export default function Wikipedia({ lang = "fr" }) {
  const c = wikiText[lang];
  const [data, setData] = useState(null),
    [selected, setSelected] = useState(null),
    [error, setError] = useState(false),
    [revision, setRevision] = useState(0),
    [readerRevision, setReaderRevision] = useState(0),
    [large, setLarge] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch("/api/resources", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d.wiki)) throw Error();
        setData(d);
        setSelected(chooseWikiArchive(d.wiki, lang)?.filename ?? null);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [lang, revision]);
  const archives = data?.wiki || [],
    archive = archives.find((a) => a.filename === selected),
    total = archives.reduce((n, a) => n + a.bytes, 0);
  const source = archive
    ? `http://127.0.0.1:8108/www/index.html?refugeArchive=${encodeURIComponent(archive.language)}&overrideBrowserLanguage=${lang}`
    : null;
  useEffect(() => setLoading(true), [source, readerRevision]);
  return (
    <div className={"wiki-page " + (large ? "wiki-expanded" : "")}>
      <section className="wiki-overview">
        <div className="wiki-emblem" aria-hidden="true">
          <BookOpen size={42} strokeWidth={1.2} />
          <span>W</span>
        </div>
        <div>
          <span className="wiki-kicker">WIKIPEDIA × KIWIX</span>
          <h2>{c.intro}</h2>
          <div className="wiki-stats">
            <span>
              <Globe2 size={16} />
              {data ? archives.length : "—"} {c.languages}
            </span>
            <span>
              <HardDrive size={16} />
              {data
                ? (total / 1e9).toLocaleString(lang, {
                    maximumFractionDigits: 2,
                  })
                : "—"}{" "}
              GB · {c.stored}
            </span>
          </div>
        </div>
      </section>
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
      {!data && !error && <p role="status">{c.load}</p>}
      {data && archives.length === 0 && <p className="hub-empty">{c.empty}</p>}
      {archives.length > 0 && (
        <>
          <div className="wiki-section-heading">
            <div>
              <h2>{c.choose}</h2>
              <p>{c.chooseSub}</p>
            </div>
            <span className="hub-local">
              <CloudOff size={14} />
              {c.local}
            </span>
          </div>
          <div className="wiki-editions" role="group" aria-label={c.choose}>
            {archives.map((a) => (
              <button
                key={a.filename}
                className={
                  "wiki-edition " + (selected === a.filename ? "selected" : "")
                }
                aria-pressed={selected === a.filename}
                onClick={() => setSelected(a.filename)}
              >
                <div className="wiki-edition-top">
                  <span className="wiki-letter" lang={a.language}>
                    {a.language === "ar" ? "ع" : a.language.toUpperCase()}
                  </span>
                  {selected === a.filename && <Check size={18} />}
                </div>
                <strong lang={a.language}>
                  {languageNames[a.language] || a.language}
                </strong>
                <span>
                  {a.compact ? c.compact : c.full} ·{" "}
                  {(a.bytes / 1e9).toFixed(2)} GB
                </span>
                <small>
                  {c.edition}{" "}
                  {a.edition || a.filename.match(/(\d{4}-\d{2})/)?.[1] || "—"}
                </small>
                <span className="wiki-edition-action">
                  {selected === a.filename ? c.selected : c.read}
                  <BookOpen size={15} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {archive && data?.wikiReader && (
        <section className="wiki-reading-shell">
          <div className="wiki-reader-toolbar">
            <div>
              <BookOpen size={19} />
              <h2>{c.reader}</h2>
              <span className="wiki-current-language" lang={archive.language}>
                {languageNames[archive.language] || archive.language}
              </span>
            </div>
            <div>
              <button
                aria-label={c.reload}
                title={c.reload}
                onClick={() => setReaderRevision((v) => v + 1)}
              >
                <RotateCw size={16} />
              </button>
              <button
                aria-label={large ? c.shrink : c.expand}
                title={large ? c.shrink : c.expand}
                onClick={(e) => {
                  setLarge((v) => !v);
                  const shell = e.currentTarget.closest(".wiki-reading-shell");
                  requestAnimationFrame(() =>
                    shell?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  );
                }}
              >
                {large ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <a
                href={source}
                target="_blank"
                rel="noreferrer"
                aria-label={c.newTab}
                title={c.newTab}
              >
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
          <p className="wiki-reader-help">
            <Search size={15} />
            {c.help}
          </p>
          {loading && (
            <p className="wiki-opening" role="status">
              {c.opening}
            </p>
          )}
          <iframe
            key={source + readerRevision}
            className="wiki-reader-frame"
            title={`Wikipedia · ${languageNames[archive.language] || archive.language}`}
            src={source}
            onLoad={() => setLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
          />
          <div className="wiki-reader-footer">
            <CloudOff size={13} />
            {c.offline} · {languageNames[archive.language] || archive.language}
          </div>
        </section>
      )}
      {data && !data.wikiReader && <p className="hub-empty">{c.missing}</p>}
      {archives.length > 0 && (
        <details className="wiki-technical">
          <summary>{c.details}</summary>
          {archives.map((a) => (
            <div key={a.filename}>
              <strong>{languageNames[a.language] || a.language}</strong>
              <code dir="ltr">{a.filename}</code>
              <span>
                {c.size} : {(a.bytes / 1e9).toFixed(2)} GB
              </span>
            </div>
          ))}
        </details>
      )}
      <p className="wiki-attribution">{c.attribution}</p>
    </div>
  );
}
