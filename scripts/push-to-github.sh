#!/usr/bin/env bash
# Legacy wrapper — prefer ./scripts/push-live.sh or ./scripts/setup-auto-deploy.sh
set -euo pipefail
exec "$(dirname "$0")/setup-auto-deploy.sh" "${1:-Update wedding site}"
