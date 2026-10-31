import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { createZstdDecompress } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const directory = new URL("../runtime/linux/ollama/", import.meta.url);
await mkdir(directory, { recursive: true });
const tar = spawn("tar", ["-xf", "-", "-C", fileURLToPath(directory)], {
  stdio: ["pipe", "inherit", "inherit"],
});
const exited = new Promise((resolve, reject) => {
  tar.on("error", reject);
  tar.on("close", (code) =>
    code === 0 ? resolve() : reject(new Error("tar failed: " + code)),
  );
});
await Promise.all([
  pipeline(
    createReadStream(
      new URL(
        "../runtime/linux/ollama-linux-amd64-v0.40.13.tar.zst",
        import.meta.url,
      ),
    ),
    createZstdDecompress(),
    tar.stdin,
  ),
  exited,
]);
await writeFile(
  new URL(".refuge-extracted", directory),
  "Linux archive extracted with symlinks preserved.\n",
);
