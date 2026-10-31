# Sauvegarde complète et restauration hors ligne

La commande copie le projet préparé, y compris `dist`, `server`, `src`, `content`, les PDF/vidéos/cartes/ZIM, `models`, `runtime`, `node_modules`, les configurations, `.env` et `data` (historique et base SQLite). Les dépendances déjà installées sont conservées pour permettre un redémarrage sans téléchargement sur le même système et la même architecture. Les exécutables Windows ne deviennent pas compatibles Ubuntu par la copie : conserver les archives Linux préparées et suivre la préparation de la plateforme cible.

**La sauvegarde contient des données privées et d’éventuels secrets de `.env`.** Utiliser un disque chiffré et conserver la copie à part. Le manifeste SHA-256 détecte les corruptions accidentelles ; ce n’est pas une signature contre une personne pouvant remplacer les fichiers et le manifeste.

## Créer une sauvegarde

Les réserves, lieux et préférences du navigateur ne sont pas dans le dossier du serveur. Avant d'arrêter l'application, aller dans Paramètres → Exporter mes données et conserver le JSON dans `private/refuge-donnees.json` du projet. Cette copie sera incluse dans la sauvegarde et exclue de Git. Après restauration, importer ce JSON dans Paramètres en vérifiant l'aperçu. L'historique IA SQLite, lui, est dans `data` et inclus directement.

1. Arrêter l’application et les services de modèle locaux. Ne plus modifier le projet pendant la copie. C’est nécessaire pour une sauvegarde cohérente de SQLite, de son journal WAL et de l’historique. `--stopped` confirme cet arrêt ; le script ne termine aucun processus.
2. Brancher le disque de destination. Choisir un **nouveau dossier absolu**, dont le dossier parent existe, en dehors du projet. Prévoir au moins la taille du projet préparé et une marge. L’espace libre est contrôlé lorsque le système de fichiers le permet.
3. Depuis le projet, lancer (adapter la lettre du disque) :

```powershell
node scripts/backup-offline.mjs --destination "E:\Refuge-backup-2026-10-31" --stopped
```

Sur Linux :

```sh
node scripts/backup-offline.mjs --destination /media/ahmed/SSD/Refuge-backup-2026-10-31 --stopped
```

La copie et le calcul SHA-256 utilisent des flux, sans charger les gros fichiers en mémoire. Tous les fichiers copiés sont ensuite relus et vérifiés. La commande ne remplace aucun dossier existant et ne supprime aucune donnée. En cas d’échec, le dossier partiel reste disponible pour inspection ; choisir un autre dossier pour recommencer. Seuls les répertoires `.git`, `.cache`, `.vite`, `tmp`, `temp`, `test-results`, `playwright-report` à la racine et les fichiers `*.log`/`*.pid` à la racine ou directement dans `runtime` sont exclus. Les dépendances imbriquées comme `node_modules/tmp` restent copiées. Un ancien `backup-manifest.json` à la racine est remplacé par le nouveau manifeste : une installation restaurée peut donc être sauvegardée à nouveau. Les liens symboliques relatifs qui restent à l’intérieur de la source sont conservés. Un lien sortant, cassé ou non pris en charge provoque une erreur explicite ; sur Windows, des droits de création de liens peuvent être nécessaires.

## Vérifier puis restaurer

```powershell
node scripts/backup-offline.mjs --verify "E:\Refuge-backup-2026-10-31"
node scripts/backup-offline.mjs --restore "E:\Refuge-backup-2026-10-31" --destination "C:\Refuge-restored"
```

Le dossier de restauration doit être nouveau. Le script vérifie intégralement la sauvegarde avant de copier, conserve les permissions exécutables disponibles, puis vérifie la restauration. Un fichier manquant, ajouté, modifié ou un chemin de manifeste sortant bloque la vérification. Le script lui-même nécessite Node.js ; garder également un installateur Node ou l’archive du runtime de la plateforme cible sur le disque. Une copie vérifiée ne prouve pas à elle seule le fonctionnement du modèle, du GPS ou de chaque lecteur : tester le démarrage et les fonctions utiles depuis la restauration, réseau coupé, avant d’en dépendre.

## Autocontrôle des ressources

Le contrôle léger est déclenché à la demande et vérifie les catalogues locaux, les fichiers attendus, leur lisibilité, leur taille lorsqu’elle est fournie, le lecteur wiki effectivement servi dans `dist` et ses scripts/CSS/WASM essentiels, l’index documentaire, les fichiers compilés et le manifeste/blobs du modèle IA catalogué. Il n’effectue aucune requête Internet et ne sonde pas le GPS. Il ne garantit pas l’intégrité des octets. Le contrôle approfondi, également explicite, relit les fichiers en flux et compare leur SHA-256 aux références présentes dans les catalogues ; il peut durer longtemps sur les archives ZIM, le modèle et les runtimes. Le SHA-256 du manifeste du modèle et ceux de ses blobs sont comparés aux références du catalogue/manifeste. Sans somme de référence, la lecture est signalée comme non vérifiée. Aucun contrôle approfondi n’est lancé au démarrage. Les diagnostics publics ne révèlent ni chemins locaux absolus, ni configuration privée. La disponibilité du service IA est un contrôle distinct de la présence des ressources.

Aucune sauvegarde complète sur un autre disque n’est créée automatiquement : il faut sélectionner la destination et exécuter la commande.
