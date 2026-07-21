# Author JavaScript Events

Use JavaScript only inside an IfDo `@js ... @end js` event. Prefer current
instructions from `.gdevelop/instructions-catalog.json`; JavaScript is for
logic that is materially clearer or not expressible with those instructions.
It is not a replacement file format and it does not create standalone `.js`
project sources.

## Contents

1. [Generated API contract](#generated-api-contract)
2. [JavaScript event form](#javascript-event-form)
3. [Context globals](#context-globals)
4. [Project-aware types](#project-aware-types)
5. [Public runtime API](#public-runtime-api)
6. [Forbidden surfaces](#forbidden-surfaces)
7. [Safety and performance](#safety-and-performance)
8. [Examples](#examples)
9. [Validation workflow](#validation-workflow)

## Generated API contract

GDevelop saves two deterministic, generated declaration files:

- `.gdevelop/runtime-api.d.ts` is the reviewed public runtime surface.
- `.gdevelop/project-api.d.ts` describes the current scenes, objects, object
  groups, variables, layers, resources, and extension functions.

Read both files before creating or changing JavaScript. Search them narrowly
with `rg`; use only a member and spelling that is declared there. These files
are read-only generated editor state. Never edit them to make invalid code pass.
After a structural rename or component change, run `generate-catalogs`, wait
for `catalogsRegenerated: true`, and re-read the declarations because the old
project types are stale.

The declarations describe approved authoring, not a security sandbox. Passing
the type checker does not prove runtime timing, picking, performance, or visual
behavior.

## JavaScript event form

New or changed AI-authored JavaScript must opt into strict checking:

```events
@js strict=true
const elapsedSeconds = runtimeScene.getElapsedTime() / 1000;
@end js
```

Use `objects=<ObjectOrGroup>` only when the block operates on explicitly picked
instances:

```events
@js objects=Enemy strict=true
for (const enemy of objects) {
  enemy.setOpacity(128);
}
@end js
```

The raw body has no `>` prefix. A JavaScript event is a leaf. Its closing line
is always `@end js`. Preserve an existing `delimiter=` and matching terminator
when source text itself contains a terminator-shaped line.

Blocks without `strict=true` are legacy compatibility blocks. The validator
still rejects their syntax errors but reports semantic/private-API problems as
warnings. Preserve that mode only while minimally editing existing legacy code;
do not create new compatibility blocks.

## Context globals

`runtimeScene` exists in every JavaScript event. In a scene or linked external
events file, its generated type knows that scene's object names and layers.

`objects` exists only when the opening directive has `objects=`. Its element
type comes from the named object or object group in the current scene. Do not
use `objects` without that directive, and never assume the array contains only
one element unless event picking proves it.

`eventsFunctionContext` exists only inside extension, prefab, or behavior
function `.events` files. Do not use it in scene or external events.

Do not invent ambient globals. If a name is not present in the generated
declarations for that context, it is unavailable.

## Project-aware types

Literal project names are checked when the context is known. For example,
`runtimeScene.getObjects("Player")`, `runtimeScene.createObject("Bullet")`,
and `runtimeScene.getLayer("HUD")` accept names declared for that scene.
Misspellings and stale names are validation errors in strict blocks.

`createObject` is nullable. Check its result before accessing it:

```js
const bullet = runtimeScene.createObject("Bullet");
if (bullet) {
  bullet.setPosition(120, 64);
}
```

Use `runtimeScene.getVariables()` and an object's `getVariables()` for
variables. The project declaration documents known variable shapes, while the
runtime declaration defines the supported mutation methods. Use current names
from the owning settings files.

The generated `GDevelopProject` namespace is type information, not a runtime
object. Never call or instantiate it.

## Public runtime API

The runtime declaration contains a compact allowlist for common supported
operations, including:

- scene object lookup/creation, variables, layers, game access, timers, and
  elapsed time;
- object position, center, angle, size, layer, Z order, visibility, deletion,
  forces, variables, attached behavior lookup, and effects;
- public Sprite, Text, and Tiled Sprite operations;
- variables and variable-container operations;
- selected public `gdjs.evtTools` helpers;
- the limited events-function context surface.

This is intentionally smaller than the engine implementation. If an operation
is absent, use a current Events DSL instruction or a reviewed extension. Do not
recover a hidden method from engine source, generated preview code, or a debug
dump.

`runtimeScene.getObjects(name)` returns a live, engine-owned array. Calling
`deleteFromScene()` removes an item from that same array immediately, so a
forward `for`, `for...of`, or `forEach` deletion loop can skip instances. Delete
from a snapshot instead:

```js
const instances = runtimeScene.getObjects("Enemy").slice();
for (const instance of instances) {
  instance.deleteFromScene();
}
```

Reverse iteration over the live array is also safe.

## Forbidden surfaces

AI-authored JavaScript must not use:

- any member beginning with `_`;
- generated `gdjs.evtsExt__...func` symbols or direct `.func` calls;
- `eval`, `Function`, dynamic `import()`, or prototype monkey-patching;
- `require`, Node.js, Electron, `process`, filesystem, or shell APIs;
- `window`, `document`, DOM mutation, clipboard, cookies, browser storage, or
  navigator APIs;
- `fetch`, `XMLHttpRequest`, `WebSocket`, or other direct network APIs;
- raw PIXI/Three renderer state, runtime managers, caches, picking maps, or
  generated-code namespaces.

Use reviewed GDevelop extensions for network, storage, platform, or other
privileged capabilities.

## Safety and performance

- Put every state-changing block behind an effective condition in its event or
  an ancestor. Never run mutating JavaScript unconditionally every frame.
- When using `objects=`, ensure event picking selects at most one instance, or
  explicitly iterate the array when the intended operation applies to many.
- Avoid unbounded loops, recursion, repeated whole-scene scans, large per-frame
  allocations, blocking work, and resource loading inside frame events.
- Never add or delete instances while iterating forward over the live array
  returned by `runtimeScene.getObjects`. Iterate a `slice()` snapshot or iterate
  backward.
- Keep each block small and owned by the relevant scene or reusable function.
  Do not place the whole game in one frame block unless the user explicitly
  chose that architecture.
- Keep GDevelop event picking and action order in native events when JavaScript
  would obscure those semantics.

## Examples

Mutate an explicitly picked object:

```events
@event aiGeneratedEventId="fade-picked-enemy"
if CollisionNP first_object="Player" second_object="Enemy"

> @js objects=Enemy strict=true
for (const enemy of objects) {
  enemy.setOpacity(128);
}
> @end js
```

Create an object safely:

```events
@event aiGeneratedEventId="spawn-bullet"
if KeyPressed key="Space"

> @js strict=true
const bullet = runtimeScene.createObject("Bullet");
if (bullet) {
  bullet.setPosition(120, 64);
}
> @end js
```

Read and update a scene variable:

```events
@event aiGeneratedEventId="increase-score-on-trigger"
if SceneJustBegins

> @js strict=true
const score = runtimeScene.getVariables().get("Score");
score.add(10);
> @end js
```

In real files, prefix the opening and closing directives with the event depth
exactly as required by IfDo DSL. Never prefix the raw JavaScript body. The
examples use `>` only on the directives because the JavaScript event is a child.

## Validation workflow

1. Read the relevant settings/layout/instruction catalogs and both declaration
   files.
2. Prefer a catalog instruction; if JavaScript remains justified, author a
   small `strict=true` block with the exact available context globals.
3. After structural changes, run `generate-catalogs` and re-read the generated
   declarations before continuing.
4. Run `validate_project_files` after the final source edit. Require
   `valid: true`. Fix diagnostics at their reported `.events` URI, line, and
   column. Treat this as structural validation only; never report that the game
   works or that the task is complete from `valid: true` alone.
5. Commit all task-owned source changes with Git before `reload_project`.
6. Reload, launch a fresh paused preview, advance deterministic frames, and
   inspect every behavior-sensitive result.

Important diagnostic codes include `JS_API_SYNTAX_ERROR`,
`JS_API_UNKNOWN_MEMBER`, `JS_API_PRIVATE_MEMBER`, `JS_API_NULLABILITY`,
`JS_API_TYPE_MISMATCH`, `JS_API_FORBIDDEN_GLOBAL`, and
`JS_API_RESOURCE_LIMIT`. `JS_API_PERFORMANCE_RISK` is a non-blocking warning
that still requires the loop or workload to be reviewed.

Generated declarations and catalogs may change during steps 3-4, but they stay
under `.gdevelop/` and are not project-authored source. Never commit or hand-edit
them when the project template's `.gitignore` excludes `.gdevelop/`.
