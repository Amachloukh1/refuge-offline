import { useEffect, useState } from "react";
import BookPdf from "./BookPdf";
import "./quran.css";

const text = {
  fr: ["Coran", "Chercher une sourate", "Sourate", "Récitant", "Piste en cours d’installation", "Ouvrir le PDF", "Page", "Le PDF n’est pas disponible.", "Catalogue indisponible. Actualiser", "Aucune sourate trouvée"],
  de: ["Koran", "Sure suchen", "Sure", "Rezitator", "Audiodatei wird installiert", "PDF öffnen", "Seite", "PDF nicht verfügbar.", "Katalog nicht verfügbar. Aktualisieren", "Keine Sure gefunden"],
  en: ["Quran", "Find a surah", "Surah", "Reciter", "Audio track is being installed", "Open PDF", "Page", "PDF unavailable.", "Catalogue unavailable. Refresh", "No surah found"],
  ar: ["القرآن", "البحث عن سورة", "السورة", "القارئ", "جارٍ تنزيل التلاوة", "فتح المصحف", "صفحة", "المصحف غير متاح.", "الفهرس غير متاح. تحديث", "لا توجد سورة مطابقة"],
};
const pdfUrl = "/books/quran-clear.pdf";

export default function Quran({ lang }) {
  const t = text[lang] || text.en;
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [reciter, setReciter] = useState("alafasy");
  const [query, setQuery] = useState("");
  const [surah, setSurah] = useState(1);
  const [page, setPage] = useState(8);
  const [pages, setPages] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/assets/quran/catalog.json", {
          cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw Error();
        const data = await response.json();
        if (!Array.isArray(data.surahs) || !data.available) throw Error();
        setCatalog(data);
        setError(false);
      } catch (error) {
        if (error.name !== "AbortError") setError(true);
      }
    }
    void refresh();
    const timer = setInterval(refresh, 20000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [revision]);
  const normalized = query.trim().toLowerCase().replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const results = (catalog?.surahs || []).filter(({ id, name, ar }) =>
    /^\d+$/.test(normalized) ? id === Number(normalized) : `${name} ${ar}`.toLowerCase().includes(normalized)
  );
  const selected = catalog?.surahs.find(item => item.id === surah);
  const available = catalog?.available[reciter] || [];
  function chooseSurah(id) {
    setSurah(id);
    const chapter = catalog.surahs.find(item => item.id === id);
    if (chapter?.page) setPage(chapter.page);
  }
  return (
    <section className="panel padded quran-panel">
      <h2>{t[0]} · القرآن الكريم</h2>
      <div className="quran-layout">
        <div className="quran-controls">
          {error && <button type="button" className="button outline" onClick={() => setRevision(n => n + 1)}>{t[8]}</button>}
          <label>{t[3]}
            <select value={reciter} onChange={event => setReciter(event.target.value)}>
              <option value="alafasy">Mishary Alafasy · مشاري العفاسي</option>
              <option value="alhussary">Mahmoud Khalil Al-Hussary · محمود خليل الحصري</option>
            </select>
          </label>
          <label>{t[1]}<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
          <label>{t[2]}
            <select value={results.some(item => item.id === surah) ? surah : ""} onChange={event => chooseSurah(Number(event.target.value))}>
              <option value="" disabled>{results.length ? t[2] : t[9]}</option>
              {results.map(item => <option key={item.id} value={item.id}>{item.id}. {item.ar} · {item.name}</option>)}
            </select>
          </label>
          {selected && <strong>{selected.ar} · {selected.name}</strong>}
          {available.includes(surah) ? (
            <audio controls preload="metadata" key={`${reciter}-${surah}`} src={`/assets/quran/${reciter}-${String(surah).padStart(3, "0")}.mp3`} />
          ) : <p role="status">{t[4]}</p>}
          <small>{available.length} / 114</small>
        </div>
        <div className="quran-reader">
          <div className="quran-pagination">
            <button type="button" className="button outline" aria-label={`${t[6]} −`} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>−</button>
            <span>{t[6]} {page} / {pages}</span>
            <button type="button" className="button outline" aria-label={`${t[6]} +`} disabled={page >= pages} onClick={() => setPage(p => p + 1)}>+</button>
            <a href={pdfUrl} target="_blank" rel="noreferrer">{t[5]}</a>
          </div>
          <BookPdf url={pdfUrl} page={page} onPages={setPages} errorText={t[7]} />
          <small>Translation by Talal Itani, <a href="https://clearquran.com" target="_blank" rel="noreferrer">ClearQuran.com</a></small>
        </div>
      </div>
    </section>
  );
}
