---
name: gdevelop-project-files
description: Create, inspect, modify, refactor, and verify GDevelop games through the multi-file project sources (`project.settings`, `.settings`, `.layout`, and `.events`). Use for any GDevelop project, scene, object, behavior, prefab, extension, third-party extension installation, reusable-component refactor, variable, resource, Global Config/placeholder, signal-system, layout, or event-sheet work. Read the generated settings, layout, and instruction catalogs for authoring; synchronize direct edits with the GDevelop MCP `reload_project` tool before preview debugging.
---

# GDevelop Project Files

## Source of truth

Treat project files as authoritative. Modify them directly; do not use MCP to
author the game. The sole authoring-related exception is `import_extension`:
use it once to import and convert an official legacy extension into canonical
multi-file sources, then continue by editing those generated files directly.

Read, in order:

1. `project.settings` for project metadata and non-global-config project data.
2. `resources.settings` for the complete project resource registry.
3. `config.settings` for the complete arbitrary global-config subtree.
4. `.gdevelop/settings-catalog.json`, then relevant child `.settings` files
   for semantic configuration and object definitions, including each object's
   variables, effects, and behaviors.
5. `.gdevelop/layout-catalog.json`, then relevant `.layout` files for Layout
   DSL instances, layers, spatial bounds, background, and editor-canvas layout.
6. Relevant `.events` files for IfDo event logic.
7. `.gdevelop/instructions-catalog.json` before adding or changing
   instructions.

The three catalogs are regenerated from the loaded project every time GDevelop
saves. Never edit them. Search them narrowly with `rg`: use file kind, object,
behavior, effect, owner, or layout context in the source catalogs, and use
instruction type, displayed name, group, description, parameter `dslName`, or
expression name in the instruction catalog. Generated JSON keeps one catalog
entry per line so a matching search returns only relevant metadata.

Use the catalogs as authoring contracts:

- In `settings-catalog.json`, read `fileKinds` for the target document's path,
  mounted namespace, local TOML root, required/common/forbidden fields, and ownership boundary. Search
  `objectTypes`, `behaviorTypes`, and `effectTypes` for exact registered type
  names, defaults, requirements, and property metadata. Use `settingsOwners`
  to resolve existing project components and their object definitions.
- In `layout-catalog.json`, read `elements` for exact context-specific tags,
  attributes, literals, child order, defaults, and constraints. Select the one
  `contexts` entry whose `owner` matches the scene, prefab, variant, or external
  layout, then use only its listed layers, objects, and attached behaviors.
  Search `effectTypes` for exact effect parameters and types.
- If the relevant registered type, file kind, element, or effect is absent,
  stop instead of guessing. If a direct edit introduces a new object or
  attached behavior name, validate its registered type in the settings catalog,
  define it first in the owning `.settings` file, and then reference that exact
  new name in the same coherent `.layout` patch; the saved layout context will
  list it after GDevelop regenerates the catalogs.

Search narrowly, for example:

```sh
rg '"type":"Sprite"' .gdevelop/settings-catalog.json
rg '"type":"Tween::TweenBehavior"' .gdevelop/settings-catalog.json
rg '"element":"instance"' .gdevelop/layout-catalog.json
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
- `config.settings`: edit global configuration only under the short local
  `[settings]` table; preserve arbitrary keys and the format-owned
  `[gdevelopConfig]`/`[gdevelopConfig.rawJson]` tables.
- `.layout`: Layout DSL component-tree markup containing placement/layout data
  only: instances, layers, spatial bounds, background, and editor view state.
  Never put TOML, object definitions, or attached behavior definitions in a
  `.layout` file. Instance behavior overrides are allowed only for behaviors
  already attached by the owning `.settings` object definition. Follow the
  matching layout-catalog `contexts` entry and `elements` definitions.
- `.events`: IfDo DSL only. Do not embed TOML or raw event JSON.
- References: use canonical `game://...` URIs rooted at `project.settings`.
- `.gdevelop/`: generated/editor state. Read catalogs; do not author sources
  there.

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

Give every prefab and behavior function its own `functions/<Function>/`
directory containing `function.settings` and `<Function>.events`. Store editor
grouping in the function settings `folder` array. `prefab.settings` and
`behavior.settings` must not embed function metadata.

## Project layout

```text
project.settings
resources.settings
config.settings
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
.gdevelop/settings-catalog.json
.gdevelop/layout-catalog.json
```

Do not create optional grouping folders. Canonical component directories are
fixed; object/function grouping belongs in each settings file's `folder`
array. Settings files never reference other settings files.

## Task references

Load only the references required by the task:

- Read [references/create-extensions.md](references/create-extensions.md) in
  full before creating an extension or adding/removing extension-level
  functions, prefabs, behaviors, or their functions.
- Read [references/layout-dsl.md](references/layout-dsl.md) in full before
  creating or changing any `.layout` file. Preserve existing UUIDs and use its
  exact scene, prefab/variant, or external-layout context rules.
- Read [references/events-dls.md](references/events-dls.md) in full before
  creating or changing any `.events` file. Use only its canonical IfDo
  structures and the exact types and `dslName` parameters found in the
  generated project instruction catalog.
- Read [references/global-config.md](references/global-config.md) in full
  whenever the user asks to create, edit, reorganize, or consume Global Config,
  or to add/change a `{{...}}` placeholder. Also read the events guide for an
  event consumer and the extension guide when injecting config into a prefab,
  behavior, or reusable extension.
- Read [references/signal-system.md](references/signal-system.md) in full
  whenever the user asks for signals, messaging, notification, scene/prefab
  communication, `SignalReceived`, signal sender/payload handling, or an
  `onSignal` lifecycle. Also read the events guide, and read the extension guide
  before adding or changing a prefab/custom-object `onSignal` function. Read
  the Global Config guide too when signal names use placeholders.
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
- Keep JavaScript events opt-in; use native instructions first.

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
   `.gdevelop/layout-catalog.json` for the exact layout grammar and matching
   project context before adding or changing layout content.
2. Search `.gdevelop/instructions-catalog.json` for required instructions and
   expressions. The generated catalog excludes editor-hidden and deprecated
   APIs; never invent or reuse an instruction identifier that is absent from it
   when authoring new events.
3. Patch source files directly. Use `apply_patch` for precise edits.
   Creating or changing an object type or one of its behaviors is a settings
   edit; creating or moving an instance is a layout edit.
4. Re-read every changed manifest reference and verify that each `game://` URI
   exists and stays inside the project.
5. Check settings TOML syntax, Layout DSL structure/semantics, duplicate
   namespaces, event depth, instruction names, named parameters, and asset
   paths.
6. Call the GDevelop MCP `reload_project` tool and require a successful reload
   receipt. Do not invoke an MCP save that could replace newer disk edits with
   stale editor memory.
7. For gameplay or visual changes, call `launch_preview` only after step 6.
   If any project source changes after the reload, call `reload_project` again
   before the next preview.

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
- Current editor/project/selection queries.
- Launching or controlling a debug preview.
- Deterministic frame stepping and input simulation.
- Inspecting live runtime state, logs, errors, audio, and instance positions.
- Capturing preview screenshots.

Except for the single `import_extension` conversion transaction, never use MCP
to create scenes, objects, resources, variables, instances, extensions,
behaviors, prefabs, or events. Never use generic editor-call, command, patch,
sync, or save tools for authoring.

`reload_project` is a mandatory preview gate. In every direct-edit task, call
it successfully at least once after the most recent source-file edit and before
the first `launch_preview`. Never launch or relaunch a preview from stale editor
memory. A later source edit invalidates the earlier reload receipt.

## Verification

Before finishing:

- Confirm every changed `.settings` file is unindented TOML and independently
  parseable; confirm every `.layout` is canonical Layout DSL version 1.
- Confirm `.layout` files contain only placement/layout concepts and contain no
  `objects`, `objectsGroups`, or behavior definitions.
- Confirm no `.settings` file contains a legacy `*FolderStructure` property;
  object/function grouping uses only a valid local `folder` array.
- Confirm every global, scene, and prefab object definition and its complete
  behaviors are at the local root of its individual `<Object>.settings` file.
- Confirm prefab and behavior property descriptor arrays are flat and contain
  no grouping/folder metadata.
- Confirm every prefab/behavior function has a dedicated flat function
  directory with `function.settings` and its matching sibling `.events`, and
  owner settings contain no embedded function entries.
- Confirm settings references use `game://` and resolve to existing files.
- Confirm settings file kinds and every object/behavior/effect type against
  `settings-catalog.json`.
- Confirm layout elements, attributes, layers, objects, attached behaviors,
  and effect parameters against the matching `layout-catalog.json` context.
- Confirm catalog instruction types, kinds, scopes, and `dslName` arguments.
- For Global Config changes, confirm `config.settings` ownership, canonical
  raw-JSON pointers, placeholder paths/types, and regeneration-time behavior
  against the Global Config reference.
- For signal changes, confirm target kind, receiver kind, fixed `onSignal`
  signature, guarded emission, next-dispatch timing, and preview signal-monitor
  evidence against the signal-system reference.
- Confirm every action has an effective condition in its event or ancestor
  chain and no unconditional action can execute every frame.
- Confirm every object-targeting action operates on a provably single picked
  instance; use `for each` when processing multiple instances.
- Confirm no legacy JSON was changed.
- Confirm `reload_project` succeeded after the final source edit and before any
  `launch_preview` call.
- Debug runtime behavior with a fresh preview when behavior, rendering, input,
  audio, timing, or object picking changed.
- Report changed source files and concrete verification evidence.
