# Author layout TOML

Read `.gdevelop/layout-catalog.json` and the owning `.settings` files before
editing a `.layout`. Select the catalog `contexts` entry whose owner identifies
the scene, prefab, variant, or external layout. It is the generated authority
for resolvable objects, attached behaviors, layers, effects, and writable
properties.

`.layout` files are standard TOML. They contain placement and editor-layout
data only; object definitions and attached behaviors remain in `.settings`, and
logic remains in `.events`.

## Canonical table order

Use this exact order and one final newline:

1. `[layout]`
2. Optional `[editor]`
3. All `[[layer]]` records
4. All `[[effect]]` records
5. All `[[instance]]` records
6. All `[[variable]]` records
7. All `[[behavior]]` records

Do not indent TOML lines. Use snake_case field names exactly as cataloged.
Comments are allowed, but generated canonical output omits them.

## Scene layout

A scene requires a quoted RGB background:

```toml
[layout]
version = 1
background = "#202030"

[editor]
grid = true
grid_type = "rectangular"
grid_size = [32, 32, 32]

[[layer]]
id = "base"
name = ""
cameras = [{ size = "default", viewport = "default" }]

[[instance]]
id = "ef3ef49d-f20f-4450-b373-0ce43291a002"
object = "Player"
layer = "base"
at = [92, 552]
```

## Prefab and variant layout

A prefab or prefab variant forbids `background` and requires integer bounds:

```toml
[layout]
version = 1
bounds = { min = [0, 0, 0], max = [128, 96, 0] }

[[layer]]
id = "base"
name = ""

[[instance]]
id = "37662871-3864-42a8-ae4d-c9ec0ebd6371"
object = "Body"
layer = "base"
at = [0, 0]
```

## External layout

An external layout forbids `background`, `bounds`, effects, and cameras. Its
`[[layer]]` records reference layers of its `linkedScene`:

```toml
[layout]
version = 1

[[layer]]
id = "world"
name = "World"

[[instance]]
id = "492deedb-eab1-498c-8daf-5ebd0e313c98"
object = "Coin"
layer = "world"
at = [320, 180]
```

## Editor table

`[editor]` maps to scene `uiSettings` or prefab/external `editionSettings`:

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

`grid_type` is `rectangular` or `isometric`; `mode` is `instances-editor` or
`embedded-game`. Grid sizes are non-negative, alpha is in `[0,1]`, and zoom is
at least `0.01`.

Never add `selected_layer_unresolved` to new content. It is an import marker
emitted only while preserving a stale selected layer and must be removed when
the reference is fixed.

## Layers and cameras

Every layer has a unique file-local `id` and a unique runtime `name`. The ID
uses lowercase letters, digits, and hyphens. Effects and instances refer to the
ID, while `selected_layer` uses the runtime name.

```toml
[[layer]]
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
cameras = [
  { size = "default", viewport = "default" },
  { size = [640, 360], viewport = [0, 0, 0.5, 1] },
]
```

The canonical writer keeps `cameras` on one line because TOML 1.0 inline
tables cannot span lines. Direct edits may use multiline arrays as shown.

Camera `size` accepts:

- `"default"`;
- `[width, height]` for a custom size;
- `{ default = [width, height] }` to preserve inactive stored dimensions.

Camera `viewport` follows the same pattern with four normalized values. A
layer may have at most 50 cameras. `far` must exceed `near`; perspective
`near` is positive; `fov` is in `(0,180]`; `max_2d_distance` is positive.

## Effects

Effects use a short top-level record and a layer ID:

```toml
[[effect]]
layer = "world"
name = "Glow"
type = "Effects::Glow"
enabled = true
strength = 2
quality = "high"
fast = true
```

Effect names are unique per layer. Effect parameters are direct fields on the
`[[effect]]` record. Use only effect types and parameter names listed in the
layout catalog, and match their TOML value types. `params` is not a valid
field. Optional `folded` defaults to false and `enabled` defaults to true.

## Instances

Every instance requires an existing object name, existing layer ID, lowercase
UUIDv4, and a two- or three-number position:

```toml
[[instance]]
id = "01fce651-91cd-4d11-bd56-ef1370807527"
object = "Model"
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
keep_ratio = false
properties = { animation = 1, skin = "red" }
```

Use a scalar `rotation` for Z-only rotation and `[x, y, z]` otherwise. `size`
enables a custom size; `auto_size` preserves inactive stored dimensions.
`size` and `auto_size` are mutually exclusive. Opacity is in `[0,255]`.

The `[[instance]]` table order is the global serialized instance order. Never
add an `order` field and never regroup instance records by layer if doing so
would change that order.

An imported stale object may use `unresolved = true`. Preserve it only while
the object definition is missing. Never add it to a new or resolvable instance.
Preserve existing UUIDs; generate a new UUIDv4 only for a genuinely new
instance. UUIDs are unique within one `.layout`, not across the project.

## Variables

Top-level instance variables reference their owner by instance UUID:

```toml
[[variable]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
id = "4f0234fc-e34d-41b9-88b9-e4a73316f7be"
name = "Health"
type = "number"
value = 100

[[variable]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "Mode"
type = "enum"
value = "Idle"
values = ["Idle", "Run"]

[[variable]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "Stats"
type = "structure"
children = [{ name = "Armor", type = "number", value = 20 }]

[[variable]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "Path"
type = "array"
children = [{ type = "string", value = "A" }, { type = "string", value = "B" }]
```

Types are `string`, `enum`, `number`, `boolean`, `structure`, and `array`.
Primitive variables require `value`; structures have uniquely named children;
array children are unnamed and ordered. Enum `values` must contain the current
value when non-empty. Optional `id` is a UUIDv4.

## Behavior overrides

A behavior override also references its owning instance by UUID:

```toml
[[behavior]]
instance = "ef3ef49d-f20f-4450-b373-0ce43291a002"
name = "PlatformerObject"
properties = { maxSpeed = 500, acceleration = 1500 }
quick = "visible"
property_visibility = { acceleration = "hidden" }
```

`name` must identify a behavior already attached to the instance's object in
its owning `.settings`. Use exact serialized property keys from
`behaviorOverrideSchemas`, not editor-facing names. Optional metadata is
`folded`, `muted`, `inherited`, `quick`, and `property_visibility`. At most one
record may exist for each attached behavior on one instance.

## Checklist

- Parse as standard TOML and keep one final newline.
- Use only tables and fields listed in the generated layout catalog.
- Preserve `[[layer]]`, `[[effect]]`, `[[instance]]`, `[[variable]]`, and
  `[[behavior]]` array order.
- Preserve every existing instance UUID.
- Resolve every layer ID, instance UUID, object, behavior, effect, and property
  against the matching catalog context.
- Keep object definitions and attached behaviors in `.settings` and event logic
  in `.events`.
- Reject unknown fields instead of inventing a fallback.
