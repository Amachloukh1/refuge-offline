import { randomBytes, scryptSync } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
const [file, checksumFile, configFile] = process.argv.slice(2);
if (![file, checksumFile, configFile].every((p) => p && path.isAbsolute(p)))
  throw Error("Absolute paths required");
const sha256 = (await readFile(checksumFile, "utf8")).split(/\s/)[0];
if (!/^[a-f0-9]{64}$/.test(sha256)) throw Error("Invalid checksum");
const info = await stat(file);
if (!info.isFile() || !file.endsWith(".zip")) throw Error("ZIP required");
const password = randomBytes(18).toString("base64url");
const salt = randomBytes(32);
const createdAt = new Date();
const config = {
  version: 1,
  file,
  sha256,
  port: 8109,
  username: "refuge",
  token: randomBytes(20).toString("base64url"),
  salt: salt.toString("hex"),
  passwordHash: scryptSync(password, salt, 32).toString("hex"),
  createdAt: createdAt.toISOString(),
  expiresAt: new Date(+createdAt + 7 * 86400000).toISOString(),
};
await writeFile(configFile, JSON.stringify(config, null, 2) + "\n", {
  flag: "wx",
  mode: 0o600,
});
console.log(
  JSON.stringify({
    password,
    username: config.username,
    token: config.token,
    expiresAt: config.expiresAt,
    bytes: info.size,
  }),
);
