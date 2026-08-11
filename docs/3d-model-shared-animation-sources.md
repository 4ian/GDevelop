# 3D model shared animation sources

## Summary

A 3D model object can optionally reuse animation clips stored in other GLB
resources. This is intended for character variants exported with the same rig,
not for retargeting between different skeletons.

The object editor exposes a **Share animations from models (optional)** section
directly below the primary 3D model selector. The section accepts multiple GLB
resources, validates each one against the primary model, and makes clips from
compatible resources available to the object's animation list.

## Goals

- Let several 3D model objects reuse one or more animation-only GLB resources.
- Support multiple donor files so projects can split movement, combat, emotes,
  and other animation sets.
- Reject incompatible rigs before their clips can be selected.
- Keep existing projects and animations fully backward compatible.
- Preserve the source resource of every animation so identical clip names in
  different GLB files are unambiguous.

## Non-goals

- Retargeting animation between different skeletons.
- Bone-name mapping, humanoid profiles, pose correction, or scale compensation.
- Merging donor meshes or materials into the rendered model.

## Serialized data

The `content` of `Scene3D::Model3DObject` gains:

```json
{
  "sharedAnimationModelResources": [
    { "resourceName": "assets/models/Knight_Movement.glb" },
    { "resourceName": "assets/models/Knight_Combat.glb" }
  ]
}
```

Each configured animation gains an optional `sourceModelResourceName`:

```json
{
  "name": "Run",
  "source": "Run",
  "sourceModelResourceName": "assets/models/Knight_Movement.glb",
  "loop": true
}
```

An empty or missing `sourceModelResourceName` means the clip comes from the
object's primary `modelResourceName`. This preserves the meaning of all existing
project files.

Both the shared-resource list and animation-level source references are exposed
to GDevelop's resource worker. Resource renaming, dependency collection, export,
and unused-resource analysis therefore include donor GLBs.

## Rig compatibility contract

Donor resources are valid only when both models contain a skeleton and all of
the following match:

1. Bone count and unique bone names.
2. The nearest parent bone for every bone.
3. The bind transform of every bone relative to its nearest parent bone (or the
   GLTF scene root for root bones), within a small floating-point tolerance.

The comparison includes transforms introduced by non-bone nodes between bones.
Duplicate or unnamed bones are rejected because Three.js animation tracks
cannot bind them unambiguously.

Validation is performed in two places:

- The object editor shows loading, compatible, load-error, and mismatch states.
  Clips from invalid donors are not offered or scanned into the animation list.
- The runtime repeats the validation before resolving a donor clip. Invalid
  donor clips are not played, and a descriptive error is logged. This protects
  projects edited outside the IDE or whose resources changed after validation.

## Object editor behavior

- **Add models** opens the existing resource chooser with multi-selection
  enabled for `model3D` resources.
- The primary model and resources already in the list are ignored.
- Each row shows the resource name, animation count when loaded, and rig status.
- Removing a donor also removes configured animation entries that reference it,
  matching the existing behavior of removing an animation from the list.
- The animation source selector contains clips from the primary GLB and every
  compatible donor, labeled with both resource and clip name.
- **Scan missing animations** scans the primary model and all compatible donor
  models. A clip is considered unique by `(source resource, clip name)`.
- If adding a clip would duplicate an existing public animation name, the new
  entry keeps an empty optional name, consistent with current scan behavior.

## Runtime behavior

The rendered mesh and skeleton always come from the primary model. When an
animation is played, the renderer resolves its `AnimationClip` from either the
primary GLB or the configured donor GLB and applies it through the existing
`AnimationMixer` rooted on the cloned primary model.

Looping, pausing, elapsed time, speed scale, crossfading, animation names, and
network synchronization keep their existing behavior. The animation's donor
resource is included in network-synchronized animation configuration data.

## Compatibility and failure handling

- Old projects deserialize with an empty donor list and use primary-model clips.
- Missing donor resources, failed GLB loads, skeleton mismatches, or missing
  clips do not crash the game. The animation is skipped and an error is logged.
- Replacing the primary model immediately revalidates all donors in the editor;
  the runtime clears its compatibility cache when the primary model reloads.
- A donor can contain meshes, but only its animation clips are used.

