# Static Data

Status: first implementation is in place. Static Data now has project storage, folder-project save support, a dockable editor window, object-editor placeholder support, and code-generation-time placeholder replacement for action string parameters and event-based object/behavior properties.

This document describes the current implementation, not only the original design intent.

## Goal

Static Data is project-wide JSON configuration data for game tuning and content data. It is separate from Global variables:

- Static Data is saved as a JSON map.
- Global variables remain runtime/game-state variables.
- Action string parameters can use placeholder references. They are replaced
  with literal values during code generation, export, or extension export.
- Object editor properties can use placeholder references such as `{{cards.sunflower.price}}` where this is explicitly enabled.
- JSON-object properties can reference a static data subtree such as `{{cards.sunflower}}` and expose it in object/behavior events with variable-style child access such as `CardConfig.price`.
- JSON-object properties define a required JSON example. Event autocompletion and validation use this example for `CardConfig.xxx` paths.

Example:

```json
{
  "cards": {
    "sunflower": {
      "displayName": "Sunflower",
      "price": 50,
      "cooldown": 7.5,
      "enabled": true
    },
    "peashooter": {
      "displayName": "PeaShooter",
      "price": 100,
      "cooldown": 1.5,
      "enabled": true
    }
  }
}
```

An eligible object editor property can reference:

```text
{{cards.sunflower.price}}
```

## Current Implementation Map

| Area                     | Implementation                                                                                                                                                                                      | Relevant files                                                                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project storage          | `gd::Project` stores a JSON string with `GetStaticDataJson` and `SetStaticDataJson`. Missing or empty values become `{}`.                                                                           | `Core/GDCore/Project/Project.h`, `Core/GDCore/Project/Project.cpp`                                                                                                                                                                                                                 |
| Serialization            | Single-file projects serialize a top-level `staticData` object when it is not `{}`. Projects without Static Data use `{}`.                                                                          | `Core/GDCore/Project/Project.cpp`                                                                                                                                                                                                                                                  |
| JS bindings              | The project exposes `getStaticDataJson` and `setStaticDataJson`.                                                                                                                                    | `GDevelop.js/Bindings/Bindings.idl`, `GDevelop.js/types.d.ts`, `GDevelop.js/types/gdproject.js`                                                                                                                                                                                    |
| Folder projects          | Folder projects split `staticData` to `staticData.json`; the local resource watcher tracks this file.                                                                                               | `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`, `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalFileResourcesWatcher.js`                                                                                                            |
| Multi-file projects      | `static-data.toml` stores direct-root, TOML-compatible editor data with no wrapper or format metadata. Local editor changes auto-save this source without rewriting `project.settings`.             | `newIDE/app/src/ProjectsStorage/MultiFileProjectFormat/index.js`, `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalMultiFileProject.js`, `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`                                              |
| Codegen replacement      | `gd::Project` resolves `{{path.to.value}}` placeholders from the saved static data. Action string parameters are replaced with literals while generating event code. Missing paths add diagnostics. | `Core/GDCore/Project/Project.cpp`, `Core/GDCore/Events/CodeGeneration/EventsCodeGenerator.cpp`, `Core/GDCore/Events/CodeGeneration/ExpressionCodeGenerator.cpp`                                                                                                                    |
| Editor UI                | `Static Data` is a `static-data` editor kind. It opens floated by default like Resources and can be popped back into the main editor tabs.                                                          | `newIDE/app/src/MainFrame/index.js`, `newIDE/app/src/MainFrame/EditorTabs/EditorTabsHandler.js`, `newIDE/app/src/MainFrame/EditorContainers/StaticDataEditorContainer.js`, `newIDE/app/src/ProjectManager/index.js`                                                                |
| Grid editor              | The editor has sheet tabs, row/column editing, Raw TOML and Raw JSON panels, JSON import/export, and copy placeholder.                                                                              | `newIDE/app/src/StaticData/StaticDataDialog.js`                                                                                                                                                                                                                                    |
| Placeholder editor scope | Placeholder editing is enabled in the full object editor window for event-based object/behavior properties. Other property editors show an error if `{{...}}` is entered.                           | `newIDE/app/src/ObjectEditor/ObjectEditorDialog.js`, `newIDE/app/src/ObjectEditor/Editors/ObjectPropertiesEditor.js`, `newIDE/app/src/BehaviorsEditor/Editors/BehaviorPropertiesEditor.js`, `newIDE/app/src/PropertiesEditor/*`, `newIDE/app/src/CompactPropertiesEditor/index.js` |
| Object/behavior codegen  | Object and behavior properties resolve static data placeholders to static values during code generation.                                                                                            | `GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp`, `GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp`, `Core/GDCore/Project/CustomConfigurationHelper.cpp`, `Core/GDCore/Project/JsonObjectPropertyTools.h`                                                       |

## Storage Format

The project model stores a JSON-compatible root object:

```ts
type StaticDataValue =
  | null
  | boolean
  | number
  | string
  | { [key: string]: StaticDataValue }
  | StaticDataValue[];

type StaticData = { [key: string]: StaticDataValue };
```

Single-file project example:

```json
{
  "properties": {
    "name": "My game"
  },
  "variables": [],
  "staticData": {
    "cards": {
      "sunflower": {
        "price": 50
      }
    }
  }
}
```

Folder project example:

```text
project.json
staticData.json
layouts/
externalLayouts/
externalEvents/
eventsFunctionsExtensions/
```

`staticData.json` contains the direct static data map, not a wrapper:

```json
{
  "cards": {
    "sunflower": {
      "price": 50
    }
  }
}
```

Current multi-file project example:

```toml
# static-data.toml
[cards.sunflower]
price = 50
enabled = true
```

The whole TOML document is Static Data. It has no `[settings]`,
`[staticData]`, or format-version wrapper. Values that TOML cannot represent
losslessly, including JSON `null` and mixed-type arrays, are rejected.

Notes:

- Empty static data is represented internally as `{}`.
- Editing Static Data in a local `project.settings` project immediately queues
  a write to `static-data.toml`. A normal project save also writes it.
- `staticData` is omitted from single-file serialization when it is exactly `{}`.
- Generated multi-file `.gdevelop/game.json` omits `staticData` because it is
  editor-only source data.
- Runtime project data does not embed `staticData`; placeholders are resolved
  before runtime code is written.
- Runtime events cannot read or modify Static Data directly. Use scene/global/object variables for data that must change during gameplay.

## Placeholder Path Syntax

Public static data references use exact placeholder paths:

```text
{{cards.sunflower.price}}
{{waves[0].enemies[2].type}}
{{cards["sun.flower"].price}}
{{localization['main menu'].title}}
```

Inside `{{...}}`, the path parser supports:

```text
cards.sunflower.price
waves[0].enemies[2].type
cards["sun.flower"].price
localization['main menu'].title
```

Path behavior:

- Dot segments address object properties.
- Bracket numbers address array indexes.
- Bracket strings address object keys that contain dots, spaces, or other non-identifier characters.
- Whitespace is trimmed inside brackets and placeholder delimiters.
- Missing paths are reported by event diagnostics during code generation.
- Reads do not create missing entries.

## Dockable Editor UX

The Project Manager tree now contains:

```text
Globals
  Global variables
  Static Data
  Global objects
```

Clicking `Static Data` opens a dockable editor:

- It uses editor kind `static-data`.
- It opens in the external/floated pane by default, following the Resources window behavior.
- The shared popped-out titlebar can return it to the main editor tabs.
- The Project Manager selection mapping highlights `Static Data` when the tab is focused.
- The editor is excluded from the normal saved editor-tabs restore list, like Resources.

Current grid capabilities:

- Top-level object keys are shown as sheet tabs.
- Object-map sheets use row keys and property columns.
- Array sheets use numeric row indexes.
- Cells parse `true`, `false`, `null`, numbers, JSON objects/arrays/strings, or plain text.
- Add sheet, add row, add column.
- Inline rename for sheets, object-map rows, and columns.
- Delete row and delete column.
- Copy selected `{{path}}` placeholder.
- Import JSON from a file.
- Export JSON to `static-data.json`.
- Raw TOML and Raw JSON panels with `Apply TOML` and `Apply JSON`.

Current edit semantics:

- In docked/floated editor mode, edits are committed directly to `project.setStaticDataJson(...)`.
- The editor container calls `unsavedChanges.triggerUnsavedChanges()` for committed static data changes.
- The reusable component can render in a dialog wrapper, but the Project Manager opens Static Data as a dockable editor.

Known editor limitations for this first implementation:

- No cell virtualization yet.
- No full spreadsheet keyboard navigation yet.
- No paste table data support yet.
- No sorting/filtering/reordering yet.
- No path picker/autocomplete yet.
- No inline validation for missing paths or mixed column types yet.

## Codegen-Time Replacement

Static Data has no runtime API. `RuntimeGame` does not load or expose the
project static data, and the GDJS runtime does not include a static-data event-tool
namespace.

Instead, placeholders are replaced while generating JavaScript code. A generated
game or exported extension contains the resolved literal values, not runtime
lookups into the project static data.

Supported targets:

- String action parameters, including text expression nodes used by actions.
- Scene events and external events.
- Extension events, event-based object events, and event-based behavior events
  when generated with a project context.
- Event-based object and behavior properties that explicitly allow Global
  Static Data placeholders.

Example:

```text
Emit signal "{{signals.triangle.s1}}" to picked Triangle with payload: "s1 payload"
```

If the project static data contains:

```json
{
  "signals": {
    "triangle": {
      "s1": "TriangleSelected"
    }
  }
}
```

the generated action code receives `"TriangleSelected"` as the signal name.

Missing placeholder paths are reported through event diagnostics as errors. The
original string is kept in generated code when a path cannot be resolved, so the
diagnostic remains visible instead of silently changing behavior.

## Placeholder Support

Supported syntax:

```text
{{cards.sunflower.price}}
{{ cards.sunflower.price }}
Cost: {{cards.sunflower.price}}
```

Current scope:

- Object editor property placeholders are supported in the full object editor
  window.
- The object editor shows an info hint when editing event-based object or behavior properties that support placeholders.
- Scene, external, and extension events can use placeholder paths in action
  string parameters.
- Compact/property editors outside that scope reject placeholder syntax with: "Static Data placeholders can only be edited from the object editor window."

Current field behavior:

| Field type      | Current support               | Notes                                                                                             |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| String/text     | Yes                           | Interpolation is allowed anywhere in the string.                                                  |
| Number          | Yes, whole-value only         | `{{cards.sunflower.price}}` is valid. `10 + {{cards.sunflower.price}}` is rejected in the editor. |
| Boolean         | Yes, whole-value only         | `{{cards.sunflower.enabled}}` resolves before generated code is written.                          |
| JSON object     | Yes, whole-value or JSON text | `{{cards.sunflower}}` resolves to static JSON used to create a `gdjs.Variable` structure.         |
| Choice/select   | No                            | Future work.                                                                                      |
| Resource picker | No                            | Kept out of scope to avoid export dependency ambiguity.                                           |
| Color           | No                            | Future work.                                                                                      |

Code generation behavior:

- Action string parameters are replaced before the parameter is emitted.
- Text expression nodes are replaced only while generating action code.
- Event-based object/behavior property defaults are replaced before static
  runtime data is emitted.
- JSON-object properties use the property editor field label `JSON example`, not `Default value`. This field is required and must contain a JSON object.
- JSON-object properties are exposed in object/behavior events as variable-like structures. For example, a property named `CardConfig` with value `{{cards.Sunflower}}` can be read with `CardConfig.price`.
- Event autocompletion for `CardConfig.` and nested paths such as `CardConfig.stats.` is derived from the JSON example fields.
- Event validation reports an error when `CardConfig.xxx` references a field that is not present in the JSON example.
- Generated primitive getter/setter events are not created for JSON-object properties; use direct variable-style access in object/behavior events instead.

Resolution timing:

- Placeholders are resolved while generating code and runtime data.
- Existing generated code does not automatically update when editor-side static data
  changes. Regenerate preview/export data to pick up static data edits.
- If a game needs live data changes, use variables for mutable state and use
  Static Data only as the source data to read from.

## Hot Reload And Preview

Expected behavior:

- Edited project static data is used when preview/export code is regenerated.
- Runtime project data does not include `staticData`.
- Scene, external, and extension action parameters use the resolved literals
  generated from the current project static data.
- Object/behavior constructor values use the resolved values emitted during
  generation.

## Validation And Diagnostics

Implemented now:

- The grid rejects invalid Raw TOML/JSON and requires the root value to be an object.
- Number property editors allow exact placeholders but reject mixed placeholder arithmetic/text.
- Unsupported placeholder scopes show editor errors.
- Missing action string placeholder paths are reported as event diagnostics.
- JSON-object property examples are required in the property settings UI.
- JSON-object event child paths are validated against the JSON example.

Not implemented yet:

- Dedicated path picker/autocomplete from the Static Data editor.
- Placeholder replacement in non-string action parameter types.

## Recommended Next Work

1. Add path picker/autocomplete for placeholders.
2. Add row/column rename in the Static Data grid.
3. Add spreadsheet paste support for tab-separated data.
4. Add grid keyboard navigation and multi-cell selection.
5. Add focused tests for serialization, event diagnostics, editor opening, and placeholder codegen.

## Test Plan

Core/storage:

- Serialize and unserialize empty static data.
- Serialize and unserialize nested objects, arrays, strings, numbers, booleans, and null.
- Preserve keys requiring quoted bracket paths.
- Open projects with missing `staticData` as `{}`.
- Save folder projects with `staticData.json`.

Events:

- Code generation for action string parameters.
- Placeholder replacement in scene events, external events, extension events,
  event-based object events, and event-based behavior events.
- Missing placeholder paths produce event diagnostics.
- Array index and quoted-key path lookup.

Editor:

- Project Manager shows `Static Data` under `Globals`.
- Clicking it opens a floated `static-data` editor tab.
- The floated editor can be popped into the main editor tabs.
- Grid add/edit/delete/import/export updates project static data and marks unsaved changes.
- Copy placeholder uses the selected cell path.
- Raw JSON rejects invalid JSON and non-object roots.
- Raw TOML round-trips the direct-root `static-data.toml` representation and reports
  unsupported values or TOML syntax errors.

Placeholders:

- Full object editor shows the placeholder hint for supported event-based object/behavior properties.
- String fields accept interpolation.
- Number fields accept whole-value placeholders and reject mixed placeholder text.
- Unsupported editors show a scoped error.
- Generated object and behavior code contains resolved static values.
