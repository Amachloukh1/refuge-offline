# Vidéos complémentaires : sources et contrôles

Trois nouveaux MP4 locaux, sans doublon des sept vidéos existantes. Total ajouté : 211 555 276 octets (211,6 Mo). Téléchargements inchangés, empreintes SHA-256 dans `content/videos.catalog.json`. La collection comporte désormais dix vidéos dont huit avec un signal audio non silencieux, pour environ 1,04 Go. Les médias restent sur le disque local ; le dépôt contient le catalogue et le programme de téléchargement, pas les MP4.

## Sources retenues

- **Hémorragie — The Garage** : [ressources officielles Heartstart](https://www.savealife.scot/heartstart-trainers/), bouton Download mp4. Le [guide officiel](https://savealife.scot/wp-content/uploads/2023/08/HS-Instructors-Guide.pdf), page 17, associe The Garage aux saignements importants. Anglais, 173,44 s, 25 711 756 octets. Contexte Écosse ; formation pratique recommandée. Téléchargement pédagogique proposé, sans licence ouverte générale présumée.
- **Hygiène des mains — Region Hannover** : [page officielle et bouton Video download](https://www.hannover.de/Leichte-Sprache/Media/01-DATA-Neu/Videos/Region-Hannover-Videos/Gesundheit/Infektionen-vermeiden-richtiges-H%C3%A4ndewaschen). Allemand, 58,058 s, 4 264 397 octets. Crédit © Region Hannover ; copie locale inchangée et attribution, redistribution à vérifier.
- **Bivouac et ours — NPS Smokies** : [page officielle](https://www.nps.gov/media/video/view.htm?id=BA43C4F9-858F-4E88-933E-07F7CB9A9BE5), également sur la [page camping du parc](https://www.nps.gov/grsm/planyourvisit/backcountry-camping.htm). Anglais, 269,5693 s, 181 579 123 octets. Camping, aliments, abris du parc et ours : contexte américain, pas un tutoriel universel de construction d’abri. Crédit NPS Video/William Campbell, Julianne Geleynse et Becca Foster. La page actuelle avertit de ne pas présumer tout média NPS dans le domaine public ; contacter le parc avant redistribution publique.

## Vérification technique

ffprobe reconnaît trois vidéos H.264 avec une piste AAC. ffmpeg volumedetect a analysé les pistes entières :

| Film              | Audio             |  Moyenne | Maximum |
| ----------------- | ----------------- | -------: | ------: |
| Heartstart Garage | AAC stéréo 48 kHz | −24,4 dB | −5,9 dB |
| Hanovre mains     | AAC mono 44,1 kHz | −41,0 dB | −5,8 dB |
| NPS Smokies       | AAC stéréo 48 kHz | −24,1 dB | −2,9 dB |

Signaux non silencieux constatés. Hanovre a un niveau moyen faible. Ce contrôle technique ne constitue pas une transcription et ne garantit pas chaque seconde de dialogue. Le champ audioAudible décrit le signal non silencieux vérifié.

## Pistes non ajoutées

Les pages officielles CDC proposaient des MP4 sur l’eau à faire bouillir, mais le fichier testé Follow-Recs-About-Boiling-Water a renvoyé Access Denied et 08_Boil_1200x675.mp4 a répondu 404. Aucun fichier eau ajouté. Aucune extraction YouTube.

Cold Water Boot Camp USA proposait des ZIP pédagogiques ; le téléchargement First 60 Seconds_50.zip a échoué avec une réponse 301. Aucun fichier retenu. RNLI impose des droits spécifiques ; aucun téléchargement confirmé retenu. Des pages Vimeo ont été repérées, sans fichier MP4 supplémentaire vérifié. Aucun contournement.

Seuls les fichiers effectivement téléchargés et vérifiés sont annoncés comme disponibles dans l’interface.
