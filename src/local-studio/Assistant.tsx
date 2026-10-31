// Adapted from Nexus Local Studio, commit 1c1a86cd3d4540fd9bca5e383fed013aee9227ea.
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Check,
  Copy,
  MessageCircle,
  Plus,
  Clock,
  X,
  Paperclip,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { api, Job, Message, Model, pending, statusLabel, Thread } from "./api";

import { upload } from "./uploads";
import { snapshotStudio } from "./api";

function CopyButton({ content, t }: { content: string; t: any }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="text-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(content);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
      {copied ? t.copied : t.copyText}
    </button>
  );
}

export default function Assistant({
  models,
  t,
  onBusy,
  onStatusRefresh,
}: {
  models: Model[];
  t: any;
  onBusy?: (busy: boolean) => void;
  onStatusRefresh?: () => void;
}) {
  const [threads, setThreads] = useState<{ id: string; title: string }[]>([]),
    [thread, setThread] = useState<Thread | null>(null);
  const [content, setContent] = useState(""),
    [model, setModel] = useState("local-chat-fast"),
    [job, setJob] = useState<Job | null>(null);
  const [sending, setSending] = useState(false),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null),
    currentThread = useRef<string | null>(null),
    navigation = useRef(0);
  const documentInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const refresh = useRef(onStatusRefresh);
  refresh.current = onStatusRefresh;
  useEffect(() => {
    onBusy?.(sending || loading || pending(job));
  }, [sending, loading, job?.status, onBusy]);
  useEffect(() => {
    if (job && ["completed", "failed", "cancelled"].includes(job.status))
      refresh.current?.();
  }, [job?.id, job?.status]);
  const [showTrash, setShowTrash] = useState(false),
    [changing, setChanging] = useState<string | null>(null);
  function appendText(text: string) {
    setContent((current) => {
      const next = [current, text].filter(Boolean).join("\n\n");
      if (next.length > 4000) {
        setError(t.studioTooLong);
        return current;
      }
      return next;
    });
  }
  async function importDocument(file?: File) {
    if (!file || importing) return;
    const generation = navigation.current;
    setImporting(true);
    setError("");
    try {
      const result = await upload(file);
      if (navigation.current === generation)
        appendText("[Document : " + file.name + "]\n" + result.text);
    } catch (e) {
      if (navigation.current === generation) setError((e as Error).message);
    } finally {
      setImporting(false);
      if (documentInput.current) documentInput.current.value = "";
    }
  }
  async function loadThreads() {
    setThreads(
      await api("/api/conversations" + (showTrash ? "?deleted=true" : "")),
    );
  }
  async function changeConversation(id: string, restore = false) {
    setChanging(id);
    setError("");
    try {
      await api(
        "/api/conversations/" + id + (restore ? "/restore" : ""),
        restore ? "POST" : "DELETE",
      );
      if (!restore && currentThread.current === id) fresh();
      setThreads((items) => items.filter((item) => item.id !== id));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChanging(null);
    }
  }
  async function select(id: string) {
    const generation = ++navigation.current;
    currentThread.current = id;
    setError("");
    setJob(null);
    setThread(null);
    setLoading(true);
    try {
      const data = await api<Thread>("/api/conversations/" + id);
      if (navigation.current !== generation) return;
      setThread(data);
      if (data.active_job) {
        const active = await api<Job>("/v1/jobs/" + data.active_job);
        if (navigation.current !== generation) return;
        if (active.status === "completed") {
          const completed = await api<Thread>("/api/conversations/" + id);
          if (navigation.current !== generation) return;
          setThread(completed);
        }
        setJob(active);
      }
    } catch (e) {
      if (navigation.current === generation) setError((e as Error).message);
    } finally {
      if (navigation.current === generation) setLoading(false);
    }
  }
  useEffect(() => {
    loadThreads().catch((e) => setError(e.message));
  }, [showTrash]);
  useEffect(() => {
    if (!job || !pending(job)) return;
    const id = job.id;
    let alive = true;
    const timer = setInterval(async () => {
      try {
        const fresh = await api<Job>("/v1/jobs/" + id);
        if (!alive) return;
        if (
          fresh.status === "completed" &&
          fresh.conversation_id &&
          currentThread.current === fresh.conversation_id
        ) {
          const data = await api<Thread>(
            "/api/conversations/" + fresh.conversation_id,
          );
          if (alive) setThread(data);
        }
        if (alive) setJob(fresh);
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    }, 700);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [job?.id, job?.status]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [job?.partial, thread?.messages.length]);
  function fresh() {
    navigation.current++;
    currentThread.current = null;
    setThread(null);
    setJob(null);
    setContent("");
    setLoading(false);
    setError("");
    setShowTrash(false);
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || sending || loading || importing || pending(job))
      return;
    const generation = navigation.current;
    const requestContext = snapshotStudio();
    setSending(true);
    setError("");
    const text = content.trim();
    try {
      let id = thread?.id;
      if (!id) {
        const created = await api<{ id: string }>(
          "/api/conversations",
          "POST",
          { title: text.slice(0, 70) },
        );
        if (navigation.current !== generation) return;
        id = created.id;
        currentThread.current = id;
      }
      const created = await api<Job>(
        "/api/chat",
        "POST",
        {
          conversation_id: id,
          content: text,
          model,
        },
        requestContext,
      );
      if (navigation.current !== generation) return;
      const data = await api<Thread>("/api/conversations/" + id);
      if (navigation.current !== generation) return;
      setContent("");
      setThread(data);
      setJob(created);
      await loadThreads();
    } catch (e) {
      if (navigation.current === generation) setError((e as Error).message);
    } finally {
      setSending(false);
    }
  }
  const messages: Message[] = thread?.messages || [];
  return (
    <>
      <header className="page-header">
        <div>
          <h2>Local Studio</h2>
          <p>{t.studioLocalNotice}</p>
        </div>
        <label className="model-picker">
          <span className="sr-only">{t.assistantModel}</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={pending(job)}
          >
            {models
              .filter((m) => m.kind === "chat")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
          </select>
        </label>
      </header>
      <div className="chat-layout">
        <section className="thread-list" aria-label={t.conversations}>
          <button className="primary new-chat" onClick={fresh}>
            <Plus size={19} /> {t.newConversation}
          </button>
          <h2>{showTrash ? t.trash : t.recentConversations}</h2>
          <button
            className="text-button"
            onClick={() => setShowTrash(!showTrash)}
          >
            <Trash2 size={15} />
            {showTrash ? t.backConversations : t.openTrash}
          </button>
          {!threads.length && (
            <p className="helper">
              {showTrash ? t.trashEmpty : t.noConversations}
            </p>
          )}
          {threads.map((item) => (
            <div className="thread-row" key={item.id}>
              <button
                className={
                  "thread-item " + (thread?.id === item.id ? "selected" : "")
                }
                onClick={() => {
                  if (!showTrash) void select(item.id);
                }}
                disabled={showTrash}
              >
                <MessageCircle size={17} />
                <span>{item.title}</span>
              </button>
              <button
                className="icon-button thread-delete"
                title={showTrash ? t.restore : t.remove}
                aria-label={
                  (showTrash ? t.restorePrefix : t.removePrefix) + item.title
                }
                disabled={changing !== null || sending || importing}
                onClick={() => void changeConversation(item.id, showTrash)}
              >
                {showTrash ? <RotateCcw size={16} /> : <Trash2 size={16} />}
              </button>
            </div>
          ))}
        </section>
        <section className="chat-main" aria-label="Assistant">
          <div className="conversation panel">
            <div className="conversation-title">
              {loading
                ? t.openingConversation
                : thread?.title || t.studioWelcome}
              <span className="local-label">{t.studioEmbedded}</span>
            </div>
            {!messages.length && !loading && (
              <div className="empty-chat">
                <span className="assistant-avatar large">N</span>
                <h2>{t.studioWelcome}</h2>
                <p>{t.aiIntro}</p>
                <div className="suggestions">
                  {[t.waterPrompt, t.guidePrompt, t.healthPrompt].map(
                    (text) => (
                      <button key={text} onClick={() => setContent(text)}>
                        {text}
                        <ArrowUp size={16} />
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
            <div className="messages">
              {messages.map((m, i) => (
                <article key={i} className={"message " + m.role}>
                  <span
                    className={
                      "message-avatar " +
                      (m.role === "user" ? "user-avatar" : "assistant-avatar")
                    }
                  >
                    {m.role === "user" ? t.you : "N"}
                  </span>
                  <div className="message-body">
                    <div className="message-content" dir="auto">
                      {m.content}
                    </div>
                    {m.role === "assistant" && (
                      <>
                        <small className="response-origin">
                          {m.remote ? t.remoteMode : t.localMode}
                        </small>
                        <div className="studio-references">
                          {m.references?.map((r: any) => (
                            <a key={r.id} href={r.href}>
                              {r.title}
                              {r.page ? ` · p. ${r.page}` : ""}
                            </a>
                          ))}
                        </div>
                        <CopyButton t={t} content={m.content} />
                      </>
                    )}
                  </div>
                </article>
              ))}
              {job?.partial && pending(job) && (
                <article className="message assistant">
                  <span className="assistant-avatar message-avatar">N</span>
                  <div className="message-body">
                    <div className="message-content" dir="auto">
                      {job.partial}
                      <span className="stream-cursor" />
                    </div>
                  </div>
                </article>
              )}
              <div ref={end} />
            </div>
          </div>
          {job && (
            <div
              className={
                "job-status " + (job.status === "failed" ? "failed" : "")
              }
              role="status"
            >
              <Clock size={17} />
              <span>
                {statusLabel(job, t)}
                {job.position ? ` · position ${job.position}` : ""}
                {job.error ? " · " + t.aiUnavailable : ""}
                {job.result?.finish_reason === "length"
                  ? t.responseLimited
                  : ""}
              </span>
              {pending(job) && (
                <button
                  className="text-button"
                  onClick={async () => {
                    const generation = navigation.current;
                    const id = job.id;
                    try {
                      await api("/v1/jobs/" + id + "/cancel", "POST");
                      if (navigation.current !== generation) return;
                      const cancelled = await api<Job>("/v1/jobs/" + id);
                      if (navigation.current === generation) setJob(cancelled);
                    } catch (e) {
                      if (navigation.current === generation)
                        setError((e as Error).message);
                    }
                  }}
                >
                  <X size={14} />
                  {t.cancel}
                </button>
              )}
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <form className="composer panel" onSubmit={send}>
            <div className="composer-tools">
              <input
                ref={documentInput}
                type="file"
                accept=".txt,.pdf"
                className="sr-only"
                aria-label={t.assistantDocument}
                onChange={(e) => void importDocument(e.target.files?.[0])}
              />
              <button
                type="button"
                className="secondary"
                disabled={importing || loading || sending || pending(job)}
                onClick={() => documentInput.current?.click()}
              >
                <Paperclip size={17} />
                {importing ? t.readingDocument : t.attachDocument}
              </button>
            </div>
            <label className="sr-only" htmlFor="message">
              {t.ask}
            </label>
            <textarea
              id="message"
              placeholder={
                model === "local-translate"
                  ? "Indique la langue cible, puis le texte à traduire…"
                  : t.ask
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={4000}
              rows={2}
              disabled={loading}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  if (content.trim() && !pending(job) && !sending)
                    e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button
              className="primary send-button"
              disabled={
                !content.trim() ||
                pending(job) ||
                sending ||
                loading ||
                importing
              }
              aria-label={t.send}
            >
              <ArrowUp size={21} />
              <span>{sending ? t.sending : t.send}</span>
            </button>
          </form>
          <p className="composer-hint">{t.studioHint}</p>
        </section>
      </div>
    </>
  );
}
