# Livres hors ligne dans REFUGE

Approche choisie : bibliothèque intégrée à REFUGE ; Calibre-Web séparé écarté pour éviter un service supplémentaire sur le mini-PC.

- Page Livres dans la navigation, dans le style forêt déjà approuvé.
- Langues des livres : allemand, français, anglais et arabe. Interface dans ces quatre langues.
- Recherche titre/auteur, catégories littéraires et documentaires, pagination du catalogue, distinction entre catalogue et fichiers installés.
- Lecture locale des textes, taille des caractères et reprise de lecture. Téléchargement du fichier original lorsqu'il est disponible dans un format pris en charge.
- Catalogue extensible depuis des métadonnées officielles. Téléchargement explicite par lots bornés et annulables, sans collecte massive automatique au démarrage.
- Sources identifiées et limites de droits visibles. Un livre gratuit n'est pas automatiquement redistribuable. Pour l'Allemagne, Gutenberg ne garantit que la situation américaine : vérifier auteurs, traductions et éditions avant d'autoriser leur collecte. Éditions inconnues : consultation de la source, pas de téléchargement automatique présenté comme autorisé.
- Sources arabes : Wikisource et textes explicitement réutilisables ; Hindawi/Safahat ne sera pas aspiré intégralement, car les éditions sous contrat et les couvertures ne sont pas toutes redistribuables.
- Les livres sont des données locales, séparées du code Git. Les données personnelles et clés restent exclues des distributions.

Validation : tests de filtrage, téléchargements bornés et chemins confinés ; compilation ; vérification navigateur en français/arabe, mobile et lecture sans service externe.
