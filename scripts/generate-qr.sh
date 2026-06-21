#!/usr/bin/env bash
# Generates qr-rsvp.png from SITE_URL in rsvp-config.js (or pass URL as arg).
set -euo pipefail

cd "$(dirname "$0")/.."
URL="${1:-}"

if [[ -z "$URL" ]]; then
  URL=$(grep -o "SITE_URL: '[^']*'" rsvp-config.js | sed "s/SITE_URL: '//;s/'$//")
  URL="${URL}#rsvp"
fi

ENCODED=$(ruby -ruri -e "puts URI.encode_www_form_component('$URL')")
curl -fsSL "https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=20&data=${ENCODED}" -o qr-rsvp.png

echo "Saved qr-rsvp.png → $URL"
