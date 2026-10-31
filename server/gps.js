import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";
export function parseNmea(line) {
  const match = /^\$([^*]+)\*([0-9a-f]{2})$/i.exec(line.trim());
  if (!match) return null;
  let sum = 0;
  for (const c of match[1]) sum ^= c.charCodeAt(0);
  if (sum !== parseInt(match[2], 16)) return null;
  const f = match[1].split(",");
  let lat, ns, lon, ew;
  if (/RMC$/.test(f[0]) && f[2] === "A") {
    [lat, ns, lon, ew] = f.slice(3, 7);
  } else if (/GGA$/.test(f[0]) && ["1", "2", "4", "5"].includes(f[6])) {
    [lat, ns, lon, ew] = f.slice(2, 6);
  } else return null;
  if (!["N", "S"].includes(ns) || !["E", "W"].includes(ew)) return null;
  const coordinate = (v, h, limit) => {
    if (!/^\d+(\.\d+)?$/.test(v)) return null;
    const n = Number(v),
      degrees = Math.floor(n / 100),
      minutes = n - degrees * 100;
    if (minutes >= 60 || degrees > limit) return null;
    const value = (degrees + minutes / 60) * (["S", "W"].includes(h) ? -1 : 1);
    return Math.abs(value) <= limit ? value : null;
  };
  const latitude = coordinate(lat, ns, 90),
    longitude = coordinate(lon, ew, 180);
  return latitude === null || longitude === null
    ? null
    : { latitude, longitude };
}
export function createGps(env = process.env) {
  let state = {
      status: "idle",
      source: process.platform === "win32" ? "USB NMEA" : "gpsd",
      receivedAt: null,
    },
    active = false,
    child,
    socket,
    timer,
    generation = 0;
  function finish(status) {
    clearTimeout(timer);
    active = false;
    state = { ...state, status };
    child?.kill();
    child = null;
    socket?.destroy();
    socket = null;
  }
  function fix(data) {
    if (
      !Number.isFinite(data.latitude) ||
      !Number.isFinite(data.longitude) ||
      Math.abs(data.latitude) > 90 ||
      Math.abs(data.longitude) > 180
    )
      return;
    state = { ...state, ...data, receivedAt: new Date().toISOString() };
    finish("fix");
  }
  function refresh() {
    if (active) return state;
    const ticket = ++generation;
    active = true;
    state = {
      status: "searching",
      source: process.platform === "win32" ? "USB NMEA" : "gpsd",
      receivedAt: null,
    };
    timer = setTimeout(() => finish("no_fix"), 16000);
    if (process.platform === "win32") {
      const port = env.REFUGE_GPS_PORT || "";
      if (!/^COM[1-9][0-9]{0,2}$/.test(port)) {
        finish("not_configured");
        return state;
      }
      child = spawn(
        "powershell.exe",
        [
          "-NoProfile",
          "-NonInteractive",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          fileURLToPath(
            new URL("../scripts/read-gps-windows.ps1", import.meta.url),
          ),
          "-Port",
          port,
        ],
        { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] },
      );
      let pending = "";
      child.stdout.on("data", (b) => {
        if (ticket !== generation || !active) return;
        pending += b.toString();
        let at;
        while ((at = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, at);
          pending = pending.slice(at + 1);
          const p = parseNmea(line);
          if (p) {
            fix(p);
            return;
          }
        }
        if (pending.length > 4096) pending = "";
      });
      child.on("error", () => {
        if (ticket === generation && active) finish("unavailable");
      });
      child.on("exit", (code) => {
        if (ticket === generation && active)
          finish(code === 0 ? "no_fix" : "unavailable");
      });
    } else {
      socket = net.createConnection({ host: "127.0.0.1", port: 2947 }, () =>
        socket.write('?WATCH={"enable":true,"json":true};\n'),
      );
      let pending = "";
      socket.on("data", (b) => {
        if (ticket !== generation || !active) return;
        pending += b.toString();
        if (pending.length > 32000) {
          finish("unavailable");
          return;
        }
        let at;
        while ((at = pending.indexOf("\n")) >= 0) {
          const line = pending.slice(0, at);
          pending = pending.slice(at + 1);
          try {
            const p = JSON.parse(line);
            if (p.class === "TPV" && p.mode >= 2) {
              fix({ latitude: p.lat, longitude: p.lon });
              if (!active) return;
            }
          } catch {}
        }
      });
      socket.on("error", () => {
        if (ticket === generation && active) finish("unavailable");
      });
      socket.on("close", () => {
        if (ticket === generation && active) finish("no_fix");
      });
    }
    return state;
  }
  return {
    snapshot: () => state,
    refresh,
    close: () => {
      generation++;
      finish("idle");
    },
  };
}
