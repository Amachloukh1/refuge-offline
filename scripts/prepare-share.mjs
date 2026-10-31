import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  readdir,
  lstat,
  realpath,
  mkdir,
  writeFile,
  access,
} from "node:fs/promises";
import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";

const directories = new Set([
  "content",
  "deploy",
  "dist",
  "docs",
  "models",
  "node_modules",
  "public",
  "runtime",
  "scripts",
  "server",
  "src",
  "tests",
]);
const rootFiles = new Set([
  ".env.example",
  ".gitignore",
  ".gitattributes",
  "DEMARRER-UBUNTU.sh",
  "DEMARRER-WINDOWS.ps1",
  "index.html",
  "package.json",
  "package-lock.json",
  "README.md",
  "vite.config.js",
]);
const blockedSegments = new Set([
  ".git",
  ".aws",
  ".ssh",
  ".codex",
  ".agents",
  ".playwright",
  "private",
  "output",
  "history",
  "sessions",
  "credentials",
]);
export function distributable(relative) {
  if (
    typeof relative !== "string" ||
    !relative ||
    /[\\\r\n\0:]/.test(relative) ||
    path.posix.isAbsolute(relative)
  )
    return false;
  const parts = relative.split("/");
  if (
    parts.some(
      (p) =>
        !p || p === "." || p === ".." || blockedSegments.has(p.toLowerCase()),
    )
  )
    return false;
  const name = parts.at(-1).toLowerCase();
  if (
    (name.startsWith(".env") && relative !== ".env.example") ||
    /\.(?:sqlite(?:-wal|-shm)?|db|log|pid)$/i.test(name) ||
    /^id_(?:rsa|ed25519)(?:\.pub)?$/.test(name)
  )
    return false;
  if (parts[0] === "data")
    return ["data/document-index.json", "data/weather.json"].includes(relative);
  if (
    parts[0] === "runtime" &&
    !["downloads", "linux", "ollama", "pmtiles", "radio"].includes(parts[1])
  )
    return false;
  if (parts[0] === "runtime" && ["config.json", "settings.json"].includes(name))
    return false;
  if (
    parts[0] === "models" &&
    !["blobs", "manifests", "manifests-v2"].includes(parts[1])
  )
    return false;
  return parts.length === 1
    ? rootFiles.has(relative)
    : directories.has(parts[0]);
}
export async function distributionFiles(root) {
  const base = await realpath(root),
    files = [];
  let excluded = 0;
  async function walk(dir, relative = "") {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (
        !relative &&
        !directories.has(entry.name) &&
        entry.name !== "data" &&
        !rootFiles.has(entry.name)
      ) {
        excluded++;
        continue;
      }
      if (rel.split("/").some((p) => blockedSegments.has(p.toLowerCase()))) {
        excluded++;
        continue;
      }
      const full = path.join(dir, entry.name),
        info = await lstat(full);
      if (info.isSymbolicLink())
        throw Error(
          `Symbolic links must be reviewed before distribution: ${rel}`,
        );
      if (info.isDirectory()) await walk(full, rel);
      else if (info.isFile() && distributable(rel)) {
        const resolved = await realpath(full),
          inside = path.relative(base, resolved);
        if (
          path.isAbsolute(inside) ||
          inside === ".." ||
          inside.startsWith(`..${path.sep}`)
        )
          throw Error("File outside project");
        files.push({ path: rel, bytes: info.size });
      } else excluded++;
    }
  }
  await walk(base);
  return {
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    excluded,
    bytes: files.reduce((s, f) => s + f.bytes, 0),
  };
}
async function run(exe, args, cwd) {
  await new Promise((resolve, reject) => {
    const p = spawn(exe, args, { cwd, windowsHide: true, stdio: "inherit" });
    p.on("error", reject);
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(Error(`7-Zip exited with code ${code}`)),
    );
  });
}
export async function prepareShare({ root, archive, sevenZip = "7z" }) {
  root = await realpath(root);
  archive = path.resolve(archive);
  const relative = path.relative(root, archive);
  if (
    !relative.startsWith(`output${path.sep}`) ||
    path.extname(archive) !== ".zip"
  )
    throw Error("Choose a new ZIP inside the project output folder.");
  try {
    await access(archive);
    throw Error("Archive already exists");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  await mkdir(path.dirname(archive), { recursive: true });
  const plan = await distributionFiles(root);
  if (
    !plan.files.some((f) => f.path === "dist/index.html") ||
    !plan.files.some((f) => f.path === "data/document-index.json")
  )
    throw Error("Prepared application or local index missing");
  const list = archive + ".files.txt";
  await writeFile(list, plan.files.map((f) => f.path).join("\n") + "\n", {
    flag: "wx",
  });
  console.log(
    JSON.stringify({
      stage: "selected",
      files: plan.files.length,
      bytes: plan.bytes,
      excluded: plan.excluded,
    }),
  );
  await run(
    sevenZip,
    [
      "a",
      "-tzip",
      "-mx=0",
      "-mmt=2",
      "-scsUTF-8",
      "-y",
      "-bsp0",
      archive,
      `@${list}`,
    ],
    root,
  );
  console.log(JSON.stringify({ stage: "archive-test" }));
  await run(sevenZip, ["t", "-bsp0", archive], root);
  console.log(JSON.stringify({ stage: "checksum" }));
  const hash = createHash("sha256");
  for await (const b of createReadStream(archive, {
    highWaterMark: 1024 * 1024,
  }))
    hash.update(b);
  const sha256 = hash.digest("hex");
  await writeFile(
    archive + ".sha256",
    `${sha256}  ${path.basename(archive)}\n`,
    { flag: "wx" },
  );
  await writeFile(
    archive + ".distribution.json",
    JSON.stringify(
      {
        createdAt: new Date().toISOString(),
        archive: path.basename(archive),
        sha256,
        files: plan.files,
        excluded: plan.excluded,
        privateDataIncluded: false,
        notes:
          "No .env, private/, SQLite chat history, runtime logs or browser export. data/ contains only document-index.json and weather.json. Extract into a new folder and use the prepared launcher. Requires local power; target hardware must be tested.",
      },
      null,
      2,
    ) + "\n",
    { flag: "wx" },
  );
  console.log(
    JSON.stringify({
      stage: "verified",
      archive,
      sha256,
      bytes: (await lstat(archive)).size,
      files: plan.files.length,
    }),
  );
  return { archive, sha256, files: plan.files.length };
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2),
    options = {};
  for (let i = 0; i < args.length; i++) {
    if (["--output", "--sevenzip"].includes(args[i]) && args[i + 1])
      options[args[i].slice(2)] = args[++i];
    else
      throw Error(
        "Usage: node scripts/prepare-share.mjs --output ABSOLUTE_OUTPUT_ZIP [--sevenzip PATH]",
      );
  }
  if (!options.output) throw Error("Choose --output ZIP path");
  await prepareShare({
    root: fileURLToPath(new URL("../", import.meta.url)),
    archive: options.output,
    sevenZip: options.sevenzip || "7z",
  });
}
