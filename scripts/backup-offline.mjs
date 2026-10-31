import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  lstat,
  realpath,
  readdir,
  readFile,
  writeFile,
  mkdir,
  statfs,
  chmod,
  symlink,
  readlink,
} from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createHash } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

const MANIFEST = "backup-manifest.json";
const excluded = new Set([
  ".git",
  ".cache",
  ".vite",
  "tmp",
  "temp",
  "test-results",
  "playwright-report",
  ".playwright",
]);
const within = (base, file) => {
  const rel = path.relative(base, file);
  return (
    rel === "" ||
    (!path.isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${path.sep}`))
  );
};
function safeRelative(value) {
  if (
    typeof value !== "string" ||
    !value ||
    value.includes("\\") ||
    value.includes(":") ||
    value.includes("\0") ||
    path.posix.isAbsolute(value) ||
    value.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw new Error("Unsafe manifest path.");
  return value;
}
async function hashFile(file, onChunk = () => {}) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) {
    hash.update(chunk);
    onChunk(chunk.length);
  }
  return hash.digest("hex");
}
async function inventory(root, filter = false) {
  const entries = [];
  async function walk(directory, relative = "") {
    for (const item of (await readdir(directory, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      if (item.name === MANIFEST && !relative) continue;
      if (
        filter &&
        ((!relative && excluded.has(item.name)) ||
          ((!relative || relative === "runtime") &&
            /\.(log|pid)$/i.test(item.name)))
      )
        continue;
      const rel = safeRelative(
        relative ? `${relative}/${item.name}` : item.name,
      );
      const file = path.join(root, rel);
      const info = await lstat(file);
      if (info.isSymbolicLink()) {
        const target = await readlink(file);
        if (
          path.isAbsolute(target) ||
          path.win32.isAbsolute(target) ||
          !within(root, path.resolve(path.dirname(file), target)) ||
          !within(root, await realpath(file))
        )
          throw new Error(`Symlink escapes source: ${rel}`);
        entries.push({
          path: rel,
          type: "symlink",
          target,
          mode: info.mode & 0o777,
        });
      } else if (info.isDirectory()) {
        entries.push({ path: rel, type: "directory", mode: info.mode & 0o777 });
        await walk(file, rel);
      } else if (info.isFile())
        entries.push({
          path: rel,
          type: "file",
          bytes: info.size,
          mode: info.mode & 0o777,
          modified: info.mtimeMs,
        });
      else throw new Error(`Unsupported filesystem entry: ${rel}`);
    }
  }
  await walk(root);
  return entries;
}
async function newDestination(source, destination) {
  if (!destination || !path.isAbsolute(destination))
    throw new Error("Destination must be an absolute path.");
  const resolved = path.resolve(destination);
  const parent = await realpath(path.dirname(resolved));
  const canonical = path.join(parent, path.basename(resolved));
  if (within(source, canonical) || within(canonical, source))
    throw new Error(
      "Destination must be outside the source and cannot contain the source.",
    );
  try {
    await lstat(canonical);
  } catch (error) {
    if (error.code === "ENOENT") return canonical;
    throw error;
  }
  throw new Error("Destination already exists; choose a new folder.");
}
async function checkSpace(target, bytes) {
  // Some removable/network filesystems do not expose free-space statistics.
  try {
    const info = await statfs(path.dirname(target), { bigint: true });
    if (info.bavail * info.bsize < BigInt(bytes) + 16n * 1024n * 1024n)
      throw new Error("Insufficient destination disk space.");
    return true;
  } catch (error) {
    if (error.message === "Insufficient destination disk space.") throw error;
    if (["ENOSYS", "ENOTSUP", "EINVAL", "UNKNOWN"].includes(error.code))
      return false;
    throw error;
  }
}
async function copyEntries(source, target, entries, onProgress = () => {}) {
  let completedBytes = 0;
  const totalBytes = entries.reduce((s, e) => s + (e.bytes || 0), 0);
  for (const entry of entries) {
    const from = path.join(source, entry.path),
      to = path.join(target, entry.path);
    if (entry.type === "directory") await mkdir(to);
    else if (entry.type === "symlink") {
      // Relative internal links are preserved. Windows may require Developer Mode/admin.
      const info = await lstat(await realpath(from));
      await symlink(entry.target, to, info.isDirectory() ? "dir" : "file");
    } else {
      const before = await lstat(from);
      if (
        !before.isFile() ||
        before.size !== entry.bytes ||
        (entry.modified !== undefined && before.mtimeMs !== entry.modified)
      )
        throw new Error(`Source changed during backup: ${entry.path}`);
      const digest = createHash("sha256");
      await pipeline(
        createReadStream(from),
        new Transform({
          transform(chunk, encoding, callback) {
            digest.update(chunk);
            completedBytes += chunk.length;
            onProgress({ stage: "copy", completedBytes, totalBytes });
            callback(null, chunk);
          },
        }),
        createWriteStream(to, { flags: "wx" }),
      );
      const after = await lstat(from);
      if (
        before.size !== after.size ||
        before.mtimeMs !== after.mtimeMs ||
        before.ino !== after.ino
      )
        throw new Error(`Source changed during backup: ${entry.path}`);
      const sha256 = digest.digest("hex");
      if (entry.sha256 && sha256 !== entry.sha256)
        throw new Error(`Checksum mismatch: ${entry.path}`);
      entry.sha256 = sha256;
      await chmod(to, entry.mode);
    }
  }
  // Apply restrictive directory permissions only after writing their children.
  for (const entry of [...entries].reverse())
    if (entry.type === "directory")
      await chmod(path.join(target, entry.path), entry.mode);
}
export async function verify(directory, { onProgress = () => {} } = {}) {
  const root = await realpath(directory);
  const manifestPath = path.join(root, MANIFEST);
  if ((await lstat(manifestPath)).isSymbolicLink())
    throw new Error("Manifest must be a regular file.");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.entries))
    throw new Error("Unsupported backup manifest.");
  const seen = new Set();
  let completedBytes = 0;
  const totalBytes = manifest.entries.reduce((s, e) => s + (e.bytes || 0), 0);
  for (const entry of manifest.entries) {
    safeRelative(entry.path);
    if (
      entry.path === MANIFEST ||
      seen.has(entry.path) ||
      !["file", "directory", "symlink"].includes(entry.type)
    )
      throw new Error("Invalid manifest entry.");
    seen.add(entry.path);
    const file = path.join(root, entry.path),
      info = await lstat(file);
    // Check parents too, so an unexpected directory symlink never escapes the root.
    if (!within(root, await realpath(file)))
      throw new Error(`Unsafe backup entry: ${entry.path}`);
    if (entry.type === "file") {
      if (
        !info.isFile() ||
        !Number.isSafeInteger(entry.bytes) ||
        entry.bytes < 0 ||
        info.size !== entry.bytes ||
        !/^[a-f0-9]{64}$/.test(entry.sha256) ||
        (await hashFile(file, (n) => {
          completedBytes += n;
          onProgress({ stage: "verify", completedBytes, totalBytes });
        })) !== entry.sha256
      )
        throw new Error(`Checksum mismatch: ${entry.path}`);
    } else if (entry.type === "directory") {
      if (!info.isDirectory() || info.isSymbolicLink())
        throw new Error(`Directory mismatch: ${entry.path}`);
    } else if (
      !info.isSymbolicLink() ||
      (await readlink(file)) !== entry.target ||
      path.isAbsolute(entry.target) ||
      path.win32.isAbsolute(entry.target)
    )
      throw new Error(`Symlink mismatch: ${entry.path}`);
  }
  const actual = await inventory(root);
  if (
    actual.length !== seen.size ||
    actual.some((entry) => !seen.has(entry.path))
  )
    throw new Error("Backup contains unmanifested entries.");
  return manifest;
}
export async function backup({
  source,
  destination,
  stopped = false,
  onProgress = () => {},
}) {
  if (!stopped)
    throw new Error(
      "Stop the application and local model services first; pass --stopped to confirm they are stopped.",
    );
  const root = await realpath(source);
  const target = await newDestination(root, destination);
  const entries = await inventory(root, true);
  const bytes = entries.reduce((sum, entry) => sum + (entry.bytes || 0), 0);
  onProgress({
    stage: "inventory",
    files: entries.filter((e) => e.type === "file").length,
    totalBytes: bytes,
    symlinks: entries.filter((e) => e.type === "symlink").length,
  });
  const spaceChecked = await checkSpace(target, bytes);
  await mkdir(target, { mode: 0o700 });
  // A failed operation leaves the incomplete folder for inspection; it never deletes data.
  await copyEntries(root, target, entries, onProgress);
  for (const entry of entries) delete entry.modified;
  const manifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    bytes,
    spaceChecked,
    containsPrivateData: true,
    exclusions: [...excluded]
      .map((name) => `/${name}`)
      .concat([
        "/*.log",
        "/*.pid",
        "/runtime/*.log",
        "/runtime/*.pid",
        `/${MANIFEST}`,
      ]),
    entries,
  };
  await writeFile(
    path.join(target, MANIFEST),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx", mode: 0o600 },
  );
  await verify(target, { onProgress });
  return {
    directory: target,
    files: entries.filter((entry) => entry.type === "file").length,
    bytes,
    spaceChecked,
  };
}
export async function restore({ source, destination }) {
  const root = await realpath(source);
  const manifest = await verify(root);
  const target = await newDestination(root, destination);
  await checkSpace(target, manifest.bytes);
  await mkdir(target, { mode: 0o700 });
  await copyEntries(root, target, manifest.entries);
  await writeFile(
    path.join(target, MANIFEST),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx", mode: 0o600 },
  );
  await verify(target);
  return { directory: target, bytes: manifest.bytes };
}
const usage = `Offline full backup (includes .env, history, models, runtime and node_modules):
  node scripts/backup-offline.mjs --destination "E:\\Refuge-backup-2026-10-31" --stopped
  node scripts/backup-offline.mjs --verify "E:\\Refuge-backup-2026-10-31"
  node scripts/backup-offline.mjs --restore "E:\\Refuge-backup-2026-10-31" --destination "C:\\Refuge-restored"
Stop app/model services before backup. Parent destination folder must exist.
Destination must be new and outside source. No existing data is overwritten.
Treat the backup as private; use an encrypted drive. SHA-256 detects corruption, not malicious manifest replacement.`;
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    const args = process.argv.slice(2),
      options = {};
    for (let index = 0; index < args.length; index++) {
      const arg = args[index];
      if (["--help", "--stopped"].includes(arg)) options[arg.slice(2)] = true;
      else if (
        ["--destination", "--restore", "--verify"].includes(arg) &&
        args[index + 1] &&
        !args[index + 1].startsWith("--")
      )
        options[arg.slice(2)] = args[++index];
      else throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
    if (options.help || !args.length) console.log(usage);
    else {
      let lastProgress = 0,
        lastStage = "";
      const onProgress = (progress) => {
        if (progress.stage !== lastStage || Date.now() - lastProgress > 10000) {
          lastStage = progress.stage;
          lastProgress = Date.now();
          console.log(JSON.stringify(progress));
        }
      };
      if (
        options.verify &&
        (options.restore || options.destination || options.stopped)
      )
        throw new Error(
          "--verify cannot be combined with backup/restore arguments.",
        );
      const result = options.verify
        ? { verified: true, bytes: (await verify(options.verify)).bytes }
        : options.restore
          ? await restore({
              source: options.restore,
              destination: options.destination,
            })
          : await backup({
              source: fileURLToPath(new URL("../", import.meta.url)),
              destination: options.destination,
              stopped: options.stopped,
              onProgress,
            });
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error(`Backup error: ${error.message}`);
    process.exitCode = 1;
  }
}
