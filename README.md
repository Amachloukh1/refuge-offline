# REFUGE

Application locale de préparation aux crises. Interface FR / DE / EN / AR (droite à gauche), six fiches de préparation intégrées, bibliothèque PDF, réserves modifiables, calcul de réserve d'eau, checklist, plan familial et adaptateur IA. Linux Ubuntu 22.04 visé ; développement testé sous Windows avec Node 24.

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

Une archive de transfert avec interface compilée et les sept PDF est préparée dans `output/`. Sur Ubuntu avec Node déjà installé : extraire dans un dossier puis lancer `bash DEMARRER-UBUNTU.sh`. Aucun `npm install` n'est nécessaire pour démarrer cette archive préparée. Le moteur et les modèles IA ne sont pas inclus. L'archive contient les documents pour votre installation personnelle ; elle ne doit pas être publiée sans vérifier leurs droits.

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

Pour **Ollama local** (configuration par défaut), installer Ollama depuis sa source officielle, puis `ollama pull qwen3:4b` avant déconnexion. Régler `OLLAMA_NO_CLOUD=1` dans l'environnement du service Ollama. REFUGE n'installe pas et ne démarre pas silencieusement un moteur.

Le bouton **Serveur 2ki.space** est facultatif et distinct. Ajouter `REFUGE_REMOTE_STUDIO_KEY` dans `.env` et éventuellement `REFUGE_REMOTE_STUDIO_MODEL`. Le choix distant transmet les messages au serveur existant ; il demande un réseau. Aucun basculement automatique du mode local vers le serveur public. Le lien public n'est pas une copie locale du moteur. L'API distante réelle n'a pas encore été testée avec une clé projet.

Le moteur reçoit les six résumés fournis dans `src/data.js` et jusqu'à deux fiches catastrophes pertinentes selon les mots de la question, pas l'intégralité des PDF ni Wikipédia. Les références affichées par l'IA doivent être vérifiées. Le bouton de calcul d'eau utilise directement les règles de calcul sans solliciter le modèle. Aucune prescription médicale, actualité météo, géolocalisation ou autonomie alimentaire réelle ne peut être déduite du modèle.

## Documents

Sept PDF officiels téléchargés : BBK DE/FR/EN/AR et DRK premiers secours DE-FR/DE-AR/DE-EN. Le catalogue garde URL, date de téléchargement, taille et SHA256. Les documents sont exclus de Git : gratuit à télécharger n'implique pas licence de redistribution. Les flyers DRK sont des éditions anciennes ; vérifier les recommandations actuelles et suivre une formation. Le logiciel ne prétend pas faire valider médicalement ces fichiers.

Pour préparer une autre installation, `node scripts/fetch-content.mjs` télécharge les versions vérifiées. Une empreinte modifiée est refusée pour permettre une vérification éditoriale de la nouvelle édition.

## Services existants facultatifs

`deploy/compose.services.yml` prépare Ollama, Kiwix et Grocy via leurs images officielles ou recommandées par leurs projets. Exemple :

```sh
docker compose -f deploy/compose.services.yml --profile local-ai up -d
docker compose -f deploy/compose.services.yml exec ollama ollama pull qwen3:4b
```

Kiwix demande des fichiers `.zim` dans `content/zim`, téléchargés depuis le catalogue Kiwix. Le profil `library` sert ensuite ces contenus sur localhost:8008. Grocy est disponible avec le profil `grocy` sur localhost:9283 ; son inventaire reste distinct de l'inventaire intégré REFUGE. Ce fichier Compose est préparé mais n'a pas été exécuté sur cet ordinateur. Les images `latest` sont des points de départ : conserver les images exactes préparées et tester avant une installation durable. Open WebUI peut être ajouté séparément avec le même moteur local ; REFUGE ne prétend pas être Open WebUI.

Les cartes, vidéos et récepteur radio ne sont pas installés dans cette livraison. Les pages décrivent honnêtement leur état. Les alertes météo exigent une réception récente ; aucun logiciel ne fournit de nouvelles alertes pendant que le PC est éteint.

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
