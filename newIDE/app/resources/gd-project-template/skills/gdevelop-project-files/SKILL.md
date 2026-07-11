---
name: gdevelop-project-files
description: Create, inspect, modify, refactor, and verify GDevelop games through the multi-file project sources (`project.settings`, `.settings`, `.layout`, and `.events`). Use for any GDevelop project, scene, object, behavior, prefab, extension, variable, resource, layout, or event-sheet work. Read the generated instruction catalog for event authoring; use GDevelop MCP only for editor-state queries and preview debugging.
---

# GDevelop Project Files

## Source of truth

Treat project files as authoritative. Modify them directly; do not use MCP to
author the game.

Read, in order:

1. `project.settings` for project-wide configuration.
2. `resources.settings` for the complete project resource registry.
3. Relevant child `.settings` files for semantic configuration.
4. Relevant `.layout` files for visual/UI configuration.
5. Relevant `.events` files for IfDo event logic.
6. `.gdevelop/instructions-catalog.json` before adding or changing
   instructions.

The catalog is regenerated from the loaded project every time GDevelop saves.
Never edit it. Search it narrowly with `rg` by instruction type, displayed
name, group, description, parameter `dslName`, or expression name instead of
loading the whole file into context. The generated JSON keeps one catalog entry
per line so a matching search returns only the relevant instruction.

Do not edit legacy project JSON, including `.gdevelop/game.json`. It is
generated compatibility/runtime output, not multi-file source.

## File contract

- `.settings`: TOML semantic/configuration data. Keep every file independent,
  append-safe, and unindented. Never embed another settings fragment.
- `.layout`: unindented TOML containing visual/UI data only: objects, layers,
  instances, editor view state, and prefab visual composition.
- `.events`: IfDo DSL only. Do not embed TOML or raw event JSON.
- References: use canonical `game://...` URIs rooted at `project.settings`.
- `.gdevelop/`: generated/editor state. Read catalogs; do not author sources
  there.

Preserve manifest order, stable names, existing unknown fields, and ownership
boundaries. Make the smallest coherent patch. When adding a component, add its
manifest entry and every referenced source file in the same change.

## Project layout

```text
project.settings
resources.settings
scenes/<Scene>/<Scene>.layout
scenes/<Scene>/<Scene>.events
scenes/<Scene>/scene.settings
externals/external.settings
externals/<External>.layout
externals/<External>.events
extensions/<Extension>/extension.settings
extensions/<Extension>/functions/<Function>/function.settings
extensions/<Extension>/functions/<Function>/<Function>.events
extensions/<Extension>/prefabs/<Prefab>/prefab.settings
extensions/<Extension>/prefabs/<Prefab>/<Prefab>.layout
extensions/<Extension>/prefabs/<Prefab>/<Function>.events
extensions/<Extension>/behaviors/<Behavior>/behavior.settings
extensions/<Extension>/behaviors/<Behavior>/<Function>.events
.gdevelop/instructions-catalog.json
```

Only create optional folders when the owning manifest references them.

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
- Never write `@exact`. The generated catalog includes hidden compatibility
  identifiers and variable-type variants needed for lossless named syntax. If
  a persisted type is absent, treat the catalog as stale and regenerate it by
  saving with the editor before editing that instruction.
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

1. Inspect manifests and only the owned files relevant to the request.
2. Search `.gdevelop/instructions-catalog.json` for required instructions and
   expressions.
3. Patch source files directly. Use `apply_patch` for precise edits.
4. Re-read every changed manifest reference and verify that each `game://` URI
   exists and stays inside the project.
5. Check TOML syntax, duplicate namespaces, event depth, instruction names,
   named parameters, and asset paths.
6. Let GDevelop reload the files. Do not invoke an MCP save that could replace
   newer disk edits with stale editor memory.
7. For gameplay or visual changes, use preview-debug MCP tools only after the
   editor has loaded the changed sources.

For assets, write the asset file inside the project, add/update its resource
entry in `resources.settings`, then reference its project-relative path from UI
configuration. Do not create generated images when a code-native or existing
asset is appropriate.

## MCP boundary

MCP is optional and read/debug-only. Use it only for:

- Current editor/project/selection queries.
- Launching or controlling a debug preview.
- Deterministic frame stepping and input simulation.
- Inspecting live runtime state, logs, errors, audio, and instance positions.
- Capturing preview screenshots.

Never use MCP to create scenes, objects, resources, variables, instances,
extensions, behaviors, prefabs, or events. Never use generic editor-call,
command, patch, sync, or save tools for authoring.

## Verification

Before finishing:

- Confirm every changed TOML file is unindented and independently parseable.
- Confirm `.layout` changes are visual/UI-only.
- Confirm settings references use `game://` and resolve to existing files.
- Confirm catalog instruction types, kinds, scopes, and `dslName` arguments.
- Confirm no legacy JSON was changed.
- Debug runtime behavior with a fresh preview when behavior, rendering, input,
  audio, timing, or object picking changed.
- Report changed source files and concrete verification evidence.
