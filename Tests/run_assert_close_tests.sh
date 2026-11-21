#!/usr/bin/env bash
# Run the standalone Node tests for harness.assertClose helpers.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/home/box/.local/node-v22/bin:/usr/local/bin:${PATH}"

if [[ -x /home/box/.local/node-v22/bin/node ]]; then
  NODE="/home/box/.local/node-v22/bin/node"
elif command -v node >/dev/null 2>&1; then
  NODE="$(command -v node)"
else
  echo "node not found on PATH" >&2
  exit 1
fi

exec "$NODE" --test "$ROOT/Tests/assert-close.test.js"
