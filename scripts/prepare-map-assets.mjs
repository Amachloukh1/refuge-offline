import { mkdir, writeFile } from "node:fs/promises";
import { layers, namedFlavor } from "@protomaps/basemaps";
const root = new URL("../content/maps/", import.meta.url);
const fonts = new Set();
for (const layer of layers("protomaps", namedFlavor("light"), { lang: "de" })) {
  const f = layer.layout?.["text-font"];
  if (Array.isArray(f) && f.every((v) => typeof v === "string"))
    fonts.add(f.join(","));
}
for (const font of fonts) {
  await mkdir(new URL(`fonts/${font}/`, root), { recursive: true });
  for (const range of [
    "0-255",
    "256-511",
    "512-767",
    "768-1023",
    "1536-1791",
    "8192-8447",
  ]) {
    const response = await fetch(
      `https://protomaps.github.io/basemaps-assets/fonts/${encodeURIComponent(font)}/${range}.pbf`,
      { signal: AbortSignal.timeout(30000) },
    );
    if (!response.ok) throw new Error(`${font} ${range}: ${response.status}`);
    await writeFile(
      new URL(`fonts/${font}/${range}.pbf`, root),
      Buffer.from(await response.arrayBuffer()),
    );
  }
}
await mkdir(new URL("sprites/", root), { recursive: true });
for (const suffix of [".json", ".png", "@2x.json", "@2x.png"]) {
  const response = await fetch(
    `https://protomaps.github.io/basemaps-assets/sprites/v4/light${suffix}`,
    { signal: AbortSignal.timeout(30000) },
  );
  if (!response.ok) throw new Error(`Sprite: ${response.status}`);
  await writeFile(
    new URL(`sprites/light${suffix}`, root),
    Buffer.from(await response.arrayBuffer()),
  );
}
console.log(`Polices et sprites hors ligne : ${[...fonts].join(" ; ")}`);
