const nextRequest = new Map();
const cache = new Map();

async function lookup(url) {
  const key = url.toString();
  if (cache.has(key)) return cache.get(key);
  const now = Date.now();
  const wait = Math.max(0, (nextRequest.get(url.host) || 0) - now);
  if (wait > 2200) throw Error("rate");
  nextRequest.set(url.host, now + wait + 1100);
  if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
  const response = await fetch(url, {
    headers: {
      "User-Agent": "REFUGE-Offline/0.1 (interactive map)",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(12000),
    redirect: "error",
  });
  if (!response.ok && !(response.status === 400 && url.hostname === "routing.openstreetmap.de"))
    throw Error("upstream");
  const data = await response.json();
  if (cache.size >= 128) cache.delete(cache.keys().next().value);
  cache.set(key, data);
  return data;
}

function point(value) {
  const match = /^(-?\d{1,3}(?:\.\d{1,8})?),(-?\d{1,2}(?:\.\d{1,8})?)$/.exec(
    value || "",
  );
  if (
    !match ||
    Math.abs(Number(match[1])) > 180 ||
    Math.abs(Number(match[2])) > 90
  )
    return null;
  return [Number(match[1]), Number(match[2])];
}

export async function mapDirections(url) {
  const params = url.searchParams;
  if (url.pathname.endsWith("/search")) {
    const q = params.get("q")?.trim();
    if (!q || q.length < 3 || q.length > 200)
      return [400, { code: "invalid_search" }];
    const target = new URL("https://nominatim.openstreetmap.org/search");
    target.search = new URLSearchParams({ q, format: "jsonv2", limit: "5" });
    const results = await lookup(target);
    return [
      200,
      results.flatMap((item) => {
        const location = point(
          `${Number(item.lon).toFixed(7)},${Number(item.lat).toFixed(7)}`,
        );
        return location && typeof item.display_name === "string"
          ? [{ label: item.display_name, location }]
          : [];
      }),
    ];
  }
  const from = point(params.get("from"));
  const to = point(params.get("to"));
  const mode = params.get("mode");
  if (!from || !to || !["car", "bike", "foot"].includes(mode)) {
    return [400, { code: "invalid_route" }];
  }
  const target = new URL(
    `https://routing.openstreetmap.de/routed-${mode}/route/v1/driving/${from.join(",")};${to.join(",")}?overview=full&geometries=geojson&generate_hints=false&radiuses=500;500`,
  );
  const data = await lookup(target);
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) return [404, { code: "no_route" }];
  return [
    200,
    {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
    },
  ];
}
