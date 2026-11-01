import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  equipmentImageSource,
  equipmentImageSignature,
} from "./equipment-image-policy.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  await readFile(path.join(root, "content/equipment.images.json"), "utf8"),
);
const destination = path.join(root, "public/equipment-photos");
await mkdir(destination, { recursive: true });
const receipts = [];
let failures = 0;
for (const item of manifest) {
  try {
    const source = equipmentImageSource(item);
    const url = source.url;
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
    if (
      !response.ok ||
      (response.headers.get("content-type") || "")
        .split(";")[0]
        .trim()
        .toLowerCase() !== source.mime
    )
      throw Error("Unexpected image response");
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) throw Error("Image exceeds 8 MB");
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (!equipmentImageSignature(bytes, source.mime))
      throw Error("Invalid image signature");
    const filename = path.join(destination, source.filename);
    await writeFile(filename + ".partial", bytes);
    await rename(filename + ".partial", filename);
    receipts.push({
      id: item.id,
      filename: source.filename,
      page: item.page,
      source: item.url,
      downloadedAt: new Date().toISOString(),
      bytes: size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
    console.log(item.id + ": saved " + size + " bytes");
  } catch (error) {
    failures++;
    console.error(item.id + ": " + error.message);
  }
}
await writeFile(
  path.join(destination, "receipts.json"),
  JSON.stringify(receipts, null, 2) + "\n",
);
console.log("Run npm run build to include the local photographs.");
if (failures) process.exitCode = 1;
