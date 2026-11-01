import { readFile, mkdir, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
    const url = new URL(item.url);
    if (
      !/^[a-z0-9-]+$/.test(item.id) ||
      url.protocol !== "https:" ||
      url.hostname !== "m.media-amazon.com" ||
      url.username ||
      url.password ||
      !url.pathname.startsWith("/images/I/") ||
      !url.pathname.endsWith(".jpg")
    )
      throw Error("Unapproved image source");
    const response = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
    if (
      !response.ok ||
      !/^image\/jpeg(?:;|$)/i.test(response.headers.get("content-type") || "")
    )
      throw Error("Expected a JPEG response");
    const chunks = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > 8 * 1024 * 1024) throw Error("Image exceeds 8 MB");
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (
      bytes.length < 4 ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes[2] !== 0xff
    )
      throw Error("Invalid JPEG signature");
    const filename = path.join(destination, item.id + ".jpg");
    await writeFile(filename + ".partial", bytes);
    await rename(filename + ".partial", filename);
    receipts.push({
      id: item.id,
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
