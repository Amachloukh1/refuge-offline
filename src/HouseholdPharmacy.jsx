import { Icon } from "./components";
import {
  householdPharmacyLabels,
  householdPharmacySources,
  householdPharmacyText,
} from "./household-pharmacy-text";
import "./household-pharmacy.css";

export default function HouseholdPharmacy({ lang = "fr" }) {
  const labels = householdPharmacyLabels[lang] || householdPharmacyLabels.en;
  const contentLang = householdPharmacyText[lang] ? lang : "en";
  const c = householdPharmacyText[contentLang];
  return (
    <section
      className="household-pharmacy panel padded"
      data-testid="household-pharmacy"
    >
      <header className="household-pharmacy-heading">
        <span className="household-pharmacy-symbol" aria-hidden="true">
          <Icon name="Cross" size={25} />
        </span>
        <div>
          <p className="household-pharmacy-eyebrow" lang={contentLang}>
            {c.eyebrow}
          </p>
          <h2>{labels.title}</h2>
        </div>
      </header>
      {labels.fallback && (
        <p className="household-pharmacy-fallback" lang={lang}>
          {labels.fallback}
        </p>
      )}
      <div lang={contentLang} dir={contentLang === "ar" ? "rtl" : "ltr"}>
        <p>{c.intro}</p>
        <p className="household-pharmacy-advice">{c.advice}</p>
        <ul className="household-pharmacy-list">
          {c.rows.map(([id, title, text, kind]) => (
            <li key={id} className="household-pharmacy-item">
              <span className="household-pharmacy-marker" aria-hidden="true">
                <Icon
                  name={kind === "supply" ? "Package" : "Cross"}
                  size={18}
                />
              </span>
              <div>
                <span className="household-pharmacy-kind">
                  {kind === "supply" ? c.supplies : c.selection}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="household-pharmacy-limits">{c.limits}</p>
        <p>{c.storage}</p>
        <footer className="household-pharmacy-footer">
          <h3>{c.sources}</h3>
          <ul>
            {householdPharmacySources.map(({ title, url }) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  lang="de"
                >
                  {title} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p>{c.offline}</p>
        </footer>
      </div>
    </section>
  );
}
