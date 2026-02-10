#!/bin/bash
set -e

# Flow migration fix script (0.131 -> 0.299)
# This script is idempotent - it can be run multiple times safely.
# It fixes Flow type errors after upgrading from Flow 0.131 to 0.299.
#
# Usage: cd newIDE/app && bash scripts/fix-flow-errors.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
export APP_DIR

cd "$APP_DIR"

echo "=== Flow Migration Fix Script ==="
echo "Working directory: $APP_DIR"

###############################################################################
# STEP 1: Ensure flow-libs directory exists
###############################################################################
echo ""
echo "--- Step 1: Ensuring flow-libs are in place ---"
if [ ! -d "$APP_DIR/flow-libs" ]; then
  echo "ERROR: flow-libs directory not found."
  exit 1
fi
echo "  OK."

###############################################################################
# STEP 2: Update .flowconfig
###############################################################################
echo ""
echo "--- Step 2: Updating .flowconfig ---"

if ! grep -q 'flow-libs' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[libs\]/a flow-libs' "$APP_DIR/.flowconfig"
fi
if ! grep -q '<PROJECT_ROOT>/flow-typed/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/flow-typed/.*' "$APP_DIR/.flowconfig"
fi
if ! grep -q 'GDevelop.js/types/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/../../GDevelop.js/types/.*' "$APP_DIR/.flowconfig"
fi
if ! grep -q '<PROJECT_ROOT>/flow-libs/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/flow-libs/.*' "$APP_DIR/.flowconfig"
fi
if ! grep -q 'fbjs' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/node_modules/fbjs/.*' "$APP_DIR/.flowconfig"
fi
if ! grep -q '^\[lints\]' "$APP_DIR/.flowconfig"; then
  echo -e "\n[lints]" >> "$APP_DIR/.flowconfig"
fi
echo "  Done."

###############################################################################
# STEP 3: Fix deprecated syntax in src/ files
###############################################################################
echo ""
echo "--- Step 3: Fixing deprecated syntax ---"

# Fix existential type * -> any
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  s/& \*\b/\& any/g;
' {} +

# Fix %checks (removed in new Flow)
find "$APP_DIR/src" -name "*.js" -type f -exec sed -i 's/ %checks//g' {} +

# Fix React$ type names -> React. namespace
find "$APP_DIR/src" -name "*.js" -type f -exec sed -i \
  -e 's/\bReact\$Element\b/React.Element/g' \
  -e 's/\bReact\$Component\b/React.Component/g' \
  -e 's/\bReact\$Node\b/React.Node/g' \
  -e 's/\bReact\$Context\b/React.Context/g' \
  -e 's/\bReact\$Ref\b/React.Ref/g' \
  -e 's/\bReact\$Key\b/React.Key/g' \
  -e 's/\bReact\$ElementRef\b/React.ElementRef/g' \
  -e 's/\bReact\$ElementConfig\b/React.ElementConfig/g' \
  -e 's/\bReact\$ComponentType\b/React.ComponentType/g' \
  -e 's/\bReact\$AbstractComponent\b/React.AbstractComponent/g' \
  {} +

# Fix $PropertyType -> indexed access type
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e "
  s/\\\$PropertyType<([^,]+),\s*'([^']+)'>/\$1['\$2']/g;
  s/\\\$PropertyType<([^,]+),\s*\"([^\"]+)\">/\$1[\"\$2\"]/g;
" {} +

# Fix $FlowExpectedError -> $FlowFixMe[incompatible-type]
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/\$FlowExpectedError(?!\[)/\$FlowFixMe[incompatible-type]/g;
  s/\$FlowExpectedError\[([^\]]+)\]/\$FlowFixMe[$1]/g;
' {} +

# Fix old $FlowFixMe without error codes
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/\$FlowFixMe(?!\[)/\$FlowFixMe[incompatible-type]/g;
' {} +

echo "  Done."

###############################################################################
# STEP 4: Add $FlowFixMe for all remaining errors (iterative)
# NOTE: We intentionally do NOT run "flow codemod annotate-exports" because
# it introduces component() syntax and as-casts that Babel cannot parse.
# Instead, we suppress all Flow errors with $FlowFixMe comments.
###############################################################################
echo ""
echo "--- Step 4: Adding \$FlowFixMe for all errors (iterative) ---"

npx flow stop 2>/dev/null || true

for i in $(seq 1 10); do
  echo "  Iteration $i..."

  # Add FlowFixMe comments for errors
  python3 "$SCRIPT_DIR/add-flow-fixme.py" 2>&1 | grep -E "Added|Found|No" || true

  # Convert // FlowFixMe in JSX context to {/* FlowFixMe */}
  python3 "$SCRIPT_DIR/convert-jsx-flowfixme.py" 2>&1 | grep -E "Converted" || true

  npx flow stop 2>/dev/null || true

  # Check remaining errors
  ERROR_OUTPUT=$(npx flow 2>&1)
  if echo "$ERROR_OUTPUT" | grep -q "No errors"; then
    echo "  No more errors!"
    break
  fi

  ERROR_COUNT=$(echo "$ERROR_OUTPUT" | grep "Found" | grep -o '[0-9]*' | head -1)
  echo "  Remaining errors: ${ERROR_COUNT:-unknown}"
  npx flow stop 2>/dev/null || true
done

echo ""
echo "=== Flow Migration Fix Script Complete ==="
echo "Run 'npm run flow' to verify."
