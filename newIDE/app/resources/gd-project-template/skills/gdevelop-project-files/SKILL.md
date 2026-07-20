---
name: gdevelop-project-files
description: Create, inspect, modify, refactor, and verify GDevelop games through the multi-file project sources (`project.settings`, `static-data.toml`, `.settings`, `.layout`, and `.events`). Use for any GDevelop project, scene, object, behavior, prefab, extension, third-party extension installation, reusable-component refactor, variable, resource, Blender-to-GDevelop import, `.gltf`-to-`.glb` conversion, same-rig GLB animation merge, Static Data/placeholder, signal-system, layout, event-sheet, or JavaScript-event work. Read the generated authoring catalogs and public JavaScript declarations when relevant; use the bundled Blender scripts for supported conversion jobs; regenerate catalogs after large structural changes, then validate direct edits before reload and preview debugging.
---

# GDevelop Project Files

## Source of truth

Treat project files as authoritative. Modify them directly; do not use MCP to
author the game. The sole authoring-related exception is `import_extension`:
use it once to import and convert an official legacy extension into canonical
multi-file sources, then continue by editing those generated files directly.

Read, in order:

1. `project.settings` for project metadata and non-static-data project data.
2. `resources.settings` for the complete project resource registry.
3. `static-data.toml` for the complete editor-only Static Data object.
4. `.gdevelop/settings-catalog.json`, then relevant child `.settings` files
   for semantic configuration and object definitions, including each object's
   variables, effects, and behaviors.
5. `.gdevelop/layout-catalog.json`, then relevant `.layout` files for Layout
   TOML instances, layers, spatial bounds, background, and editor-canvas layout.
6. Relevant `.events` files for IfDo event logic.
7. `.gdevelop/instructions-catalog.json` before adding or changing
   instructions.
8. `.gdevelop/runtime-api.d.ts` and `.gdevelop/project-api.d.ts` before adding
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
  mounted namespace, local TOML root, required/common/forbidden fields, and ownership boundary. Search
  `objectTypes`, `behaviorTypes`, and `effectTypes` for exact registered type
  names, defaults, requirements, and property metadata. Use `settingsOwners`
  to resolve existing project components and their object definitions. For an
  attached behavior, write only properties listed in its `behaviorTypes`
  entry. Editor-hidden properties are deliberately absent, runtime-managed,
  and forbidden in object settings; never copy them from legacy JSON.
- In `layout-catalog.json`, read `tables` for exact context-specific headers,
  fields, value types, defaults, and constraints. Select the one
  `contexts` entry whose `owner` matches the scene, prefab, variant, or external
  layout, then use only its listed layers, objects, and attached behaviors.
  Search `effectTypes` for exact effect parameters and types.
- If the relevant registered type, file kind, layout table, or effect is absent,
  stop instead of guessing. If a direct edit introduces a new object or
  attached behavior name, validate its registered type in the settings catalog,
  define it first in the owning `.settings` file, and then reference that exact
  new name in the same coherent `.layout` patch; the saved layout context will
  list it after GDevelop regenerates the catalogs.

Search narrowly, for example:

```sh
rg '"type":"Sprite"' .gdevelop/settings-catalog.json
rg '"type":"Tween::TweenBehavior"' .gdevelop/settings-catalog.json
rg '"table":"instance"' .gdevelop/layout-catalog.json
rg '"owner":{"scene":"Main"}' .gdevelop/layout-catalog.json
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
  `sceneVariables`, always open a dedicated `[variables]`,
  `[globalVariables]`, or `[sceneVariables]` table and write one assignment per
  variable name. Assign each name one inline array containing its complete
  descriptor without another `name`, for example
  `Controllers = [{ type = "array", children = [...] }]`. Represent an empty
  container with its empty table header. Never write a whole container as
  `variables = { ... }` or `variables = { }`, and never write recursive
  `[[variables...]]` TOML tables. Existing inline-table containers are
  load-time migration inputs only: the editor converts them to these dedicated
  headers and saves the affected settings files immediately when opening the
  project. Do not preserve or introduce the migration form in direct edits.
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
- `static-data.toml`: the entire root document is editor-only Static Data.
  Author data directly, with no `[settings]`, `[staticData]`, format-version,
  or raw-JSON metadata wrapper. Use only values TOML can represent losslessly.
- `.layout`: standard flat TOML containing placement/layout data only:
  `[layout]`, optional `[editor]`, and short `[[layer]]`, `[[effect]]`,
  `[[instance]]`, `[[variable]]`, and `[[behavior]]` records. Never put object
  definitions or attached behavior definitions in a `.layout` file. Instance
  behavior overrides are allowed only for behaviors already attached by the
  owning `.settings` object definition. Follow the matching layout-catalog
  `contexts` entry and `tables` definitions.
- `.events`: IfDo DSL only. Do not embed TOML or raw event JSON.
- References: use canonical `game://...` URIs rooted at `project.settings`.
- `.gdevelop/`: generated/editor state. Read catalogs; do not author sources
  there. Use `instructions-catalog.json` as the only source for constructing
  new event instructions. `deprecated-instructions-catalog.json` exists only
  so you can understand legacy projects and make targeted edits to deprecated
  instructions already present in their `.events` files. Never select an
  instruction from the deprecated catalog when constructing new events, and
  never introduce a new use of a deprecated instruction. Preserve or minimally
  edit an existing deprecated instruction only when the user's legacy project
  requires it; use a current replacement from `instructions-catalog.json`
  whenever the edit can migrate it safely.
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
and type-specific configuration. `project.settings`, `scene.settings`, and
`prefab.settings` must not embed object definitions. Keep object groups and
other owner-wide configuration in the owner settings. Put only instances,
layers, background/bounds, and editor layout state in `.layout`.
For each attached behavior, keep its identity fields and only the author-writable
properties present in `settings-catalog.json`. Hidden behavior descriptor values
must not appear in `<Object>.settings`; generated runtime code supplies their
descriptor defaults and manages their state.

Give every prefab and behavior function its own `functions/<Function>/`
directory containing `function.settings` and `<Function>.events`. Store editor
grouping in the function settings `folder` array. `prefab.settings` and
`behavior.settings` must not embed function metadata.

## Project layout

```text
project.settings
resources.settings
static-data.toml
objects/<Object>.settings
scenes/<Scene>/<Scene>.layout
scenes/<Scene>/<Scene>.events
scenes/<Scene>/scene.settings
scenes/<Scene>/objects/<Object>.settings
externals/external.settings
externals/<External>.layout
externals/<External>.events
extensions/<Extension>/extension.settings
extensions/<Extension>/functions/<Function>/function.settings
extensions/<Extension>/functions/<Function>/<Function>.events
extensions/<Extension>/prefabs/<Prefab>/prefab.settings
extensions/<Extension>/prefabs/<Prefab>/<Prefab>.layout
extensions/<Extension>/prefabs/<Prefab>/functions/<Function>/function.settings
extensions/<Extension>/prefabs/<Prefab>/functions/<Function>/<Function>.events
extensions/<Extension>/prefabs/<Prefab>/objects/<Object>.settings
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>.layout
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/objects/<Object>.settings
extensions/<Extension>/behaviors/<Behavior>/behavior.settings
extensions/<Extension>/behaviors/<Behavior>/functions/<Function>/function.settings
extensions/<Extension>/behaviors/<Behavior>/functions/<Function>/<Function>.events
.gdevelop/instructions-catalog.json
.gdevelop/deprecated-instructions-catalog.json # legacy read/edit only; never for new events
.gdevelop/settings-catalog.json
.gdevelop/layout-catalog.json
.gdevelop/runtime-api.d.ts
.gdevelop/project-api.d.ts
```

Do not create optional grouping folders. Canonical component directories are
fixed; object/function grouping belongs in each settings file's `folder`
array. Settings files never reference other settings files.

## Task references

Load only the references required by the task:

- Read [references/create-extensions.md](references/create-extensions.md) in
  full before creating an extension or adding/removing extension-level
  functions, prefabs, behaviors, or their functions.
- Read [references/layout-toml.md](references/layout-toml.md) in full before
  creating or changing any `.layout` file. Preserve existing UUIDs and use its
  exact scene, prefab/variant, or external-layout context rules.
- Read [references/events-dls.md](references/events-dls.md) in full before
  creating or changing any `.events` file. Use only its canonical IfDo
  structures and the exact types and `dslName` parameters found in the
  generated project instruction catalog.
- Also read [references/javascript-api.md](references/javascript-api.md) in
  full before creating or changing any `@js` event. Use only the generated
  public declarations, author new blocks with `strict=true`, and preserve
  compatibility mode only for existing legacy JavaScript.
- Read [references/static-data.md](references/static-data.md) in full
  whenever the user asks to create, edit, reorganize, or consume Static Data,
  or to add/change a `{{...}}` placeholder. Also read the events guide for an
  event consumer and the extension guide when injecting config into a prefab,
  behavior, or reusable extension.
- Read [references/signal-system.md](references/signal-system.md) in full
  whenever the user asks for signals, messaging, notification, scene/prefab
  communication, `SignalReceived`, signal payload handling, or an
  `onSignal` lifecycle. Also read the events guide, and read the extension guide
  before adding or changing a prefab/custom-object `onSignal` function. Read
  the Static Data guide too when signal names use placeholders.
- Read
  [references/blender-to-gdevelop.md](references/blender-to-gdevelop.md) in full
  before converting or merging glTF/GLB assets or importing a `.glb` exported
  from Blender into GDevelop. Follow that workflow for Blender scene
  preparation, GLB export, GDevelop resource and object setup, collision,
  preview verification, and re-export updates.
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

## Bundled Blender conversion scripts

Use the bundled scripts directly for supported conversion jobs; do not rewrite
their logic in an ad hoc script. Run them with Blender using
`--background --factory-startup --python <script> -- <arguments>`, and call
the selected script with `--help` when its exact options are needed.

- For any `.gltf` to `.glb` request, run
  [scripts/convert_gltf_to_glb.py](scripts/convert_gltf_to_glb.py). Use
  `--input` with `--output` for one file, or `--output-dir` for a directory;
  add `--recursive` for nested inputs and `--overwrite` only when replacement
  is intended. Require its final summary to report zero failures.
- For any request to embed animations from a GLB into a character that uses
  the same skeleton, run
  [scripts/combine_same_rig_glb_animations.py](scripts/combine_same_rig_glb_animations.py).
  Supply `--character`, `--animations`, and `--output`; repeat `--action` to
  select clips. Keep strict compatibility checking unless the user explicitly
  accepts a weaker check. This script performs direct action reuse, not
  retargeting; stop and use a real retargeting workflow when rigs differ.

Generate a temporary output and inspect or round-trip it before replacing an
existing project asset. When the final GLB is a project resource, keep it
inside the project, preserve its registered path when updating it, validate
the project, commit, reload, and verify it in a fresh preview.

## Event authoring

Use the generated catalog for every instruction. Find the entry under
`conditions` or `actions`, use its exact `type`, and supply parameters by their
exact `dslName`. Values are JSON strings containing the exact serialized
GDevelop operand. The DSL has no hardcoded instruction aliases:

```events
if Extension::Condition target="Player" threshold="Variable(Limit)"
do Extension::Action target="Player" text="\"Ready\"" runtime=""
if SceneJustBegins
```

Rules:

- Write catalog instruction types directly; never prefix them with `@`.
- Do not replace catalog types with prose aliases such as `scene begins`.
- Use only catalog entries valid for the target event scope.
- Use every required parameter exactly once.
- Omit code-only parameters when their value is the standard empty string.
- Preserve quotes inside string-expression operands.
- Never write `@exact`. If a persisted type is absent, first regenerate the
  catalog by saving with the editor. Do not reuse it for new events if it stays
  absent; the catalog intentionally excludes editor-hidden and deprecated APIs.
- Guard every action with at least one effective condition in its event or an
  ancestor event. Never place an action on an unconditional path that executes
  every frame. Use an explicit trigger, state/input check, timer, comparison,
  or other condition that expresses when the action is allowed to run.
- Before every object-targeting action, ensure the current picking set contains
  at most one instance of that object. Use `for each Object` when multiple
  instances must be processed one at a time, or narrow the selection with
  conditions such as a unique ID/state match, nearest-object pick, collision,
  or another deterministic selector. Never rely on an object action implicitly
  applying to an unrestricted multi-instance selection.
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
do DebuggerTools::ConsoleLog message_to_log="\"started\""

> @event aiGeneratedEventId="child-id"
> if CollisionNP first_object="Player" second_object="Enemy"
> do Delete object="Enemy"

@group "Combat" source="" creationTime=0 color=[74,176,228] parameters=[]
@event aiGeneratedEventId="damage-enemy"
if CollisionNP first_object="Bullet" second_object="Enemy"
do SetNumberObjectVariable object="Enemy" variable="HP" modification_sign="-" value="1"
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
   object, behavior, effect, or component definitions. Search
   `.gdevelop/layout-catalog.json` for the exact layout schema and matching
   project context before adding or changing layout content.
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
   recent source edit. Require `valid: true`; use its file URI, error code,
   line, column, and source excerpt to fix every reported settings, layout,
   events, reference, or generated-project validation failure. This call first
   regenerates all three `.gdevelop` catalogs and both JavaScript declaration
   files, then validates the sources using those fresh contracts. Call it at
   least once before calling
   `reload_project`; a failed validation does not satisfy this gate. For
   JavaScript, fix every reported source URI/line diagnostic. `valid: true`
   proves parsing, source reconstruction, project validation, JavaScript
   authoring-API checking, and extension generated-code preflight only. It does
   not prove runtime object picking or gameplay side effects. Never summarize
   `valid: true` as "the game works" or as task completion without the required
   preview evidence.
8. After the requested task is complete and validation succeeds, use Git from
   the project repository root to commit every task-owned change before
   `reload_project`. Inspect `git status` and the final diff, stage all changes
   made for the user's task without including unrelated pre-existing work, and
   create a commit with a concise, descriptive imperative message. Record the
   commit hash and message for the final report. If any source edit is needed
   afterward, validate again and create a follow-up commit before reloading.
9. Call the GDevelop MCP `reload_project` tool with `mode: "start"`. Require its
   immediate accepted receipt and record the returned `operation_id`. Poll that
   exact ID with `mode: "status"` until it is terminal; use `mode: "wait"` with
   the same ID only when a blocking wait is useful. If a caller is interrupted
   before recording the ID, call `mode: "status"` without an ID to discover the
   active or latest retained operation. Require a successful completed reload
   receipt. Do not invoke an MCP save that could replace newer disk edits with
   stale editor memory. Never start a duplicate while status says an operation
   is running, and never assume a running reload failed merely because a waiter
   timed out or was interrupted. The status receipt exposes
   `catalogGeneration.artifacts`, the current catalog subphase, its timestamps,
   and the last renderer catalog progress record. If it reports a catalog
   failure, use that exact artifact/subphase; do not dismiss it as a generic
   renderer timeout.
10. For gameplay or visual changes, call `launch_preview` only after step 9.
    Start paused and use `run_frames` with `objects`, `include`, and optional
    `instance_indexes` to inspect bounded live position, angle, force, variable,
    and behavior state. Runtime verification is mandatory for extension actions
    that create, delete, pick, or mutate objects.
    If any project source changes after the reload, call `reload_project` again
    before the next preview, preceded by a new successful
    `validate_project_files` call and Git commit for those edits.

For assets, write the asset file inside the project, add/update its resource
entry in `resources.settings`, then reference its project-relative path from UI
configuration. Do not create generated images when a code-native or existing
asset is appropriate.

## MCP boundary

MCP is extension-import/synchronization/read/debug-only. Use it only for:

- Importing and converting an official legacy extension with
  `import_extension`. This is the only MCP tool allowed to create project
  source. It must return the generated source paths; all later adaptation is a
  direct file edit.
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

Except for the single `import_extension` conversion transaction, never use MCP
to create scenes, objects, resources, variables, instances, extensions,
behaviors, prefabs, or events. Never use generic editor-call, command, patch,
sync, or save tools for authoring.

`generate-catalogs` is a mandatory mid-task refresh after every large
structural source change. Require `catalogsRegenerated: true`, then read the
latest relevant `.gdevelop/settings-catalog.json`,
`.gdevelop/layout-catalog.json`, and `.gdevelop/instructions-catalog.json` and,
for JavaScript work, both generated `.d.ts` files before making dependent edits.
The tool writes and verifies those five generated authoring files and does not
validate sources or reload editor memory.

`validate_project_files` is a mandatory reload gate. In every direct-edit task,
call it successfully with no inputs at least once after the most recent
source-file edit and before `reload_project`. It regenerates the instruction,
settings, and layout catalogs and both JavaScript declarations first, then
reconstructs the generated `game.json` representation from the multi-file
settings, layouts, and events and type-checks JavaScript blocks against the
fresh public API without replacing editor memory. A later source edit
invalidates the earlier validation receipt. Its `valid: true` result is not a
runtime semantic test; behavior-sensitive changes still require a paused preview
and deterministic `run_frames` inspection. Never report the game as working or
the task as complete from this receipt alone.

The Git commit is also a mandatory reload gate. After the final successful
validation, inspect the repository diff, stage every change made for the user's
task, and commit it with a proper concise, descriptive message. Do not include
unrelated pre-existing changes. `reload_project` must run only after this commit
succeeds. A later source edit requires a new validation and follow-up commit
before another reload.

`reload_project` remains a mandatory preview gate. After both the validation
and Git-commit gates, start it with `mode: "start"`, record the immediate
`operation_id`, and poll that exact operation with `mode: "status"` until its
receipt is completed successfully. A status call without an ID discovers the
active/latest retained operation after caller interruption. Never launch or
relaunch a preview from stale editor memory. A later source edit invalidates the
validation, commit, and reload receipts. Never start another reload while the
current operation is running.
The reload writes generated catalogs itself and acknowledges their modification
times; do not respond to a "Project files changed on disk" dialog by starting a
second reload while the recorded operation is still running.

## Verification

Before finishing:

- Confirm every changed `.settings` and `.layout` file is unindented,
  independently parseable TOML; confirm every `.layout` is canonical flat
  layout TOML version 1.
- Confirm `.layout` files contain only placement/layout concepts and contain no
  `objects`, `objectGroups`, or behavior definitions.
- Confirm no `.settings` file contains a legacy `*FolderStructure` property;
  object/function grouping uses only a valid local `folder` array.
- Confirm every global, scene, and prefab object definition and its complete
  behaviors are at the local root of its individual `<Object>.settings` file.
- Confirm attached behaviors serialize only catalog-listed author-writable
  properties and no editor-hidden behavior descriptor appears in object settings.
- Confirm prefab and behavior property descriptor arrays are flat and contain
  no grouping/folder metadata.
- Confirm every prefab/behavior function has a dedicated flat function
  directory with `function.settings` and its matching sibling `.events`, and
  owner settings contain no embedded function entries.
- Confirm settings references use `game://` and resolve to existing files.
- Confirm settings file kinds and every object/behavior/effect type against
  `settings-catalog.json`.
- Confirm layout tables, fields, layers, objects, attached behaviors,
  and effect parameters against the matching `layout-catalog.json` context.
- Confirm catalog instruction types, kinds, scopes, and `dslName` arguments.
- For every changed JavaScript event, confirm `strict=true`, validate all
  context globals/project literals/public members against both generated
  `.d.ts` files, and confirm no forbidden private or ambient API is used.
- For Static Data changes, confirm `static-data.toml` ownership, direct-root
  TOML data, placeholder paths/types, and regeneration-time behavior
  against the Static Data reference.
- For signal changes, confirm target kind, receiver kind, fixed `onSignal`
  signature, guarded emission, next-dispatch timing, and preview signal-monitor
  evidence against the signal-system reference.
- Confirm every action has an effective condition in its event or ancestor
  chain and no unconditional action can execute every frame.
- Confirm every object-targeting action operates on a provably single picked
  instance; use `for each` when processing multiple instances.
- Confirm no legacy JSON was changed.
- Confirm `generate-catalogs` returned `catalogsRegenerated: true` after the
  final large structural change and that subsequent dependent edits used the
  refreshed relevant catalogs.
- Confirm `validate_project_files` returned `valid: true` after the final source
  edit and before `reload_project`.
- Confirm every task-owned change was committed after final validation and
  before `reload_project`; record the commit hash and descriptive commit
  message, and confirm no unrelated pre-existing change entered the commit.
- Confirm `reload_project` succeeded after the final source edit and before any
  `launch_preview` call.
- Debug runtime behavior with a fresh preview when behavior, rendering, input,
  audio, timing, or object picking changed.
- Report changed source files, concrete verification evidence, and the final
  Git commit hash and message.
