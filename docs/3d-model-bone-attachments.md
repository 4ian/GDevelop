# 3D model bone attachments

## Summary

GDevelop should provide a native way to attach any 3D object to a named bone of
an animated 3D model. The primary use cases are weapons, shields, tools, armor,
hair, and effects that must remain separate runtime objects but follow a
character animation.

The attachment must not be implemented by parenting the attached object's
Three.js renderer directly to the bone. A 3D model is normalized inside an
object-sized renderer hierarchy, and direct parenting makes the child inherit
that hierarchy's scale. This is the cause of stretched or squashed weapons. It
also breaks assumptions used by layers, deletion, object transforms, custom
objects, collisions, and hot reload.

Instead, the attached object remains a normal child of its GDevelop 3D layer.
An attachment manager reads the posed bone transform, removes inherited scale
and shear, and writes the resulting position and rotation to the attached
object. The attached object keeps its own width, height, depth, scale, flips,
visibility, behaviors, variables, and lifecycle.

## Decision

Implement bone attachment as a **same-container transform constraint**, not as
Three.js scene-graph reparenting.

- The target is a `Scene3D::Model3DObject` instance.
- The attachment is any object with `Scene3D::Base3DBehavior`.
- Both instances must belong to the same `RuntimeInstanceContainer` and the
  same 3D layer.
- One attachment can follow one target bone. A target can have any number of
  attachments.
- The attachment's GDevelop origin follows the bone plus a local position and
  rotation offset.
- Bone position and rotation are inherited. Scale, shear, dimensions, flips,
  and visibility are not inherited.
- Attachment chains are supported in target-first order. Cycles are rejected.

This boundary supports ordinary scene objects and children inside a 3D custom
object/prefab. In a knight prefab, for example, `KnightModel` and `WeaponModel`
are sibling child objects on the prefab's default 3D layer.

## Why the current approaches are insufficient

### Direct bone parenting

`Model3DRuntimeObject3DRenderer` currently builds this hierarchy:

```text
3D layer group
  object transform group (position, rotation, width, height, depth, flips)
    normalized model group (model rotation, centering, normalization)
      cloned GLTF scene
        armature
          bone
```

The object transform group is scaled by the GDevelop object's width, height,
and depth. The normalized model group contains the inverse model-space sizing
and configured default rotation. A renderer parented below a bone inherits both
sets of transforms. Non-uniform object dimensions produce non-uniform child
scale and can also introduce shear when combined with bone rotation.

Direct parenting additionally violates runtime ownership rules:

- `RuntimeObject3DRenderer` treats its root as a layer-space object and writes
  position, rotation, scale, and visibility directly to it.
- `RuntimeObject.onDeletedFromScene` asks the layer renderer to remove that root
  from the layer group. `THREE.Group.remove` only removes a direct child, so a
  root reparented below a bone is not removed by the existing path.
- `RuntimeObject.setLayer` similarly assumes that the renderer root is a direct
  child of the old layer group.
- A custom 3D object's internal layer is parented below the custom object's
  renderer group. Reparenting an internal object outside that hierarchy breaks
  prefab transforms and ownership.
- The logical object position, rotation, hit boxes, forces, network state, and
  renderer position would disagree.

Scale compensation on a directly parented renderer does not solve these
ownership and logical-state problems. It is also unstable for non-uniform scale
followed by rotation because the resulting transform contains shear.

### A weapon merged into the character GLB

This is valid for a permanent weapon, but it cannot provide an inventory or
equipment system without duplicating character models and animations. It also
prevents the weapon from having independent variables, effects, behaviors, and
lifecycle.

### Per-frame JavaScript events

User-authored JavaScript can traverse private Three.js objects and copy a bone
matrix. This depends on renderer internals, repeats traversal work, has unclear
scale behavior, does not integrate with object deletion or hot reload, and can
run at the wrong point in the frame. It is useful as a prototype, not as the
public contract.

### GDevelop points or helper objects

Object points are static in object space. They do not follow a skinned bone's
animated pose and therefore cannot represent a hand socket.

## Current architecture and required seams

The relevant implementation is currently split across these areas:

- `Extensions/3D/Model3DRuntimeObject3DRenderer.ts` clones the GLTF with
  `SkeletonUtils.clone`, normalizes it, and owns the `AnimationMixer`.
- `Extensions/3D/Model3DRuntimeObject.ts` advances the mixer in `update`, before
  scene events.
- `Extensions/3D/A_RuntimeObject3DRenderer.ts` applies ordinary 3D object
  position, rotation, size, flip, and visibility to a layer-owned root.
- `Extensions/3D/Base3DBehavior.ts` is the hidden capability already present on
  3D objects and is the appropriate child-facing public API.
- `GDJS/Runtime/runtimeinstancecontainer.ts` updates objects and behaviors
  before events, then gives objects a pre-render update.
- `GDJS/Runtime/CustomRuntimeObjectInstanceContainer.ts` has equivalent loops
  for children inside custom objects.
- `GDJS/Runtime/CustomRuntimeObject.ts` runs the child container before the
  custom object's generated events and recursively performs pre-render updates.
- `GDJS/Runtime/pixi-renderers/layer-pixi-renderer.ts` owns the Three.js group
  to which each normal 3D renderer root is added.
- `newIDE/app/src/ResourcesList/ResourcePreview/Model3DRigUtils.js` already
  traverses `THREE.Bone` instances for shared-animation rig validation.
- `newIDE/app/src/ResourcesList/ResourcePreview/Model3DBoneUtils.js` defines
  how the preview recovers an authored GLB name from `userData.name` when
  `GLTFLoader` has sanitized the runtime `Object3D.name`.

Two small, generic instance-container hooks are required so attachment state is
correct both in scenes and inside custom objects:

1. A post-object-update hook at the end of each container's
   `_updateObjectsPreEvents`, after every object's animation update and behavior
   pre-step, but before that container's events consume positions.
2. A pre-object-render hook at the start of each container's
   `_updateObjectsPreRender`, after events and post-event behaviors, but before
   custom object renderers call `ensureUpToDate`.

The 3D extension registers its attachment manager on these hooks. The hooks are
container-scoped rather than scene-only because custom-object events execute
during the parent scene's object update.

## Goals

- Attach a separate 3D object to an animated model bone with no per-frame user
  events.
- Preserve the attached object's configured size and prevent inherited scale
  from squashing it.
- Work for scene objects and sibling child objects inside a 3D prefab.
- Make position and rotation expressions, collision queries, and detachment use
  a coherent logical transform.
- Follow animation playback, seeking, pausing, speed changes, and crossfades.
- Handle deletion, reattachment, model rebuild, hot reload, and invalid bones
  without leaking renderers or crashing.
- Avoid traversing the GLTF scene every frame.
- Keep existing project files backward compatible.

## Non-goals

- Attaching objects across different scenes, instance containers, prefabs, or
  layers in the first version.
- Inheriting target scale, shear, material, opacity, flip state, or visibility.
- Making an attached object a physics joint. An active physics behavior and a
  bone attachment both own the transform and are not supported together.
- Animation retargeting or bone-name mapping.
- Changing a 3D model's GLB resource at runtime. A dynamic equipment system can
  create, show, hide, or delete separate weapon objects; runtime model-resource
  replacement is a separate feature.
- Attaching to arbitrary meshes or unnamed GLTF nodes in the first version.
  Named socket nodes are a compatible future extension.
- Rendering bone attachments in the scene editor without running a preview.

## Terminology

- **Target**: the animated `Model3DObject` that owns the cloned skeleton.
- **Attachment**: the independent 3D object following the target.
- **Bone name**: a non-empty, unique public name for a `THREE.Bone` in the
  target's cloned runtime model. It is the authored GLB name from
  `bone.userData.name` when available, otherwise `bone.name`.
- **Attachment offset**: position and Euler rotation applied in the bone's local
  axes after inherited scale has been removed.
- **Resolved attachment**: an attachment whose target, layer, container, and
  unique bone are currently valid.

## Event API

The attachment-facing API belongs to `Scene3D::Base3DBehavior`, so it is
available for 3D models, boxes, custom 3D objects, and future 3D object types.

### Actions

#### Attach to a 3D model bone

```text
Attach <3D object> to bone <bone name> of <3D model>
```

Parameters after the scoped object and behavior are:

1. Target `objectPtr`, restricted to `Model3DObject` in metadata.
2. Bone name, using the `model3DBoneName` string parameter type.

The action uses zero position and rotation offsets for a new attachment.
Reattaching to a different target or bone replaces the previous relationship.
Calling the action again with the same target and bone keeps existing offsets.

Validation is transactional. If the new target, bone, layer, container, or
dependency graph is invalid, the action returns without changing an existing
valid attachment.

#### Detach from the 3D model bone

```text
Detach <3D object> from its 3D model bone
```

Detachment preserves the last synchronized world/container position and
rotation. It does not reset offsets, size, forces, visibility, or animation.

#### Set attachment position offset

```text
Set bone attachment position offset of <3D object> to <X>; <Y>; <Z>
```

The values are GDevelop distance units in the bone's local axes. They are
rotated by the bone but are not multiplied by the target's scale.

#### Set attachment rotation offset

```text
Set bone attachment rotation offset of <3D object> to <X>; <Y>; <Z> degrees
```

Offsets use GDevelop's `ZYX` Euler order and are composed after the bone
rotation.

Offset actions retain their values while unresolved and synchronize the object
immediately when possible.

### Conditions

- **Is attached to a 3D model bone**: a relationship is registered, even if it
  is temporarily unresolved after a model hot reload or layer mismatch.
- **Bone attachment is resolved**: the relationship produced a valid transform
  during the most recent synchronization pass.
- **3D model has bone**: the target runtime model contains exactly one named
  bone matching the expression.

### Expressions

Attachment expressions:

- `AttachedBoneName()` returns the registered bone name or an empty string.
- `BoneAttachmentOffsetX/Y/Z()` returns position offsets.
- `BoneAttachmentRotationOffsetX/Y/Z()` returns rotation offsets in degrees.

Model expressions:

- `BoneX(name)`, `BoneY(name)`, and `BoneZ(name)` return the posed bone position.
- `BoneRotationX(name)`, `BoneRotationY(name)`, and `BoneRotationZ(name)` return
  the scale-free posed bone rotation in degrees using `ZYX` order.

Bone values use the target's `RuntimeInstanceContainer` coordinates. These are
scene coordinates for top-level scene objects and prefab-local coordinates for
children inside a custom object. Missing or ambiguous bones return `0` and log
through a rate-limited 3D logger; the `3D model has bone` condition is the
non-ambiguous way to guard expressions.

Standard GDevelop object-picking semantics apply. An action with several picked
attachments and one picked target attaches all of them to that target. Pairwise
equipment assignment requires a `For each object` event or an explicit object
selection strategy.

## Example: a reusable knight prefab

The custom 3D object contains these sibling children on its default layer:

```text
Knight
  KnightModel   (Model3DObject)
  WeaponModel   (Model3DObject or Weapon custom 3D object)
```

Its creation events perform:

```text
Attach WeaponModel to bone "mixamorigRightHand" of KnightModel
Set WeaponModel bone attachment position offset to 0; 0; 0
Set WeaponModel bone attachment rotation offset to 0; 0; 0
```

The weapon GLB should place its GDevelop model origin at the grip. When that is
not practical, the two offset actions provide the correction. Equipping another
weapon creates or reveals another sibling weapon object, attaches it with the
same actions, and hides or deletes the previous object. Weapon logic remains in
the weapon object or weapon custom object rather than in the knight GLB.

## Bone identity contract

At model clone/rebuild time, the renderer traverses the cloned GLTF scene once
and creates:

```ts
Map<string, THREE.Bone>
Set<string> // ambiguous duplicate names
```

`GLTFLoader` sanitizes `Object3D.name` for animation binding and can remove
characters such as dots. It preserves the authored GLB name in
`bone.userData.name`. The public attachment key therefore uses this canonical
name:

```ts
const canonicalName =
  typeof bone.userData.name === "string" && bone.userData.name
    ? bone.userData.name
    : bone.name;
```

Only `THREE.Bone` nodes with a non-empty canonical name are candidates. If a
canonical name occurs more than once, it is removed from the usable map and
added to the ambiguous set. Other unique bones in the same model remain usable.
Synthetic preview-only labels such as `Bone 3` are never accepted as attachment
keys because their identity would change when the rig hierarchy changes.

The editor completion inserts the canonical name, not the sanitized runtime
name. `Model3DBoneUtils.js` should expose separate helpers for canonical names
and display labels: display code may fall back to a synthetic label, while
attachment code may not. This keeps the preview, event editor, and runtime
consistent without changing Three.js animation-track binding behavior.

The cache is built from the cloned runtime scene, not `Model3DManager`'s shared
source GLTF, because the animation mixer poses the clone. It is rebuilt whenever
`_updateModel` replaces the cloned scene. Bone objects are never exposed in the
public event API.

`Model3DRuntimeObject3DRenderer` exposes an internal typed query that writes a
pose into caller-provided reusable values rather than allocating or returning a
Three.js object:

```ts
getBonePose(
  boneName: string,
  relativeTo: THREE.Object3D,
  result: Model3DBonePose
): boolean;
```

The query updates the required matrices, verifies that `relativeTo` is an
ancestor in the same Three.js scene, and returns `false` for missing or
ambiguous names.

## Transform contract

For a resolved attachment, the manager obtains the bone matrix relative to the
common layer group. Let that matrix be `Mbone`.

1. Translation is taken directly from `Mbone`. It therefore includes target
   position, model normalization, configured model rotation, model dimensions,
   animation, and bone translation.
2. Before extracting rotation, the bone basis is converted from the rendered
   GLTF coordinate system to GDevelop's logical object coordinate system. The
   rendered model basis is `FlipY * configuredModelRotation`, so its inverse is
   post-multiplied onto `Mbone`. This removes the renderer's coordinate-system
   reflection without guessing which animated axis to flip.
3. The converted upper 3x3 matrix is orthonormalized to the closest proper
   rotation. Scale magnitude, non-uniform scale, any object flip, and shear are
   discarded.
4. Position offset is rotated by that scale-free bone rotation and added to the
   bone position.
5. Rotation offset is converted from `ZYX` Euler degrees and post-multiplied
   onto the bone rotation.
6. The final quaternion is converted to the attached object's `ZYX` Euler
   rotation. The manager calls the normal `setX`, `setY`, `setZ`,
   `setRotationX`, `setRotationY`, and `setAngle` methods.
7. The manager never calls size, scale, flip, visibility, layer, or renderer
   parenting methods.

In formula form:

```text
attachmentPosition = bonePosition + boneRotation * positionOffset
attachmentRotation = boneRotation * rotationOffsetZYX
```

The attached object's logical origin is the point placed at
`attachmentPosition`. Existing object-specific renderer logic remains
responsible for translating that origin and rotation center into its renderer
root transform.

The closest proper rotation must be deterministic for negative and non-uniform
scale. The first implementation should use polar decomposition or a tested
orthonormalization utility rather than `Matrix4.decompose` alone, because the
matrix may contain shear. Reflections affect bone position, but the attachment
keeps its own flip state and a right-handed rotation.

The renderer root must remain a direct child of its normal layer group for the
entire attachment lifetime. A test should enforce this invariant.

## Runtime state and manager

`Base3DBehavior` owns one optional runtime state:

```ts
type Model3DBoneAttachment = {
  target: gdjs.Model3DRuntimeObject;
  boneName: string;
  positionOffset: [number, number, number];
  rotationOffset: [number, number, number];
  isResolved: boolean;
  lastFailure: BoneAttachmentFailure | null;
};
```

The behavior registers and unregisters itself with a scene-owned
`Model3DBoneAttachmentManager`. The manager indexes attachments by instance
container so a pass never scans every scene object.

The manager also registers destroy callbacks on both instances:

- Attachment deletion removes the state and target callback.
- Target deletion detaches all its attachments, preserving their last pose.
- Reattachment unregisters the old target callback before registering the new
  one.
- Behavior destruction and object recycling leave no manager entries or strong
  references behind.

When attachment relationships change, the manager topologically sorts the
container's graph. A target that is itself attached is synchronized before
attachments that depend on its bones. An attempted self-attachment or cycle is
rejected transactionally. The order is cached until an attach, detach, deletion,
or container membership change.

No GLTF traversal, object-list scan, or graph sort occurs during an unchanged
frame. Per resolved attachment, a pass performs cached bone lookup, matrix
updates, transform extraction, and six guarded object setters.

## Frame ordering

Attachment synchronization occurs at these points:

1. **Immediately after an attachment or offset action**, so later actions in
   the same event can read the new logical transform when the bone is already
   posed.
2. **After all objects and pre-event behaviors in an instance container have
   updated**, so model mixers have advanced before scene or custom-object events
   read attachment positions.
3. **Before object pre-render updates in every instance container**, so changes
   made by events and post-event behaviors are reflected in the same rendered
   frame, and dirty custom 3D renderers are subsequently finalized by their
   existing `ensureUpToDate` call.

The second pass is required even if no gameplay expression reads the attached
object. It removes visual one-frame lag after changing the target transform,
attachment offset, or relationship in events.

## Eligibility and failure behavior

The attach action succeeds only when:

- the attachment implements `Base3DHandler` and has a 3D renderer root;
- the target is a live `Model3DRuntimeObject`;
- attachment and target are different instances;
- both report the same `RuntimeInstanceContainer`;
- both use the same layer name and common Three.js layer group;
- the bone name is non-empty and resolves uniquely; and
- the relationship does not create a dependency cycle.

Initial validation failure leaves any prior attachment unchanged and logs one
descriptive warning.

After a successful attachment, a temporary failure does not destroy the
relationship:

- A model rebuild or hot reload re-resolves the bone by name.
- A temporarily missing or ambiguous bone freezes the attachment at its last
  valid transform and marks it unresolved.
- A layer mismatch freezes the attachment and marks it unresolved. It resumes
  automatically if both objects again share the same layer before detachment.
- Repeated frames do not repeat the same warning. A changed failure reason or a
  later successful resolution resets rate limiting.
- Target deletion is permanent and automatically detaches the child.

Hiding either object does not change the other's `hidden` flag. The attachment
does not inherit visibility; equipment systems explicitly hide or show the
weapon. A hidden layer still hides both because the same-layer rule is required.

While attached, direct position and rotation actions on the attachment are
overwritten at the next synchronization pass. Size, scale, flip, animation,
variables, and all non-transform behavior remain independent. Forces are not
cleared automatically, but cannot move the object until it is detached.

An attached object must not have an active physics behavior that also writes
its transform. The editor help text should state this limitation. Automatic
conversion to a kinematic body is not part of this feature because it would be
a surprising cross-extension side effect.

## Editor bone-name field

Add a `model3DBoneName` string parameter renderer, following the architecture
of `ObjectPointNameField`:

- It finds the most recent object parameter, which is the target model.
- For a concrete `Model3DObject`, it reads `modelResourceName`, loads the GLTF
  through the already cached `PixiResourcesLoader.get3DModel`, and offers sorted
  unique bone names as quoted string completions.
- For a model object group, it offers the intersection of unique bone names
  available in every valid model in the group.
- It displays loading and load-error states without blocking free-form string
  expressions.
- Dynamic object expressions, empty resources, and load failures fall back to
  the normal string-expression editor.

Export canonical-name and unique-name helpers from `Model3DBoneUtils.js`. The
preview, parameter field, and runtime implementation must follow the same
authored-name preference and empty/duplicate rules. Shared-animation rig
validation can continue using its animation-binding names; attachment naming
must not silently change that existing compatibility contract. Runtime
validation remains authoritative.

The new parameter type is registered in
`ParameterRenderingService.js` and receives a human-readable label. No bone
names are serialized into the object configuration, so replacing the GLB does
not leave an editor-maintained cache in the project file.

## Serialization and backward compatibility

This feature adds no fields to `Model3DObjectConfiguration`, object data,
instance data, or custom-object child configuration. Relationships are created
by event actions and exist only between live instances. The events themselves
serialize through the existing instruction format.

Old projects contain no attachment actions and behave exactly as before. A GLB
does not need a skeleton unless an attachment action targets one of its bones.
Existing shared-animation resource and rig compatibility data are unchanged.

Hot reload retains `Base3DBehavior` runtime state when the owning instance is
retained. Rebuilding a target model invalidates only the cached `THREE.Bone`
references; the manager keeps the target instance and bone name and resolves
the new clone.

## Multiplayer and network synchronization

The first version does not serialize an attachment pointer in generic object
network data. Normal object synchronization still transmits the resolved child
position and rotation, so a remote peer without a local relationship can render
the synchronized pose at the normal multiplayer update rate.

For deterministic, full-rate local following on every peer, the same equipment
events must run on every peer, or the game must send an equipment identifier and
run the attach action after both instances exist. This limitation must be in the
action documentation.

A later multiplayer phase may synchronize `{targetNetworkId, boneName, offsets}` through `Base3DBehavior` data when both instances have network IDs.
It must support pending resolution when the target creation message arrives
after the attachment and must not generate network IDs solely because an object
is attached.

## Implementation map

### Runtime model resolver

`Extensions/3D/Model3DRuntimeObject3DRenderer.ts`

- Keep a reference to the current cloned GLTF root.
- Build and invalidate the unique-bone cache in `_updateModel`.
- Add allocation-free `hasBone` and `getBonePose` internal methods.
- Add and test the scale/shear removal utility.

`Extensions/3D/Model3DRuntimeObject.ts`

- Expose typed runtime wrappers used by event conditions, expressions, and the
  manager without exposing Three.js bones.
- Preserve existing animation and network behavior.

### Attachment capability and manager

`Extensions/3D/Base3DBehavior.ts`

- Store the optional relationship and offsets.
- Implement actions, conditions, expressions, immediate synchronization, and
  destruction cleanup.

`Extensions/3D/Model3DBoneAttachmentManager.ts` (new)

- Index relationships by container and target.
- Validate same-container/same-layer eligibility.
- Maintain destroy callbacks and cached topological order.
- Perform the pre-events and pre-render synchronization passes.
- Rate-limit runtime warnings.

`Extensions/3D/JsExtension.js`

- Register the actions, conditions, expressions, parameter types, help text,
  and new runtime include.

### Container hooks

`GDJS/Runtime/gd.ts` and runtime callback declarations

- Register container post-object-update and pre-object-render callbacks.

`GDJS/Runtime/runtimeinstancecontainer.ts`

- Invoke the hooks in the base container loops.

`GDJS/Runtime/CustomRuntimeObjectInstanceContainer.ts` and
`GDJS/Runtime/runtimescene.ts`

- Invoke the same hooks in their specialized/overridden loops.

The hooks must be no-ops when no extension registers a callback and must not
allocate per frame.

### Editor

`newIDE/app/src/ResourcesList/ResourcePreview/Model3DBoneUtils.js`

- Export canonical public bone naming, display naming, and unique-name
  extraction without exposing synthetic labels as keys.

`newIDE/app/src/EventsSheet/ParameterFields/Model3DBoneNameField.js` (new)

- Resolve the target model resource and provide asynchronous completions.

`newIDE/app/src/EventsSheet/ParameterRenderingService.js`

- Register `model3DBoneName`.

## Test plan

### Runtime unit tests

- A named bone is found in the cloned runtime model.
- Empty names are ignored and duplicate names are ambiguous.
- An authored `userData.name` containing characters sanitized from `bone.name`
  is offered by the editor and resolves at runtime.
- Synthetic preview fallback names are not accepted by attachment actions.
- A model rebuild replaces cached bone references and retains attachment by
  name.
- Animated bone translation and rotation update the child's logical transform.
- Position and rotation offsets use bone-local axes and `ZYX` order.
- Non-uniform target dimensions and model normalization do not change the
  child's width, height, depth, scale, or renderer-root parent.
- The model's built-in Y reflection and configured model rotation are removed
  as a coordinate-system basis before extracting the logical bone rotation.
- Negative object flips produce deterministic right-handed rotation and do not
  mutate child flips.
- At multiple animated poses, three non-collinear points on a standalone model
  with zero offsets match the same model authored directly below the bone when
  target and attachment use the same configured model rotation and scale.
- Attachment works for siblings in a scene container and siblings in a custom
  3D object container.
- Cross-container and cross-layer attachment is rejected transactionally.
- Layer mismatch suspends and later resumes an existing relationship.
- Reattachment removes old target callbacks.
- Deleting a child, deleting a target, recycling an object, and unloading a
  custom object leave no manager entries.
- Detach preserves the last logical transform.
- A target can own several attachments.
- Attachment chains update target-first; self-links and longer cycles fail.
- Repeated unresolved frames emit at most one warning per failure state.
- Pre-event synchronization occurs after all target mixers update, independent
  of object creation/list order.
- Pre-render synchronization applies event changes in the same rendered frame.

### Editor tests

- The parameter field lists sorted unique bone names for a model object.
- Duplicate and empty bone names are not suggested.
- A model group returns the intersection of bone names.
- Loading, missing-resource, and failed-GLB states retain free-form editing.
- Changing the target object or its model resource invalidates completions.

### Integration acceptance case

Use a knight whose GDevelop width, height, and depth are deliberately
non-uniform and a separate sword GLB with a clearly measurable blade length.
Attach the sword to the right-hand bone, play idle, run, attack, pause, seek,
and crossfade animations, then detach and delete both instances in both a scene
and a 3D custom object. The sword must follow without changing its dimensions,
remain a direct child of its normal layer group, and leave no renderer or
manager state after deletion.

## Rollout

1. Implement the cached runtime bone resolver and transform decomposition with
   isolated Three.js tests.
2. Implement `Base3DBehavior` state, the attachment manager, container hooks,
   lifecycle cleanup, chains, and runtime tests.
3. Add event metadata, documentation, the bone-name completion field, and editor
   tests.
4. Add a 3D custom-object example demonstrating a knight with swappable weapon
   child objects.
5. Consider named non-bone socket nodes, debug bone/socket visualization,
   optional target-scale inheritance modes, and relationship network sync only
   after the core contract is stable.

## Acceptance criteria

- A separate sword can be mounted to a knight's right-hand bone with event
  actions only.
- The sword follows the final animated pose with no visible frame lag.
- The sword's configured dimensions are unchanged even when the knight uses
  non-uniform width, height, and depth.
- The sword remains an independent GDevelop object and can be replaced, hidden,
  animated, or deleted independently.
- The same setup works for sibling children inside a 3D prefab.
- Invalid bones, model rebuilds, layer changes, deletion, and cycles are safe
  and deterministic.
- No existing project serialization changes and no direct Three.js object is
  exposed to events.
