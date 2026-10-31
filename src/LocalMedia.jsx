import { useEffect, useState } from "react";
import { Icon, Notice, Button, External } from "./components";
export function LocalVideos({ t }) {
  const [data, setData] = useState(null);
  const [soundOnly, setSoundOnly] = useState(true);
  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ videos: [] }));
  }, []);
  return (
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
        {data?.videos
          ?.filter((v) => !soundOnly || v.audioAudible === true)
          .map((v) => (
            <article key={v.id} className="panel local-video">
              <video
                controls
                preload="metadata"
                playsInline
                aria-label={v.title}
              >
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
                {v.description && <p>{v.description}</p>}
                <span className="tag">
                  {v.audioAudible === false ? t.silentVideo : t.audioVideo}
                </span>
                <p>
                  {v.publisher} · {v.language} · {(v.bytes / 1e6).toFixed(0)} MB
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
    </>
  );
}
export function LocalWiki({ t, lang = "fr" }) {
  const [data, setData] = useState(null);
  const [archive, setArchive] = useState(
    ["fr", "de", "ar"].includes(lang) ? lang : "fr",
  );
  useEffect(() => {
    if (["fr", "de", "ar"].includes(lang)) setArchive(lang);
  }, [lang]);
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
          <p>{t.wikiAutoInstructions}</p>
          <label>
            {t.wikiArchiveLanguage}
            <select
              value={archive}
              onChange={(e) => setArchive(e.target.value)}
            >
              {data?.wiki.map((w) => (
                <option key={w.filename} value={w.language}>
                  {
                    {
                      fr: "Français",
                      de: "Deutsch",
                      ar: "العربية",
                      en: "English",
                    }[w.language]
                  }{" "}
                  · {(w.bytes / 1e9).toFixed(2)} GB
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {data?.wikiReader && data.wiki.some((w) => w.language === archive) && (
        <iframe
          className="wiki-reader-frame"
          key={archive + "-" + lang}
          title={t.wiki}
          src={`http://127.0.0.1:8108/www/index.html?refugeArchive=${archive}&overrideBrowserLanguage=${lang}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads"
        />
      )}
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
