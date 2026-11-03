import test from "node:test";
import assert from "node:assert/strict";
import { createLocalId } from "../src/local-id.js";
test("inventory and saved-place IDs work over HTTP LAN without crypto.randomUUID", () => {
  const id = createLocalId({ getRandomValues(bytes) { bytes.fill(18); return bytes; } });
  assert.equal(id, "12121212-1212-4212-9212-121212121212");
  assert.equal(createLocalId({ randomUUID: () => "native-uuid" }), "native-uuid");
});
