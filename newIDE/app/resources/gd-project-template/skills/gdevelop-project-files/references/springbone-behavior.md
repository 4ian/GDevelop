# Use 3D spring bone dynamics

Use `SpringBoneDynamics::SpringBone3DBehavior` to add secondary motion to
existing bones in a skinned 3D model. It is suitable for hair, ponytails,
tails, straps, soft accessories, and subtle chest motion. It rotates authored
bones after the model animation mixer runs; it does not create bones, move
vertices directly, or replace the model's main animation.

## Contents

- [Authoring contract](#authoring-contract)
- [Prepare the model rig](#prepare-the-model-rig)
- [Add the JSON resource](#add-the-json-resource)
- [Attach the behavior](#attach-the-behavior)
- [Complete JSON example](#complete-json-example)
- [Configure chains](#configure-chains)
- [Configure colliders](#configure-colliders)
- [Hair and chest recipes](#hair-and-chest-recipes)
- [Tune the motion](#tune-the-motion)
- [Control and diagnose at runtime](#control-and-diagnose-at-runtime)
- [Verify the result](#verify-the-result)
- [Troubleshooting](#troubleshooting)

## Authoring contract

| Item                      | Value                                              |
| ------------------------- | -------------------------------------------------- |
| Extension                 | `SpringBoneDynamics`                               |
| Behavior type             | `SpringBoneDynamics::SpringBone3DBehavior`         |
| Required object type      | `Scene3D::Model3DObject`                           |
| Configuration resource    | Version-1 JSON resource                            |
| Preferred compute backend | `WebGPUPreferred` with CPU initialization/fallback |

Attach exactly one active spring-bone behavior to a model object. Put every
hair, chest, tail, and accessory chain for that model in the one referenced
JSON file. A second behavior on the same model reports
`duplicate-behavior` and does not control bones.

Before adding the behavior, search `.gdevelop/settings-catalog.json` for the
registered behavior type and its current author-writable properties. Stop if
the type is absent. Preserve existing unlisted behavior fields when editing an
object settings file.

## Prepare the model rig

Confirm the rig before editing project files:

1. Use exact, case-sensitive canonical bone names from the imported model.
2. Order every chain from its anchored root toward its tip.
3. Make each consecutive entry a direct parent-child bone pair after non-bone
   helper nodes are skipped.
4. Give every chain at least two bones. The final entry may be an unweighted
   end bone used only to define the last segment direction.
5. Do not reuse one bone in two chains in the same configuration.
6. Remove baked secondary motion from hair or chest tracks when the intended
   result is fully simulated. Keep ordinary body locomotion and pose animation.

Point zero of each chain follows the animated root position. Later points are
dynamic. The behavior preserves bone positions and scales and applies local
bone rotation to aim each segment toward its simulated child point. For a
two-bone chest chain, the root point stays anchored while the root bone rotates
toward the dynamic end bone.

## Add the JSON resource

Place the configuration inside the project, for example:

```text
assets/config/hero_spring_bones.json
```

Register it in `resources.settings` with a stable resource name:

```toml
[[resources]]
disablePreload = false
file = "assets/config/hero_spring_bones.json"
kind = "json"
metadata = ""
name = "HeroSpringBones"
userAdded = true
```

The behavior property uses the resource `name`, not the file path.

## Attach the behavior

Add one behavior record to the model object's `.settings` file. Initialize all
properties listed by the current settings catalog. A typical record is:

```toml
[[behaviors]]
name = "SpringBones"
type = "SpringBoneDynamics::SpringBone3DBehavior"
backendPreference = "WebGPUPreferred"
blendWeight = 1
configurationResource = "HeroSpringBones"
enabled = true
gravityScale = 1
maxSubsteps = 6
movementInertia = 1
rotationInertia = 1
simulationFrequency = 120
teleportAngle = 90
teleportDistance = 300
windX = 0
windY = 0
windZ = 0
```

Behavior properties are normalized at runtime:

| Property                  |           Default | Range or choices                 | Use                                                                                    |
| ------------------------- | ----------------: | -------------------------------- | -------------------------------------------------------------------------------------- |
| `configurationResource`   |              `""` | JSON resource name               | Select the version-1 configuration.                                                    |
| `enabled`                 |            `true` | Boolean                          | Enable simulation.                                                                     |
| `backendPreference`       | `WebGPUPreferred` | `WebGPUPreferred`, `Auto`, `CPU` | Select compute policy.                                                                 |
| `simulationFrequency`     |             `120` | Integer `30..240`                | Fixed simulation frequency.                                                            |
| `maxSubsteps`             |               `6` | Integer `1..12`                  | Bound catch-up work per frame.                                                         |
| `blendWeight`             |               `1` | `0..1`                           | Blend animation-only and simulated rotation.                                           |
| `movementInertia`         |               `1` | `0..2`                           | Root-translation response control. Verify its practical effect in the current runtime. |
| `rotationInertia`         |               `1` | `0..2`                           | Root-rotation response control. Verify its practical effect in the current runtime.    |
| `gravityScale`            |               `1` | `0..10`                          | Multiply every chain gravity vector.                                                   |
| `windX`, `windY`, `windZ` |               `0` | `-100000..100000`                | Scene-coordinate acceleration.                                                         |
| `teleportDistance`        |             `300` | `0..1000000`                     | Reset after a root-position jump.                                                      |
| `teleportAngle`           |              `90` | `0..180` degrees                 | Reset after a root-rotation jump.                                                      |

`WebGPUPreferred` starts with the CPU solver while WebGPU initializes, then
migrates at a frame boundary. Rendering still uses the normal renderer.
`Auto` uses WebGPU only for configurations with at least 32 simulated bones;
smaller configurations stay on CPU. CPU fallback preserves the same JSON and
behavior API.

## Complete JSON example

This example combines one long hair chain and two independent chest chains in
the same behavior. Bone names and collider coordinates are illustrative and
must be replaced with values from the target model.

```json
{
  "formatVersion": 1,
  "chains": [
    {
      "name": "Hair_Tail",
      "bones": [
        "Hair_Tail_001",
        "Hair_Tail_002",
        "Hair_Tail_003",
        "Hair_Tail_004",
        "Hair_Tail_End"
      ],
      "damping": 0.94,
      "stiffness": 0.018,
      "gravity": [0, 0, -1200],
      "maxAngleDegrees": 55,
      "collisionMargin": 0.02,
      "collisionStartPoint": 1,
      "collisionPointCount": 4
    },
    {
      "name": "Chest_L",
      "bones": ["Chest_L_Root", "Chest_L_End"],
      "damping": 0.985,
      "stiffness": 0.006,
      "gravity": [0, 0, -120],
      "maxAngleDegrees": 30,
      "collisionMargin": 0,
      "collisionStartPoint": 1,
      "collisionPointCount": 0
    },
    {
      "name": "Chest_R",
      "bones": ["Chest_R_Root", "Chest_R_End"],
      "damping": 0.985,
      "stiffness": 0.006,
      "gravity": [0, 0, -120],
      "maxAngleDegrees": 30,
      "collisionMargin": 0,
      "collisionStartPoint": 1,
      "collisionPointCount": 0
    }
  ],
  "colliders": [
    {
      "name": "Head",
      "type": "sphere",
      "bone": "Head",
      "center": [0, -0.01, 1.62],
      "radius": 0.11,
      "chains": ["Hair_Tail"]
    },
    {
      "name": "UpperBack",
      "type": "capsule",
      "bone": "Spine_03",
      "center": [0, 0.02, 1.34],
      "axis": [0, 0, -1],
      "length": 0.3,
      "radiusA": 0.09,
      "radiusB": 0.075,
      "chains": ["Hair_Tail"]
    },
    {
      "name": "LeftShoulder",
      "type": "sphere",
      "bone": "UpperArm_L",
      "center": [-0.14, 0, 1.43],
      "radius": 0.075,
      "chains": ["Hair_Tail"]
    },
    {
      "name": "RightShoulder",
      "type": "sphere",
      "bone": "UpperArm_R",
      "center": [0.14, 0, 1.43],
      "radius": 0.075,
      "chains": ["Hair_Tail"]
    }
  ]
}
```

Gravity values are scale-dependent. A model whose imported dimensions are
hundreds of scene units may need gravity magnitudes in the hundreds or
thousands; a unit-scale model needs much smaller values. Tune from preview
evidence instead of copying the example unchanged.

## Configure chains

| Field                 | Required | Rule                                                                                                |
| --------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `name`                | Yes      | Non-empty and unique; collider filters use this name.                                               |
| `bones`               | Yes      | `2..64` unique bone names in root-to-tip order.                                                     |
| `damping`             | No       | Defaults to `0.9`, clamped to `0..1`. Higher values retain more velocity and oscillate longer.      |
| `stiffness`           | No       | Defaults to `0.1`, clamped to `0..1`. Higher values follow the animation target more strongly.      |
| `gravity`             | Yes      | Three finite scene-coordinate accelerations. Negative Z is downward in the usual GDevelop 3D setup. |
| `maxAngleDegrees`     | No       | Defaults to `180`, clamped to `0..180`. Limits deviation from the animated direction.               |
| `collisionMargin`     | No       | Defaults to `0`, non-negative. Adds clearance around collider surfaces.                             |
| `collisionStartPoint` | No       | Defaults to `1`. First chain-point index eligible for collision. Point zero is never dynamic.       |
| `collisionPointCount` | No       | Defaults to the remaining points. Set `0` to disable collision for the chain.                       |

The configuration supports at most 32 chains, 256 configured bones, and 64
colliders per behavior. The scene system admits at most 1024 simulated bones
and 256 colliders; excess configurations report `budget-paused`.

## Configure colliders

Collider coordinates are model bind-pose coordinates, not scene/editor pixel
coordinates. They are converted to the named bone's local space when the
behavior binds, so the shapes follow animation.

A sphere uses:

```json
{
  "name": "Head",
  "type": "sphere",
  "bone": "Head",
  "center": [0, 0, 1.6],
  "radius": 0.1,
  "chains": ["Hair_Tail"]
}
```

A capsule uses either endpoints:

```json
{
  "name": "Back",
  "type": "capsule",
  "bone": "Spine_03",
  "a": [0, 0, 1.45],
  "b": [0, 0, 1.15],
  "radius": 0.09,
  "chains": ["Hair_Tail"]
}
```

or `center`, a non-zero `axis`, positive `length`, and `radius` or tapered
`radiusA`/`radiusB`. Every radius must be positive. Omit `chains`, or use an
empty array, to affect all configured chains. Otherwise list only existing
chain names.

Prefer a small set of fitted proxies. Long back hair usually needs a head
sphere, one short upper-back capsule, and one sphere per shoulder. Add more
only when a verified animation still penetrates the body. Oversized or dense
colliders push hair visibly away from the character and increase cost.

## Hair and chest recipes

### Hair

- Split separate locks or ponytails into separate chains.
- Anchor each chain at a scalp or tie bone and include the authored end bone.
- Use negative-Z gravity for a natural resting direction.
- Enable collision only on points that can reach the body.
- Fit head, shoulder, and upper-back colliders in the bind pose, then inspect
  them during idle, walk, crouch, and sharp turns.

### Chest

- Use one two-bone chain per side: root plus terminal/end bone.
- Keep both chains in the same JSON and the same behavior as the hair chains.
- The root point remains anchored; the root bone rotates toward the simulated
  terminal point. Do not move the model object or chest root position to fake
  bounce.
- Start with collision disabled for chest chains unless the rig specifically
  requires it.
- Use low maximum angles and stronger return force than long hair. Test walk
  and run cycles from a front or three-quarter camera.

## Tune the motion

Change one parameter family at a time and compare the same animation phase.

| Symptom                                           | Adjustment                                                                                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Motion is too strong or keeps oscillating         | Lower `damping`, raise `stiffness`, lower `maxAngleDegrees`, or reduce gravity magnitude.                                                            |
| Motion is too weak                                | Raise `damping` gradually, lower `stiffness`, or raise `maxAngleDegrees`.                                                                            |
| Hair floats instead of hanging                    | Increase downward gravity magnitude or `gravityScale`.                                                                                               |
| Hair is pulled too far from the body              | Reduce collider radii/margin and verify bind-pose coordinates.                                                                                       |
| Hair penetrates the body                          | Fit colliders, increase `collisionMargin` slightly, or include more reachable dynamic points.                                                        |
| Chest looks exaggerated                           | Lower `damping` and `maxAngleDegrees`; raise `stiffness`. Aim for a small motion relative to the waist, not the whole character's walk displacement. |
| Motion snaps after teleporting or changing models | Call `NotifyTeleported` or `ResetSimulation` after the discontinuity.                                                                                |

`blendWeight = 0` hides spring rotation while keeping the solver warm.
Disabling simulation clears accumulated time. Animation changes and crossfades
do not reset automatically; call `ResetSimulation` after an intentionally
discontinuous animation switch.

## Control and diagnose at runtime

Before authoring events, read [events-dsl.md](events-dsl.md) and search the
current `.gdevelop/instructions-catalog.json`. Use only instruction types and
`dslName` parameters present in that generated catalog.

The extension declares these behavior-scoped actions:

- `SetSimulationEnabled`
- `ResetSimulation`
- `NotifyTeleported`
- `SetBlendWeight`
- `SetMovementInertia`
- `SetRotationInertia`
- `SetGravityScale`
- `SetWind`

It declares diagnostic conditions for enabled/running state, valid
configuration, budget pause, WebGPU use, WebGPU fallback, and named-chain
existence. It also declares configuration/backend status and chain/bone/time
diagnostic expressions. Catalog generation is authoritative: do not author a
condition or expression that is absent from the current project catalog.

`ConfigurationStatus` may report:

| Status               | Meaning                                             |
| -------------------- | --------------------------------------------------- |
| `loading`            | JSON is loading.                                    |
| `ready`              | Configuration and bone binding succeeded.           |
| `missing-resource`   | Resource name is empty, missing, or failed to load. |
| `invalid-json`       | Top-level JSON or collider data is malformed.       |
| `missing-bone`       | A chain or collider bone does not exist.            |
| `ambiguous-bone`     | A canonical name resolves to multiple bones.        |
| `invalid-chain`      | Chain count, hierarchy, or limits are invalid.      |
| `duplicate-bone`     | A bone is reused by more than one chain.            |
| `duplicate-behavior` | More than one behavior tries to own the model.      |
| `budget-paused`      | Scene spring-bone limits excluded this behavior.    |

For GPU-required work, require the active backend to become `WebGPU`, the
WebGPU-use condition to pass, and the fallback condition to remain false. For
portable work, accept CPU fallback if the visual result and frame budget pass.

## Verify the result

Follow the main skill's validation, Git, reload, and runtime gates. For this
behavior specifically:

1. Validate project files after the JSON resource, resource registry, or
   object settings changes.
2. Commit task-owned project changes before reload.
3. Launch a fresh paused preview of a scene containing the model.
4. Step enough deterministic frames for the configuration to load and the
   selected walk/run/idle animation to cover a representative cycle.
5. Inspect the target model with `include: ["position", "behaviors"]` and
   confirm a finite object position, `ready` configuration, a running backend,
   zero runtime errors, visible 3D meshes, zero failed textures, and zero
   rejected renderer objects.
6. Capture several frames at fixed intervals. Judge chest motion relative to
   the waist or sternum so whole-character locomotion is not mistaken for
   secondary motion.
7. To verify colliders, use a fresh manual `launch_preview` with
   `display_collision_shapes: true`, then capture idle and moving poses. The
   shapes must remain attached to the intended head, shoulders, and back.
8. After collider inspection, relaunch without collision shapes for the final
   visual check.

## Troubleshooting

| Problem                                   | Check                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Nothing moves                             | Confirm `enabled`, `blendWeight > 0`, `ready` status, exact bone names, and at least two directly related bones per chain.       |
| Hair or chest animation fights the solver | Remove baked secondary tracks while preserving normal body animation.                                                            |
| Hair does not hang down                   | Verify the model's vertical axis after import and use the corresponding negative gravity component, normally Z.                  |
| The chain detaches or twists              | Fix root-to-tip order and direct bone-parent relationships; include a proper end bone.                                           |
| Colliders appear away from the body       | Recalculate model bind-pose coordinates; do not use scene coordinates or current animated world coordinates.                     |
| Head collider looks like a capsule        | Use `type: "sphere"` with `center` and `radius`; remove capsule endpoint/axis fields.                                            |
| Motion differs between backends           | Confirm identical fixed-step settings, inspect fallback status, and compare deterministic frames.                                |
| WebGPU never activates                    | Confirm `WebGPUPreferred`, WebGPU availability, and fallback diagnostics. `Auto` intentionally keeps rigs below 32 bones on CPU. |
