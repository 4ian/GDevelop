#!/usr/bin/env python3
"""
Add $FlowFixMe comments to lines with Flow errors that can't be auto-fixed.
This script is idempotent - running it multiple times produces the same result.
"""

import subprocess
import json
import sys
import os
from collections import defaultdict

APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_flow_errors():
    """Run flow and get errors as JSON."""
    result = subprocess.run(
        ['npx', 'flow', '--json', '--show-all-errors'],
        capture_output=True, text=True, cwd=APP_DIR
    )
    try:
        data = json.loads(result.stdout)
        return data.get('errors', [])
    except json.JSONDecodeError:
        # Try to find JSON in the output (skip npm output)
        for line in result.stdout.split('\n'):
            line = line.strip()
            if line.startswith('{'):
                try:
                    data = json.loads(line)
                    return data.get('errors', [])
                except json.JSONDecodeError:
                    continue
        print("ERROR: Could not parse flow JSON output")
        print("STDOUT:", result.stdout[:500])
        print("STDERR:", result.stderr[:500])
        return []


def add_flowfixme_comments(errors):
    """Add $FlowFixMe comments to files with errors."""
    # Group errors by file and line
    file_errors = defaultdict(dict)
    
    for error in errors:
        messages = error.get('message', [])
        error_codes = error.get('error_codes', [])
        
        if not messages:
            continue
            
        primary = messages[0]
        source = primary.get('loc', {}).get('source', primary.get('path', ''))
        line = primary.get('loc', {}).get('start', {}).get('line', primary.get('line', 0))
        descr = primary.get('descr', '')
        
        if not source or not line:
            continue
            
        # Only fix files in src/ directory  
        if '/src/' not in source:
            continue
            
        # Skip if already has a FlowFixMe on or above this line
        error_code = error_codes[0] if error_codes else 'unknown'
        
        # Store the error info
        if line not in file_errors[source]:
            file_errors[source][line] = {
                'code': error_code,
                'descr': descr[:80]
            }
    
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
            error_info = line_errors[line_num]
            idx = line_num - 1  # 0-indexed
            
            if idx < 0 or idx >= len(lines):
                continue
            
            # Check if there's already a $FlowFixMe comment on the line above
            if idx > 0 and '$FlowFixMe' in lines[idx - 1]:
                continue
            
            # Check if the current line itself has $FlowFixMe
            if '$FlowFixMe' in lines[idx]:
                continue
                
            # Get the indentation of the error line
            current_line = lines[idx]
            indent = ''
            for ch in current_line:
                if ch in (' ', '\t'):
                    indent += ch
                else:
                    break
            
            # Add $FlowFixMe comment
            comment = f"{indent}// $FlowFixMe[{error_info['code']}]\n"
            lines.insert(idx, comment)
            modified = True
            comments_added += 1
        
        if modified:
            with open(filepath, 'w') as f:
                f.writelines(lines)
            files_modified += 1
    
    print(f"Added {comments_added} $FlowFixMe comments across {files_modified} files")


def main():
    print("Getting Flow errors...")
    errors = get_flow_errors()
    print(f"Found {len(errors)} errors")
    
    if errors:
        print("Adding $FlowFixMe comments...")
        add_flowfixme_comments(errors)
    else:
        print("No errors to fix!")


if __name__ == '__main__':
    main()
