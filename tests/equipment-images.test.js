import test from "node:test";
import assert from "node:assert/strict";
import {
  equipmentImageSource,
  equipmentImageSignature,
} from "../scripts/equipment-image-policy.mjs";
test("local product preparation accepts the official EcoFlow PNG and rejects lookalikes and escaping filenames", () => {
  const item = {
    id: "solar1024",
    url: "https://de.ecoflow.com/cdn/shop/files/DELTA3Classic.png?v=1773391002&width=1240",
    filename: "solar1024.png",
  };
  assert.equal(equipmentImageSource(item).filename, "solar1024.png");
  assert.equal(equipmentImageSource(item).mime, "image/png");
  for (const url of [
    "http://de.ecoflow.com/cdn/shop/files/x.png",
    "https://de.ecoflow.com.evil.test/cdn/shop/files/x.png",
    "https://de.ecoflow.com:8443/cdn/shop/files/x.png",
    "https://user:secret@de.ecoflow.com/cdn/shop/files/x.png",
    "https://de.ecoflow.com/elsewhere/x.png",
  ])
    assert.throws(() => equipmentImageSource({ ...item, url }));
  assert.throws(() =>
    equipmentImageSource({ ...item, filename: "../secret.png" }),
  );
  const amazon = equipmentImageSource({
    id: "radio",
    url: "https://m.media-amazon.com/images/I/example.jpg",
  });
  assert.equal(amazon.filename, "radio.jpg");
  assert.equal(
    equipmentImageSignature(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      "image/png",
    ),
    true,
  );
  assert.equal(
    equipmentImageSignature(Buffer.from("<html>oops</html>"), "image/png"),
    false,
  );
  assert.equal(
    equipmentImageSignature(Buffer.from([255, 216, 255, 0]), "image/jpeg"),
    true,
  );
  assert.equal(
    equipmentImageSignature(Buffer.from([137, 80, 78, 71]), "image/jpeg"),
    false,
  );
});
