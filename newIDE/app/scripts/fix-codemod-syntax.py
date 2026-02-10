#!/usr/bin/env python3
"""
Fix syntax that the Flow codemod introduces but Babel can't parse:
1. component() type syntax -> remove it, add $FlowFixMe
2. as Type casts -> (expr: Type) old-style casts
This script is idempotent.
"""

import os
import re
import sys

APP_DIR = os.environ.get('APP_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(APP_DIR, 'src')


def remove_component_annotations(filepath):
    """
    Remove : component(...) type annotations from variable declarations.
    Replace 'expr as component(...)' casts with just 'expr'.
    """
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # --- 1. Fix "const X: component(...) = expr" declarations ---
    # These span multiple lines. Strategy: find ": component(" and consume 
    # everything until we find the balanced ") =" or ") =" pattern.
    
    result_chars = list(content)
    # Work on the string directly
    
    # Find all occurrences of ": component(" that are type annotations
    pattern = re.compile(r'((?:export\s+)?(?:const|let|var)\s+\w+)\s*:\s*component\(')
    
    new_content = content
    offset = 0
    
    for m in pattern.finditer(content):
        decl_prefix = m.group(1)
        colon_start = m.start() + len(decl_prefix)
        paren_start = m.end() - 1  # position of the (
        
        # Find balanced closing paren
        depth = 1
        pos = paren_start + 1
        while pos < len(content) and depth > 0:
            if content[pos] == '(':
                depth += 1
            elif content[pos] == ')':
                depth -= 1
            pos += 1
        
        if depth != 0:
            continue
        
        # pos is now right after the closing )
        # Find the = sign
        eq_pos = pos
        while eq_pos < len(content) and content[eq_pos] in ' \t\n\r':
            eq_pos += 1
        
        if eq_pos < len(content) and content[eq_pos] == '=':
            # Remove the ": component(...)" part (from colon_start to eq_pos)
            # Replace with " "
            to_remove = content[colon_start:eq_pos]
            # In new_content, replace accounting for offset
            actual_start = colon_start + offset
            actual_end = eq_pos + offset
            new_content = new_content[:actual_start] + ' ' + new_content[actual_end:]
            offset += 1 - (eq_pos - colon_start)
    
    # --- 2. Fix "expr as component(...)" casts ---
    # Pattern: ) as component(...)
    # Replace with just )
    while True:
        m = re.search(r'\)\s*as\s+component\(', new_content)
        if not m:
            break
        
        # Find the balanced closing )
        paren_start = m.end() - 1
        depth = 1
        pos = paren_start + 1
        while pos < len(new_content) and depth > 0:
            if new_content[pos] == '(':
                depth += 1
            elif new_content[pos] == ')':
                depth -= 1
            pos += 1
        
        if depth != 0:
            break
        
        # Remove "as component(...)" and any trailing "React.Node" or type
        end_pos = pos
        # Check for trailing type like " React.Node" or " React$Node"
        rest = new_content[end_pos:end_pos + 50].lstrip()
        type_match = re.match(r'React\.Node\b|React\$Node\b', rest)
        if type_match:
            end_pos += (len(new_content[end_pos:]) - len(new_content[end_pos:].lstrip())) + type_match.end()
        
        # Replace: keep the ) before "as", remove the rest
        new_content = new_content[:m.start() + 1] + new_content[end_pos:]
    
    if new_content != original:
        # Add $FlowFixMe before lines that had component annotations removed
        # We'll do this by checking which const/export lines lost their annotations
        lines = new_content.split('\n')
        final_lines = []
        for i, line in enumerate(lines):
            # Check if this is a declaration that previously had a component() annotation
            # and now just has "const X =" pattern (the codemod would have added it)
            if (re.match(r'\s*(?:export\s+)?(?:const|let|var)\s+\w+\s+=\s+React\.(memo|forwardRef)', line) and
                (i == 0 or '$FlowFixMe' not in lines[i-1])):
                indent = re.match(r'(\s*)', line).group(1)
                final_lines.append(f'{indent}// $FlowFixMe[signature-verification-failure]')
            final_lines.append(line)
        new_content = '\n'.join(final_lines)
        
        with open(filepath, 'w') as f:
            f.write(new_content)
        return True
    return False


def convert_as_casts(filepath):
    """
    Convert Flow 'as Type' casts to old-style '(expr: Type)' casts.
    Only handles casts added by the codemod, not import aliases.
    """
    with open(filepath, 'r') as f:
        lines = f.readlines()

    new_lines = []
    modified = False

    for line in lines:
        stripped = line.strip()
        
        # Skip imports and comments
        if (stripped.startswith('import ') or stripped.startswith('// ') or
            stripped.startswith('/*') or stripped.startswith('*')):
            new_lines.append(line)
            continue
        
        if ' as ' not in line or re.match(r'\s*import\b', line):
            new_lines.append(line)
            continue
        
        new_line = line
        
        # Pattern: EXPR as any, at end or before , or ;
        # Convert: (EXPR: any),  or (EXPR: any);
        # Be careful: must find the start of the expression
        
        # Strategy: replace from right to left to handle multiple casts
        # Use a simple regex that finds " as TYPE" where TYPE is a known pattern
        
        # We handle each type of cast separately with targeted regexes
        
        # 1. "= EXPR as any," or "= EXPR as any;" or "= EXPR as any"
        #    (simple assignment context)
        
        # Generic pattern: find " as TYPE" and wrap the preceding expression
        # The "expression" before "as" can be:
        #   - function call: fn() as Type
        #   - new expression: new X() as Type  
        #   - array literal: [] as Type
        #   - variable: x as Type
        #   - method call: this.x.y() as Type
        #   - etc.
        
        # Simple approach: for each " as TYPE" occurrence, find the expression
        # by looking backward for a delimiter: =, ,, (, [, {, :, ?, &&, ||, return
        
        # But this is complex. Let me use a different approach:
        # Just use perl/sed-style replacements for the known patterns.
        
        # Actually, let me handle the common patterns:
        
        # Pattern: "[] as Array<...>" -> "([]: Array<...>)"
        new_line = re.sub(
            r'\[\]\s+as\s+(Array<[^>]+>)',
            r'([]: \1)',
            new_line
        )
        
        # Pattern: "new Constructor(...) as Type" -> "(new Constructor(...): Type)"
        # First handle: "new X() as X" (simple constructors)
        new_line = re.sub(
            r'(new\s+\w+(?:<[^>]*>)?\([^)]*\))\s+as\s+(\w+(?:<[^>]*>)?)',
            r'(\1: \2)',
            new_line
        )
        
        # Pattern: "expr() as Type" (function call result cast)
        # e.g. "getPreferences() as PreferencesValues"
        # Find: identifier(...) as Type -> (identifier(...): Type)
        new_line = re.sub(
            r'(\w+(?:\.\w+)*(?:<[^>]*>)?\([^)]*\))\s+as\s+((?:any|empty|"[^"]*"(?:\s*\|\s*"[^"]*")*|[A-Z]\w*(?:<[^;{},]*?>)?))',
            r'(\1: \2)',
            new_line
        )
        
        # Pattern: "this.prop.method(...) as Type"
        # Already covered by the pattern above with \w+(?:\.\w+)*
        
        # Pattern: "React.createRef<T>() as Type"
        # Already covered
        
        # Pattern: "[getPaperDecorator('medium') as StoryDecorator]"
        # -> [(getPaperDecorator('medium'): StoryDecorator)]
        new_line = re.sub(
            r"(\w+\('[^']*'\))\s+as\s+(\w+)",
            r'(\1: \2)',
            new_line
        )
        
        # Pattern: "t`...` as any" (tagged template literal)
        new_line = re.sub(
            r'(t`[^`]*`)\s+as\s+any\b',
            r'(\1: any)',
            new_line
        )
        
        # Pattern: simple "EXPR as any" where EXPR is a simple expression
        # Handle remaining "as any" patterns
        new_line = re.sub(
            r'(this\.\w+(?:\.\w+)*(?:\([^)]*\))?)\s+as\s+any\b',
            r'(\1: any)',
            new_line
        )
        new_line = re.sub(
            r'(this\.props\.\w+(?:\.\w+)*(?:\([^)]*\))?)\s+as\s+any\b',
            r'(\1: any)',
            new_line
        )
        
        if new_line != line:
            modified = True
        new_lines.append(new_line)

    if modified:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
    return modified


def main():
    files_modified = 0
    for root, dirs, files in os.walk(SRC_DIR):
        for fname in files:
            if not fname.endswith('.js'):
                continue
            filepath = os.path.join(root, fname)
            m1 = remove_component_annotations(filepath)
            m2 = convert_as_casts(filepath)
            if m1 or m2:
                files_modified += 1

    print(f"  Modified {files_modified} files")


if __name__ == '__main__':
    main()
