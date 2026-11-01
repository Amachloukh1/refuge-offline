import { useEffect, useRef, useState } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaPlayButton,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaMuteButton,
  MediaVolumeRange,
  MediaFullscreenButton,
} from "media-chrome/react";
import {
  Film,
  Music2,
  Download,
  Heart,
  Play,
  Upload,
  X,
  SkipBack,
  SkipForward,
  CloudOff,
} from "lucide-react";
import { mediaText } from "./media-text";
import "./media.css";
function saved(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Playback remains usable with storage disabled. */
  }
}
export function MediaPlayer({ item, lang, audio = false, onEnded }) {
  const c = mediaText[lang],
    ref = useRef(null),
    last = useRef(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    const media = ref.current;
    return () => {
      if (media) store("refuge.media.position." + item.id, media.currentTime);
    };
  }, [item.id]);
  const props = {
    ref,
    slot: "media",
    src: item.src,
    preload: "metadata",
    autoPlay: true,
    onLoadedMetadata: () => {
      const t = saved("refuge.media.position." + item.id, 0);
      if (Number.isFinite(t) && t > 0 && t < ref.current.duration - 3)
        ref.current.currentTime = t;
    },
    onTimeUpdate: () => {
      const t = ref.current.currentTime;
      if (Math.abs(t - last.current) > 4) {
        store("refuge.media.position." + item.id, t);
        last.current = t;
      }
    },
    onPause: () => {
      if (ref.current)
        store("refuge.media.position." + item.id, ref.current.currentTime);
    },
    onEnded: () => {
      store("refuge.media.position." + item.id, 0);
      onEnded?.();
    },
    onError: () => setError(true),
  };
  return (
    <div className="refuge-player" dir="ltr">
      <MediaController audio={audio || undefined}>
        {audio ? <audio {...props} /> : <video {...props} playsInline />}
        <MediaControlBar>
          <MediaPlayButton aria-label={c.play} />
          <MediaTimeRange aria-label={c.resume} />
          <MediaTimeDisplay showDuration />
          <MediaMuteButton />
          <MediaVolumeRange />
          {!audio && <MediaFullscreenButton />}
        </MediaControlBar>
      </MediaController>
      {error && (
        <p role="alert" dir={lang === "ar" ? "rtl" : "ltr"}>
          {c.codec}
        </p>
      )}
    </div>
  );
}
export function MusicDock({ session, setSession, lang }) {
  if (!session) return null;
  const c = mediaText[lang],
    { queue, index } = session,
    item = queue[index];
  const move = (delta) => {
    const next = index + delta;
    if (next >= 0 && next < queue.length)
      setSession({ ...session, index: next });
  };
  return (
    <aside className="music-dock" aria-label={c.music}>
      <div className="dock-title">
        <Music2 aria-hidden="true" />
        <div>
          <strong>{item.title}</strong>
          <small>
            {item.artist} · {item.installed ? c.offline : c.stream}
          </small>
        </div>
      </div>
      <div className="dock-controls">
        <button
          disabled={index === 0}
          onClick={() => move(-1)}
          aria-label={c.previous}
        >
          <SkipBack size={18} />
        </button>
        <MediaPlayer
          key={item.id + item.src}
          item={item}
          lang={lang}
          audio
          onEnded={() => move(1)}
        />
        <button
          disabled={index === queue.length - 1}
          onClick={() => move(1)}
          aria-label={c.next}
        >
          <SkipForward size={18} />
        </button>
        <button onClick={() => setSession(null)} aria-label={c.close}>
          <X size={18} />
        </button>
      </div>
    </aside>
  );
}
export default function Entertainment({ kind, lang, onMusic, onFilm }) {
  const c = mediaText[lang],
    isMusic = kind === "music";
  const [items, setItems] = useState(null),
    [failure, setFailure] = useState(false),
    [message, setMessage] = useState("");
  const [tab, setTab] = useState("installed"),
    [query, setQuery] = useState(""),
    [genre, setGenre] = useState(""),
    [language, setLanguage] = useState("");
  const [favorites, setFavorites] = useState(() => {
    const v = saved("refuge.media.favorites", []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  });
  const [film, setFilm] = useState(null),
    [job, setJob] = useState(null),
    [busy, setBusy] = useState(false);
  const input = useRef(null),
    player = useRef(null);
  const load = async () => {
    const r = await fetch("/api/media");
    if (!r.ok) throw Error();
    const v = await r.json();
    setItems(v.filter((x) => x.kind === kind));
  };
  useEffect(() => {
    let live = true;
    setItems(null);
    setFilm(null);
    setFailure(false);
    const refresh = async () => {
      try {
        const r = await fetch("/api/media/jobs");
        if (!r.ok) throw Error();
        const j = await r.json();
        if (live) {
          setJob(j);
          await load();
        }
      } catch {
        if (live) setFailure(true);
      }
    };
    refresh();
    const timer = setInterval(refresh, 2500);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [kind]);
  const toggle = (id) => {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(next);
    store("refuge.media.favorites", next);
  };
  const download = async (ids) => {
    setFailure(false);
    try {
      const r = await fetch("/api/media/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: ids.slice(0, 20) }),
      });
      if (!r.ok) throw Error();
      setJob(await r.json());
    } catch {
      setFailure(true);
    }
  };
  const play = (item, online = false, queue) => {
    const selected = { ...item, src: online ? item.onlineUrl : item.fileUrl };
    if (isMusic)
      onMusic({
        queue: queue?.map((x) => ({ ...x, src: x.fileUrl })) || [selected],
        index: 0,
      });
    else {
      onFilm();
      setFilm(selected);
      requestAnimationFrame(() =>
        player.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };
  const importFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    setBusy(true);
    setFailure(false);
    setMessage("");
    try {
      for (const file of files) {
        if (file.size > (isMusic ? 256 * 1024 ** 2 : 4 * 1024 ** 3))
          throw Error();
        const params = new URLSearchParams({
          kind,
          name: file.name,
          language: language || "none",
        });
        const r = await fetch("/api/media/import?" + params, {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: file,
        });
        if (!r.ok) throw Error();
      }
      await load();
      setTab("installed");
      setMessage(c.saved);
    } catch {
      setFailure(true);
    } finally {
      setBusy(false);
    }
  };
  const visible = (items || []).filter(
    (x) =>
      (tab !== "installed" || x.installed) &&
      (tab !== "favorites" || favorites.includes(x.id)) &&
      (!genre || x.genre === genre) &&
      (!language || x.language === language) &&
      `${x.title} ${x.artist}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  const missing = visible.filter((x) => !x.installed && !x.personal);
  return (
    <section className="media-page">
      <div className={"media-hero " + (isMusic ? "music-hero" : "film-hero")}>
        <div>
          <span className="media-eyebrow">REFUGE · {isMusic ? "♫" : "▶"}</span>
          <h2>{isMusic ? c.music : c.films}</h2>
          <p>{c.intro}</p>
          <span className="media-local">
            <CloudOff size={16} />
            {items?.filter((x) => x.installed).length ?? "…"}{" "}
            {c.offline.toLocaleLowerCase()}
          </span>
        </div>
        <div className="media-hero-art" aria-hidden="true">
          {isMusic ? (
            <div className="vinyl">
              <span />
            </div>
          ) : (
            <Film size={115} strokeWidth={1} />
          )}
        </div>
      </div>
      <div className="media-toolbar">
        <div className="media-tabs" role="group" aria-label={c.catalog}>
          {["installed", "catalog", "favorites"].map((v) => (
            <button key={v} aria-pressed={tab === v} onClick={() => setTab(v)}>
              {c[v]}
            </button>
          ))}
        </div>
        <button
          className="media-import"
          disabled={busy}
          onClick={() => input.current.click()}
        >
          <Upload size={16} />
          {busy ? c.loading : c.import}
        </button>
        <input
          ref={input}
          type="file"
          multiple
          hidden
          accept={isMusic ? ".mp3,.ogg,.m4a,.wav,.flac" : ".mp4,.webm"}
          onChange={importFiles}
        />
      </div>
      <p className="media-note">{c.importNote}</p>
      <div className="media-filters">
        <input
          aria-label={c.search}
          placeholder={c.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label={c.genres}
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        >
          <option value="">{c.genres}</option>
          {[...new Set((items || []).map((x) => x.genre))].map((g) => (
            <option key={g} value={g}>
              {c[g] || (g === "personal" ? c.personalGenre : g)}
            </option>
          ))}
        </select>
        <select
          aria-label={c.languages}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="">{c.languages}</option>
          {Object.entries({
            fr: "Français",
            de: "Deutsch",
            en: "English",
            ar: "العربية",
            none: c.none,
          }).map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </select>
      </div>
      {failure && (
        <p className="media-alert" role="alert">
          {c.error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {job?.active && (
        <div className="media-job" role="status">
          <strong>
            {c.progress} · {job.done}/{job.total}
          </strong>
          <span>
            {job.current} · {(job.bytes / 1024 ** 2).toFixed(1)} Mo
          </span>
          <button
            onClick={async () => {
              try {
                await fetch("/api/media/cancel", { method: "POST" });
              } catch {
                setFailure(true);
              }
            }}
          >
            {c.cancel}
          </button>
        </div>
      )}
      {!job?.active && job?.errors?.length > 0 && (
        <p className="media-alert" role="alert">
          {c.error} ({job.errors.length})
        </p>
      )}
      <div className="media-summary">
        <span>
          {visible.length} · {isMusic ? c.music : c.films}
        </span>
        {missing.length > 0 && (
          <button
            disabled={job?.active}
            onClick={() => download(missing.map((x) => x.id))}
          >
            <Download size={16} />
            {c.batch} ({Math.min(20, missing.length)})
          </button>
        )}
        {isMusic && visible.some((x) => x.installed) && (
          <button
            onClick={() =>
              play(
                visible.find((x) => x.installed),
                false,
                visible.filter((x) => x.installed),
              )
            }
          >
            <Play size={16} />
            {c.queue}
          </button>
        )}
      </div>
      {film && (
        <div className="film-player-panel" ref={player}>
          <div className="media-player-title">
            <h3>{film.title}</h3>
            <button onClick={() => setFilm(null)} aria-label={c.close}>
              <X />
            </button>
          </div>
          <MediaPlayer key={film.id + film.src} item={film} lang={lang} />
          <p>{film.installed ? c.resume : c.internet}</p>
          <p>
            {film.artist} · {film.license}
          </p>
        </div>
      )}
      {!isMusic && <p className="media-note">{c.warning}</p>}
      {items === null ? (
        <p role="status">{c.loading}</p>
      ) : visible.length === 0 ? (
        <p className="media-empty">{c.empty}</p>
      ) : (
        <div className="media-grid">
          {visible.map((item, index) => (
            <article className="media-card" key={item.id}>
              <div className={"media-cover cover-" + (index % 4)}>
                {item.poster ? (
                  <img src={item.poster} alt="" loading="lazy" />
                ) : isMusic ? (
                  <Music2 size={56} strokeWidth={1} />
                ) : (
                  <Film size={56} strokeWidth={1} />
                )}
                <span className="media-badge">
                  {item.installed ? c.offline : c.online}
                </span>
                <button
                  className="media-heart"
                  aria-label={
                    favorites.includes(item.id)
                      ? c.removeFavorite
                      : c.addFavorite
                  }
                  aria-pressed={favorites.includes(item.id)}
                  onClick={() => toggle(item.id)}
                >
                  <Heart
                    size={19}
                    fill={favorites.includes(item.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>
              <div className="media-card-body">
                <span className="media-category">
                  {c[item.genre] ||
                    (item.personal ? c.personalGenre : item.genre)}{" "}
                  · {item.duration || "—"}
                </span>
                <h3>{item.title}</h3>
                <p>{item.artist || c.personal}</p>
                <small>
                  {item.language === "none"
                    ? c.none
                    : {
                        fr: "Français",
                        de: "Deutsch",
                        en: "English",
                        ar: "العربية",
                      }[item.language]}
                </small>
                <div className="media-actions">
                  {item.installed ? (
                    <button onClick={() => play(item)}>
                      <Play size={16} />
                      {c.play}
                    </button>
                  ) : (
                    <button
                      disabled={job?.active}
                      onClick={() => download([item.id])}
                    >
                      <Download size={16} />
                      {c.download}
                    </button>
                  )}
                  {!item.installed && item.onlineUrl && (
                    <button
                      className="media-stream"
                      onClick={() => play(item, true)}
                    >
                      {c.stream}
                    </button>
                  )}
                </div>
                <details>
                  <summary>{c.credits}</summary>
                  <p>{item.personal ? c.personal : item.credit}</p>
                  {item.licenseUrl && (
                    <a href={item.licenseUrl} target="_blank" rel="noreferrer">
                      {item.license}
                    </a>
                  )}
                  {item.source && (
                    <>
                      {" "}
                      ·{" "}
                      <a href={item.source} target="_blank" rel="noreferrer">
                        {c.source}
                      </a>
                    </>
                  )}
                </details>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="media-note media-powered">
        Media Chrome ·{" "}
        <a
          href="https://github.com/muxinc/media-chrome"
          target="_blank"
          rel="noreferrer"
        >
          GitHub · MIT
        </a>
      </p>
    </section>
  );
}
