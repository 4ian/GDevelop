---
name: gdevelop-project-files
description: Create, inspect, modify, refactor, and verify GDevelop games through the version 5 multi-file project sources (`project.gdevelop`, `constants.toml`, `.settings`, and `.events`). Use for any GDevelop project, scene, object, behavior, prefab, extension, third-party extension installation, reusable-component refactor, variable, resource, MCP gameplay test script, Constants/placeholder, signal-system, SpringBoneDynamics hair/chest secondary bone animation, layout, event-sheet, or JavaScript-event work. Read the generated authoring catalogs and public JavaScript declarations when relevant; use the bundled Python test template for supported jobs; regenerate catalogs after large structural changes, then validate direct edits before reload and preview debugging.
---

# GDevelop Project Files

## Source of truth

Treat project files as authoritative. Modify them directly; do not use MCP to
author the game. The sole authoring-related exception is `import_extension`:
use it once to import and convert an official legacy extension into canonical
multi-file sources, then continue by editing those generated files directly.
There are no dedicated Constants MCP tools. Read and modify `constants.toml`
directly.

Read, in order:

1. `project.gdevelop` for project metadata and non-constants project data.
2. `resources.settings` for the complete project resource registry.
3. `constants.toml` for the complete editor-only Constants object.
4. `.gdevelop/settings-catalog.json`, then relevant child `.settings` files
   for semantic configuration, object definitions, and embedded `[layout]`
   subtrees, including instances, layers, spatial bounds, background, and
   editor-canvas state.
5. Relevant `.events` files for IfDo event logic.
6. `.gdevelop/instructions-catalog.json` before adding or changing
   instructions.
7. `.gdevelop/runtime-api.d.ts` and `.gdevelop/project-api.d.ts` before adding
   or changing any JavaScript event.

The three catalogs and two JavaScript declarations are regenerated from the
loaded project every time GDevelop saves. Never edit them. Search them narrowly
with `rg`: use file kind, object,
behavior, effect, owner, or layout context in the source catalogs, and use
instruction type, displayed name, group, description, parameter `dslName`, or
expression name in the instruction catalog. Generated JSON keeps one catalog
entry per line so a matching search returns only relevant metadata.

After a large structural source change, call the no-input GDevelop MCP
`generate-catalogs` tool and wait for `catalogsRegenerated: true` before making
edits that depend on the changed structure. Large structural changes include
installing or importing an extension and creating, deleting, renaming, or
substantially changing a prefab, behavior, function, extension, object type, or
other catalog-owned component. Re-read the relevant freshly generated
settings, layout, and instruction catalogs before continuing; if JavaScript is
in scope, also re-read the two declarations. Do not rely on generated content
read before the structural change. A later structural change invalidates that
view and requires another `generate-catalogs` call.
This refresh is not validation and does not replace the final
`validate_project_files` gate.

Use the catalogs as authoring contracts:

- In `settings-catalog.json`, read `fileKinds` for the target document's path,
  mounted namespace, local TOML root, required/common/forbidden fields, and ownership boundary.
  Treat the matching `schema.rootFields` and recursively nested
  `schema.childTables` as the complete structural contract, including exact
  TOML headers, child-record fields, dynamic-key rules, and empty forms;
  `commonFields` is only a search summary. Search
  `objectTypes`, `behaviorTypes`, and `effectTypes` for exact registered type
  names, defaults, requirements, and property metadata. Use `settingsOwners`
  to resolve existing project components and their object definitions. For an
  attached behavior, initialize or edit only properties listed in its
  `behaviorTypes` entry. Editor-hidden, deprecated, extension-owned, and legacy
  serializer properties are deliberately absent from the authoring surface;
  never invent them, but preserve every unlisted field already present in an
  object settings file or legacy JSON source.
- In `settings-catalog.json`, read `layoutTables` for exact context-specific
  headers, fields, value types, defaults, and constraints. Select the one
  `layoutContexts` entry whose `owner` matches the scene, prefab, variant, or
  external layout, then use only its listed layers, objects, and attached
  behaviors. Search `effectTypes` for exact effect parameters and types.
- If the relevant registered type, file kind, layout table, or effect is absent,
  stop instead of guessing. If a direct edit introduces a new object or
  attached behavior name, validate its registered type in the settings catalog,
  define it first in the owning `.settings` file, and then reference that exact
  new name in the same coherent owner-settings `[layout]` patch; the saved layout context will
  list it after GDevelop regenerates the catalogs.

Treat additive semantic and capability metadata as enforceable contracts:

- `lighting = true` means a dedicated 2D Lighting Layer. It is invalid with
  `rendering = "3d"` or `"2d+3d"`; use `lighting = false` plus catalog-listed
  Scene3D light effects.
- Resource `kind = "image"` has `image-2d` and `three-texture` capabilities.
  SVG image resources are valid Three textures after Pixi rasterization.
  Preserve and report any `THREE_TEXTURE_UNSUPPORTED_SOURCE` diagnostic instead
  of assuming every loaded resource is texture-compatible.
- For new or changed Physics3D data, author every writable catalog property and
  require finite gravity values and `worldScale > 0`. Runtime/default hydration
  protects partial legacy data but is not a reason to omit cataloged fields in
  new source.
- Keyboard parameters use the catalog's canonical names. Main-row digits are
  `Num0` through `Num9`; aliases such as `"1"` and `Digit1` normalize to
  `Num1`, while `Numpad1` remains distinct. Unknown static literals fail with
  `INPUT_UNKNOWN_KEY_NAME`.

Search narrowly, for example:

```sh
rg '"type":"Sprite"' .gdevelop/settings-catalog.json
rg '"type":"Tween::TweenBehavior"' .gdevelop/settings-catalog.json
rg '"table":"instances"' .gdevelop/settings-catalog.json
rg '"owner":{"scene":"Main"}' .gdevelop/settings-catalog.json
```

Do not edit legacy project JSON, including `.gdevelop/game.json`. It is
generated compatibility/runtime output, not multi-file source.

## File contract

- `.settings`: TOML semantic/configuration data, including object definitions
  and their complete behavior/variable/effect configuration. Keep every file
  independent, local-root, and unindented. The physical path supplies the
  mounted namespace, so never repeat owner names in long TOML table headers.
  Never embed another settings document. Follow the matching settings-catalog
  `fileKinds` entry and use only registered type metadata from that catalog.
- Variable definitions: in `variables`, `globalVariables`, and
  `sceneVariables`, write one repeated `[[variables]]`,
  `[[globalVariables]]`, or `[[sceneVariables]]` record per variable. Every
  record contains an explicit `name` plus its complete descriptor, for example
  `name = "Controllers"`, `type = "array"`, and `children = [...]`. Represent
  an empty container only as `variables = [ ]`, `globalVariables = [ ]`, or
  `sceneVariables = [ ]`. Never write keyed `[variables]` tables, whole
  containers as inline tables, non-empty inline descriptor arrays, or recursive
  `[[variables.children]]` tables.
- Object groups: use only an `[objectGroups]` table in the owning project,
  scene, prefab, prefab-variant, or function settings. Each key is the group
  name and each value is an array of object names, for example
  `Buttons = ["PauseButton", "Retry"]`. Use `objectGroups = { }` when there
  are no groups. Preserve a group's `requiredBehaviors` with an optional
  `[objectGroupRequiredBehaviors]` companion table whose matching group key
  contains the behavior-type string array. Never write `objectsGroups`,
  `objectGroups = []`, `[[objectsGroups]]`, or nested group/member descriptor
  tables.
- Sprite points: keep `originPoint` and `centerPoint` as inline TOML tables;
  keep named `points` and `customCollisionMask` vertices as inline arrays of
  point tables. Never expand point data into long dotted TOML headers. For
  example: `originPoint = { name = "Origin", x = 0, y = 0 }`.
- `constants.toml`: the entire root document is editor-only Constants.
  Author data directly, with no `[settings]`, `[constants]`, format-version,
  or raw-JSON metadata wrapper. Use only values TOML can represent losslessly.
- Embedded layout: layout-bearing owner `.settings` files contain `[layout]`,
  optional `[layout.editor]`, and short `[[layout.layers]]`,
  `[[layout.effects]]`, `[[layout.instances]]`, `[[layout.variables]]`, and
  `[[layout.behaviors]]` records. Never put object definitions or attached
  behavior definitions in the embedded layout subtree. Instance
  behavior overrides are allowed only for behaviors already attached by the
  owning `.settings` object definition. Follow the matching settings-catalog
  `layoutContexts` entry and `layoutTables` definitions.
- `.events`: IfDo DSL only. Do not embed TOML or raw event JSON.
- References: use canonical `game://...` URIs rooted at `project.gdevelop`.
- `.gdevelop/`: generated/editor state. Read catalogs; do not author sources
  there. Use `instructions-catalog.json` as the only source for constructing
  new event instructions. `deprecated-instructions-catalog.json` exists only
  so you can understand legacy projects and make targeted edits to deprecated
  instructions already present in their `.events` files. Never select an
  instruction from the deprecated catalog when constructing new events, and
  never introduce a new use of a deprecated instruction. Preserve or minimally
  edit an existing deprecated instruction only when the user's legacy project
  requires it; use a current replacement from `instructions-catalog.json`
  whenever the edit can migrate it safely. Imported projects may contain
  inferred signatures for removed instructions in this deprecated catalog;
  treat them with the same legacy-only restriction.
  `runtime-api.d.ts` and `project-api.d.ts` are the only approved JavaScript
  authoring surface. Read them before changing `@js`; never hand-edit either
  declaration or recover private APIs from runtime source/generated code.

Preserve component order, stable names, existing unknown fields, and ownership
boundaries. Make the smallest coherent patch. When adding a component, create
its physical component directory and every referenced source file in the same
change. Never write optional grouping directories or `eventsFunctionsFolderStructure`,
`objectsFolderStructure`, `propertiesFolderStructure`, or
`sharedPropertiesFolderStructure`. Object and owner-function settings store
editor grouping as `folder = ["Parent", "Child"]`; use `folder = []` for the
root. There is no property tree: prefab
`propertyDescriptors` and behavior
`propertyDescriptors`/`sharedPropertyDescriptors` are flat arrays in source
order.

Give every global, scene, default-prefab, and variant-prefab object its own
`<Object>.settings` file directly under the owner's flat `objects/` directory. Put
the complete object definition there, including behaviors, variables, effects,
and type-specific configuration. `project.gdevelop`, `scene.settings`, and
`prefab.settings` must not embed object definitions. Keep object groups and
other owner-wide configuration in the owner settings. Put only instances,
layers, background/bounds, and editor layout state in the owner's reserved
`[layout]` subtree.
For type-specific object configuration, resolve the registered entry in
`settings-catalog.json` by `objectTypes[].type`: use its `properties` for
public generic-editor fields and its recursive `schema` for exact serialized
root fields, child tables, repeated tables, and empty forms. Preserve existing
unlisted legacy or private serializer fields.
For each attached behavior, keep its identity fields and complete existing
serializer data in `<Object>.settings`. Initialize or edit only the
author-writable properties present in `settings-catalog.json`; preserve
unlisted fields verbatim because specialized editors may own runtime-required
configuration that the generic catalog intentionally hides.

Give every scene, External Events resource, prefab, and behavior function one
flat same-stem `functions/<Function>.settings` and
`functions/<Function>.events` pair. Function settings never contain an events
URI. Scene and External Events owners have exactly four fixed
functions: `sceneLoad`, `sceneSignal`, `sceneUpdate`, and `sceneUnload`.
`sceneUpdate` is required; empty optional lifecycle functions may be absent from
disk. Store editable prefab/behavior grouping in the function settings `folder`
array. Lifecycle function names, order, roles, types, and parameters are fixed
and must not be edited.

## Project layout

```text
project.gdevelop
resources.settings
constants.toml
objects/<Object>.settings
scenes/<Scene>/scene.settings
scenes/<Scene>/objects/<Object>.settings
scenes/<Scene>/functions/sceneUpdate.settings
scenes/<Scene>/functions/sceneUpdate.events
scenes/<Scene>/functions/<OptionalLifecycle>.settings # only when non-empty
scenes/<Scene>/functions/<OptionalLifecycle>.events
scenes/<Scene>/external-events/<External>/external-events.settings
scenes/<Scene>/external-events/<External>/functions/sceneUpdate.settings
scenes/<Scene>/external-events/<External>/functions/sceneUpdate.events
scenes/<Scene>/external-events/<External>/functions/<OptionalLifecycle>.settings
scenes/<Scene>/external-events/<External>/functions/<OptionalLifecycle>.events
scenes/<Scene>/external-layout/<External>.settings
extensions/<Extension>/extension.settings
extensions/<Extension>/functions/<Function>.settings
extensions/<Extension>/functions/<Function>.events
extensions/<Extension>/prefabs/<Prefab>/prefab.settings
extensions/<Extension>/prefabs/<Prefab>/functions/<Function>.settings
extensions/<Extension>/prefabs/<Prefab>/functions/<Function>.events
extensions/<Extension>/prefabs/<Prefab>/objects/<Object>.settings
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/variant.settings
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/objects/<Object>.settings
extensions/<Extension>/behaviors/<Behavior>/behavior.settings
extensions/<Extension>/behaviors/<Behavior>/functions/<Function>.settings
extensions/<Extension>/behaviors/<Behavior>/functions/<Function>.events
.gdevelop/instructions-catalog.json
.gdevelop/deprecated-instructions-catalog.json # legacy read/edit only; never for new events
.gdevelop/settings-catalog.json
.gdevelop/runtime-api.d.ts
.gdevelop/project-api.d.ts
```

Do not create optional grouping folders. Canonical component directories are
fixed; object/function grouping belongs in each settings file's `folder`
array. Settings files never reference other settings files.

In format version 5, declare each External Events resource with
`scenes/<Scene>/external-events/<External>/external-events.settings`; its
physical scene owner supplies `associatedLayout`, and its lifecycle logic lives
in that owner's flat same-stem `functions/` pairs. Every managed `.events`
body has a matching function `.settings` file. Declare an external layout
independently with `scenes/<Scene>/external-layout/<External>.settings`; it owns
its identity, project-wide contiguous `order`, and embedded `[layout]` subtree.
Do not write `externalEventFiles`, `externalLayoutFiles`, layout URIs,
`associatedLayout`, `linkedScene`, or `unresolvedScene`, and never create a
root `externals/external.settings`.

## Task references

Load only the references required by the task:

- Read [references/create-extensions.md](references/create-extensions.md) in
  full before creating an extension or adding/removing extension-level
  functions, prefabs, behaviors, or their functions.
- Read [references/layout-toml.md](references/layout-toml.md) in full before
  creating or changing any embedded `[layout]` subtree. Preserve existing UUIDs and use its
  exact scene, prefab/variant, or external-layout context rules.
- Read [references/events-dsl.md](references/events-dsl.md) in full before
  creating or changing any `.events` file. Use only its canonical IfDo
  structures and the exact types and `dslName` parameters found in the
  generated project instruction catalog.
- Also read [references/javascript-api.md](references/javascript-api.md) in
  full before creating or changing any `@js` event. Use only the generated
  public declarations, author new blocks with `strict=true`, and preserve
  compatibility mode only for existing legacy JavaScript.
- Read [references/constants.md](references/constants.md) in full
  whenever the user asks to create, edit, reorganize, or consume Constants,
  or to add/change a `{{...}}` placeholder. Also read the events guide for an
  event consumer and the extension guide when injecting config into a prefab,
  behavior, or reusable extension.
- Read [references/signal-system.md](references/signal-system.md) in full
  whenever the user asks for signals, messaging, notification, scene/prefab
  communication, `SignalReceived`, signal payload handling, or an
  `onSignal` lifecycle. Also read the events guide, and read the extension guide
  before adding or changing a prefab/custom-object `onSignal` function. Read
  the Constants guide too when signal names use placeholders.
- Read
  [references/springbone-behavior.md](references/springbone-behavior.md) in
  full whenever the user asks to create or tune simulated hair, ponytail,
  chest/breast, tail, strap, or other secondary 3D bone animation with
  `SpringBoneDynamics`. Also read the events guide before adding runtime
  controls, and use collision-shape preview verification when colliders change.
- Read
  [references/reuse-community-extensions.md](references/reuse-community-extensions.md)
  in full before implementing a substantial reusable system or installing a
  third-party extension. Search the official GDevelop extensions repository
  first and prefer adapting a reviewed existing extension over rebuilding a
  heavy feature from scratch.
- Read
  [references/refactor-with-reusable-components.md](references/refactor-with-reusable-components.md)
  in full whenever the user asks to refactor, extract, deduplicate, modularize,
  or reorganize project logic with prefabs, behaviors, or functions. Also load
  the creation guide and, for any substantial subsystem, the reuse guide.
  Complete the migration and verification; do not stop after suggesting an
  architecture or creating empty component shells.

Build from scratch only when repository search finds no suitable extension,
the available extension is incompatible or unsafe, or a small project-specific
implementation is materially simpler. Record that decision in the task result.

## Reusable MCP test scripts

When the user asks to write a Python or MCP gameplay test script, start from
[the bundled test template](../../tests/gdevelop_mcp_test_template.py). Copy it
to a descriptively named file under the project's `tests/` directory, then
customize `build_scenario` and, only when needed, the arrange, act, or assertion
hooks. Do not rewrite its MCP transport or preview lifecycle from scratch
unless the template is incompatible with the requested scenario; report the
specific incompatibility when deviating.

Preserve the template's local MCP transport, stale-preview cleanup, fresh
paused launch, deterministic frame stepping, bounded object inspection,
runtime/renderer checks, JSON result, nonzero failure exits, optional
screenshot, and guaranteed preview cleanup. MCP authentication is not required.
Run `py_compile`, the template-derived script's `--self-test`, and the actual
scenario against a fresh preview. A gameplay test script does not replace the
validation, Git-commit, and reload gates when project sources changed.

## Event authoring

Use the generated catalog for every instruction. Find the entry under
`conditions` or `actions`, use its exact `type`, and supply parameters by their
exact `dslName`. Write each value according to the parameter's `valueKind`.
The DSL has no hardcoded instruction aliases:

```events
if Extension::Condition target="Player" threshold=expr(Variable(Limit))
do Extension::Action target="Player" text="Ready"
if SceneJustBegins
```

Rules:

- Write catalog instruction types directly; never prefix them with `@`.
- Do not replace catalog types with prose aliases such as `scene begins`.
- Use only catalog entries valid for the target event scope.
- Supply every required parameter exactly once when authoring a new
  instruction. Preserve an omitted named parameter in an existing migrated
  instruction when its stored legacy slot is blank; do not invent a placeholder
  value.
- Omit every code-only parameter.
- Write `text`, object, behavior, variable, resource, and name values as direct
  strings; write numbers and booleans as unquoted literals.
- Use `expr(...)` only for calculated `text` or `number` values.
- If a persisted type is absent, first regenerate the catalog by saving with
  the editor. Do not reuse it for new events if it stays absent; the catalog
  intentionally excludes editor-hidden and deprecated APIs.
- Guard every action with at least one effective condition in its event or an
  ancestor event. Never place an action on an unconditional path that executes
  every frame. Use an explicit trigger, state/input check, timer, comparison,
  or other condition that expresses when the action is allowed to run.
- Treat an object-targeting action as applying to every currently picked
  instance of that object. When conditions leave multiple instances picked, or
  do not narrow the object selection, the action executes on all of them. This
  is normal and often intentional GDevelop behavior, so do not reject or
  rewrite an event merely because an object action may affect multiple
  instances. Narrow the selection only when the gameplay requires a specific
  target; use `for each Object` when later conditions or actions need one
  isolated instance at a time.
- Keep OR alternatives as consecutive `if`/`or` lines.
- Prefix every child-event line with `>` and every nested instruction with
  `?`.
- Keep JavaScript events opt-in; use native instructions first. New or changed
  AI-authored JavaScript must use `strict=true`, must use only context globals
  and members declared in `.gdevelop/runtime-api.d.ts` and
  `.gdevelop/project-api.d.ts`, and must obey the JavaScript reference. Never
  use underscore/private members, generated `.func` symbols, browser/Node
  globals, filesystem, shell, DOM, storage, or direct networking APIs.

Common structure:

```events
@event aiGeneratedEventId="descriptive-id"
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="started"

> @event aiGeneratedEventId="child-id"
> if CollisionNP first_object="Player" second_object="Enemy"
> do Delete object="Enemy"

@group "Combat" source="" creationTime=0 color=[74,176,228] parameters=[]
@event aiGeneratedEventId="damage-enemy"
if CollisionNP first_object="Bullet" second_object="Enemy"
do SetNumberObjectVariable object="Enemy" variable="HP" modification_sign="-" value=1
do Delete object="Bullet"
@end group
```

Use `local`, `else`, `repeat`, `while`, `for each`, `for each child`, `link`,
`@group ... @end group`, and `@js ... @end js` only according to the canonical
grammar. Write comments as one `@comment "content" background=[r,g,b] text=[r,g,b]` statement; never use hash-comment event syntax. Every `@end`
requires its `group` or `js` suffix. Preserve `@event`, `@instruction`, group,
loop, comment, and JavaScript metadata when editing existing sources.

## Direct-edit workflow

1. Inspect manifests and only the owned files relevant to the request. Search
   `.gdevelop/settings-catalog.json` before adding or changing settings-owned
   object, behavior, effect, component, or embedded layout definitions. Search
   its `layoutTables` and `layoutContexts` for the exact layout schema and
   matching project context before adding or changing layout content.
2. Search `.gdevelop/instructions-catalog.json` for required instructions and
   expressions. The generated catalog excludes editor-hidden and deprecated
   APIs; never invent or reuse an instruction identifier that is absent from it
   when authoring new events.
   If JavaScript is required, read both generated `.d.ts` files and the
   JavaScript reference before editing the block; do not infer an API from raw
   engine source or preview code.
3. Patch source files directly. Use `apply_patch` for precise edits.
   Creating or changing an object type or one of its behaviors is a settings
   edit; creating or moving an instance is a layout edit.
4. After any large structural change (including extension installation or
   creating/changing a prefab, behavior, function, extension, or object type),
   call the no-input MCP `generate-catalogs` tool. Require
   `catalogsRegenerated: true`, then re-read every refreshed catalog relevant
   to subsequent edits. Do not continue from catalog metadata read before the
   structural change. Repeat this step after each later structural phase.
5. Re-read every changed manifest reference and verify that each `game://` URI
   exists and stays inside the project.
6. Check settings and layout TOML syntax/semantics, duplicate
   namespaces, event depth, instruction names, named parameters, and asset
   paths.
7. Call the no-input GDevelop MCP `validate_project_files` tool after the most
   recent source edit. Require `valid: true`, `structurallyValid: true`,
   `eventCodeGenerationValid: true`, `semanticLintPassed: true`,
   `extensionGeneratedCodeValid !== false`, and
   `javascriptAuthoringValid !== false`; use its file URI, error code, line,
   column, and source excerpt to fix every reported settings, layout, events,
   reference, generated-code, JavaScript-authoring, or semantic failure. This
   call first regenerates all three `.gdevelop` catalogs and both JavaScript
   declaration files, then validates the sources using those fresh contracts.
   Call it at least once before any reload; a failed validation does not satisfy
   this gate. `validMeaning = "pre-runtime-validation-passed"` still means
   `runtimeVerified: false` and `completionReady: false`. Never summarize
   `valid: true` as "the game works" or as task completion without preview
   evidence.
8. After the requested task is complete and validation succeeds, use Git from
   the project repository root to commit every task-owned change before
   `reload_project`. Inspect `git status` and the final diff, stage all changes
   made for the user's task without including unrelated pre-existing work, and
   create a commit with a concise, descriptive imperative message. Record the
   commit hash and message for the final report. If any source edit is needed
   afterward, validate again and create a follow-up commit before reloading.
9. For a manual verification sequence, call `reload_project` with
   `mode: "start"`, record its `operation_id`, and poll that exact ID with
   `mode: "status"` until it completes successfully. Use `mode: "wait"` with
   the same ID only when a blocking wait is useful. If interrupted before
   recording the ID, call status without an ID to discover the active/latest
   operation. Never start a duplicate while one is running, invoke an MCP save,
   or dismiss a catalog artifact/subphase failure as a generic timeout. Skip
   this manual reload only when step 10 will call `verify_project_change`,
   because that workflow performs its own validated reload.
10. For gameplay or visual changes, prefer `verify_project_change` after the
    Git commit. It performs validation → reload → optional stale-preview close
    → fresh paused launch → deterministic frames → bounded inspection → typed
    assertions → optional screenshot, stops at the first failed stage, and
    retains each stage receipt. Use only its closed assertion schema (object
    count, finite instance position, runtime-error count, and renderer
    group/visible-mesh/texture-failure/rejection checks). Require
    `runtimeVerified: true` and `completionReady: true`. For a manual sequence,
    call `launch_preview` only after step 9, start paused, and use `run_frames`
    with `objects`, `include`, and optional `instance_indexes`. Runtime
    verification is mandatory for rendering/input changes and extension
    actions that create, delete, pick, or mutate objects.
    Pass `display_collision_shapes: true` when collision geometry must be
    visually verified. An explicit true or false starts a fresh preview because
    the collision-shape display cannot be reconfigured on an attached preview.
    If any project source changes after the reload, call `reload_project` again
    before the next preview, preceded by a new successful
    `validate_project_files` call and Git commit for those edits.

For assets, write the asset file inside the project, add/update its resource
entry in `resources.settings`, then reference its project-relative path from UI
configuration. Do not create generated images when a code-native or existing
asset is appropriate.

## MCP boundary

MCP is extension-import/synchronization/read/debug-only. Use it only for:

The complete public protocol surface is the following 23-tool allowlist:

- Local project opening: `open_project`.
- Editor/project inspection:
  `gdevelop_get_editor_state`, `gdevelop_get_editor_selection`,
  `gdevelop_get_project_summary`, `gdevelop_list_scenes`,
  `gdevelop_list_objects`, and `gdevelop_inspect_signal_usage`.
- Catalog, validation, and tool discovery:
  `generate-catalogs`, `validate_project_files`, `inspect_tool_schema`,
  and `get_tool_usage_examples`.
- Synchronization and runtime verification:
  `reload_project`, `launch_preview`, `wait_until_preview_ready`,
  `preview_health_check`, `gdevelop_inspect_running_preview`, `run_frames`,
  `verify_project_change`, `simulate_preview_input`, `control_preview`,
  `set_runtime_state`, and `capture_preview_screenshot`.
- Public write operation: `import_extension`.

No other MCP tool name is supported, introspectable, or callable, even when
write/command permissions are enabled. In particular, there is no generic
editor-call, command, save, project patch/sync, scene/object/resource authoring,
or hidden resource-read escape hatch. The allowlist describes protocol
availability; this file-first skill still permits only the narrower workflows
below and authors project source directly.

Constants are outside this MCP surface. The AI model must author them by
reading and editing `constants.toml` directly.

- Importing and converting an official legacy extension with
  `import_extension`. This is the only MCP tool allowed to create project
  source. It must return the generated source paths; all later adaptation is a
  direct file edit.
- Opening a specific local project entry in the editor with `open_project`.
- Reloading direct disk edits into the editor with `reload_project`.
- Regenerating and synchronously waiting for the three generated source
  catalogs and two JavaScript declaration files with `generate-catalogs` after
  large structural source changes, so subsequent authoring can read current
  contracts.
- Regenerating all source catalogs and validating direct disk edits without
  changing editor memory by calling the no-input `validate_project_files` tool
  before `reload_project`.
- Current editor/project/selection queries.
- Launching or controlling a debug preview.
- Deterministic frame stepping and input simulation.
- Inspecting live runtime state, logs, errors, audio, and bounded targeted
  instance position, angle, force, variable, and behavior state.
- Capturing preview screenshots.
- Running the staged `verify_project_change` gate with typed assertions and
  bounded renderer diagnostics. Renderer receipts expose scalar scene,
  layer/group/camera/mesh/visibility/texture-failure/rejection information;
  they never serialize raw Three.js, Pixi, renderer, canvas, or DOM objects.

Except for the single `import_extension` conversion transaction, never use MCP
to create scenes, objects, resources, variables, instances, extensions,
behaviors, prefabs, or events. Never use generic editor-call, command, patch,
sync, or save tools for authoring.

`generate-catalogs` is a mandatory mid-task refresh after every large
structural source change. Require `catalogsRegenerated: true`, then read the
latest relevant `.gdevelop/settings-catalog.json` and
`.gdevelop/instructions-catalog.json` and,
for JavaScript work, both generated `.d.ts` files before making dependent edits.
The tool writes and verifies those five generated authoring files and does not
validate sources or reload editor memory.

`validate_project_files` is a mandatory reload gate. In every direct-edit task,
call it successfully with no inputs at least once after the most recent
source-file edit and before `reload_project`. It regenerates the instruction
catalogs, the settings catalog (including embedded layout authoring data), and
both JavaScript declarations first, then
reconstructs the generated `game.json` representation from the multi-file
settings, layouts, and events and type-checks JavaScript blocks against the
fresh public API without replacing editor memory. A later source edit
invalidates the earlier validation receipt. Require its structural,
event-code-generation, extension-generated-code, JavaScript-authoring, and
semantic statuses, not only the compatibility `valid` boolean. Its successful
result deliberately keeps `runtimeVerified: false` and
`completionReady: false`; behavior-sensitive changes still require a paused
preview and deterministic runtime inspection. Never report the game as working
or the task as complete from this receipt alone.

The Git commit is also a mandatory reload gate. After the final successful
validation, inspect the repository diff, stage every change made for the user's
task, and commit it with a proper concise, descriptive message. Do not include
unrelated pre-existing changes. `reload_project` must run only after this commit
succeeds. A later source edit requires a new validation and follow-up commit
before another reload.

`reload_project` remains a mandatory preview gate, either as an explicit call
or as the reload stage inside `verify_project_change`. After both the validation
and Git-commit gates, a manual workflow starts it with `mode: "start"`, records
the immediate `operation_id`, and polls that exact operation with
`mode: "status"` until its receipt completes successfully. A status call
without an ID discovers the active/latest retained operation after caller
interruption. Never launch or relaunch a preview from stale editor memory. A
later source edit invalidates the validation, commit, and reload receipts.
Never start another reload while the current operation is running.
The reload writes generated catalogs itself and acknowledges their modification
times; do not respond to a "Project files changed on disk" dialog by starting a
second reload while the recorded operation is still running.

## Verification

Before finishing:

- Confirm every changed `.settings` file is unindented, independently parseable
  TOML; confirm every embedded `[layout]` subtree is canonical layout TOML
  version 1 and uses only `layout.*` child headers.
- Confirm embedded layout subtrees contain only placement/layout concepts and
  contain no `objects`, `objectGroups`, or behavior definitions.
- Confirm no `.settings` file contains a legacy `*FolderStructure` property;
  object/function grouping uses only a valid local `folder` array.
- Confirm every global, scene, and prefab object definition and its complete
  behaviors are at the local root of its individual `<Object>.settings` file.
- Confirm attached behaviors use catalog-listed properties for new edits and
  preserve every existing unlisted serialized field verbatim. Do not treat a
  field's absence from the catalog as permission to delete it.
- Confirm prefab and behavior property descriptor arrays are flat and contain
  no grouping/folder metadata.
- Confirm every prefab/behavior function has a flat same-stem
  `<Function>.settings` and matching `<Function>.events` pair, and
  owner settings contain no embedded function entries.
- Confirm settings references use `game://` and resolve to existing files.
- Confirm settings file kinds and every object/behavior/effect type against
  `settings-catalog.json`.
- Confirm layout tables, fields, layers, objects, attached behaviors,
  and effect parameters against the matching `layoutContexts` entry and
  `layoutTables` definitions in `settings-catalog.json`.
- Confirm no `3d` or `2d+3d` layer is marked `lighting = true`; inspect
  renderer diagnostics for a Three scene/group/camera, visible meshes, zero
  rejected objects, and zero failed textures when 3D rendering changed.
- Confirm image resources used by 3D materials have the cataloged
  `three-texture` capability. SVG image resources are supported through the
  cached Pixi raster source.
- Confirm Physics3D world scale is finite and positive and runtime instance
  coordinates remain finite.
- Confirm catalog instruction types, kinds, scopes, and `dslName` arguments.
- For every changed JavaScript event, confirm `strict=true`, validate all
  context globals/project literals/public members against both generated
  `.d.ts` files, and confirm no forbidden private or ambient API is used.
- For Constants changes, confirm `constants.toml` ownership, direct-root
  TOML data, placeholder paths/types, and regeneration-time behavior
  against the Constants reference.
- For signal changes, confirm target kind, receiver kind, fixed `onSignal`
  signature, guarded emission, next-dispatch timing, and preview signal-monitor
  evidence against the signal-system reference.
- Confirm every action has an effective condition in its event or ancestor
  chain and no unconditional action can execute every frame.
- Confirm object-targeting actions use the intended current picking set. Accept
  actions that apply to multiple picked instances as normal GDevelop behavior;
  narrow the selection or use `for each` only when the logic requires one
  instance at a time.
- Confirm no legacy JSON was changed.
- Confirm `generate-catalogs` returned `catalogsRegenerated: true` after the
  final large structural change and that subsequent dependent edits used the
  refreshed relevant catalogs.
- Confirm `validate_project_files` returned `valid: true` with all checked
  pre-runtime phase fields successful after the final source edit and before
  reload. Confirm that receipt still says `runtimeVerified: false` and
  `completionReady: false`.
- Confirm every task-owned change was committed after final validation and
  before `reload_project`; record the commit hash and descriptive commit
  message, and confirm no unrelated pre-existing change entered the commit.
- Confirm explicit `reload_project` or the reload stage of
  `verify_project_change` succeeded after the final source edit and before any
  preview frames.
- Debug runtime behavior with a fresh preview when behavior, rendering, input,
  audio, timing, or object picking changed.
- Prefer one successful `verify_project_change` receipt for final runtime
  acceptance; require every typed assertion to pass and both
  `runtimeVerified: true` and `completionReady: true`.
- Report changed source files, concrete verification evidence, and the final
  Git commit hash and message.
