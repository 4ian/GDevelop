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

- `scene.settings` owns a scene event sheet.
- `external.settings` owns an external event sheet and its linked scene.
- A dedicated `function.settings` owns every extension, prefab, or behavior
  function body. Prefab/behavior methods live under
  `functions/<Function>/` with their sibling `.events`; editor grouping is the
  `folder` array in `function.settings`.

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
do "Physics2::Remove joint" object="Object" behavior="PhysicsBehavior" joint_id="MouseJointID"
```

Use every required parameter exactly once by its catalog `dslName`. Parameter
values are JSON strings containing the exact serialized GDevelop operand:

```events
do DebuggerTools::ConsoleLog message_to_log="\"Game started\""
do SetNumberObjectVariable object="Enemy" variable="HP" modification_sign="-" value="1"
```

Preserve embedded quotes for string expressions. Omit a code-only parameter
only when its standard value is the empty string. Respect the catalog's kind,
event scopes, accepted values, owner, and parameter order/signature.

Never author `@exact`. It is a compiler/import fallback, not AI-authored
project syntax. If a type is absent after catalog regeneration, do not use it.
The catalog intentionally excludes hidden and deprecated instructions.

## Standard events

Put one statement on each line. Multiple `if` groups mean AND; consecutive
`or` lines extend only the immediately preceding condition group:

```events
if CollisionNP first_object="Player" second_object="Enemy"
or CollisionNP first_object="Player" second_object="Projectile"
if PlatformBehavior::IsOnFloor object="Player" behavior="PlatformerObject"
do DebuggerTools::ConsoleLog message_to_log="\"player contact\""
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
do DebuggerTools::ConsoleLog message_to_log="\"ready\""

> if NumberVariable variable="Ready" comparison_sign="=" value="1"
> do DebuggerTools::ConsoleLog message_to_log="\"space\""
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
do DebuggerTools::ConsoleLog message_to_log="\"initializing\""
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
> if NumberObjectVariable object="Enemy" variable="HP" comparison_sign="<=" value="0"
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

Declare locals before their owning event. In a catalog parameter, use the exact
serialized GDevelop operand for that local, normally its in-scope name:

```events
local damage = 10
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="ToString(damage)"
```

Simple initializers are numbers, strings, booleans, arrays, or structures.
Preserve an existing exact `var(...)` initializer when it carries enum values,
UUIDs, folded state, mixed-value metadata, or recursively typed children. Do
not shadow an ancestor local or loop alias.

Place an `else` chain immediately after its matching conditional event at the
same depth:

```events
if NumberVariable variable="HasSave" comparison_sign="=" value="1"
do DebuggerTools::ConsoleLog message_to_log="\"load save\""
else if NumberVariable variable="Attempts" comparison_sign=">" value="0"
do DebuggerTools::ConsoleLog message_to_log="\"retry\""
else
do DebuggerTools::ConsoleLog message_to_log="\"new game\""
```

Branch locals follow `else` or `else if` and precede branch instructions.
Never attach `else` to a loop, group, comment, link, or JavaScript event.

## Loops and links

Use these canonical structural forms:

```events
if SceneJustBegins
> for each Enemy index=i order_by="Enemy.Variable(HP)" order=desc limit=10
>> if NumberObjectVariable object="Enemy" variable="Active" comparison_sign="=" value="1"
>> do SetNumberObjectVariable object="Enemy" variable="Rank" modification_sign="=" value="i"

if SceneJustBegins
> for each child "inventory" value="item" key="itemKey" index="i"
>> if NumberVariable variable="item" comparison_sign=">" value="0"
>> do DebuggerTools::ConsoleLog message_to_log="ToString(item)"

if SceneJustBegins
> repeat 5 index=i
>> do DebuggerTools::ConsoleLog message_to_log="ToString(i)"

while NumberVariable variable="QueueSize" comparison_sign=">" value="0" limit=100 index=i
> do SetNumberVariable variable="QueueSize" modification_sign="-" value="1"
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

- Guard every scene/external-sheet action with an effective condition in its
  event or an ancestor. Never create an unconditional every-frame action.
- Before an object-targeting action, prove that at most one instance of that
  object is picked. Use `for each Object` to process multiple instances or a
  deterministic condition that narrows the pick to one instance.
- Preserve OR groups because flattening them changes GDevelop object picking.
- Preserve source order: actions run before child events, and picked instances
  flow into children.
- Use triggers, state checks, timers, comparisons, or explicit selectors to
  prevent repeated side effects and avoid unnecessary per-frame work.

## Canonical editing checklist

- Use only catalog `type` and `dslName` values; never guess an instruction.
- Never author `@exact`, deprecated instructions, prose aliases, or an `@`
  prefix on a catalog type.
- Use one statement per line, double-quoted JSON escaping, blank lines between
  sibling events, and one final newline.
- Preserve event order, instruction order, depth, metadata, locals, picking,
  and owner scope.
- Use `@group ... @end group`, `@js ... @end js`, and
  `@comment "..." background=[r,g,b] text=[r,g,b]` exactly.
- Keep settings, layout TOML, function declarations, and raw JSON outside
  `.events`.
- After editing, call `reload_project`; preview only after the reload succeeds.
