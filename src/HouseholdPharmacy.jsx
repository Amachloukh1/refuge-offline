import { Icon } from "./components";
import {
  householdPharmacyLabels,
  householdPharmacySources,
  householdPharmacyText,
} from "./household-pharmacy-text";
import "./household-pharmacy.css";

const pharmacyUi = {
  fr: {
    illustration: "Illustration IA · pas une photo de médicament",
    medicines: "Quel symptôme ? Quel exemple ?",
    medicineNote:
      "Des exemples sans marque, à choisir selon les besoins du foyer.",
    supplies: "Le matériel de soin, à part",
    suppliesNote: "Ces fournitures complètent les médicaments.",
    precautions: "Conservation et traitements prescrits",
  },
  de: {
    illustration: "KI-Illustration · kein Arzneimittelfoto",
    medicines: "Welche Beschwerden? Welches Beispiel?",
    medicineNote:
      "Markenfreie Beispiele, passend zum Bedarf Ihres Haushalts auswählen.",
    supplies: "Pflegehilfsmittel, separat",
    suppliesNote: "Diese Hilfsmittel ergänzen die Arzneimittel.",
    precautions: "Aufbewahrung und verordnete Medikamente",
  },
  en: {
    illustration: "AI illustration · not a medicine photograph",
    medicines: "Which symptom? Which example?",
    medicineNote:
      "Unbranded examples to choose according to your household's needs.",
    supplies: "First-aid equipment, separately",
    suppliesNote: "These supplies complement the medicines.",
    precautions: "Storage and prescribed treatments",
  },
  ar: {
    illustration: "رسم بالذكاء الاصطناعي · ليس صورة لدواء",
    medicines: "ما العرض؟ وما المثال؟",
    medicineNote: "أمثلة دون علامات تجارية، تُختار حسب احتياجات الأسرة.",
    supplies: "مستلزمات العناية، بشكل منفصل",
    suppliesNote: "هذه المستلزمات تكمل الأدوية.",
    precautions: "التخزين والعلاجات الموصوفة",
  },
  ru: { illustration: "ИИ-иллюстрация · не фотография лекарства" },
  zh: { illustration: "AI 插画 · 非药品实拍照片" },
  es: { illustration: "Ilustración de IA · no es una foto de un medicamento" },
  pt: {
    illustration: "Ilustração de IA · não é uma fotografia de medicamento",
  },
};

function PharmacyCard({ row, imageLabel, imageLang }) {
  const [id, title, text, kind] = row;
  return (
    <li className={`household-pharmacy-item household-pharmacy-item--${kind}`}>
      <figure className="household-pharmacy-figure">
        <img
          src={`/illustrations/medicine-${id}.webp`}
          alt={title}
          width="640"
          height="400"
          loading="lazy"
          decoding="async"
        />
        <figcaption lang={imageLang}>{imageLabel}</figcaption>
      </figure>
      <div className="household-pharmacy-card-copy">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
    </li>
  );
}

export default function HouseholdPharmacy({ lang = "fr" }) {
  const labels = householdPharmacyLabels[lang] || householdPharmacyLabels.en;
  const contentLang = householdPharmacyText[lang] ? lang : "en";
  const c = householdPharmacyText[contentLang];
  const ui = pharmacyUi[contentLang];
  const imageLabel =
    pharmacyUi[lang]?.illustration || pharmacyUi.en.illustration;
  const medicineRows = c.rows.filter((row) => row[3] === "medicine");
  const supplyRows = c.rows.filter((row) => row[3] === "supply");
  return (
    <section
      id="household-pharmacy"
      className="household-pharmacy panel"
      data-testid="household-pharmacy"
      aria-labelledby="household-pharmacy-title"
    >
      <header className="household-pharmacy-heading">
        <div className="household-pharmacy-heading-copy">
          <p className="household-pharmacy-eyebrow" lang={contentLang}>
            <Icon name="Cross" size={18} aria-hidden="true" />
            {c.eyebrow}
          </p>
          <h2
            id="household-pharmacy-title"
            lang={lang}
            dir={lang === "ar" ? "rtl" : undefined}
          >
            {labels.title}
          </h2>
          <p
            className="household-pharmacy-intro"
            lang={contentLang}
            dir={contentLang === "ar" ? "rtl" : undefined}
          >
            {c.intro}
          </p>
        </div>
        <figure className="household-pharmacy-hero">
          <img
            src="/illustrations/pharmacy-header.webp"
            alt=""
            width="640"
            height="400"
            loading="lazy"
            decoding="async"
          />
          <figcaption lang={lang}>{imageLabel}</figcaption>
        </figure>
      </header>
      {labels.fallback && (
        <p className="household-pharmacy-fallback" lang={lang}>
          {labels.fallback}
        </p>
      )}
      <div
        className="household-pharmacy-content"
        lang={contentLang}
        dir={contentLang === "ar" ? "rtl" : "ltr"}
      >
        <p className="household-pharmacy-advice">
          <span aria-hidden="true">
            <Icon name="CircleHelp" size={20} />
          </span>
          <span>{c.advice}</span>
        </p>
        {[
          {
            kind: "medicine",
            title: ui.medicines,
            note: ui.medicineNote,
            rows: medicineRows,
          },
          {
            kind: "supply",
            title: ui.supplies,
            note: ui.suppliesNote,
            rows: supplyRows,
          },
        ].map(({ kind, title, note, rows }) => (
          <section
            className={`household-pharmacy-group household-pharmacy-group--${kind}`}
            key={kind}
            aria-labelledby={`household-pharmacy-${kind}-title`}
          >
            <div className="household-pharmacy-group-heading">
              <span
                className="household-pharmacy-group-symbol"
                aria-hidden="true"
              >
                <Icon
                  name={kind === "medicine" ? "Cross" : "Package"}
                  size={22}
                />
              </span>
              <div>
                <h3 id={`household-pharmacy-${kind}-title`}>{title}</h3>
                <p>{note}</p>
              </div>
              <span className="household-pharmacy-count">{rows.length}</span>
            </div>
            <ul className="household-pharmacy-list">
              {rows.map((row) => (
                <PharmacyCard
                  key={row[0]}
                  row={row}
                  imageLabel={imageLabel}
                  imageLang={lang}
                />
              ))}
            </ul>
          </section>
        ))}
        <details className="household-pharmacy-details">
          <summary>{ui.precautions}</summary>
          <p className="household-pharmacy-limits">{c.limits}</p>
          <p>{c.storage}</p>
        </details>
        <footer className="household-pharmacy-footer">
          <details>
            <summary>{c.sources}</summary>
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
          </details>
          <p>{c.offline}</p>
        </footer>
      </div>
    </section>
  );
}
