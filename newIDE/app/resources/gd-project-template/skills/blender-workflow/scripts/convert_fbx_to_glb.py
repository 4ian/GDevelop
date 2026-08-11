#!/usr/bin/env python3
"""Convert FBX files to standalone GLBs or bake them onto a target rig.

Run this utility through Blender Foundation's official Blender MCP server.
Load it with ``runpy`` inside ``execute_blender_code_for_cli`` and call
``run_with_arguments`` with command-line-style arguments. Direct conversion
supports one FBX file or a directory batch, preserves relative paths for
recursive batches, imports referenced images, exports skins and actions, and
validates the resulting GLB 2.0 container before replacing the destination.

Animation-only FBXs whose authored pose lives in the FBX armature's rest
transforms must use ``--target-armature``. In that mode the opened execution-
host ``.blend`` supplies the full target skeleton. Each FBX is imported in
isolation, optionally aligned around Blender Y, constrained to the target in
world space, visually baked, and exported as one animation-only GLB. Rotation
is copied for every exact-name shared bone; root, pelvis, and weapon attachment
locations are copied by default so attachments do not remain at their bind
positions.

Animation import and export are enabled by default. Existing outputs are never
replaced unless ``--overwrite`` is passed. The connected/background ``.blend``
is used only as a disposable execution host and is never saved by this script.
"""

from __future__ import annotations

import argparse
import json
import math
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
DEFAULT_LOCATION_BONES = ("root", "pelvis", "add_weapon_l", "add_weapon_r")


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
    target_armature: str | None = None
    source_y_rotation_degrees: float = 0.0
    copy_location_bones: tuple[str, ...] = DEFAULT_LOCATION_BONES
    minimum_shared_bones: int = 1
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
        "--target-armature",
        help=(
            "Retarget and bake onto this armature in the opened execution-host "
            ".blend, then export only that armature and its active baked action"
        ),
    )
    parser.add_argument(
        "--source-y-rotation-degrees",
        type=float,
        default=0.0,
        help=(
            "Rotate each imported source armature around world Y before "
            "retargeting; use 180 for mirrored FBX animation rigs"
        ),
    )
    parser.add_argument(
        "--copy-location-bone",
        dest="copy_location_bones",
        action="append",
        metavar="BONE",
        help=(
            "Exact-name shared bone whose world location is also copied; repeat "
            "as needed. Retarget mode defaults to root, pelvis, add_weapon_l, "
            "and add_weapon_r when this option is omitted"
        ),
    )
    parser.add_argument(
        "--minimum-shared-bones",
        type=int,
        default=1,
        help="Minimum exact-name shared bones required in retarget mode",
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
    if args.minimum_shared_bones < 1:
        parser.error("--minimum-shared-bones must be at least 1")
    if args.target_armature and not args.export_animations:
        parser.error("--target-armature cannot be combined with --no-animations")
    if args.target_armature and (args.include_cameras or args.include_lights):
        parser.error(
            "--include-cameras and --include-lights are not available in retarget mode"
        )
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
        target_armature=args.target_armature,
        source_y_rotation_degrees=args.source_y_rotation_degrees,
        copy_location_bones=tuple(
            args.copy_location_bones or DEFAULT_LOCATION_BONES
        ),
        minimum_shared_bones=args.minimum_shared_bones,
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


def saved_execution_host() -> Path:
    require_blender()
    filepath = Path(bpy.data.filepath).resolve() if bpy.data.filepath else None
    if filepath is None or not filepath.is_file():
        raise ConversionError(
            "Retarget mode requires a saved, task-owned .blend as the "
            "execute_blender_code_for_cli host"
        )
    return filepath


def reload_execution_host(host_blend: Path) -> None:
    result = bpy.ops.wm.open_mainfile(filepath=str(host_blend))
    if "FINISHED" not in result:
        raise ConversionError(f"Blender failed to reload target host: {host_blend}")


def resolve_target_armature(name: str) -> Any:
    target = bpy.data.objects.get(name)
    if target is None:
        available = sorted(
            obj.name for obj in bpy.data.objects if obj.type == "ARMATURE"
        )
        raise ConversionError(
            f"Target armature {name!r} was not found in the execution-host .blend; "
            f"available armatures: {available}"
        )
    if target.type != "ARMATURE":
        raise ConversionError(f"Target object {name!r} is not an armature")
    constraint_count = sum(len(bone.constraints) for bone in target.pose.bones)
    if constraint_count:
        raise ConversionError(
            f"Target armature {name!r} has {constraint_count} pose constraints; "
            "use an unconstrained export armature because baking clears constraints"
        )
    return target


def clear_host_animation_data() -> None:
    for obj in bpy.data.objects:
        if obj.animation_data is not None:
            obj.animation_data_clear()
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action, do_unlink=True)


def reset_pose_to_rest(armature: Any) -> None:
    armature.data.pose_position = "POSE"
    for pose_bone in armature.pose.bones:
        pose_bone.matrix_basis.identity()


def newly_imported_items(before: set[int], items: Iterable[Any]) -> list[Any]:
    return [item for item in items if item.as_pointer() not in before]


def source_armature_and_action(
    source: Path,
    objects_before: set[int],
    actions_before: set[int],
) -> tuple[Any, Any, list[Any], list[Any]]:
    imported_objects = newly_imported_items(objects_before, bpy.data.objects)
    imported_actions = newly_imported_items(actions_before, bpy.data.actions)
    armatures = [obj for obj in imported_objects if obj.type == "ARMATURE"]
    animated = [
        obj
        for obj in armatures
        if obj.animation_data is not None and obj.animation_data.action is not None
    ]
    if len(animated) == 1:
        source_armature = animated[0]
    elif len(armatures) == 1:
        source_armature = armatures[0]
    else:
        raise ConversionError(
            f"Expected one imported source armature for {source.name}, found "
            f"{len(armatures)} ({sorted(obj.name for obj in armatures)})"
        )

    source_action = (
        source_armature.animation_data.action
        if source_armature.animation_data is not None
        else None
    )
    if source_action is None:
        matching = [action for action in imported_actions if action.name == source.stem]
        candidates = matching or imported_actions
        if len(candidates) != 1:
            raise ConversionError(
                f"Expected one source action for {source.name}, found "
                f"{len(imported_actions)} "
                f"({sorted(action.name for action in imported_actions)})"
            )
        source_action = candidates[0]
        source_armature.animation_data_create()
        source_armature.animation_data.action = source_action
    return source_armature, source_action, imported_objects, imported_actions


def align_source_armature(source_armature: Any, degrees: float) -> None:
    if degrees == 0.0:
        return
    from math import radians
    from mathutils import Matrix

    source_armature.matrix_world = (
        Matrix.Rotation(radians(degrees), 4, "Y") @ source_armature.matrix_world
    )
    bpy.context.view_layer.update()


def add_retarget_constraints(
    source_armature: Any,
    target_armature: Any,
    args: ConversionOptions,
) -> dict[str, Any]:
    source_bones = set(source_armature.pose.bones.keys())
    target_bones = set(target_armature.pose.bones.keys())
    shared_bones = sorted(source_bones & target_bones)
    if len(shared_bones) < args.minimum_shared_bones:
        raise ConversionError(
            "Too few exact-name shared bones for retargeting: "
            f"shared={len(shared_bones)}, required={args.minimum_shared_bones}, "
            f"source={len(source_bones)}, target={len(target_bones)}"
        )

    for bone_name in shared_bones:
        constraint = target_armature.pose.bones[bone_name].constraints.new(
            "COPY_ROTATION"
        )
        constraint.name = "FBX absolute-rest-pose rotation"
        constraint.target = source_armature
        constraint.subtarget = bone_name
        constraint.owner_space = "WORLD"
        constraint.target_space = "WORLD"
        if hasattr(constraint, "mix_mode"):
            constraint.mix_mode = "REPLACE"

    copied_locations: list[str] = []
    missing_locations: list[str] = []
    for bone_name in dict.fromkeys(args.copy_location_bones):
        if bone_name not in source_bones or bone_name not in target_bones:
            missing_locations.append(bone_name)
            continue
        constraint = target_armature.pose.bones[bone_name].constraints.new(
            "COPY_LOCATION"
        )
        constraint.name = "FBX root/attachment location"
        constraint.target = source_armature
        constraint.subtarget = bone_name
        constraint.owner_space = "WORLD"
        constraint.target_space = "WORLD"
        copied_locations.append(bone_name)

    return {
        "sourceBoneCount": len(source_bones),
        "targetBoneCount": len(target_bones),
        "sharedBoneCount": len(shared_bones),
        "sourceCoverage": (
            len(shared_bones) / len(source_bones) if source_bones else 0.0
        ),
        "locationBonesCopied": copied_locations,
        "locationBonesMissing": missing_locations,
    }


def make_target_exportable(target_armature: Any) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for collection in target_armature.users_collection:
        collection.hide_viewport = False
        collection.hide_render = False
    target_armature.hide_set(False)
    target_armature.hide_viewport = False
    target_armature.hide_render = False
    target_armature.select_set(True)
    bpy.context.view_layer.objects.active = target_armature


def bake_target_action(
    source_action: Any,
    target_armature: Any,
    clip_name: str,
) -> tuple[Any, dict[str, Any]]:
    frame_start = math.floor(source_action.frame_range[0])
    frame_end = math.ceil(source_action.frame_range[1])
    if frame_start < 0 or frame_end < frame_start:
        raise ConversionError(
            f"Unsupported source action frame range: {frame_start}..{frame_end}"
        )
    make_target_exportable(target_armature)
    bpy.context.scene.frame_set(frame_start)
    bpy.context.view_layer.update()
    requested: dict[str, Any] = {
        "frame_start": frame_start,
        "frame_end": frame_end,
        "step": 1,
        "only_selected": False,
        "visual_keying": True,
        "clear_constraints": True,
        "use_current_action": False,
        "clean_curves": False,
        "bake_types": {"POSE"},
        "channel_types": {"LOCATION", "ROTATION", "SCALE"},
    }
    options = supported_operator_options(bpy.ops.nla.bake, requested)
    result = bpy.ops.nla.bake(**options)
    if "FINISHED" not in result:
        raise ConversionError(f"Blender failed to bake target action {clip_name!r}")
    baked_action = (
        target_armature.animation_data.action
        if target_armature.animation_data is not None
        else None
    )
    if baked_action is None:
        raise ConversionError(f"Baking produced no target action for {clip_name!r}")

    for action in list(bpy.data.actions):
        if action != baked_action:
            bpy.data.actions.remove(action, do_unlink=True)
    baked_action.name = clip_name
    baked_action.use_fake_user = True
    return baked_action, options


def export_baked_animation_glb(
    output: Path,
    target_armature: Any,
    clip_name: str,
) -> dict[str, Any]:
    make_target_exportable(target_armature)
    requested: dict[str, Any] = {
        "filepath": str(output),
        "check_existing": False,
        "export_format": "GLB",
        "use_selection": True,
        "export_cameras": False,
        "export_lights": False,
        "export_apply": False,
        "export_materials": "NONE",
        "export_animations": True,
        "export_animation_mode": "ACTIVE_ACTIONS",
        "export_nla_strips_merged_animation_name": clip_name,
        "export_force_sampling": True,
        "export_frame_step": 1,
        "export_anim_slide_to_zero": True,
        "export_bake_animation": False,
        "export_merge_animation": "ACTION",
        "export_anim_single_armature": True,
        "export_reset_pose_bones": True,
        "export_rest_position_armature": True,
        "export_skins": True,
        "export_def_bones": False,
        "export_leaf_bone": False,
        "export_armature_object_remove": False,
        "export_optimize_animation_size": False,
        "export_morph": False,
        "export_morph_animation": False,
        "export_yup": True,
    }
    options = supported_operator_options(bpy.ops.export_scene.gltf, requested)
    result = bpy.ops.export_scene.gltf(**options)
    if "FINISHED" not in result or not output.is_file():
        raise ConversionError(f"Blender failed to export baked animation: {output}")
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


def convert_direct_job(job: ConversionJob, args: ConversionOptions) -> dict[str, Any]:
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


def convert_retarget_job(
    job: ConversionJob,
    args: ConversionOptions,
    host_blend: Path,
) -> dict[str, Any]:
    if args.target_armature is None:
        raise ConversionError("Internal error: retarget mode has no target armature")

    source_before = job.source.stat()
    host_before = host_blend.stat()
    job.output.parent.mkdir(parents=True, exist_ok=True)
    reload_execution_host(host_blend)
    target_armature = resolve_target_armature(args.target_armature)
    clear_host_animation_data()
    reset_pose_to_rest(target_armature)

    objects_before = {obj.as_pointer() for obj in bpy.data.objects}
    actions_before = {action.as_pointer() for action in bpy.data.actions}
    import_options = import_fbx(job.source, args)
    (
        source_armature,
        source_action,
        imported_objects,
        imported_actions,
    ) = source_armature_and_action(job.source, objects_before, actions_before)
    align_source_armature(source_armature, args.source_y_rotation_degrees)
    retarget = add_retarget_constraints(source_armature, target_armature, args)
    source_action_name = source_action.name
    source_frame_range = [
        float(source_action.frame_range[0]),
        float(source_action.frame_range[1]),
    ]
    baked_action, bake_options = bake_target_action(
        source_action,
        target_armature,
        job.source.stem,
    )

    temporary = temporary_output_path(job.output)
    try:
        export_options = export_baked_animation_glb(
            temporary,
            target_armature,
            baked_action.name,
        )
        output_data, output_counts = load_glb_json(temporary)
        output_animation_names = animation_names(output_data)
        if output_counts["animations"] != 1:
            raise ConversionError(
                "Retarget output must contain exactly one animation: "
                f"found={output_counts['animations']} for {job.source.name}"
            )
        if output_animation_names != [job.source.stem]:
            raise ConversionError(
                "Retarget output animation name changed: "
                f"expected={[job.source.stem]}, found={output_animation_names}"
            )
        if output_counts["nodes"] == 0:
            raise ConversionError(
                f"Retarget output lost the target skeleton: {job.output}"
            )

        source_after = job.source.stat()
        host_after = host_blend.stat()
        if (
            source_before.st_size != source_after.st_size
            or source_before.st_mtime_ns != source_after.st_mtime_ns
        ):
            raise ConversionError(f"Source FBX changed during conversion: {job.source}")
        if (
            host_before.st_size != host_after.st_size
            or host_before.st_mtime_ns != host_after.st_mtime_ns
        ):
            raise ConversionError(
                f"Target execution-host .blend changed during conversion: {host_blend}"
            )
        os.replace(temporary, job.output)
    finally:
        if temporary.exists():
            temporary.unlink()

    warnings: list[str] = []
    if retarget["locationBonesMissing"]:
        warnings.append(
            "Requested location bones absent from one or both rigs: "
            + ", ".join(retarget["locationBonesMissing"])
        )
    return {
        "mode": "retarget-bake",
        "source": str(job.source),
        "sourceBytes": source_after.st_size,
        "sourcePreserved": True,
        "targetBlend": str(host_blend),
        "targetBlendPreserved": True,
        "targetArmature": target_armature.name,
        "output": str(job.output),
        "outputBytes": job.output.stat().st_size,
        "sourceArmature": source_armature.name,
        "sourceAction": source_action_name,
        "sourceFrameRange": source_frame_range,
        "importedObjectCount": len(imported_objects),
        "importedActionCount": len(imported_actions),
        "retarget": retarget,
        "bakedAction": baked_action.name,
        "outputCounts": output_counts,
        "outputAnimations": output_animation_names,
        "exportedObjects": [target_armature.name],
        "importOptions": import_options,
        "bakeOptions": bake_options,
        "exportOptions": export_options,
        "warnings": warnings,
    }


def convert_job(
    job: ConversionJob,
    args: ConversionOptions,
    host_blend: Path | None,
) -> dict[str, Any]:
    if args.target_armature is None:
        return convert_direct_job(job, args)
    if host_blend is None:
        raise ConversionError("Internal error: retarget mode has no execution host")
    return convert_retarget_job(job, args, host_blend)


def run(args: ConversionOptions) -> dict[str, Any]:
    jobs = build_jobs(args)
    log(f"Planned conversions: {len(jobs)}")

    if args.dry_run:
        for job in jobs:
            log(f"DRY RUN {job.source} -> {job.output}")
        summary = {
            "success": True,
            "dryRun": True,
            "mode": "retarget-bake" if args.target_armature else "direct",
            "targetArmature": args.target_armature,
            "sourceYRotationDegrees": args.source_y_rotation_degrees,
            "copyLocationBones": list(args.copy_location_bones),
            "planned": len(jobs),
            "jobs": [
                {"source": str(job.source), "output": str(job.output)} for job in jobs
            ],
        }
        log("SUMMARY " + json.dumps(summary, sort_keys=True))
        return summary

    require_blender()
    log(f"Blender {bpy.app.version_string}")
    host_blend = saved_execution_host() if args.target_armature else None
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
            record = convert_job(job, args, host_blend)
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
        "mode": "retarget-bake" if args.target_armature else "direct",
        "targetArmature": args.target_armature,
        "targetBlend": str(host_blend) if host_blend else None,
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
