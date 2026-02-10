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

# Fix Theme/index.js - $PropertyType replacement may leave empty type or
# indexed access type (Theme['gdevelopTheme']) that prettier 1.15 can't parse.
# Use typeof DefaultLightTheme.gdevelopTheme which both Flow 0.299 and prettier understand.
THEME_FILE="$APP_DIR/src/UI/Theme/index.js"
python3 << 'PYEOF'
import os, re
theme_file = os.path.join(os.environ.get('APP_DIR', os.getcwd()), 'src/UI/Theme/index.js')
if os.path.isfile(theme_file):
    with open(theme_file) as f:
        content = f.read()
    original = content
    # Fix empty type from $PropertyType removal
    content = content.replace("export type GDevelopTheme = ;",
        "export type GDevelopTheme = typeof DefaultLightTheme.gdevelopTheme;")
    # Fix indexed access type that prettier 1.15 can't parse
    content = re.sub(
        r"export type GDevelopTheme = Theme\['gdevelopTheme'\];",
        "export type GDevelopTheme = typeof DefaultLightTheme.gdevelopTheme;",
        content)
    # Remove any stray FlowFixMe above the type export
    content = re.sub(
        r'(?://\s*\$FlowFixMe\[incompatible-type\]\s*\n|\{/\*\s*\$FlowFixMe\[incompatible-type\]\s*\*/\}\s*\n)'
        r'(export type GDevelopTheme)',
        r'\1', content)
    # Remove any stale prettier-ignore before the line
    content = re.sub(
        r'// prettier-ignore\n(export type GDevelopTheme)',
        r'\1', content)
    if content != original:
        with open(theme_file, 'w') as f:
            f.write(content)
        print("  Fixed Theme/index.js")
    else:
        print("  Theme/index.js already correct")
PYEOF

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
# STEP 6: Run prettier formatting (pre-FlowFixMe)
###############################################################################
echo ""
echo "--- Step 6: Running prettier formatting (pre-FlowFixMe) ---"

# Format all source files before adding FlowFixMe.
# This ensures FlowFixMe comments will be placed at the correct post-format
# line numbers.
npm run format 2>&1 || true
echo "  Done."

###############################################################################
# STEP 7: Add $FlowFixMe for all remaining errors (iterative)
###############################################################################
echo ""
echo "--- Step 7: Adding \$FlowFixMe for all errors (iterative) ---"

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
# STEP 8: Run prettier formatting (post-FlowFixMe)
###############################################################################
echo ""
echo "--- Step 8: Running prettier formatting (post-FlowFixMe) ---"

# Format again after FlowFixMe comments were added, to ensure consistent style.
npm run format 2>&1 || true
echo "  Done."

###############################################################################
# STEP 9: Remove orphaned FlowFixMe and re-add displaced ones
###############################################################################
echo ""
echo "--- Step 9: Cleaning up displaced FlowFixMe comments ---"

# After formatting, some FlowFixMe comments may have been displaced
# (no longer directly above the error line). This step:
# 1. Runs flow to find current errors
# 2. Removes FlowFixMe comments that are not directly above an error
# 3. Re-adds them at the correct positions
python3 << 'PYEOF'
import subprocess
import json
import os
import re
from collections import defaultdict

app_dir = os.environ.get('APP_DIR', os.getcwd())

def get_flow_errors():
    result = subprocess.run(
        ['npx', 'flow', '--json', '--show-all-errors'],
        capture_output=True, text=True, cwd=app_dir, timeout=300
    )
    output = result.stdout
    idx = output.find('{"flowVersion"')
    if idx == -1:
        return []
    try:
        data = json.loads(output[idx:])
        return data.get('errors', [])
    except json.JSONDecodeError:
        return []

def get_src_error_lines(errors):
    """Get error locations grouped by file."""
    file_errors = defaultdict(lambda: defaultdict(set))
    for error in errors:
        messages = error.get('message', [])
        error_codes = error.get('error_codes', [])
        if not messages:
            continue
        primary = messages[0]
        loc = primary.get('loc', {})
        source = loc.get('source', '')
        line = loc.get('start', {}).get('line', 0)
        if not source or not line:
            continue
        if app_dir + '/src/' not in source:
            continue
        code = error_codes[0] if error_codes else 'incompatible-type'
        if code == 'signature-verification-failure':
            code = 'incompatible-type'
        file_errors[source][line].add(code)
    return file_errors

# Run flow and get current errors
print("  Getting current flow errors...")
subprocess.run(['npx', 'flow', 'stop'], capture_output=True, cwd=app_dir)
errors = get_flow_errors()
file_errors = get_src_error_lines(errors)
src_errors = sum(len(lines) for lines in file_errors.values())
print(f"  Found {src_errors} error locations in src/ files")

if src_errors == 0:
    print("  No errors to fix - skipping cleanup.")
else:
    # For each file with errors, check if FlowFixMe comments are correctly placed
    removed = 0
    added = 0
    for filepath, line_errors in sorted(file_errors.items()):
        if not os.path.isfile(filepath):
            continue
        with open(filepath) as f:
            lines = f.readlines()

        # Build a set of error lines (1-indexed)
        error_line_set = set(line_errors.keys())

        # Phase 1: Remove FlowFixMe comments that are NOT directly above an error line
        # A FlowFixMe on line N is "correct" if line N+1 has an error, or if line N+1
        # also has a FlowFixMe that is itself correct (chain of FlowFixMe).
        lines_to_remove = set()
        for i, line in enumerate(lines):
            line_num = i + 1  # 1-indexed
            if '$FlowFixMe[' not in line:
                continue
            # Check if the NEXT non-FlowFixMe line has an error
            j = i + 1
            while j < len(lines) and '$FlowFixMe[' in lines[j]:
                j += 1
            next_code_line = j + 1  # 1-indexed
            if next_code_line not in error_line_set:
                # This FlowFixMe is not directly protecting an error line
                # But don't remove it if a CLOSER error line exists nearby
                # (within 1 line of the FlowFixMe itself)
                if (line_num + 1) not in error_line_set:
                    lines_to_remove.add(i)

        if lines_to_remove:
            new_lines = [l for i, l in enumerate(lines) if i not in lines_to_remove]
            removed += len(lines_to_remove)
            with open(filepath, 'w') as f:
                f.writelines(new_lines)

    print(f"  Removed {removed} orphaned FlowFixMe comments")

    # Phase 2: Re-add FlowFixMe at correct positions using existing add-flow-fixme.py
    subprocess.run(['npx', 'flow', 'stop'], capture_output=True, cwd=app_dir)

    for iteration in range(3):
        result = subprocess.run(
            ['python3', os.path.join(app_dir, 'scripts', 'add-flow-fixme.py')],
            capture_output=True, text=True, cwd=app_dir
        )
        print(f"  Re-add pass {iteration + 1}: {result.stdout.strip()}")

        # Convert JSX FlowFixMe
        subprocess.run(
            ['python3', os.path.join(app_dir, 'scripts', 'convert-jsx-flowfixme.py')],
            capture_output=True, text=True, cwd=app_dir
        )

        subprocess.run(['npx', 'flow', 'stop'], capture_output=True, cwd=app_dir)

        # Check if errors remain
        check = subprocess.run(
            ['npx', 'flow'], capture_output=True, text=True, cwd=app_dir, timeout=300
        )
        if 'No errors' in check.stdout:
            print("  No more errors after cleanup!")
            break
PYEOF

echo "  Done."

###############################################################################
# STEP 10: Final format pass
###############################################################################
echo ""
echo "--- Step 10: Final prettier formatting ---"

npm run format 2>&1 || true

# After final format, do one last quick check and fix if needed
npx flow stop 2>/dev/null || true
set +e
FINAL_CHECK=$(npx flow 2>&1)
FINAL_EXIT=$?
set -e

if ! echo "$FINAL_CHECK" | grep -q "No errors"; then
  echo "  Post-format errors detected, running final FlowFixMe pass..."
  python3 "$SCRIPT_DIR/add-flow-fixme.py" 2>&1 || true
  python3 "$SCRIPT_DIR/convert-jsx-flowfixme.py" 2>&1 || true
  # Format one more time to normalize
  npm run format 2>&1 || true
fi

echo "  Done."

###############################################################################
# STEP 11: Fix eslint-disable-next-line ordering with $FlowFixMe
###############################################################################
echo ""
echo "--- Step 11: Fixing eslint/FlowFixMe comment ordering ---"

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
