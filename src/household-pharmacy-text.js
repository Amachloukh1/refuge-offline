export const householdPharmacySources = [
  {
    title: "gesund.bund.de · Hausapotheke",
    url: "https://gesund.bund.de/hausapotheke",
  },
  {
    title: "IQWiG · Erkältung",
    url: "https://www.gesundheitsinformation.de/schnupfen-husten-und-halsschmerzen-lindern.html",
  },
  {
    title: "IQWiG · Durchfall",
    url: "https://www.gesundheitsinformation.de/durchfall.html",
  },
  {
    title: "DGVS · Loperamid",
    url: "https://www.dgvs.de/new-leitlinien/chapter_69b3f02adf44f/",
  },
  {
    title: "IQWiG · Heuschnupfen",
    url: "https://www.gesundheitsinformation.de/welche-medikamente-koennen-heuschnupfen-lindern.html",
  },
  {
    title: "ratiopharm · Cetirizin",
    url: "https://www.ratiopharm.de/produkte/details/cetirizin-ratiopharm-bei-allergien-pzn-2158136/",
  },
  {
    title: "Bayer · Antazidum / Gebrauchsinformation",
    url: "https://www.rennie.de/document/5321",
  },
  {
    title: "schülke · Wundantiseptikum",
    url: "https://www.schuelke.com/de-de/produkte/910028/octenisept-wund-desinfektion/",
  },
  {
    title: "Bundesärztekammer · Nasensprays",
    url: "https://www.bundesaerztekammer.de/themen/aerzte/public-health/suchtmedizin/medikamentenabhaengigkeit/abschwellende-nasentropfen-sprays",
  },
  {
    title: "AMVV · Anlage 1",
    url: "https://www.gesetze-im-internet.de/amvv/anlage_1.html",
  },
];

export const householdPharmacyLabels = {
  fr: {
    title: "Médicaments sans ordonnance · Allemagne",
    fallback: "",
  },
  de: {
    title: "Rezeptfreie Medikamente · Deutschland",
    fallback: "",
  },
  en: {
    title: "Over-the-counter medicines · Germany",
    fallback: "",
  },
  ar: {
    title: "أدوية دون وصفة طبية · ألمانيا",
    fallback: "",
  },
  ru: {
    title: "Домашняя аптечка",
    fallback: "Этот справочник пока доступен на английском языке.",
  },
  zh: {
    title: "家庭药箱",
    fallback: "本指南目前以英语显示。",
  },
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
      "Des exemples concrets par symptôme pour composer votre pharmacie du foyer en Allemagne. Choisissez selon vos besoins : cette liste n’est pas une ordonnance et tous les produits ne sont pas à acheter.",
    advice:
      "Sans ordonnance ne signifie pas sans risque : le statut en Allemagne dépend du dosage, de la forme et du conditionnement. Avant l’achat, demandez conseil pour les enfants, la grossesse, les maladies chroniques ou les autres traitements ; vérifiez les interactions et la notice.",
    selection: "Exemples de médicaments",
    supplies: "Matériel · pas un médicament",
    rows: [
      [
        "pain",
        "Maux de tête, douleurs et fièvre",
        "Paracétamol OU ibuprofène : choisir un seul produit adapté. Vérifier les autres médicaments pour éviter de reprendre le même ingrédient dans un produit contre le rhume.",
        "medicine",
      ],
      [
        "saline",
        "Nez bouché",
        "Un spray de xylométazoline peut soulager temporairement ; pas plus de 7 jours et selon la notice. Une solution saline nasale est une autre option ; vérifier le statut du produit sur son emballage.",
        "medicine",
      ],
      [
        "electrolytes",
        "Diarrhée · remplacer l’eau et les sels",
        "Sachets de réhydratation orale avec glucose et électrolytes, à préparer exactement selon la notice avec de l’eau potable. Demander rapidement un avis médical en cas de déshydratation, de sang dans les selles ou de forte fièvre.",
        "medicine",
      ],
      [
        "diarrhea",
        "Diarrhée · option ponctuelle chez l’adulte",
        "Lopéramide : seulement pour un adulte avec diarrhée aiguë sans fièvre ni sang dans les selles, pendant moins de 48 heures. Pas pour les enfants dans ce guide ; la réhydratation reste prioritaire.",
        "medicine",
      ],
      [
        "allergy",
        "Rhume des foins et allergie connue",
        "Cétirizine : exemple d’antihistaminique pour les symptômes du nez et des yeux liés au rhume des foins. Peut provoquer de la somnolence ; vérifier la notice avant de conduire.",
        "medicine",
      ],
      [
        "heartburn",
        "Brûlures d’estomac occasionnelles",
        "Carbonate de calcium + carbonate de magnésium : exemple d’antiacide pour un soulagement ponctuel. Faire vérifier l’intervalle avec les autres médicaments ; consulter si les troubles persistent ou reviennent souvent.",
        "medicine",
      ],
      [
        "antiseptic",
        "Petites plaies · antiseptique",
        "Octénidine + phénoxyéthanol : exemple de solution antiseptique destinée aux plaies, selon la notice. Ne pas injecter ni introduire sous pression dans une plaie ; les plaies profondes nécessitent un avis médical.",
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
      "Konkrete Beispiele nach Beschwerden für Ihre Hausapotheke in Deutschland. Nach Bedarf auswählen: Diese Liste ist keine persönliche Verordnung und kein Auftrag, alles zu kaufen.",
    advice:
      "Rezeptfrei bedeutet nicht risikofrei: In Deutschland hängen Abgaberegeln von Wirkstärke, Darreichungsform und Packungsgröße ab. Vor dem Kauf bei Kindern, Schwangerschaft, chronischen Erkrankungen oder weiteren Medikamenten beraten lassen; Wechselwirkungen und Packungsbeilage prüfen.",
    selection: "Arzneimittelbeispiele",
    supplies: "Hilfsmittel · kein Arzneimittel",
    rows: [
      [
        "pain",
        "Kopfschmerzen, Schmerzen und Fieber",
        "Paracetamol ODER Ibuprofen: ein geeignetes Einzelpräparat wählen. Andere Arzneimittel prüfen, damit derselbe Wirkstoff nicht zusätzlich in einem Erkältungsmittel eingenommen wird.",
        "medicine",
      ],
      [
        "saline",
        "Verstopfte Nase",
        "Ein Nasenspray mit Xylometazolin kann kurzfristig lindern; höchstens 7 Tage und nach Packungsbeilage anwenden. Nasale Salzlösung ist eine weitere Möglichkeit; den Produktstatus auf der Verpackung prüfen.",
        "medicine",
      ],
      [
        "electrolytes",
        "Durchfall · Flüssigkeit und Salze ersetzen",
        "Orale Rehydratationsbeutel mit Glukose und Elektrolyten genau nach Packungsbeilage mit Trinkwasser zubereiten. Bei Austrocknung, Blut im Stuhl oder hohem Fieber rasch ärztlichen Rat suchen.",
        "medicine",
      ],
      [
        "diarrhea",
        "Durchfall · kurzfristige Option für Erwachsene",
        "Loperamid: nur für Erwachsene bei akutem Durchfall ohne Fieber und ohne Blut im Stuhl, für weniger als 48 Stunden. In diesem Ratgeber nicht für Kinder vorgesehen; Flüssigkeitsersatz bleibt vorrangig.",
        "medicine",
      ],
      [
        "allergy",
        "Heuschnupfen und bekannte Allergie",
        "Cetirizin ist ein Beispiel für ein Antihistaminikum gegen Nasen- und Augenbeschwerden bei Heuschnupfen. Kann müde machen; vor dem Autofahren die Packungsbeilage beachten.",
        "medicine",
      ],
      [
        "heartburn",
        "Gelegentliches Sodbrennen",
        "Calciumcarbonat + Magnesiumcarbonat: ein Beispiel für ein Antazidum zur gelegentlichen Linderung. Abstände zu anderen Medikamenten abklären; anhaltende oder häufig wiederkehrende Beschwerden ärztlich abklären lassen.",
        "medicine",
      ],
      [
        "antiseptic",
        "Kleine Wunden · Antiseptikum",
        "Octenidin + Phenoxyethanol: ein Beispiel für eine antiseptische Wundlösung, nach Packungsbeilage anwenden. Nicht injizieren oder unter Druck in eine Wunde einbringen; tiefe Wunden ärztlich abklären lassen.",
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
      "Concrete examples by symptom for a household medicine cabinet in Germany. Choose what fits your needs: this list is not an individual prescription or a reason to buy every item.",
    advice:
      "Prescription-free does not mean risk-free: in Germany, status depends on strength, formulation and pack size. Seek advice before buying for children, pregnancy, chronic conditions or use with other medicines; check interactions and the leaflet.",
    selection: "Medicine examples",
    supplies: "Equipment · not a medicine",
    rows: [
      [
        "pain",
        "Headache, pain and fever",
        "Paracetamol OR ibuprofen: choose one suitable single-ingredient product. Check other medicines to avoid taking the same ingredient again in a cold remedy.",
        "medicine",
      ],
      [
        "saline",
        "Blocked nose",
        "A xylometazoline nasal spray can provide short-term relief; use for no more than 7 days and follow the leaflet. Nasal saline is another option; check the product status on its packaging.",
        "medicine",
      ],
      [
        "electrolytes",
        "Diarrhoea · replace water and salts",
        "Oral rehydration sachets containing glucose and electrolytes: mix with drinking water exactly as the leaflet directs. Seek prompt medical advice for dehydration, blood in stools or high fever.",
        "medicine",
      ],
      [
        "diarrhea",
        "Diarrhoea · brief option for adults",
        "Loperamide: only for an adult with acute diarrhoea without fever or blood in stools, for less than 48 hours. This guide does not suggest it for children; rehydration remains the priority.",
        "medicine",
      ],
      [
        "allergy",
        "Hay fever and known allergy",
        "Cetirizine is an example of an antihistamine for hay-fever symptoms affecting the nose and eyes. It can cause drowsiness; check the leaflet before driving.",
        "medicine",
      ],
      [
        "heartburn",
        "Occasional heartburn",
        "Calcium carbonate + magnesium carbonate: an example of an antacid for occasional relief. Check spacing from other medicines; seek medical advice if symptoms persist or recur frequently.",
        "medicine",
      ],
      [
        "antiseptic",
        "Minor wounds · antiseptic",
        "Octenidine + phenoxyethanol: an example of an antiseptic wound solution, used as directed in the leaflet. Never inject it or force it into a wound under pressure; deep wounds need medical assessment.",
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
      "أمثلة محددة حسب الأعراض لتجهيز صيدلية المنزل في ألمانيا. اختر ما تحتاجه؛ القائمة ليست وصفة شخصية ولا تعني شراء كل المنتجات.",
    advice:
      "البيع دون وصفة لا يعني انعدام المخاطر؛ يعتمد الوضع في ألمانيا على التركيز والشكل وحجم العبوة. استشر الصيدلي قبل الشراء للأطفال أو أثناء الحمل أو مع الأمراض المزمنة والأدوية الأخرى، وتحقّق من التداخلات والنشرة.",
    selection: "أمثلة للأدوية",
    supplies: "مستلزمات · ليست دواءً",
    rows: [
      [
        "pain",
        "الصداع والألم والحمّى",
        "باراسيتامول أو إيبوبروفين: اختر مستحضراً مناسباً بمادة فعالة واحدة. راجع الأدوية الأخرى لتجنّب تناول المادة نفسها مرة أخرى ضمن دواء للزكام.",
        "medicine",
      ],
      [
        "saline",
        "انسداد الأنف",
        "يمكن لبخاخ زيلوميتازولين تخفيف الانسداد مؤقتاً؛ يُستخدم حسب النشرة لمدة لا تتجاوز 7 أيام. المحلول الملحي الأنفي خيار آخر؛ تحقّق من تصنيف المنتج على العبوة.",
        "medicine",
      ],
      [
        "electrolytes",
        "الإسهال · تعويض الماء والأملاح",
        "أكياس الإماهة الفموية المحتوية على الغلوكوز والأملاح: تُحضّر بماء صالح للشرب تماماً كما تذكر النشرة. اطلب مشورة طبية سريعة عند الجفاف أو وجود دم في البراز أو ارتفاع شديد في الحرارة.",
        "medicine",
      ],
      [
        "diarrhea",
        "الإسهال · خيار مؤقت للبالغين",
        "لوبيراميد: فقط للبالغ المصاب بإسهال حاد دون حمّى أو دم في البراز ولمدة أقل من 48 ساعة. لا يقترحه هذا الدليل للأطفال؛ تعويض السوائل يبقى الأولوية.",
        "medicine",
      ],
      [
        "allergy",
        "حمّى القش والحساسية المعروفة",
        "سيتريزين مثال لمضاد هيستامين لأعراض الأنف والعينين المرتبطة بحمّى القش. قد يسبب النعاس؛ راجع النشرة قبل القيادة.",
        "medicine",
      ],
      [
        "heartburn",
        "حرقة المعدة العرضية",
        "كربونات الكالسيوم + كربونات المغنيسيوم: مثال لمضاد حموضة للتخفيف العرضي. تحقّق من الفاصل الزمني مع الأدوية الأخرى واستشر الطبيب إذا استمرت الأعراض أو تكررت كثيراً.",
        "medicine",
      ],
      [
        "antiseptic",
        "الجروح البسيطة · مطهّر",
        "أوكتينيدين + فينوكسي إيثانول: مثال لمحلول مطهّر مخصص للجروح حسب النشرة. لا يُحقن ولا يُدفع تحت ضغط داخل الجرح؛ الجروح العميقة تحتاج إلى تقييم طبي.",
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
