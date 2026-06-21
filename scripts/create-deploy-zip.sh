#!/usr/bin/env bash
# Zip site files for Cloudflare Pages dashboard upload (Workers & Pages → Upload assets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/tanandthao-deploy.zip"

rm -f "$OUT"
zip -r "$OUT" \
  index.html \
  rsvp-config.js \
  qr-rsvp.png \
  "Lacasa photo.webp" \
  "Da Lat Pre-shoots" \
  fonts \
  -x "*.DS_Store" -x "*/.*"

echo "Created $OUT"
echo "Upload at: https://dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets"
echo "Project name: tanandthao"
