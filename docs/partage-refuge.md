# Version de distribution REFUGE

La sauvegarde personnelle `REFUGE-2026-10-31-03` contient notamment `.env`, l'historique SQLite et l'export du navigateur. Ne pas partager cette sauvegarde directement avec des tiers.

`scripts/prepare-share.mjs` prépare une archive ZIP distincte avec le logiciel, les dépendances, les modèles et ressources hors ligne. Il exclut le dossier privé, l'historique IA, les exports du navigateur, les fichiers `.env` réels, les journaux, les PID et les sources Studio originales inutiles. Seuls `data/document-index.json` et `data/weather.json` sont conservés dans `data` ; les réserves/préférences de l'expéditeur ne sont pas incluses. `.env.example` est un exemple sans clé.

L'archive est contrôlée par 7-Zip et reçoit une empreinte SHA-256. Extraire dans un nouveau dossier, puis lire README.md et utiliser le lanceur de la plateforme. Sous Windows, Node.js 24 doit être installé avant l'utilisation hors ligne. Le runtime Linux et ses archives sont inclus ; la cible Ubuntu doit être testée avant une situation réelle. Vérifier les langues et les limites des sources, en particulier vidéos anglophones/allemandes, Wikipédia compacte et absence d'alertes météo actualisées sans réception externe.

Pour le partage QNAP, sélectionner uniquement cette copie de distribution ou son ZIP, avec téléchargement seul, mot de passe et expiration. Un lien commun peut être retransmis ; il ne limite pas techniquement l'accès à quatre identités. Le mot de passe peut être transmis séparément du lien. Ne pas publier les accès d'administration du NAS ni ouvrir automatiquement des ports du routeur pour ce partage.

## Relais par le PC avec Tailscale

Sans compte QNAP, le ZIP peut être servi par `server/share-download.js`, lié uniquement à `127.0.0.1:8109`, puis publié par Tailscale Funnel sur HTTPS 8443. Le service privé existant sur 443 doit rester privé. Ne jamais utiliser `tailscale funnel reset` ni activer Funnel sur 443 pour ce partage.

Le fichier `private/share-access.json`, ignoré par Git, contient le chemin exact du ZIP, son empreinte, un jeton de route aléatoire, un sel et une empreinte scrypt du mot de passe. Le mot de passe aléatoire est remis au propriétaire lors de la création ; il n'est pas enregistré en clair. L'identifiant est `refuge`. Ce fichier de configuration reste sur le PC, pas dans la distribution.

Le serveur refuse toute autre route et toute écriture, exige une authentification avant de transmettre le fichier, permet les requêtes Range pour reprendre un téléchargement et coupe les transferts à l'expiration. Un lien expiré renvoie HTTP 410 même si le relais Funnel est encore actif. Le PC doit rester allumé et connecté à Internet ; le NAS doit aussi rester accessible lorsque le ZIP servi se trouve sur le NAS. Les amis n'ont pas besoin d'installer Tailscale pour utiliser Funnel. Son débit est limité par le service et par la connexion montante du propriétaire ; une archive de 28,5 Go peut prendre plusieurs heures.

Après un redémarrage du PC, exécuter `RELANCER-PARTAGE.ps1` pour relancer le serveur local. Ce lanceur conserve la date d'expiration existante et ne modifie pas les permissions Tailscale. Prévoir environ 60 Go libres chez le destinataire pour conserver le ZIP et son contenu extrait ; le disque doit accepter les fichiers de plus de 4 Go (par exemple NTFS ou exFAT).

Création de la configuration (chemins absolus vers ZIP, empreinte, configuration privée) :

```powershell
node scripts/create-share-access.mjs CHEMIN_ZIP CHEMIN_SHA256 CHEMIN_CONFIGURATION_PRIVEE
node scripts/serve-share.mjs private/share-access.json
```

Dans un second terminal, après activation de Funnel par le propriétaire :

```powershell
& 'C:\Program Files\Tailscale\tailscale.exe' funnel --bg --https=8443 http://127.0.0.1:8109
```

Pour retirer uniquement ce partage avant l'expiration :

```powershell
& 'C:\Program Files\Tailscale\tailscale.exe' funnel --https=8443 http://127.0.0.1:8109 off
```

Ne pas joindre le mot de passe dans l'URL. Transmettre de préférence le lien et le mot de passe par des canaux séparés. Les destinataires conservent naturellement toute copie déjà téléchargée après l'expiration.

## Contrôles du 31 octobre 2026

- ZIP de distribution : 38 257 fichiers, 28 485 676 537 octets ; test CRC complet par 7-Zip réussi, aucun membre interdit par le filtre de distribution.
- SHA-256 local et après relecture intégrale du NAS : `36ac54c01a2f753cc0d9336d4fbdf86cef8a8cc93c88fce3ae31b485f4f08078`.
- Trois tests ciblés réussis : filtrage des secrets/données privées et serveur temporaire (authentification, méthodes, chemins, Range, expiration).
- Accès réel par le relais public Funnel vérifié en utilisant une adresse obtenue par DNS public, avec le nom TLS original et validation normale du certificat : HTTP 401 sans identifiants, page et HEAD authentifiés HTTP 200, reprise HTTP 206, contenu et empreinte attendus.
- Relais lié uniquement à `127.0.0.1:8109`. Funnel autorisé uniquement sur 8443 ; le service 443 existant reste privé. Relance Windows et absence de doublon vérifiées.
- `npm audit --omit=dev --audit-level=high` : aucune vulnérabilité signalée.

Le lien, le mot de passe et la configuration privée ne sont pas enregistrés dans Git. La sauvegarde personnelle initiale reste inchangée.
