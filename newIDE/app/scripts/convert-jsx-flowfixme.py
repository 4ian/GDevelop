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
    for filepath, fixme_indices in file_fixes.items():
        with open(filepath) as f:
            lines = f.readlines()
        
        modified = False
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
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(lines)
    
    print(f"Converted {fixes_count} FlowFixMe comments to JSX format")


if __name__ == '__main__':
    main()
