#!/usr/bin/env python3
"""
Convert // $FlowFixMe[code] comments that are inside JSX to {/* $FlowFixMe[code] */} format.
This is needed because // comments don't work inside JSX element content.
"""

import json
import subprocess
import os
import re
from collections import defaultdict

APP_DIR = os.environ.get('APP_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def looks_like_jsx_context(lines, code_idx):
    """
    Heuristic to detect if a line is inside JSX where // comments are invalid.
    """
    if code_idx < 0 or code_idx >= len(lines):
        return False

    for idx in range(code_idx, min(len(lines), code_idx + 4)):
        stripped = lines[idx].lstrip()
        if not stripped:
            continue
        if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue

        if (
            stripped.startswith('<')
            or stripped.startswith('</')
            or stripped.startswith('<>')
            or stripped.startswith('{<')
            or stripped.startswith('(<')
        ):
            return True

        # JSX expression containers can start with "{" and contain JSX on
        # following lines:
        # {
        #   condition && (
        #     <Component />
        #   )
        # }
        if stripped.startswith('{'):
            for look_ahead in range(idx + 1, min(len(lines), idx + 5)):
                next_stripped = lines[look_ahead].lstrip()
                if not next_stripped:
                    continue
                if (
                    next_stripped.startswith('<')
                    or next_stripped.startswith('</')
                    or next_stripped.startswith('<>')
                ):
                    return True
                if (
                    next_stripped.startswith('//')
                    or next_stripped.startswith('/*')
                    or next_stripped.startswith('*')
                ):
                    continue
                break

        # Common pattern:
        # {
        #   condition && (
        #     <Component />
        #   )
        # }
        if stripped.startswith('(') and idx + 1 < len(lines):
            next_stripped = lines[idx + 1].lstrip()
            if (
                next_stripped.startswith('<')
                or next_stripped.startswith('</')
                or next_stripped.startswith('<>')
            ):
                return True

        return False

    return False


def get_flow_errors():
    """Run flow and get errors as JSON."""
    result = subprocess.run(
        ['npx', 'flow', '--json', '--show-all-errors'],
        capture_output=True, text=True, cwd=APP_DIR,
        timeout=300
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


def main():
    errors = get_flow_errors()
    
    # Find errors where $FlowFixMe is on the line above but not suppressing
    file_fixes = defaultdict(set)
    
    for e in errors:
        msgs = e.get('message', [])
        codes = e.get('error_codes', [])
        if not msgs:
            continue
        loc = msgs[0].get('loc', {})
        source = loc.get('source', '')
        line = loc.get('start', {}).get('line', 0)
        if '/src/' not in source:
            continue
        code = codes[0] if codes else 'incompatible-type'
        
        if not os.path.isfile(source):
            continue
        
        with open(source) as f:
            lines = f.readlines()
        
        if line < 2 or line > len(lines):
            continue
        
        above = lines[line - 2]
        target = '// $FlowFixMe[' + code + ']'
        if target in above:
            file_fixes[source].add(line - 2)
    
    # Convert the failing comments to JSX format
    fixes_count = 0
    reverted_count = 0
    for filepath, fixme_indices in file_fixes.items():
        with open(filepath) as f:
            lines = f.readlines()
        
        modified = False
        converted_indices = set()
        for idx in sorted(fixme_indices):
            if idx >= len(lines):
                continue
            line = lines[idx]
            m = re.match(r'^(\s*)// (\$FlowFixMe\[[^\]]+\])(.*?)$', line.rstrip())
            if m:
                indent = m.group(1)
                fixme = m.group(2)
                rest = m.group(3).strip()
                if rest:
                    lines[idx] = f'{indent}{{/* {fixme} {rest} */}}\n'
                else:
                    lines[idx] = f'{indent}{{/* {fixme} */}}\n'
                modified = True
                fixes_count += 1
                converted_indices.add(idx)

        # If a JSX-style FlowFixMe ended up outside JSX (can happen with noisy
        # parse errors), restore it back to normal // comment syntax.
        # Skip indices that were just converted from Flow error analysis -
        # those are known to be in JSX context even if the heuristic can't tell.
        for idx, line in enumerate(lines):
            if idx in converted_indices:
                continue
            m = re.match(r'^(\s*)\{/\*\s*(\$FlowFixMe\[[^\]]+\])(?:\s+(.*?))?\s*\*/\}\s*$', line.rstrip())
            if not m:
                continue
            if looks_like_jsx_context(lines, idx + 1):
                continue

            indent = m.group(1)
            fixme = m.group(2)
            rest = (m.group(3) or '').strip()
            if rest:
                lines[idx] = f'{indent}// {fixme} {rest}\n'
            else:
                lines[idx] = f'{indent}// {fixme}\n'
            modified = True
            reverted_count += 1
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(lines)
    
    print(f"Converted {fixes_count} FlowFixMe comments to JSX format")
    if reverted_count:
        print(f"Reverted {reverted_count} non-JSX FlowFixMe comments back to // syntax")


if __name__ == '__main__':
    main()
