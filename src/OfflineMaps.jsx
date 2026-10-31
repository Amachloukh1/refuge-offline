import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import "maplibre-gl/dist/maplibre-gl.css";
import { Icon, Notice, Button } from "./components";
import mapPlan from "../content/maps.plan.json";
let registered = false;
export default function OfflineMaps({ t }) {
  const container = useRef(null),
    mapRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
  const [gps, setGps] = useState(null);
  const [mapReady, setMapReady] = useState(null);
  const marker = useRef(null);
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
    if (
      gps.longitude >= 11.8 &&
      gps.longitude <= 15.1 &&
      gps.latitude >= 50.1 &&
      gps.latitude <= 51.8
    )
      mapReady.flyTo({ center: [gps.longitude, gps.latitude], zoom: 13 });
    return () => marker.current?.remove();
  }, [gps, mapReady]);
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
    let map;
    fetch("/api/resources", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const region = data.maps?.find((m) => m.id === "sachsen");
        if (!region) {
          setError(t.mapMissing);
          return;
        }
        setInfo(region);
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
                url: `pmtiles://${location.origin}/assets/maps/sachsen.pmtiles`,
                attribution: "© OpenStreetMap contributors · Protomaps",
              },
            },
            layers: styleLayers,
          },
          center: [13.45, 50.95],
          zoom: 7.5,
          minZoom: 6,
          maxZoom: 14,
          maxBounds: [
            [11.5, 49.9],
            [15.4, 52],
          ],
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
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(t.mapMissing);
      });
    return () => {
      controller.abort();
      map?.remove();
      mapRef.current = null;
      setMapReady(null);
    };
  }, [t]);
  return (
    <>
      <Notice icon="Map">{t.mapOfflineNote}</Notice>
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
            {(gps.longitude < 11.8 ||
              gps.longitude > 15.1 ||
              gps.latitude < 50.1 ||
              gps.latitude > 51.8) && <p>{t.gpsOutside}</p>}
          </div>
        )}
      </section>
      <section className="panel offline-map-panel">
        <div className="map-toolbar">
          <div>
            <h2>Sachsen · {t.saxony}</h2>
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
              mapRef.current?.fitBounds(
                [
                  [11.8, 50.1],
                  [15.1, 51.8],
                ],
                { padding: 20 },
              )
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
        ].map(([name, lon, lat]) => (
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
      <section className="panel padded">
        <h2>{t.mapPlanTitle}</h2>
        <p>{t.mapPlanNote}</p>
        <div className="map-plan-grid">
          {mapPlan.packs.map((p) => (
            <article key={p.id}>
              <strong>{p.id === "europe" ? t.europe : t.northAfrica}</strong>
              <p>
                ~{p.estimatedBytes / 1e9} GB · zoom {mapPlan.maxzoom}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
