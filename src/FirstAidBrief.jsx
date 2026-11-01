import { External, Notice } from "./components";
import { contentLanguage } from "./locale-policy.js";
const steps = {
  bleeding: {
    url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/blutungen-und-blutstillung/blutungen/",
    fr: [
      "Saignement important : appelez le 112 et pressez fermement la plaie avec une compresse ou un tissu propre.",
      "Maintenez la pression jusqu’à la prise en charge. Couvrez la personne et surveillez sa respiration.",
    ],
    de: [
      "Bei starker Blutung 112 rufen und mit Kompresse oder sauberem Tuch fest auf die Wunde drücken.",
      "Druck bis zur Übernahme halten. Person zudecken und Atmung beobachten.",
    ],
    en: [
      "For severe bleeding call 112 and press firmly on the wound with a dressing or clean cloth.",
      "Maintain pressure until help takes over. Keep the person covered and monitor breathing.",
    ],
    ar: [
      "عند النزيف الشديد اتصل بـ112 واضغط بقوة على الجرح بشاش أو قماش نظيف.",
      "واصل الضغط حتى وصول المساعدة. غط المصاب وراقب التنفس.",
    ],
  },
  unconscious: {
    url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/bewusstlosigkeit/",
    fr: [
      "Personne inconsciente : appelez à l’aide, vérifiez la respiration pendant au plus 10 secondes et appelez le 112.",
      "Respiration normale : position latérale de sécurité et surveillance. Respiration absente ou anormale : commencez la réanimation, suivez le 112 et les instructions du défibrillateur.",
    ],
    de: [
      "Bewusstlos: Hilfe rufen, Atmung höchstens 10 Sekunden prüfen und 112 rufen.",
      "Normale Atmung: stabile Seitenlage und überwachen. Keine normale Atmung: Wiederbelebung beginnen, Leitstelle und AED-Anweisungen folgen.",
    ],
    en: [
      "Unconscious: shout for help, check breathing for no more than 10 seconds and call 112.",
      "Normal breathing: recovery position and monitoring. Absent or abnormal breathing: start resuscitation and follow emergency dispatcher and AED instructions.",
    ],
    ar: [
      "فاقد الوعي: اطلب المساعدة وافحص التنفس لمدة لا تتجاوز 10 ثوانٍ واتصل بـ112.",
      "تنفس طبيعي: وضعية الإفاقة والمراقبة. تنفس غائب أو غير طبيعي: ابدأ الإنعاش واتبع تعليمات الطوارئ وجهاز إزالة الرجفان.",
    ],
  },
  burn: {
    url: "https://www.drk.de/hilfe-in-deutschland/erste-hilfe/verbrennungen/",
    fr: [
      "Éloignez la source de chaleur sans vous exposer. Refroidissez la brûlure avec de l’eau fraîche, non glacée, pendant 20 minutes.",
      "Évitez l’hypothermie, surtout chez les petits enfants ou pour une grande surface. Couvrez sans serrer avec un pansement stérile. Appelez le 112 pour une brûlure grave.",
    ],
    de: [
      "Hitzequelle ohne Eigengefährdung entfernen. Brandwunde 20 Minuten mit kühlem, nicht eisigem Wasser kühlen.",
      "Unterkühlung vermeiden, besonders bei Kleinkindern und großen Flächen. Locker steril abdecken. Bei schwerer Verbrennung 112 rufen.",
    ],
    en: [
      "Move away from heat without endangering yourself. Cool the burn with cool, not icy, water for 20 minutes.",
      "Prevent hypothermia, especially in small children or large burns. Cover loosely with a sterile dressing. Call 112 for severe burns.",
    ],
    ar: [
      "ابتعد عن مصدر الحرارة دون تعريض نفسك للخطر. برّد الحرق بماء بارد غير مثلج لمدة 20 دقيقة.",
      "تجنب انخفاض حرارة الجسم خاصة للصغار والحروق الواسعة. غط بضماد معقم دون ضغط. اتصل بـ112 للحروق الخطيرة.",
    ],
  },
};
export function FirstAidBrief({ kind, lang, t }) {
  const entry = steps[kind];
  const sourceLanguage = contentLanguage(lang);
  return entry ? (
    <section className="first-aid-brief">
      {sourceLanguage !== lang && <Notice>{t.documentFallback}</Notice>}
      <ol lang={sourceLanguage}>
        {entry[sourceLanguage].map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p>DRK · 31/10/2026</p>
      <External href={entry.url}>{t.source} · DRK</External>
    </section>
  ) : null;
}
