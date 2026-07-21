#!/usr/bin/env python3
"""Combine a skinned character GLB with animations from a same-rig GLB.

This is direct action reuse, not bone retargeting. The target and donor
armatures must use compatible bone names, hierarchy, and (by default) rest
poses. Run this script with Blender, not a system Python interpreter.

Example (PowerShell):

  & "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" `
    --background --factory-startup `
    --python skills/gdevelop-project-files/scripts/combine_same_rig_glb_animations.py -- `
    --character "D:\\models\\Knight.glb" `
    --animations "D:\\animations\\Rig_Medium_General.glb" `
    --output "D:\\game\\assets\\models\\Knight_Animated.glb" `
    --overwrite

Use repeated ``--action`` arguments to export only selected donor actions.
Use ``--include-unbound-character-objects`` when the character intentionally
contains meshes or empties that are not parented or constrained to the rig.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

import bpy


class CombineError(RuntimeError):
    """A user-facing combination failure."""


def log(message: str) -> None:
    print(f"[combine-glb] {message}", flush=True)


def blender_cli_arguments() -> list[str]:
    """Return arguments placed after Blender's required ``--`` separator."""
    if "--" not in sys.argv:
        return []
    return sys.argv[sys.argv.index("--") + 1 :]


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Embed animations from a same-rig donor GLB into a character GLB. "
            "This transfers actions directly and does not perform retargeting."
        )
    )
    parser.add_argument("--character", required=True, help="Character/mesh GLB")
    parser.add_argument("--animations", required=True, help="Animation donor GLB")
    parser.add_argument("--output", required=True, help="Combined output GLB")
    parser.add_argument(
        "--character-armature",
        help="Target armature object name; required only if the character has several",
    )
    parser.add_argument(
        "--animation-armature",
        help="Donor armature object name; required only if the donor has several",
    )
    parser.add_argument(
        "--action",
        dest="actions",
        action="append",
        default=[],
        help="Exact donor action name to include; repeat for multiple actions",
    )
    parser.add_argument(
        "--compatibility",
        choices=("strict", "hierarchy", "names", "off"),
        default="strict",
        help=(
            "Skeleton check: strict also compares rest poses; hierarchy checks "
            "bone parents; names checks only the bone set (default: strict)"
        ),
    )
    parser.add_argument(
        "--rest-pose-tolerance",
        type=float,
        default=1e-4,
        help="Maximum matrix element difference in strict mode (default: 1e-4)",
    )
    parser.add_argument(
        "--include-unbound-character-objects",
        action="store_true",
        help="Also export unbound character meshes/empties",
    )
    parser.add_argument(
        "--no-apply-modifiers",
        action="store_true",
        help="Do not ask the glTF exporter to apply compatible modifiers",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Allow replacing an existing output GLB",
    )
    return parser.parse_args(blender_cli_arguments())


def resolve_input(path_text: str, label: str) -> Path:
    path = Path(path_text).expanduser().resolve()
    if not path.is_file():
        raise CombineError(f"{label} does not exist: {path}")
    if path.suffix.lower() != ".glb":
        raise CombineError(f"{label} must be a .glb file: {path}")
    return path


def resolve_output(path_text: str, overwrite: bool, inputs: Iterable[Path]) -> Path:
    path = Path(path_text).expanduser().resolve()
    if path.suffix.lower() != ".glb":
        raise CombineError(f"Output must use the .glb extension: {path}")
    if path in set(inputs):
        raise CombineError("Output cannot overwrite either input GLB")
    if path.exists() and not overwrite:
        raise CombineError(f"Output already exists; pass --overwrite to replace it: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def import_glb(path: Path) -> tuple[set[bpy.types.Object], list[bpy.types.Action]]:
    objects_before = set(bpy.data.objects)
    actions_before = set(bpy.data.actions)
    result = bpy.ops.import_scene.gltf(filepath=str(path))
    if "FINISHED" not in result:
        raise CombineError(f"Blender failed to import: {path}")
    imported_actions = [
        action for action in bpy.data.actions if action not in actions_before
    ]
    return set(bpy.data.objects) - objects_before, imported_actions


def name_without_blender_suffix(name: str) -> str:
    return re.sub(r"\.\d{3}$", "", name)


def choose_armature(
    objects: Iterable[bpy.types.Object], requested_name: str | None, label: str
) -> bpy.types.Object:
    armatures = sorted((obj for obj in objects if obj.type == "ARMATURE"), key=lambda obj: obj.name)
    if requested_name:
        exact = [obj for obj in armatures if obj.name == requested_name]
        if len(exact) == 1:
            return exact[0]
        base_matches = [
            obj for obj in armatures if name_without_blender_suffix(obj.name) == requested_name
        ]
        if len(base_matches) == 1:
            return base_matches[0]
        available = ", ".join(obj.name for obj in armatures) or "none"
        raise CombineError(
            f"Could not uniquely find {label} armature {requested_name!r}; available: {available}"
        )
    if len(armatures) != 1:
        available = ", ".join(obj.name for obj in armatures) or "none"
        raise CombineError(
            f"Expected one {label} armature, found {len(armatures)} ({available}). "
            f"Use the corresponding --{label}-armature option."
        )
    return armatures[0]


def matrix_max_difference(left: Any, right: Any) -> float:
    return max(abs(float(left[row][column]) - float(right[row][column])) for row in range(4) for column in range(4))


def verify_skeletons(
    target: bpy.types.Object,
    donor: bpy.types.Object,
    mode: str,
    rest_pose_tolerance: float,
) -> dict[str, Any]:
    target_bones = {bone.name: bone for bone in target.data.bones}
    donor_bones = {bone.name: bone for bone in donor.data.bones}
    target_names = set(target_bones)
    donor_names = set(donor_bones)

    report: dict[str, Any] = {
        "mode": mode,
        "targetBoneCount": len(target_names),
        "donorBoneCount": len(donor_names),
    }
    if mode == "off":
        return report

    missing_from_target = sorted(donor_names - target_names)
    missing_from_donor = sorted(target_names - donor_names)
    if missing_from_target or missing_from_donor:
        raise CombineError(
            "Bone-name mismatch. Missing from target: "
            f"{missing_from_target or 'none'}; missing from donor: {missing_from_donor or 'none'}. "
            "This script only combines same-rig files; use a retargeting workflow for different rigs."
        )

    if mode in {"hierarchy", "strict"}:
        hierarchy_mismatches: list[str] = []
        for name in sorted(target_names):
            target_parent = target_bones[name].parent.name if target_bones[name].parent else None
            donor_parent = donor_bones[name].parent.name if donor_bones[name].parent else None
            if target_parent != donor_parent:
                hierarchy_mismatches.append(
                    f"{name}: target parent={target_parent!r}, donor parent={donor_parent!r}"
                )
        if hierarchy_mismatches:
            raise CombineError(
                "Bone hierarchy mismatch:\n  " + "\n  ".join(hierarchy_mismatches[:20])
            )

    if mode == "strict":
        rest_mismatches: list[tuple[str, float]] = []
        for name in sorted(target_names):
            difference = matrix_max_difference(
                target_bones[name].matrix_local, donor_bones[name].matrix_local
            )
            if difference > rest_pose_tolerance:
                rest_mismatches.append((name, difference))
        if rest_mismatches:
            details = "\n  ".join(
                f"{name}: max matrix difference {difference:.8g}"
                for name, difference in rest_mismatches[:20]
            )
            raise CombineError(
                f"Rest-pose mismatch (tolerance {rest_pose_tolerance:g}):\n  {details}\n"
                "Use --compatibility hierarchy only if the rigs are intentionally compatible "
                "despite rest-pose differences."
            )
        report["restPoseTolerance"] = rest_pose_tolerance

    return report


def matching_source_slot(action: bpy.types.Action, donor: bpy.types.Object) -> Any | None:
    slots = getattr(action, "slots", None)
    if slots is None:
        # Blender 3.x Actions are not slotted. Pose curves can be assigned
        # directly to any armature with matching bone paths.
        fcurves = getattr(action, "fcurves", ())
        return action if any(curve.data_path.startswith("pose.bones[") for curve in fcurves) else None

    object_slots = [slot for slot in slots if slot.target_id_type == "OBJECT"]
    exact = [
        slot
        for slot in object_slots
        if slot.name_display == donor.name or slot.identifier == f"OB{donor.name}"
    ]
    if len(exact) == 1:
        return exact[0]
    # A glTF armature animation normally has one OBJECT slot. This fallback
    # tolerates importers that sanitize the donor object name.
    if len(object_slots) == 1:
        return object_slots[0]
    return None


def normalize_legacy_donor_action_names(
    donor_actions: Iterable[bpy.types.Action], donor: bpy.types.Object
) -> None:
    """Undo the rig-name suffix used by older Blender glTF importers."""
    suffix = f"_{donor.name}"
    for action in donor_actions:
        if not action.name.endswith(suffix):
            continue
        desired_name = action.name[: -len(suffix)]
        if not desired_name:
            continue
        collision = next(
            (
                other
                for other in bpy.data.actions
                if other != action and other.name == desired_name
            ),
            None,
        )
        if collision is not None:
            raise CombineError(
                f"Cannot normalize donor action {action.name!r} to {desired_name!r}: "
                "the character already contains an action with that name"
            )
        action.name = desired_name


def select_donor_actions(
    imported_actions: Iterable[bpy.types.Action],
    donor: bpy.types.Object,
    requested_names: list[str],
) -> list[tuple[bpy.types.Action, Any]]:
    by_name = {action.name: action for action in imported_actions}
    if requested_names:
        missing = sorted(set(requested_names) - set(by_name))
        if missing:
            available = ", ".join(sorted(by_name)) or "none"
            raise CombineError(f"Requested actions not found: {missing}. Available donor actions: {available}")
        candidates = [by_name[name] for name in requested_names]
    else:
        candidates = sorted(by_name.values(), key=lambda action: action.name.casefold())

    selected: list[tuple[bpy.types.Action, Any]] = []
    skipped: list[str] = []
    for action in candidates:
        slot = matching_source_slot(action, donor)
        if slot is None:
            skipped.append(action.name)
            continue
        selected.append((action, slot))

    if skipped:
        log("Skipped non-armature or ambiguous donor actions: " + ", ".join(skipped))
    if not selected:
        raise CombineError("The donor GLB contains no actions that target its armature")
    return selected


def retarget_action_slots(
    selected_actions: list[tuple[bpy.types.Action, Any]], target: bpy.types.Object
) -> None:
    """Point same-rig Actions at the target armature without baking."""
    for action, slot in selected_actions:
        if getattr(action, "slots", None) is not None:
            slot.name_display = target.name
        action.use_fake_user = True

    target.animation_data_create()
    first_action, first_slot = selected_actions[0]
    target.animation_data.action = first_action
    if getattr(first_action, "slots", None) is not None:
        target.animation_data.action_slot = first_slot


def remove_objects(objects: Iterable[bpy.types.Object]) -> None:
    for obj in list(objects):
        if obj.name in bpy.data.objects:
            bpy.data.objects.remove(obj, do_unlink=True)


def remove_actions(actions: Iterable[bpy.types.Action]) -> None:
    for action in list(actions):
        if action.name in bpy.data.actions:
            bpy.data.actions.remove(action)


def is_descendant_of(obj: bpy.types.Object, ancestor: bpy.types.Object) -> bool:
    parent = obj.parent
    while parent is not None:
        if parent == ancestor:
            return True
        parent = parent.parent
    return False


def uses_armature(obj: bpy.types.Object, armature: bpy.types.Object) -> bool:
    return any(
        modifier.type == "ARMATURE" and getattr(modifier, "object", None) == armature
        for modifier in obj.modifiers
    )


def character_export_objects(
    character_objects: Iterable[bpy.types.Object],
    target: bpy.types.Object,
    include_unbound: bool,
) -> set[bpy.types.Object]:
    character_set = set(character_objects)
    export_objects: set[bpy.types.Object] = {target}

    ancestor = target.parent
    while ancestor is not None:
        if ancestor in character_set:
            export_objects.add(ancestor)
        ancestor = ancestor.parent

    for obj in character_set:
        if obj.type in {"CAMERA", "LIGHT"}:
            continue
        if (
            include_unbound
            or obj == target
            or is_descendant_of(obj, target)
            or uses_armature(obj, target)
        ):
            export_objects.add(obj)

    meshes = [obj for obj in export_objects if obj.type == "MESH"]
    if not meshes:
        raise CombineError("No character meshes are connected to the selected target armature")
    return export_objects


def export_glb(
    output: Path,
    export_objects: Iterable[bpy.types.Object],
    target: bpy.types.Object,
    apply_modifiers: bool,
) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in export_objects:
        obj.hide_set(False)
        obj.hide_viewport = False
        obj.hide_render = False
        obj.select_set(True)
    bpy.context.view_layer.objects.active = target

    requested: dict[str, Any] = {
        "filepath": str(output),
        "export_format": "GLB",
        "use_selection": True,
        "export_cameras": False,
        "export_lights": False,
        "export_apply": apply_modifiers,
        "export_animations": True,
        "export_animation_mode": "ACTIONS",
        "export_merge_animation": "ACTION",
        "export_anim_single_armature": True,
        "export_force_sampling": True,
        "export_skins": True,
        "export_yup": True,
    }
    available = {
        prop.identifier for prop in bpy.ops.export_scene.gltf.get_rna_type().properties
    }
    options = {key: value for key, value in requested.items() if key in available}
    log("glTF export options: " + json.dumps(options, sort_keys=True))
    result = bpy.ops.export_scene.gltf(**options)
    if "FINISHED" not in result or not output.is_file():
        raise CombineError(f"Blender failed to export: {output}")


def run(args: argparse.Namespace) -> dict[str, Any]:
    character_path = resolve_input(args.character, "Character GLB")
    animations_path = resolve_input(args.animations, "Animation GLB")
    output_path = resolve_output(
        args.output, args.overwrite, (character_path, animations_path)
    )
    if args.rest_pose_tolerance < 0:
        raise CombineError("--rest-pose-tolerance cannot be negative")

    log(f"Blender {bpy.app.version_string}")
    log(f"Importing character: {character_path}")
    bpy.ops.wm.read_factory_settings(use_empty=True)
    character_objects, character_actions = import_glb(character_path)
    target = choose_armature(character_objects, args.character_armature, "character")

    log(f"Importing animation donor: {animations_path}")
    donor_objects, donor_actions = import_glb(animations_path)
    donor = choose_armature(donor_objects, args.animation_armature, "animation")

    compatibility = verify_skeletons(
        target, donor, args.compatibility, args.rest_pose_tolerance
    )
    normalize_legacy_donor_action_names(donor_actions, donor)
    selected_actions = select_donor_actions(donor_actions, donor, args.actions)
    selected_action_data = {action for action, _slot in selected_actions}
    remove_actions(
        action for action in donor_actions if action not in selected_action_data
    )
    retarget_action_slots(selected_actions, target)

    export_objects = character_export_objects(
        character_objects, target, args.include_unbound_character_objects
    )
    excluded_character_objects = set(character_objects) - export_objects
    excluded_character_names = sorted(obj.name for obj in excluded_character_objects)
    donor_name = donor.name
    remove_objects(donor_objects)
    remove_objects(excluded_character_objects)
    export_glb(
        output_path,
        export_objects,
        target,
        apply_modifiers=not args.no_apply_modifiers,
    )

    report = {
        "success": True,
        "character": str(character_path),
        "animations": str(animations_path),
        "output": str(output_path),
        "outputBytes": output_path.stat().st_size,
        "targetArmature": target.name,
        "donorArmature": donor_name,
        "compatibility": compatibility,
        "actions": [action.name for action, _slot in selected_actions],
        "characterActionsPreserved": sorted(action.name for action in character_actions),
        "exportedObjects": sorted(obj.name for obj in export_objects),
        "excludedCharacterObjects": excluded_character_names,
    }
    log("RESULT " + json.dumps(report, sort_keys=True))
    return report


def main() -> None:
    try:
        run(parse_arguments())
    except CombineError as error:
        print(f"[combine-glb] ERROR: {error}", file=sys.stderr, flush=True)
        raise SystemExit(2) from error


if __name__ == "__main__":
    main()
