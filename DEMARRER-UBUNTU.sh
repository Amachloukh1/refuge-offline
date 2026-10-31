#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null; then
  echo 'Installer Node.js 22.12+ ou 24 pendant que vous avez Internet.' >&2
  exit 1
fi
node --env-file-if-exists=.env server/index.js
