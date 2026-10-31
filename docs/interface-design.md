# REFUGE — prototype navigable

Le besoin et les pages ont été acceptés dans la conversation. Cette réalisation est une maquette interactive locale, avec données fictives signalées, sans intégration serveur, Ollama, Kiwix, Grocy, météo ou SDR. Aucune publication.

Approche retenue pour la maquette : React + Vite, stockage local versionné, aucun CDN, aucune police externe. Une plateforme intégrée NOMAD reste une option pour la phase serveur ; une simple image ne permettrait pas de tester les pages.

Référence visuelle : concept Image Gen du 31 octobre 2026, REFUGE, fond gris clair #f5f6f3, surfaces blanches, navigation forêt #193f32, accents #3c7256, bordures #e1e5df, rayon 14px, police sans sérif système. Logo abri/feuille et icônes en traits. Titres 40/26/20px, corps 15px, petits textes 13px. Colonnes 2:1, panneau d'accueil et secours, autonomie et achats, raccourcis. Sur mobile navigation dans un tiroir et une seule colonne. SVG pour icônes et boussole, aucun média raster nécessaire au produit.

Pages : accueil ; assistant (réponses de démonstration explicites et recherche des fiches, pas de faux modèle connecté) ; bibliothèque (recherche, filtres, favoris, lecteur) ; santé (fiches d'orientation, sources et pharmacie fictive) ; réserves (quantités modifiables, ajout, liste, foyer et objectif) ; cartes (absence de cartes installées explicite, repères locaux fictifs) ; météo/radio (aucune donnée actuelle) ; vidéos (catalogue à préparer, pas de fausse lecture) ; préparation (checklist et plan familial fictif) ; paramètres.

Les fiches intégrées sont des résumés de préparation, pas les PDF complets. Les liens vers sources externes sont identifiés. Langues FR/DE/EN ; pays Allemagne pour cette première version. Les données personnelles réelles ne doivent pas être saisies dans ce prototype non chiffré.

Vérification prévue : calcul eau et validation stock avec node:test ; build ; navigation navigateur, ajout de stock, persistance, filtres, langue, clavier, mobile. Le calcul eau est un repère adulte de planification basé sur 2 L/jour boisson + cuisson du BBK, hors hygiène et besoins particuliers, non une prescription. Aucun diagnostic ou dosage généré.

## Évolution demandée pendant la réalisation

L'utilisateur a demandé le début du développement fonctionnel, l'arabe RTL, la réutilisation de son Local Studio, un moteur local avec serveur distant optionnel et des fiches détaillées de catastrophes. Ces ajouts priment sur le cadrage initial « maquette uniquement ». Node sert maintenant l'application et les PDF sans accès Internet ; adaptateurs IA réels, mais modèle et clé non disponibles pour essai réel. Les interfaces de cartes/vidéos/météo/radio gardent un état absent honnête. Les consommables initiaux restent fictifs. Le compteur alimentaire remplace la fausse estimation de six jours du concept par un nombre de produits ; le pied de page et la navigation ont été ajustés pour les fonctions ajoutées. Ces différences sont intentionnelles.

## Conception visuelle

Concept : outil Image Gen intégré, prompt ui-mockup demandant un tableau de bord REFUGE français complet, sidebar vert forêt, fond gris clair, recherche, panneau de préparation avec boussole en trait, secours, autonomie, achats et raccourcis. Copie de la référence conservée dans docs/design-reference.png. Aucun élément bitmap n'est nécessaire dans l'interface ; icônes et boussole sont des SVG natifs.

Vérification visuelle : comparaison de la référence et des captures par view_image, à 1536×1024 et en vue téléphone 390×844. Points à vérifier : palette, largeur de navigation, hiérarchie des titres, colonnes 2:1, rayons/espacement, icônes en trait, boutons et comportement RTL. Les captures pleine page peuvent dépasser la hauteur du viewport pour documenter les sections sous le pli. Navigateur intégré essayé, mais ses outils n'ont pas joint localhost et n'ont pas retrouvé l'onglet ; validation par Playwright/Chrome local.

Résultats : palette gris/forêt, navigation de 260 px au grand format, composition 2:1, cartes à rayons cohérents et icônes en trait comparées à la référence. Titres et boutons conservent la hiérarchie prévue. La navigation Catastrophes, le statut des services, le compteur de produits et les avertissements documentaires constituent les différences de texte intentionnelles. La boussole et le logo ont été réalisés en SVG natif et la police est une police système pour l'autonomie hors ligne ; ce sont des différences assumées par rapport au raster conceptuel. Le tiroir mobile est masqué hors ouverture et l'arabe inverse les colonnes et le sens de lecture.

Validation fonctionnelle effectuée : 15 tests Node réussis ; deux parcours Chrome/Playwright réussis sur ordinateur et téléphone, FR et AR, avec blocage des requêtes navigateur externes. Les scripts injectés par l'antivirus de l'hôte sont bloqués et distingués des dépendances applicatives. Parcours : stock modifié puis rechargé, favoris et lecteur fermé au clavier, PDF arabe lu, calcul d'eau, moteur indisponible signalé, raccourcis achats/plan familial, recherche tsunami, onze fiches, canicule détaillée et RTL. Audit npm des dépendances de production : zéro vulnérabilité signalée. Les essais d'API avec un vrai modèle ou une clé Studio et l'installation Ubuntu restent à effectuer sur la cible.
