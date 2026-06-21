#!/usr/bin/env bash
# One-time setup + push to GitHub (no system git required).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NODE_BIN="$ROOT/.tools/node-v22.16.0-darwin-arm64/bin"
if [[ ! -x "$NODE_BIN/node" ]]; then
  bash "$ROOT/scripts/bootstrap-node.sh"
fi
export PATH="$NODE_BIN:$PATH"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo ""
  echo "Created .env — edit it now:"
  echo "  GITHUB_USERNAME=your-github-username"
  echo "  GITHUB_TOKEN=ghp_..."
  echo ""
  echo "Create token: https://github.com/settings/tokens (check 'repo' scope)"
  exit 1
fi

npm install --silent
node scripts/push-to-github.mjs "${1:-Update wedding site}"

echo ""
echo "Next: connect Cloudflare Pages to this repo (see SETUP-AUTO-DEPLOY.txt)"
