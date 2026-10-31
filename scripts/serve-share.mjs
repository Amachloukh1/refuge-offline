import { readFile } from "node:fs/promises";
import { createShareServer } from "../server/share-download.js";
const configFile = process.argv[2];
if (!configFile) throw Error("Choose private share configuration JSON");
const config = JSON.parse(await readFile(configFile, "utf8"));
if (!Number.isInteger(config.port) || config.port < 1024 || config.port > 65535)
  throw Error("Invalid local port");
const server = createShareServer(config);
server.listen(config.port, "127.0.0.1", () =>
  console.log(
    JSON.stringify({
      listening: `http://127.0.0.1:${config.port}`,
      expiresAt: config.expiresAt,
      protected: true,
    }),
  ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });
