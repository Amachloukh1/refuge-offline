import { extraEquipmentText } from "./locales/extra-ui-text.js";
import { contentLanguage } from "./locale-policy";
import { useState } from "react";
import { Icon, Notice, External } from "./components";
import baseCatalog from "../content/equipment.catalog.json";
import additions from "../content/equipment.additions.json";
import imageCatalog from "../content/equipment.images.json";
import HouseholdPharmacy from "./HouseholdPharmacy";
import {
  equipmentExtraText,
  equipmentPriceNote,
  equipmentUiText,
} from "./equipment-extra-text";
import "./equipment-showcase.css";
const catalog = [...additions, ...baseCatalog];
const station = catalog.find((item) => item.id === "solar1024");
const generatedIds = new Set([
  "starlink",
  "balcony-solar",
  "powerbank",
  "firstaid",
  "food",
  "hygiene",
  "warmth",
  "alarms",
  "documents",
  "navigation",
  "tools",
]);
const shopHost = (url) => new URL(url).hostname.replace(/^www\./, "");

function EquipmentPhoto({ item, title, copy }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [illustrationFailed, setIllustrationFailed] = useState(false);
  const photo = imageCatalog.find((image) => image.id === item.id);
  const showPhoto = photo && !photoFailed;
  const showIllustration =
    !showPhoto && generatedIds.has(item.id) && !illustrationFailed;
  return (
    <figure
      className={"equipment-photo" + (showIllustration ? " generated" : "")}
    >
      {showPhoto || showIllustration ? (
        <img
          src={
            showPhoto
              ? "/equipment-photos/" + (photo.filename || item.id + ".jpg")
              : "/illustrations/" + item.id + ".webp"
          }
          alt={title}
          width="480"
          height="260"
          loading="lazy"
          onError={() =>
            showPhoto ? setPhotoFailed(true) : setIllustrationFailed(true)
          }
        />
      ) : (
        <div className="equipment-illustration" aria-hidden="true">
          <Icon name={item.icon} size={66} />
        </div>
      )}
      <figcaption>{showPhoto ? copy.photo : copy.illustration}</figcaption>
    </figure>
  );
}

const copy = {
  fr: {
    tab: "Équipement à acheter",
    title: "Préparer son équipement, par priorité",
    intro:
      "Commencez par l’eau, la nourriture habituelle, les traitements prescrits et un moyen de recevoir les consignes. Achetez progressivement selon votre foyer et ce que vous possédez déjà.",
    all: "Tout",
    essential: "Priorité 1 · besoins essentiels",
    energy: "Priorité 2 · énergie",
    extra: "Priorité 3 · compléments",
    owned: "Déjà équipé",
    observed: "Prix observé",
    unknown: "Prix à vérifier",
    seller: "Vendeur observé",
    subtotal: "Total indicatif restant · références avec prix",
    excluded:
      "Une unité de chaque référence restante ; eau, nourriture, quantités familiales et articles sans prix à ajouter. Cocher un article ne modifie pas vos stocks.",
    source: "Notice du fabricant",
    watts: "Consommation totale mesurée (mini-PC + écran), W",
    hours: "Autonomie estimée sans soleil",
    offline:
      "Les fiches et prix enregistrés restent consultables sans Internet ; les boutiques demandent une connexion.",
  },
  de: {
    tab: "Ausrüstung kaufen",
    title: "Ausrüstung nach Priorität vorbereiten",
    intro:
      "Zuerst Trinkwasser, gewohnte Lebensmittel, verordnete Medikamente und ein Radio einplanen. Nach Haushaltsbedarf und vorhandener Ausrüstung schrittweise kaufen.",
    all: "Alle",
    essential: "Priorität 1 · Grundbedarf",
    energy: "Priorität 2 · Energie",
    extra: "Priorität 3 · Ergänzungen",
    owned: "Bereits vorhanden",
    observed: "Abgelesener Preis",
    unknown: "Preis prüfen",
    seller: "Beobachteter Händler",
    subtotal: "Verbleibende Richtsumme · Artikel mit Preis",
    excluded:
      "Je ein Stück pro fehlender Referenz; Wasser, Lebensmittel, Haushaltsmengen und Artikel ohne Preis zusätzlich berücksichtigen. Markieren ändert keine Vorräte.",
    source: "Herstelleranleitung",
    watts: "Gemessener Gesamtverbrauch (Mini-PC + Bildschirm), W",
    hours: "Geschätzte Laufzeit ohne Sonne",
    offline:
      "Gespeicherte Angaben sind offline lesbar; Shops benötigen Internet.",
  },
  en: {
    tab: "Equipment to buy",
    title: "Prepare equipment by priority",
    intro:
      "Start with drinking water, familiar food, prescribed medicines and a way to receive public instructions. Buy gradually for your household and existing equipment.",
    all: "All",
    essential: "Priority 1 · essentials",
    energy: "Priority 2 · power",
    extra: "Priority 3 · extras",
    owned: "Already equipped",
    observed: "Observed price",
    unknown: "Check price",
    seller: "Observed seller",
    subtotal: "Indicative remaining total · priced references",
    excluded:
      "One of each remaining reference; add water, food, household quantities and unpriced items. Checking an item does not change your inventory.",
    source: "Manufacturer manual",
    watts: "Measured total consumption (mini-PC + screen), W",
    hours: "Estimated runtime without sunshine",
    offline:
      "Saved information works offline; shopping links require Internet.",
  },
  ar: {
    tab: "معدات للشراء",
    title: "تجهيز المعدات حسب الأولوية",
    intro:
      "ابدأ بمياه الشرب والطعام المعتاد والأدوية الموصوفة وراديو لسماع التعليمات العامة. اشترِ تدريجياً حسب أفراد الأسرة وما تملكه بالفعل.",
    all: "الكل",
    essential: "الأولوية 1 · الأساسيات",
    energy: "الأولوية 2 · الطاقة",
    extra: "الأولوية 3 · إضافات",
    owned: "متوفر لدي",
    observed: "السعر المشاهد",
    unknown: "تحقق من السعر",
    seller: "البائع المشاهد",
    subtotal: "المجموع المرجعي المتبقي · المنتجات المسعّرة",
    excluded:
      "قطعة واحدة من كل مرجع متبقٍ؛ أضف الماء والطعام وكميات الأسرة والمواد دون سعر. وضع علامة لا يغير المخزون.",
    source: "دليل الشركة المصنعة",
    watts: "الاستهلاك الكلي المقاس للحاسوب والشاشة بالواط",
    hours: "مدة التشغيل التقديرية دون شمس",
    offline: "المعلومات المحفوظة تعمل دون إنترنت؛ روابط المتاجر تحتاج اتصالاً.",
  },
};
export function equipmentLabel(lang) {
  return (copy[lang] || copy.fr).tab;
}
export default function Equipment({ lang = "fr", bought = [], toggleBought }) {
  const c = copy[lang] || copy.fr;
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const x = equipmentExtraText[lang] || equipmentExtraText.en;
  const u = equipmentUiText[lang] || equipmentUiText.en;
  const [watts, setWatts] = useState(40);
  const money = (n) =>
    new Intl.NumberFormat(
      { fr: "fr-FR", de: "de-DE", en: "en-GB", ar: "ar-DE" }[lang] || lang,
      { style: "currency", currency: "EUR" },
    ).format(n);
  const remaining = catalog
    .filter((p) => !bought.includes(`equipment-${p.id}`))
    .reduce((s, p) => s + (p.priceEur || 0), 0);
  return (
    <section className="equipment-section" data-testid="equipment">
      <div className="panel padded equipment-hero">
        <img
          className="equipment-hero-image"
          src="/illustrations/equipment-header.webp"
          alt=""
          width="1536"
          height="600"
        />
        <div className="equipment-hero-content">
          <h2>{c.title}</h2>
          <p>{c.intro}</p>
          <strong className="equipment-total">
            {c.subtotal} : {money(remaining)}
          </strong>
          <details className="equipment-intro-details">
            <summary>{x.source}</summary>
            <Notice>{equipmentPriceNote[lang] || equipmentPriceNote.en}</Notice>
            <p className="muted">{c.offline}</p>
            <p>{c.excluded}</p>
            <p className="equipment-photo-note">{x.photos}</p>
          </details>
        </div>
      </div>
      {filter !== "pharmacy" && (
        <button
          className="equipment-pharmacy-jump panel"
          data-testid="equipment-pharmacy-jump"
          onClick={() => {
            setFilter("pharmacy");
            setQuery("");
          }}
        >
          <img
            src="/illustrations/firstaid.webp"
            alt=""
            width="160"
            height="120"
          />
          <span>
            <strong>{x.pharmacy}</strong>
            <span>{u.pharmacyIntro}</span>
          </span>
          <span className="equipment-pharmacy-action">{u.pharmacyOpen} →</span>
        </button>
      )}
      <label className="equipment-search">
        <Icon name="Search" size={20} />
        <input
          type="search"
          aria-label={x.search}
          placeholder={x.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="tabs section-tabs equipment-filters">
        {["all", "essential", "energy", "extra", "pharmacy"].map((f) => (
          <button
            key={f}
            data-testid={"equipment-filter-" + f}
            aria-pressed={filter === f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f === "pharmacy" ? x.pharmacy : c[f]}
          </button>
        ))}
      </div>
      {filter !== "pharmacy" && (
        <div className="purchase-grid equipment-grid">
          {catalog
            .filter((p) => filter === "all" || p.priority === filter)
            .filter((p) =>
              Object.values(p.text)
                .flat()
                .join(" ")
                .toLocaleLowerCase()
                .includes(query.trim().toLocaleLowerCase()),
            )
            .map((p) => {
              const text = p.text[contentLanguage(lang)] || p.text.en;
              return (
                <article
                  className="panel padded equipment-card"
                  key={p.id}
                  data-equipment-id={p.id}
                >
                  <EquipmentPhoto item={p} title={text[0]} copy={x} />
                  <div className="equipment-heading">
                    <span className="topic-icon">
                      <Icon name={p.icon} size={25} />
                    </span>
                    <span>{c[p.priority]}</span>
                  </div>
                  {contentLanguage(lang) !== lang && (
                    <p className="translation-fallback">{x.fallback}</p>
                  )}
                  <h3 lang={contentLanguage(lang)}>{text[0]}</h3>
                  <p lang={contentLanguage(lang)}>{text[1]}</p>
                  <p className="equipment-detail" lang={contentLanguage(lang)}>
                    {text[2]}
                  </p>
                  <strong className="equipment-price">
                    {p.priceEur != null ? money(p.priceEur) : c.unknown}
                  </strong>
                  {p.priceEur != null && (
                    <small>
                      {p.priceMethod === "calculated-vat"
                        ? u.calculatedVat
                        : c.observed}{" "}
                      · {p.priceProvider || shopHost(p.url)} ·{" "}
                      {p.priceCheckedAt || p.observedAt || "—"}
                      {p.seller && (
                        <>
                          <br />
                          {c.seller} : {p.seller}
                        </>
                      )}
                    </small>
                  )}
                  {p.availability === "out-of-stock" && (
                    <span className="equipment-stock">{u.soldOut}</span>
                  )}
                  {p.priceKind === "category" && (
                    <small className="equipment-category-note">
                      {u.category}
                    </small>
                  )}
                  <External href={p.url}>
                    {p.purchaseKind === "search" ? u.search : u.shop} ·{" "}
                    {shopHost(p.url)}
                  </External>
                  {p.alternatives?.length > 0 && (
                    <div className="equipment-alternatives">
                      {p.alternatives.map((alternative) => (
                        <External key={alternative.url} href={alternative.url}>
                          {alternative.url.includes("/sch/") ||
                          alternative.url.includes("/s?")
                            ? u.search + " · "
                            : ""}
                          {alternative.label}
                        </External>
                      ))}
                    </div>
                  )}
                  {p.source && <External href={p.source}>{x.source}</External>}
                  <label className="equipment-owned">
                    <input
                      type="checkbox"
                      checked={bought.includes(`equipment-${p.id}`)}
                      onChange={() => toggleBought(`equipment-${p.id}`)}
                    />
                    {c.owned}
                  </label>
                </article>
              );
            })}
        </div>
      )}
      {(filter === "all" || filter === "pharmacy") && (
        <HouseholdPharmacy lang={lang} />
      )}
      {filter !== "pharmacy" &&
        !catalog.some(
          (p) =>
            (filter === "all" || p.priority === filter) &&
            Object.values(p.text)
              .flat()
              .join(" ")
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
        ) && (
          <p className="equipment-empty" role="status">
            {x.empty}
          </p>
        )}
      {filter !== "pharmacy" && (
        <div className="panel padded energy-estimate">
          <h3>
            {c.hours} · DELTA 3 Classic {station.capacityWh} Wh
          </h3>
          <label>
            {c.watts}
            <input
              aria-label={c.watts}
              type="number"
              min="1"
              max={station.ratedWatts}
              data-testid="equipment-watts"
              value={watts}
              onChange={(e) => setWatts(e.target.value)}
            />
          </label>
          <output data-testid="equipment-runtime" aria-live="polite">
            {Number(watts) > 0 && Number(watts) <= station.ratedWatts
              ? `${((station.capacityWh * 0.7) / Number(watts)).toFixed(1)} h`
              : "—"}
          </output>
          <p className="equipment-energy-formula">
            {station.capacityWh} Wh × 70 % ÷ W · {station.ratedWatts} W max
          </p>
          <p>{u.energyNote}</p>
        </div>
      )}
    </section>
  );
}
Object.assign(copy, extraEquipmentText);
