#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$project_dir"
if [[ "$(uname -s)" != Linux ]]; then echo 'Exécuter ce script sur Ubuntu.' >&2; exit 1; fi
if ! command -v node >/dev/null || ! node -e 'if(Number(process.versions.node.split(".")[0])<22)process.exit(1)'; then
  echo 'Node.js 22.12+ ou 24 est nécessaire pour préparer le projet. Installer Node depuis https://nodejs.org/ puis relancer.' >&2
  exit 1
fi
npm ci --no-audit --no-fund
npm run build
node scripts/fetch-content.mjs
if [[ ! -e .env ]]; then cp .env.example .env; chmod 600 .env; fi
echo 'Interface et PDF prêts. Préparer ensuite le moteur et le modèle locaux avant de couper Internet.'
echo 'Avec Ollama déjà installé : ollama pull qwen3:4b'
echo 'Démarrer : npm start ; ouvrir http://127.0.0.1:8099'
