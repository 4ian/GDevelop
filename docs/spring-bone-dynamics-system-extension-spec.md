# Spring Bone Dynamics System Extension Specification

Status: **Approved**

Date: 2026-08-09

Baseline:

- Repository branch: `merge-upstream-0806`
- Existing related extension: `ClothSimulation`
- Existing model runtime: `Scene3D::Model3DObject`
- Initial integration target: TwinKunai in `My project116`
- Required compute direction: WebGPU primary with a resilient CPU fallback

## 1. Approval gate

This is the focused specification required by `AGENT.md` for a new public
behavior, serialized configuration format, skeletal mutation seam, and runtime
simulation system.

No production code, generated file, loader registration, icon, or project
migration described here may be implemented until a reviewer explicitly
changes this document to **Approved** and records approval below.

| Field | Value |
| --- | --- |
| Approver | User, via explicit approval |
| Approval date | 2026-08-09 |
| Approved scope | Full WebGPU-primary specification as written |

The user's requests to replace baked TwinKunai hair animation and base the
system on GPU compute establish the desired direction. Approval after this
document exists is still required by the repository workflow.

## 2. Problem

`ClothSimulation::Cloth3DObject` owns and deforms a rectangular render mesh.
That is appropriate for flags, capes, curtains, and similar free cloth, but it
cannot animate an existing skinned hair mesh. Attaching a cloth object to a
character bone adds a second visible mesh and does not drive the model's hair
bones.

The cloth solver also deliberately ignores translation when converting forces
to cloth-local coordinates. It therefore cannot provide the root-motion
inertia expected from ponytails when a character starts, stops, turns, or is
moved by gameplay.

TwinKunai's model already contains six authored hair chains and skin weights:

- `Hair_R2_001` through `Hair_R2_End`;
- `Hair_R1_001` through `Hair_R1_End`;
- `Hair_F_001` through `Hair_F_End`;
- `Hair_L1_001` through `Hair_L1_End`;
- `Hair_L2_001` through `Hair_L2_End`; and
- `Hair_Tail_001` through `Hair_Tail_End`.

The existing offline bake recipe also defines per-chain stiffness, damping,
gravity, bend limits, and head/body sphere or capsule collision proxies. The
runtime should consume equivalent authored data and apply secondary motion to
the actual bones after the ordinary animation mixer evaluates each frame.

## 3. Executive decision

Add an isolated built-in JavaScript extension named `SpringBoneDynamics` with
one public behavior:

```text
SpringBoneDynamics::SpringBone3DBehavior
```

The behavior is restricted to `Scene3D::Model3DObject`. One behavior instance
owns all configured chains on one model instance. It loads a versioned JSON
configuration resource, binds named bones after the GLTF clone exists, and
uses WebGPU compute as the primary fixed-step solver. A mandatory CPU backend
runs while WebGPU initializes and after any unsupported-adapter, device-loss,
validation, mapping, or submission failure. Both backends write local bone
rotations before bone attachments and rendering synchronize.

The visible hair remains the original GLTF skinned mesh. No additional render
mesh, material, renderer, or baked hair animation is created. The WebGPU
backend owns compute/storage/readback buffers only; the existing WebGL/Three.js
renderer continues to own and skin the model.

The extension is a sibling of `ClothSimulation`, not a replacement or a mode
inside it. Solver math may share design ideas, but public types, ownership,
configuration, and lifecycle remain separate.

## 4. Goals

1. Animate existing skinned hair, tails, straps, and similar bone chains at
   runtime without baked secondary-motion clips.
2. React to model translation, rotation, animation, gravity, wind, and sudden
   movement.
3. Preserve the animation mixer as the authoritative base pose every frame.
4. Apply bounded sphere and tapered-capsule collisions attached to animated
   model bones.
5. Run admitted rigs on WebGPU compute by default, batch work at scene scope,
   and never block the render frame waiting for a GPU result.
6. Provide a complete bounded CPU backend for initialization, unsupported
   platforms, WebGPU device loss, and runtime GPU failures.
7. Work with animation changes, crossfades, pause/resume, object deletion,
   model hot reload, scene unload, and project preview/export.
8. Fail closed: an invalid resource or missing bone leaves the normal model
   animation visible and finite.
9. Add no work or runtime files to projects that do not use the behavior.
10. Provide event actions and diagnostics without exposing Three.js objects or
   private renderer state.
11. Migrate TwinKunai from the temporary rectangular cloth strip to actual
    hair-bone simulation.

## 5. Non-goals

The first version does not include:

- deforming arbitrary vertices without a skin and authored bones;
- creating bones, skin weights, colliders, or chain names automatically;
- self-collision or hair-to-hair collision;
- collision against arbitrary meshes or Physics3D bodies;
- cloth surfaces with cross-chain structural constraints;
- replacing the existing WebGL renderer with WebGPU rendering;
- zero-copy sharing of skeleton or storage buffers between WebGPU and WebGL;
- user-authored WGSL or arbitrary compute kernels;
- exact numerical equality between the CPU and WebGPU backends;
- deterministic lockstep equality across browsers or machines;
- replication of simulated bone poses through multiplayer state;
- saving the in-progress solver state;
- live simulation in the scene editor;
- an editor for authoring nested chains/colliders in version 1;
- IK targets, ragdolls, full-body dynamics, or replacement of the animation
  mixer; or
- modification of the original GLB asset or its body animation clips.

## 6. Current runtime seams

The implementation relies on these confirmed contracts:

- `Model3DRuntimeObject.update` advances `THREE.AnimationMixer` during the
  object pre-events update.
- Runtime behavior `doStepPostEvents` runs after scene events and before the
  registered pre-render callbacks.
- `Model3DBoneAttachmentManager` synchronizes once after object updates and
  again immediately before object rendering. The second synchronization can
  observe spring-bone rotations applied by `doStepPostEvents`.
- `Model3DRuntimeObject3DRenderer` owns the cloned GLTF hierarchy, canonical
  bone cache, animation mixer, coordinate normalization, and model reload.
- Canonical authored names already reject empty or ambiguous bones.
- `Model3DScaleFreeRotationExtractor` already extracts a proper rotation from
  reflected, scaled, or sheared model matrices for bone attachment use.

The existing read-only `getBonePose` API is insufficient because this feature
must restore/capture the current animation pose and then mutate selected local
bone rotations. A narrow internal binding API is required in the model
renderer; raw `THREE.Bone` references must not become public event API.

## 7. Public authoring surface

### 7.1 Stable identity

| Item | Stable value |
| --- | --- |
| Extension | `SpringBoneDynamics` |
| Behavior type | `SpringBoneDynamics::SpringBone3DBehavior` |
| English label | `3D spring bone dynamics` |
| Required object type | `Scene3D::Model3DObject` |
| Runtime class | `gdjs.SpringBone3DRuntimeBehavior` |
| Configuration resource kind | JSON |

Only one active spring-bone behavior may own a model instance. If multiple
instances of this behavior type are attached, the earliest active behavior in
object behavior order owns the model and later instances report
`duplicate-behavior` without mutating bones.

### 7.2 Serialized behavior properties

All fields below live in the ordinary behavior `content` and are normalized at
construction and hot reload.

| Field | Type | Default | Normalized range or choices |
| --- | --- | ---: | --- |
| `configurationResource` | JSON resource name | `""` | Existing JSON resource or unresolved |
| `enabled` | boolean | `true` | boolean |
| `backendPreference` | string | `"WebGPUPreferred"` | `WebGPUPreferred`, `CPU`, or `Auto` |
| `simulationFrequency` | integer | `120` | `30..240` Hz |
| `maxSubsteps` | integer | `6` | `1..12` |
| `blendWeight` | number | `1` | `0..1` |
| `movementInertia` | number | `1` | `0..2` |
| `rotationInertia` | number | `1` | `0..2` |
| `gravityScale` | number | `1` | `0..10` |
| `windX` | number | `0` | finite, `-100000..100000` |
| `windY` | number | `0` | finite, `-100000..100000` |
| `windZ` | number | `0` | finite, `-100000..100000` |
| `teleportDistance` | number | `300` | finite, `0..1000000` |
| `teleportAngle` | number | `90` | `0..180` degrees |

Gravity and wind are expressed in GDevelop scene-coordinate distance units per
second squared. Configuration chain gravity is multiplied by
`gravityScale`. `blendWeight=0` preserves the mixer pose while keeping the
solver warm; disabling freezes no elapsed-time debt and resumes from the
current animation pose. `WebGPUPreferred` starts on the CPU backend while the
shared WebGPU device and pipelines initialize, then migrates to WebGPU at a
frame boundary. `Auto` permits the runtime to keep very small rigs on CPU when
measured dispatch/readback overhead would exceed their bounded CPU cost.

### 7.3 Versioned JSON configuration

The behavior references a JSON resource with this stable top-level shape:

```json
{
  "formatVersion": 1,
  "chains": [
    {
      "name": "Hair_Tail",
      "bones": ["Hair_Tail_001", "Hair_Tail_002", "Hair_Tail_End"],
      "damping": 0.9,
      "stiffness": 0.1,
      "gravity": [0, 0, -1],
      "maxAngleDegrees": 125,
      "collisionMargin": 0.12,
      "collisionStartPoint": 3,
      "collisionPointCount": 8
    }
  ],
  "colliders": [
    {
      "name": "Head",
      "type": "capsule",
      "bone": "head",
      "space": "model-bind",
      "center": [0, -0.03, 1.58],
      "axis": [0, 0.68, 0.74],
      "length": 0.27,
      "radiusA": 0.097,
      "radiusB": 0.076,
      "chains": ["Hair_Tail"]
    }
  ]
}
```

#### Chain rules

- `name` is non-empty and unique.
- `bones` contains `2..64` unique canonical bone names in parent-to-child
  order. The final entry may be an unweighted end bone.
- A bone may belong to only one chain in a behavior.
- Every consecutive pair must have a parent/descendant relationship with no
  intervening configured chain bone. Version 1 requires a direct bone-parent
  relationship after non-bone helper nodes are skipped.
- `damping` and `stiffness` normalize to `0..1`.
- `gravity` contains three finite numbers.
- `maxAngleDegrees` normalizes to `0..180`.
- `collisionMargin` is finite and non-negative.
- `collisionStartPoint` and `collisionPointCount` select bounded dynamic
  points and normalize within the chain.

#### Collider rules

- Supported types are `sphere` and `capsule`.
- `bone` names the animated bone that owns the collider.
- `space` is `model-bind` in version 1. Points use the source model's bind-pose
  coordinate system and are converted to bone-local coordinates once during
  binding. This matches existing offline recipes and keeps colliders attached
  to their bones during animation.
- A sphere uses `center` plus positive `radius`.
- A capsule uses either `a`/`b` or `center`/normalized `axis`/positive
  `length`, with positive `radius` or positive tapered `radiusA`/`radiusB`.
- An empty `chains` array applies the collider to every chain. Otherwise every
  referenced chain name must exist.

The runtime rejects unknown `formatVersion` values. Unknown optional keys are
ignored for forward-compatible minor additions, while malformed required
values invalidate the configuration. Hard caps are 32 chains, 256 configured
bones, and 64 colliders per behavior.

### 7.4 Event API

All instructions are behavior-scoped and use ordinary object picking.

#### Actions

| Stable name | Behavior |
| --- | --- |
| `SetSimulationEnabled` | Enable or disable secondary motion without catch-up. |
| `ResetSimulation` | Snap all simulated points to the current animation pose and clear velocity/diagnostics. |
| `NotifyTeleported` | Reset on the next post-events step regardless of automatic thresholds. |
| `SetBlendWeight` | Set the normalized animation/simulation blend. |
| `SetMovementInertia` | Set normalized translation response. |
| `SetRotationInertia` | Set normalized rotation response. |
| `SetGravityScale` | Scale every chain's configured gravity. |
| `SetWind` | Set scene-coordinate wind X/Y/Z. |

#### Conditions

| Stable name | Meaning |
| --- | --- |
| `IsSimulationEnabled` | Author/runtime enable state. |
| `IsSimulationRunning` | Enabled, configuration loaded, binding valid, and admitted to budget. |
| `HasValidConfiguration` | JSON and every named bone/collider are valid for the current model generation. |
| `IsBudgetPaused` | Scene budget currently excludes this behavior. |
| `HasChain` | A named chain exists in the bound configuration. |
| `IsUsingWebGPU` | The currently active solver backend is WebGPU. |
| `HasWebGPUFallbackOccurred` | WebGPU was preferred but the behavior migrated to CPU after an availability or runtime failure. |

#### Expressions

| Stable name | Return value |
| --- | --- |
| `ConfigurationStatus` | Stable string diagnostic such as `ready`, `loading`, `missing-resource`, `invalid-json`, `missing-bone`, `ambiguous-bone`, `invalid-chain`, `duplicate-bone`, `duplicate-behavior`, or `budget-paused`. |
| `ChainCount` | Bound chain count, otherwise `0`. |
| `SimulatedBoneCount` | Bound controlled-bone count, otherwise `0`. |
| `DroppedSimulationTime` | Seconds discarded by fixed-step/substep caps since reset. |
| `ActiveBackend` | Stable string: `WebGPU`, `CPU`, or `None`. |
| `BackendStatus` | Stable string such as `initializing-webgpu`, `webgpu-ready`, `cpu-forced`, `cpu-auto`, `cpu-webgpu-unavailable`, or `cpu-webgpu-failed`. |

No public API exposes `THREE.Bone`, matrices, quaternions, the JSON object,
solver arrays, renderer objects, or mutable skeleton handles.

## 8. Internal model binding API

`Model3DRuntimeObject3DRenderer` receives an internal, generation-checked bone
dynamics binding seam. The exact private method names may change during
implementation, but the contract is:

1. Resolve canonical names through the existing cache and reject ambiguous
   names.
2. Validate direct chain ancestry.
3. Capture current post-mixer bone world positions and scale-free rotations.
4. Capture the animation-local quaternion for each controlled bone before any
   spring mutation that frame.
5. Convert model-bind collider points into stable bone-local points.
6. Apply a scale-free world direction delta to the captured animation-local
   quaternion and write the resulting local quaternion.
7. Update affected world matrices and skinned skeleton matrices before
   pre-render attachment synchronization.
8. Apply a completed WebGPU result as relative rotation deltas against the
   current frame's captured animation pose, never as a stale absolute pose.
9. Expose a monotonically increasing model generation. Model replacement,
   hot reload, or clone release invalidates every old binding without allowing
   stale asynchronous configuration completion to touch it.

This seam is internal to built-in runtime code. Existing public bone pose
expressions remain read-only and backward compatible.

## 9. Simulation algorithm

### 9.1 Frame ordering

For each scene frame:

1. `Model3DRuntimeObject.update` advances the mixer during pre-events.
2. Scene events may change behavior settings or move/rotate the model.
3. `SpringBone3DRuntimeBehavior.doStepPostEvents` captures the resulting
   animation pose and model root transform, then queues an immutable input
   snapshot with the scene system.
4. After behavior post-events processing, the scene system applies the newest
   already-completed WebGPU rotation-delta snapshot whose model and binding
   generations still match. It never awaits the current frame's submission.
5. The delta snapshot is composed with the current frame's captured
   animation-local quaternions. It is not an absolute pose from an older
   animation frame.
6. CPU-backed behaviors instead advance bounded fixed substeps and apply their
   result in the same scene-system callback.
7. The scene system encodes and submits the current WebGPU batch for a future
   frame, rotates its staging/readback ring, and begins asynchronous mapping.
8. Affected matrices are updated.
9. The existing pre-render bone attachment callback observes the simulated
   pose.
10. The existing Three.js renderer skins and renders the original mesh.

The next frame's mixer update overwrites the previous spring result, so every
frame begins from the authoritative animation pose and cannot accumulate local
quaternion drift. WebGPU results normally have one to three frames of bounded
visual latency because WebGPU and WebGL do not share these buffers. The use of
relative rotation deltas keeps that latency from replaying stale absolute body
animation.

### 9.2 State and integration

Each chain stores current and previous world positions for its bone points in
preallocated typed arrays or equivalent fixed-layout GPU storage buffers.
Point zero is kinematic and follows the animation pose. Every later point uses
bounded Verlet integration:

- retained displacement multiplied by damping;
- configured gravity plus runtime wind;
- root translation and rotation inertia derived from the previous and current
  model root transform; and
- stiffness attraction toward the current animated target.

Translation is therefore intentionally significant, unlike `Cloth3DObject`.
Root rotation transports prior points using the transform delta before
integration so sharp turns create lag without detaching the root.

### 9.3 Constraints

Each substep performs a stable configured-order sequence:

1. pin the root point to the current animated target;
2. integrate dynamic points;
3. constrain consecutive points to the current animated segment lengths;
4. constrain deviation from the animated/parent direction by
   `maxAngleDegrees`;
5. project selected points outside configured sphere/tapered-capsule proxies;
6. repeat length, angle, and collision projection for a fixed bounded number
   of iterations; and
7. re-pin the root.

Degenerate segments, coincident collider centers, non-invertible transforms,
and non-finite results trigger a chain reset to the current animation pose.

### 9.4 Pose application

For each controlled segment, compute the shortest proper world quaternion that
maps the current animated child direction to the simulated child direction.
Compose that delta with the captured animation world rotation, convert through
the scale-free animated parent rotation into a local quaternion, and slerp from
the captured animation-local quaternion by `blendWeight`.

The behavior never writes bone position or scale. The root animation,
translation, scale, skin weights, and material remain owned by the model.

### 9.5 Teleports, pause, and animation changes

- Root displacement above `teleportDistance`, root rotation above
  `teleportAngle`, an explicit `NotifyTeleported`, model generation change, or
  invalid elapsed time resets all chains to the current animation pose.
- Paused scenes accumulate no catch-up time.
- Animation index changes and crossfades do not reset automatically; stiffness
  follows the changing animated target. Authors can call `ResetSimulation`
  for intentionally discontinuous pose changes.
- Setting `blendWeight` to zero keeps simulation state warm but applies no
  spring rotation.

### 9.6 WebGPU compute backend

The WebGPU backend uses static engine-owned WGSL. Project data can populate
validated numeric buffers but cannot supply shader source. Per-scene packed
buffers contain current/previous point positions, animated targets, chain and
constraint metadata, filtered collider data, root-motion deltas, and output
relative quaternions.

The scene system batches admitted behaviors into one command encoder per scene
frame where practical. Dispatches use deterministic configured ordering and a
fixed upper bound on integration/constraint passes. Buffers are allocated only
after normalized admission, grow geometrically within scene hard limits, and
are reused without per-frame GPU-resource creation.

Output is copied to a minimum three-slot staging/readback ring. A slot is never
mapped, overwritten, or reused while work that references it is pending.
Completed slots carry scene, behavior, model, binding, configuration, and
simulation-generation identifiers. A mismatch discards the slot without
touching bones. Mapping and completion promises only enqueue results; they do
not directly mutate a model outside the scene-system frame callback.

Only the newest completion is eligible, and a result older than three submitted
spring-bone batches is discarded. If all readback slots remain pending or no
valid completion arrives for an internal 250-millisecond watchdog while the
scene is advancing, the system migrates the affected WebGPU batch to CPU. This
watchdog is fixed engine policy in version 1 rather than a project property.

Backend initialization and switching are state migrations, not simulation
resets when a finite latest state is available. CPU state seeds the initial
GPU upload. The newest successfully read-back GPU point state seeds CPU after
device loss; if none is recoverable, only that behavior resets to its current
animation pose. Any uncaptured WebGPU validation error, device loss, rejected
map, non-finite output, or submission failure permanently routes affected
behaviors to CPU for the remainder of the scene and records one diagnostic.

## 10. Scene system and budgets

The behavior uses a scene-owned `SpringBoneSimulationSystem` for stable
registration, duplicate ownership, backend selection, GPU batching, budgets,
cleanup, and diagnostics. Behaviors queue their post-events inputs; one
scene-system post-events callback applies available results, advances CPU
fallbacks, and submits WebGPU work before pre-render synchronization.

The system acquires WebGPU through a generic shared
`gdjs.WebGpuComputeDeviceManager`. `ClothSimulation` is migrated internally to
delegate device acquisition to the same manager while retaining its existing
public API. Spring bones and cloth therefore never create competing
`GPUDevice` instances or independent device-loss policies in one runtime.

Hard limits:

- 32 chains, 256 configured bones, and 64 colliders per behavior;
- 1024 simulated bones and 256 colliders admitted per scene;
- `30..240` Hz and `1..12` substeps;
- bounded constraint iterations fixed by the implementation;
- stable creation-order admission;
- fixed GPU storage/staging byte limits derived from the bone/collider caps;
- at most one spring-bone command submission and three readback slots per
  scene; and
- bounded CPU fallback work under the same admission caps.

An excluded behavior renders the mixer pose, reports `budget-paused`, and is
retried when earlier capacity is released. No buffer is allocated before
configuration normalization and admission checks.

## 11. Loading, hot reload, and disposal

- The JSON resource is preloaded through the existing JSON manager when
  possible and may complete asynchronously.
- A generation token guards every completion. Deleted behaviors, unloaded
  scenes, model reloads, behavior property changes, and newer resource loads
  make older completions inert.
- Until loading and binding succeed, the ordinary animation pose remains
  visible.
- Changing `configurationResource` rebuilds state at a frame boundary.
- Deactivation removes spring rotations on the following mixer evaluation and
  unregisters from the scene system.
- Object deletion and scene unload clear typed arrays, references, callbacks,
  ownership records, and pending completions deterministically.

## 12. Error handling

Configuration and binding failures never hide, delete, or corrupt the model.
They leave normal animation active, set `ConfigurationStatus`, and issue one
warning per stable failure signature.

Fatal configuration failures include unsupported versions, malformed arrays,
duplicate chain names, duplicate bones, invalid ancestry, missing/ambiguous
bones, missing collider bones, non-finite values after normalization, and
resource-load failure.

Runtime non-finite state resets only the affected behavior to its current
animation pose, records a stable diagnostic, and continues rendering. Repeated
warnings are suppressed until the resource, model generation, or failure
signature changes.

WebGPU unavailability is not a configuration failure. The behavior reports a
ready CPU backend plus the stable fallback diagnostic. Device loss, shader
pipeline failure, mapping failure, and invalid GPU output follow the same
finite CPU-fallback policy and never hide the model.

## 13. Networking and save states

Only authored behavior properties and the referenced configuration resource
are serialized. Particle state and applied bone rotations are not serialized,
saved, hot-reloaded, or network-replicated.

Every peer may run local visual spring simulation. Gameplay logic must not use
the simulated hair pose for authoritative collision or deterministic state in
version 1.

## 14. Editor experience

- The behavior appears only for compatible 3D model objects.
- `configurationResource` uses the resource picker restricted to JSON.
- The property description explains that the GLB must contain a skinned mesh
  with the configured canonical bone names.
- No simulation runs in the scene editor.
- Missing-resource and missing-bone failures appear at runtime through
  diagnostics rather than pretending the static editor has loaded the full
  skeleton.
- A dedicated icon distinguishes spring bones from rectangular cloth.

## 15. Compatibility and migration

The extension is additive. Projects without the behavior do not include its
runtime files, load JSON, inspect bones, allocate solver state, or run scene
system code.

No existing `ClothSimulation` identifier, schema, renderer, solver, event API,
or behavior changes. Existing read-only model bone expressions and bone
attachments retain their public semantics; attachments simply observe the
final simulated pose in the existing pre-render synchronization pass.

TwinKunai migration after the extension ships:

1. Convert the current bake recipe's chain/collider subset into a version-1
   runtime JSON resource.
2. Register that JSON in `resources.settings`.
3. Attach one `SpringBoneDynamics::SpringBone3DBehavior` to `TwinKunai3D`.
4. Remove `TwinKunaiHairCloth`, its Test-scene instance, its head attachment,
   and its wind event.
5. Keep the original model and all body animation resources unchanged.
6. Validate the multi-file project, commit it, reload it, and verify several
   idle/run/turn/attack animations plus explicit object movement and teleport.

## 16. Performance

WebGPU compute is the default backend. Scene-level packing and one batched
submission amortize dispatch overhead across characters, while fixed-layout
buffers and static WGSL keep shader and allocation work out of the frame hot
path. The GPU path is expected to scale better for scenes with many characters
or long hair chains.

Because Three.js renders the model through WebGL, GPU output crosses an
asynchronous readback ring and intentionally trades one to three frames of
visual latency for a non-blocking main thread. The runtime never calls a
synchronous wait for WebGPU completion. Relative direction/quaternion deltas
are applied to the current animation pose so readback latency does not delay
the character's base animation.

Both backends use preallocated typed arrays and reusable Three.js math objects.
They perform no JSON traversal, name lookup, resource lookup, unbounded array
growth, or per-point allocation in the frame hot path. Collider lists are
prefiltered per chain during binding. Model matrices are updated once per
affected chain root after rotations are written, not once per point.

Informational profiling compares CPU and WebGPU for TwinKunai's six chains,
multiple TwinKunai instances, and maximum-budget synthetic rigs. It records
submit cost, completion/readback latency, buffer bytes, dispatch count, CPU
fallback cost, and dropped simulation time. Wall-clock thresholds are not used
as flaky unit-test gates.

## 17. Affected files

### 17.1 New production and test files

```text
docs/spring-bone-dynamics-system-extension-spec.md

Extensions/SpringBoneDynamics/
  JsExtension.js
  SpringBoneDynamicsTypes.ts
  SpringBoneConfiguration.ts
  SpringBoneSolver.ts
  SpringBoneBackend.ts
  CpuSpringBoneBackend.ts
  WebGpuSpringBoneBackend.ts
  SpringBoneWebGpuShaders.ts
  SpringBoneSimulationSystem.ts
  SpringBone3DRuntimeBehavior.ts
  tests/
    SpringBoneConfiguration.spec.js
    SpringBoneSolver.spec.js
    CpuSpringBoneBackend.spec.js
    WebGpuSpringBoneBackend.spec.js
    SpringBoneSimulationSystem.spec.js
    SpringBone3DRuntimeBehavior.spec.js

Extensions/SharedWebGpuCompute/WebGpuComputeDeviceManager.ts
Extensions/SharedWebGpuCompute/tests/WebGpuComputeDeviceManager.spec.js
GDJS/tests/webgpu/SpringBoneDynamicsWebGpuSmoke.spec.js
newIDE/app/public/JsPlatform/Extensions/spring_bone_dynamics.svg
newIDE/app/src/JsExtensionsLoader/SpringBoneDynamicsJsExtension.spec.js
```

### 17.2 Expected modified repository files

```text
Extensions/3D/Model3DRuntimeObject.ts
Extensions/3D/Model3DRuntimeObject3DRenderer.ts
Extensions/3D/tests/Model3DBoneAttachment.spec.js
Extensions/ClothSimulation/WebGpuClothDeviceManager.ts
GDJS/tests/karma.conf.js
GDJS/tests/karma.webgpu.conf.js
newIDE/app/src/JsExtensionsLoader/BrowserJsExtensionsLoader.js
newIDE/app/src/JsExtensionsLoader/LocalJsExtensionsLoader.js
tsconfig.json                              # only if explicit inclusion is needed
```

Changes are limited to the internal generation-checked bone mutation binding,
shared WebGPU compute-device ownership, ClothSimulation's internal delegation,
extension include order, loader registration, expected extension count, and
tests. No Core project-model, GDevelop.js binding, renderer backend, or event
code-generation change is expected. Existing ClothSimulation identifiers,
serialized data, and runtime behavior remain unchanged.

### 17.3 Expected project files

```text
resources.settings
assets/config/twin_kunai_spring_bones.json
scenes/Test/objects/TwinKunai3D.settings
scenes/Test/objects/TwinKunaiHairCloth.settings       # removed
scenes/Test/scene.settings
scenes/Test/functions/sceneUpdate.events
```

Generated `.gdevelop` catalogs and declarations are regenerated but never
authored or committed manually.

## 18. Test plan

### 18.1 Configuration tests

- defaults, finite normalization, and all hard caps;
- unsupported version and malformed JSON;
- duplicate chains/bones and unknown collider chain filters;
- sphere, capsule, and tapered-capsule parsing;
- model-bind to bone-local conversion;
- missing, ambiguous, and invalid-ancestry bones; and
- generation-safe late JSON completion.

### 18.2 Solver tests

- rest pose under zero force;
- gravity and wind direction;
- start/stop translation inertia;
- root rotation inertia;
- damping and stiffness response;
- exact segment lengths;
- bend limit enforcement;
- sphere/capsule/tapered-capsule projection;
- overlapping collider sweeps;
- degenerate segments and collider centers remain finite;
- fixed-step frame partition equivalence;
- substep cap and dropped-time accounting;
- automatic and explicit teleport reset;
- blend zero/half/full; and
- stable typed-array identities across repeated steps.

The same normalized fixtures run through the CPU solver and a deterministic
WebGPU test device. Results are compared within documented positional and
angular tolerances rather than requiring bit-identical floating-point output.

### 18.3 Backend and WebGPU lifecycle tests

- CPU is immediately active while WebGPU initialization is pending;
- `WebGPUPreferred`, `CPU`, and `Auto` select only permitted backends;
- multiple spring behaviors and ClothSimulation share one acquired device;
- packed offsets, dispatch dimensions, constraint passes, and buffer bounds;
- no GPU buffer, encoder, bind group, or staging-slot allocation per frame;
- a three-slot readback ring never maps or overwrites an in-flight slot;
- completion order changes still apply only the newest valid snapshot;
- completions older than three submitted batches are discarded, and the
  250-millisecond progress watchdog migrates stalled work to CPU;
- stale scene/model/binding/configuration/simulation generations are ignored;
- relative GPU rotation deltas apply to the current mixer pose rather than a
  stale absolute pose;
- GPU initialization failure, device loss, validation error, submit rejection,
  mapping rejection, and non-finite output migrate safely to CPU;
- CPU-to-GPU and GPU-to-CPU state migration remain finite and bounded;
- pausing, deletion, scene unload, and model reload dispose or invalidate
  pending GPU work without late model mutation; and
- no render-frame code awaits WebGPU completion.

### 18.4 Model binding and ordering tests

- mixer pose is captured before spring mutation;
- the next mixer update restores the authoritative base pose;
- local quaternion application produces the requested child direction;
- parent rotation, reflected axes, scale, shear, and non-uniform model size;
- a model rebuild invalidates old bindings;
- shared model resources do not share mutable spring state;
- two model instances simulate independently;
- duplicate behaviors arbitrate deterministically;
- bone attachments observe the post-spring pose;
- animation crossfade, pause/resume, deletion, and scene unload; and
- no Three.js reference escapes through public actions/expressions.

### 18.5 Metadata, serialization, and export tests

- behavior identity, compatibility, property descriptors, defaults, groups,
  and JSON resource restriction;
- every action/condition/expression type and runtime function name;
- normal JSON and multi-file round trips;
- resource dependency collection and exported include order;
- shared WebGPU manager include order and ClothSimulation delegation;
- browser/local loader registration and extension-count update; and
- an unused project exports no spring-bone runtime file.

### 18.6 Real WebGPU smoke and TwinKunai runtime acceptance

After engine tests and project migration:

1. Run a hardware-backed WebGPU smoke that creates the compute pipeline,
   dispatches a representative chain/collider batch, maps a completed staging
   slot, and verifies finite output while the runtime keeps WebGL rendering.
2. Validate all project sources and generated event code.
3. Launch a fresh paused `Test` preview from the committed project.
4. Verify one TwinKunai model, zero temporary cloth objects, finite transforms,
   zero runtime errors, visible 3D meshes, zero rejected objects, and zero
   failed textures.
5. Inspect the behavior as `ready`, running, six chains, the expected
   controlled-bone count, and `ActiveBackend() = "WebGPU"` on a supported
   adapter.
6. Step idle, run, sprint, sharp-turn, attack, and evade animations.
7. Move the model between deterministic frame batches and verify the hair-tail
   bone pose lags and settles while its root remains attached.
8. Teleport beyond the threshold and verify a finite reset without an impulse.
9. Force a test-only device-loss path and verify `ActiveBackend() = "CPU"`, a
   stable fallback diagnostic, continued finite hair motion, and no model loss.
10. Orbit to rear/side views and visually confirm the original skinned ponytail
   deforms without a second ribbon mesh.

## 19. Required verification commands

At minimum after implementation:

```text
cd GDJS
npm run check-types
npm run build

cd tests
npm test
npm run test-webgpu

cd newIDE/app
npm test -- --watchAll=false src/JsExtensionsLoader/SpringBoneDynamicsJsExtension.spec.js
npm run flow
npm run lint
npm run check-format
```

Run focused Karma specs first, then the complete GDJS integration suite. Per
`AGENT.md`, after successful code checks start the real Windows app through
`python scripts/start-windows-app.py` as a detached background process and end
that implementation turn without polling it.

## 20. Alternatives considered

### Continue using `Cloth3DObject`

Rejected. It owns a separate rectangular mesh, ignores root translation, and
cannot drive existing skinning bones.

### Add a cloth mode that replaces an arbitrary object's mesh

Rejected. It violates renderer ownership and object-specific size/material
semantics already established by the cloth specification.

### One behavior instance per hair chain

Rejected for version 1. Multiple behaviors would duplicate JSON loading,
collider evaluation, root-motion tracking, ownership arbitration, and matrix
updates. One versioned resource naturally owns all chains and shared body
colliders.

### Continue baking every animation

Rejected. It multiplies assets, prevents runtime response to gameplay
movement/wind, complicates crossfades, and must be regenerated for every clip.

### CPU-only simulation

Rejected as the primary design. The requested system is GPU-based, and
scene-batched WebGPU compute scales better across multiple characters and
larger rigs. A complete CPU backend remains required for immediate startup,
unsupported platforms, device loss, and other recoverable WebGPU failures.

### GPU-only simulation

Rejected. WebGPU availability and device lifetime cannot be assumed for every
preview/export target. A GPU-only behavior could stop animating after device
loss and would make ordinary project behavior depend on asynchronous adapter
success.

### Block the frame for same-frame WebGPU output

Rejected. WebGPU completion and buffer mapping are asynchronous, and blocking
would undermine the reason to use GPU compute. The selected design uses a
triple readback ring and applies completed relative rotation deltas to the
current animation pose.

### Migrate model rendering to WebGPU or use zero-copy shared buffers

Rejected for this extension. It would expand the change into a renderer
migration, while WebGPU and WebGL do not provide portable direct buffer sharing.
The selected compute-only integration leaves all existing model rendering and
skinning ownership intact.

### Events-based project behavior only

Rejected. Public project JavaScript cannot access private Three.js skeleton
state, and exposing arbitrary mutable bones to user JavaScript would create a
larger unsafe API than the narrow built-in binding proposed here.

## 21. Rollout and rollback

The behavior ships additively. TwinKunai migration happens only after the
engine behavior passes focused tests and a real preview.

If a release issue appears, projects retain serialized behavior/configuration
data while the runtime can safely route the behavior to animation-only mode.
Rollback must not remove the registered behavior type after projects can save
it. No remote kill switch or network dependency is introduced.

## 22. Open review questions

The implementation recommendation is recorded below; reviewers may change it
before approval.

1. **Nested authoring:** use a versioned JSON resource in version 1 rather than
   adding a specialized chain/collider editor. Recommended: approve.
2. **Collider coordinates:** use model bind-pose source coordinates and convert
   them once during binding. Recommended: approve because it matches the
   existing TwinKunai recipe.
3. **Backend policy:** use WebGPU compute as the primary backend and retain a
   complete CPU initialization/failure fallback. Recommended: approve.
4. **Renderer interoperability:** keep model rendering on WebGL and use a
   non-blocking three-slot readback ring with one-to-three-frame visual latency.
   Apply relative deltas to the current mixer pose. Recommended: approve.
5. **Device ownership:** introduce one generic shared WebGPU compute-device
   manager and migrate ClothSimulation's internal device acquisition to it.
   Recommended: approve to prevent duplicate devices and loss handling.
6. **Ownership:** one active behavior per model instance, with all chains in
   one resource. Recommended: approve.
7. **Existing cloth demo:** remove it from TwinKunai after successful spring
   bone verification, while retaining the general ClothSimulation extension.
   Recommended: approve.

## 23. Approval checklist

Before changing status to **Approved**, explicitly confirm:

- a new `SpringBoneDynamics` behavior rather than extending the cloth object;
- mutation of the original skinned model bones after mixer evaluation;
- the version-1 JSON chain/collider schema;
- WebGPU-primary fixed-step simulation and bounded scene-level GPU batching;
- mandatory CPU initialization/unsupported/device-loss fallback;
- shared WebGPU device ownership with ClothSimulation;
- asynchronous triple-buffered readback with relative rotation deltas applied
  to the current animation pose;
- continued WebGL model rendering and accepted one-to-three-frame GPU result
  latency;
- translation/rotation inertia, teleport handling, and animation blending;
- sphere and tapered-capsule collision only;
- the narrow internal model-renderer binding rather than public Three access;
- no save-state/network replication of deformation; and
- removal of the temporary TwinKunai cloth strip after migration.
