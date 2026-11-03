import {extraPlacesText} from "./locales/extra-ui-text.js";
import { useState } from "react";
import { createLocalId } from "./local-id.js";
import { Button, Notice } from "./components";
const labels = {
  fr: [
    "Mes lieux et itinéraires utiles",
    "Points personnels, non vérifiés par REFUGE. Vérifiez l’accès et les consignes locales. Un point d’eau n’est pas une preuve de potabilité. Les itinéraires sont des notes, sans guidage calculé.",
    "Nom",
    "Latitude",
    "Longitude",
    "Notes / itinéraire papier",
    "Ajouter le lieu",
    "Utiliser le point choisi sur la carte",
    "Afficher sur la carte",
    "Retirer",
    "Imprimer la liste",
    "Exporter GeoJSON",
    "Coordonnées ou nom invalides, ou limite de 100 lieux atteinte.",
    "Non vérifié",
    "Aucun point enregistré.",
    "Lieux privés : ils restent dans ce navigateur et dans votre export personnel.",
  ],
  de: [
    "Meine wichtigen Orte und Wege",
    "Persönliche Punkte, nicht von REFUGE geprüft. Zugang und lokale Hinweise prüfen. Wasserpunkte garantieren kein Trinkwasser. Wege sind Notizen ohne Routenberechnung.",
    "Name",
    "Breitengrad",
    "Längengrad",
    "Notizen / Papierroute",
    "Ort hinzufügen",
    "Gewählten Kartenpunkt verwenden",
    "Auf Karte zeigen",
    "Entfernen",
    "Liste drucken",
    "GeoJSON exportieren",
    "Ungültiger Name/Koordinaten oder Grenze von 100 Orten erreicht.",
    "Nicht geprüft",
    "Keine Orte gespeichert.",
    "Private Orte bleiben in diesem Browser und in Ihrem persönlichen Export.",
  ],
  en: [
    "My useful places and routes",
    "Personal points, not verified by REFUGE. Check access and local instructions. A water point is not proof of drinkability. Routes are notes, without calculated navigation.",
    "Name",
    "Latitude",
    "Longitude",
    "Notes / paper route",
    "Add place",
    "Use selected map point",
    "Show on map",
    "Remove",
    "Print list",
    "Export GeoJSON",
    "Invalid name/coordinates or limit of 100 places reached.",
    "Unverified",
    "No saved places.",
    "Private places stay in this browser and your personal export.",
  ],
  ar: [
    "أماكني ومساراتي المهمة",
    "نقاط شخصية لم يتحقق منها REFUGE. تحقق من الوصول والتعليمات المحلية. نقطة الماء لا تعني صلاحية الشرب. المسارات ملاحظات دون حساب ملاحة.",
    "الاسم",
    "خط العرض",
    "خط الطول",
    "ملاحظات / مسار ورقي",
    "إضافة مكان",
    "استخدام النقطة المختارة على الخريطة",
    "عرض على الخريطة",
    "حذف",
    "طباعة القائمة",
    "تصدير GeoJSON",
    "اسم أو إحداثيات غير صالحة أو بلوغ حد 100 مكان.",
    "غير متحقق منه",
    "لا توجد أماكن محفوظة.",
    "الأماكن الخاصة تبقى في هذا المتصفح ونسختك الشخصية.",
  ],
};
export function validPlace(p) {
  return (
    p &&
    typeof p.id === "string" &&
    p.id.length <= 100 &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    p.name.length <= 100 &&
    Number.isFinite(p.latitude) &&
    Math.abs(p.latitude) <= 90 &&
    Number.isFinite(p.longitude) &&
    Math.abs(p.longitude) <= 180 &&
    typeof p.notes === "string" &&
    p.notes.length <= 2000
  );
}
export function PersonalPlaces({
  lang = "fr",
  places = [],
  setPlaces,
  coords,
  onLocate,
}) {
  const c = labels[lang] || labels.fr;
  const [draft, setDraft] = useState({
    name: "",
    latitude: "",
    longitude: "",
    notes: "",
  });
  const [error, setError] = useState(false);
  function add(e) {
    e.preventDefault();
    const p = {
      ...draft,
      id: createLocalId(),
      name: draft.name.trim(),
      latitude: Number(draft.latitude),
      longitude: Number(draft.longitude),
    };
    if (
      !draft.latitude.trim() ||
      !draft.longitude.trim() ||
      !validPlace(p) ||
      places.length >= 100
    ) {
      setError(true);
      return;
    }
    setPlaces((prev) => [...prev, p]);
    setDraft({ name: "", latitude: "", longitude: "", notes: "" });
    setError(false);
  }
  function exportPlaces() {
    const a = document.createElement("a"),
      url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              {
                type: "FeatureCollection",
                features: places.map((p) => ({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [p.longitude, p.latitude],
                  },
                  properties: { name: p.name, notes: p.notes, verified: false },
                })),
              },
              null,
              2,
            ),
          ],
          { type: "application/geo+json" },
        ),
      );
    a.href = url;
    a.download = "refuge-lieux.geojson";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section
      className="panel padded personal-places"
      data-testid="personal-places"
    >
      <h2>{c[0]}</h2>
      <Notice>{c[1]}</Notice>
      <p>{c[15]}</p>
      <form className="form-stack no-print" onSubmit={add}>
        <label>
          {c[2]}
          <input
            required
            maxLength={100}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </label>
        <div className="form-row">
          {["latitude", "longitude"].map((k, i) => (
            <label key={k}>
              {c[3 + i]}
              <input
                required
                type="number"
                step="any"
                min={i ? -180 : -90}
                max={i ? 180 : 90}
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <label>
          {c[5]}
          <textarea
            maxLength={2000}
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
          />
        </label>
        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            disabled={!coords}
            onClick={() =>
              setDraft({
                ...draft,
                latitude: String(coords.lat),
                longitude: String(coords.lon),
              })
            }
          >
            {c[7]}
          </Button>
          <Button type="submit">{c[6]}</Button>
        </div>
        {error && <p role="alert">{c[12]}</p>}
      </form>
      <div className="form-actions no-print">
        <Button variant="outline" onClick={() => window.print()}>
          {c[10]}
        </Button>
        <Button
          variant="outline"
          onClick={exportPlaces}
          disabled={!places.length}
        >
          {c[11]}
        </Button>
      </div>
      {places.length === 0 ? (
        <p>{c[14]}</p>
      ) : (
        <ul className="place-list">
          {places.map((p) => (
            <li key={p.id}>
              <h3>{p.name}</h3>
              <p dir="ltr">
                {p.latitude}, {p.longitude}
              </p>
              <p className="multiline">{p.notes}</p>
              <span className="tag">{c[13]}</span>
              <div className="form-actions no-print">
                <Button variant="outline" onClick={() => onLocate(p)}>
                  {c[8]}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPlaces((prev) => prev.filter((x) => x.id !== p.id))
                  }
                >
                  {c[9]}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
Object.assign(labels, extraPlacesText);
