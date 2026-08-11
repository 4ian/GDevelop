# Author Events DSL

Read the owning `.settings` file and the generated instruction catalog before
editing an `.events` file. Settings define the event sheet or function context;
`.events` contains only IfDo DSL event logic. Never put TOML, a function
declaration, or raw GDevelop event JSON in this file.

## Contents

1. [Authoring context](#authoring-context)
2. [Catalog instructions](#catalog-instructions)
3. [Standard events](#standard-events)
4. [Depth and event boundaries](#depth-and-event-boundaries)
5. [Metadata, groups, and comments](#metadata-groups-and-comments)
6. [Local variables and branches](#local-variables-and-branches)
7. [Loops and links](#loops-and-links)
8. [JavaScript](#javascript)
9. [Function bodies](#function-bodies)
10. [Runtime safety rules](#runtime-safety-rules)
11. [Canonical editing checklist](#canonical-editing-checklist)

## Authoring context

Use the owner to determine available objects, behaviors, variables, functions,
and event scope:

- `scene.settings` owns four fixed lifecycle functions below
  `scenes/<Scene>/functions/`: `sceneLoad`, `sceneSignal`, `sceneUpdate`, and
  `sceneUnload`. Each has a flat same-stem `.settings` and `.events` pair.
- `external-events.settings` owns an External Events resource below
  `scenes/<Scene>/external-events/<External>/`; it has the same four flat
  lifecycle function pairs, and the physical owner path supplies its scene
  context.
- A dedicated `<Function>.settings` owns every extension, prefab, or behavior
  function body. Its sibling `<Function>.events` uses the same stem; editor
  grouping is the `folder` array in the settings file.

Every managed `.events` file is a function body and must have a same-stem
`.settings` file in the same `functions/` directory. An orphan `.events` file
is invalid and is never treated as an implicit function.

Read `.gdevelop/instructions-catalog.json` before writing instructions. It is
regenerated on project save and is read-only. Search it narrowly instead of
loading the complete file, for example:

```sh
rg '"type":"CollisionNP"' .gdevelop/instructions-catalog.json
rg 'SetNumberObjectVariable' .gdevelop/instructions-catalog.json
```

`.gdevelop/deprecated-instructions-catalog.json` is not an authoring source.
Consult it only when a legacy project's existing `.events` code already uses a
deprecated instruction and you must understand or minimally edit that exact
instruction. Never use a deprecated-catalog entry to construct a new event or
introduce another deprecated instruction. Prefer a current replacement from
`instructions-catalog.json` whenever a safe migration is part of the edit.
Imported projects can add inferred signatures for removed instructions to the
deprecated catalog. Treat these as legacy read/edit entries, never as APIs for
new events.

Use only symbols and instructions available to the owning context. When the
catalog appears stale, save through the editor to regenerate it before
authoring events.

## Catalog instructions

Write the exact catalog `type` after `if`, `or`, or `do`. Never prefix an
instruction type with `@` and never replace it with a prose alias. The rare
exact type containing whitespace is written as a JSON string:

```events
if SceneJustBegins
if CollisionNP first_object="Player" second_object="Enemy"
do Delete object="Enemy"
do "Physics2::Remove joint" object="Object" behavior="PhysicsBehavior" joint_id=12
```

When authoring a new instruction, use every required parameter exactly once by
its catalog `dslName`. Write the value according to the catalog parameter's
`valueKind`:

```events
do DebuggerTools::ConsoleLog message_to_log="Game started"
do SetNumberObjectVariable object="Enemy" variable="HP" modification_sign="-" value=1
do TextContainerCapability::TextContainerBehavior::SetValue object="ScoreText" behavior="Text" modification_sign="=" text=expr("Score: " + ToString(Variable(Score)))
```

Use direct strings for `text`, object, behavior, variable, resource, and name
values. Use unquoted literals for numbers and booleans. Use `expr(...)` only
for calculated `text` or `number` values. Omit every code-only parameter.
Respect the catalog's kind, event scopes, accepted values, owner, and parameter
order/signature.

An omitted named parameter in an existing migrated instruction represents a
blank stored slot. Preserve that omission instead of adding a placeholder.
This applies even when current metadata marks the parameter required; new
instructions must still provide the required semantic value.

Calculated expressions may span physical lines. Keep delimiters balanced.
Formatting canonicalizes insignificant leading and trailing whitespace outside
string literals while preserving whitespace inside a multiline string literal.

If a type is absent after catalog regeneration, do not use it. The catalog
intentionally excludes hidden and deprecated instructions.

Keyboard parameters use the canonical definitions exposed by the generated
instruction catalog. Main-row digits have canonical names `Num0` through
`Num9`; user-facing aliases such as `"1"` and `Digit1` normalize to `Num1`.
`Numpad1` remains a distinct keypad key and must not be substituted for the
main-row digit. Prefer canonical names in authored `.events` files. A statically
known unsupported literal is rejected as `INPUT_UNKNOWN_KEY_NAME`; dynamic
string expressions are allowed because they cannot be proven invalid during
authoring.

## Standard events

Put one statement on each line. Multiple `if` groups mean AND; consecutive
`or` lines extend only the immediately preceding condition group:

```events
if CollisionNP first_object="Player" second_object="Enemy"
or CollisionNP first_object="Player" second_object="Projectile"
if PlatformBehavior::IsOnFloor object="Player" behavior="PlatformerObject"
do DebuggerTools::ConsoleLog message_to_log="player contact"
```

The meaning is `on floor AND (Player collides with Enemy OR Projectile)`.
Conditions precede actions, and actions preserve source order. Use `do await`
only for an action whose current catalog entry declares asynchronous support;
copy that entry's exact type and named parameters.

An explicitly empty standard event is `event`. It is mainly used to preserve
an event that owns metadata, locals, or child events but has no instruction.

## Depth and event boundaries

Every leading `>` increases event depth by one. Repeat the complete prefix on
every statement belonging to the child event:

```events
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="ready"

> if NumberVariable variable="Ready" comparison_sign="=" value=1
> do DebuggerTools::ConsoleLog message_to_log="space"
```

Use `>>` for the next depth. Never jump over a depth. Spaces after the prefix
do not define hierarchy. A dedent closes the child block.

At each depth, keep this order:

1. Local declarations.
2. Conditions.
3. Actions.
4. Child events.
5. An immediately adjacent `else` chain when present.

Never place a parent action after its first child. A conditional event requires
an action or child event. Child events inherit ancestor conditions, locals, and
picked instances.

## Metadata, groups, and comments

Use `@event` immediately before the event whose current metadata it preserves:

```events
@event disabled=true folded=true aiGeneratedEventId="initialize-ui"
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="initializing"
```

Use `@instruction` immediately before its condition or action only when
preserving instruction metadata such as `disabled`, `inverted`, or `awaited`.
Do not move event metadata onto an instruction or vice versa.

A group uses one header and a typed terminator. Group event metadata belongs on
the `@group` line:

```events
@group "Combat" disabled=true source="" creationTime=0 color=[74,176,228] parameters=[]

@event aiGeneratedEventId="damage-enemy"
for each Enemy
> if NumberObjectVariable object="Enemy" variable="HP" comparison_sign="<=" value=0
> do Delete object="Enemy"

@end group
```

Do not write a second `group` line, a bare `@end`, or nested groups. Comments
are complete event statements, not hash comments:

```events
@comment "Damage handling\nRuns once per picked enemy" background=[255,230,109] text=[0,0,0]
```

Use JSON string escapes inside comment text. Never use `#` or inline comments.

## Local variables and branches

Declare locals before their owning event. Use `expr(...)` when a calculated
catalog parameter reads the local:

```events
local damage = 10
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log=expr(ToString(damage))
```

Simple initializers are numbers, strings, booleans, arrays, or structures.
Preserve an existing exact `var(...)` initializer when it carries enum values,
UUIDs, folded state, mixed-value metadata, or recursively typed children. Do
not shadow an ancestor local or loop alias.

Place an `else` chain immediately after its matching conditional event at the
same depth:

```events
if NumberVariable variable="HasSave" comparison_sign="=" value=1
do DebuggerTools::ConsoleLog message_to_log="load save"
else if NumberVariable variable="Attempts" comparison_sign=">" value=0
do DebuggerTools::ConsoleLog message_to_log="retry"
else
do DebuggerTools::ConsoleLog message_to_log="new game"
```

Branch locals follow `else` or `else if` and precede branch instructions.
Never attach `else` to a loop, group, comment, link, or JavaScript event.

## Loops and links

Use these canonical structural forms:

```events
if SceneJustBegins
> for each Enemy index=i order_by="Enemy.Variable(HP)" order=desc limit=10
>> if NumberObjectVariable object="Enemy" variable="Active" comparison_sign="=" value=1
>> do SetNumberObjectVariable object="Enemy" variable="Rank" modification_sign="=" value=expr(i)

if SceneJustBegins
> for each child "inventory" value="item" key="itemKey" index="i"
>> if NumberVariable variable="item" comparison_sign=">" value=0
>> do DebuggerTools::ConsoleLog message_to_log=expr(ToString(item))

if SceneJustBegins
> repeat 5 index=i
>> do DebuggerTools::ConsoleLog message_to_log=expr(ToString(i))

while NumberVariable variable="QueueSize" comparison_sign=">" value=0 limit=100 index=i
> do SetNumberVariable variable="QueueSize" modification_sign="-" value=1
```

`for each` guarantees one picked instance per iteration. Loop aliases and
counters are read-only and visible only in the loop subtree. A loop body is
one depth deeper. Use `limit=` with `order_by=` for a sorted `for each`.

Every AI-authored `while` requires a positive safety `limit=` and must visibly
progress toward termination. Use `and while` and `@while` only when preserving
existing exact while-event structure.

Link an existing event-sheet target with a leaf event:

```events
link external "Shared Combat"
link scene "Base Level"
```

Links cannot own locals, actions, or children. Never use `link` in a function
body. Do not create direct or indirect link cycles.

## JavaScript

Prefer catalog instructions. Use JavaScript only when the user explicitly
allows it and no suitable native instruction exists. Before editing any block,
read [javascript-api.md](javascript-api.md) and the generated
`.gdevelop/runtime-api.d.ts` and `.gdevelop/project-api.d.ts` files:

```events
@js objects=Enemy strict=true expanded=false
objects.forEach(enemy => enemy.setOpacity(128));
@end js
```

The body is raw JavaScript; do not prefix its lines with `>`. The opening and
closing directives carry the event depth and must match. Preserve an existing
`delimiter=` and matching `@end js <delimiter>` when the body contains a line
that otherwise looks like its terminator. A JavaScript event is a leaf.

## Function bodies

Read the owning settings for function kind, parameters, return type, owner,
and allowed symbols. The `.events` file contains no signature or `function`
header. Treat parameters as read-only and use named arguments for every custom
function call.

Action functions have no result. Condition, number, and text functions must
initialize their return value unconditionally before conditional replacements.
Use the catalog's `SetReturnBoolean`, `SetReturnNumber`, or `SetReturnString`
action and its exact generated `dslName`; assignment shorthand such as
`do result = false` is not project-authoring syntax.

Result initialization executes when the function is called, not once per
scene frame. Ensure every call site that can mutate game state is guarded by
an effective condition. Do not create recursive calls unless recursion is
explicitly permitted.

## Runtime safety rules

- Choose the lifecycle deliberately: initialization belongs in `sceneLoad`,
  delivered scene notification handling in `sceneSignal`, continuous gameplay
  in `sceneUpdate`, and synchronous final cleanup in `sceneUnload`.
- `sceneSignal` is invoked once per delivered scene signal. Compare
  its fixed `SignalName` parameter and read `Payload` directly. Never author
  the legacy `SignalReceived` iterator; only parse and preserve existing uses
  in `sceneUpdate`.
- `sceneUnload` is terminal and synchronous. Never author awaited/future-frame
  actions, deferred signal emission, or scene-stack transitions there.
- A `link scene` or `link external` resolves the target's same lifecycle
  function. An empty target body is a valid no-op.
- Guard every scene/external-sheet action with an effective condition in its
  event or an ancestor. Never create an unconditional every-frame action.
- Treat object-targeting actions as applying to the current picked set. Multiple
  picked instances are valid when the gameplay intends to mutate them all; use
  `for each Object` or a deterministic selector only when each instance must be
  isolated or exactly one target is required.
- Preserve OR groups because flattening them changes GDevelop object picking.
- Preserve source order: actions run before child events, and picked instances
  flow into children.
- Use triggers, state checks, timers, comparisons, or explicit selectors to
  prevent repeated side effects and avoid unnecessary per-frame work.

## Canonical editing checklist

- Use only catalog `type` and `dslName` values; never guess an instruction.
- Never author deprecated instructions, prose aliases, or an `@` prefix on a
  catalog type.
- Use one statement per line, normal JSON string-literal escaping, blank lines
  between sibling events, and one final newline.
- Preserve event order, instruction order, depth, metadata, locals, picking,
  and owner scope.
- Use `@group ... @end group`, `@js ... @end js`, and
  `@comment "..." background=[r,g,b] text=[r,g,b]` exactly.
- Keep settings, layout TOML, function declarations, and raw JSON outside
  `.events`.
- After editing, require `validate_project_files` to pass every structural,
  generated-code, JavaScript-authoring, and semantic phase before
  `reload_project`. Preview only after the reload succeeds, and use
  `verify_project_change` or equivalent paused-preview checks for
  behavior-sensitive changes.
