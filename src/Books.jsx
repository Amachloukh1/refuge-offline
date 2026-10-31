import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Icon, Button, Notice, External } from "./components";
import { bookText, bookLanguages, bookGenres } from "./books-text";
import camp from "../server/assets/refuge-camp.jpg";
import "./books.css";
const PdfBook = lazy(() => import("./BookPdf"));
function progress(id) {
  try {
    const v = JSON.parse(localStorage.getItem("refuge.book." + id));
    return {
      page:
        Number.isInteger(v?.page) && v.page > 0 && v.page < 100000 ? v.page : 1,
      font:
        Number.isInteger(v?.font) && v.font >= 14 && v.font <= 28 ? v.font : 18,
    };
  } catch {
    return { page: 1, font: 18 };
  }
}
function BookReader({ book, lang, onClose }) {
  const c = bookText[lang],
    saved = useRef(progress(book.id));
  const [page, setPage] = useState(saved.current.page),
    [font, setFont] = useState(saved.current.font),
    [chunks, setChunks] = useState(null),
    [total, setTotal] = useState(null),
    [error, setError] = useState(false);
  const url = `/books/${book.id}.${book.format}`;
  useEffect(() => {
    if (book.format !== "txt") return;
    const controller = new AbortController();
    setError(false);
    fetch(url, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.text();
      })
      .then((text) => {
        const parts = [];
        let start = 0;
        while (start < text.length) {
          let end = Math.min(start + 12000, text.length);
          if (end < text.length) {
            const newline = text.lastIndexOf("\n", end);
            if (newline > start + 6000) end = newline + 1;
          }
          parts.push(text.slice(start, end));
          start = end;
        }
        if (!parts.length) throw Error();
        setChunks(parts);
        setTotal(parts.length);
        setPage((p) => Math.min(p, parts.length));
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [url, book.format]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "refuge.book." + book.id,
        JSON.stringify({ page, font }),
      );
    } catch {}
  }, [book.id, page, font]);
  function move(n) {
    setPage((p) => Math.max(1, Math.min(total || 1, p + n)));
    document
      .querySelector(".book-reader")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
  }
  return (
    <section className="book-reader panel padded">
      <Button variant="outline" onClick={onClose}>
        {c.back}
      </Button>
      <h2 dir="auto">{book.title}</h2>
      <p dir="auto">{book.authors}</p>
      <div className="book-reader-controls">
        <Button variant="outline" disabled={page <= 1} onClick={() => move(-1)}>
          {c.previous}
        </Button>
        <span aria-live="polite">
          {c.page} {page} / {total || "…"}
        </span>
        <Button
          variant="outline"
          disabled={!total || page >= total}
          onClick={() => move(1)}
        >
          {c.next}
        </Button>
        {book.format === "txt" && (
          <>
            <button
              className="button outline"
              aria-label={c.fontDown}
              disabled={font <= 14}
              onClick={() => setFont((f) => f - 2)}
            >
              A−
            </button>
            <button
              className="button outline"
              aria-label={c.fontUp}
              disabled={font >= 28}
              onClick={() => setFont((f) => f + 2)}
            >
              A+
            </button>
          </>
        )}
      </div>
      <p className="book-reading-note">{c.resumeNote}</p>
      {error && <Notice tone="warning">{c.error}</Notice>}
      {book.format === "pdf" ? (
        <Suspense fallback={<p>{c.loading}</p>}>
          <PdfBook
            url={url}
            page={page}
            onPages={(n) => {
              setTotal(n);
              setPage((p) => Math.min(p, n));
            }}
            errorText={c.error}
          />
        </Suspense>
      ) : chunks ? (
        <article
          className="book-text"
          lang={book.language}
          dir={book.language === "ar" ? "rtl" : "ltr"}
          style={{ fontSize: font }}
        >
          {chunks[page - 1]}
        </article>
      ) : (
        !error && <p>{c.loading}</p>
      )}
      <div className="book-reader-footer">
        <a className="button outline" href={url} download>
          {c.original} · {book.format.toUpperCase()}
        </a>
        <External href={book.sourceUrl}>{c.source}</External>
        <small>{book.license}</small>
      </div>
    </section>
  );
}
export default function Books({ lang = "fr" }) {
  const c = bookText[lang] || bookText.fr,
    g = bookGenres[lang] || bookGenres.fr;
  const [view, setView] = useState("installed"),
    [query, setQuery] = useState(""),
    [language, setLanguage] = useState("all"),
    [genre, setGenre] = useState("all"),
    [page, setPage] = useState(0),
    [data, setData] = useState(null),
    [error, setError] = useState(false),
    [loading, setLoading] = useState(false),
    [selected, setSelected] = useState([]),
    [job, setJob] = useState(null),
    [tick, setTick] = useState(0),
    [reader, setReader] = useState(null),
    [sending, setSending] = useState(false);
  const wasRunning = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;
    async function poll() {
      try {
        const r = await fetch("/api/books/jobs", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!r.ok) return;
        const j = await r.json();
        if (!alive) return;
        if (wasRunning.current && !j.running) {
          setTick((t) => t + 1);
          setSelected([]);
        }
        wasRunning.current = j.running;
        setJob(j);
      } catch {}
    }
    poll();
    const timer = setInterval(poll, 1500);
    return () => {
      alive = false;
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = setTimeout(() => {
      const p = new URLSearchParams({
        q: query,
        language,
        genre,
        offset: page * 24,
        limit: 24,
        installed: String(view === "installed"),
      });
      fetch("/api/books?" + p, { signal: controller.signal, cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") {
            setError(true);
            setLoading(false);
          }
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [view, query, language, genre, page, tick]);
  useEffect(() => {
    setPage(0);
    setSelected([]);
  }, [view, query, language, genre]);
  async function start(ids) {
    if (!ids.length) return;
    setSending(true);
    setError(false);
    try {
      const r = await fetch("/api/books/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!r.ok) throw Error();
      const j = await r.json();
      setJob(j);
      wasRunning.current = j.running;
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  }
  async function cancel() {
    try {
      const r = await fetch("/api/books/cancel", { method: "POST" });
      if (!r.ok) throw Error();
      setJob(await r.json());
    } catch {
      setError(true);
    }
  }
  if (reader)
    return (
      <BookReader
        key={reader.id}
        book={reader}
        lang={lang}
        onClose={() => setReader(null)}
      />
    );
  const downloadable = (data?.items || []).filter((b) => !b.installed),
    busy = job?.running || sending;
  return (
    <>
      <section className="books-hero">
        <div>
          <span className="welcome-eyebrow">REFUGE · {c.title}</span>
          <h2>{c.hero}</h2>
          <p>{c.intro}</p>
          <div className="books-stats">
            <span>
              <strong>{data?.installedTotal ?? "—"}</strong> {c.installed}
            </span>
            <span>
              <strong>{data?.catalogTotal?.toLocaleString(lang) ?? "—"}</strong>{" "}
              {c.available}
            </span>
          </div>
        </div>
        <img src={camp} alt="" width="1536" height="1024" />
      </section>
      <div className="books-tabs">
        <button
          className={`filter ${view === "installed" ? "active" : ""}`}
          aria-pressed={view === "installed"}
          onClick={() => setView("installed")}
        >
          {c.installed}
        </button>
        <button
          className={`filter ${view === "catalog" ? "active" : ""}`}
          aria-pressed={view === "catalog"}
          onClick={() => setView("catalog")}
        >
          {c.catalog}
        </button>
        <Button variant="outline" onClick={() => setTick((t) => t + 1)}>
          {c.refresh}
        </Button>
      </div>
      <div className="books-filters">
        <label>
          <span>{c.search}</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.search}
          />
        </label>
        <label>
          <span>{c.allLanguages}</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="all">{c.allLanguages}</option>
            {Object.entries(bookLanguages).map(([key, name]) => (
              <option key={key} value={key}>
                {name} ({data?.languages?.[key] ?? "…"})
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{c.allGenres}</span>
          <select value={genre} onChange={(e) => setGenre(e.target.value)}>
            <option value="all">{c.allGenres}</option>
            {Object.entries(g).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="books-note">{c.catalogNote}</p>
      {job && (job.running || job.total > 0) && (
        <section className="books-job panel padded" aria-live="polite">
          <strong>
            {job.running
              ? c.jobRunning
              : job.cancelled
                ? c.cancelled
                : c.completed}{" "}
            · {job.completed}/{job.total}
          </strong>
          <p>{job.current}</p>
          <progress value={job.completed + job.failed} max={job.total || 1} />
          <span>
            {job.failed} {c.failed} · {(job.bytes / 1e6).toFixed(1)} MB
          </span>
          {job.running && (
            <Button variant="outline" onClick={cancel}>
              {c.cancel}
            </Button>
          )}
          {job.errors?.length > 0 && (
            <details>
              <summary>
                {job.failed} {c.failed}
              </summary>
              {job.errors.map((e, i) => (
                <p key={i} dir="auto">
                  {e.title || e.id} —{" "}
                  {["rights_review_needed", "source_changed"].includes(e.code)
                    ? c.rights
                    : c.error}
                </p>
              ))}
            </details>
          )}
        </section>
      )}
      {error && (
        <Notice tone="warning">
          {c.error}
          <Button variant="outline" onClick={() => setTick((t) => t + 1)}>
            {c.retry}
          </Button>
        </Notice>
      )}
      {view === "catalog" && (
        <div className="books-selection">
          <Button
            variant="outline"
            disabled={busy || !downloadable.length || loading}
            onClick={() => setSelected(downloadable.map((b) => b.id))}
          >
            {c.selectPage}
          </Button>
          <Button
            disabled={busy || !selected.length || loading}
            onClick={() => start(selected)}
            icon="Download"
          >
            {c.downloadSelection} ({selected.length})
          </Button>
          {selected.length > 0 && (
            <button className="text-button" onClick={() => setSelected([])}>
              {c.clearSelection}
            </button>
          )}
        </div>
      )}
      {loading && <p role="status">{c.loading}</p>}
      {!loading && data?.items.length === 0 && (
        <Notice>
          {c.empty}
          {view === "installed" && (
            <Button variant="outline" onClick={() => setView("catalog")}>
              {c.catalog}
            </Button>
          )}
        </Notice>
      )}
      <div className="books-grid" aria-busy={loading}>
        {data?.items.map((b) => (
          <article className="book-card panel" key={b.id}>
            <div
              className={`book-cover book-tone-${Number(b.id.replace(/\D/g, "")) % 5}`}
            >
              <span>{g[b.genres[0]] || g.other}</span>
              <h3 dir="auto">{b.title}</h3>
              <p dir="auto">{b.authors}</p>
              <small>
                {bookLanguages[b.language]} · {b.format.toUpperCase()}
              </small>
            </div>
            <div className="book-card-body">
              <div className="book-card-meta">
                <span className={b.installed ? "book-offline" : ""}>
                  {b.installed
                    ? c.local
                    : b.source === "hindawi"
                      ? "CC BY 4.0"
                      : "Gutenberg"}
                </span>
                {b.bytes && <small>{(b.bytes / 1e6).toFixed(1)} MB</small>}
              </div>
              {b.installed ? (
                <Button icon="BookOpen" onClick={() => setReader(b)}>
                  {c.read}
                </Button>
              ) : (
                <>
                  <label className="book-checkbox">
                    <input
                      type="checkbox"
                      checked={selected.includes(b.id)}
                      disabled={busy || loading}
                      onChange={() =>
                        setSelected((s) =>
                          s.includes(b.id)
                            ? s.filter((id) => id !== b.id)
                            : s.length < 50
                              ? [...s, b.id]
                              : s,
                        )
                      }
                      aria-label={`${c.select} ${b.title}`}
                    />
                    {c.select}
                  </label>
                  <Button
                    variant="outline"
                    disabled={busy || loading}
                    icon="Download"
                    onClick={() => start([b.id])}
                  >
                    {c.download}
                  </Button>
                </>
              )}
              <External href={b.sourceUrl}>{c.source}</External>
            </div>
          </article>
        ))}
      </div>
      <div className="books-pagination">
        <Button
          variant="outline"
          disabled={loading || page === 0}
          onClick={() => {
            setPage((p) => p - 1);
            setSelected([]);
          }}
        >
          {c.previous}
        </Button>
        <span>
          {c.page} {page + 1} /{" "}
          {Math.max(1, Math.ceil((data?.total || 0) / 24))} · {data?.total ?? 0}{" "}
          {c.available}
        </span>
        <Button
          variant="outline"
          disabled={loading || !data || (page + 1) * 24 >= data.total}
          onClick={() => {
            setPage((p) => p + 1);
            setSelected([]);
          }}
        >
          {c.next}
        </Button>
      </div>
      <details className="books-rights">
        <summary>{c.rights}</summary>
        <p>{c.rightsNote}</p>
      </details>
    </>
  );
}
