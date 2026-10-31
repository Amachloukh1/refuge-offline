import { useEffect, useState } from "react";
import { Button, Notice } from "./components";
import { validateState } from "./state-schema";
const texts = {
  fr: [
    "Contrôle hors ligne",
    "Vérifier les fichiers",
    "Vérification complète SHA-256",
    "La vérification rapide contrôle présence, lisibilité et tailles connues. Le contrôle complet lit plusieurs Go et peut durer longtemps. Il ne teste pas la batterie, le GPS, la réception radio ni la qualité des réponses IA.",
    "Lire tous les fichiers pour vérifier les empreintes ? Cela peut prendre plusieurs minutes.",
    "Démarrer un contrôle pour obtenir un résultat.",
    "en cours",
    "terminé",
    "Échec du contrôle. Réessayez.",
    "Moteur IA déclaré disponible",
    "Moteur IA non disponible ou non contrôlé",
    "La présence du modèle dans le moteur ne prouve pas qu’une réponse est correcte. Ce contrôle utilise uniquement les services locaux.",
    "Restaurer mes données",
    "Choisir un export REFUGE JSON",
    "Ce fichier contient des données personnelles. L’import ne restaure pas les vidéos, cartes, documents ni l’historique IA : ils nécessitent une sauvegarde complète du dossier.",
    "Aperçu avant remplacement",
    "personnes",
    "articles",
    "lieux",
    "repas",
    "Sauvegarder l’état actuel puis restaurer",
    "Annuler",
    "Export invalide ou trop volumineux (2 Mo maximum). Aucune donnée remplacée.",
    "Données restaurées.",
    "Pour la copie complète vers un disque externe : consulter docs/backup-restore.md dans le dossier du projet. La destination doit être un nouveau dossier ; arrêter l’application et le moteur avant la copie.",
    "Réussis",
    "Échecs",
    "Sans empreinte de référence",
  ],
  de: [
    "Offline-Prüfung",
    "Dateien prüfen",
    "Vollständige SHA-256-Prüfung",
    "Schnellprüfung prüft Vorhandensein, Lesbarkeit und bekannte Größen. Vollprüfung liest mehrere GB und kann lange dauern. Batterie, GPS, Radioempfang und KI-Antwortqualität werden nicht getestet.",
    "Alle Dateien für Prüfsummen lesen? Das kann mehrere Minuten dauern.",
    "Prüfung starten, um ein Ergebnis zu erhalten.",
    "läuft",
    "abgeschlossen",
    "Prüfung fehlgeschlagen. Erneut versuchen.",
    "KI-Modell vom Dienst als verfügbar gemeldet",
    "KI-Modell nicht verfügbar oder ungeprüft",
    "Die Modellanzeige beweist keine korrekte Antwort. Nur lokale Dienste werden verwendet.",
    "Meine Daten wiederherstellen",
    "REFUGE-JSON-Export wählen",
    "Die Datei enthält persönliche Daten. Import stellt keine Videos, Karten, Dokumente oder KI-Verläufe wieder her; dafür den vollständigen Ordner sichern.",
    "Vorschau vor Ersetzen",
    "Personen",
    "Artikel",
    "Orte",
    "Mahlzeiten",
    "Aktuellen Stand sichern und wiederherstellen",
    "Abbrechen",
    "Ungültiger oder zu großer Export (maximal 2 MB). Keine Daten ersetzt.",
    "Daten wiederhergestellt.",
    "Vollsicherung auf externen Datenträger: docs/backup-restore.md im Projektordner lesen. Ziel muss ein neuer Ordner sein; Anwendung und Modell vor Kopie stoppen.",
    "Bestanden",
    "Fehler",
    "Ohne Referenzprüfsumme",
  ],
  en: [
    "Offline check",
    "Check files",
    "Full SHA-256 check",
    "Quick check tests presence, readability and known sizes. Full check reads several GB and can take a long time. It does not test battery, GPS, radio reception or AI response quality.",
    "Read all files to verify hashes? This can take several minutes.",
    "Start a check to obtain results.",
    "running",
    "completed",
    "Check failed. Retry.",
    "AI model reported available by engine",
    "AI model unavailable or unchecked",
    "A model listing does not prove an answer is correct. Only local services are used.",
    "Restore my data",
    "Choose a REFUGE JSON export",
    "This file contains personal data. Import does not restore videos, maps, documents or AI history; those require a full folder backup.",
    "Preview before replacement",
    "people",
    "items",
    "places",
    "meals",
    "Save current state then restore",
    "Cancel",
    "Invalid or oversized export (maximum 2 MB). Nothing replaced.",
    "Data restored.",
    "For a full copy to an external drive, read docs/backup-restore.md in the project folder. Destination must be a new folder; stop the app and engine before copying.",
    "Passed",
    "Failed",
    "No reference hash",
  ],
  ar: [
    "فحص دون إنترنت",
    "فحص الملفات",
    "فحص SHA-256 كامل",
    "الفحص السريع يتحقق من الوجود والقراءة والأحجام المعروفة. الكامل يقرأ عدة غيغابايت وقد يطول. لا يختبر البطارية أو GPS أو استقبال الراديو أو دقة إجابات الذكاء الاصطناعي.",
    "قراءة كل الملفات للتحقق من البصمات؟ قد يستغرق دقائق.",
    "ابدأ الفحص للحصول على النتيجة.",
    "جارٍ",
    "مكتمل",
    "فشل الفحص. أعد المحاولة.",
    "المحرك يعلن توفر النموذج",
    "النموذج غير متوفر أو غير مفحوص",
    "وجود النموذج لا يثبت صحة الإجابة. تستخدم خدمات محلية فقط.",
    "استعادة بياناتي",
    "اختر ملف REFUGE JSON",
    "يحتوي على بيانات شخصية. لا يعيد الاستيراد الفيديوهات والخرائط والوثائق وسجل الذكاء الاصطناعي؛ يلزم نسخ المجلد كاملاً.",
    "معاينة قبل الاستبدال",
    "أشخاص",
    "مواد",
    "أماكن",
    "وجبات",
    "حفظ الحالة الحالية ثم الاستعادة",
    "إلغاء",
    "ملف غير صالح أو أكبر من 2 ميغابايت. لم تُستبدل البيانات.",
    "تمت الاستعادة.",
    "للنسخ الكامل إلى قرص خارجي، اقرأ docs/backup-restore.md في مجلد المشروع. الوجهة مجلد جديد؛ أوقف التطبيق والمحرك قبل النسخ.",
    "ناجحة",
    "أخطاء",
    "دون بصمة مرجعية",
  ],
};
export function SystemCheck({ lang, status }) {
  const c = texts[lang] || texts.fr;
  const [check, setCheck] = useState(null),
    [error, setError] = useState(false),
    [starting, setStarting] = useState(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    fetch("/api/readiness", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((d) => {
        if (active) setCheck(d);
      })
      .catch((e) => {
        if (e.name !== "AbortError" && active) setError(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);
  useEffect(() => {
    if (check?.status !== "running") return;
    const controller = new AbortController();
    const timer = setInterval(
      () =>
        fetch("/api/readiness", { signal: controller.signal })
          .then((r) => {
            if (!r.ok) throw Error();
            return r.json();
          })
          .then(setCheck)
          .catch((e) => {
            if (e.name !== "AbortError") {
              setError(true);
              clearInterval(timer);
            }
          }),
      700,
    );
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [check?.status]);
  async function start(deep) {
    if (deep && !window.confirm(c[4])) return;
    setStarting(true);
    setError(false);
    try {
      const r = await fetch("/api/readiness/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deep }),
      });
      if (!r.ok) throw Error();
      setCheck(await r.json());
    } catch {
      setError(true);
    } finally {
      setStarting(false);
    }
  }
  return (
    <section className="panel padded system-check" data-testid="system-check">
      <h2>{c[0]}</h2>
      <p>{c[3]}</p>
      <div className="form-actions">
        <Button
          onClick={() => start(false)}
          disabled={starting || check?.status === "running"}
        >
          {c[1]}
        </Button>
        <Button
          variant="outline"
          onClick={() => start(true)}
          disabled={starting || check?.status === "running"}
        >
          {c[2]}
        </Button>
      </div>
      {error && <p role="alert">{c[8]}</p>}
      {check && check.status !== "idle" ? (
        <>
          <p role="status">
            {check.status === "running"
              ? c[6]
              : check.status === "completed"
                ? c[7]
                : c[8]}{" "}
            · {check.progress.completed}/{check.progress.total}
          </p>
          <p>
            {c[25]}: {check.counts.ok} · {c[26]}: {check.counts.failed} ·{" "}
            {c[27]}: {check.counts.unverified}
          </p>
          <ul className="check-results">
            {check.results.map((r, i) => (
              <li key={`${r.category}-${r.id}-${i}`}>
                <span className={`tag check-${r.status}`}>
                  {r.status === "ok"
                    ? c[25]
                    : r.status === "failed"
                      ? c[26]
                      : c[27]}
                </span>{" "}
                {r.category} · {r.id}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>{c[5]}</p>
      )}
      <Notice>
        {status?.available ? c[9] : c[10]}
        <br />
        {c[11]}
      </Notice>
    </section>
  );
}
export function DataRestore({ lang, onRestore, exportData }) {
  const c = texts[lang] || texts.fr;
  const [pending, setPending] = useState(null),
    [message, setMessage] = useState("");
  async function load(e) {
    setPending(null);
    setMessage("");
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2e6) throw Error();
      setPending(validateState(JSON.parse(await file.text())));
    } catch {
      setMessage(c[22]);
    }
    e.target.value = "";
  }
  return (
    <section className="panel padded data-restore" data-testid="data-restore">
      <h2>{c[12]}</h2>
      <Notice>{c[14]}</Notice>
      <label>
        {c[13]}
        <input type="file" accept="application/json,.json" onChange={load} />
      </label>
      {pending && (
        <div className="restore-preview">
          <h3>{c[15]}</h3>
          <p>
            {pending.people} {c[16]} · {pending.stock.length} {c[17]} ·{" "}
            {pending.places.length} {c[18]} · {pending.meals.length} {c[19]}
          </p>
          <Button
            onClick={() => {
              exportData();
              onRestore(pending);
              setPending(null);
              setMessage(c[23]);
            }}
          >
            {c[20]}
          </Button>
          <Button variant="outline" onClick={() => setPending(null)}>
            {c[21]}
          </Button>
        </div>
      )}
      {message && <p role="status">{message}</p>}
      <p>{c[24]}</p>
    </section>
  );
}
