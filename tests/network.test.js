import test from "node:test";
import assert from "node:assert/strict";
import { localNetwork } from "../server/network.js";
import { createApp } from "../server/app.js";
import { createWikiServer } from "../server/wiki.js";
import { fileURLToPath } from "node:url";
import http from "node:http";

function requestHost(url, headers) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers, agent: false }, res => {
      res.resume();
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers }));
    }).on("error", reject);
  });
}

const request = (host, remoteAddress = "127.0.0.1") => ({
  headers: { host }, socket: { remoteAddress },
});

test("LAN access is opt-in, limited to the configured private IP and private peers", () => {
  const closed = localNetwork({});
  assert.equal(closed.listenHost, "127.0.0.1");
  assert.equal(closed.allows(request("192.168.178.50:8099")), false);
  const lan = localNetwork({ REFUGE_LAN_HOST: "192.168.178.50" });
  assert.equal(lan.listenHost, "0.0.0.0");
  assert.equal(lan.allows(request("192.168.178.50:8099", "::ffff:192.168.178.49")), true);
  assert.equal(lan.allows(request("127.0.0.1:8099")), true);
  for (const host of ["evil.example:8099", "192.168.178.51:8099", "user@192.168.178.50", "192.168.178.50/path", "192.168.178.50#x"])
    assert.equal(lan.allows(request(host)), false);
  assert.equal(lan.allows(request("192.168.178.50:8099", "203.0.113.2")), false);
  assert.equal(lan.wikiOrigin("192.168.178.50:8099"), "http://192.168.178.50:8108");
  assert.equal(lan.wikiOrigin("localhost:8099"), "http://127.0.0.1:8108");
  for (const host of ["0.0.0.0", "203.0.113.2", "localhost", "192.168.178.999", "192.168.178.50:8099"])
    assert.throws(() => localNetwork({ REFUGE_LAN_HOST: host }));
});

test("application and isolated wiki accept configured LAN Host but reject foreign origins", async () => {
  const network = localNetwork({ REFUGE_LAN_HOST: "192.168.178.50" });
  const app = createApp({ network });
  const wiki = createWikiServer(fileURLToPath(new URL("../", import.meta.url)), { network });
  for (const server of [app, wiki]) await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const base = `http://127.0.0.1:${app.address().port}`;
    const host = `192.168.178.50:${app.address().port}`;
    const response = await requestHost(base + "/api/resources", { Host: host });
    assert.equal(response.status, 200);
    assert.match(response.headers["content-security-policy"], /frame-src http:\/\/192\.168\.178\.50:8108/);
    assert.equal((await requestHost(base + "/api/resources", { Host: host, Origin: "http://evil.example" })).status, 403);
    assert.equal((await requestHost(base + "/api/resources", { Host: "evil.example" })).status, 403);
    const wikiBase = `http://127.0.0.1:${wiki.address().port}`;
    assert.equal((await requestHost(wikiBase + "/archives/catalog.json", { Host: "192.168.178.50:8108" })).status, 200);
    assert.equal((await requestHost(wikiBase + "/archives/catalog.json", { Host: "evil.example" })).status, 403);
  } finally {
    for (const server of [app, wiki]) await new Promise(resolve => server.close(resolve));
  }
});
