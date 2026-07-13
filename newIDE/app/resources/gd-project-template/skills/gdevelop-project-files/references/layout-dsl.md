# Author Layout DSL

Read `.gdevelop/layout-catalog.json` and the owning `.settings` file before
editing a `.layout`. Use the catalog context whose owner identifies that scene,
prefab, variant, or external layout; it is the generated authority for
resolvable object names, attached behaviors, layers, effects, and exact element
attributes. Object tags are references to settings-owned definitions; they
never declare objects or attach behaviors. `.layout` is component-tree markup,
not XML and not TOML.

## Contents

1. [Context roots](#context-roots)
2. [Literals](#literals)
3. [Root children](#root-children)
4. [Layers, cameras, and effects](#layers-cameras-and-effects)
5. [Instances](#instances)
6. [Instance children](#instance-children)
7. [Canonical editing checklist](#canonical-editing-checklist)

## Context roots

A scene requires an RGB background and defines layers:

```layout
<layout version=1 background=#202030>
  <editor grid=true grid-type=rectangular grid-size=32,32,32 />

  <layer name="">
    <camera size=default viewport=default />
    <Player id="ef3ef49d-f20f-4450-b373-0ce43291a002" at=92,552 />
  </layer>
</layout>
```

A prefab or prefab variant forbids `background`, requires integer 3D bounds,
and defines its own layers:

```layout
<layout version=1>
  <bounds min=0,0,0 max=128,96,0 />

  <layer name="">
    <Body id="37662871-3864-42a8-ae4d-c9ec0ebd6371" at=0,0 />
  </layer>
</layout>
```

An external layout forbids background/bounds and groups instances beneath
references to layers of its `linkedScene`. External layer elements allow only
`name`; they never contain cameras/effects and do not define new layers.

## Literals

- Strings use JSON double-quote escaping.
- Numbers are finite base-10 JSON numbers.
- Booleans are `true` or `false`.
- Colors are uppercase `#RRGGBB`. Preserve an imported `rgb(r,g,b)` only when
  serialized finite components fall outside the normal byte range.
- Positions are `x,y` or `x,y,z`; rotations are `z` or `x,y,z` degrees.
- Sizes are `wxh`; vectors/rectangles use comma separators without spaces.
- Typed maps use strict JSON literals with quoted keys and no trailing comma.
- There are no source comments, text nodes, entities, CDATA, or unknown tags.

## Root children

Use this exact order:

1. `<bounds ... />` for a prefab/variant.
2. Optional `<editor ... />`.
3. `<layer>...</layer>` elements in layer-array order.

Editor attributes map to current editor state:

```layout
<editor
  grid=true
  grid-type=rectangular
  grid-size=32,32,32
  grid-offset=0,0,0
  grid-color=#9EB4FF
  grid-alpha=0.8
  snap=true
  zoom=1
  window-mask=true
  selected-layer=""
  mode=instances-editor
/>
```

Omit the editor when it has no authored fields. `grid-type` is `rectangular`
or `isometric`; `mode` is `instances-editor` or `embedded-game`. Grid sizes
are non-negative, alpha is in `[0,1]`, and zoom is at least `0.01`.
Never add `selected-layer-unresolved` to new content. It is emitted only to
preserve an imported stale `selected-layer`, and must be removed when the layer
reference is fixed.

## Layers, cameras, and effects

Scene/prefab layer attributes are:

```layout
<layer
  name="World"
  rendering=2d+3d
  camera-type=perspective
  camera-behavior=do-nothing
  visible=true
  locked=false
  lighting=false
  follow-base-camera=false
  ambient=#C8C8C8
  near=3
  far=10000
  fov=45
  max-2d-distance=5000
>
  ...
</layer>
```

Only `name` is required. Defaults are automatic rendering/camera type,
top-left anchored camera behavior, visible, unlocked, non-lighting, not
following the base camera, ambient `#C8C8C8`, near `3`, far `10000`, FOV `45`,
and max 2D distance `5000`. `far > near`; perspective near is positive; FOV is
in `(0,180]`; max distance is positive.

Children are ordered cameras, then effects, then instances:

```layout
<camera size=default viewport=default />
<camera size=640x360 viewport=0,0,0.5,1 />
<effect
  name="Glow"
  type="Effects::Glow"
  enabled=true
  numbers={"strength":2}
  strings={"quality":"high"}
  booleans={"fast":true}
/>
```

Camera size accepts `default`, `default(w,h)`, or `wxh`. Viewport accepts
`default`, `default(l,t,r,b)`, or `l,t,r,b`; coordinates are in `[0,1]` and
ordered. Never add more than 50 cameras to one layer. Effect names are unique
per layer. Preserve effect parameter types and order; optional `folded` defaults
false and `enabled` defaults true.

## Instances

Use a safe object name as the tag. Reserved/unsafe names use
`<object of="Exact name">`. Every instance requires its existing lowercase
UUIDv4 and position:

```layout
<Model
  id="01fce651-91cd-4d11-bd56-ef1370807527"
  at=100,50,20
  rotation=15,30,90
  z-order=4
  size=64x32
  depth=24
  opacity=220
  flip=x,y
  locked
  sealed
  keep-ratio=false
/>
```

An imported stale instance can appear as
`<object of="RemovedObject" unresolved ... />`. Preserve that marker while the
object definition is missing, but never add it to a new or resolving instance.

Attribute order is `of`, `unresolved`, `id`, `order`, `at`, `rotation`,
`z-order`, `size`, `depth`, `opacity`, `flip`, `locked`, `sealed`,
`keep-ratio`. Preserve every existing UUID. Generate a fresh UUIDv4 only for a
genuinely new instance in the same `.layout`. UUIDs must be unique within one
layout, not across the whole project; separate scenes, externals, prefabs, and
prefab variants may intentionally use matching UUIDs.

Defaults are rotation/z-order zero, opacity 255, no flip, automatic size,
unlocked, unsealed, and keep-ratio true. Use `size=auto(w x h)` without spaces
(for example `size=auto(64x32)`) only to preserve inactive stored dimensions.
Presence of `depth` enables custom depth.

If layer grouping would change global serialized instance order, add a unique
contiguous `order=0..n-1` to every instance. Otherwise omit `order` from every
instance. Never mix ordered and unordered instances.

## Instance children

Children appear as one optional properties block, one optional variables
block, then behavior overrides:

```layout
<Player id="ef3ef49d-f20f-4450-b373-0ce43291a002" at=92,552>
  <properties numbers={"animation":1} strings={"skin":"red"} />

  <variables>
    <var name="Health" type=number value=100 />
    <var name="Mode" type=enum value="Idle" values=["Idle","Run"] />
    <var name="Stats" type=structure folded=true>
      <var name="Armor" type=number value=20 />
    </var>
    <var name="Path" type=array>
      <var type=string value="A" />
      <var type=string value="B" />
    </var>
  </variables>

  <override
    behavior="PlatformerObject"
    data={"maxSpeed":500,"acceleration":1500}
    quick=visible
    property-visibility={"acceleration":"hidden"}
  />
</Player>
```

Variable types are `string`, `enum`, `number`, `boolean`, `structure`, and
`array`. Primitive variables require `value`; structures contain uniquely named
children; arrays contain unnamed ordered children. `values` is allowed only on
an enum and must contain its value when non-empty. Optional variable `id` is a
UUIDv4. Never persist `mixed` or `hasMixedValues`.

An override may name only a behavior already attached to that object in the
owning settings. Do not write its behavior type; the compiler derives it.
`data` is required strict typed JSON. Optional metadata is `folded`, `muted`,
`inherited`, `quick=default|visible|hidden`, and a typed
`property-visibility` map. At most one override exists per attached behavior.

## Canonical editing checklist

- Preserve two-space indentation, child/array order, and one final newline.
- Confirm every element, attribute, object, layer, effect, and override against
  the matching generated layout-catalog context; never guess an absent entry.
- Preserve inactive camera/viewport/size data using the explicit `default(...)`
  or `auto(...)` forms.
- Preserve unknown settings in `.settings`; never move them into layout.
- Reject rather than invent an unknown object, layer, behavior, effect,
  property, tag, attribute, or serializer fallback. Preserve only explicit
  import markers already present for stale object/layer references.
- Keep object definitions and attached behaviors in individual flat
  object `.settings` files; keep events, resources, owner variables, and
  runtime settings outside `.layout`.
- After an edit, reload the project before previewing so the editor compiler
  validates the file and rebuilds `.gdevelop/game.json`.
