# GDevelop Multi-file Project Format

## TOML project/layout/settings files and IfDo event source files

**Status:** Version 1.0 implemented format contract
**Entry file:** `project.settings`
**Text encoding:** UTF-8 without BOM
**Line endings:** LF when written by GDevelop
**Related specification:** [gdevelop-events-dsl-spec.md](gdevelop-events-dsl-spec.md)

---

## Contents

1. [Purpose](#1-purpose)
2. [Design principles](#2-design-principles)
3. [Codebase compatibility basis](#3-codebase-compatibility-basis)
4. [Canonical directory layout](#4-canonical-directory-layout)
5. [Common file rules](#5-common-file-rules)
6. [`project.settings`](#6-projectsettings)
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
23. [Non-goals for version 1](#23-non-goals-for-version-1)
24. [Final contract](#24-final-contract)

---

## 1. Purpose

This specification replaces the single large GDevelop project JSON document with a source-oriented directory tree:

- TOML for project, scene settings, visual scene layout, extension, prefab,
  and behavior data.
- One `.events` source file for every scene event sheet and every events-based function.
- Stable, explicit file references so a scene, function, behavior, or prefab can be reviewed and changed independently.
- A compatibility adapter that reconstructs the current legacy serializer tree in memory. The existing `gd::Project`, preview, export, code generation, and runtime paths continue to consume the current model.

The format is intended to improve AI editing, human review, merge behavior, and Git history without requiring a runtime-format migration.

This document is a design and implementation contract. The repository now
contains the TOML multi-file adapter in
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
5. **Names are data, paths are references.** A scene or function name is read from its content/manifest and is never inferred only from a filename.
6. **Ordering is explicit.** Array order, scene order, function order, folder order, layer order, object order, and event order are semantically preserved.
7. **Writes are deterministic and transactional.** Formatting, key order, path spelling, and newline behavior are canonical.
8. **Legacy import is one-way by default.** The original JSON is retained as an unchanged backup; it is not updated after successful conversion.
9. **Preview and export never treat the source tree as runtime data.** They receive a temporary legacy serializer tree or, only when a path is required, a temporary JSON file outside the project directory.
10. **`.layout` files are visual/UI-focused.** Scene identity, variables,
    runtime/loading/input settings, shared behavior data, and events belong in
    `scene.settings` or `.events`; `.layout` retains only visual/editor data as
    far as current polymorphic object serialization safely allows.
11. **Settings are append-safe TOML fragments.** All `.settings` files can be
    concatenated in manifest order and parsed as one conflict-free in-memory
    TOML document.
12. **Managed references are project-root URIs.** Settings refer to managed
    settings, layouts, and events with canonical `game://...` URIs rooted at
    the directory containing `project.settings`, never relative paths.
13. **Settings stay separate on disk.** A settings file never includes or
    embeds another settings file. The editor creates the combined settings
    document only transiently during loading/compilation and writes changes
    back only to the fragment that owns them.

---

## 3. Codebase compatibility basis

The design follows these existing implementation boundaries:

| Concern | Current implementation | Consequence for the new format |
|---|---|---|
| Complete project serialization | `gd::Project::SerializeTo` and `UnserializeFrom` in `Core/GDCore/Project/Project.cpp` | The composer must produce the same root serializer fields. |
| Scene data | `gd::Layout::SerializeTo` and `UnserializeFrom` in `Core/GDCore/Project/Layout.cpp` | The adapter splits one current layout subtree into `scene.settings`, a visual `.layout`, and `.events`, then merges them before current unserialization. |
| Event data | `EventsListSerialization` and built-in event classes in `Core/GDCore/Events` | `.events` compilation must emit the exact event and instruction arrays described in the DSL spec. |
| Extensions | `EventsFunctionsExtension` and `Project::UnserializeAndInsertExtensionsFrom` | Complete extension declarations must be available before implementations; the current three-pass load order must be retained. |
| Functions | `EventsFunction::SerializeTo` and `UnserializeFrom` | Function metadata is stored in TOML owner/function settings; only the `events` child is compiled from the pure DSL `.events` body. |
| Prefabs/custom objects | `EventsBasedObject`, `EventsBasedObjectVariant`, and `AbstractEventsBasedEntity` | The default variant is the main prefab `.layout`; additional variants need separate optional layout files. |
| Behaviors | `EventsBasedBehavior` and `AbstractEventsBasedEntity` | `behavior.settings` owns behavior metadata and each method owns one `.events` file. |
| Existing folder projects | `LocalProjectWriter`, `LocalProjectOpener`, and `ObjectSplitter` | Existing split JSON projects are legacy input. Their reference tree must be unsplit before migration. |
| Editor open path | `ProjectsStorage` to `MainFrame`, then `gd.Serializer.fromJSObject` | A new storage adapter should return a composed legacy-shaped object to minimize editor changes. |
| Preview/export | `gdjs::Exporter`, `ExporterHelper`, and preview launchers | Existing exporters can use the composed/in-memory `gd::Project`; no runtime code needs to parse TOML or DSL. |

The current optional folder-project mode is not this format. It still writes JSON partials, leaves events embedded, writes a legacy root object containing references, and deletes/recreates split directory contents during save.

---

## 4. Canonical directory layout

```text
MyGame/
  project.settings

  scenes/
    Main/
      scene.settings
      Main.layout
      Main.events
    GameOver/
      scene.settings
      GameOver.layout
      GameOver.events

  externals/
    external.settings
    Shared%20Combat.events
    Shared%20Combat.layout

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
          OnCreated.events
          TakeDamage.events
          variants/
            Armored.layout

      behaviors/
        Health/
          behavior.settings
          OnCreated.events
          TakeDamage.events

  .gdevelop/
    state.json
    transactions/
```

Only `project.settings` and paths referenced from it or from a referenced settings file are managed project source. `.gdevelop/` is editor state and should normally be ignored by Git.

The root `externals/` directory is a sibling of `scenes/` and `extensions/`.
It contains one `external.settings` manifest plus all external event sheets and
external layouts. A base name may have an `.events` file, a `.layout` file, or
both; the two files remain independent unless both are listed in
`external.settings`.

### 4.1 Required files

- One `project.settings` at the project root.
- Exactly one scene subfolder containing `scene.settings`, one `.layout`, and
  one `.events` file for every scene.
- Exactly one `extension.settings` per project extension.
- Exactly one subfolder per extension-level function. Every function subfolder
  contains exactly one `function.settings` and one matching
  `<FunctionName>.events` file.
- Exactly one `prefab.settings`, one default `<PrefabName>.layout`, and one `.events` file per prefab function.
- Exactly one `behavior.settings` and one `.events` file per behavior function.

### 4.2 Optional files

- Additional prefab variant layouts under `variants/`.
- An `externals/` directory containing exactly one `external.settings` and any
  referenced external `.events`/`.layout` files when the project uses those
  features.
- `.gdevelop/state.json` for local hashes, last-seen modification times, and crash recovery. It is not portable project content.

---

## 5. Common file rules

### 5.1 Settings fragments and layout markers

Every `.settings` file is a standalone TOML fragment rooted at a unique,
fully qualified table. It must not emit shared root scalar keys such as
`format = ...` or `formatVersion = ...`, because those keys would collide when
settings files are appended.

Examples of settings-owned namespaces:

```toml
[project]
kind = "project"
settingsFormatVersion = 1

[scenes."Main"]
kind = "scene"
settingsFormatVersion = 1

[externals]
kind = "externals"
settingsFormatVersion = 1

[extensions."Combat"]
kind = "extension"
settingsFormatVersion = 1

[extensions."Combat".functions."CalculateDamage"]
kind = "function"
settingsFormatVersion = 1
```

`.layout` files are not appended to the settings document. They retain root
format markers:

```toml
format = "gdevelop-scene-layout"
formatVersion = 1
```

Allowed layout `format` values in version 1 are:

```text
gdevelop-scene-layout
gdevelop-external-layout
gdevelop-prefab-layout
gdevelop-prefab-variant-layout
```

### 5.1.1 Strict extension ownership

The three source extensions have non-overlapping responsibilities:

| Extension | Allowed content | Forbidden content |
|---|---|---|
| `.settings` | TOML identity, metadata, signatures, variables, manifests, ordering, runtime/editor configuration | IfDo statements and visual placement/layout payloads |
| `.layout` | TOML visual/UI definitions, layers, instances, positions, dimensions, effects, and editor-canvas state | Events, function signatures, runtime logic, and general non-visual settings |
| `.events` | Typed IfDo event statements, DSL comments, metadata annotations, and exact catalog instructions | TOML front matter, settings tables, layout data, raw event/instruction JSON, or legacy project configuration |

The loader rejects a file containing content owned by another extension. It
does not merge duplicated configuration from `.events` or `.layout` files.

`.events` files contain IfDo DSL only. They never contain TOML front matter,
JSON configuration, or duplicated owner/function settings. Their target and
identity come from the referencing `.settings` manifest.

### 5.1.2 Conflict-free settings concatenation

All `.settings` files in a project must be directly composable into one valid
TOML document in memory. The loader concatenates their UTF-8 text, separated
only by a newline, in this deterministic dependency order:

1. `project.settings`.
2. `externals/external.settings`, when referenced by the project.
3. Scene settings in project scene order.
4. Extension settings in project extension order.
5. Each extension's per-function, prefab, and behavior settings in its owner
   manifest order.

The loader may bootstrap-parse `project.settings` and each subsequently reached
manifest-bearing settings fragment only to discover the ordered settings graph.
It then appends the discovered fragments without key rewriting, object merging,
or conflict resolution. The combined text is parsed once as the authoritative
settings document; all bootstrap results are discarded.

The result is an ephemeral in-memory document called
`CombinedProjectSettings` in this specification. Conceptually:

```text
project.settings
  + externals/external.settings
  + every scene.settings
  + every extension.settings
  + every function.settings
  + every prefab.settings
  + every behavior.settings
      -> CombinedProjectSettings
      -> validate and compile project
```

`CombinedProjectSettings` behaves like one large project-settings document for
editor compilation, but it is never a managed source file and is never written
to the project directory.

### 5.1.3 Separate-write rule

Every `.settings` file remains an independent canonical TOML file when stored:

- A settings file must not contain the TOML text or namespace subtree owned by
  another settings file.
- The format has no TOML `include`, import, inheritance, or textual-expansion
  directive for settings.
- Manifest URI fields may identify another settings artifact for discovery,
  ordering, or ownership. Such a URI is a reference, not an include, and does
  not embed the referenced TOML into the referring file.
- Loading and compilation append the fragments in memory; saving performs the
  inverse ownership projection and writes each changed subtree only to its
  owning file.
- Editing `scene.settings`, `function.settings`, or another child fragment does
  not rewrite `project.settings` or its owner manifest unless the edit also
  changes a structural manifest entry, path, identity, or ordering.
- The editor must not materialize a combined `.settings` file for preview,
  export, autosave, or caching. A recovery snapshot may store fragments, but it
  must preserve their ownership boundaries.

Direct concatenation is the only combination operation. There is no recursive
settings-inclusion semantics and no parent-wins/child-wins conflict policy; a
collision is a schema or identity error.

Additional rules for stored fragments and their combined shape:

- Every settings file owns exactly one unique component namespace subtree.
  `project.settings` additionally owns the one reserved `[gdevelop]` format
  table used to bootstrap the combined document.
- A file must not declare or reopen a table owned by another settings file.
- Project manifest arrays use names such as `sceneFiles` and `extensionFiles`;
  the external manifest uses `eventFiles` and `layoutFiles`;
  extension manifests use `functionFiles`, `prefabFiles`, and `behaviorFiles`.
  These names are deliberately distinct from the `scenes`, `extensions`,
  `functions`, `prefabs`, and `behaviors` namespace tables.
- Dynamic names are quoted TOML path segments, so names containing dots do not
  create accidental sub-namespaces.
- Two files resolving to the same namespace are a hard duplicate-identity
  error before compilation.
- Each fragment must parse on its own and as part of the combined document.
- Each fragment ends with one newline; the concatenator may insert one extra
  blank line for diagnostics/readability.
- Source diagnostics retain the byte range and originating filename for every
  appended fragment.

The combined in-memory document has a shape like:

```toml
[gdevelop]
combinedSettingsFormatVersion = 1
entry = "game://project.settings"

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

### 5.2 TOML profile

Writers use TOML 1.0 with these restrictions:

- UTF-8 text and LF endings.
- Double-quoted basic strings for short text.
- Triple-double-quoted multiline strings for multiline text.
- Decimal integers and floats only.
- RFC 3339 dates are not used for semantic project data; timestamps are strings.
- Tables and array-of-tables are emitted in schema order.
- Keys that are not bare TOML keys are quoted.
- Every file ends with exactly one newline.
- NaN and infinity are forbidden because legacy JSON cannot represent them.

Within component payload tables, field names intentionally match the current JSON serializer names (`objectsGroups`, `eventsFunctionsFolderStructure`, `loopIndexVariable`, and so on). This reduces adapter code and gives a direct mapping to existing `SerializeTo`/`UnserializeFrom` methods.

### 5.3 JSON-to-TOML projection

For payloads produced by the current serializer:

| Legacy JSON value | TOML representation |
|---|---|
| Object | Table or inline table |
| Array of objects | Array of tables |
| Array of one scalar type | TOML array |
| String | TOML string |
| Boolean | TOML boolean |
| Number | TOML integer when integral and safe, otherwise float |
| Empty object | Inline table `{}` when a typed table would otherwise disappear |
| Empty array | `[]` |

The current project serializers normally do not emit JSON `null` or heterogeneous scalar arrays. Arbitrary JSON such as `globalConfig`, or a future/extension value that TOML cannot represent without changing type, is stored as canonical JSON text and reapplied by JSON Pointer:

```toml
[project.rawJson]
"/globalConfig" = '''{"arbitrary":null,"mixed":[1,"two"]}'''
```

Rules for `rawJson`:

- The table is nested below the file's owned namespace, for example
  `[project.rawJson]` or `[scenes."Main".rawJson]`, so it remains append-safe.
- Keys are RFC 6901 JSON Pointers relative to the component's legacy payload.
- Values are canonical JSON text.
- Raw overrides are applied after the ordinary TOML projection is built.
- A pointer must not overlap another pointer in the same file.
- A writer should use this only when the ordinary projection is not lossless.
- Unknown raw pointers are preserved, not discarded.

### 5.4 Canonical ordering

Order-sensitive data remains arrays/arrays-of-tables. Maps whose order is not semantic are written by Unicode code-point order. The canonical writer must not sort:

- Scenes, external events, external layouts, or extensions.
- Objects, object groups, layers, instances, resources, or variables.
- Functions, properties, folders, variants, parameters, conditions, actions, sub-instructions, or events.

### 5.5 File identity and path safety

Manifest content is authoritative. The loader verifies that the name in a referenced file matches the manifest owner/name.

Suggested filenames are generated as follows:

1. Normalize the display name to Unicode NFC.
2. Keep ASCII letters, digits, `_`, `-`, and `.`.
3. Percent-encode every other UTF-8 byte with uppercase hex.
4. Encode leading/trailing spaces and trailing dots.
5. Escape `.` and `..` and Windows device names such as `CON`, `NUL`, and `COM1`.
6. Compare paths case-insensitively and with Unicode normalization. On collision, append `~` plus the first eight hex characters of SHA-256 of the unescaped name.

`externals` is a reserved project-root directory alongside `scenes` and
`extensions`. It is owned by `external.settings` and must not be reused for
another managed component kind.

The generated path is a suggestion. Once recorded in a manifest, a path remains stable until an explicit rename/move operation. This avoids path churn when display names change.

### 5.6 `game://` project-root references

Every managed source-file reference written in a `.settings` file uses a
canonical `game://` URI. Relative filesystem paths are forbidden. This applies
to references to other `.settings` files and to all `.layout` and `.events`
files, for example:

```toml
settings = "game://scenes/Main/scene.settings"
layout = "game://scenes/Main/Main.layout"
events = "game://scenes/Main/Main.events"
```

`game://` identifies the root directory containing `project.settings`. It is a
project-source URI scheme, not a network URL and not an operating-system path.
The text after `game://` is a root-relative project path.

Canonical and safety rules:

- Use `/` separators, Unicode NFC, and uppercase hexadecimal UTF-8
  percent-encoding where encoding is required.
- Do not use an authority, query, fragment, empty segment, `.` segment, or
  `..` segment.
- A reference must not contain an absolute path, drive prefix, UNC prefix, or
  backslash.
- The loader percent-decodes and normalizes the path, resolves it from the
  project root, follows the platform's safe canonicalization rules, and rejects
  traversal or symlink escape outside that root.
- Normalized case/Unicode collisions and duplicate resolved paths are errors.
- Writers preserve an already-recorded canonical URI until an explicit move or
  rename operation changes it.

Examples include `game://project.settings`,
`game://externals/Shared%20Combat.events`, and
`game://extensions/Combat/functions/CalculateDamage/function.settings`.

Version 1 does not automatically rewrite legacy runtime asset/resource paths
to `game://`; this rule governs managed new-format source references stored in
settings.

---

## 6. `project.settings`

### 6.1 Ownership

The entry file owns the current project root except these split containers:

- `layouts`
- `externalEvents`
- `externalLayouts`
- `eventsFunctionsExtensions`

It therefore owns project properties, versions, platforms, resources, global objects and object folders/groups, global variables, first/preview scene selection, and global configuration.

### 6.2 Example

```toml
[gdevelop]
combinedSettingsFormatVersion = 1
eventsDslVersion = "1.3"
entry = "game://project.settings"

[project]
kind = "project"
settingsFormatVersion = 1
externalSettings = "game://externals/external.settings"
firstLayout = "Main"
previewLayout = "Main"
initialGDVersion = ""

[project.gdVersion]
major = 5
minor = 6
build = 0
revision = 0

[project.properties]
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

[[project.sceneFiles]]
name = "Main"
settings = "game://scenes/Main/scene.settings"
layout = "game://scenes/Main/Main.layout"
events = "game://scenes/Main/Main.events"

[[project.extensionFiles]]
name = "Combat"
settings = "game://extensions/Combat/extension.settings"
```

Real files also contain the projected `resources`, `objects`, `objectsFolderStructure`, `objectsGroups`, and `variables` payloads when non-empty.

### 6.3 Manifest rules

- `sceneFiles` and `extensionFiles` preserve current project order.
- Names are unique within their current legacy container.
- A scene entry always references one settings, one layout, and one events
  file in the same scene subfolder.
- Every managed file reference is a canonical project-root `game://` URI;
  relative paths are invalid.
- A referenced path occurs only once in the complete project graph.
- `externalSettings`, when present, is exactly
  `game://externals/external.settings`. External names, linked scenes, source
  URIs, and legacy-container ordering are owned by that file.
- `firstLayout` and `previewLayout`, when present, must name a scene.
- The root entry does not store content hashes. Hashes belong in ignored editor state so editing one event file does not force a root-file Git conflict.

### 6.4 Legacy composition

The composer removes format-only fields and creates:

```json
{
  "gdVersion": {},
  "properties": {},
  "resources": [],
  "objects": [],
  "objectsFolderStructure": {},
  "objectsGroups": [],
  "variables": [],
  "globalConfig": {},
  "firstLayout": "Main",
  "previewLayout": "Main",
  "layouts": [],
  "externalEvents": [],
  "eventsFunctionsExtensions": [],
  "externalLayouts": []
}
```

The four split arrays are filled in manifest order: scenes and extensions from
`project.settings`, and both external containers from `external.settings`.

---

## 7. Scene files

Every scene has its own subfolder:

```text
scenes/<Scene>/
  scene.settings
  <Scene>.layout
  <Scene>.events
```

This is a required boundary, not merely a filename convention.

### 7.1 `scene.settings`

`scene.settings` owns scene identity and non-visual configuration extracted
from the current `gd::Layout` serializer object:

```toml
[scenes."Main"]
kind = "scene"
settingsFormatVersion = 1
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

- Scene variables.
- Scene object groups used by events and object picking.
- Behavior shared data used by scene objects.
- Other scene-level runtime, loading, input, sorting, or identity settings
  added to the current serializer in the future.

These fields must not be duplicated in the `.layout` file.

### 7.2 `<Scene>.layout`

The `.layout` file should contain only visual/UI and scene-editor layout data
as far as the current object model permits. It owns what is drawn, arranged,
layered, or displayed in the scene editor—not scene execution logic or general
scene configuration.

```toml
format = "gdevelop-scene-layout"
formatVersion = 1

[layout]
r = 32
v = 32
b = 48

[layout.uiSettings]
# Existing editor settings projection.

[[layout.layers]]
name = ""
visibility = true
isLocked = false

[[layout.objects]]
name = "Player"
type = "Sprite"

[[layout.instances]]
name = "Player"
x = 128.0
y = 256.0
```

The visual layout payload may contain:

- `objects`
- `objectsFolderStructure`
- `instances`
- `layers`
- `uiSettings`
- Background color and other visual editor properties.

Scene object definitions currently combine visual configuration with embedded
object behavior/variable configuration in one polymorphic serialized object.
Version 1 keeps each object intact in `.layout` to avoid invasive changes or
data loss. A later format may split visual object data from object logic after
the core object serializers expose a safe boundary.

The `.layout` file must not contain:

- `events` or event instructions.
- Scene variables.
- Scene loading/unloading, input, title, sound-startup, or sort settings.
- Scene behavior shared data.
- Any field owned by `scene.settings`.

If an owned field appears in both files, loading fails instead of choosing one
copy.

### 7.3 `<Scene>.events`

The events file contains only the scene's IfDo DSL body. `scene.settings` and
the `project.settings` scene manifest supply its identity:

```events
# Initialize the scene.

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

- Manifest scene name, `scene.settings` name, and `.events`/`.layout`
  basenames must match exactly.
- The settings/layout/events trio is indivisible. A missing member is a load
  error.
- All three files must resolve inside the scene subfolder recorded by the
  manifest.
- Scene rename changes all four identities (manifest plus three files) and
  project references in one transaction.

---

## 8. Extension files

### 8.1 `extension.settings`

The settings file owns extension metadata and its child manifests. It mirrors `EventsFunctionsExtension::SerializeTo` except the implementations split into files.

```toml
[extensions."Combat"]
kind = "extension"
settingsFormatVersion = 1
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

[[extensions."Combat".functionFiles]]
name = "CalculateDamage"
settings = "game://extensions/Combat/functions/CalculateDamage/function.settings"

[[extensions."Combat".functionFiles]]
name = "ResetCombat"
settings = "game://extensions/Combat/functions/ResetCombat/function.settings"

[[extensions."Combat".prefabFiles]]
name = "Enemy"
settings = "game://extensions/Combat/prefabs/Enemy/prefab.settings"

[[extensions."Combat".behaviorFiles]]
name = "Health"
settings = "game://extensions/Combat/behaviors/Health/behavior.settings"

[extensions."Combat".eventsFunctionsFolderStructure]
# Projection of the current ordered extension-function folder tree.
```

The settings file also owns, when present:

- `origin`
- `changelog`
- `dependencies`
- `sourceFiles`
- `globalVariables`
- `sceneVariables`
- Extension-level function order and folder structure.
- Explicit prefab and behavior order

It must not embed `eventsFunctions`, `eventsBasedObjects`, or `eventsBasedBehaviors` implementations.

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
[extensions."Combat".functions."CalculateDamage"]
kind = "function"
settingsFormatVersion = 1
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
objectGroups = []
```

Rules:

- `extension.settings` references every function subfolder's settings file and
  owns extension-function order/folder structure.
- The `events` value is a project-root
  `game://extensions/<Extension>/functions/<Function>/<Function>.events` URI,
  never a path relative to `function.settings`.
- The function table owns function/expression type,
  presentation text, flags, ordered parameters, defaults, and object groups.
- The subfolder name, `function.name`, `.events` basename, and
  `extension.settings` manifest name must match exactly.
- Each function subfolder contains one managed `function.settings` and one
  managed `.events` file. Unlisted files are not silently imported.
- The extension name must match the owning `extension.settings` file.

The settings file does not contain event statements. The matching `.events`
file contains only the IfDo DSL body and does not repeat function identity,
signature, parameters, or other TOML configuration.

### 8.3 Extension-level functions

Every `extension.settings` function entry points to one per-function
`function.settings`. That file points to the sibling `<FunctionName>.events`.
The settings own `gd::EventsFunction` metadata and the pure DSL body owns only
the legacy `events` array.

### 8.4 Required load ordering

The loader preserves the current multi-pass extension behavior:

1. Read every `extension.settings`, referenced per-function
   `function.settings`, prefab/behavior settings, and pure DSL body.
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
[extensions."Combat".prefabs."Enemy"]
kind = "prefab"
settingsFormatVersion = 1
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

[[extensions."Combat".prefabs."Enemy".functions]]
name = "onCreated"
events = "game://extensions/Combat/prefabs/Enemy/OnCreated.events"

[[extensions."Combat".prefabs."Enemy".functions]]
name = "TakeDamage"
events = "game://extensions/Combat/prefabs/Enemy/TakeDamage.events"

[[extensions."Combat".prefabs."Enemy".variants]]
name = "Armored"
layout = "game://extensions/Combat/prefabs/Enemy/variants/Armored.layout"
assetStoreAssetId = ""
assetStoreOriginalName = ""
```

Each `[[functions]]` entry uses the same complete function-metadata schema as
an extension-level per-function `function.settings`; the abbreviated example
shows only identity and event path.

It also owns:

- Prefab variables.
- Attached behavior configurations.
- Property descriptors and property folder structure.
- Complete metadata, source order, and function folder structure for every
  listed prefab function; the matching `.events` file owns only its body.
- Variant order.

### 9.2 `<Prefab>.layout`

The default layout maps to the default `EventsBasedObjectVariant` fields:

- `areaMinX`, `areaMinY`, `areaMinZ`
- `areaMaxX`, `areaMaxY`, `areaMaxZ`
- `objects`
- `objectsFolderStructure`
- `objectsGroups`
- `layers`
- `instances`
- `editionSettings`

The layout contains all visual/default-variant settings. `prefab.settings` does not duplicate them.

```toml
format = "gdevelop-prefab-layout"
formatVersion = 1

[layout]
areaMinX = 0
areaMinY = 0
areaMinZ = 0
areaMaxX = 64
areaMaxY = 64
areaMaxZ = 64
```

When composing legacy JSON, the default layout fields are merged into the prefab object at the same level, matching `EventsBasedObject::SerializeTo`.

### 9.3 Variant layouts

Current prefabs may contain `variants`. Version 1 stores each non-default
variant's visual data in `variants/<Variant>.layout` using
`gdevelop-prefab-variant-layout`. Variant identity and asset-store identifiers
are configuration in the `[[variants]]` entry of `prefab.settings`, not in the
UI-only `.layout` file.

### 9.4 Prefab function files

Each prefab function is stored directly in the prefab directory as
`<Function>.events`, as requested. Its complete identity and signature are in
the matching `[[functions]]` entry of `prefab.settings`; the `.events` file is
pure IfDo DSL:

```events
if Object.health > 0
do Object.health -= amount
```

---

## 10. Behavior files

### 10.1 `behavior.settings`

```toml
[extensions."Combat".behaviors."Health"]
kind = "behavior"
settingsFormatVersion = 1
name = "Health"
fullName = "Health"
description = "Adds hit points to an object"
objectType = ""
private = false
previewIconUrl = ""
iconUrl = ""
helpPath = ""
quickCustomizationVisibility = "default"

[[extensions."Combat".behaviors."Health".functions]]
name = "onCreated"
events = "game://extensions/Combat/behaviors/Health/OnCreated.events"

[[extensions."Combat".behaviors."Health".functions]]
name = "TakeDamage"
events = "game://extensions/Combat/behaviors/Health/TakeDamage.events"
```

Each `[[functions]]` entry uses the same complete function-metadata schema as
an extension-level per-function `function.settings`; the abbreviated example
shows only identity and event path.

The file also owns:

- Behavior variables.
- Property descriptors and their folder structure.
- Shared property descriptors and their folder structure.
- Complete metadata, source order, and function folder structure for every
  listed behavior function; the matching `.events` file owns only its body.

### 10.2 Behavior function files

Every behavior method is a sibling `.events` file containing pure IfDo DSL.
Its identity and signature come from the matching `[[functions]]` entry of
`behavior.settings`. The legacy composer places the compiled body under the
behavior's `eventsFunctions` array.

---

## 11. Pure function `.events` bodies

Every extension, prefab, or behavior function `.events` file contains only
IfDo DSL event code. Complete function identity and settings are stored by its
owner:

| Function owner | Complete metadata location |
|---|---|
| Extension | The function subfolder's `function.settings` |
| Prefab | The prefab's `prefab.settings` function entry |
| Behavior | The behavior's `behavior.settings` function entry |

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

The root external-source directory is a sibling of `scenes/`:

```text
externals/
  external.settings
  <ExternalName>.events
  <ExternalName>.layout
```

No per-external subfolder is used in version 1. `external.settings` owns the
identity, linked scene, source URI, and order for every external event and
layout. The `.events` and `.layout` files own only their DSL body or UI layout
payload.

### 12.1 `external.settings`

`external.settings` is an append-safe TOML fragment with the unique
`[externals]` namespace:

```toml
[externals]
kind = "externals"
settingsFormatVersion = 1

[[externals.eventFiles]]
name = "Shared Combat"
linkedScene = "Main"
events = "game://externals/Shared%20Combat.events"

[[externals.layoutFiles]]
name = "Shared Combat"
linkedScene = "Main"
layout = "game://externals/Shared%20Combat.layout"
```

`eventFiles` and `layoutFiles` independently preserve the order of the current
`externalEvents` and `externalLayouts` containers. Names are unique within each
container, and every referenced URI resolves directly inside `externals/`.

`linkedScene` maps bidirectionally to the current serializer field
`associatedLayout`. It is normally a scene name, but an empty or stale value
from an older project is preserved exactly and reported as a project diagnostic
rather than changed during migration. Newly authored non-empty values must name
an existing scene.

### 12.2 External events

An external event sheet is one pure DSL
`externals/<ExternalName>.events` file. Its `name`, `linkedScene`, and order
come from the matching `external.settings` `eventFiles` entry:

```events
# Shared events follow.

if collision Player Enemy
do Player.health -= Enemy.damage
```

It maps to a legacy object with `name`, `associatedLayout` from `linkedScene`,
and compiled `events`.

### 12.3 External layouts

An external layout is one UI-only
`externals/<ExternalName>.layout` TOML file with format
`gdevelop-external-layout`. It owns only `instances` and `editionSettings`.
Its `name`, `linkedScene`, and order come from the corresponding
`external.settings` `layoutFiles` entry. The composer maps `linkedScene` to
`associatedLayout` to match `ExternalLayout::SerializeTo`.

---

## 13. Legacy-tree composition

### 13.1 Composition output

Composition produces an in-memory object equivalent to current project JSON. It does not need to write that object into the project directory.

```text
project.settings
  + scene settings
  + visual scene layouts
  + compiled scene events
  + external.settings and external events/layouts
  + extension settings
  + prefab/behavior settings and layouts
  + compiled function events
        -> legacy-shaped SerializerElement/JS object
        -> gd::Project::UnserializeFrom
        -> current editor and exporter behavior
```

### 13.2 Exact container mapping

| New source | Legacy destination |
|---|---|
| `project.settings` ordinary payload | Project root excluding four split arrays |
| Each scene `scene.settings` + `.layout` + `.events` | One `layouts[]` item, merging non-visual settings, visual/editor layout data, and compiled `events` |
| `external.settings` event entry + external `.events` | One `externalEvents[]` item; `linkedScene` becomes `associatedLayout` |
| `external.settings` layout entry + external `.layout` | One `externalLayouts[]` item; `linkedScene` becomes `associatedLayout` |
| `extension.settings` + children | One `eventsFunctionsExtensions[]` item |
| `extension.settings` function manifest/folder tree | Extension function order and `eventsFunctionsFolderStructure` |
| `extensions/<E>/functions/<F>/function.settings` + sibling `<F>.events` | One extension `eventsFunctions[]` entry |
| `prefabs/<P>/prefab.settings` + default/variant layouts + functions | Extension `eventsBasedObjects[]` |
| `behaviors/<B>/behavior.settings` + functions | Extension `eventsBasedBehaviors[]` |
| Owner function-settings entry + compiled pure DSL body | One `EventsFunction` object; settings provide metadata and body becomes `events` |

### 13.3 Two-pass catalog bootstrap

Friendly DSL names cannot be compiled safely without the loaded project's instruction metadata. The loader therefore uses two logical passes:

1. Parse all TOML settings/layout files and resolve every pure `.events` body
   through its owner manifest.
2. Build a skeleton legacy tree with scenes, objects, variables, resources, extension declarations, behaviors, prefabs, and function signatures, but empty event bodies.
3. Unserialize the skeleton into a temporary project/context and load required platform extensions.
4. Build the closed instruction/expression/function catalog.
5. Parse, validate, and compile every `.events` body.
6. Insert compiled arrays into the final legacy tree.
7. Unserialize the final tree into the editor project.

Exact `@exact` instruction syntax can be parsed before the catalog, but its
identifier, signature, kind, parameters, and sub-instructions are validated
after bootstrap.

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

### 14.1 Opening `project.settings`

1. Resolve and validate the entry path.
2. Bootstrap-parse `project.settings`, validate `[gdevelop]` and `[project]`,
   and discover its first-level `game://` settings references.
3. Resolve each settings URI against the project root, enforce containment,
   and bootstrap-parse reached extension/owner manifests until the ordered
   settings graph is complete.
4. Append all `.settings` fragments in the deterministic order from section
   5.1.2 and parse the transient `CombinedProjectSettings` TOML as the
   authoritative compilation input.
5. Validate fragment identities, duplicate namespaces/paths, ordering, owner
   relationships, required pairs, and per-owner `settingsFormatVersion`.
6. Resolve all authoritative layout/events URIs, then read those sources with
   a bounded concurrency limit.
7. Parse `.layout` files separately and validate their layout format markers.
8. Bootstrap the project catalog.
9. Compile every `.events` file and collect source-mapped diagnostics.
10. Compose the legacy serializer tree.
11. Run the existing project-content validation and `gd::Project::UnserializeFrom` path.
12. Set the project file to the absolute `project.settings` path.
13. Start file watching only after a successful load.

The storage-provider result may continue returning a legacy-shaped `content` object to `MainFrame` initially. This keeps the existing `gd.Serializer.fromJSObject` and project load code unchanged.

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
unrelated extensions, or `project.settings`.

| Editor mutation | Source file marked dirty |
|---|---|
| Project properties, resources, global objects/groups/variables, scene/extension ordering | `project.settings` |
| Scene identity, variables, object groups, loading/input/sound/sort settings, shared behavior data | The scene `scene.settings` |
| Scene objects, instances, layers, effects, background, and scene-editor canvas/folder state | The scene `.layout` |
| Scene events | The scene `.events` |
| Extension metadata, dependencies, variables, prefab/behavior manifests, extension-function order/folders | `extension.settings` |
| Extension-level function metadata/signature | That function subfolder's `function.settings` |
| Extension function event body | That function subfolder's `<Function>.events` |
| Prefab declaration/properties/variables/behaviors and prefab-function metadata/order/folders | `prefab.settings` |
| Prefab default or variant visual content | The corresponding prefab `.layout` |
| Prefab function event body | That function `.events` |
| Behavior declaration/properties/variables and behavior-function metadata/order/folders | `behavior.settings` |
| Behavior function event body | That function `.events` |
| External event/layout identity, linked scene, source URI, and order | `external.settings` |
| External event body | Its `.events` |
| External layout instances/editor layout data | Its `.layout` |

A function metadata/signature edit rewrites only its owning `.settings` file
unless a rename also changes the subfolder or `.events` filename. The existing
pure event body is revalidated against the new signature but is never rewritten
merely to duplicate configuration.

The writer:

1. Projects each dirty settings namespace from the editor model back to its one
   owning fragment and serializes that component canonically in memory.
2. Parses/compiles the generated text again as a self-check.
3. Writes a sibling temporary file.
4. Flushes the file and, where supported, its directory entry.
5. Atomically replaces the target.
6. Updates ignored state hashes.

### 15.2 Multi-file transactions

Rename, add/remove, migration, and refactors may touch many files. They use a journal under `.gdevelop/transactions/<id>/`:

1. Record old paths/hashes and intended new paths.
2. Stage all new content.
3. Verify every staged file.
4. Move content files into place.
5. Replace owner settings manifests.
6. Replace `project.settings` last when the root manifest changes.
7. Mark the journal committed.
8. Remove only obsolete files listed as owned by the old manifest.

On next open, an incomplete transaction is either completed from verified staging data or rolled back from the journal. The writer never recursively empties `scenes/` or `extensions/`; unrecognized user files are preserved.

### 15.3 Autosave

Autosave must not recreate a large legacy JSON project beside the source tree. Recommended behavior:

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

When a legacy project is opened and no associated `project.settings` exists:

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
   `scene.settings`/visual `.layout`/`.events` trio for every scene and all
   external sheets/layouts plus `external.settings` under the root
   `externals/` directory. Copy every legacy `associatedLayout` string exactly
   into the corresponding `linkedScene` field.
9. Decompile known event arrays to IfDo with source maps.
10. Stage all new files and run a full new-source -> legacy-tree -> `gd::Project` verification load.
11. Compare a canonical legacy serialization of the verified project against the normalized source project, allowing only documented normalization differences.
12. Commit the new tree transactionally.
13. Leave the original legacy JSON byte-for-byte unchanged.
14. Switch editor metadata and recent-project history to `project.settings`.

No user edit is accepted into the newly loaded project until step 12 succeeds.

### 16.3 Migration marker

The new entry records import provenance:

```toml
[project.migration]
source = "game://game.json"
sourceSha256 = "..."
importedAt = "2026-07-11T10:30:00Z"
importerVersion = 1
```

This metadata does not make the JSON an active source.

### 16.4 Reopening the legacy file

- If its hash matches an existing migration marker, the editor redirects to `project.settings`.
- If the legacy file changed after migration, the editor must not overwrite the new project. It reports two diverged sources and offers an explicit import-as-new or continue-with-new-project decision.
- If conversion failed, no entry file is committed and the legacy file remains usable through the old reader.

### 16.5 Legacy export/save-as

Writing a permanent legacy JSON is an explicit compatibility export, not normal Save. It composes current sources, validates them, and writes a user-selected `.json`. The editor continues tracking `project.settings` afterward.

---

## 17. Preview and export

### 17.1 Normal editor preview

The editor already holds a `gd::Project` built from the source tree. Existing preview launchers and `gdjs::Exporter::SerializeProjectData` use that object unchanged.

If preview is configured to reload the saved project from disk, the storage provider first composes `project.settings` exactly as the normal open flow does, then creates the preview project through the existing unserializer.

### 17.2 Export

Export uses this boundary:

```text
new source files
  -> validate and compile
  -> compose current legacy serializer tree / gd::Project
  -> existing project stripper and exporter
  -> existing runtime `data.js` / project data
```

The GDJS runtime receives the same serialized runtime project data as before. It does not read TOML, `.layout`, `.settings`, or `.events` files.

### 17.3 Temporary legacy JSON

Most current preview/export code accepts a `gd::Project`, so physical JSON is unnecessary. When a headless tool or external exporter requires a project filename:

1. Compose canonical legacy JSON into a unique OS temporary directory.
2. Set resource-base resolution to the real project root.
3. Pass the temporary path only to that compatibility boundary.
4. Delete it after success or failure.

Temporary legacy JSON must not be written as `game.json` beside `project.settings`, watched as source, added to recent projects, or committed to Git.

---

## 18. Rename, move, and delete behavior

### 18.1 Rename

A semantic rename updates:

- The owning content name.
- The owner manifest name.
- All project/event references using existing refactoring tools.
- Function settings, owner manifests, and referenced `.events` filenames.
- Optionally the suggested path, when the user asks to rename files too.

Content rename and path rename are distinct. Keeping an old path after a display-name rename is valid.

Changing an external entry's `linkedScene` rewrites only
`externals/external.settings`; the external source file stays in the root
`externals/` directory. Renaming an external source updates its manifest entry,
filename, and `game://` URI transactionally.

### 18.2 Delete

Delete computes references first. After confirmation, it removes the manifest entry and only files exclusively owned by that entry. Shared resources and unrecognized files are not deleted. Deleting a scene is blocked until external `linkedScene` references to it are explicitly changed or cleared.

### 18.3 Move between folders/extensions

Moving a function or entity changes owner identity and may change generated instruction types. The editor must use whole-project refactoring and recompile all dependents in one transaction.

---

## 19. Git and merge behavior

- Canonical output avoids timestamps and random formatting changes in source files.
- Root manifests change only for structural project changes.
- Function bodies, scene events, and layouts produce isolated diffs.
- Stable paths allow Git rename detection.
- Arrays preserve semantic order; writers must not reorder merely to reduce diff size.
- Merge conflict markers are syntax errors with clear diagnostics.
- `.gdevelop/`, temporary legacy JSON, transaction staging, and autosave data should be ignored.

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
- Implement source manifests, path validation, and component ownership types.
- Implement the `gd::Layout` field partition that writes non-visual scene
  configuration to `scene.settings` and visual/editor data to `.layout`.
- Add a legacy composer producing the current JS object/`SerializerElement` shape.

### Phase 2: events compiler/decompiler

- Implement the IfDo parser, formatter, semantic IR, compiler, and decompiler from the related spec.
- Expose catalog metadata needed for friendly instruction mappings.
- Implement typed syntax for every current persisted event/field and the exact
  catalog instruction form before enabling automatic migration.

### Phase 3: local storage integration

- Add `project.settings` to the local file picker and project-location logic.
- Route open/save/autosave/file watching through the multi-file provider.
- Keep `MainFrame` consuming a composed content object initially.
- Add dirty-component tracking and transactional writes.

### Phase 4: migration

- Support single and existing split legacy JSON.
- Add provenance markers, redirect behavior, verification, and rollback.
- Run corpus conversion tests across repository game fixtures.

### Phase 5: preview/export and non-local providers

- Route reload-from-disk preview through the composer.
- Add temporary-file compatibility for path-only headless tools.
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
- Scene settings/layout ownership: non-visual fields are extracted to
  `scene.settings`, `.layout` contains only allowed visual/editor fields, and
  the merged legacy layout is structurally equivalent.
- Nested instruction `subInstructions`, OR/AND/NOT, inverted, awaited, and disabled instructions.
- Local variable types, UUIDs, enums, arrays, structures, and editor folded state.
- Async functions, lifecycle functions, `ExpressionAndCondition`, and `ActionWithOperator`.
- Per-function `functions/<Function>/function.settings` metadata, matching
  `.events` filename, missing/unlisted files, and owner-identity validation;
  extension order/folder structure remains in `extension.settings`.
- Extension dependencies and cross-extension prefab/behavior references.
- Prefab default and additional variants.
- Root-level `externals/external.settings`, external events, and external
  layouts, including matching basenames, independent files, container ordering,
  `linkedScene` mapping, empty or stale associations, and root-directory path
  validation.
- Legacy French/XML field fallbacks and version compatibility branches.
- Existing folder-project split references.
- Unicode, reserved filenames, case-fold collisions, and traversal attempts.
- Raw concatenation of every `.settings` fragment produces one valid TOML
  document with no duplicate keys or tables and the expected namespace tree.
- No settings fragment embeds another fragment or uses an include directive;
  compilation creates `CombinedProjectSettings` only in memory, and saving a
  child setting rewrites only its owning file unless a structural manifest also
  changed.
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

## 23. Non-goals for version 1

- Changing GDJS runtime project data.
- Replacing `gd::Project` or existing C++ serializers.
- Making the runtime load TOML or DSL.
- Splitting every object, resource, layer, or instance into an individual file.
- Embedding binary assets in TOML.
- Automatically merging simultaneous semantic edits.
- Removing current legacy compatibility branches.
- Treating filenames as stable entity IDs.

Future versions may split resources/global objects further, add stable entity IDs, or introduce a direct typed source model after the compatibility format has proven reliable.

---

## 24. Final contract

A conforming implementation must satisfy all of the following:

1. Opening `project.settings` reconstructs a complete current project without runtime changes.
2. Opening legacy JSON converts once, commits atomically, preserves the original, and switches the editor to the new entry.
3. Normal Save writes only new-format source files.
4. Every scene has its own subfolder with `scene.settings`, a visual/UI-focused
   TOML layout, and a DSL events file.
5. The root `externals/` directory is a sibling of `scenes/`; it contains
   `external.settings` plus each `<ExternalName>.events` and
   `<ExternalName>.layout`, and `external.settings` owns linked-scene metadata
   and external-container ordering.
6. Every extension-level function has a
   `functions/<Function>/function.settings` and matching
   `<Function>.events`, and every extension, prefab, behavior, and function
   follows the directory ownership defined here.
7. Preview/export composes current legacy data only at the compatibility boundary.
8. Every supported serializer event and instruction shape has a typed IfDo
   representation; unknown or newer shapes stop migration before any source is
   committed.
9. Paths, ordering, formatting, and writes are deterministic.
10. No managed save deletes unrecognized user files.
11. A full new-source -> legacy -> current-project verification succeeds before migration is considered complete.
12. All `.settings` fragments append conflict-free into one authoritative TOML
    document, and every managed source reference uses a project-root `game://`
    URI rather than a relative path.
13. Settings remain separate files on disk with no include/embedding syntax;
    the editor creates the combined project-settings document only in memory
    for validation and compilation, then saves each changed namespace back to
    its owning fragment.
