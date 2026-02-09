#!/bin/bash
set -e

# Flow migration fix script (0.131 -> 0.299)
# This script is idempotent - it can be run multiple times safely.
# It fixes Flow type errors after upgrading from Flow 0.131 to 0.299.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

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
echo "flow-libs directory found."

###############################################################################
# STEP 2: Update .flowconfig  
###############################################################################
echo ""
echo "--- Step 2: Updating .flowconfig ---"

# Add flow-libs to [libs] section if not already there
if ! grep -q 'flow-libs' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[libs\]/a flow-libs' "$APP_DIR/.flowconfig"
  echo "  Added flow-libs to [libs] section"
fi

# Add flow-typed to [declarations] section
if ! grep -q '<PROJECT_ROOT>/flow-typed/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/flow-typed/.*' "$APP_DIR/.flowconfig"
  echo "  Added flow-typed to [declarations] section"
fi

# Add GDevelop.js/types to [declarations] section
if ! grep -q 'GDevelop.js/types/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/../../GDevelop.js/types/.*' "$APP_DIR/.flowconfig"
  echo "  Added GDevelop.js/types to [declarations] section"
fi

# Add flow-libs to [declarations] section (to avoid checking their internals)
if ! grep -q '<PROJECT_ROOT>/flow-libs/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/flow-libs/.*' "$APP_DIR/.flowconfig"
  echo "  Added flow-libs to [declarations] section"
fi

# Add node_modules/fbjs to [declarations] or [ignore]
if ! grep -q 'fbjs' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/node_modules/fbjs/.*' "$APP_DIR/.flowconfig"
  echo "  Added fbjs to [declarations] section"
fi

echo "  .flowconfig updated."

###############################################################################
# STEP 3: Fix existential type * -> any in src/ files
###############################################################################
echo ""
echo "--- Step 3: Fixing existential type * in src/ files ---"

# Fix patterns like: React.Component<*, *> -> React.Component<any, any>  
# and State = {|...|} & * -> State = {|...|} & any
# The * existential type is replaced with 'any'
find "$APP_DIR/src" -name "*.js" -exec perl -pi -e '
  # Replace * in generic type params: <*> <*, *> etc.
  # But only in type contexts (after < and before > or ,)
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  # Replace * after & (intersection types)
  s/& \*\b/\& any/g;
' {} +

echo "  Fixed existential type * in src/ files."

###############################################################################
# STEP 4: Fix %checks predicate syntax (removed in new Flow)
###############################################################################
echo ""
echo "--- Step 4: Removing %checks predicate syntax ---"

find "$APP_DIR/src" -name "*.js" -exec sed -i 's/ %checks//g' {} +

echo "  Removed %checks syntax."

###############################################################################
# STEP 5: Fix React type name changes
###############################################################################
echo ""
echo "--- Step 5: Fixing React type names ---"

# React$Element -> React.Element
find "$APP_DIR/src" -name "*.js" -exec sed -i \
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

echo "  Fixed React type names."

###############################################################################
# STEP 6: Fix $PropertyType -> indexed access type
###############################################################################
echo ""
echo "--- Step 6: Fixing \$PropertyType usage ---"

# $PropertyType<T, 'key'> -> T['key']
find "$APP_DIR/src" -name "*.js" -exec perl -pi -e "
  s/\\\$PropertyType<([^,]+),\s*'([^']+)'>/\$1['\$2']/g;
  s/\\\$PropertyType<([^,]+),\s*\"([^\"]+)\">/\$1[\"\$2\"]/g;
" {} +

echo "  Fixed \$PropertyType usage."

###############################################################################
# STEP 7: Fix value-as-type errors (common patterns)
###############################################################################
echo ""
echo "--- Step 7: Fixing value-as-type patterns ---"

# For imports from pixi.js, three.js, etc. that are used as types,
# we need to use 'typeof' or change 'import' to 'import type'
# This is handled later in the FlowFixMe step since each case is unique

###############################################################################
# STEP 8: Fix import-type-as-value errors  
###############################################################################
echo ""
echo "--- Step 8: Fixing import-type-as-value errors ---"

# This will be handled by the Python script as it requires parsing

###############################################################################
# STEP 9: Run flow codemod annotate-exports
###############################################################################
echo ""
echo "--- Step 9: Running flow codemod annotate-exports ---"

npx flow stop 2>/dev/null || true
npx flow codemod annotate-exports \
  --write \
  --max-type-size 50 \
  --default-any \
  "$APP_DIR/src" \
  2>&1 | tail -10 || echo "  annotate-exports codemod completed (with some issues)"

echo "  Codemod complete."

###############################################################################
# STEP 10: Add $FlowFixMe for remaining errors
###############################################################################
echo ""
echo "--- Step 10: Adding \$FlowFixMe for remaining errors ---"

npx flow stop 2>/dev/null || true

# Run multiple iterations since fixing one error can reveal others
for i in 1 2 3; do
  echo "  Iteration $i..."
  python3 "$SCRIPT_DIR/add-flow-fixme.py"
  
  # Check if there are still errors
  ERROR_COUNT=$(npx flow --json 2>&1 | python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read().split('\n')[-1] if '{' not in sys.stdin.read() else sys.stdin.read())
    print(len(data.get('errors', [])))
except:
    print('unknown')
" 2>/dev/null || echo "unknown")
  
  if [ "$ERROR_COUNT" = "0" ]; then
    echo "  No more errors!"
    break
  fi
  echo "  Remaining errors: $ERROR_COUNT"
done

echo ""
echo "=== Flow Migration Fix Script Complete ==="
echo "Run 'npm run flow' to check for remaining errors."
