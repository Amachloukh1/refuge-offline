import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  await readFile(path.join(root, "content/catalog.json"), "utf8"),
);
await mkdir(path.join(root, "content/documents"), { recursive: true });
let failures = 0;
for (const doc of catalog) {
  try {
    if (!/^[a-zA-Z0-9_-]+\.pdf$/.test(doc.filename))
      throw new Error("invalid filename");
    const target = path.join(root, "content/documents", doc.filename);
    try {
      const current = await readFile(target);
      if (createHash("sha256").update(current).digest("hex") === doc.sha256) {
        console.log(`Déjà vérifié : ${doc.filename}`);
        continue;
      }
    } catch {}
    const url = new URL(doc.url);
    if (
      url.protocol !== "https:" ||
      !["www.bbk.bund.de", "www.drk-durlach.de"].includes(url.hostname)
    )
      throw new Error("unapproved source");
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const chunks = [];
    let total = 0;
    for await (const chunk of response.body) {
      total += chunk.length;
      if (total > 20000000) throw new Error("file too large");
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw new Error("not a PDF");
    if (createHash("sha256").update(bytes).digest("hex") !== doc.sha256)
      throw new Error(
        "source changed: check the new edition before updating the catalogue",
      );
    await writeFile(target + ".partial", bytes);
    await rename(target + ".partial", target);
    console.log(`Téléchargé et vérifié : ${doc.filename}`);
  } catch (error) {
    failures++;
    console.error(`${doc.filename} : ${error.message}`);
  }
}
if (failures) process.exitCode = 1;
