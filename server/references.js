import { hazards } from "../src/hazards.js";
import { normalize } from "../src/planning.js";
const words = {
  tsunami: "tsunami تسونامي",
  heat: "canicule chaleur chaud heat hot hitze heiss حرارة حر موجة",
  cold: "froid neige cold freezing winter kalte schnee برد ثلج",
  flood: "inondation crue flood hochwasser uberschwemmung فيضان فيضانات",
  earthquake: "seisme tremblement earthquake erdbeben زلزال زلازل",
  storm: "tempete vent storm wind sturm عاصفة رياح",
  homefire:
    "incendie logement maison home fire wohnungsbrand hausbrand حريق منزل",
  wildfire: "foret wildfire waldbrand غابة غابات",
  blackout: "courant electricite blackout outage stromausfall كهرباء",
  chemical: "chimique chemical chemisch chimie كيميائي كيميائية",
  radiation:
    "radiologique nucleaire radiation nuclear strahlung radioaktiv اشعاع نووي",
};
export function hazardReferences(query, lang) {
  const text = normalize(query);
  const scores = hazards
    .map((h) => {
      const aliases = words[h.id].split(" ");
      const score = aliases.reduce((n, w) => n + (text.includes(w) ? 1 : 0), 0);
      return { h, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  return scores
    .map(({ h }) => {
      const d = h[lang];
      return `[${h.id}] ${d.title}\n${["before", "during", "after", "avoid", "kit"].map((k) => `${k}: ${d[k].join(" ")}`).join("\n")}\nSources: ${h.sources.map((s) => s.url).join(" ")}\nVerified: ${h.reviewedAt}. Local official instructions take priority.`;
    })
    .join("\n\n");
}
