#!/usr/bin/env python3
"""Convert FBX files to standalone GLBs while preserving animations.

Run this utility through Blender Foundation's official Blender MCP server.
Load it with ``runpy`` inside ``execute_blender_code_for_cli`` and call
``run_with_arguments`` with command-line-style arguments. The script supports
one FBX file or a directory batch, preserves relative paths for recursive
batches, imports referenced images, exports skins and actions, and validates
the resulting GLB 2.0 container before replacing the requested destination.

Animation import and export are enabled by default. Existing outputs are never
replaced unless ``--overwrite`` is passed. The connected/background ``.blend``
is used only as a disposable execution host and is never saved by this script.
"""

from __future__ import annotations

import argparse
import json
import os
import struct
import sys
import traceback
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

try:
    import bpy
except ModuleNotFoundError:  # Allows non-Blender --dry-run planning and py_compile.
    bpy = None  # type: ignore[assignment]


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
    require_animations: bool = False
    apply_modifiers: bool = True
    allow_animation_count_change: bool = False
    allow_missing_images: bool = False
    image_search: bool = True
    ignore_leaf_bones: bool = False
    automatic_bone_orientation: bool = False
    force_connect_children: bool = False
    global_scale: float = 1.0
    dry_run: bool = False
    debug: bool = False


@dataclass(frozen=True)
class ConversionJob:
    source: Path
    output: Path


def log(message: str) -> None:
    print(f"[fbx-to-glb] {message}", flush=True)


def blender_cli_arguments() -> list[str]:
    if "--" not in sys.argv:
        return sys.argv[1:]
    return sys.argv[sys.argv.index("--") + 1 :]


def create_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Convert one FBX file, or a directory of FBX files, to validated "
            "binary glTF while preserving animation actions by default."
        )
    )
    parser.add_argument("--input", required=True, help="Input .fbx file or directory")
    destination = parser.add_mutually_exclusive_group()
    destination.add_argument("--output", help="Output .glb path for one input file")
    destination.add_argument(
        "--output-dir",
        help="Output directory; required when --input is a directory",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="Discover FBX files recursively and preserve relative directories",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace an existing output only after a temporary GLB validates",
    )
    parser.add_argument(
        "--include-cameras",
        action="store_true",
        help="Include imported cameras in each GLB",
    )
    parser.add_argument(
        "--include-lights",
        action="store_true",
        help="Include imported punctual lights in each GLB",
    )
    parser.add_argument(
        "--no-animations",
        dest="export_animations",
        action="store_false",
        help="Intentionally omit imported animations",
    )
    parser.add_argument(
        "--require-animations",
        action="store_true",
        help="Fail when an FBX imports without any animation actions",
    )
    parser.add_argument(
        "--no-apply-modifiers",
        dest="apply_modifiers",
        action="store_false",
        help="Do not apply non-armature modifiers during GLB export",
    )
    parser.add_argument(
        "--allow-animation-count-change",
        action="store_true",
        help="Allow the output animation count to differ from imported actions",
    )
    parser.add_argument(
        "--allow-missing-images",
        action="store_true",
        help="Continue when Blender reports unresolved file-backed images",
    )
    parser.add_argument(
        "--no-image-search",
        dest="image_search",
        action="store_false",
        help="Disable recursive image lookup beside the FBX",
    )
    parser.add_argument(
        "--ignore-leaf-bones",
        action="store_true",
        help="Ignore FBX end bones; this changes the imported skeleton",
    )
    parser.add_argument(
        "--automatic-bone-orientation",
        action="store_true",
        help="Reorient imported bones; use only when the target workflow requires it",
    )
    parser.add_argument(
        "--force-connect-children",
        action="store_true",
        help="Force child bones to connect to parents during FBX import",
    )
    parser.add_argument(
        "--global-scale",
        type=float,
        default=1.0,
        help="FBX import scale in Blender's supported range 0.001 to 1000",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate paths and report jobs without launching an import/export",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Print Python tracebacks for failed batch items",
    )
    parser.set_defaults(export_animations=True, apply_modifiers=True, image_search=True)
    return parser


def parse_arguments(arguments: list[str] | None = None) -> argparse.Namespace:
    parser = create_argument_parser()
    args = parser.parse_args(blender_cli_arguments() if arguments is None else arguments)
    if not 0.001 <= args.global_scale <= 1000.0:
        parser.error("--global-scale must be between 0.001 and 1000")
    if args.require_animations and not args.export_animations:
        parser.error("--require-animations cannot be combined with --no-animations")
    return args


def options_from_namespace(args: argparse.Namespace) -> ConversionOptions:
    return ConversionOptions(
        input=args.input,
        output=args.output,
        output_dir=args.output_dir,
        recursive=args.recursive,
        overwrite=args.overwrite,
        include_cameras=args.include_cameras,
        include_lights=args.include_lights,
        export_animations=args.export_animations,
        require_animations=args.require_animations,
        apply_modifiers=args.apply_modifiers,
        allow_animation_count_change=args.allow_animation_count_change,
        allow_missing_images=args.allow_missing_images,
        image_search=args.image_search,
        ignore_leaf_bones=args.ignore_leaf_bones,
        automatic_bone_orientation=args.automatic_bone_orientation,
        force_connect_children=args.force_connect_children,
        global_scale=args.global_scale,
        dry_run=args.dry_run,
        debug=args.debug,
    )


def resolved_path(path_text: str) -> Path:
    return Path(path_text).expanduser().resolve()


def discover_fbx_files(root: Path, recursive: bool) -> list[Path]:
    candidates: Iterable[Path] = root.rglob("*") if recursive else root.iterdir()
    return sorted(
        (
            path.resolve()
            for path in candidates
            if path.is_file() and path.suffix.lower() == ".fbx"
        ),
        key=lambda path: str(path).casefold(),
    )


def build_jobs(args: ConversionOptions) -> list[ConversionJob]:
    source = resolved_path(args.input)
    if not source.exists():
        raise ConversionError(f"Input does not exist: {source}")

    if source.is_file():
        if source.suffix.lower() != ".fbx":
            raise ConversionError(f"Input file must use the .fbx extension: {source}")
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
        raise ConversionError("--output can only be used with one input file")
    if not args.output_dir:
        raise ConversionError("--output-dir is required for a directory input")
    output_root = resolved_path(args.output_dir)
    source_files = discover_fbx_files(source, args.recursive)
    if not source_files:
        scope = "recursively" if args.recursive else "at the directory's top level"
        raise ConversionError(f"No .fbx files found {scope}: {source}")
    return [
        ConversionJob(
            source=source_file,
            output=(output_root / source_file.relative_to(source)).with_suffix(".glb"),
        )
        for source_file in source_files
    ]


def require_blender() -> None:
    if bpy is None:
        raise ConversionError(
            "This conversion must run inside Blender through the official Blender MCP; "
            "only --dry-run is available in system Python"
        )


def clear_working_data() -> None:
    """Clear task data without saving or replacing the execution-host blend file."""
    require_blender()
    active = bpy.context.object
    if active is not None and active.mode != "OBJECT":
        try:
            bpy.ops.object.mode_set(mode="OBJECT")
        except RuntimeError:
            pass
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)
    for data_collection in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.armatures,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.cameras,
        bpy.data.lights,
        bpy.data.collections,
    ):
        for datablock in list(data_collection):
            data_collection.remove(datablock, do_unlink=True)
    bpy.data.orphans_purge(do_recursive=True)


def supported_operator_options(operator: Any, requested: dict[str, Any]) -> dict[str, Any]:
    available = {prop.identifier for prop in operator.get_rna_type().properties}
    return {name: value for name, value in requested.items() if name in available}


def import_fbx(source: Path, args: ConversionOptions) -> dict[str, Any]:
    requested: dict[str, Any] = {
        "filepath": str(source),
        "use_manual_orientation": False,
        "global_scale": args.global_scale,
        "bake_space_transform": False,
        "use_custom_normals": True,
        "use_image_search": args.image_search,
        "use_anim": args.export_animations or args.require_animations,
        "use_custom_props": True,
        "use_custom_props_enum_as_string": True,
        "ignore_leaf_bones": args.ignore_leaf_bones,
        "force_connect_children": args.force_connect_children,
        "automatic_bone_orientation": args.automatic_bone_orientation,
        "use_prepost_rot": True,
        "mtl_name_collision_mode": "MAKE_UNIQUE",
    }
    options = supported_operator_options(bpy.ops.import_scene.fbx, requested)
    result = bpy.ops.import_scene.fbx(**options)
    if "FINISHED" not in result:
        raise ConversionError(f"Blender failed to import: {source}")
    return options


def imported_scene_report() -> dict[str, Any]:
    objects = list(bpy.context.scene.objects)
    object_type_counts: dict[str, int] = {}
    for obj in objects:
        object_type_counts[obj.type] = object_type_counts.get(obj.type, 0) + 1
    return {
        "objectCount": len(objects),
        "objectTypeCounts": dict(sorted(object_type_counts.items())),
        "objects": sorted(obj.name for obj in objects),
        "actionCount": len(bpy.data.actions),
        "actions": sorted(action.name for action in bpy.data.actions),
        "materialCount": len(bpy.data.materials),
        "imageCount": len(bpy.data.images),
        "armatureCount": object_type_counts.get("ARMATURE", 0),
    }


def unresolved_file_images() -> list[dict[str, str]]:
    unresolved: list[dict[str, str]] = []
    for image in bpy.data.images:
        if image.source != "FILE" or image.packed_file is not None:
            continue
        filepath = image.filepath_from_user() or image.filepath
        absolute = Path(bpy.path.abspath(filepath)).resolve() if filepath else None
        if absolute is None or not absolute.is_file():
            unresolved.append(
                {
                    "image": image.name,
                    "path": str(absolute) if absolute is not None else filepath,
                }
            )
    return unresolved


def prepare_export_objects(
    include_cameras: bool, include_lights: bool
) -> list[Any]:
    export_objects: list[Any] = []
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
        raise ConversionError("The imported FBX contains no exportable scene objects")
    bpy.context.view_layer.objects.active = export_objects[0]
    return export_objects


def export_glb(
    output: Path,
    args: ConversionOptions,
    armature_count: int,
    apply_modifiers: bool,
) -> dict[str, Any]:
    requested: dict[str, Any] = {
        "filepath": str(output),
        "export_format": "GLB",
        "use_selection": True,
        "export_cameras": args.include_cameras,
        "export_lights": args.include_lights,
        "export_apply": apply_modifiers,
        "export_materials": "EXPORT",
        "export_animations": args.export_animations,
        "export_animation_mode": "ACTIONS",
        "export_merge_animation": "ACTION",
        "export_anim_single_armature": armature_count == 1,
        "export_reset_pose_bones": True,
        "export_morph_reset_sk_data": True,
        "export_force_sampling": True,
        "export_skins": True,
        "export_morph": True,
        "export_morph_normal": True,
        "export_morph_animation": args.export_animations,
        "export_yup": True,
    }
    options = supported_operator_options(bpy.ops.export_scene.gltf, requested)
    result = bpy.ops.export_scene.gltf(**options)
    if "FINISHED" not in result or not output.is_file():
        raise ConversionError(f"Blender failed to export: {output}")
    return options


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


def animation_names(data: dict[str, Any]) -> list[str]:
    animations = data.get("animations", [])
    if not isinstance(animations, list):
        return []
    return [
        animation.get("name", "")
        for animation in animations
        if isinstance(animation, dict)
    ]


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


def temporary_output_path(output: Path) -> Path:
    return output.with_name(f".{output.stem}.{uuid.uuid4().hex}.tmp.glb")


def convert_job(job: ConversionJob, args: ConversionOptions) -> dict[str, Any]:
    source_before = job.source.stat()
    job.output.parent.mkdir(parents=True, exist_ok=True)
    clear_working_data()
    import_options = import_fbx(job.source, args)
    imported = imported_scene_report()
    for action in bpy.data.actions:
        action.use_fake_user = True

    if args.require_animations and imported["actionCount"] == 0:
        raise ConversionError(f"FBX imported without animation actions: {job.source}")

    missing_images = unresolved_file_images()
    if missing_images and not args.allow_missing_images:
        details = ", ".join(
            f"{record['image']} ({record['path']})" for record in missing_images
        )
        raise ConversionError(f"Unresolved imported images: {details}")

    export_objects = prepare_export_objects(
        args.include_cameras,
        args.include_lights,
    )
    warnings: list[str] = []
    has_shape_keys = any(
        obj.type == "MESH" and getattr(obj.data, "shape_keys", None) is not None
        for obj in export_objects
    )
    apply_modifiers = args.apply_modifiers and not has_shape_keys
    if args.apply_modifiers and has_shape_keys:
        warnings.append(
            "Disabled export_apply because imported meshes contain shape keys"
        )

    temporary = temporary_output_path(job.output)
    try:
        export_options = export_glb(
            temporary,
            args,
            armature_count=imported["armatureCount"],
            apply_modifiers=apply_modifiers,
        )
        output_data, output_counts = load_glb_json(temporary)
        input_meshes = imported["objectTypeCounts"].get("MESH", 0)
        if input_meshes > 0 and output_counts["meshes"] == 0:
            raise ConversionError(f"Output lost all meshes: {job.output}")

        imported_actions = imported["actionCount"]
        output_animations = output_counts["animations"]
        if args.export_animations and imported_actions > 0 and output_animations == 0:
            raise ConversionError(f"Output lost all animations: {job.output}")
        if (
            args.export_animations
            and not args.allow_animation_count_change
            and output_animations != imported_actions
        ):
            raise ConversionError(
                "Animation count changed during conversion: "
                f"imported={imported_actions}, output={output_animations} "
                f"for {job.source.name}"
            )

        source_after = job.source.stat()
        if (
            source_before.st_size != source_after.st_size
            or source_before.st_mtime_ns != source_after.st_mtime_ns
        ):
            raise ConversionError(f"Source FBX changed during conversion: {job.source}")

        os.replace(temporary, job.output)
    finally:
        if temporary.exists():
            temporary.unlink()

    return {
        "source": str(job.source),
        "sourceBytes": source_after.st_size,
        "sourcePreserved": True,
        "output": str(job.output),
        "outputBytes": job.output.stat().st_size,
        "imported": imported,
        "outputCounts": output_counts,
        "outputAnimations": animation_names(output_data),
        "exportedObjects": sorted(obj.name for obj in export_objects),
        "unresolvedImages": missing_images,
        "importOptions": import_options,
        "exportOptions": export_options,
        "warnings": warnings,
    }


def run(args: ConversionOptions) -> dict[str, Any]:
    jobs = build_jobs(args)
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

    require_blender()
    log(f"Blender {bpy.app.version_string}")
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
        "results": converted,
        "skips": skipped,
        "failures": failed,
    }
    log("SUMMARY " + json.dumps(summary, sort_keys=True))
    return summary


def run_with_arguments(arguments: list[str]) -> dict[str, Any]:
    """Run from Blender MCP with an explicit command-line-style argument list."""
    try:
        return run(options_from_namespace(parse_arguments(arguments)))
    except ConversionError as error:
        return {"success": False, "error": str(error)}


def main() -> None:
    try:
        summary = run(options_from_namespace(parse_arguments()))
    except ConversionError as error:
        print(f"[fbx-to-glb] ERROR: {error}", file=sys.stderr, flush=True)
        raise SystemExit(2) from error
    if not summary.get("success", False):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
