import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Heart, Copy, Check, ArrowLeft, ShieldCheck } from "lucide-react";
import { Modal } from "./components";
import { donationText } from "./donation-text";
import { projectMissionText } from "./project-mission-text";
import {
  donationWallets,
  donationReady,
  hasSeenDonation,
  rememberDonation,
  shouldOfferDonation,
} from "./donation-config";
import camp from "../server/assets/refuge-camp.jpg";
import "./donations.css";

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
export default function DonationAccess({
  lang,
  t,
  page,
  onEmergency,
  languages,
  onLanguage,
}) {
  const c = donationText[lang] || donationText.en;
  const [seen, setSeen] = useState(() => hasSeenDonation(browserStorage()));
  const [open, setOpen] = useState(false),
    [welcome, setWelcome] = useState(false);
  const [coin, setCoin] = useState("btc");
  const [copied, setCopied] = useState(false),
    [copyError, setCopyError] = useState(false);
  const [copying, setCopying] = useState(false);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    if (shouldOfferDonation(page, seen)) {
      setWelcome(true);
      setOpen(true);
    }
  }, [page, seen]);
  useEffect(() => {
    setCopied(false);
    setCopyError(false);
  }, [coin]);
  const remember = () => {
    setSeen(true);
    setStorageError(!rememberDonation(browserStorage()));
  };
  const close = () => {
    remember();
    setOpen(false);
    setWelcome(false);
  };
  const wallet = donationWallets[coin],
    ready = donationReady(coin);
  const copy = async () => {
    if (!ready || copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    } finally {
      setCopying(false);
    }
  };
  return (
    <>
      <button
        className="donation-top-button"
        onClick={() => {
          setWelcome(false);
          setOpen(true);
        }}
        aria-label={c.button}
        title={c.button}
      >
        <Heart size={16} />
        <span>{c.short}</span>
      </button>
      {open && (
        <Modal title={welcome ? c.first : c.title} t={t} onClose={close}>
          <section className="donation-dialog">
            {welcome ? (
              <>
                <label className="donation-language">
                  {t.language}
                  <select
                    value={lang}
                    onChange={(e) => onLanguage(e.target.value)}
                  >
                    {Object.entries(languages).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <img className="donation-welcome-image" src={camp} alt="" />
                <p className="donation-muted">
                  {(projectMissionText[lang] || projectMissionText.en).intro}
                </p>
                <span className="donation-free-tag">REFUGE · 0</span>
                <h3>{c.title}</h3>
                <p>{c.intro}</p>
                <p className="donation-muted">{c.firstNote}</p>
                <div className="donation-welcome-actions">
                  <button className="donation-zero" onClick={close}>
                    {c.zero}
                  </button>
                  <button
                    className="donation-support"
                    onClick={() => {
                      remember();
                      setWelcome(false);
                    }}
                  >
                    <Heart size={17} />
                    {c.support}
                  </button>
                </div>
                <button
                  className="donation-emergency"
                  onClick={() => {
                    close();
                    onEmergency();
                  }}
                >
                  {c.emergency}
                </button>
              </>
            ) : (
              <>
                <p>{c.intro}</p>
                <div
                  className="donation-coins"
                  role="group"
                  aria-label={c.wallets}
                >
                  {Object.entries(donationWallets).map(([id, w]) => (
                    <button
                      key={id}
                      disabled={copying}
                      className={coin === id ? "active" : ""}
                      aria-pressed={coin === id}
                      onClick={() => setCoin(id)}
                    >
                      {w.symbol}
                    </button>
                  ))}
                </div>
                <div className="donation-wallet">
                  <div className="donation-network">
                    <ShieldCheck size={17} />
                    <strong>
                      {c.network} : {wallet.network}
                    </strong>
                  </div>
                  {coin === "usdt" && (
                    <p className="donation-muted">{c.usdtNote}</p>
                  )}
                  {ready ? (
                    <div className="donation-qr">
                      <QRCodeSVG
                        value={wallet.address}
                        size={180}
                        level="M"
                        marginSize={4}
                        title={c.scan}
                        role="img"
                        aria-label={c.scan}
                      />
                    </div>
                  ) : (
                    <p className="donation-pending" role="status">
                      {c.invalid}
                    </p>
                  )}
                  <span className="donation-address-label">{c.address}</span>
                  <code className="donation-address" dir="ltr">
                    {wallet.address}
                  </code>
                  <button
                    className="donation-copy"
                    disabled={!ready || copying}
                    aria-busy={copying}
                    onClick={copy}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
                    {copied ? c.copied : c.copy}
                  </button>
                  {copyError && (
                    <p role="alert" className="donation-error">
                      {c.copyFailed}
                    </p>
                  )}
                </div>
                <p className="donation-muted">{c.noPayment}</p>
                <p className="donation-muted">{c.offline}</p>
                <p className="donation-thanks">{c.thanks}</p>
                <button className="donation-back" onClick={close}>
                  <ArrowLeft size={16} />
                  {c.back}
                </button>
              </>
            )}
          </section>
        </Modal>
      )}
      {storageError && (
        <span className="sr-only" role="status">
          {c.storage}
        </span>
      )}
    </>
  );
}
