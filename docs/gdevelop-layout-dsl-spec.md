# GDevelop Layout DSL

## A Component-Tree Markup for GDevelop Scene, Prefab, and External Layouts

**Status:** Version 1.0 implemented format contract
**Implementation:** `newIDE/app/src/ProjectsStorage/LayoutDsl`
**Canonical source filename:** `<Name>.layout`
**File extension:** `.layout`
**Encoding:** UTF-8
**Target:** GDevelop scene layouts, prefab/default-variant layouts, prefab variant layouts, and external layouts

---

## Contents

1. [Overview](#1-overview)
2. [Design goals](#2-design-goals)
3. [Ownership boundary](#3-ownership-boundary)
4. [Source context and file identity](#4-source-context-and-file-identity)
5. [Component-tree model](#5-component-tree-model)
6. [Source format](#6-source-format)
7. [Lexical rules and literals](#7-lexical-rules-and-literals)
8. [Simplified grammar](#8-simplified-grammar)
9. [The root layout element](#9-the-root-layout-element)
10. [Scene layouts](#10-scene-layouts)
11. [Prefab and variant layouts](#11-prefab-and-variant-layouts)
12. [External layouts](#12-external-layouts)
13. [Editor canvas settings](#13-editor-canvas-settings)
14. [Layers](#14-layers)
15. [Cameras](#15-cameras)
16. [Layer effects](#16-layer-effects)
17. [Object instance elements](#17-object-instance-elements)
18. [Instance transforms and dimensions](#18-instance-transforms-and-dimensions)
19. [Custom instance properties](#19-custom-instance-properties)
20. [Initial instance variables](#20-initial-instance-variables)
21. [Per-instance behavior overrides](#21-per-instance-behavior-overrides)
22. [Ordering](#22-ordering)
23. [Defaults and omission](#23-defaults-and-omission)
24. [Semantic validation](#24-semantic-validation)
25. [Normative compiler mapping](#25-normative-compiler-mapping)
26. [Normative decompiler mapping](#26-normative-decompiler-mapping)
27. [Canonical formatting](#27-canonical-formatting)
28. [Diagnostics](#28-diagnostics)
29. [Complete 2D scene example](#29-complete-2d-scene-example)
30. [Complete 3D and effects example](#30-complete-3d-and-effects-example)
31. [Complete prefab example](#31-complete-prefab-example)
32. [Complete external-layout example](#32-complete-external-layout-example)
33. [AI authoring contract](#33-ai-authoring-contract)
34. [Codebase compatibility basis](#34-codebase-compatibility-basis)
35. [Required implementation and verification](#35-required-implementation-and-verification)
36. [Final design principles](#36-final-design-principles)

---

## 1. Overview

The GDevelop Layout DSL is a small component-tree markup for describing what is
placed in a scene, prefab variant, or external layout and how that content is
arranged.

It is intentionally shaped like a visual component tree:

```text
layout
  layer
    cameras
    effects
    object instances
      custom properties
      initial variables
      behavior overrides
```

A typical source file is immediately readable:

```layout
<layout version=1 background=#202030>
  <layer name="">
    <Player
      id="ef3ef49d-f20f-4450-b373-0ce43291a002"
      at=92,552
      z-order=20
    />
  </layer>

  <layer name="HUD">
    <ScoreText
      id="fd94814c-3eca-4ce7-bb55-6722a2be8412"
      at=24,24
      size=240x48
      z-order=1
    />
  </layer>
</layout>
```

`Player` and `ScoreText` are references to object definitions owned by the
related settings namespace. They are not object declarations.

The compiler converts a `.layout` file into exactly the layout-owned fields
consumed by the current GDevelop serializers. The multi-file project composer
then merges those fields with the object definitions and configuration from
the owning `.settings` file before calling the existing GDevelop
unserializers. Preview, export, and runtime code continue to consume the
current in-memory project and compatibility JSON shape.

This specification defines a new source grammar only. It deliberately defines
no TOML-layout syntax, legacy-layout syntax, or compatibility fallback.

---

## 2. Design goals

The language is designed to be:

1. **Visually structured.** Layers contain the instances displayed on them.
2. **Easy for AI models to understand and edit.** The grammar resembles
   familiar component markup without inheriting HTML or XML complexity.
3. **Lossless for the current layout-owned serializer fields.** Scene,
   prefab, external-layout, layer, camera, effect, instance, variable, custom
   property, and behavior-override data all have typed representations.
4. **Strictly separated from object definitions.** An object and its attached
   behavior definitions belong in settings; this file only places instances
   and stores instance-specific overrides.
5. **Deterministic.** The same in-memory layout always decompiles to the same
   UTF-8 source.
6. **Git-friendly.** A normal instance occupies one small element, and moving
   it between layers moves that element rather than rewriting a large table.
7. **Project-aware.** Object, layer, behavior, effect, and linked-scene
   references are validated against the loaded project.
8. **Runtime-neutral.** The DSL compiles to the existing serializer shape; the
   runtime does not parse `.layout` files.

### Non-goals

Version 1 is not:

- HTML, XML, JSX, SVG, TOML, YAML, or JSON.
- A general UI framework or constraint-layout engine.
- A language for declaring object types, animations, object behaviors, scene
  variables, resources, events, functions, or extensions.
- A scripting language. Attribute values are literals, never expressions.
- A compatibility reader for an older layout source format.
- A raw serializer-tree escape mechanism.

---

## 3. Ownership boundary

The `.layout`, `.settings`, and `.events` sources have non-overlapping
responsibilities.

| Concern | Owner |
| --- | --- |
| Scene identity and runtime configuration | `scene.settings` |
| Scene object definitions, object folders/groups, variables, effects, and attached behaviors | `scene.settings` |
| Prefab/variant child object definitions, folders/groups, effects, and attached behaviors | `prefab.settings` |
| Instance placement, transform, size, opacity, flips, editor locks, custom instance properties, initial instance variables, and per-instance behavior overrides | `.layout` |
| Layer definitions, cameras, layer effects, lighting, and rendering configuration | Scene or prefab `.layout` |
| Scene background | Scene `.layout` |
| Prefab variant editing bounds | Prefab or variant `.layout` |
| Editor grid, snapping, selected layer, zoom, mask, and editor mode | `.layout` |
| Event logic | `.events` |

The distinction between an attached behavior and a behavior override is
normative:

- The behavior declaration, type, and default configuration attached to an
  object definition belong in the related settings file.
- Values overriding that already attached behavior for one placed instance
  belong below that instance in the layout.

A layout must never introduce a behavior that is not attached to the referenced
object definition.

---

## 4. Source context and file identity

A `.layout` file contains no component name, project path, scene name, prefab
name, variant name, linked-scene name, or settings-file reference.

Its context comes from the settings namespace that references it:

| Referencing owner | Layout context |
| --- | --- |
| `scenes.<Scene>.layout` | Scene layout |
| `extensions.<E>.prefabs.<P>.layout` | Default prefab variant |
| `extensions.<E>.prefabs.<P>.variants[].layout` | Named prefab variant |
| `externals.layoutFiles[].layout` | External layout associated with the linked scene stored in `external.settings` |

All references use canonical `game://...` project-root URIs. A `.layout` file
never references another `.settings` or `.layout` file.

The root element therefore contains only the grammar version and
context-appropriate layout data:

```layout
<layout version=1>
  ...
</layout>
```

---

## 5. Component-tree model

The source tree has six structural element families:

| Element | Purpose |
| --- | --- |
| `<layout>` | One document root |
| `<bounds>` | Prefab/default-variant or named-variant editing bounds |
| `<editor>` | Scene/prefab/external editor-canvas state |
| `<layer>` | A scene/prefab layer definition or an external-layout layer reference |
| `<camera>` and `<effect>` | Layer-owned camera and effect entries |
| Object instance element | A placed instance whose tag is normally the object name |

An instance may contain:

| Child | Purpose |
| --- | --- |
| `<properties>` | Object-type-specific numeric and string initial-instance properties |
| `<variables>` | Initial instance variables |
| `<override>` | Per-instance values overriding one already attached behavior |

Text nodes are forbidden. All information is expressed by elements and typed
attributes.

---

## 6. Source format

### 6.1 Encoding and newlines

- Source is UTF-8 without a byte-order mark.
- Canonical newlines are LF.
- A canonical file ends with exactly one newline.
- Tabs are forbidden.
- Indentation is two ASCII spaces per element depth.
- Indentation is validated by the canonical formatter, not required by the
  parser for structural correctness.

### 6.2 One root

Every file contains exactly one `<layout>` root. Content before or after the
root is forbidden.

### 6.3 No comments in version 1

Version 1 has no source-comment syntax. The current project model has no
layout-comment field, and silently dropping author comments on an editor save
would be unsafe. A future version may add persistent annotations only after
the editor owns a source-preserving representation for them.

### 6.4 Empty elements

Elements without children use the self-closing form:

```layout
<camera size=default viewport=default />
```

Elements with children use matching opening and closing tags:

```layout
<layer name="">
  ...
</layer>
```

---

## 7. Lexical rules and literals

### 7.1 Names

Structural tag and attribute names are ASCII and case-sensitive.

```text
identifier      = [A-Za-z_][A-Za-z0-9_]*
attribute-name  = [A-Za-z_][A-Za-z0-9_-]*
```

Object names use their exact project spelling. A safe, non-reserved object
name may be used directly as an instance tag. Other names use the fallback
`<object of="...">` form described in section 17.

### 7.2 Strings

Strings use JSON string escaping:

```layout
name="HUD"
selected-layer=""
of="Combat::Enemy Boss"
```

Quoted strings support `\"`, `\\`, `\n`, `\r`, `\t`, and `\uXXXX`. Control
characters must be escaped. Strings are Unicode NFC.

### 7.3 Numbers

Numbers use base-10 JSON number syntax. `NaN`, `Infinity`, hexadecimal
numbers, numeric separators, and unit suffixes are forbidden. Every number
must be finite.

### 7.4 Booleans

Booleans are `true` or `false`. Selected attributes also allow a bare flag as
canonical shorthand for `true`, for example `locked`.

### 7.5 Colors

Colors use uppercase `#RRGGBB`:

```layout
background=#202030
ambient=#C8C8C8
grid-color=#9EB4FF
```

Alpha is stored separately where the current model has a separate alpha
field.

### 7.6 Vectors and rectangles

Comma-separated tuples contain no spaces in canonical source:

```text
2D vector       128,256
3D vector       128,256,32
viewport        0,0,1,1
```

### 7.7 Dimensions

Two- and three-dimensional sizes use `x` separators:

```text
240x48
64x64x32
```

The `x` character is syntax, not multiplication.

### 7.8 Typed data literals

Effect parameter maps, behavior-override content, and visibility maps use a
restricted JSON-compatible literal grammar:

```text
literal = string | number | true | false | null | array | object
array   = "[" [literal *("," literal)] "]"
object  = "{" [member *("," member)] "}"
member  = json-string ":" literal
```

Object keys are always quoted JSON strings. Trailing commas are forbidden.
These literals represent current typed extension-owned data; they are not raw
legacy-event or legacy-project JSON fallbacks.

---

## 8. Simplified grammar

The grammar below is structural. Later sections define the allowed attributes
and contextual restrictions.

```text
document          = layout

layout            = "<layout" layout-attributes ">"
                      [bounds]
                      [editor]
                      *layer
                    "</layout>"

bounds            = "<bounds" bounds-attributes "/>"
editor            = "<editor" editor-attributes "/>"

layer             = "<layer" layer-attributes ">"
                      *camera
                      *effect
                      *instance
                    "</layer>"

camera            = "<camera" camera-attributes "/>"
effect            = "<effect" effect-attributes "/>"

instance          = direct-instance | fallback-instance

direct-instance   = "<" object-name instance-attributes "/>"
                  | "<" object-name instance-attributes ">"
                      [properties]
                      [variables]
                      *override
                    "</" object-name ">"

fallback-instance = "<object" fallback-instance-attributes "/>"
                  | "<object" fallback-instance-attributes ">"
                      [properties]
                      [variables]
                      *override
                    "</object>"

properties        = "<properties" properties-attributes "/>"

variables         = "<variables>" *named-variable "</variables>"
named-variable    = "<var" named-variable-attributes "/>"
                  | "<var" named-variable-attributes ">"
                      *child-variable
                    "</var>"
child-variable    = named-variable | unnamed-variable
unnamed-variable  = "<var" unnamed-variable-attributes "/>"
                  | "<var" unnamed-variable-attributes ">"
                      *child-variable
                    "</var>"

override          = "<override" override-attributes "/>"
```

The parser is not an XML parser. XML namespaces, entities, processing
instructions, CDATA, doctypes, text nodes, and mixed content are invalid.

---

## 9. The root layout element

`version=1` is required and must be the first attribute.

```layout
<layout version=1>
  ...
</layout>
```

Context-specific root attributes are:

| Attribute | Type | Context | Current serializer mapping |
| --- | --- | --- | --- |
| `version` | Integer `1` | All | Source grammar only; not emitted to runtime data |
| `background` | `#RRGGBB` | Scene only | `r`, `v`, `b` |

`background` is required for a scene and forbidden for a prefab or external
layout. The current scene serializer has no background alpha field.

The canonical root-child order is:

1. `<bounds>`, when required.
2. `<editor>`, when non-empty.
3. `<layer>` elements in current layer order.

---

## 10. Scene layouts

A scene layout owns exactly the current multi-file scene-layout fields:

```text
r
v
b
uiSettings
layers
instances
```

Canonical shape:

```layout
<layout version=1 background=#202030>
  <editor ... />

  <layer name="">
    ...
  </layer>
</layout>
```

A scene layout:

- Requires `background`.
- Forbids `<bounds>`.
- Defines its layers with `<layer>` elements.
- Resolves an instance tag against scene-local objects first and then global
  objects, matching the current editor scope.
- May contain zero layers only when it contains no instances. When layers are
  present, their names are unique; the current serializer does not itself
  require a base-layer record.

The following current scene fields are forbidden because settings or events
own them:

```text
name, mangledName, title, standardSortMethod, stopSoundsOnStartup,
resourcesPreloading, resourcesUnloading, disableInputWhenNotFocused,
objects, objectsFolderStructure, objectsGroups, variables,
behaviorsSharedData, events
```

---

## 11. Prefab and variant layouts

The same grammar is used for a prefab's default variant and every named
variant. The owning `prefab.settings` entry supplies the prefab/variant
identity and object definitions.

A prefab layout owns exactly:

```text
areaMinX, areaMinY, areaMinZ,
areaMaxX, areaMaxY, areaMaxZ,
layers, instances, editionSettings
```

It requires one `<bounds>` element:

```layout
<bounds min=0,0,0 max=128,96,0 />
```

| DSL | Current serializer mapping |
| --- | --- |
| `min=x,y,z` | `areaMinX`, `areaMinY`, `areaMinZ` |
| `max=x,y,z` | `areaMaxX`, `areaMaxY`, `areaMaxZ` |

All six bound components are signed integers, matching
`EventsBasedObjectVariant::SerializeTo`.

A prefab layout:

- Forbids `background`.
- Requires `<bounds>`.
- Defines its own layers.
- Resolves instance tags only against child objects defined by the owning
  prefab/variant settings context.
- May contain zero layers only when it contains no instances. When layers are
  present, their names are unique.

The layout forbids `name`, asset-store identity, object definitions, object
folders/groups, prefab variables, behavior definitions, property descriptors,
functions, and variants. Those remain in `prefab.settings`.

---

## 12. External layouts

An external layout owns exactly:

```text
instances
editionSettings
```

Its name, linked scene (`associatedLayout` in the current serializer), source
URI, and ordering are owned by `externals/external.settings`.

External layout markup still groups instances under `<layer>` for readability:

```layout
<layout version=1>
  <layer name="">
    <Coin id="df034793-37cf-4be9-84bd-a0774a46de76" at=100,200 />
  </layer>
</layout>
```

In external-layout context, `<layer>` is a reference to a layer of the linked
scene, not a layer definition. Consequently:

- Only the `name` attribute is allowed on `<layer>`.
- `<camera>` and `<effect>` are forbidden.
- `background` and `<bounds>` are forbidden.
- Layer elements do not emit a `layers` array.
- Instance object names resolve against the linked scene's local objects and
  the project's global objects.
- The linked scene must exist, and every referenced layer must exist in it.

---

## 13. Editor canvas settings

`<editor>` maps to scene `uiSettings` or prefab/external
`editionSettings`. The current C++ `EditorSettings` container is arbitrary,
but the current editor writes the exact `InstancesEditorSettings` fields below.
Version 1 supports those current fields and no untyped editor-data escape.

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

| DSL attribute | Type | Current field(s) |
| --- | --- | --- |
| `grid` | Boolean | `grid` |
| `grid-type` | `rectangular` or `isometric` | `gridType` |
| `grid-size` | Three finite numbers | `gridWidth`, `gridHeight`, `gridDepth` |
| `grid-offset` | Three finite numbers | `gridOffsetX`, `gridOffsetY`, `gridOffsetZ` |
| `grid-color` | `#RRGGBB` | `gridColor` as a 24-bit integer |
| `grid-alpha` | Number in `[0,1]` | `gridAlpha` |
| `snap` | Boolean | `snap` |
| `zoom` | Finite number at least `0.01` | `zoomFactor` |
| `window-mask` | Boolean | `windowMask` |
| `selected-layer` | String | `selectedLayer` |
| `mode` | `instances-editor` or `embedded-game` | `gameEditorMode` |

`grid-size` components must be non-negative. The current serialized model can
contain zero for an inactive or not-yet-prepared grid axis, while the editor
normalizes active grid sizes to at least `0.01`. `zoom` must be at least
`0.01`, matching current editor preparation. A non-empty `selected-layer` must
resolve in a scene/prefab or in the linked scene for an external layout; the
empty default remains valid for an empty prefab layout.

When `<editor>` is omitted, the compiler emits an empty editor-settings
object. The current editor then applies its contextual defaults. A decompiler
emits every current field present in the serialized editor-settings object;
once the current editor has saved those settings, the canonical line is fully
explicit and stable.

The current arbitrary editor-settings container can also contain only part of
a grouped tuple. When decompiling such data, missing `grid-size` axes are
materialized with the current editor default `32`, and missing `grid-offset`
axes with `0`. This is the same normalization performed by
`prepareInstancesEditorSettings` and makes the grouped DSL representation safe
for partially initialized prefab/variant editor settings.

Old editor-only keys not read by `InstancesEditorSettings` are outside version
1 by design.

---

## 14. Layers

Scene and prefab layer elements define current `gd::Layer` records. Source
order is layer-array order.

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

| DSL attribute | Current field | Allowed/current meaning |
| --- | --- | --- |
| `name` | `name` | Required string; unique in the layout |
| `rendering` | `renderingType` | `""`, `2d`, `3d`, or `2d+3d` |
| `camera-type` | `cameraType` | `""`, `perspective`, or `orthographic` |
| `camera-behavior` | `defaultCameraBehavior` | `do-nothing` or `top-left-anchored-if-never-moved` |
| `visible` | `visibility` | Boolean |
| `locked` | `isLocked` | Boolean editor lock |
| `lighting` | `isLightingLayer` | Boolean |
| `follow-base-camera` | `followBaseLayerCamera` | Boolean |
| `ambient` | `ambientLightColorR/G/B` | `#RRGGBB` |
| `near` | `camera3DNearPlaneDistance` | Finite number |
| `far` | `camera3DFarPlaneDistance` | Finite number greater than `near` |
| `fov` | `camera3DFieldOfView` | Number greater than `0` and at most `180` |
| `max-2d-distance` | `camera2DPlaneMaxDrawingDistance` | Positive finite number |

For a perspective camera, `near` must be strictly positive. The current editor
allows a non-positive near distance for an orthographic camera, but it must
still be less than `far`.

The base layer is represented normally with `name=""`.

Canonical children appear in this order:

1. Cameras in camera-array order.
2. Effects in effect-array order.
3. Object instances grouped on the layer.

---

## 15. Cameras

`<camera>` maps to one current layer camera record.

```layout
<camera size=default viewport=default />
```

Current camera fields are:

```text
defaultSize, width, height,
defaultViewport, viewportLeft, viewportTop, viewportRight, viewportBottom
```

### 15.1 Size forms

| DSL form | Mapping |
| --- | --- |
| `size=default` | `defaultSize=true`, `width=0`, `height=0` |
| `size=default(w,h)` | `defaultSize=true`, preserve stored inactive `width`/`height` |
| `size=wxh` | `defaultSize=false`, store `width=w`, `height=h` |

### 15.2 Viewport forms

| DSL form | Mapping |
| --- | --- |
| `viewport=default` | `defaultViewport=true`, rectangle `0,0,1,1` |
| `viewport=default(l,t,r,b)` | `defaultViewport=true`, preserve the stored inactive rectangle |
| `viewport=l,t,r,b` | `defaultViewport=false`, store the active rectangle |

Viewport components must be finite. The current API documents normalized
viewport coordinates between `0` and `1`; version 1 validates that range and
requires `left <= right` and `top <= bottom`.

Camera source order is preserved. The compiler rejects more than 50 cameras on
one layer because current `Layer::UnserializeFrom` treats that count as an
editor-duplication bug and resets the layer to one camera.

---

## 16. Layer effects

`<effect>` maps exactly to one current `gd::Effect` in layer effect order.

```layout
<effect
  name="3D Light"
  type="Scene3D::HemisphereLight"
  numbers={"elevation":45,"intensity":1,"rotation":0}
  strings={"groundColor":"64;64;64","skyColor":"255;255;255","top":"Y-"}
/>
```

| DSL attribute | Current field | Rule |
| --- | --- | --- |
| `name` | `name` | Required and unique on the layer |
| `type` | `effectType` | Required registered effect type |
| `folded` | `folded` | Boolean, default `false` |
| `enabled` | Inverse of `disabled` | Boolean, default `true` |
| `numbers` | `doubleParameters` | Object of finite number values |
| `strings` | `stringParameters` | Object of string values |
| `booleans` | `booleanParameters` | Object of Boolean values |

Parameter names and types are validated against current effect metadata when
that metadata exists. Typed maps remain separate; converting a string-looking
number into a number or vice versa is forbidden.

Effect order is semantically preserved. Parameter-map keys are sorted by
Unicode code-point order in canonical source, matching their map semantics.

---

## 17. Object instance elements

### 17.1 Direct component form

An object name matching the safe tag grammar and not colliding with a reserved
structural tag is used directly:

```layout
<Player id="ef3ef49d-f20f-4450-b373-0ce43291a002" at=92,552 />
```

The tag maps to current instance field `name`.

### 17.2 Fallback form

Unsafe or reserved names use `<object of="...">`:

```layout
<object
  of="layer"
  id="47d81ec0-75af-4e2b-81f7-f69fb1f48a89"
  at=10,20
/>
```

`of` maps to current instance field `name`. The `of` attribute is allowed only
on the fallback element.

Reserved tag names are:

```text
layout, bounds, editor, layer, camera, effect, object,
properties, variables, var, override
```

### 17.3 Required identity

Every instance requires `id`, mapped to `persistentUuid`. It must be a
lowercase canonical UUIDv4 string and unique across all initial instances in
the project:

```text
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

The source never uses a display alias in place of the persistent UUID. The UUID
is required for stable hot reload and editor identity.

---

## 18. Instance transforms and dimensions

Common instance attributes are:

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
  keep-ratio=true
/>
```

### 18.1 Normative mapping

| DSL attribute | Current instance field(s) |
| --- | --- |
| Parent `<layer name>` | `layer` |
| `at=x,y` | `x`, `y`, with `z=0` |
| `at=x,y,z` | `x`, `y`, `z` |
| `rotation=a` | `angle=a`, with `rotationX=0`, `rotationY=0` |
| `rotation=x,y,z` | `rotationX=x`, `rotationY=y`, `angle=z` |
| `z-order` | `zOrder` integer |
| `opacity` | `opacity` integer |
| `flip` | `flippedX`, `flippedY`, `flippedZ` |
| `locked` | `locked` |
| `sealed` | `sealed` |
| `keep-ratio` | `keepRatio`; the compiler writes `true` and omits `false` to match the current serializer/unserializer pair |

`at` is required. `rotation` defaults to `0`. `z-order` defaults to `0`.
`opacity` is an integer from `0` through `255`.

All three rotation components use the current GDevelop editor angle unit,
degrees.

`flip` is a comma-separated set containing any of `x`, `y`, and `z` exactly
once. Axis order is canonically `x,y,z`.

### 18.2 Width and height

The current serializer stores `customSize`, `width`, and `height` separately.
The DSL uses these exact forms:

| DSL | Mapping |
| --- | --- |
| Omitted `size` or `size=auto` | `customSize=false`, `width=0`, `height=0` |
| `size=auto(w,h)` | `customSize=false`, preserving inactive stored `width=w`, `height=h` |
| `size=wxh` | `customSize=true`, `width=w`, `height=h` |

The `auto(w,h)` form exists only to preserve the current serializer's possible
inactive width/height values without falsely enabling custom size.

### 18.3 Depth

The current serializer has no `customDepth` field. Presence of `depth` means
custom depth is enabled; absence means it is disabled:

| DSL | Mapping |
| --- | --- |
| Omitted `depth` | No `depth` field; `HasCustomDepth=false` |
| `depth=d` | Emit `depth=d`; `HasCustomDepth=true` |

`defaultWidth`, `defaultHeight`, and `defaultDepth` are deliberately absent
because current `InitialInstance::SerializeTo` explicitly does not serialize
them; they are evaluated by the in-game editor.

---

## 19. Custom instance properties

Object extensions may store object-type-specific initial-instance data in the
current numeric and string property maps.

```layout
<Sprite
  id="44cf274b-e43b-4d3e-bf79-5475b6ea0e0c"
  at=128,256
>
  <properties
    numbers={"animation":15}
    strings={"initialText":"Ready"}
  />
</Sprite>
```

| DSL | Current field |
| --- | --- |
| `numbers` | `numberProperties`, compiled to ordered `{name,value}` entries |
| `strings` | `stringProperties`, compiled to ordered `{name,value}` entries |

Numeric values must be finite numbers. String values must be strings. Property
names are unique within each typed map. Canonical map keys use Unicode
code-point order, matching the current `std::map` storage.

The compiler validates known custom property names and types through the
referenced object's current initial-instance property descriptors. It does not
invent object-definition fields in the layout.

---

## 20. Initial instance variables

`<variables>` maps to current `initialVariables`. Top-level child order is
preserved.

```layout
<variables>
  <var
    name="Health"
    type=number
    value=100
    id="03c3bff7-aa8e-4f47-b74a-fe78299ce54b"
  />

  <var name="State" type=enum value="Idle" values=["Idle","Run","Dead"] />

  <var name="Inventory" type=structure folded=true>
    <var name="Ammo" type=number value=12 />
    <var name="Weapon" type=string value="Pistol" />
  </var>

  <var name="Path" type=array>
    <var type=string value="A" />
    <var type=string value="B" />
  </var>
</variables>
```

### 20.1 Variable attributes

| Attribute | Rule | Current mapping |
| --- | --- | --- |
| `name` | Required for container/structure children; forbidden for array children | `name` on the serialized variable entry |
| `type` | Required: `string`, `enum`, `number`, `boolean`, `structure`, or `array` | `type` |
| `value` | Required for primitive types; forbidden for structure/array | `value` |
| `values` | Allowed only for enum; unique string array | `values` |
| `folded` | Boolean, default `false` | `folded` |
| `id` | Optional UUID string | `persistentUuid` |

The current `mixed` type and `hasMixedValues` marker are forbidden for initial
instance variables. `InitialInstance::UnserializeFrom` explicitly clears that
temporary multi-selection editor state, so it cannot be valid persistent
instance source.

### 20.2 Child rules

- A primitive or enum variable is self-closing and has no child variables.
- A structure has named, unique children. Current C++ structure storage is a
  map, so canonical child order is Unicode code-point name order.
- An array has unnamed children, and source order is array order.
- An enum's value must occur in `values` when that list is non-empty, matching
  current normalization.

---

## 21. Per-instance behavior overrides

Object behavior definitions and defaults remain in settings. A layout may
override content for one already attached behavior:

```layout
<Player
  id="ef3ef49d-f20f-4450-b373-0ce43291a002"
  at=92,552
>
  <override
    behavior="PlatformerObject"
    data={"maxSpeed":500,"acceleration":1500}
  />
</Player>
```

| Attribute | Rule | Current mapping |
| --- | --- | --- |
| `behavior` | Required attached behavior name | `name` |
| `data` | Required typed data literal containing the behavior content | Behavior serializer content |
| `folded` | Boolean, default `false` | `isFolded` |
| `muted` | Boolean, default `false` | `isMuted` |
| `inherited` | Boolean, default `false` | `isInheritedFromObjectType` |
| `quick` | `default`, `visible`, or `hidden` | `quickCustomizationVisibility` |
| `property-visibility` | Object mapping property names to `default`/`visible`/`hidden` | `propertiesQuickCustomizationVisibilities` |

The compiler derives the current behavior `type` from the referenced object
definition and the named attached behavior. It emits that type in the current
behavior-overriding record. Duplicating the behavior type in layout source is
forbidden.

`data` is necessary because behavior content is extension-defined and stored
by the current `BehaviorConfigurationContainer` as a `SerializerElement`.
It is a typed native payload, not a legacy JSON escape. The compiler validates
it by constructing the current behavior implementation and running its current
unserializer/property metadata where available.

An instance may contain at most one override per attached behavior.

---

## 22. Ordering

The current serializers preserve these orders:

- Layer order.
- Camera order within a layer.
- Effect order within a layer.
- Global initial-instance array order.
- Top-level variable and array-child order.

Layer nesting naturally groups instances, while the current instance array can
interleave instances from different layers. Version 1 preserves both visual
grouping and exact global array order with an optional `order` attribute.

### 22.1 Normal case

When depth-first instance source order already equals current global instance
order, no instance has `order`:

```layout
<layer name="">
  <Player id="..." at=0,0 />
  <Enemy id="..." at=100,0 />
</layer>

<layer name="HUD">
  <ScoreText id="..." at=16,16 />
</layer>
```

### 22.2 Interleaved serialized-model order

If grouping by layer would change the current global order, every instance in
the file receives a contiguous zero-based `order`:

```layout
<layer name="">
  <Player id="..." order=0 at=0,0 />
  <Enemy id="..." order=2 at=100,0 />
</layer>

<layer name="HUD">
  <ScoreText id="..." order=1 at=16,16 />
</layer>
```

All-or-none is mandatory: either no instance has `order`, or every instance
has a unique contiguous value from `0` through `instanceCount - 1`.

The compiler uses `order` when present; otherwise it uses depth-first source
order. The decompiler omits all `order` attributes whenever grouping preserves
the current array order.

`order` is unrelated to 2D `z-order` and layer order.

---

## 23. Defaults and omission

Omitted source attributes compile to current editor/model defaults.

### 23.1 Layer defaults

| Attribute | Default |
| --- | --- |
| `rendering` | `""` (current automatic 2D/3D behavior) |
| `camera-type` | `""` |
| `camera-behavior` | `top-left-anchored-if-never-moved` |
| `visible` | `true` |
| `locked` | `false` |
| `lighting` | `false` |
| `follow-base-camera` | `false` |
| `ambient` | `#C8C8C8` |
| `near` | `3` |
| `far` | `10000` |
| `fov` | `45` |
| `max-2d-distance` | `5000` |

No camera is implicitly added by the DSL compiler. Camera elements reproduce
the current camera vector exactly. Current scene creation normally creates one
base-layer camera, while a newly inserted additional layer can have none.

### 23.2 Effect defaults

| Attribute | Default |
| --- | --- |
| `folded` | `false` |
| `enabled` | `true` |
| Typed parameter maps | Empty |

### 23.3 Instance defaults

| Attribute | Default |
| --- | --- |
| `at` | Required |
| `rotation` | `0` |
| `z-order` | `0` |
| `opacity` | `255` |
| `flip` | No flipped axes |
| `size` | `auto` (`customSize=false`, width/height `0`) |
| `depth` | Absent (`HasCustomDepth=false`) |
| `locked` | `false` |
| `sealed` | `false` |
| `keep-ratio` | `true`, matching a newly constructed current instance. The compiler explicitly emits `keepRatio=true`; `false` is represented by absence in the current serializer tree. |
| Custom properties | Empty |
| Initial variables | Empty |
| Behavior overrides | Empty |

Canonical source omits attributes equal to these defaults except required
identity/context attributes. A non-default false value whose default is true,
such as `keep-ratio=false`, is written explicitly.

---

## 24. Semantic validation

Compilation stops before changing the project if any rule fails.

### 24.1 Document rules

- Exactly one root and `version=1`.
- Only context-valid root fields and children.
- No unknown tags or attributes.
- No duplicate attribute on one element.
- No text nodes or comments.
- Every string is valid UTF-8 NFC.
- Every number is finite.

### 24.2 Layer rules

- Scene/prefab layer names are unique. A scene or prefab may have no layers
  only when it also has no instances.
- External layer groups reference unique existing layers of the linked scene.
- A non-empty `selected-layer` resolves in the applicable layer container.
- Camera, lighting, and effect validation follows sections 14 through 16.

### 24.3 Instance rules

- Every UUID is valid and project-unique.
- Every object tag resolves in the correct context.
- Every instance is a direct child of one layer.
- `order` obeys the all-or-none contiguous contract.
- `z-order` and `opacity` are integers; opacity is in `[0,255]`.
- Custom property names/types are valid for the referenced object.
- Initial variable shapes/types are valid.
- Every behavior override names an attached behavior and passes current
  behavior-content validation.

### 24.4 Ownership rules

The compiler rejects object definitions, object folders/groups, object effects,
attached behavior definitions, scene variables, scene runtime properties,
events, resources, extension declarations, and function declarations anywhere
in a layout.

There is no unknown-field preservation block. A new current serializer field
requires a grammar-version/spec/compiler update before it can be authored.

---

## 25. Normative compiler mapping

Compilation produces a layout-owned current serializer fragment, not a whole
scene or project.

### 25.1 Scene output

```text
root background                 -> r, v, b
editor                          -> uiSettings
layer definitions               -> layers[]
all instance elements           -> instances[]
```

### 25.2 Prefab/variant output

```text
bounds                          -> areaMinX/Y/Z, areaMaxX/Y/Z
editor                          -> editionSettings
layer definitions               -> layers[]
all instance elements           -> instances[]
```

### 25.3 External-layout output

```text
editor                          -> editionSettings
all instance elements           -> instances[]
```

No `layers` array is emitted for an external layout.

### 25.4 Instance output

For every instance, the compiler emits current fields according to sections
17 through 21:

```text
name, x, y, optional z,
angle, optional rotationX/rotationY,
zOrder, optional opacity/flips,
layer,
customSize, width, height, optional depth,
optional locked/sealed and serializer-shaped keepRatio,
persistentUuid,
numberProperties, stringProperties,
initialVariables,
optional behaviorOverridings
```

Fields that the current `InitialInstance::SerializeTo` omits at their defaults
are omitted from the compiled compatibility tree in the same cases. `width`,
`height`, `customSize`, `angle`, `zOrder`, `layer`, `persistentUuid`, and the
three collection fields follow the current serializer's always-written shape.

### 25.5 Merge boundary

After layout compilation, the project composer merges:

```text
settings-owned scene or prefab fields
  + compiled layout-owned fields
  + compiled events, when the owner has events
  -> current complete serializer object
```

Existing GDevelop unserialization remains the semantic authority. Generated
preview/export `.gdevelop/game.json` contains the current combined shape, not
layout markup.

---

## 26. Normative decompiler mapping

The decompiler receives a current serialized scene-layout, prefab-variant, or
external-layout subtree plus its owner context.

It must:

1. Select only the fields owned by the target layout context.
2. Convert scene RGB components to uppercase `#RRGGBB`.
3. Emit prefab bounds before editor/layers.
4. Emit editor state using the current field mapping.
5. Emit layers in current array order.
6. Emit cameras and effects in their current array order.
7. Group every current initial instance beneath its named layer.
8. Emit direct object tags when safe; otherwise emit `<object of="...">`.
9. Preserve persistent UUID, transforms, inactive size data, custom property
   maps, variables, and behavior overrides.
10. Compare grouped depth-first instance order with current global array order.
    Emit no `order` attributes when equal; otherwise emit them for every
    instance.
11. Omit values equal to DSL defaults while preserving values whose inactive
    serializer storage would otherwise be lost.
12. Canonically format the result and end with one newline.

The decompiler must fail rather than emit a lossy file when a current field is
outside version 1 coverage.

---

## 27. Canonical formatting

Canonical source follows these rules:

- Two-space indentation.
- One element attribute per line when the complete opening tag would exceed
  100 characters; otherwise a compact single line is allowed.
- `version` is the first root attribute.
- Structural attributes use the order defined in their mapping tables.
- Object instance attributes use this order:

```text
of (fallback only), id, order, at, rotation, z-order, size, depth,
opacity, flip, locked, sealed, keep-ratio
```

- Default-valued optional attributes are omitted.
- Bare Boolean flags are used only when their value is `true` and their
  attribute definition permits it (`locked`, `sealed`). Other Booleans use
  `name=true|false`.
- Colors are uppercase.
- Numbers use the shortest round-trip-safe decimal representation; `-0` is
  normalized to `0`.
- Typed-map keys are Unicode code-point sorted.
- Empty typed maps and empty optional child containers are omitted.
- Layer, camera, effect, instance, variable, and array-child orders follow
  section 22.
- Adjacent top-level structural elements are separated by one blank line.
- No trailing spaces.

Formatting never changes semantic order merely to produce a smaller diff.

---

## 28. Diagnostics

Every diagnostic includes:

- Stable error code.
- `game://` file URI.
- One-based line and column.
- Element path using instance UUIDs where possible.
- Concise message.
- Expected form or valid alternatives when useful.

Recommended codes include:

```text
LAYOUT_SYNTAX
LAYOUT_UNSUPPORTED_VERSION
LAYOUT_INVALID_CONTEXT
LAYOUT_UNKNOWN_ELEMENT
LAYOUT_UNKNOWN_ATTRIBUTE
LAYOUT_DUPLICATE_ATTRIBUTE
LAYOUT_INVALID_LITERAL
LAYOUT_INVALID_NUMBER
LAYOUT_INVALID_COLOR
LAYOUT_INVALID_UUID
LAYOUT_DUPLICATE_UUID
LAYOUT_UNKNOWN_OBJECT
LAYOUT_UNKNOWN_LAYER
LAYOUT_DUPLICATE_LAYER
LAYOUT_INVALID_INSTANCE_ORDER
LAYOUT_INVALID_CAMERA
LAYOUT_UNKNOWN_EFFECT
LAYOUT_INVALID_EFFECT_PARAMETER
LAYOUT_INVALID_VARIABLE
LAYOUT_UNKNOWN_BEHAVIOR
LAYOUT_INVALID_BEHAVIOR_OVERRIDE
LAYOUT_OWNERSHIP_VIOLATION
LAYOUT_UNSUPPORTED_SERIALIZED_FIELD
```

Example:

```text
LAYOUT_UNKNOWN_OBJECT game://scenes/Main/Main.layout:18:5
Instance tag <EnemyBoss> does not resolve to a scene-local or global object.
```

---

## 29. Complete 2D scene example

```layout
<layout version=1 background=#202030>
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

  <layer name="">
    <camera size=default viewport=default />

    <Background
      id="1edaa82f-9df8-4c90-bc7b-00163f91a001"
      at=0,0
      z-order=-100
    />

    <Player
      id="ef3ef49d-f20f-4450-b373-0ce43291a002"
      at=92,552
      z-order=20
    >
      <variables>
        <var name="Health" type=number value=100 />
        <var name="State" type=enum value="Idle" values=["Idle","Run","Dead"] />
      </variables>

      <override
        behavior="PlatformerObject"
        data={"maxSpeed":500,"acceleration":1500}
      />
    </Player>

    <Platform
      id="758cc2ab-a7cf-47ec-ab2c-9ecea091a003"
      at=0,640
      size=1280x80
      z-order=5
      keep-ratio=false
    />
  </layer>

  <layer name="HUD" camera-behavior=do-nothing>
    <ScoreText
      id="fd94814c-3eca-4ce7-bb55-6722a2be8412"
      at=24,24
      size=240x48
      z-order=1
    />
  </layer>
</layout>
```

---

## 30. Complete 3D and effects example

```layout
<layout version=1 background=#101820>
  <layer
    name=""
    rendering=2d+3d
    camera-type=perspective
    lighting=true
    ambient=#404040
    near=3
    far=10000
    fov=45
    max-2d-distance=5000
  >
    <camera size=default viewport=default />

    <effect
      name="3D Light"
      type="Scene3D::HemisphereLight"
      numbers={"elevation":45,"intensity":1,"rotation":0}
      strings={"groundColor":"64;64;64","skyColor":"255;255;255","top":"Y-"}
    />

    <Ship
      id="56cda5f4-6981-438f-b188-a7b2268336b2"
      at=100,50,20
      rotation=0,45,0
      size=64x32
      depth=24
      opacity=220
      z-order=4
    >
      <properties numbers={"lod":2} strings={"skin":"red"} />
    </Ship>
  </layer>
</layout>
```

---

## 31. Complete prefab example

The child object definitions `Body` and `HealthBar` are in
`prefab.settings`; this source only composes their instances.

```layout
<layout version=1>
  <bounds min=0,0,0 max=128,96,0 />

  <editor
    grid=true
    grid-type=rectangular
    grid-size=16,16,16
    grid-offset=0,0,0
    grid-color=#9EB4FF
    grid-alpha=0.8
    snap=true
    zoom=4
    window-mask=false
    selected-layer=""
    mode=instances-editor
  />

  <layer name="">
    <Body
      id="37662871-3864-42a8-ae4d-c9ec0ebd6371"
      at=0,0
    />

    <HealthBar
      id="3cf06c32-f98e-43bc-9bd5-f61340bf6335"
      at=8,-12
      size=48x6
      z-order=1
    />
  </layer>
</layout>
```

---

## 32. Complete external-layout example

The external settings entry supplies the external-layout name and linked
scene. Layer elements below are references to that scene's layers.

```layout
<layout version=1>
  <editor
    grid=false
    grid-type=rectangular
    grid-size=32,32,32
    grid-offset=0,0,0
    grid-color=#9EB4FF
    grid-alpha=0.8
    snap=false
    zoom=1
    window-mask=true
    selected-layer=""
    mode=instances-editor
  />

  <layer name="">
    <Coin
      id="df034793-37cf-4be9-84bd-a0774a46de76"
      at=100,200
    />

    <Coin
      id="6a85201d-2d95-48e3-a087-ed74fd62f963"
      at=200,200
    />
  </layer>

  <layer name="HUD">
    <HintText
      id="07ddaf47-e2ef-48de-9416-8c39c7af1cf0"
      at=24,24
    />
  </layer>
</layout>
```

---

## 33. AI authoring contract

An AI model editing `.layout` files must:

1. Read the owning settings file before the layout.
2. Treat object tags as references to settings-owned definitions, never as
   declarations.
3. Preserve every existing instance UUID and generate a new UUIDv4 only for a
   genuinely new instance.
4. Preserve global instance order according to section 22.
5. Place each instance under exactly one valid layer.
6. Use `<object of="...">` when the name is unsafe or reserved.
7. Preserve non-default transforms, inactive `auto(w,h)` values, custom
   properties, variables, and behavior overrides.
8. Resolve behavior overrides only against behaviors attached in settings.
9. Keep scene runtime settings, object definitions, attached behaviors, and
   events out of layout source.
10. Use only literal values; never place GDevelop expressions or JavaScript in
    layout attributes.
11. Reformat canonically after a valid edit.
12. Reload the project before previewing direct file edits.

For a new ordinary instance, the smallest correct element is:

```layout
<Player
  id="710890a0-697a-4a67-b1a0-915a20da4a19"
  at=128,256
/>
```

---

## 34. Codebase compatibility basis

This specification is aligned to these current implementation boundaries:

| Concern | Current implementation | DSL consequence |
| --- | --- | --- |
| Scene serialization | `Core/GDCore/Project/Layout.cpp` | Scene layout owns RGB background, editor settings, instances, and layers; other scene fields remain settings/events-owned. |
| Prefab variant serialization | `Core/GDCore/Project/EventsBasedObjectVariant.cpp` | Bounds, layers, instances, and edition settings are layout-owned; object definitions/groups remain settings-owned. |
| External layout serialization | `Core/GDCore/Project/ExternalLayout.cpp` | Only instances and edition settings enter `.layout`; identity and associated scene stay in external settings. |
| Layer and camera serialization | `Core/GDCore/Project/Layer.cpp` and `Layer.h` | Every current layer/camera field has a typed markup attribute/form. |
| Effect serialization | `Core/GDCore/Project/Effect.cpp` and `EffectsContainer.cpp` | Effect order and separate number/string/Boolean maps are preserved. |
| Instance serialization | `Core/GDCore/Project/InitialInstance.cpp` and `InitialInstance.h` | UUID, full 2D/3D transform, size/depth semantics, opacity, flips, locks, maps, variables, and overrides are covered. |
| Instance order | `Core/GDCore/Project/InitialInstancesContainer.cpp` | Global list order is retained with the all-or-none `order` mechanism when grouping would reorder it. |
| Variables | `Core/GDCore/Project/Variable.cpp` and `VariablesContainer.cpp` | Primitive, enum, structure, array, fold state, UUID, and child ordering are typed. Mixed selection state is rejected. |
| Behavior overrides | `Core/GDCore/Project/BehaviorsContainer.cpp` and `BehaviorConfigurationContainer.h` | Attached behavior type is resolved from settings; extension-defined override content uses a typed native data literal. |
| Current editor settings | `newIDE/app/src/InstancesEditor/InstancesEditorSettings.js` | Version 1 editor markup exposes exactly the fields read/written by the current scene editor. |
| Current multi-file ownership | `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js` | The compiler produces only the current scene/prefab/external layout field partitions. |

Fields accepted only by historical compatibility branches—such as old French
keys, `oglFOV`, `oglZNear`, `oglZFar`, old `floatInfos`/`stringInfos`, or
`defaultWidth`/`defaultHeight`/`defaultDepth`—are intentionally not grammar.
The user requested a clean source format without compatibility syntax.

---

## 35. Required implementation and verification

The implementation components below define `.layout` as writable project
source and are exercised by the Layout DSL and multi-file integration suites.

### 35.1 Required components

- Lexer and parser producing a source-located AST.
- Context-aware semantic validator.
- Compiler from AST to current layout-owned serializer fragments.
- Canonical decompiler from current fragments to markup.
- Formatter.
- Structural equivalence checker.
- Multi-file project integration replacing TOML layout reading/writing only;
  runtime/preview/export integration remains at the existing composed-project
  boundary.

Editor text-language services are outside the format boundary: the current
GDevelop scene/prefab editors edit the in-memory model, while external source
editors edit `.layout` directly. Such services may be added later without
changing the grammar, compiler, or serializer.

### 35.2 Required round-trip tests

For every canonical current-serializer fixture and representative installed
extension fixture that is within version 1 coverage:

```text
current serialized layout fragment A
  -> canonical layout markup
  -> compiled current layout fragment B
```

`A` and `B` must be structurally equivalent after only documented current
serializer normalization. Tests must cover:

- Empty and full scene layouts.
- Default and non-default prefab variants.
- External layouts.
- Multiple and interleaved layers/instances.
- Multiple and zero cameras.
- 2D and 3D transforms.
- Active and inactive custom-size storage.
- Custom depth.
- Opacity, flips, locks, sealing, and keep-ratio values.
- Numeric and string custom instance properties.
- Every variable type, nested structures/arrays, enum values, UUIDs, and fold
  state.
- Behavior overrides with nested extension-defined data and customization
  metadata.
- Layer effects with every parameter type, order, folded, and disabled state.
- Editor settings for scenes, prefabs, variants, and externals.
- Unsafe/reserved object names using fallback elements.
- Every diagnostic and malformed literal class.

Historical fixtures containing compatibility-only serializer keys are not
silently normalized by this suite; version 1 intentionally rejects them.

### 35.3 Integration invariants

- Adding/editing an object definition or attached behavior rewrites settings,
  not layout.
- Adding/moving/resizing an instance rewrites layout, not settings.
- Editing events never rewrites layout.
- Compiling source and merging settings produces data accepted by current
  GDevelop unserializers.
- Preview/export receives the same current project data shape as before.
- A failed parse/validation never partially mutates editor memory or disk.
- Canonical save is deterministic and transactional.

---

## 36. Final design principles

1. A layout is a visual component tree, not another settings document.
2. Settings define objects; layouts instantiate them.
3. Layers visually contain instances while explicit ordering preserves the
   current global serializer model when necessary.
4. The pleasant common case stays small; rare current metadata remains typed
   and lossless.
5. Stable UUIDs, not filenames or array positions, identify instances.
6. Source contains literals only—no expressions, scripts, or event logic.
7. Every supported element maps to a current codebase field or source-only
   grammar marker.
8. No legacy or unknown-field escape weakens the ownership contract.
9. The compiler fails before writing whenever it cannot preserve current
   semantics.
10. Runtime logic remains unchanged; markup ends at the editor serialization
    boundary.
