#!/usr/bin/env python3
"""Convert glTF 2.0 JSON files and their dependencies into standalone GLBs.

Run this script with Blender, not a system Python interpreter. It supports one
file or a directory batch while preserving relative paths in the output tree.

Single-file example (PowerShell):

  & "D:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" `
    --background --factory-startup `
    --python skills/gdevelop-project-files/scripts/convert_gltf_to_glb.py -- `
    --input "D:\\models\\wand.gltf" `
    --output "D:\\models\\wand.glb" `
    --overwrite

Batch example:

  & "D:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" `
    --background --factory-startup `
    --python skills/gdevelop-project-files/scripts/convert_gltf_to_glb.py -- `
    --input "D:\\models\\gltf" `
    --output-dir "D:\\models\\glb" `
    --recursive --overwrite

By default cameras, punctual lights, and Blender-generated bone-display helper
objects are excluded. Meshes, materials, textures, skins, and animations are
kept, and each output is checked as a valid GLB 2.0 container.
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
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
class ConversionJob:
    source: Path
    output: Path


def log(message: str) -> None:
    print(f"[gltf-to-glb] {message}", flush=True)


def blender_cli_arguments() -> list[str]:
    if "--" not in sys.argv:
        return []
    return sys.argv[sys.argv.index("--") + 1 :]


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Convert a .gltf file or a directory of .gltf files into "
            "standalone binary .glb files."
        )
    )
    parser.add_argument("--input", required=True, help="Input .gltf file or directory")
    destination = parser.add_mutually_exclusive_group()
    destination.add_argument("--output", help="Output .glb path for a single file")
    destination.add_argument(
        "--output-dir",
        help="Output directory; required when --input is a directory",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Search input directories recursively and preserve subdirectories",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing output files; otherwise they are skipped",
    )
    parser.add_argument(
        "--include-cameras",
        action="store_true",
        help="Keep imported cameras in the output GLB",
    )
    parser.add_argument(
        "--include-lights",
        action="store_true",
        help="Keep imported punctual lights in the output GLB",
    )
    parser.add_argument(
        "--no-animations",
        action="store_true",
        help="Do not export animations",
    )
    parser.add_argument(
        "--no-apply-modifiers",
        action="store_true",
        help="Do not ask Blender's glTF exporter to apply compatible modifiers",
    )
    parser.add_argument(
        "--allow-animation-count-change",
        action="store_true",
        help=(
            "Allow the output animation count to differ from the source. "
            "Without this option, a changed count is treated as a failure."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned conversions without importing or exporting",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Print Python tracebacks for failed conversions",
    )
    return parser.parse_args(blender_cli_arguments())


def resolved_path(path_text: str) -> Path:
    return Path(path_text).expanduser().resolve()


def discover_gltf_files(root: Path, recursive: bool) -> list[Path]:
    candidates = root.rglob("*") if recursive else root.iterdir()
    return sorted(
        (path.resolve() for path in candidates if path.is_file() and path.suffix.lower() == ".gltf"),
        key=lambda path: str(path).casefold(),
    )


def build_jobs(args: argparse.Namespace) -> list[ConversionJob]:
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
        raise ConversionError("--output can only be used with a single input file")
    if not args.output_dir:
        raise ConversionError("--output-dir is required when --input is a directory")
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


def convert_job(job: ConversionJob, args: argparse.Namespace) -> dict[str, Any]:
    source_data = load_gltf_json(job.source)
    dependencies = verify_external_dependencies(job.source, source_data)
    source_counts = gltf_stats(source_data)

    job.output.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
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
        export_animations=not args.no_animations,
        apply_modifiers=not args.no_apply_modifiers,
    )
    _output_data, output_counts = load_glb_json(job.output)

    if source_counts["meshes"] > 0 and output_counts["meshes"] == 0:
        raise ConversionError(f"Output lost all meshes: {job.output}")
    if not args.no_animations and not args.allow_animation_count_change:
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


def run(args: argparse.Namespace) -> dict[str, Any]:
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
                "reason": "output exists; pass --overwrite to replace it",
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
            print(f"[gltf-to-glb] ERROR: {job.source}: {error}", file=sys.stderr, flush=True)
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
    if failed:
        raise SystemExit(2)
    return summary


def main() -> None:
    try:
        run(parse_arguments())
    except ConversionError as error:
        print(f"[gltf-to-glb] ERROR: {error}", file=sys.stderr, flush=True)
        raise SystemExit(2) from error


if __name__ == "__main__":
    main()
