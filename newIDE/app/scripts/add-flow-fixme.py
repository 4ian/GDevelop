#!/usr/bin/env python3
"""
Add $FlowFixMe comments to lines with Flow errors that can't be auto-fixed.
This script is idempotent - running it multiple times produces the same result.
"""

import subprocess
import json
import sys
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
    json_start = output.find('{"flowVersion"')
    if json_start == -1:
        json_start = result.stderr.find('{"flowVersion"')
        if json_start != -1:
            output = result.stderr
        else:
            print("ERROR: Could not find JSON in flow output")
            return []

    json_str = output[json_start:]
    try:
        data = json.loads(json_str)
        return data.get('errors', [])
    except json.JSONDecodeError as e:
        print(f"ERROR: JSON parse error: {e}")
        return []


def add_flowfixme_comments(errors):
    """Add $FlowFixMe comments to files with errors."""
    # Group errors by file and line, collecting ALL error codes per line
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

        # Only fix files in src/ directory of the app
        if APP_DIR + '/src/' not in source:
            continue

        error_code = error_codes[0] if error_codes else 'incompatible-type'
        # Never rely on signature-verification-failure suppressions, as this
        # degrades typed exports/imports too much.
        if error_code == 'signature-verification-failure':
            error_code = 'incompatible-type'
        file_errors[source][line].add(error_code)

    files_modified = 0
    comments_added = 0

    for filepath, line_errors in sorted(file_errors.items()):
        if not os.path.isfile(filepath):
            continue

        try:
            with open(filepath, 'r') as f:
                lines = f.readlines()
        except (IOError, UnicodeDecodeError):
            continue

        # Sort lines in reverse order so we can insert without offset issues
        sorted_lines = sorted(line_errors.keys(), reverse=True)
        modified = False

        for line_num in sorted_lines:
            error_codes = line_errors[line_num]
            idx = line_num - 1  # 0-indexed

            if idx < 0 or idx >= len(lines):
                continue

            # Collect existing $FlowFixMe codes above this line
            existing_codes = set()
            check_idx = idx - 1
            while check_idx >= 0 and '$FlowFixMe' in lines[check_idx]:
                # Extract the code from existing $FlowFixMe comment
                match = re.search(r'\$FlowFixMe\[([^\]]+)\]', lines[check_idx])
                if match:
                    existing_codes.add(match.group(1))
                check_idx -= 1

            # Also check if current line has inline $FlowFixMe
            if '$FlowFixMe' in lines[idx]:
                match = re.search(r'\$FlowFixMe\[([^\]]+)\]', lines[idx])
                if match:
                    existing_codes.add(match.group(1))

            # Determine which codes need to be added
            needed_codes = error_codes - existing_codes

            if not needed_codes:
                continue

            # Get the indentation of the error line
            current_line = lines[idx]
            indent = ''
            for ch in current_line:
                if ch in (' ', '\t'):
                    indent += ch
                else:
                    break

            # Add $FlowFixMe comments for each needed code
            for code in sorted(needed_codes):
                comment = f"{indent}// $FlowFixMe[{code}]\n"
                lines.insert(idx, comment)
                modified = True
                comments_added += 1

        if modified:
            with open(filepath, 'w') as f:
                f.writelines(lines)
            files_modified += 1

    print(f"  Added {comments_added} $FlowFixMe comments across {files_modified} files")
    return comments_added


def main():
    print("  Getting Flow errors...")
    errors = get_flow_errors()
    print(f"  Found {len(errors)} errors total")

    if not errors:
        print("  No errors to fix!")
        return 0

    src_errors = 0
    for error in errors:
        messages = error.get('message', [])
        if messages:
            loc = messages[0].get('loc', {})
            source = loc.get('source', '')
            if APP_DIR + '/src/' in source:
                src_errors += 1

    print(f"  Found {src_errors} errors in src/ files")

    if src_errors == 0:
        print("  No src/ errors to fix!")
        return 0

    count = add_flowfixme_comments(errors)
    return count


if __name__ == '__main__':
    added = main()
    sys.exit(0 if added >= 0 else 1)
