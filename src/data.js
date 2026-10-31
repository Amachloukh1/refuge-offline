import { arabicGuides } from "./arabic.js";
import practicalGuides from "../content/practical-guides.json" with { type: "json" };
import independenceGuides from "../content/independence-guides.json" with { type: "json" };
export const seedStock = [
  {
    id: "water",
    key: "waterName",
    name: "",
    quantity: 24,
    unit: "L",
    category: "water",
    date: "",
  },
  {
    id: "rice",
    key: "rice",
    name: "",
    quantity: 3,
    unit: "kg",
    category: "food",
    date: "",
  },
  {
    id: "lentils",
    key: "lentils",
    name: "",
    quantity: 2,
    unit: "kg",
    category: "food",
    date: "",
  },
  {
    id: "pantry",
    key: "pantry",
    name: "",
    quantity: 8,
    unit: "unit",
    category: "food",
    date: "",
  },
  {
    id: "bandages",
    key: "bandages",
    name: "",
    quantity: 1,
    unit: "unit",
    category: "health",
    date: "",
  },
];
export const guideData = [
  {
    id: "power",
    category: "equipment",
    icon: "Zap",
    time: 3,
    title: {
      fr: "Se préparer à une coupure de courant",
      en: "Prepare for a power outage",
      de: "Auf einen Stromausfall vorbereiten",
    },
    intro: {
      fr: "Lumière, information et énergie : préparer les indispensables.",
      en: "Light, information and energy: prepare the essentials.",
      de: "Licht, Information und Energie: das Wesentliche vorbereiten.",
    },
    body: {
      fr: [
        "Repérez une lampe et des piles, et vérifiez leur fonctionnement avant la panne.",
        "Gardez une radio à piles et une liste papier des contacts importants.",
        "Conservez des aliments pouvant être consommés sans cuisson. Ne faites jamais de barbecue dans le logement.",
        "Testez votre batterie avec les appareils à alimenter. Gardez les réfrigérateurs fermés autant que possible.",
      ],
      en: [
        "Locate a torch and batteries and test them before an outage.",
        "Keep a battery radio and a paper list of important contacts.",
        "Store food that can be eaten without cooking. Never barbecue indoors.",
        "Test your battery with the devices you need to power. Keep refrigerators closed as much as possible.",
      ],
      de: [
        "Taschenlampe und Batterien bereitlegen und vor einem Ausfall prüfen.",
        "Batterieradio und eine Papierliste wichtiger Kontakte bereithalten.",
        "Lebensmittel lagern, die ohne Kochen essbar sind. Niemals in der Wohnung grillen.",
        "Akku mit den benötigten Geräten testen. Kühlschränke möglichst geschlossen halten.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/Stromausfall/stromausfall_node.html",
    publisher: "BBK",
  },
  {
    id: "water",
    category: "water",
    icon: "Droplets",
    time: 2,
    title: {
      fr: "Organiser sa réserve d’eau",
      en: "Organize your water reserve",
      de: "Den Wasservorrat planen",
    },
    intro: {
      fr: "Un objectif clair, des quantités suivies et une réserve vérifiée.",
      en: "A clear target, tracked quantities and a checked reserve.",
      de: "Ein klares Ziel, erfasste Mengen und geprüfte Vorräte.",
    },
    body: {
      fr: [
        "Le repère du BBK est de 2 litres par adulte et par jour pour boisson et cuisson. Il ne couvre pas toute l’hygiène ni les besoins particuliers.",
        "Notez les quantités disponibles et les dates. Respectez les consignes de stockage du fabricant.",
        "Une carte ou un filtre ne garantit pas qu’une eau est potable. Suivez les consignes officielles locales en cas de contamination.",
      ],
      en: [
        "The BBK reference is 2 litres per adult per day for drinking and cooking. It does not cover all hygiene or individual needs.",
        "Record available quantities and dates. Follow the manufacturer’s storage instructions.",
        "A map or filter does not guarantee that water is safe to drink. Follow official local instructions if contamination occurs.",
      ],
      de: [
        "Der BBK-Richtwert beträgt 2 Liter pro Erwachsenem und Tag für Trinken und Kochen. Hygiene und besondere Bedürfnisse sind nicht vollständig abgedeckt.",
        "Mengen und Daten notieren. Lagerhinweise des Herstellers beachten.",
        "Eine Karte oder ein Filter garantiert kein Trinkwasser. Bei Verunreinigung amtliche örtliche Hinweise beachten.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Bevorraten/bevorraten_node.html",
    publisher: "BBK",
  },
  {
    id: "pantry",
    category: "food",
    icon: "Utensils",
    time: 3,
    title: {
      fr: "Un garde-manger utile au quotidien",
      en: "An everyday emergency pantry",
      de: "Vorräte für Alltag und Notfall",
    },
    intro: {
      fr: "Choisir des aliments habituels et limiter le gaspillage.",
      en: "Choose familiar foods and reduce waste.",
      de: "Gewohnte Lebensmittel wählen und Verschwendung vermeiden.",
    },
    body: {
      fr: [
        "Constituez progressivement une réserve adaptée aux habitudes et besoins du foyer.",
        "Incluez des aliments consommables sans réfrigération et sans cuisson. Prévoyez un ouvre-boîte manuel.",
        "Utilisez d’abord les produits à renouveler et remplacez ce que vous consommez. Notez les allergies et besoins des animaux.",
      ],
      en: [
        "Build a reserve gradually, adapted to your household’s habits and needs.",
        "Include food that needs neither refrigeration nor cooking. Prepare a manual can opener.",
        "Use items due for rotation first and replace what you consume. Record allergies and pets’ needs.",
      ],
      de: [
        "Vorräte schrittweise aufbauen, passend zu Gewohnheiten und Bedürfnissen des Haushalts.",
        "Auch Lebensmittel ohne Kühlung und Kochen einplanen. Manuellen Dosenöffner bereithalten.",
        "Zu erneuernde Produkte zuerst verwenden und Verbrauchtes ersetzen. Allergien und Haustiere berücksichtigen.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Bevorraten/bevorraten_node.html",
    publisher: "BBK",
  },
  {
    id: "family",
    category: "equipment",
    icon: "Users",
    time: 2,
    title: {
      fr: "Préparer son plan familial",
      en: "Prepare your family plan",
      de: "Den Familienplan vorbereiten",
    },
    intro: {
      fr: "Savoir où se retrouver lorsque les téléphones ne fonctionnent plus.",
      en: "Know where to meet when phones stop working.",
      de: "Wissen, wo man sich trifft, wenn Telefone ausfallen.",
    },
    body: {
      fr: [
        "Décidez ensemble d’un point de rendez-vous et d’un contact extérieur à votre région.",
        "Imprimez les coordonnées importantes. Renseignez les besoins des personnes dépendantes.",
        "Repérez les lieux d’aide indiqués par votre commune et vérifiez régulièrement leurs informations.",
      ],
      en: [
        "Agree on a meeting point and a contact outside your region.",
        "Print important contact details. Record dependent family members’ needs.",
        "Identify help points listed by your municipality and check their information regularly.",
      ],
      de: [
        "Treffpunkt und einen Kontakt außerhalb der Region gemeinsam festlegen.",
        "Wichtige Kontaktdaten ausdrucken. Bedürfnisse hilfsbedürftiger Personen notieren.",
        "Kommunale Anlaufstellen ermitteln und Angaben regelmäßig prüfen.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/In-der-Krise-informiert-sein/in-der-krise-informiert-sein_node.html",
    publisher: "BBK",
  },
  {
    id: "health",
    category: "health",
    icon: "HeartPulse",
    time: 3,
    title: {
      fr: "Vérifier sa pharmacie familiale",
      en: "Check your medical supplies",
      de: "Die Hausapotheke prüfen",
    },
    intro: {
      fr: "Une réserve personnelle préparée avec un professionnel.",
      en: "Personal supplies prepared with a professional.",
      de: "Persönliche Vorräte mit einer Fachkraft vorbereiten.",
    },
    body: {
      fr: [
        "Préparez les médicaments personnels avec votre médecin ou pharmacien. Gardez les notices et le plan de traitement à jour.",
        "Contrôlez les quantités, les dates et les conditions de conservation. Rangez les médicaments hors de portée des enfants.",
        "Une IA ne doit pas choisir seule un médicament ni modifier un traitement. En cas de danger vital, contactez le 112 si le réseau fonctionne.",
      ],
      en: [
        "Prepare personal medicines with your doctor or pharmacist. Keep leaflets and treatment plans up to date.",
        "Check quantities, dates and storage conditions. Keep medicines out of children’s reach.",
        "An AI must not choose medicines independently or change treatment. In life-threatening emergencies, contact 112 if the network works.",
      ],
      de: [
        "Persönliche Medikamente mit Arzt oder Apotheke vorbereiten. Packungsbeilagen und Medikamentenplan aktuell halten.",
        "Mengen, Daten und Lagerbedingungen prüfen. Medikamente kindersicher aufbewahren.",
        "Eine KI darf nicht selbstständig Medikamente auswählen oder Behandlungen ändern. Bei Lebensgefahr 112 kontaktieren, sofern das Netz funktioniert.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Hausapotheke/hausapotheke_node.html",
    publisher: "BBK",
  },
  {
    id: "radio",
    category: "equipment",
    icon: "Radio",
    time: 2,
    title: {
      fr: "Rester informé sans Internet",
      en: "Stay informed without Internet",
      de: "Ohne Internet informiert bleiben",
    },
    intro: {
      fr: "Radio autonome, contacts papier et informations publiques.",
      en: "Independent radio, paper contacts and public information.",
      de: "Unabhängiges Radio, Papierkontakte und öffentliche Informationen.",
    },
    body: {
      fr: [
        "Préparez une radio à piles ou à manivelle et repérez les stations locales.",
        "Les applications d’alerte ne reçoivent pas de nouvelles informations si leurs réseaux sont indisponibles.",
        "Conservez les consignes et contacts sur papier. Un PC éteint ne surveille pas les alertes.",
      ],
      en: [
        "Prepare a battery or crank radio and identify local stations.",
        "Alert apps cannot receive new information when their networks are unavailable.",
        "Keep instructions and contacts on paper. A powered-off PC does not monitor alerts.",
      ],
      de: [
        "Batterie- oder Kurbelradio vorbereiten und lokale Sender ermitteln.",
        "Warn-Apps erhalten keine neuen Informationen, wenn ihre Netze ausfallen.",
        "Hinweise und Kontakte auf Papier bereithalten. Ein ausgeschalteter PC überwacht keine Warnungen.",
      ],
    },
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/In-der-Krise-informiert-sein/in-der-krise-informiert-sein_node.html",
    publisher: "BBK",
  },
];
for (const p of practicalGuides) {
  guideData.push({
    ...p,
    category:
      p.id === "food-without-stock" || p.id === "cooking-without-power"
        ? "food"
        : p.id === "water-in-nature"
          ? "water"
          : "equipment",
    icon:
      p.id === "cash"
        ? "Package"
        : p.id === "documents"
          ? "BookOpen"
          : p.id === "water-in-nature"
            ? "Droplets"
            : "ClipboardCheck",
    time: 5,
    publisher: "REFUGE · sources officielles",
    url: p.sources[0].url,
  });
}
for (const guide of guideData.slice(0, 6)) {
  const a = arabicGuides[guide.id];
  guide.title.ar = a.title;
  guide.intro.ar = a.intro;
  guide.body.ar = a.body;
}
for (const p of independenceGuides)
  guideData.push({
    ...p,
    category: p.id.includes("food") ? "food" : "equipment",
    icon: p.id.includes("energy") ? "Battery" : "ClipboardCheck",
    time: 8,
    publisher: "REFUGE · sources officielles",
    url: p.sources[0].url,
  });
export const checklistIds = Array.from(
  { length: 8 },
  (_, i) => `check${i + 1}`,
);
