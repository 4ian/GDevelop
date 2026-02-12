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
# STEP 1b: Update flow-bin version to 0.299.0 in package.json and npm install
###############################################################################
echo ""
echo "--- Step 1b: Updating flow-bin version to 0.299.0 ---"
sed -i 's/"flow-bin": "0.131.0"/"flow-bin": "0.299.0"/' "$APP_DIR/package.json"
echo "  Updated package.json. Running npm install..."
npm install
echo "  Done."

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

# Fix arrow-function inline object return types that prettier 1.15 can't parse.
# The codemod may add return type annotations like:
#   const foo = (): { prop: Type } => { ... }
# Prettier 1.15 can't parse the `: { ... } =>` pattern.
# Fix: extract the inline type into a named type alias, preserving typing.
echo "  Fixing arrow-function return types for prettier compatibility..."
python3 "$SCRIPT_DIR/fix-arrow-return-types.py"

echo "  Done."

###############################################################################
# STEP 4b: Fix codemod artifacts that cause parse errors or Flow issues
###############################################################################
echo ""
echo "--- Step 4b: Fixing codemod artifacts ---"

# 0. Remove stale FlowFixMe[prop-missing] comments that were previously added
#    for invalid React.AbstractComponent output from older codemod runs.
find "$APP_DIR/src" -name "*.js" -type f -exec perl -0pi -e '
  s/^[ \t]*\/\/ \$FlowFixMe\[prop-missing\]\n(?=(?:[ \t]*\/\/ \$FlowFixMe\[[^\]]+\]\n|[ \t]*\n)*[^\n]*React\.ComponentType<)//mg;
' {} +

# 1. Fix missing commas after ([]: Array<empty>) in object literals.
#    The codemod turns "[]," into "([]: Array<empty>)" but loses the comma.
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/\(\[\]: Array<empty>\)(\s*\/\/.*)$/([]: Array<empty>),$1/g;
' {} +

# 2. Fix "new Array(n)" -> "new Array<number>(n)" to avoid underconstrained type
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/new Array\(([^)]+)\)\.fill\(0\)/new Array<number>($1).fill(0)/g;
' {} +

# 3. Fix !== null comparisons on number types -> != null
#    (Flow 0.299 is strict about comparing non-nullable numbers to null)
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/selectedCompletionIndex !== null/selectedCompletionIndex != null/g;
' {} +

# 5. Generic type params like new Set<any>(), new Map<any,any>(), React.createRef<any>()
#    are NOT parseable by prettier 1.15 (it treats < as comparison operator).
#    These will get FlowFixMe[underconstrained-implicit-instantiation] automatically.

# 6. new Array(n) patterns beyond .fill(0) also can't use <any> with prettier 1.15.

# 7. axios calls with type params - skip, prettier 1.15 mangles method<Type>() syntax.
#    These will get FlowFixMe[underconstrained-implicit-instantiation] automatically.

# 8. jest.fn() - leave as-is, prettier 1.15 can't parse jest.fn<any>()
#    These will get FlowFixMe[underconstrained-implicit-instantiation] automatically.

# 9. Fix method-unbinding for common patterns: .push.apply -> spread syntax
#    Handles both single-line and multi-line push.apply patterns.
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
            content = f.read()
        original = content
        # Multi-line pattern: arr.push.apply(\n  arr,\n  items\n)
        content = re.sub(
            r'(\w+)\.push\.apply\(\s*\1\s*,\s*([^)]+?)\s*\)',
            lambda m: f'{m.group(1)}.push(...{m.group(2).strip()})',
            content,
            flags=re.DOTALL)
        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            fixed += 1

print(f"  Converted {fixed} push.apply to spread syntax")
PYEOF

# 10. Fix import-type-as-value: convert value imports of type-only symbols to import type.
#     I18n from @lingui/core is a type (interface) used only in type positions.
find "$APP_DIR/src" -name "*.js" -type f -exec perl -pi -e '
  s/^(\/\/ \$FlowFixMe\[import-type-as-value\]\n)?import \{ I18n as I18nType \} from/import type { I18n as I18nType } from/g;
' {} +

# Fix TreeViewItemContent import-type-as-value: these are interfaces (type-only)
python3 << 'PYEOF'
import os, re

app_dir = os.environ.get('APP_DIR', os.getcwd())
src_dir = os.path.join(app_dir, 'src')
fixed = 0

for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if not fname.endswith('.js'):
            continue
        filepath = os.path.join(root, fname)
        with open(filepath) as f:
            content = f.read()
        original = content

        # Remove FlowFixMe[import-type-as-value] above import lines where
        # we can safely convert to import type
        lines = content.split('\n')
        new_lines = []
        i = 0
        while i < len(lines):
            line = lines[i]
            # Skip FlowFixMe[import-type-as-value] if the next line is an import we'll fix
            if '$FlowFixMe[import-type-as-value]' in line:
                # Check if this is a standalone FlowFixMe comment line
                stripped = line.lstrip()
                if stripped.startswith('// $FlowFixMe[import-type-as-value]'):
                    # Check if next line is an import statement
                    if i + 1 < len(lines) and 'import' in lines[i + 1]:
                        # Skip this FlowFixMe comment
                        i += 1
                        continue
                    # Check if this is inside an import block (destructured import)
                    # Look backwards for the import statement
                    is_in_import = False
                    for j in range(i - 1, max(i - 10, -1), -1):
                        if 'import' in lines[j] and '{' in lines[j]:
                            is_in_import = True
                            break
                        if '}' in lines[j] and 'from' in lines[j]:
                            break
                    if is_in_import:
                        # Skip this FlowFixMe
                        i += 1
                        continue
            new_lines.append(line)
            i += 1

        content = '\n'.join(new_lines)

        # Convert import { I18n as I18nType } to import type
        content = re.sub(
            r"import \{ I18n as I18nType \} from '@lingui/core'",
            "import type { I18n as I18nType } from '@lingui/core'",
            content)

        if content != original:
            with open(filepath, 'w') as f:
                f.write(content)
            fixed += 1

print(f"  Fixed {fixed} import-type-as-value issues")
PYEOF

# 4. Fix inline object return types on multi-line arrow function params
#    that fix-arrow-return-types.py couldn't handle (nested parens in destructured args).
#    Pattern: ): { ... } => { (where the object return type causes prettier parse error)
python3 << 'PYEOF'
import os, re, subprocess

app_dir = os.environ.get('APP_DIR', os.getcwd())

# Find files with prettier parse errors
result = subprocess.run(
    ['npx', 'prettier', '--list-different', 'src/!(locales)/**/*.js'],
    capture_output=True, text=True, cwd=app_dir, timeout=120
)
all_output = result.stdout + '\n' + result.stderr
error_files = set()
for line in all_output.split('\n'):
    m = re.match(r'\[error\]\s+(src/\S+\.js):\s+SyntaxError', line)
    if m:
        error_files.add(os.path.join(app_dir, m.group(1)))

fixed = 0
for filepath in error_files:
    if not os.path.isfile(filepath):
        continue
    with open(filepath) as f:
        content = f.read()
    original = content

    # Find ): { ... } => patterns (multi-line object return types)
    # This regex works on the whole content to find the ): { ... } => pattern
    # We need to use a balanced-brace approach
    pos = 0
    replacements = []
    while True:
        idx = content.find('):', pos)
        if idx == -1:
            break
        # Check if followed by whitespace then {
        rest = content[idx+2:].lstrip()
        if not rest.startswith('{'):
            pos = idx + 2
            continue
        brace_start = content.index('{', idx + 2)
        # Find matching close brace
        depth = 0
        i = brace_start
        while i < len(content):
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
                if depth == 0:
                    break
            elif content[i] in ('"', "'", '`'):
                q = content[i]
                i += 1
                while i < len(content) and content[i] != q:
                    if content[i] == '\\':
                        i += 1
                    i += 1
            i += 1
        if depth != 0:
            pos = idx + 2
            continue
        brace_end = i
        # Check if followed by => (arrow)
        after = content[brace_end+1:].lstrip()
        if not after.startswith('=>'):
            pos = idx + 2
            continue
        type_text = content[brace_start:brace_end+1]
        if '\n' not in type_text:
            pos = idx + 2
            continue
        # Find function name for type alias
        line_start = content.rfind('\n', 0, idx)
        if line_start == -1:
            line_start = 0
        # Find export const/let/var name = ... pattern
        preceding = content[max(0, line_start-200):idx+2]
        name_match = re.search(r'(?:const|let|var|function)\s+(\w+)', preceding)
        name = name_match.group(1) if name_match else 'Func'
        type_name = f'_{name[0].upper()}{name[1:]}ReturnType'
        # Check if type alias already exists
        if f'type {type_name}' in content:
            pos = idx + 2
            continue
        replacements.append((brace_start, brace_end+1, type_name, type_text))
        pos = brace_end + 1

    if not replacements:
        continue

    # Apply in reverse
    for brace_start, brace_end, type_name, type_text in reversed(replacements):
        content = content[:brace_start] + type_name + content[brace_end:]

    # Insert type declarations at the top (after imports)
    insert_lines = []
    for _, _, type_name, type_text in replacements:
        insert_lines.append(f'type {type_name} = {type_text};\n')

    # Find insertion point (after last import)
    last_import = 0
    for m in re.finditer(r'^(?:import\s|from\s)', content, re.MULTILINE):
        eol = content.find('\n', m.start())
        # Handle multi-line imports
        if '{' in content[m.start():eol] and '}' not in content[m.start():eol]:
            eol = content.find('}', eol)
            eol = content.find('\n', eol)
        # Handle from '...' on next line
        next_line_start = eol + 1
        if next_line_start < len(content):
            next_stripped = content[next_line_start:].lstrip()
            if next_stripped.startswith("from ") or next_stripped.startswith("} from "):
                eol = content.find('\n', next_line_start)
        if eol > last_import:
            last_import = eol
    if last_import > 0:
        insert_pos = last_import + 1
    else:
        insert_pos = 0
    insert_text = '\n' + ''.join(insert_lines) + '\n'
    content = content[:insert_pos] + insert_text + content[insert_pos:]

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        fixed += 1

print(f"  Fixed {fixed} additional arrow-return-type files")
PYEOF

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

# Fix known annotate-exports gaps and formatting-displacement issues.
python3 << 'PYEOF'
import os
import re

app_dir = os.environ.get('APP_DIR', os.getcwd())

# Regex-based replacements for signature-verification gaps
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

# Fix PrivateGameTemplateStoreContext: add type annotation to empty object
# that prettier splits across lines (causing FlowFixMe displacement).
pgts_file = os.path.join(app_dir,
    'src/AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext.js')
if os.path.isfile(pgts_file):
    with open(pgts_file) as f:
        content = f.read()
    # Add type annotation to the untyped empty object
    updated = content.replace(
        'const privateGameTemplateListingDatasById = {};',
        'const privateGameTemplateListingDatasById: {[string]: any} = {};')
    # Remove any stacked FlowFixMe[prop-missing] that accumulated from previous runs
    updated = re.sub(
        r'(\s*// \$FlowFixMe\[prop-missing\]\n)+(\s*privateGameTemplateListingDatasById\[)',
        r'\2', updated)
    # Also remove FlowFixMe[invalid-computed-prop] for the typed object (no longer needed)
    updated = re.sub(
        r'\s*// \$FlowFixMe\[invalid-computed-prop\]\n(\s*if \(privateGameTemplateListingDatasById\[)',
        r'\n\1', updated)
    if updated != content:
        with open(pgts_file, 'w') as f:
            f.write(updated)
        fixed += 1

# Fix ConditionsActionsColumns.js - renderActionsList type needs style prop
cac_file = os.path.join(app_dir, 'src/EventsSheet/EventsTree/ConditionsActionsColumns.js')
if os.path.isfile(cac_file):
    with open(cac_file) as f:
        content = f.read()
    updated = content.replace(
        'renderActionsList: ({ className: string }) => React.Node,',
        'renderActionsList: ({ style?: Object, className: string }) => React.Node,')
    if updated != content:
        with open(cac_file, 'w') as f:
            f.write(updated)
        fixed += 1

# Fix PreferencesContext.js - annotate missing params for signature-verification
pref_file = os.path.join(app_dir, 'src/MainFrame/Preferences/PreferencesContext.js')
if os.path.isfile(pref_file):
    with open(pref_file) as f:
        content = f.read()
    updated = content
    updated = updated.replace(
        'getRecentProjectFiles: options => [],',
        'getRecentProjectFiles: (options: any): any => [],')
    updated = updated.replace(
        'getEditorStateForProject: projectId => {},',
        'getEditorStateForProject: (projectId: any): any => {},')
    if updated != content:
        with open(pref_file, 'w') as f:
            f.write(updated)
        fixed += 1

# Fix ShortcutsList.js - annotate commandName parameter
sc_file = os.path.join(app_dir, 'src/KeyboardShortcuts/ShortcutsList.js')
if os.path.isfile(sc_file):
    with open(sc_file) as f:
        content = f.read()
    updated = content.replace(
        'areaWiseCommands[areaName].map(commandName =>',
        'areaWiseCommands[areaName].map((commandName: string) =>')
    if updated != content:
        with open(sc_file, 'w') as f:
            f.write(updated)
        fixed += 1

# Fix ProjectManager/index.js - useState(null) needs type param for ?gdLayout
pm_file = os.path.join(app_dir, 'src/ProjectManager/index.js')
if os.path.isfile(pm_file):
    with open(pm_file) as f:
        content = f.read()
    updated = content
    # Add type annotation to useState calls that should be ?gdLayout
    updated = re.sub(
        r'const \[editedPropertiesLayout, setEditedPropertiesLayout\] = React\.useState\(\s*\n\s*null\s*\n\s*\)',
        'const [editedPropertiesLayout, setEditedPropertiesLayout] = React.useState<?gdLayout>(\n      null\n    )',
        updated)
    updated = re.sub(
        r'const \[editedVariablesLayout, setEditedVariablesLayout\] = React\.useState\(\s*\n\s*null\s*\n\s*\)',
        'const [editedVariablesLayout, setEditedVariablesLayout] = React.useState<?gdLayout>(\n      null\n    )',
        updated)
    if updated != content:
        with open(pm_file, 'w') as f:
            f.write(updated)
        fixed += 1

# Fix CollisionMasksPreview.js - use type cast for inexact/exact mismatch
cmp_file = os.path.join(app_dir, 'src/ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor/CollisionMasksPreview.js')
if os.path.isfile(cmp_file):
    with open(cmp_file) as f:
        content = f.read()
    # Cast polygons to any to bypass inexact/exact mismatch
    updated = content.replace(
        'mapVector(polygons,',
        'mapVector((polygons: any),')
    if updated != content:
        with open(cmp_file, 'w') as f:
            f.write(updated)
        fixed += 1

print(f"  Fixed {fixed} known annotate-exports signature gaps and type issues")
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
# STEP 8: Post-FlowFixMe format + fix cycle
###############################################################################
echo ""
echo "--- Step 8: Post-FlowFixMe format and fix cycle ---"

# After adding FlowFixMe comments, formatting may introduce new errors
# (e.g., FlowFixMe comments getting displaced from error lines).
# Run format + flow check + FlowFixMe in a cycle until stable.
for j in $(seq 1 3); do
  echo "  Format-fix cycle iteration $j..."

  npm run format 2>&1 || true

  npx flow stop 2>/dev/null || true
  set +e
  CYCLE_CHECK=$(npx flow 2>&1)
  set -e

  if echo "$CYCLE_CHECK" | grep -q "No errors"; then
    echo "  No errors after formatting - cycle complete!"
    break
  fi

  CYCLE_ERRORS=$(echo "$CYCLE_CHECK" | grep "Found" | grep -o '[0-9]*' | head -1)
  echo "  $CYCLE_ERRORS errors after formatting, adding FlowFixMe..."

  python3 "$SCRIPT_DIR/add-flow-fixme.py" 2>&1 || true
  python3 "$SCRIPT_DIR/convert-jsx-flowfixme.py" 2>&1 || true
done

echo "  Done."

###############################################################################
# STEP 9: Final format verification
###############################################################################
echo ""
echo "--- Step 9: Final format verification ---"

npm run format 2>&1 || true

npx flow stop 2>/dev/null || true
set +e
FINAL_CHECK=$(npx flow 2>&1)
set -e

if echo "$FINAL_CHECK" | grep -q "No errors"; then
  echo "  All clean!"
else
  echo "  WARNING: Still have errors after all cycles:"
  echo "$FINAL_CHECK" | grep "Found" || true
fi

echo "  Done."

###############################################################################
# STEP 10: Fix eslint-disable-next-line ordering with $FlowFixMe
###############################################################################
echo ""
echo "--- Step 10: Fixing eslint/FlowFixMe comment ordering ---"

# When $FlowFixMe is inserted between eslint-disable-next-line and the code,
# eslint-disable no longer applies (it targets the FlowFixMe comment instead).
# Fix: wrap the code with eslint-disable/eslint-enable block comments, so that
# both the FlowFixMe suppression and the eslint suppression work correctly.
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
            # Pattern: eslint-disable-next-line, then one or more $FlowFixMe[...], then code
            if (i + 2 < len(lines) and
                  'eslint-disable-next-line' in lines[i] and
                  '$FlowFixMe[' in lines[i + 1]):
                m = re.search(r'eslint-disable-next-line\s+(.+)', lines[i])
                if m:
                    rule = m.group(1).strip()
                    # Collect all consecutive FlowFixMe lines
                    fixme_lines = []
                    j = i + 1
                    while j < len(lines) and '$FlowFixMe[' in lines[j]:
                        fixme_lines.append(lines[j])
                        j += 1
                    if j < len(lines):
                        code_line = lines[j]
                        indent = ''
                        for ch in code_line:
                            if ch in (' ', '\t'):
                                indent += ch
                            else:
                                break
                        # Use eslint-disable/enable block wrapping FlowFixMe + code
                        new_lines.append(f'{indent}/* eslint-disable {rule} */\n')
                        for fl in fixme_lines:
                            new_lines.append(fl)
                        new_lines.append(code_line)
                        new_lines.append(f'{indent}/* eslint-enable {rule} */\n')
                        i = j + 1
                        modified = True
                        fixed += 1
                        continue
            # Pattern: one or more $FlowFixMe[...], then eslint-disable-next-line, then code
            elif (i + 2 < len(lines) and
                '$FlowFixMe[' in lines[i] and
                'eslint-disable-next-line' in lines[i + 1]):
                # Find where the FlowFixMe block starts
                fixme_start = i
                # The eslint line is after one FlowFixMe; collect FlowFixMe after it too
                m = re.search(r'eslint-disable-next-line\s+(.+)', lines[i + 1])
                if m:
                    rule = m.group(1).strip()
                    j = i + 2
                    # Code line is right after eslint-disable-next-line
                    if j < len(lines):
                        code_line = lines[j]
                        indent = ''
                        for ch in code_line:
                            if ch in (' ', '\t'):
                                indent += ch
                            else:
                                break
                        new_lines.append(f'{indent}/* eslint-disable {rule} */\n')
                        new_lines.append(lines[i])  # Keep $FlowFixMe
                        new_lines.append(code_line)
                        new_lines.append(f'{indent}/* eslint-enable {rule} */\n')
                        i = j + 1
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

###############################################################################
# STEP 11: Final format after all fixes
###############################################################################
echo ""
echo "--- Step 11: Final format pass ---"
npm run format 2>&1 || true
echo "  Done."

echo ""
echo "=== Flow Migration Fix Script Complete ==="
echo "Run 'npm run flow' and 'npm run build' to verify."
