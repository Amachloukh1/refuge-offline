// Download only the reviewed catalogue. Never scans or exports private imports.
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createMedia } from "../server/media-library.js";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  await readFile(path.join(root, "content/media.catalog.json"), "utf8"),
);
const media = createMedia(root);
process.on("SIGINT", () => media.cancel());
for (let offset = 0; offset < catalog.length; offset += 20) {
  await media.start(catalog.slice(offset, offset + 20).map((x) => x.id));
  while (media.snapshot().active) await new Promise((r) => setTimeout(r, 500));
  process.stdout.write(JSON.stringify(media.snapshot()) + "\n");
  if (media.snapshot().errors.length) {
    process.exitCode = 1;
    break;
  }
}
const installed = (await media.list()).filter(
  (x) => x.installed && !x.personal,
);
process.stdout.write(
  JSON.stringify({ installed: installed.length, total: catalog.length }) + "\n",
);
