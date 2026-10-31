import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseCsv, classifyBook } from "../server/book-catalog.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const input = process.argv[2];
let csv;
if (input) csv = await readFile(input, "utf8");
else {
  const response = await fetch(
    "https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv",
    { signal: AbortSignal.timeout(90000), redirect: "error" },
  );
  if (!response.ok) throw Error(`Catalogue HTTP ${response.status}`);
  csv = await response.text();
}
if (csv.length > 50000000) throw Error("Catalogue too large");
const [header, ...rows] = parseCsv(csv.replace(/^\uFEFF/, ""));
const at = (name) => {
  const pos = header.indexOf(name);
  if (pos < 0) throw Error("Missing CSV column " + name);
  return pos;
};
const columns = Object.fromEntries(
  [
    "Text#",
    "Type",
    "Title",
    "Language",
    "Authors",
    "Subjects",
    "Bookshelves",
  ].map((n) => [n, at(n)]),
);
const extra = JSON.parse(
  await readFile(path.join(root, "content/books.sources.json"), "utf8"),
);
const books = rows
  .filter(
    (r) =>
      r[columns.Type] === "Text" &&
      ["en", "fr", "de", "ar"].includes(r[columns.Language]) &&
      /^[1-9]\d{0,6}$/.test(r[columns["Text#"]]),
  )
  .map((r) => ({
    id: "pg-" + r[columns["Text#"]],
    title: r[columns.Title],
    authors: r[columns.Authors],
    language: r[columns.Language],
    genres: classifyBook(r[columns.Subjects] + " " + r[columns.Bookshelves]),
    source: "gutenberg",
    sourceUrl: "https://www.gutenberg.org/ebooks/" + r[columns["Text#"]],
    format: "txt",
    license:
      "Public domain in the USA; contributor dates checked before download",
    reviewed: false,
  }));
books.unshift(...extra);
await writeFile(
  path.join(root, "content/books.catalog.json.partial"),
  JSON.stringify(books),
);
const { rename } = await import("node:fs/promises");
await rename(
  path.join(root, "content/books.catalog.json.partial"),
  path.join(root, "content/books.catalog.json"),
);
console.log(
  JSON.stringify({
    catalogTotal: books.length,
    languages: Object.fromEntries(
      ["de", "fr", "en", "ar"].map((l) => [
        l,
        books.filter((b) => b.language === l).length,
      ]),
    ),
  }),
);
