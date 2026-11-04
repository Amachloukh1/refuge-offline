import { useEffect, useState } from "react";
import { LngLatBounds, Marker } from "maplibre-gl";

const labels = {
  fr: [
    "Adresses et trajets",
    "Départ",
    "Arrivée",
    "Chercher",
    "Calculer le trajet",
    "Voiture",
    "Vélo",
    "À pied",
    "Internet requis. Les recherches et les points du trajet sont envoyés aux services OpenStreetMap. Évite les adresses privées.",
    "Aucun résultat",
    "Service indisponible. Réessaie dans un instant.",
    "Corriger la carte",
  ],
  de: [
    "Adressen und Routen",
    "Start",
    "Ziel",
    "Suchen",
    "Route berechnen",
    "Auto",
    "Fahrrad",
    "Zu Fuß",
    "Internet erforderlich. Suchbegriffe und Routenpunkte werden an OpenStreetMap-Dienste gesendet. Private Adressen vermeiden.",
    "Keine Ergebnisse",
    "Dienst nicht verfügbar. Bitte erneut versuchen.",
    "Karte korrigieren",
  ],
  en: [
    "Addresses and routes",
    "Start",
    "Destination",
    "Search",
    "Calculate route",
    "Car",
    "Bike",
    "Walking",
    "Internet required. Searches and route points are sent to OpenStreetMap services. Avoid private addresses.",
    "No results",
    "Service unavailable. Try again shortly.",
    "Fix the map",
  ],
  ar: [
    "العناوين والمسارات",
    "الانطلاق",
    "الوجهة",
    "بحث",
    "حساب المسار",
    "سيارة",
    "دراجة",
    "مشياً",
    "يتطلب الإنترنت. تُرسل عمليات البحث ونقاط المسار إلى خدمات OpenStreetMap. تجنّب العناوين الخاصة.",
    "لا توجد نتائج",
    "الخدمة غير متاحة. حاول مجدداً.",
    "تصحيح الخريطة",
  ],
};
const empty = { query: "", results: null, selected: null };
async function request(kind, params) {
  const response = await fetch(
    `/api/maps/${kind}?${new URLSearchParams(params)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok) throw Error();
  return response.json();
}

export default function MapDirections({ lang, map, onShow }) {
  const t = labels[lang] || labels.en;
  const [fields, setFields] = useState([empty, empty]);
  const [mode, setMode] = useState("car");
  const [route, setRoute] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [from, to] = fields.map((field) => field.selected);
  useEffect(() => {
    if (!map) return;
    const markers = [from, to].map(
      (item, index) =>
        item &&
        new Marker({ color: index ? "#a94b24" : "#285f43" })
          .setLngLat(item.location)
          .addTo(map),
    );
    function draw() {
      if (!route) return;
      map.addSource("refuge-route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: route.geometry },
      });
      map.addLayer({
        id: "refuge-route",
        source: "refuge-route",
        type: "line",
        paint: { "line-color": "#1459ac", "line-width": 5 },
      });
      const bounds = new LngLatBounds();
      route.geometry.coordinates.forEach((coordinate) =>
        bounds.extend(coordinate),
      );
      map.fitBounds(bounds, { padding: 40, maxZoom: 15 });
    }
    if (map.isStyleLoaded()) draw();
    else map.once("load", draw);
    return () => {
      map.off("load", draw);
      markers.forEach((marker) => marker?.remove());
      if (map.getLayer("refuge-route")) map.removeLayer("refuge-route");
      if (map.getSource("refuge-route")) map.removeSource("refuge-route");
    };
  }, [map, from, to, route]);
  function update(index, field) {
    setFields((previous) =>
      previous.map((item, i) => (i === index ? field : item)),
    );
    setRoute(null);
  }
  async function search(index) {
    setBusy(true);
    setMessage("");
    try {
      const field = fields[index];
      const results = await request("search", { q: field.query });
      update(index, { ...field, results, selected: null });
    } catch {
      setMessage(t[9]);
    } finally {
      setBusy(false);
    }
  }
  async function calculate() {
    setBusy(true);
    setMessage("");
    try {
      const result = await request("route", {
        from: from.location,
        to: to.location,
        mode,
      });
      setRoute(result);
      if (result) onShow(result.geometry.coordinates);
      else setMessage(t[8]);
    } catch {
      setMessage(t[9]);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel padded">
      <h2>{t[0]}</h2>
      <p>{t[7]}</p>
      <div className="form-row">
        {fields.map((field, index) => (
          <form
            key={index}
            onSubmit={(event) => {
              event.preventDefault();
              void search(index);
            }}
          >
            <label>
              {t[index + 1]}
              <input
                type="search"
                maxLength={200}
                disabled={busy}
                value={field.query}
                onChange={(event) =>
                  update(index, { ...empty, query: event.target.value })
                }
              />
            </label>
            <button
              type="submit"
              className="button outline"
              disabled={busy || field.query.trim().length < 3}
            >
              {t[3]}
            </button>
            {field.results?.length === 0 && <p role="status">{t[8]}</p>}
            {field.results?.length > 0 && (
              <ul>
                {field.results.map((item, position) => (
                  <li key={position}>
                    <button
                      type="button"
                      className="button outline"
                      disabled={busy}
                      aria-pressed={field.selected === item}
                      onClick={() => {
                        update(index, { ...field, selected: item });
                        onShow([item.location]);
                        map?.flyTo({ center: item.location, zoom: 15 });
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        ))}
      </div>
      <div className="filter-row">
        <select
          aria-label={t[4]}
          value={mode}
          disabled={busy}
          onChange={(event) => {
            setMode(event.target.value);
            setRoute(null);
          }}
        >
          {["car", "bike", "foot"].map((key, index) => (
            <option key={key} value={key}>
              {t[index + 5]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button"
          disabled={busy || !from || !to}
          onClick={calculate}
        >
          {t[4]}
        </button>
      </div>
      {message && <p role="status">{message}</p>}
      {route && (
        <p role="status">
          {(route.distance / 1000).toLocaleString(lang, {
            maximumFractionDigits: 1,
          })}{" "}
          km · {Math.ceil(route.duration / 60)} min
        </p>
      )}
      <small>
        <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a> ·{" "}
        <a href="https://routing.openstreetmap.de/about.html">FOSSGIS / OSRM</a>{" "}
        · <a href="https://www.openstreetmap.org/fixthemap">{t[10]}</a>
      </small>
    </section>
  );
}
