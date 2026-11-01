import test from "node:test";
import assert from "node:assert/strict";
import {
  donationWallets,
  validDonationAddress,
  donationReady,
  hasSeenDonation,
  rememberDonation,
  shouldOfferDonation,
} from "../src/donation-config.js";
test("donation addresses preserve supplied values and pass network-format checks", () => {
  assert.equal(
    donationWallets.btc.address,
    "bc1qvze9ne7lnwzhtpmwtg6dfh2pv3qr752j3nvtlk",
  );
  assert.equal(
    donationWallets.sol.address,
    "7Pv5wAwoh11Bz34jbBNZ63neXexAuLmXY5Lz842RbSyF",
  );
  assert.equal(
    donationWallets.usdt.address,
    "0x8353B9727D7c6eAB8FC998aB58020030415FdC56",
  );
  for (const [id, w] of Object.entries(donationWallets))
    assert.equal(validDonationAddress(id, w.address), true);
  assert.equal(
    validDonationAddress("btc", donationWallets.btc.address.slice(0, -1) + "q"),
    false,
  );
  assert.equal(validDonationAddress("sol", "0x1234"), false);
  assert.equal(donationReady("btc"), true);
  assert.equal(donationReady("sol"), true);
  assert.equal(donationReady("usdt"), false);
  assert.equal(donationReady("usdt", "Ethereum"), false);
  assert.equal(donationReady("__proto__"), false);
});
test("the optional invitation is remembered locally and never delays direct emergency access", () => {
  const values = new Map();
  const storage = {
    getItem: (k) => values.get(k),
    setItem: (k, v) => values.set(k, v),
  };
  assert.equal(hasSeenDonation(storage), false);
  assert.equal(shouldOfferDonation("home", false), true);
  assert.equal(shouldOfferDonation("emergency", false), false);
  assert.equal(rememberDonation(storage), true);
  assert.equal(shouldOfferDonation("home", hasSeenDonation(storage)), false);
  const blocked = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  assert.equal(hasSeenDonation(blocked), false);
  assert.equal(rememberDonation(blocked), false);
});
