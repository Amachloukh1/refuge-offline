import { readFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
export async function loadList(root, filename) {
  try {
    const data = JSON.parse(await readFile(path.join(root, filename), "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
export async function resources(root) {
  const videos = [];
  for (const v of await loadList(root, "content/videos.catalog.json")) {
    if (!/^[\w.-]+\.mp4$/.test(v.filename || "")) continue;
    try {
      const info = await stat(path.join(root, "content/videos", v.filename));
      if (info.isFile()) videos.push({ ...v, bytes: info.size });
    } catch {}
  }
  const maps = [];
  for (const m of await loadList(root, "content/maps.catalog.json")) {
    try {
      const info = await stat(path.join(root, "content/maps", m.filename));
      if (info.isFile() && info.size === m.bytes) maps.push(m);
    } catch {}
  }
  const wiki = [];
  try {
    for (const filename of await readdir(path.join(root, "content/zim"))) {
      if (/^[\w.-]+\.zim$/.test(filename)) {
        const info = await stat(path.join(root, "content/zim", filename));
        wiki.push({
          filename,
          bytes: info.size,
          language: filename.split("_")[1],
          compact: filename.includes("_mini_"),
        });
      }
    }
  } catch {}
  let wikiReader = false;
  try {
    wikiReader = (
      await stat(
        path.join(root, "content/wiki-reader/kiwix-js-4.4.0/dist/index.html"),
      )
    ).isFile();
  } catch {}
  return { videos, maps, wiki, wikiReader };
}
