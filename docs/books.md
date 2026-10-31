# Livres hors ligne

La page `#books` sépare les notices du catalogue et les fichiers installés. Recherche titre/auteur, langue, 15 genres principaux, pagination de 24 titres, sélection et téléchargement par lots (maximum serveur : 50 identifiants). Aucun livre n'est téléchargé au démarrage. Une file peut être arrêtée ; les fichiers incomplets ne sont pas annoncés comme installés.

## Sources et droits

- Métadonnées officielles Gutenberg : https://www.gutenberg.org/ebooks/offline_catalogs.html ; règles d'automatisation : https://www.gutenberg.org/policy/robot_access.html . Les métadonnées du catalogue sont placées dans le domaine public par Gutenberg. Le collecteur attend au moins 2,1 secondes entre ses requêtes et ne parcourt pas les pages de recherche.
- Les fichiers Gutenberg comprennent leur licence originale. Le contrôle préalable vérifie la mention « Public domain in the USA » et les dates de décès de tous les contributeurs décrits par un bloc agent dans le RDF. Les contributeurs sans date ou trop récents font échouer la collecte. C'est une vérification conservatrice des métadonnées, pas une garantie juridique mondiale ni un contrôle exhaustif de l'édition. En Allemagne, consulter notamment https://www.gesetze-im-internet.de/urhg/__64.html et les droits des traductions/éditions.
- Six éditions arabes de Hindawi ont une déclaration de licence dans leur PDF original. Attribution conservée dans le PDF, les métadonnées et le reçu : auteur et traduction/édition Hindawi, CC BY 4.0 pour les éléments explicitement licenciés ; texte original déclaré dans le domaine public. Fichiers : `41750602`, `48619149`, `72959517`, `41613081`, `70951718`, `41539374` sur https://downloads.hindawi.org/books/ . Il ne s'agit pas d'une autorisation d'aspirer ou redistribuer tout Hindawi/Safahat : https://www.safahat.org/faqs/ . Les entrées `reviewed` ne doivent être ajoutées qu'après vérification de l'édition précise.

Le téléchargement réutilisable est limité aux règles ci-dessus. Une édition refusée reste consultable sur son site source ; ne pas transformer un échec de vérification en autorisation. Les catégories sont déduites automatiquement des sujets et rayons Gutenberg et peuvent être approximatives.

Les éditions arabes sont également épinglées par SHA-256 dans le catalogue source. Si l'éditeur remplace un PDF, son nouveau contenu est refusé jusqu'à une nouvelle vérification de l'édition et de ses droits.

## Sélection arabe complémentaire

Cinq éditions supplémentaires ont été vérifiées dans les PDF originaux (déclaration CC BY 4.0 couvrant leur traduction et leur mise en forme ; texte original déclaré dans le domaine public) et épinglées par SHA-256 :

- Jules Verne, *حول العالم في ٨٠ يومًا* : https://downloads.hindawi.org/books/72647050.pdf .
- H. G. Wells, *حرب العوالم* : https://downloads.hindawi.org/books/82686040.pdf .
- H. G. Wells, *آلة الزمن* : https://downloads.hindawi.org/books/91486168.pdf .
- Arthur Conan Doyle, traduction Sara Yaqout, *علامة الأربعة* : https://downloads.hindawi.org/books/73928048.pdf .
- Robert Barr, traduction Asmaa Azab, *مغامرة شيرلو كومبس* : https://downloads.hindawi.org/books/52951836.pdf .

Les crédits complets et les avis de licence sont conservés dans chaque fichier original. La sélection précédente est maintenue.

## Fichiers et installation

- `content/books.sources.json` : sélection arabe révisée, versionnée avec le code.
- `content/books.catalog.json` : catalogue généré, ignoré par Git ; les distributions complètes et sauvegardes l'incluent.
- `content/books/` : textes UTF-8 et PDF, avec reçus `.json` SHA-256 et taille, ignorés par Git. Stockage actuel : disque du projet local. Vérifier l'espace libre avant de lancer de nombreux lots ; limite par fichier : 20 Mo texte, 50 Mo PDF.
- Lecture TXT paginée avec taille de caractères réglable ; rendu PDF par PDF.js déjà fourni localement. Aucun HTML de livre n'est exécuté, aucune liseuse en ligne nécessaire. Les pages de lecture sont mémorisées dans ce navigateur (`refuge.book.*`) ; elles ne sont pas incluses dans l'export des réserves.

Importer ou actualiser les métadonnées :

```powershell
node scripts/import-book-catalog.mjs
# Ou réutiliser un CSV officiel déjà téléchargé :
node scripts/import-book-catalog.mjs CHEMIN_CSV
```

Le bouton Actualiser reprend un catalogue dont le fichier a changé, sans redémarrage. Sans catalogue généré, les six notices arabes révisées restent disponibles. Un clone Git doit importer le catalogue et télécharger les livres avant de pouvoir les consulter hors ligne.

Télécharger explicitement des livres depuis la page, ou en ligne de commande :

```powershell
node scripts/download-books.mjs --starter
node scripts/download-books.mjs pg-11 pg-84 hw-41750602
```

Les lots de la commande et ceux de l'interface sont indépendants : ne pas les lancer simultanément sur les mêmes livres. Les fichiers se terminent par `.partial` jusqu'à leur validation ; une interruption du processus peut laisser un temporaire, jamais présenté comme un livre installé.

## Vérification du 31 octobre 2026

Catalogue : 68 529 notices (2 415 allemandes, 4 207 françaises, 61 900 anglaises, 7 arabes). Le catalogue comprend des ouvrages historiques, pas uniquement des manuels récents de préparation.

Lot initial réellement terminé sans échec : 36 livres, 69 145 065 octets ; 10 en allemand, 10 en français, 10 en anglais et 6 en arabe. Les autres notices n'impliquent ni téléchargement ni autorisation de redistribution.

Tests : CSV avec retours à la ligne/guillemets ; changement de catalogue à chaud ; refus d'identifiants et lots invalides ; origine étrangère ; plage HTTP ; mauvais format ; installation atomique ; arrêt de file et reprise de lecture locale. Suite projet : 51 tests réussis, 1 test de lien symbolique sauté faute d'autorisation Windows.

### Lot complémentaire du 31 octobre 2026

95 fichiers supplémentaires ont été installés : 30 allemands, 30 français, 30 anglais et 5 arabes. Les éditions refusées par le contrôle des droits ont été laissées de côté et remplacées par d'autres titres ; aucun contrôle n'a été désactivé.

Total confirmé par l'API locale et relecture SHA-256 de tous les fichiers : **131 livres**, **139 872 068 octets** (40 DE, 40 FR, 40 EN, 11 AR). Le catalogue comprend désormais **68 534 notices**, dont 12 arabes. Ce total de notices reste distinct des fichiers installés.
