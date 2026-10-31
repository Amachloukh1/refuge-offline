// Explicit preparation only. Startup never downloads a model.
const base = process.env.OLLAMA_HOST || "http://127.0.0.1:11479";
const url = new URL(
  "/api/pull",
  base.startsWith("http") ? base : "http://" + base,
);
if (!["127.0.0.1", "[::1]"].includes(url.hostname))
  throw new Error("Local Ollama required");
const response = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ model: "qwen3:4b-instruct-2507-q4_K_M", stream: false }),
});
if (!response.ok)
  throw new Error("Model preparation failed: " + response.status);
console.log(await response.text());
