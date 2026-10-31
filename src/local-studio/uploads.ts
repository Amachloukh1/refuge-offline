import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.mjs?url";
export async function upload(file: File) {
  if (!file.size || file.size > 4 * 1024 * 1024)
    throw new Error("TXT/PDF: maximum 4 MB");
  let text = "";
  if (/\.txt$/i.test(file.name)) text = await file.text();
  else if (/\.pdf$/i.test(file.name)) {
    const pdf = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdf.GlobalWorkerOptions.workerSrc = workerUrl;
    const task = pdf.getDocument({
      data: new Uint8Array(await file.arrayBuffer()),
      useSystemFonts: true,
      isEvalSupported: false,
    });
    try {
      const doc = await task.promise;
      if (doc.numPages > 30) throw new Error("PDF: maximum 30 pages");
      for (let n = 1; n <= doc.numPages && text.length <= 3600; n++) {
        const page = await doc.getPage(n);
        const data = await page.getTextContent();
        text += data.items.map((i: any) => i.str || "").join(" ") + "\n";
      }
    } finally {
      await task.destroy();
    }
  } else throw new Error("TXT/PDF uniquement");
  if (!text.trim() || text.length > 3600)
    throw new Error(
      "Document text must contain 1–3600 characters. Use a shorter extract.",
    );
  return { text };
}
