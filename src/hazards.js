import french from "../content/hazards.fr.json" with { type: "json" };
import translations from "../content/hazards.translations.json" with { type: "json" };
const keywords = {
  tsunami: "tsunami تسونامي",
  heat: "chaleur chaud canicule heat hot hitze heiß حرارة حر",
  cold: "froid neige cold winter kälte schnee برد ثلج",
  flood: "inondation crue flood hochwasser فيضان",
  earthquake: "séisme tremblement earthquake erdbeben زلزال",
  storm: "tempête vent storm wind sturm عاصفة",
  homefire: "incendie maison home fire wohnungsbrand حريق",
  wildfire: "forêt wildfire waldbrand غابات",
  blackout: "électricité panne courant blackout outage stromausfall كهرباء",
  chemical: "chimique chemical chemisch كيميائي",
  radiation: "radiologique nucléaire radiation nuclear strahlung إشعاع نووي",
};
export const hazards = french.map((h) => ({
  ...h,
  keywords: keywords[h.id],
  en: translations.en[h.id],
  de: translations.de[h.id],
  ar: translations.ar[h.id],
}));
