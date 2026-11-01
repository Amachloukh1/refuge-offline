import { bech32, base58 } from "@scure/base";
export const DONATION_SEEN_KEY = "refuge.donation.seen.v1";
export const donationWallets = Object.freeze({
  btc: Object.freeze({
    symbol: "BTC",
    network: "Bitcoin",
    address: "bc1qvze9ne7lnwzhtpmwtg6dfh2pv3qr752j3nvtlk",
  }),
  sol: Object.freeze({
    symbol: "SOL",
    network: "Solana",
    address: "7Pv5wAwoh11Bz34jbBNZ63neXexAuLmXY5Lz842RbSyF",
  }),
  usdt: Object.freeze({
    symbol: "USDT",
    address: "0x8353B9727D7c6eAB8FC998aB58020030415FdC56",
    networks: Object.freeze([]),
  }),
});
export function validDonationAddress(coin, address) {
  try {
    if (coin === "btc") {
      const d = bech32.decode(address);
      return (
        d.prefix === "bc" &&
        d.words[0] === 0 &&
        bech32.fromWords(d.words.slice(1)).length === 20
      );
    }
    if (coin === "sol") return base58.decode(address).length === 32;
    if (coin === "usdt") return /^0x[a-fA-F0-9]{40}$/.test(address);
  } catch {
    return false;
  }
  return false;
}
export function donationReady(coin, network) {
  const wallet = donationWallets[coin];
  return Boolean(
    wallet &&
    validDonationAddress(coin, wallet.address) &&
    (coin !== "usdt" || wallet.networks.includes(network)),
  );
}
export function hasSeenDonation(storage) {
  try {
    return storage.getItem(DONATION_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
export function rememberDonation(storage) {
  try {
    storage.setItem(DONATION_SEEN_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
export function shouldOfferDonation(page, seen) {
  return page === "home" && !seen;
}
