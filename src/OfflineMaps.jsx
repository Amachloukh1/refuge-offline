import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import "maplibre-gl/dist/maplibre-gl.css";
import { Icon, Notice, Button } from "./components";
import mapPlan from "../content/maps.plan.json";
import { PersonalPlaces } from "./PersonalPlaces";
import MapDirections from "./MapDirections";
let registered = false;
const mapBounds = ({ bounds: [west, south, east, north] }) => [
  [west, south],
  [east, north],
];
const inRegion = (region, longitude, latitude) =>
  region &&
  longitude >= region.bounds[0] &&
  longitude <= region.bounds[2] &&
  latitude >= region.bounds[1] &&
  latitude <= region.bounds[3];
export default function OfflineMaps({ t, lang, places = [], setPlaces }) {
  const container = useRef(null),
    mapRef = useRef(null);
  const [maps, setMaps] = useState([]);
  const [regionId, setRegionId] = useState("sachsen");
  const info = maps.find((map) => map.id === regionId) || maps[0];
  const pendingPacks = mapPlan.packs.filter(
    (pack) => !maps.some((map) => map.id === pack.id),
  );
  const regionTitle = (map) =>
    ({ sachsen: t.saxony, europe: t.europe, "north-africa": t.northAfrica })[
      map.id
    ] || map.title;
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [gps, setGps] = useState(null);
  const [mapReady, setMapReady] = useState(null);
  const marker = useRef(null);
  useEffect(() => {
    if (!mapReady) return;
    const markers = places.map((p) =>
      new maplibregl.Marker({ color: "#9a6c35" })
        .setLngLat([p.longitude, p.latitude])
        .setPopup(new maplibregl.Popup().setText(`${p.name} · ${p.notes}`))
        .addTo(mapReady),
    );
    return () => markers.forEach((m) => m.remove());
  }, [mapReady, places]);
  useEffect(() => {
    if (gps?.status !== "searching") return;
    const timer = setInterval(
      () =>
        fetch("/api/gps")
          .then((r) => r.json())
          .then(setGps)
          .catch(() => setGps({ status: "unavailable" })),
      900,
    );
    return () => clearInterval(timer);
  }, [gps?.status]);
  useEffect(() => {
    if (gps?.status !== "fix" || !mapReady) return;
    marker.current?.remove();
    marker.current = new maplibregl.Marker({ color: "#285f43" })
      .setLngLat([gps.longitude, gps.latitude])
      .addTo(mapReady);
    if (inRegion(info, gps.longitude, gps.latitude))
      mapReady.flyTo({ center: [gps.longitude, gps.latitude], zoom: 13 });
    return () => marker.current?.remove();
  }, [gps, mapReady, info]);
  async function readGps() {
    marker.current?.remove();
    marker.current = null;
    try {
      setGps(
        await fetch("/api/gps/refresh", { method: "POST" }).then((r) =>
          r.json(),
        ),
      );
    } catch {
      setGps({ status: "unavailable" });
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/resources", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const installed = (data.maps || []).filter(
          (map) =>
            /^[\w.-]+\.pmtiles$/.test(map.filename) &&
            map.bounds?.length === 4 &&
            map.bounds.every(Number.isFinite),
        );
        setMaps(installed);
        if (!installed.length) setError(t.mapMissing);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(t.mapMissing);
      });
    return () => controller.abort();
  }, [t.mapMissing]);
  useEffect(() => {
    if (!info) return;
    let map;
    setError("");
    setCoords(null);
    try {
      if (!registered) {
        maplibregl.addProtocol("pmtiles", new Protocol().tile);
        registered = true;
      }
      const styleLayers = layers("protomaps", namedFlavor("light"), {
        lang: "de",
      });
      map = new maplibregl.Map({
        container: container.current,
        style: {
          version: 8,
          glyphs: `${location.origin}/assets/maps/fonts/{fontstack}/{range}.pbf`,
          sprite: `${location.origin}/assets/maps/sprites/light`,
          sources: {
            protomaps: {
              type: "vector",
              url: `pmtiles://${location.origin}/assets/maps/${info.filename}`,
              attribution: "© OpenStreetMap contributors · Protomaps",
            },
          },
          layers: styleLayers,
        },
        bounds: mapBounds(info),
        fitBoundsOptions: { padding: 24 },
        maxZoom: info.maxzoom || 14,
        attributionControl: true,
      });
      mapRef.current = map;
      setMapReady(map);
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.on("click", (e) =>
        setCoords({
          lon: e.lngLat.lng.toFixed(5),
          lat: e.lngLat.lat.toFixed(5),
        }),
      );
      map.on("error", (e) => {
        if (String(e.error?.message).includes("WebGL")) setError(t.mapWebgl);
      });
    } catch {
      setError(t.mapWebgl);
    }
    return () => {
      map?.remove();
      mapRef.current = null;
      setMapReady(null);
    };
  }, [info, t.mapWebgl]);
  return (
    <>
      <Notice icon="Map">{t.mapOfflineNote}</Notice>
      <MapDirections
        lang={lang}
        map={mapReady}
        onShow={(coordinates) => {
          const covers = (region) =>
            coordinates.every(([lon, lat]) => inRegion(region, lon, lat));
          if (!covers(info)) {
            const region = maps.find(covers);
            if (region) setRegionId(region.id);
          }
        }}
      />
      <section className="panel padded gps-panel">
        <h2>GPS USB · G-MOUSE</h2>
        <p>{t.gpsNote}</p>
        <Button
          icon="MapPin"
          onClick={readGps}
          disabled={gps?.status === "searching"}
        >
          {gps?.status === "searching" ? t.gpsSearching : t.gpsRead}
        </Button>
        {gps && gps.status !== "searching" && gps.status !== "fix" && (
          <p role="status">
            {gps.status === "no_fix" ? t.gpsNoFix : t.gpsUnavailable}
          </p>
        )}
        {gps?.status === "fix" && (
          <div role="status">
            <p dir="ltr">
              {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
            </p>
            <p>
              {t.gpsAt} {new Date(gps.receivedAt).toLocaleString()}
            </p>
            {info?.id === "sachsen" &&
              !inRegion(info, gps.longitude, gps.latitude) && (
                <p>{t.gpsOutside}</p>
              )}
          </div>
        )}
      </section>
      <section className="panel offline-map-panel">
        <div className="map-toolbar">
          <div>
            <h2>{info ? regionTitle(info) : t.offlineMaps}</h2>
            {maps.length > 0 && (
              <select
                aria-label={t.offlineMaps}
                value={info.id}
                onChange={(event) => setRegionId(event.target.value)}
              >
                {maps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {regionTitle(map)}
                  </option>
                ))}
              </select>
            )}
            <p>
              {info
                ? `${(info.bytes / 1e6).toFixed(0)} MB · OpenStreetMap · ${info.downloadedAt}`
                : t.loading}
            </p>
          </div>
          <Button
            variant="outline"
            icon="MapPin"
            onClick={() =>
              info &&
              mapRef.current?.fitBounds(mapBounds(info), { padding: 24 })
            }
          >
            {t.mapOverview}
          </Button>
        </div>
        <div
          className="offline-map"
          ref={container}
          role="region"
          aria-label={t.offlineMaps}
        />
        {error && <Notice tone="warning">{error}</Notice>}
        <div className="map-coordinate">
          <Icon name="MapPin" size={17} />
          {coords ? `${coords.lat}, ${coords.lon}` : t.mapClick}
        </div>
      </section>
      <div className="map-cities">
        {[
          ["Dresden", 13.7373, 51.0504],
          ["Leipzig", 12.3731, 51.3397],
          ["Chemnitz", 12.9253, 50.8278],
        ]
          .filter(([, lon, lat]) => inRegion(info, lon, lat))
          .map(([name, lon, lat]) => (
            <Button
              key={name}
              variant="outline"
              onClick={() =>
                mapRef.current?.flyTo({ center: [lon, lat], zoom: 12 })
              }
            >
              {name}
            </Button>
          ))}
      </div>
      <PersonalPlaces
        lang={lang}
        places={places}
        setPlaces={setPlaces}
        coords={coords}
        onLocate={(p) =>
          mapRef.current?.flyTo({ center: [p.longitude, p.latitude], zoom: 12 })
        }
      />
      {pendingPacks.length > 0 && (
        <section className="panel padded">
          <h2>{t.mapPlanTitle}</h2>
          <p>{t.mapPlanNote}</p>
          <div className="map-plan-grid">
            {pendingPacks.map((p) => (
              <article key={p.id}>
                <strong>{p.id === "europe" ? t.europe : t.northAfrica}</strong>
                <p>
                  ~{p.estimatedBytes / 1e9} GB · zoom {mapPlan.maxzoom}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
