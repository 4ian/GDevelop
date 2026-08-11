# Scene-Owned Externals Multi-File Format Specification

Status: approved and implemented  
Date: 2026-07-31

> Version 5 amendment (2026-08-09): this document's scene-owned association
> model remains valid, but its v4 `externalLayoutFiles` manifest and standalone
> `.layout` paths are retired. External Events uses
> `scenes/<Scene>/external-events/<External>/external-events.settings` plus
> flat same-stem lifecycle function pairs below `functions/`. Each external
> layout is independently discovered from
> `scenes/<Scene>/external-layout/<External>.settings`, where its metadata and
> `[layout]` subtree are embedded. Every managed `.events` file is a function
> body and requires a same-stem `.settings` owner. The physical path derives
> the associated scene. The version 5 contract is
> [embedded-layout-settings-format-spec.md](embedded-layout-settings-format-spec.md);
> older physical examples below are migration history only.

## 1. Problem

The multi-file project format currently stores all external event sheets and
external layouts in one project-root directory:

```text
externals/
  external.settings
  <External>.events
  <External>.layout
```

`external.settings` owns each external's name, linked scene, source URI, and
position in the project-wide external-events or external-layouts container.
This physical ownership does not match the editor hierarchy or the semantic
model: every newly authored external must be associated with one scene.

The target format must:

- remove `external.settings`;
- remove the managed root `externals/` source directory;
- store each external source below its linked scene directory; and
- store the external manifest entries in that scene's `scene.settings`.

This is an intentional breaking change to the multi-file source format.
Compatibility with the existing root-externals format is explicitly out of
scope.

## 2. Goals

1. Make the physical source tree mirror scene ownership.
2. Make `scene.settings` the only settings owner for a scene and its external
   event/layout source references.
3. Preserve the existing in-memory and legacy serializer model:
   `project.externalEvents[]`, `project.externalLayouts[]`, and each entry's
   `associatedLayout`.
4. Preserve project-wide external-event and external-layout ordering exactly,
   even though entries are distributed across scene settings files.
5. Require every external to resolve to an existing scene.
6. Keep external `.events` and `.layout` payload formats unchanged.
7. Update every generated catalog, authoring path, test, bundled instruction,
   and normative document that exposes the old layout.
8. Keep writes transactional and preserve unrecognized user files.

## 3. Non-goals

- Reading, migrating, or rewriting multi-file format version 2 projects.
- Reading `externals/external.settings` as a compatibility source.
- Preserving empty or stale `associatedLayout` values.
- Keeping `linkedScene` or `unresolvedScene` in the new disk schema.
- Changing `gd::Project`, `gd::ExternalEvents`, `gd::ExternalLayout`, their
  serialized legacy JSON fields, generated game data, or runtime behavior.
- Changing IfDo syntax or layout TOML syntax.
- Moving ordinary scene events or layouts into the external subdirectory.
- Automatically deleting arbitrary user-owned files in a root `externals/`
  directory.

Legacy single-file JSON import remains a supported input workflow, but it must
emit the new format and must reject a legacy project containing an external
whose `associatedLayout` does not resolve. This is not a compatibility reader
for the retired multi-file format.

## 4. Current behavior

The current format:

- uses multi-file format version `2`;
- discovers `externals/external.settings` as a fixed settings fragment;
- mounts that fragment at the top-level `externals` namespace;
- stores `eventFiles[]` and `layoutFiles[]` in the fragment;
- stores `linkedScene` on every entry;
- allows a migrated stale external-layout link with
  `unresolvedScene = true`;
- requires referenced external sources to be directly under `externals/`;
- derives external JavaScript-authoring diagnostic paths as
  `game://externals/<External>.events`; and
- advertises `externals` as a separate settings-file kind in the generated
  settings catalog and bundled project-authoring skill.

## 5. Proposed physical layout

The canonical source tree becomes:

```text
scenes/
  Main/
    scene.settings
    Main.events
    Main.layout
    objects/
      <Object>.settings
    externals/
      Shared%20Combat.events
      Shared%20Combat.layout
```

Rules:

- `scenes/<Scene>/externals/` is optional and is created only when the scene
  owns at least one external event or layout.
- External event sources use
  `game://scenes/<Scene>/externals/<External>.events`.
- External layout sources use
  `game://scenes/<Scene>/externals/<External>.layout`.
- A referenced source must be inside the exact physical scene folder that owns
  the referencing `scene.settings`; cross-scene references are invalid.
- A source must be exactly one level below the scene's `externals/` directory.
- The root `externals/` directory is no longer a managed or reserved component
  directory.
- The canonical writer never emits `externals/external.settings` or a managed
  root external source.

The existing canonical percent-encoding, normalization, collision, traversal,
symlink, and case-folding rules continue to apply to both scene and external
path segments.

## 6. `scene.settings` schema

Each scene settings document may contain two optional arrays of tables:

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

### 6.1 `externalEventFiles`

Each entry owns:

- `name`: the globally unique external-event name;
- `order`: its zero-based position in
  `project.externalEvents[]`;
- `events`: its canonical scene-owned `.events` URI; and
- any preserved current `ExternalEvents` serializer metadata not otherwise
  split into source-only fields.

The entry must not contain `associatedLayout`, `linkedScene`,
`unresolvedScene`, or event AST data.

### 6.2 `externalLayoutFiles`

Each entry owns:

- `name`: the globally unique external-layout name;
- `order`: its zero-based position in
  `project.externalLayouts[]`;
- `layout`: its canonical scene-owned `.layout` URI; and
- any preserved current `ExternalLayout` serializer metadata not otherwise
  split into source-only fields.

The entry must not contain `associatedLayout`, `linkedScene`,
`unresolvedScene`, `instances`, or `editionSettings`. The latter two remain in
the referenced `.layout` file.

### 6.3 Derived ownership

The scene name is derived from the owning `scene.settings` document. It is not
duplicated in either external entry.

On composition:

- an `externalEventFiles` entry becomes one
  `project.externalEvents[]` entry with `associatedLayout` equal to the owning
  scene name;
- an `externalLayoutFiles` entry becomes one
  `project.externalLayouts[]` entry with `associatedLayout` equal to the
  owning scene name; and
- external layout TOML is validated using the owning scene's objects, global
  objects, and layer names.

The arrays are omitted when empty. Canonical output does not write empty
placeholder arrays solely to indicate that a scene has no externals.

## 7. Ordering and uniqueness

Scene-local grouping must not alter the two project-wide container orders.

The writer records the original global index in every entry's `order` field.
The reader:

1. collects `externalEventFiles` from every scene settings document;
2. requires globally unique event names and globally unique event source URIs;
3. sorts by `order`;
4. requires a unique contiguous range `0..N-1`; and
5. reconstructs `project.externalEvents[]` in that order.

It repeats the same algorithm independently for `externalLayoutFiles` and
`project.externalLayouts[]`.

An event and a layout may share a display name because the two legacy
containers have independent name spaces and use different file extensions.

Changing an external's linked scene preserves its global order but
transactionally:

- removes its entry from the previous `scene.settings`;
- adds it to the new `scene.settings`;
- moves/recreates its source under the new scene's `externals/` directory; and
- removes the old managed source after the new source and both settings files
  are safely staged.

## 8. Format version and compatibility policy

`MULTI_FILE_FORMAT_VERSION` increases from `2` to `3`. The new value is written
to:

- `gdevelop.combinedSettingsFormatVersion`;
- `project.settingsFormatVersion`; and
- every owned `.settings` component marker.

There is no version-2 compatibility reader or automatic version-2 migration.

Required behavior:

- A version-2 `project.gdevelop` fails with
  `MULTIFILE_UNSUPPORTED_VERSION`.
- `externals/external.settings` is a retired path and is never parsed or
  mounted by a version-3 project.
- If that exact retired path is present alongside a version-3 entry, opening
  fails with a dedicated retired-path diagnostic instead of silently treating
  it as active source.
- `linkedScene` and `unresolvedScene` are rejected in version-3 scene external
  entries.
- Decomposition fails before producing files when any external has an empty or
  unknown `associatedLayout`.
- Legacy JSON conversion fails before staging when any external association is
  invalid.

No code automatically deletes an old or user-owned root `externals/`
directory. A version-2 project is rejected before save, and unrecognized files
remain protected by the existing no-destructive-save rule.

## 9. Decomposition

`decomposeLegacyProjectToFiles` will:

1. Index scenes by serialized scene name and canonical physical scene folder.
2. Preflight every external event and layout:
   - `associatedLayout` must be a non-empty existing scene name;
   - names must be unique in their respective project-wide containers.
3. Group externals by associated scene while retaining their global indices.
4. Add `externalEventFiles` and `externalLayoutFiles` to the corresponding
   scene settings payload.
5. Write external sources under that scene's `externals/` directory.
6. Omit `associatedLayout` from the source entry because scene ownership
   supplies it.
7. Never create an externals settings document or top-level externals
   namespace.
8. Continue the existing decompose -> compose -> normalized legacy comparison
   before any filesystem write.

The scene grouping must be prepared before scene settings are serialized;
externals may no longer be emitted in a separate pass after all scene files.

## 10. Composition and validation

`composeLegacyProjectFromFiles` will:

- remove all `externalDocument`, `externalSettingsUri`, and top-level
  `externals` namespace logic;
- read the two external entry arrays from each parsed scene namespace;
- exclude those source-only arrays when reconstructing the legacy layout;
- validate source paths against the owning scene settings URI;
- compile each external event source;
- compile each external layout with the owning scene context;
- derive `associatedLayout` from the scene entry name;
- validate global name, URI, and `order` constraints; and
- reconstruct the two root legacy arrays after all scene documents are
  available.

The strict combined-settings mount contains the external entry arrays below
`scenes."<Scene>"`; it contains no top-level `[externals]` namespace.

The managed settings URI pattern no longer recognizes
`game://externals/external.settings`.

## 11. Local filesystem behavior

`LocalMultiFileProject` will:

- stop discovering root `externals/external.settings`;
- rely on the already discovered `scene.settings` references to enqueue nested
  external `.events` and `.layout` sources;
- explicitly detect and reject the retired root settings path for a version-3
  project;
- remove the special commit priority for `external.settings`;
- preserve the normal ordering in which referenced `.events`/`.layout` files
  commit before `scene.settings`, and `project.gdevelop` commits last;
- include nested scene external sources in obsolete-URI calculation;
- remove an empty managed `scenes/<Scene>/externals/` directory after external
  deletion or reassociation; and
- keep transaction recovery, containment, backup, and user-file preservation
  behavior unchanged.

## 12. Generated catalogs and JavaScript authoring

### 12.1 Settings catalog

`ProjectSourceCatalog` will:

- remove the standalone `externals` settings-file kind;
- remove `SETTINGS_FILE_SCHEMAS.externals`;
- add `externalEventFiles` and `externalLayoutFiles` child-table schemas to the
  `scene` settings-file kind;
- document required `name`, global `order`, and source URI fields;
- document the forbidden legacy link fields;
- update generated file-kind counts; and
- describe scene-owned external paths.

In version 5, `settings-catalog.json` exposes external layout contexts through
`layoutContexts` and associates each with its scene. The independent layout
catalog is retired.

### 12.2 JavaScript authoring paths

`JavaScriptAuthoringApi` will:

- emit serialized external event block URIs as
  `game://scenes/<Scene>/externals/<External>.events`;
- resolve that path to the owning scene for typed JavaScript validation;
- distinguish the scene's primary `.events` source from nested external event
  sources where diagnostics need the external identity; and
- remove all `game://externals/...` matching.

The public generated TypeScript declarations remain logically unchanged.
Only diagnostic/source URIs change.

## 13. Editor, core, preview, and runtime impact

The editor Project Manager already groups valid externals below their linked
scene. No additional project-model field is required.

Changing an external association must continue to:

- mark the project unsaved;
- refresh the Project Manager hierarchy;
- trigger the required preview/hot-reload project-data update; and
- cause the next multi-file save to rehome the physical source.

Core model, GDevelop.js bindings, legacy serialization, code generation,
preview, export, and the GDJS runtime remain unchanged. They consume the same
composed `gdProject`.

## 14. Affected code and tests

Primary implementation:

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.js`
- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.js`

Regression tests:

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.spec.js`
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.spec.js`
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.spec.js`
- `newIDE/app/src/ProjectsStorage/JavaScriptAuthoringApi.spec.js`

Existing Project Manager files are affected only if integration testing finds
that association changes do not trigger the required save/refresh path:

- `newIDE/app/src/ProjectManager/index.js`
- `newIDE/app/src/MainFrame/EditorContainers/ExternalEventsEditorContainer.js`
- `newIDE/app/src/MainFrame/EditorContainers/ExternalLayoutEditorContainer.js`

## 15. Documentation updates

Implementation must update all old path and ownership statements in:

- `docs/gdevelop-new-formats-spec.md`
- `docs/gdevelop-events-dsl-spec.md`
- `docs/Architecture.md`
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/SKILL.md`
- `newIDE/app/resources/gd-project-template/skills/gdevelop-project-files/references/events-dsl.md`

`docs/gdevelop-layout-toml-spec.md` remains valid unless implementation review
finds wording that identifies `external.settings` as the layout context owner;
the `.layout` grammar itself does not change.

Generated `.gdevelop/settings-catalog.json` files are outputs, not repository
sources, and must be regenerated through the normal save path rather than
hand-edited.

## 16. Error handling

The implementation will use deterministic diagnostics:

- `MULTIFILE_UNSUPPORTED_VERSION` for a version-2 entry/settings marker.
- `MULTIFILE_RETIRED_EXTERNAL_SETTINGS` when a version-3 tree contains
  `externals/external.settings`.
- `MULTIFILE_EXTERNAL_SCENE_REQUIRED` when decomposition/import encounters an
  empty or unknown `associatedLayout`.
- `MULTIFILE_INVALID_MANIFEST_PATH` when a scene external source escapes or
  targets another scene's `externals/` directory.
- `MULTIFILE_INVALID_SCHEMA` for forbidden link fields, duplicate/missing
  order, non-integer order, non-contiguous order, or duplicate names.
- Existing layout and events diagnostics for invalid external payloads.

All errors identify the owning `scene.settings` URI or the offending source
URI. Decomposition errors happen before staging. Composition errors happen
before a project is returned. Save verification errors happen before the
transaction touches managed source.

## 17. Performance

Decomposition adds one scene-name lookup and one grouping pass over each
external container. Use maps so the cost is
`O(scene count + external count)`.

Composition collects and sorts each external kind by global order, costing
`O(E log E + L log L)`. This is insignificant relative to event compilation
and layout parsing and avoids quadratic scene-by-external scans.

Filesystem discovery becomes slightly cheaper because there is no additional
settings fragment. Nested source files are reached from scene settings URIs and
remain subject to existing managed-file and total-byte limits.

Reassigning one external changes two scene settings files plus one source path.
Reordering externals across scenes can change `order` values in multiple scene
settings documents; exact project-wide ordering takes precedence over
minimizing that diff.

## 18. Required tests

### 18.1 Pure format tests

- Decompose a project with multiple scenes and mixed external kinds.
- Assert there is no `game://externals/external.settings`.
- Assert there are no generated `game://externals/*` sources.
- Assert each source is below its owning
  `game://scenes/<Scene>/externals/` path.
- Assert the owning `scene.settings` contains the correct entry and no
  `linkedScene`, `associatedLayout`, or `unresolvedScene`.
- Round-trip mixed scene ownership with interleaved project-wide external
  orders.
- Validate global uniqueness separately for event and layout names.
- Allow the same name once in each kind.
- Reject empty, missing, and stale `associatedLayout` during decomposition.
- Reject missing, duplicate, negative, non-integer, and non-contiguous global
  orders during composition.
- Reject a source URI under the wrong scene.
- Reject a source URI outside the scene's `externals/` directory.
- Compile an external layout against the owning scene's objects and layers.
- Preserve external serializer metadata that is not a source-only field.
- Verify version markers are `3` and version `2` is rejected.
- Verify the retired root settings path is rejected in a version-3 tree.

### 18.2 Filesystem and transaction tests

- First save creates nested external directories and no root externals
  directory.
- Deleting the last scene external removes the empty managed nested directory.
- Reassociation writes the new source and settings before removing the old
  source.
- Interrupted reassociation recovers to either the complete old state or the
  complete new state.
- Obsolete nested external sources are removed while unrecognized neighboring
  files are preserved.
- Discovery reaches external sources only through scene settings references.

### 18.3 Catalog and authoring tests

- Settings catalog has no `externals` file kind.
- Scene schema advertises both external child tables with global order and
  scene-owned URI rules.
- Generated file-kind counts are updated.
- JavaScript blocks in a nested external event source receive the linked
  scene's typed object/variable context.
- Diagnostics report the nested scene-owned URI.
- No generated authoring artifact contains `game://externals/`.

### 18.4 Integration checks

- Legacy JSON import with valid associations emits version 3.
- Legacy JSON import with invalid associations fails before staging.
- Normal save -> read -> compose -> `gdProject` equivalence succeeds.
- Preview/export output is unchanged for an equivalent project.
- Renaming a scene and reassigning an external produce valid canonical paths
  after save.

## 19. Rollout

1. Land the version bump, schema projection, reader, writer, catalogs, tests,
   and documentation atomically.
2. Do not ship an intermediate build that writes version 3 but still advertises
   root externals.
3. Regenerate test fixtures through the canonical writer.
4. Run focused storage, catalog, and JavaScript-authoring suites.
5. Run editor Flow/lint/format checks, reporting unrelated baseline failures
   separately.
6. Dispatch the required desktop build/launch after implementation checks.

Because version 2 is intentionally unsupported, there is no staged dual-reader
period, feature flag, or automatic conversion.

## 20. Alternatives rejected

### 20.1 Keep `external.settings` at the project root

Rejected because it preserves the physical/semantic mismatch the change is
meant to remove.

### 20.2 Put sources under scenes but keep the root manifest

Rejected because ownership remains split across unrelated directories and
reassociation still requires a global manifest.

### 20.3 Add one `external.settings` inside every scene

Rejected because the scene already has a canonical settings owner. Another
settings fragment adds discovery, mount, merge, and transaction complexity
without representing a separate model component.

### 20.4 Infer project-wide order from scene order and local array order

Rejected because it changes existing `externalEvents[]` and
`externalLayouts[]` ordering whenever externals are distributed across scenes.

### 20.5 Keep `linkedScene` in each entry

Rejected because it duplicates path/settings ownership and permits
contradictory scene identities.

### 20.6 Add a version-2 migration reader

Rejected by explicit product direction. Version 2 is unsupported after this
format break.

## 21. Approval gate

Implementation must not begin until this specification is explicitly approved.
Approval confirms:

- the version-3 breaking change;
- no version-2 compatibility or migration;
- nested `scenes/<Scene>/externals/` source paths;
- `externalEventFiles` and `externalLayoutFiles` in `scene.settings`;
- scene-derived association with no `linkedScene` field; and
- explicit global `order` values for lossless container reconstruction.
