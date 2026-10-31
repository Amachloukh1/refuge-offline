import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { guideData } from "../src/data.js";
import { hazards } from "../src/hazards.js";
import { normalize } from "../src/planning.js";
const stop = new Set(
  "avec pour dans vous nous votre vos une les des que qui quoi comment est sont mais peut sans sur aux cette cela tous avoir faut fait plus par the and with what how your this that from into for und der die das eine ein mit wie was sie ihr von في من إلى على عن ما كيف هذا هذه التي الذي أو هل هو هي".split(
    " ",
  ),
);
export function terms(text) {
  return normalize(text)
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !stop.has(w));
}
export function rankPassages(query, passages, language, limit = 5) {
  const words = [...new Set(terms(query))];
  if (!words.length) return [];
  return passages
    .map((p) => {
      const title = terms(p.title),
        body = terms(p.text);
      const match = words.reduce(
        (sum, w) =>
          sum + (title.includes(w) ? 5 : 0) + (body.includes(w) ? 1 : 0),
        0,
      );
      return {
        ...p,
        score: match
          ? match + ((p.language || "").split("-").includes(language) ? 2 : 0)
          : 0,
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
export function validatePlanning(value) {
  if (
    !value ||
    !Number.isInteger(value.people) ||
    value.people < 1 ||
    value.people > 50 ||
    !Number.isInteger(value.days) ||
    value.days < 1 ||
    value.days > 365 ||
    !Number.isFinite(value.water) ||
    value.water < 0 ||
    value.water > 1000000
  )
    return null;
  const targetWater = value.people * value.days * 2;
  return {
    people: value.people,
    days: value.days,
    water: value.water,
    targetWater,
    missingWater: Math.max(0, targetWater - value.water),
  };
}
let pdfCache = { filename: "", mtime: 0, chunks: [] };
async function pdfChunks(root) {
  const filename = path.join(root, "data/document-index.json");
  try {
    const info = await stat(filename);
    if (pdfCache.filename !== filename || pdfCache.mtime !== info.mtimeMs) {
      const index = JSON.parse(await readFile(filename, "utf8"));
      pdfCache = {
        filename,
        mtime: info.mtimeMs,
        chunks: Array.isArray(index.chunks) ? index.chunks : [],
      };
    }
    let catalog = [];
    try {
      const data = JSON.parse(
        await readFile(path.join(root, "content/catalog.json"), "utf8"),
      );
      if (Array.isArray(data)) catalog = data;
    } catch {
      /* Missing catalog means unknown download date, never a fabricated one. */
    }
    const byFilename = new Map(
      catalog.map((document) => [document.filename, document]),
    );
    return pdfCache.chunks.map((chunk) => {
      const filename = chunk.href?.match(/^\/documents\/([^#]+)(?:#|$)/)?.[1];
      const document = byFilename.get(filename);
      return {
        ...chunk,
        publisher: document?.publisher || chunk.publisher,
        reviewedAt: undefined,
        downloadedAt: document?.downloadedAt,
        sources: document
          ? [
              {
                label: document.publisher,
                url: document.sourcePage || document.url,
              },
            ]
          : [],
      };
    });
  } catch {
    return [];
  }
}
export async function retrieveKnowledge(root, query, lang) {
  const passages = guideData.map((g) => ({
    id: g.id,
    title: g.title[lang],
    text: g.body[lang].join("\n"),
    href: `#library?view=${g.id}`,
    language: lang,
    publisher: g.publisher,
    reviewedAt: g.reviewedAt,
    sources: g.sources || (g.url ? [{ label: g.publisher, url: g.url }] : []),
  }));
  for (const h of hazards) {
    const d = h[lang];
    passages.push({
      id: `hazard-${h.id}`,
      title: d.title,
      text: ["before", "during", "after", "avoid", "kit"]
        .map((k) => `${k}: ${d[k].join(" ")}`)
        .join("\n"),
      href: `#hazards?view=${h.id}`,
      language: lang,
      publisher: h.sources.map((source) => source.label).join(" · "),
      reviewedAt: h.reviewedAt,
      sources: h.sources,
    });
  }
  passages.push(...(await pdfChunks(root)));
  const ranked = rankPassages(query, passages, lang, 5);
  let size = 0;
  const selected = [];
  for (const p of ranked) {
    const text = p.text.slice(0, 1800);
    if (size + text.length > 7000) continue;
    selected.push({ ...p, text });
    size += text.length;
  }
  return {
    text: selected
      .map(
        (p) =>
          `[${p.id}] ${p.title}${p.page ? ` — page ${p.page}` : ""} (${p.publisher})\n${p.reviewedAt ? `Content review date: ${p.reviewedAt} (editorial metadata, not clinical validation).` : p.downloadedAt ? `PDF downloaded: ${p.downloadedAt} (download date, not publication or medical review date).` : "Review date not provided."}\nSources: ${(p.sources || []).map((source) => `${source.label}: ${source.url}`).join("; ")}\n${p.text}`,
      )
      .join("\n\n"),
    references: selected.map(
      ({
        id,
        title,
        href,
        page,
        publisher,
        reviewedAt,
        downloadedAt,
        sources,
      }) => ({
        id,
        title,
        href,
        page,
        publisher,
        reviewedAt,
        downloadedAt,
        sources,
      }),
    ),
  };
}
