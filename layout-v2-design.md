# GDevelop Layout DSL v2 proposal

Status: design proposal

The v2 language is a strict, KDL-inspired node language specialized for
GDevelop layouts. It is not XML, TOML, JSON, or a scripting language.

## Design goals

- Read like a level description rather than a serializer dump.
- Keep one ordinary instance on one physical line.
- Preserve stable identity without printing full UUIDs everywhere.
- Represent vectors, colors, lists, and typed component data natively.
- Keep layers, cameras, effects, and placements visually nested.
- Eliminate closing tags and embedded JSON.
- Give parsers strong recovery points at newlines and braces.
- Make canonical formatting and semantic merging deterministic.
- Keep runtime logic, object definitions, and per-user editor state elsewhere.

## Core example

```layout
layout 2 background=#202030 {
  guides {
    grid rectangular size=(32, 32, 32) snap
  }

  layer World render=3d projection=perspective {
    camera default

    effect Sun Scene3D::DirectionalLight {
      intensity 0.75
      rotation 300
      color #FFFFFF
      casting-shadow true
    }

    instance Terrain @PFal-Iy2S16S52XJ8HmuKg at=(640, 360, -487.95) locked

    instances TreePine locked {
      @_8ovTVtFTbSxlI-HO8u3BA at=(1328.23, -754.94, -188.92) size=(286.83, 282.47)
      @_vbY-mbUR12eicmmrO0_dg at=(1507.17, -810, -200.27)
    }
  }
}
```

## Structural statements

### Document root

```layout
layout 2 background=#4BADB0 {
  // document children
}
```

The physical path supplies scene, prefab, variant, or external-layout context.
The file does not repeat its owner name or source path.

### Shared authoring guides

```layout
guides {
  grid rectangular size=(64, 64, 32) offset=(0, 0, 0) color=#D7FFFF alpha=0.35 snap
}
```

Only shared scene guides belong here. Zoom, selected layer, open panel, window
mask, and other per-user view state live in ignored editor metadata.

### Layers and cameras

```layout
layer "3D Terrain" render=3d projection=perspective ambient=#FFFFFF near=1 {
  camera default
  camera size=(1280, 720) viewport=(0, 0, 1, 1)
}
```

Layer, camera, and effect source order is semantic order.

### Effects

```layout
effect "Terrain Sun" Scene3D::DirectionalLight {
  distance-from-camera 1500
  elevation 55
  intensity 0.65
  color #FFF4DC
  shadow-quality medium
  casting-shadow true
}
```

Effect parameters use native typed values. The compiler maps numbers, strings,
booleans, colors, tuples, and lists into the current serializer representation.
There are no `numbers`, `strings`, `booleans`, or JSON payload maps in source.

### Single placement

```layout
instance Knight @yuukfj10RWKPStbMrz8YTQ at=(832, 896, 100) z-order=1
```

The object reference is explicit and never doubles as a grammar keyword.

### Repeated placements

```layout
instances TerrainSupportCollider depth=24 opacity=0 locked {
  @peFM0j6uSm-hT_pOTxttzA at=(-998, -878.82, 99.19) size=(853.41, 454.23)
  @6U13oSoNTFOs-v7tON8CmA at=(-103.29, 1832.82, -404.59) size=(344.11, 178.94)
}
```

Properties on `instances` are explicit defaults for its children. A child may
override a default with an explicit value such as `locked=false`. Groups are
ordered and may repeat the same object type later, so flattening them preserves
global instance order within a layer.

### Complex instance data

```layout
instance Player @71hU0fT0TqWD4k7p2SbQAA at=(92, 552) {
  properties {
    lod 2
    skin red
  }

  variables {
    Health number 100
    State enum Idle values=[Idle, Run, Dead]
  }

  behavior PlatformerObject {
    max-speed 500
    acceleration 1500
  }
}
```

`behavior` inside an instance can only override an already attached behavior.
It cannot declare or attach a new behavior.

## Values

The value model is deliberately small:

```text
number       12  -3.5  1e-4
boolean      true  false
identifier   Player  perspective  Scene3D::DirectionalLight
string       "3D Terrain"
color        #RGB  #RGBA  #RRGGBB  #RRGGBBAA
tuple        (10, 20)  (10, 20, 30)
list         [Idle, Run, Dead]
map          { speed=500, enabled=true }
instance id  @PFal-Iy2S16S52XJ8HmuKg
```

Commas are required inside tuples and lists. Trailing commas are allowed.
Strings use JSON-compatible escapes. Numbers must be finite. Attribute values
are literals and never expressions.

## Stable IDs

An `@` identifier is the unpadded URL-safe Base64 encoding of the existing
128-bit persistent UUID. It is always 22 characters and decodes losslessly.
Readers may accept canonical UUID text during migration; writers always emit
the short form. IDs are unique within one logical layout, including shards.

## Ordering

- Layers, cameras, effects, placement groups, and children are ordered.
- Normal instance order is depth-first source order.
- `z-order` is independent of serialization order.
- A rare legacy layout with cross-layer interleaving uses one root-level
  `instance-order` block listing IDs. It is omitted otherwise.

```layout
instance-order {
  @first
  @hud
  @second
}
```

## Comments

`//` line comments and nestable `/* ... */` block comments are allowed. `#` is
reserved for color literals. Canonical editor saves preserve comments by
attaching them to the following structural statement or field.

## Canonical writer

- UTF-8, NFC, LF, one final newline, two-space indentation.
- Kebab-case field names and schema-defined field order.
- Defaults are omitted.
- A normal instance stays on one line.
- Consecutive instances of one object may become an `instances` group.
- Only values identical across the complete group are hoisted as group defaults.
- Groups never reorder instances merely to improve compression.
- Colors are uppercase six- or eight-digit hex in canonical output.
- Semantic diff and merge match instances by `@id`, not by line number.

## Ownership and storage

The layout owns placement, shared visual layers/cameras/effects, background,
shared guides, locks, prefab bounds, and per-instance overrides. Settings own
definitions and runtime configuration. Events own logic. Per-user editor view
state is ignored metadata.

Ordinary scenes use one layout source. Very large collaborative scenes may be
sharded by layer or spatial chunk at the project-storage level; sharding is not
an `include` instruction inside the language. The compiler merges shards by
stable IDs and emits the existing runtime/compatibility project shape.

## Why this shape

- Godot demonstrates that a human-readable scene language benefits version
  control and that scene instances should remain reusable units.
- Unity UI Toolkit demonstrates declarative retained trees and separation of
  structure, styling, and behavior.
- Unreal Level Instances demonstrate reusable in-context sublevels, while One
  File Per Actor demonstrates optional storage sharding for collaboration.
- KDL demonstrates that XML-like node semantics do not require verbose matching
  closing tags.

References:

- https://kdl.dev/
- https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html
- https://docs.unity3d.com/current/Manual/ui-systems/introduction-ui-toolkit.html
- https://dev.epicgames.com/documentation/en-us/unreal-engine/level-instancing-in-unreal-engine
- https://dev.epicgames.com/documentation/en-us/unreal-engine/one-file-per-actor-in-unreal-engine
