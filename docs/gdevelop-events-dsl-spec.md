# IfDo Events DSL

## A Minimal AI-Friendly DSL for GDevelop Events JSON and Functions

**Status:** Version 1.2 final design specification  
**Canonical source filename:** `xx.events`  
**File extension:** `.events`  
**Encoding:** UTF-8  
**Target:** GDevelop scene event sheets, external event sheets, and extension functions

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
group
link
js
function
end
#
>
```

A compiler converts `.events` source into the exact GDevelop event-sheet or extension-function data expected by the loaded project, GDevelop version, installed extensions, objects, behaviors, variables, resources, scenes, external event sheets, and registered functions.

The AI model should not generate internal GDevelop instruction identifiers or positional JSON parameter arrays.

### Minimal standard event

```events
# Collect a coin

if collision Player Coin
do delete Coin
do scene.score += 1
```

### Standard event with a sub-event

```events
if collision Player Enemy
if Player.invincible == false
do Player.health -= Enemy.damage
do Player.invincible = true

> if Player.health <= 0
> do scene.change "GameOver"
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

Version 1.2 is not intended to be:

- A general-purpose programming language.
- A full GDevelop project format.
- A language for declaring scenes, objects, resources, behaviors, or extensions.
- A macro or metaprogramming system.
- A replacement for GDevelop's instruction catalog.
- A JavaScript type checker. JavaScript is supported only as an explicit raw-code event.
- A serialization of editor-only layout details that do not affect event behavior.

Every source file uses the name pattern `xx.events`, where `xx` is any useful base name. A `.events` file represents either one scene/external event sheet or one extension function. Event-sheet targets are supplied through the compiler API, command line, or editor integration. A function file identifies itself with a `function` header.

---

## 3. GDevelop menu coverage

The following table maps the items visible in the GDevelop event menus to IfDo.

| GDevelop editor item | IfDo representation |
|---|---|
| New Event Below | Source order; place the new event after the previous event |
| Sub Event | Prefix every line of the child event with `>` |
| Local Variable | `local name = initialValue` attached to an event |
| Comment | `# comment text` |
| Else | `else` or `else if condition` |
| For each object | `for each Object` |
| For each child variable | `for each child variablePath as alias` |
| Event group | `group Name` ... `end` |
| JavaScript code | `js` ... `end js` |
| Link external events | `link external "Sheet Name"` |
| Repeat | `repeat count` |
| Standard event | `if`, `or`, and `do` lines |
| While | `while condition` |
| Extension function | A `.events` file beginning with `function` |

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
Main.events
SharedCombat.events
Combat.Damage.events
```

`xx.events` means that `xx` is an arbitrary descriptive base name.

A source file has one of two kinds:

1. **Event-sheet file** — contains scene or external events and has no `function` header.
2. **Function file** — its first nonblank, non-comment statement is a `function` header and the remaining source is that function's event body.

Canonical names are:

```text
<SceneName>.events
<ExternalEventSheetName>.events
<ExtensionName>.<FunctionName>.events
```

The filename is advisory rather than semantic. The compiler target determines the scene or external event sheet, while a function header determines the extension and function name. The `ifdo-ai` profile requires the canonical filename when the integration can control it.

A `.events` file contains at most one function definition. Multiple functions use multiple files.

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
group Combat

if collision Bullet Enemy
do Enemy.health -= Bullet.damage
do delete Bullet

end
```

---

## 6. Comments

A full-line comment begins with `#` after the optional depth prefix.

```events
# Damage the player only when invincibility is off

if collision Player Enemy
if Player.invincible == false
do Player.health -= Enemy.damage
```

A nested comment uses the same depth as the location where the GDevelop comment event is inserted:

```events
if scene begins

> # Restore an existing save
> if global.hasSave == true
> do scene.score = global.savedScore
```

Consecutive comments at the same depth may be combined into one multiline GDevelop comment event by the compiler:

```events
# Player damage
# The timer prevents damage every frame
```

Inline comments are intentionally unsupported:

```text
do Player.health -= 10 # invalid
```

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
js
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
7. Raw lines inside a `js` block are exempt; only the `js` and `end js` lines carry DSL depth.

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
group Combat

if collision Bullet Enemy
do Enemy.health -= Bullet.damage
do delete Bullet

if Enemy.health <= 0
do delete Enemy
do scene.score += 100

end
```

A group name may be an identifier or a quoted string:

```events
group PlayerDamage
```

```events
group "Player Damage"
```

### Group rules

1. `group` and its matching `end` appear at top level.
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

A JavaScript event is an explicit raw-code escape hatch.

```events
js
const score = runtimeScene.getVariables().get("Score");
score.setNumber(score.getAsNumber() + 1);
end js
```

`runtimeScene` is available to the JavaScript body.

### 14.1 Passing picked objects

Use `objects=<ObjectOrGroup>` to pass the selected instances of one object or object group as the `objects` array:

```events
if collision Player Enemy

> js objects=Enemy
  objects.forEach(enemy => {
    enemy.setOpacity(128);
  });
> end js
```

The `js` header and `end js` terminator carry the DSL depth. Lines between them are preserved as raw JavaScript and do not require `>` prefixes.

### 14.2 JavaScript rules

- `end js` must occur at the same DSL depth as the opening `js` line.
- A JavaScript event is a leaf event.
- `#` inside the raw body is JavaScript text, not an IfDo comment.
- The compiler preserves the JavaScript body and line endings, except for optional canonical newline normalization.
- At most one object or object group is passed through `objects=` in version 1.1.
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

A function is a specialized `.events` file whose body is written with the same event syntax as every other sheet. This keeps reusable logic inside one language instead of introducing a second programming model.

One file defines exactly one function. The canonical filename mirrors the qualified name:

```text
Combat.Damage.events
Combat.IsDead.events
UI.HealthLabel.events
```

The function header is the first significant line in the file. There is no closing `end` for the function; the end of the file ends the definition.

### 17.1 Function header

```events
function <kind> <Extension>.<Name> <parameter>:<type> ...
```

Supported core kinds are:

| Kind | Used as | Result type |
|---|---|---|
| `action` | A `do` instruction | No result |
| `condition` | An `if` condition | Boolean |
| `number` | A numeric expression | Number |
| `text` | A text expression | Text |
| `lifecycle` | An engine-called extension hook | No result |

Examples:

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

The qualified name has exactly two semantic parts:

```text
ExtensionName.FunctionName
```

Both parts use normal identifier rules. Extension folders and editor presentation metadata are outside the core DSL.

### 17.2 Parameters

A parameter is declared as:

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

Default parameters, variadic parameters, overloaded function names, and positional custom-function calls are not part of version 1.2.

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
|---|---|
| `condition` | Boolean |
| `number` | Number |
| `text` | Text |

Assigning `result` sets the current return value; it does not immediately stop function execution. A later event may replace it. There is no separate early-return statement in version 1.2.

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

- A function file contains exactly one `function` header.
- The header is at depth zero and precedes all executable events.
- The canonical formatter puts the header on the first physical line.
- The body begins after the header and continues to end of file.
- A function header is invalid in a scene or external event-sheet target.
- A file without a function header is not inferred to be a function from its filename alone.
- The canonical function filename is `<Extension>.<Function>.events`.
- The function becomes an ordinary catalog action, condition, or expression after its signature is registered.
- Cyclic calls are reported; recursive cycles are rejected by the AI profile unless explicitly enabled.

---

## 18. Instruction catalog

The grammar defines event structure. The instruction catalog defines which conditions, actions, and expressions are valid.

A compiler-generated catalog may look like:

```text
CONDITIONS
collision <object> <object>
key <key> pressed|down|released
Platformer.on_floor <object>
timer <timer-reference> >= <duration>
once

ACTIONS
delete <object>
create <object> x=<expression> y=<expression> [layer=<string>]
sound.play <resource>
scene.change <scene>
timer.reset <timer-reference>
Platformer.jump <object>

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
- Registered `.events` function signatures.

### 18.1 Canonical names

Each instruction has one preferred DSL spelling.

Use:

```events
if collision Player Enemy
```

Do not ask the model to choose among synonyms such as:

```text
if Player hits Enemy
if Player touches Enemy
if Player overlaps Enemy
```

Human-input aliases may be accepted, but the formatter and AI profile emit only canonical names.

### 18.2 Named parameters

The registry stores parameter names and types even when GDevelop JSON stores a positional parameter array.

The model writes:

```events
do camera.shake strength=20 duration=0.4s
```

The compiler writes the exact parameter order expected by GDevelop.

### 18.3 Exact-instruction escape hatch

An extension instruction without a friendly alias may be exposed with `@`:

```events
do @AdvancedCamera::ShakeCamera duration=0.4s amplitude=20 layer="" camera=0
```

Rules:

- The exact instruction must exist in the catalog.
- Named arguments are required.
- The model may not invent an `@` instruction.
- Every argument remains type-checked.

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

The parser operates in four stages.

### Stage 0: Detect the file kind

The compiler target declares whether the source is an event sheet or a function. When automatic detection is enabled, the first nonblank, non-comment statement `function` marks a function file. The canonical AI profile places the function header first.

### Stage 1: Recognize raw JavaScript blocks

When a `js` header is found, the parser stores every following physical line as raw code until `end js` at the same DSL depth.

No IfDo tokenization occurs inside the raw body.

### Stage 2: Build depth blocks

For every non-raw line:

1. Count leading `>` characters.
2. Ignore spaces immediately after the depth prefix.
3. Store the remaining statement at that depth.
4. Reject a depth increase greater than one.

Groups are top-level lexical containers delimited by `group` and `end`.

### Stage 3: Parse statements

At a given depth:

- `#` creates a comment event.
- `local` adds a declaration to the next event or current else branch.
- `if` starts a standard event or adds an AND condition before actions begin.
- `or` extends the current condition group.
- `do` adds an action.
- `else if` starts another branch.
- `else` starts the final fallback branch.
- `for each` starts an object loop.
- `for each child` starts a child-variable loop.
- `repeat` starts a fixed-count loop.
- `while` starts a while loop.
- `link` creates a link event.
- `js` creates a JavaScript event.
- `group` starts an event group.
- `end` closes an event group.
- `function` is valid only as the file header and never as a nested statement.

---

## 21. Simplified grammar

The following EBNF describes logical blocks after raw JavaScript extraction and depth processing.

```ebnf
file                = event-sheet-file
                    | function-file ;

event-sheet-file    = event-sheet ;

function-file       = function-header, newline, event-sheet ;

event-sheet         = { top-item } ;

function-header     = "function", function-kind, qualified-name,
                      { parameter } ;

function-kind       = "action" | "condition" | "number" | "text"
                    | "lifecycle" ;

qualified-name      = identifier, ".", identifier ;

parameter           = identifier, ":", parameter-type ;

parameter-type      = type-expression ;

top-item            = comment
                    | group
                    | node ;

group               = "group", group-name, newline,
                      { comment | node },
                      "end", newline ;

node                = { local-declaration },
                      ( standard-event
                      | foreach-object-loop
                      | foreach-child-loop
                      | repeat-loop
                      | while-loop )
                    | link-event
                    | javascript-event ;

local-declaration   = "local", identifier, "=", initializer, newline ;

standard-event      = conditional-event
                    | unconditional-event ;

conditional-event   = condition-group,
                      { condition-group },
                      { action },
                      { child-item },
                      [ else-chain ] ;

unconditional-event = action,
                      { action },
                      { child-item } ;

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

action              = "do", action-expression, newline ;

foreach-object-loop = "for", "each", object-reference,
                      [ "index=", identifier ], newline,
                      child-item,
                      { child-item } ;

foreach-child-loop  = "for", "each", "child", variable-reference,
                      "as", identifier, newline,
                      child-item,
                      { child-item } ;

repeat-loop         = "repeat", expression,
                      [ "index=", identifier ], newline,
                      child-item,
                      { child-item } ;

while-loop          = "while", condition,
                      [ "limit=", expression ],
                      [ "index=", identifier ], newline,
                      { "or", condition, newline },
                      { condition-group },
                      child-item,
                      { child-item } ;

link-event          = "link", ( "external" | "scene" ), string, newline ;

javascript-event    = "js", [ "objects=", object-reference ], newline,
                      raw-javascript,
                      "end", "js", newline ;

child-item          = item-at-parent-depth-plus-one ;

comment             = "#", comment-text, newline ;

condition           = [ "not" ], condition-expression ;
```

Structural line grammar:

```ebnf
source-line         = depth-prefix, statement, newline ;

depth-prefix        = { ">" }, { " " | "\t" } ;

statement           = comment-statement
                    | local-statement
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
                    | javascript-end ;

custom-action-call  = qualified-name, { named-argument } ;

custom-condition-call = qualified-name, { named-argument } ;

custom-expression-call = qualified-name, "(",
                      [ named-argument, { ",", named-argument } ], ")" ;

named-argument      = identifier, "=", expression ;
```

The instruction catalog and expression parser define `condition-expression`, `action-expression`, and ordinary expressions.

---

## 22. Compiler architecture

```text
`.events` source
    ↓
File-kind and function-header scanner
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

| IfDo construct | Semantic GDevelop event kind |
|---|---|
| `if` / `or` / `do` | Standard event |
| `else` | Else event |
| `>` | Child event in the parent event's event list |
| `#` | Comment event |
| `group` ... `end` | Event group |
| `for each Object` | For Each Object event |
| `for each child` | For Each Child Variable event |
| `repeat` | Repeat event |
| `while` | While event |
| `link external` / `link scene` | Link event |
| `js` ... `end js` | JavaScript event |
| `local` | Local-variable data attached to the owning event |
| `function action` | Extension action definition |
| `function condition` | Extension condition definition |
| `function number` / `function text` | Extension expression definition |
| `function lifecycle` | Extension lifecycle definition when supported |
| `do result = ...` | Function return-value action |

The adapter, not the AI, chooses exact internal JSON type identifiers and field names.

### 22.2 Suggested compiler API

```text
compile(source, projectContext, target, options) -> CompileResult
```

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
- Missing group `end`.
- Nested groups in the AI profile.
- Loops without bodies.
- Conditional events without actions or sub-events.
- Inline IfDo comments.
- Unknown statement keywords.
- Local declarations after an event header.
- Duplicate local, loop-counter, or child aliases.
- Unterminated JavaScript blocks.
- `end js` at the wrong depth.
- More than one function header.
- A function header below depth zero or after executable statements.
- A function header in an event-sheet target.
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
- Function filenames that do not match `<Extension>.<Function>.events` when filename enforcement is enabled.

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

20 | js objects=Enemy
     ^^

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

1 | function condition Combat.IsDead target:object
    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The `ifdo-ai` profile requires an unconditional `do result = false`
before conditional result assignments.
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
5. Put a blank line after `group` and before `end` when non-empty.
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
16. Put a function header on the first physical line of a function file.
17. Use named arguments for every custom-function call.
18. Use `<Extension>.<Function>.events` as the canonical function filename.
19. Initialize `result` unconditionally in AI-generated condition and expression functions.

Canonical example:

```events
group "Player Damage"

# Apply damage from enemies or projectiles

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

end
```

---

## 25. Complete examples

### 25.1 Standard events, locals, OR, else, groups, and sub-events

```events
group Combat

# Damage the player

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

# Choose the health animation

if Player.health <= 0
do Player.animation = "Dead"
else if Player.health < 30
do Player.animation = "Hurt"
else
do Player.animation = "Idle"

end
```

### 25.2 Every loop type

```events
group Loops

# Process each enemy instance

for each Enemy index=i
> if Enemy.health <= 0
> do Enemy.deathOrder = i
> do delete Enemy

# Process every child in an inventory structure

local total = 0
for each child scene.inventory as item
> do local.total += item.value
> do DebugText.text = item.name + ": " + item.value

# Create fixed rewards

local spacing = 50
repeat 5 index=i
> do create Coin x=100+i*local.spacing y=200

# Drain a queue safely

while scene.queueSize > 0 limit=1000 index=i
> do scene.queueSize -= 1
> do DebugText.text = "Processed " + (i + 1)

end
```

### 25.3 Linked events and JavaScript

```events
group Reuse

link external "Shared Player Logic"
link scene "Base Level"

end

group "Advanced Escape Hatch"

if collision Player Enemy

> js objects=Enemy
  objects.forEach(enemy => {
    enemy.setOpacity(128);
  });
> end js

end
```


### 25.4 Action, condition, and expression functions

`Combat.Damage.events`:

```events
function action Combat.Damage target:object amount:number canKill:boolean

local finalAmount = max(0, amount)

if target.health > 0
do target.health -= local.finalAmount

> if target.health <= 0
> if canKill
> do delete target
```

`Combat.IsDead.events`:

```events
function condition Combat.IsDead target:object

do result = false

if target.health <= 0
do result = true
```

`Combat.DamageForLevel.events`:

```events
function number Combat.DamageForLevel level:number base:number

do result = base + level * 2
```

`Main.events`:

```events
group Combat

if collision Player Enemy
do Combat.Damage target=Player amount=Combat.DamageForLevel(level=Enemy.level, base=10) canKill=true

if Combat.IsDead target=Player
do scene.change "GameOver"

end
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
- Do not emit `js` unless JavaScript is explicitly allowed.
- Prefer catalog events over JavaScript.
- Prefer named arguments for complex instructions.
- Use the `.events` file extension.
- A function file starts with exactly one `function` header.
- Use one function per file and the filename `<Extension>.<Function>.events`.
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
# text

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
group Name
...
end

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
js objects=Object
raw JavaScript
end js

FUNCTION FILE
function action Extension.Name target:object amount:number
function condition Extension.Name target:object
function number Extension.Name value:number
function text Extension.Name value:text

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
Raw-block scanner and parser check structure
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

Diagnostics should refer to IfDo source rather than exposing raw JSON errors to the model.

---

## 28. Version 1.2 feature set

### Included

- Standard conditional events.
- Unconditional standard events.
- Multiple AND condition groups.
- OR alternatives.
- Negation.
- Trigger once.
- Actions and assignments.
- Local variables on standard events, else branches, and loops.
- Else and else-if.
- Sub-events.
- Event groups.
- Full-line comments.
- For Each Object loops.
- For Each Child Variable loops.
- Fixed-count Repeat loops.
- While loops with optional safety limits and counters.
- Link events for external event sheets and scene event sheets.
- JavaScript code events with optional picked-object input.
- Scene, global, local, object, behavior, and loop-alias namespaces.
- Structure and array indexing.
- Project-aware instruction catalog.
- Named instruction parameters.
- Exact extension-instruction escape hatch.
- Source maps and repairable diagnostics.
- `.events` source-file convention.
- One function definition per function file.
- Action, condition, number-expression, text-expression, and catalog-listed lifecycle functions.
- Typed read-only function parameters.
- Named action, condition, and expression function calls.
- Typed `result` handling.
- Function-call validation and recursion checks.

### Deferred

- Asynchronous function syntax.
- Function parameter defaults, variadic parameters, and overloads.
- Function editor presentation metadata in source.
- Macros.
- Object, scene, resource, behavior, or extension declarations.
- Nested organizational groups in the AI profile.
- Inline IfDo comments.
- Custom operators.
- Indentation-sensitive blocks.
- Multiple picked-object parameters for a JavaScript event.
- Editor layout metadata unrelated to event meaning.
- Disabled/collapsed presentation metadata as first-class syntax.

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
15. **The filename convention is `xx.events`; function files canonically use `<Extension>.<Function>.events`.**

The complete structural foundation remains small:

```events
# comment

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

js
// raw JavaScript
end js

group Name
# events
end

function action Extension.Name target:object amount:number
# function events
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
