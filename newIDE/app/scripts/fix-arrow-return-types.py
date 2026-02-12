#!/usr/bin/env python3
"""
Fix arrow-function inline object return types that prettier 1.15 can't parse.

The Flow codemod may add return type annotations like:
    const foo = (): { prop: Type, ... } => { ... }

Prettier 1.15 cannot parse  (): { ... } =>  because it confuses the opening
brace of the return type with a function body.

This script detects files with prettier parse errors and, for each one,
extracts the inline object return type into a named type alias:

    type _FooReturnType = { prop: Type, ... };
    const foo = (): _FooReturnType => { ... }

The script is idempotent.
"""

import os
import re
import subprocess
import sys

APP_DIR = os.environ.get('APP_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(APP_DIR, 'src')


def get_prettier_errors():
    """Run prettier --list-different and find files with syntax errors."""
    result = subprocess.run(
        ['npx', 'prettier', '--list-different', 'src/!(locales)/**/*.js'],
        capture_output=True, text=True, cwd=APP_DIR, timeout=120
    )
    # Combine stdout and stderr to find error lines
    all_output = result.stdout + '\n' + result.stderr
    error_files = set()
    for line in all_output.split('\n'):
        m = re.match(r'\[error\]\s+(src/\S+\.js):\s+SyntaxError', line)
        if m:
            error_files.add(os.path.join(APP_DIR, m.group(1)))
    return error_files


def find_brace_end(content, start):
    """Find the matching closing brace for an opening brace at position start."""
    depth = 0
    i = start
    while i < len(content):
        ch = content[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return i
        elif ch == "'" or ch == '"' or ch == '`':
            # Skip strings
            quote = ch
            i += 1
            while i < len(content) and content[i] != quote:
                if content[i] == '\\':
                    i += 1
                i += 1
        elif ch == '/' and i + 1 < len(content):
            if content[i + 1] == '/':
                # Line comment
                i = content.find('\n', i)
                if i == -1:
                    return -1
            elif content[i + 1] == '*':
                # Block comment
                i = content.find('*/', i + 2)
                if i == -1:
                    return -1
                i += 1
        i += 1
    return -1


def extract_identifier_name(content, pos):
    """Extract the identifier name before `= (` at the given position."""
    # Walk backwards from `= (` to find the variable/const name
    i = pos - 1
    while i >= 0 and content[i] in ' \t':
        i -= 1
    if i < 0 or content[i] != '=':
        return None
    i -= 1
    while i >= 0 and content[i] in ' \t':
        i -= 1
    if i < 0:
        return None
    end = i + 1
    while i >= 0 and (content[i].isalnum() or content[i] == '_' or content[i] == '$'):
        i -= 1
    name = content[i + 1:end]
    if name and name[0].isalpha():
        return name
    return None


def fix_file(filepath):
    """Fix arrow function return types in a single file."""
    with open(filepath) as f:
        content = f.read()

    original = content
    # Pattern: = (params): { ... } => {
    # We need to find  ): {  where { starts a type annotation, not a body
    # The type annotation ends with  } =>
    pattern = re.compile(r'(=\s*\([^)]*\))\s*:\s*\{')

    insertions = []  # (position, type_name, type_body) to insert before the line
    replacements = []  # (start, end, replacement)
    used_names = set()

    for m in pattern.finditer(content):
        prefix = m.group(1)  # e.g., '= (params)'
        brace_start = content.index('{', m.start() + len(prefix))
        brace_end = find_brace_end(content, brace_start)

        if brace_end == -1:
            continue

        # Check if followed by  =>  { (arrow function body)
        after_brace = content[brace_end + 1:].lstrip()
        if not after_brace.startswith('=>'):
            continue

        # Verify the type spans multiple lines (single-line types are ok for prettier)
        type_text = content[brace_start:brace_end + 1]
        if '\n' not in type_text:
            continue

        # Get the identifier name for the type alias
        call_start = content.index('(', m.start())
        name = extract_identifier_name(content, call_start)
        if not name:
            name = 'Anonymous'

        # Create a unique type name
        base_type_name = f'_{name[0].upper()}{name[1:]}ReturnType'
        type_name = base_type_name
        suffix = 2
        while type_name in used_names:
            type_name = f'{base_type_name}{suffix}'
            suffix += 1
        used_names.add(type_name)

        # Find the line start for inserting the type declaration
        line_start = content.rfind('\n', 0, m.start())
        if line_start == -1:
            line_start = 0
        else:
            line_start += 1

        insertions.append((line_start, type_name, type_text))

        # Replace  ): { ...type... } =>  with  ): TypeName =>
        colon_pos = content.index(':', m.start() + len(prefix))
        replacements.append((colon_pos, brace_end + 1, f': {type_name}'))

    if not replacements:
        return False

    # Apply replacements in reverse order
    combined = list(zip(insertions, replacements))
    combined.sort(key=lambda x: x[1][0], reverse=True)

    for (insert_pos, type_name, type_body), (rep_start, rep_end, rep_text) in combined:
        content = content[:rep_start] + rep_text + content[rep_end:]

    # Now insert type declarations (from bottom to top to maintain positions)
    insertion_list = [(ins[0], ins[1], ins[2]) for ins, _ in combined]
    insertion_list.sort(key=lambda x: x[0], reverse=True)
    for insert_pos, type_name, type_body in insertion_list:
        type_decl = f'type {type_name} = {type_body};\n'
        content = content[:insert_pos] + type_decl + content[insert_pos:]

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False


def main():
    # First, find files that have prettier parse errors
    error_files = get_prettier_errors()

    if not error_files:
        print("  No prettier parse errors found - no fixes needed.")
        return

    print(f"  Found {len(error_files)} files with prettier parse errors")

    fixed = 0
    for filepath in sorted(error_files):
        if fix_file(filepath):
            fixed += 1
            print(f"    Fixed: {os.path.relpath(filepath, SRC_DIR)}")

    print(f"  Fixed {fixed} files")

    # Verify no more errors
    remaining = get_prettier_errors()
    if remaining:
        print(f"  WARNING: {len(remaining)} files still have prettier parse errors:")
        for f in sorted(remaining):
            print(f"    {os.path.relpath(f, SRC_DIR)}")


if __name__ == '__main__':
    main()
