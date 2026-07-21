# Use GDevelop Static Data and placeholders

Static Data is project-wide, TOML-compatible, static authoring data. Use it
for balance values, content definitions, feature defaults, stable identifiers,
and other configuration that should be substituted into generated game data.
It is not a runtime variable store and it is never a place for secrets.

## Contents

1. [Choose Static Data or variables](#choose-static-data-or-variables)
2. [Multi-file source ownership](#multi-file-source-ownership)
3. [Author static-data.toml correctly](#author-static-datatoml-correctly)
4. [Keep data TOML-compatible](#keep-data-toml-compatible)
5. [Placeholder path syntax](#placeholder-path-syntax)
6. [Resolution behavior](#resolution-behavior)
7. [Use placeholders in events](#use-placeholders-in-events)
8. [Use placeholders in string variables](#use-placeholders-in-string-variables)
9. [Use placeholders in custom-object and behavior properties](#use-placeholders-in-custom-object-and-behavior-properties)
10. [Design reusable components](#design-reusable-components)
11. [Complete examples](#complete-examples)
12. [Edit rules](#edit-rules)
13. [Validate and debug](#validate-and-debug)
14. [Failure patterns](#failure-patterns)
15. [Authoring checklist](#authoring-checklist)

## Choose Static Data or variables

Use Static Data for values that are:

- Shared across the project.
- Authored before the game runs.
- TOML-compatible data such as balance tables, card definitions, localization
  fragments, static signal names, or environment defaults.
- Safe to compile into preview/export output as literals.

Use global, scene, object, or local variables for values that:

- Change during gameplay.
- Must be read or written dynamically by runtime events.
- Need save-game persistence, networking, or live synchronization.
- Depend on the current scene/session/player.

Changing Static Data does not mutate a running preview. Its placeholders are
resolved while code and runtime object data are generated, so regenerate or
relaunch the preview/export after every relevant static data change.

Never store passwords, service credentials, private API keys, signing material,
or other secrets. Resolved values are compiled into exported game code/data and
can be inspected by players.

## Multi-file source ownership

In a canonical multi-file project, `static-data.toml` is the sole source for the
complete Static Data object. It is discovered by its fixed root path; do not
add a reference to it in `project.settings`.

Ownership is strict:

- The whole TOML document is user configuration data.
- There is no `[settings]` or `[staticData]` wrapper and no format metadata.
- `project.settings` must not contain a static-data table in newly authored
  sources.

An explicit empty Static Data is an empty `static-data.toml` file.

The GDevelop editor auto-saves grid, Raw TOML, Raw JSON, and import changes to
this file for local multi-file projects. A normal project save also writes the
same source; neither path adds Static Data to `project.settings`.

Do not edit `.gdevelop/game.json`; it is generated output and does not contain
Static Data. Runtime exports also omit the map after resolving supported
placeholders.

## Author static-data.toml correctly

The Static Data root is the TOML document itself. Strings, finite numbers,
booleans, nested tables, homogeneous arrays, and arrays of tables map naturally
to the editor's static configuration object. Keep the source unindented and
write data directly at the root.

Example project configuration:

```toml
[gameplay]
startingLives = 3
friendlyFire = false
difficultyNames = ["Story", "Normal", "Expert"]

[signals.card]
selected = "Card.Selected"
refresh = "Card.Refresh"

[cards.Sunflower]
displayName = "Sunflower"
price = 50
cooldown = 7.5
enabled = true
tags = ["plant", "producer"]

[cards.Sunflower.stats]
health = 100
production = 25
```

This resolves to the conceptual JSON object:

```json
{
  "gameplay": {
    "startingLives": 3,
    "friendlyFire": false,
    "difficultyNames": ["Story", "Normal", "Expert"]
  },
  "signals": {
    "card": {
      "selected": "Card.Selected",
      "refresh": "Card.Refresh"
    }
  },
  "cards": {
    "Sunflower": {
      "displayName": "Sunflower",
      "price": 50,
      "cooldown": 7.5,
      "enabled": true,
      "tags": ["plant", "producer"],
      "stats": { "health": 100, "production": 25 }
    }
  }
}
```

Principles:

- Group by domain (`cards`, `audio`, `signals`, `levels`) rather than by the
  UI screen that currently edits the values.
- Give every field one stable type. Do not make `price` a number for one item
  and text for another.
- Use meaningful keys that survive content reordering. Prefer
  `cards.Sunflower` to `cards[0]` for durable references.
- Keep casing consistent. Paths are case-sensitive.
- Avoid duplicating the same value under several paths. Choose one canonical
  owner and reference it.
- Preserve unknown existing keys and the user's ordering when making a focused
  edit.

TOML has special key syntax. Quote keys that contain dots, spaces, or punctuation
when they should remain one JSON key:

```toml
[cards."sun.flower"]
displayName = "Sun Flower"

[localization."backpack.title"]
en = "Knight's Backpack"
cn = "骑士背包"
```

## Keep data TOML-compatible

`static-data.toml` has no hidden fallback or reserved metadata namespace. Values
must therefore be representable directly and losslessly in TOML. JSON `null`,
mixed-type arrays such as `[1, "two"]`, non-finite numbers, dates, and integers
outside JavaScript's safe range are rejected.

Use a meaningful TOML-compatible alternative when the data model allows it:
omit an optional key instead of storing `null`, use a string status such as
`"none"`, or replace a mixed tuple with a table containing named fields. Do not
encode JSON inside a string merely to bypass validation; placeholders would see
the string rather than the intended structured value.

A user key literally named `rawJson` is ordinary configuration data. It has no
serializer meaning.

## Placeholder path syntax

A placeholder is a string fragment with a path between double braces:

```text
{{cards.Sunflower.price}}
{{ cards.Sunflower.price }}
{{waves[0].enemies[2].type}}
{{cards["sun.flower"].price}}
{{localization['backpack.sections.weapons'].en}}
```

Path rules:

- Dot segments address object keys.
- Non-negative bracket numbers address array indexes.
- Quoted bracket segments address keys containing dots, spaces, brackets, or
  other punctuation.
- Whitespace around the whole path and inside brackets is ignored.
- A backslash inside a quoted bracket segment escapes the next character. Keep
  complex keys simple instead of depending on JSON-style escape semantics.
- Empty paths such as `{{}}` are invalid.
- Missing object keys or out-of-range indexes are errors; reads do not create
  static data entries.

Prefer dot paths for stable identifier-like keys and quoted bracket paths only
when the source data genuinely requires punctuation:

```text
{{cards.Sunflower.price}}
{{cards["sun.flower"].price}}
```

## Resolution behavior

Placeholders are textual substitutions performed during code generation or
runtime-data generation. Multiple placeholders and surrounding text are
supported on eligible string surfaces:

```text
Cost: {{cards.Sunflower.price}} / Cooldown: {{cards.Sunflower.cooldown}}s
```

Values convert as follows:

| Static Data value                      | Substitution text                                         |
| -------------------------------------- | --------------------------------------------------------- |
| String                                 | Raw string contents                                       |
| Number                                 | Number text                                               |
| Boolean                                | `true` or `false`                                         |
| Object/array                           | Compact JSON text                                         |
| Missing path or empty placeholder path | Resolution error; source text is retained for diagnostics |

The runtime game does not load the Static Data map and there is no runtime
Static Data event-tool API. Once generation succeeds, the game contains the
resolved literals/object data, not live `{{...}}` lookups.

This also means a placeholder is not a general GDevelop expression. Do not use:

```text
10 + {{cards.Sunflower.price}}
Variable({{variableName}})
{{runtime.Variable(Path)}}
```

The first is invalid in a numeric expression, the second assumes structural
code substitution that is not supported, and the third is not a static data path.

## Use placeholders in events

Read the events DSL guide and `.gdevelop/instructions-catalog.json` before
editing. With a project context, current instruction code generation enables
Static Data replacement for both actions and conditions. String-expression
text nodes are the primary supported surface. Some raw string-like parameter
types (such as keys, mouse buttons, resources, and otherwise unknown string
parameters) also pass through the resolver, but use them only when the current
editor/catalog accepts the value and preview/export verification proves the
result. Numeric-expression operands are not textual placeholder surfaces.

The IfDo parameter value remains a JSON string containing a serialized GDevelop
operand. For a constant string expression, preserve both layers of quoting:

```events
@event aiGeneratedEventId="emit-configured-signal"
if SceneJustBegins
do EmitSceneSignal signal_name="\"{{signals.card.refresh}}\"" payload="\"startup\""
```

If `signals.card.refresh` is `Card.Refresh`, generated code receives the literal
signal name `Card.Refresh`.

String interpolation in an action operand:

```events
@event aiGeneratedEventId="log-configured-price"
if SceneJustBegins
do DebuggerTools::ConsoleLog message_to_log="\"Sunflower costs {{cards.Sunflower.price}}\""
```

Safe event-use principles:

- Prefer placeholders in catalog-declared string-expression parameters on
  ordinary actions or conditions.
- Preserve GDevelop expression quoting; the braces live inside the serialized
  string expression, not around the IfDo argument.
- Keep numeric expressions literal/runtime-driven.
- Keep the special `SignalReceived` signal-name filter literal. Its standard
  event code generator performs a separate delivered-signal lookup, so do not
  assume the general condition replacement path applies to that lookup.
- Treat resource placeholders as a dependency change: verify that the resolved
  resource exists and is included in generated/exported data.
- Re-read the instruction catalog for scope and exact `dslName` arguments.
- A missing path must fail validation; never silently replace it with an empty
  string or a guessed default.

## Use placeholders in string variables

The initial `value` of a string-type global, scene, object, prefab, or variant
variable is an eligible placeholder surface. The placeholder is resolved while
runtime variable data is generated, before the variable is created.

An exact placeholder may point to a primitive, object, or array. Objects and
arrays resolve to compact JSON text, so one string variable can carry a complete
Static Data subtree. Do not duplicate the subtree as leaf-by-leaf variable
descriptors.

The canonical localization shape for the Static Data window is row-oriented:
each row key is the complete, stable UI path and each column is a locale code.
For GUI text, use a key such as `backpack.sections.weapons`; no leading dot is
needed. Quote the key in TOML so its internal dots remain part of one literal
row key instead of creating nested tables:

```toml
[i18n]
defaultLocale = "en"
supportedLocales = ["en", "cn"]

[localization."backpack.title"]
en = "Knight's Backpack"
cn = "骑士背包"

[localization."backpack.sections.weapons"]
en = "Weapons"
cn = "武器"
```

Keep localization metadata such as `defaultLocale` and `supportedLocales` in a
sibling table such as `i18n`, not inside `localization`. This keeps the
`localization` grid homogeneous: every row key is a translation key and every
column is a locale, without an extra generic `value` column. In the Static Data
window, the example above appears as rows `backpack.title` and
`backpack.sections.weapons` with editable `en` and `cn` cells, so users can
update translations directly in the grid.

Do not invert this model by making `title`, `prompt`, or `sections` the columns
and putting locale objects inside their cells. Do not author a nested table such
as `[localization.backpack.sections.weapons]` either. Both shapes turn the
translation hierarchy into nested JSON-like cell values and make later edits in
the Static Data window unnecessarily difficult.

Because each dotted row key is one literal child name, consumers use quoted
bracket segments:

```text
{{localization['backpack.title'].en}}
{{localization['backpack.sections.weapons'].cn}}
```

Reference the complete localization object once:

```toml
[variables]
Locale = [{ type = "string", value = "{{i18n.defaultLocale}}" }]
Translations = [{ type = "string", value = "{{localization}}" }]
```

At startup, `Translations` contains compact JSON text such as
`{"backpack.title":{"en":"Knight's Backpack","cn":"骑士背包"},...}`. When
events need variable-style child access, convert that same variable once before
its first consumer:

```events
@event aiGeneratedEventId="initialize-localization"
if SceneJustBegins
do JSONToVariableStructure2 json_string="GlobalVariableString(Translations)" variable_where_to_store_the_json_object="Translations"
```

After conversion, the variable is a normal mutable structure. A quoted Static
Data row key such as `backpack.title` remains one child name containing dots;
it is not automatically expanded into nested `backpack` then `title` children.

Variable rules:

- Put the placeholder in a descriptor whose `type` is `string` and keep its
  normal `value` field. Interpolation and exact placeholders are both allowed.
- Prefer one exact subtree placeholder such as `{{localization}}` when the
  Static Data value is an object or array. The result is compact JSON text.
- Use the catalog's JSON-to-variable conversion action once if runtime events
  need structure/array child access. The destination may be the same variable.
- Do not write `value = "{{...}}"` on a `structure` or `array` descriptor;
  those descriptor types serialize `children`, not `value`. Use a string root
  placeholder and convert it at runtime instead.
- Interpolating an object or array into surrounding text also emits compact
  JSON, but only an exact subtree placeholder is appropriate for later parsing.
- This rule does not make numeric or boolean variable initializers general
  placeholder surfaces. Keep those values literal unless another documented
  configuration surface performs the typed conversion.
- The runtime variable is ordinary mutable data after initialization or JSON
  conversion. Changing it does not change Static Data, and changing Static Data
  does not update an already running preview.
- Missing paths are generation errors just as they are on event and property
  surfaces.

Prefer direct string-variable initialization over scene-start copy actions when
the value is static configuration. Add only the one-time JSON conversion when a
runtime variable tree is actually needed.

## Use placeholders in custom-object and behavior properties

Event-based object and behavior properties are another supported boundary.
Their configured values are resolved before static runtime object/behavior data
is emitted.

| Property type         | Placeholder rule                                                |
| --------------------- | --------------------------------------------------------------- |
| String/text           | Interpolation or an exact placeholder                           |
| Number                | Exact whole placeholder only                                    |
| Boolean               | Exact whole placeholder only                                    |
| `JsonObject`          | Exact subtree placeholder or valid JSON text                    |
| Choice/resource/color | Do not use unless current editor/catalog explicitly supports it |

Valid number and boolean property values:

```text
{{cards.Sunflower.price}}
{{cards.Sunflower.enabled}}
```

Invalid number property value:

```text
10 + {{cards.Sunflower.price}}
```

For a reusable prefab that needs several related fields, prefer one
`JsonObject` property such as `CardConfig`:

```text
Configured property value: {{cards.Sunflower}}
```

The `JsonObject` property descriptor must contain a required JSON object example
that describes every child the events will access, for example:

```json
{
  "displayName": "Example card",
  "price": 0,
  "cooldown": 0,
  "enabled": false,
  "stats": {
    "health": 0,
    "production": 0
  }
}
```

The example powers autocomplete and validation for paths such as:

```text
CardConfig.price
CardConfig.stats.health
```

At generation, the resolved JSON subtree becomes a `gdjs.Variable`-style
structure. `JsonObject` properties do not receive the generated primitive
getter/setter functions used for scalar properties; read their children with
variable-style property expressions inside the owning object/behavior events.

The property descriptor's JSON example and an individual object's configured
property value are different responsibilities. Do not replace the example with
`{{cards.Sunflower}}`: keep a concrete JSON schema example, then put the
placeholder in the actual object/behavior configuration value. Exact serialized
locations vary by object type and owner; inspect the target `.settings` data and
`settings-catalog.json`, and copy a compatible existing property configuration
shape rather than inventing serializer fields.

## Design reusable components

Direct project-owned extension events can resolve project placeholders when
generated with their project context, but direct placeholders make an extension
project-specific. Extension export rejects serialized extensions containing a
Static Data placeholder.

For a reusable/exportable component:

1. Define scalar parameters/properties or a `JsonObject` property on the
   prefab/behavior.
2. Configure those properties from the project with exact placeholders.
3. Read the injected property/parameter inside extension events.
4. Keep direct `{{...}}` text out of the extension's reusable event logic.

Preferred architecture:

```text
project static data: cards.Sunflower
  -> scene object configuration: CardConfig = {{cards.Sunflower}}
  -> prefab events: CardConfig.price, CardConfig.stats.health
```

This keeps the component contract explicit, supports autocomplete through its
JSON example, and avoids coupling extension source to one project's static data
paths.

## Complete examples

### Balance data plus feature defaults

```toml
[features]
tutorialEnabled = true
analyticsEnabled = false

[balance.player]
startingHealth = 100
moveSpeed = 240

[balance.enemies.Slime]
health = 30
damage = 8
```

Use these as static property defaults/configured values. A string variable may
reference Static Data directly in its initial `value`; use an initialization
event when a runtime value needs typed conversion, derivation, or later refresh.

### Arrays and special keys

```toml
[waves]
names = ["opening", "pressure", "boss"]

[menuLabels."main menu"]
title = "Start game"
subtitle = "Choose a save slot"
```

Placeholders:

```text
{{waves.names[2]}}
{{menuLabels['main menu'].title}}
```

### Static signal-name registry

```toml
[signals.inventory]
request = "Inventory.Request"
result = "Inventory.Result"
```

Guarded emit action:

```events
if SceneJustBegins
do EmitSceneSignal signal_name="\"{{signals.inventory.request}}\"" payload="\"initial-load\""
```

Read [signal-system.md](signal-system.md) for target semantics, receiver rules,
and `onSignal` lifecycle constraints.

### Unsupported null and heterogeneous content

Conceptual JSON:

```json
{
  "release": { "label": null },
  "spawnPattern": [1, "elite", true]
}
```

This value cannot be stored in `static-data.toml`. Omit `release.label` or replace it
with an explicit TOML-compatible status, and model `spawnPattern` as a table or
an array whose elements share one TOML type.

## Edit rules

- Read the whole current `static-data.toml` before modifying one subtree.
- Edit direct-root data only; do not add metadata or wrapper tables.
- Do not duplicate static data in `project.settings`.
- Do not add a manifest/index entry for `static-data.toml`.
- Preserve an absent static data file when the project truly has no Static Data;
  use an empty file only when an explicit empty static data object is part
  of the requested source.
- Search every `{{...}}` reference before renaming or deleting a key. Update
  static data and all consumers atomically.

## Validate and debug

After editing:

1. Parse `static-data.toml` as a standalone root TOML document.
2. Confirm every value is directly TOML-compatible and every number is finite
   and within the safe integer range.
3. Confirm there are no `[settings]`, `[staticData]`, format-version, or
   serializer wrappers.
4. Search changed placeholder paths and confirm their exact type/value.
5. Confirm each use is on a supported action, string-variable, or property
   surface.
6. Reload the project. Treat a reload error as a source-format failure and fix
   `static-data.toml`.
7. Launch a fresh preview/export generation. Missing placeholders appear in
   diagnostics under the message family “A value in the project static data”
   and can block a valid preview/export.
8. Exercise every configured component and verify the generated value/type,
   including `JsonObject` child paths.

When a path is missing, resolution retains the original source text so the
diagnostic remains visible. Fix the static data path or consumer; do not hide the
error with a fabricated value unless that default is part of the user's design.

## Failure patterns

- Treating Static Data as runtime mutable state.
- Editing generated `.gdevelop/game.json` instead of `static-data.toml`.
- Putting static data in `project.settings`.
- Adding `[settings]`, `[staticData]`, or serializer metadata wrappers.
- Trying to store JSON `null`, mixed-type arrays, dates, or unsafe integers.
- Using inconsistent types for the same field across content records.
- Nesting localization by UI hierarchy or storing locale objects inside cells,
  instead of using one complete dotted UI key per row and locale codes as columns.
- Using a placeholder in a numeric event expression or receiving condition.
- Repeating one object subtree as many leaf placeholders instead of using one
  string root placeholder and a JSON-to-variable conversion.
- Putting `value = "{{...}}"` on a structure/array descriptor even though those
  descriptor types serialize `children`.
- Assuming a resolved string variable remains linked to Static Data at runtime.
- Omitting the nested GDevelop-expression quotes in an IfDo string operand.
- Using number/boolean interpolation instead of an exact whole placeholder.
- Replacing a `JsonObject` descriptor's concrete JSON example with a placeholder.
- Referencing a `JsonObject` child absent from its example schema.
- Embedding direct project static data paths in an extension intended for export.
- Expecting a running preview to update without regeneration.
- Storing secrets in data that will be compiled into the exported game.

## Authoring checklist

- Decide explicitly why the value belongs in Static Data rather than runtime state.
- Read the complete `static-data.toml` and relevant owner `.settings`/events.
- Author user data directly at the TOML root with no wrapper or metadata.
- Use only values TOML represents losslessly.
- Choose stable, case-consistent, typed paths.
- For localization, use complete GUI keys such as `backpack.sections.weapons`
  as rows and locale codes such as `en` and `cn` as columns; do not add a
  leading dot, and quote the dotted row keys in TOML.
- Verify every placeholder path, bracket segment, and array index.
- Use placeholders only on supported action, string-variable, or property
  surfaces.
- Keep variable placeholders in string descriptor `value` fields. For an
  object/array subtree, prefer one exact root placeholder and convert its JSON
  text once when runtime child access is needed.
- Keep scalar property placeholders exact where required and give every
  `JsonObject` property a concrete, complete JSON example.
- Inject static data through properties/parameters for reusable extensions.
- Update all consumers atomically when paths change.
- Reload and regenerate a fresh preview/export, then resolve all missing-static data
  diagnostics.
