import { Icon, Button, Notice, Progress } from "./components";
import { guideData } from "./data.js";
import { hazards } from "./hazards.js";
import { preparednessText } from "./preparedness-text.js";
import { contentLanguage } from "./locale-policy.js";
import { translations } from "./i18n.js";
import SectionIllustration from "./SectionIllustration";
import {
  sanitizeReadiness,
  sanitizeEnergy,
  energyPlan,
  readinessSummary,
} from "./preparedness.js";

export function EmergencyNow({ lang, onGuide, onHazard, onHealth }) {
  const t = preparednessText[lang] || preparednessText.en;
  const locale = contentLanguage(lang);
  const water = guideData.find((guide) => guide.id === "water");
  return (
    <div className="preparedness-page emergency-now">
      {locale !== lang && (
        <p className="translation-fallback">
          {translations[lang]?.documentFallback}
        </p>
      )}
      <div className="emergency-illustrated-intro">
        <Notice tone="warning" icon="ShieldCheck">
          <strong>{t.emergency}</strong> <a href="tel:112">112</a>
        </Notice>
        <SectionIllustration image="/illustrations/page-emergency.webp" />
      </div>
      <div className="preparedness-grid">
        {["blackout", "homefire", "flood", "storm", "heat", "earthquake"].map(
          (id) => {
            const hazard = hazards.find((item) => item.id === id);
            const content = hazard[locale];
            return (
              <section className="panel padded emergency-scenario" key={id}>
                <Icon name={hazard.icon} />
                <h2 lang={locale}>{content.title}</h2>
                <p lang={locale}>{content.during[0]}</p>
                <Button
                  variant="outline"
                  icon="ArrowRight"
                  onClick={() => onHazard(id)}
                >
                  {t.open}
                </Button>
              </section>
            );
          },
        )}
        <section className="panel padded emergency-scenario">
          <Icon name="Droplets" />
          <h2>{t.waterScenario}</h2>
          <p>{water.intro[locale]}</p>
          <Button variant="outline" onClick={() => onGuide("water")}>
            {t.open}
          </Button>
        </section>
        <section className="panel padded emergency-scenario">
          <Icon name="HeartPulse" />
          <h2>{t.aid}</h2>
          <p>{t.aidText}</p>
          <div className="preparedness-actions">
            {["bleeding", "burn", "unconscious"].map((id) => (
              <Button key={id} variant="outline" onClick={() => onHealth(id)}>
                {t[id]}
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ReadinessDashboard({
  lang,
  water,
  people,
  days,
  readiness,
  setReadiness,
  onNavigate,
}) {
  const t = preparednessText[lang] || preparednessText.en;
  const r = sanitizeReadiness(readiness);
  const summary = readinessSummary(r, water);
  const format = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString(lang, {
      maximumFractionDigits: 1,
    });
  function toggle(key, checked) {
    setReadiness((previous) => ({
      ...sanitizeReadiness(previous),
      [key]: checked,
    }));
  }
  const areas = [
    ["food", "inventory", "inventory"],
    ["personalMeds", "health", "health"],
    ["energy", "energy", "equipment"],
    ["documents", "checklist", "checklist"],
    ["evacBag", "checklist", "checklist"],
  ];
  return (
    <section className="preparedness-page readiness-dashboard">
      <SectionIllustration image="/illustrations/page-readiness.webp">
        <h2>{t.readiness}</h2>
        <p>{t.readinessNote}</p>
        <strong>
          {summary.confirmed} / {summary.total} {t.count}
        </strong>
        <Progress value={summary.percent} />
      </SectionIllustration>
      <div className="preparedness-grid">
        <section className="panel padded readiness-area">
          <Icon name="Droplets" />
          <h3>{t.water}</h3>
          <p>
            {format(people)} {t.people} · {format(days)} {t.days}
          </p>
          <p>
            {t.stock}: {format(water?.stock)} L · {t.target}:{" "}
            {format(water?.target)} L
          </p>
          <p>{t.waterBasis}</p>
          <label className="preparedness-check">
            <input
              type="checkbox"
              checked={r.waterConfirmed}
              onChange={(event) =>
                toggle("waterConfirmed", event.target.checked)
              }
            />
            <span>{t.waterConfirm}</span>
          </label>
          <p
            className={
              summary.waterReady
                ? "readiness-confirmed"
                : "readiness-incomplete"
            }
          >
            {summary.waterReady ? t.confirmed : t.incomplete}
          </p>
          <Button variant="outline" onClick={() => onNavigate("inventory")}>
            {t.inventory}
          </Button>
        </section>
        {areas.map(([key, page, link]) => (
          <section className="panel padded readiness-area" key={key}>
            <label className="preparedness-check">
              <input
                type="checkbox"
                checked={r[key]}
                onChange={(event) => toggle(key, event.target.checked)}
              />
              <span>{t[key]}</span>
            </label>
            <p
              className={
                r[key] ? "readiness-confirmed" : "readiness-incomplete"
              }
            >
              {r[key] ? t.confirmed : t.incomplete}
            </p>
            <Button variant="outline" onClick={() => onNavigate(page)}>
              {t[link]}
            </Button>
          </section>
        ))}
      </div>
    </section>
  );
}

export function EnergyPlanner({ lang, energy, setEnergy }) {
  const t = preparednessText[lang] || preparednessText.en;
  const e = sanitizeEnergy(energy);
  const plan = energyPlan(e);
  const format = (n) =>
    n === null ? "—" : n.toLocaleString(lang, { maximumFractionDigits: 2 });
  function update(key, value) {
    setEnergy((previous) =>
      sanitizeEnergy({
        ...previous,
        [key]: value,
        ...(key !== "measurementConfirmed" && key !== "ecoMode"
          ? { measurementConfirmed: false }
          : {}),
      }),
    );
  }
  const fields = [
    ["computerWatts", 0, 10000],
    ["monitorWatts", 0, 10000],
    ["otherWatts", 0, 100000],
    ["capacityWh", 0, 1000000],
    ["reservePercent", 0, 100],
    ["hoursPerDay", 0, 24],
    ["pricePerKWh", 0, 100],
    ["chargeEfficiency", 1, 100],
  ];
  return (
    <div className="preparedness-page energy-planner">
      <Notice icon="Battery">
        <strong>{e.measurementConfirmed ? t.measured : t.assumed}</strong>
        <br />
        {t.energyNote}
      </Notice>
      <section className="panel padded">
        <h2>{t.energyTitle}</h2>
        <div className="energy-input-grid">
          {fields.map(([key, min, max]) => (
            <label key={key} className="energy-field">
              <span>{t[key]}</span>
              <input
                type="number"
                min={min}
                max={max}
                step="any"
                value={e[key]}
                onChange={(event) => update(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <label className="preparedness-check">
          <input
            type="checkbox"
            checked={e.measurementConfirmed}
            onChange={(event) =>
              update("measurementConfirmed", event.target.checked)
            }
          />
          <span>{t.measurementConfirmed}</span>
        </label>
      </section>
      <section className="panel padded energy-results" aria-live="polite">
        <dl>
          {[
            [t.total, `${format(plan.totalWatts)} W`],
            [t.usable, `${format(plan.usableWh)} Wh`],
            [t.runtime, format(plan.hours)],
            [t.duration, format(plan.days)],
            [t.charge, `${format(plan.chargeCost)} €`],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {(plan.hours === null || plan.days === null) && <p>{t.unavailable}</p>}
        <p>{t.chargeNote}</p>
      </section>
      <section className="panel padded">
        <label className="preparedness-check">
          <input
            type="checkbox"
            checked={e.ecoMode}
            onChange={(event) => update("ecoMode", event.target.checked)}
          />
          <strong>{t.ecoMode}</strong>
        </label>
        <p>{t.ecoNote}</p>
      </section>
    </div>
  );
}
