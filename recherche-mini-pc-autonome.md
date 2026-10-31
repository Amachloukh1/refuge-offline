# Mini-PC autonome pour préparation aux crises

Recherche du 31 octobre 2026. Recommandations de conception, sans installation ni test matériel. Les logiciels et contenus doivent être téléchargés avant la coupure. Gratuit ne signifie pas que le matériel, le stockage ou l'électricité le sont.

## Proposition

Viser un mini-PC x86 avec 16 Go de RAM et SSD de 1 To, Linux, réseau Wi-Fi local et batterie compatible. 8 Go restent utilisables avec une bibliothèque et un modèle léger, en limitant les services simultanés. Ce dimensionnement est une estimation à valider sur le CPU choisi, pas une garantie de performance.

Deux voies : Project NOMAD pour une base intégrée ; ou une installation modulaire si Open WebUI est une exigence. Ne pas installer plusieurs plateformes complètes en double.

## Projets existants vérifiés

- [Project NOMAD](https://github.com/Crosstalk-Solutions/project-nomad) : interface web, Kiwix, Kolibri, cartes régionales ProtoMaps, chat local Ollama avec recherche documentaire Qdrant. Son assistant est sa propre interface, pas Open WebUI. Le projet conseille une machine puissante avec GPU pour son expérience IA optimale ; son socle sans IA est plus léger. [README et exigences](https://raw.githubusercontent.com/Crosstalk-Solutions/project-nomad/main/README.md).
- [Internet-in-a-Box](https://github.com/iiab/iiab) : bibliothèque et contenus éducatifs accessibles via Wi-Fi local sur Raspberry Pi ou PC Linux. Bon candidat pour privilégier la documentation. [Présentation officielle](https://internet-in-a-box.org/).
- [PrepperPi](https://github.com/jmarler/prepperpi) : projet spécialisé Raspberry Pi avec hotspot, Kiwix et cartes. Le README annonce des tests par son mainteneur ; cela ne constitue pas notre validation indépendante.

## Installation modulaire proposée

| Besoin | Outil | Limite ou travail restant |
|---|---|---|
| Accueil web | [Homepage](https://gethomepage.dev/) | Portail vers plusieurs applications, pas une intégration métier automatique |
| Assistant | [Open WebUI](https://docs.openwebui.com/) et [Ollama](https://docs.ollama.com/faq) | Modèles exclusivement locaux et réglages hors ligne |
| Wikipédia | [Kiwix Server](https://get.kiwix.org/en/solutions/applications/) | Télécharger les archives ZIM choisies |
| Réserves | [Grocy](https://github.com/grocy/grocy) | Saisie des quantités, unités, dates et stocks minimaux |
| Vidéos | [Jellyfin](https://jellyfin.org/docs/general/administration/hardware-selection/) ou lecteur simple | Choisir des formats lus directement pour éviter le transcodage |
| Formation | [Kolibri](https://learningequality.org/kolibri/about-kolibri/) | Importer les cours avant déconnexion |
| Navigation sur téléphone | [Organic Maps](https://organicmaps.app/) | Cartes téléchargées ; calcul hors ligne ; précision dépend de la réception satellite |

Grocy gère les réserves, recettes, listes de courses et produits à utiliser en priorité. Sa recherche de codes-barres via des services externes dépend d'Internet : saisir les produits avant la coupure. [Fonctions officielles](https://grocy.info/).

## IA sans GPU

Ollama documente l'exécution sur CPU avec les poids en RAM. [FAQ](https://docs.ollama.com/faq).

- 8 Go : tester Qwen3 1.7B ou 4B quantifié ; commencer petit.
- 16 Go : commencer avec Qwen3 4B ; tester 8B si la latence et la mémoire restent acceptables.
- [Qwen3 4B Q4_K_M](https://ollama.com/library/qwen3:4b) : fichier annoncé environ 2,5 Go.
- [Qwen3 8B Q4_K_M](https://ollama.com/library/qwen3:8b) : environ 5,2 Go.

La taille du fichier n'est pas la RAM totale requise : contexte de conversation, système et applications s'ajoutent. Commencer avec 2 048 à 4 096 tokens, une requête à la fois. Ces modèles sont des candidats, pas une comparaison exhaustive des modèles disponibles.

[Le guide hors ligne Open WebUI](https://docs.openwebui.com/tutorials/maintenance/offline-mode/) précise que chat, embeddings, extraction de documents, authentification et éventuellement voix doivent fonctionner localement. OFFLINE_MODE seul ne bloque pas tout trafic réseau. Ollama propose OLLAMA_NO_CLOUD=1. Tester un redémarrage complet avec la connexion Internet coupée.

Pour la recherche documentaire, indexer d'abord un petit corpus de PDF officiels. Ne pas supposer que toute Wikipédia en ZIM devient automatiquement interrogeable par l'IA. L'assistant doit montrer le document et la page, signaler l'absence de preuve et permettre de lire l'original. Les citations générées doivent également être vérifiées.

## Réserves et économies

Une extension spécifique devra relier l'inventaire à l'assistant et à un calculateur vérifiable. Grocy et Open WebUI ne fournissent pas automatiquement tout ce parcours.

Entrées : nombre de personnes, durée visée, quantités réellement disponibles, unités, valeurs nutritionnelles renseignées, allergies, eau et énergie de cuisson nécessaires, moyens de conservation. Sorties souhaitées : couverture indicative en jours, produits manquants, recettes faisables, priorité selon les dates et liste d'achats.

Les calculs doivent être faits par du code ou un tableur, puis expliqués par l'IA. Exemples de règles : manque = max(0, objectif - stock) ; couverture d'une ressource = stock / consommation quotidienne du groupe. Les objectifs doivent venir d'une référence adaptée au foyer et au pays, pas être inventés par le modèle. Les médicaments relèvent d'un suivi de stock, pas d'un rationnement improvisé.

## Contenu à préparer

- Guides officiels locaux : coupure de courant, évacuation, confinement, inondation, incendie, premiers secours.
- Eau et hygiène, conservation des aliments, cuisine simple avec peu d'eau et de combustible.
- Notices du matériel, réparations simples, jardinage et exercices physiques adaptés.
- Cartes locales, points de rassemblement vérifiés, contacts et copies de documents personnels protégées.
- Wikipédia dans les langues utiles et livres via le [catalogue Kiwix](https://get.kiwix.org/en/solutions/catalog/).
- Vidéos : [Sikana](https://www.sikana.tv/fr) propose premiers secours, sport, cuisine et bricolage ; vérifier les possibilités et droits de téléchargement pour chaque contenu. Kolibri permet la distribution hors ligne de cours importés.

Pour chaque ressource : titre, organisme, langue, date, URL d'origine, licence, copie locale. Garder une fiche imprimée pour les gestes et contacts essentiels.

## Énergie et résilience

Prévoir aussi l'alimentation du point d'accès et des téléphones. Autonomie théorique en heures = énergie utilisable en Wh / consommation totale en W. Exemple de calcul, pas mesure : batterie 300 Wh avec 80 % utilisables et charge moyenne de 20 W = 12 heures. Mesurer la consommation réelle ; les panneaux solaires varient selon météo et saison. Une alimentation USB-C doit respecter tension, puissance et protocole acceptés par le PC.

Conserver une deuxième copie des données sur un disque débranché, une image système restaurable et les installateurs. Tester sans Internet : démarrage, connexion depuis un téléphone, recherche PDF, IA, vidéo, cartes, saisie de stock et restauration. L'accès aux documents doit fonctionner même lorsque l'IA est arrêtée.

## Ordre recommandé

1. Bibliothèque et guides essentiels.
2. Réseau local, batterie et sauvegarde.
3. Inventaire Grocy.
4. Petit modèle local et recherche sur quelques documents validés.
5. Calculateur de réserves connecté à l'inventaire.
6. Radio et accessoires après validation des besoins.

Voir également recherche-ressources-survie.md pour les sources officielles et les distinctions GPS/radio/radar.
