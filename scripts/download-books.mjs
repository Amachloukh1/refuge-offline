import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createBooks } from "../server/books.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const catalogue = JSON.parse(
  await readFile(
    new URL("../content/books.catalog.json", import.meta.url),
    "utf8",
  ),
);
let ids = process.argv.slice(2);
if (ids[0] === "--starter") {
  ids = [
    "pg-11",
    "pg-84",
    "pg-1342",
    "pg-55",
    "pg-35",
    "pg-1661",
    "pg-2701",
    "pg-174",
    "pg-23",
    "pg-1952",
  ];
  const authors = {
    fr: [
      "Verne",
      "Hugo",
      "Molière",
      "Baudelaire",
      "Flaubert",
      "La Fontaine",
      "Rousseau",
      "Voltaire",
      "Dumas",
      "Balzac",
    ],
    de: [
      "Goethe",
      "Schiller",
      "Kafka",
      "Nietzsche",
      "Fontane",
      "Storm",
      "Grimm",
      "Rilke",
      "Heine",
      "Kant",
    ],
  };
  for (const [lang, names] of Object.entries(authors))
    for (const name of names) {
      const b = catalogue.find(
        (b) => b.language === lang && b.authors.includes(name),
      );
      if (b) ids.push(b.id);
    }
  ids.push(
    ...catalogue
      .filter((b) => b.source === "hindawi" && b.reviewed)
      .map((b) => b.id),
  );
}
if (!ids.length || ids.length > 50)
  throw Error("Choose 1–50 book IDs, or --starter");
const books = createBooks(root);
process.on("SIGINT", () => books.cancel());
await books.start(ids);
let last = "";
do {
  const j = books.snapshot();
  const line = JSON.stringify(j);
  if (line !== last) {
    console.log(line);
    last = line;
  }
  if (!j.running) break;
  await new Promise((r) => setTimeout(r, 1500));
} while (true);
if (books.snapshot().failed) process.exitCode = 1;
