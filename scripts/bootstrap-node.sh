#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p .tools

ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
  NODE_ARCH="darwin-arm64"
else
  NODE_ARCH="darwin-x64"
fi

NODE_VER="v22.16.0"
NODE_DIR=".tools/node-${NODE_VER}-${NODE_ARCH}"

if [[ -x "$NODE_DIR/bin/node" ]]; then
  echo "Node already installed at $NODE_DIR"
  exit 0
fi

echo "Downloading Node ${NODE_VER} (${NODE_ARCH})..."
curl -fsSL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-${NODE_ARCH}.tar.gz" \
  -o .tools/node.tar.gz
tar -xzf .tools/node.tar.gz -C .tools
rm .tools/node.tar.gz
echo "Ready: $NODE_DIR/bin/node"
