import { useState, useEffect } from "react";
import { Icon, Button, Progress, Notice, External } from "./components";
import { checklistIds } from "./data";
import { languages } from "./i18n";

export function Health({ t, onAid, documents }) {
  return (
    <>
      <Notice tone="medical" icon="HeartPulse">
        {t.medicalNotice}
      </Notice>
      <div className="emergency-numbers">
        <a href="tel:112">
          <span>112</span>
          <div>
            <strong>{t.emergency}</strong>
            <small>DE · {t.country}</small>
          </div>
          <Icon name="ArrowRight" />
        </a>
        <a href="tel:116117">
          <span>116 117</span>
          <div>
            <strong>{t.nonEmergency}</strong>
            <small>DE · {t.country}</small>
          </div>
          <Icon name="ArrowRight" />
        </a>
      </div>
      <div className="health-grid">
        {[
          ["bleeding", "Droplets"],
          ["burn", "Flame"],
          ["unconscious", "UserRound"],
        ].map(([key, icon]) => (
          <button
            className="health-card panel"
            key={key}
            onClick={() => onAid(key)}
          >
            <span className="topic-icon health">
              <Icon name={icon} size={28} />
            </span>
            <h2>{t[key]}</h2>
            <p>{t.healthCardText}</p>
            <span className="text-button">
              {t.open}
              <Icon name="ArrowRight" size={18} />
            </span>
          </button>
        ))}
      </div>
      <div className="two-columns">
        <section className="panel padded">
          <h2>{t.personalMeds}</h2>
          <p>{t.medNotice}</p>
          <External href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Hausapotheke/hausapotheke_node.html">
            {t.medSource} · BBK
          </External>
        </section>
        <section className="panel padded">
          <h2>{t.medicalSources}</h2>
          <div className="reference-list">
            <External href="https://www.drk.de/hilfe-in-deutschland/erste-hilfe/">
              DRK · {t.firstaid}
            </External>
            <External href="https://medicalguidelines.msf.org/">
              MSF · {t.professional}
            </External>
            <External href="https://medlineplus.gov/languages/firstaid.html">
              MedlinePlus · {t.firstaid}
            </External>
          </div>
        </section>
      </div>
      {documents?.length > 0 && (
        <DocumentList
          t={t}
          documents={documents.filter((d) => d.id.startsWith("drk"))}
        />
      )}
    </>
  );
}
export function DocumentList({ t, documents }) {
  if (!documents.length) return null;
  return (
    <section className="panel padded downloaded-documents">
      <h2>{t.localDocuments}</h2>
      <p>{t.localDocumentsText}</p>
      <Notice icon="CircleHelp">{t.documentEdition}</Notice>
      <div className="document-list">
        {documents.map((d) => (
          <a
            key={d.id}
            href={`/documents/${d.filename}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="topic-icon">
              <Icon name="BookOpen" />
            </span>
            <div>
              <strong>{d.title}</strong>
              <small>
                {d.language.toUpperCase()} · {d.publisher} ·{" "}
                {(d.bytes / 1024 / 1024).toFixed(1)} MB
              </small>
            </div>
            <Icon name="ArrowRight" />
          </a>
        ))}
      </div>
    </section>
  );
}
export function Maps({ t }) {
  return (
    <>
      <div className="map-empty panel">
        <div className="map-pattern" aria-hidden="true">
          <Icon name="Map" size={90} />
        </div>
        <div>
          <h2>{t.mapsEmpty}</h2>
          <p>{t.mapsEmptyText}</p>
          <External href="https://organicmaps.app/">{t.mapsSource}</External>
        </div>
      </div>
      <section className="panel padded">
        <h2>{t.landmarks}</h2>
        <div className="landmark-list">
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <span className="topic-icon">
                <Icon name="MapPin" />
              </span>
              <div>
                <h3>{t[`landmark${n}`]}</h3>
                <p>{t.verifyLocal}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
export function Weather({ t }) {
  return (
    <>
      <Notice icon="RadioTower">{t.noMonitoring}</Notice>
      <div className="weather-grid">
        <section className="panel weather-main">
          <span className="empty-icon">
            <Icon name="CloudOff" size={60} />
          </span>
          <h2>{t.noWeather}</h2>
          <p>{t.noWeatherText}</p>
          <External href="https://www.dwd.de/">Deutscher Wetterdienst</External>
        </section>
        <div className="stack">
          <section className="panel padded">
            <Icon name="Radio" size={30} />
            <h2>{t.radio}</h2>
            <p>{t.radioText}</p>
            <External href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/In-der-Krise-informiert-sein/in-der-krise-informiert-sein_node.html">
              BBK · {t.radio}
            </External>
          </section>
          <section className="panel padded">
            <Icon name="ShieldCheck" size={30} />
            <h2>{t.alerts}</h2>
            <p>{t.alertText}</p>
            <External href="https://warnung.bund.de/">warnung.bund.de</External>
          </section>
        </div>
      </div>
    </>
  );
}
export function Videos({ t }) {
  return (
    <>
      <Notice icon="Video">
        <strong>{t.videoEmpty}</strong>
        <br />
        {t.videoText}
      </Notice>
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
          ["repairs", "Package", "videoRepairs", "https://www.sikana.tv/fr"],
        ].map(([key, icon, description, url]) => (
          <article className="panel video-card" key={key}>
            <div className={`video-cover ${key}`}>
              <Icon name={icon} size={58} />
              <span>{t.installLater}</span>
            </div>
            <div className="padded">
              <h2>{t[key]}</h2>
              <p>{t[description]}</p>
              <External href={url}>Sikana · {t.discover}</External>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function Preparation({
  t,
  checked,
  toggleCheck,
  family,
  setFamily,
  initialTab,
}) {
  const [tab, setTab] = useState(initialTab === "family" ? "family" : "check");
  const [saved, setSaved] = useState(false);
  return (
    <>
      <div className="tabs section-tabs">
        <button
          onClick={() => setTab("check")}
          className={tab === "check" ? "active" : ""}
        >
          {t.preparation}
        </button>
        <button
          onClick={() => setTab("family")}
          className={tab === "family" ? "active" : ""}
        >
          {t.familyPlan}
        </button>
      </div>
      {tab === "check" ? (
        <div className="two-columns preparation-columns">
          <section className="panel checklist">
            {checklistIds.map((id, i) => (
              <label key={id} className={checked.includes(id) ? "checked" : ""}>
                <input
                  type="checkbox"
                  checked={checked.includes(id)}
                  onChange={() => toggleCheck(id)}
                />
                <span>{t[id]}</span>
                <span className="step-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </label>
            ))}
          </section>
          <aside className="panel padded progress-panel">
            <span className="topic-icon">
              <Icon name="ClipboardCheck" size={32} />
            </span>
            <h2>{t.progress}</h2>
            <strong className="big-number">
              {checked.length}
              <small> / 8</small>
            </strong>
            <p>{t.stepsDone}</p>
            <Progress value={(checked.length / 8) * 100} />
            <p>{t.prepareSub}</p>
            <Button variant="outline wide" onClick={() => setTab("family")}>
              {t.family}
              <Icon name="ArrowRight" size={18} />
            </Button>
          </aside>
        </div>
      ) : (
        <section className="panel padded family-form">
          <h2>{t.family}</h2>
          <p>{t.planText}</p>
          <Notice>{t.privacy}</Notice>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setFamily(
                Object.fromEntries(
                  ["meeting", "contact", "instructions"].map((k) => [
                    k,
                    String(f.get(k)).slice(0, 1000),
                  ]),
                ),
              );
              setSaved(true);
            }}
          >
            {["meeting", "contact", "instructions"].map((k) => (
              <label key={k}>
                {t[k]}
                {k === "instructions" ? (
                  <textarea
                    name={k}
                    rows="3"
                    maxLength="1000"
                    defaultValue={family[k] || ""}
                    placeholder={t.initialInstructions}
                    onChange={() => setSaved(false)}
                  />
                ) : (
                  <input
                    name={k}
                    maxLength="200"
                    defaultValue={family[k] || ""}
                    placeholder={
                      t[k === "meeting" ? "initialMeeting" : "initialContact"]
                    }
                    onChange={() => setSaved(false)}
                  />
                )}
              </label>
            ))}
            <div className="form-actions">
              {saved && (
                <span role="status" className="success">
                  <Icon name="Check" size={18} />
                  {t.saved}
                </span>
              )}
              <Button type="submit" icon="Check">
                {t.save}
              </Button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
export function Settings({ t, lang, setLang, exportData, status }) {
  const [downloaded, setDownloaded] = useState(false);
  const [assets, setAssets] = useState(null);
  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then(setAssets)
      .catch(() => {});
  }, []);
  return (
    <div className="settings-grid">
      <section className="panel padded">
        <h2>{t.language}</h2>
        <div className="language-options">
          {Object.entries(languages).map(([id, name]) => (
            <button
              key={id}
              onClick={() => setLang(id)}
              className={id === lang ? "active" : ""}
              lang={id}
            >
              <span>{name}</span>
              {id === lang && <Icon name="Check" size={19} />}
            </button>
          ))}
        </div>
        <h2 className="spaced-title">{t.region}</h2>
        <p>{t.regionText}</p>
        <div className="country-tag">
          <span className="german-flag" />
          {t.country}
        </div>
      </section>
      <section className="panel padded">
        <h2>{t.localData}</h2>
        <p>{t.localDataText}</p>
        <Button
          icon="Download"
          variant="outline"
          onClick={() => {
            exportData();
            setDownloaded(true);
          }}
        >
          {t.export}
        </Button>
        {downloaded && (
          <p className="success" role="status">
            <Icon name="Check" size={18} />
            {t.exportDone}
          </p>
        )}
        <Notice>{t.privacy}</Notice>
      </section>
      <section className="panel padded">
        <h2>{t.services}</h2>
        <div className="service-list">
          {[
            [
              "Local Studio / Ollama",
              status?.available ? status.model : t.disconnected,
            ],
            [
              "Kiwix",
              assets?.wikiReader
                ? `${assets.wiki.length} · ${t.available}`
                : t.installLater,
            ],
            [t.maps, assets?.maps?.length ? t.available : t.installLater],
            [
              t.videos,
              assets?.videos?.length
                ? `${assets.videos.length} · ${t.available}`
                : t.installLater,
            ],
            ["Open WebUI", t.optional],
            ["Grocy", t.optional],
            [t.installedGuides, t.available],
          ].map(([name, state]) => (
            <div key={name}>
              <span>{name}</span>
              <small>{state}</small>
            </div>
          ))}
        </div>
        <p>{t.aiSetup}</p>
      </section>
      <section className="panel padded">
        <h2>{t.theme}</h2>
        <p>{t.themeText}</p>
        <div className="settings-decoration">
          <Icon name="Leaf" size={50} />
          <span>REFUGE</span>
        </div>
      </section>
    </div>
  );
}
