# Create extensions and reusable components

## Contents

- [Choose the component](#choose-the-component)
- [Required workflow](#required-workflow)
- [Complete source example](#complete-source-example)
- [Add or change components](#add-or-change-components)
- [Validate the extension](#validate-the-extension)

## Choose the component

Use the narrowest reusable abstraction:

| Need                                                                    | Component                         |
| ----------------------------------------------------------------------- | --------------------------------- |
| Shared project logic without per-object state                           | Extension-level function          |
| State and reusable logic attached to one object                         | Behavior                          |
| Reusable composition with child object definitions and placed instances | Prefab                            |
| A reusable visual object that also owns stateful logic                  | Prefab plus one or more behaviors |

Keep each child object definition and all of its behaviors in an individual
`objects/<Object>.settings` file. Store its editor grouping in
`folder = ["Parent", "Child"]`. Keep prefab-wide
metadata, groups, variables, and flat property descriptors in
`prefab.settings`, its embedded `[layout]` subtree for instance/layer/spatial
composition, and executable logic in `.events`.

## Required workflow

1. Read the current `extension.settings` and every sibling component settings
   file before editing. Preserve unknown fields and existing order.
2. Search the official extension repository according to
   [reuse-community-extensions.md](reuse-community-extensions.md) before
   implementing a substantial system from scratch.
3. Choose a stable extension name and the next contiguous zero-based `order`.
4. Create the owner settings and every required child file in one patch.
5. Keep each settings document independently valid and local-root. Its path
   supplies the mounted namespace. Never add
   child-settings indexes to `project.gdevelop` or `extension.settings`.
6. Derive every function's `.events` sibling from its `.settings` stem. Never
   store events or layout URI fields.
7. Write one repeated `[[variables]]`, `[[globalVariables]]`, or
   `[[sceneVariables]]` record per variable, with an explicit `name` and the
   complete descriptor fields. Use `variables = [ ]`,
   `globalVariables = [ ]`, or `sceneVariables = [ ]` only for an empty
   container. Never author keyed variable tables, whole-container inline
   tables, non-empty inline descriptor arrays, or recursive child tables.
8. Use exact instruction types and `dslName` parameters from
   `.gdevelop/instructions-catalog.json` in every event body.
9. Call `generate-catalogs` after the declaration/files exist. If the extension
   adds instruction types, re-read the regenerated catalog before writing or
   changing callers.
10. After the final edit, require `validate_project_files` to pass all
    pre-runtime phases and commit the task-owned source changes. Then use
    `verify_project_change`, or an equivalent reload plus fresh paused preview,
    to exercise every public function, prefab, and behavior path.

## Complete source example

This example creates one extension containing a free function, a prefab, and a
behavior. Treat instruction names in event examples as catalog lookups: verify
their exact parameters against the current project catalog.

```text
extensions/CombatKit/
  extension.settings
  functions/ResetCombat.settings
  functions/ResetCombat.events
  prefabs/Enemy/
    prefab.settings
    objects/Body.settings
    functions/Initialize.settings
    functions/Initialize.events
  behaviors/Health/
    behavior.settings
    functions/TakeDamage.settings
    functions/TakeDamage.events
```

`extensions/CombatKit/extension.settings`:

```toml
kind = "extension"
settingsFormatVersion = 5
order = 0
name = "CombatKit"
fullName = "Combat Kit"
version = "1.0.0"
extensionNamespace = ""
shortDescription = "Reusable combat components"
description = ["Reusable combat components for this project."]
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

Do not add `functionFiles`, `prefabFiles`, `behaviorFiles`, or child settings
paths. Fixed-folder discovery finds the children. Do not add any legacy
`*FolderStructure` table: `functions/`, `prefabs/`, and `behaviors/` are the
structure.

`extensions/CombatKit/functions/ResetCombat.settings`:

```toml
kind = "function"
settingsFormatVersion = 5
order = 0
extension = "CombatKit"
name = "ResetCombat"
functionType = "Action"
fullName = "Reset combat"
description = "Resets combat state after an explicit request."
sentence = "Reset combat state"
group = "Combat"
getterName = ""
private = false
async = false
helpUrl = ""
deprecated = false
deprecationMessage = ""
parameters = []
objectGroups = { }
```

`ResetCombat.events`:

```events
@event aiGeneratedEventId="reset-combat"
if BooleanVariable variable="ResetRequested" check_if_the_value_is="True"
do SetBooleanVariable variable="ResetRequested" modification_sign="False"
```

`extensions/CombatKit/prefabs/Enemy/prefab.settings`:

```toml
kind = "prefab"
settingsFormatVersion = 5
order = 0
name = "Enemy"
fullName = "Enemy"
description = "Reusable enemy composition"
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
propertyDescriptors = []
objectGroups = { }

variables = [ ]

[layout]
version = 1
bounds = { min = [0, 0, 0], max = [64, 64, 64] }
```

`extensions/CombatKit/prefabs/Enemy/functions/Initialize.settings`:

```toml
kind = "function"
settingsFormatVersion = 5
order = 0
folder = []
name = "Initialize"
functionType = "Action"
fullName = "Initialize"
description = "Initializes one enemy instance."
sentence = "Initialize _PARAM0_"
private = false
async = false
parameters = [{ name = "Object", description = "Object", type = "object", supplementaryInformation = "CombatKit::Enemy" }]
objectGroups = { }
```

`Initialize/Initialize.events`:

```events
@event aiGeneratedEventId="initialize-enemy"
if BooleanObjectVariable object="Object" variable="Initialized" check_if_the_value_is="False"
do SetBooleanObjectVariable object="Object" variable="Initialized" modification_sign="True"
```

`extensions/CombatKit/prefabs/Enemy/objects/Visuals/Body.settings`:

```toml
kind = "object"
settingsFormatVersion = 5
order = 0
folder = []
name = "Body"
type = "Sprite"
behaviors = []
effects = []

variables = [ ]
```

Add every child object definition, its variables/effects, and every attached
behavior to its own flat object settings file. Its `folder` array is the editor
object grouping. Add only instances, layers,
spatial bounds, and editor layout state to `prefab.settings` below `[layout]`. Copy the complete
object-definition shape from an existing compatible object `.settings` file
rather than inventing serializer fields. For attached behaviors, copy only
author-writable properties listed for that type in `settings-catalog.json` when
creating a new attachment. When migrating an existing attachment, preserve its
unlisted serialized fields verbatim: specialized editors can store required
runtime configuration there even though the generic catalog hides it. Keep
`propertyDescriptors` as one flat ordered array in `prefab.settings`; never add
property folders.

Ordinary behavior and shared-data deserialization overlays authored fields on
extension-initialized defaults, including nested objects, while arrays remain
authored replacements. Overriding behaviors intentionally remain sparse. This
protects legacy/partial sources from missing runtime defaults, but new
attachments must still author every writable property required by the generated
catalog and preserve all existing unknown fields.

`extensions/CombatKit/behaviors/Health/behavior.settings`:

```toml
kind = "behavior"
settingsFormatVersion = 5
order = 0
name = "Health"
fullName = "Health"
description = "Adds hit points to one object instance."
objectType = ""
private = false
previewIconUrl = ""
iconUrl = ""
helpPath = ""
quickCustomizationVisibility = "default"
```

`extensions/CombatKit/behaviors/Health/functions/TakeDamage.settings`:

```toml
kind = "function"
settingsFormatVersion = 5
order = 0
folder = []
name = "TakeDamage"
functionType = "Action"
fullName = "Take damage"
description = "Subtracts damage from one picked object."
sentence = "_PARAM0_ takes _PARAM2_ damage"
private = false
async = false
parameters = [{ name = "Object", description = "Object", type = "object" }, { name = "Behavior", description = "Behavior", type = "behavior", supplementaryInformation = "CombatKit::Health" }, { name = "Amount", description = "Damage amount", type = "expression" }]
objectGroups = { }
```

`TakeDamage.events`:

```events
@event aiGeneratedEventId="take-damage"
if NumberObjectVariable object="Object" variable="HP" comparison_sign=">" value=0
do SetNumberObjectVariable object="Object" variable="HP" modification_sign="-" value=expr(Amount)
```

The object and behavior parameters identify one caller instance. Do not remove
the guarding condition or call this method with an unrestricted multi-instance
selection.

Object-list parameters keep their logical parameter name across a behavior
function call. When a function creates an object and a child event mutates that
same parameter, use the catalog instruction with the same object parameter in
both instructions. The generated function context preserves the newly created
selection through child events and nested private behavior-function calls.

## Add or change components

- Add a free function as a flat `functions/<Name>.settings` owner. Put its complete
  signature there and only its body in the same-stem `<Name>.events`.
- Add every prefab or behavior function as a flat same-stem pair. Put its
  complete metadata and `folder` grouping array in `<Name>.settings` and
  only its body in the sibling `<Name>.events`. Never embed a
  function entry in `prefab.settings` or `behavior.settings`.
- Add prefab variants under `variants/<Variant>/variant.settings`; keep the
  variant's identity, order, groups, and embedded `[layout]` in that owner. Put each
  variant child definition and its behaviors in
  `variants/<Variant>/objects/<Object>.settings` and store grouping in `folder`.
- On rename, update the component directory or same-stem pair, path-derived
  namespace, `name`, and every caller atomically.
- On delete, remove callers and scene instances first, reload and verify, then
  remove the component files and close empty folders.

## Validate the extension

1. Parse every changed settings TOML independently, mount it from its canonical
   path, and verify the strict combined merge; semantically compile every
   changed embedded `[layout]` subtree as layout TOML version 1.
2. Verify component orders are contiguous and names/folders/basenames match.
3. Verify every required same-stem `.events` file exists and no layout URI is present.
4. Verify prefab layouts contain no object definitions or behaviors and that
   every definition is present in its own flat object settings file.
   Verify property descriptor arrays are flat and no property folder metadata
   exists. Verify new attached behavior fields are catalog-listed and all
   pre-existing unlisted serialized fields still round-trip unchanged.
5. Verify every action is condition-guarded and every object action targets the
   intended picked set. Multiple picked instances are valid when the operation
   is intentionally collective; isolate with `for each` only when required.
6. Regenerate catalogs, validate the final source, commit it, and confirm the
   new instruction/object/behavior types appear after the verified reload.
7. Instantiate the prefab, attach the behavior, and call each public function
   from a guarded test event.
8. Launch a fresh paused preview and inspect runtime errors, picking, and state,
   preferably through typed `verify_project_change` assertions.
