import path from "node:path";
import { stat, realpath } from "node:fs/promises";
import { createReadStream } from "node:fs";
const types = {
  ".txt": "text/plain; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
  ".pbf": "application/x-protobuf",
  ".pmtiles": "application/octet-stream",
  ".zim": "application/octet-stream",
  ".wasm": "application/wasm",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};
export function byteRange(header, size) {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!m || (!m[1] && !m[2])) return false;
  let start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
  let end = m[1] ? (m[2] ? Number(m[2]) : size - 1) : size - 1;
  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= size ||
    end < start
  )
    return false;
  return { start, end: Math.min(end, size - 1) };
}
export async function serveLocalFile(req, res, directory, relative) {
  const base = await realpath(directory);
  const candidate = path.resolve(directory, relative);
  const file = await realpath(candidate);
  if (!file.startsWith(base + path.sep)) throw new Error("forbidden");
  const info = await stat(file);
  if (!info.isFile()) throw new Error("not_file");
  const range = byteRange(req.headers.range, info.size);
  if (range === false) {
    res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
    res.end();
    return;
  }
  const headers = {
    "Content-Type": types[path.extname(file)] || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-cache",
    "Content-Length": range ? range.end - range.start + 1 : info.size,
  };
  if (range)
    headers["Content-Range"] = `bytes ${range.start}-${range.end}/${info.size}`;
  res.writeHead(range ? 206 : 200, headers);
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  const stream = createReadStream(file, range || {});
  res.on("close", () => stream.destroy());
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}
