export function parseCsv(text) {
  const rows = [];
  let row = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (c === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((c === "\n" || c === "\r") && !quoted) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (quoted) throw Error("invalid_csv");
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
export function classifyBook(text = "") {
  const rules = {
    crime: /detective|mystery|crime/i,
    adventure: /adventure|travel|voyage/i,
    scifi: /science fiction/i,
    fantasy: /fantasy|fairy/i,
    children: /children|juvenile/i,
    poetry: /poetry|poems/i,
    theatre: /drama|plays/i,
    history: /history|historical/i,
    philosophy: /philosophy|ethics/i,
    science: /science|mathematics|physics|biology|astronomy/i,
    practical: /cook|gardening|agriculture|handbook|craft|household/i,
    biography: /biograph|memoir/i,
    religion: /religion|theology|bible|koran/i,
    fiction: /fiction|novel|literature/i,
  };
  const genres = Object.entries(rules)
    .filter(([, re]) => re.test(text))
    .map(([key]) => key);
  return genres.length ? genres : ["other"];
}
export function contributorsOldEnough(rdf, year = new Date().getUTCFullYear()) {
  const agents = [
    ...rdf.matchAll(/<pgterms:agent\b[\s\S]*?<\/pgterms:agent>/g),
  ];
  return (
    agents.length > 0 &&
    agents.every(([agent]) => {
      const death = agent.match(
        /<pgterms:deathdate\b[^>]*>(-?\d+)<\/pgterms:deathdate>/,
      );
      return death && Number(death[1]) <= year - 71;
    })
  );
}
export const validBookId = (id) =>
  typeof id === "string" && /^(pg-[1-9]\d{0,6}|hw-\d{8}|quran-clear)$/.test(id);
