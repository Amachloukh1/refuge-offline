import { useState } from "react";
import LocalStudioAssistant from "./local-studio/Assistant";
import { configureStudio } from "./local-studio/api";
import { studioText } from "./local-studio/text";
import { Icon, Notice } from "./components";
import { guideData } from "./data";
import "./local-studio/embedded.css";
export function Assistant({
  t,
  lang,
  water,
  onRead,
  navigate,
  status,
  planning,
  onStatusRefresh,
}) {
  const [mode, setMode] = useState("local");
  const [busy, setBusy] = useState(false);
  const labels = { ...t, ...studioText[lang] };
  configureStudio({
    language: lang,
    planning,
    mode,
    unavailable: mode === "remote" ? t.remoteUnavailable : t.aiUnavailable,
  });
  return (
    <>
      <section className="panel padded studio-connection">
        <div>
          <strong>Local Studio · REFUGE</strong>
          <p>
            {mode === "local"
              ? status?.available
                ? `${t.aiConnected} · ${status.model}`
                : t.aiNotConnected
              : t.remoteNetwork}
          </p>
        </div>
        <div className="ai-mode-switch" role="group" aria-label={t.aiMode}>
          <button
            onClick={() => setMode("local")}
            disabled={busy}
            aria-pressed={mode === "local"}
            className={mode === "local" ? "active" : ""}
          >
            <Icon name="ShieldCheck" size={16} />
            {t.localMode}
          </button>
          <button
            onClick={() => setMode("remote")}
            disabled={busy}
            aria-pressed={mode === "remote"}
            className={mode === "remote" ? "active" : ""}
          >
            <Icon name="Globe" size={16} />
            {t.remoteMode}
          </button>
        </div>
      </section>
      {mode === "remote" && (
        <Notice tone="warning">
          {status?.remoteConfigured ? t.remoteConsent : t.remoteNotConfigured}
        </Notice>
      )}
      <div className="studio-embedded">
        <LocalStudioAssistant
          t={labels}
          onBusy={setBusy}
          onStatusRefresh={onStatusRefresh}
          models={[
            {
              id: "local-chat-fast",
              label:
                mode === "local"
                  ? status?.model || "Qwen3 4B Instruct"
                  : t.remoteMode,
              kind: "chat",
            },
          ]}
        />
      </div>
      <div className="studio-context two-columns">
        <section className="panel padded">
          <h2>{t.water}</h2>
          <div className="chat-calculation">
            <strong>
              {water.stock} / {water.target} L
            </strong>
            <span>
              {water.missing} L · {t.missing}
            </span>
            <button
              className="text-button"
              onClick={() => navigate("inventory")}
            >
              {t.inventory}
              <Icon name="ArrowRight" size={16} />
            </button>
          </div>
          <p>{t.waterNote}</p>
        </section>
        <section className="panel padded">
          <h2>{t.library}</h2>
          <div className="chat-guides">
            {guideData.slice(0, 3).map((g) => (
              <button key={g.id} onClick={() => onRead(g)}>
                <Icon name={g.icon} size={18} />
                {g.title[lang]}
              </button>
            ))}
          </div>
          <p>{labels.studioPrivacy}</p>
          <p>{t.aiFootnote}</p>
        </section>
      </div>
    </>
  );
}
