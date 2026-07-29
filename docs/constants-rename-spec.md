# Rename Static Data to Constants

## Status

Revised proposal. Implementation must not begin until this specification is
reviewed and approved.

## Problem

The project-wide authoring data currently called **Static Data** is exposed
under that name across the C++ model, JavaScript bindings, project storage,
editor UI, diagnostics, AI tooling, tests, and documentation.

“Static Data” is vague. These values are immutable inputs to validation and
code generation, so **Constants** is a clearer product name.

This rename is intentionally breaking. The new implementation will not keep
legacy readers, aliases, migrations, or deprecated names.

## Goals

- Use **Constants** as the only product term in GDevelop-owned UI,
  implementation, APIs, schemas, tests, and documentation.
- Use natural singular names for one value or placeholder, such as “constant
  placeholder” and `GetConstantValueAsString`.
- Store authored JSON as the direct constants object, without a `constants`
  root key.
- Store authored TOML as the direct constants object, without a `[constants]`
  table.
- Use `constants.toml` as the only persisted project source.
- Preserve the existing `{{path.to.value}}` placeholder syntax and behavior.
- Keep Constants authoring-only and remove it from exported runtime project
  data.
- Make `constants.toml` the source that AI models read and edit directly.
- Remove feature-specific MCP tools for reading or changing Constants.
- Remove all old names rather than retaining compatibility code.

## Non-goals

- Opening or migrating projects written with old fields or filenames.
- Preserving old C++, GDevelop.js, editor-state, MCP, or source-catalog APIs.
- Adding replacement MCP tools dedicated to Constants.
- Changing placeholder syntax, path parsing, supported values, or replacement
  semantics.
- Adding a runtime Constants API.
- Changing global, scene, object, or structure variables.
- Renaming unrelated uses of the ordinary words “static data” in vendored or
  third-party sources.
- Changing the Constants editor’s grid behavior beyond terminology and
  identifiers required by the rename.

## Required Direct-root Data Shape

The canonical JSON constants document is the constants map itself:

```json
{
  "sheet": {
    "row": {
      "column": "是",
      "column2": "是"
    },
    "row2": {
      "column": "s",
      "column2": "是"
    }
  }
}
```

There is no `constants` root key.

The equivalent TOML document is also direct-root:

```toml
[sheet.row]
column = "是"
column2 = "是"

[sheet.row2]
column = "s"
column2 = "是"
```

There is no `[constants]` wrapper and no format metadata inside the constants
document.

## Current Behavior

- `gd::Project` stores `staticDataJson`.
- C++ exposes `GetStaticDataJson`, `SetStaticDataJson`,
  `GetStaticDataValueAsString`, and `ResolveStaticDataPlaceholders`.
- GDevelop.js exposes `getStaticDataJson` and `setStaticDataJson`.
- Single-file project JSON may embed a `staticData` child.
- Legacy split-folder projects use `staticData.json`.
- Multi-file projects use `static-data.toml`.
- The editor kind and Project Manager item use `static-data`.
- Source catalogs mount the data at `editor.staticData`.
- MCP tools and results use `static_data` or `staticData`.
- Export resolves placeholders and removes the authoring data before runtime.

## Proposed Canonical Naming

| Current | New |
| --- | --- |
| Static Data | Constants |
| static data value | constant |
| Static Data placeholder | constant placeholder |
| `StaticData` | `Constants` when naming the collection |
| `StaticDataValue` | `ConstantValue` |
| `staticData` | `constants` in internal collection variables |
| `staticDataJson` | `constantsJson` |
| `GetStaticDataJson` / `SetStaticDataJson` | `GetConstantsJson` / `SetConstantsJson` |
| `GetStaticDataValueAsString` | `GetConstantValueAsString` |
| `ResolveStaticDataPlaceholders` | `ResolveConstantPlaceholders` |
| `staticData.json` | `constants.toml` |
| `static-data.toml` | `constants.toml` |
| `game://static-data.toml` | `game://constants.toml` |
| editor kind `static-data` | editor kind `constants` |
| `editor.staticData` | `editor.constants` |
| `StaticDataDialog` | `ConstantsDialog` |
| `StaticDataEditorContainer` | `ConstantsEditorContainer` |
| `StaticDataPlaceholderDiagnostics` | `ConstantPlaceholderDiagnostics` |
| `static_data24_black.svg` | `constants24_black.svg` |
| `docs/StaticData.md` | `docs/Constants.md` |

Collection-oriented APIs use plural `Constants`. Operations concerning one
resolved value or placeholder use singular `Constant`.

## Proposed Behavior

### In-memory project model

`gd::Project` owns a direct-root JSON string:

```cpp
const gd::String& GetConstantsJson() const;
void SetConstantsJson(const gd::String& constantsJson);
bool GetConstantValueAsString(const gd::String& path, gd::String& value) const;
bool ResolveConstantPlaceholders(
    const gd::String& source,
    gd::String& resolvedValue,
    gd::String& missingPath) const;
```

`GetConstantsJson()` returns the direct object shown above. It never adds or
expects a `constants` wrapper.

The backing member is `constantsJson`. Parser helpers, code-generation scopes,
validators, exporter helpers, comments, and product-owned callers use the new
terminology only.

The old C++ methods are removed.

### GDevelop.js bindings

The only bindings are:

```js
project.getConstantsJson();
project.setConstantsJson(json);
```

Both methods consume or return the direct-root constants object as a JSON
string. Old binding methods are removed. Generated declarations are
regenerated from `Bindings.idl`.

### Persistent project storage

Constants are not embedded under a `constants` child in the main project JSON.
Every project type stores them in the separate fixed source:

```text
constants.toml
```

This applies to standalone JSON-entry projects, folder projects, and
multi-file `project.gdevelop` projects. For local projects, `constants.toml`
is a sibling of the project entry at the project root. Its canonical URI is
`game://constants.toml`.

The entire file is the direct constants object. The main project JSON contains
no `constants` or legacy authoring-data child.

Storage providers that do not use a local filesystem represent
`constants.toml` as a separate TOML source alongside the project entry rather
than embedding it in the project object.

The multi-file format version is incremented because the owned fixed source
path changes. Only the new format and `constants.toml` are supported by the
new implementation. No old-path discovery or migration is added.

The source constant becomes `MULTI_FILE_CONSTANTS_URI`. Helpers become
`serializeConstantsToToml` and `parseConstantsFromToml`.

JSON remains an interchange and API representation only:

- `getConstantsJson` and `setConstantsJson` use a direct-root JSON string;
- the Raw JSON editor view uses the direct-root JSON object;
- JSON import/export uses a direct-root JSON document.

None of these JSON representations is a persisted project source.

### In-memory serialization used by editor operations

Operations that clone or snapshot `gd::Project` must preserve `constantsJson`
through the project model API, not by relying on a `constants` child in the
serialized project object.

This includes:

- undo/redo snapshots;
- editor snapshots;
- preview/export preparation;
- save-as and project duplication;
- local and cloud storage adapters;
- project and source snapshots;
- extension export validation.

Project JSON is not used to transport Constants. Storage-provider results carry
the parsed TOML payload separately from their `content` project object, and the
loader initializes `gd::Project` through `SetConstantsJson` after project
unserialization.

### Editor identity

- The visible item and tab title are “Constants”.
- The editor kind is `constants`.
- React directories, filenames, components, props, callbacks, variables,
  diagnostics, and icon assets use Constants/Constant terminology.
- Persisted tabs using the old kind are not restored.
- The source catalog kind is `constants`, its path is `constants.toml`, and
  its mounted namespace is `editor.constants`.
- Raw JSON and raw TOML views both edit the direct root.

### Parameters and metadata

The product-owned renderer key becomes `constantPath`. The old key is removed.
Messages use “constant placeholder” and “constant path”.

### AI authoring and MCP surface

There are no dedicated MCP tools for Constants.

The following tools are removed:

- `gdevelop_get_static_data`
- `gdevelop_set_static_data`
- `gdevelop_set_static_data_value`
- `gdevelop_delete_static_data_value`

They are not replaced with `gdevelop_get_constants`,
`gdevelop_set_constants`, or equivalent feature-specific tools.

Constants-specific MCP schemas, handlers, request fields, response fields, and
project-summary fields are removed, including `staticData`, `staticDataJson`,
`include_static_data`, and `staticDataSummary`.

AI models author Constants by editing the project file directly:

1. Locate `constants.toml` at the project root.
2. Read the complete current `constants.toml`.
3. Modify the direct-root TOML document itself.
4. Preserve unrelated tables and values.
5. Validate the resulting TOML and write the file directly.
6. Let the normal project-source watcher/reload path update the editor model.

The bundled GDevelop project-authoring skill documents this workflow and must
not direct models to a Constants-specific MCP tool.

### Runtime boundary

Constants remain authoring/code-generation data.

- Validation resolves constant placeholders.
- Event code generation resolves constant placeholders.
- Object and behavior configuration generation resolves constant
  placeholders.
- Preview and export block when a referenced constant path is missing.
- Runtime project JSON contains no constants document or Constants API.

Because authored constants are no longer embedded in the serialized main
project object, export should not need to remove a `constants` child. A
defensive assertion verifies that no constants transport field reaches runtime
serialization.

## Breaking-change Policy

No compatibility is implemented.

- Old project fields are not read.
- Old filenames are not discovered.
- Old editor kinds are not restored.
- Old C++ and JavaScript methods do not exist.
- Old MCP tools and fields do not exist, and no renamed Constants-specific MCP
  tools are added.
- Old source-catalog kinds and namespaces do not exist.
- No deprecation aliases are added.
- No automatic migration is performed.

Projects requiring the old data must be converted outside this change before
they are opened with the new implementation.

## Affected Layers and Primary Files

### Core model and code generation

- `Core/GDCore/Project/Project.h`
- `Core/GDCore/Project/Project.cpp`
- `Core/GDCore/Project/CustomConfigurationHelper.cpp`
- `Core/GDCore/Events/CodeGeneration/EventsCodeGenerationContext.*`
- `Core/GDCore/Events/CodeGeneration/EventsCodeGenerator.*`
- `Core/GDCore/Events/CodeGeneration/ExpressionCodeGenerator.cpp`
- `Core/GDCore/IDE/InstructionValidator.cpp`
- `GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp`
- `GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp`
- `GDJS/GDJS/IDE/ExporterHelper.cpp`

### Bindings and model tests

- `GDevelop.js/Bindings/Bindings.idl`
- generated GDevelop.js declarations
- `GDevelop.js/__tests__/Core.js`
- `GDevelop.js/__tests__/GDJS.js`
- `GDevelop.js/__tests__/GDJSSceneCodeGenerationIntegrationTests.js`

### Storage and source catalogs

- `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/*`
- `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/*`
- other storage providers that currently serialize only the main project blob
- `newIDE/app/src/ProjectsStorage/ProjectSourceCatalog.*`
- `newIDE/app/src/ProjectsStorage/index.js`

### Editor

- `newIDE/app/src/StaticData/` moved to `newIDE/app/src/Constants/`
- `StaticDataEditorContainer.*` moved to `ConstantsEditorContainer.*`
- MainFrame, editor tabs, Project Manager, property editors, object/behavior
  editors, preview/export, and diagnostic callers
- `StaticDataPlaceholderDiagnostics.*` moved to
  `ConstantPlaceholderDiagnostics.*`
- `StaticData.js` icon component and `static_data24_black.svg`

### AI and authoring artifacts

- `newIDE/app/src/Mcp/McpToolCatalog.*`
- `newIDE/app/src/Mcp/McpProjectTools.js`
- `newIDE/app/src/Mcp/McpEditorBridge.*`
- bundled GDevelop project-template skill and its references

### Documentation

- `docs/StaticData.md` moved to `docs/Constants.md`
- `docs/Architecture.md`
- multi-file and TypeScript event specifications
- repository engineering guide and relevant README references

Existing unrelated user changes must be preserved.

## Error Handling

Messages use only the new terminology:

- `Constant path "{{sheet.row.column}}" does not exist.`
- `Constant value at sheet.row cannot be represented directly in TOML.`
- `Imported constants JSON must contain an object at its root.`
- `constants.toml must contain a TOML table at its root.`

Invalid JSON/TOML identifies the source path and parse failure. Preview and
export continue to block on unresolved placeholders.

The implementation does not detect, explain, or migrate old contracts.

## Performance

The in-memory representation and placeholder algorithm do not change.
Canonical projects have no additional runtime or editor hot-path work.

Reading `constants.toml` adds one source read for project types that previously
embedded the data. Storage providers should load it alongside other project
sources. Runtime exports remain unchanged in size because Constants are
authoring-only.

## Rollout Plan

1. Replace model and binding APIs and rename code-generation/validation
   internals.
2. Remove embedded authoring-data serialization from the main project JSON.
3. Add direct-root `constants.toml` handling to every project storage provider.
4. Remove all persisted JSON representations of Constants.
5. Rename editor modules, identifiers, strings, source catalogs, and icons.
6. Remove Constants-related MCP tools, handlers, schemas, and summary fields.
7. Rename documentation and the bundled project-authoring skill.
8. Regenerate owned declarations and catalogs using their source build steps.
9. Search product-owned sources for every old identifier and term and remove
   all remaining matches.

The change lands atomically. There is no mixed-name transition state.

## Test Plan

### Core and GDevelop.js

- New projects default to `{}`.
- Direct-root constants JSON is accepted and returned losslessly.
- Copy/assignment preserves constants.
- Main project serialization contains no constants wrapper.
- Scalar, object, array, quoted, and missing paths behave exactly as before
  through the renamed APIs.
- Preview/export resolves placeholders without emitting constants at runtime.
- Only the new bindings are present.

### Persistent storage

- Standalone JSON-entry, folder, and multi-file projects read and write
  direct-root `constants.toml`.
- Empty and populated TOML documents round-trip.
- Save-as, delete, autosave, recovery, and project duplication treat the entry
  and `constants.toml` as one logical project.
- Local watchers ignore or track `constants.toml` as required.
- Browser/cloud providers preserve the separate TOML source.
- Raw JSON and JSON import/export remain direct-root interchange formats but
  are never used as project storage.
- Empty constants serialize as an empty direct-root document.
- Unsupported TOML values report the exact constant path.
- Autosave writes only `constants.toml`.
- Generated `.gdevelop/game.json` contains no constants wrapper.
- Source catalogs expose `constants` at `editor.constants`.

### Editor and AI authoring

- Project Manager opens the `constants` editor.
- Edit, add, delete, JSON import/export, TOML editing, autosave, and unsaved
  state work under the renamed components.
- Missing constant diagnostics still block preview/export.
- Object and behavior properties still resolve placeholders.
- The MCP tool catalog exposes no old or renamed Constants-specific tools.
- MCP project summaries expose no mirrored Constants payload or summary.
- The generic project-source catalog exposes `game://constants.toml`.
- AI authoring tests read, modify, validate, and write `constants.toml`
  directly while preserving unrelated values.

### Removal verification

A repository search must find no old product identifier or product term in
owned implementation, tests, UI strings, docs, or filenames. Unrelated
third-party prose is outside this requirement.

### Verification commands

Run focused tests first, followed by:

- relevant native/GDevelop.js build and tests;
- newIDE Flow, lint, format, and focused Jest suites;
- repository searches for removed names.

After code changes, start `python scripts/start-windows-app.py` as a detached
background process, as required by the repository workflow. This
documentation-only specification revision does not require an application
launch.

## Alternatives Considered

### Embed a `constants` child in project JSON

Rejected. The required authored JSON shape is the direct constants object with
no `constants` root key.

### Place arbitrary sheets at the main project JSON root

Rejected because sheet names can collide with project fields such as
`resources`, `objects`, or `layouts`. A separate direct-root document preserves
the requested shape without reserving user keys.

### Keep compatibility aliases or readers

Rejected by requirement. The rename is an immediate breaking replacement.

### Rename only the visible label

Rejected because APIs, files, and authoring documentation would remain
inconsistent.

### Use `strings`

Rejected because constants may be strings, numbers, booleans, arrays, or
objects.

## Open Questions

No question blocks implementation. Approval of this revision means:

- there is no backward compatibility or migration;
- constants JSON/TOML is always direct-root;
- the main project JSON never contains a `constants` wrapper;
- all project types persist Constants in a sibling direct-root
  `constants.toml` source;
- dedicated Constants MCP tools are removed and are not replaced;
- AI models modify `constants.toml` directly;
- all old names and APIs are removed in the same change.
