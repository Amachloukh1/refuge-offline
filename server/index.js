import { createApp } from "./app.js";
import { createWikiServer } from "./wiki.js";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";
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
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (
  existsSync(
    path.join(root, "content/wiki-reader/kiwix-js-4.4.0/dist/index.html"),
  )
) {
  const wiki = createWikiServer(root);
  wiki.listen(8108, "127.0.0.1", () =>
    console.log("Kiwix local : http://127.0.0.1:8108"),
  );
  wiki.on("error", () =>
    console.error("Le lecteur Kiwix ne peut pas utiliser le port 8108."),
  );
}
