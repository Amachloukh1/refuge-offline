# GPS, météo radio et cartes : état réel

Vérifications du 31 octobre 2026. Les photographies montraient « G-MOUSE, DC3.3V–5.0V, IPX6 ». L'appareil branché a ensuite été identifié sur COM4, USB VID 1546 / PID 01A7, avec messages NMEA et texte matériel u-blox UBX-G70xx. Il s'agit d'un récepteur GNSS/GPS, pas d'un tuner FM, DAB ou HF. Le test a reçu les phrases RMC/GGA, mais pas de position valide. Le test avec vue dégagée du ciel est reporté à la demande de l'utilisateur.

Dans Cartes, « Lire le GPS USB » effectue une courte lecture locale. La configuration Windows est `REFUGE_GPS_PORT=COM4` dans `.env` privé. Aucun port n'est ouvert automatiquement au démarrage, aucune coordonnée n'est envoyée au serveur distant de l'IA et les coordonnées ne sont pas enregistrées dans les journaux. Une position antérieure ne reste pas affichée comme nouvelle mesure pendant la recherche. Si la position est hors de Saxe, le texte le précise ; le paquet Saxe ne fournit pas une carte détaillée hors de ses limites.

Sur Ubuntu, préparer `gpsd`/`gpsd-clients` et les permissions du périphérique pendant qu'un accès Internet est disponible. Identifier le vrai chemin `/dev/serial/by-id/...` ; ne pas supposer que `/dev/ttyACM0` correspond toujours au GPS. L'adaptateur REFUGE lit uniquement gpsd sur `127.0.0.1:2947`. Cette configuration Ubuntu et la réception satellite restent à tester sur le mini-PC.

## Météo sans Internet

Une prévision sauvegardée est datée et ne devient pas une nouvelle observation. Pour de nouvelles informations sans Internet :

- Radio FM/DAB publique avec bulletins météo, tant que les émetteurs fonctionnent. La [préparation BBK](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/So-koennen-Sie-sich-vorbereiten/so-koennen-sie-sich-vorbereiten_node.html) prévoit un moyen radio autonome.
- Réception des bulletins et cartes marines DWD par HF/SSB, avec récepteur couvrant ces bandes, antenne et décodeur appropriés. Le [DWD décrit ses émissions](https://www.dwd.de/DE/fachnutzer/schifffahrt/service/dauerbrenner_072025_barrierearm.pdf?__blob=publicationFile&v=1) ; son [plan radiofax](https://www.dwd.de/DE/derdwd/it/_functions/Teasergroup/sendeplan_seefax.pdf?__blob=publicationFile&v=2) indique 3855, 7880 et 13882,5 kHz. Ce sont des fréquences de service, pas une promesse de réception ; régler le récepteur et le décodeur suivant leurs notices et tester localement. Les cartes marines ne constituent pas des alertes précises pour une adresse en Saxe.
- Mesures locales par thermomètre, baromètre, pluviomètre : utiles sur place, elles ne remplacent pas à elles seules une prévision régionale. Un service satellite compatible constitue une autre liaison externe, généralement payante.

La G-MOUSE ne reçoit aucun de ces bulletins. SDR++ est préparé, mais le bon récepteur radio et l'antenne manquent. Aucun logiciel ne renouvelle une météo si tous les émetteurs et services cessent de fonctionner.

## Estimation des cartes prêtes à afficher

CLI officiel [PMTiles](https://github.com/protomaps/go-pmtiles) 1.31.2, option `extract --dry-run`, source `https://build.protomaps.com/20261030.pmtiles`, zoom maximal 14. Seuls les répertoires de l'archive ont été consultés, pas les grandes cartes téléchargées.

| Région rectangulaire | Limites ouest,sud,est,nord | Carte estimée | Transfert estimé |
|---|---|---:|---:|
| Europe élargie, avec archipels et régions voisines | -32,34,70,83 | environ 28 Go | environ 29 Go |
| Afrique du Nord élargie, incluant les latitudes de Mauritanie et du Soudan | -18,8,38,38 | environ 2,6 Go | environ 2,7 Go |

Total : environ **31 Go** pour ces rectangles. Réserver **40 Go libres pour les cartes** est une marge de préparation ; garder simultanément deux versions ou une sauvegarde demande davantage. L'ancienne estimation plus étroite était 27 + 1,5 Go ; les limites ont été élargies pour mieux correspondre à la demande. Les tailles sont arrondies par le CLI et dépendent du snapshot/style/zoom. Ce ne sont pas des extraits précis aux frontières politiques.

Les cartes ne comprennent ni calcul d'itinéraire, ni relief DEM, ni photographie satellite. Les données OSM brutes ne sont pas directement équivalentes à ces cartes : [Geofabrik](https://download.geofabrik.de/) annonce d'autres tailles pour ses `.osm.pbf`, qui demanderaient une préparation supplémentaire avant affichage. Le fichier `content/maps.plan.json` conserve nos limites et estimations ; seule Saxe est actuellement installée.
