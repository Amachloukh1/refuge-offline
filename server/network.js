import { isIP } from "node:net";

function privateIPv4(value) {
  if (isIP(value) !== 4) return false;
  const [first, second] = value.split(".").map(Number);
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168);
}

export function localNetwork(env = process.env) {
  const lanHost = env.REFUGE_LAN_HOST || "";
  if (lanHost && !privateIPv4(lanHost)) throw new Error("REFUGE_LAN_HOST must be a literal private IPv4 address");
  function hostname(value) {
    try {
      if (typeof value !== "string" || !value) return null;
      const url = new URL(`http://${value}`);
      if (url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
      return ["127.0.0.1", "localhost", "[::1]", ...(lanHost ? [lanHost] : [])].includes(url.hostname) ? url.hostname : null;
    } catch { return null; }
  }
  return {
    lanHost,
    listenHost: lanHost ? "0.0.0.0" : "127.0.0.1",
    allows(req) {
      if (!hostname(req.headers.host)) return false;
      const peer = (req.socket.remoteAddress || "").replace(/^::ffff:/, "");
      return peer === "::1" || (isIP(peer) === 4 && Number(peer.split(".")[0]) === 127) || Boolean(lanHost && privateIPv4(peer));
    },
    wikiOrigin(host) {
      return `http://${lanHost && hostname(host) === lanHost ? lanHost : "127.0.0.1"}:8108`;
    },
  };
}
