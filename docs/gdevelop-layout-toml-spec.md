# GDevelop flat layout TOML

**Status:** normative version 1  
**Implementation:** `newIDE/app/src/ProjectsStorage/LayoutToml`  
**Canonical storage:** embedded `[layout]` subtree in the component owner
`.settings` file
**Syntax:** standard TOML with a strict GDevelop schema

Version 5 has no managed `.layout` source files. This document remains the
normative layout schema and compiler contract, but its logical standalone
examples are embedded by prefixing every non-root layout header with
`layout.`: `[editor]` becomes `[layout.editor]`, `[[instances]]` becomes
`[[layout.instances]]`, and so on. Scene and default-prefab layout data lives
in their existing owner settings; named variants have independent
`variant.settings` owners and external layouts use
`scenes/<Scene>/external-layout/<External>.settings`. See
[embedded-layout-settings-format-spec.md](embedded-layout-settings-format-spec.md).

## 1. Purpose

Layout TOML is the editable source for visual and spatial project data:

- scene/prefab layers and cameras;
- layer effects;
- placed object instances and transforms;
- initial instance variables;
- per-instance behavior property overrides;
- prefab editing bounds;
- scene background and editor canvas state.

Object definitions, attached behavior definitions, resources, owner variables,
events, functions, and runtime logic are forbidden. Those remain in `.settings`
or `.events` sources.

The format replaces the retired nested markup. There is no
compatibility reader for markup layouts or earlier wrapped TOML layout drafts.

## 2. Design

The format uses a small fixed vocabulary of short TOML headers:

```text
[layout]
[editor]
[[layers]]
[[effects]]
[[instances]]
[[variables]]
[[behaviors]]
```

Relationships are explicit:

- layers have file-local `id` values;
- effects and instances reference a layer ID;
- variables and behavior overrides reference an instance UUID.

This avoids long nested headers while retaining standard TOML parsers and
ordinary TOML booleans, arrays, strings, numbers, comments, and inline tables.

## 3. Contexts and ownership

One `.layout` is compiled in exactly one context:

| Context                | Owns                                                          | Forbids                                           |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------- |
| Scene                  | background, editor state, layers, cameras, effects, instances | bounds and definitions                            |
| Prefab/default variant | bounds, editor state, layers, cameras, effects, instances     | background and definitions                        |
| Named prefab variant   | bounds, editor state, layers, cameras, effects, instances     | background and definitions                        |
| External layout        | editor state, linked-scene layer references, instances        | background, bounds, cameras, effects, definitions |

The owning `.settings` source supplies the context and `game://` reference.
The `.layout` never repeats its scene, prefab, variant, external-layout, or
project identity.

## 4. Canonical document shape

Canonical output uses this order:

1. `[layout]`;
2. optional `[editor]`;
3. all `[[layers]]` records in layer order;
4. all `[[effects]]` records in per-layer effect order;
5. all `[[instances]]` records in global serialized instance order;
6. all `[[variables]]` records grouped by instance order;
7. all `[[behaviors]]` records grouped by instance order.

Assignments begin at column zero. One blank line separates tables. The file
ends with one newline. Generated canonical output omits comments, default-valued
optional fields, and empty optional record groups.

TOML dates, non-finite numbers, arbitrary custom objects, unknown tables, and
unknown fields are forbidden.

## 5. `[layout]`

Every document requires:

```toml
[layout]
version = 1
```

### 5.1 Scene

A scene also requires a quoted color:

```toml
[layout]
version = 1
background = "#202030"
```

Normal colors use uppercase `#RRGGBB`. The compiler can preserve imported
serialized components outside the byte range as `"rgb(r,g,b)"`; new sources
must use normal RGB colors.

### 5.2 Prefab and variant

A prefab or variant requires integer bounds:

```toml
[layout]
version = 1
bounds = { min = [0, 0, 0], max = [128, 96, 0] }
```

### 5.3 External layout

An external layout has only `version` in `[layout]`.

## 6. `[editor]`

The optional editor table maps to scene `uiSettings` or prefab/external
`editionSettings`:

```toml
[editor]
grid = true
grid_type = "rectangular"
grid_size = [32, 32, 32]
grid_offset = [0, 0, 0]
grid_color = "#9EB4FF"
grid_alpha = 0.8
snap = true
zoom = 1
window_mask = true
selected_layer = ""
mode = "instances-editor"
```

Rules:

- `grid_type` is `rectangular` or `isometric`;
- `grid_size` contains three non-negative numbers;
- `grid_offset` contains three finite numbers;
- `grid_alpha` is in `[0,1]`;
- `zoom` is at least `0.01`;
- `selected_layer` is a runtime layer name, not a file-local ID;
- `mode` is `instances-editor` or `embedded-game`.

`selected_layer_unresolved = true` is a canonical import marker used only to
preserve a stale selected layer. It is invalid without `selected_layer`, and it
is invalid after the layer resolves.

## 7. `[[layers]]`

Scene/prefab layers use:

```toml
[[layers]]
id = "world"
name = "World"
rendering = "2d+3d"
camera_type = "perspective"
camera_behavior = "do-nothing"
visible = true
locked = false
lighting = false
follow_base_camera = false
ambient = "#C8C8C8"
near = 3
far = 10000
fov = 45
max_2d_distance = 5000
cameras = [{ size = "default", viewport = "default" }]
```

`id` is required, unique, file-local, and matches
`[a-z0-9][a-z0-9-]*`. `name` is required and unique. Canonical IDs are derived
deterministically from layer names; the empty base layer becomes `base`.

Defaults are automatic rendering/camera type, top-left-anchored camera
behavior, visible, unlocked, non-lighting, not following the base camera,
ambient `#C8C8C8`, near `3`, far `10000`, FOV `45`, and max distance `5000`.

Validation requires `far > near`, a positive perspective near plane, FOV in
`(0,180]`, and positive `max_2d_distance`.

External layouts allow only `id` and `name`; `name` must resolve in the linked
scene.

## 8. Cameras

Cameras are inline tables in the layer's `cameras` array. A layer may contain
at most 50 cameras.

```toml
cameras = [
  { size = "default", viewport = "default" },
  { size = [640, 360], viewport = [0, 0, 0.5, 1] },
  { size = { default = [640, 360] }, viewport = { default = [0, 0, 1, 1] } },
]
```

`size` forms:

- `"default"` for active default sizing with no inactive dimensions;
- `[width, height]` for custom sizing;
- `{ default = [width, height] }` for default sizing while preserving inactive
  stored dimensions.

`viewport` uses the same representation with four normalized ordered values.
The default rectangle is `[0, 0, 1, 1]`.

## 9. `[[effects]]`

```toml
[[effects]]
layer = "world"
name = "Glow"
type = "Effects::Glow"
folded = true
enabled = false
strength = 2
quality = "high"
fast = true
```

`layer`, `name`, and `type` are required. The layer ID must resolve. Effect
names are unique per layer. The effect type and every parameter name/type must
match the generated settings catalog. Parameters are direct fields on the
`[[effects]]` record and must be flat finite numbers, strings, or booleans.
`params` is not a valid field. `folded` defaults false and `enabled` defaults
true.

## 10. `[[instances]]`

```toml
[[instances]]
id = "01fce651-91cd-4d11-bd56-ef1370807527"
object = "Player"
layer = "world"
at = [100, 50, 20]
rotation = [15, 30, 90]
z_order = 4
size = [64, 32]
depth = 24
opacity = 220
flip = ["x", "y"]
locked = true
sealed = true
hidden = true
keep_ratio = false
properties = { animation = 1, skin = "red" }
```

Required fields are `id`, `object`, `layer`, and `at`.

- `id` is a lowercase canonical UUIDv4 unique within this layout;
- `object` resolves in the owning catalog context;
- `layer` is a file-local layer ID;
- `at` contains `[x,y]` or `[x,y,z]`;
- `rotation` is a Z number or `[x,y,z]`;
- `z_order` is an integer;
- `size` enables custom width/height;
- `auto_size` preserves inactive stored dimensions;
- `size` and `auto_size` are mutually exclusive;
- `opacity` is an integer in `[0,255]`;
- `flip` contains unique `"x"`, `"y"`, and/or `"z"` values;
- `properties` contains only catalog-declared numeric/string properties.

Defaults are zero rotation/order, automatic size, opacity 255, no flips,
unlocked, unsealed, visible at start (`hidden = false`), and
`keep_ratio = true`.

`unresolved = true` preserves an imported stale object reference. It is invalid
for a resolvable object and must never be introduced for new content.

The `[[instances]]` array-of-tables order is the global serialized instance
order. The retired markup `order` workaround is forbidden.

## 11. `[[variables]]`

Top-level initial variables reference an owning instance UUID:

```toml
[[variables]]
instance = "01fce651-91cd-4d11-bd56-ef1370807527"
id = "4f0234fc-e34d-41b9-88b9-e4a73316f7be"
name = "Health"
type = "number"
value = 100

[[variables]]
instance = "01fce651-91cd-4d11-bd56-ef1370807527"
name = "Stats"
type = "structure"
children = [{ name = "Armor", type = "number", value = 20 }]

[[variables]]
instance = "01fce651-91cd-4d11-bd56-ef1370807527"
name = "Path"
type = "array"
children = [{ type = "string", value = "A" }, { type = "string", value = "B" }]
```

Types are `string`, `enum`, `number`, `boolean`, `structure`, and `array`.
Primitive values are required and typed. Structures have uniquely named,
canonically sorted children. Array children are unnamed and ordered. Enum
`values` are unique and contain the current value when non-empty. `folded` is
optional; `id` is an optional UUIDv4.

Top-level variable names are unique per instance.

## 12. `[[behaviors]]`

```toml
[[behaviors]]
instance = "01fce651-91cd-4d11-bd56-ef1370807527"
name = "PlatformerObject"
properties = { maxSpeed = 500, acceleration = 1500 }
folded = true
muted = false
inherited = false
quick = "visible"
property_visibility = { acceleration = "hidden" }
```

`instance` and `name` are required. The name must identify a behavior already
attached to the instance object's `.settings` definition. `properties` uses
serialized keys from `behaviorOverrideSchemas`; editor-facing keys are rejected
when they differ. `quick` and every `property_visibility` value are `default`,
`visible`, or `hidden`.

Behavior names are unique per instance.

## 13. Complete scene example

```toml
[layout]
version = 1
background = "#101820"

[editor]
grid = true
grid_type = "rectangular"
grid_size = [32, 32, 32]
snap = true
selected_layer = "HUD"

[[layers]]
id = "base"
name = ""
cameras = [{ size = "default", viewport = "default" }]

[[layers]]
id = "hud"
name = "HUD"

[[effects]]
layer = "base"
name = "World Glow"
type = "Effects::Glow"
strength = 2

[[instances]]
id = "ef3ef49d-f20f-4450-b373-0ce43291a002"
object = "Player"
layer = "base"
at = [92, 552]
properties = { animation = 1 }

[[instances]]
id = "4a1e5377-cbe7-4078-9a51-96a1e9956411"
object = "ScoreText"
layer = "hud"
at = [24, 24]

[[variables]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "Health"
type = "number"
value = 100

[[behaviors]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "PlatformerObject"
properties = { maxSpeed = 500 }
```

## 14. Catalog contract

`.gdevelop/settings-catalog.json` format version 2 is regenerated from the
loaded project. Its embedded-layout contract contains:

- `layoutTables`: the exact headers, fields, types, defaults, and context
  rules;
- `layoutContexts`: owner-specific layers, objects, attached behaviors, and
  observed instance properties;
- `effectTypes`: registered effect parameters;
- `behaviorOverrideSchemas`: serialized behavior property keys and types.

AI and direct-file tooling must select the matching `layoutContexts` entry and
use only cataloged tables, objects, behaviors, effects, and fields. There is no
independent generated layout catalog.

## 15. Compilation

`compileLayoutToml` performs:

1. standard TOML parsing;
2. strict root/table/field validation;
3. context ownership validation;
4. layer ID and relationship resolution;
5. object/effect/behavior/property resolution against catalog-derived context;
6. typed conversion to the legacy serialized layout fragment.

`decompileLayoutToml` validates the serialized fragment, builds deterministic
layer IDs, projects it into canonical flat records, serializes TOML, and
recompiles the result as a self-check.

The multi-file reader/writer invokes these functions for scenes, prefabs,
variants, and external layouts. Runtime code never parses `.layout` files; it
consumes the reconstructed legacy project projection.

## 16. Diagnostics

Failures use `LayoutTomlError` with a stable `LAYOUT_*` code, file URI, line,
and column. Important categories include:

- invalid TOML or unsupported version;
- unknown/missing table field;
- ownership conflict;
- duplicate/unknown layer ID;
- duplicate/invalid UUID;
- unknown object, effect, instance, or behavior;
- invalid camera, variable, effect parameter, or behavior property;
- unsupported serialized field during decompilation.

The compiler rejects rather than silently preserving unknown source fields.
The decompiler rejects rather than dropping unknown serializer fields.

## 17. Verification

The implementation suites cover:

- parsing and canonical formatting;
- every layout context;
- mixed integer/float coordinate arrays;
- editor fields and imported stale references;
- layers, cameras, effects, and global instance order;
- custom/inactive sizes, rotations, flips, and properties;
- primitive, enum, structure, and array variables;
- behavior serialized-key validation;
- catalog generation and validation;
- multi-file round trips for repository project fixtures;
- strict rejection of retired markup layouts.
