import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import assert from "node:assert/strict";
const [configFile, origin] = process.argv.slice(2);
const config = JSON.parse(await readFile(configFile, "utf8"));
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdout.write(
  "Entrez le mot de passe pour le contrôle (saisie masquée) :\n",
);
const input = createInterface({ input: process.stdin, terminal: false });
const password = await new Promise((resolve) => input.once("line", resolve));
input.close();
if (process.stdin.isTTY) process.stdin.setRawMode(false);
process.stdin.pause();
const url = origin + "/refuge/" + config.token;
const headers = {
  Authorization:
    "Basic " + Buffer.from(config.username + ":" + password).toString("base64"),
};
const request = (suffix = "", options = {}) =>
  fetch(url + suffix, { ...options, signal: AbortSignal.timeout(30000) });
assert.equal((await request()).status, 401);
const page = await request("", { headers });
assert.equal(page.status, 200);
assert.match(await page.text(), /REFUGE hors ligne/);
const head = await request("/download", { method: "HEAD", headers });
assert.equal(head.status, 200);
assert.ok(Number(head.headers.get("content-length")) > 1000000000);
const range = await request("/download", {
  headers: { ...headers, Range: "bytes=0-31" },
});
assert.equal(range.status, 206);
const bytes = Buffer.from(await range.arrayBuffer());
assert.equal(bytes.length, 32);
assert.equal(bytes.subarray(0, 2).toString(), "PK");
const hash = await request("/sha256", { headers });
assert.equal(hash.status, 200);
assert.ok((await hash.text()).startsWith(config.sha256));
console.log(
  JSON.stringify({
    verified: true,
    origin,
    passwordRequired: true,
    range: true,
    bytes: Number(head.headers.get("content-length")),
    expiresAt: config.expiresAt,
  }),
);
