export const householdPharmacySources = [
  {
    title: "gesund.bund.de · Hausapotheke",
    url: "https://gesund.bund.de/hausapotheke",
  },
  {
    title: "BBK · Hausapotheke",
    url: "https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Hausapotheke/hausapotheke_node.html",
  },
  {
    title: "G-BA · OTC-Packungsgrößen",
    url: "https://www.g-ba.de/service/fachnews/85/",
  },
  {
    title: "AMVV · Anlage 1",
    url: "https://www.gesetze-im-internet.de/amvv/anlage_1.html",
  },
];

export const householdPharmacyLabels = {
  fr: { title: "La pharmacie du foyer", fallback: "" },
  de: { title: "Die Hausapotheke", fallback: "" },
  en: { title: "Your household first-aid cabinet", fallback: "" },
  ar: { title: "صيدلية المنزل", fallback: "" },
  ru: {
    title: "Домашняя аптечка",
    fallback: "Этот справочник пока доступен на английском языке.",
  },
  zh: { title: "家庭药箱", fallback: "本指南目前以英语显示。" },
  es: {
    title: "El botiquín del hogar",
    fallback: "Esta guía se muestra en inglés por ahora.",
  },
  pt: {
    title: "A farmácia de casa",
    fallback: "Este guia é apresentado em inglês por enquanto.",
  },
};

export const householdPharmacyText = {
  fr: {
    eyebrow: "Préparer · Allemagne",
    intro:
      "Une liste générale à apporter en pharmacie : vérifiez d’abord ce que vous avez, puis choisissez selon votre foyer. Les exemples ne constituent ni un diagnostic ni une prescription personnelle.",
    advice:
      "Demandez conseil avant tout achat pour un enfant, pendant une grossesse, en cas de maladie chronique ou de prise d’autres médicaments. Faites vérifier les interactions et la notice. Le caractère sans ordonnance dépend aussi du dosage, de la forme et de la taille du conditionnement : le nom de la substance ne suffit pas.",
    selection: "À choisir avec le pharmacien",
    supplies: "Matériel · pas un médicament",
    rows: [
      [
        "pain",
        "Douleur et fièvre",
        "Paracétamol OU ibuprofène : choisir un produit adapté avec le pharmacien, sans acheter les deux automatiquement.",
        "medicine",
      ],
      [
        "electrolytes",
        "Réhydratation orale",
        "Sachets de solution de réhydratation avec électrolytes ; prévoir de l’eau potable et suivre la préparation indiquée.",
        "medicine",
      ],
      [
        "antiseptic",
        "Antiseptique pour petites plaies",
        "Demander un produit explicitement destiné aux plaies ; vérifier les restrictions d’emploi.",
        "medicine",
      ],
      [
        "saline",
        "Solution saline nasale",
        "Choisir une solution saline prête à l’emploi, adaptée à l’âge ; ne pas confondre avec un spray décongestionnant.",
        "medicine",
      ],
      [
        "dressings",
        "Pansements et compresses",
        "Prévoir pansements de plusieurs tailles, compresses stériles et bandes ; vérifier les emballages.",
        "supply",
      ],
      [
        "thermometer",
        "Thermomètre",
        "Prévoir un thermomètre utilisable et ses piles si nécessaire.",
        "supply",
      ],
      [
        "gloves",
        "Gants à usage unique",
        "Choisir une taille adaptée pour les soins de petites blessures.",
        "supply",
      ],
    ],
    limits:
      "Les traitements prescrits restent à organiser avec le médecin. Ne pas se prescrire des antibiotiques ni réutiliser des restes de traitement.",
    storage:
      "Conserver les notices et emballages d’origine, au sec, à l’abri de la chaleur et hors de portée des enfants. Contrôler les dates et remplacer les produits utilisés.",
    sources: "Sources officielles · consultées le 01/11/2026",
    offline:
      "Liste consultable hors ligne ; les sources externes nécessitent Internet.",
  },
  de: {
    eyebrow: "Vorsorge · Deutschland",
    intro:
      "Allgemeine Einkaufsliste für das Apothekengespräch: zuerst Vorhandenes prüfen, dann passend zum Haushalt auswählen. Die Beispiele sind weder Diagnose noch persönliche Verordnung.",
    advice:
      "Bei Kindern, Schwangerschaft, chronischen Erkrankungen oder weiteren Medikamenten vor dem Kauf beraten lassen. Wechselwirkungen und Packungsbeilage prüfen lassen. Rezeptfreiheit hängt auch von Wirkstärke, Darreichungsform und Packungsgröße ab: Der Wirkstoffname allein reicht nicht.",
    selection: "Mit der Apotheke auswählen",
    supplies: "Hilfsmittel · kein Arzneimittel",
    rows: [
      [
        "pain",
        "Schmerzen und Fieber",
        "Paracetamol ODER Ibuprofen: mit der Apotheke ein geeignetes Präparat wählen, nicht automatisch beide kaufen.",
        "medicine",
      ],
      [
        "electrolytes",
        "Orale Rehydratation",
        "Elektrolytbeutel zur Herstellung einer Rehydratationslösung; Trinkwasser einplanen und Zubereitungshinweise beachten.",
        "medicine",
      ],
      [
        "antiseptic",
        "Wunddesinfektionsmittel",
        "Ein ausdrücklich für Wunden geeignetes Produkt wählen; Anwendungsbeschränkungen prüfen.",
        "medicine",
      ],
      [
        "saline",
        "Salzlösung für die Nase",
        "Gebrauchsfertige, altersgerechte Salzlösung wählen; nicht mit abschwellendem Nasenspray verwechseln.",
        "medicine",
      ],
      [
        "dressings",
        "Pflaster und Kompressen",
        "Verschiedene Pflastergrößen, sterile Kompressen und Binden vorsehen; Verpackungen prüfen.",
        "supply",
      ],
      [
        "thermometer",
        "Fieberthermometer",
        "Ein funktionsfähiges Thermometer und gegebenenfalls passende Batterien bereithalten.",
        "supply",
      ],
      [
        "gloves",
        "Einmalhandschuhe",
        "Eine passende Größe für die Versorgung kleiner Verletzungen wählen.",
        "supply",
      ],
    ],
    limits:
      "Verordnete Medikamente mit der Arztpraxis planen. Antibiotika nicht selbst verordnen und keine Behandlungsreste verwenden.",
    storage:
      "Originalverpackung und Beipackzettel behalten; trocken, vor Wärme geschützt und kindersicher lagern. Haltbarkeit kontrollieren und Verbrauchtes ersetzen.",
    sources: "Offizielle Quellen · abgerufen am 01.11.2026",
    offline: "Liste offline lesbar; externe Quellen benötigen Internet.",
  },
  en: {
    eyebrow: "Preparedness · Germany",
    intro:
      "A general shopping list to discuss at a pharmacy: check existing supplies, then choose for your household. Examples are neither a diagnosis nor an individual prescription.",
    advice:
      "Seek pharmacy advice before buying for children, during pregnancy, with chronic conditions or other medicines. Ask about interactions and check the leaflet. Prescription status also depends on strength, formulation and pack size: the ingredient name alone is insufficient.",
    selection: "Choose with a pharmacist",
    supplies: "Equipment · not a medicine",
    rows: [
      [
        "pain",
        "Pain and fever",
        "Paracetamol OR ibuprofen: choose a suitable product with a pharmacist rather than automatically buying both.",
        "medicine",
      ],
      [
        "electrolytes",
        "Oral rehydration",
        "Oral rehydration electrolyte sachets; keep drinking water available and follow the preparation instructions.",
        "medicine",
      ],
      [
        "antiseptic",
        "Wound antiseptic",
        "Choose a product explicitly suitable for wounds; check its restrictions.",
        "medicine",
      ],
      [
        "saline",
        "Nasal saline",
        "Choose ready-to-use, age-appropriate nasal saline; distinguish it from a decongestant spray.",
        "medicine",
      ],
      [
        "dressings",
        "Dressings and gauze",
        "Include assorted plasters, sterile gauze and bandages; check packaging.",
        "supply",
      ],
      [
        "thermometer",
        "Thermometer",
        "Keep a working thermometer and suitable batteries if needed.",
        "supply",
      ],
      [
        "gloves",
        "Disposable gloves",
        "Choose a suitable size for caring for minor injuries.",
        "supply",
      ],
    ],
    limits:
      "Arrange prescribed medicines with your doctor. Do not self-prescribe antibiotics or reuse leftover treatments.",
    storage:
      "Keep original packaging and leaflets, dry, protected from heat and out of children’s reach. Check expiry dates and replace used supplies.",
    sources: "Official sources · accessed 2026-11-01",
    offline: "This list works offline; external sources require Internet.",
  },
  ar: {
    eyebrow: "الاستعداد · ألمانيا",
    intro:
      "قائمة عامة لمناقشتها في الصيدلية: راجع الموجود أولاً ثم اختر ما يناسب الأسرة. الأمثلة ليست تشخيصاً أو وصفة شخصية.",
    advice:
      "استشر الصيدلي قبل الشراء للأطفال أو أثناء الحمل أو مع الأمراض المزمنة أو الأدوية الأخرى. تحقق من التداخلات والنشرة. يتوقف البيع دون وصفة أيضاً على التركيز والشكل وحجم العبوة؛ اسم المادة وحده لا يكفي.",
    selection: "يُختار بمشورة الصيدلي",
    supplies: "مستلزمات · ليست دواءً",
    rows: [
      [
        "pain",
        "الألم والحمّى",
        "باراسيتامول أو إيبوبروفين: اختر منتجاً مناسباً مع الصيدلي ولا تشترِ كليهما تلقائياً.",
        "medicine",
      ],
      [
        "electrolytes",
        "الإماهة الفموية",
        "أكياس أملاح الإماهة الفموية؛ وفّر ماءً صالحاً للشرب واتبع تعليمات التحضير.",
        "medicine",
      ],
      [
        "antiseptic",
        "مطهّر للجروح",
        "اختر منتجاً مخصصاً للجروح وتحقق من قيود استعماله.",
        "medicine",
      ],
      [
        "saline",
        "محلول ملحي للأنف",
        "اختر محلولاً جاهزاً مناسباً للعمر؛ ميّزه عن بخاخ إزالة الاحتقان.",
        "medicine",
      ],
      [
        "dressings",
        "ضمادات وشاش",
        "وفّر لاصقات بأحجام مختلفة وشاشاً معقماً وأربطة وتحقق من سلامة العبوات.",
        "supply",
      ],
      [
        "thermometer",
        "ميزان حرارة",
        "احتفظ بميزان يعمل وبطاريات مناسبة عند الحاجة.",
        "supply",
      ],
      [
        "gloves",
        "قفازات للاستعمال مرة واحدة",
        "اختر مقاساً مناسباً للعناية بالإصابات البسيطة.",
        "supply",
      ],
    ],
    limits:
      "نظّم مخزون الأدوية الموصوفة مع الطبيب. لا تصف لنفسك مضادات حيوية ولا تستخدم بقايا علاجات سابقة.",
    storage:
      "احتفظ بالعبوات الأصلية والنشرات في مكان جاف بعيد عن الحرارة ومتناول الأطفال. راجع الصلاحية وعوّض المستلزمات المستخدمة.",
    sources: "مصادر رسمية · تمت مراجعتها في 2026-11-01",
    offline: "القائمة متاحة دون اتصال؛ المصادر الخارجية تحتاج إلى الإنترنت.",
  },
};
