# Équipement de préparation — vérification du 31 octobre 2026

**Relevé le plus récent :** [station 1 024 Wh, autres vendeurs et prix du 1er novembre](equipment-prices-2026-11-01.md).
Le catalogue actuel compte 19 références avec un prix (dont un TTC calculé et signalé)
et deux paniers à composer sans prix global. Les 23 nouvelles illustrations sont
incluses dans le code ; les [prompts et chemins](generated-illustrations.json)
distinguent ces visuels des photos de produits.
La [pharmacie par symptôme](pharmacy-otc-sources.md) comporte sept rubriques de
médicaments et trois rubriques de matériel. Les sections suivantes conservent
les relevés antérieurs ; leurs totaux ne décrivent pas la sélection actuelle.

## Complément du 1er novembre 2026

Le catalogue contient maintenant 21 références/catégories : 13 existantes et
8 compléments. Les fiches nouvelles détaillent bidon 20 L, réchaud extérieur,
filtre, semences, masques FFP2, Starlink, solaire de balcon et outillage.
Un onglet distinct propose une pharmacie générale fondée sur BBK et gesund.bund.de.

Prix principaux relevés directement sur les fiches Amazon.de, article neuf,
hors livraison éventuelle. Aucun achat effectué :

| Référence                                       | Prix EUR | URL                                 |
| ----------------------------------------------- | -------: | ----------------------------------- |
| Bidon vide 20 L avec robinet                    |    27,95 | https://www.amazon.de/dp/B0B6VNHFC5 |
| Campingaz Camp’Bistro 3, kit avec plaque gril   |    39,79 | https://www.amazon.de/dp/B0DJ9FFGGV |
| Katadyn BeFree AC 1 L Black Edition             |    57,86 | https://www.amazon.de/dp/B0DT99W4MK |
| Goodaro, assortiment de 15 variétés de semences |     7,95 | https://www.amazon.de/dp/B08Y5CB8MX |
| 3M Aura 9320+ FFP2, lot de 20                   |    48,99 | https://www.amazon.de/dp/B0BQJLKPRQ |

Le vendeur n'est indiqué que lorsqu'il a été relevé. Le total de dix références
avec prix est un repère pour une unité de chacune, comprenant deux alternatives
de bidon (20 L et 22 L), et non une recommandation d'acheter tout le catalogue.
Starlink, une installation solaire de balcon et les catégories génériques gardent
un prix à vérifier : abonnement, compatibilité et besoins changent le coût réel.

Dix photos provenant des fiches sont référencées dans content/equipment.images.json.
Le script scripts/fetch-equipment-images.mjs enregistre des JPEG bornés, sans redirection,
avec empreintes et sources dans public/equipment-photos/ (ignoré par Git).
La compilation les copie dans l'application. Aucun accès réseau
n'est effectué pour afficher les photos dans REFUGE. Sans cache, une illustration
de catégorie est affichée. Les photos ne certifient pas les produits et ne sont
pas couvertes automatiquement par la licence du logiciel.

Sources des nouveaux conseils :
[Campingaz, usage extérieur](https://www.campingaz.de/en/products/camp-bistro-3),
[Katadyn, limites du filtre](https://support.katadyngroup.com/157178-How-can-I-tell-whether-my-BeFree-filter-is-still-working-or-defective),
[BZL, potager de balcon](https://www.landwirtschaft.de/garten/selbst-anbauen/gemuese-und-kraeuter-vom-eigenen-balkon),
[Verbraucherzentrale, solaire de balcon](https://www.verbraucherzentrale.de/wissen/energie/erneuerbare-energien/faq-zu-steckersolargeraeten-das-sind-die-haeufigsten-fragen-86652),
[Starlink Mini, spécifications](https://starlink.com/public-files/specification_sheet_mini.pdf),
[gesund.bund.de, pharmacie](https://gesund.bund.de/hausapotheke).

Les sections ci-dessous conservent le relevé historique du 31 octobre.

Ajout dans Préparation → Équipement à acheter. Les données et les liens restent enregistrés dans le bundle local ; ouvrir Amazon nécessite Internet. Aucun achat automatique ni affiliation.

## Prix observés directement sur Amazon.de

Recherche puis ouverture de chaque fiche produit dans le navigateur, sans connexion à un compte. Prix principal d'un article neuf, TVA affichée, sans coupon conditionnel ni prix de seconde main. Frais de livraison éventuels exclus. Disponibilité et prix ne sont pas garantis après cette observation.

| Référence exacte                                        | Prix EUR | Vendeur observé      | Source                              |
| ------------------------------------------------------- | -------: | -------------------- | ----------------------------------- |
| EcoFlow RIVER 2 + panneau pliable 110 W                 |   408,00 | EcoFlow Germany GmbH | https://www.amazon.de/dp/B0BQVYT4WJ |
| Panasonic RF-2400DEG-K noir                             |    29,99 | Amazon               | https://www.amazon.de/dp/B06XWZ41RT |
| eneloop Smart + quatre AA 2000 mAh, charge annoncée 7 h |    28,99 | Amazon               | https://www.amazon.de/dp/B0B5X4PKW1 |
| Petzl TIKKINA 300 lm rouge                              |    26,27 | Tec & More           | https://www.amazon.de/dp/B0FBT74D4R |
| hünersdorff STANDARD 22 L avec tube, vide               |    15,46 | Amazon               | https://www.amazon.de/dp/B00O4FRRH6 |

Total indicatif : 508,71 EUR pour une unité de chaque référence, avant frais éventuels. Ce total n'est pas le coût d'une préparation complète : les quantités du foyer, eau, nourriture, traitements et autres catégories sont à ajouter. Les coches « Déjà équipé » déduisent seulement la référence de ce repère et ne changent pas l'inventaire.

## Spécifications et limites

- [EcoFlow, kit RIVER 2 + 110 W](https://eu.ecoflow.com/products/river-2-110w-portable-solar-panel) : 256 Wh, 300 W continus ; ne pas reprendre le « jusqu'à 600 W » marketing comme puissance continue.
- [Notice EcoFlow RIVER 2, édition internationale](https://ecoflow-service-us-prod.oss-us-west-1.aliyuncs.com/cms/manual/1703840867822/EcoFlow%20RIVER%202-User%20Manual%28en%29.pdf) : variante EU 230 V, entrée solaire 11–30 V / 8 A / 110 W maximum, recharge 0–45 °C. Le calculateur utilise une hypothèse explicite de 70 % de capacité disponible, pas une autonomie mesurée. Consommation totale réelle du mini-PC et de l'écran encore inconnue.
- [Panasonic RF-2400D](https://www.panasonic.com/fr/consumer/audio-video/radios/rf-2400d.specs.html) : FM/AM, quatre AA, pas DAB+. Les descriptions Amazon génériques peuvent contenir des champs erronés ; les besoins de piles suivent les caractéristiques constructeur.
- Frontale : trois AAA ou CORE optionnelle ; le kit eneloop comprend des AA, les AAA restent donc un achat distinct. Ne pas charger de piles alcalines.
- Eau : bidon alimentaire vide, ni filtre ni désinfection. 22 L sont lourds à transporter.

## Référence retirée après vérification

La batterie Anker Zolo 20 000 mAh 30 W avec câble USB-C (A1689) avait été repérée à 31,99 EUR sur Amazon (B0CZ9LH53B). Elle n'est **pas** recommandée dans le catalogue : [Anker Allemagne annonce un rappel de certains lots](https://www.anker.com/eu-de/rc2506/), également documenté par [la CPSC](https://www.cpsc.gov/Recalls/2025/Anker-Power-Banks-Recalled-Due-to-Fire-and-Burn-Hazards-Manufactured-by-Anker-Innovations-1). La fiche générique batterie USB conseille un modèle/numéro de série hors rappel, sans inventer de prix.

## Autres besoins sans prix vérifié

Premiers secours, nourriture et ouvre-boîte, hygiène, chaleur et couchage, détecteurs, documents/espèces, carte papier/boussole. Les liens de recherche Amazon ne constituent pas une certification des produits trouvés. Aucun prix n'est fabriqué pour ces catégories. Les critères généraux complètent les guides officiels BBK déjà présents dans la bibliothèque locale.

## Validation

Test navigateur avec requêtes externes bloquées : affichage des prix/liens, calcul d'autonomie, coches conservées après rechargement, filtre de priorité, interface arabe RTL et absence d'erreur JS.
