#!/usr/bin/env python3
"""
Post-process Flow codemod output to convert new syntax to Babel-compatible syntax.

Converts:
1. 'renders Type' return/type annotations -> 'React.Node' (or 'any')
2. 'component(...)' type annotations -> 'React.AbstractComponent<Props, mixed>'
3. 'expr as Type' casts -> '(expr: Type)' old-style casts

This script is idempotent.
"""

import os
import re
import sys

APP_DIR = os.environ.get('APP_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(APP_DIR, 'src')

# ===========================================================================
# Utilities
# ===========================================================================

def find_matching_paren_forward(content, start, open_ch='(', close_ch=')'):
    """From an open paren at 'start', find the matching close paren."""
    depth = 1
    i = start + 1
    n = len(content)
    in_sq = in_dq = in_tpl = False
    while i < n and depth > 0:
        c = content[i]
        if in_sq:
            if c == '\\': i += 1
            elif c == "'": in_sq = False
        elif in_dq:
            if c == '\\': i += 1
            elif c == '"': in_dq = False
        elif in_tpl:
            if c == '\\': i += 1
            elif c == '`': in_tpl = False
        else:
            if c == "'": in_sq = True
            elif c == '"': in_dq = True
            elif c == '`': in_tpl = True
            elif c == open_ch: depth += 1
            elif c == close_ch: depth -= 1
        i += 1
    return i - 1 if depth == 0 else -1


def find_matching_paren_backward(content, end, open_ch='(', close_ch=')'):
    """From a close paren at 'end', find the matching open paren."""
    depth = 1
    i = end - 1
    in_sq = in_dq = in_tpl = False
    while i >= 0 and depth > 0:
        c = content[i]
        if in_sq:
            if i > 0 and content[i - 1] == '\\': i -= 1
            elif c == "'": in_sq = False
        elif in_dq:
            if i > 0 and content[i - 1] == '\\': i -= 1
            elif c == '"': in_dq = False
        elif in_tpl:
            if i > 0 and content[i - 1] == '\\': i -= 1
            elif c == '`': in_tpl = False
        else:
            if c == "'": in_sq = True
            elif c == '"': in_dq = True
            elif c == '`': in_tpl = True
            elif c == close_ch: depth += 1
            elif c == open_ch: depth -= 1
        i -= 1
    return i + 1 if depth == 0 else -1


def classify_chars(content):
    """Classify each character as 'code', 'string', or 'comment'.
    Handles JSX text where apostrophes/quotes are NOT string delimiters."""
    n = len(content)
    result = ['code'] * n
    i = 0
    while i < n:
        if content[i:i+2] == '//' and result[i] == 'code':
            j = i
            while j < n and content[j] != '\n':
                result[j] = 'comment'
                j += 1
            i = j
            continue
        if content[i:i+2] == '/*' and result[i] == 'code':
            j = i
            end = content.find('*/', j + 2)
            if end == -1: end = n - 2
            for k in range(j, min(end + 2, n)):
                result[k] = 'comment'
            i = end + 2
            continue
        # Single-quoted string (must close on same line)
        if content[i] == "'" and result[i] == 'code':
            j = i + 1
            found_close = False
            while j < n and content[j] != '\n':
                if content[j] == '\\':
                    j += 1
                elif content[j] == "'":
                    found_close = True
                    break
                j += 1
            if found_close:
                for k in range(i, j + 1):
                    result[k] = 'string'
                i = j + 1
            else:
                i += 1
            continue
        # Double-quoted string (must close on same line)
        if content[i] == '"' and result[i] == 'code':
            j = i + 1
            found_close = False
            while j < n and content[j] != '\n':
                if content[j] == '\\':
                    j += 1
                elif content[j] == '"':
                    found_close = True
                    break
                j += 1
            if found_close:
                for k in range(i, j + 1):
                    result[k] = 'string'
                i = j + 1
            else:
                i += 1
            continue
        # Template literal (can span lines)
        if content[i] == '`' and result[i] == 'code':
            result[i] = 'string'
            j = i + 1
            while j < n and content[j] != '`':
                if content[j] == '\\':
                    result[j] = 'string'
                    j += 1
                if j < n:
                    result[j] = 'string'
                j += 1
            if j < n:
                result[j] = 'string'
            i = j + 1
            continue
        i += 1
    return result


def is_in_import(content, pos):
    """Check if position is inside an import statement (including multi-line)."""
    line_start = content.rfind('\n', 0, pos)
    line_start = 0 if line_start == -1 else line_start + 1
    line = content[line_start:].lstrip()

    # Direct import line
    if line.startswith('import ') or line.startswith('import{'):
        return True

    # Multi-line import: scan backward for 'import {' without a closing '}'
    j = pos
    brace_depth = 0
    while j >= 0:
        c = content[j]
        if c == '}':
            brace_depth += 1
        elif c == '{':
            if brace_depth > 0:
                brace_depth -= 1
            else:
                # Unmatched { - check if preceded by import
                before = content[max(0, j - 50):j + 1]
                if re.search(r'\bimport\s+(?:type\s+)?\{', before):
                    return True
                return False
        elif c == ';':
            return False
        j -= 1

    return False


# ===========================================================================
# 1. Convert 'component(...)' type annotations
# ===========================================================================

def convert_component_annotations(content):
    """Convert 'component(...)' type annotations to React.AbstractComponent."""
    pattern = re.compile(r'((?:export\s+)?(?:const|let|var)\s+\w+)\s*:\s*component\(')

    iterations = 0
    while iterations < 200:
        m = pattern.search(content)
        if not m:
            break
        iterations += 1

        decl_prefix = m.group(1)
        paren_start = m.end() - 1

        paren_end = find_matching_paren_forward(content, paren_start)
        if paren_end == -1:
            break

        # After ), there may be "renders TYPE" and then "="
        after_paren = content[paren_end + 1:]
        renders_match = re.match(r'\s*(?:renders\s+\w[\w.$]*(?:<[^>]*>)?)?\s*=', after_paren)
        if not renders_match:
            # Skip this occurrence to avoid infinite loop
            content = content[:m.start()] + decl_prefix + ' /* component-type-removed */ ' + content[m.end():]
            continue

        eq_pos = paren_end + 1 + renders_match.end() - 1

        # Extract Props from what follows =
        after_eq = content[eq_pos + 1:].lstrip()
        memo_match = re.match(r'React\.memo<(\w+)>', after_eq)
        fwd_match = re.match(r'React\.forwardRef<(\w+),\s*([^>]+)>', after_eq)

        if fwd_match:
            props_type = fwd_match.group(1)
            ref_type = fwd_match.group(2).strip()
            replacement_type = f'React.AbstractComponent<{props_type}, {ref_type}>'
        elif memo_match:
            props_type = memo_match.group(1)
            replacement_type = f'React.AbstractComponent<{props_type}, mixed>'
        else:
            component_args = content[paren_start + 1:paren_end]
            spread_match = re.match(r'\s*\.\.\.(\w+)\s*$', component_args)
            if spread_match:
                props_type = spread_match.group(1)
                replacement_type = f'React.AbstractComponent<{props_type}, mixed>'
            else:
                replacement_type = 'React.AbstractComponent<any, mixed>'

        content = content[:m.start()] + decl_prefix + ': ' + replacement_type + ' ' + content[eq_pos:]

    return content


# ===========================================================================
# 2. Convert ') as component(...)' casts
# ===========================================================================

def convert_as_component_casts(content):
    """Convert ') as component(...)' multiline casts."""
    pattern = re.compile(r'\)\s+as\s+component\(')

    iterations = 0
    while iterations < 200:
        m = pattern.search(content)
        if not m:
            break
        iterations += 1

        paren_start = m.end() - 1
        paren_end = find_matching_paren_forward(content, paren_start)
        if paren_end == -1:
            break

        after = content[paren_end + 1:]
        renders_match = re.match(r'\s*renders\s+\w[\w.$]*(?:<[^>]*>)?', after)
        cast_end = paren_end + 1
        if renders_match:
            cast_end += renders_match.end()

        # Extract Props
        component_args = content[paren_start + 1:paren_end]
        spread_match = re.match(r'\s*\.\.\.(\w+)\s*$', component_args)
        if spread_match:
            props_type = spread_match.group(1)
        elif '...any' in component_args:
            props_type = 'any'
        else:
            brace_match = re.search(r'\.\.\.\s*(\w+)', component_args)
            props_type = brace_match.group(1) if brace_match else 'any'

        close_paren_pos = m.start()
        open_paren_pos = find_matching_paren_backward(content, close_paren_pos)
        if open_paren_pos == -1:
            content = content[:m.start() + 1] + content[cast_end:]
            continue

        # Find function call before the (
        j = open_paren_pos - 1
        while j >= 0 and content[j] in ' \t':
            j -= 1
        if j >= 0 and content[j] == '>':
            angle_open = find_matching_paren_backward(content, j, '<', '>')
            if angle_open >= 0:
                j = angle_open - 1
                while j >= 0 and content[j] in ' \t':
                    j -= 1
        if j >= 0 and (content[j].isalnum() or content[j] in '_$.'):
            k = j
            while k > 0 and (content[k - 1].isalnum() or content[k - 1] in '_$.'):
                k -= 1
        else:
            k = open_paren_pos

        ref_type = 'mixed'
        fwd_match = re.search(r'forwardRef<\w+,\s*([^>]+)>', content[max(0, open_paren_pos - 60):open_paren_pos + 1])
        if fwd_match:
            ref_type = fwd_match.group(1).strip()

        replacement_type = f'React.AbstractComponent<{props_type}, {ref_type}>'
        expr_text = content[k:close_paren_pos + 1]
        replacement = f'({expr_text}: {replacement_type})'
        content = content[:k] + replacement + content[cast_end:]

    return content


# ===========================================================================
# 3. Convert 'renders Type' annotations
# ===========================================================================

def convert_renders_annotations(content):
    """Convert 'renders Type' to 'React.Node' in type/return annotations."""
    # Return type: ): renders TYPE =>  or  ): renders TYPE {
    content = re.sub(
        r'\):\s*renders\s+(\w[\w.]*(?:<[^>]*>)?)\s*(=>|\{)',
        r'): React.Node \2',
        content
    )
    # Return type with null union: ): null | renders TYPE =>
    content = re.sub(
        r'\):\s*null\s*\|\s*renders\s+(\w[\w.]*(?:<[^>]*>)?)\s*(=>|\{)',
        r'): null | React.Node \2',
        content
    )
    # Object type position: : renders any, -> : any,
    content = re.sub(
        r':\s*renders\s+any\b',
        ': any',
        content
    )
    # Remaining renders
    content = re.sub(r'\brenders\s+Fragment\b', 'React.Node', content)
    content = re.sub(r'\brenders\s+React\.Node\b', 'React.Node', content)
    content = re.sub(r'\brenders\s+React\$Node\b', 'React.Node', content)
    content = re.sub(r'\brenders\s+any\b', 'React.Node', content)

    return content


# ===========================================================================
# 4. Convert 'as Type' casts
# ===========================================================================

def find_type_end(content, start):
    """Find the end of a type expression starting at 'start'."""
    i = start
    n = len(content)
    depth_paren = depth_angle = depth_bracket = depth_brace = 0

    while i < n and content[i] in ' \t':
        i += 1

    while i < n:
        c = content[i]
        if c == '(':
            depth_paren += 1
        elif c == ')':
            if depth_paren > 0: depth_paren -= 1
            else: break
        elif c == '<':
            depth_angle += 1
        elif c == '>':
            if depth_angle > 0: depth_angle -= 1
            else: break
        elif c == '[':
            depth_bracket += 1
        elif c == ']':
            if depth_bracket > 0: depth_bracket -= 1
            else: break
        elif c == '{':
            depth_brace += 1
        elif c == '}':
            if depth_brace > 0: depth_brace -= 1
            else: break
        elif depth_paren == 0 and depth_angle == 0 and depth_bracket == 0 and depth_brace == 0:
            if c in ',;':
                break
            if c == '=' and (i + 1 >= n or content[i + 1] != '>'):
                break
            if c == '\n':
                rest = content[i + 1:].lstrip()
                if rest and rest[0] in '|&':
                    i += 1
                    continue
                break
        i += 1

    while i > start and content[i - 1] in ' \t\n\r':
        i -= 1
    return i


def find_expr_start(content, as_pos):
    """Find the start of the expression before ' as ' at as_pos."""
    i = as_pos - 1
    while i >= 0 and content[i] in ' \t':
        i -= 1
    if i < 0:
        return 0

    c = content[i]

    if c == ')':
        open_pos = find_matching_paren_backward(content, i)
        if open_pos == -1:
            return i
        j = open_pos - 1
        while j >= 0 and content[j] in ' \t':
            j -= 1
        if j >= 0 and content[j] == '>':
            angle_open = find_matching_paren_backward(content, j, '<', '>')
            if angle_open >= 0:
                j = angle_open - 1
                while j >= 0 and content[j] in ' \t':
                    j -= 1
        if j >= 0 and (content[j].isalnum() or content[j] in '_$'):
            k = j
            while k > 0 and (content[k - 1].isalnum() or content[k - 1] in '_$.'):
                k -= 1
            if k >= 4 and content[k - 4:k] == 'new ':
                k -= 4
            return k
        return open_pos

    elif c == ']':
        open_pos = find_matching_paren_backward(content, i, '[', ']')
        return open_pos if open_pos >= 0 else i

    elif c == '`':
        j = i - 1
        while j >= 0:
            if content[j] == '`':
                break
            if j > 0 and content[j - 1] == '\\':
                j -= 1
            j -= 1
        if j > 0 and (content[j - 1].isalpha() or content[j - 1] == '_'):
            j -= 1
            while j > 0 and (content[j - 1].isalpha() or content[j - 1] == '_'):
                j -= 1
        return max(0, j)

    elif c == '>' and i >= 1:
        # Self-closing JSX: <Tag ... />
        # Check if preceded by / (possibly with whitespace)
        j = i - 1
        while j >= 0 and content[j] in ' \t':
            j -= 1
        if j >= 0 and content[j] == '/':
            # Scan backward to find <
            k = j - 1
            brace_depth = 0
            while k >= 0:
                ch = content[k]
                if ch == '}': brace_depth += 1
                elif ch == '{':
                    if brace_depth > 0: brace_depth -= 1
                elif ch == '<' and brace_depth == 0:
                    return k
                k -= 1
            return max(0, k)

        # Closing JSX tag: </Tag>
        j = i - 1
        while j >= 0 and (content[j].isalnum() or content[j] in '_.'):
            j -= 1
        if j >= 1 and content[j] == '/' and content[j - 1] == '<':
            tag_name = content[j + 1:i]
            search_pos = j - 2
            while search_pos >= 0:
                idx = content.rfind('<' + tag_name, 0, search_pos + 1)
                if idx < 0:
                    break
                if idx > 0 and content[idx - 1] == '/':
                    search_pos = idx - 2
                    continue
                after_idx = idx + 1 + len(tag_name)
                if after_idx < len(content) and (content[after_idx] in ' \t\n>/' or not content[after_idx].isalnum()):
                    return idx
                search_pos = idx - 1
            return max(0, j - 1)

    # Identifier or member expression
    if c.isalnum() or c in '_$':
        j = i
        while j > 0 and (content[j - 1].isalnum() or content[j - 1] in '_$.'):
            j -= 1
        prefix_start = max(0, j - 5)
        prefix = content[prefix_start:j].rstrip()
        if prefix.endswith('new'):
            j = prefix_start + prefix.rfind('new')
        return j

    return as_pos


def convert_type_text(type_text):
    """Convert new Flow type syntax in a type to old syntax."""
    type_text = re.sub(r'\brenders\s+any\b', 'React.Node', type_text)
    type_text = re.sub(r'\brenders\s+React\.Node\b', 'React.Node', type_text)
    type_text = re.sub(r'\brenders\s+React\$Node\b', 'React.Node', type_text)
    type_text = re.sub(r'\brenders\s+Fragment\b', 'React.Node', type_text)

    m = re.match(r'component\(', type_text)
    if m:
        depth = 1
        pos = m.end()
        while pos < len(type_text) and depth > 0:
            if type_text[pos] == '(': depth += 1
            elif type_text[pos] == ')': depth -= 1
            pos += 1
        args = type_text[m.end():pos - 1]
        spread_m = re.match(r'\s*\.\.\.(\w+)\s*$', args)
        props_type = spread_m.group(1) if spread_m else 'any'
        type_text = f'React.AbstractComponent<{props_type}, mixed>'

    return type_text


def fix_multiline_as_casts(content):
    """Fix multiline 'as' casts where a comment separates expr from 'as Type'.

    The codemod sometimes produces:
        expr // comment
     as Type
    This needs to be joined so the as is on the same line.
    """
    # Pattern: something before comment \n whitespace as Type
    pattern = re.compile(r'(\S)([ \t]*//.+)\n([ \t]+)as\s+(\w)')

    iterations = 0
    while iterations < 500:
        m = pattern.search(content)
        if not m:
            break
        iterations += 1

        expr_last_char = m.group(1)
        comment = m.group(2)
        indent = m.group(3)
        type_first_char = m.group(4)

        # Get the full type
        type_start_in_content = m.start(4)
        type_end = find_type_end(content, type_start_in_content)
        type_text = content[type_start_in_content:type_end].strip()

        # Check what follows the type (comma, semicolon, etc.)
        after_type = content[type_end:type_end + 5].lstrip()

        if after_type and after_type[0] == ',':
            # Replace: expr as Type, // comment
            new_text = f'{expr_last_char} as {type_text},{comment}\n{indent}'
            content = content[:m.start(1)] + new_text + content[type_end + 1:]
        elif after_type and after_type[0] == ';':
            new_text = f'{expr_last_char} as {type_text};{comment}\n{indent}'
            content = content[:m.start(1)] + new_text + content[type_end + 1:]
        else:
            new_text = f'{expr_last_char} as {type_text},{comment}\n{indent}'
            content = content[:m.start(1)] + new_text + content[type_end:]

    return content


def convert_as_casts(content):
    """Convert 'expr as Type' casts to '(expr: Type)' old-style casts."""
    # First fix multiline as casts
    content = fix_multiline_as_casts(content)

    char_class = classify_chars(content)

    # Find all ' as ' positions in code (not in strings/comments)
    as_positions = []
    i = 0
    n = len(content)
    while i < n - 4:
        if (content[i:i + 4] == ' as ' and
            char_class[i] == 'code' and
            char_class[i + 1] == 'code' and
            char_class[i + 2] == 'code' and
            char_class[i + 3] == 'code'):

            if not is_in_import(content, i):
                after = content[i + 4:i + 50].lstrip()
                if after and (after[0].isupper() or
                             after[0:3] == 'any' or
                             after[0:6] == 'string' or
                             after[0:6] == 'number' or
                             after[0:7] == 'boolean' or
                             after[0:5] == 'empty' or
                             after[0:7] == 'renders' or
                             after[0:9] == 'component' or
                             after[0:2] == 'gd' or
                             after[0] == '"' or
                             after[0] == '{' or
                             after[0] == '(' or
                             after[0] == '['):
                    as_positions.append(i)
        i += 1

    for pos in reversed(as_positions):
        expr_start = find_expr_start(content, pos)
        type_start = pos + 4
        type_end = find_type_end(content, type_start)

        expr_text = content[expr_start:pos].rstrip()
        type_text = content[type_start:type_end].strip()
        type_text = convert_type_text(type_text)

        replacement = f'({expr_text}: {type_text})'
        content = content[:expr_start] + replacement + content[type_end:]

    return content


# ===========================================================================
# Main processing
# ===========================================================================

def extract_object_return_types(content):
    """Extract multi-line object return types into type aliases.

    Babel can't parse arrow functions with inline object return types that
    contain arrow functions (ambiguous syntax). Extract these into type aliases.

    Converts:
        ): {
          prop: Type,
        } => {

    Into:
        type FuncNameReturn = { prop: Type };
        ...
        ): FuncNameReturn => {
    """
    # Pattern: ): {\n ... \n} =>
    pattern = re.compile(r'\):\s*\{(?=\s*\n)')

    iterations = 0
    while iterations < 200:
        m = pattern.search(content)
        if not m:
            break
        iterations += 1

        brace_start = m.end() - 1  # position of {

        brace_end = find_matching_paren_forward(content, brace_start, '{', '}')
        if brace_end == -1:
            break

        after_brace = content[brace_end + 1:brace_end + 20].lstrip()
        if not after_brace.startswith('=>'):
            # Not a return type annotation, skip by marking
            content = content[:m.start()] + ')/*:*/{' + content[brace_start + 1:]
            continue

        # Extract the object type
        obj_type = content[brace_start:brace_end + 1]

        # Flatten for the type alias
        flat_type = ' '.join(obj_type.split())
        # Remove trailing comma before }
        flat_type = re.sub(r',\s*\}$', ' }', flat_type)

        # Find the function name for the type alias
        # Look backward from ): to find the CLOSEST function/variable name
        before = content[:m.start()]
        # Find all matches and take the last one (closest to the return type)
        func_matches = list(re.finditer(r'(?:const|let|var|function)\s+(\w+)', before[max(0, len(before)-500):]))
        func_match = func_matches[-1] if func_matches else None
        if func_match:
            func_name = func_match.group(1)
            # Capitalize first letter for type name
            type_name = func_name[0].upper() + func_name[1:] + 'Return'
        else:
            type_name = f'_ReturnType{iterations}'

        # Check if alias already exists
        if f'type {type_name} = ' in content:
            # Already extracted, just use the alias
            content = content[:m.start()] + f'): {type_name}' + content[brace_end + 1:]
            continue

        # Find where to insert the type alias (before the export/const/function line)
        insert_line_match = None
        if func_match:
            insert_line_match = re.search(
                r'(?:^|\n)((?:export\s+)?(?:const|let|var|function)\s+' + re.escape(func_name) + r'\b)',
                before
            )
        if insert_line_match:
            insert_pos = insert_line_match.start()
            if content[insert_pos] == '\n':
                insert_pos += 1
            type_alias = f'type {type_name} = {flat_type};\n\n'
            content = content[:insert_pos] + type_alias + content[insert_pos:]
            # Adjust: re-find the return type position since we inserted text
            # The offset is len(type_alias)
            offset = len(type_alias)
            new_m = pattern.search(content, insert_pos + offset)
            if new_m:
                new_brace_start = new_m.end() - 1
                new_brace_end = find_matching_paren_forward(content, new_brace_start, '{', '}')
                if new_brace_end >= 0:
                    content = content[:new_m.start()] + f'): {type_name}' + content[new_brace_end + 1:]
        else:
            # Fallback: just flatten the type
            content = content[:m.start()] + f'): {flat_type}' + content[brace_end + 1:]

    content = content.replace('/*:*/', ':')
    return content


def process_file(filepath):
    """Process a single file."""
    try:
        with open(filepath, 'r') as f:
            content = f.read()
    except (IOError, UnicodeDecodeError):
        return False

    original = content

    # Order matters: component() before renders, renders before as
    content = convert_component_annotations(content)
    content = convert_as_component_casts(content)
    content = convert_renders_annotations(content)
    content = convert_as_casts(content)
    content = extract_object_return_types(content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False


def main():
    files_modified = 0
    files_checked = 0

    for root, dirs, files in os.walk(SRC_DIR):
        for fname in files:
            if not fname.endswith('.js'):
                continue
            filepath = os.path.join(root, fname)
            files_checked += 1
            if process_file(filepath):
                files_modified += 1

    print(f"  Checked {files_checked} files, modified {files_modified}")
    return files_modified


if __name__ == '__main__':
    count = main()
    sys.exit(0)
