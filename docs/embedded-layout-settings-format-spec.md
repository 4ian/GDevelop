# Embedded layout settings and flattened source paths

- **Status:** Approved; implementation contract for version 5
- **Target multi-file format:** 5
- **Layout schema version:** 1, unchanged
- **Primary implementation:** `newIDE/app/src/ProjectsStorage`
- **Scope:** Multi-file authoring sources only

## 1. Summary and decision

Multi-file format version 5 removes managed `.layout` source files. Spatial
and visual layout data remains a strict, independently validated layout
domain, but it is stored as a namespaced `[layout]` subtree inside the
`.settings` file that owns the component.

The ownership model is:

| Component              | Version 4 sources                                                             | Version 5 source                                                        |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Scene                  | `scene.settings` + `<Scene>.layout`                                           | `scene.settings` with embedded layout                                   |
| Prefab default variant | `prefab.settings` + `<Prefab>.layout`                                         | `prefab.settings` with embedded layout                                  |
| Named prefab variant   | `[[variants]]` in `prefab.settings` + `variants/<Variant>.layout`             | `variants/<Variant>/variant.settings` with metadata and embedded layout |
| External layout        | `[[externalLayoutFiles]]` in `scene.settings` + `externals/<External>.layout` | `external-layout/<External>.settings` with metadata and embedded layout |
| Function pair          | `functions/<Function>/function.settings` + `<Function>.events`                | `functions/<Function>.settings` + `functions/<Function>.events`         |
| Event body syntax      | IfDo `.events`                                                                | IfDo `.events`, unchanged                                               |
| Gameplay tests         | Inline project/extension records and JavaScript                               | Root `tests.settings` + flat root `tests/*.js` sources                   |

There are no managed `.layout` files in a version 5 source tree. The editable
component fragments use `.settings` for declarative data and `.events` for
event logic. `project.gdevelop` remains the bootstrap entry file and
`constants.toml` remains the direct-root editor-only constants document; this
proposal does not rename those deliberate exceptions.

Gameplay tests are the other deliberate root-owned version 5 domain. Their
complete ownership, strict schema, flat source allocation, and ignored
last-run state contract are defined by
[`gameplay-tests-multifile-serialization-spec.md`](gameplay-tests-multifile-serialization-spec.md).
In particular, test `file` values are scheme-free root-relative
`tests/<Encoded basename>.js` paths rather than `game://` event references.

The existing flat layout vocabulary, semantic contexts, defaults, UUID rules,
catalog resolution, and strict rejection behavior remain authoritative. This
proposal changes physical ownership and TOML namespacing, not layout runtime
semantics.

## 2. Motivation

### 2.1 Current problem

Version 4 treats layout as both a semantic domain and a physical file type.
That requires the source adapter to split one serializer-owned component into
multiple files and then restore it through URI associations:

- a scene has settings plus a referenced layout source;
- a prefab has settings plus a referenced default layout source;
- each named variant has metadata in its parent prefab and spatial data in a
  separate layout source;
- an external layout has identity and order in its scene settings but its
  actual data in a separate layout source.

This produces several costs:

1. Component identity, metadata, and layout can become inconsistent across
   physical files.
2. A rename must update filenames, URI fields, parent manifests, and ownership
   checks even when the relationship is derivable from the directory.
3. Missing layout sources and stale layout URIs create failure modes unrelated
   to authored game semantics.
4. Source authors and AI tools must select among three editable extensions
   even though both `.settings` and `.layout` are strict TOML declarations.
5. Named prefab variants are not self-contained: their metadata belongs to the
   parent while their objects and layout are stored below a variant path.
6. External layouts are not self-contained and cause high-level
   `scene.settings` edits when only external-layout identity changes.
7. Format discovery, ownership validation, rename transactions, source
   catalogs, and recovery logic all carry layout-reference-specific branches.

The physical split does provide useful write isolation for high-churn scene
placement data. Version 5 preserves component-level isolation where it is
valuable by giving named variants and external layouts their own `.settings`
owners. It accepts that the default scene and default prefab layout change
their existing owner settings files.

### 2.2 Desired authoring model

The source tree should communicate two primary concepts:

- `.settings` declares what a component is and all non-event data it owns;
- `.events` declares what event logic a function or lifecycle phase executes.

Layout remains a strongly typed subdomain inside settings rather than becoming
generic serializer data.

## 3. Goals

1. Emit no managed `.layout` files in multi-file format version 5.
2. Make every layout-bearing component self-contained in one `.settings`
   owner, excluding its separately owned object definitions and functions.
3. Embed scene and default-prefab layout data in their existing settings
   owners.
4. Promote every named prefab variant to an independently discovered
   `variant.settings` component.
5. Promote every external layout to an independently discovered
   `external-layout.settings` component below its associated scene.
6. Preserve the strict layout version 1 schema and all current compilation,
   decompilation, validation, and canonicalization semantics.
7. Preserve exact normalized legacy-project round trips through
   `gd::Project::UnserializeFrom`.
8. Keep object definitions in their existing `objects/*.settings` sources and
   all event bodies in `.events` sources.
9. Flatten every function pair from
   `functions/<Function>/function.settings` plus `<Function>.events` to
   `functions/<Function>.settings` plus `functions/<Function>.events`.
10. Preserve a dedicated `objects/` directory for every object-owning scope,
    including named variants, because objects are first-class components.
11. Continue content-addressed dirty writes: an unchanged canonical component
    must not be replaced merely because another component changed.
12. Support one explicitly named, one-time conversion of
    `D:\Users\Administrator\Documents\GDevelop projects\My project116`; do
    not ship a general version 4 reader or migration path.
13. Make that one-time conversion atomic, recoverable, and verified before
    deleting or moving version 4 sources.
14. Preserve precise file, line, and column diagnostics for embedded layout
    errors.
15. Avoid unnecessary event recompilation for layout edits that cannot affect
    event validation or catalogs.

## 4. Non-goals

1. This proposal does not change `gd::Layout`, `EventsBasedObject`,
   `EventsBasedObjectVariant`, or `ExternalLayout` serialization contracts.
2. It does not change runtime project data, code generation, preview semantics,
   hot-reload semantics, or exported games.
3. It does not merge object definitions into scene, prefab, or variant owner
   settings.
4. It does not embed `.events` text or compiled event arrays in settings.
5. It does not merge all named variants into `prefab.settings`.
6. It does not weaken layout validation, introduce generic `rawJson` inside
   layout tables, or accept unknown layout fields.
7. It does not add TOML include/import directives or textual source expansion.
8. It does not preserve comments across canonical editor saves; the current
   canonical-source policy remains unchanged.
9. It does not rename `project.gdevelop`, `constants.toml`, generated files
   below `.gdevelop/`, or resource files used by the game.
10. It removes the generated layout catalog and merges its tables, contexts,
    authoring metadata, and behavior-override schemas into the settings
    catalog.
11. It does not provide production read compatibility for multi-file format
    version 4 or earlier.
12. It does not provide a reusable public v4-to-v5 converter. The only v4
    conversion in scope is the explicitly named local project.

## 5. Normative terminology and invariants

- **Owner settings** is the `.settings` file that contains component identity,
  metadata, and its embedded layout subtree.
- **Embedded layout** is the root `[layout]` table and its namespaced child
  tables in an owner settings file.
- **Owner configuration** is every owner field outside the embedded layout.
- **Layout document** is the logical version 1 structure consumed by the
  layout compiler. Production v5 obtains it only from an embedded table; the
  temporary one-time harness can also obtain it from the authorized project's
  version 4 `.layout` files.
- **Managed retired layout path** is a canonical version 4 layout path that
  would have been generated by the old multi-file writer.

The following invariants are normative:

1. Every layout-bearing component has exactly one embedded layout owner.
2. Layout fields may appear only below that owner's `[layout]` namespace.
3. Owner configuration may not duplicate layout-owned serializer fields.
4. Object definitions may not appear in an embedded layout or its owner.
5. Event instructions may not appear in an embedded layout or owner settings.
6. A version 5 source tree must not reference or depend on a `.layout` source.
7. A version 5 reader must not silently prefer an embedded layout over a
   retired `.layout`, or vice versa. Mixed ownership is an error.
8. The owner kind supplies the layout compilation context. Layout data does
   not repeat scene, prefab, variant, external-layout, or project identity.
9. Named variants and external layouts are ordered by an explicit `order`
   field in their own settings files, not filesystem enumeration order.
10. The physical owner path supplies parent association. Parent associations
    are not serialized again as URI or name references.
11. Every function settings file and event body share one filename stem in one
    `functions/` directory. Function settings do not store an events URI.
12. A named variant directory contains `variant.settings` plus
    `objects/<Object>.settings`. Object settings never share the owner directory
    with `variant.settings`.

## 6. Current version 4 behavior

The implemented version 4 adapter currently uses these relevant paths:

```text
scenes/<Scene>/
  scene.settings
  <Scene>.layout
  objects/<Object>.settings
  functions/<Lifecycle>/
    function.settings
    <Lifecycle>.events

extensions/<Extension>/prefabs/<Prefab>/
  prefab.settings
  <Prefab>.layout
  objects/<Object>.settings
  variants/
    <Variant>.layout
    <Variant>/objects/<Object>.settings

scenes/<Scene>/externals/
  <ExternalLayout>.layout
```

The current split fields are:

- scene layout: `r`, `v`, `b`, `uiSettings`, `instances`, and `layers`;
- prefab/variant layout: bounds, `editionSettings`, `instances`, and `layers`;
- external layout: `editionSettings` and `instances`, with linked scene layer
  references compiled in external context.

Version 4 `scene.settings` owns a layout URI. Version 4 `prefab.settings` owns
the default layout URI and a `[[variants]]` array containing variant metadata
and layout URIs. Scene settings also contain `[[externalLayoutFiles]]` records
with external-layout name, global order, and layout URI.

The writer deconstructs the full legacy model, canonicalizes every generated
fragment, compares it to the existing bytes, and stages only changed or
obsolete URIs. The loader reverses this process before passing a reconstructed
legacy object to the existing model.

## 7. Version 5 physical source tree

### 7.1 Complete representative tree

```text
project.gdevelop
resources.settings
constants.toml
tests.settings
tests/
  Player%20can%20jump.js
  Combat%20-%20Enemy%20takes%20damage.js
objects/
  GlobalObject.settings
scenes/
  Main/
    scene.settings
    objects/
      Player.settings
    functions/
      sceneLoad.settings
      sceneLoad.events
      sceneSignal.settings
      sceneSignal.events
      sceneUpdate.settings
      sceneUpdate.events
      sceneUnload.settings
      sceneUnload.events
    external-events/
      SharedCombat/
        external-events.settings
        functions/
          sceneUpdate.settings
          sceneUpdate.events
    external-layout/
      BonusRoom.settings
extensions/
  Combat/
    extension.settings
    functions/
      CalculateDamage.settings
      CalculateDamage.events
    prefabs/
      Enemy/
        prefab.settings
        objects/
          Body.settings
        variants/
          Armored/
            variant.settings
            objects/
              Body.settings
        functions/
          TakeDamage.settings
          TakeDamage.events
.gdevelop/
  gameplay-test-results.json
```

An external event and external layout with the same canonical name may coexist
because they belong to independent `external-events/` and `external-layout/`
namespaces. Their names and project-wide order sequences remain independent.

### 7.2 Flattening rules

Version 5 deliberately keeps semantic owner directories such as `scenes/`,
`objects/`, `extensions/`, `prefabs/`, `variants/`, `behaviors/`,
`external-events/`, `external-layout/`, and `functions/`. It removes directory
levels that repeat a type already expressed by a filename or owning path.

All function owners use one sibling pair:

```text
<Owner>/functions/<Function>.settings
<Owner>/functions/<Function>.events
```

This applies uniformly to project extension functions, prefab functions,
behavior functions, scene lifecycle functions, and External Events lifecycle
functions. The old per-function directory and generic `function.settings`
filename are retired. The settings and events filenames have the same encoded
stem; the settings `name` must match that decoded identity, and the event path
is derived without an `events` URI field.

A named variant keeps both its movable owner directory and an explicit object
component directory:

```text
prefabs/<Prefab>/variants/<Variant>/variant.settings
prefabs/<Prefab>/variants/<Variant>/objects/<Object>.settings
```

The `objects/` level is semantic, not redundant. Objects are first-class
components and every object-owning scope uses an explicit `objects/` directory,
including the project, scenes, default prefabs, and named variants. This keeps
object discovery, ownership, renames, and direct authoring uniform while
preventing object collections from obscuring owner metadata and functions. The
refactor flattens only a directory that repeats function identity; it does not
flatten object ownership boundaries merely to minimize path length.

Representative target mappings are:

| Version 4 path                                                            | Version 5 path                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `scenes/Game/functions/sceneUpdate/function.settings`                     | `scenes/Game/functions/sceneUpdate.settings`                     |
| `scenes/Game/functions/sceneUpdate/sceneUpdate.events`                    | `scenes/Game/functions/sceneUpdate.events`                       |
| `scenes/Game/externals/HUD/functions/sceneUpdate/function.settings`       | `scenes/Game/external-events/HUD/functions/sceneUpdate.settings` |
| `extensions/Local/functions/Function/function.settings`                   | `extensions/Local/functions/Function.settings`                   |
| `extensions/Local/prefabs/MyObject/functions/onCreated/function.settings` | `extensions/Local/prefabs/MyObject/functions/onCreated.settings` |

### 7.3 Removed paths

The version 5 writer never emits:

```text
scenes/<Scene>/<Scene>.layout
scenes/<Scene>/externals/<External>.layout
extensions/<Extension>/prefabs/<Prefab>/<Prefab>.layout
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>.layout
**/functions/<Function>/function.settings
**/functions/<Function>/<Function>.events
```

The writer also removes the following version 4 association fields:

- root `layout` URI in `scene.settings`;
- root `layout` URI in `prefab.settings`;
- the complete nested `variants` collection in `prefab.settings`;
- the complete `externalLayoutFiles` collection in `scene.settings`.
- `events` URI fields in every function settings source.

## 8. Embedded layout TOML schema

### 8.1 Namespacing

The existing standalone layout document has these top-level tables:

```text
[layout]
[editor]
[[layers]]
[[effects]]
[[instances]]
[[variables]]
[[behaviors]]
```

When embedded in settings, `layout` becomes the reserved owner subtree and all
other layout records move below it:

```text
[layout]
[layout.editor]
[[layout.layers]]
[[layout.effects]]
[[layout.instances]]
[[layout.variables]]
[[layout.behaviors]]
```

This prefix is required. In particular, owner variables remain
`[[variables]]`, while per-instance variables are
`[[layout.variables]]`. The two domains never share a TOML key.

The `[layout]` table retains `version = 1`. A second embedded-layout version
field is not introduced. `settingsFormatVersion = 5` versions ownership and
physical structure; `layout.version = 1` versions layout semantics.

### 8.2 Canonical ordering

An owner settings file is serialized in this order:

1. required owner markers and root scalar fields;
2. owner configuration tables and repeated tables in their existing canonical
   schema order;
3. owner compatibility `rawJson`, when required;
4. `[layout]`;
5. optional `[layout.editor]`;
6. all `[[layout.layers]]` records;
7. all `[[layout.effects]]` records;
8. all `[[layout.instances]]` records;
9. all `[[layout.variables]]` records grouped by instance order;
10. all `[[layout.behaviors]]` records grouped by instance order.

Assignments and headers begin at column zero. One blank line separates
tables. The file ends with one newline. Existing canonical omission and
default rules from the layout version 1 specification remain unchanged.

### 8.3 Logical normalization

The layout compiler operates on one normalized logical document:

```js
{
  layout: { version: 1, /* background or bounds */ },
  editor: { /* optional */ },
  layers: [],
  effects: [],
  instances: [],
  variables: [],
  behaviors: [],
}
```

For a version 5 owner, the settings parser extracts the owner's `layout`
subtree and converts its nested keys into this logical shape without changing
values or record order. The temporary one-time project harness parses its five
authorized v4 standalone layouts into the same logical shape before it is
removed. Production has no standalone layout reader.

### 8.4 Strict ownership

The following are hard errors:

- a missing `[layout]` table in a layout-bearing owner;
- a scalar or array named `layout` where an embedded table is required;
- root owner fields such as `instances`, `layers`, `uiSettings`,
  `editionSettings`, background components, or bounds;
- owner configuration inside `[layout]`;
- object definitions, functions, or event bodies inside `[layout]`;
- unknown tables or fields below `[layout]`;
- `rawJson` pointers that target any path below `/layout`;
- a version 5 layout URI in any owner field;
- both embedded data and a managed retired `.layout` for the same component.

Layout validation continues to reject unknown serialized fields instead of
preserving them through owner `rawJson`.

## 9. Scene settings

### 9.1 Canonical example

```toml
kind = "scene"
settingsFormatVersion = 5
order = 0
name = "Main"
mangledName = "Main"
title = "My Game"
standardSortMethod = true
stopSoundsOnStartup = true
resourcesPreloading = "inherit"
resourcesUnloading = "inherit"
disableInputWhenNotFocused = true

[layout]
version = 1
background = "#202030"

[layout.editor]
grid = true
grid_type = "rectangular"
grid_size = [32, 32, 32]
snap = true
selected_layer = "HUD"

[[layout.layers]]
id = "base"
name = ""
cameras = [{ size = "default", viewport = "default" }]

[[layout.layers]]
id = "hud"
name = "HUD"

[[layout.instances]]
id = "ef3ef49d-f20f-4450-b373-0ce43291a002"
object = "Player"
layer = "base"
at = [128, 256]
```

Scene settings continue to own scene identity, order, variables, object
groups, required behaviors, behavior shared data, loading/input/sound/sort
configuration, and compatible unknown scene metadata. The embedded layout
owns the same scene fields previously owned by `<Scene>.layout`.

Scene lifecycle roles and `.events` bodies remain unchanged, but their files
use the flat version 5 function pair. `scene.settings` does not regain an
events URI.

### 9.2 Discovery and identity

Scenes continue to be discovered only from
`scenes/<SceneFolder>/scene.settings`. The document contains exactly one scene
owner and a contiguous project-wide `order`. Scene display identity remains
the `name` field; the physical folder uses the existing portable managed-name
algorithm.

There is no separate layout basename to validate or rename.

## 10. Prefab default settings

### 10.1 Canonical example

```toml
kind = "prefab"
settingsFormatVersion = 5
order = 0
name = "Enemy"
fullName = "Enemy"
description = "Reusable enemy prefab"
defaultName = "Enemy"
private = false
is3D = false

[layout]
version = 1
bounds = { min = [0, 0, 0], max = [64, 64, 64] }

[[layout.layers]]
id = "base"
name = ""

[[layout.instances]]
id = "01fce651-91cd-4d11-bd56-ef1370807527"
object = "Body"
layer = "base"
at = [0, 0, 0]
```

`prefab.settings` continues to own prefab declaration metadata, variables,
attached behavior metadata, flat property descriptors, object groups, and
required behaviors. It now also owns the default variant's bounds, editor
state, layers, effects, instances, per-instance variables, and behavior
overrides.

Default child object definitions remain in
`prefabs/<Prefab>/objects/<Object>.settings`. Prefab functions remain in their
existing function settings and events files.

`prefab.settings` must not contain a `variants` array in version 5. Named
variants are physical child settings components.

## 11. Named prefab variant settings

### 11.1 Ownership and path

Every named, non-default variant has exactly one owner:

```text
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/variant.settings
```

Its child object definitions remain at:

```text
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/objects/<Object>.settings
```

No `variant.settings` file is created for the default variant represented by
the prefab itself.

### 11.2 Canonical example

```toml
kind = "prefabVariant"
settingsFormatVersion = 5
order = 0
name = "Armored"
assetStoreAssetId = ""
assetStoreOriginalName = ""

[layout]
version = 1
bounds = { min = [0, 0, 0], max = [96, 96, 96] }

[[layout.layers]]
id = "base"
name = ""

[[layout.instances]]
id = "4a1e5377-cbe7-4078-9a51-96a1e9956411"
object = "Body"
layer = "base"
at = [0, 0, 0]
```

The variant owner contains:

- `kind = "prefabVariant"`;
- `settingsFormatVersion = 5`;
- zero-based `order` contiguous within the owning prefab;
- unique variant `name` within the prefab;
- asset-store identifiers and other variant serializer metadata;
- variant object groups and required-behavior group metadata;
- compatibility `rawJson` for supported non-layout variant metadata;
- the complete embedded prefab-variant layout.

It must not contain object definitions, an embedded object folder tree,
functions, events, an owning extension/prefab URI, or a layout URI. Variant
child object definitions remain independent sources below the physical
`objects/` directory.

### 11.3 Discovery and composition

The loader discovers variant owners from the fixed path
`prefabs/<Prefab>/variants/*/variant.settings`, validates the physical parent,
then sorts them by `order`. Duplicate names or order values, gaps, negative
orders, and orphan variant owners are errors.

The settings mount namespace is conceptually:

```text
extensions."<Extension>".prefabs."<Prefab>".variants."<Variant>"
```

This is a keyed temporary settings namespace. Composition converts the sorted
entries into the legacy `variants[]` array. It must not depend on TOML table or
filesystem enumeration order.

Variant object definitions are composed from
`variants/<Variant>/objects/<Object>.settings` using the existing
complete-variant object semantics. The embedded layout is compiled only after
those definitions are available, so instance object and behavior references
use the correct variant context.

### 11.4 Rename and deletion

Renaming a variant moves its complete variant directory, changes its `name`,
and applies existing project-model reference refactoring in one transaction.
Deleting a variant removes only its previously tracked `variant.settings` and
owned object sources. Unrecognized files in the directory are never deleted
recursively.

## 12. External layout settings

### 12.1 Ownership and path

Every external layout has one scene-owned settings component:

```text
scenes/<Scene>/external-layout/<ExternalLayout>.settings
```

Its association is derived from the physical scene owner. Its identity and
global order are no longer stored in `scene.settings`.

### 12.2 Canonical example

```toml
kind = "externalLayout"
settingsFormatVersion = 5
order = 0
name = "Bonus Room"

[layout]
version = 1

[layout.editor]
grid = true
grid_size = [32, 32, 32]
snap = true

[[layout.layers]]
id = "base"
name = ""

[[layout.instances]]
id = "bf76bfbf-f6a8-41fe-a4b0-1c919089cf45"
object = "Chest"
layer = "base"
at = [320, 180]
```

The owner contains name, project-wide external-layout order, compatible
external-layout metadata, and the complete embedded external-context layout.
It forbids `associatedLayout`, `linkedScene`, `unresolvedScene`, and all URI
association fields.

Order is unique and contiguous across all external layout settings in the
project, not per scene. Names remain globally unique within the external-layout
kind.

### 12.3 External-context validation

The compiler resolves objects and layer names against the owning scene and
global objects exactly as the current external-layout compiler does.
External-layout `[layout]` contains only `version`; it cannot contain scene
background or prefab bounds. `[[layout.layers]]` records reference owning-scene
layers and do not define cameras or effects.

Moving an external layout between scene directories changes its derived
`associatedLayout`. The move is rejected before staging unless every embedded
object, layer, behavior override, and instance property resolves in the target
scene context.

### 12.4 Relationship to External Events

`external-events.settings` and its lifecycle function `.events` files are
unchanged. External Events and external layouts remain independent kinds with
independent names and global order sequences. When both use the same managed
folder, the `functions/` child belongs exclusively to External Events.

## 13. Events and other settings sources

Event semantics and owner roles introduced by multi-file format version 4
remain unchanged, but their physical function pair is flattened:

- scene lifecycle bodies use `functions/<Lifecycle>.settings` and
  `functions/<Lifecycle>.events`;
- External Events lifecycle bodies remain below their
  `external-events.settings` owner with the same flat function pair;
- extension, prefab, and behavior function bodies remain sibling `.events`
  files beside `<Function>.settings`;
- event identity, signature, phase role, and grouping remain in settings;
- compiled event arrays exist only in the temporary legacy projection.

Every function settings file removes its `events` URI. The loader derives the
required sibling `.events` path by replacing the final `.settings` extension
with `.events`. A missing member, mismatched stem, duplicate case-insensitive
stem, or directory-form version 4 function owner is a load error. Optional
empty lifecycle functions may omit both files; they may not leave one member
of the pair.

Global, scene, prefab, and variant object definitions remain individual
`objects/<Object>.settings` files. Resources and Constants ownership are not
changed.

## 14. Format versioning and discovery

### 14.1 Version markers

Implementation raises `MULTI_FILE_FORMAT_VERSION` from 4 to 5. Every version 5
component requiring a marker uses `settingsFormatVersion = 5`. Layout data
continues to use `layout.version = 1`.

The production reader requires both project root markers to be exactly 5. It
must not infer version 5 merely because a `[layout]` table is present.

### 14.2 Version 5 fixed settings paths

The managed settings-path allowlist adds:

```text
extensions/*/prefabs/*/variants/*/variant.settings
extensions/*/prefabs/*/variants/*/objects/*.settings
scenes/*/external-layout/*.settings
**/functions/*.settings
```

The dedicated variant `objects/*.settings` pattern cannot collide with the
fixed `variant.settings` owner filename. The function pattern is expanded into
the finite set of valid owner locations; `**` is explanatory shorthand, not
recursive filesystem discovery.

Version 5 retains the established variant `objects/` pattern, but does not
retain version 4 per-function directory patterns or any standalone layout
pattern. Discovery no longer follows layout/events URI fields and no longer
registers `.layout` references.

The deterministic settings discovery and merge order becomes:

1. `project.gdevelop`;
2. `resources.settings`;
3. global object settings;
4. each scene settings owner;
5. that scene's object settings and flat lifecycle function pairs;
6. scene-owned external event settings and flat lifecycle function pairs;
7. scene-owned external layout settings;
8. each extension settings owner;
9. flat extension function pairs;
10. each prefab settings owner and its default object settings;
11. each named variant settings owner followed by its object settings;
12. flat prefab function pairs;
13. behavior settings and flat behavior function pairs.

Ordering between independent branches is deterministic but does not create
cross-component precedence. Duplicate ownership remains a hard error.

### 14.3 Retired source detection

For a version 5 project, the loader scans canonical retired layout and
per-function-directory patterns below managed scene and extension roots.
Finding one produces a retired-source diagnostic; it is not silently ignored.
This prevents a stale version 4 file from appearing editable while having no
effect.

Files named `*.layout` outside canonical managed-source patterns remain
ordinary user resource files and are not rejected merely by extension.

## 15. Parser, compiler, and serializer architecture

### 15.1 Data-level layout API

`ProjectsStorage/LayoutToml` is refactored around an internal data-level API:

```text
parse source text
  -> LayoutSourceDocument + record locations
  -> compileLayoutDocument(document, context)
  -> legacy layout fragment

legacy layout fragment
  -> decompileLayoutDocument(fragment, context)
  -> LayoutSourceDocument
  -> serialize in embedded namespace
```

The exact exported names may follow local conventions, but these boundaries
are required:

- semantic compilation accepts a logical document rather than a standalone
  source string;
- semantic decompilation returns a logical document before serialization;
- the transitional project harness may call a temporary standalone parser, but
  that wrapper is removed from production with the harness;
- there is one production canonical layout emitter for the embedded namespace,
  rather than independently maintained standalone and embedded serializers.

### 15.2 Parsing embedded layout

The settings TOML parser parses the complete owner once. The adapter extracts
the reserved `layout` subtree and builds the normalized logical layout
document. It also builds a prefix-aware location index for:

```text
[layout]
[layout.editor]
[[layout.layers]]
[[layout.effects]]
[[layout.instances]]
[[layout.variables]]
[[layout.behaviors]]
```

Every existing `LAYOUT_*` semantic error reports the owner `.settings` URI and
the original line/column of the embedded record. Parser errors continue to
report native TOML locations.

### 15.3 Canonical serialization

The ordinary settings serializer serializes owner configuration while
reserving the `layout` key. The layout emitter appends the validated logical
layout document using the `layout` prefix. The result is parsed and compiled
again as one complete settings file before staging.

The implementation must not:

- serialize layout as a quoted TOML string;
- round-trip through raw legacy JSON to produce layout text;
- maintain a second list of layout fields in the settings serializer;
- accept generic settings projection for unknown layout fields;
- concatenate an unvalidated user-supplied text fragment.

### 15.4 Composition

Version 5 composition proceeds as follows:

1. Discover and parse all settings owners.
2. Validate path-derived ownership, format markers, names, and orders.
3. Load object definitions and build the scene, prefab, variant, and external
   semantic contexts.
4. Extract and compile every embedded layout with its exact context.
5. Merge owner configuration, object definitions, and compiled layout fields
   into the normalized legacy component.
6. Build the temporary project and closed instruction/function catalog.
7. Compile `.events` bodies and insert their legacy arrays.
8. Unserialize the completed legacy project into the editor model.

No runtime or Core model reads embedded layout TOML directly.

## 16. Save flow and invalidation

### 16.1 Dirty ownership

Version 5 uses this write ownership:

| Editor mutation                                                                    | Dirty source                    |
| ---------------------------------------------------------------------------------- | ------------------------------- |
| Scene metadata, variables, groups, shared data                                     | `scene.settings`                |
| Scene background, editor state, layers, effects, instances, overrides              | `scene.settings`                |
| Prefab declaration, properties, variables, groups                                  | `prefab.settings`               |
| Default-prefab bounds, editor state, layers, instances, overrides                  | `prefab.settings`               |
| Named variant metadata, groups, bounds, editor state, layers, instances, overrides | Its `variant.settings`          |
| Named variant child definition                                                     | Its `objects/<Object>.settings` |
| External-layout metadata, order, editor state, layer references, instances         | Its `external-layout.settings`  |
| Any event body                                                                     | Its existing `.events` file     |

The initial implementation may continue decomposing the complete in-memory
project on save, provided it compares canonical bytes and stages only changed
or obsolete sources. Dirty markers are an optimization and must not weaken the
content comparison or full round-trip verification.

### 16.2 Semantic invalidation

File extension alone is no longer sufficient to classify a settings change.
The watcher and reload path compare the parsed old and new projections:

- changes only to editor canvas state, instance transforms, instance values,
  or other non-catalog layout values update the owning editor/preview component
  without rebuilding unrelated event catalogs;
- layer identity changes revalidate consumers that resolve layer names;
- object-definition changes continue to rebuild the affected layout context
  and dependent event catalogs;
- owner signature, object group, variable, or behavior shared-data changes
  retain their existing catalog invalidation behavior;
- malformed new content leaves the last valid in-memory component active and
  surfaces a persistent diagnostic.

The implementation should compute separate stable fingerprints for owner
configuration and embedded layout, and may further distinguish catalog-relevant
layout identity from placement-only layout values.

### 16.3 Transaction commit order

The existing staged transaction and rollback journal remain authoritative.
For version 5, commit priority is:

1. event bodies and object-definition content sources;
2. `variant.settings`, `external-layout.settings`, ordinary function settings,
   scene settings, and prefab settings after their owned children are staged;
3. `extension.settings`;
4. `project.gdevelop` last.

Normal production v5 saves never process old sources. During the sole
authorized project conversion, obsolete version 4 layouts and per-function
directories are removed or moved only inside the same verified transaction
that commits their v5 replacements. The variant `objects/` directory and its
object source paths are preserved. Unrecognized files are never removed.

## 17. Version policy and the one-time project conversion

### 17.1 Production version policy

The production multi-file reader and writer support format version 5 only.
Implementation removes `LEGACY_MULTI_FILE_FORMAT_VERSION`, all version 3/4
source discovery branches, all standalone `.layout` loading branches, and all
automatic folder-project migration behavior before the refactor is considered
complete.

A project whose `combinedSettingsFormatVersion` or root
`settingsFormatVersion` is not exactly 5 fails immediately with
`MULTIFILE_UNSUPPORTED_VERSION`. The application does not rewrite it, offer an
automatic conversion, or attempt to infer a compatible ownership model.

The existing single-file legacy JSON import feature is outside the
multi-file-v4 compatibility surface. If that product feature remains enabled,
its successful conversion target is version 5 directly; it must not construct
an intermediate version 4 source tree.

### 17.2 Sole authorized version 4 input

The only version 4 folder project converted as part of this refactor is:

```text
D:\Users\Administrator\Documents\GDevelop projects\My project116
```

The converter additionally verifies this stable project identity before doing
any work:

```text
projectUuid = d3349135-6a4d-42fc-891e-d526f0cccb6e
project name = Hero Line: Celestial Bastion
```

The inspected source tree currently contains:

- two scenes: `Game` and `Test`;
- one local extension: `Local`;
- one prefab: `MyObject`;
- one named variant: `New variant`;
- one External Events owner named `HUD`;
- one external layout also named `HUD` and owned by `Game`;
- five standalone layouts: two scenes, the prefab default, the named variant,
  and the external layout;
- eight event bodies using version 4 per-function directories.

These observations are a review aid, not a substitute for execution-time
inventory. The converter must rediscover and hash the exact tree immediately
before conversion.

### 17.3 Dirty-worktree precondition

At specification time, the target Git worktree already contains many modified,
deleted, and untracked project sources. Those changes are user-owned and must
not be folded silently into a format-migration commit.

Before the one-time conversion, the target repository must have a clean,
user-approved baseline commit. If it is still dirty, conversion stops before
writing or staging anything and asks the user to preserve that work in a
baseline commit or otherwise provide an explicitly approved clean snapshot.
The converter must not stash, reset, stage, or commit pre-existing work on the
user's behalf.

This precondition allows the eventual v5 migration commit to contain only
task-owned format changes and satisfies the target project's bundled
`AGENTS.md`/skill Git gate.

### 17.4 Transitional converter boundary

The one-time converter is an implementation-phase development harness, not a
production API, CLI, reader fallback, or shipped script. It may temporarily
call the current version 4 composer while the new version 5 decompiler is being
developed. It is removed, together with every v4 reader branch, before the
engine-side refactor is finalized.

The execution order is therefore:

1. Implement the shared logical layout document API and native v5 writer.
2. Keep the existing v4 composer temporarily reachable only from the
   development harness.
3. Convert and verify the exact authorized project.
4. Commit the target project's migration after its required validation.
5. Remove the harness and all production v4 compatibility branches.
6. Run the final engine tests proving that production accepts v5 only.

No reusable v4 converter remains in the application or repository after the
one authorized project has been migrated successfully.

### 17.5 Exact v4-to-v5 mapping for the authorized project

The harness performs these transformations in memory.

#### Scenes `Game` and `Test`

1. Resolve and strictly compile each `scene.settings` layout URI.
2. Embed the normalized logical layout in its scene owner.
3. Remove the layout URI and set `settingsFormatVersion = 5`.
4. Retire `Game.layout` and `Test.layout`.
5. Move every lifecycle pair from
   `functions/<Phase>/function.settings` and `<Phase>.events` to
   `functions/<Phase>.settings` and `<Phase>.events`.
6. Remove the derived `events` URI from each function settings file.

#### Prefab `Local/MyObject`

1. Embed `MyObject.layout` in `prefab.settings` and remove its layout URI.
2. Extract the `New variant` metadata from `[[variants]]`.
3. Create `variants/New variant/variant.settings` with explicit `order = 0`
   and the embedded normalized `New variant.layout`.
4. Keep
   `variants/New variant/objects/NewSprite.settings` at its existing
   first-class object path, changing only the required format marker or
   canonical content if validation requires it.
5. Remove the complete `variants` array from `prefab.settings`.
6. Retire both prefab layout files.
7. Flatten every prefab function pair and remove every function `events` URI.

#### External owners `Game/HUD`

1. Keep `external-events.settings` and its event semantics unchanged while
   raising its marker to 5.
2. Flatten its lifecycle function pair and remove the function `events` URI.
3. Extract the `HUD` external-layout identity, global `order = 0`, and metadata
   from `Game/scene.settings`.
4. Create `external-layout/HUD.settings` with the normalized embedded content
   of `externals/HUD.layout`.
5. Remove `externalLayoutFiles` from `Game/scene.settings` and retire the old
   external layout file.

The two independent `HUD` component kinds intentionally coexist in separate
type directories.

#### Extension function and all remaining settings

1. Flatten `extensions/Local/functions/Function` into sibling
   `Function.settings` and `Function.events` files.
2. Remove its `events` URI.
3. Raise every managed settings marker, including all object settings and
   function settings, from 4 to 5.
4. Set both project root format markers to 5.
5. Preserve resources, Constants, assets, `.events` bodies, instance UUIDs,
   unknown compatible metadata, and all non-source user files byte-for-byte
   unless canonical v5 serialization owns the field.

### 17.6 Conversion verification and recovery

Before changing the target tree, the harness must:

1. verify the exact resolved path, project UUID, project name, clean Git state,
   and absence of an active transaction;
2. read the target project's `AGENTS.md` and bundled
   `gdevelop-project-files` skill in their current committed baseline;
3. hash every managed source and create a byte-for-byte recovery bundle under
   `.gdevelop/migration-backups/v4-to-v5/<source-tree-sha256>/`;
4. parse every version 4 settings, layout, and events source without fallback
   data loss;
5. compose the normalized version 4 legacy project;
6. generate the complete version 5 map in memory;
7. parse that map through the native version 5 reader;
8. compare normalized legacy serializations with no new normalization
   allowance;
9. verify that no target map key or field uses a retired layout, function
   directory, layout URI, or events URI;
10. verify every new settings and events path against the flattened allowlist;
11. stage the replacement map and obsolete paths in one recovery journal.

After the source transaction commits, the migration task must update the
project-bundled `gdevelop-project-files` skill and its layout/source-structure
references so future agents do not author retired v4 paths. Generated
`.gdevelop` catalogs and declarations are regenerated through the project's
approved tooling and are never hand-edited.

The target project then follows its mandatory direct-edit gates:

1. regenerate catalogs after the structural change;
2. validate project files successfully with the v5 application;
3. inspect the complete diff and commit only the clean-baseline-to-v5 migration
   with a descriptive commit message;
4. reload that commit into the editor;
5. launch a fresh paused preview and verify both `Game` and `Test` can be
   loaded without runtime, renderer, missing-object, or texture failures.

If any source edit is required after validation, validation and the migration
commit gate repeat before reload. Failure at any pre-commit phase restores the
byte-for-byte v4 source map. The recovery bundle remains ignored and is not an
editable source.

### 17.7 Production rejection of old or mixed trees

Production v5 fails before composition when any of these conditions is
present:

- either root format marker is not exactly 5;
- any managed owner has `settingsFormatVersion` other than 5;
- an embedded layout is paired with a layout URI;
- a canonical retired `.layout` exists;
- `prefab.settings` contains a version 4 `variants` array;
- `scene.settings` contains `externalLayoutFiles`;
- a function settings file contains an `events` URI;
- a version 4 per-function directory exists;
- a v5-only owner appears below an old project entry.

There is no parent-wins, embedded-wins, newest-timestamp, or compatibility
fallback policy.

## 18. Rename, move, and deletion semantics

### 18.1 Scene rename

A scene rename updates its folder, `scene.settings` identity, lifecycle source
paths, scene references in project data and events, and owned external paths in
one transaction. There is no layout filename or URI to rename.

### 18.2 Prefab rename

A prefab rename moves the prefab directory and updates its identity and all
project references. The embedded default layout and all variant directories
move with the owner. There is no default or variant layout URI rewrite.

### 18.3 Variant rename/reorder

A variant rename moves one variant directory and updates variant references.
A reorder rewrites only affected `variant.settings` order fields. Neither
operation rewrites the default prefab layout unless the in-memory prefab model
itself changed.

### 18.4 External layout rename/reassociation

Rename moves one external directory and changes the owner name. Reassociation
moves the directory below the target scene and validates the embedded layout
against the target context before staging. Project-wide external-layout order
is preserved unless the operation explicitly reorders it.

### 18.5 Function rename

A function rename atomically renames its same-stem `.settings` and `.events`
files, updates the settings identity and project references, and preserves the
event body bytes except where semantic reference refactoring is required. It
never creates an intermediate per-function directory or stores a replacement
events URI.

### 18.6 Deletion safety

Deletion enumerates only URIs previously discovered as owned managed sources.
It never recursively deletes a scene, prefab, variant, or external directory.
Empty managed parent directories may be removed only through the existing
validated inside-root cleanup.

## 19. Catalog and authoring API changes

### 19.1 Settings catalog

`.gdevelop/settings-catalog.json` adds file kinds for:

- `prefabVariant` at
  `extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/variant.settings`;
- `externalLayout` at
  `scenes/<Scene>/external-layout/<ExternalLayout>.settings`.

Scene and prefab file kinds remove required layout URI fields and add a
required embedded-layout reference to the layout schema within the same
settings catalog. Prefab no longer declares a nested `variants` table. Scene
no longer declares `externalLayoutFiles`.

Every function file kind changes from
`functions/<Function>/function.settings` to
`functions/<Function>.settings`, removes its required `events` URI field, and
declares the same-stem `.events` sibling as a path-derived body. Variant object
file kinds retain `variants/<Variant>/objects/<Object>.settings`; the catalog
continues to describe objects as independently addressable first-class
components below a dedicated `objects/` directory.

The catalog describes `[layout]` as a reserved strict subtree. File-kind
schemas reference the shared `layoutTables` contract rather than duplicating
every layout field into each owner schema.

### 19.2 Embedded layout catalog section

`.gdevelop/settings-catalog.json` format version 2 is the only settings/layout
authoring catalog. It contains these layout-specific top-level members:

- `layoutAuthoring`;
- `layoutTables`;
- `layoutContexts`;
- `behaviorOverrideSchemas`.

`effectTypes` remains shared with ordinary settings authoring. The retired
`.gdevelop/layout-catalog.json` is deleted whenever catalogs are generated or
the project is saved. `layoutAuthoring` declares:

```text
storage: embedded-settings
rootTable: layout
sourceExtension: .settings
```

Every `layoutContexts` entry points at an owner settings URI and identifies one
of `scene`, `prefab`, `prefab-variant`, or `external`. `layoutTables` uses
embedded headers such as `[[layout.instances]]` while retaining the same field
contracts.

### 19.3 Instructions and source API

Instruction catalogs and `.events` syntax are unchanged. Any generated source
API, editor help, or catalog rule that tells an author to edit a `.layout`
path must instead identify the owner settings path and `[layout]` subtree.

AI authoring guidance must explicitly distinguish owner `[[variables]]` from
per-instance `[[layout.variables]]` and must preserve instance UUIDs.

## 20. Error handling and diagnostics

Existing `LAYOUT_*` semantic codes remain stable. They report the owning
settings URI and embedded table location in version 5.

The multi-file layer adds or specializes these errors:

| Code                                           | Meaning                                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `MULTIFILE_UNSUPPORTED_VERSION`                | Either root format marker is not exactly 5.                                                       |
| `MULTIFILE_MISSING_EMBEDDED_LAYOUT`            | A scene, prefab, variant, or external-layout owner has no `[layout]` table.                       |
| `MULTIFILE_INVALID_EMBEDDED_LAYOUT`            | The `layout` key is not a table or cannot be normalized.                                          |
| `MULTIFILE_LAYOUT_OWNERSHIP_CONFLICT`          | Layout fields exist both inside and outside the reserved subtree.                                 |
| `MULTIFILE_RETIRED_LAYOUT_REFERENCE`           | A version 5 settings field contains a `.layout` URI.                                              |
| `MULTIFILE_RETIRED_LAYOUT_SOURCE`              | A canonical retired `.layout` file exists in a version 5 source tree.                             |
| `MULTIFILE_RETIRED_FUNCTION_SOURCE`            | A version 4 per-function directory or function `events` URI exists.                               |
| `MULTIFILE_MISSING_FUNCTION_PAIR`              | Exactly one of the same-stem function `.settings`/`.events` files exists.                         |
| `MULTIFILE_ORPHAN_EVENTS`                      | A managed `.events` body has no same-stem function `.settings` owner.                             |
| `MULTIFILE_FUNCTION_PATH_IDENTITY_MISMATCH`    | Function name, encoded stem, or sibling body stem disagree.                                       |
| `MULTIFILE_RETIRED_EXTERNAL_SOURCE`            | A version 5 source tree contains a retired combined `scenes/<Scene>/externals/<External>/` owner. |
| `MULTIFILE_ORPHAN_VARIANT_SETTINGS`            | `variant.settings` has no valid prefab owner.                                                     |
| `MULTIFILE_ORPHAN_EXTERNAL_LAYOUT_SETTINGS`    | `external-layout.settings` has no valid scene owner.                                              |
| `MULTIFILE_DUPLICATE_VARIANT_IDENTITY`         | Variant name or order collides within a prefab.                                                   |
| `MULTIFILE_DUPLICATE_EXTERNAL_LAYOUT_IDENTITY` | External-layout name or global order collides.                                                    |
| `MULTIFILE_MIXED_FORMAT_VERSION`               | Old and new ownership models appear in one source tree.                                           |

The temporary converter uses `V5_ONESHOT_*` diagnostics for target identity,
dirty-worktree, source-hash, recovery-bundle, and equivalence failures. These
codes are removed with the harness and are not part of the production format
API.

Diagnostics must identify both the owner and the referenced semantic identity
when context resolution fails, for example the external layout and owning
scene or the variant and owning prefab.

Unknown embedded layout data is never downgraded to a warning or moved into
`rawJson`. Failed external edits leave the last valid component active.

## 21. Performance and limits

### 21.1 Expected effects

Version 5 reduces managed file count, eliminates separate reads for scene and
default-prefab layout sources, and reduces directory traversal by flattening
function pairs. Variant object paths and the semantic `objects/` directory are
preserved. Total authored layout/event data remains approximately unchanged.

The tradeoff is that scene and prefab settings become larger and are rewritten
whenever their default layout changes. Canonical record ordering and byte
comparison keep diffs local, but large scenes still incur a larger parse and
atomic replace than version 4.

Named variants and external layouts retain independent write isolation through
their own settings files.

### 21.2 Size limits

The existing 16 MiB limit remains for ordinary settings and events sources.
Composite scene and prefab settings use a 32 MiB maximum because they can own
large placement collections in addition to ordinary settings. Variant and
external-layout settings retain a 16 MiB maximum. The authorized target's five
current layouts are all below 5 KiB, so its one-time conversion remains far
below either limit; execution-time preflight still measures the actual files.

The total managed-file count, bounded parallel reads, path depth, record-count,
camera-count, UUID, numeric, and parser safety rules remain in force. Migration
preflight calculates target sizes before creating or deleting files.

### 21.3 Incremental work

The loader should cache separate hashes for owner configuration and embedded
layout. A placement-only edit must not force unrelated `.events` parsing.
Layer identity or another catalog-relevant layout edit may invalidate only the
consumers whose resolution context changed.

Performance verification must include large scene settings near the new size
limit and a project with many small variants and external layouts.

## 22. Security and robustness

1. Embedded settings remain standard TOML data and never execute JavaScript.
2. No embedded source may perform network access or include another file.
3. Canonical `game://` resolution, encoded-name checks, Windows device-name
   checks, traversal prevention, symlink policy, and inside-root assertions
   remain unchanged.
4. Settings discovery remains fixed-path and bounded; it does not recursively
   parse arbitrary `.settings` files.
5. Layout relationships continue to resolve only against cataloged objects,
   behaviors, effects, instances, and owning-scene layers.
6. Migration reads and hashes all inputs before staging and never deletes an
   untracked path.
7. Parse or validation failure cannot partially update the in-memory project.
8. Transaction recovery must handle interruption before staging, during owner
   replacement, during retired-layout removal, and before entry-file commit.

## 23. Affected implementation layers and files

### 23.1 Authoritative implementation

`newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`

- raise the format version;
- replace standalone layout emission with embedded logical documents;
- remove v5 scene and prefab layout URI fields;
- split named variants into `variant.settings` owners;
- split external layouts into `external-layout.settings` owners;
- flatten every function settings/events pair and derive its body path;
- preserve and discover variant object settings below the variant's dedicated
  `objects/` directory;
- add fixed-path discovery and ownership validation;
- compose new child owners into legacy arrays;
- update managed settings allowlists and orphan checks;
- reject mixed ownership;
- remove every version 3/4 production reader branch after the authorized
  project conversion.

`newIDE/app/src/ProjectsStorage/LayoutToml/index.js`

- expose shared data-level compile/decompile boundaries;
- replace standalone production serialization with embedded serialization;
- add prefix-aware source location indexing;
- keep all layout version 1 semantic rules shared.

### 23.2 Local storage and transactions

`newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`

- discover new owner paths;
- detect canonical retired layout and function paths for v5;
- add composite source-size limits;
- update transaction commit ordering.

The production local project opener does not migrate old folder projects. The
writer and file watcher route field-sensitive settings invalidation through
the updated boundaries.

### 23.3 Catalogs and direct authoring

`newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`

- update scene and prefab settings schemas;
- add variant and external-layout owner schemas;
- change every function file kind to a flat same-stem pair without an events
  URI;
- retain variant object file kinds under their dedicated `objects/` directory;
- describe embedded layout storage and headers;
- generate contexts that point to settings owners.

`newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.js` and related source
authoring helpers must stop returning standalone layout paths and target an
owner plus logical `layout` section.

### 23.4 Editor orchestration

The project storage integration and external file watcher require
field-sensitive handling of a changed owner settings file. Scene editor,
Prefab editor, preview, and export continue consuming the same composed model;
they should require no model or runtime format change.

### 23.5 Documentation

After implementation approval, update:

- `docs/gdevelop-new-formats-spec.md`;
- `docs/gdevelop-layout-toml-spec.md`;
- `docs/scene-owned-externals-format-spec.md`;
- `docs/scene-event-phases-spec.md` filesystem examples where relevant;
- `docs/Architecture.md`;
- authoring and migration documentation that mentions `.layout` sources.

The authorized target project's bundled
`skills/gdevelop-project-files/SKILL.md` and relevant references are updated in
the target migration commit after its source transaction succeeds. Its
generated catalogs and declarations are regenerated, never hand-edited.

This proposal is the controlling document when an older specification
describes standalone layout ownership.

### 23.6 Unaffected runtime layers

No change is expected in `Core/GDCore`, `GDJS/Runtime`, or generated runtime
project-data types because composition continues producing the current legacy
serializer shape before preview/export. Any discovered runtime change is a
scope expansion and requires an amendment to this specification before
implementation continues.

## 24. Implementation plan

### Phase 1: shared layout document API

1. Add logical-document compile/decompile functions while the current tests
   still provide a v4 equivalence oracle.
2. Add embedded serialization and prefix-aware location indexing.
3. Prove the same legacy fragments produce identical semantic layout documents
   before removing standalone production entry points.

### Phase 2: native version 5 read/write

1. Add the format 5 marker and schemas.
2. Implement embedded scene and prefab default layout ownership.
3. Implement physical named variant settings discovery and composition.
4. Implement physical external-layout settings discovery and composition.
5. Flatten all function pairs and remove function body URI fields.
6. Preserve variant object sources below the variant's `objects/` directory
   and make that boundary explicit in discovery and schemas.
7. Update managed path validation, ordering, and orphan detection.
8. Verify native v5 decomposition/composition and direct legacy JSON-to-v5
   conversion without adding automatic folder-project migration.

### Phase 3: catalogs, watchers, and authoring APIs

1. Merge layout authoring data into settings catalog format version 2 and
   remove the independent generated layout catalog.
2. Update direct authoring path descriptions.
3. Add owner/layout fingerprints and semantic invalidation.
4. Update rename, reassociation, delete, and same-stem function orchestration.
5. Update normative documentation and tests to describe only v5 authoring.

### Phase 4: authorized project conversion

1. Confirm the exact target path/identity and require a clean approved Git
   baseline.
2. Build the temporary development harness around the still-available v4
   composer and the native v5 writer.
3. Create and verify the target recovery bundle.
4. Generate and equivalence-check the full target v5 map in memory.
5. Commit the atomic source/path conversion.
6. Update the target-bundled skill references, regenerate catalogs, validate,
   commit, reload, and preview both scenes under the new application.

### Phase 5: remove compatibility and finalize

1. Remove the temporary converter and all v3/v4 production reader branches.
2. Remove standalone layout production parse/serialize entry points that have
   no v5 caller.
3. Prove old and mixed trees fail with stable unsupported/retired diagnostics.
4. Run the complete v5 format, transaction, catalog, preview, and export test
   suites.
5. Perform the repository-required desktop build/launch handoff after the final
   implementation checks.

Implementation must stop after each phase if normalized round-trip equivalence
or transaction recovery is not proven. Phase 4 must not begin while the target
worktree is dirty.

## 25. Test plan

### 25.1 Layout unit tests

- compile every layout context from embedded logical documents;
- decompile every context to canonical embedded headers;
- preserve record order and instance UUIDs;
- distinguish owner variables from per-instance variables;
- reject unknown prefixed tables and fields;
- report exact settings-file line and column for each repeated record kind;
- verify scene background, prefab bounds, external layer references, effects,
  cameras, variables, behavior overrides, stale references, and empty editor
  settings;
- verify no production export accepts or emits standalone layout text.

### 25.2 Multi-file format tests

- scene round trip with metadata, objects, every layout record, and lifecycle
  functions;
- prefab default round trip with properties, groups, objects, functions, and
  layout;
- multiple named variants with independent metadata, order, groups, object
  definitions, empty layouts, and populated layouts;
- external layouts across multiple scenes with global ordering;
- an External Events owner and external layout sharing a managed folder name;
- global uniqueness and order-gap failures;
- orphan variant and external-layout settings failures;
- root layout-field ownership conflicts;
- raw JSON attempts to target embedded layout;
- v5 file maps contain no managed `.layout` key and no retired URI field;
- every function uses a same-stem flat pair with no events URI;
- variant objects resolve only through their owner's dedicated `objects/`
  directory;
- retired function directories fail, while variant `objects/` directories are
  required;
- compose/decompose idempotence and canonical byte stability.

### 25.3 One-time target conversion tests

- refuse any resolved path other than the authorized project;
- refuse a mismatched project UUID or project name;
- refuse a dirty target worktree before any write;
- inventory exactly the execution-time scenes, extension, prefab, variant,
  external owners, functions, objects, layouts, and event bodies;
- convert both scene layouts, the default prefab, `New variant`, and the `HUD`
  external layout;
- flatten all eight current function pairs without changing `.events` bytes;
- preserve the named variant object's existing `objects/NewSprite.settings`
  path and payload, apart from any required version marker;
- preserve normalized serializer equivalence with no new allowance;
- verify recovery bundle bytes and manifest hashes;
- reject unsupported or unknown layout data before staging;
- reject target files that would exceed composite limits;
- inject interruption before/after every settings replacement, path move, and
  retired layout removal, then verify complete rollback or completion;
- prove the final production application opens the converted target while
  rejecting its pre-conversion v4 snapshot;
- verify direct legacy JSON import, if retained, targets v5 without a v4
  intermediate tree.

### 25.4 Local storage and watcher tests

- discover all new fixed owner paths without recursively parsing unrelated
  settings files;
- reject canonical retired layout and function paths in v5 managed locations;
- require variant object sources to be below the fixed variant `objects/`
  directory and reject object settings beside `variant.settings`;
- reject missing/mismatched same-stem function pairs;
- preserve unrelated user files during rename and deletion;
- commit child definitions before their owner and `project.gdevelop` last;
- serialize concurrent saves through the existing per-project queue;
- classify placement-only, layer-identity, and owner-configuration changes;
- retain the last valid in-memory component after a malformed external edit;
- enforce 16 MiB ordinary and 32 MiB composite source limits.

### 25.5 Catalog tests

- settings catalog lists `prefabVariant` and `externalLayout` file kinds;
- scene and prefab schemas require embedded layout and forbid old URI fields;
- function schemas use flat paths and forbid events URI fields;
- variant object schemas retain
  `variants/<Variant>/objects/<Object>.settings` paths;
- settings catalog `layoutTables` and `layoutContexts` emit embedded table
  headers and owner settings URIs;
- every layout context resolves the same objects, behaviors, effects, layers,
  and instance property types through native v5 composition;
- generated authoring instructions contain no editable `.layout` path.

### 25.6 Integration tests

- all native v5 repository project fixtures round-trip;
- the authorized converted project opens in Scene and Prefab editors;
- preview, hot reload, reload from disk, local export, and headless export use
  equivalent composed data;
- scene, prefab, variant, and external-layout rename/move operations are atomic;
- Git diffs for moving one instance change only its owner settings source;
- editing one named variant does not rewrite `prefab.settings` or sibling
  variants;
- editing one external layout does not rewrite `scene.settings`;
- editing one function does not rewrite a sibling function pair;
- layout-only edits do not rewrite any `.events` source.

### 25.7 Performance tests

- measure native v5 cold-open time, directory traversal count, and peak memory
  on large scenes;
- measure canonical save latency for a near-limit scene;
- measure watcher reload latency for a single instance transform;
- exercise projects with thousands of small variant/external owner files;
- require no unbounded recursion, reads, or duplicate full-project parse beyond
  the existing verified-save pass.

## 26. Rollout and observability

1. Land the shared layout document API with no format change.
2. Land native version 5 read/write behind an internal development flag.
3. Exercise native v5 fixtures and synthetic retired-source rejection cases.
4. Confirm the authorized target has a clean, user-approved baseline.
5. Run the temporary converter only against that exact target, verify its
   recovery bundle, validate it, and commit its migration.
6. Remove the converter and every v3/v4 production branch.
7. Make version 5 the only supported reader/writer after all acceptance
   criteria pass.
8. Revalidate, reload, and preview the converted target with the finalized
   v5-only application.
9. Treat any normalized project difference, lost unknown metadata, partial
   path move, or residual retired source as a release blocker.

## 27. Alternatives considered

### 27.1 Keep standalone `.layout`

This preserves maximal scene/default-prefab write isolation but retains the
cross-file ownership, URI, discovery, rename, and authoring complexity that
motivated the change.

### 27.2 Rename `.layout` to a layout-kind `.settings` file

This would reduce the number of extensions without making the component
self-contained. Identity and layout would still be split across two settings
files and require an association. It achieves naming uniformity but not the
ownership simplification.

### 27.3 Store every variant inside `prefab.settings`

This removes variant files but makes one prefab source contain every variant's
metadata and potentially large placement data. Editing one variant would
rewrite the parent and increase conflict and parse scope. Nested TOML arrays of
variants containing arrays of layout records also make canonical ownership and
diagnostics harder. Independent `variant.settings` owners are preferred.

### 27.4 Keep variant metadata in `prefab.settings`

This would embed variant layout in a new settings file while leaving identity
and order in the parent, preserving the same split-brain ownership as version

4. The variant owner must own both metadata and layout.

### 27.5 Embed layout as raw JSON or a multiline TOML string

This breaks typed authoring, diff quality, strict table validation, and precise
diagnostics. It is rejected.

### 27.6 Merge object definitions and events into owner settings

This would create large monolithic component files, remove useful independent
function/object ownership, and blur declarative data with event logic. It is
outside the requested two-domain model and rejected.

### 27.7 Keep one directory per function

The directory repeats the function identity already present in both filenames
and settings metadata, creates the deepest paths in the inspected project, and
requires a generic `function.settings` basename. A same-stem sibling pair under
one `functions/` directory preserves ownership without that extra level.

### 27.8 Place variant objects beside `variant.settings`

This saves one path segment but makes variants the only object-owning scope
without an `objects/` boundary, mixes first-class object components with owner
metadata, and complicates fixed-path discovery and future object-scoped files.
The variant `objects/` directory is therefore retained.

### 27.9 Flatten every semantic directory into compound filenames

Paths such as `scenes/Game.Player.settings` or
`prefabs/MyObject.Armored.Body.settings` would reduce depth further but require
escaping delimiters, create more basename collisions, and make component moves
less local. Version 5 removes redundant levels while retaining meaningful
scene, object, prefab, variant, external, and function boundaries.

## 28. Acceptance criteria

The refactor is complete only when:

1. A newly saved version 5 project contains zero managed `.layout` sources.
2. Scene and prefab default layouts are canonical embedded settings subtrees.
3. Every named variant is independently owned by `variant.settings`.
4. Every external layout is independently owned by
   `external-layout.settings`.
5. No v5 scene/prefab/variant/external owner contains a layout URI or retired
   parent manifest entry.
6. Every function uses `functions/<Function>.settings` plus
   `functions/<Function>.events`, with no per-function directory or events URI.
7. Every object-owning scope, including a named variant, stores each object at
   `objects/<Object>.settings`; no object definition sits beside owner settings.
8. Production accepts v5 only and rejects version 3/4 or mixed trees before
   composition.
9. The exact authorized `My project116` project converts with no undocumented
   normalized difference, while no reusable v4 converter remains.
10. Conversion failure or interruption leaves the authorized project's clean
    baseline usable and recoverable.
11. All existing layout semantic validation and exact diagnostic locations are
    preserved.
12. Object payload and event-body ownership remain unchanged apart from the
    specified physical path flattening.
13. Dirty saves and external reload do not rewrite unrelated settings or any
    unchanged `.events` source.
14. Preview, export, and hot reload consume data equivalent to the pre-refactor
    composed project.
15. The converted target passes catalog regeneration, v5 validation, Git
    commit, reload, and fresh-preview verification for both scenes.
16. The updated normative docs, generated catalogs, and target-bundled project
    skill describe only the version 5 ownership/path model.

## 29. Open questions

No question blocks review of the ownership model. The following implementation
details should be confirmed with measurements during the indicated phases:

1. Whether 32 MiB is sufficient for native v5 composite scene/prefab owners.
   The default is 32 MiB; raising it requires a bounded-memory review. The
   authorized project's current inputs are far below the limit.
2. How long the authorized project's ignored migration recovery bundle should
   be retained. The default is to keep it until the user explicitly confirms
   the v5 project and clears generated project data; no production migration UI
   is added.
3. The exact internal names of the data-level LayoutToml functions. Their
   boundaries and shared-validator requirement are normative; exported symbol
   spelling is not.
4. Whether semantic watcher invalidation can distinguish every placement-only
   field in the first implementation. The safe fallback is reloading the
   owning component, never rewriting or recompiling unrelated event sources.

---

Approval of this specification authorizes implementation in phases. Any need
to change runtime serialization, event semantics, object/variant inheritance,
or the layout version 1 field vocabulary requires a reviewed amendment before
implementation proceeds.
