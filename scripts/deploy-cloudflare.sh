#!/usr/bin/env bash
# Deploy static site to Cloudflare Pages (direct upload, no Git required).
# Requires CLOUDFLARE_API_TOKEN — create at:
# https://dash.cloudflare.com/profile/api-tokens → Create Token → Edit Cloudflare Workers template
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  if [[ -f .env ]]; then
    # shellcheck disable=SC1091
    source .env
  fi
fi

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Set CLOUDFLARE_API_TOKEN in your environment or in .env"
  echo "Create one: https://dash.cloudflare.com/profile/api-tokens"
  exit 1
fi

NODE_DIR="$ROOT/.tools/node-v22.16.0-darwin-arm64/bin"
if [[ ! -x "$NODE_DIR/node" ]]; then
  echo "Run scripts/bootstrap-node.sh first"
  exit 1
fi

export PATH="$NODE_DIR:$PATH"
PROJECT_NAME="${CF_PAGES_PROJECT:-tanandthao}"

echo "Deploying to Cloudflare Pages project: $PROJECT_NAME"
npx --yes wrangler@4 pages deploy "$ROOT" \
  --project-name="$PROJECT_NAME" \
  --branch=main \
  --commit-dirty=true

echo ""
echo "Live at: https://${PROJECT_NAME}.pages.dev"
