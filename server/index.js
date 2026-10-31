import { createApp } from "./app.js";
const port = Number(process.env.REFUGE_PORT || 8099);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid REFUGE_PORT");
const server = createApp();
server.listen(port, "127.0.0.1", () =>
  console.log(
    `REFUGE : http://127.0.0.1:${port} — accès local, aucun service Internet requis.`,
  ),
);
server.on("error", () => {
  console.error(
    "Démarrage impossible : vérifiez le port et la configuration locale.",
  );
  process.exitCode = 1;
});
