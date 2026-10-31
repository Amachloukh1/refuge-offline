import { readFile, mkdir, stat, rename } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const choices = process.argv.slice(2);
if (
  !choices.length ||
  choices.some((c) => !["--videos", "--wiki", "--radio"].includes(c))
)
  throw new Error(
    "Choisir --videos (~279 MB), --wiki (~11.44 GB), ou --radio. Téléchargement explicite uniquement.",
  );
async function hash(file) {
  const h = createHash("sha256");
  for await (const b of createReadStream(file)) h.update(b);
  return h.digest("hex");
}
async function download(url, folder, name, expected, bytes) {
  if (!/^[\w.-]+$/.test(name) || !url.startsWith("https://"))
    throw new Error("Invalid catalog");
  await mkdir(path.join(root, folder), { recursive: true });
  const target = path.join(root, folder, name);
  try {
    if (
      (await stat(target)).isFile() &&
      (!bytes || (await stat(target)).size === bytes) &&
      (!expected || (await hash(target)) === expected)
    ) {
      console.log("Présent : " + name);
      return;
    }
  } catch {}
  const r = await fetch(url);
  if (!r.ok || !r.body) throw new Error("Download failed: " + name);
  const h = createHash("sha256");
  let size = 0;
  const meter = new Transform({
    transform(b, e, cb) {
      size += b.length;
      if (bytes && size > bytes) {
        cb(new Error("File exceeds catalog size"));
        return;
      }
      h.update(b);
      cb(null, b);
    },
  });
  await pipeline(
    Readable.fromWeb(r.body),
    meter,
    createWriteStream(target + ".partial"),
  );
  if ((bytes && size !== bytes) || (expected && h.digest("hex") !== expected))
    throw new Error("Integrity mismatch: " + name);
  await rename(target + ".partial", target);
  console.log("Vérifié : " + name);
}
for (const option of choices) {
  const kind = option.slice(2);
  const catalog = JSON.parse(
    await readFile(path.join(root, "content", kind + ".catalog.json"), "utf8"),
  );
  if (kind === "radio") {
    for (const a of catalog.assets)
      await download(
        a.browser_download_url,
        "runtime/radio",
        a.name,
        a.digest?.replace("sha256:", ""),
        a.size,
      );
  } else
    for (const a of catalog) {
      await download(
        a.url,
        "content/" + (kind === "wiki" ? "zim" : "videos"),
        a.filename,
        a.sha256,
        a.bytes,
      );
      if (a.subtitleFilename)
        await download(
          a.subtitleUrl,
          "content/videos",
          a.subtitleFilename,
          a.subtitleSha256,
          a.subtitleBytes,
        );
    }
}
