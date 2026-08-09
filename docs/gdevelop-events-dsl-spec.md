# IfDo Events DSL

## A Minimal AI-Friendly DSL for GDevelop Events JSON and Functions

**Status:** IfDo syntax contract used by multi-file format version 5
**Canonical source filename:** `xx.events`

**File extension:** `.events`

**Encoding:** UTF-8
**Target:** GDevelop scene event sheets, external event sheets, and extension functions

Version 5 stores every function body as the same-stem sibling of its settings
owner: `functions/<Function>.settings` and
`functions/<Function>.events`. The settings file does not contain an events
URI. Logical grouping is the settings `folder` value and never adds path
segments. Any nested `functions/<Function>/function.settings` example later in
this document is unsupported v3/v4 path history; it does not change the IfDo
grammar described here. The controlling physical ownership contract is
[embedded-layout-settings-format-spec.md](embedded-layout-settings-format-spec.md).
Every managed `.events` source is therefore a function body; an `.events` file
without its same-stem `.settings` owner is invalid. External lifecycle pairs
live below `scenes/<Scene>/external-events/<External>/functions/`.

---

## Contents

1. [Overview](#1-overview)
2. [Design goals](#2-design-goals)
3. [GDevelop menu coverage](#3-gdevelop-menu-coverage)
4. [Source format](#4-source-format)
5. [Core structural model](#5-core-structural-model)
6. [Comments](#6-comments)
7. [Standard events](#7-standard-events)
8. [Local variables](#8-local-variables)
9. [Event boundaries and sub-events](#9-event-boundaries-and-sub-events)
10. [Else and else-if](#10-else-and-else-if)
11. [Event groups](#11-event-groups)
12. [Loop events](#12-loop-events)
13. [Link events](#13-link-events)
14. [JavaScript code events](#14-javascript-code-events)
15. [Variables, aliases, and namespaces](#15-variables-aliases-and-namespaces)
16. [Expressions](#16-expressions)
17. [Function files](#17-function-files)
18. [Instruction catalog](#18-instruction-catalog)
19. [Runtime semantics](#19-runtime-semantics)
20. [Parsing model](#20-parsing-model)
21. [Simplified grammar](#21-simplified-grammar)
22. [Compiler architecture](#22-compiler-architecture)
23. [Validation rules](#23-validation-rules)
24. [Canonical formatting](#24-canonical-formatting)
25. [Complete examples](#25-complete-examples)
26. [AI generation contract](#26-ai-generation-contract)
27. [Recommended generation workflow](#27-recommended-generation-workflow)
28. [Version 2.0 feature set](#28-version-20-feature-set)
29. [Final design principles](#29-final-design-principles)
30. [Compatibility basis](#30-compatibility-basis)
31. [Current implementation boundary](#31-current-implementation-boundary)
32. [Normative event-to-JSON mapping](#32-normative-event-to-json-mapping)
33. [Normative structural-event mapping](#33-normative-structural-event-mapping)
34. [Function metadata and current JSON mapping](#34-function-metadata-and-current-json-mapping)
35. [Exhaustive typed coverage](#35-exhaustive-typed-coverage)
36. [Bidirectional conversion algorithm](#36-bidirectional-conversion-algorithm)

---

## 1. Overview

IfDo is a small, line-oriented language for authoring GDevelop events with AI models.

The language keeps control flow visible and uses only a small set of structural words:

```text
if
or
do
else
local
for
repeat
while
link
function
event
>
?
@event / @instruction / @comment / @group / @while / @js / @end
```

A compiler converts `.events` source into the exact GDevelop event-sheet or extension-function data expected by the loaded project, GDevelop version, installed extensions, objects, behaviors, variables, resources, scenes, external event sheets, and registered functions.

The AI model uses the exact action or condition `type` and named parameters from
the generated project catalog rather than positional JSON parameter arrays.
The DSL core does not hardcode instruction aliases. Every instruction must be
represented by a complete named catalog signature.

> **Implementation status:** the core parser, compiler, canonical decompiler,
> catalog adapter, JSON normalizer, and equivalence checker are implemented in
> `newIDE/app/src/EventsSheet/IfDoEventsDsl/index.js`, with focused and
> repository-fixture tests in the adjacent `index.spec.js`. The multi-file
> project storage uses this converter directly. All registered instruction
> types and parameter names enter through the catalog adapter. Sections 31
> through 36 are the normative current-JSON mapping and take precedence over
> earlier illustrative examples when there is a conflict.

### Minimal standard event

```events
@comment "Collect a coin" background=[255,230,109] text=[0,0,0]

if CollisionNP first_object="Player" second_object="Coin"
do Delete object="Coin"
do SetNumberVariable variable="score" modification_sign="+" value="1"
```

### Standard event with a sub-event

```events
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="scene started"

> if CollisionNP first_object="Player" second_object="Enemy"
> do Delete object="Enemy"
```

---

## 2. Design goals

IfDo is designed to be:

1. **Easy for AI models to generate.**
2. **Easy for humans to read and review.**
3. **Deterministic to parse.**
4. **Strictly validated against the current GDevelop project.**
5. **Independent of internal GDevelop instruction names.**
6. **Small enough to include in an AI prompt.**
7. **Able to represent every core event kind shown by the GDevelop event menu.**
8. **Safe to compile only after syntax and semantic validation.**

### Non-goals

Version 2.0 is not intended to be:

- A general-purpose programming language.
- A full GDevelop project format.
- A language for declaring scenes, objects, resources, behaviors, or extensions.
- A macro or metaprogramming system.
- A replacement for GDevelop's instruction catalog.
- A JavaScript type checker. JavaScript is supported only as an explicit raw-code event.
- A serialization of editor-only layout details that do not affect event behavior.

Every source file uses the name pattern `xx.events`, where `xx` is any useful
base name. A `.events` file contains only IfDo DSL event code. In a multi-file
project, its scene, external-event, or function target is supplied by the
referencing `.settings` manifest; target configuration is never embedded as
TOML front matter.

---

## 3. GDevelop menu coverage

The following table maps the items visible in the GDevelop event menus to IfDo.

| GDevelop editor item    | IfDo representation                                         |
| ----------------------- | ----------------------------------------------------------- |
| New Event Below         | Source order; place the new event after the previous event  |
| Sub Event               | Prefix every line of the child event with `>`               |
| Local Variable          | `local name = initialValue` attached to an event            |
| Comment                 | `@comment "text" background=[...] text=[...]`               |
| Else                    | `else` or `else if condition`                               |
| For each object         | `for each Object`                                           |
| For each child variable | `for each child variablePath as alias`                      |
| Event group             | `@group "Name" ... @end group`                              |
| JavaScript code         | `@js` ... `@end js`                                         |
| Link external events    | `link external "Sheet Name"`                                |
| Repeat                  | `repeat count`                                              |
| Standard event          | `if`, `or`, and `do` lines                                  |
| While                   | `while condition`                                           |
| Extension function      | A pure `.events` body referenced by its `function.settings` |

`New Event Below` is an editor insertion command rather than a serialized event type. In a text language, event order already expresses this operation.

---

## 4. Source format

### 4.1 One statement per line

Every IfDo condition, action, declaration, branch marker, loop header, group marker, link, or comment occupies one physical line.

Correct:

```events
if collision Player Enemy
do Player.health -= 10
```

Not supported:

```text
if collision Player Enemy do Player.health -= 10
```

A JavaScript body is the only raw multiline block. Its header and terminator remain separate lines.

### 4.2 Whitespace

Spaces and tabs separate tokens but do not define event hierarchy.

Only leading `>` characters define sub-event depth.

These are equivalent:

```events
> if Enemy.health <= 0
> do delete Enemy
```

```events
>   if Enemy.health <= 0
>   do delete Enemy
```

The canonical formatter emits one space after the complete depth prefix:

```events
> if Enemy.health <= 0
```

### 4.3 Blank lines

Blank lines are ignored by the parser.

The canonical formatter uses blank lines between sibling events and around groups for readability.

### 4.4 Strings

Strings use double quotes:

```events
do sound.play "sounds/hurt.wav"
do scene.change "GameOver"
```

Supported escapes:

```text
\"
\\
\n
\t
```

Single-quoted strings are not canonical IfDo.

### 4.5 Identifiers

Normal identifiers use this form:

```text
[A-Za-z_][A-Za-z0-9_]*
```

Examples:

```text
Player
Enemy
health
Platformer
```

Dotted paths identify namespaces, properties, behavior instructions, and variable fields:

```text
scene.score
global.highScore
local.damage
Player.health
Platformer.jump
sound.play
```

Bracket indexing accesses a dynamic child of a structure or array:

```events
do scene.inventory[item.name] = item.value * 2
do local.items[0] = "Sword"
```

### 4.6 File names and file kinds

All DSL source files use the `.events` extension:

```text
scenes/Main/Main.events
scenes/Main/externals/SharedCombat.events
extensions/Combat/functions/Damage/Damage.events
```

`xx.events` means that `xx` is an arbitrary descriptive base name.

A source file has one of two kinds:

1. **Event-sheet body** — compiled for the scene target supplied by project and
   scene settings. External event sheets derive the same target from the
   `scene.settings` document that declares them.
2. **Function body** — compiled for the function signature supplied by
   its dedicated `function.settings`.

Both have the same pure DSL file grammar. Their owning settings determine the
semantic context.

Canonical names are:

```text
scenes/<SceneName>/<SceneName>.events
scenes/<SceneName>/externals/<ExternalEventSheetName>.events
extensions/<ExtensionName>/functions/<FunctionName>/function.settings
extensions/<ExtensionName>/functions/<FunctionName>/<FunctionName>.events
extensions/<ExtensionName>/prefabs/<PrefabName>/functions/<FunctionName>/function.settings
extensions/<ExtensionName>/prefabs/<PrefabName>/functions/<FunctionName>/<FunctionName>.events
extensions/<ExtensionName>/behaviors/<BehaviorName>/functions/<FunctionName>/function.settings
extensions/<ExtensionName>/behaviors/<BehaviorName>/functions/<FunctionName>/<FunctionName>.events
```

In a project, the filename is cross-checked but settings are authoritative.
External event-sheet paths are listed in the owning scene's
`externalEventFiles`; the owner supplies the scene association.
All function settings are discovered from fixed physical `functions/`
directories. Prefab and behavior `function.settings` files store editor
grouping in `folder = ["Parent", "Child"]`; no owner settings file lists them. The `ifdo-ai` profile
requires the canonical path when the integration can control it.

Every managed `.events` reference stored in settings is a canonical
project-root URI, not a relative path. For example:

```toml
events = "game://scenes/Main/Main.events"
events = "game://scenes/Main/externals/SharedCombat.events"
events = "game://extensions/Combat/functions/Damage/Damage.events"
events = "game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/TakeDamage.events"
events = "game://extensions/Combat/behaviors/Health/functions/Heal/Heal.events"
```

`game://` is rooted at the directory containing `project.gdevelop`. Resolution,
normalization, containment, and percent-encoding rules are defined in the
multi-file project format specification. All `.settings` TOML files are
local-root documents mounted at namespaces derived from their canonical paths.
Strictly merging those mounted documents produces the authoritative in-memory
`CombinedProjectSettings` compilation document without changing the pure DSL
grammar described here. Settings documents remain separate on disk; none
embeds or includes another, and the combined document is never written as
project source.

A `.events` file contains one event body. Multiple functions use multiple
files/subfolders.

### 4.7 Target binding and file purity

Persisted project `.events` files do not contain TOML front matter. Settings
fragments are independently discovered from fixed folder conventions; no
settings fragment references another settings fragment. Each discovered owner
then binds its own `.events` target out of band:

```text
game://scenes/Main/scene.settings -> game://scenes/Main/Main.events
game://scenes/Main/scene.settings -> game://scenes/Main/externals/SharedCombat.events
game://extensions/Combat/functions/Damage/function.settings -> game://extensions/Combat/functions/Damage/Damage.events
game://extensions/Combat/prefabs/Enemy/functions/Combat/TakeDamage/function.settings -> game://extensions/Combat/prefabs/Enemy/functions/Combat/TakeDamage/TakeDamage.events
game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/function.settings -> game://extensions/Combat/behaviors/Health/functions/Recovery/Heal/Heal.events
```

All identity, owner, function type, parameters, return type, ordering, and
editor configuration live in `.settings` TOML. `.layout` TOML is limited to
visual/UI data. `.events` contains only DSL statements, DSL comments, typed
metadata annotations, and typed catalog instructions defined in this
document. Raw event or instruction JSON is forbidden.

A standalone authoring API may optionally accept a `function` declaration as
DSL shorthand when no settings target is available, but the canonical
multi-file project profile forbids it because it duplicates configuration.

---

## 5. Core structural model

A standard IfDo event consists of optional local declarations, zero or more conditions, and one or more actions or sub-events.

```events
local damage = 10
if collision Player Enemy
do Player.health -= local.damage
```

Multiple `if` lines mean **AND**:

```events
if Player.health > 0
if key Space pressed
do Platformer.jump Player
```

An `or` line extends the immediately preceding condition group:

```events
if key Left down
or key A down
do Platformer.move_left Player
```

Sub-events use depth prefixes:

```events
if collision Player Enemy
do Player.health -= 10

> if Player.health <= 0
> do scene.change "GameOver"
```

Groups organize sibling events:

```events
@group "Combat"

if collision Bullet Enemy
do Enemy.health -= Bullet.damage
do delete Bullet

@end group
```

---

## 6. Comments

A comment is one `@comment` statement containing a required quoted string and
its presentation colors.

```events
@comment "Damage the player only when invincibility is off" background=[255,230,109] text=[0,0,0]

if collision Player Enemy
if Player.invincible == false
do Player.health -= Enemy.damage
```

A nested comment uses the same depth as the location where the GDevelop comment event is inserted:

```events
if SceneJustBegins

> @comment "Restore an existing save" background=[255,230,109] text=[0,0,0]
> if global.hasSave == true
> do scene.score = global.savedScore
```

Consecutive `@comment` statements at the same depth remain separate GDevelop
comment events. Use an escaped newline inside the quoted string when one
multiline comment event is intended:

```events
@comment "Player damage\nThe timer prevents damage every frame" background=[255,230,109] text=[0,0,0]
```

Hash comments and inline comments are intentionally unsupported:

Any hash-prefixed line or trailing hash text is a syntax error.

Comments do not affect runtime behavior, variable scope, or object picking.

---

## 7. Standard events

The most common GDevelop event is represented directly with `if`, `or`, and `do`.

### 7.1 Conditions

A condition line starts with `if`:

```events
if collision Player Enemy
```

Conditions may be:

- Catalog instruction conditions.
- Comparisons.
- Boolean references.
- Negated conditions.

#### Catalog instruction condition

```events
if collision Player Enemy
if key Space pressed
if Platformer.on_floor Player
if timer Player.invincibility >= 1s
```

Available instruction names and argument signatures come from the compiler's project-specific instruction catalog.

#### Comparisons

```events
if Player.health <= 0
if scene.score >= 100
if Player.state == "attacking"
if Player.invincible != true
```

Supported comparison operators:

```text
==
!=
<
<=
>
>=
```

#### Boolean references

```events
if Player.invincible
if global.hasSave
```

The referenced value must be known as a boolean.

#### Negation

```events
if not Player.invincible
if not Platformer.on_floor Player
if not collision Player Wall
```

The compiler maps `not` to a GDevelop inverted condition or an equivalent event structure.

#### Trigger once

Trigger-once is an ordinary catalog condition:

```events
if Player.health <= 0
if once
do scene.change "GameOver"
```

### 7.2 AND and OR

Each new `if` starts another condition group. Condition groups are joined with AND.

```events
if Player.canMove
if key Left down
or key A down
do Platformer.move_left Player
```

Meaning:

```text
Player.canMove
AND
(key Left down OR key A down)
```

The general rule is:

```events
if A
or B
or C
if D
or E
do X
```

Meaning:

```text
(A OR B OR C) AND (D OR E)
```

An `or` is invalid without a preceding `if` or `or` at the same depth and in the same condition header.

### 7.3 Actions

An action line starts with `do`.

#### Catalog action

```events
do delete Enemy
do sound.play "sounds/jump.wav"
do scene.change "GameOver"
do Platformer.jump Player
do timer.reset Player.invincibility
do create Coin x=Enemy.x y=Enemy.y
```

Named arguments use `name=value`:

```events
do create Enemy x=800 y=400 layer="Game"
do camera.shake strength=20 duration=0.4s
```

Named arguments are preferred for instructions with more than two parameters.

#### Assignment action

```events
do scene.score = 0
do scene.score += 100
do Player.health -= Enemy.damage
do Player.x += 5
do Player.animation = "Run"
```

Supported assignment operators:

```text
=
+=
-=
*=
/=
```

The target must be writable according to the project schema.

### 7.4 Unconditional standard event

An event may contain actions without conditions:

```events
do Player.angle += 1
```

It runs whenever GDevelop evaluates that event, normally once per frame.

An explicitly empty current `Standard` event is written as `event`. The same
header represents a standard event that has locals and/or child events but no
conditions or actions:

```events
@event folded=true
local placeholder:number = 0
event
```

The formatter emits `event` only when no ordinary `if` or `do` line can carry
that standard event's identity.

---

## 8. Local variables

A GDevelop local variable is declared with `local` and belongs to one event.

```events
local damage = 10
local soundName = "sounds/hurt.wav"
if collision Player Enemy
do Player.health -= local.damage
do sound.play local.soundName
```

References use the explicit `local.` namespace.

### 8.1 Scope

A local variable is:

1. Initialized when its owning event begins evaluation.
2. Available to the event's conditions, actions, and sub-events.
3. Unavailable to sibling events.
4. Reinitialized the next time the event is evaluated.

For a loop event, local variables are initialized once before the loop starts and remain available throughout its iterations and descendants.

```events
local spacing = 50
repeat 5 index=i
> do create Coin x=100+i*local.spacing y=200
```

### 8.2 Declaration position

For a standard event or loop, all local declarations appear before the event header:

```events
local threshold = 30
if Player.health < local.threshold
do Player.animation = "Hurt"
```

This is invalid:

```text
if Player.health < 30
local threshold = 30
```

For an `else` branch, declarations appear immediately after `else` or `else if` and before branch conditions or actions:

```events
if global.hasSave
do save.load
else
local startingScore = 0
do scene.score = local.startingScore
```

### 8.3 Types and initial values

The compiler infers a local variable's type from its initializer or validates it against imported GDevelop variable metadata.

```events
local count = 0
local title = "Inventory"
local active = true
local items = []
local data = {}
```

Array and structure literals are permitted in local declarations. Complex literals are serialized into GDevelop variable data rather than treated as ordinary GDevelop expression text.

#### Exact variable form

Simple literals are canonical when every nested variable node uses default
metadata. The typed `var(...)` initializer represents the complete current
variable serializer when metadata or an otherwise ambiguous type must be
preserved:

```events
local state = var(type="enum", value="idle", values=["idle", "run"], persistentUuid="...", folded=false, hasMixedValues=false)
local data = var(type="structure", children={
  health: var(type="number", value=100, persistentUuid="...", folded=false),
  inventory: var(type="array", children=[
    var(type="string", value="Sword", persistentUuid="...", folded=false)
  ], persistentUuid="...", folded=true)
}, persistentUuid="...", folded=false)
```

The closed `type` set is `string`, `enum`, `number`, `boolean`, `structure`,
`array`, and `mixed`. `value` is required for primitive types; `values` is
allowed only for `enum`; and recursive `children` is required for `structure`
and `array`. `persistentUuid`, `folded`, and `hasMixedValues` map directly to
the current serializer fields. The shorter declaration suffix `uuid="..."`
is an authoring alias for a root node's `persistentUuid`.

The exact form is typed DSL, not JSON. Unknown arguments, invalid field/type
combinations, duplicate structure child names, and non-variable child values
are errors.

### 8.4 Local-variable rules

- A declaration requires an initializer.
- A local name must be unique in its owning event.
- The AI profile forbids shadowing an ancestor local or loop alias.
- Local declarations cannot be attached to comments, groups, links, or JavaScript events.
- A local variable may contain numbers, strings, booleans, structures, or arrays supported by GDevelop.

---

## 9. Event boundaries and sub-events

### 9.1 Event boundaries

At one depth, a runtime event may begin with:

```text
local
if
do
for each
for each child
repeat
while
link
@js
```

Consecutive `local` lines form the prelude of the next standard event or loop.

For a standard event:

1. Local declarations come first.
2. Conditions come before actions.
3. Actions come before sub-events.
4. An optional else chain follows the event.

A conditional event must contain at least one action or sub-event.

A parent event may contain only conditions and sub-events:

```events
if Player.health > 0

> if key Space pressed
> if Platformer.on_floor Player
> do Platformer.jump Player
```

A parent action after its first child event is invalid.

### 9.2 Sub-events

Each leading `>` increases event depth by one.

```events
if collision Player Enemy
do Player.health -= 10

> if Player.health <= 0
> do scene.change "GameOver"
```

A second level uses `>>`:

```events
if collision Player Chest
do Chest.animation = "Open"

> if Player.hasKey
> do Player.coins += 100

>> if Player.coins >= 1000
>> do scene.change "Victory"
```

### 9.3 Depth rules

1. Every DSL line belonging to a nested event repeats its depth prefix.
2. A child increases depth by exactly one.
3. Depth cannot jump from `>` directly to `>>>`.
4. A dedent closes the current child block.
5. Spaces after the prefix do not affect depth.
6. The recommended maximum AI-generated depth is three levels.
7. Raw lines inside an `@js` block are exempt; only the `@js` and `@end js` lines carry DSL depth.

### 9.4 Execution order

For a standard event:

1. Local variables initialize.
2. Conditions evaluate.
3. Actions execute in source order.
4. Sub-events execute in source order.

Sub-events inherit the parent event's condition context, local variables, and picked object instances.

---

## 10. Else and else-if

### 10.1 Else

```events
if Player.health > 0
do Player.animation = "Alive"
else
do Player.animation = "Dead"
```

### 10.2 Else-if

```events
if Player.health <= 0
do Player.animation = "Dead"
else if Player.health < 30
do Player.animation = "Hurt"
else
do Player.animation = "Idle"
```

### 10.3 OR and additional conditions in else-if

```events
if Player.health <= 0
do Player.animation = "Dead"
else if Player.health < 30
or Player.poisoned
if Player.invincible == false
do Player.animation = "Hurt"
else
do Player.animation = "Idle"
```

### 10.4 Branch-local variables

```events
if global.hasSave
do save.load
else
local defaultScore = 0
do scene.score = local.defaultScore
```

When a branch-local value must be used by a condition, place a child standard event inside the branch. The child inherits the branch local:

```events
if Player.health <= 0
do Player.animation = "Dead"
else
local hurtThreshold = 30

> if Player.health < local.hurtThreshold
> do Player.animation = "Hurt"
> else
> do Player.animation = "Idle"
```

### 10.5 Nested else

Depth identifies the matching branch:

```events
if Player.health > 0

> if Player.health < 20
> do Player.animation = "Hurt"
> else
> do Player.animation = "Normal"

else
do Player.animation = "Dead"
```

### 10.6 Else rules

- Canonical IfDo places `else` immediately after its matching event.
- A parser may ignore intervening comment events for GDevelop compatibility.
- `else` must use the same depth as its matching event.
- A final `else` may appear only once in a branch chain.
- An else branch must contain an action or sub-event.
- `else` does not attach directly to a loop, group, comment, link, or JavaScript event.
- An orphan `else` is rejected by the AI profile rather than treated as a standard event.

---

## 11. Event groups

Groups organize events but do not change runtime semantics.

```events
@group "Combat"

if collision Bullet Enemy
do Enemy.health -= Bullet.damage
do delete Bullet

if Enemy.health <= 0
do delete Enemy
do scene.score += 100

@end group
```

A group name is always a quoted string on the same `@group` statement as its
metadata:

```events
@group "Player Damage" source="" creationTime=0 color=[74,176,228] parameters=[]
@end group
```

### Group rules

1. `@group` and its matching `@end group` appear at the same event depth.
2. Groups cannot be nested in the canonical AI profile.
3. A group may be empty.
4. Groups preserve contained event order.
5. Groups do not create local-variable or object-picking scopes.
6. The compiler maps a group to a GDevelop event-group node.

---

## 12. Loop events

Loop headers are parent event nodes. Their bodies are written one depth level deeper.

All loop types support optional event-local declarations placed before the loop header. Loop aliases and counters are visible only in the loop subtree.

### 12.1 For each object

```events
for each Enemy
> do Enemy.x += 1
```

With a child condition:

```events
for each Enemy
> if Enemy.health <= 0
> do delete Enemy
```

An object group may be used:

```events
for each Enemies
> do Enemies.move_toward Player speed=80
```

Optional loop counter:

```events
for each Enemy index=i
> do Enemy.spawnOrder = i
```

The counter starts at `0` and increments once per processed object instance.

The current For Each event also supports sorting and limiting:

```events
for each Enemy index=i order_by=Enemy.health order=desc limit=10
> do Enemy.rank = i
```

`order` is `asc` or `desc`. The current serializer writes `limit` only with
`orderBy`; the compiler rejects a limit without sorting rather than emitting a
shape the current writer cannot preserve.

### 12.2 For each child variable

Use `for each child` to iterate through a structure or array variable:

```events
for each child scene.inventory as item
> do DebugText.text = item.name + ": " + item.value
```

The required alias exposes three read-only loop fields:

```text
item.value   current child value
item.name    current child name or array key as text
item.index   zero-based loop counter
```

Example with child structures:

```events
for each child scene.spawnPoints as point
> do create Enemy x=scene.spawnPoints[point.name].x y=scene.spawnPoints[point.name].y
```

Using the source path with `point.name` remains valid even when the current child is itself a structure or array.

Example updating the original structure explicitly:

```events
for each child scene.inventory as item
> do scene.inventory[item.name] = item.value + 1
```

`item.value` is the value supplied to the loop binding. Assigning to it does not implicitly write back to the source variable; use indexed assignment to update the source.

The compiler lowers the alias fields into collision-proof GDevelop local/output variables required by the For Each Child Variable event.

### 12.3 Repeat

```events
repeat 5
> do create Coin x=100 y=200
```

Optional loop counter:

```events
repeat 5 index=i
> do create Coin x=100+i*50 y=200
```

For `repeat 5 index=i`, `i` receives:

```text
0, 1, 2, 3, 4
```

The repeat count must evaluate to a non-negative integer.

### 12.4 While

A while event repeats without interruption while all of its condition groups remain true.

```events
while scene.queueSize > 0 limit=1000
> do scene.queueSize -= 1
```

An `or` directly after the header extends the first condition group:

```events
while scene.queueSize > 0 limit=1000
or scene.forceDrain
> do scene.queueSize = max(0, scene.queueSize - 1)
```

Additional `if` groups are joined with AND:

```events
while scene.running limit=1000 index=i
if scene.queueSize > 0
or scene.forceDrain
> do scene.queueSize = max(0, scene.queueSize - 1)
```

Meaning:

```text
scene.running
AND
(scene.queueSize > 0 OR scene.forceDrain)
```

The canonical profile also represents the full range accepted by the current
event serializer. A bare `while` preserves an empty
`whileConditions` array, and each immediately following `and while` preserves
another sibling entry in that array, in source order:

```events
@while
while index="i"

@while
while FirstCondition
and while SecondCondition
if AdditionalBodyCondition
```

`and while` is reserved for exact round-trip fidelity. It must immediately
follow the `while` header or another `and while`, before ordinary same-depth
`if`, `do`, or child-event statements. It is not an `or` alternative: every
sibling instruction remains a distinct ordered `whileConditions` element.

Optional counter:

```events
while scene.queueSize > 0 limit=100 index=i
> do DebugText.text = "Iteration " + i
> do scene.queueSize -= 1
```

#### While safety limit

`limit=N` is an IfDo safety guard. The compiler lowers it into an additional counter check when necessary.

- It is optional in the full language for exact GDevelop round-tripping.
- It is required by the `ifdo-ai` profile.
- It must be a positive integer or a compiler-proven positive integer expression.

A while body should visibly change data involved in the loop condition. The validator should warn when progress cannot be established.

The context-free core requires `options.lowerWhileLimit` for this source-only
feature. The project-aware callback receives the parsed while event and limit
expression and must return a fully lowered, serializer-valid while event. This
keeps instruction identifiers and generated counter details in the loaded
project/catalog adapter rather than hardcoding them in the syntax parser.

### 12.5 Loop-local variables

```events
local total = 0
for each child scene.rewards as reward
> do local.total += reward.value
> do scene.rewardTotal = local.total
```

After the final iteration, `scene.rewardTotal` contains the accumulated total.

The local is initialized once before the loop, not once per iteration.

### 12.6 Nested loops

```events
for each Enemy index=enemyIndex
> repeat 3 index=sparkIndex
>> do create Spark x=Enemy.x+sparkIndex*4 y=Enemy.y
```

### 12.7 Loop rules

- A loop requires at least one body event or body action.
- Its body must be exactly one depth level deeper.
- Counter and child aliases are read-only.
- Alias names must be unique in the visible lexical scope.
- `else` cannot attach directly to a loop.
- The AI profile rejects unbounded `while` events.
- The source of `for each child` must be a structure or array variable path.

---

## 13. Link events

A link event inserts the events of another event sheet at its source position.

Link an external event sheet:

```events
link external "Shared Combat"
```

Link another scene's event sheet:

```events
link scene "Base Level"
```

The canonical round-trip form is untyped because current link JSON stores only a
target name:

```events
link "Shared Combat"
link "Shared Combat" group="Damage"
link "Shared Combat" range=2..8
```

A link may be a sub-event:

```events
if Player.active
> link external "Player Logic"
```

### Link rules

- The target must exist in the project context.
- The target kind must match `external` or `scene`.
- A link is a leaf event and has no actions, locals, or child events in IfDo.
- Source order determines where linked events are inserted.
- The compiler must detect direct and indirect link cycles.
- The target event sheet must be compatible with the objects, variables, and behaviors available to the destination scene.

---

## 14. JavaScript code events

A JavaScript event is a first-class typed event whose body is JavaScript source.

```events
@js
const score = runtimeScene.getVariables().get("Score");
score.setNumber(score.getAsNumber() + 1);
@end js
```

`runtimeScene` is available to the JavaScript body.

### 14.1 Passing picked objects

Use `objects=<ObjectOrGroup>` to pass the selected instances of one object or object group as the `objects` array:

```events
if collision Player Enemy

> @js objects=Enemy
  objects.forEach(enemy => {
    enemy.setOpacity(128);
  });
> @end js
```

The `@js` header and `@end js` terminator carry the DSL depth. Lines between
them are preserved as raw JavaScript and do not require `>` prefixes.

### 14.2 JavaScript rules

- `@end js` must occur at the same DSL depth as the opening `@js` line.
- When a raw body contains a line that would be mistaken for `@end js` at the
  opening depth, the canonical decompiler selects a deterministic delimiter:

  ```events
  @js delimiter="IFDO_1"
  const source = `
  @end js
  `;
  @end js IFDO_1
  ```

  `delimiter=` is round-trip syntax only and is not persisted in event JSON.
  Its value contains letters, digits, and underscores. The matching
  `@end js <delimiter>` line is the only terminator for that body.

- A JavaScript event is a leaf event.
- `@comment`-looking or hash-prefixed text inside the raw body is JavaScript
  text, not an IfDo statement.
- The compiler preserves the JavaScript body and line endings, except for optional canonical newline normalization.
- At most one object or object group is passed through `objects=` in version 2.0.
- Additional objects can be obtained through `runtimeScene` APIs.
- The project validator checks the `objects=` symbol but does not claim to prove JavaScript behavior.
- The `ifdo-ai` profile disables JavaScript unless the caller explicitly sets `allowJavaScript=true`.
- Models should prefer catalog conditions and actions over JavaScript whenever an equivalent instruction exists.

---

## 15. Variables, aliases, and namespaces

IfDo uses explicit prefixes for persistent project scopes:

```text
scene.<variable>
global.<variable>
local.<variable>
<Object>.<variable-or-property>
```

Behavior and instruction namespaces remain explicit:

```events
if Platformer.on_floor Player
do Platformer.jump Player
```

Loop aliases are lexical identifiers introduced by a loop header:

```events
repeat 5 index=i
> do scene.lastIndex = i

for each child scene.inventory as item
> do DebugText.text = item.name
```

The project schema determines whether a path denotes:

- A scene variable.
- A global variable.
- A local variable.
- An object variable.
- A built-in object property.
- A behavior property.
- A structure child.
- An array element.
- A read-only expression.
- A writable target.

The compiler rejects ambiguous or unknown paths rather than guessing.

Unqualified project variables such as `score` are not allowed in the canonical AI profile.

Inside a function file, parameter names are direct read-only symbols and `result` is a reserved writable symbol for returning values:

```text
target
amount
result
```

Extension-owned state may be exposed by the compiler as:

```text
extension.global.<variable>
extension.scene.<variable>
```

---

## 16. Expressions

Expressions may appear in comparisons, assignments, named arguments, local initializers, loop counts, and while guards.

### 16.1 Literals

```text
123
-4.5
true
false
"text"
250ms
1s
90deg
[]
{}
```

Array and structure literals with values are permitted in local declarations:

```events
local numbers = [1, 2, 3]
local stats = {health: 100, name: "Slime"}
```

### 16.2 References

```text
scene.score
global.highScore
local.damage
Player.health
Enemy.x
item.value
scene.inventory[item.name]
```

### 16.3 Arithmetic

```events
do scene.score += Enemy.value * 2
do Player.x = Enemy.x + 16
do Player.health = max(0, Player.health - Enemy.damage)
```

Supported arithmetic operators:

```text
+
-
*
/
%
```

Standard precedence:

1. Parentheses, indexing, and function calls.
2. Unary `-`.
3. `*`, `/`, `%`.
4. `+`, `-`.
5. Comparisons.

### 16.4 Catalog expression calls

Built-in and extension expression calls must come from the compiler catalog:

```text
min(a, b)
max(a, b)
abs(value)
random(min, max)
distance(x1, y1, x2, y2)
```

A model may use only functions listed for the current project and GDevelop version.

---

## 17. Function files

A function uses a pure `.events` body written with the same event syntax as
every other sheet. Its `.settings` owner supplies the signature and target,
keeping reusable logic inside one language without mixing TOML configuration
into DSL source.

One file defines exactly one function. The canonical path is recorded by the
owner manifest:

```text
extensions/Combat/functions/Damage/function.settings
extensions/Combat/functions/Damage/Damage.events
extensions/Combat/prefabs/Enemy/functions/Combat/TakeDamage/function.settings
extensions/Combat/prefabs/Enemy/functions/Combat/TakeDamage/TakeDamage.events
extensions/Combat/behaviors/Health/functions/Recovery/Heal/function.settings
extensions/Combat/behaviors/Health/functions/Recovery/Heal/Heal.events
```

In the canonical project profile, every `.events` body begins directly with
event statements. Its sibling `function.settings` supplies the complete
extension, prefab, or behavior function declaration.

### 17.1 Standalone function-header shorthand

Outside a multi-file project, an API without a `.settings` target may accept:

```events
function <kind> <Extension>.<Name> <parameter>:<type> ...
```

Supported core kinds are:

| Kind               | Used as                                                         | Result type      |
| ------------------ | --------------------------------------------------------------- | ---------------- |
| `action`           | A `do` instruction                                              | No result        |
| `condition`        | An `if` condition                                               | Boolean          |
| `number`           | A numeric expression                                            | Number           |
| `text`             | A text expression                                               | Text             |
| `number-condition` | A numeric expression also exposed through relational conditions | Number           |
| `text-condition`   | A text expression also exposed through relational conditions    | Text             |
| `operator-action`  | A setter/action paired to a getter                              | No direct result |
| `lifecycle`        | An engine-called extension hook                                 | No result        |

These map to the current `Action`, `Condition`, `Expression`,
`ExpressionAndCondition`, and `ActionWithOperator` serializer values as
specified in section 34. `lifecycle` is a checked alias for a specially named
`Action`, not a distinct stored function type. `async=true` is TOML settings
metadata rather than a separate result kind.

Examples:

The following `function ...` lines are standalone shorthand illustrations of
the signatures that normally live in TOML settings. Omit those lines from all
project-owned `.events` files.

```events
function action Combat.Damage target:object amount:number
```

```events
function condition Combat.IsDead target:object
```

```events
function number Combat.DamageForLevel level:number base:number
```

```events
function text UI.HealthLabel health:number maximum:number
```

An extension-level qualified name has two semantic parts:

```text
ExtensionName.FunctionName
```

Prefab and behavior methods use three readable parts and are checked against
their owner settings:

```text
ExtensionName.PrefabName.FunctionName
ExtensionName.BehaviorName.FunctionName
```

All parts use normal identifier rules. Owner settings, not path spelling
alone, determine whether the middle part is a prefab or a behavior.

### 17.2 Parameters

A parameter is declared in TOML function/owner settings. The optional
standalone header shorthand writes it as:

```text
name:type
```

Core portable parameter types are:

```text
object
number
text
boolean
```

The compiler catalog may expose additional typed parameters without changing the grammar, for example:

```text
behavior(target)
scenevar
identifier
key
mousebutton
color
layer
scene
point(target)
animation(target)
resource.image
resource.audio
resource.json
resource.font
resource.bitmapfont
```

A behavior parameter names its associated object parameter:

```events
function action Movement.Stop target:object mover:behavior(target)
```

Parameters are read-only. Their names are referenced directly in the function body:

```events
function action Combat.Damage target:object amount:number

do target.health -= amount
```

An object parameter behaves as an object alias and carries the picked instances passed by the caller. A value parameter behaves as a typed read-only expression.

Compact-header default syntax, variadic parameters, overloaded function names,
and positional custom-function calls are not part of version 2.0. Existing
optional/default parameter metadata is preserved losslessly in the owning
function settings entry.

### 17.3 Action functions

Definition:

```events
function action Combat.Damage target:object amount:number

if target.health > 0
do target.health -= amount

> if target.health <= 0
> do delete target
```

Call:

```events
if collision Player Enemy
do Combat.Damage target=Player amount=Enemy.damage
```

An action function is valid only after `do`.

### 17.4 Condition functions

A condition function writes a Boolean to the reserved target `result`:

```events
function condition Combat.IsDead target:object

do result = false

if target.health <= 0
do result = true
```

Call:

```events
if Combat.IsDead target=Player
do scene.change "GameOver"
```

Negation uses the normal condition syntax:

```events
if not Inventory.HasItem itemName="Key" quantity=1
do sound.play "locked.wav"
```

### 17.5 Number expression functions

```events
function number Combat.DamageForLevel level:number base:number

do result = base + level * 2
```

Expression functions use parentheses and comma-separated named arguments:

```events
do Enemy.health -= Combat.DamageForLevel(level=Player.level, base=10)
```

A numeric function may read and update a numeric `result`:

```events
function number Math.ApplyBonuses base:number critical:boolean boosted:boolean

do result = base

if critical
do result *= 2

if boosted
do result *= 1.5
```

### 17.6 Text expression functions

```events
function text UI.HealthLabel health:number maximum:number

do result = "HP: " + text(health) + "/" + text(maximum)
```

Call:

```events
do HealthText.text = UI.HealthLabel(health=Player.health, maximum=Player.maxHealth)
```

### 17.7 Result semantics

`result` is a reserved writable target available only in `condition`, `number`, and `text` functions.

```events
do result = true
do result = 42
do result = "Ready"
```

The required type is determined by the function kind:

| Function kind | Valid `result` value |
| ------------- | -------------------- |
| `condition`   | Boolean              |
| `number`      | Number               |
| `text`        | Text                 |

Assigning `result` sets the current return value; it does not immediately stop
function execution. A later event may replace it. There is no separate
early-return statement in version 2.0.

The `ifdo-ai` profile requires an unconditional initial result before any conditional result assignment:

```events
do result = false
```

```events
do result = 0
```

```events
do result = ""
```

This makes every execution path deterministic. Writing `result` in an `action` or `lifecycle` function is an error.

### 17.8 Function locals, loops, groups, and sub-events

Normal event constructs remain valid in a function body:

```events
function action Effects.SpawnCoins source:object count:number

local spacing = 12
repeat count index=i
> do create Coin x=source.x+i*local.spacing y=source.y
```

```events
function action Combat.DamageAll targets:object amount:number

for each targets
> if targets.health > 0
> do targets.health -= amount

>> if targets.health <= 0
>> do delete targets
```

Comments, event groups, local variables, standard events, sub-events, else branches, For Each Object, For Each Child Variable, Repeat, While, JavaScript, and calls to other functions are available when valid for the target compiler.

### 17.9 Calling convention

Custom functions always use named arguments.

Action call:

```events
do Combat.Damage target=Enemy amount=25
```

Condition call:

```events
if Combat.IsDead target=Enemy
do delete Enemy
```

Expression call:

```events
do scene.damage = Combat.DamageForLevel(level=Player.level, base=10)
```

Action and condition calls omit parentheses to match ordinary catalog instructions. Expression calls require parentheses because they can be nested inside larger expressions.

For action and condition calls, a named argument continues until the next top-level `name=` token or the end of the line. Parenthesized expression calls therefore remain unambiguous:

```events
do Combat.Damage target=Player amount=Combat.DamageForLevel(level=Enemy.level, base=10) canKill=true
```

The compiler validates missing, duplicate, unknown, and incorrectly typed arguments before emitting GDevelop data.

### 17.10 Function scope and portability

Function parameters are the primary interface to the caller.

Rules:

1. Value parameters are read-only.
2. Object parameters are the only portable way to reference caller objects.
3. Direct scene-object names are rejected in the portable function profile unless they are object parameters.
4. `local.` variables remain event-local as elsewhere in the language.
5. Extension-owned variables may be exposed by the compiler as `extension.global.<name>` and `extension.scene.<name>`.
6. Project-specific access to `scene.` or `global.` variables is allowed only when the function target explicitly enables it.
7. Event links are not allowed inside function files.
8. Raw JavaScript follows the same opt-in policy as event sheets.
9. A function may call another function.
10. Recursion is available only when the compiler enables it; the `ifdo-ai` profile disables recursion by default.

Invalid portable function:

```events
function action Combat.Heal target:object amount:number

do Player.health += amount
```

Correct:

```events
function action Combat.Heal target:object amount:number

do target.health += amount
```

### 17.11 Lifecycle functions

A compiler targeting GDevelop versions that expose extension lifecycle hooks may use:

```events
function lifecycle Analytics.onScenePreEvents

do Analytics.Update
```

A lifecycle function:

- Uses a compiler-listed lifecycle name.
- Has no user-defined result.
- Has no ordinary call site; the engine invokes it.
- Has no user-defined parameters unless the target registry explicitly permits them.
- Is rejected when the target GDevelop version does not expose the requested hook.

Lifecycle functions are part of the full profile but should be generated by AI only when the available lifecycle names are included in the prompt catalog.

### 17.12 Function-file rules

- A project-owned function file contains only its event body; it has no front
  matter and no `function` header.
- The compiler receives function identity, owner, signature, result type, and
  flags from the sibling `function.settings`.
- A standalone `function` header is accepted only when the compiler API has no
  settings target and explicitly enables the shorthand.
- A function header is invalid in the canonical multi-file project profile and
  in scene/external-event targets.
- The canonical extension-function path is
  `functions/<Function>/<Function>.events`, beside `function.settings`.
- Canonical prefab/behavior function paths are
  `functions/<Function>/<Function>.events`, beside their dedicated
  `function.settings`; grouping is its `folder` property.
- The function becomes an ordinary catalog action, condition, or expression after its signature is registered.
- Cyclic calls are reported; recursive cycles are rejected by the AI profile unless explicitly enabled.

---

## 18. Instruction catalog

The grammar defines event structure. The instruction catalog defines which conditions, actions, and expressions are valid.

A compiler-generated catalog may look like:

```text
CONDITIONS
SceneJustBegins
CollisionNP first_object=<object> second_object=<object>
KeyFromTextJustPressed key=<string-expression>
CompareTimer timer=<timer-reference> comparison_sign=<operator> value=<duration>

ACTIONS
Delete object=<object>
Create object_to_create=<object> x_position=<expression> y_position=<expression> [layer=<string>]
PlaySound audio_file_or_audio_resource_name=<resource>
Scene name_of_the_new_scene=<scene>
ResetTimer timer_name=<timer-reference>

EXPRESSIONS
min(number, number) -> number
max(number, number) -> number
random(number, number) -> number
```

The catalog is generated from:

- The loaded GDevelop version.
- Installed extensions.
- Project objects and object groups.
- Attached behaviors.
- Scene, global, local, and object variables.
- Resources.
- Scene names.
- External event-sheet names.
- Function signatures registered from TOML settings.

### 18.1 Canonical names

Each instruction has exactly one DSL spelling: its registered catalog `type`.

Use:

```events
if CollisionNP first_object="Player" second_object="Enemy"
```

Do not accept prose synonyms such as:

```text
if Player hits Enemy
if Player touches Enemy
if Player overlaps Enemy
```

The parser, formatter, and AI profile use only catalog types; there is no
hardcoded human-input alias table.

### 18.2 Named parameters

The registry stores parameter names and types even when GDevelop JSON stores a positional parameter array.

The model writes:

```events
do AdvancedCamera::ShakeCamera strength=20 duration=0.4
```

The compiler writes the exact parameter order expected by GDevelop.

### 18.3 Semantic catalog instruction form

Every instruction uses its catalog type directly, without a marker prefix:

```events
do AdvancedCamera::ShakeCamera duration=0.4 amplitude=20 layer="" camera=0
```

In the multi-file project profile, the authoritative named signatures are
generated at `.gdevelop/instructions-catalog.json` on every project save. The
persisted form uses each catalog parameter's exact `dslName` and semantic
`valueKind`:

```events
do AdvancedCamera::ShakeCamera duration=0.4 amplitude=20 layer="" camera=0
do DebuggerTools::ConsoleLog message_to_log="Camera ready"
do DebuggerTools::ConsoleLog message_to_log=expr("Zoom: " + ToString(CameraZoom()))
```

Direct strings represent semantic text and names. Numbers and booleans are
unquoted literals. A calculated text or number value uses `expr(...)`; the
compiler validates and lowers it according to the catalog parameter.
New instructions supply every required argument. When an imported instruction
has a blank stored slot, its named argument is omitted and the compiler
reconstructs that blank position. Multiline expression formatting removes
insignificant line-edge whitespace outside string literals while preserving
string content.

Every generated `dslName` obeys the normal identifier grammar. After ordinary
normalization, a parameter name beginning with a digit is prefixed with
`parameter_`; for example, the displayed name `3D capability` becomes
`parameter_3d_capability`. The formatter and parser use this same deterministic
name so generated DSL always recompiles.

The generated artifact has `formatVersion: 2` and is deliberately lean and
line-oriented. Each action, condition, or expression occupies one compact JSON
line and contains only project-specific authoring data. Every non-code-only
parameter declares one of `text`, `number`, `boolean`, `object`, `behavior`,
`variable`, `resource`, or `name` as its `valueKind`; defaults use the same
semantic type. The catalog contains no prose encoding guide. Editor UI metadata
and fields derivable from structure or the parameter list are not stored.
Editor-hidden instructions (which the events editor labels `[DEPRECATED]`),
instructions carrying a deprecation message, and expressions hidden or marked
deprecated are excluded so an AI cannot select APIs that the editor warns
against.

Lossless conversion is separate from AI authoring. The editor also generates
`.gdevelop/deprecated-instructions-catalog.json` alongside the normal catalog.
It contains only valid deprecated or hidden compatibility instructions needed
to round-trip existing or imported projects, including inferred semantic
signatures for removed instructions still used by the imported source. The
compiler and formatter merge both catalogs in memory when saving and loading
project sources. AI models may
consult the deprecated catalog only to understand a legacy project or make a
targeted edit to a deprecated instruction already present. They must never use
it to construct new events or introduce another deprecated instruction; all
new event logic must come from `.gdevelop/instructions-catalog.json`.

Rules:

- The instruction must exist in the catalog.
- Write ordinary instruction types as bare tokens. If an exact catalog type
  contains whitespace, write the type as a JSON string (for example,
  `do "Physics2::Remove joint" ...`); the decoded string is the instruction
  type and is not an alias.
- Named arguments are required.
- The model may not invent an instruction type.
- Catalog instruction types never use an `@` prefix; `@` is reserved for
  structural metadata directives such as `@event` and `@instruction`.
- Every argument is type-checked by `valueKind`.
- Direct text and name/reference values use strings, numbers and booleans use
  their native literals, and calculated text or number values use `expr(...)`.
- Code-only parameters are omitted and synthesized by the compiler.
- Blank stored parameter positions are omitted from migrated named source and
  reconstructed as blank positions by the compiler.

`@instruction` remains the closed metadata annotation for the following
instruction. It does not accept arbitrary JSON.

---

## 19. Runtime semantics

### 19.1 Object picking

IfDo follows GDevelop-style object-picking behavior:

1. Conditions select object instances.
2. Actions in the same event operate on those selected instances.
3. Sub-events inherit selected instances from their parent.
4. Sibling events begin with a fresh selection context.
5. `for each Object` selects one instance per iteration.

```events
if Enemy.health <= 0
do create Coin x=Enemy.x y=Enemy.y
do delete Enemy
```

Only enemies satisfying the condition are used by the actions.

### 19.2 OR picking

An OR condition group must be lowered through GDevelop's native OR representation or an equivalent structure that preserves selection and execution count.

```events
if collision Player Enemy
or collision Player Projectile
do Player.health -= 10
```

The compiler must not split this into unrelated events if doing so would change picking semantics.

### 19.3 Sub-event inheritance

```events
if collision Player Enemy
do Player.health -= Enemy.damage

> if Enemy.boss
> do scene.bossHits += 1
```

The child receives the selected `Player` and `Enemy` instances.

### 19.4 Local-variable lifetime

Event locals initialize before their event conditions. Loop locals initialize once before iteration. Descendants inherit them; siblings do not.

### 19.5 Actions before children

```events
if collision Player Enemy
do Player.health -= 10

> if Player.health <= 0
> do scene.change "GameOver"
```

The child sees the updated health value.

### 19.6 Else selection

An else branch runs when its matching event does not run. It does not inherit picks from a failed branch, although it retains picks and locals inherited from an outer parent event.

### 19.7 Loop execution

- `for each` evaluates its body once per selected instance.
- `for each child` evaluates its body once per child variable.
- `repeat` evaluates its body the requested number of times before continuing.
- `while` evaluates repeatedly without allowing following sibling events to run until the loop ends.

### 19.8 Links

A link acts as if the target events were inserted at the link's position, subject to GDevelop's link semantics and project compatibility checks.

### 19.9 JavaScript

A JavaScript event executes when event evaluation reaches it. When nested, it receives the parent picking context for the object or group selected with `objects=`.

### 19.10 Groups and comments

Groups and comments preserve source order but do not create runtime, local-variable, or object-selection scopes.

### 19.11 Function calls

- An action function executes its event body at the call position.
- A condition function executes its body and supplies its Boolean `result` to the calling condition.
- A number or text function executes its body during expression evaluation and supplies its typed `result`.
- Object arguments pass the caller's current picked instances into the corresponding object parameter.
- Function-internal picking follows the same condition, action, loop, and sub-event rules as ordinary event sheets.
- Parameter bindings and `result` are private to each invocation.

---

## 20. Parsing model

The parser operates in five stages.

### Stage 0: Resolve the settings target

The project manifest and owning `.settings` file declare whether the pure DSL
source is a scene sheet, external sheet, extension function, prefab method, or
behavior method. Standalone APIs may explicitly enable the optional
`function`-header shorthand instead.

### Stage 1: Recognize JavaScript bodies

When an `@js` header is found, the parser stores every following physical line
as raw code until the matching `@end js` (and optional delimiter) at the same
DSL depth.

No IfDo tokenization occurs inside the raw body.

### Stage 2: Build depth blocks

For every non-raw line:

1. Count leading `>` event-depth characters.
2. Count optional leading `?` instruction-depth characters after event depth.
3. Ignore spaces immediately after the prefixes.
4. Store the remaining statement at both depths.
5. Reject a depth increase greater than one in either hierarchy.

Groups are lexical containers delimited by `@group "name"` and `@end group`.

### Stage 3: Parse statements

At a given depth:

- `@comment "text" ...` creates a comment event and owns its event and color metadata.
- `local` adds a declaration to the next event or current else branch.
- `if` starts a standard event or adds an AND condition before actions begin.
- `or` extends the current condition group.
- `do` adds an action.
- `event` creates an explicit empty standard event after any pending locals or
  metadata.
- `else if` starts another branch.
- `else` starts the final fallback branch.
- `for each` starts an object loop.
- `for each child` starts a child-variable loop.
- `repeat` starts a fixed-count loop.
- `while` starts a while loop.
- `and while` appends an exact sibling to the current while event's
  `whileConditions` list.
- `link` creates a link event.
- `@js` creates a JavaScript event.
- `@group "name" ...` starts an event group and owns its event metadata.
- `@end group` closes an event group; `@end js` closes JavaScript raw text.
- Every `@end` requires its block-kind suffix. Bare `@end` is invalid.
- `function` is valid only as an explicitly enabled standalone shorthand and
  never in a canonical project file or nested statement.
- `@event`, `@instruction`, and `@while` attach typed round-trip metadata to
  the next compatible construct. `@comment`, `@group`, and `@js` are complete
  event statements rather than pending annotations; their `disabled`,
  `folded`, and `aiGeneratedEventId` fields belong directly on the same
  statement. The parser still accepts a legacy `@event` annotation before
  `@js`, but canonical serialization consolidates it onto `@js`.

### Stage 4: Bind metadata and validate owners

Owner settings, manifests, optional standalone function headers, annotations,
and parsed event nodes are cross-checked before project-aware semantic
compilation.

---

## 21. Simplified grammar

The following EBNF describes logical blocks after raw JavaScript extraction and depth processing.

```ebnf
file                = event-sheet-file ;

event-sheet-file    = event-sheet ;

standalone-function-file = function-header, newline, event-sheet ;

event-sheet         = { top-item } ;

function-header     = "function", function-kind, qualified-name,
                      { parameter } ;

function-kind       = "action" | "condition" | "number" | "text"
                    | "number-condition" | "text-condition"
                    | "operator-action"
                    | "lifecycle" ;

qualified-name      = identifier, ".", identifier,
                      [ ".", identifier ] ;

parameter           = identifier, ":", parameter-type ;

parameter-type      = type-expression ;

top-item            = metadata-annotation
                    | comment-event
                    | group
                    | node ;

group               = "@group", string, { named-argument }, newline,
                      { comment-event | node },
                      "@end", "group", newline ;

node                = { local-declaration },
                      ( standard-event
                      | foreach-object-loop
                      | foreach-child-loop
                      | repeat-loop
                      | while-loop )
                    | link-event
                    | javascript-event ;

local-declaration   = "local", identifier, [ ":", type-expression ],
                      "=", initializer, { named-argument }, newline ;

initializer         = scalar | array-literal | structure-literal
                    | exact-variable ;

exact-variable      = "var", "(", "type=", string,
                      { ",", variable-field }, ")" ;

variable-field      = "value=", scalar
                    | "values=", string-array
                    | "children=", variable-children
                    | "persistentUuid=", string
                    | "folded=", boolean
                    | "hasMixedValues=", boolean ;

variable-children   = "{", [ structure-variable,
                      { ",", structure-variable } ], "}"
                    | "[", [ exact-variable,
                      { ",", exact-variable } ], "]" ;

structure-variable  = ( identifier | string ), ":", exact-variable ;

scalar              = string | number | boolean ;

string-array        = "[", [ string, { ",", string } ], "]" ;

metadata-annotation = "@event", { named-argument }, newline
                    | "@instruction", { named-argument }, newline
                    | "@while", { named-argument }, newline ;

standard-event      = conditional-event
                    | unconditional-event
                    | empty-standard-event ;

conditional-event   = condition-group,
                      { condition-group },
                      { action },
                      { child-item },
                      [ else-chain ] ;

unconditional-event = action,
                      { action },
                      { child-item } ;

empty-standard-event = "event", newline, { child-item } ;

condition-group     = "if", condition, newline,
                      { "or", condition, newline } ;

else-chain          = { else-if-branch },
                      [ else-branch ] ;

else-if-branch      = "else", "if", condition, newline,
                      { local-declaration },
                      { "or", condition, newline },
                      { condition-group },
                      { action },
                      { child-item } ;

else-branch         = "else", newline,
                      { local-declaration },
                      { condition-group },
                      { action },
                      { child-item } ;

action              = "do", [ "await" ], action-expression, newline ;

foreach-object-loop = "for", "each", object-reference,
                      [ "index=", identifier ],
                      [ "order_by=", expression ],
                      [ "order=", ( "asc" | "desc" ) ],
                      [ "limit=", expression ], newline,
                      { condition-group }, { action },
                      { child-item } ;

foreach-child-loop  = "for", "each", "child", variable-reference,
                      ( "as", identifier
                      | "value=", identifier,
                        [ "key=", identifier ],
                        [ "index=", identifier ] ), newline,
                      { condition-group }, { action },
                      { child-item } ;

repeat-loop         = "repeat", expression,
                      [ "index=", identifier ], newline,
                      { condition-group }, { action },
                      { child-item } ;

while-loop          = "while", [ condition ],
                      [ "limit=", expression ],
                      [ "index=", identifier ], newline,
                      { "or", condition, newline },
                      { "and", "while", condition, newline },
                      { condition-group },
                      { action }, { child-item } ;

link-event          = "link", [ "external" | "scene" ], string,
                      [ "group=", string | "range=", range ], newline ;

javascript-event    = "@js", [ "objects=", object-reference ],
                      [ "strict=", boolean ],
                      [ "expanded=", boolean ],
                      [ "delimiter=", string ], newline,
                      raw-javascript,
                      "@end", "js", [ identifier ], newline ;

child-item          = item-at-parent-depth-plus-one ;

comment-event       = "@comment", string, { named-argument }, newline ;

condition           = [ "not" ], condition-expression ;
```

Structural line grammar:

```ebnf
source-line         = depth-prefix, instruction-depth-prefix,
                      statement, newline ;

depth-prefix        = { ">" }, { " " | "\t" } ;

instruction-depth-prefix = { "?" }, { " " | "\t" } ;

statement           = comment-statement
                    | local-statement
                    | event-statement
                    | group-statement
                    | end-statement
                    | if-statement
                    | or-statement
                    | do-statement
                    | else-statement
                    | foreach-statement
                    | foreach-child-statement
                    | repeat-statement
                    | while-statement
                    | link-statement
                    | javascript-header
                    | javascript-end
                    | metadata-annotation ;

comment-statement   = "@comment", string, { named-argument } ;

group-statement     = "@group", string, { named-argument } ;

end-statement       = ( "@end", "group" )
                    | ( "@end", "js", [ identifier ] ) ;

javascript-header   = "@js", { named-argument } ;

javascript-end      = "@end", "js", [ identifier ] ;

custom-action-call  = qualified-name, { named-argument } ;

custom-condition-call = qualified-name, { named-argument } ;

custom-expression-call = qualified-name, "(",
                      [ named-argument, { ",", named-argument } ], ")" ;

named-argument      = identifier, "=", expression ;

catalog-argument    = identifier, "=", semantic-operand ;

semantic-operand    = string | number | boolean
                    | "expr", "(", gdevelop-expression, ")" ;

range               = integer, "..", integer ;
```

The instruction catalog and expression parser define `condition-expression`,
`action-expression`, and ordinary expressions. Catalog instruction arguments
use `catalog-argument`; structural metadata continues to use
`named-argument`.

---

## 22. Compiler architecture

```text
`.events` source
    ↓
Settings-target resolver (project profile) or optional standalone-header scanner
    ↓
Raw JavaScript block scanner
    ↓
Tokenizer and depth parser
    ↓
IfDo AST
    ↓
Project-aware semantic validation
    ↓
Canonical semantic event IR
    ↓
GDevelop instruction registry resolution
    ↓
GDevelop event-sheet JSON or extension-function JSON
```

### 22.1 Event-type mapping

| IfDo construct                                         | Semantic GDevelop event kind                     |
| ------------------------------------------------------ | ------------------------------------------------ |
| `if` / `or` / `do`                                     | Standard event                                   |
| `else`                                                 | Else event                                       |
| `>`                                                    | Child event in the parent event's event list     |
| `@comment "text" ...`                                  | Comment event                                    |
| `@group "name"` ... `@end group`                       | Event group                                      |
| `for each Object`                                      | For Each Object event                            |
| `for each child`                                       | For Each Child Variable event                    |
| `repeat`                                               | Repeat event                                     |
| `while`                                                | While event                                      |
| `link external` / `link scene`                         | Link event                                       |
| `@js` ... `@end js`                                    | JavaScript event                                 |
| `local`                                                | Local-variable data attached to the owning event |
| `function.settings` with `functionType = "Action"`     | Extension action definition/target               |
| `function.settings` with `functionType = "Condition"`  | Extension condition definition/target            |
| `function.settings` with `functionType = "Expression"` | Extension expression definition/target           |
| Lifecycle name in `function.settings`                  | Extension lifecycle target when supported        |
| `do result = ...`                                      | Function return-value action                     |

The adapter, not the AI, chooses exact internal JSON type identifiers and field names.

### 22.2 Suggested compiler API

```text
compile(source, projectContext, target, options) -> CompileResult
```

The first implementation exposes the context-free event-array core from
`newIDE/app/src/EventsSheet/IfDoEventsDsl/index.js`:

```text
parseLegacyEventsJson(json) -> normalized event array
parseIfDoEvents(source, options) -> event array
convertLegacyEventsJsonToIfDo(json, options) -> canonical source
compileIfDoToLegacyEventsJson(source, options) -> normalized JSON
canonicalizeLegacyEventsJson(json) -> canonical JSON
areLegacyEventsEquivalent(left, right) -> boolean
```

`options.resolveInstruction` is the sole boundary to the loaded project catalog
for conditions and actions. The core contains no built-in instruction-name,
comparison, assignment, collision, input, timer, object, sound, scene, or
capability aliases. Compiling or formatting an instruction without a loaded
catalog is an error.
`options.lowerWhileLimit` supplies the catalog-aware lowering for the
source-only `while limit=` guard. The richer project-aware result below remains
the editor integration API to build on top of this core.

`options.formatInstruction` is the reverse boundary. The multi-file storage
adapter builds both callbacks from the saved internal serialization instruction
catalog, so a generic named catalog instruction compiles and decompiles through
its semantic signature.
The separate AI catalog enumerates the non-deprecated authoring surface.
Editor-hidden compatibility identifiers, instructions with deprecation
messages, and hidden or deprecated expressions are omitted from the AI catalog
so models cannot introduce entries that render with warning/deprecated styling
into new event code.

Suggested result:

```text
CompileResult
- eventsJson
- diagnostics
- sourceMap
- normalizedSource
- referencedObjects
- referencedBehaviors
- referencedResources
- referencedScenes
- referencedExternalEvents
- containsJavaScript
- targetKind
- functionSignature
- referencedFunctions
```

### 22.3 Semantic IR example

Input:

```events
local damage = 10
if collision Player Enemy
do Player.health -= local.damage
```

Possible IR:

```json
{
  "kind": "standard-event",
  "locals": [
    {
      "name": "damage",
      "initialValue": 10,
      "type": "number"
    }
  ],
  "conditionGroups": [
    {
      "operator": "or",
      "conditions": [
        {
          "instruction": "collision",
          "arguments": {
            "first": "Player",
            "second": "Enemy"
          },
          "negated": false
        }
      ]
    }
  ],
  "actions": [
    {
      "instruction": "assign",
      "arguments": {
        "target": "Player.health",
        "operator": "-=",
        "value": "local.damage"
      }
    }
  ],
  "children": []
}
```

### 22.4 Source maps

Every generated JSON event, local variable, condition, action, and raw-code block should retain a source-map entry with:

- File name.
- Line number.
- Column range.
- Event depth.
- Group name.
- Branch ownership.

---

## 23. Validation rules

The compiler validates syntax and project semantics before modifying Events JSON.

### 23.1 Structural validation

Reject:

- Orphan `or` lines.
- Orphan `else` lines in the AI profile.
- Depth jumps larger than one.
- Parent actions after child events.
- Missing or mismatched `@end group`.
- Nested groups in the AI profile.
- Loops without bodies.
- Conditional events without actions or sub-events.
- Inline IfDo comments.
- Unknown statement keywords.
- Local declarations after an event header.
- Duplicate local, loop-counter, or child aliases.
- Unterminated JavaScript blocks.
- `@end` without a block-kind suffix.
- `@end js` at the wrong depth or with a mismatched delimiter.
- A `function` header or TOML front matter in a project-owned `.events` file.
- More than one function header, or a non-leading header, in explicitly
  enabled standalone mode.
- Event links inside a function file.
- `result` writes in action or lifecycle functions.
- Missing required initial `result` in the AI profile.

### 23.2 Project validation

Reject:

- Unknown objects or object groups.
- Unknown scenes.
- Unknown external event sheets.
- Link-kind mismatches.
- Cyclic event-sheet links.
- Unknown resources.
- Unknown variables or properties.
- A `for each child` source that is not a structure or array.
- Behaviors not attached to the referenced object.
- Unknown instructions.
- Incorrect parameter names or types.
- Writes to read-only expressions, aliases, or counters.
- Invalid object-versus-group usage.
- Invalid JavaScript `objects=` symbols.
- Unknown function kinds, names, or parameter types.
- Unknown, missing, duplicate, or incorrectly typed custom-function arguments.
- Writes to read-only function parameters.
- Direct scene-object references prohibited by the selected function portability profile.
- A function result whose type does not match the function kind.
- Unsupported lifecycle function names.

### 23.3 AI profile validation

The `ifdo-ai` profile additionally rejects:

- Guessed instruction names.
- Unqualified project variable names.
- Positional arguments for complex extension instructions.
- Unknown `@` instructions.
- Unbounded `while` loops.
- Excessive nesting beyond a configurable limit.
- JavaScript when `allowJavaScript` is false.
- Link targets not explicitly listed in the prompt context.
- Shadowing of ancestor locals or aliases.
- Positional arguments for custom functions.
- Recursive function-call cycles unless `allowRecursion=true`.
- Function paths that do not match the owning project manifest when path enforcement is enabled.

### 23.4 Diagnostic examples

```text
E102 Unknown object "Enmey"

4 | if collision Player Enmey
                        ^^^^^

Did you mean "Enemy"?
```

```text
E215 Behavior "Platformer" is not attached to object "Enemy"

8 | do Platformer.jump Enemy
                         ^^^^^

Objects with this behavior:
- Player
```

```text
E307 Orphan `or`

11 | or key A down
     ^^

`or` must follow an `if`, `while`, or another `or`
at the same depth and before the event body.
```

```text
E411 Invalid depth jump

15 | >> if Enemy.health <= 0
     ^^

Expected one `>` after the parent event.
```

```text
E438 Invalid child-variable source

9 | for each child scene.score as item
                   ^^^^^^^^^^^

Expected a structure or array variable, but `scene.score` is a number.
```

```text
E452 Unsafe while loop

12 | while scene.queueSize > 0
     ^^^^^

The `ifdo-ai` profile requires `limit=<positive integer>`.
```

```text
E470 JavaScript is disabled

20 | @js objects=Enemy
     ^^^

Set `allowJavaScript=true` only when raw JavaScript is explicitly requested.
```

```text
E510 Cannot write function parameter "amount"

6 | do amount -= 1
       ^^^^^^

Function parameters are read-only. Copy the value to a local variable when mutation is needed.
```

```text
E521 Missing function result initialization

1 | if target.health <= 0
    ^^^^^^^^^^^^^^^^^^^^^

Function `Combat.IsDead` is a condition according to its settings. The
`ifdo-ai` profile requires an unconditional `do result = false` before
conditional result assignments.
```

```text
E532 Unknown function argument "ammount"

8 | do Combat.Damage target=Player ammount=10
                                      ^^^^^^^

Did you mean `amount`?
```

---

## 24. Canonical formatting

The formatter emits one stable representation.

1. Use lowercase structural keywords.
2. Use one statement per line.
3. Use one space after the complete `>` prefix.
4. Put blank lines between sibling events.
5. Put a blank line after `@group` and before `@end group` when non-empty.
6. Use double-quoted strings.
7. Use explicit `scene.`, `global.`, and `local.` namespaces.
8. Use canonical instruction names from the registry.
9. Prefer named arguments for instructions with more than two parameters.
10. Use `index=name`, never alternate counter spellings.
11. Use `for each child <path> as <alias>` for child-variable loops.
12. Require `limit=` on AI-generated while loops.
13. Place `else` immediately after its matching event.
14. Preserve JavaScript body text while normalizing the final newline.
15. End the file with a newline.
16. Emit only DSL event statements in project-owned `.events` files; do not
    emit TOML front matter or a function declaration.
17. Use named arguments for every custom-function call.
18. Use `functions/<Function>/<Function>.events` beside
    `function.settings` for extension-level functions.
19. Initialize `result` unconditionally in AI-generated condition and expression functions.

Canonical example:

```events
@group "Player Damage" source="" creationTime=0 color=[74,176,228] parameters=[]

@comment "Apply damage from enemies or projectiles" background=[255,230,109] text=[0,0,0]

local damage = 10
if collision Player Enemy
or collision Player Projectile
if Player.invincible == false
do Player.health -= local.damage
do Player.invincible = true
do timer.reset Player.invincibility

> if Player.health <= 0
> do scene.change "GameOver"

if timer Player.invincibility >= 1s
do Player.invincible = false

@end group
```

---

## 25. Complete examples

### 25.1 Standard events, locals, OR, else, groups, and sub-events

```events
@group "Combat"

@comment "Damage the player" background=[255,230,109] text=[0,0,0]

local damage = 10
if collision Player Enemy
or collision Player Projectile
if Player.invincible == false
do Player.health -= local.damage
do Player.invincible = true
do timer.reset Player.invincibility

> if Player.health <= 0
> do Player.animation = "Dead"

>> if Player.lives > 0
>> do Player.lives -= 1
>> do scene.restart
>> else
>> do scene.change "GameOver"

@comment "Choose the health animation" background=[255,230,109] text=[0,0,0]

if Player.health <= 0
do Player.animation = "Dead"
else if Player.health < 30
do Player.animation = "Hurt"
else
do Player.animation = "Idle"

@end group
```

### 25.2 Every loop type

```events
@group "Loops"

@comment "Process each enemy instance" background=[255,230,109] text=[0,0,0]

for each Enemy index=i
> if Enemy.health <= 0
> do Enemy.deathOrder = i
> do delete Enemy

@comment "Process every child in an inventory structure" background=[255,230,109] text=[0,0,0]

local total = 0
for each child scene.inventory as item
> do local.total += item.value
> do DebugText.text = item.name + ": " + item.value

@comment "Create fixed rewards" background=[255,230,109] text=[0,0,0]

local spacing = 50
repeat 5 index=i
> do create Coin x=100+i*local.spacing y=200

@comment "Drain a queue safely" background=[255,230,109] text=[0,0,0]

while scene.queueSize > 0 limit=1000 index=i
> do scene.queueSize -= 1
> do DebugText.text = "Processed " + (i + 1)

@end group
```

### 25.3 Linked events and JavaScript

```events
@group "Reuse"

link external "Shared Player Logic"
link scene "Base Level"

@end group

@group "Advanced Escape Hatch"

if collision Player Enemy

> @js objects=Enemy
  objects.forEach(enemy => {
    enemy.setOpacity(128);
  });
> @end js

@end group
```

### 25.4 Action, condition, and expression functions

`extensions/Combat/functions/Damage/Damage.events` (signature comes from the
sibling `function.settings`):

```events
local finalAmount = max(0, amount)

if target.health > 0
do target.health -= local.finalAmount

> if target.health <= 0
> if canKill
> do delete target
```

`extensions/Combat/functions/IsDead/IsDead.events`:

```events
do result = false

if target.health <= 0
do result = true
```

`extensions/Combat/functions/DamageForLevel/DamageForLevel.events`:

```events
do result = base + level * 2
```

`scenes/Main/Main.events`:

```events
@group "Combat"

if collision Player Enemy
do Combat.Damage target=Player amount=Combat.DamageForLevel(level=Enemy.level, base=10) canKill=true

if Combat.IsDead target=Player
do scene.change "GameOver"

@end group
```

---

## 26. AI generation contract

A model using IfDo should receive:

1. A compact syntax summary.
2. The current project schema.
3. The allowed instruction catalog.
4. Allowed scene and external-event link targets.
5. Whether JavaScript is permitted.
6. The user request.
7. Relevant existing events when editing.

Recommended model instruction:

```text
Write GDevelop events using IfDo.

Rules:
- Output only IfDo source.
- Use one DSL statement per line.
- Use only listed objects, groups, behaviors, variables, scenes,
  external event sheets, resources, functions, and instructions.
- Never invent an instruction or project symbol.
- Multiple `if` groups mean AND.
- Consecutive `or` lines extend the preceding `if` or `while` group.
- Declare event locals before the event header and reference them as `local.name`.
- `else` must match the preceding conditional event at the same depth.
- Prefix every line of a sub-event with `>`.
- Increase depth by exactly one level at a time.
- Put parent actions before child events.
- Use `for each Object` for object iteration.
- Use `for each child variablePath as alias` for structures and arrays.
- Use `repeat count index=i` for fixed repetition.
- Every generated `while` must include `limit=<positive integer>`.
- Use `link external` or `link scene` only with listed targets.
- Do not emit `@js` unless JavaScript is explicitly allowed.
- Prefer catalog events over JavaScript.
- Prefer named arguments for complex instructions.
- Use the `.events` file extension.
- Output only the event body; never emit TOML front matter or a `function`
  declaration in a project-owned `.events` file.
- Use one function body per file. Extension functions use
  `functions/<Function>/<Function>.events` beside `function.settings`.
- Use named arguments for every custom-function call.
- Treat function parameters as read-only.
- Initialize `result` unconditionally in condition, number, and text functions.
- Do not use `result` in action or lifecycle functions.
- Do not use `link` inside a function file.
- Do not generate recursive calls unless recursion is explicitly allowed.
```

### Compact grammar prompt

```text
COMMENT
@comment "text" background=[255,230,109] text=[0,0,0]

LOCAL VARIABLE
local name = value

STANDARD EVENT
if condition
or alternative
if additional-condition
do action

ELSE
else if condition
do action
else
do action

SUB-EVENT
> if condition
> do action

GROUP
@group "Name"
...
@end group

FOR EACH OBJECT
for each Object index=i
> do action

FOR EACH CHILD VARIABLE
for each child scene.structure as item
> do action using item.value, item.name, item.index

REPEAT
repeat count index=i
> do action

WHILE
while condition limit=1000 index=i
or alternative
if additional-condition
> do action

LINK
link external "External Events Name"
link scene "Scene Name"

JAVASCRIPT
@js objects=Object
raw JavaScript
@end js

FUNCTION FILE
signature and owner come from TOML settings
the .events file contains only the event statements below

FUNCTION RESULT
do result = false
do result = 0
do result = ""

FUNCTION CALL
do Extension.Action target=Player amount=10
if Extension.Condition target=Player
do scene.value = Extension.Number(value=10)
do Label.text = Extension.Text(value="Ready")
```

---

## 27. Recommended generation workflow

```text
Natural-language request
        ↓
Project context, function signatures, link targets, and instruction catalog
        ↓
AI generates IfDo
        ↓
JavaScript-body scanner and parser check structure
        ↓
Semantic validator checks project symbols and types
        ↓
AI repairs IfDo diagnostics when necessary
        ↓
Human-readable event diff
        ↓
Compiler emits GDevelop event-sheet or extension-function JSON
```

The compiler must never apply invalid output to a project.

Diagnostics should refer to IfDo source and its typed constructs.

---

## 28. Version 2.0 feature set

Version 2.0 intentionally replaces the earlier split structural spellings.
There is no source-compatibility mode:

- `@group "name" ...` is the complete group header; a following `group` line
  is invalid.
- `@comment "content" ...` is the complete comment event; hash-comment event
  syntax is invalid.
- JavaScript begins with `@js`, not `js`.
- Blocks close with typed `@end group` or `@end js`; bare `end`, bare `@end`,
  and `end js` are invalid.

### Included

- Standard conditional events.
- Unconditional standard events.
- Explicit empty, local-only, and child-only standard events.
- Multiple AND condition groups.
- OR alternatives.
- Negation.
- Trigger once.
- Actions and assignments.
- Local variables on standard events, else branches, and loops.
- Recursive exact `var(...)` syntax covering every current variable field and
  nested value shape.
- Else and else-if.
- Sub-events.
- Event groups.
- Full-line comments.
- For Each Object loops.
- For Each Child Variable loops.
- Fixed-count Repeat loops.
- While loops with optional safety limits, counters, and exact preservation of
  zero or multiple sibling `whileConditions`.
- Link events for external event sheets and scene event sheets.
- JavaScript code events with optional picked-object input and collision-safe
  canonical body delimiters.
- Scene, global, local, object, behavior, and loop-alias namespaces.
- Structure and array indexing.
- Project-aware instruction catalog.
- Named instruction parameters.
- Exact typed form for any registered extension instruction.
- Source maps and repairable diagnostics.
- `.events` source-file convention.
- One settings-targeted function body per function `.events` file.
- Action, condition, expression, expression-and-condition, operator-action,
  and catalog-listed lifecycle functions.
- Async function metadata and awaited actions supported by the current model.
- Typed read-only function parameters.
- Lossless TOML function metadata, including parameter defaults and editor
  presentation fields.
- Named action, condition, and expression function calls.
- Typed `result` handling.
- Function-call validation and recursion checks.
- Complete typed event/instruction presentation annotations.
- Exhaustive typed coverage of every event, instruction, variable, and
  metadata field persisted by the current serializers.

### Deferred

- A compact body-syntax shorthand for async declarations (TOML settings are
  already lossless).
- Compact header syntax for parameter defaults, variadic parameters, and
  overloads. Current defaults remain preserved in TOML settings.
- Macros.
- Object, scene, resource, behavior, or extension declarations.
- Nested organizational groups in the AI profile.
- Inline IfDo comments.
- Custom operators.
- Indentation-sensitive blocks.
- Multiple picked-object parameters for a JavaScript event.
- New presentation metadata that does not exist in the current serializer.

---

## 29. Final design principles

1. **The DSL describes intent; the compiler owns GDevelop serialization.**
2. **Every GDevelop core event type has one clear IfDo representation.**
3. **There is one canonical spelling for each instruction.**
4. **Hierarchy is visible on every DSL line through `>` depth markers.**
5. **Object picking remains native to GDevelop.**
6. **Local scope is explicit through `local.`.**
7. **Loop bindings are explicit and read-only.**
8. **JavaScript is available but opt-in for AI generation.**
9. **The model receives a closed project-specific catalog.**
10. **Unknown symbols are errors, never guesses.**
11. **Compiler validation is mandatory.**
12. **Generated changes should be reviewed as readable IfDo diffs before application.**
13. **A function is a specialized `.events` event sheet, not a separate language.**
14. **Custom-function calls always use named arguments.**
15. **The filename convention is `xx.events`; function paths, owners, and signatures are declared only by TOML settings.**

The complete structural foundation remains small:

```events
@comment "comment" background=[255,230,109] text=[0,0,0]

local value = 10
if condition
or alternative
do action
else
do fallback

for each Object
> do action

for each child scene.data as item
> do action

repeat 5 index=i
> do action

while condition limit=1000
> do action

link external "Shared Events"

@js
// raw JavaScript
@end js

@group "Name"
@comment "events" background=[255,230,109] text=[0,0,0]
@end group

@comment "A function .events file uses the same event statements." background=[255,230,109] text=[0,0,0]
@comment "Its signature comes from TOML settings, not this body." background=[255,230,109] text=[0,0,0]
```

---

## 30. Compatibility basis

This design follows the core event categories and behavior documented by GDevelop for standard events, else events, comments, groups, for-each object loops, for-each child-variable loops, repeat loops, while loops, link events, JavaScript events, sub-events, local variables, and extension functions.

Useful official references:

- [GDevelop events overview](https://wiki.gdevelop.io/gdevelop5/events/)
- [Standard events](https://wiki.gdevelop.io/gdevelop5/events/standard/)
- [Else events](https://wiki.gdevelop.io/gdevelop5/events/else/)
- [For each object event](https://wiki.gdevelop.io/gdevelop5/events/foreach/)
- [For each child variable event](https://wiki.gdevelop.io/gdevelop5/events/foreach-child-variable/)
- [Repeat events](https://wiki.gdevelop.io/gdevelop5/events/repeat/)
- [While events](https://wiki.gdevelop.io/gdevelop5/events/while/)
- [Group events](https://wiki.gdevelop.io/gdevelop5/events/group/)
- [Link events](https://wiki.gdevelop.io/gdevelop5/events/link/)
- [JavaScript code events](https://wiki.gdevelop.io/gdevelop5/events/js-code/)
- [Local variables](https://wiki.gdevelop.io/gdevelop5/all-features/variables/local-variables/)
- [Functions](https://wiki.gdevelop.io/gdevelop5/events/functions/)

---

## 31. Current implementation boundary

This section records what the inspected codebase persists today. It is the
compatibility target for the DSL; it is not a proposal to change runtime event
logic.

### 31.1 Event list encoding

`gd::EventsListSerialization::SerializeEventsTo` writes a JSON array. Every
event has a type and may have common editor attributes:

```json
{
  "type": "BuiltinCommonInstructions::Standard",
  "disabled": false,
  "folded": false,
  "aiGeneratedEventId": "optional-id"
}
```

`disabled` and `folded` are omitted in ordinary non-canonical serialization
when false. `aiGeneratedEventId` is omitted when empty. Canonical comparison
must compare the logical values, not whether an optional default happened to
be omitted in an old file.

The canonical round-trip profile attaches common metadata to the next event at
the same depth:

```events
@event disabled=true folded=true aiGeneratedEventId="generation-42"
if once
do scene.score = 0
```

An `@event` line without a following event at the same depth is invalid.

### 31.2 Instruction encoding

Conditions, actions, and instruction children use the same current shape:

```json
{
  "type": {
    "value": "BuiltinCommonInstructions::CompareNumbers",
    "inverted": false,
    "await": false
  },
  "disabled": false,
  "parameters": ["Variable(Score)", ">=", "100"],
  "subInstructions": []
}
```

The important compatibility facts are:

- Instruction identifiers are strings in `type.value`.
- Parameters are positional strings containing GDevelop expressions or raw
  parameter text.
- Inversion and awaiting are flags on `type`.
- Disabled is a flag on the instruction object.
- OR, AND, and NOT are ordinary condition instructions whose operands are in
  `subInstructions`.
- Any instruction metadata can evolve independently of this stored positional
  array, so compilation must use the catalog for the loaded project version.

Named catalog syntax hides the positional array while preserving exact types.
Typed round-trip metadata for the next instruction can be written as:

```events
@instruction disabled=true awaited=true
do await Network.SendRequest url="https://example.com"
```

`awaited=true` is valid only for actions whose metadata supports asynchronous
execution. Condition inversion is written as `@instruction inverted=true`; it
maps to `type.inverted`, not automatically to a separate
`BuiltinCommonInstructions::Not` instruction.

The closed `@instruction` metadata schema is `disabled`, `inverted`, and
`awaited`. `do await` is canonical when applicable. If an annotation and
structural syntax specify the same flag, their values must agree.

### 31.3 Persisted event types and fields

| Serialized `type`                                 | Current fields in addition to common event fields                                                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BuiltinCommonInstructions::Standard`             | `conditions`, `actions`, optional `events`, optional `variables`                                                                                                               |
| `BuiltinCommonInstructions::Else`                 | `conditions`, `actions`, optional `events`, optional `variables`                                                                                                               |
| `BuiltinCommonInstructions::While`                | `infiniteLoopWarning`, `whileConditions`, `conditions`, `actions`, optional `events`, optional `variables`, optional `loopIndexVariable`                                       |
| `BuiltinCommonInstructions::Repeat`               | `repeatExpression`, `conditions`, `actions`, optional `events`, optional `variables`, optional `loopIndexVariable`                                                             |
| `BuiltinCommonInstructions::ForEach`              | `object`, `conditions`, `actions`, optional `events`, optional `variables`, optional `loopIndexVariable`, optional `orderBy`, `order`, and `limit`                             |
| `BuiltinCommonInstructions::ForEachChildVariable` | `iterableVariableName`, `valueIteratorVariableName`, `keyIteratorVariableName`, `conditions`, `actions`, optional `events`, optional `variables`, optional `loopIndexVariable` |
| `BuiltinCommonInstructions::Group`                | `name`, `source`, `creationTime`, `colorR`, `colorG`, `colorB`, `parameters`, `events`                                                                                         |
| `BuiltinCommonInstructions::Comment`              | `color` with background/text RGB, `comment`, optional deprecated `comment2`                                                                                                    |
| `BuiltinCommonInstructions::Link`                 | `target`, `include.includeConfig`, and optional group or index-range attributes                                                                                                |
| `BuiltinCommonInstructions::JsCode`               | `inlineCode`, `parameterObjects`, `useStrict`, `eventsSheetExpanded`                                                                                                           |

This table covers all source-persisted event serializers registered by the
inspected built-in code: the nine common event classes plus the GDJS JavaScript
event. The internal async event is handled separately below because it is a
generated preprocessing node, not source-project grammar.

The exact JavaScript event type comes from the GDJS platform event registry.
A compiler must query the registry rather than hardcode a guessed platform
prefix.

### 31.4 Internal async event

`BuiltinAsync::Async` is an internal preprocessing event created from awaited
actions by `BaseEvent::PreprocessAsyncActions`. Its class does not implement a
persisted source serializer. A decompiler must not emit it from normal project
JSON, and a source compiler must not accept it as an ordinary event. The source
form is an awaited action (`do await ...`) on a normal persisted event.

### 31.5 Unknown current event behavior

The current `UnserializeEventsFrom` logs an unknown event type and substitutes
an `EmptyEvent`. Automatic migration must inspect and validate event types
before this substitution can occur. An event outside the active typed coverage
contract stops migration with an unsupported-schema diagnostic. The converter
must never replace it, preserve it as raw JSON, or claim a successful migration.

---

## 32. Normative event-to-JSON mapping

### 32.1 Standard event

One contiguous standard-event block maps to one
`BuiltinCommonInstructions::Standard` object:

```events
local damage:number = 10
if collision Player Enemy
if Player.invincible == false
do Player.health -= local.damage

> if Player.health <= 0
> do delete Player
```

Mapping:

- `local` declarations -> `variables`.
- Top-level `if` condition groups -> `conditions`.
- `do` lines -> `actions`.
- `>` event blocks -> `events`.
- Source order is retained within every list.

The variable compiler must preserve current variable types, enum values,
persistent UUIDs, folded state, and nested values when they exist. A typed
primitive declaration may use:

```events
local lives:number = 3 uuid="..." folded=false
local state:enum("idle", "run", "hurt") = "idle" uuid="..."
```

The declaration grammar and typed initializer grammar must represent every
variable type, nested value, enum value, UUID, folded state, and other field
persisted by the current variable serializer. If a serializer version exposes
a field the active DSL version cannot represent, migration stops before writing
new files; it must not drop the field or embed raw JSON.

### 32.2 AND and OR

Separate entries in an event's `conditions` array are ANDed by the current
code generator.

```events
if A
if B
do X
```

emits two condition instructions `[A, B]`.

An IfDo alternative group:

```events
if A
or B
or C
if D
do X
```

emits:

```text
conditions[0]
  type.value = BuiltinCommonInstructions::Or
  subInstructions = [A, B, C]
conditions[1] = D
```

This preserves GDevelop object-picking behavior for OR, including the union of
objects picked by successful alternatives. A compiler must not lower this to
three sibling events, because that changes action count and picking semantics.

Nested `BuiltinCommonInstructions::And`, `Or`, or `Not` instructions that
cannot be represented by the simple `if`/`or` grouping use the typed
catalog instruction form with instruction-depth prefixes. In particular, the
decompiler must not expand an `Or` whose direct child is another `Or`, because
the parser's `or` sugar intentionally flattens alternatives and would change
the serialized instruction tree.

### 32.3 Comparisons and assignments

The catalog condition:

```events
if NumberVariable variable="score" comparison_sign=">=" value=100
```

maps directly through catalog metadata to the registered `NumberVariable`
condition and its positional parameter order. Other value, property, or object
comparisons use their own exact registered types.

Similarly:

```events
do SetNumberVariable variable="score" modification_sign="+" value=10
```

maps directly to that registered action identifier and exact parameter order;
there is no universal JSON `assign` node.

### 32.4 Inversion, NOT, disabled, and awaited

- `@instruction inverted=true` sets the following condition instruction's
  `type.inverted` flag.
- A stored `BuiltinCommonInstructions::Not` with sub-instructions remains a
  distinct logical instruction; it is not conflated with the inverted flag.
- `@instruction disabled=true` maps to the instruction-level `disabled` field.
- `@instruction awaited=true` maps to `type.await` when valid for the action.
- `do await ...` maps to `type.await=true` after metadata validation.

### 32.5 Sub-instructions

Catalog instructions that accept sub-instructions use instruction-depth
prefixes:

```events
if BuiltinCommonInstructions::Or
  ? FirstNumberComparison left=expr(Variable(A)) comparison_sign=">" right=0
  ? SecondNumberComparison left=expr(Variable(B)) comparison_sign=">" right=0
```

Leading `?` increases instruction depth and is separate from event depth `>`.
Every nested instruction line repeats the event-depth prefix first, then its
instruction-depth prefix. For example, a nested event containing an OR child
condition begins with `> if ...` and its instruction children begin with
`> ? ...`.

The canonical profile uses `if`/`or` and named catalog types at every
instruction depth.

---

## 33. Normative structural-event mapping

### 33.1 Else

`else` and `else if` compile to a sibling
`BuiltinCommonInstructions::Else` event. Branch conditions go in its
`conditions`, actions in `actions`, branch locals in `variables`, and children
in `events`.

The current runtime determines the chain from contiguous compatible sibling
events; the JSON does not store a pointer to the matching event. Therefore the
compiler keeps an else chain contiguous. A comment/group/link between a source
event and its `else` is rejected in the canonical round-trip profile.

### 33.2 Loops and loop-owned instructions

Loop events can own conditions, actions, locals, and sub-events. Canonical
syntax keeps loop-owned lines at the loop's depth and child events one level
deeper:

```events
for each Enemy index=i order_by=Enemy.health order=desc limit=10
if Enemy.active
do Enemy.rank = i

> if Enemy.health <= 0
> do delete Enemy
```

Mapping for `ForEach`:

- Header object -> `object`.
- `index=` -> `loopIndexVariable`.
- `order_by=` -> `orderBy`.
- `order=asc|desc` -> `order`.
- `limit=` -> the current `ForEach.limit` field and is valid only when
  `order_by` is present, matching current serialization.
- Same-depth `if`/`do` -> loop `conditions`/`actions`.
- Child-depth events -> loop `events`.

`Repeat` maps its count to `repeatExpression` and `index=` to
`loopIndexVariable`.

In canonical decompiler output, raw serializer operand strings on loop headers
are JSON-quoted, for example `repeat "Variable(Count) + 1"` and
`order_by="Enemy.Variable(Health) + 1"`. In this exact structural position the
quotes encode the stored expression text; they do not turn it into a GDevelop
text expression. Authored source may continue to use the unquoted
expression spelling shown earlier.

`ForEachChildVariable` maps:

```events
for each child scene.inventory value=item key=itemKey index=i
```

to `iterableVariableName`, `valueIteratorVariableName`,
`keyIteratorVariableName`, and `loopIndexVariable`. The earlier shorthand
`as item` means `value=item`, with an empty key iterator.

`While` has two distinct condition lists:

- A non-empty `while` header compiles to the first `whileConditions` entry.
  A bare `while` compiles to an empty `whileConditions` array.
- Each immediately following `and while` compiles to another distinct,
  ordered `whileConditions` entry. This is the canonical exact form for
  current serialized events that contain multiple sibling entries.
- Instruction-depth children of a `while` or `and while` header remain children
  of that header instruction; they must never be moved ahead of the header.
- Structural `or` alternatives after a non-empty header are lowered into the
  header condition's `BuiltinCommonInstructions::Or` instruction; they do not
  create sibling `whileConditions` entries.
- Additional same-depth `if` groups compile to `conditions`.
- Same-depth `do` lines compile to `actions`.
- Child events compile to `events`.
- `index=` maps to `loopIndexVariable`.
- `@while infiniteLoopWarning=true` preserves the editor warning flag.

The source-only `while limit=N` safety feature has no dedicated current JSON
field. A compiler may lower it to a generated loop index and an additional
while condition, but it must mark the generated structure so a decompiler can
recover it. Without that marker, decompilation emits the explicit conditions
that are present and does not invent `limit=`.

### 33.3 Comments

One `@comment "content" ...` statement maps to one
`BuiltinCommonInstructions::Comment` event. Newlines use JSON string escapes;
adjacent `@comment` statements are never automatically merged because two
adjacent comment events are distinguishable in JSON.

Presentation metadata is optional in authored source and emitted when needed
for round-trip fidelity:

```events
@comment "Damage handling" background=[255,230,109] text=[0,0,0] comment2=""
```

### 33.4 Groups

```events
@group "Combat" disabled=true source="" creationTime=0 color=[74,176,228] parameters=[]
...
@end group
```

maps to `BuiltinCommonInstructions::Group`. `parameters` is the current raw
string array. A group is a true event containing `events`; it is not merely a
formatter region. Because `disabled`, `folded`, and `aiGeneratedEventId` are
properties of that group event, their canonical owner is `@group`; a separate
`@event` annotation is emitted only for events inside the group.

### 33.5 Links

Current link JSON stores only a `target` string, not whether that target was a
scene or external event sheet. Runtime lookup checks external events before
scenes. The canonical round-trip spelling is therefore:

```events
link "Shared Combat"
link "Shared Combat" group="Damage"
link "Shared Combat" range=2..8
```

Mapping:

- Plain link -> `includeConfig = INCLUDE_ALL` (`0`).
- `group=` -> `INCLUDE_EVENTS_GROUP` (`1`) and `eventsGroup`.
- `range=start..end` -> deprecated `INCLUDE_BY_INDEX` (`2`), `start`, and
  inclusive `end`; this form is retained for current JSON round-trip fidelity.

`link external` and `link scene` remain authoring aliases. They validate the
resolved target kind, but the distinction is not persisted. A project with a
scene and external sheet of the same name is rejected by the typed aliases or
uses the current external-first behavior with the generic form.

### 33.6 JavaScript

```events
@js disabled=true aiGeneratedEventId="generated-javascript" objects=Enemy strict=true expanded=false
// source preserved verbatim
@end js
```

maps to `inlineCode`, `parameterObjects`, `useStrict`, and
`eventsSheetExpanded`, with common event metadata stored on the `@js` header.
The body preserves all bytes after newline normalization. `objects=` accepts
the one object/object-group expression supported by the current event.
Omitting flags uses current defaults.

---

## 34. Function metadata and current JSON mapping

### 34.1 Current function types

The current `gd::EventsFunction` serializer supports more distinctions than
the earlier compact function examples:

| Settings `functionType`                 | IfDo header kind                       | Current fields/meaning                                                                  |
| --------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `Action`                                | `action`                               | Callable action, no return value                                                        |
| `Condition`                             | `condition`                            | Boolean return through `SetReturnBoolean`                                               |
| `Expression` + numeric `expressionType` | `number`                               | Numeric expression return through `SetReturnNumber`                                     |
| `Expression` + string `expressionType`  | `text`                                 | String expression return through `SetReturnString`                                      |
| `ExpressionAndCondition`                | `number-condition` or `text-condition` | One expression exposed with relational-condition support                                |
| `ActionWithOperator`                    | `operator-action`                      | Setter/action paired with `getterName`; parameters are partly generated from the getter |

Deprecated `StringExpression` is accepted by the current loader for compatibility
and normalized to `Expression` plus string `expressionType` when written.

Extension lifecycle functions are current `Action` functions whose names are
one of the names accepted by
`EventsFunctionsExtension::IsExtensionLifecycleEventsFunction`. `lifecycle`
is a checked source alias; it is not a sixth stored `functionType`.

`async=true` is independent function metadata. The compiler validates which
function kinds the current editor permits to be asynchronous.

### 34.2 Function settings

The multi-file project format stores every `EventsFunction` field except
`events` in the owning TOML settings entry:

- `name`, `fullName`, `description`, `sentence`, and `group`.
- `getterName`.
- `private`, `async`, `helpUrl`, `deprecated`, and `deprecationMessage`.
- Exact `functionType` and `expressionType`.
- Ordered parameters with name, value type, supplementary information,
  optional/default settings, descriptions, hints, and `codeOnly`.
- `objectGroups`.

For extension-level functions, the owner is
`extensions/<Extension>/functions/<Function>/function.settings`. Prefab and
behavior methods use their own flat
`functions/<Function>/function.settings` files with `folder` arrays.

The owner settings entry is the complete metadata source and compiler target.
Canonical project `.events` files contain neither front matter nor a
`function` declaration.

### 34.3 Parameter references

IfDo permits readable parameter symbols such as `amount`. Current event
expressions access non-object parameters through catalog expressions such as
`GetArgumentAsNumber("amount")`, and object/behavior parameters use the
function context's registered object/behavior names. The compiler performs
this lowering according to parameter metadata. It must not place a bare
parameter name into serializer JSON unless that is the current registered syntax
for that parameter kind.

### 34.4 Return values

The source assignment:

```events
do result = expression
```

maps by function kind to a normal action instruction:

| Function result | Current action type |
| --------------- | ------------------- |
| Boolean         | `SetReturnBoolean`  |
| Number          | `SetReturnNumber`   |
| Text            | `SetReturnString`   |

The expression is the action's positional parameter. Setting a return value
does not end event execution; later return actions can replace it. The current
code generator reads `eventsFunctionContext.returnValue` and supplies default
boolean/number/string coercion at the function boundary.

### 34.5 Owner-specific functions

An extension function, prefab method, and behavior method are all serialized
as `EventsFunction`, but live in different `EventsFunctionsContainer` owners.
Per-function or owner settings determine the container. Implicit
object/behavior parameters and generated call names come from the current
metadata declaration helper; the compiler must not treat all three owners as
identical extension-level functions.

### 34.6 Physical ownership and order metadata

The multi-file format does not serialize `eventsFunctionsFolderStructure` or
any other legacy `*FolderStructure` property. Extension-level functions are
owned by physical `functions/<Function>/` directories. Prefab and behavior
methods are owned by physical `functions/<Function>/` directories containing
both `function.settings` and the sibling `.events` body. Contiguous `order`
values preserve deterministic legacy array order. Each `function.settings`

`folder` array is the source of truth for editor grouping; only a transient
legacy folder tree is reconstructed in memory.

---

## 35. Exhaustive typed coverage

The multi-file source contract must represent every field persisted by the
current supported GDevelop serializers: IfDo owns event bodies, while the
owning TOML settings own function identity and metadata. Raw event or
instruction JSON fallback constructs are not part of IfDo.

### 35.1 Event completeness

- Every persisted event type in section 31.3 has a canonical typed construct.
- Every additional persisted event type registered by a supported platform
  extension must provide a versioned typed IfDo adapter. Registering an event
  serializer without a matching adapter makes that project schema ineligible
  for conversion.
- Every common event field is represented by normal syntax or a typed metadata
  annotation with a closed, validated field schema.
- Every event-specific field listed in sections 32 and 33 has a typed operand,
  named argument, annotation, or body form.
- Local variables and their recursively nested values use the complete typed
  variable grammar; no variable field may be omitted during decompilation.
- JavaScript remains a first-class `@js ... @end js` event. Its raw source body
  does not permit raw event or instruction JSON.

### 35.2 Instruction completeness

Every condition and action registered in the closed project catalog must be
representable by its exact catalog `type` with named, semantically typed
arguments and recursively typed `?` sub-instructions. Its identifier must exist
in the loaded catalog, its condition/action kind must match its source
position, parameters must match the registered signature, and its
sub-instruction structure must be valid.

Canonical multi-file project saves use the named catalog form for every
registered serializable instruction. If any registered instruction cannot be
represented by that form, generation fails before project source is replaced.

### 35.3 Unsupported schema handling

The supported serializer version and the DSL coverage version form one
compatibility contract. When GDevelop adds a persisted event type or field, the
DSL grammar, compiler, decompiler, formatter, and tests must be updated before
that serializer version can be migrated.

The implementation maintains a machine-readable coverage manifest containing
the serializer contract, every persisted event type and field, the variable
schema, and metadata annotation schemas. It is exported as
`IFDO_EVENTS_DSL_COVERAGE` from
`newIDE/app/src/EventsSheet/IfDoEventsDsl/index.js`. Migration checks this
manifest before decompiling the first event; project integration must also bind
it to the loaded catalog API and supported GDevelop version range.

If conversion encounters an event type, instruction identifier, field, value
shape, or metadata value outside the active contract:

- Loading the original JSON through the existing reader may remain available.
- Automatic conversion stops before any new-format source is committed.
- The diagnostic identifies the JSON Pointer, serialized type, owning source,
  and required DSL/compiler version.
- The converter must not drop the construct, replace it with an empty event,
  guess a mapping, or store raw JSON in `.events`.

This strict failure rule makes exhaustive typed coverage an implementation
requirement rather than delegating unsupported data to an opaque fallback.

---

## 36. Bidirectional conversion algorithm

### 36.1 DSL to current serializer JSON

1. Resolve and validate the owning TOML settings target; parse no TOML from
   the `.events` body.
2. Scan JavaScript bodies.
3. Parse event depth and instruction depth.
4. Build the typed IfDo AST.
5. Load the closed project-specific catalog.
6. Resolve names, owners, objects, behaviors, variables, parameters,
   resources, and function calls.
7. Resolve exact catalog types and named operands to current positional
   parameter strings.
8. Build exact event objects and attach common/presentation metadata.
9. Reject any AST construct or catalog value that lacks a complete typed
   serializer mapping.
10. Unserialize the result through `EventsListSerialization` in a validation
    project and reserialize canonically as a self-check.

### 36.2 Current serializer JSON to DSL

1. Read the original event array before unknown events can become `EmptyEvent`.
2. Normalize fields accepted by current compatibility code.
3. Resolve each instruction identifier against the loaded catalog.
4. Emit instruction catalog types with named parameters; keep event-structure
   forms for OR groups, loops, links, comments, groups, and JavaScript.
5. Emit typed event/instruction metadata for every persisted field.
6. Emit complete typed variables, including recursively nested values and all
   serializer metadata.
7. Compile the candidate source in memory.
8. Compare the compiled canonical node with the normalized input node.
9. If comparison fails or any node is outside the active coverage contract,
   stop conversion with a source-located unsupported-schema diagnostic.
10. Format canonically and perform a final whole-file compile/compare.

### 36.3 Equivalence definition

Round-trip equivalence is structural equality after current compatibility
normalization and canonical default expansion. It includes:

- Event and instruction types.
- All flags and editor metadata.
- Every parameter string in order.
- Every sub-instruction and event in order.
- Local variable type/value/metadata.
- All event-specific fields.

It does not require preserving obsolete spelling that the current loader
already normalizes, such as a deprecated field name or deprecated
`StringExpression` function-type spelling. The migration report lists every
applied compatibility normalization.

### 36.4 Required implementation tests

- Golden JSON for every row in the persisted-event table.
- OR picking and nested sub-instruction tests.
- Disabled, inverted, awaited, folded, and AI-generated ID tests.
- All variable types, UUIDs, enum values, structures, and arrays.
- ForEach sort/order/limit and all loop-owned lists.
- Link include-all/group/range and name-collision behavior.
- JavaScript flags and byte-preserved body tests.
- All current function types and owners.
- Coverage tests proving that every current persisted event type, field, and
  registered instruction shape has a typed DSL representation.
- Registry/coverage-manifest tests that fail whenever a supported platform
  registers a persisted event serializer without a versioned typed adapter.
- Parser tests rejecting raw event or instruction JSON fallback syntax.
- Unsupported/newer type and field tests proving conversion stops without
  writing partial source files.
- Corpus migration across repository game projects.
- `current JSON -> DSL -> current JSON -> gd::Project -> canonical current JSON` equality.

---

## 37. Scene lifecycle function bodies

An IfDo `.events` file does not declare its lifecycle role. Its sibling
`function.settings` and owner path identify one of four fixed functions:
`sceneLoad`, `sceneSignal`, `sceneUpdate`, or `sceneUnload`. Scene and External
Events functions use the same grammar and instruction catalog as ordinary
scene events, subject to these role rules:

- Legacy `SignalReceived` instructions may be parsed and preserved only in
  `sceneUpdate`, but are not emitted for new authoring; `sceneSignal` compares
  its fixed `SignalName` parameter directly and reads `Payload`.
- `SceneJustBegins` is retained for update compatibility but is redundant in
  load and unload and is not suggested there.
- `sceneUnload` rejects instructions whose metadata declares asynchronous or
  future-frame work, deferred scene-signal emission, or scene-stack mutation.
- Link events resolve the target owner's function with the same lifecycle role;
  lifecycle-neutral function callers retain the compatibility update role.

Direct authoring, compilation, catalog generation, and MCP edits carry the
resolved lifecycle identity. Omitting the role from a legacy API request means
`sceneUpdate`; it never means an arbitrary function inferred from a filename.
