# Préparation et fiabilité — 31 octobre 2026

## Vidéos : différence entre les captures

L'ancien onglet affichait une version antérieure du frontend. Un rechargement a révélé le catalogue réel : dix fichiers installés, huit avec son. La nouvelle page affiche les compteurs, la recherche sans accents, les filtres de langue/sujet, une actualisation manuelle et au retour dans l'onglet. L'onglet « Sujets à préparer » conserve cuisine/sport/réparations avec leur statut non téléchargé. Ces liens nécessitent Internet. Aucun fichier supplémentaire n'est inventé pour remplir les catégories.

## Fonctions ajoutées

- Urgence maintenant, accessible dans la barre supérieure : six situations avec première consigne issue des fiches existantes, interruption d'eau, accès aux premiers secours, impression. Fonctionne sans IA.
- Suis-je prêt : eau calculée, nourriture, traitements personnels, énergie, documents et sac d'évacuation. Confirmations manuelles distinctes des réserves de démonstration. Changer le foyer/la durée les réinitialise ; changer le stock invalide les confirmations eau/nourriture/traitements.
- Contrôle hors ligne : présence, lisibilité et tailles des PDF, vidéos, cartes, ZIM, runtime, compilation du lecteur Kiwix et blobs du modèle catalogué. SHA-256 en lecture progressive sur demande explicite. Aucune preuve de batterie/radio/GPS ou de justesse médicale déduite de ce test.
- Réserves : emplacement, contrôle/DDM/DLC, rotation locale par dates, consommation bornée avec dix dernières opérations. Modèles de repas sans cuisson choisis et quantifiés manuellement, inclus dans l'export personnel. Aucun calcul d'autonomie calorique ou de ration médicale.
- Énergie : mini-PC, écran et autres charges, capacité, réserve, heures quotidiennes et hypothèses de coût/pertes. Mode éco persisté, arrêt des tâches IA actives/en attente, animations désactivées. Aucun arrêt du système d'exploitation ni production solaire garantie.
- Carte personnelle : lieux nommés, coordonnées validées, notes d'itinéraire, marqueurs locaux, impression et export GeoJSON. Pas de calcul d'itinéraire ni de certification de potabilité/d'ouverture des lieux.
- IA : sources, éditeur et dates distinctes de revue éditoriale et téléchargement. Aucun résultat de recherche ne déclenche plus l'ajout de fiches sans rapport. Les liens de référence sont conservés dans l'historique.
- Données : import JSON validé et prévisualisé, export de l'état courant avant remplacement. Les données locales incompatibles restent intactes, avec export de l'original et écriture bloquée jusqu'à restauration valide. L'import personnel inclut stock, journal, repas, lieux et confirmations, mais pas SQLite ni les gros fichiers.
- Sauvegarde complète : copie vers dossier neuf avec manifeste SHA-256, vérification, restauration dans un autre dossier neuf et nouvelle sauvegarde après restauration. Inclut dépendances, ressources, moteur, modèles, `.env` et historique privé. Voir [procédure](backup-restore.md).

## Premiers secours : origine et limites

Les résumés courts complètent les PDF DRK déjà présents. Traductions de travail, non validées par DRK ; pas une formation pratique. Pages primaires consultées le 31/10/2026 :

- [DRK — saignement important](https://www.drk.de/hilfe-in-deutschland/erste-hilfe/blutungen-und-blutstillung/blutungen/)
- [DRK — inconscience et respiration](https://www.drk.de/hilfe-in-deutschland/erste-hilfe/bewusstlosigkeit/)
- [DRK — brûlures](https://www.drk.de/hilfe-in-deutschland/erste-hilfe/verbrennungen/)

Le résumé brûlures suit la page actuelle DRK (20 minutes d'eau fraîche non glacée, prévention de l'hypothermie) ; les anciens PDF peuvent différer. L'appel 112 dépend de la disponibilité du réseau.

## Essai réel à effectuer sur le mini-PC Ubuntu

1. Copier le dossier préparé complet. Démarrer sans Internet et après redémarrage du système.
2. Ouvrir une fiche, un PDF, un article Wikipédia, chaque vidéo utile et la carte ; noter toute erreur.
3. Mesurer mini-PC + écran au wattmètre, vérifier démarrage/arrêt sur batterie et autonomie réelle.
4. Tester le GPS dehors et la radio avec le matériel adapté ; ne pas déduire ces fonctions de l'icône logicielle.
5. Exporter les données, vérifier une copie externe et faire un essai de restauration dans un nouveau dossier.

Ces essais matériels ne sont pas encore réalisés sur le mini-PC Ubuntu de l'utilisateur.
