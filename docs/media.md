# Films et musique dans REFUGE

Deux pages intégrées, en français, allemand, anglais et arabe. Media Chrome (MIT,
https://github.com/muxinc/media-chrome) fournit les commandes du lecteur, sans CDN.
Le navigateur décode les fichiers, sans transcodage ni GPU requis par le serveur.

La sélection publique ne contient que des fichiers dont la source et la licence
sont renseignées. Le téléchargement se fait par lots bornés, en flux vers le
disque, avec contrôle du format et empreinte SHA-256 dans un reçu. Les téléchargements
interrompus ne sont jamais présentés comme disponibles hors ligne.

Les imports personnels sont conservés dans `private/media`, exclus de Git et de
la distribution. Le titre fourni ne sert jamais de chemin. Les favoris et la
position de lecture restent dans ce navigateur. Les imports n'accordent aucun
droit de redistribution.

Les fichiers installés utilisent le serveur local et ses requêtes Range. Une
lecture en ligne exige un clic explicite et une connexion Internet. La musique
continue lors de la navigation dans REFUGE, mais s'arrête à la fermeture de
l'onglet. Les codecs disponibles dépendent du navigateur (MP4/WebM, MP3/OGG/M4A/WAV/FLAC).

Vérification : tests des téléchargements, imports et plages HTTP, build, puis
lecture réelle et contrôle de l'interface sur ordinateur et mobile/arabe.
Les gros fichiers sont ignorés par Git : sauvegarder aussi `content/media`.
Le ZIP de partage existant doit être régénéré séparément pour inclure ces ajouts.

Pour installer le catalogue sur une autre machine : `npm ci`, puis
`node scripts/download-media.mjs` avec Internet. Les pages proposent aussi le
téléchargement par sélection. Les gros fichiers ne sont pas poussés sur GitHub.

Sélection initiale : Big Buck Bunny et Elephants Dream complets, bande-annonce
de Sintel (clairement identifiée), huit morceaux de Kevin MacLeod. Les licences,
sources et empreintes attendues figurent dans `content/media.catalog.json`.

Décision : les anciens liens Google renvoient HTTP 403. Remplacement par les
sources Blender officielles ; Sintel complet n'est pas inclus dans ce premier
lot, son fichier disponible étant inadapté au lecteur léger. Big Buck Bunny
est extrait d'un ZIP officiel : seule l'entrée vidéo est lue vers un chemin
généré, sans extraction de chemins de l'archive.
