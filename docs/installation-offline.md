# Installation et transfert hors ligne

État vérifié le 31 octobre 2026 sur le PC Windows de préparation. Le mini-PC Ubuntu 22.04 n'a pas encore été installé ni testé.

## Contenu réellement préparé

- Interface FR/DE/EN/AR, arabe RTL ; 14 fiches pratiques et 11 catastrophes détaillées dans les quatre langues.
- Sept PDF BBK/DRK locaux, indexés en 193 passages pour la recherche de références de l'assistant.
- Ollama 0.40.13 Windows, modèle **Qwen3 4B Instruct 2507 Q4_K_M** (environ 2,5 Go de poids), licence [Apache 2.0](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE). Mode CPU imposé. Aucun entraînement médical : recherche de passages locaux et ajout au contexte du modèle (RAG). Wikipédia n'est pas indexée par cet assistant.
- Carte PMTiles de Saxe : rectangle 11.8,50.1,15.1,51.8, zoom maximal 14, 294 Mo, OpenStreetMap/Protomaps, polices et sprites locaux. Consultation, sans itinéraires ni réception GPS.
- Trois vidéos BBK avec sous-titres allemands et langue des signes allemande, environ 279 Mo. Sac d'urgence, documents et réserves alimentaires. Pas de vidéo médicale ou de cueillette non vérifiée.
- Wikipédia **compacte** FR/DE/AR, environ 11,44 Go : résumés, médias incomplets. Kiwix JS 4.4.0 compilé et servi séparément sur 8108. Choisir le fichier dans `content/zim`, accepter uniquement les archives de source connue, puis rechercher un article.
- Prévisions Open-Meteo sauvegardées pour Dresden, Leipzig et Chemnitz. Le bouton d'actualisation nécessite Internet. Une copie ancienne n'est pas une alerte actuelle.
- SDR++ portable Windows, paquet Ubuntu Jammy amd64 et manuel officiel téléchargés. Windows : `runtime/radio/sdrpp_windows_x64/sdrpp.exe`. Récepteur, antenne et pilotes nécessaires ; réception non testée sans matériel. Les dépendances du paquet Ubuntu seront contrôlées sur la cible.
- Plan d'achats : treize catégories, dont une batterie/UPS pour le mini-PC, calcul du manque d'eau, liens de recherche Amazon.de sans affiliation. Image d'ensemble générée par IA, aucune offre ni photo contractuelle. Cocher ne modifie pas les quantités du stock.

## Démarrage du dossier préparé

Windows : lancer `powershell -NoProfile -ExecutionPolicy Bypass -File .\DEMARRER-WINDOWS.ps1`, avec Node.js 24 installé. Ouvrir http://127.0.0.1:8099.

Ubuntu x86_64 : transférer **le dossier complet préparé**, puis `bash DEMARRER-UBUNTU.sh`. Le binaire Node Linux est inclus dans `runtime/linux/node/bin/node`. Au premier démarrage Linux, le script décompresse l'archive Ollama via Node, préservant les liens symboliques Linux. Aucun téléchargement au démarrage. Le serveur et le moteur utilisent les ports locaux 8099, 8108 et 11479. Les autres moteurs déjà présents ne sont pas arrêtés.

Conserver `dist`, `server`, `src`, `content` (documents, vidéos, cartes, zim et lecteur), `data/document-index.json`, `data/weather.json`, `models`, `runtime` et les lanceurs. Les modèles occupent plusieurs Go ; les essais Qwen3 restent présents mais ne sont pas utilisés par défaut. Prévoir au moins 30 Go libres sur la destination et davantage pour les futures archives.

L'absence d'Internet est compatible avec la lecture et l'IA. L'absence d'électricité demande une batterie/UPS appropriée au mini-PC ; le logiciel ne fournit pas d'énergie. Ne pas utiliser de combustion dans un logement pour alimenter/chauffer le matériel.

## Reconstituer depuis GitHub avec Internet

Le dépôt est privé. Il conserve le code, les catalogues, les empreintes et les scripts. Les gros fichiers, documents personnels, historiques locaux, clés et `.env` sont exclus de Git. **Un clone du dépôt seul n'est pas une copie prête à l'emploi hors ligne.** Les ressources locales déjà préparées doivent être transférées séparément.

```sh
npm ci
npm run build
node scripts/fetch-content.mjs
node scripts/index-documents.mjs
node scripts/fetch-offline-assets.mjs --videos --wiki --radio
```

Le dernier téléchargement représente environ 12 Go. Les empreintes SHA256 et tailles sont contrôlées, les fichiers `.partial` ne sont pas activés avant validation. Un changement d'édition demande de mettre à jour le catalogue après vérification.

Installer Ollama depuis sa source officielle, démarrer `ollama serve` avec `OLLAMA_HOST=127.0.0.1:11479`, `OLLAMA_MODELS` pointant vers le dossier `models` du projet et `OLLAMA_NO_CLOUD=1`. Puis lancer `node scripts/fetch-local-model.mjs` pour préparer explicitement Qwen3 4B Instruct 2507. Les lanceurs fournis attendent le moteur portable dans `runtime`.

Pour le lecteur : télécharger les sources officielles Kiwix JS 4.4.0 dans `content/wiki-reader/kiwix-js-4.4.0`, puis `npm ci --prefix content/wiki-reader/kiwix-js-4.4.0` et `npm run build-src --prefix content/wiki-reader/kiwix-js-4.4.0` pendant la préparation. Conserver le dossier `dist` généré et ses licences.

Pour la carte, avec le CLI officiel PMTiles 1.31.2 :

```sh
pmtiles extract https://build.protomaps.com/20261030.pmtiles content/maps/sachsen.pmtiles --bbox=11.8,50.1,15.1,51.8 --maxzoom=14
node scripts/prepare-map-assets.mjs
```

Cette commande extrait la région par requêtes partielles ; ne pas télécharger le fichier planète entier. La disponibilité future du snapshot n'est pas garantie : conserver l'extrait vérifié, catalogué dans `content/maps.catalog.json`. Respecter ODbL et les crédits OpenStreetMap/Protomaps. Les droits propres aux PDF et vidéos restent ceux des éditeurs ; le téléchargement gratuit n'est pas une licence de redistribution.

## Validation effectuée

19 tests Node réussis ; quatre parcours Chrome réussis avec requêtes Internet du navigateur bloquées : inventaire/persistance/arabe, catastrophes, carte et vidéo effectivement lue, météo sauvegardée, plan d'achats, recherche puis lecture d'un véritable article du ZIM français. Compilation réussie, audit npm de production sans vulnérabilité connue lors du contrôle.

IA finale Qwen3 réelle sur CPU : question avec stock et sources en environ 76 secondes, calcul correct de 56 L manquants pour 4 adultes/10 jours/24 L disponibles, RAM du modèle chargé environ 3,2 Go et VRAM nulle. Ce sont des mesures de ce PC, pas des garanties sur le mini-PC. RAM et vitesse à mesurer sur Ubuntu. Les réponses et traductions restent à vérifier dans les références, surtout pour les premiers secours.

Sources logicielles : [Ollama](https://github.com/ollama/ollama), [Qwen3](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507), [Kiwix JS](https://github.com/kiwix/kiwix-js), [PMTiles](https://github.com/protomaps/go-pmtiles), [SDR++](https://github.com/AlexandreRouma/SDRPlusPlus), [Open-Meteo](https://open-meteo.com/en/docs).
