import { useState, useEffect, useRef } from "react";
import { Icon, External } from "./components";
import { guideData } from "./data";
export function Assistant({
  t,
  lang,
  water,
  onRead,
  navigate,
  status,
  onStatusRefresh,
  planning,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("local");
  const bottom = useRef(null),
    abort = useRef(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  useEffect(() => () => abort.current?.abort(), []);
  async function send(text) {
    if (!text.trim() || busy) return;
    const history = [...messages, { role: "user", content: text.trim() }];
    setMessages(history);
    setInput("");
    if (text.trim() === t.waterPrompt) {
      setMessages([
        ...history,
        { role: "assistant", content: t.aiWater, offline: true, water: true },
      ]);
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const candidates = history
        .filter((m) => m.role === "user" || m.live)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
        .slice(-8);
      const requestMessages = [];
      let size = 0;
      for (const message of candidates.toReversed()) {
        if (size + message.content.length > 9000) break;
        requestMessages.unshift(message);
        size += message.content.length;
      }
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: requestMessages,
          language: lang,
          mode,
          planning,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.code || "unavailable");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          live: true,
          remote: data.remote,
          references: data.references || [],
        },
      ]);
    } catch (error) {
      if (error.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: mode === "remote" ? t.remoteUnavailable : t.aiUnavailable,
          offline: true,
          water: /eau|water|wasser|ماء|مياه/i.test(text),
        },
      ]);
    } finally {
      setBusy(false);
      abort.current = null;
      onStatusRefresh?.();
    }
  }
  function changeMode(next) {
    abort.current?.abort();
    setMode(next);
    setMessages([]);
    setBusy(false);
  }
  return (
    <div className="assistant-layout">
      <section className="panel chat-panel">
        <div className="chat-heading">
          <span className="assistant-avatar">
            <Icon name="MessageCircle" />
          </span>
          <div>
            <strong>{t.assistant}</strong>
            <small>
              {mode === "remote"
                ? t.remoteNetwork
                : status?.available
                  ? `${t.aiConnected} · ${status.model}`
                  : t.aiNotConnected}
            </small>
          </div>
          <button
            className="icon-button"
            aria-label={t.clearChat}
            disabled={busy}
            onClick={() => setMessages([])}
          >
            <Icon name="Trash2" size={19} />
          </button>
        </div>
        <div className="ai-mode-switch" role="group" aria-label={t.aiMode}>
          <button
            className={mode === "local" ? "active" : ""}
            onClick={() => changeMode("local")}
            disabled={busy}
            aria-pressed={mode === "local"}
          >
            <Icon name="ShieldCheck" size={16} />
            {t.localMode}
          </button>
          <button
            className={mode === "remote" ? "active" : ""}
            onClick={() => changeMode("remote")}
            disabled={busy}
            aria-pressed={mode === "remote"}
          >
            <Icon name="Globe" size={16} />
            {t.remoteMode}
          </button>
        </div>
        {mode === "remote" && (
          <div className="remote-notice">
            {status?.remoteConfigured ? t.remoteConsent : t.remoteNotConfigured}
          </div>
        )}
        <div className="messages" aria-live="polite">
          <div className="message assistant-message">
            <Icon name="Leaf" size={22} />
            <div>
              <p>{t.aiIntro}</p>
              <div className="suggestions">
                {["waterPrompt", "guidePrompt", "healthPrompt"].map((k) => (
                  <button key={k} onClick={() => send(t[k])} disabled={busy}>
                    {t[k]}
                    <Icon name="ArrowRight" size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message ${m.role === "user" ? "user-message" : "assistant-message"}`}
            >
              {m.role === "assistant" && <Icon name="Leaf" size={21} />}
              <div>
                <p>{m.content}</p>
                {m.live && (
                  <small className="response-origin">
                    {m.remote ? t.remoteMode : t.localMode}
                  </small>
                )}
                {m.references?.length > 0 && (
                  <div className="chat-guides retrieved-references">
                    {m.references.map((source) => (
                      <a
                        key={source.id}
                        href={source.href}
                        target={source.page ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        <Icon name="BookOpen" size={16} />
                        <span>
                          {source.title}
                          {source.page ? ` · p. ${source.page}` : ""}
                        </span>
                        <Icon name="ChevronRight" size={15} />
                      </a>
                    ))}
                  </div>
                )}
                {m.offline && (
                  <>
                    {m.water && (
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
                    )}
                    <div className="chat-guides">
                      {guideData
                        .filter((g) =>
                          m.water
                            ? g.id === "water"
                            : ["power", "health"].includes(g.id),
                        )
                        .map((g) => (
                          <button onClick={() => onRead(g)} key={g.id}>
                            <Icon name={g.icon} size={18} />
                            {g.title[lang]}
                            <Icon name="ChevronRight" size={16} />
                          </button>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="message assistant-message">
              <Icon name="Leaf" />
              <p>{t.aiWorking}</p>
              <button
                className="text-button"
                onClick={() => {
                  abort.current?.abort();
                  setBusy(false);
                }}
              >
                {t.cancel}
              </button>
            </div>
          )}
          <div ref={bottom} />
        </div>
        <form
          className="chat-input"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            rows="2"
            maxLength="4000"
            aria-label={t.ask}
            placeholder={t.ask}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button
            className="send-button"
            type="submit"
            disabled={!input.trim() || busy}
            aria-label={t.send}
          >
            <Icon name="Send" size={20} />
          </button>
        </form>
        <div className="chat-footnote">{t.aiFootnote}</div>
      </section>
      <aside className="panel padded assistant-context">
        <Icon name="BookOpen" size={30} />
        <h2>{t.library}</h2>
        <p>{t.aiContext}</p>
        {guideData.slice(0, 3).map((g) => (
          <button
            className="context-guide"
            key={g.id}
            onClick={() => onRead(g)}
          >
            <Icon name={g.icon} size={19} />
            <span>{g.title[lang]}</span>
            <Icon name="ChevronRight" size={16} />
          </button>
        ))}
        <div className="context-divider" />
        <Icon name="ShieldCheck" size={25} />
        <p>{t.aiSafety}</p>
        <External href="https://2ki.space/local-studio/#assistant">
          Local Studio · {t.source}
        </External>
      </aside>
    </div>
  );
}
