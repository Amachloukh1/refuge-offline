# REFUGE

Application locale de préparation aux crises. Interface FR / DE / EN / AR (droite à gauche), 14 fiches pratiques, bibliothèque PDF indexée, réserves modifiables, plan d'achats illustré, checklist, plan familial et assistant IA local. Carte Saxe, vidéos BBK, Wikipédia compacte FR/DE/AR et météo sauvegardée préparées sur le PC Windows. Ubuntu 22.04 reste à tester sur le mini-PC.

**Installation actuelle, contenu, limites et transfert : [guide hors ligne](docs/installation-offline.md).** Le dépôt GitHub conserve le code et les catalogues ; les gros fichiers locaux doivent être transférés séparément. Un clone seul ne contient pas les modèles ni les archives Wikipédia.

La page **Catastrophes** contient onze fiches détaillées : tsunami, canicule, grand froid, inondation, séisme, tempête, incendie du domicile, feu de forêt, panne prolongée, accident chimique et incident radiologique. Chaque fiche décrit préparation, actions pendant l'événement, vie après, erreurs à éviter et matériel. Sources primaires datées ; traductions non officielles. Elles sont imprimables et accessibles hors ligne. Les raccourcis directs utilisent par exemple `#hazards?view=tsunami`.

## Lancer

Node.js **22.12+ ou 24** et npm. Préparer avec Internet :

```sh
npm ci
npm run build
node scripts/fetch-content.mjs
```

Puis, même sans Internet :

```sh
npm start
```

Ouvrir **http://127.0.0.1:8099**. Les fichiers compilés, le serveur et `content/documents` doivent rester sur le PC. Aucun CDN, police distante, compte cloud ou connexion Internet requis pour ces fonctions. Le navigateur doit autoriser le stockage local pour conserver les modifications ; exporter régulièrement les données.

Pour transférer la version actuelle, utiliser le dossier complet avec les ressources décrites dans le guide hors ligne. L'ancienne archive dans `output/` ne contient que la première version avec les PDF et n'est pas une sauvegarde des nouvelles ressources. Le lanceur Ubuntu utilise le runtime Linux préparé et les modèles présents ; aucun `npm install` n'est requis pour démarrer le dossier compilé complet.

Sous Ubuntu : `bash scripts/prepare-ubuntu.sh`. Le script ne télécharge pas automatiquement plusieurs Go de modèles. Le modèle et le moteur doivent être préparés sur le mini-PC avant la coupure. Il ne faut pas confondre l'installation sur cet ordinateur Windows avec celle sur le mini-PC Ubuntu.

## Réutilisation de Local Studio

L'API est compatible avec le sous-ensemble `/v1/chat/completions` documenté dans la copie locale Nexus Local Studio. L'adaptateur conserve le modèle et la clé de projet côté serveur. Le dépôt GitHub `Amachloukh1/ai-local-text-to-image-generator` a été consulté : sa branche principale contient l'ancien générateur et pas le service `studio/` présent dans la copie locale. Aucun changement au Studio existant.

Copier `.env.example` en `.env`. Pour **Studio sur le même mini-PC** :

```dotenv
REFUGE_AI_PROVIDER=studio
REFUGE_AI_BASE_URL=http://127.0.0.1:8090/local-studio/v1
REFUGE_AI_MODEL=local-chat-fast
REFUGE_AI_KEY=VOTRE_CLE_PROJET
```

Créer une clé limitée au chat et à ce modèle dans l'administration Studio. Ne pas la mettre dans le frontend ou GitHub. Aucun accès aux clés existantes n'a été utilisé. Le Studio doit fonctionner et son modèle doit être disponible ; le modèle `local-glm` de la machine existante dépasse le budget RAM de 8–16 Go d'après ses propres notes de déploiement. Privilégier le modèle rapide 4B et valider sa consommation réelle sur la cible.

Pour **Ollama local**, le modèle par défaut est `qwen3:4b-instruct-2507-q4_K_M`, préparé dans `models` et testé sur CPU. Régler `OLLAMA_NO_CLOUD=1`. Les lanceurs démarrent le moteur portable dédié sur 11479 s'il n'est pas déjà présent. Aucun modèle n'est téléchargé automatiquement au démarrage.

Le bouton **Serveur 2ki.space** est facultatif et distinct. Ajouter `REFUGE_REMOTE_STUDIO_KEY` dans `.env` et éventuellement `REFUGE_REMOTE_STUDIO_MODEL`. Le choix distant transmet les messages au serveur existant ; il demande un réseau. Aucun basculement automatique du mode local vers le serveur public. Le lien public n'est pas une copie locale du moteur. L'API distante réelle n'a pas encore été testée avec une clé projet.

Le moteur reçoit jusqu'à cinq passages pertinents parmi les 14 fiches, les 11 catastrophes et les 193 passages extraits des PDF, avec liens vers les fiches ou pages PDF. C'est une recherche locale avec contexte, sans réentraînement du modèle. Wikipédia se consulte séparément. Le stock d'eau, le nombre d'adultes et la durée sont transmis avec le calcul vérifié. Les références et réponses doivent être contrôlées ; aucune prescription médicale ou identification de nourriture sauvage par l'IA.

## Documents

Sept PDF officiels téléchargés : BBK DE/FR/EN/AR et DRK premiers secours DE-FR/DE-AR/DE-EN. Le catalogue garde URL, date de téléchargement, taille et SHA256. Les documents sont exclus de Git : gratuit à télécharger n'implique pas licence de redistribution. Les flyers DRK sont des éditions anciennes ; vérifier les recommandations actuelles et suivre une formation. Le logiciel ne prétend pas faire valider médicalement ces fichiers.

Pour préparer une autre installation, `node scripts/fetch-content.mjs` télécharge les versions vérifiées. Une empreinte modifiée est refusée pour permettre une vérification éditoriale de la nouvelle édition.

## Services existants facultatifs

`deploy/compose.services.yml` prépare Ollama, Kiwix et Grocy via leurs images officielles ou recommandées par leurs projets. Exemple :

```sh
docker compose -f deploy/compose.services.yml --profile local-ai up -d
docker compose -f deploy/compose.services.yml exec ollama ollama pull qwen3:4b-instruct-2507-q4_K_M
```

Kiwix demande des fichiers `.zim` dans `content/zim`, téléchargés depuis le catalogue Kiwix. Le profil `library` sert ensuite ces contenus sur localhost:8008. Grocy est disponible avec le profil `grocy` sur localhost:9283 ; son inventaire reste distinct de l'inventaire intégré REFUGE. Ce fichier Compose est préparé mais n'a pas été exécuté sur cet ordinateur. Les images `latest` sont des points de départ : conserver les images exactes préparées et tester avant une installation durable. Open WebUI peut être ajouté séparément avec le même moteur local ; REFUGE ne prétend pas être Open WebUI.

La carte de Saxe, trois vidéos et le lecteur Wikipédia sont préparés et testés localement. SDR++ est téléchargé ; la réception exige un récepteur et une antenne. La météo sauvegardée porte sa date ; aucune nouvelle prévision ni alerte n'arrive sans réception récente ou pendant que le PC est éteint.

## Démarrage automatique Ubuntu

Adapter le chemin du projet dans `deploy/refuge.service`, le copier dans `~/.config/systemd/user/`, puis `systemctl --user daemon-reload` et `systemctl --user enable --now refuge`. Le service démarre avec la session utilisateur ; un démarrage avant connexion demande une configuration système supplémentaire. Node installé avec nvm doit avoir un chemin explicite dans `ExecStart`. Le serveur écoute seulement sur loopback : l'accès depuis d'autres appareils n'est pas activé sans authentification et configuration réseau adaptées.

## Vérifier

```sh
npm test
npm run build
npx playwright test
```

Le test navigateur exige Chrome local et le serveur lancé. Il bloque les requêtes navigateur hors localhost, vérifie les PDF, la recherche, les favoris, le stock, la persistance, l'arabe et le téléphone. Les tests de contrat IA utilisent un moteur simulé ; ils ne prouvent pas la vitesse ou la qualité d'un modèle installé.

Les quantités initiales sont fictives. Le tableau de bord compte les produits alimentaires ; il n'invente pas une autonomie en jours sans les données nutritionnelles nécessaires. Le calcul d'eau suit les quantités saisies. Les données du navigateur ne sont pas chiffrées et ne sont pas partagées entre appareils : utiliser des données fictives pour le plan familial à ce stade.
