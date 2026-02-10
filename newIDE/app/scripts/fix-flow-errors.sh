#!/bin/bash
set -e

# Flow migration fix script (0.131 -> 0.299)
# This script is idempotent - it can be run multiple times safely.
# It fixes Flow type errors after upgrading from Flow 0.131 to 0.299.
#
# NOTE: We DO run "flow codemod annotate-exports", then normalize the
# generated modern syntax (component()/renders/as-casts) back to
# Babel-compatible Flow syntax.
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
# STEP 4: Run annotate-exports and normalize syntax
###############################################################################
echo ""
echo "--- Step 4: Running Flow codemod annotate-exports ---"

npx flow stop 2>/dev/null || true

for i in $(seq 1 5); do
  echo "  Codemod iteration $i..."
  set +e
  CODEMOD_OUTPUT=$(npx flow codemod annotate-exports --write --default-any src 2>&1)
  CODEMOD_EXIT=$?
  set -e

  echo "$CODEMOD_OUTPUT" | grep -E \
    "Files changed:|Number of annotations added:|Number of sig\. ver\. errors:|Number of annotations required:" || true

  if [ $CODEMOD_EXIT -ne 0 ]; then
    echo "  WARNING: annotate-exports exited with status $CODEMOD_EXIT"
    break
  fi

  FILES_CHANGED=$(echo "$CODEMOD_OUTPUT" | sed -n 's/.*Files changed:[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -n 1)
  if [ -z "$FILES_CHANGED" ]; then
    echo "  WARNING: Could not parse codemod output."
    break
  fi

  if [ "$FILES_CHANGED" -eq 0 ]; then
    echo "  Codemod converged."
    break
  fi
done

echo "  Normalizing codemod syntax to Babel-compatible Flow..."
python3 "$SCRIPT_DIR/fix-codemod-syntax.py"
echo "  Done."

###############################################################################
# STEP 5: Fix specific known issues
###############################################################################
echo ""
echo "--- Step 5: Fixing specific known issues ---"

# Fix GDevelop.js type files (if they exist and don't have FlowFixMe)
GD_TYPES="$APP_DIR/../../GDevelop.js/types"
if [ -d "$GD_TYPES" ]; then
  python3 << 'PYEOF'
import os, re

gd_types = os.environ.get('GD_TYPES', '../../GDevelop.js/types')

for fname in ['gdbehaviorjsimplementation.js', 'gdbehaviorshareddatajsimplementation.js']:
    filepath = os.path.join(gd_types, fname)
    if not os.path.isfile(filepath):
        continue
    with open(filepath) as f:
        content = f.read()
    if '$FlowFixMe' in content:
        continue
    for method in ['getProperties(', 'updateProperty(', 'initializeContent(']:
        content = content.replace(f'  {method}', f'  // $FlowFixMe[incompatible-type]\n  {method}')
    with open(filepath, 'w') as f:
        f.write(content)

filepath = os.path.join(gd_types, 'libgdevelop.js')
if os.path.isfile(filepath):
    with open(filepath) as f:
        lines = f.readlines()
    if '$FlowFixMe' not in ''.join(lines):
        fixes = {19: 'cannot-resolve-name', 20: 'cannot-resolve-name', 39: 'cannot-resolve-name', 297: 'cannot-resolve-name'}
        new_lines = []
        for i, line in enumerate(lines):
            if i + 1 in fixes:
                new_lines.append(f'  // $FlowFixMe[{fixes[i+1]}]\n')
            new_lines.append(line)
        with open(filepath, 'w') as f:
            f.writelines(new_lines)

print("  Fixed GDevelop.js types")
PYEOF
fi

# Fix Theme/index.js - $PropertyType replacement may leave empty type
THEME_FILE="$APP_DIR/src/UI/Theme/index.js"
if grep -q 'export type GDevelopTheme = ;' "$THEME_FILE" 2>/dev/null; then
  sed -i "s/export type GDevelopTheme = ;/export type GDevelopTheme = Theme['gdevelopTheme'];/" "$THEME_FILE"
  # Remove any stray {/* $FlowFixMe */} on the line above
  python3 -c "
with open('$THEME_FILE') as f:
    content = f.read()
import re
content = re.sub(r'\{\\/\\* \\\$FlowFixMe\[incompatible-type\] \\*\\/\}\n(export type GDevelopTheme)', r'\1', content)
content = re.sub(r'\{/\* \\\$FlowFixMe\[incompatible-type\] \*/\}\n(export type GDevelopTheme)', r'\1', content)
with open('$THEME_FILE', 'w') as f:
    f.write(content)
"
  echo "  Fixed Theme/index.js"
fi

# Fix known annotate-exports gaps (remaining signature-verification failures).
python3 << 'PYEOF'
import os
import re

app_dir = os.environ.get('APP_DIR', os.getcwd())
replacements = [
    (
        os.path.join(app_dir, 'src/EventsSheet/index.js'),
        r'onResourceExternallyChanged = resourceInfo => \{',
        'onResourceExternallyChanged = (resourceInfo: any) => {',
    ),
    (
        os.path.join(app_dir, 'src/Leaderboard/LeaderboardContext.js'),
        r'deleteLeaderboardEntry: async entryId => \{\},',
        'deleteLeaderboardEntry: async (entryId: any) => {},',
    ),
]

fixed = 0
for filepath, pattern, replacement in replacements:
    if not os.path.isfile(filepath):
        continue
    with open(filepath) as f:
        content = f.read()
    updated = re.sub(pattern, replacement, content)
    if updated != content:
        with open(filepath, 'w') as f:
            f.write(updated)
        fixed += 1

print(f"  Fixed {fixed} known annotate-exports signature gaps")
PYEOF

echo "  Done."

###############################################################################
# STEP 6: Add $FlowFixMe for all remaining errors (iterative)
###############################################################################
echo ""
echo "--- Step 6: Adding \$FlowFixMe for all errors (iterative) ---"

npx flow stop 2>/dev/null || true

PREV_ERROR_COUNT=""
for i in $(seq 1 15); do
  echo "  Iteration $i..."

  # Add FlowFixMe comments for errors
  FLOWFIXME_OUTPUT=$(python3 "$SCRIPT_DIR/add-flow-fixme.py" 2>&1 || true)
  echo "$FLOWFIXME_OUTPUT" | grep -E "Added|Found|No" || true

  # Convert // FlowFixMe in JSX context to {/* FlowFixMe */}
  JSX_CONVERT_OUTPUT=$(python3 "$SCRIPT_DIR/convert-jsx-flowfixme.py" 2>&1 || true)
  echo "$JSX_CONVERT_OUTPUT" | grep -E "Converted|Reverted" || true

  npx flow stop 2>/dev/null || true

  # Check remaining errors
  set +e
  ERROR_OUTPUT=$(npx flow 2>&1)
  FLOW_EXIT=$?
  set -e
  if echo "$ERROR_OUTPUT" | grep -q "No errors"; then
    echo "  No more errors!"
    break
  fi

  ERROR_COUNT=$(echo "$ERROR_OUTPUT" | grep "Found" | grep -o '[0-9]*' | head -1)
  echo "  Remaining errors: ${ERROR_COUNT:-unknown} (flow exit: $FLOW_EXIT)"

  if echo "$FLOWFIXME_OUTPUT" | grep -q "Added 0 \$FlowFixMe comments" && \
     [ -n "$ERROR_COUNT" ] && [ "$ERROR_COUNT" = "$PREV_ERROR_COUNT" ]; then
    echo "  No automatic progress in this iteration; stopping early."
    break
  fi

  PREV_ERROR_COUNT="$ERROR_COUNT"
  npx flow stop 2>/dev/null || true
done

###############################################################################
# STEP 7: Fix eslint-disable-next-line ordering with $FlowFixMe
###############################################################################
echo ""
echo "--- Step 7: Fixing eslint/FlowFixMe comment ordering ---"

# When $FlowFixMe is inserted between eslint-disable-next-line and the code,
# eslint-disable no longer applies (it targets the FlowFixMe comment instead).
# Fix: convert eslint-disable-next-line to eslint-disable-line on the code line.
python3 << 'PYEOF'
import os, re

src_dir = os.path.join(os.environ.get('APP_DIR', os.getcwd()), 'src')
fixed = 0

for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if not fname.endswith('.js'):
            continue
        filepath = os.path.join(root, fname)
        with open(filepath) as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        i = 0
        while i < len(lines):
            # Pattern: $FlowFixMe[...], then eslint-disable-next-line, then code
            if (i + 2 < len(lines) and
                '$FlowFixMe[' in lines[i] and
                'eslint-disable-next-line' in lines[i + 1]):
                m = re.search(r'eslint-disable-next-line\s+(.+)', lines[i + 1])
                if m:
                    rule = m.group(1).strip()
                    new_lines.append(lines[i])  # Keep $FlowFixMe
                    # Skip eslint-disable-next-line, add as inline on code line
                    code_line = lines[i + 2].rstrip()
                    if 'eslint-disable-line' not in code_line:
                        code_line = code_line + f' // eslint-disable-line {rule}'
                    new_lines.append(code_line + '\n')
                    i += 3
                    modified = True
                    fixed += 1
                    continue
            # Pattern: eslint-disable-next-line, then $FlowFixMe[...], then code
            elif (i + 2 < len(lines) and
                  'eslint-disable-next-line' in lines[i] and
                  '$FlowFixMe[' in lines[i + 1]):
                m = re.search(r'eslint-disable-next-line\s+(.+)', lines[i])
                if m:
                    rule = m.group(1).strip()
                    new_lines.append(lines[i + 1])  # Keep $FlowFixMe
                    # Skip eslint-disable-next-line, add as inline on code line
                    code_line = lines[i + 2].rstrip()
                    if 'eslint-disable-line' not in code_line:
                        code_line = code_line + f' // eslint-disable-line {rule}'
                    new_lines.append(code_line + '\n')
                    i += 3
                    modified = True
                    fixed += 1
                    continue
            
            new_lines.append(lines[i])
            i += 1
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(new_lines)

print(f"  Fixed {fixed} eslint/FlowFixMe orderings")
PYEOF

echo ""
echo "=== Flow Migration Fix Script Complete ==="
echo "Run 'npm run flow' and 'npm run build' to verify."
