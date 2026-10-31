import { useEffect, useRef, useState } from "react";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
export default function BookPdf({ url, page, onPages, errorText }) {
  const canvas = useRef(null),
    [doc, setDoc] = useState(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let alive = true,
      task;
    setError(false);
    setDoc(null);
    import("pdfjs-dist/legacy/build/pdf.mjs")
      .then((pdf) => {
        if (!alive) return;
        pdf.GlobalWorkerOptions.workerSrc = workerUrl;
        task = pdf.getDocument({
          url,
          useSystemFonts: true,
          isEvalSupported: false,
        });
        return task.promise;
      })
      .then((d) => {
        if (alive && d) {
          setDoc(d);
          onPages(d.numPages);
        }
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
      task?.destroy();
    };
  }, [url]);
  useEffect(() => {
    if (!doc) return;
    let alive = true,
      render;
    doc
      .getPage(Math.min(Math.max(1, page), doc.numPages))
      .then((p) => {
        if (!alive) return;
        const base = p.getViewport({ scale: 1 }),
          width = canvas.current.parentElement.clientWidth || 650;
        const viewport = p.getViewport({
          scale:
            Math.min(width / base.width, 1.8) *
            Math.min(devicePixelRatio || 1, 2),
        });
        const c = canvas.current;
        c.width = viewport.width;
        c.height = viewport.height;
        render = p.render({ canvasContext: c.getContext("2d"), viewport });
        return render.promise;
      })
      .catch((e) => {
        if (alive && e.name !== "RenderingCancelledException") setError(true);
      });
    return () => {
      alive = false;
      render?.cancel();
    };
  }, [doc, page]);
  return error ? (
    <p role="alert">{errorText}</p>
  ) : (
    <canvas
      ref={canvas}
      className="book-pdf-canvas"
      aria-label={`PDF ${page}`}
    />
  );
}
