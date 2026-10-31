import { readFile, writeFile } from "node:fs/promises";
const ids = [
  "tsunami",
  "heat",
  "cold",
  "flood",
  "earthquake",
  "storm",
  "homefire",
  "wildfire",
  "blackout",
  "chemical",
  "radiation",
];
const icons = [
  "Waves",
  "Sun",
  "Snowflake",
  "Waves",
  "Activity",
  "Wind",
  "Flame",
  "Trees",
  "Zap",
  "FlaskConical",
  "Radiation",
];
const source = await readFile(
  new URL("../docs/catastrophes-sources.md", import.meta.url),
  "utf8",
);
// Match the next level-two heading explicitly, not a blank line.
const blocks = source
  .split(/^## /m)
  .slice(1)
  .filter((s) => /^\d+\./.test(s));
const records = blocks.map((block, i) => {
  const fields = {};
  let key = null;
  for (const line of block.split(/\r?\n/)) {
    const heading = line.match(/^\*\*(Avant|Pendant|Après|À éviter|Matériel)/);
    if (heading) {
      key = {
        Avant: "before",
        Pendant: "during",
        Après: "after",
        "À éviter": "avoid",
        Matériel: "kit",
      }[heading[1]];
      fields[key] = [];
    } else if (line.startsWith("- ") && key) fields[key].push(line.slice(2));
  }
  const sources = [...block.matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g)].map(
    (m) => ({ label: m[1], url: m[2] }),
  );
  if (i === 1)
    fields.during.push(
      "Une confusion, une perte de connaissance ou un malaise important impose une aide urgente.",
    );
  for (const key of ["before", "during", "after", "avoid", "kit"])
    if (!fields[key]?.length) throw new Error(`Missing ${ids[i]} ${key}`);
  return {
    id: ids[i],
    icon: icons[i],
    reviewedAt: "2026-10-31",
    sources,
    fr: {
      title: block
        .split("\n")[0]
        .replace(/^\d+\. /, "")
        .trim(),
      ...fields,
    },
  };
});
if (records.length !== 11) throw new Error("Expected 11 hazards");
await writeFile(
  new URL("../content/hazards.fr.json", import.meta.url),
  JSON.stringify(records, null, 2) + "\n",
);
console.log(`${records.length} fiches FR compilées.`);
