export const interfaceLanguages = [
  "fr",
  "de",
  "en",
  "ar",
  "ru",
  "zh",
  "es",
  "pt",
];
export const documentLanguages = ["fr", "de", "en", "ar"];
export function contentLanguage(lang) {
  return documentLanguages.includes(lang) ? lang : "en";
}
export function isInterfaceLanguage(lang) {
  return interfaceLanguages.includes(lang);
}
