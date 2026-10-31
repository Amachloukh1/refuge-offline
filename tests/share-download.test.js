import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { scryptSync, createHash } from "node:crypto";
import { createShareServer } from "../server/share-download.js";
test("temporary share requires credentials, only serves its selected file and expires", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "refuge-share-")),
    file = path.join(dir, "refuge.zip"),
    bytes = Buffer.from("0123456789ABCDEF");
  await writeFile(file, bytes);
  await writeFile(path.join(dir, ".env"), "SECRET=NEVER_SHARE");
  let clock = Date.now();
  const password = "fixture-password-with-entropy",
    salt = "ab".repeat(32),
    token = "a".repeat(32);
  const server = createShareServer(
    {
      version: 1,
      createdAt: new Date(clock - 1000).toISOString(),
      expiresAt: new Date(clock + 60000).toISOString(),
      file,
      username: "refuge",
      token,
      salt,
      passwordHash: scryptSync(password, Buffer.from(salt, "hex"), 32).toString(
        "hex",
      ),
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
    { now: () => clock },
  );
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}/refuge/${token}`,
    authorization =
      "Basic " + Buffer.from("refuge:" + password).toString("base64");
  try {
    assert.equal((await fetch(base)).status, 401);
    const wrong = await fetch(base, {
      headers: {
        Authorization:
          "Basic " + Buffer.from("refuge:wrong").toString("base64"),
      },
    });
    assert.equal(wrong.status, 401);
    const landing = await fetch(base, { headers: { authorization } });
    assert.equal(landing.status, 200);
    assert.match(await landing.text(), /Copie de distribution/);
    const range = await fetch(base + "/download", {
      headers: { authorization, Range: "bytes=2-5" },
    });
    assert.equal(range.status, 206);
    assert.equal(range.headers.get("content-range"), "bytes 2-5/16");
    assert.equal(await range.text(), "2345");
    const head = await fetch(base + "/download", {
      method: "HEAD",
      headers: { authorization },
    });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-length"), "16");
    assert.equal(await head.text(), "");
    assert.equal(
      (await fetch(base + "/.env", { headers: { authorization } })).status,
      404,
    );
    assert.equal(
      (
        await fetch(base + "/download", {
          method: "POST",
          headers: { authorization },
        })
      ).status,
      405,
    );
    assert.equal(
      (
        await fetch(base + "/download", {
          headers: { authorization, Range: "bytes=99-100" },
        })
      ).status,
      416,
    );
    clock += 61000;
    assert.equal(
      (await fetch(base + "/download", { headers: { authorization } })).status,
      410,
    );
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
    await rm(dir, { recursive: true, force: true });
  }
});
