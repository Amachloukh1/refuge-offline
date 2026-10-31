import { useState, useEffect } from "react";
import { Notice, Button, External, Icon } from "./components";
export function WeatherRadio({ t }) {
  const [cache, setCache] = useState({ snapshots: {} }),
    [city, setCity] = useState("Dresden"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then(setCache)
      .catch(() => {});
  }, []);
  const item = cache.snapshots?.[city];
  async function refresh() {
    setBusy(true);
    setError(false);
    try {
      const r = await fetch("/api/weather/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city }),
      });
      if (!r.ok) throw new Error();
      setCache(await r.json());
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Notice icon="CloudSun">{t.weatherCacheNote}</Notice>
      <section className="panel padded">
        <div className="section-toolbar">
          <label>
            {t.city}
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              {["Dresden", "Leipzig", "Chemnitz"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <Button onClick={refresh} disabled={busy} icon="RefreshCw">
            {busy ? t.loading : t.weatherRefresh}
          </Button>
        </div>
        {error && <p role="alert">{t.weatherFailed}</p>}
        {item ? (
          <>
            <div className="weather-current">
              <Icon name="Thermometer" size={36} />
              <strong>{item.current.temperature_2m} °C</strong>
              <span>
                {item.current.wind_speed_10m} km/h · {t.wind}
              </span>
            </div>
            <p>
              {t.savedAt}: {new Date(item.fetchedAt).toLocaleString()} ·{" "}
              {t.forecastTime}: {item.current.time}
            </p>
            <div className="weather-days">
              {item.daily.time.map((date, i) => (
                <div className="panel padded" key={date}>
                  <strong>{date}</strong>
                  <p>
                    {item.daily.temperature_2m_min[i]}–
                    {item.daily.temperature_2m_max[i]} °C
                  </p>
                  <span>{item.daily.precipitation_sum[i]} mm</span>
                </div>
              ))}
            </div>
            <p className="muted">{t.weatherOld}</p>
          </>
        ) : (
          <p>{t.weatherNoCache}</p>
        )}
        <External href="https://open-meteo.com/">
          Open-Meteo · CC BY 4.0
        </External>
      </section>
      <section className="panel padded radio-panel">
        <span className="topic-icon">
          <Icon name="RadioTower" size={30} />
        </span>
        <h2>{t.radioLocal}</h2>
        <p>{t.radioHardware}</p>
        <ol>
          <li>{t.radioStep1}</li>
          <li>{t.radioStep2}</li>
          <li>{t.radioStep3}</li>
        </ol>
        <p>{t.radioLimit}</p>
        <External href="https://www.mdr.de/mdr-sachsen/">MDR Sachsen</External>
        <p>
          <External href="https://www.sdrpp.org/">SDR++</External>
        </p>
      </section>
    </>
  );
}
