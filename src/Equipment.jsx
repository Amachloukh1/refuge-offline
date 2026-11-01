import { extraEquipmentText } from "./locales/extra-ui-text.js";
import { contentLanguage } from "./locale-policy";
import { useState } from "react";
import { Icon, Notice, External } from "./components";
import catalog from "../content/equipment.catalog.json";

const copy = {
  fr: {
    tab: "Équipement à acheter",
    title: "Préparer son équipement, par priorité",
    intro:
      "Commencez par l’eau, la nourriture habituelle, les traitements prescrits et un moyen de recevoir les consignes. Achetez progressivement selon votre foyer et ce que vous possédez déjà.",
    prices:
      "Prix Amazon.de relevés le 31/10/2026, TTC affichée, hors frais éventuels. Ce sont des repères enregistrés hors ligne : prix, vendeurs et disponibilité peuvent changer. Aucun lien affilié. Les recherches sans prix demandent une vérification avant achat.",
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
    shop: "Voir sur Amazon.de",
    search: "Chercher sur Amazon.de",
    source: "Notice du fabricant",
    watts: "Consommation totale mesurée (mini-PC + écran), W",
    hours: "Autonomie estimée sans soleil",
    energyNote:
      "Calcul indicatif : 256 Wh × 70 % ÷ watts, avec 30 % de réserve/pertes supposées. Mesurez votre installation : froid, vieillissement et consommation à vide réduisent l’autonomie. Le soleil en hiver en Saxe ne garantit aucune recharge quotidienne. Cette petite station ne convient pas au chauffage électrique ni à une bouilloire.",
    offline:
      "Les fiches et prix enregistrés restent consultables sans Internet ; les boutiques demandent une connexion.",
  },
  de: {
    tab: "Ausrüstung kaufen",
    title: "Ausrüstung nach Priorität vorbereiten",
    intro:
      "Zuerst Trinkwasser, gewohnte Lebensmittel, verordnete Medikamente und ein Radio einplanen. Nach Haushaltsbedarf und vorhandener Ausrüstung schrittweise kaufen.",
    prices:
      "Amazon.de-Preise am 31.10.2026 abgelesen, angezeigte MwSt., ggf. zuzüglich Versand. Offline gespeicherte Richtwerte: Preise, Händler und Verfügbarkeit können sich ändern. Keine Affiliate-Links. Suchlinks ohne Preis vor dem Kauf prüfen.",
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
    shop: "Auf Amazon.de ansehen",
    search: "Auf Amazon.de suchen",
    source: "Herstelleranleitung",
    watts: "Gemessener Gesamtverbrauch (Mini-PC + Bildschirm), W",
    hours: "Geschätzte Laufzeit ohne Sonne",
    energyNote:
      "Richtrechnung: 256 Wh × 70 % ÷ Watt, angenommene 30 % Reserve/Verluste. Eigene Geräte messen: Kälte, Alterung und Leerlauf verkürzen die Laufzeit. Im sächsischen Winter ist tägliches Solarladen nicht garantiert. Diese kleine Station reicht nicht für Elektroheizung oder Wasserkocher.",
    offline:
      "Gespeicherte Angaben sind offline lesbar; Shops benötigen Internet.",
  },
  en: {
    tab: "Equipment to buy",
    title: "Prepare equipment by priority",
    intro:
      "Start with drinking water, familiar food, prescribed medicines and a way to receive public instructions. Buy gradually for your household and existing equipment.",
    prices:
      "Amazon.de prices observed on 31 October 2026, displayed VAT, possible delivery charges extra. Offline reference prices: sellers, prices and availability may change. No affiliate links. Search links without a price need checking before purchase.",
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
    shop: "View on Amazon.de",
    search: "Search Amazon.de",
    source: "Manufacturer manual",
    watts: "Measured total consumption (mini-PC + screen), W",
    hours: "Estimated runtime without sunshine",
    energyNote:
      "Illustrative calculation: 256 Wh × 70% ÷ watts, assuming 30% reserve/losses. Measure your setup: cold, ageing and idle consumption reduce runtime. Daily solar charging is not guaranteed during Saxony winters. This small station cannot run electric heating or a kettle.",
    offline:
      "Saved information works offline; shopping links require Internet.",
  },
  ar: {
    tab: "معدات للشراء",
    title: "تجهيز المعدات حسب الأولوية",
    intro:
      "ابدأ بمياه الشرب والطعام المعتاد والأدوية الموصوفة وراديو لسماع التعليمات العامة. اشترِ تدريجياً حسب أفراد الأسرة وما تملكه بالفعل.",
    prices:
      "أسعار Amazon.de شوهدت في 31 أكتوبر 2026 وتشمل الضريبة المعروضة، وقد تضاف رسوم الشحن. هذه أسعار مرجعية محفوظة دون إنترنت ويمكن أن يتغير السعر والبائع والتوفر. لا توجد روابط عمولة. تحقق من سعر نتائج البحث قبل الشراء.",
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
    shop: "عرض على Amazon.de",
    search: "بحث على Amazon.de",
    source: "دليل الشركة المصنعة",
    watts: "الاستهلاك الكلي المقاس للحاسوب والشاشة بالواط",
    hours: "مدة التشغيل التقديرية دون شمس",
    energyNote:
      "حساب تقريبي: 256 واط ساعة × 70٪ ÷ الواط، بافتراض احتياطي وخسائر 30٪. قِس أجهزتك؛ البرد وتقادم البطارية واستهلاكها الذاتي يقللون المدة. الشحن الشمسي اليومي غير مضمون في شتاء ساكسونيا. هذه المحطة الصغيرة لا تناسب التدفئة الكهربائية أو غلاية الماء.",
    offline: "المعلومات المحفوظة تعمل دون إنترنت؛ روابط المتاجر تحتاج اتصالاً.",
  },
};
export function equipmentLabel(lang) {
  return (copy[lang] || copy.fr).tab;
}
export default function Equipment({ lang = "fr", bought = [], toggleBought }) {
  const c = copy[lang] || copy.fr;
  const [filter, setFilter] = useState("all");
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
      <div className="panel padded">
        <h2>{c.title}</h2>
        <p>{c.intro}</p>
        <Notice>{c.prices}</Notice>
        <p className="muted">{c.offline}</p>
        <strong className="equipment-total">
          {c.subtotal} : {money(remaining)}
        </strong>
        <p>{c.excluded}</p>
      </div>
      <div className="tabs section-tabs equipment-filters">
        {["all", "essential", "energy", "extra"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {c[f]}
          </button>
        ))}
      </div>
      <div className="purchase-grid equipment-grid">
        {catalog
          .filter((p) => filter === "all" || p.priority === filter)
          .map((p) => {
            const text = p.text[contentLanguage(lang)] || p.text.en;
            return (
              <article
                className="panel padded equipment-card"
                key={p.id}
                data-equipment-id={p.id}
              >
                <div className="equipment-heading">
                  <span className="topic-icon">
                    <Icon name={p.icon} size={25} />
                  </span>
                  <span>{c[p.priority]}</span>
                </div>
                <h3>{text[0]}</h3>
                <p>{text[1]}</p>
                <p className="equipment-detail">{text[2]}</p>
                <strong className="equipment-price">
                  {p.priceEur != null ? money(p.priceEur) : c.unknown}
                </strong>
                {p.priceEur != null && (
                  <small>
                    {c.observed} · 31/10/2026
                    <br />
                    {c.seller} : {p.seller}
                  </small>
                )}
                <External href={p.url}>
                  {p.priceEur != null ? c.shop : c.search}
                </External>
                {p.source && <External href={p.source}>{c.source}</External>}
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
      <div className="panel padded energy-estimate">
        <h3>{c.hours} · RIVER 2 256 Wh</h3>
        <label>
          {c.watts}
          <input
            aria-label={c.watts}
            type="number"
            min="1"
            max="300"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
          />
        </label>
        <output>
          {Number(watts) > 0 && Number(watts) <= 300
            ? `${((256 * 0.7) / Number(watts)).toFixed(1)} h`
            : "—"}
        </output>
        <p>{c.energyNote}</p>
      </div>
    </section>
  );
}
Object.assign(copy, extraEquipmentText);
