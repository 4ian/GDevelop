#!/usr/bin/env sh
# Standalone tests for copy-events-as-JSON pretty-print helpers.
# Runs with Node 22's built-in test runner (no Babel, no newIDE node_modules).
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SPEC="$REPO_ROOT/newIDE/app/src/EventsSheet/EventsJsonPrettyPrint.spec.cjs"

if [ -x /home/box/.local/node-v22/bin/node ]; then
  NODE=/home/box/.local/node-v22/bin/node
elif command -v node >/dev/null 2>&1; then
  NODE=$(command -v node)
else
  echo "FAIL: node not found" >&2
  exit 1
fi

echo "node: $NODE"
"$NODE" --version
echo "command: $NODE --test $SPEC"

if "$NODE" --test "$SPEC"; then
  echo "PASS: copy events as JSON pretty-print tests"
  exit 0
fi

echo "FAIL: copy events as JSON pretty-print tests" >&2
exit 1
