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
  echo "Please copy the old Flow 0.131 lib files (dom.js, bom.js, cssom.js, etc.)"
  echo "to the flow-libs/ directory."
  exit 1
fi
echo "  flow-libs directory found."

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

# Add flow-libs to [declarations] section
if ! grep -q '<PROJECT_ROOT>/flow-libs/\.\*' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/flow-libs/.*' "$APP_DIR/.flowconfig"
  echo "  Added flow-libs to [declarations] section"
fi

# Add fbjs to [declarations] section
if ! grep -q 'fbjs' "$APP_DIR/.flowconfig"; then
  sed -i '/^\[declarations\]/a <PROJECT_ROOT>/node_modules/fbjs/.*' "$APP_DIR/.flowconfig"
  echo "  Added fbjs to [declarations] section"
fi

# Ensure [lints] section exists
if ! grep -q '^\[lints\]' "$APP_DIR/.flowconfig"; then
  echo "" >> "$APP_DIR/.flowconfig"
  echo "[lints]" >> "$APP_DIR/.flowconfig"
  echo "  Added [lints] section"
fi

echo "  .flowconfig updated."

###############################################################################
# STEP 3: Fix existential type * -> any in src/ files
###############################################################################
echo ""
echo "--- Step 3: Fixing existential type * in src/ files ---"

find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  s/(<[^>]*?)\*([,>])/${1}any${2}/g;
  s/& \*\b/\& any/g;
' {} +

echo "  Done."

###############################################################################
# STEP 4: Fix %checks predicate syntax (removed in new Flow)
###############################################################################
echo ""
echo "--- Step 4: Removing %checks predicate syntax ---"

find "$APP_DIR/src" -name "*.js" -type f -exec sed -i 's/ %checks//g' {} +

echo "  Done."

###############################################################################
# STEP 5: Fix React type name changes
###############################################################################
echo ""
echo "--- Step 5: Fixing React type names ---"

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

echo "  Done."

###############################################################################
# STEP 6: Fix $PropertyType -> indexed access type
###############################################################################
echo ""
echo "--- Step 6: Fixing \$PropertyType usage ---"

find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e "
  s/\\\$PropertyType<([^,]+),\s*'([^']+)'>/\$1['\$2']/g;
  s/\\\$PropertyType<([^,]+),\s*\"([^\"]+)\">/\$1[\"\$2\"]/g;
" {} +

echo "  Done."

###############################################################################
# STEP 7: Fix $FlowExpectedError -> $FlowFixMe[incompatible-type]
###############################################################################
echo ""
echo "--- Step 7: Fixing \$FlowExpectedError and old \$FlowFixMe comments ---"

find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/\$FlowExpectedError(?!\[)/\$FlowFixMe[incompatible-type]/g;
  s/\$FlowExpectedError\[([^\]]+)\]/\$FlowFixMe[$1]/g;
  s/\$FlowFixMe(?!\[)/\$FlowFixMe[incompatible-type]/g;
' {} +

echo "  Done."

###############################################################################
# STEP 8: Fix "renders any" and "renders React.Node/Fragment" patterns
###############################################################################
echo ""
echo "--- Step 8: Fixing renders patterns ---"

find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/renders any/React.Node/g;
  s/ renders React\.Node\b//g;
  s/ renders React\$Node\b//g;
  s/: renders Fragment\b/: React.Node/g;
  s/null \| renders Fragment/React.Node/g;
  s/React\.Node \| renders Fragment/React.Node/g;
  s/=> renders Fragment/=> React.Node/g;
' {} +

echo "  Done."

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
  2>&1 | tail -5 || echo "  codemod completed (with some issues)"

echo "  Codemod complete."

###############################################################################
# STEP 10: Post-codemod fixes
###############################################################################
echo ""
echo "--- Step 10: Post-codemod fixes ---"

# Re-fix renders patterns (codemod may re-introduce them)
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/renders any/React.Node/g;
  s/ renders React\.Node\b//g;
  s/ renders React\$Node\b//g;
  s/: renders Fragment\b/: React.Node/g;
  s/null \| renders Fragment/React.Node/g;
  s/React\.Node \| renders Fragment/React.Node/g;
  s/=> renders Fragment/=> React.Node/g;
' {} +

# Fix broken "as Array<empty>" pattern from codemod in src/ files
# The codemod adds: [] // comment\n as Array<empty>
# This should be: [], // comment
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -0 -e '
  s/\[\]\s*\/\/\s*(.*?)\n\s*as Array<empty>/[], \/\/ $1/g;
' {} +

# Fix broken "as component(...)" patterns from codemod in forwardRef exports
# The codemod adds: React.forwardRef(X) as component(...)
# This should be just: React.forwardRef(X);
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -0 -e '
  s/(React\.forwardRef\([^)]+\))\s*as\s*component\([^)]*\)\s*(?:\{\/\*.*?\*\/\}\s*)?(?:\)\s*React\.Node)?/\1/g;
' {} +

echo "  Post-codemod fixes applied."

###############################################################################
# STEP 11: Remove duplicate $FlowFixMe comments
###############################################################################
echo ""
echo "--- Step 11: Removing duplicate \$FlowFixMe comments ---"

python3 << 'PYEOF'
import os

src_dir = os.path.join(os.environ.get('APP_DIR', os.getcwd()), 'src')
dupes_removed = 0

for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if not fname.endswith('.js'):
            continue
        filepath = os.path.join(root, fname)
        try:
            with open(filepath, 'r') as f:
                lines = f.readlines()
        except:
            continue
        
        modified = False
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()
            if i < len(lines) - 1:
                next_stripped = lines[i + 1].strip()
                if (stripped.startswith('// $FlowFixMe[') and 
                    next_stripped.startswith('// $FlowFixMe[') and
                    stripped == next_stripped):
                    i += 1
                    modified = True
                    dupes_removed += 1
                    continue
            new_lines.append(line)
            i += 1
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(new_lines)

print(f"  Removed {dupes_removed} duplicate FlowFixMe comments")
PYEOF

###############################################################################
# STEP 12: Add $FlowFixMe for remaining errors (iterative)
###############################################################################
echo ""
echo "--- Step 12: Adding \$FlowFixMe for remaining errors ---"

npx flow stop 2>/dev/null || true

for i in 1 2 3 4 5 6 7 8; do
  echo "  Iteration $i..."
  
  # Add FlowFixMe comments
  python3 "$SCRIPT_DIR/add-flow-fixme.py" 2>&1 | grep -E "Added|Found|No" || true
  
  # Convert JSX FlowFixMe comments
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
