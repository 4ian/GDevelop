#!/usr/bin/env python3
"""
Normalize Flow codemod syntax to Babel-compatible Flow syntax.

Flow 0.299 annotate-exports introduces syntax that older Babel/Flow tooling in this
project cannot parse:
  - component(...) type annotations
  - renders type operator
  - as-casts

This script rewrites those constructs while preserving runtime behavior and as much
type information as possible:
  - component(...) -> React.ComponentType<Props>
  - React.AbstractComponent<Props, Instance> -> React.ComponentType<{...Props, ref?: React.RefSetter<Instance>}>
  - renders T -> T (with renders any/mixed/empty/Fragment normalized to React.Node)
  - expr as T -> (expr: T)

The script is idempotent.
"""

from __future__ import annotations

import json
import os
import pathlib
import re
import subprocess
import sys
from typing import Any, Dict, List, Optional, Tuple

APP_DIR = os.environ.get(
    "APP_DIR",
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
)
SRC_DIR = pathlib.Path(APP_DIR) / "src"
FLOW_BIN = pathlib.Path(APP_DIR) / "node_modules" / ".bin" / "flow"
FLOW_AST_CMD = [str(FLOW_BIN), "ast"] if FLOW_BIN.exists() else ["npx", "flow", "ast"]


def _extract_json(output: str) -> Optional[Dict[str, Any]]:
    start = output.find("{")
    if start == -1:
        return None
    try:
        return json.loads(output[start:])
    except json.JSONDecodeError:
        return None


def _run_flow_ast(relative_path: str, content_text: str) -> Optional[Dict[str, Any]]:
    result = subprocess.run(
        FLOW_AST_CMD + ["--path", relative_path],
        input=content_text.encode("utf-8"),
        capture_output=True,
        cwd=APP_DIR,
    )
    stdout = result.stdout.decode("utf-8", errors="replace")
    stderr = result.stderr.decode("utf-8", errors="replace")
    data = _extract_json(stdout)
    if data is not None:
        return data
    # Flow may occasionally emit JSON to stderr on failure.
    return _extract_json(stderr)


def _walk(node: Any, visit, parent_type: Optional[str] = None) -> None:
    if isinstance(node, dict):
        node_type = node.get("type")
        visit(node, parent_type)
        for value in node.values():
            _walk(value, visit, node_type)
    elif isinstance(node, list):
        for item in node:
            _walk(item, visit, parent_type)


def _node_text(content: bytes, node: Dict[str, Any]) -> str:
    start, end = node["range"]
    return content[start:end].decode("utf-8")


def _is_render_node_like(type_text: str) -> bool:
    normalized = "".join(type_text.split())
    if normalized in {
        "any",
        "mixed",
        "empty",
        "void",
        "null",
        "Fragment",
        "React.Node",
        "React$Node",
        "React.MixedElement",
    }:
        return True
    return (
        "React.Node" in normalized
        or "React$Node" in normalized
        or "React.MixedElement" in normalized
    )


def _normalize_renders_target(type_text: str) -> str:
    stripped = type_text.strip()
    if stripped in {"any", "mixed", "empty", "Fragment"}:
        return "React.Node"
    return stripped


def _object_property_key_name(property_node: Dict[str, Any]) -> Optional[str]:
    key = property_node.get("key")
    if not isinstance(key, dict):
        return None
    key_type = key.get("type")
    if key_type == "Identifier":
        return key.get("name")
    if key_type == "Literal":
        return key.get("value")
    return None


def _object_type_has_ref_property(object_type_node: Dict[str, Any]) -> bool:
    for prop in object_type_node.get("properties", []):
        if not isinstance(prop, dict):
            continue
        if prop.get("type") != "ObjectTypeProperty":
            continue
        if _object_property_key_name(prop) == "ref":
            return True
    return False


def _qualified_type_identifier_name(type_id_node: Any) -> Optional[str]:
    if not isinstance(type_id_node, dict):
        return None
    node_type = type_id_node.get("type")
    if node_type == "Identifier":
        return type_id_node.get("name")
    if node_type == "QualifiedTypeIdentifier":
        left = _qualified_type_identifier_name(type_id_node.get("qualification"))
        right = _qualified_type_identifier_name(type_id_node.get("id"))
        if left and right:
            return f"{left}.{right}"
        return right
    return None


def _is_react_abstract_component_type(type_id_node: Any) -> bool:
    type_name = _qualified_type_identifier_name(type_id_node)
    return type_name in {"React.AbstractComponent", "React$AbstractComponent"}


def _type_parameter_nodes(type_parameters_node: Any) -> List[Dict[str, Any]]:
    if not isinstance(type_parameters_node, dict):
        return []
    params = type_parameters_node.get("params")
    if not isinstance(params, list):
        return []
    return [param for param in params if isinstance(param, dict)]


def _is_ref_setter_type(type_text: str) -> bool:
    stripped = type_text.strip()
    return stripped.startswith("React.RefSetter<") or stripped.startswith(
        "React$RefSetter<"
    )


def _to_ref_setter_type(instance_type_text: str) -> str:
    stripped = instance_type_text.strip()
    if not stripped:
        return "React.RefSetter<mixed>"
    if _is_ref_setter_type(stripped):
        return stripped.replace("React$RefSetter", "React.RefSetter")
    return f"React.RefSetter<{stripped}>"


def _props_text_has_ref_property(props_type_text: str) -> bool:
    return (
        re.search(r"(^|[,{]\s*)\+?ref\??\s*:", props_type_text, re.MULTILINE)
        is not None
    )


def _append_ref_property_to_object_type(
    props_type_text: str, ref_prop_type: str
) -> str:
    original = props_type_text
    stripped = original.rstrip()
    trailing_whitespace = original[len(stripped) :]

    if stripped.startswith("{|") and stripped.endswith("|}"):
        open_token, close_token = "{|", "|}"
    elif stripped.startswith("{") and stripped.endswith("}"):
        open_token, close_token = "{", "}"
    else:
        return f"{{ ...{props_type_text.strip()}, +ref?: {ref_prop_type} }}"

    inner = stripped[len(open_token) : -len(close_token)]
    if _props_text_has_ref_property(inner):
        return props_type_text

    is_multiline = "\n" in stripped
    inner_content = inner.strip()
    if not is_multiline:
        if inner_content:
            separator = "," if not inner_content.endswith(",") else ""
            return (
                f"{open_token} {inner_content}{separator} +ref?: {ref_prop_type} "
                f"{close_token}{trailing_whitespace}"
            )
        return (
            f"{open_token} +ref?: {ref_prop_type} "
            f"{close_token}{trailing_whitespace}"
        )

    # Multiline object type: place the new property on its own line and keep
    # existing indentation style if possible.
    closing_indent_match = re.search(r"\n([ \t]*)\s*$", inner)
    closing_indent = closing_indent_match.group(1) if closing_indent_match else ""
    property_indent_match = re.search(r"\n([ \t]+)\S", inner)
    property_indent = (
        property_indent_match.group(1)
        if property_indent_match
        else f"{closing_indent}  "
    )

    inner_without_trailing_space = inner.rstrip()
    if inner_content:
        if not inner_without_trailing_space.endswith(","):
            inner_without_trailing_space += ","
        if not inner_without_trailing_space.endswith("\n"):
            inner_without_trailing_space += "\n"
        new_inner = (
            f"{inner_without_trailing_space}"
            f"{property_indent}+ref?: {ref_prop_type},\n"
            f"{closing_indent}"
        )
    else:
        new_inner = (
            f"\n{property_indent}+ref?: {ref_prop_type},\n"
            f"{closing_indent}"
        )

    return f"{open_token}{new_inner}{close_token}{trailing_whitespace}"


def _with_optional_ref_property(
    props_type_text: str,
    props_type_node: Optional[Dict[str, Any]],
    instance_type_text: Optional[str],
) -> str:
    if not instance_type_text:
        return props_type_text
    if _props_text_has_ref_property(props_type_text):
        return props_type_text
    ref_prop_type = _to_ref_setter_type(instance_type_text)
    if props_type_node and props_type_node.get("type") == "ObjectTypeAnnotation":
        if _object_type_has_ref_property(props_type_node):
            return props_type_text
        return _append_ref_property_to_object_type(props_type_text, ref_prop_type)
    if props_type_text.strip() == "any":
        return f"{{ +ref?: {ref_prop_type}, ... }}"
    return f"{{ ...{props_type_text}, +ref?: {ref_prop_type} }}"


def _abstract_component_to_component_type(
    node: Dict[str, Any], content: bytes
) -> Optional[str]:
    if node.get("type") != "GenericTypeAnnotation":
        return None
    if not _is_react_abstract_component_type(node.get("id")):
        return None

    type_params = _type_parameter_nodes(node.get("typeParameters"))
    if not type_params:
        return "React.ComponentType<any>"

    props_node = type_params[0]
    props_type = (
        _node_text(content, props_node).strip() if "range" in props_node else "any"
    )
    if not props_type:
        props_type = "any"

    instance_type = None
    if len(type_params) >= 2:
        instance_node = type_params[1]
        if "range" in instance_node:
            instance_type = _node_text(content, instance_node).strip()

    props_type = _with_optional_ref_property(props_type, props_node, instance_type)
    return f"React.ComponentType<{props_type}>"


def _extract_ref_type_from_component(
    component_node: Dict[str, Any], content: bytes
) -> Optional[str]:
    # Form: component(ref: Type, ...Props)
    for param in component_node.get("params", []):
        if not isinstance(param, dict):
            continue
        if param.get("name") == "ref":
            type_annotation = param.get("typeAnnotation")
            if isinstance(type_annotation, dict) and "range" in type_annotation:
                return _node_text(content, type_annotation).strip()

    # Form: component(...{ ...Props, +ref?: Type })
    rest = component_node.get("rest")
    if not isinstance(rest, dict):
        return None
    rest_type = rest.get("typeAnnotation")
    if not isinstance(rest_type, dict):
        return None
    if rest_type.get("type") != "ObjectTypeAnnotation":
        return None
    for prop in rest_type.get("properties", []):
        if not isinstance(prop, dict):
            continue
        if prop.get("type") != "ObjectTypeProperty":
            continue
        if _object_property_key_name(prop) != "ref":
            continue
        value = prop.get("value")
        if isinstance(value, dict) and "range" in value:
            return _node_text(content, value).strip()
    return None


def _component_to_legacy_type(
    component_node: Dict[str, Any], content: bytes
) -> str:
    props_type = "any"
    props_type_node: Optional[Dict[str, Any]] = None
    rest = component_node.get("rest")
    if isinstance(rest, dict):
        rest_type = rest.get("typeAnnotation")
        if isinstance(rest_type, dict) and "range" in rest_type:
            props_type_node = rest_type
            extracted_props = _node_text(content, rest_type).strip()
            if extracted_props:
                props_type = extracted_props

    ref_type = _extract_ref_type_from_component(component_node, content)

    renders_type = None
    renders = component_node.get("rendersType")
    if isinstance(renders, dict):
        rendered = renders.get("typeAnnotation")
        if isinstance(rendered, dict) and "range" in rendered:
            renders_type = _node_text(content, rendered).strip()

    ref_instance_type = ref_type
    if not ref_instance_type and renders_type and not _is_render_node_like(renders_type):
        # Non-React-node renders targets generally represent a component
        # interface/instance type. In modern Flow this is represented with a
        # `ref` prop typed with React.RefSetter<Instance>.
        ref_instance_type = renders_type

    props_type = _with_optional_ref_property(
        props_type, props_type_node, ref_instance_type
    )

    return f"React.ComponentType<{props_type}>"


def _apply_replacements(
    content: bytes, replacements: List[Tuple[int, int, str]]
) -> Tuple[bytes, int]:
    valid: List[Tuple[int, int, bytes]] = []
    for start, end, replacement in replacements:
        if start >= end:
            continue
        replacement_bytes = replacement.encode("utf-8")
        if content[start:end] == replacement_bytes:
            continue
        valid.append((start, end, replacement_bytes))

    if not valid:
        return content, 0

    # Prefer outer nodes first when ranges overlap.
    valid.sort(key=lambda item: (item[0], -(item[1] - item[0])))
    non_overlapping: List[Tuple[int, int, bytes]] = []
    current_end = -1
    for start, end, replacement_bytes in valid:
        if start < current_end:
            continue
        non_overlapping.append((start, end, replacement_bytes))
        current_end = end

    updated = bytearray(content)
    for start, end, replacement_bytes in reversed(non_overlapping):
        updated[start:end] = replacement_bytes

    return bytes(updated), len(non_overlapping)


def _collect_component_and_renders_replacements(
    ast: Dict[str, Any], content: bytes
) -> List[Tuple[int, int, str]]:
    replacements: List[Tuple[int, int, str]] = []

    def visit(node: Dict[str, Any], parent_type: Optional[str]) -> None:
        node_type = node.get("type")
        if node_type == "ComponentTypeAnnotation" and "range" in node:
            start, end = node["range"]
            replacements.append((start, end, _component_to_legacy_type(node, content)))
            return

        if node_type == "GenericTypeAnnotation" and "range" in node:
            replacement = _abstract_component_to_component_type(node, content)
            if replacement:
                start, end = node["range"]
                replacements.append((start, end, replacement))

        if (
            node_type == "TypeOperator"
            and node.get("operator") == "renders"
            and parent_type != "ComponentTypeAnnotation"
            and "range" in node
        ):
            type_annotation = node.get("typeAnnotation")
            if isinstance(type_annotation, dict) and "range" in type_annotation:
                rendered_type = _node_text(content, type_annotation)
                replacements.append(
                    (
                        node["range"][0],
                        node["range"][1],
                        _normalize_renders_target(rendered_type),
                    )
                )

    _walk(ast, visit)
    return replacements


def _collect_as_replacements(
    ast: Dict[str, Any], content: bytes
) -> List[Tuple[int, int, str]]:
    replacements: List[Tuple[int, int, str]] = []

    def visit(node: Dict[str, Any], _parent_type: Optional[str]) -> None:
        if node.get("type") != "AsExpression":
            return
        if "range" not in node:
            return
        expression = node.get("expression")
        type_annotation = node.get("typeAnnotation")
        if not isinstance(expression, dict) or "range" not in expression:
            return
        if not isinstance(type_annotation, dict) or "range" not in type_annotation:
            return

        start, end = node["range"]
        expr_start, expr_end = expression["range"]
        type_start, _type_end = type_annotation["range"]
        type_text = _node_text(content, type_annotation)

        leading = content[start:expr_start].decode("utf-8")
        expr_core = content[expr_start:expr_end].decode("utf-8")
        between = content[expr_end:type_start].decode("utf-8")
        as_index = between.rfind(" as ")
        if as_index == -1:
            return

        between_before_as = between[:as_index]
        trailing_comment = ""

        line_comment_index = between_before_as.rfind("//")
        block_comment_index = between_before_as.rfind("/*")
        if line_comment_index != -1:
            trailing_comment = between_before_as[line_comment_index:].strip()
            between_before_as = between_before_as[:line_comment_index]
        elif block_comment_index != -1 and "*/" in between_before_as[block_comment_index:]:
            trailing_comment = between_before_as[block_comment_index:].strip()
            between_before_as = between_before_as[:block_comment_index]

        expression_text = f"{leading}{expr_core}{between_before_as}".rstrip()
        replacement = f"({expression_text}: {type_text})"
        if trailing_comment:
            replacement = f"{replacement} {trailing_comment}"
        replacements.append((start, end, replacement))

    _walk(ast, visit)
    return replacements


def _remove_stale_prop_missing_fixmes(content: bytes) -> Tuple[bytes, int]:
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        return content, 0

    lines = text.splitlines(keepends=True)
    keep_lines: List[str] = []
    removed = 0

    specific_fixme_re = re.compile(r"^\s*// \$FlowFixMe\[prop-missing\]\s*$")
    any_fixme_re = re.compile(r"^\s*// \$FlowFixMe\[[^\]]+\]\s*$")

    i = 0
    while i < len(lines):
        current_stripped = lines[i].strip()
        if specific_fixme_re.match(current_stripped):
            j = i + 1
            inspected = 0
            remove_current = False
            while j < len(lines) and inspected < 8:
                candidate = lines[j].strip()
                inspected += 1
                if not candidate:
                    j += 1
                    continue
                if any_fixme_re.match(candidate):
                    j += 1
                    continue
                if "React.ComponentType<" in lines[j]:
                    remove_current = True
                break
            if remove_current:
                removed += 1
                i += 1
                continue
        keep_lines.append(lines[i])
        i += 1

    if removed == 0:
        return content, 0
    return "".join(keep_lines).encode("utf-8"), removed


def _process_file(path: pathlib.Path) -> Tuple[bool, int]:
    original = path.read_bytes()

    # Quick pre-filter to avoid expensive AST parsing on unrelated files.
    has_componenttype_prop_missing = (
        b"$FlowFixMe[prop-missing]" in original and b"React.ComponentType<" in original
    )
    if (
        b"component(" not in original
        and b"renders " not in original
        and b" as " not in original
        and b"AbstractComponent" not in original
        and b"React$AbstractComponent" not in original
        and not has_componenttype_prop_missing
    ):
        return False, 0

    try:
        text = original.decode("utf-8")
    except UnicodeDecodeError:
        return False, 0

    relative_path = os.path.relpath(path, APP_DIR)
    ast = _run_flow_ast(relative_path, text)
    if ast is None:
        return False, 0

    content = original
    total_replacements = 0

    # Pass 1: component(...) + renders.
    pass1_replacements = _collect_component_and_renders_replacements(ast, content)
    content, applied = _apply_replacements(content, pass1_replacements)
    total_replacements += applied

    # Pass 2: "as" casts. Run iteratively to handle nested casts.
    for _ in range(10):
        if b" as " not in content:
            break
        try:
            content_text = content.decode("utf-8")
        except UnicodeDecodeError:
            break
        as_ast = _run_flow_ast(relative_path, content_text)
        if as_ast is None:
            break
        as_replacements = _collect_as_replacements(as_ast, content)
        content, applied = _apply_replacements(content, as_replacements)
        total_replacements += applied
        if applied == 0:
            break

    content, removed_fixmes = _remove_stale_prop_missing_fixmes(content)
    total_replacements += removed_fixmes

    if content != original:
        path.write_bytes(content)
        return True, total_replacements
    return False, 0


def main() -> int:
    files_modified = 0
    replacements_applied = 0

    for path in sorted(SRC_DIR.rglob("*.js")):
        if not path.is_file():
            continue
        modified, replacements = _process_file(path)
        if modified:
            files_modified += 1
            replacements_applied += replacements

    print(f"  Modified {files_modified} files ({replacements_applied} replacements)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
