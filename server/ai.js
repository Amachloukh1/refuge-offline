import { guideData } from "../src/data.js";
import { hazardReferences } from "./references.js";
export function aiConfig(env = process.env) {
  const provider = env.REFUGE_AI_PROVIDER || "ollama";
  if (!["ollama", "studio", "openai-local"].includes(provider))
    throw new Error("Unsupported local provider");
  const url = new URL(
    env.REFUGE_AI_BASE_URL ||
      (provider === "studio"
        ? "http://127.0.0.1:8090/local-studio/v1"
        : "http://127.0.0.1:11434/v1"),
  );
  // Literal loopback avoids DNS rebinding. Remote cloud has no fallback path.
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Only literal loopback HTTP inference endpoints are supported",
    );
  const model =
    env.REFUGE_AI_MODEL ||
    (provider === "studio" ? "local-chat-fast" : "qwen3:4b");
  if (
    !/^[a-zA-Z0-9_.:/-]{1,100}$/.test(model) ||
    model.toLowerCase().includes("cloud")
  )
    throw new Error("Invalid local model");
  return {
    provider,
    base: url.href.replace(/\/$/, ""),
    model,
    key: env.REFUGE_AI_KEY || "",
  };
}
export function remoteStudioConfig(env = process.env) {
  if (!env.REFUGE_REMOTE_STUDIO_KEY) return null;
  return {
    provider: "studio",
    base: "https://2ki.space/local-studio/v1",
    model: env.REFUGE_REMOTE_STUDIO_MODEL || "local-chat-fast",
    key: env.REFUGE_REMOTE_STUDIO_KEY,
    remote: true,
  };
}
export function validateMessages(messages) {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 20 &&
    messages.at(-1)?.role === "user" &&
    messages.every(
      (m) =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        m.content.length <= 4000,
    ) &&
    messages.reduce((n, m) => n + m.content.length, 0) <= 10000
  );
}
function headers(config) {
  return {
    "Content-Type": "application/json",
    ...(config.key ? { Authorization: `Bearer ${config.key}` } : {}),
  };
}
export async function status(config) {
  try {
    const response = await fetch(`${config.base}/models`, {
      headers: headers(config),
      redirect: "error",
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok)
      return {
        available: false,
        provider: config.provider,
        model: config.model,
      };
    const data = await response.json();
    return {
      available:
        Array.isArray(data.data) &&
        data.data.some((m) => m.id === config.model && m.available !== false),
      provider: config.provider,
      model: config.model,
    };
  } catch {
    return { available: false, provider: config.provider, model: config.model };
  }
}
export async function completeChat(
  config,
  messages,
  language,
  fetcher = fetch,
  signal,
) {
  if (!validateMessages(messages)) throw new Error("invalid_messages");
  const lang = ["fr", "de", "en", "ar"].includes(language) ? language : "fr";
  const sources =
    guideData
      .map(
        (g) =>
          `[${g.id}] ${g.title[lang]} (${g.publisher}, ${g.url})\n${g.body[lang].join("\n")}`,
      )
      .join("\n\n") +
    "\n\n" +
    hazardReferences(messages.at(-1).content, lang);
  const system = `You are REFUGE, a civilian preparedness assistant running locally. Answer in ${lang}. Use the preparation summaries below and cite their IDs such as [power]. They are summaries, not complete manuals. Do not invent a source, medical diagnosis, prescription or drug dose. For medical emergencies explain that professional emergency help is needed; Germany uses 112 for life-threatening emergencies if the network works. Do not claim live weather, news, stock quantities or positions. You do not have tools or access to other files. Admit when the supplied references are insufficient. Keep answers concise.\n\nREFERENCE SUMMARIES:\n${sources}`;
  const response = await fetcher(`${config.base}/chat/completions`, {
    method: "POST",
    headers: headers(config),
    redirect: "error",
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(120000)])
      : AbortSignal.timeout(120000),
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "system", content: system }, ...messages],
      stream: false,
      max_tokens: 512,
      temperature: 0.2,
      ...(config.provider === "ollama" ? { options: { num_ctx: 4096 } } : {}),
    }),
  });
  if (!response.ok) throw new Error("engine_unavailable");
  const raw = await response.text();
  if (raw.length > 100000) throw new Error("response_too_large");
  const answer = JSON.parse(raw)?.choices?.[0]?.message?.content;
  if (typeof answer !== "string" || !answer.trim() || answer.length > 12000)
    throw new Error("invalid_response");
  return answer;
}
