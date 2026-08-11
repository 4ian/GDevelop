"""Convert glTF 2.0 JSON files and their dependencies into standalone GLBs.

Load this payload with ``runpy`` inside Blender Foundation's official Blender
MCP ``execute_blender_code`` tool, then call ``run_mcp`` with a mapping. The
payload uses the connected Blender session and never locates or launches a
local Blender executable. It supports one file or a directory batch while
preserving relative paths in the output tree.

By default cameras, punctual lights, and Blender-generated bone-display helper
objects are excluded. Meshes, materials, textures, skins, and animations are
kept, and each output is checked as a valid GLB 2.0 container.
"""

from __future__ import annotations

import json
import struct
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote, urlparse

import bpy


GLB_MAGIC = b"glTF"
GLB_VERSION = 2
GLB_JSON_CHUNK = 0x4E4F534A


class ConversionError(RuntimeError):
    """A user-facing conversion failure."""


@dataclass(frozen=True)
class ConversionOptions:
    input: str
    output: str | None = None
    output_dir: str | None = None
    recursive: bool = False
    overwrite: bool = False
    include_cameras: bool = False
    include_lights: bool = False
    export_animations: bool = True
    apply_modifiers: bool = True
    allow_animation_count_change: bool = False
    dry_run: bool = False
    debug: bool = False


@dataclass(frozen=True)
class ConversionJob:
    source: Path
    output: Path


def log(message: str) -> None:
    print(f"[gltf-to-glb] {message}", flush=True)


def clear_working_data() -> None:
    """Clear task data without resetting Blender or unloading the MCP add-on."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)
    bpy.data.orphans_purge(do_recursive=True)


def options_from_mcp(values: dict[str, Any]) -> ConversionOptions:
    """Validate the mapping passed by Blender MCP."""
    if not isinstance(values, dict):
        raise ConversionError("MCP options must be a mapping")

    allowed = {
        "input",
        "output",
        "output_dir",
        "recursive",
        "overwrite",
        "include_cameras",
        "include_lights",
        "export_animations",
        "apply_modifiers",
        "allow_animation_count_change",
        "dry_run",
        "debug",
    }
    unknown = sorted(set(values) - allowed)
    if unknown:
        raise ConversionError(f"Unknown MCP options: {unknown}")

    def required_text(name: str) -> str:
        value = values.get(name)
        if not isinstance(value, str) or not value.strip():
            raise ConversionError(f"MCP option {name!r} must be a non-empty string")
        return value

    def optional_text(name: str) -> str | None:
        value = values.get(name)
        if value is None:
            return None
        if not isinstance(value, str) or not value.strip():
            raise ConversionError(f"MCP option {name!r} must be a non-empty string")
        return value

    def boolean(name: str, default: bool) -> bool:
        value = values.get(name, default)
        if not isinstance(value, bool):
            raise ConversionError(f"MCP option {name!r} must be a boolean")
        return value

    output = optional_text("output")
    output_dir = optional_text("output_dir")
    if output and output_dir:
        raise ConversionError("MCP options 'output' and 'output_dir' are mutually exclusive")

    return ConversionOptions(
        input=required_text("input"),
        output=output,
        output_dir=output_dir,
        recursive=boolean("recursive", False),
        overwrite=boolean("overwrite", False),
        include_cameras=boolean("include_cameras", False),
        include_lights=boolean("include_lights", False),
        export_animations=boolean("export_animations", True),
        apply_modifiers=boolean("apply_modifiers", True),
        allow_animation_count_change=boolean(
            "allow_animation_count_change", False
        ),
        dry_run=boolean("dry_run", False),
        debug=boolean("debug", False),
    )


def resolved_path(path_text: str) -> Path:
    return Path(path_text).expanduser().resolve()


def discover_gltf_files(root: Path, recursive: bool) -> list[Path]:
    candidates = root.rglob("*") if recursive else root.iterdir()
    return sorted(
        (path.resolve() for path in candidates if path.is_file() and path.suffix.lower() == ".gltf"),
        key=lambda path: str(path).casefold(),
    )


def build_jobs(args: ConversionOptions) -> list[ConversionJob]:
    source = resolved_path(args.input)
    if not source.exists():
        raise ConversionError(f"Input does not exist: {source}")

    if source.is_file():
        if source.suffix.lower() != ".gltf":
            raise ConversionError(f"Input file must use the .gltf extension: {source}")
        if args.output:
            output = resolved_path(args.output)
        elif args.output_dir:
            output = resolved_path(args.output_dir) / source.with_suffix(".glb").name
        else:
            output = source.with_suffix(".glb")
        if output.suffix.lower() != ".glb":
            raise ConversionError(f"Output file must use the .glb extension: {output}")
        return [ConversionJob(source=source, output=output)]

    if args.output:
        raise ConversionError("MCP option 'output' can only be used with one input file")
    if not args.output_dir:
        raise ConversionError("MCP option 'output_dir' is required for a directory input")
    output_root = resolved_path(args.output_dir)
    source_files = discover_gltf_files(source, args.recursive)
    if not source_files:
        scope = "recursively" if args.recursive else "at the directory's top level"
        raise ConversionError(f"No .gltf files found {scope}: {source}")
    return [
        ConversionJob(
            source=source_file,
            output=(output_root / source_file.relative_to(source)).with_suffix(".glb"),
        )
        for source_file in source_files
    ]


def load_gltf_json(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8-sig") as file:
            data = json.load(file)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise ConversionError(f"Cannot read glTF JSON {path}: {error}") from error
    if not isinstance(data, dict):
        raise ConversionError(f"glTF root must be a JSON object: {path}")
    version = str(data.get("asset", {}).get("version", ""))
    if not version.startswith("2"):
        raise ConversionError(f"Only glTF 2.x is supported; {path} reports version {version!r}")
    return data


def collection_count(data: dict[str, Any], name: str) -> int:
    value = data.get(name, [])
    return len(value) if isinstance(value, list) else 0


def gltf_stats(data: dict[str, Any]) -> dict[str, int]:
    return {
        name: collection_count(data, name)
        for name in (
            "scenes",
            "nodes",
            "meshes",
            "materials",
            "textures",
            "images",
            "skins",
            "animations",
        )
    }


def referenced_external_uris(data: dict[str, Any]) -> list[str]:
    uris: list[str] = []
    for collection_name in ("buffers", "images"):
        collection = data.get(collection_name, [])
        if not isinstance(collection, list):
            continue
        for item in collection:
            if isinstance(item, dict) and isinstance(item.get("uri"), str):
                uris.append(item["uri"])
    return uris


def verify_external_dependencies(source: Path, data: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    for uri in referenced_external_uris(data):
        parsed = urlparse(uri)
        if parsed.scheme in {"data", "http", "https"}:
            continue
        uri_path = Path(unquote(parsed.path))
        dependency = uri_path if uri_path.is_absolute() else source.parent / uri_path
        if not dependency.is_file():
            missing.append(uri)
    if missing:
        raise ConversionError(
            f"Missing external files referenced by {source.name}: {', '.join(missing)}"
        )
    return referenced_external_uris(data)


def imported_actions() -> list[bpy.types.Action]:
    return list(bpy.data.actions)


def normalize_action_names(
    source_data: dict[str, Any], actions: list[bpy.types.Action]
) -> None:
    animations = source_data.get("animations", [])
    if not isinstance(animations, list) or len(animations) != len(actions):
        return
    names = [
        animation.get("name") if isinstance(animation, dict) else None
        for animation in animations
    ]
    if any(not isinstance(name, str) or not name for name in names):
        return
    desired_names = [str(name) for name in names]
    if len(set(desired_names)) != len(desired_names):
        return
    for index, action in enumerate(actions):
        action.name = f"__gltf_to_glb_action_{index:04d}__"
    for action, desired_name in zip(actions, desired_names):
        action.name = desired_name


def source_node_names(source_data: dict[str, Any]) -> set[str]:
    nodes = source_data.get("nodes", [])
    if not isinstance(nodes, list):
        return set()
    return {
        node["name"]
        for node in nodes
        if isinstance(node, dict) and isinstance(node.get("name"), str)
    }


def remove_generated_bone_helpers(source_data: dict[str, Any]) -> list[str]:
    original_names = source_node_names(source_data)
    helpers: set[bpy.types.Object] = set()
    for armature in (obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"):
        for pose_bone in armature.pose.bones:
            custom_shape = pose_bone.custom_shape
            if custom_shape is not None and custom_shape.name not in original_names:
                helpers.add(custom_shape)
                pose_bone.custom_shape = None
    helper_names = sorted(obj.name for obj in helpers)
    for helper in helpers:
        if helper.name in bpy.data.objects:
            bpy.data.objects.remove(helper, do_unlink=True)
    return helper_names


def prepare_export_objects(
    include_cameras: bool, include_lights: bool
) -> list[bpy.types.Object]:
    export_objects: list[bpy.types.Object] = []
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type == "CAMERA" and not include_cameras:
            continue
        if obj.type == "LIGHT" and not include_lights:
            continue
        obj.hide_set(False)
        obj.hide_viewport = False
        obj.hide_render = False
        obj.select_set(True)
        export_objects.append(obj)
    if not export_objects:
        raise ConversionError("The imported glTF contains no exportable scene objects")
    bpy.context.view_layer.objects.active = export_objects[0]
    return export_objects


def supported_export_options(requested: dict[str, Any]) -> dict[str, Any]:
    available = {
        prop.identifier for prop in bpy.ops.export_scene.gltf.get_rna_type().properties
    }
    return {name: value for name, value in requested.items() if name in available}


def export_glb(
    output: Path,
    include_cameras: bool,
    include_lights: bool,
    export_animations: bool,
    apply_modifiers: bool,
) -> None:
    requested: dict[str, Any] = {
        "filepath": str(output),
        "export_format": "GLB",
        "use_selection": True,
        "export_cameras": include_cameras,
        "export_lights": include_lights,
        "export_apply": apply_modifiers,
        "export_animations": export_animations,
        "export_animation_mode": "ACTIONS",
        "export_merge_animation": "ACTION",
        "export_anim_single_armature": True,
        "export_force_sampling": True,
        "export_skins": True,
        "export_yup": True,
    }
    options = supported_export_options(requested)
    result = bpy.ops.export_scene.gltf(**options)
    if "FINISHED" not in result or not output.is_file():
        raise ConversionError(f"Blender failed to export: {output}")


def load_glb_json(path: Path) -> tuple[dict[str, Any], dict[str, int]]:
    try:
        file_size = path.stat().st_size
        with path.open("rb") as file:
            header = file.read(12)
            if len(header) != 12:
                raise ConversionError(f"GLB header is truncated: {path}")
            magic, version, declared_size = struct.unpack("<4sII", header)
            if magic != GLB_MAGIC:
                raise ConversionError(f"Invalid GLB magic bytes: {path}")
            if version != GLB_VERSION:
                raise ConversionError(f"Expected GLB version 2, found {version}: {path}")
            if declared_size != file_size:
                raise ConversionError(
                    f"GLB length mismatch: header={declared_size}, file={file_size}: {path}"
                )
            chunk_header = file.read(8)
            if len(chunk_header) != 8:
                raise ConversionError(f"GLB JSON chunk header is truncated: {path}")
            json_length, chunk_type = struct.unpack("<II", chunk_header)
            if chunk_type != GLB_JSON_CHUNK:
                raise ConversionError(f"The first GLB chunk is not JSON: {path}")
            json_bytes = file.read(json_length)
            if len(json_bytes) != json_length:
                raise ConversionError(f"GLB JSON chunk is truncated: {path}")
        data = json.loads(json_bytes.decode("utf-8").rstrip("\x00 \t\r\n"))
    except (OSError, UnicodeError, json.JSONDecodeError, struct.error) as error:
        raise ConversionError(f"Cannot validate output GLB {path}: {error}") from error
    if not isinstance(data, dict):
        raise ConversionError(f"GLB JSON root must be an object: {path}")
    return data, gltf_stats(data)


def convert_job(job: ConversionJob, args: ConversionOptions) -> dict[str, Any]:
    source_data = load_gltf_json(job.source)
    dependencies = verify_external_dependencies(job.source, source_data)
    source_counts = gltf_stats(source_data)

    job.output.parent.mkdir(parents=True, exist_ok=True)
    clear_working_data()
    result = bpy.ops.import_scene.gltf(filepath=str(job.source))
    if "FINISHED" not in result:
        raise ConversionError(f"Blender failed to import: {job.source}")

    actions = imported_actions()
    normalize_action_names(source_data, actions)
    for action in actions:
        action.use_fake_user = True
    removed_helpers = remove_generated_bone_helpers(source_data)
    export_objects = prepare_export_objects(args.include_cameras, args.include_lights)
    export_glb(
        job.output,
        include_cameras=args.include_cameras,
        include_lights=args.include_lights,
        export_animations=args.export_animations,
        apply_modifiers=args.apply_modifiers,
    )
    _output_data, output_counts = load_glb_json(job.output)

    if source_counts["meshes"] > 0 and output_counts["meshes"] == 0:
        raise ConversionError(f"Output lost all meshes: {job.output}")
    if args.export_animations and not args.allow_animation_count_change:
        if output_counts["animations"] != source_counts["animations"]:
            raise ConversionError(
                "Animation count changed during conversion: "
                f"source={source_counts['animations']}, output={output_counts['animations']} "
                f"for {job.source.name}"
            )

    return {
        "source": str(job.source),
        "output": str(job.output),
        "outputBytes": job.output.stat().st_size,
        "externalDependencies": dependencies,
        "sourceCounts": source_counts,
        "outputCounts": output_counts,
        "importedActions": [action.name for action in actions],
        "exportedObjects": sorted(obj.name for obj in export_objects),
        "removedGeneratedHelpers": removed_helpers,
    }


def run(args: ConversionOptions) -> dict[str, Any]:
    jobs = build_jobs(args)
    log(f"Blender {bpy.app.version_string}")
    log(f"Planned conversions: {len(jobs)}")

    if args.dry_run:
        for job in jobs:
            log(f"DRY RUN {job.source} -> {job.output}")
        summary = {
            "success": True,
            "dryRun": True,
            "planned": len(jobs),
            "jobs": [
                {"source": str(job.source), "output": str(job.output)} for job in jobs
            ],
        }
        log("SUMMARY " + json.dumps(summary, sort_keys=True))
        return summary

    converted: list[dict[str, Any]] = []
    skipped: list[dict[str, str]] = []
    failed: list[dict[str, str]] = []
    for index, job in enumerate(jobs, start=1):
        if job.output.exists() and not args.overwrite:
            record = {
                "source": str(job.source),
                "output": str(job.output),
                "reason": "output exists; set MCP option 'overwrite' to true to replace it",
            }
            skipped.append(record)
            log(f"SKIP [{index}/{len(jobs)}] {job.output}")
            continue
        log(f"CONVERT [{index}/{len(jobs)}] {job.source} -> {job.output}")
        try:
            record = convert_job(job, args)
            converted.append(record)
            log("RESULT " + json.dumps(record, sort_keys=True))
        except Exception as error:  # Keep batch conversion useful after one bad file.
            record = {
                "source": str(job.source),
                "output": str(job.output),
                "error": str(error),
            }
            failed.append(record)
            log(f"ERROR: {job.source}: {error}")
            if args.debug:
                traceback.print_exc()

    summary = {
        "success": not failed,
        "planned": len(jobs),
        "converted": len(converted),
        "skipped": len(skipped),
        "failed": len(failed),
        "outputs": [record["output"] for record in converted],
        "skips": skipped,
        "failures": failed,
    }
    log("SUMMARY " + json.dumps(summary, sort_keys=True))
    return summary


def run_mcp(values: dict[str, Any]) -> dict[str, Any]:
    """Run in the connected Blender session and return an MCP-safe result."""
    try:
        return run(options_from_mcp(values))
    except ConversionError as error:
        return {"success": False, "error": str(error)}
