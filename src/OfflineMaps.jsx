import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
maplibregl.setWorkerUrl(workerUrl);
import { Protocol } from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import "maplibre-gl/dist/maplibre-gl.css";
import { Icon, Notice, Button } from "./components";
let registered = false;
export default function OfflineMaps({ t }) {
  const container = useRef(null),
    mapRef = useRef(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);
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
    };
  }, [t]);
  return (
    <>
      <Notice icon="Map">{t.mapOfflineNote}</Notice>
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
    </>
  );
}
