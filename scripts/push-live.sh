#!/usr/bin/env bash
# Push local edits live via GitHub → Cloudflare auto-deploy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MSG="${1:-Update wedding site}"

if command -v git >/dev/null 2>&1 && [[ -d .git ]]; then
  git add -A
  git diff --cached --quiet && { echo "Nothing to commit."; exit 0; }
  git commit -m "$MSG"
  git push
  echo "Pushed. Cloudflare will redeploy in ~1–2 min."
  exit 0
fi

bash "$ROOT/scripts/setup-auto-deploy.sh" "$MSG"
