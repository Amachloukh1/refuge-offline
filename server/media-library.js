import path from "node:path";
import { mkdir, readFile, writeFile, rename, stat, rm } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import { createHash, randomUUID } from "node:crypto";
import { open as openZip } from "yauzl";

const formats = {
  films: ["mp4", "webm"],
  music: ["mp3", "ogg", "m4a", "wav", "flac"],
};
const idPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
export function allowedMediaUrl(value) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      (!u.port || u.port === "443") &&
      ((u.hostname === "storage.googleapis.com" &&
        u.pathname.startsWith("/gtv-videos-bucket/sample/")) ||
        (u.hostname === "download.blender.org" &&
          ["/peach/bigbuckbunny_movies/", "/ED/", "/durian/trailer/"].some(
            (p) => u.pathname.startsWith(p),
          )) ||
        (u.hostname === "incompetech.com" &&
          u.pathname.startsWith("/music/royalty-free/mp3-royaltyfree/")))
    );
  } catch {
    return false;
  }
}
export function mediaSignature(bytes, format) {
  if (format === "mp4" || format === "m4a")
    return bytes.subarray(4, 8).toString() === "ftyp";
  if (format === "webm")
    return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (format === "mp3")
    return (
      bytes.subarray(0, 3).toString() === "ID3" ||
      (bytes[0] === 255 && (bytes[1] & 224) === 224)
    );
  if (format === "ogg") return bytes.subarray(0, 4).toString() === "OggS";
  if (format === "flac") return bytes.subarray(0, 4).toString() === "fLaC";
  if (format === "wav")
    return (
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WAVE"
    );
  return false;
}
async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}
async function atomicJson(file, data) {
  const temp = file + "." + randomUUID() + ".partial";
  await writeFile(temp, JSON.stringify(data, null, 2));
  await rename(temp, file);
}
export function createMedia(
  root,
  { fetcher = fetch, openArchive = openZip } = {},
) {
  const publicDir = path.join(root, "content/media"),
    personalDir = path.join(root, "private/media");
  let controller,
    importing = false;
  let job = {
    active: false,
    done: 0,
    total: 0,
    current: null,
    bytes: 0,
    errors: [],
  };
  async function entries() {
    const publicItems = await readJson(
      path.join(root, "content/media.catalog.json"),
      [],
    );
    const privateItems = await readJson(
      path.join(personalDir, "index.json"),
      [],
    );
    return [
      ...publicItems
        .filter(
          (v) => idPattern.test(v.id) && formats[v.kind]?.includes(v.format),
        )
        .map((v) => ({ ...v, personal: false })),
      ...privateItems
        .filter(
          (v) =>
            /^personal-[a-f0-9-]+$/.test(v.id) &&
            formats[v.kind]?.includes(v.format),
        )
        .map((v) => ({ ...v, personal: true })),
    ];
  }
  function directory(item) {
    return item.personal ? personalDir : publicDir;
  }
  async function installed(item) {
    const dir = directory(item),
      name = item.id + "." + item.format;
    const receipt = await readJson(path.join(dir, item.id + ".json"), null);
    try {
      const s = await stat(path.join(dir, name));
      return (
        s.isFile() &&
        s.size > 0 &&
        s.size === receipt?.bytes &&
        (!item.sha256 || receipt.sha256 === item.sha256)
      );
    } catch {
      return false;
    }
  }
  async function list() {
    return Promise.all(
      (await entries()).map(async (item) => ({
        ...item,
        installed: await installed(item),
        fileUrl: `/media/files/${item.id}.${item.format}`,
        onlineUrl:
          !item.personal && !item.archive && allowedMediaUrl(item.url)
            ? item.url
            : null,
      })),
    );
  }
  async function file(id, format) {
    const item = (await entries()).find(
      (v) => v.id === id && v.format === format,
    );
    if (!item || !(await installed(item))) throw Error("media_unavailable");
    return { directory: directory(item), filename: id + "." + format };
  }
  async function save(
    stream,
    item,
    limit,
    expectedLength,
    signal,
    expectedHash,
  ) {
    const dir = directory(item);
    await mkdir(dir, { recursive: true });
    const temp = path.join(dir, randomUUID() + ".partial");
    let bytes = 0,
      prefix = Buffer.alloc(0);
    const hash = createHash("sha256");
    try {
      await pipeline(
        stream,
        new Transform({
          transform(chunk, _, cb) {
            bytes += chunk.length;
            if (bytes > limit) return cb(Error("file_too_large"));
            if (prefix.length < 16)
              prefix = Buffer.concat([
                prefix,
                chunk.subarray(0, 16 - prefix.length),
              ]);
            hash.update(chunk);
            if (!item.personal) job.bytes = bytes;
            cb(null, chunk);
          },
        }),
        createWriteStream(temp, { flags: "wx" }),
        { signal },
      );
      const sha256 = hash.digest("hex");
      if (
        !mediaSignature(prefix, item.format) ||
        (expectedLength && bytes !== expectedLength) ||
        (expectedHash && sha256 !== expectedHash)
      )
        throw Error("invalid_media");
      await rename(temp, path.join(dir, item.id + "." + item.format));
      await atomicJson(path.join(dir, item.id + ".json"), {
        bytes,
        sha256,
        downloadedAt: new Date().toISOString(),
      });
      return { bytes, sha256 };
    } finally {
      await rm(temp, { force: true });
    }
  }
  async function download(item, signal) {
    signal = AbortSignal.any([signal, AbortSignal.timeout(30 * 60 * 1000)]);
    let url = item.url,
      response;
    for (let hops = 0; hops < 4; hops++) {
      if (!allowedMediaUrl(url)) throw Error("source_not_allowed");
      response = await fetcher(url, { signal, redirect: "manual" });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const next = response.headers.get("location");
        await response.body?.cancel();
        if (!next) throw Error("invalid_redirect");
        url = new URL(next, url).href;
        continue;
      }
      break;
    }
    if (!response?.ok || !response.body) throw Error("source_unavailable");
    const limit = item.kind === "films" ? 1024 ** 3 : 100 * 1024 ** 2;
    const length = Number(response.headers.get("content-length")) || 0;
    if (length > limit) {
      await response.body.cancel();
      throw Error("file_too_large");
    }
    if (!item.archive)
      return save(
        Readable.fromWeb(response.body),
        item,
        limit,
        length,
        signal,
        item.sha256,
      );
    await mkdir(publicDir, { recursive: true });
    const archive = path.join(publicDir, randomUUID() + ".partial");
    let zip,
      count = 0;
    try {
      await pipeline(
        Readable.fromWeb(response.body),
        new Transform({
          transform(chunk, _, cb) {
            count += chunk.length;
            job.bytes = count;
            cb(count > limit ? Error("file_too_large") : null, chunk);
          },
        }),
        createWriteStream(archive, { flags: "wx" }),
        { signal },
      );
      if (length && length !== count) throw Error("invalid_archive");
      const entry = await new Promise((resolve, reject) =>
        openArchive(
          archive,
          { lazyEntries: true, autoClose: false },
          (error, z) => {
            if (error) return reject(error);
            zip = z;
            const abort = () => {
              z.close();
              reject(Error("cancelled"));
            };
            const fail = (e) => {
              signal.removeEventListener("abort", abort);
              reject(e);
            };
            if (signal.aborted) return abort();
            signal.addEventListener("abort", abort, { once: true });
            z.on("error", fail);
            z.on("end", () => fail(Error("movie_missing")));
            z.on("entry", (e) => {
              if (signal.aborted) return abort();
              if (/\.(mp4|m4v)$/i.test(e.fileName)) {
                if (e.uncompressedSize > limit)
                  return fail(Error("file_too_large"));
                z.openReadStream(e, (err, stream) => {
                  signal.removeEventListener("abort", abort);
                  if (err) return fail(err);
                  if (signal.aborted) {
                    stream.destroy();
                    return abort();
                  }
                  resolve({ stream, size: e.uncompressedSize });
                });
              } else z.readEntry();
            });
            z.readEntry();
          },
        ),
      );
      return await save(
        entry.stream,
        item,
        limit,
        entry.size,
        signal,
        item.sha256,
      );
    } finally {
      zip?.close();
      await rm(archive, { force: true });
    }
  }
  return {
    list,
    file,
    snapshot: () => ({ ...job, errors: [...job.errors] }),
    cancel() {
      controller?.abort();
      return { cancelled: true };
    },
    async start(ids) {
      if (job.active) throw Error("download_busy");
      const all = await entries();
      if (
        !Array.isArray(ids) ||
        !ids.length ||
        ids.length > 20 ||
        new Set(ids).size !== ids.length
      )
        throw Error("invalid_batch");
      const selected = ids.map((id) =>
        all.find(
          (v) =>
            v.id === id &&
            !v.personal &&
            v.reviewed === true &&
            allowedMediaUrl(v.url),
        ),
      );
      if (selected.some((v) => !v)) throw Error("invalid_batch");
      // Recheck after the asynchronous catalog read to serialize concurrent starts.
      if (job.active) throw Error("download_busy");
      controller = new AbortController();
      const signal = controller.signal;
      job = {
        active: true,
        done: 0,
        total: selected.length,
        current: null,
        bytes: 0,
        errors: [],
      };
      (async () => {
        try {
          for (const item of selected) {
            if (signal.aborted) break;
            job.current = item.title;
            job.bytes = 0;
            try {
              if (!(await installed(item))) await download(item, signal);
              job.done++;
            } catch (e) {
              job.errors.push({
                id: item.id,
                code: signal.aborted ? "cancelled" : e.message,
              });
            }
          }
        } finally {
          job.active = false;
          job.current = null;
        }
      })();
      return { ...job };
    },
    async import(
      stream,
      { name, kind, language = "none", genre = "personal" },
    ) {
      if (importing) throw Error("import_busy");
      const format = String(name || "")
        .split(".")
        .pop()
        .toLowerCase();
      if (
        !formats[kind]?.includes(format) ||
        !["fr", "de", "en", "ar", "none"].includes(language)
      )
        throw Error("invalid_format");
      importing = true;
      const item = {
        id: "personal-" + randomUUID(),
        title: String(name)
          .replace(/[\x00-\x1f]/g, "")
          .slice(0, 160),
        kind,
        format,
        language,
        genre: String(genre).slice(0, 40),
        artist: "",
        personal: true,
      };
      try {
        await save(
          stream,
          item,
          kind === "films" ? 4 * 1024 ** 3 : 256 * 1024 ** 2,
          0,
          undefined,
        );
        const previous = await readJson(
          path.join(personalDir, "index.json"),
          [],
        );
        await atomicJson(path.join(personalDir, "index.json"), [
          ...previous,
          item,
        ]);
        return { id: item.id };
      } finally {
        importing = false;
      }
    },
  };
}
