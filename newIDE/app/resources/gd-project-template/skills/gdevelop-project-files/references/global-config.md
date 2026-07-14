# Use GDevelop Global Config and placeholders

Global Config is project-wide, JSON-compatible, static authoring data. Use it
for balance values, content definitions, feature defaults, stable identifiers,
and other configuration that should be substituted into generated game data.
It is not a runtime variable store and it is never a place for secrets.

## Contents

1. [Choose Global Config or variables](#choose-global-config-or-variables)
2. [Multi-file source ownership](#multi-file-source-ownership)
3. [Author config.settings correctly](#author-configsettings-correctly)
4. [Represent null and mixed JSON safely](#represent-null-and-mixed-json-safely)
5. [Placeholder path syntax](#placeholder-path-syntax)
6. [Resolution behavior](#resolution-behavior)
7. [Use placeholders in events](#use-placeholders-in-events)
8. [Use placeholders in custom-object and behavior properties](#use-placeholders-in-custom-object-and-behavior-properties)
9. [Design reusable components](#design-reusable-components)
10. [Complete examples](#complete-examples)
11. [Edit and migration rules](#edit-and-migration-rules)
12. [Validate and debug](#validate-and-debug)
13. [Failure patterns](#failure-patterns)
14. [Authoring checklist](#authoring-checklist)

## Choose Global Config or variables

Use Global Config for values that are:

- Shared across the project.
- Authored before the game runs.
- JSON-compatible data such as balance tables, card definitions, localization
  fragments, static signal names, or environment defaults.
- Safe to compile into preview/export output as literals.

Use global, scene, object, or local variables for values that:

- Change during gameplay.
- Must be read or written dynamically by runtime events.
- Need save-game persistence, networking, or live synchronization.
- Depend on the current scene/session/player.

Changing Global Config does not mutate a running preview. Its placeholders are
resolved while code and runtime object data are generated, so regenerate or
relaunch the preview/export after every relevant config change.

Never store passwords, service credentials, private API keys, signing material,
or other secrets. Resolved values are compiled into exported game code/data and
can be inspected by players.

## Multi-file source ownership

In a canonical multi-file project, `config.settings` is the sole source for the
complete Global Config object. It is discovered by its fixed root path; do not
add a reference to it in `project.settings`.

Ownership is strict:

- `[globalConfig]` is format metadata owned by the multi-file serializer.
- `[globalConfig.rawJson]` is format-owned fallback storage for JSON values
  that cannot be represented directly by the TOML projection.
- `[settings]` and its descendants are user configuration data.
- `project.settings` must not contain a global-config table in newly authored
  sources.

Minimal empty source:

```toml
[globalConfig]
settingsFormatVersion = 1

[settings]
```

Do not edit `.gdevelop/game.json`; it is generated compatibility/runtime
output. Older design documents or project formats may mention a separate
`globalConfig.json` or a top-level `globalConfig` inside legacy JSON. Those are
compatibility formats, not the current multi-file authoring contract.

## Author config.settings correctly

The Global Config root must be a JSON object. TOML strings, finite numbers,
booleans, nested tables, arrays, and arrays of tables map naturally to JSON.
Keep settings source unindented and local-root like every other `.settings`
fragment.

Example project configuration:

```toml
[globalConfig]
settingsFormatVersion = 1

[settings.gameplay]
startingLives = 3
friendlyFire = false
difficultyNames = ["Story", "Normal", "Expert"]

[settings.signals.card]
selected = "Card.Selected"
refresh = "Card.Refresh"

[settings.cards.Sunflower]
displayName = "Sunflower"
price = 50
cooldown = 7.5
enabled = true
tags = ["plant", "producer"]

[settings.cards.Sunflower.stats]
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
[settings.cards."sun.flower"]
displayName = "Sun Flower"

[settings.localization."main menu"]
title = "Play"
```

## Represent null and mixed JSON safely

The multi-file serializer projects JSON into TOML, but JSON `null` and certain
arrays have no lossless direct representation under this contract. Store those
values as canonical JSON text in `[globalConfig.rawJson]`, keyed by RFC 6901
JSON Pointer.

Example:

```toml
[globalConfig]
settingsFormatVersion = 1

[globalConfig.rawJson]
"/optionalValue" = "null"
"/mixed" = '[1,"two",true]'
"/cards/Sunflower/rewards" = '[null,{"kind":"coin","amount":2}]'

[settings]
enabled = true
```

Rules for raw JSON entries:

- Each pointer starts with `/` and is relative to the Global Config root.
- Escape `~` in a key as `~0` and `/` as `~1`. A JSON key `a/b~c` uses pointer
  token `a~1b~0c`.
- The value must be a TOML string containing canonical `JSON.stringify` text:
  no optional whitespace and no alternate numeric/string spelling.
- Direct array elements of mixed JSON kinds, or a direct `null` element, cause
  that array to use raw JSON. Homogeneous arrays can remain normal TOML.
- A nested `null` inside an otherwise projectable object/array may be stored at
  its own deeper pointer.
- A raw pointer must not overlap ordinary projected data or be a parent/child
  of another raw pointer.
- Non-finite numbers (`NaN`, positive/negative infinity) are invalid and cannot
  be stored.

`[settings.rawJson]` is not serializer metadata. It is an ordinary,
legal user key named `rawJson` and must be preserved independently from
`[globalConfig.rawJson]`.

Do not hand-convert ordinary strings/numbers/booleans to raw JSON. Use the
fallback only where the value cannot be represented losslessly, and preserve
existing fallback entries unless deliberately changing their owned paths.

## Placeholder path syntax

A placeholder is a string fragment with a path between double braces:

```text
{{cards.Sunflower.price}}
{{ cards.Sunflower.price }}
{{waves[0].enemies[2].type}}
{{cards["sun.flower"].price}}
{{localization['main menu'].title}}
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
  config entries.

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

| Config value | Substitution text |
| --- | --- |
| String | Raw string contents |
| Number | Number text |
| Boolean | `true` or `false` |
| Object/array | Compact JSON text |
| JSON `null` | Empty text |
| Missing path or empty placeholder path | Resolution error; source text is retained for diagnostics |

The runtime game does not load the Global Config map and there is no runtime
Global Config event-tool API. Once generation succeeds, the game contains the
resolved literals/object data, not live `{{...}}` lookups.

This also means a placeholder is not a general GDevelop expression. Do not use:

```text
10 + {{cards.Sunflower.price}}
Variable({{variableName}})
{{runtime.Variable(Path)}}
```

The first is invalid in a numeric expression, the second assumes structural
code substitution that is not supported, and the third is not a config path.

## Use placeholders in events

Read the events DSL guide and `.gdevelop/instructions-catalog.json` before
editing. With a project context, current instruction code generation enables
Global Config replacement for both actions and conditions. String-expression
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

## Use placeholders in custom-object and behavior properties

Event-based object and behavior properties are another supported boundary.
Their configured values are resolved before static runtime object/behavior data
is emitted.

| Property type | Placeholder rule |
| --- | --- |
| String/text | Interpolation or an exact placeholder |
| Number | Exact whole placeholder only |
| Boolean | Exact whole placeholder only |
| `JsonObject` | Exact subtree placeholder or valid JSON text |
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
Global Config placeholder.

For a reusable/exportable component:

1. Define scalar parameters/properties or a `JsonObject` property on the
   prefab/behavior.
2. Configure those properties from the project with exact placeholders.
3. Read the injected property/parameter inside extension events.
4. Keep direct `{{...}}` text out of the extension's reusable event logic.

Preferred architecture:

```text
project config: cards.Sunflower
  -> scene object configuration: CardConfig = {{cards.Sunflower}}
  -> prefab events: CardConfig.price, CardConfig.stats.health
```

This keeps the component contract explicit, supports autocomplete through its
JSON example, and avoids coupling extension source to one project's config
paths.

## Complete examples

### Balance data plus feature defaults

```toml
[globalConfig]
settingsFormatVersion = 1

[settings.features]
tutorialEnabled = true
analyticsEnabled = false

[settings.balance.player]
startingHealth = 100
moveSpeed = 240

[settings.balance.enemies.Slime]
health = 30
damage = 8
```

Use these as static property defaults/configured values. Copy them into runtime
variables at initialization only if gameplay must later mutate them.

### Arrays and special keys

```toml
[globalConfig]
settingsFormatVersion = 1

[settings.waves]
names = ["opening", "pressure", "boss"]

[settings.localization."main menu"]
title = "Start game"
subtitle = "Choose a save slot"
```

Placeholders:

```text
{{waves.names[2]}}
{{localization['main menu'].title}}
```

### Static signal-name registry

```toml
[globalConfig]
settingsFormatVersion = 1

[settings.signals.inventory]
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

### Null and heterogeneous content

Conceptual JSON:

```json
{
  "release": { "label": null },
  "spawnPattern": [1, "elite", true]
}
```

Canonical source:

```toml
[globalConfig]
settingsFormatVersion = 1

[globalConfig.rawJson]
"/release/label" = "null"
"/spawnPattern" = '[1,"elite",true]'

[settings.release]
channel = "preview"
```

## Edit and migration rules

- Read the whole current `config.settings` before modifying one subtree.
- Edit only `[settings]` data and intentionally owned raw JSON
  pointers; preserve `[globalConfig]` fields.
- Keep `settingsFormatVersion = 1` and reject unknown metadata keys rather than
  moving them into user config.
- Do not duplicate config in `project.settings`.
- Do not add a manifest/index entry for `config.settings`.
- Preserve an absent config file when the project truly has no Global Config;
  use the minimal empty form only when an explicit empty config object is part
  of the requested source.
- When migrating old project data, move the complete root object into the new
  config source and preserve types exactly, using raw pointers where necessary.
- Search every `{{...}}` reference before renaming or deleting a key. Update
  config and all consumers atomically.
- Preserve the difference between a missing key and an explicit JSON `null`.

## Validate and debug

After editing:

1. Parse `config.settings` as standalone TOML, mount `[settings]` at
   `project.globalConfig`, and verify the strict combined merge.
2. Confirm the root under `[settings]` is an object and every number
   is finite.
3. Validate every raw pointer, RFC 6901 escape, canonical JSON string, and
   non-overlap rule.
4. Search changed placeholder paths and confirm their exact type/value.
5. Confirm each use is on a supported action/property surface.
6. Reload the project. A reload error is a source-format failure, not something
   to work around with a legacy JSON edit.
7. Launch a fresh preview/export generation. Missing placeholders appear in
   diagnostics under the message family “A value in the project global config”
   and can block a valid preview/export.
8. Exercise every configured component and verify the generated value/type,
   including `JsonObject` child paths.

When a path is missing, resolution retains the original source text so the
diagnostic remains visible. Fix the config path or consumer; do not hide the
error with a fabricated value unless that default is part of the user's design.

## Failure patterns

- Treating Global Config as runtime mutable state.
- Editing `.gdevelop/game.json`, legacy project JSON, or an obsolete
  `globalConfig.json` instead of `config.settings`.
- Putting global config in `project.settings`.
- Editing format metadata as user data or confusing the two `rawJson` tables.
- Writing JSON `null` directly as TOML or storing non-canonical raw JSON.
- Overlapping raw pointers or forgetting `~0`/`~1` pointer escaping.
- Using inconsistent types for the same field across content records.
- Using a placeholder in a numeric event expression or receiving condition.
- Omitting the nested GDevelop-expression quotes in an IfDo string operand.
- Using number/boolean interpolation instead of an exact whole placeholder.
- Replacing a `JsonObject` descriptor's concrete JSON example with a placeholder.
- Referencing a `JsonObject` child absent from its example schema.
- Embedding direct project config paths in an extension intended for export.
- Expecting a running preview to update without regeneration.
- Storing secrets in data that will be compiled into the exported game.

## Authoring checklist

- Decide explicitly why the data is static config rather than runtime state.
- Read the complete `config.settings` and relevant owner `.settings`/events.
- Preserve `[globalConfig]`; author user data only below
  `[settings]`.
- Use TOML for directly representable values and canonical raw JSON pointers
  only for lossless fallback cases.
- Choose stable, case-consistent, typed paths.
- Verify every placeholder path, bracket segment, and array index.
- Use placeholders only on supported action/property surfaces.
- Keep scalar property placeholders exact where required and give every
  `JsonObject` property a concrete, complete JSON example.
- Inject config through properties/parameters for reusable extensions.
- Update all consumers atomically when paths change.
- Reload and regenerate a fresh preview/export, then resolve all missing-config
  diagnostics.
