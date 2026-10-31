import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export const cities = {
  Dresden: [51.0504, 13.7373],
  Leipzig: [51.3397, 12.3731],
  Chemnitz: [50.8278, 12.9253],
};
export async function readWeather(root) {
  try {
    return JSON.parse(
      await readFile(path.join(root, "data/weather.json"), "utf8"),
    );
  } catch {
    return { snapshots: {} };
  }
}
let refreshing = false;
export async function refreshWeather(root, city, fetcher = fetch) {
  if (!Object.hasOwn(cities, city)) throw new Error("invalid_city");
  if (refreshing) throw new Error("busy");
  refreshing = true;
  try {
    const [lat, lon] = cities[city];
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,apparent_temperature,precipitation,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      timezone: "Europe/Berlin",
      forecast_days: "3",
    });
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(20000),
      redirect: "error",
    });
    if (!response.ok) throw new Error("upstream");
    const data = await response.json();
    if (
      !Number.isFinite(data.current?.temperature_2m) ||
      !Array.isArray(data.daily?.time)
    )
      throw new Error("invalid_weather");
    const cache = await readWeather(root);
    cache.snapshots ??= {};
    cache.snapshots[city] = {
      city,
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo",
      ...data,
    };
    await mkdir(path.join(root, "data"), { recursive: true });
    await writeFile(
      path.join(root, "data/weather.json"),
      JSON.stringify(cache),
    );
    return cache;
  } finally {
    refreshing = false;
  }
}
