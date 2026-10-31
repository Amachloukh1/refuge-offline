# Ressources de préparation aux catastrophes et radio locale

Recherche du 31 octobre 2026. Sources primaires : organismes publics, Croix-Rouge, NASA et dépôt officiel OpenWebRX. Ce document constitue une sélection de ressources et des recommandations de conception ; il ne remplace pas une formation aux premiers secours.

## Bibliothèque prioritaire

| Ressource | Utilité hors ligne | Source |
|---|---|---|
| BBK : guide et liste de contrôle | Télécharger le PDF officiel, le garder sur le PC et imprimer la liste essentielle. Référence particulièrement pertinente pour un foyer en Allemagne. | [Guide et téléchargements BBK](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/Ratgeber-Checkliste/ratgeber-checkliste_node.html) |
| Géorisques : préparation | Informations françaises, kit 72 h et plan individuel de mise en sûreté. | [Me préparer, me protéger](https://www.georisques.gouv.fr/me-preparer-me-proteger) |
| Géorisques : kit 72 h | Checklist concrète : eau, nourriture sans cuisson, radio, médicaments, éclairage et documents essentiels. Le repère d'eau publié est de 6 litres par personne pour 72 h. Vérifier périodiquement les dates et réapprovisionner après utilisation. | [Kit 72 h](https://www.georisques.gouv.fr/communiquer-aupres-de-mes-administres/le-kit-durgence-72h) |
| IFRC : premiers secours | Le portail propose les directives internationales 2025 en PDF, publiées en mars 2026. Document technique ; ajouter des fiches adaptées à la formation réellement suivie par les utilisateurs. | [First aid et documents téléchargeables](https://www.ifrc.org/our-work/health-and-care/first-aid) |
| BBK : panne électrique | Conseils, publications PDF et vidéo officielle ; référence pour sélectionner des contenus sur éclairage, cuisson et information. | [Stromausfall](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/Stromausfall/stromausfall_node.html) |
| OMS : activité à domicile | Point de départ officiel pour une petite sélection d'exercices, à conserver sous une forme accessible hors connexion. La présence d'une page ne garantit pas un droit de redistribuer ses vidéos. | [Be active at home](https://www.who.int/bangladesh/emergencies/coronavirus-disease-%28covid-19%29-update/be-active-at-home) |

Pour les vidéos de cuisine, feu et eau, privilégier les démonstrations d'organismes reconnus, avec date, auteur et conditions de téléchargement. La disponibilité publique ne suffit pas pour autoriser une redistribution. Enregistrer des PDF proposés au téléchargement et conserver les mentions de droits. Ne pas incorporer automatiquement un corpus de vidéos aléatoires.

## Calcul des réserves : base de travail

Le BBK recommande de pouvoir se ravitailler à domicile pendant dix jours ; trois jours constituent déjà un premier progrès. Son repère adulte est de 1,5 litre de boisson, plus 0,5 litre pour la cuisson par jour. Penser aux animaux et aux besoins individuels. Ces quantités ne couvrent pas toute l'hygiène ni tous les contextes de chaleur, d'effort ou de santé. [BBK : réserves alimentaires](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/Bevorraten/bevorraten_node.html).

Recommandation de conception : un calculateur déterministe prend le nombre de personnes, la durée et les besoins particuliers ; il compare la cible au stock réel. L'IA explique les résultats et suggère des repas, mais ne doit pas inventer les quantités ni décréter qu'une eau est potable. Les aliments doivent être suivis par lot, quantité, péremption, besoin de cuisson et besoin de réfrigération. Ne pas appliquer une ration adulte uniforme aux enfants, femmes enceintes ou personnes ayant des besoins médicaux.

Pour la bibliothèque de cuisson, afficher les conditions de sécurité avec chaque fiche : la ville de Berlin indique de n'utiliser les réchauds de camping et les grils qu'à l'extérieur, à cause du risque d'intoxication. Le catalogue ne doit pas présenter « faire du feu dans l'appartement » comme une solution normale. [Berlin : panne électrique](https://www.berlin.de/bevoelkerungsschutz/notfallvorsorge/stromausfall/artikel.1653256.php).

## Radio, GPS et radar : trois fonctions différentes

### Radio sans Internet

Une radio à piles ou à manivelle constitue le premier équipement pour écouter les consignes, même lorsque le PC est éteint. C'est une recommandation explicite du BBK. [BBK : panne électrique](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/Stromausfall/stromausfall_node.html).

[OpenWebRX](https://github.com/jketterl/openwebrx) est un récepteur SDR libre avec interface web, plusieurs utilisateurs et des modes dont AM, FM et SSB. Il possède des méthodes d'installation Debian et Docker. Les clés RTL-SDR figurent dans les [matériels pris en charge](https://github.com/jketterl/openwebrx/wiki/Supported-Hardware).

Déduction d'architecture : un PC, une clé SDR et une antenne locaux peuvent fournir l'écoute via le réseau local sans Internet. Il faut préparer les logiciels et tester les bandes et stations réellement reçues avant la crise. Cela ne crée pas de station émettrice : une clé RTL-SDR de réception n'est pas un talkie-walkie. Un site OpenWebRX public distant, lui, reste dépendant d'Internet. Ne pas promettre la réception universelle de services chiffrés ou de toute fréquence avec n'importe quelle clé.

### GPS hors ligne

Le positionnement GPS civil est accessible sans frais directs d'utilisation. [NASA : GPS](https://www.nasa.gov/directorates/somd/space-communications-navigation-program/gps/). Le service radio est sensible aux interférences et au brouillage. [GPS.gov : interférences](https://www.gps.gov/spectrum-interference-issues).

Déduction pratique : prévoir un récepteur GNSS USB pour un mini-PC qui n'en possède pas et télécharger les cartes et données de routage avant la coupure. Un téléphone avec cartes hors ligne est souvent une deuxième solution plus portable. L'accès aux satellites, les cartes, le calcul d'itinéraire et l'envoi de sa position sont quatre fonctions distinctes ; GPS ne signifie pas accès à Internet ou communication satellite. Conserver une carte papier pour les perturbations GNSS.

### Radar

Un logiciel ne transforme pas le mini-PC en radar autonome. Les images de précipitations des services météo sont des données externes : le DWD propose notamment des observations et données radar sur son serveur Open Data. [DWD : rapport expliquant ses catégories Open Data](https://www.dwd.de/EN/ourservices/annual_reports_dwd/annual_reports_pdf/annual_report_2018.pdf?__blob=publicationFile&v=4).

Déduction pratique : on peut conserver les dernières images et leur heure ; sans nouvelle réception, elles vieillissent et ne décrivent plus la météo actuelle. Des capteurs météo locaux constituent un autre projet, pas un radar. Une clé SDR n'est pas à elle seule un dispositif de détection des dangers, personnes ou drones. Il faut clarifier ce que l'utilisateur entend par « radar » avant de proposer du matériel.

## Tests proposés avant de compter sur le système

1. Couper la liaison Internet et redémarrer le PC : les documents, vidéos, cartes et radios locales doivent rester accessibles.
2. Tester un téléphone connecté au Wi-Fi local, sans réseau mobile.
3. Vérifier les copies sur un disque externe et imprimer les fiches de première nécessité.
4. Mesurer la consommation du PC, du routeur et de l'écran afin de dimensionner la batterie sur des mesures réelles.
5. Identifier les sources, leur date et les informations qui exigent une actualisation ; différencier clairement les données téléchargées des informations actuelles.

Les tests ci-dessus sont des recommandations de conception, pas des résultats d'essai déjà obtenus sur le matériel de l'utilisateur.

## Complément : bibliothèque médicale multilingue et médicaments

Vérification du 31 octobre 2026. Séparer dans l'interface les fiches de premiers secours destinées au public, les notices des produits réellement possédés et les ouvrages professionnels.

| Source | Langues et possibilités hors ligne | Droits et limites à conserver |
|---|---|---|
| [MSF : Guide clinique et thérapeutique et Médicaments essentiels](https://medicalguidelines.msf.org/fr) | Français, anglais, arabe et espagnol pour ces deux guides. PDF proposés et application mobile officielle. Le site avertit que le PDF du guide clinique n'est pas actualisé : afficher la date du fichier, pas seulement celle du site. | Ouvrages destinés aux professionnels de santé et prescripteurs. Les guides ne sont pas des listes de médicaments à acheter ni un outil de prescription automatique. |
| [MSF : application et mises à jour](https://medicalguidelines.msf.org/en/updates) | MSF annonce en septembre 2026 une nouvelle application avec accès hors ligne amélioré. Télécharger les guides utiles, puis vérifier leur présence après redémarrage en mode avion. | L'application mobile est une solution complémentaire ; cela ne prouve pas qu'un serveur web local peut redistribuer son contenu. |
| [MSF : Médicaments essentiels et PDF](https://medicalguidelines.msf.org/fr/viewport/EssDr/francais/medicaments-essentiels-16682579.html) | Le fichier peut être conservé pour consultation via le téléchargement proposé. [PDF français officiel](https://medicalguidelines.msf.org/sites/default/files/pdf/guideline-339-fr.pdf). | MSF réserve les droits de reproduction, traduction et adaptation. Gratuit à consulter ne signifie pas licence libre : ne pas republier un miroir ou un corpus redistribué sans autorisation applicable. Conserver le document et ses mentions de droits. |
| [DRK : Der kleine Rotkreuzhelfer multilingue](https://www.drk-durlach.de/angebote/rotkreuzkurs-eh/lebensretter/) | PDF bilingues allemand avec français, anglais, arabe, dari, kurde, somali, tigrinya ou ourdou ; utiles à télécharger et imprimer. [PDF allemand/français](https://www.drk-kurs.de/fileadmin/user_upload/EH_Buecher_Hefte/rotkreuzhelfer_a6_05_DE_FRANZOESISCH.pdf). | Vérifier l'édition et sa compatibilité avec la formation suivie ; ne pas confondre brochure ancienne et recommandations actualisées. Aucune licence ouverte générale de redistribution n'a été établie dans cette recherche. |
| [DRK : applications et apprentissage](https://www.drk.de/hilfe-in-deutschland/erste-hilfe/drk-app-fuer-unterwegs/) | La page nationale présente une application allemande gratuite et des liens de premiers secours. | La page actuelle ne confirme pas un fonctionnement intégral hors ligne ; ne pas le promettre sans essai. Préférer les PDF explicitement téléchargés pour la bibliothèque PC. |
| [gesund.bund.de](https://gesund.bund.de/) | Portail public en allemand, anglais, turc, russe et arabe ; français non indiqué dans le sélecteur consulté. Informations de santé pour le public, distinctes des manuels de prescription. | Son [impressum](https://gesund.bund.de/impressum) permet la reprise de textes sous forme de citation, complète et inchangée avec source. Cela n'est pas une licence générale de copie de tout le site ; images soumises à droits distincts. Pas de pack hors ligne complet vérifié. |
| [PharmNet/AMIce : entrée BfArM](https://www.bfarm.de/DE/Arzneimittel/Arzneimittelinformationen/Arzneimittel-recherchieren/AMIce/_node.html) | Recherche des notices allemandes et informations produit. Le [Paul-Ehrlich-Institut](https://www.pei.de/DE/regulation/zulassung-human/produktinformation/pi-node.html) confirme l'accès gratuit aux notices et résumés approuvés via PharmNet. | Pas de téléchargement complet ni licence ouverte de redistribution établis ici. Accès direct BfArM refusé au navigateur de recherche (403) ; confirmation recoupée sur PEI et [gesund.bund.de](https://gesund.bund.de/arzneimittel-beipackzettel). Les notices ne doivent pas être mélangées entre dosages, formes ou pays. |

Recommandation de conception pour la pharmacie personnelle : enregistrer le nom exact, principe actif, dosage, forme, lot, quantité, péremption, conservation et notice officielle de chaque produit possédé. Associer les ordonnances et le plan de traitement existant à la personne concernée avec un accès privé. L'assistant peut retrouver une notice, citer son passage et signaler une information manquante ; il ne doit pas choisir automatiquement un médicament, modifier une prescription ou produire une dose personnalisée. Les stocks de traitements habituels et leurs conditions de conservation se préparent avec le médecin ou le pharmacien.

Pour toute traduction, privilégier les versions officielles. Présenter une traduction générée par l'IA comme telle et conserver l'original accessible ; ne pas en faire la seule référence pour les doses, interactions ou contre-indications. Ces règles sont des recommandations de conception, sans validation clinique du futur système.
