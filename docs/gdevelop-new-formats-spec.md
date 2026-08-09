# GDevelop Multi-file Project Format

## Version 5 TOML settings and IfDo event source files

**Status:** Version 5 implemented format contract. The version 3/4 material
later in this document is retained only as migration history and is not an
authoring contract.
**Entry file:** `project.gdevelop`

**Text encoding:** UTF-8 without BOM
**Line endings:** LF when written by GDevelop
**Related specifications:** [gdevelop-events-dsl-spec.md](gdevelop-events-dsl-spec.md),
[gdevelop-layout-toml-spec.md](gdevelop-layout-toml-spec.md)

The controlling version 5 ownership and path contract is
[embedded-layout-settings-format-spec.md](embedded-layout-settings-format-spec.md).
Production accepts version 5 only. In particular:

- scenes and default prefabs embed their layout below `[layout]` in
  `scene.settings` or `prefab.settings`;
- named variants use
  `variants/<Variant>/variant.settings` and retain
  `variants/<Variant>/objects/<Object>.settings`;
- External Events owners use
  `scenes/<Scene>/external-events/<External>/external-events.settings`, with
  lifecycle function pairs below `functions/`;
- external layouts use
  `scenes/<Scene>/external-layout/<External>.settings`;
- all functions use one same-stem
  `functions/<Function>.settings` + `functions/<Function>.events` pair;
- every managed `.events` body is a function and must have its same-stem
  `.settings` owner;
- no managed `.layout` file, layout URI, events URI, nested variant manifest,
  or `externalLayoutFiles` manifest is valid in version 5.
- `.gdevelop/settings-catalog.json` format version 2 contains both settings
  and embedded-layout authoring contracts; the independent layout catalog is
  retired and deleted during generation.

When any historical example below conflicts with that contract, it describes
an unsupported pre-v5 tree and must not be used for direct authoring.

---

## Contents

1. [Purpose](#1-purpose)
2. [Design principles](#2-design-principles)
3. [Codebase compatibility basis](#3-codebase-compatibility-basis)
4. [Canonical directory layout](#4-canonical-directory-layout)
5. [Common file rules](#5-common-file-rules)
6. [`project.gdevelop`, `resources.settings`, and `constants.toml`](#6-projectgdevelop-resourcessettings-and-constantstoml)
7. [Scene files](#7-scene-files)
8. [Extension files](#8-extension-files)
9. [Prefab files](#9-prefab-files)
10. [Behavior files](#10-behavior-files)
11. [Pure function `.events` bodies](#11-pure-function-events-bodies)
12. [External event and layout files](#12-external-event-and-layout-files)
13. [Legacy-tree composition](#13-legacy-tree-composition)
14. [Editor open flow](#14-editor-open-flow)
15. [Save flow](#15-save-flow)
16. [Automatic legacy conversion](#16-automatic-legacy-conversion)
17. [Preview and export](#17-preview-and-export)
18. [Rename, move, and delete behavior](#18-rename-move-and-delete-behavior)
19. [Git and merge behavior](#19-git-and-merge-behavior)
20. [Security and resource limits](#20-security-and-resource-limits)
21. [Implementation plan](#21-implementation-plan)
22. [Verification requirements](#22-verification-requirements)
23. [Non-goals for version 3](#23-non-goals-for-version-3)
24. [Final contract](#24-final-contract)

---

## 1. Purpose

This specification replaces the single large GDevelop project JSON document with a source-oriented directory tree:

- TOML for project, scene, extension, prefab, behavior, resource, and global
  configuration settings.
- Flat standard TOML for visual/spatial `.layout` sources.
- One `.events` source file for every scene event sheet and every events-based function.
- Stable, explicit file references so a scene, function, behavior, or prefab can be reviewed and changed independently.
- A compatibility adapter that reconstructs the current legacy serializer tree in memory. The existing `gd::Project`, preview, export, code generation, and runtime paths continue to consume the current model.

The format is intended to improve AI editing, human review, merge behavior, and Git history without requiring a runtime-format migration.

This document is a design and implementation contract. The repository now
contains the TOML-settings/layout-TOML multi-file adapter in
`newIDE/app/src/ProjectsStorage/MultiFileProjectFormat`, the local transactional
filesystem integration in
`newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`,
and the IfDo parser/compiler in
`newIDE/app/src/EventsSheet/IfDoEventsDsl`. Local opening, changed-component
saving, autosave snapshots, preview reload, one-time JSON migration, migration
redirect/divergence checks, and legacy-tree composition use these adapters.
Cloud/browser providers still require the capability negotiation described in
phase 5 before they can store this directory format natively.

---

## 2. Design principles

1. **The new files are the editable source of truth.** After migration, the editor must not keep writing the legacy project JSON.
2. **The current in-memory model remains authoritative for editor and runtime behavior.** New-format loading composes data into the existing serializer shape and calls existing unserializers.
3. **No silent data loss is allowed.** The IfDo grammar must represent every
   event, instruction, variable, and metadata field persisted by the supported
   current serializers. Conversion stops before writing files when an input is
   outside that typed coverage contract.
4. **A file owns a well-defined subtree.** No mutable field is duplicated across two files.
5. **Paths are namespaces; names remain validated data.** A canonical physical
   path selects the mounted namespace. The local `name` field must agree with
   that identity. Settings documents are discovered, not referenced by other
   settings documents.
6. **Ordering and grouping are explicit.** Array, scene, function, layer,
   object, and event order are preserved. Editor object/function grouping is
   stored as a `folder = ["Parent", "Child"]` value, never as optional physical
   directories.
7. **Writes are deterministic and transactional.** Formatting, key order, path spelling, and newline behavior are canonical.
8. **Legacy import is one-way by default.** The original JSON is retained as an unchanged backup; it is not updated after successful conversion.
9. **Preview and export never treat the source tree as runtime data.** They
   receive a composed legacy serializer tree or, when a path is required, the
   generated `.gdevelop/game.json` compatibility snapshot.
10. **`.layout` files contain placement and layout concepts only.** Object
    definitions (including their variables, effects, and behavior
    configurations) belong to individual object `.settings` files. A scene
    `.layout` owns instances, layers, background/editor-view properties, and
    other spatial layout data; it never owns the object definitions instantiated
    there. Events remain in `.events`.
11. **Settings use local-root TOML plus path-derived namespaces.** Every
    `.settings` file is parsed independently. Its canonical physical path
    determines where its local root is mounted in the combined settings tree;
    mounted documents are then recursively merged with conflicts rejected.
12. **Managed source references are project-root URIs.** Settings refer to
    `.layout` and `.events` sources with canonical `game://...` URIs rooted at
    the directory containing `project.gdevelop`, never relative paths. A
    `.settings` file never references another `.settings` file.
13. **Settings stay separate on disk.** A settings file never includes or
    embeds another settings file. The editor creates the combined settings
    document only transiently during loading/compilation and writes changes
    back only to the fragment that owns them.

---

## 3. Codebase compatibility basis

The design follows these existing implementation boundaries:

| Concern                        | Current implementation                                                                | Consequence for the new format                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete project serialization | `gd::Project::SerializeTo` and `UnserializeFrom` in `Core/GDCore/Project/Project.cpp` | The composer must produce the same root serializer fields.                                                                                               |
| Scene data                     | `gd::Layout::SerializeTo` and `UnserializeFrom` in `Core/GDCore/Project/Layout.cpp`   | The adapter splits one current layout subtree into `scene.settings`, a visual `.layout`, and `.events`, then merges them before current unserialization. |
| Event data                     | `EventsListSerialization` and built-in event classes in `Core/GDCore/Events`          | `.events` compilation must emit the exact event and instruction arrays described in the DSL spec.                                                        |
| Extensions                     | `EventsFunctionsExtension` and `Project::UnserializeAndInsertExtensionsFrom`          | Complete extension declarations must be available before implementations; the current three-pass load order must be retained.                            |
| Functions                      | `EventsFunction::SerializeTo` and `UnserializeFrom`                                   | Function metadata is stored in TOML owner/function settings; only the `events` child is compiled from the pure DSL `.events` body.                       |
| Prefabs/custom objects         | `EventsBasedObject`, `EventsBasedObjectVariant`, and `AbstractEventsBasedEntity`      | The default variant is the main prefab `.layout`; additional variants need separate optional layout files.                                               |
| Behaviors                      | `EventsBasedBehavior` and `AbstractEventsBasedEntity`                                 | `behavior.settings` owns behavior metadata and each method owns one `.events` file.                                                                      |
| Existing folder projects       | `LocalProjectWriter`, `LocalProjectOpener`, and `ObjectSplitter`                      | Existing split JSON projects are legacy input. Their reference tree must be unsplit before migration.                                                    |
| Editor open path               | `ProjectsStorage` to `MainFrame`, then `gd.Serializer.fromJSObject`                   | A new storage adapter should return a composed legacy-shaped object to minimize editor changes.                                                          |
| Preview/export                 | `gdjs::Exporter`, `ExporterHelper`, and preview launchers                             | Existing exporters can use the composed/in-memory `gd::Project`; runtime code parses neither settings TOML nor source DSL.                               |

The current optional folder-project mode is not this format. It still writes JSON partials, leaves events embedded, writes a legacy root object containing references, and deletes/recreates split directory contents during save.

---

## 4. Canonical directory layout

```text
MyGame/
  project.gdevelop
  resources.settings
  constants.toml

  objects/
    Player.settings                 # folder = ["Shared"]

  scenes/
    Main/
      scene.settings
      Main.layout
      Main.events
      objects/
        Player.settings             # folder = ["Actors"]
      externals/
        Shared%20Combat.events
        Shared%20Combat.layout
    GameOver/
      scene.settings
      GameOver.layout
      GameOver.events

  extensions/
    Combat/
      extension.settings

      functions/
        CalculateDamage/
          function.settings
          CalculateDamage.events
        ResetCombat/
          function.settings
          ResetCombat.events

      prefabs/
        Enemy/
          prefab.settings
          Enemy.layout
          objects/
            Body.settings           # folder = ["Visuals"]
          functions/
            OnCreated/
              function.settings     # folder = ["Lifecycle"]
              OnCreated.events
            TakeDamage/
              function.settings
              TakeDamage.events
          variants/
            Armored.layout
            Armored/
              objects/
                Shield.settings     # folder = ["Equipment"]

      behaviors/
        Health/
          behavior.settings
          functions/
            OnCreated/
              function.settings     # folder = ["Lifecycle"]
              OnCreated.events
            TakeDamage/
              function.settings
              TakeDamage.events

  .gdevelop/
    instructions-catalog.json
    deprecated-instructions-catalog.json
    settings-catalog.json
    layout-catalog.json       # pre-v5 generated artifact; retired in v5
    runtime-api.d.ts
    project-api.d.ts
    state.json
    transactions/
```

All settings fragments at the fixed paths defined below, plus the `.layout`
and `.events` sources they reference, are managed project source.
`project.gdevelop` and `extension.settings` do not enumerate or reference
other settings files. `.gdevelop/` is editor state and should normally be
ignored by Git.

Each scene may own an `externals/` directory beside its primary layout, events,
and object sources. External event sheets and layouts are stored only below the
scene they are associated with. Their manifest entries live in that scene's
`scene.settings`; there is no project-root external manifest.

### 4.1 Required files

- One `project.gdevelop` entry file and one `resources.settings` resource
  registry at the project root.
- One root `constants.toml`, including an empty document when the project has
  no Constants.
- One `objects/<Object>.settings` file for every global
  object definition.
- Exactly one scene subfolder containing `scene.settings`, one `.layout`, and
  one `.events` file for every scene, plus one recursively discovered object
  settings file per scene object definition.
- Exactly one `extension.settings` per project extension.
- Exactly one subfolder per extension-level function. Every function subfolder
  contains exactly one `function.settings` and one matching
  `<FunctionName>.events` file.
- Exactly one `prefab.settings`, one default `<PrefabName>.layout`, one object
  settings file per default or variant child object, and one dedicated
  function subfolder per prefab function.
- Exactly one `behavior.settings` and one dedicated function subfolder per
  behavior function.

### 4.2 Optional files

- Additional prefab variant layouts under `variants/`.
- A `scenes/<Scene>/externals/` directory containing the external
  `.events`/`.layout` files owned by that scene when the project uses those
  features.
- `.gdevelop/instructions-catalog.json`, regenerated on every manual project
  save from the loaded project/platform catalog. It contains every usable
  action, condition, and expression with stable named parameters, operand
  syntax, and event-scope compatibility for AI authoring. It is generated
  editor state, not source, and must never be edited by an AI model.
  Editor-hidden instructions (which the events editor treats as deprecated),
  instructions with deprecation messages, and hidden or deprecated expressions
  are excluded so AI-authored events cannot select APIs that produce warnings.
- `.gdevelop/deprecated-instructions-catalog.json`, regenerated alongside the
  authoring catalog on every manual project save. It contains only valid
  deprecated or hidden compatibility instructions excluded from
  `instructions-catalog.json`. The editor merges both catalogs in memory for
  lossless `.events` conversion. An AI may consult the deprecated catalog only
  to understand a legacy project or make a targeted edit to a deprecated
  instruction already present there. It must never use this catalog to
  construct new events or introduce another deprecated instruction.
- `.gdevelop/settings-catalog.json`, regenerated on every manual project save.
  It describes the managed settings file kinds and ownership rules, the
  project components that currently own settings, and the non-hidden object,
  behavior, and effect types registered for the loaded project. Behavior and
  effect entries include their authoring property metadata. Hidden behavior
  descriptors are deliberately omitted from the authoring surface because they
  require a specialized editor. Their existing serialized values remain in
  attached object settings and must round-trip verbatim: hidden does not mean
  runtime-managed or disposable. AI models must consult the catalog before
  creating settings-owned definitions, must preserve unlisted existing
  behavior fields, and must never edit the generated catalog.
- **Pre-v5 only:** `.gdevelop/layout-catalog.json`, regenerated on every manual project save.
  It describes every layout TOML table and field plus the project-aware
  scene, prefab, variant, and external-layout contexts. Each context lists the
  object definitions, attached behaviors, and layers that can be referenced in
  that layout. Registered effect types and typed parameters are included so an
  AI model does not guess layout APIs. It is generated state and must never be
  edited.
- `.gdevelop/runtime-api.d.ts`, regenerated on every manual project save. It
  contains the compact reviewed public runtime surface available to JavaScript
  events. Runtime-private, underscore, renderer, generated-code, browser,
  Node.js, and privileged APIs are excluded. It is generated state and must
  never be edited.
- `.gdevelop/project-api.d.ts`, regenerated alongside the runtime declaration.
  It describes the current scene/object/group/variable/layer/resource and
  extension-function names and gives JavaScript events context-aware types. It
  is generated state and must never be edited.
- `.gdevelop/game.json`, regenerated from the composed legacy serializer tree
  on every manual project save. It is an ignored runtime/export compatibility
  snapshot, never editable project source.
- `.gdevelop/state.json` for local hashes, last-seen modification times, and crash recovery. It is not portable project content.

---

## 5. Common file rules

### 5.1 Settings fragments and layout schema

Every `.settings` file is a standalone, unindented TOML document whose owned
component fields are written at the local document root. Long qualified TOML
headers are forbidden. The loader derives the semantic namespace from the
canonical physical path and mounts the parsed local document there before the
in-memory merge.

Examples of local settings documents:

```toml
kind = "project"
settingsFormatVersion = 3
```

For example, the root above in
`extensions/Combat/functions/CalculateDamage/function.settings` mounts at
`extensions."Combat".functions."CalculateDamage"`. The path is the namespace;
the file does not repeat it.

`.layout` files are standalone standard TOML documents and are not appended to
the settings document. They use the context supplied by the referencing scene,
prefab/variant, or external-layout settings entry and must have exactly one
`[layout]` table:

```toml
[layout]
version = 1
background = "#202030"

[[layers]]
id = "base"
name = ""
cameras = [{ size = "default", viewport = "default" }]
```

There is no compatibility reader for the retired markup format or earlier
wrapped TOML drafts. The complete normative schema,
compiler/decompiler mapping, defaults, semantic checks, and canonical writer
are defined by [gdevelop-layout-toml-spec.md](gdevelop-layout-toml-spec.md).
Multi-file settings trees whose combined or local settings marker is earlier
than version 3 are rejected; there is no version-2 reader or in-place migration.

### 5.1.1 Strict extension ownership

The three source extensions have non-overlapping responsibilities:

| Extension   | Allowed content                                                                                                                                     | Forbidden content                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `.settings` | TOML identity, metadata, signatures, per-object definitions and their behaviors/variables/effects, local ordering, and runtime/editor configuration | IfDo statements, instance placement, layer ordering, spatial layout payloads, and references to other settings files |
| `.layout`   | Flat TOML instances, layers, positions, bounds/dimensions, background, and editor-canvas state                                                      | Object/attached-behavior definitions, events, signatures, runtime logic, and general non-layout settings             |
| `.events`   | Typed IfDo event statements, DSL comments, metadata annotations, and exact catalog instructions                                                     | TOML front matter, settings tables, layout data, raw event/instruction JSON, or legacy project configuration         |

The loader rejects a file containing content owned by another extension. It
does not merge duplicated configuration from `.events` or `.layout` files.

`.events` files contain IfDo DSL only. They never contain TOML front matter,
JSON configuration, or duplicated owner/function settings. Their target and
identity come from the owning `.settings` document and canonical path.

### 5.1.2 Path mounting and conflict-free settings merge

All `.settings` files are combined in this deterministic dependency order:

1. `project.gdevelop`.
2. `resources.settings`.
3. Root object settings in global object order.
4. Scene settings in project scene order, followed by that scene's flat
   object settings in object order.
5. Extension settings in project extension order.
6. Each extension's per-function, prefab, and behavior settings in their
   locally owned contiguous `order` values.
7. Each prefab's flat default and variant object settings in object order.
8. Each prefab and behavior's flat function settings in function order.

`constants.toml` is parsed separately as editor-only Constants. It is not
mounted into or merged with the combined project settings document.

The loader discovers settings fragments only from the fixed paths
`resources.settings`, `constants.toml`,
`objects/*.settings`, `scenes/*/scene.settings`,
`scenes/*/objects/*.settings`,
`extensions/*/extension.settings`,
`extensions/*/functions/*/function.settings`,
`extensions/*/prefabs/*/prefab.settings`, and
`extensions/*/prefabs/*/objects/*.settings`,
`extensions/*/prefabs/*/variants/*/objects/*.settings`, and
`extensions/*/prefabs/*/functions/*/function.settings`,
`extensions/*/behaviors/*/behavior.settings`, and
`extensions/*/behaviors/*/functions/*/function.settings`. No parent settings
file lists or references these children.

For every discovered file the loader:

1. Parses the file independently as TOML.
2. Validates its local-root marker and canonical path.
3. Derives its mount namespace from that path.
4. Mounts the local document at that namespace.
5. Recursively merges mounted objects. Any duplicate scalar, array, or table
   ownership is a hard error; there is no parent-wins or child-wins policy.

The result is an ephemeral in-memory document called
`CombinedProjectSettings` in this specification. Conceptually:

```text
parse each local settings document
  -> derive namespace from canonical physical path
  -> mount the local root at that namespace
  -> strict recursive merge
      -> CombinedProjectSettings
      -> validate and compile project
```

`CombinedProjectSettings` behaves like one large project-settings document for
editor compilation, but it is never a managed source file and is never written
to the project directory.

### 5.1.3 Separate-write rule

Every `.settings` file remains an independent canonical TOML file when stored:

- Canonical `.settings` and `.layout` writers use no indentation: every
  non-empty assignment or table header begins at column zero.
- A settings file must not contain the TOML text or local payload owned by
  another settings file.
- The format has no TOML `include`, import, inheritance, or textual-expansion
  directive for settings.
- A scene settings fragment owns its `.layout` and `.events` references. The
  project fragment never embeds or repeats those references.
- Loading and compilation mount and merge the documents in memory; saving performs the
  inverse ownership projection and writes each changed subtree only to its
  owning file.
- Editing `scene.settings`, `function.settings`, or another child fragment does
  not rewrite `project.gdevelop` or `extension.settings`. Component identity,
  source references, and order are written in the component's own fragment.
- The editor must not materialize a combined `.settings` file for preview,
  export, autosave, or caching. A recovery snapshot may store fragments, but it
  must preserve their ownership boundaries.

There is no textual concatenation, recursive settings inclusion, or
parent-wins/child-wins conflict policy; a collision is a schema or identity
error.

Additional rules for stored fragments and their combined shape:

- Every settings file owns exactly one local component document. The physical
  path supplies its unique mounted namespace. `project.gdevelop` keeps format
  bootstrap scalars at its root. The separate `constants.toml` document contains
  only direct-root user data and has no format metadata or wrapper table.
- A file must not declare or reopen a table owned by another settings file.
- There are no `sceneFiles`, `extensionFiles`, `functionFiles`, `prefabFiles`,
  `behaviorFiles`, or `externalSettings` settings-file indexes. Scenes,
  extensions, extension functions, prefabs, and behaviors each carry a
  contiguous zero-based `order` value in their own settings namespace.
- A scene may use `externalEventFiles` and `externalLayoutFiles` because those
  entries describe scene-owned `.events` and `.layout` sources, not other
  settings files. Their `order` values are project-wide and contiguous within
  each external container.
- Dynamic names are path components and are encoded by the canonical `game://`
  path rules; they are not repeated in TOML table headers.
- Two files resolving to the same mounted namespace are a hard duplicate-identity
  error before compilation.
- Each local document must parse on its own and mount without a merge conflict.
- Each local document ends with one newline.
- Source diagnostics retain the byte range and originating filename for every
  mounted document.

The combined in-memory document has a shape like:

```toml
[gdevelop]
combinedSettingsFormatVersion = 3

[project]
kind = "project"

[scenes."Main"]
kind = "scene"

[externals]
kind = "externals"

[extensions."Combat"]
kind = "extension"

[extensions."Combat".functions."CalculateDamage"]
kind = "function"
```

### 5.1.4 Repeated named variable records

Every non-empty settings-owned variable container uses repeated TOML
array-of-table records. The header is exactly `[[variables]]`,
`[[globalVariables]]`, or `[[sceneVariables]]`. This applies to:

- Project, scene, object, prefab, and events-based behavior `variables`.
- Extension `globalVariables` and `sceneVariables`.

Each record contains an explicit non-empty `name` followed by its complete
descriptor. Nested `children` remain arrays of inline descriptors, so no
recursive TOML table headers are generated. For example:

```toml
[[sceneVariables]]
name = "Controllers"
type = "array"
children = [ { type = "structure", children = [ { name = "Buttons", type = "array", children = [ { type = "structure", children = [ { name = "State", type = "string", value = "Idle" } ] } ] }, { name = "Joystick", type = "structure", children = [ ] } ] } ]
```

Primitive variables use the same rule:

```toml
[[variables]]
name = "Score"
type = "number"
value = 0

[[variables]]
name = "PlayerName"
type = "string"
value = "Ada"

[[variables]]
name = "Enabled"
type = "boolean"
value = true
```

The descriptor preserves `type`, `value` or `children`, enum `values`,
`folded`, `persistentUuid`, `hasMixedValues`, and unknown serializer fields.
The loader preserves record order and reconstructs the current legacy variable
array. An empty container uses an explicit empty root array:

```toml
variables = [ ]
```

Keyed tables such as `[variables]`, whole-container inline assignments such as
`variables = { ... }`, and non-empty inline arrays such as
`variables = [{ name = "Score", ... }]` are invalid. Empty `variables = [ ]`,
`globalVariables = [ ]`, and `sceneVariables = [ ]` assignments are the only
assignment form. Recursive forms such as `[[sceneVariables.children]]` are
also invalid.

### 5.1.5 Compact object groups

Every settings-owned object-group container uses one TOML table keyed by group
name. Each value is the complete ordered array of object names in that group:

```toml
[objectGroups]
Buttons = [ "PauseButton", "Retry", "PlayButton" ]
"UI Navigation" = [ "LeftArrow", "SpeedUp" ]
```

When a group declares required behavior types, the settings file preserves
that metadata in an optional companion table keyed by the same group name:

```toml
[objectGroupRequiredBehaviors]
Buttons = [ "ButtonStates::ButtonFSM" ]
```

Every key in `objectGroupRequiredBehaviors` must also exist in `objectGroups`.
Omitting the companion key means the serialized group has no
`requiredBehaviors` property. An explicitly empty companion array preserves an
explicitly empty `requiredBehaviors` array.

An owner with no groups writes the compact empty-table value:

```toml
objectGroups = { }
```

This representation applies to project, scene, prefab, prefab-variant, and
function settings. A prefab variant nested in `prefab.settings` uses its
corresponding nested table:

```toml
[[variants]]
name = "Armored"
layout = "game://extensions/Combat/prefabs/Enemy/variants/Armored.layout"

[variants.objectGroups]
Parts = [ "Armor", "Body" ]
```

The loader reconstructs the current serializer's `objectsGroups` arrays for
project/scene/prefab owners and its `objectGroups` arrays for functions. Each
source member string becomes the serializer descriptor `{ "name": "..." }`.
Each required-behavior string becomes `{ "type": "..." }` inside the group's
`requiredBehaviors` property. Group names must be unique because they are TOML
keys. String values and array order are preserved exactly. Group declaration
order is used for deterministic serializer reconstruction but has no runtime
meaning in the source format.

No other object-group membership source form exists, and required-behavior
metadata uses only the companion table described above. In particular,
`objectsGroups`, `objectGroups = []`, `[[objectsGroups]]`,
`[[objectsGroups.objects]]`, and descriptor arrays containing repeated
`name`/`objects` fields are invalid and are not migrated during multi-file
loading.

### 5.1.6 Inline Sprite points

Sprite point data is always written as inline TOML values. A sprite frame uses
this canonical shape:

```toml
originPoint = { name = "origine", x = 0, y = 0 }
centerPoint = { name = "centre", x = 16, y = 16, automatic = true }
points = [ { name = "Muzzle", x = 28, y = 8 } ]
customCollisionMask = [ [ { x = 0, y = 0 }, { x = 32, y = 0 }, { x = 16, y = 32 } ] ]
```

`originPoint` and `centerPoint` are inline tables. `points` is an inline array
of named-point tables. `customCollisionMask` is an inline array of polygons,
where every polygon is an inline array of vertex tables. Empty point and mask
arrays stay inline as `[ ]`.

The writer must never expand these values into dotted headers such as
`[animations.directions.sprites.originPoint]`,
`[animations.directions.sprites.centerPoint]`, or nested point
array-of-table headers. Parsing the inline representation reconstructs the
same serializer objects and arrays without a separate conversion shape.

### 5.2 TOML profile

Writers use TOML 1.0 with these restrictions:

- UTF-8 text and LF endings.
- Double-quoted basic strings for short text.
- Triple-double-quoted multiline strings for multiline text.
- Decimal integers and floats only.
- RFC 3339 dates are not used for semantic project data; timestamps are strings.
- Tables and array-of-tables are emitted in schema order.
- Non-empty variable containers are emitted only as repeated `[[variables]]`,
  `[[globalVariables]]`, or `[[sceneVariables]]` records with explicit `name`
  fields. Nested descriptor objects remain inline. Empty containers are
  emitted as root `field = [ ]` assignments.
- Object groups are emitted only as `[objectGroups]` tables whose values are
  arrays of object-name strings. Their optional serialized
  `requiredBehaviors` metadata is emitted in the parallel
  `[objectGroupRequiredBehaviors]` table as behavior-type string arrays.
- Sprite `originPoint`, `centerPoint`, named `points`, and
  `customCollisionMask` vertex data are emitted as inline TOML tables and
  arrays rather than nested headers.
- Keys that are not bare TOML keys are quoted.
- Every file ends with exactly one newline.
- NaN and infinity are forbidden because legacy JSON cannot represent them.

Within component payload tables, ordinary field names intentionally match the
current JSON serializer names (`loopIndexVariable` and so on). Object groups
are the explicit exception: every source owner uses the single `objectGroups`
table described above even though current legacy serializers use two different
array field spellings. Legacy `*FolderStructure` fields are also excluded from
the multi-file format. Physical project directories own component structure,
and the legacy runtime/editor model rebuilds any transient root folders while
composing.

Attached behavior instances use the serializer key space. The catalog lists
the author-writable properties that an AI may initialize or edit, while hidden,
deprecated, extension-owned, and legacy serialized fields are intentionally
not advertised. Any such fields already present in a global, scene, prefab, or
prefab-variant object definition still belong to that attached behavior and
must round-trip unchanged. This distinction lets specialized behavior editors
persist runtime configuration such as collision layers, masks, collider
dimensions, and offsets without exposing those fields in the generic authoring
surface.

### 5.3 JSON-to-TOML projection

For payloads produced by the current serializer:

| Legacy JSON value        | TOML representation                                            |
| ------------------------ | -------------------------------------------------------------- |
| Object                   | Table or inline table                                          |
| Array of objects         | Array of tables                                                |
| Array of one scalar type | TOML array                                                     |
| String                   | TOML string                                                    |
| Boolean                  | TOML boolean                                                   |
| Safe integer             | TOML integer                                                   |
| Other finite number      | TOML float when lossless; otherwise canonical `rawJson` text   |
| Empty object             | Inline table `{}` when a typed table would otherwise disappear |
| Empty array              | `[]`                                                           |

The current component serializers normally do not emit JSON `null` or
heterogeneous scalar arrays. A future or extension-owned component value that
TOML cannot represent without changing type is stored as canonical JSON text
and reapplied by JSON Pointer:

```toml
[rawJson]
"/arbitrary" = "null"
"/mixed" = '''[1,"two"]'''
```

Rules for `rawJson`:

- For component documents the table is the short local `[rawJson]` table.
- Keys are RFC 6901 JSON Pointers relative to the component's legacy payload.
- Values are canonical JSON text.
- Raw overrides are applied after the ordinary TOML projection is built.
- A pointer must not overlap another pointer in the same file.
- A writer should use this only when the ordinary projection is not lossless.
- Integers outside JavaScript's safe-integer range use `rawJson`; this avoids
  TOML parser overflow while preserving the exact legacy JSON number.
- Unknown raw pointers are preserved, not discarded.

`constants.toml` is deliberately simpler: it has no raw-JSON fallback or reserved
metadata namespace. Every Constant value must be directly representable
in TOML. JSON `null`, heterogeneous arrays, dates, non-finite numbers, and
unsafe integers are rejected rather than encoded behind user data.

### 5.4 Canonical ordering

Order-sensitive data remains arrays/arrays-of-tables. Maps whose order is not semantic are written by Unicode code-point order. The canonical writer must not sort:

- Scenes, external events, external layouts, or extensions.
- Objects, object groups, layers, instances, resources, or variables.
- Functions, properties, folders, variants, parameters, conditions, actions, sub-instructions, or events.

### 5.5 File identity and path safety

Each canonical settings path is authoritative for its mounted namespace. The
loader verifies that the path owner, fixed component kind, locally stored name,
and referenced `.layout`/`.events` source agree.

Suggested filenames are generated as follows:

1. Normalize the display name to Unicode NFC.
2. Keep ASCII letters, digits, `_`, `-`, and `.`.
3. Percent-encode every other UTF-8 byte with uppercase hex.
4. Encode leading/trailing spaces and trailing dots.
5. Escape `.` and `..` and Windows device names such as `CON`, `NUL`, and `COM1`.
6. Compare paths case-insensitively and with Unicode normalization. On collision, append `~` plus the first eight hex characters of SHA-256 of the unescaped name.

`externals` is a reserved child directory inside every scene folder. It is
owned by that scene and must not be reused for another managed component kind.

The generated path is a suggestion. Once created, a managed folder path remains
stable until an explicit rename/move operation. This avoids path churn when
display names change.

### 5.6 `game://` project-root references

Every managed source-file reference written in a `.settings` file uses a
canonical `game://` URI. Relative filesystem paths are forbidden. These are
references to `.layout` and `.events` files only; settings fragments are found
from fixed folder conventions and must never be referenced. For example:

```toml
layout = "game://scenes/Main/Main.layout"
events = "game://scenes/Main/Main.events"
```

`game://` identifies the root directory containing `project.gdevelop`. It is a
project-source URI scheme, not a network URL and not an operating-system path.
The text after `game://` is a root-relative project path.

Canonical and safety rules:

- Use `/` separators, Unicode NFC, and uppercase hexadecimal UTF-8
  percent-encoding where encoding is required.
- Do not use an authority, query, fragment, empty segment, `.` segment, or
  `..` segment.
- A reference must not contain an absolute path, drive prefix, UNC prefix, or
  backslash.
- The loader percent-decodes and normalizes portable path segments. A segment
  containing Windows-invalid characters, a Windows device name, or a trailing
  dot/space stays in its uppercase percent-encoded physical form on every OS,
  keeping a Git checkout portable. The resolved path is still confined to the
  project root and checked against traversal and symlink escape.
- Normalized case/Unicode collisions and duplicate resolved paths are errors.
- Writers preserve an already-recorded canonical URI until an explicit move or
  rename operation changes it.

Stored reference examples include
`game://scenes/Main/externals/Shared%20Combat.events` and
`game://extensions/Combat/functions/CalculateDamage/CalculateDamage.events`.
The loader may use `game://project.gdevelop` and other settings URIs internally
for identity and diagnostics, but it never serializes one settings URI inside
another settings fragment.

Version 3 does not automatically rewrite legacy runtime asset/resource paths
to `game://`; this rule governs managed new-format source references stored in
settings.

---

## 6. `project.gdevelop`, `resources.settings`, and `constants.toml`

### 6.1 Ownership

The entry file owns the current project root except these split containers and
editor-only sources:

- `resources`
- `constants`
- `objects`
- `layouts`
- `externalEvents`
- `externalLayouts`
- `eventsFunctionsExtensions`

It therefore owns project properties, versions, platforms, global object
groups, global variables, and first/preview scene selection. Individual global
object definitions are discovered from the root `objects/` directory.
The sibling `resources.settings` owns the complete
legacy `resources` container, including resource entries, origins, metadata,
and resource folders. The sibling `constants.toml` owns the complete editor-only,
TOML-compatible Constants object.

### 6.2 Example

```toml
combinedSettingsFormatVersion = 3
eventsDslVersion = "3.0"
kind = "project"
settingsFormatVersion = 3
firstLayout = "Main"
previewLayout = "Main"
initialGDVersion = ""

[gdVersion]
major = 5
minor = 6
build = 0
revision = 0

[properties]
name = "My Game"
description = "Example multi-file project"
version = "1.0.0"
author = ""
windowWidth = 1280
windowHeight = 720
maxFPS = 60
minFPS = 20
verticalSync = false
scaleMode = "linear"
pixelsRounding = false
adaptGameResolutionAtRuntime = false
sizeOnStartupMode = ""
antialiasingMode = "MSAA"
antialisingEnabledOnMobile = false
projectUuid = "6dd17ad2-4f10-4df0-b0e9-d44c76e773f7"
folderProject = true
packageName = "com.example.mygame"
orientation = "default"
```

Real entry files also contain `[objectGroups]` and either repeated
`[[variables]]` records or `variables = [ ]`.
Global object definitions and resources are never
written in `project.gdevelop`. No settings file may contain a legacy
`objectsFolderStructure` table.
Constants is likewise never written there; it belongs to
`constants.toml`.

### 6.3 Global object settings

Every global object definition has one physical source file:

```text
objects/<Object>.settings
```

```toml
kind = "object"
settingsFormatVersion = 3
order = 0
folder = []
name = "Player"
type = "Sprite"
behaviors = []
effects = []

variables = [ ]
```

The file owns the complete global object definition. Directories between
`objects/` and the filename are the object's editor folder path. The global
`order` field preserves the legacy object-array order independently of the
folder path. Composition discovers these files recursively and reconstructs
the in-memory global object array plus the transient legacy folder tree needed
by the current editor. Empty logical folders are not source data.

### 6.4 `resources.settings` example

```toml
kind = "resources"
settingsFormatVersion = 3
resourceFolders = []

[[resources]]
file = "assets/Player.png"
kind = "image"
metadata = ""
name = "Player.png"
smoothed = true
userAdded = true
```

`resources.settings` is discovered through its fixed root path. Neither file
references the other. The `kind` and `settingsFormatVersion` fields are removed
when composing the legacy `resources` object.

### 6.5 `constants.toml` example

```toml
[sheet.row]
column = "value"
column2 = "another value"

[sheet.row2]
column = "second"
column2 = "third"
```

`constants.toml` is discovered at its fixed root path and is never referenced by
another source file. The entire document is user-defined configuration: it has
no `[settings]` or `[constants]` wrapper and no `settingsFormatVersion`
marker. Unsupported TOML value shapes are rejected. A user-defined `rawJson`
key is ordinary data with no serializer meaning.

The editor auto-saves Constants changes directly to `constants.toml` after a
short debounce. This isolated save does not rewrite `project.gdevelop` or any
other owned source. The normal project-save transaction also writes
`constants.toml` from the in-memory Constants as a fallback.

### 6.6 Root rules

- `project.gdevelop` contains no reference to any `.settings` file, including
  no self-reference. Its fixed root filename is the entry marker.
- `project.gdevelop` must not contain resources in canonical output.
  `resources.settings` is mounted as the sole writer of `project.resources`.
- `project.gdevelop` must not contain constants in canonical output.
  `constants.toml` is loaded separately into the editor's Constants model and
  is not part of the combined settings merge.
- `project.gdevelop` must not contain global objects in canonical output.
  Each global object owns one flat root object settings file.
- Root `eventsDslVersion` must equal `"3.0"`. Earlier DSL grammars are
  intentionally rejected rather than rewritten during multi-file loading;
  legacy JSON import always emits the current grammar.
- Scene and extension order are contiguous zero-based `order` values owned by
  each `scene.settings` and `extension.settings` fragment respectively.
- Names are unique within their current legacy container.
- Every discovered `scene.settings` references one layout and one events file
  in its own scene subfolder.
- Every managed `.layout` or `.events` reference is a canonical project-root
  `game://` URI; relative paths and `.settings` references are invalid.
- A referenced path occurs only once in the complete project graph.
- Each `scene.settings` may declare `externalEventFiles` and
  `externalLayoutFiles`. The owning scene supplies the association, while each
  entry supplies its external name, source URI, and project-wide
  legacy-container order.
- `firstLayout` and `previewLayout`, when present, must name a scene.
- The root entry does not store content hashes. Hashes belong in ignored editor state so editing one event file does not force a root-file Git conflict.

### 6.7 In-memory composition

The composer removes format-only fields and returns project content separately
from the parsed Constants payload. The project content has this shape:

```json
{
  "gdVersion": {},
  "properties": {},
  "resources": [],
  "objects": [],
  "objectsGroups": [],
  "variables": [],
  "firstLayout": "Main",
  "previewLayout": "Main",
  "layouts": [],
  "externalEvents": [],
  "eventsFunctionsExtensions": [],
  "externalLayouts": []
}
```

The global `objects` array is composed from root object settings in their
locally owned order. Scenes come from `scene.settings`, extensions come from
`extension.settings`, and both external containers are collected from all
scene settings and sorted by their project-wide `order` values.

The storage loader initializes `gd::Project::constantsJson` from the separate
parsed `constants.toml` payload after the project content is unserialized.
Generated `.gdevelop/game.json`, in-memory project JSON, and runtime exports
contain no Constants map; supported placeholders are resolved before runtime
data is written.

---

## 7. Scene files

Every scene has its own subfolder:

```text
scenes/<Scene>/
  scene.settings
  <Scene>.layout
  <Scene>.events
  objects/
    <Object>.settings
    <Object>.settings
```

This is a required boundary, not merely a filename convention.

### 7.1 `scene.settings`

`scene.settings` owns scene identity and scene-wide non-layout configuration
extracted from the current `gd::Layout` serializer object:

```toml
kind = "scene"
settingsFormatVersion = 3
order = 0
layout = "game://scenes/Main/Main.layout"
events = "game://scenes/Main/Main.events"
name = "Main"
mangledName = "Main"
title = "My Game"
standardSortMethod = true
stopSoundsOnStartup = true
resourcesPreloading = "inherit"
resourcesUnloading = "inherit"
disableInputWhenNotFocused = true
```

It also owns:

- The scene's stable project order and its canonical `game://` layout/events
  references.
- Scene variables.
- Scene object groups used by events and object picking.
- Behavior shared data used by scene objects.
- Other scene-level runtime, loading, input, sorting, or identity settings
  added to the current serializer in the future.

A `[[behaviorsSharedData]]` entry is emitted only when it contains at least one
serialized shared property in addition to `name` and `type`. Custom, native,
and capability behaviors with no shared property must not receive an empty
placeholder; when no behavior needs shared data, the scene collection remains
`behaviorsSharedData = []`.

These fields must not be duplicated in the `.layout` file.

#### 7.1.1 Scene object settings

Every scene object definition has one physical source file:

```text
scenes/<Scene>/objects/<Object>.settings
```

```toml
kind = "object"
settingsFormatVersion = 3
order = 0
folder = []
name = "Player"
type = "Sprite"
behaviors = []
effects = []

variables = [ ]
```

The file owns the complete polymorphic object definition, including attached
behaviors, variables, effects, animations, and type-specific configuration.
Its `folder = ["Parent", "Child"]` array is the object's editor grouping;
`folder = []` means the root. No optional grouping directory, `objects` array,
or `objectsFolderStructure` is written. During editor/runtime composition the
loader rebuilds the temporary legacy tree from these arrays. Empty logical
folders are not source data.

### 7.2 `<Scene>.layout`

The `.layout` file contains only scene placement and layout data. It owns where
instances are placed, how layers are arranged, the scene background, and
editor-canvas state. An instance refers to an object definition owned by
a scene object `.settings` file; the definition itself never appears in this
file.

```toml
[layout]
version = 1
background = "#202030"

[editor]
grid = true
grid_size = [32, 32, 32]
snap = true

[[layers]]
id = "base"
name = ""
cameras = [{ size = "default", viewport = "default" }]

[[instances]]
layer = "base"
object = "Player"
id = "ef3ef49d-f20f-4450-b373-0ce43291a002"
at = [128, 256]
```

The scene layout payload may contain only:

- `instances`
- `layers`
- `uiSettings`
- Background color and other visual editor properties.

Object definitions remain intact in their individual scene object settings,
including polymorphic object data and embedded behavior, variable, and effect
configuration. The composer merges those definitions with this placement
payload before calling the existing scene unserializer.

The `.layout` file must not contain:

- `events` or event instructions.
- `objects` or any object behavior configuration.
- Any legacy `*FolderStructure` field.
- Scene variables.
- Scene loading/unloading, input, title, sound-startup, or sort settings.
- Scene behavior shared data.
- Any field owned by `scene.settings` or a scene object settings file.

If an owned field appears in both files, loading fails instead of choosing one
copy.

### 7.3 `<Scene>.events`

The events file contains only the scene's IfDo DSL body. Its owning
`scene.settings` supplies its identity and source reference:

```events
@comment "Initialize the scene." background=[255,230,109] text=[0,0,0]

if once
do scene.score = 0
```

The compiler emits the current serializer event array. During composition it
becomes `layout.events`.

### 7.4 Scene composition

The composer merges the three sources into the current single `gd::Layout`
legacy object:

```text
scene.settings non-visual fields
  + <Scene>.layout visual/editor fields
  + <Scene>.events compiled event array
      -> one legacy layouts[] item
```

This merge exists only at the compatibility boundary. Normal editor saves
write the three source files independently.

### 7.5 Cross-file validation

- The `scene.settings` namespace name and `.events`/`.layout` basenames must
  match exactly.
- The settings/layout/events trio is indivisible. A missing member is a load
  error.
- All three files must resolve inside the discovered scene subfolder.
- Scene rename changes the settings namespace, the three filenames, and project
  event references in one transaction; `project.gdevelop` has no scene-file
  index entry to update.

---

## 8. Extension files

### 8.1 `extension.settings`

The settings file owns extension metadata and its project-wide extension
`order`. Child settings are discovered from the extension's fixed subfolders;
`extension.settings` neither lists nor references them. It mirrors
`EventsFunctionsExtension::SerializeTo` except the implementations split into
files.

```toml
kind = "extension"
settingsFormatVersion = 3
order = 0
name = "Combat"
fullName = "Combat"
version = "1.0.0"
extensionNamespace = ""
shortDescription = "Combat helpers"
description = ["Reusable combat logic."]
dimension = ""
category = "Gameplay"
author = ""
authorIds = []
tags = ["combat"]
previewIconUrl = ""
iconUrl = ""
helpPath = ""
gdevelopVersion = ""
```

The settings file also owns, when present:

- `origin`
- `changelog`
- `dependencies`
- `sourceFiles`
- `globalVariables`
- `sceneVariables`

It must not embed `eventsFunctions`, `eventsBasedObjects`, or
`eventsBasedBehaviors` implementations, and must not contain `functionFiles`,
`prefabFiles`, `behaviorFiles`, or `eventsFunctionsFolderStructure`. The
physical `functions/`, `prefabs/`, and `behaviors/` directories are the only
component structure. Each extension-level function, prefab, and behavior owns
its position in its own `order` field.

### 8.2 Per-function subfolders

Every extension-level function has its own subfolder:

```text
functions/<FunctionName>/
  function.settings
  <FunctionName>.events
```

For example:

```text
functions/CalculateDamage/
  function.settings
  CalculateDamage.events
```

`function.settings` owns the complete current `gd::EventsFunction` metadata
except its `events` body:

```toml
kind = "function"
settingsFormatVersion = 3
order = 0
extension = "Combat"
name = "CalculateDamage"
events = "game://extensions/Combat/functions/CalculateDamage/CalculateDamage.events"
functionType = "Expression"
fullName = "Calculate damage"
description = "Returns damage after defense."
sentence = ""
group = "Damage"
getterName = ""
private = false
async = false
helpUrl = ""
deprecated = false
deprecationMessage = ""
expressionType = { type = "number" }
parameters = [
  { name = "amount", type = "expression", description = "Base amount", optional = false, defaultValue = "", codeOnly = false }
]
objectGroups = { }
```

Rules:

- The loader discovers every `functions/*/function.settings` file. Each
  function owns its contiguous zero-based `order`; no settings file stores a
  second logical function tree.
- The `events` value is a project-root
  `game://extensions/<Extension>/functions/<Function>/<Function>.events` URI,
  never a path relative to `function.settings`.
- The function table owns function/expression type,
  presentation text, flags, ordered parameters, defaults, and object groups.
- The subfolder name, function namespace name, `function.name`, and `.events`
  basename must match exactly.
- Each function subfolder contains one managed `function.settings` and one
  managed `.events` file. Unlisted files are not silently imported.
- The extension name must match the owning `extension.settings` file.

The settings file does not contain event statements. The matching `.events`
file contains only the IfDo DSL body and does not repeat function identity,
signature, parameters, or other TOML configuration.

### 8.3 Extension-level functions

Every discovered per-function `function.settings` points to its sibling
`<FunctionName>.events`. The settings own `gd::EventsFunction` metadata and
the pure DSL body owns only the legacy `events` array.

### 8.4 Required load ordering

The loader preserves the current multi-pass extension behavior:

1. Discover and read every extension, per-function, prefab, and behavior
   settings fragment, then resolve their `.layout` and pure DSL body sources.
2. Create extension, behavior, prefab, and function declarations for all extensions.
3. Load default prefab layouts so object types exist.
4. Build a temporary project context and instruction/function catalog.
5. Compile all function and scene `.events` bodies.
6. Assemble complete extension implementation objects.
7. Load prefab variants after default variants and dependent object types.
8. Perform the final `gd::Project::UnserializeFrom` or equivalent targeted insertion.

This ordering is necessary because prefabs may contain custom behaviors or other prefabs, functions may call other functions, and event compilation needs registered metadata.

---

## 9. Prefab files

In current code, a prefab corresponds to an `EventsBasedObject` (also called an events-based custom object). The source format uses the user-facing term `prefab` while mapping to `eventsBasedObjects` in legacy JSON.

### 9.1 `prefab.settings`

```toml
kind = "prefab"
settingsFormatVersion = 3
order = 0
name = "Enemy"
fullName = "Enemy"
description = "Reusable enemy prefab"
defaultName = "Enemy"
assetStoreTag = ""
private = false
previewIconUrl = ""
iconUrl = ""
helpPath = ""
is3D = false
isAnimatable = false
isTextContainer = false
isInnerAreaFollowingParentSize = false
isUsingLegacyInstancesRenderer = false

layout = "game://extensions/Combat/prefabs/Enemy/Enemy.layout"

[[extensions."Combat".prefabs."Enemy".variants]]
name = "Armored"
layout = "game://extensions/Combat/prefabs/Enemy/variants/Armored.layout"
assetStoreAssetId = ""
assetStoreOriginalName = ""
```

It also owns:

- The compact `[objectGroups]` table for the prefab and the corresponding
  `[variants.objectGroups]` table for every variant, plus their optional
  `[objectGroupRequiredBehaviors]` and
  `[variants.objectGroupRequiredBehaviors]` companion tables.
- Prefab variables.
- Flat `propertyDescriptors` in source order. They are one direct TOML array;
  property groups and property folder trees do not exist in this format.
- Variant order.

It never embeds prefab function metadata. Functions are discovered from the
physical `functions/` directory described in section 9.4.

### 9.2 `<Prefab>.layout`

The default layout maps to the default `EventsBasedObjectVariant` fields:

- `areaMinX`, `areaMinY`, `areaMinZ`
- `areaMaxX`, `areaMaxY`, `areaMaxZ`
- `layers`
- `instances`
- `editionSettings`

The layout contains only spatial/default-variant layout settings.
`prefab.settings` owns groups and other prefab-wide configuration; it does not
duplicate layout fields, object definitions, or a logical folder tree.

Every default-prefab child object has one physical source file:

```text
extensions/<Extension>/prefabs/<Prefab>/objects/<Object>.settings
```

The file owns the complete child object definition and uses the namespace
`[extensions."<Extension>".prefabs."<Prefab>".objects."<Object>"]`. Its
physical folder path is the editor object folder path.

```toml
[layout]
version = 1
bounds = { min = [0, 0, 0], max = [64, 64, 64] }
```

When composing legacy JSON, settings-owned object definitions and layout-owned
spatial fields are merged into the prefab object at the same level, matching
`EventsBasedObject::SerializeTo`.

### 9.3 Variant layouts

Current prefabs may contain `variants`. Layout TOML stores each non-default
variant's spatial data in `variants/<Variant>.layout` using prefab-variant
context. Variant identity and asset-store identifiers
as well as its groups and other variant metadata are configuration in the
`[[variants]]` entry of `prefab.settings`, not in the `.layout` file. Variant
child object definitions use:

```text
extensions/<Extension>/prefabs/<Prefab>/variants/<Variant>/objects/<Object>.settings
```

The path mounts each local document at
`extensions."<Extension>".prefabs."<Prefab>".variantObjects."<Variant>"."<Object>"`.

### 9.4 Prefab function files

Every prefab function has a dedicated physical directory:

```text
extensions/<Extension>/prefabs/<Prefab>/functions/<Function>/
  function.settings
  <Function>.events
```

There are no optional grouping directories after `functions/`. The final
directory name matches the function name. `function.settings` stores grouping
as `folder = ["Parent", "Child"]`, or `folder = []` at the root. Composition
derives the transient legacy folder tree exclusively from these values. For
example:

```toml
kind = "function"
settingsFormatVersion = 3
order = 0
folder = ["Combat"]
name = "TakeDamage"
events = "game://extensions/Combat/prefabs/Enemy/functions/TakeDamage/TakeDamage.events"
functionType = "Action"
fullName = "Take damage"
description = "Damages one enemy."
sentence = "Damage _PARAM0_"
private = false
async = false
parameters = []
objectGroups = { }
```

`function.settings` owns the complete function identity, signature, metadata,
and owner-local function order. Its sibling `.events` file owns only pure IfDo DSL:

```events
if Object.health > 0
do Object.health -= amount
```

---

## 10. Behavior files

### 10.1 `behavior.settings`

```toml
kind = "behavior"
settingsFormatVersion = 3
order = 0
name = "Health"
fullName = "Health"
description = "Adds hit points to an object"
objectType = ""
private = false
previewIconUrl = ""
iconUrl = ""
helpPath = ""
quickCustomizationVisibility = "default"
```

The file also owns:

- Behavior variables.
- Flat `propertyDescriptors` and `sharedPropertyDescriptors` arrays in source
  order. No property folder tree is serialized or reconstructed.
- Behavior-wide metadata only. Function metadata is never embedded here.

### 10.2 Behavior function files

Every behavior method uses:

```text
extensions/<Extension>/behaviors/<Behavior>/functions/<Function>/
  function.settings
  <Function>.events
```

Its physical path supplies the mounted namespace
`extensions."<Extension>".behaviors."<Behavior>".functions."<Function>"`.
Its `folder` array reconstructs editor grouping; `function.settings` owns
identity/signature/order, and the sibling `.events` owns only the body. The
legacy composer places the compiled result under the behavior's
`eventsFunctions` array. Empty logical function folders are not source data.

---

## 11. Pure function `.events` bodies

Every extension, prefab, or behavior function `.events` file contains only
IfDo DSL event code. Complete function identity and settings are stored by its
owner:

| Function owner | Complete metadata location                                    |
| -------------- | ------------------------------------------------------------- |
| Extension      | `functions/<Function>/function.settings`                      |
| Prefab         | `prefabs/<Prefab>/functions/<Function>/function.settings`     |
| Behavior       | `behaviors/<Behavior>/functions/<Function>/function.settings` |

Example extension function body:

```events
do result = max(0, amount)
```

The owner settings entry is the complete metadata source and compilation
target. It supplies function kind, qualified owner, ordered parameters and
types, return type, flags, and editor metadata. A project-owned `.events` file
must not repeat these as TOML front matter or as a `function` declaration.

DSL-native typed event annotations and exact catalog instructions remain valid
because they describe event nodes, not function configuration. Raw JSON event
or instruction fallbacks are forbidden.

Legacy function-type mapping is defined normatively in the events DSL specification. In particular, `ExpressionAndCondition` and `ActionWithOperator` must not be collapsed to ordinary expression/action functions.

---

## 12. External event and layout files

External sources belong to their associated scene:

```text
scenes/<Scene>/
  scene.settings
  externals/
    <ExternalName>.events
    <ExternalName>.layout
```

No per-external subfolder is used. The owning `scene.settings` stores the
identity, source URI, and project-wide order for every external event and
layout. The scene association is derived from this ownership; source manifests
must not repeat it. The `.events` and `.layout` files own only their DSL body or
UI layout payload.

### 12.1 Scene-owned external entries

External entries are optional child records in the local-root
`scene.settings` document:

```toml
kind = "scene"
settingsFormatVersion = 3
order = 0
name = "Main"
layout = "game://scenes/Main/Main.layout"
events = "game://scenes/Main/Main.events"

[[externalEventFiles]]
name = "Shared Combat"
order = 0
events = "game://scenes/Main/externals/Shared%20Combat.events"

[[externalLayoutFiles]]
name = "Shared Combat"
order = 0
layout = "game://scenes/Main/externals/Shared%20Combat.layout"
```

`externalEventFiles` and `externalLayoutFiles` independently preserve the
current `externalEvents` and `externalLayouts` container order. Their `order`
values are unique and contiguous from zero across all scene settings, not
within one scene. Names are globally unique within each external kind, and
every referenced URI resolves directly inside the declaring scene's
`externals/` directory with its canonical filename.

`associatedLayout`, `linkedScene`, and `unresolvedScene` are forbidden in these
source records. Composition derives legacy `associatedLayout` from the owning
scene name. Empty, stale, or missing associations are rejected before a source
tree is staged. The retired root `externals/external.settings` file is invalid
in format version 3 and is never parsed or mounted.

### 12.2 External events

An external event sheet is one pure DSL
`scenes/<Scene>/externals/<ExternalName>.events` file. Its `name` and global
order come from the matching `scene.settings` `externalEventFiles` entry, and
its legacy `associatedLayout` is the owning scene:

```events
@comment "Shared events follow." background=[255,230,109] text=[0,0,0]

if collision Player Enemy
do Player.health -= Enemy.damage
```

It maps to a legacy object with `name`, derived `associatedLayout`, and
compiled `events`.

### 12.3 External layouts

An external layout is one layout-only
`scenes/<Scene>/externals/<ExternalName>.layout` TOML file compiled in external
context.
It owns only `instances` and `editionSettings`; its `[[layers]]` records reference
the linked scene's existing layers rather than defining layers.
Its `name` and global order come from the corresponding `scene.settings`
`externalLayoutFiles` entry. The composer derives `associatedLayout` from the
owning scene to match `ExternalLayout::SerializeTo`.

---

## 13. Legacy-tree composition

### 13.1 Composition output

Composition produces an in-memory object equivalent to current project JSON. It does not need to write that object into the project directory.

```text
project.gdevelop
  + resources.settings
  + constants.toml (editor-only placeholder source)
  + scene settings
  + visual scene layouts
  + compiled scene events
  + scene-owned external events/layouts
  + extension settings
  + prefab/behavior settings and layouts
  + compiled function events
        -> legacy-shaped SerializerElement/JS object
        -> gd::Project::UnserializeFrom
        -> current editor and exporter behavior
```

### 13.2 Exact container mapping

| New source                                                                 | Legacy destination                                                                                                          |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `project.gdevelop` ordinary payload                                        | Project root excluding resources, constants, global object definitions, and four split arrays                               |
| Flat root `objects/*.settings`                                             | Project root `objects[]`; each `folder` array produces only the transient editor folder tree                                |
| `resources.settings` local root                                            | Project root `resources` object after removing format-only markers                                                          |
| `constants.toml` direct root                                               | Editor-only Constants object without adding or removing user keys                                                           |
| Each scene `scene.settings` + flat object settings + `.layout` + `.events` | One `layouts[]` item, merging scene settings, object definitions/grouping, visual/editor layout data, and compiled `events` |
| Scene `externalEventFiles` entry + owned external `.events`                | One `externalEvents[]` item; owning scene becomes `associatedLayout`                                                        |
| Scene `externalLayoutFiles` entry + owned external `.layout`               | One `externalLayouts[]` item; owning scene becomes `associatedLayout`                                                       |
| `extension.settings` + children                                            | One `eventsFunctionsExtensions[]` item                                                                                      |
| Physical extension component directories + per-component `order`           | Extension functions, prefabs, and behaviors in deterministic order                                                          |
| `extensions/<E>/functions/<F>/function.settings` + sibling `<F>.events`    | One extension `eventsFunctions[]` entry                                                                                     |
| `prefabs/<P>/prefab.settings` + flat object/function settings + layouts    | Extension `eventsBasedObjects[]`                                                                                            |
| `behaviors/<B>/behavior.settings` + flat function settings                 | Extension `eventsBasedBehaviors[]`                                                                                          |
| Prefab/behavior `functions/<F>/function.settings` + sibling `<F>.events`   | One owner `EventsFunction`; `folder` reconstructs transient editor grouping                                                 |

### 13.3 Two-pass catalog bootstrap

Catalog instruction types and named parameters cannot be compiled safely
without the loaded project's instruction metadata. The loader therefore uses
two logical passes:

1. Discover and parse all TOML settings fragments, compile every layout TOML
   source in its owner context, and resolve every pure `.events` body through
   its owning settings document and path-derived namespace.
2. Build a skeleton legacy tree with scenes, objects, variables, resources
   from `resources.settings`, editor-only constants from `constants.toml`, extension
   declarations, behaviors, prefabs, and function signatures, but empty event
   bodies.
3. Unserialize the skeleton into a temporary project/context and load required platform extensions.
4. Build the closed instruction/expression/function catalog.
5. Parse, validate, and compile every `.events` body.
6. Insert compiled arrays into the final legacy tree.
7. Unserialize the final tree into the editor project.

Instruction statement structure can be parsed before the catalog, but every
type identifier, signature, kind, parameter, and sub-instruction is resolved
and validated after bootstrap. The DSL has no `@exact` fallback.

### 13.4 Unknown data

- Unknown TOML keys in reserved schema tables are diagnostics, not silently ignored.
- Future fields inside a declared compatibility/raw table are preserved.
- Every event/instruction type and field supported by the active serializer
  version must have a typed IfDo representation.
- An unknown, newer, or otherwise unrepresentable event/instruction shape is
  an unsupported-schema error. Migration fails before any new project file is
  committed; `.events` files never embed raw JSON as a fallback.

---

## 14. Editor open flow

### 14.1 Opening `project.gdevelop`

1. Resolve and validate the entry path.
2. Parse `project.gdevelop` and validate its local-root format and project markers.
3. Discover settings fragments at the fixed folder paths, enforce project-root
   containment, bootstrap-parse each fragment, and sort every ordered
   component kind by its locally owned `order` value.
4. Mount all local `.settings` documents by path in the deterministic order
   from section 5.1.2 and strictly merge the transient
   `CombinedProjectSettings` as the authoritative compilation input. Parse
   `constants.toml` separately into the editor-only Constants model.
5. Validate fragment identities, duplicate namespaces/paths, ordering, owner
   relationships, required pairs, and `settingsFormatVersion` for marker-bearing
   component fragments. Validate `constants.toml` by its fixed path, direct-root
   TOML-compatible data, and absence of serializer wrapper/metadata tables.
6. Resolve all authoritative layout/events URIs, then read those sources with
   a bounded concurrency limit.
7. Parse and semantically compile `.layout` files separately using the owning
   scene, prefab/variant, or linked-scene external context.
8. Bootstrap the project catalog.
9. Compile every `.events` file and collect source-mapped diagnostics.
10. Compose the legacy serializer tree.
11. Run the existing project-content validation and `gd::Project::UnserializeFrom` path.
12. Set the project file to the absolute `project.gdevelop` path.
13. Start file watching only after a successful load.

The storage-provider result may continue returning a legacy-shaped `content` object to `MainFrame` initially. This keeps the existing `gd.Serializer.fromJSObject` and project load code unchanged.

### 14.1.1 Desktop document opening

Packaged desktop builds register `.gdevelop` as an editable GDevelop project
document with MIME type `application/x-gdevelop-project`. Double-clicking
`project.gdevelop` routes the selected path through the same local storage
provider and validation flow as File > Open.

Windows and Linux deliver the associated document as the first positional
application argument. macOS delivers Finder document launches through
Electron's `open-file` event. The main process queues macOS document paths
received before application readiness and opens those projects instead of an
unrelated blank window. Later document-open events create project windows
immediately. Each main window retains its own launch arguments so concurrent
document requests cannot overwrite another window's project path.

The file association covers `*.gdevelop`, but the format still requires the
exact canonical basename `project.gdevelop`; another basename is rejected as an
invalid multi-file entry.

### 14.2 Errors

Loading is all-or-nothing. A broken function must not yield a partially loaded project. Diagnostics include:

- Source file and line/column for DSL/TOML syntax errors.
- Manifest chain for missing files.
- Both conflicting paths for normalized path collisions.
- Owner/name mismatch details.
- Project-aware DSL errors such as missing objects, behaviors, resources, or instructions.

### 14.3 External file changes

The editor tracks last-read hashes in `.gdevelop/state.json`.

- A clean in-memory component may auto-reload from disk after parsing and validation.
- A dirty component changed externally creates a three-way conflict; it is never overwritten automatically.
- Changes to settings that affect catalogs trigger dependent `.events` recompilation.
- A parse failure leaves the last valid in-memory component active and surfaces a persistent diagnostic.

---

## 15. Save flow

### 15.1 Dirty-component saves

Only dirty owned files are serialized. Editing
`scenes/Main/Main.events` should not rewrite `scene.settings`, `Main.layout`,
unrelated extensions, or `project.gdevelop`.

| Editor mutation                                                                                       | Source file marked dirty                                         |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Project properties, global object groups, and global variables                                        | `project.gdevelop`                                               |
| A global object definition or its editor-folder grouping                                              | `objects/<Object>.settings` (`folder`)                           |
| Resource entries, origins, metadata, and resource folders                                             | `resources.settings`                                             |
| Editor-only Constants                                                                                 | `constants.toml`                                                 |
| Scene identity, object groups, variables, loading/input/sound/sort settings, and shared behavior data | The scene `scene.settings`                                       |
| A scene object definition, attached behaviors, or editor-folder grouping                              | `scenes/<Scene>/objects/<Object>.settings` (`folder`)            |
| Scene instances, layers, background, and scene-editor canvas/layout state                             | The scene `.layout`                                              |
| Scene events                                                                                          | The scene `.events`                                              |
| Extension metadata, dependencies, variables, and extension order                                      | `extension.settings`                                             |
| Extension-level function metadata/signature                                                           | That function subfolder's `function.settings`                    |
| Extension function event body                                                                         | That function subfolder's `<Function>.events`                    |
| Prefab declaration, flat property descriptors, groups, variables, and variants                        | `prefab.settings`                                                |
| A default/variant prefab child object definition, attached behaviors, or editor-folder grouping       | The corresponding flat prefab object `.settings` file (`folder`) |
| Prefab default or variant instances, layers, spatial bounds, and editor layout state                  | The corresponding prefab `.layout`                               |
| Prefab function metadata/signature or function-folder grouping                                        | Its flat `functions/<Function>/function.settings` (`folder`)     |
| Prefab function event body                                                                            | The sibling `<Function>.events`                                  |
| Behavior declaration, flat property descriptors, and variables                                        | `behavior.settings`                                              |
| Behavior function metadata/signature or function-folder grouping                                      | Its flat `functions/<Function>/function.settings` (`folder`)     |
| Behavior function event body                                                                          | The sibling `<Function>.events`                                  |
| External event/layout identity, owning scene, source URI, and global order                            | The owning `scene.settings` entry                                |
| External event body                                                                                   | Its `.events`                                                    |
| External layout instances/editor layout data                                                          | Its `.layout`                                                    |

A function metadata/signature edit rewrites only its owning `.settings` file
unless a rename also changes the subfolder or `.events` filename. The existing
pure event body is revalidated against the new signature but is never rewritten
merely to duplicate configuration.

The writer:

1. Projects each dirty mounted namespace from the editor model back to its one
   local-root document and serializes that component canonically in memory.
2. Parses/compiles the generated text again as a self-check.
3. Writes a sibling temporary file.
4. Flushes the file and, where supported, its directory entry.
5. Atomically replaces the target.
6. Regenerates the AI authoring catalogs under `.gdevelop/` from the
   loaded project and installed platform metadata:
   `.gdevelop/instructions-catalog.json` and
   `.gdevelop/settings-catalog.json`. The instruction catalog contains actions,
   conditions, expressions, and function signatures. The settings catalog
   contains file ownership schemas and registered object/behavior/effect
   metadata. Every settings `fileKinds` entry contains a complete `schema`
   whose `rootFields` describe root scalars and whose recursive `childTables`
   describe canonical TOML headers, record fields, dynamic-key rules, and
   empty forms; `commonFields` remains only a compact search summary. The
   settings catalog also contains `layoutTables`, `layoutContexts`, and each
   layout's resolvable objects, attached behaviors, and layers.
   Every registered `objectTypes[]` entry contains public generic-editor
   `properties` and a recursive `schema` for its serialized configuration.
   The schema is built from the type's default serializer, populated public
   repeated records, and same-type objects in the project, so object settings
   can describe nested records such as
   `[[content.sharedAnimationModelResources]]` without requiring an existing
   sibling object as a template. Unknown legacy or private serializer fields
   are still preserved.
   Instruction enumeration covers the non-deprecated authoring surface. It
   excludes editor-hidden compatibility instructions, instructions with deprecation
   messages, and expressions that are hidden, marked deprecated, or carry a
   deprecation message.
   The lean JSON catalogs keep only authoring metadata and write one compact
   catalog entry per line for targeted `rg` searches. UI icons, help paths,
   derived parameter templates, repeated scope labels, per-entry `kind`, and
   parameter `index` fields already implied by their parent arrays are
   excluded. The catalogs are deterministically ordered and written only after
   source verification succeeds.
7. Regenerates `.gdevelop/runtime-api.d.ts` and
   `.gdevelop/project-api.d.ts`, then type-checks JavaScript event blocks
   against their exact scene/function contexts. Syntax errors always block;
   `strict=true` blocks also reject unknown/private APIs, stale project
   literals, nullability errors, bad argument types, and forbidden globals.
   Existing non-strict compatibility blocks preserve semantic issues as
   warnings. No JavaScript executes during validation.
8. Regenerates `.gdevelop/deprecated-instructions-catalog.json` alongside the
   normal instruction catalog. It stores only deprecated/hidden compatibility
   entries plus inferred semantic signatures for removed instructions found in
   an imported project. Serialization and loading merge both catalogs in memory
   for lossless legacy conversion. AI authoring uses only the filtered
   `.gdevelop/instructions-catalog.json`; the deprecated catalog may be read
   only to understand or minimally edit deprecated instructions already found
   in a legacy project, never to construct new events.
9. Writes the equivalent composed legacy project to `.gdevelop/game.json` as
   an ignored compatibility snapshot.
10. Updates ignored state hashes.

The generated authoring and deprecated compatibility catalogs share one
named-instruction contract.
Every instruction uses its exact catalog type and each parameter's exact
`dslName`; catalog format version 2 assigns every non-code-only parameter a
semantic `valueKind`. Direct strings represent text and names/references,
numbers and booleans use native literals, and calculated text or numbers use
`expr(...)`. Code-only parameters are omitted. The generated catalog contains
project-specific data only, with no embedded authoring or encoding prose. The
DSL does not hardcode instruction aliases. This lets an AI edit `.events`
directly without MCP instruction-discovery or event-writing tools. The loader
merges the two instruction catalogs to resolve all existing named forms.
Blank migrated operands are omitted and reconstructed as blank positions.
Missing current entries produce diagnostics; removed imported instructions are
isolated to deterministic inferred signatures in the deprecated catalog rather
than guessed positional source arrays.

AI integrations treat the project files as the authoring API. MCP exposure is
limited to local project opening, editor-state queries, synchronization, and
preview/runtime debugging; it does not expose project mutation, event
authoring, generic editor-call, command, or save tools.

### 15.2 Multi-file transactions

Rename, add/remove, migration, and refactors may touch many files. They use a journal under `.gdevelop/transactions/<id>/`:

1. Record old paths/hashes and intended new paths.
2. Stage all new content.
3. Verify every staged file.
4. Move content files into place.
5. Replace owning settings fragments.
6. Replace `project.gdevelop` last when root project configuration changes.
7. Mark the journal committed.
8. Remove only obsolete files previously tracked as owned editor sources.

On next open, an incomplete transaction is either completed from verified staging data or rolled back from the journal. The writer never recursively empties `scenes/` or `extensions/`; unrecognized user files are preserved.

### 15.3 Autosave

Autosave does not rewrite `.gdevelop/game.json`; that compatibility snapshot is
owned by normal Save/Save As. Recommended autosave behavior:

- Store per-component recovery snapshots under `.gdevelop/autosave/<transaction>/`.
- Include a small recovery manifest identifying the base hashes.
- Restore only after user confirmation when disk content diverged.

An implementation may initially store a temporary composed JSON autosave in the OS application-data/cache directory, but not as the editable project source and not in a path likely to be committed.

---

## 16. Automatic legacy conversion

### 16.1 Inputs

The importer accepts:

- A normal single legacy `.json`/`.gdg.json` project.
- An existing folder project whose root JSON contains `__REFERENCE_TO_SPLIT_OBJECT` references.
- Older GDevelop JSON supported by current inline `UnserializeFrom` compatibility branches.

Existing split references are fully unsplit before conversion.

### 16.2 One-time migration algorithm

When a legacy project is opened and no associated `project.gdevelop` exists:

1. Read and retain the original JSON tree and source hash.
2. Unsplit existing folder-project references.
3. Verify that the file is a project, not an extension or unrelated JSON.
4. Preflight every original event type and field against the versioned DSL
   coverage manifest before an existing reader can substitute an unknown event.
5. Load it with the current platform and existing compatibility branches.
6. Build the project catalog and verify that every original instruction,
   variable value, and metadata value is covered by typed IfDo. Stop with an
   unsupported-schema diagnostic before staging files if any construct is not.
7. Canonically reserialize known data to obtain the normalized current schema.
8. Split the normalized tree according to this specification, including a
   `scene.settings`/visual `.layout`/`.events` trio for every scene. Require
   every external's legacy `associatedLayout` to name an existing scene, place
   its source below that scene's `externals/` directory, and add the
   corresponding entry to that `scene.settings`. Stop before staging if any
   association is empty or stale.
9. Decompile known event arrays to IfDo with source maps.
10. Stage all new files and run a full new-source -> legacy-tree -> `gd::Project` verification load.
11. Compare a canonical legacy serialization of the verified project against the normalized source project, allowing only documented normalization differences.
12. Commit the new tree transactionally.
13. Leave the original legacy JSON byte-for-byte unchanged.
14. Switch editor metadata and recent-project history to `project.gdevelop`.

No user edit is accepted into the newly loaded project until step 12 succeeds.

### 16.3 Migration marker

The new entry records import provenance:

```toml
[migration]
source = "game://game.json"
sourceSha256 = "..."
importedAt = "2026-07-11T10:30:00Z"
importerVersion = 1
```

This metadata does not make the JSON an active source.

### 16.4 Reopening the legacy file

- If its hash matches an existing migration marker, the editor redirects to `project.gdevelop`.
- If the legacy file changed after migration, the editor must not overwrite the new project. It reports two diverged sources and offers an explicit import-as-new or continue-with-new-project decision.
- If conversion failed, no entry file is committed and the legacy file remains usable through the old reader.

### 16.5 Legacy export/save-as

Writing a user-selected legacy JSON outside `.gdevelop/` is an explicit
compatibility export, not normal Save. It composes current sources, validates
them, and writes the selected `.json`. The editor continues tracking
`project.gdevelop`; the ignored `.gdevelop/game.json` snapshot is separate.

### 16.6 Official extension import boundary

Extensions distributed by the official GDevelop extension registry/repository
remain legacy JSON interchange artifacts. AI clients must not translate these
files manually. The editor exposes the narrow MCP tool `import_extension` with
an exact registry `extension_name`. The tool must:

1. Resolve and download the official serialized extension with the native
   extension-store service.
2. Resolve and install required extension dependencies through the same native
   installation path.
3. Load the serialized extensions through the current
   `Project::UnserializeAndInsertExtensionsFrom` model path so compatibility
   logic and declaration ordering are preserved.
4. Mark the project changed and immediately await a normal multi-file save.
5. Read the saved multi-file source tree back from disk and fail the MCP call
   if any expected generated extension source is absent.
6. Return the verified `game://extensions/...` source paths for the requested
   extension and every imported dependency.

This is a conversion transaction, not a general MCP authoring surface. Once it
succeeds, `.settings`, `.layout`, and `.events` are the editable source of truth;
the AI edits those files directly and uses `reload_project` before preview. A
failed import must not be replaced with a partial hand-authored conversion.

---

## 17. Preview and export

### 17.1 Normal editor preview

The editor already holds a `gd::Project` built from the source tree. Existing preview launchers and `gdjs::Exporter::SerializeProjectData` use that object unchanged.

If preview is configured to reload the saved project from disk, the storage provider first composes `project.gdevelop` exactly as the normal open flow does, then creates the preview project through the existing unserializer.

### 17.2 Export

Export uses this boundary:

```text
new source files
  -> validate and compile
  -> compose current legacy serializer tree / gd::Project
  -> existing project stripper and exporter
  -> existing runtime `data.js` / project data
```

The GDJS runtime receives the same serialized runtime project data as before.
It reads neither settings TOML nor `.layout`/`.events` source DSL.

### 17.3 Generated legacy JSON

Most current preview/export code accepts a `gd::Project`, so physical JSON is
unnecessary. The editor nevertheless regenerates `.gdevelop/game.json` after a
successful multi-file save. When a headless tool or external exporter requires
a project filename:

1. Ensure `.gdevelop/game.json` matches the current composed project.
2. Set resource-base resolution to the real project root.
3. Pass the generated path only to that compatibility boundary.

Generated legacy JSON must stay under `.gdevelop/`. It must not be written
beside `project.gdevelop`, watched as source, added to recent projects, or
committed to Git.

---

## 18. Rename, move, and delete behavior

### 18.1 Rename

A semantic rename updates:

- The owning content name.
- The owning settings namespace name.
- All project/event references using existing refactoring tools.
- Function settings and referenced `.events` filenames.
- Optionally the suggested path, when the user asks to rename files too.

Content rename and path rename are distinct. Keeping an old path after a display-name rename is valid.

Changing an external's associated scene moves its source between scene-owned
`externals/` directories and moves its manifest record between the two
`scene.settings` documents in one transaction. Renaming an external source
updates its scene manifest entry, filename, and `game://` URI transactionally.

### 18.2 Delete

Delete computes references first. After confirmation, it removes only the
component's fixed-path settings fragment and files exclusively owned by that
component. Shared resources and unrecognized files are not deleted. Deleting a
scene requires deleting or moving every external source and manifest entry it
owns in the same confirmed transaction.

### 18.3 Move between folders/extensions

Moving a function or entity changes owner identity and may change generated instruction types. The editor must use whole-project refactoring and recompile all dependents in one transaction.

---

## 19. Git and merge behavior

- Canonical output avoids timestamps and random formatting changes in source files.
- `project.gdevelop` does not change when scenes, extensions, functions,
  prefabs, behaviors, resources, or constants values are added, removed,
  reordered, renamed, or edited; each component owns that configuration
  locally.
- Function bodies, scene events, and layouts produce isolated diffs.
- Stable paths allow Git rename detection.
- Arrays preserve semantic order; writers must not reorder merely to reduce diff size.
- Merge conflict markers are syntax errors with clear diagnostics.
- `.gdevelop/`, generated compatibility JSON, transaction staging, and autosave
  data should be ignored.

Recommended `.gitignore` entries:

```gitignore
.gdevelop/
```

The original legacy JSON retained after migration should be intentionally removed or archived by the user after the new project is verified; the migration process does not delete it automatically.

---

## 20. Security and resource limits

The loader must enforce:

- Project-root path containment after resolving symlinks.
- Maximum manifest depth and file count.
- Maximum TOML, DSL, raw JSON block, and composed project sizes.
- Maximum event depth and instruction nesting.
- Duplicate-key rejection in TOML.
- No execution of JavaScript during parsing/validation.
- No network fetch merely because a source file references a URL.
- Bounded parallel reads and compilation.
- Cancellation for open, migration, preview reload, and export.

Raw legacy blocks are data. They are never evaluated as code by the source loader.

---

## 21. Implementation plan

### Phase 1: serialization adapters

- Add a maintained TOML 1.0 parser/writer dependency; none is currently declared in the editor packages.
- Implement canonical JSON-subtree <-> TOML projection and `rawJson` overrides.
- Implement fixed-path settings discovery, path validation, local ordering,
  and component ownership types.
- Implement the `gd::Layout` field partition that writes scene object
  definitions and their behaviors plus non-layout configuration to
  `scene.settings`, while `.layout` receives only instances, layers,
  background, and editor/spatial layout data.
- Add a legacy composer producing the current JS object/`SerializerElement` shape.

### Phase 2: events compiler/decompiler

- Implement the IfDo parser, formatter, semantic IR, compiler, and decompiler from the related spec.
- Expose exact catalog instruction types and stable named parameters.
- Implement typed syntax for every current persisted event/field and the exact
  catalog instruction form before enabling automatic migration.

### Phase 3: local storage integration

- Add `project.gdevelop` to the local file picker and project-location logic.
- Register `.gdevelop` with packaged desktop builds and route Windows/Linux
  positional document paths plus macOS `open-file` events into the local
  opener.
- Route open/save/autosave/file watching through the multi-file provider.
- Keep `MainFrame` consuming a composed content object initially.
- Add dirty-component tracking and transactional writes.

### Phase 4: migration

- Support single and existing split legacy JSON.
- Add provenance markers, redirect behavior, verification, and rollback.
- Run corpus conversion tests across repository game fixtures.

### Phase 5: preview/export and non-local providers

- Route reload-from-disk preview through the composer.
- Route path-only headless tools through the generated `.gdevelop/game.json`
  compatibility snapshot.
- Define capability negotiation for cloud/browser providers. A provider must support an atomic multi-artifact project or an archive/virtual-filesystem equivalent before it can claim native support.

The storage-provider interface exposes this negotiation as
`multiFileProjectSupport = "native" | "archive" | "none"`. The local provider
declares `native`; providers that omit the field are treated as `none` and keep
their existing compatibility serialization until they implement an atomic
multi-artifact or archive backend.

---

## 22. Verification requirements

### 22.1 Round-trip tests

For every repository project fixture:

```text
legacy JSON
  -> current compatibility load
  -> canonical normalized legacy tree A
  -> new source tree
  -> composed legacy tree B
  -> current compatibility load
  -> canonical legacy tree C
```

`A`, `B`, and `C` must be structurally equal except for a documented compatibility-normalization allowlist. Runtime export output must remain equivalent.

### 22.2 Required test categories

- Every persisted event type and common metadata flag.
- Exhaustive typed DSL coverage for every event/instruction serializer field,
  recursive variable value, and supported platform event adapter; `.events`
  parsing rejects raw event or instruction JSON fallback constructs.
- Scene settings/object/layout ownership: every object definition and its
  complete behavior/variable/effect data is extracted to one recursive
  `objects/<Object>.settings` with a `folder` array; `.layout` contains only allowed
  instances/layers/editor-spatial fields; forbidden cross-file fields are
  rejected; and the merged legacy layout is structurally equivalent.
- Nested instruction `subInstructions`, OR/AND/NOT, inverted, awaited, and disabled instructions.
- Local variable types, UUIDs, enums, arrays, structures, and editor folded state.
- Async functions, lifecycle functions, `ExpressionAndCondition`, and `ActionWithOperator`.
- Extension and owner-function `function.settings` metadata, recursive physical
  folder mapping, matching sibling `.events` filename, missing/unlisted files,
  owner-identity validation, and the absence of every legacy
  `*FolderStructure` field.
- Extension dependencies and cross-extension prefab/behavior references.
- Prefab default and additional variants.
- Scene-owned external events and layouts, including matching basenames,
  independent files, global container ordering across scene manifests, derived
  scene association, rejection of empty/stale associations and link metadata,
  rejection of retired root `external.settings`, and owner-directory path
  validation.
- Legacy French/XML field fallbacks and version compatibility branches.
- Existing folder-project split references.
- Unicode, reserved filenames, case-fold collisions, and traversal attempts.
- Parsing each `.settings` document, mounting it from its canonical path, and
  strictly merging the mounted trees produces the expected namespace tree
  without duplicate ownership.
- No settings fragment embeds another fragment or uses an include directive;
  compilation creates `CombinedProjectSettings` only in memory, and saving a
  child setting rewrites only its owning file.
- Every managed source reference in settings uses canonical `game://` form;
  relative paths, backslashes, malformed encodings, `.`/`..`, drive/UNC paths,
  normalized collisions, and root/symlink escapes are rejected.
- Interrupted writes and recovery at each transaction step.
- External edits with clean and dirty editor state.
- Very large projects and bounded-memory composition.
- Preview, hot reload, reload-from-disk preview, local export, and headless export.

### 22.3 No-silent-fallback rule

Tests must fail if a converter drops a key, changes array order, replaces an unknown event with an empty event, guesses an instruction, or saves back to the legacy source without an explicit compatibility export.

---

## 23. Non-goals for version 3

- Changing GDJS runtime project data.
- Replacing `gd::Project` or existing C++ serializers.
- Making the runtime load TOML or DSL.
- Splitting every resource, layer, or instance into an individual file.
- Embedding binary assets in TOML.
- Automatically merging simultaneous semantic edits.
- Removing current legacy compatibility branches.
- Treating filenames as stable entity IDs.

Future versions may split resources further, add stable entity IDs, or
introduce a direct typed source model after the compatibility format has
proven reliable.

## Version 4 scene lifecycle function sources

Version 4 replaces the single scene/External Events body location with the
same physical function shape used by prefab functions:

```text
scenes/<Scene>/functions/<Lifecycle>/function.settings
scenes/<Scene>/functions/<Lifecycle>/<Lifecycle>.events
scenes/<Scene>/externals/<External>/external-events.settings
scenes/<Scene>/externals/<External>/functions/<Lifecycle>/function.settings
scenes/<Scene>/externals/<External>/functions/<Lifecycle>/<Lifecycle>.events
```

`<Lifecycle>` is one of `sceneLoad`, `sceneSignal`, `sceneUpdate`, or
`sceneUnload`. The update directory is always required. Other lifecycle
directories are omitted while their bodies are empty. A version-3 scene or
external `.events` body migrates byte-equivalently to `sceneUpdate`; the other
three functions start empty. The version marker and every affected owner are
committed transactionally, and version-3 readers reject version 4 before
writing.

---

## 24. Final contract

A conforming implementation must satisfy all of the following:

1. Opening `project.gdevelop` discovers `resources.settings`,
   `constants.toml`, and the other fixed settings fragments, then reconstructs
   a complete current project without runtime changes.
2. Opening legacy JSON converts once, commits atomically, preserves the original, and switches the editor to the new entry.
3. Normal Save writes new-format source files plus ignored generated artifacts
   under `.gdevelop/`; it never recreates an editable root legacy JSON.
4. `resources.settings` exclusively owns the project resource registry and is
   combined without a reference from `project.gdevelop`.
5. `constants.toml` exclusively owns direct-root, editor-only Constants,
   has no format metadata or wrapper table, and is loaded separately without a
   reference from or merge into `project.gdevelop`. Generated compatibility
   JSON and runtime exports omit the Constants map.
6. Every scene has its own subfolder with `scene.settings`, a placement-focused
   layout TOML file, flat object settings, and fixed lifecycle function
   directories. Object definitions and their behaviors belong to individual
   object settings; instances and layers belong to the layout.
7. Each scene may own an `externals/` directory containing External Events
   owner directories and external-layout sources. An External Events owner has
   `external-events.settings` plus fixed lifecycle function directories;
   association is derived from its physical scene owner.
8. Every extension-level function has a
   `functions/<Function>/function.settings` and matching
   `<Function>.events`. Every prefab and behavior function similarly has
   `functions/<Function>/function.settings` with a `folder` array and a matching
   sibling `<Function>.events`; the `folder` property replaces logical editor
   function trees.
9. Every global, scene, default-prefab, and variant-prefab object definition
   has one `<Object>.settings` file under its owner's physical `objects/`
   directory. Each file's `folder` property replaces logical object-folder
   trees.
10. Preview/export composes current legacy data only at the compatibility boundary.
11. Every supported serializer event and instruction shape has a typed IfDo
    representation; unknown or newer shapes stop migration before any source is
    committed.
12. Paths, ordering, formatting, and writes are deterministic.
13. No managed save deletes unrecognized user files.
14. A full new-source -> legacy -> current-project verification succeeds before migration is considered complete.
15. All local-root `.settings` documents mount and merge conflict-free into one
    authoritative in-memory settings tree, and every managed source reference
    uses a project-root `game://` URI rather than a relative path.
16. Settings remain separate files on disk with no include/embedding syntax;
    the editor creates the combined project-settings document only in memory
    for validation and compilation, then saves each changed namespace back to
    its owning fragment.
17. Every normal multi-file Save/Save As regenerates `.gdevelop/game.json` from
    the verified composed legacy serializer tree.
18. Prefab and behavior property descriptors are flat ordered arrays. The
    format neither serializes nor reconstructs property folder structures.
19. Scene and External Events functions use
    `functions/<Lifecycle>/function.settings` with a matching sibling
    `<Lifecycle>.events`; `sceneUpdate` is required and empty load, signal, and
    unload functions do not create managed files.
