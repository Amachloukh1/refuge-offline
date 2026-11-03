export const mediaSections = ["videos", "films", "music", "sport"];
export function wikiReaderOrigin(hostname = "127.0.0.1") {
  const host = ["localhost", "::1", "[::1]"].includes(hostname) ? "127.0.0.1" : hostname;
  return `http://${host}:8108`;
}
export function wikiReaderLanguage(lang) {
  return ["fr", "de", "en", "ar"].includes(lang) ? lang : "en";
}
export function mediaSection(hash) {
  const [name, query = ""] = String(hash).replace(/^#/, "").split("?");
  if (mediaSections.includes(name)) return name;
  const view = new URLSearchParams(query).get("view");
  return mediaSections.includes(view) ? view : "videos";
}
export function chooseWikiArchive(archives, preferred) {
  const available = archives.filter((a) => a?.language && a?.filename);
  return (
    available.find((a) => a.language === preferred) ||
    available.find((a) => a.language === "fr") ||
    available[0] ||
    null
  );
}
