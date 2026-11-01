import { Icon, Notice, External } from "./components";
import { extraPurchaseNames } from "./locales/purchase-names.js";
const items = [
  [
    "ups",
    "BatteryCharging",
    "Powerstation USV Mini PC",
    [
      "Batterie/UPS compatible avec la puissance et l’alimentation du mini-PC",
      "Akku/USV passend zu Leistung und Netzteil des Mini-PCs",
      "Battery/UPS matching the mini-PC power and supply requirements",
      "بطارية أو UPS متوافق مع قدرة وتغذية الحاسوب الصغير",
    ],
  ],
  [
    "lamp",
    "Flashlight",
    "Stirnlampe Batterien",
    [
      "Lampe frontale et piles compatibles",
      "Stirnlampe und passende Batterien",
      "Headlamp and matching batteries",
      "مصباح رأس وبطاريات مناسبة",
    ],
  ],
  [
    "radio",
    "RadioTower",
    "Batterieradio UKW DAB",
    [
      "Radio FM/DAB à piles",
      "UKW-/DAB-Batterieradio",
      "Battery FM/DAB radio",
      "راديو FM/DAB بالبطاريات",
    ],
  ],
  [
    "power",
    "BatteryCharging",
    "Powerbank USB",
    [
      "Batterie USB et câbles",
      "USB-Powerbank und Kabel",
      "USB power bank and cables",
      "بطارية USB وكابلات",
    ],
  ],
  [
    "aid",
    "Cross",
    "Erste Hilfe Set DIN",
    [
      "Trousse de premiers secours, gants et pansements",
      "Erste-Hilfe-Set, Handschuhe und Verbände",
      "First aid kit, gloves and dressings",
      "حقيبة إسعاف وقفازات وضمادات",
    ],
  ],
  [
    "hygiene",
    "Droplets",
    "Seife Muellbeutel Feuchttuecher",
    [
      "Savon, sacs-poubelle et papier hygiénique",
      "Seife, Müllbeutel und Toilettenpapier",
      "Soap, refuse bags and toilet paper",
      "صابون وأكياس نفايات وورق صحي",
    ],
  ],
  [
    "food",
    "Utensils",
    "Konserven Vorrat vegetarisch",
    [
      "Conserves et aliments prêts à manger habituels",
      "Vertraute Konserven und verzehrfertige Lebensmittel",
      "Familiar canned and ready-to-eat food",
      "معلبات وطعام مألوف جاهز للأكل",
    ],
  ],
  [
    "opener",
    "Package",
    "Dosenoeffner manuell",
    [
      "Ouvre-boîte manuel",
      "Manueller Dosenöffner",
      "Manual can opener",
      "فتاحة علب يدوية",
    ],
  ],
  [
    "water-container",
    "Droplets",
    "Trinkwasserkanister lebensmittelecht",
    [
      "Bidons adaptés à l’eau potable",
      "Lebensmittelechte Trinkwasserkanister",
      "Drinking-water-safe containers",
      "عبوات مناسبة لمياه الشرب",
    ],
  ],
  [
    "warm",
    "ShieldCheck",
    "Wolldecke Schlafsack",
    [
      "Couvertures, vêtements chauds, couchage",
      "Decken, warme Kleidung, Schlafausrüstung",
      "Blankets, warm clothing, bedding",
      "بطانيات وملابس دافئة ولوازم نوم",
    ],
  ],
  [
    "alarm",
    "Bell",
    "Rauchmelder Kohlenmonoxidmelder",
    [
      "Détecteurs de fumée et de CO adaptés au logement",
      "Passende Rauch- und CO-Melder",
      "Smoke and CO alarms suitable for the home",
      "كاشفات دخان وأول أكسيد الكربون مناسبة للمنزل",
    ],
  ],
  [
    "bag",
    "Backpack",
    "Notfallrucksack leer",
    [
      "Sac d’évacuation, chaussures et carte papier",
      "Notgepäck, feste Schuhe und Papierkarte",
      "Go-bag, sturdy shoes and paper map",
      "حقيبة إخلاء وحذاء متين وخريطة ورقية",
    ],
  ],
  [
    "docs",
    "FileText",
    "Dokumententasche wasserdicht",
    [
      "Pochette étanche pour documents",
      "Wasserdichte Dokumententasche",
      "Waterproof document pouch",
      "حافظة وثائق مقاومة للماء",
    ],
  ],
];
export function PurchasePlan({ t, lang, water, bought, toggleBought }) {
  const index = { fr: 0, de: 1, en: 2, ar: 3 }[lang] ?? 2;
  return (
    <div className="purchase-plan">
      <figure className="kit-figure">
        <img src="/shopping-kit.png" alt={t.purchasePlan} loading="lazy" />
        <figcaption>{t.kitPhoto}</figcaption>
      </figure>
      <Notice>{t.purchaseNote}</Notice>
      <div className="panel padded">
        <h2>
          {t.waterGap}: {water.missing} L
        </h2>
        <p>{t.foodPlan}</p>
        <p>{t.cashPlan}</p>
        <External href="https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/so-koennen-sie-sich-vorbereiten_node.html">
          BBK · {t.source}
        </External>
      </div>
      <div className="purchase-grid">
        {items.map(([id, icon, q, names]) => (
          <article className="panel padded purchase-card" key={id}>
            <Icon name={icon} size={25} />
            <h3>{extraPurchaseNames[lang]?.[id] || names[index]}</h3>
            <label className="purchase-check">
              <input
                type="checkbox"
                checked={bought.includes(`plan-${id}`)}
                onChange={() => toggleBought(`plan-${id}`)}
              />
              {t.purchased}
            </label>
            <External
              href={`https://www.amazon.de/s?k=${encodeURIComponent(q)}`}
            >
              {t.amazonSearch}
            </External>
            <small>{t.internetNeeded}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
