import { useEffect, useState } from "react";
import { Icon, Notice, Button, External } from "./components";
export function LocalVideos({ t }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ videos: [] }));
  }, []);
  return (
    <>
      <Notice icon="Video">{t.videoLocalNotice}</Notice>
      <div className="guide-grid local-video-grid">
        {data?.videos?.map((v) => (
          <article key={v.id} className="panel local-video">
            <video controls preload="metadata" playsInline aria-label={v.title}>
              <source src={`/assets/videos/${v.filename}`} type="video/mp4" />
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
              <p>
                {v.publisher} · {v.language} · {(v.bytes / 1e6).toFixed(0)} MB
              </p>
              <External href={v.sourcePage}>{t.source}</External>
            </div>
          </article>
        ))}
      </div>
      {data && data.videos.length === 0 && <Notice>{t.videoEmpty}</Notice>}
    </>
  );
}
export function LocalWiki({ t }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ wiki: [] }));
  }, []);
  return (
    <>
      <Notice icon="BookOpen">{t.wikiNotice}</Notice>
      <section className="panel padded wiki-intro">
        <span className="topic-icon">
          <Icon name="BookOpen" size={31} />
        </span>
        <div>
          <h2>Kiwix · Wikipedia</h2>
          <p>{t.wikiInstructions}</p>
          {data?.wikiReader && (
            <a
              className="button"
              href="http://127.0.0.1:8108/"
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="BookOpen" size={18} />
              {t.openWiki}
            </a>
          )}
        </div>
      </section>
      <div className="wiki-archives">
        {data?.wiki?.map((w) => (
          <section className="panel padded" key={w.filename}>
            <span className="wiki-language">{w.language.toUpperCase()}</span>
            <h2>Wikipedia · {w.language.toUpperCase()}</h2>
            <p>
              {(w.bytes / 1e9).toFixed(2)} GB ·{" "}
              {w.compact ? t.wikiCompact : t.wikiComplete}
            </p>
            <code dir="ltr">content/zim/{w.filename}</code>
          </section>
        ))}
      </div>
      {data && data.wiki.length === 0 && <Notice>{t.wikiDownloading}</Notice>}
      <p className="muted bottom-note">
        © Wikipedia contributors · CC BY-SA · {t.wikiAttribution}
      </p>
    </>
  );
}
