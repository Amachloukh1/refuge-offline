// Patch Kiwix JS 4.4.0 with bounded HTTP Range reads of installed local ZIMs.
// Keeps the upstream GPL-3.0 notices and reader on a separate origin.
import { readFile, writeFile } from "node:fs/promises";
const file = new URL(
  "../content/wiki-reader/kiwix-js-4.4.0/www/js/app.js",
  import.meta.url,
);
let source = await readFile(file, "utf8");
const localeRoot = new URL(
  "../content/wiki-reader/kiwix-js-4.4.0/i18n/",
  import.meta.url,
);
const englishText = await readFile(new URL("en.jsonp.js", localeRoot), "utf8");
const english = JSON.parse(
  englishText.replace(/^document.localeJson\s*=\s*/, "").replace(/;\s*$/, ""),
).en.translation;
const locales = JSON.parse(
  await readFile(
    new URL("../content/wiki-ui-translations.json", import.meta.url),
    "utf8",
  ),
);
for (const [lang, strings] of Object.entries(locales))
  await writeFile(
    new URL(lang + ".jsonp.js", localeRoot),
    "document.localeJson = " +
      JSON.stringify(
        { [lang]: { translation: { ...english, ...strings } } },
        null,
        2,
      ) +
      ";\n",
  );
for (const relative of ["www/js/init.js", "service-worker.js"]) {
  const url = new URL(
    "../content/wiki-reader/kiwix-js-4.4.0/" + relative,
    import.meta.url,
  );
  const text = await readFile(url, "utf8");
  await writeFile(
    url,
    text.replace(/= '4\.4\.0(?:-refuge\.\d+)?';/, "= '4.4.0-refuge.2';"),
  );
}
const marker = "// REFUGE_LOCAL_ZIM_RANGE_V1";
if (source.includes(marker)) source = source.slice(0, source.indexOf(marker));
const archiveFile = new URL(
  "../content/wiki-reader/kiwix-js-4.4.0/www/js/lib/zimArchive.js",
  import.meta.url,
);
let archiveCode = await readFile(archiveFile, "utf8");
if (!archiveCode.includes("!that.file._files[0].refugeLocalRange")) {
  archiveCode = archiveCode
    .replace(
      "if (that.file.fullTextIndex &&",
      "if (!that.file._files[0].refugeLocalRange && (that.file.fullTextIndex &&",
    )
    .replace("|| params.useLibzim) {", "|| params.useLibzim)) {");
  await writeFile(archiveFile, archiveCode);
}
source += `\n${marker}
// REFUGE modification: local installed archives with lazy range reads.
// Source: https://github.com/kiwix/kiwix-js/tree/4.4.0 (GPL-3.0).
async function refugeOpenInstalledArchive () {
    const lang = new URLSearchParams(location.search).get('refugeArchive');
    if (!/^(fr|de|ar|en)$/.test(lang || '')) return;
    const response = await fetch('/archives/catalog.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('Local archive catalog unavailable');
    const archives = await response.json();
    const archive = archives.find(a => a.language === lang);
    if (!archive || !/^[\\w.-]+\\.zim$/.test(archive.filename) || !Number.isSafeInteger(archive.bytes)) throw new Error('Local archive missing');
    // The JS ZIM reader supports File-like slice().arrayBuffer() objects.
    // Do not use the FileReader/libzim API or fetch the whole multi-GB archive.
    params.useLibzim = false;
    // Embedded readers use the upstream restricted renderer. This renders the
    // static Wikipedia HTML directly instead of hanging on SW iframe navigation.
    params.contentInjectionMode = 'jquery';
    settingsStore.setItem('contentInjectionMode', 'jquery', Infinity);
    params.overrideBrowserLanguage = /^(fr|de|ar|en)$/.test(new URLSearchParams(location.search).get('overrideBrowserLanguage') || '') ? new URLSearchParams(location.search).get('overrideBrowserLanguage') : lang;
    document.documentElement.lang=params.overrideBrowserLanguage;
    document.documentElement.dir=params.overrideBrowserLanguage==='ar'?'rtl':'ltr';
    const trusted = settingsStore.getItem('trustedZimFiles') || '';
    if (!trusted.split('|').includes(archive.filename)) settingsStore.setItem('trustedZimFiles', trusted + archive.filename + '|', Infinity);
    const file = {refugeLocalRange: true, name: archive.filename, size: archive.bytes, lastModified: 0, type: 'application/octet-stream', slice(begin, end) {
        begin = Math.max(0, begin || 0); end = Math.min(archive.bytes, end === undefined ? archive.bytes : end);
        return {async arrayBuffer() {
            if (end <= begin) return new ArrayBuffer(0);
            if (end - begin > 32 * 1024 * 1024) throw new Error('Archive range too large');
            const r = await fetch('/archives/' + encodeURIComponent(archive.filename), {headers: {Range: 'bytes=' + begin + '-' + (end - 1)}, cache: 'no-store'});
            if (r.status !== 206 || Number(r.headers.get('Content-Length')) !== end - begin) throw new Error('Invalid local archive range');
            return r.arrayBuffer();
        }};
    }};
    zimArchiveLoader.loadArchiveFromFiles([file], async archive => {await archiveReadyCallback(archive);document.documentElement.dataset.refugeArchiveReady=lang;}, (message, label) => uiUtil.systemAlert(message, label));
}
refugeOpenInstalledArchive().catch(error => uiUtil.systemAlert(error.message, 'REFUGE'));
`;
await writeFile(file, source);
console.log(
  "Kiwix: automatic local ZIM selection and bounded Range reads prepared.",
);
