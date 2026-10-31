# Vidéos locales avec son : sources, téléchargements et diagnostic

Recherche et contrôles du 31 octobre 2026. Quatre nouveaux MP4, avec voix dans leur langue originale, sont présents dans `content/videos/` et intégrés au catalogue `content/videos.catalog.json`. La page propose le filtre « Avec son » par défaut et un bouton d'activation audio. Les fichiers restent exclus de Git ; les catalogues et sources permettent leur préparation avant la coupure.

## Résultat disponible

| Fichier | Sujet et langue | Durée | Octets | Signal audio moyen / maximum |
|---|---|---:|---:|---:|
| `adac-reanimation-spoken-de.mp4` | Réanimation : oser agir ; allemand | 4 min 03 s | 58 073 817 | −16,3 / 0,0 dB |
| `nps-campfire-spoken-en.mp4` | Sécurité du feu de camp avec un ranger ; anglais | 1 min 16 s | 58 688 983 | −28,5 / −3,1 dB |
| `sals-country-park-first-aid-en.mp4` | Scénario de premiers secours au parc ; anglais | 4 min 17 s | 34 222 381 | −24,1 / −5,9 dB |
| `nps-backcountry-safety-spoken-en.mp4` | Équipement, orientation et campement ; anglais, contexte Alaska | 10 min 50 s | 401 407 233 | −24,9 / −3,0 dB |

Total : **552 392 414 octets**, environ 552 Mo, inférieur au plafond de 600 Mo. Aucun téléchargement de plusieurs gigaoctets ni installation d'outil n'a été nécessaire.

Pour chaque vidéo : conteneur reconnu par ffprobe, flux vidéo H.264 et flux sonore AAC stéréo, taille et SHA256 enregistrés. L'analyse complète `ffmpeg volumedetect` confirme un signal non silencieux ; `audioAudible: true` figure dans le catalogue. Ce contrôle numérique ne constitue pas une écoute sur les haut-parleurs de l'utilisateur. Les métadonnées de langue des fichiers ne suffisent pas à déterminer la langue parlée ; le catalogue indique la langue du contenu d'origine.

Outils déjà présents utilisés : `ffprobe.exe` et `ffmpeg.exe` sous `C:\Users\Ahmed\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.2-full_build\bin`.

## Pourquoi les anciennes vidéos BBK semblaient muettes

Les trois anciens fichiers ont tous une piste AAC stéréo. La seule présence d'une piste audio ne prouve donc pas qu'elle contient du son.

| Ancien fichier | Analyse sur tout le fichier | Diagnostic |
|---|---|---|
| `bbk-documents-dgs.mp4` | Moyenne −91,0 dB, maximum −91,0 dB | Piste effectivement silencieuse au seuil de mesure du filtre. |
| `bbk-emergency-bag-dgs.mp4` | Moyenne −91,0 dB, maximum −91,0 dB | Piste effectivement silencieuse au seuil de mesure du filtre. |
| `bbk-food-supplies-dgs.mp4` | Moyenne −15,1 dB, maximum 0,0 dB | Signal sonore réel ; cette vidéo n'est pas muette. |

Pour les deux premières, augmenter le volume ne peut pas créer une narration absente. Ce diagnostic concerne les fichiers téléchargés, sans conclure que toutes les vidéos DGS seraient muettes. La troisième peut servir à distinguer silence du contenu et problème de sortie sonore du navigateur.

## Sources et droits des quatre nouveaux fichiers

### ADAC Stiftung — réanimation

[Page officielle de campagne et téléchargement](https://stiftung.adac.de/lebensrettung/reanimation/meine-haende-koennen-leben-retten/kampagne-und-botschafter/) ; [MP4 officiel](https://stiftung.adac.de/wp-content/uploads/2026/09/ADAC_Reanimation_Hauptfilm_web.mp4).

La page propose « Video herunterladen (MP4) » ainsi que des matériaux pour relayer la campagne. Le film sensibilise et montre une démonstration ; il ne remplace pas une formation pratique. Fichier conservé inchangé avec attribution. Pas de licence ouverte générale supposée pour toute adaptation ou republication.

### National Park Service, Joshua Tree — sécurité du feu

[Campfire Safety with Ranger Donovan](https://www.nps.gov/media/video/view.htm?id=9f750db8-5ae1-4a43-8dbf-fbc7b36b1fd0) ; le bouton de téléchargement original du lecteur officiel vise [ce MP4](https://www.nps.gov/nps-audiovideo/audiovideo/4319e9a3-f3f1-4940-9524-560f21081f4b1080p.mp4).

Le ranger explique des précautions concernant le feu de camp. La page énonce la règle de domaine public pour les médias crédités NPS sans symbole de copyright, en distinguant les œuvres de tiers. Le catalogue conserve cette nuance. Ce contexte américain ne donne aucune autorisation d'allumer un feu en forêt allemande : vérifier les règles locales et les interdictions en vigueur.

### Save a Life for Scotland — Heartstart

[Resources for Trainers](https://www.savealife.scot/heartstart-trainers/) propose explicitement « Download mp4 » dans la série Skills for Life ; [The Country Park](https://savealife.scot/wp-content/uploads/2023/07/The-Country-Park.mp4) est directement hébergé sur le site du programme.

Le partenariat est présenté sur cette page avec le Resuscitation Research Group Edinburgh et des financeurs et services écossais. Le scénario est destiné à l'apprentissage ; les numéros et parcours de secours britanniques doivent être replacés dans leur contexte. En Europe, le numéro d'urgence est le 112. Copie pédagogique locale inchangée avec attribution ; aucune autorisation illimitée de republication n'est présumée.

### National Park Service, Wrangell–St Elias — équipement et campement

[Backcountry Safety, page officielle et transcription](https://www.nps.gov/media/video/view.htm?id=1BB33C00-022F-3F79-DEBC4FBE51956CEA) ; [MP4 original proposé par le bouton de téléchargement](https://www.nps.gov/nps-audiovideo/audiovideo/1b8fb6db-8ce2-4384-a899-5d786890784d1080p.mp4).

La ranger présente la préparation, les vêtements, la carte et la boussole, les équipements et le campement. La page crédite NPS sans symbole de copyright et énonce son régime de domaine public. Le film concerne l'Alaska : ses précautions envers les ours, ses distances de campement et ses démonstrations de franchissement de cours d'eau ne doivent pas devenir un guide universel pour tout lieu. En particulier, ne pas transposer ces techniques aux eaux de crue. Cette vidéo n'est pas un tutoriel complet de potabilisation ou de construction d'abri. Elle a été conservée intégralement et sans modification.

## Autres pistes examinées et limites

- [St Andrew’s First Aid](https://www.firstaid.org.uk/learning-resources/) annonce des ressources gratuites à télécharger et partager, dont des vidéos CPR en arabe et français. Sur la page vérifiée, les vidéos renvoient à YouTube ; aucun MP4 direct proposé n'a été récupéré. Aucun outil d'extraction YouTube utilisé.
- [British Red Cross](https://www.redcross.org.uk/first-aid/learn-first-aid/videos) propose des vidéos de gestes de premiers secours, mais les liens observés concernent YouTube et l'application mobile. Pas de téléchargement MP4 autorisé établi ici.
- [DRK Lerncampus](https://www.drk-lerncampus.de/) indique que ses cours et vidéos ne peuvent pas être fournis pour une utilisation hors ligne. Pas de copie effectuée.
- [RLSS UK](https://www.rlss.org.uk/restart-a-heart-resources) propose explicitement une vidéo CPR « with sound ». Son lien mène à Vimeo, où une vérification de sécurité a empêché l'accès ordinaire. Aucun contournement ni téléchargement effectué.
- [BG Verkehr](https://www.bg-verkehr.de/arbeitssicherheit-gesundheit/themen/arbeitsschutz-organisieren/erste-hilfe-und-notfallmassnahmen) fournit un lien « Video herunterladen ». Le sujet porte sur l'organisation des premiers secours au travail, moins directement sur les gestes : non ajouté à cette sélection.
- [Roaming Rocky, NPS](https://www.nps.gov/romo/learn/photosmultimedia/podcasts_roaming.htm) conserve un lien ancien vers une vidéo Ten Essentials, mais le MP4 indiqué a renvoyé HTTP 404. Le [podcast Grand Canyon correspondant](https://www.nps.gov/media/video/view.htm?id=FB466401-504D-4C6E-8AAD-ECD053E5DD4B) est un MP3 malgré son URL « video » ; il n'a pas été présenté comme une vidéo.
- Sikana reste exclu pour les raisons de droits et partage hors ligne déjà documentées dans `docs/ressources-nature-preparation.md`.

## Eau, abri et portée de ce premier paquet

Ce paquet comporte une vidéo de sécurité du feu, une vidéo de préparation et campement en pleine nature, et deux vidéos de sensibilisation/scénario de premiers secours. Il ne constitue pas encore un cours filmé complet de traitement de l'eau, de construction d'abri ou de survie forestière. Aucun tutoriel non vérifié n'a été ajouté pour remplir ces catégories.

Pour ces sujets, les sources textuelles primaires restent accessibles dans la bibliothèque : [CDC, eau d'urgence](https://www.cdc.gov/water-emergency/about/), [NPS, équipement et abri d'urgence](https://www.nps.gov/articles/10essentials.htm), [NPS, deux méthodes de traitement de l'eau](https://www.nps.gov/articles/2wayspurifywater.htm). Leurs indications doivent être lues avec les limites chimiques/radiologiques décrites dans les fiches locales. Ni un filtre ni l'ébullition ne donnent une garantie universelle de potabilité.

Une prochaine sélection peut compléter eau et abri uniquement lorsque des fichiers pédagogiques fiables, parlés et explicitement téléchargeables sont disponibles. Les nouveaux médias doivent rester hors du dépôt Git ; le catalogue et cette note peuvent être versionnés séparément.
