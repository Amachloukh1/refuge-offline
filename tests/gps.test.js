import test from "node:test";
import assert from "node:assert/strict";
import { parseNmea } from "../server/gps.js";
test("GPS NMEA : position vérifiée et rejet des trames corrompues ou sans fix", () => {
  const p = parseNmea(
    "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47",
  );
  assert.ok(Math.abs(p.latitude - 48.1173) < 0.00001);
  assert.ok(Math.abs(p.longitude - 11.5166667) < 0.00001);
  assert.equal(
    parseNmea(
      "$GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*00",
    ),
    null,
  );
  const valid = (line) => {
    let sum = 0;
    for (const c of line) sum ^= c.charCodeAt(0);
    return "$" + line + "*" + sum.toString(16).padStart(2, "0");
  };
  assert.equal(
    parseNmea(valid("GPRMC,123519,V,4807.038,N,01131.000,E,0,0,010126,,,N")),
    null,
  );
  assert.equal(
    parseNmea(
      valid("GPGGA,123519,4867.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,"),
    ),
    null,
  );
});
