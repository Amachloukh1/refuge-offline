#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
NODE="$PWD/runtime/linux/node/bin/node"
if [[ -f "$NODE" ]]; then chmod u+x "$NODE"; else NODE="$(command -v node || true)"; fi
if [[ -z "$NODE" ]]; then echo 'Préparer Node.js Linux avant de partir hors ligne.' >&2; exit 1; fi
if [[ ! -f runtime/linux/ollama/.refuge-extracted ]]; then "$NODE" scripts/extract-linux-ollama.mjs; fi
export OLLAMA_HOST=127.0.0.1:11479 OLLAMA_MODELS="$PWD/models" OLLAMA_NO_CLOUD=1
export OLLAMA_CONTEXT_LENGTH=4096 OLLAMA_NUM_PARALLEL=1 OLLAMA_MAX_LOADED_MODELS=1
export CUDA_VISIBLE_DEVICES=-1 OLLAMA_VULKAN=0
export REFUGE_AI_PROVIDER=ollama REFUGE_AI_BASE_URL=http://127.0.0.1:11479/v1 REFUGE_AI_MODEL=qwen3:4b-instruct-2507-q4_K_M
chmod u+x runtime/linux/ollama/bin/ollama
if ! "$NODE" -e "fetch('http://127.0.0.1:11479/api/version').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
  runtime/linux/ollama/bin/ollama serve >runtime/ollama-ubuntu.log 2>&1 &
  echo $! > runtime/ollama-ubuntu.pid
fi
echo 'REFUGE : http://127.0.0.1:8099 — aucun téléchargement au démarrage.'
exec "$NODE" --env-file-if-exists=.env server/index.js
