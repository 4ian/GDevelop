# GDevelop 3D Toolchain Semantic Validation and Runtime Verification

Status: **Approved and implemented**

Baseline:

- Repository: `GDevelopApp/GDevelop`
- Branch: `merge-upstream-0728`
- Commit: `a4e85017adc9`
- Investigation date: 2026-07-29
- Source report:
  `D:\Users\Administrator\Documents\GDevelop projects\My project103\GDEVELOP_TOOLCHAIN_ISSUES_REPORT.md`

## 1. Summary

This specification addresses the nine issues reported while authoring and
verifying a multi-file 3D GDevelop project:

| ID         | Area                            | Required outcome                                                                                                               |
| ---------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GD-3D-001  | Layer semantics and 3D renderer | Reject the invalid 3D Lighting Layer combination at authoring time and recover safely at runtime.                              |
| GD-PHY-002 | Physics3D defaults              | Preserve extension defaults through deserialization and prevent non-finite physics state.                                      |
| GD-RES-003 | SVG and Three textures          | Accept Pixi-rasterized SVG sources in Three textures and report genuinely unsupported sources precisely.                       |
| GD-INP-004 | Runtime key names               | Normalize digit aliases, validate literal key names, and use one canonical mapping.                                            |
| GD-EXT-005 | Strict JavaScript extensions    | Preflight extension compatibility and support reviewed legacy extensions without weakening project-authored strict JavaScript. |
| GD-DBG-006 | Renderer diagnostics            | Expose a bounded, JSON-safe 3D renderer summary without serializing Three/Pixi objects.                                        |
| GD-MCP-007 | MCP simulated input             | Accept user-facing digit aliases and return canonical input metadata.                                                          |
| GD-VAL-008 | Validation result semantics     | Split structural, code-generation, authoring, semantic, and runtime status into machine-readable fields.                       |
| GD-WF-009  | Agent verification workflow     | Add a staged `verify_project_change` tool with typed assertions and per-stage receipts.                                        |

The implementation must remain backward compatible for valid projects. It
must not rename serialized fields, expose raw renderer/DOM/Three objects as
public JavaScript APIs, remove the existing top-level `valid` response, or
evaluate caller-provided assertion strings.

## 2. Problem statement

The current toolchain can prove that a project parses, deserializes, and
generates JavaScript while still accepting configurations that are guaranteed
to fail semantically at runtime. The reported project encountered four such
states:

1. A layer with 3D rendering and `lighting = true` had runtime instances but
   no Three group to which their meshes could be attached.
2. Missing Physics3D shared fields replaced initialized extension defaults and
   caused invalid world scaling and non-finite object coordinates.
3. SVG image resources loaded through Pixi but were rejected by the Three
   bridge because the rasterized source was not an `HTMLImageElement`.
4. Literal digit key names such as `"1"` generated valid code but never
   matched the runtime-only canonical name `Num1`.

These failures were hard to diagnose because renderer internals are removed
from debugger dumps, MCP input has a separate key-name table, validation
summarizes several phases as `valid`, and the normal verification loop is
spread across many independent tools.

Strict JavaScript validation also has no explicit trust or compatibility
model for reviewed extension-store code. Current reviewed versions of
MousePointerLock and Raycaster3D use implementation-level DOM, renderer, and
Three APIs, while the strict project authoring surface correctly excludes
those APIs.

## 3. Goals

1. Prevent every reported silent failure before or at the point where it
   occurs.
2. Preserve editor-defined extension defaults when ordinary behavior and
   shared-data objects omit fields.
3. Keep old projects loadable and keep valid runtime behavior unchanged.
4. Make catalog metadata explain important semantics, accepted values, and
   cross-field or resource-capability constraints.
5. Provide stable, source-located diagnostic codes that editor, CLI, MCP, and
   tests can consume.
6. Make renderer attachment, scene/group/camera creation, mesh visibility,
   and texture failures observable without exposing cyclic renderer objects.
7. Use a single canonical keyboard definition for runtime, editor catalogs,
   validation, and MCP aliases.
8. Preserve strict public API enforcement for user-authored JavaScript while
   providing a narrow, auditable compatibility path for reviewed extensions.
9. Provide one safe verification orchestration tool with explicit stage
   results and declarative assertions.
10. Verify the fixes in unit tests, integration tests, the Windows app, and a
    representative voxel-game preview.

## 4. Non-goals

1. Renaming the existing TOML `lighting` field or legacy
   `isLightingLayer` JSON field.
2. Supporting simultaneous 2D Lighting Layer compositing and Scene3D
   rendering in one layer. They remain separate layer modes.
3. Serializing Three.js or Pixi objects, matrices, materials, textures, DOM
   nodes, or renderer instances into debugger dumps.
4. Exposing `THREE`, `document`, `window`, a renderer, or a canvas in the
   strict project JavaScript authoring API.
5. Silently accepting arbitrary extension-store origins based on a file path
   or extension name supplied by project data.
6. Running Git commands, committing project changes, or evaluating JavaScript
   assertion expressions from `verify_project_change`.
7. Proving arbitrary game logic correct from static validation.
8. Changing the semantics of overriding behaviors, whose sparse content is
   intentionally used for inheritance.

## 5. Confirmed current behavior and root causes

### 5.1 GD-3D-001: 3D layer marked as a Lighting Layer

`newIDE/app/src/ProjectsStorage/LayoutToml/index.js` compiles `rendering` and
`lighting` independently. The editor UI normally preserves the invariant by
hiding incompatible controls, but hand-authored multi-file layouts can bypass
the UI.

At runtime, `GDJS/Runtime/pixi-renderers/layer-pixi-renderer.ts` chooses either
`_setupLightingRendering` or `_setup3DRendering`. A lighting layer therefore
has no Three scene/group/camera. `add3DRendererObject` silently returns when
the Three group is absent.

This affects both `3d` and `2d+3d` rendering modes.

### 5.2 GD-PHY-002: extension defaults are replaced

Physics3D declares correct defaults in
`Extensions/Physics3DBehavior/JsExtension.js`:

- gravity `(0, 0, -9.8)`
- `worldScale = 100`
- shape dimensions, offsets, and mass offsets `= 0`
- collision `layers = 17` and `masks = 17`

`Core/GDCore/Project/Layout.cpp` initializes this content, but ordinary
behavior/shared-data deserialization eventually assigns `content = element`
in `BehaviorConfigurationContainer`. A partial serialized node therefore
replaces the initialized node instead of overlaying it.

The global replacement behavior cannot simply be changed because overriding
behaviors intentionally use sparse content. Physics3D also reads the missing
fields without finite-number guards and computes `1 / worldScale`.

### 5.3 GD-RES-003: the Three bridge rejects a valid raster source

Cube3D reaches `pixi-image-manager.ts` through
`Cube3DRuntimeObjectPixiRenderer`. Pixi can load and rasterize SVG into a
canvas-backed source. `_getImageSource` nevertheless accepts only
`HTMLImageElement`, then reports that the SVG resource is not an image.

Three textures can accept the rasterized canvas/image-bitmap source. The
correct fix is to broaden the validated texture source rather than declare
all SVG resources unsupported.

### 5.4 GD-INP-004 and GD-MCP-007: duplicated keyboard mappings

The runtime mapping in `GDJS/Runtime/events-tools/inputtools.ts` contains
`Num0` through `Num9`, while a literal `"1"` is unknown and conditions return
false without a diagnostic.

The editor key list and MCP bridge maintain separate copies. MCP accepts
`Num2` and raw key code `50`, but not `"2"` or `Digit2`, and its receipt only
contains low-level injection data.

### 5.5 GD-EXT-005: authoring policy has no trusted extension profile

`JavaScriptAuthoringApi.js` intentionally rejects DOM globals and private
members in strict JavaScript. Store-origin extension lint is marked
`generated_code_only` in one path, but the separate serialized-project strict
authoring scan sees the same implementation blocks and rejects them.

Current reviewed extension evidence:

- MousePointerLock 0.3.1 uses DOM pointer-lock operations, renderer canvas
  access, and a private extension namespace
  ([reviewed source](https://github.com/GDevelopApp/GDevelop-extensions/blob/main/extensions/reviewed/MousePointerLock.json)).
- Raycaster3D 0.1.7 uses `THREE.Raycaster`, Three camera/renderer-object
  access, and a private extension namespace
  ([reviewed source](https://github.com/GDevelopApp/GDevelop-extensions/blob/main/extensions/reviewed/Raycaster3D.json)).
- FirstPersonCamera 1.0.5 and PhysicsCharacter3DKeyMapper 1.1.1 contain no
  strict JavaScript blocks and already pass this policy.

`import_extension` also mutates and saves the live project before all
compatibility information is available, so a blocking failure can be
discovered too late.

### 5.6 GD-DBG-006: debugger redaction removes all renderer evidence

Both debugger dump paths in
`GDJS/Runtime/debugger-client/abstract-debugger-client.ts` replace
`_renderer`, `_gameRenderer`, `_imageManager`, and `_rendererEffects` with
`"[Removed from the debugger]"`.

The redaction is necessary, but no safe summary is computed first. MCP then
summarizes only the redacted runtime payload, so it cannot distinguish an
existing runtime object from an attached, visible renderer object.

### 5.7 GD-VAL-008: one compatibility boolean covers multiple phases

`validate_project_files` already returns warnings such as
`runtime-verification-required`, but callers can still treat `valid: true` as
a completion signal. Some early-return/error paths also return a smaller
shape than successful validation.

Static semantic checks for layers, resources, Physics3D values, and literal
keyboard names do not currently share a common status or diagnostic envelope.

### 5.8 GD-WF-009: verification is manually orchestrated

Validation, reload, old-preview closure, fresh paused preview launch,
deterministic frame running, input injection, inspection, screenshots, and
assertions are independent operations. There is no stage-aware combined
receipt or safe assertion schema.

## 6. Proposed architecture

### 6.1 Shared diagnostic model

New semantic and compatibility diagnostics must use this JSON-safe shape:

```js
type ToolchainDiagnostic = {|
  code: string,
  severity: "error" | "warning" | "info",
  stage:
    | "parse"
    | "structural"
    | "code-generation"
    | "javascript-authoring"
    | "semantic"
    | "runtime"
    | "extension-preflight",
  message: string,
  remediation?: string,
  source?: {|
    file?: string,
    line?: number,
    column?: number,
    projectPath?: string
  |},
  details?: { [string]: mixed }
|};
```

Existing error arrays remain available. New diagnostics are additive and use
stable codes. User-visible text may evolve without requiring clients to parse
messages.

Checks that naturally own precise locations remain close to their parsers:

- layout cross-field checks in the Layout TOML compiler;
- literal keyboard checks in the event validation scanner;
- Physics3D editor property checks in the extension definition;
- resource-source checks in the image manager.

A small project-level semantic aggregation layer converts those results into
the shared status/diagnostic model for MCP, preview, and export orchestration.
It must not force non-event diagnostics into the event-only
`DiagnosticReport` model.

### 6.2 Layer semantics and runtime recovery

#### Authoring-time rule

After `rendering` and `lighting` are parsed, the Layout TOML compiler must
reject:

```text
lighting = true AND rendering IN ("3d", "2d+3d")
```

with:

```text
LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER
```

Message:

```text
Layer "<name>" uses rendering="<mode>" and lighting=true. The lighting flag
creates a dedicated 2D Lighting Layer; it does not enable Scene3D lighting.
Set lighting=false and add Scene3D light effects instead.
```

The error must point to the layer and, where available, the `lighting` source
line. Default/2D rendering with `lighting = true` remains valid.

The same invariant must be checked for legacy serialized JSON before preview
or export so non-TOML entry points cannot bypass it.

#### Runtime compatibility fallback

Old exports and unvalidated serialized projects must not produce an empty 3D
world silently. During `RuntimeLayer` construction:

1. Preserve the originally configured lighting flag for diagnostics.
2. If the rendering type supports 3D and the configured lighting flag is
   true, emit one warning per layer.
3. Set the effective lighting-layer flag to false and initialize the normal
   3D path. The explicit rendering type wins for this otherwise invalid
   combination.

`LayerPixiRenderer.add3DRendererObject` keeps a second one-warning-per-layer
guard when no group exists. It must never silently discard the renderer
object.

The fallback must not lazily create only a `THREE.Group`, because a functional
3D path also requires the scene, camera, composer, and render texture.

#### Catalog

The `lighting` entry remains the serialized key and gains:

```json
{
  "description": "Marks a dedicated 2D Lighting Layer. This does not enable Scene3D lighting; use Scene3D light effects for 3D layers.",
  "semanticRole": "dedicated-2d-lighting-layer",
  "constraints": [
    {
      "code": "LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER",
      "incompatibleWhen": {
        "rendering": ["3d", "2d+3d"]
      }
    }
  ]
}
```

These catalog properties are additive. Unknown-property-tolerant existing
clients remain compatible.

### 6.3 Default-preserving behavior deserialization and Physics3D guards

#### Core deserialization

Add an explicit default-overlay path; do not alter the existing replacement
API globally.

For ordinary, non-overriding behavior content and behavior shared data:

1. Create and initialize the extension-defined default content.
2. Recursively overlay fields present in serialized input.
3. Keep input values authoritative.
4. Preserve unknown extension fields.
5. Preserve arrays as authored rather than merging array indices.

Overriding behaviors continue using sparse replacement/inheritance semantics.

The implementation should expose the intent in a named helper such as
`UnserializeFromWithDefaultContent` rather than infer it from call sites.

#### Physics3D runtime guard

`Physics3DSharedData` normalizes each field before use:

- finite gravity values are retained;
- invalid gravity falls back independently to `0`, `0`, and `-9.8`;
- `worldScale` is retained only when finite and greater than zero;
- invalid or missing `worldScale` falls back to `100`;
- `worldInvScale` is computed only after normalization.

`Physics3DRuntimeBehavior` also normalizes hidden behavior fields:

- shape dimensions, shape/mass offsets, and `massOverride`: finite or `0`;
- `layers` and `masks`: valid integers or `17`;
- legal zero values must not be replaced through truthiness checks.

Fallbacks emit one bounded warning per scene/behavior configuration rather
than per frame or per instance.

The extension property update path must reject non-finite, zero, and negative
`worldScale` values.

#### Diagnostics

```text
PHYSICS3D_MISSING_SHARED_DEFAULT
PHYSICS3D_INVALID_WORLD_SCALE
PHYSICS3D_INVALID_BEHAVIOR_NUMBER
```

Missing fields that are successfully defaulted are warnings with the applied
value. Explicit zero/negative/non-finite world scale is an error during
authoring, and still receives a runtime fallback for old/unvalidated input.

### 6.4 Three texture-source capability and SVG support

Rename `_getImageSource` to reflect the actual contract, for example
`_getThreeTextureSource`.

The helper must accept supported, already-loaded raster sources with guarded
browser-global checks:

- `HTMLImageElement`;
- `HTMLCanvasElement`;
- `ImageBitmap`;
- `OffscreenCanvas` when available and supported by the active Three version.

SVG continues to enter as an image resource. Pixi performs rasterization and
the resulting canvas/image-bitmap is uploaded to Three. The existing texture
cache and lifecycle remain authoritative; the fix must not rasterize on every
material request.

Cube3D, skybox, and other consumers of the central Three texture helper gain
the same behavior. Model3D material textures using the same helper must be
covered by compatibility tests.

Genuinely unsupported sources produce:

```text
THREE_TEXTURE_UNSUPPORTED_SOURCE
CUBE3D_UNSUPPORTED_FACE_TEXTURE_FORMAT
```

The diagnostic context can include:

```json
{
  "objectName": "Block",
  "instanceId": 6,
  "face": "front",
  "resourceName": "assets/block.svg",
  "sourceType": "SVGResource"
}
```

Object renderers pass optional diagnostic context to the central image
manager. The image manager retains a bounded failure registry for debugger
queries; it does not retain renderer or DOM references.

Catalog resource parameters gain additive accepted-capability metadata:

```json
{
  "acceptedResourceCapabilities": ["image-2d", "three-texture"]
}
```

Resource catalogs mark the capabilities derived from the actual loader. SVG
is marked `three-texture` after this change. Unsupported/non-image resources
are rejected before runtime.

### 6.5 Canonical keyboard definitions

Create one data-only keyboard definition module that can be consumed by the
runtime and editor build. Each entry contains:

```js
{
  gdevelopKeyName: 'Num2',
  keyCode: 50,
  domCode: 'Digit2',
  location: 0,
  aliases: ['2', 'Digit2']
}
```

Numpad entries remain distinct:

```js
{
  gdevelopKeyName: 'Numpad2',
  keyCode: 98,
  domCode: 'Numpad2',
  location: 3,
  aliases: []
}
```

Runtime, editor key pickers, event/instruction catalogs, literal validation,
and MCP normalization must derive from this module or a generated artifact
with a parity test. There must be no hand-maintained MCP mirror.

Runtime input conditions normalize aliases before lookup:

```text
"0" ... "9" -> "Num0" ... "Num9"
"Digit0" ... "Digit9" -> "Num0" ... "Num9"
```

Canonical reverse lookup remains `NumN`; adding aliases must not overwrite
the code-to-name map. Existing canonical names and all existing key behavior
remain unchanged. Unknown runtime strings remain safely false and emit a
bounded authoring/debug diagnostic rather than throwing in an exported game.

The event validator checks only statically known string literals:

- known canonical name: accepted;
- supported alias: accepted and optionally offers canonicalization;
- unknown literal: `INPUT_UNKNOWN_KEY_NAME`;
- dynamic expression: allowed because it cannot be proven invalid statically.

The instruction catalog exposes accepted keyboard values and aliases for
parameters of type `keyboardKey`.

### 6.6 Strict extension compatibility and public facades

#### Policy separation

Strict validation distinguishes three policies:

1. `project-public-api`: user scene/event JavaScript and local extensions;
2. `reviewed-extension-compatibility`: authenticated reviewed store
   extension implementation code;
3. `generated-code`: generated sources and syntax/code-generation checks.

`project-public-api` remains unchanged and blocking. It must continue to
reject DOM globals, Three globals, raw renderers, and private members.

A reviewed extension may use the compatibility profile only when provenance
comes from trusted store metadata supplied by the extension installation
pipeline. A project-controlled path, extension name, or `origin.name` string
alone is insufficient. The trusted record includes extension name, version,
content hash, and source channel.

For a pinned legacy reviewed extension:

- syntax and generated-code failures remain blocking;
- known implementation-API compatibility findings are returned as warnings;
- the receipt identifies `compatibilityMode`, trusted origin, extension
  version, content hash, runtime API hash, and project API hash;
- the same source in a local/project-authored extension remains blocking.

This is a migration bridge, not a general strict-mode bypass.

#### Import preflight

Extension installation must preflight the candidate and dependencies after
download but before:

- `onWillInstallExtension`;
- mutating the live `gdProject`;
- installing dependencies into the project;
- saving the project.

Blocking failure returns:

```json
{
  "code": "EXTENSION_STRICT_API_INCOMPATIBLE",
  "installed": false,
  "saved": false,
  "diagnostics": []
}
```

The project remains unchanged. Already-installed extensions also return a
compatibility receipt instead of silently returning.

New optional registry/serialized metadata:

```json
{
  "strictJavaScriptApiCompatible": true,
  "testedRuntimeApiHash": "sha256:...",
  "testedProjectApiVersion": "..."
}
```

Old packages remain installable through the pinned reviewed compatibility
record. New or changed packages without matching metadata/hash are fully
preflighted and cannot inherit trust from an older version.

#### Narrow public APIs

Add public, renderer-free pointer-lock functions:

```js
gdjs.evtTools.input.requestPointerLock(runtimeScene);
gdjs.evtTools.input.exitPointerLock(runtimeScene);
gdjs.evtTools.input.isPointerLocked(runtimeScene);
gdjs.evtTools.input.getMouseMovementX(runtimeScene);
gdjs.evtTools.input.getMouseMovementY(runtimeScene);
```

They delegate to existing runtime renderer/input-manager behavior without
returning the canvas or DOM objects.

Add a high-level raycast/picking facade:

```js
gdjs.evtTools.scene3d.pickObjectsWithRay(
  runtimeScene,
  objectsLists,
  originX,
  originY,
  originZ,
  directionX,
  directionY,
  directionZ,
  maxDistance
);
```

The facade performs Three renderer-object access internally and integrates
with GDevelop object picking. It returns/picks runtime objects, not
`THREE.Intersection` or renderer objects.

The public declarations, documentation, generated-code checks, and runtime
tests must be updated together. Reviewed MousePointerLock and Raycaster3D can
then migrate off implementation APIs; the pinned compatibility profile keeps
their currently reviewed versions usable during migration.

#### Compatibility fixtures and CI

Tests pin the reviewed packages and versions listed in section 5.5. CI checks:

- reviewed compatibility provenance;
- strict validation result;
- generated source verification;
- web export;
- desktop preview-compatible code generation.

Upstream GDevelop-extensions CI should consume the same runtime/project API
hashes. The GDevelop repository tests remain self-contained using pinned
fixtures and do not require a live extension-store request.

### 6.7 Bounded renderer diagnostics

Renderer redaction remains intact. Before serialization, the runtime creates a
plain-data summary through a read-only renderer method.

#### Layer summary

```js
type LayerRendererDiagnostics = {|
  layerName: string,
  renderingType: "2d" | "3d" | "2d+3d",
  configuredLightingLayer: boolean,
  effectiveLightingLayer: boolean,
  hasThreeScene: boolean,
  hasThreeGroup: boolean,
  hasThreeCamera: boolean,
  threeSceneChildCount: number,
  threeGroupChildCount: number,
  threeMeshCount: number,
  visibleThreeMeshCount: number,
  rejected3DRendererObjectCount: number,
  failedTextureCount: number,
  effectCount: number,
  camera?: {|
    type: string,
    position: [number, number, number],
    rotationDegrees: [number, number, number],
    forward: [number, number, number],
    near?: number,
    far?: number,
    fov?: number
  |},
  truncated: boolean
|};
```

The traversal counts meshes but never serializes nodes. Values must be finite
or explicitly `null`; JSON must not contain `NaN` or infinities.

#### Object summary

Object-level detail is opt-in by object name/instance selector and capped:

```js
{
  "objectName": "Block",
  "instanceId": 6,
  "hasRendererObject": true,
  "rendererAttachedToExpectedLayer": false,
  "visible": true,
  "materialCount": 6,
  "loadedTextureCount": 6,
  "textureFailures": []
}
```

Attachment is determined by a bounded parent-chain walk to the expected layer
group/scene. Texture failure details come from the bounded image-manager
registry and renderer-provided object/face context.

#### Transport

Use one shared debugger dump builder for normal dumps and `framesRan`
responses. Add `rendererDiagnostics` beside the existing redacted payload:

```json
{
  "command": "dump",
  "payload": {},
  "rendererDiagnostics": {}
}
```

MCP inspection and `run_frames` preserve the legacy raw payload and add the
summary as a separate field. Renderer diagnostics are available even when
`include_raw_dump` is false.

Default limits:

- 16 runtime scenes;
- 64 layers total;
- 5,000 traversed Three nodes total;
- 50 object renderer summaries;
- 100 texture failure records.

Every capped collection returns total/returned counts and `truncated`.

### 6.8 Machine-readable validation phases

All success and failure paths of `validate_project_files` return the same
top-level status shape:

```json
{
  "valid": true,
  "validMeaning": "pre-runtime-validation-passed",
  "structurallyValid": true,
  "eventCodeGenerationValid": true,
  "extensionGeneratedCodeValid": true,
  "javascriptAuthoringValid": true,
  "semanticLintStatus": "checked",
  "semanticLintPassed": true,
  "runtimeVerified": false,
  "readyForRuntimeVerification": true,
  "completionReady": false,
  "completionStatus": "runtime-verification-required",
  "diagnostics": []
}
```

Fields not run because an earlier phase failed use `null` plus an explicit
status such as `not-checked`; they must not be reported as `true`.

Compatibility:

- `valid` remains and retains the existing pre-runtime gate meaning;
- it is not renamed, removed, or redefined as runtime success;
- existing warnings remain;
- new clients use the explicit fields;
- `completionReady` is always false in `validate_project_files` because that
  tool does not run the game.

`completionReady` can become true only in a runtime-verification receipt when
all required pre-runtime phases passed and all requested runtime stages and
assertions passed.

### 6.9 `verify_project_change`

Add one exposed MCP tool that safely orchestrates existing operations:

```json
{
  "project_entry_file": "D:/project/project.gdevelop",
  "scene": "Game",
  "reload": true,
  "fresh_preview": true,
  "start_paused": true,
  "frames": 180,
  "inputs": [],
  "inspect": {
    "objects": ["Player", "Block"],
    "renderer": true
  },
  "assertions": [],
  "capture_screenshot": true
}
```

Stages:

1. validate project files;
2. reload project;
3. close old previews when `fresh_preview` is true;
4. launch the requested scene paused and forced-new;
5. run frames and normalized inputs with automatic release;
6. inspect runtime errors, selected objects, and renderer diagnostics;
7. evaluate typed assertions;
8. optionally capture the renderer-canvas screenshot.

No mutation after validation is allowed if validation fails. The first failed
stage stops later stages and returns:

```json
{
  "success": false,
  "completionReady": false,
  "failedStage": "assertions",
  "completedStages": [
    "validation",
    "reload",
    "close-preview",
    "launch",
    "run-frames",
    "inspect"
  ],
  "receipts": {
    "validation": {},
    "reload": {},
    "closePreview": {},
    "launch": {},
    "runFrames": {},
    "inspect": {},
    "assertions": {}
  }
}
```

The tool does not commit. Project-authoring workflows that require a commit
before reload must perform and verify that commit before calling it.

Assertions are a closed, declarative schema. Initial kinds:

```json
[
  { "kind": "runtime-errors-empty" },
  { "kind": "object-count", "object": "Block", "equals": 143 },
  {
    "kind": "instance-field-finite",
    "object": "Player",
    "instance": 0,
    "fields": ["x", "y", "z"]
  },
  {
    "kind": "instance-field",
    "object": "Player",
    "instance": 0,
    "field": "z",
    "operator": ">=",
    "value": 0
  },
  {
    "kind": "renderer-mesh-count",
    "layer": "",
    "operator": ">",
    "value": 0
  }
]
```

Allowed numeric operators are a fixed enum. Fields are resolved through safe
summary accessors; arbitrary object paths and code strings are rejected.
Existing frame, input, inspection, and screenshot limits apply.

### 6.10 MCP input normalization receipt

`simulate_preview_input` and `run_frames` accept:

```text
"2"
"Num2"
"Digit2"
key_code: 50
```

and normalize them to:

```json
{
  "domCode": "Digit2",
  "keyCode": 50,
  "gdevelopKeyName": "Num2",
  "location": 0,
  "inputAlias": "2"
}
```

`Numpad2` returns key code `98`, DOM code `Numpad2`, GDevelop name
`Numpad2`, and numpad location. It must not alias to the main keyboard digit.

Existing input payloads and `applied` receipts remain. The tools add a
`normalizedInputs` array. Unknown numeric `key_code` values remain injectable
for backward compatibility but have null canonical metadata.

## 7. Public API, schema, and catalog changes

| Surface                       | Change                                                                     | Compatibility                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Layout TOML                   | Cross-field diagnostic for 3D rendering plus `lighting=true`               | Invalid, previously non-rendering input is rejected; serialized keys unchanged.                           |
| Legacy project validation     | Same layer invariant                                                       | Existing projects still open; preview/export gets a precise error and runtime fallback remains available. |
| Core behavior deserialization | New explicit default-overlay path                                          | Valid complete data unchanged; overriding behavior semantics unchanged.                                   |
| Runtime input                 | Digit/`DigitN` aliases                                                     | Additive; canonical reverse names stay `NumN`.                                                            |
| Strict JS public API          | Pointer-lock and high-level raycast facades                                | Additive; no raw renderer/DOM/Three exposure.                                                             |
| Extension metadata            | Compatibility boolean and API hashes                                       | Optional and additive.                                                                                    |
| Catalogs                      | Descriptions, constraints, resource capabilities, keyboard accepted values | Additive keys/values.                                                                                     |
| Debugger protocol             | Top-level `rendererDiagnostics`                                            | Additive; raw runtime payload stays redacted and structurally compatible.                                 |
| Validation MCP response       | Phase fields and diagnostic envelope                                       | Additive; `valid` retained.                                                                               |
| Input MCP response            | `normalizedInputs`                                                         | Additive.                                                                                                 |
| MCP catalog                   | New `verify_project_change` tool and schemas                               | Additive tool.                                                                                            |

No project-file migration or automatic rewrite is required.

## 8. Affected layers and expected files

The exact patch may use nearby helpers, but implementation is expected in
these ownership areas.

### Core serialization

- `Core/GDCore/Project/Layout.cpp`
- `Core/GDCore/Project/BehaviorConfigurationContainer.h`
- `Core/GDCore/Project/BehaviorsContainer.cpp`
- nearby Core project serialization tests

### Multi-file format and catalogs

- `newIDE/app/src/ProjectsStorage/LayoutToml/index.js`
- `newIDE/app/src/ProjectsStorage/LayoutToml/index.spec.js`
- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`
- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.spec.js`
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`
- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.js`
- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.spec.js`

### Runtime and extensions

- `GDJS/Runtime/RuntimeLayer.ts`
- `GDJS/Runtime/events-tools/inputtools.ts`
- a new data-only keyboard-definition module near the runtime input code
- `GDJS/Runtime/pixi-renderers/layer-pixi-renderer.ts`
- `GDJS/Runtime/pixi-renderers/pixi-image-manager.ts`
- `GDJS/Runtime/debugger-client/abstract-debugger-client.ts`
- `Extensions/3D/Cube3DRuntimeObjectPixiRenderer.ts`
- `Extensions/Physics3DBehavior/JsExtension.js`
- `Extensions/Physics3DBehavior/Physics3DRuntimeBehavior.ts`
- `Extensions/Physics3DBehavior/tests/Physics3DRuntimeBehavior.spec.js`
- public input/Scene3D facade declarations and tests

### Editor validation and MCP

- `newIDE/app/src/Utils/KeyboardKeyNames.js`
- `newIDE/app/src/Utils/EventsValidationScanner.js`
- a new project semantic validation aggregator under
  `newIDE/app/src/Utils` or `ProjectsStorage`
- `newIDE/app/src/Mcp/McpEventKnowledge.js`
- `newIDE/app/src/Mcp/McpProjectTools.js`
- `newIDE/app/src/Mcp/McpEditorBridge.js`
- `newIDE/app/src/Mcp/McpEditorBridge.spec.js`
- `newIDE/app/src/Mcp/McpToolCatalog.js`
- extension installation hooks under
  `newIDE/app/src/EventsFunctionsExtensionsLoader`

The external `ThirdParties/ai_game_workbench` submodule is not an owner of
these defects and must not be changed for this work.

## 9. Compatibility and migration

### 9.1 Project files

- `lighting` and `isLightingLayer` remain unchanged.
- Existing valid 2D Lighting Layers remain unchanged.
- Existing valid 3D/2D+3D layers remain unchanged.
- The invalid combined mode is rejected in authoring and normalized to the
  explicit 3D mode at runtime for old/unvalidated content.
- Missing ordinary behavior fields receive extension defaults in memory.
- Unknown extension fields survive deserialization.
- No save-time rewrite is required merely because defaults were hydrated.

### 9.2 Physics

Complete editor-created projects behave identically. Partial old or
hand-authored data becomes finite and receives warnings. Overriding behaviors
retain sparse inheritance behavior.

### 9.3 Resources

PNG/JPEG/WebP behavior is unchanged. SVG gains Three texture support through
the same cached Pixi raster. A source unsupported by the active browser/Three
version still fails, but with structured resource and object context.

### 9.4 Input

Canonical names and key codes are unchanged. Digit aliases are additive.
`LastPressedKey` continues to return canonical `NumN`, not the caller alias.

### 9.5 MCP

Existing request payloads and response fields remain. `valid`, raw dump
redaction, input `applied` receipts, and individual tools are preserved.
Clients can adopt explicit status and normalization fields incrementally.

### 9.6 Extensions

Local/user strict JavaScript receives no new privilege. Only provenance-bound,
pinned reviewed packages can use the temporary compatibility profile. New
public facades are additive. Store metadata fields remain optional for legacy
packages.

## 10. Error handling and diagnostics

Required stable codes:

| Code                                       | Severity/stage                               | Trigger                                                      |
| ------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------ |
| `LAYOUT_3D_LAYER_MARKED_AS_LIGHTING_LAYER` | Error / semantic                             | Lighting Layer combined with 3D-capable rendering.           |
| `RUNTIME_3D_LIGHTING_LAYER_NORMALIZED`     | Warning / runtime                            | Old/unvalidated invalid layer is normalized to 3D.           |
| `RUNTIME_3D_RENDERER_OBJECT_REJECTED`      | Warning / runtime                            | A 3D renderer object cannot attach to a layer group.         |
| `PHYSICS3D_MISSING_SHARED_DEFAULT`         | Warning / semantic/runtime                   | A missing Physics3D field was hydrated.                      |
| `PHYSICS3D_INVALID_WORLD_SCALE`            | Error / semantic, warning / fallback runtime | World scale is non-finite or not positive.                   |
| `PHYSICS3D_INVALID_BEHAVIOR_NUMBER`        | Error or warning                             | Hidden numeric behavior data is invalid.                     |
| `THREE_TEXTURE_UNSUPPORTED_SOURCE`         | Error / runtime                              | Loaded Pixi source cannot be uploaded to Three.              |
| `CUBE3D_UNSUPPORTED_FACE_TEXTURE_FORMAT`   | Error / semantic/runtime                     | A Cube face resource lacks Three texture capability.         |
| `INPUT_UNKNOWN_KEY_NAME`                   | Error / semantic                             | A statically known key literal is not canonical or an alias. |
| `EXTENSION_STRICT_API_INCOMPATIBLE`        | Error / extension preflight                  | Candidate extension cannot satisfy its validation policy.    |
| `RENDERER_DIAGNOSTICS_TRUNCATED`           | Info / runtime                               | One or more renderer diagnostic caps were reached.           |
| `VERIFY_PROJECT_CHANGE_ASSERTION_FAILED`   | Error / runtime verification                 | A typed assertion did not pass.                              |

Runtime warnings must be deduplicated by scene/layer/configuration/resource as
appropriate. They must not be emitted once per frame.

## 11. Performance, privacy, and security

1. Default hydration occurs only during deserialization and is linear in
   serialized content size.
2. Semantic validation is linear in layers, relevant behavior data,
   resources, and event instructions.
3. SVG rasterization remains cached by Pixi; no extra per-frame conversion is
   allowed.
4. Renderer summaries are computed only for debugger/MCP requests, never in
   the render loop.
5. Renderer traversal and failure registries have hard caps and truncation
   metadata.
6. Diagnostics contain scalar data and bounded strings only. They cannot
   expose canvases, DOM nodes, renderer references, texture pixels, object
   variables not already requested, or arbitrary private object graphs.
7. Trusted extension policy requires verified provenance and content hashes;
   project-controlled names, origins, and paths cannot grant trust.
8. Extension preflight precedes all live project mutation and save activity.
9. Verification assertions are parsed against a closed schema and never
   evaluated as code.
10. `verify_project_change` respects existing preview/frame/input/screenshot
    limits and tool permissions.

## 12. Test strategy

### 12.1 Layout and catalog tests

Update the existing fixture that currently treats `2d+3d` plus
`lighting=true` as valid. Add:

- `3d + lighting=true` rejected with code and source location;
- `2d+3d + lighting=true` rejected;
- default/2D plus lighting accepted;
- legacy JSON semantic scan catches the same conflict;
- catalog snapshot contains the dedicated-2D description and constraint;
- runtime old-project fallback produces configured/effective flags and one
  warning.

### 12.2 Core and Physics3D tests

- partial ordinary behavior content overlays extension defaults;
- partial shared data overlays extension defaults;
- unknown fields survive;
- arrays remain authored;
- overriding behavior content stays sparse;
- Physics3D shared data containing only name/type produces gravity defaults,
  `worldScale = 100`, and `worldInvScale = 0.01`;
- missing, zero, negative, `NaN`, and infinity cases are covered;
- hidden dimensions/offsets/mass fields default to zero;
- layers/masks default to 17;
- a dynamic capsule and static floor run at least one frame with finite X/Y/Z;
- multi-file composed Physics3D equals an editor-created equivalent.

### 12.3 Texture tests

In a browser-capable runtime test:

- PNG continues to create a Three texture;
- a small SVG with intrinsic dimensions is rasterized by Pixi and accepted as
  canvas/image-bitmap;
- Cube3D can create all face materials from SVG;
- cube texture/skybox central paths remain valid;
- Model3D use of the central helper remains valid;
- an actually unsupported source produces a structured, contextual failure;
- failure registry limits and deduplication work.

### 12.4 Keyboard tests

- `"1"`, `Num1`, and `Digit1` all observe main-keyboard code 49;
- `Numpad1` observes code 97 and remains distinct;
- reverse lookup and last-pressed key return `Num1`;
- unknown runtime keys are safe and bounded;
- event scanner accepts supported aliases, rejects a bogus literal, and
  permits a dynamic expression;
- generated catalogs expose keyboard accepted values;
- runtime, UI, and MCP definition parity is enforced.

### 12.5 Extension tests

- project/local strict code using DOM/private APIs remains an error;
- the same pinned reviewed block receives the compatibility profile and a
  warning;
- syntax/generated-code failures remain blocking for reviewed code;
- a spoofed origin/path receives no trust;
- changed content/version/hash invalidates a pinned trust record;
- preflight happens before project mutation and save;
- failure returns `installed=false`, `saved=false`, and leaves project bytes
  unchanged;
- dependencies identify their own extension in diagnostics;
- already-installed extensions return a compatibility receipt;
- pinned fixtures for FirstPersonCamera, MousePointerLock, Raycaster3D, and
  PhysicsCharacter3DKeyMapper pass their intended policy;
- pointer-lock and raycast facades pass runtime and declaration tests.

### 12.6 Debugger and MCP tests

- normal dumps and `framesRan` contain renderer diagnostics;
- raw renderer/image/effect fields stay redacted;
- ordinary 3D layer reports scene/group/camera and attached meshes;
- a simulated missing group reports `hasThreeGroup=false`,
  `rendererAttachedToExpectedLayer=false`, and a rejection count;
- configured/effective lighting values distinguish runtime fallback;
- camera position/rotation/forward values are finite;
- traversal limits produce `truncated=true`;
- inspect and run-frames bridge the diagnostics without requiring raw dumps;
- input aliases all inject code 50 and return identical canonical receipts;
- `Numpad2` injects code 98/location 3;
- raw code 50 returns known canonical metadata;
- legacy input response fields remain.

### 12.7 Validation status tests

Cover success and every early return:

- fully valid but unrun project: `valid=true`, `runtimeVerified=false`,
  `completionReady=false`;
- structural failure;
- event-generation failure;
- extension generated-code failure;
- JavaScript authoring failure with structural success;
- semantic failure with earlier phases successful;
- parse/entry-file failure with later fields `null/not-checked`;
- legacy `valid` assertions remain unchanged.

### 12.8 `verify_project_change` tests

- successful stage order and complete receipts;
- validation failure prevents reload/preview mutation;
- reload, close, launch, frames, inspect, assertion, and screenshot failures
  each stop at the correct stage;
- pressed keys/buttons are released after partial failures;
- scene mismatch and preview-not-ready failures are explicit;
- every assertion kind and operator;
- invalid field/operator/assertion is rejected by schema;
- no assertion string execution path exists;
- screenshot is optional;
- catalog exposure, permission handling, examples, and tool descriptions.

### 12.9 End-to-end voxel regression

Use a repository fixture or a temporary copy of the reported project so tests
do not rewrite the user's working project.

The final manual/automated verification must establish:

1. a normal 3D layer has a Three scene/group/camera and visible meshes;
2. 143 initial blocks exist;
3. Player X/Y/Z stay finite after settling;
4. forward input moves the Player;
5. jump increases Player Z;
6. left-click reduces the block count from 143 to 142;
7. right-click restores it to 143;
8. digit aliases select the expected block types;
9. runtime errors and failed texture counts are zero;
10. screenshot/canvas output changes appropriately with camera or world state.

## 13. Acceptance matrix

| Report acceptance requirement                     | Evidence                                                              |
| ------------------------------------------------- | --------------------------------------------------------------------- |
| Multi-file defaults match editor-created projects | Core overlay and multi-file equivalence tests                         |
| Catalog describes key semantics                   | Layer constraint, resource capability, and keyboard catalog snapshots |
| 3D/Lighting conflict is detected                  | TOML and legacy semantic tests                                        |
| Cube3D texture capability is validated            | SVG/unsupported-source browser tests                                  |
| Invalid key names are detected                    | Literal event scanner tests                                           |
| Missing Physics3D defaults cannot produce `NaN`   | Runtime normalization and finite-coordinate tests                     |
| 3D renderer attachment cannot fail silently       | Runtime fallback, one-time warning, rejection counter                 |
| MCP inspect has safe 3D renderer state            | Debugger/MCP diagnostics tests                                        |
| MCP accepts understandable digit names            | Alias and canonical receipt tests                                     |
| Official extension compatibility is synchronized  | Pinned reviewed fixture/preflight/public facade tests                 |
| Validation phases are explicit                    | Full response-shape tests                                             |
| One workflow verifies gameplay effects            | `verify_project_change` plus voxel regression                         |

## 14. Rollout and implementation order

Implementation should be delivered in reviewable, test-backed groups:

1. **Silent-failure prevention**
   - layer semantic rule and runtime fallback;
   - default-preserving ordinary behavior deserialization;
   - Physics3D guards;
   - SVG Three-source support;
   - canonical keyboard definitions and literal validation.
2. **Validation and catalog contracts**
   - shared diagnostics;
   - phase-specific response fields;
   - catalog descriptions, constraints, capabilities, and accepted key values.
3. **Observability**
   - renderer/image diagnostics;
   - shared debugger dump builder;
   - MCP inspect/run-frames transport.
4. **Extension compatibility**
   - policy/provenance model;
   - mutation-free preflight;
   - pointer-lock and raycast facades;
   - pinned reviewed fixtures.
5. **Combined verification**
   - `verify_project_change`;
   - typed assertions;
   - full receipt and failure-stage tests.
6. **System verification**
   - focused unit/integration suites;
   - formatting/type checks;
   - Windows app launch;
   - fresh paused preview and voxel gameplay regression.

Each group must keep compatibility tests green before the next group begins.
The final implementation must not be declared complete from static validation
alone.

## 15. Alternatives considered

### Rename `lighting` to `is_lighting_layer`

Rejected for this change because it creates a format migration and does not
protect legacy JSON or runtime inputs. Clear catalog semantics and a
cross-field invariant solve the ambiguity without changing serialized keys.

### Initialize a Three group lazily when the first 3D object arrives

Rejected because a group alone is insufficient; the layer also needs a Three
scene, camera, composer, and render-texture integration. The runtime fallback
normalizes the invalid mode before renderer setup.

### Make all behavior deserialization merge defaults

Rejected because overriding behaviors intentionally rely on sparse
replacement/inheritance. A named ordinary-content overlay path is required.

### Reject all SVG resources for Three objects

Rejected because Pixi already provides a raster source accepted by Three.
Supporting that central source is less surprising and keeps 2D/3D resource
semantics aligned.

### Add digit aliases directly to the existing reverse map

Rejected because duplicate key codes can overwrite canonical reverse names.
Descriptors separate aliases from the canonical code-to-name result.

### Serialize the renderer or remove debugger redaction

Rejected because Three/Pixi graphs are cyclic, large, implementation-specific,
and can expose DOM or GPU-backed state. A bounded scalar summary provides the
needed evidence safely.

### Whitelist DOM/Three/private APIs for every strict project

Rejected because it defeats the public authoring boundary. Reviewed legacy
code uses a provenance- and hash-bound compatibility profile while narrow
public facades remove the long-term dependency.

### Remove or redefine `valid`

Rejected because existing clients depend on it. Additive phase fields and
`validMeaning` provide clarity without a breaking response change.

### Accept assertion strings in `verify_project_change`

Rejected because string evaluation is unsafe, non-portable, and difficult to
validate. A closed assertion schema covers the reported regression needs.

## 16. Open questions and follow-up coordination

There are no blocking design questions for local implementation. The
following coordination items do not change the local acceptance criteria:

1. The GDevelop-extensions repository should migrate reviewed
   MousePointerLock and Raycaster3D to the new public facades after they land.
2. Extension API hashes should use SHA-256 over a documented canonical form of
   the public declaration bundle so CI and the store compute identical values.
3. The reviewed compatibility profile should have a removal target after
   migrated extension versions have been available for an agreed support
   window.
4. Broader semantic rules such as camera near/far/FOV checks can be added to
   the same aggregation layer later; they are not required to close the nine
   reported defects.

## 17. Definition of done

This work is complete only when:

1. all required diagnostics, guards, APIs, response fields, and the combined
   tool described above are implemented;
2. focused Core, GDJS, extension, editor, MCP, and browser tests pass;
3. existing compatibility tests continue to pass;
4. renderer dumps remain redacted and bounded;
5. strict project-authored JavaScript remains restricted;
6. the Windows app launches successfully using the repository workflow;
7. the representative voxel project passes the runtime regression in section
   12.9 with no runtime errors;
8. the final report distinguishes static validation from runtime evidence.
