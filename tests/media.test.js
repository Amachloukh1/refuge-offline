import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import os from "node:os";
import { EventEmitter } from "node:events";
import { createMedia, allowedMediaUrl } from "../server/media-library.js";
import { createApp } from "../server/app.js";
import { distributable } from "../scripts/prepare-share.mjs";
const audio = Buffer.from("ID3" + "audio-data".repeat(100));
const track = {
  id: "test-music",
  kind: "music",
  format: "mp3",
  title: "Test",
  reviewed: true,
  url: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/test.mp3",
};
async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "refuge-media-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content"));
  await writeFile(
    path.join(root, "content/media.catalog.json"),
    JSON.stringify([track]),
  );
  return root;
}
async function idle(media) {
  for (let n = 0; n < 200 && media.snapshot().active; n++)
    await new Promise((r) => setTimeout(r, 5));
  assert.equal(media.snapshot().active, false);
}
test("media URL allowlist rejects local endpoints, credentials and lookalike hosts", () => {
  for (const u of [
    "http://127.0.0.1/a.mp3",
    "https://incompetech.com.evil.test/music/royalty-free/mp3-royaltyfree/a.mp3",
    "https://u:p@incompetech.com/music/royalty-free/mp3-royaltyfree/a.mp3",
    "https://incompetech.com:444/music/royalty-free/mp3-royaltyfree/a.mp3",
    "https://incompetech.com/admin",
  ])
    assert.equal(allowedMediaUrl(u), false);
  assert.equal(allowedMediaUrl(track.url), true);
});
test("media downloads require catalogue IDs, verify content and write receipts atomically", async (t) => {
  const root = await fixture(t);
  let calls = 0;
  const media = createMedia(root, {
    fetcher: async () => {
      calls++;
      return new Response(audio, {
        headers: { "content-length": String(audio.length) },
      });
    },
  });
  await assert.rejects(media.start(["../secret"]));
  await assert.rejects(media.start([track.id, track.id]));
  await media.start([track.id]);
  await idle(media);
  assert.equal((await media.list())[0].installed, true);
  const receipt = JSON.parse(
    await readFile(path.join(root, "content/media/test-music.json")),
  );
  assert.equal(receipt.bytes, audio.length);
  assert.match(receipt.sha256, /^[a-f0-9]{64}$/);
  await media.start([track.id]);
  await idle(media);
  assert.equal(calls, 1);
  await assert.rejects(media.file(track.id, "mp4"));
  assert.equal(
    (await readdir(path.join(root, "content/media"))).some((f) =>
      f.endsWith("partial"),
    ),
    false,
  );
});
test("redirects, wrong signatures and wrong pinned hashes never become installed", async (t) => {
  const root = await fixture(t);
  for (const fetcher of [
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/private" },
      }),
    async () => new Response("<html>error</html>"),
  ]) {
    const m = createMedia(root, { fetcher });
    await m.start([track.id]);
    await idle(m);
    assert.equal((await m.list())[0].installed, false);
    assert.equal(m.snapshot().errors.length, 1);
  }
  await writeFile(
    path.join(root, "content/media.catalog.json"),
    JSON.stringify([{ ...track, sha256: "0".repeat(64) }]),
  );
  const m = createMedia(root, { fetcher: async () => new Response(audio) });
  await m.start([track.id]);
  await idle(m);
  assert.equal((await m.list())[0].installed, false);
});

test("a changed catalogue hash invalidates an existing media receipt", async (t) => {
  const root = await fixture(t),
    m = createMedia(root, { fetcher: async () => new Response(audio) });
  await m.start([track.id]);
  await idle(m);
  assert.equal((await m.list())[0].installed, true);
  await writeFile(
    path.join(root, "content/media.catalog.json"),
    JSON.stringify([{ ...track, sha256: "0".repeat(64) }]),
  );
  assert.equal((await m.list())[0].installed, false);
});
test("cancelling an archive traversal closes it and releases the download job", async (t) => {
  const root = await fixture(t);
  let scanning = false,
    closed = false;
  await writeFile(
    path.join(root, "content/media.catalog.json"),
    JSON.stringify([{ ...track, archive: true }]),
  );
  const media = createMedia(root, {
    fetcher: async () => new Response(audio),
    openArchive: (_file, _options, callback) => {
      const z = new EventEmitter();
      z.close = () => {
        closed = true;
      };
      z.readEntry = () => {
        scanning = true;
      };
      callback(null, z);
    },
  });
  await media.start([track.id]);
  for (let i = 0; i < 100 && !scanning; i++)
    await new Promise((r) => setTimeout(r, 5));
  assert.equal(scanning, true);
  media.cancel();
  await idle(media);
  assert.equal(closed, true);
  assert.equal((await media.list())[0].installed, false);
  assert.equal(
    (await readdir(path.join(root, "content/media"))).some((f) =>
      f.endsWith("partial"),
    ),
    false,
  );
});
test("personal imports use generated paths, stay out of distribution and support HTTP Range", async (t) => {
  const root = await fixture(t),
    m = createMedia(root);
  const { id } = await m.import(Readable.from([audio]), {
    name: "../../private.mp3",
    kind: "music",
    language: "ar",
  });
  const file = await m.file(id, "mp3");
  assert.equal(file.directory, path.join(root, "private/media"));
  assert.ok(file.filename.startsWith("personal-"));
  assert.equal(distributable("private/media/" + file.filename), false);
  await assert.rejects(
    m.import(Readable.from([Buffer.from("bad")]), {
      name: "invalid.mp3",
      kind: "music",
    }),
  );
  const server = createApp({ root });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => new Promise((r) => server.close(r)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const r = await fetch(`${base}/media/files/${id}.mp3`, {
    headers: { Range: "bytes=0-2" },
  });
  assert.equal(r.status, 206);
  assert.equal(r.headers.get("content-type"), "audio/mpeg");
  assert.equal(await r.text(), "ID3");
  const bad = await fetch(base + "/media/files/unknown.mp3");
  assert.equal(bad.status, 404);
  const foreign = await fetch(
    base + "/api/media/import?kind=music&name=x.mp3",
    { method: "POST", headers: { Origin: "https://evil.test" }, body: audio },
  );
  assert.equal(foreign.status, 403);
  const range = await fetch(`${base}/media/files/${id}.mp3`, {
    headers: { Range: "bytes=999999-" },
  });
  assert.equal(range.status, 416);
});
