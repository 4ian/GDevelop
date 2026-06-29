# Global Config

Status: first implementation is in place. Global Config now has project storage, folder-project save support, runtime helpers, event instructions, a dockable editor window, scoped object-editor placeholder support, and schema-aware JSON-object property support for event-based objects/behaviors.

This document describes the current implementation, not only the original design intent.

## Goal

Global Config is project-wide JSON configuration data for game tuning and content data. It is separate from Global variables:

- Global Config is saved as a JSON map.
- Global variables remain runtime/game-state variables.
- Events use dedicated config conditions and expressions. Global Config is
  read-only at runtime.
- Object editor properties can use placeholder references such as `{{cards.sunflower.price}}` where this is explicitly enabled.
- JSON-object properties can reference a config subtree such as `{{cards.sunflower}}` and expose it in object/behavior events with variable-style child access such as `CardConfig.price`.
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

| Area                     | Implementation                                                                                                                                                            | Relevant files                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project storage          | `gd::Project` stores a JSON string with `GetGlobalConfigJson` and `SetGlobalConfigJson`. Missing or empty values become `{}`.                                             | `Core/GDCore/Project/Project.h`, `Core/GDCore/Project/Project.cpp`                                                                                                                                                                                                                 |
| Serialization            | Single-file projects serialize a top-level `globalConfig` object when it is not `{}`. Older projects without the field load as `{}`.                                      | `Core/GDCore/Project/Project.cpp`                                                                                                                                                                                                                                                  |
| JS bindings              | The project exposes `getGlobalConfigJson` and `setGlobalConfigJson`.                                                                                                      | `GDevelop.js/Bindings/Bindings.idl`, `GDevelop.js/types.d.ts`, `GDevelop.js/types/gdproject.js`                                                                                                                                                                                    |
| Folder projects          | Folder projects split `globalConfig` to `globalConfig.json`; the local resource watcher tracks this file.                                                                 | `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter.js`, `newIDE/app/src/ProjectsStorage/LocalFileStorageProvider/LocalFileResourcesWatcher.js`                                                                                                            |
| Runtime data             | `ProjectData` has optional `globalConfig`; `RuntimeGame` owns `_globalConfig` with `getGlobalConfig` and `setGlobalConfig`.                                               | `GDJS/Runtime/types/project-data.d.ts`, `GDJS/Runtime/runtimegame.ts`                                                                                                                                                                                                              |
| Runtime helpers          | `gdjs.evtTools.globalConfig` normalizes placeholder paths, reads values, resolves placeholders, and validates JSON-object values against examples.                        | `GDJS/Runtime/events-tools/globalconfigtools.ts`                                                                                                                                                                                                                                   |
| Event metadata           | Builtin Variables extension adds a `Global configuration` group with config conditions and expressions.                                                                   | `Core/GDCore/Extensions/Builtin/VariablesExtension.cpp`                                                                                                                                                                                                                            |
| Event codegen            | Global Config instructions generate calls to `gdjs.evtTools.globalConfig`.                                                                                                | `GDJS/GDJS/Extensions/Builtin/VariablesExtension.cpp`                                                                                                                                                                                                                              |
| Event parameters         | `globalConfigPath` is rendered as a default field and labeled "Global config placeholder".                                                                                | `newIDE/app/src/EventsSheet/ParameterRenderingService.js`                                                                                                                                                                                                                          |
| Editor UI                | `Global config` is a `global-config` editor kind. It opens floated by default like Resources and can be popped back into the main editor tabs.                            | `newIDE/app/src/MainFrame/index.js`, `newIDE/app/src/MainFrame/EditorTabs/EditorTabsHandler.js`, `newIDE/app/src/MainFrame/EditorContainers/GlobalConfigEditorContainer.js`, `newIDE/app/src/ProjectManager/index.js`                                                              |
| Grid editor              | The editor has sheet tabs, row/column editing, raw JSON import/export, and copy placeholder.                                                                              | `newIDE/app/src/GlobalConfig/GlobalConfigDialog.js`                                                                                                                                                                                                                                |
| Placeholder editor scope | Placeholder editing is enabled in the full object editor window for event-based object/behavior properties. Other property editors show an error if `{{...}}` is entered. | `newIDE/app/src/ObjectEditor/ObjectEditorDialog.js`, `newIDE/app/src/ObjectEditor/Editors/ObjectPropertiesEditor.js`, `newIDE/app/src/BehaviorsEditor/Editors/BehaviorPropertiesEditor.js`, `newIDE/app/src/PropertiesEditor/*`, `newIDE/app/src/CompactPropertiesEditor/index.js` |
| Object/behavior codegen  | Object and behavior properties resolve config placeholders when runtime data is generated. JSON-object properties pass their JSON example to runtime validation.          | `GDJS/GDJS/Events/CodeGeneration/ObjectCodeGenerator.cpp`, `GDJS/GDJS/Events/CodeGeneration/BehaviorCodeGenerator.cpp`, `Core/GDCore/Project/CustomConfigurationHelper.cpp`, `Core/GDCore/Project/JsonObjectPropertyTools.h`                                                       |

## Storage Format

The project model stores a JSON-compatible root object:

```ts
type GlobalConfigValue =
  | null
  | boolean
  | number
  | string
  | { [key: string]: GlobalConfigValue }
  | GlobalConfigValue[];

type GlobalConfig = { [key: string]: GlobalConfigValue };
```

Single-file project example:

```json
{
  "properties": {
    "name": "My game"
  },
  "variables": [],
  "globalConfig": {
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
globalConfig.json
layouts/
externalLayouts/
externalEvents/
eventsFunctionsExtensions/
```

`globalConfig.json` contains the direct config map, not a wrapper:

```json
{
  "cards": {
    "sunflower": {
      "price": 50
    }
  }
}
```

Notes:

- Empty config is represented internally as `{}`.
- `globalConfig` is omitted from single-file serialization when it is exactly `{}`.
- Exported/runtime project data embeds `globalConfig`, so the game does not require an extra file load for config.
- Runtime events cannot modify Global Config. It is loaded from project data and
  then treated as read-only during gameplay.

## Placeholder Path Syntax

Public config references use exact placeholder paths:

```text
{{cards.sunflower.price}}
{{waves[0].enemies[2].type}}
{{cards["sun.flower"].price}}
{{localization['main menu'].title}}
{{texts.card_sunflower_name.$locale}}
```

Inside `{{...}}`, the path parser supports:

```text
cards.sunflower.price
waves[0].enemies[2].type
cards["sun.flower"].price
localization['main menu'].title
texts.card_sunflower_name.$locale
```

Path behavior:

- Dot segments address object properties.
- Bracket numbers address array indexes.
- Bracket strings address object keys that contain dots, spaces, or other non-identifier characters.
- A whole path segment starting with `$`, such as `$locale`, is resolved from a
  global variable with the same name without `$`. For example,
  `{{texts.card_sunflower_name.$locale}}` reads global variable `locale`, then
  uses its string value as the final path segment.
- Whitespace is trimmed inside brackets and placeholder delimiters.
- Missing reads print one runtime warning per path, return `undefined`
  internally, and keep deterministic defaults through typed helpers.
- Missing or non-primitive dynamic global variables print a runtime warning and
  the config read returns the typed default.
- Reads do not create missing entries.

## Dockable Editor UX

The Project Manager tree now contains:

```text
Globals
  Global variables
  Global config
  Global objects
```

Clicking `Global config` opens a dockable editor:

- It uses editor kind `global-config`.
- It opens in the external/floated pane by default, following the Resources window behavior.
- The shared popped-out titlebar can return it to the main editor tabs.
- The Project Manager selection mapping highlights `Global config` when the tab is focused.
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
- Export JSON to `globalConfig.json`.
- Raw JSON panel with `Apply JSON`.

Current edit semantics:

- In docked/floated editor mode, edits are committed directly to `project.setGlobalConfigJson(...)`.
- The editor container calls `unsavedChanges.triggerUnsavedChanges()` for committed config changes.
- The older dialog wrapper still exists as an internal component wrapper, but the Project Manager no longer opens Global Config as a modal dialog.

Known editor limitations for this first implementation:

- No cell virtualization yet.
- No full spreadsheet keyboard navigation yet.
- No paste table data support yet.
- No sorting/filtering/reordering yet.
- No path picker/autocomplete yet.
- No inline validation for missing paths or mixed column types yet.

## Runtime API

`RuntimeGame` exposes:

```ts
runtimeGame.getGlobalConfig();
runtimeGame.setGlobalConfig(globalConfig);
```

`setGlobalConfig` is for engine/editor project-data initialization and hot
reload. It is not exposed as a Global Config event action.

Runtime helper namespace:

```ts
gdjs.evtTools.globalConfig.parsePath(path);
gdjs.evtTools.globalConfig.normalizePath(path);
gdjs.evtTools.globalConfig.getValue(runtimeGame, path);
gdjs.evtTools.globalConfig.has(runtimeGame, path);
gdjs.evtTools.globalConfig.getNumber(runtimeGame, path);
gdjs.evtTools.globalConfig.getString(runtimeGame, path);
gdjs.evtTools.globalConfig.getBoolean(runtimeGame, path);
gdjs.evtTools.globalConfig.getChildCount(runtimeGame, path);
gdjs.evtTools.globalConfig.toJSON(runtimeGame, path);
gdjs.evtTools.globalConfig.getVariable(runtimeGame, path, schemaExample?, propertyName?);
gdjs.evtTools.globalConfig.getExactPlaceholderPath(text);
gdjs.evtTools.globalConfig.resolvePlaceholders(runtimeGame, text);
gdjs.evtTools.globalConfig.resolveVariable(runtimeGame, value, schemaExample?, propertyName?);
gdjs.evtTools.globalConfig.resolveNumber(runtimeGame, value);
gdjs.evtTools.globalConfig.resolveString(runtimeGame, value);
gdjs.evtTools.globalConfig.resolveBoolean(runtimeGame, value);
```

Typed read defaults:

| Helper          | Missing or invalid value |
| --------------- | ------------------------ |
| `getNumber`     | `0`                      |
| `getString`     | `""`                     |
| `getBoolean`    | `false`                  |
| `getChildCount` | `0`                      |
| `toJSON`        | `"null"`                 |

When a config read cannot find its path, the runtime logger prints a warning
once for that placeholder path, for example:

```text
[Global configuration] Global config path "{{cards.sunflower.price}}" does not exist.
```

When a dynamic path segment uses a missing or non-primitive global variable, the
runtime logger prints a warning once for that path and variable, for example:

```text
[Global configuration] Global config path "{{texts.card_sunflower_name.$locale}}" uses global variable "$locale" but it does not exist.
```

For JSON-object properties, generated code passes the property's JSON example
and property name to `getVariable`/`resolveVariable`. If the resolved placeholder
value does not match the example shape, the runtime logger prints an error, for
example:

```text
[Global configuration] Global config value "{{cards.sunflower}}" does not match the JSON example for property "CardConfig": CardConfig.price should be a number, got string.
```

Coercion rules:

- `getNumber` accepts finite numbers, booleans as `1`/`0`, and parseable strings.
- `getString` stringifies numbers, booleans, arrays, and objects.
- `getBoolean` accepts booleans, non-zero numbers, strings `true`, `1`, `yes`, `on`, non-empty arrays, and non-empty objects.

Runtime read-only semantics:

- Runtime events cannot update or remove Global Config values.
- Global Config changes must be made in the editor or through editor-side tools,
  then included in regenerated project data.
- Use scene/global/object variables for data that must change during gameplay.

## Event Instructions

Global Config instructions are added under the builtin `Global configuration` group.

Parameter type:

```text
globalConfigPath
```

All config conditions and expressions should pass a placeholder path
such as `{{cards.sunflower.price}}`.

Current event API:

| Kind              | Internal name                   | User-facing purpose                              |
| ----------------- | ------------------------------- | ------------------------------------------------ |
| Condition         | `GlobalConfigExists`            | Check that a config placeholder exists.          |
| Condition         | `GlobalConfigNumber`            | Compare a config placeholder value as a number.  |
| Condition         | `GlobalConfigString`            | Compare a config placeholder value as text.      |
| Condition         | `GlobalConfigBoolean`           | Compare a config placeholder value as a boolean. |
| Number expression | `ConfigNumber(placeholder)`     | Read a config placeholder value as a number.     |
| String expression | `ConfigString(placeholder)`     | Read a config placeholder value as text.         |
| Number expression | `ConfigBool(placeholder)`       | Return `1` for true, `0` for false.              |
| Number expression | `ConfigChildCount(placeholder)` | Count object keys or array entries.              |
| String expression | `ConfigToJSON(placeholder)`     | Serialize a config subtree as JSON.              |

Example generated code:

```js
gdjs.evtTools.globalConfig.getNumber(
  runtimeScene.getGame(),
  "{{cards.sunflower.price}}"
);
```

Current limitation:

- `globalConfigPath` currently uses the default text field renderer. Placeholder autocomplete and static path validation are not implemented yet.

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
- Scene events can use exact placeholder paths in Global configuration
  conditions and expressions.
- Compact/property editors outside that scope reject placeholder syntax with: "Global config placeholders can only be edited from the object editor window."
- Config events and expressions use exact placeholder paths such as `{{cards.sunflower.price}}`.

Current field behavior:

| Field type      | Current support               | Notes                                                                                                     |
| --------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| String/text     | Yes                           | Interpolation is allowed anywhere in the string.                                                          |
| Number          | Yes, whole-value only         | `{{cards.sunflower.price}}` is valid. `10 + {{cards.sunflower.price}}` is rejected in the editor.         |
| Boolean         | Runtime resolver exists       | UI placeholder editing for boolean fields is not broadly exposed yet.                                     |
| JSON object     | Yes, whole-value or JSON text | `{{cards.sunflower}}` resolves to a `gdjs.Variable` structure, and inline JSON text is parsed at runtime. |
| Choice/select   | No                            | Future work.                                                                                              |
| Resource picker | No                            | Kept out of scope to avoid export dependency ambiguity.                                                   |
| Color           | No                            | Future work.                                                                                              |

Code generation behavior:

- Exact placeholders in typed object/behavior properties are compiled to typed reads:
  - string: `getString(...)`
  - number: `getNumber(...)`
  - boolean: `getBoolean(...)`
  - JSON object: `getVariable(...)`
- String properties containing placeholders are compiled to `resolvePlaceholders(...)`.
- Generated object/behavior initialization wraps string, number, boolean, and JSON-object property values with `resolveString`, `resolveNumber`, `resolveBoolean`, or `resolveVariable` where needed.
- JSON-object properties use the property editor field label `JSON example`, not `Default value`. This field is required and must contain a JSON object.
- JSON-object properties are exposed in object/behavior events as variable-like structures. For example, a property named `CardConfig` with value `{{cards.Sunflower}}` can be read with `CardConfig.price`.
- Event autocompletion for `CardConfig.` and nested paths such as `CardConfig.stats.` is derived from the JSON example fields.
- Event validation reports an error when `CardConfig.xxx` references a field that is not present in the JSON example.
- Generated primitive getter/setter events are not created for JSON-object properties; use direct variable-style access in object/behavior events instead.

Resolution timing:

- Object/behavior placeholders are resolved when generated runtime object/behavior data is initialized.
- Existing instances do not automatically update when editor-side config changes
  are applied to regenerated project data.
- If a game needs live data changes, use variables for mutable state and use
  Global Config only as the source data to read from.

## Hot Reload And Preview

Expected behavior with the current runtime model:

- Edited project config is included in `ProjectData.globalConfig`.
- Preview/runtime code reads the latest config data after project data is regenerated.
- Event expressions read Global Config whenever events run.
- Object/behavior constructor values use the resolved value from initialization time.

## Validation And Diagnostics

Implemented now:

- The grid rejects invalid raw JSON and requires the root JSON value to be an object.
- Number property editors allow exact placeholders but reject mixed placeholder arithmetic/text.
- Unsupported placeholder scopes show editor errors.
- Runtime helpers return deterministic defaults instead of crashing on missing paths.
- Missing config-path reads print one runtime warning per path.
- JSON-object property examples are required in the property settings UI.
- JSON-object event child paths are validated against the JSON example.
- JSON-object placeholder values print runtime errors when they do not match the JSON example shape.

Not implemented yet:

- Static validation of `globalConfigPath` parameters.
- Export/build diagnostics for unresolved config paths.
- Dedicated path picker/autocomplete from the Global Config editor.

## Recommended Next Work

1. Add static path validation and autocomplete for `globalConfigPath`.
2. Add a path picker/autocomplete for object editor placeholders.
3. Add row/column rename in the Global Config grid.
4. Add spreadsheet paste support for tab-separated data.
5. Add grid keyboard navigation and multi-cell selection.
6. Add export/build diagnostics for missing paths.
7. Add focused tests for serialization, runtime helpers, event codegen, editor opening, and placeholder codegen.

## Test Plan

Core/storage:

- Serialize and unserialize empty config.
- Serialize and unserialize nested objects, arrays, strings, numbers, booleans, and null.
- Preserve keys requiring quoted bracket paths.
- Open projects with missing `globalConfig` as `{}`.
- Save folder projects with `globalConfig.json`.

Runtime:

- `getNumber`, `getString`, `getBoolean`, `getChildCount`, `toJSON`, and `has`.
- Missing path defaults.
- Array index lookup.
- Quoted key lookup.
- Runtime events cannot mutate Global Config.
- Placeholder resolution for string, number, and boolean values.

Events:

- Metadata registration for conditions and expressions.
- Code generation for config conditions and expressions.
- `ConfigBool` returns `1` or `0`.

Editor:

- Project Manager shows `Global config` under `Globals`.
- Clicking it opens a floated `global-config` editor tab.
- The floated editor can be popped into the main editor tabs.
- Grid add/edit/delete/import/export updates project config and marks unsaved changes.
- Copy placeholder uses the selected cell path.
- Raw JSON rejects invalid JSON and non-object roots.

Placeholders:

- Full object editor shows the placeholder hint for supported event-based object/behavior properties.
- String fields accept interpolation.
- Number fields accept whole-value placeholders and reject mixed placeholder text.
- Unsupported editors show a scoped error.
- Generated object and behavior code resolves placeholders through `gdjs.evtTools.globalConfig`.
