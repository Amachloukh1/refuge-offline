# Compléments : Ubuntu, multilingue, santé et fonctionnement ponctuel

État : propositions de conception du 31 octobre 2026 ; aucun logiciel installé. Le mini-PC existe déjà ; CPU, RAM, stockage et alimentation restent à identifier avant dimensionnement.

## Usage confirmé

- Mini-PC sous Ubuntu envisagé, sans GPU dédié.
- Utilisation à la demande, y compris lors d'une coupure de courant.
- Utilisateur en Allemagne ; projet destiné à d'autres pays via une publication GitHub future.
- Interface multilingue, connaissances hors ligne, météo, alertes publiques, santé et inventaire.

## Démarrage et batterie

Le mini-PC doit être alimenté par une batterie ou une station d'énergie compatible : l'absence du secteur ne remplace pas son alimentation. Vérifier tension, puissance, connecteur et protocole USB-C éventuel. Alimenter aussi le point d'accès Wi-Fi ; Ethernet, écran local ou hotspot du PC constituent d'autres chemins à tester.

Proposition : démarrer automatiquement bibliothèque, inventaire et accueil web. Ne charger le modèle IA qu'à la demande. La page doit être utilisable avant le chargement du modèle. Aucun contrôle Internet ni téléchargement obligatoire au démarrage. Un PC éteint ne reçoit ni n'enregistre les alertes.

Prévoir un deuxième accès aux fiches sur téléphone, une carte papier et des fiches imprimées. Mesurer le délai réel du bouton d'alimentation jusqu'à l'ouverture d'une fiche et à la première réponse IA : aucune durée garantie sans essai.

## Langues et pays

Séparer la langue d'affichage du pays choisi. Une personne peut utiliser une interface française avec les consignes, coordonnées et références allemandes. Proposition initiale : DE, FR, EN ; architecture compatible avec AR et son affichage de droite à gauche.

Pour chaque document : langue, organisme, pays, date/version, source, licence, statut de traduction et date de téléchargement. Conserver l'original avec la traduction. Pour les consignes médicales et de sécurité, privilégier les traductions officielles et une révision humaine qualifiée ; une traduction IA ne devient pas une version validée.

Le [BBK](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/vorsorge_node.html) propose déjà des guides et checklists en plusieurs langues, notamment français, anglais, arabe, turc et ukrainien.

## Santé

Trois espaces complémentaires :

1. **Premiers secours** : fiches accessibles immédiatement, sans attendre une IA, pour saignement, brûlure, perte de connaissance, étouffement et autres situations couvertes par une source reconnue. Afficher les variantes enfant/adulte lorsqu'elles existent, les signes d'urgence et le numéro local. [DRK : premiers secours et formations](https://www.drk.de/hilfe-in-deutschland/erste-hilfe/).
2. **Bibliothèque médicale** : informations sur les maladies, prévention, signes nécessitant une consultation et références professionnelles distinctes. [MSF Medical Guidelines](https://medicalguidelines.msf.org/en) et [MedlinePlus multilingue](https://medlineplus.gov/languages/firstaid.html) sont des pistes. Les guides MSF sont destinés aux professionnels ; contrôler date des PDF et droits applicables.
3. **Pharmacie personnelle** : médicaments habituels prescrits, notices, substance active, concentration, forme, patient concerné, allergies, dates, quantités, température de stockage et ordonnance/plan de traitement en espace privé. Préparer les réserves avec médecin ou pharmacien. [BBK : Hausapotheke](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Hausapotheke/hausapotheke_node.html).

Ne pas présenter une table universelle « une maladie = un médicament ». L'âge, la grossesse, les maladies associées, les allergies et les interactions changent la prise en charge. Une IA locale ne doit pas inventer des prescriptions ou recalculer un traitement. Les références de posologie doivent conserver population, forme, concentration et conditions d'emploi de leur source.

En Allemagne : 112 pour urgence vitale ; 116117 pour besoin médical urgent non vital hors horaires habituels. Le système doit conserver ces informations hors ligne mais ne peut garantir la disponibilité des réseaux. [116117 officiel](https://www.116117.de/de/haeufige-fragen.php).

## Météo et radio

Trois états distincts dans l'interface : données actualisées ; dernières données téléchargées avec leur heure ; aucune donnée récente. Sans nouvelle réception, le PC ne dispose pas de nouvelles prévisions ou images radar. Un capteur local température/pression/humidité mesure des conditions locales, sans remplacer les prévisions ou alertes officielles.

Les alertes [NINA](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warn-App-NINA/Funktion-Inhalt/funktion-inhalt_node.html) et météo sont utiles lorsque la connectivité est disponible. Prévoir indépendamment une radio à piles FM/DAB+ et enregistrer les stations publiques locales avant la crise. [BBK : rester informé](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/In-der-Krise-informiert-sein/in-der-krise-informiert-sein_node.html).

L'écoute radio doit viser les programmes et messages destinés au public. Le [§ 5 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__5.html) encadre l'écoute des communications ; les communications non destinées à l'auditeur ou au public ne sont pas une source à intégrer. Le système ne doit pas promettre de révéler les plans de groupes autour de l'utilisateur ni de déchiffrer des communications privées.

## Fonctions oubliées à envisager

- Hygiène et toilettes sans eau courante ; déchets, protections menstruelles, couches, savon et sacs.
- Plan familial : rendez-vous, personne de contact hors région, adresses et consignes si les téléphones ne fonctionnent plus.
- Lieux d'aide et itinéraires : points municipaux vérifiés, pharmacies, hôpitaux, voies de sortie ; ne pas supposer qu'un lieu est ouvert en temps réel.
- Personnes dépendantes : mobilité, lunettes, piles d'aides auditives, médicaments, alimentation spécifique et assistance.
- Animaux : alimentation, eau, transport et documents.
- Cuisine et chaleur : recettes sans cuisson, combustible, ventilation et prévention incendie/CO.
- Protection civile : consignes officielles incendie, inondation, confinement, risque chimique/radiologique ; sources datées.
- Santé mentale : exercices d'apaisement, routines, activités pour enfants et répartition des tâches.
- Réserves : budget, achats prioritaires, rotation des produits et inventaire papier exportable.
- Énergie : câbles, adaptateurs, lampe frontale, piles, compteur d'autonomie basé sur des mesures.
- Maintenance : rappels de contrôle, sauvegarde restaurable, installateurs et modèles conservés, test périodique sans Internet.
- Accessibilité : gros boutons, contraste, recherche tolérant les fautes et fiches lisibles sur petit écran.

## Publication GitHub future

Publier le logiciel, les procédures d'installation et un catalogue des ressources avec leurs liens et licences. Conserver des paquets de contenus séparés et facultatifs. Un téléchargement gratuit ne donne pas automatiquement le droit de republier un PDF, une vidéo ou une traduction. [Conditions MSF](https://medicalguidelines.msf.org/en/node/1338).

Ne jamais publier les dossiers de santé, contacts, ordonnances, mots de passe ou documents personnels. Prévoir un export nettoyé et des données de démonstration fictives. Cette séparation doit être prévue dès le début ; aucun dépôt distant n'a été créé ou publié ici.

## Première version proposée

Priorité 1 : Ubuntu, accueil multilingue, Kiwix, guides officiels, premiers secours et Grocy, disponibles sans IA. Priorité 2 : petit modèle local et recherche sur documents validés. Priorité 3 : calculateur de réserves et synchronisation météo/alertes. Radio SDR facultative après validation du besoin ; radio autonome recommandée dès le départ.
