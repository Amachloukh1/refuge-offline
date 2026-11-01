export function equipmentImageSource(item) {
  if (!item || !/^[a-z0-9-]+$/.test(item.id)) throw Error("Invalid image ID");
  const url = new URL(item.url);
  const amazon =
    url.hostname === "m.media-amazon.com" &&
    url.pathname.startsWith("/images/I/") &&
    url.pathname.endsWith(".jpg");
  const ecoflow =
    url.hostname === "de.ecoflow.com" &&
    url.pathname.startsWith("/cdn/shop/files/") &&
    url.pathname.endsWith(".png");
  if (
    url.protocol !== "https:" ||
    url.port ||
    url.username ||
    url.password ||
    !(amazon || ecoflow)
  )
    throw Error("Unapproved image source");
  const extension = ecoflow ? ".png" : ".jpg";
  const filename = item.filename || item.id + extension;
  if (filename !== item.id + extension) throw Error("Invalid image filename");
  return {
    url: url.href,
    filename,
    mime: ecoflow ? "image/png" : "image/jpeg",
  };
}
export function equipmentImageSignature(bytes, mime) {
  if (mime === "image/jpeg")
    return (
      bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  if (mime === "image/png")
    return (
      bytes.length >= 8 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)
    );
  return false;
}
