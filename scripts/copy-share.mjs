import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
const [source, destination] = process.argv.slice(2);
if (!path.isAbsolute(source) || !path.isAbsolute(destination))
  throw Error("Absolute paths required");
const expected = (await readFile(source + ".sha256", "utf8")).split(/\s/)[0];
if (!/^[a-f0-9]{64}$/.test(expected)) throw Error("Invalid checksum");
await mkdir(destination); // New directory only: no overwrite of an existing share.
const target = path.join(destination, path.basename(source));
let bytes = 0,
  last = 0;
const digest = createHash("sha256");
const progress = new Transform({
  transform(chunk, encoding, done) {
    digest.update(chunk);
    bytes += chunk.length;
    if (Date.now() - last > 10000) {
      last = Date.now();
      console.log(JSON.stringify({ stage: "copy", bytes }));
    }
    done(null, chunk);
  },
});
await pipeline(
  createReadStream(source, { highWaterMark: 1048576 }),
  progress,
  createWriteStream(target, { flags: "wx", highWaterMark: 1048576 }),
);
if (digest.digest("hex") !== expected)
  throw Error("Copy source checksum mismatch");
console.log(JSON.stringify({ stage: "NAS-readback", bytes }));
const check = createHash("sha256");
let checked = 0;
for await (const chunk of createReadStream(target, {
  highWaterMark: 1048576,
})) {
  check.update(chunk);
  checked += chunk.length;
  if (Date.now() - last > 10000) {
    last = Date.now();
    console.log(JSON.stringify({ stage: "NAS-readback", bytes: checked }));
  }
}
if (check.digest("hex") !== expected) throw Error("NAS verification failed");
await writeFile(
  target + ".sha256",
  expected + "  " + path.basename(source) + "\n",
  { flag: "wx" },
);
console.log(
  JSON.stringify({ stage: "verified", file: target, bytes, sha256: expected }),
);
