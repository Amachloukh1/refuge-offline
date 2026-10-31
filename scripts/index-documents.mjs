import { readFile, writeFile, mkdir } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
const root = new URL("../", import.meta.url);
const catalog = JSON.parse(
  await readFile(new URL("content/catalog.json", root), "utf8"),
);
const chunks = [];
for (const doc of catalog) {
  const bytes = await readFile(
    new URL(`content/documents/${doc.filename}`, root),
  );
  const loadingTask = getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: true,
    isEvalSupported: false,
  });
  const pdf = await loadingTask.promise;
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
    const page = await pdf.getPage(pageNo);
    const data = await page.getTextContent();
    const text = data.items
      .map((item) => item.str + (item.hasEOL ? "\n" : " "))
      .join("")
      .replace(/[ \t]+/g, " ")
      .trim();
    if (text.length < 60) continue;
    for (let at = 0; at < text.length; at += 1300) {
      const part = text.slice(at, at + 1600);
      chunks.push({
        id: `${doc.id}-p${pageNo}-${at}`,
        title: doc.title,
        language: doc.language,
        page: pageNo,
        text: part,
        href: `/documents/${doc.filename}#page=${pageNo}`,
        publisher: doc.publisher,
      });
    }
  }
  await loadingTask.destroy();
  console.log(`Indexé : ${doc.filename}`);
}
await mkdir(new URL("data/", root), { recursive: true });
await writeFile(
  new URL("data/document-index.json", root),
  JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), chunks }),
);
console.log(`${chunks.length} passages locaux indexés, sans service externe.`);
