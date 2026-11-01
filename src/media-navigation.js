export const mediaSections = ["videos", "films", "music", "sport"];
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
