# Plan: AI Agent Extension Editing Tools

## Context & Goals

The AI agent currently has tools to edit **scenes** (create objects, place instances, edit events, manage layers/properties). We want to extend this so the AI can also **create and edit extensions** — including custom objects, custom behaviors, and custom functions (actions/conditions/expressions).

The key challenge: extensions are hierarchical and more complex than scenes, but we need the AI's tool interface to remain **simple, flat, and unconfusing** for current LLMs.

---

## Design Principle: Unified "Location" Parameter

Rather than creating dozens of specialized tools (one per entity type × operation), we introduce a **unified addressing scheme** that lets existing-style tools work across both scenes and extension contexts.

### The Core Insight

An `EventsBasedObject` already contains an `ObjectsContainer`, `LayersContainer`, and `InitialInstancesContainer` — the same primitives a scene (layout) has. So tools like `create_object`, `put_2d_instances`, `inspect_scene_properties_layers_effects` can be **reused** if they can resolve their target container from a flexible location parameter.

Similarly, events editing (`read_scene_events`, `add_scene_events`) operates on a `gdEventsList` — which both scenes and extension functions have.

### Addressing Scheme

We replace the rigid `scene_name` parameter with a more flexible addressing system. Every tool that currently takes `scene_name` would also accept **extension context parameters** as an alternative:

```
// Existing (still works):
{ "scene_name": "Level1" }

// NEW - Extension free function:
{ "extension_name": "MyExtension", "function_name": "DoSomething" }

// NEW - Custom behavior function:
{ "extension_name": "MyExtension", "behavior_name": "EnemyBehavior", "function_name": "onCreated" }

// NEW - Custom object function:
{ "extension_name": "MyExtension", "object_name": "Button", "function_name": "onUpdate" }

// NEW - Custom object scene (for object/instance/layer editing):
{ "extension_name": "MyExtension", "object_name": "Button" }
```

**Why this is simple for the LLM**: The parameters are all flat strings. The LLM just needs to know "if editing something inside an extension, provide `extension_name` instead of (or in addition to) `scene_name`." No nested objects, no complex routing.

---

## New Tools

### Group 1: Extension Lifecycle (CRUD)

#### `create_extension`
Creates a new events-based extension in the project.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Internal name (no spaces, PascalCase) |
| `full_name` | string | yes | Display name |
| `description` | string | no | Short description of the extension |

**Returns:** Success message with extension name.

#### `inspect_extension`
Lists everything in an extension: its free functions, behaviors, objects, properties.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Name of the extension |

**Returns:** Structured summary of the extension contents (functions list, behaviors list, objects list, variables).

#### `delete_extension`
Removes an extension from the project.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Name of the extension to delete |

---

### Group 2: Custom Behavior CRUD

#### `create_behavior`
Creates a new events-based behavior in an extension.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension to add the behavior to |
| `behavior_name` | string | yes | Internal behavior name |
| `full_name` | string | yes | Display name |
| `description` | string | no | Description |
| `object_type` | string | no | Restrict to specific object type (e.g., "Sprite") |

**Returns:** Success message. The behavior starts with empty properties and no custom functions (lifecycle functions can be added via `create_extension_function`).

#### `inspect_behavior_definition`
Inspects a custom behavior's full definition — properties, shared properties, functions list.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | yes | Behavior name |

**Returns:** Properties, shared properties, list of functions (with their types: action/condition/expression/lifecycle).

#### `delete_behavior_from_extension`
Removes a behavior from an extension.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | yes | Behavior to remove |

---

### Group 3: Custom Object CRUD

#### `create_custom_object`
Creates a new events-based object in an extension.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension to add the object to |
| `object_name` | string | yes | Internal object name |
| `full_name` | string | yes | Display name |
| `description` | string | no | Description |
| `is_rendered_in_3d` | boolean | no | Whether the object uses 3D rendering |
| `is_animatable` | boolean | no | Whether the object supports animations |
| `is_text_container` | boolean | no | Whether the object contains text |

**Returns:** Success message.

#### `inspect_custom_object_definition`
Inspects a custom object's full definition — properties, child objects, layers, functions list.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `object_name` | string | yes | Object name |

**Returns:** Properties, child objects list, layers, list of functions.

#### `delete_custom_object`
Removes a custom object from an extension.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `object_name` | string | yes | Object to remove |

---

### Group 4: Extension Function CRUD

#### `create_extension_function`
Creates a new function (action, condition, expression) in an extension, behavior, or object.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | If set, adds to this behavior |
| `object_name` | string | no | If set, adds to this custom object |
| `function_name` | string | yes | Internal function name |
| `full_name` | string | yes | Display name shown in editor |
| `function_type` | string | yes | One of: "action", "condition", "expression", "expression_and_condition", "action_with_operator" |
| `description` | string | no | Function description |
| `sentence` | string | no | Sentence template for the instruction |
| `expression_type` | string | no | For expressions: "number" or "string" |
| `is_async` | boolean | no | Whether the function is async |
| `group` | string | no | Function group/category |

**Note:** Neither `behavior_name` nor `object_name` should be set for a free function. Only one should be set at a time.

**Returns:** Success message.

#### `inspect_extension_function`
Reads the full definition of a function — parameters, events, metadata.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | If the function belongs to a behavior |
| `object_name` | string | no | If the function belongs to an object |
| `function_name` | string | yes | Function name |

**Returns:** Function type, parameters list, description, sentence, events as text.

#### `delete_extension_function`
Removes a function from an extension/behavior/object.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | Behavior context |
| `object_name` | string | no | Object context |
| `function_name` | string | yes | Function to remove |

---

### Group 5: Properties & Parameters Management

#### `add_or_edit_extension_property`
Add or edit a property on a behavior or custom object.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | If property belongs to a behavior |
| `object_name` | string | no | If property belongs to a custom object |
| `is_shared` | boolean | no | For behaviors: true = shared property (default: false) |
| `property_name` | string | yes | Property name |
| `property_type` | string | no | "string", "number", "boolean", "color", "choice" |
| `label` | string | no | Display label |
| `description` | string | no | Description |
| `default_value` | string | no | Default value |
| `choices` | array | no | For "choice" type: list of allowed values |
| `group` | string | no | Property group |

**Returns:** Success message.

#### `remove_extension_property`
Remove a property from a behavior or custom object.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | Behavior context |
| `object_name` | string | no | Object context |
| `is_shared` | boolean | no | For behaviors only |
| `property_name` | string | yes | Property to remove |

#### `add_or_edit_function_parameter`
Add or edit a parameter on an extension function.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | Behavior context |
| `object_name` | string | no | Object context |
| `function_name` | string | yes | Function name |
| `parameter_name` | string | yes | Parameter name |
| `parameter_type` | string | yes | "object", "number", "string", "key", "behavior", etc. |
| `description` | string | no | Description of the parameter |
| `long_description` | string | no | Extended description |
| `is_optional` | boolean | no | Whether optional |
| `default_value` | string | no | Default value |
| `extra_info` | string | no | Extra type info (e.g., object type name) |

**Returns:** Success message.

#### `remove_function_parameter`
Remove a parameter from an extension function.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | Behavior context |
| `object_name` | string | no | Object context |
| `function_name` | string | yes | Function name |
| `parameter_name` | string | yes | Parameter to remove |

---

### Group 6: Reuse Existing Tools for Custom Object Scenes

The following **existing tools** get extended to work with custom object internal scenes by accepting `extension_name` + `object_name` as an alternative to `scene_name`:

#### `create_object` / `create_or_replace_object` (extended)
When `extension_name` + `object_name` are provided (instead of `scene_name`), creates a child object inside the custom object's internal `ObjectsContainer`.

#### `inspect_object_properties` (extended)
When `extension_name` + `object_name` + `child_object_name` are provided, inspects a child object inside a custom object.

#### `change_object_property` (extended)
Same pattern — works on child objects of a custom object.

#### `put_2d_instances` / `put_3d_instances` (extended)
When `extension_name` + `object_name` are provided, places instances in the custom object's internal `InitialInstancesContainer`.

#### `describe_instances` (extended)
Lists instances inside a custom object's internal scene.

#### `inspect_scene_properties_layers_effects` (extended, rename consideration)
Inspect layers/properties of a custom object's internal scene. (The name `inspect_scene_properties_layers_effects` still makes sense if we document that "scene" can refer to a custom object's internal scene.)

#### `change_scene_properties_layers_effects_groups` (extended)
Edit layers/effects/groups of a custom object's internal scene.

---

### Group 7: Events Editing for Extension Functions

#### `read_extension_function_events` (new)
Reads events of an extension function as text.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | If reading a behavior function |
| `object_name` | string | no | If reading a custom object function |
| `function_name` | string | yes | Function name |

**Returns:** Events as text (using `renderNonTranslatedEventsAsText` on `function.getEvents()`).

#### `add_extension_function_events` (new)
Add or modify events in an extension function (same AI generation flow as `add_scene_events` but targeting a function's events instead of a scene's events).

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `extension_name` | string | yes | Extension name |
| `behavior_name` | string | no | Behavior context |
| `object_name` | string | no | Object context |
| `function_name` | string | yes | Function name |
| `events_description` | string | yes | Description of events to generate |
| `extension_names_list` | string | yes | Comma-separated extension names used |
| `objects_list` | string | no | Objects referenced in events |
| `placement_hint` | string | no | Where to place/modify events |

**Implementation:** Uses the same `generateEvents` → `applyEventsChanges` pipeline, but targets `eventsFunction.getEvents()` instead of `layout.getEvents()`.

---

## Implementation Architecture

### Internal Resolution Helper

A shared helper resolves the "location" from parameters:

```javascript
type ExtensionContext = {|
  extension: gdEventsFunctionsExtension,
  eventsBasedBehavior?: gdEventsBasedBehavior,
  eventsBasedObject?: gdEventsBasedObject,
  eventsFunction?: gdEventsFunction,
|};

const resolveExtensionContext = (
  project: gdProject,
  args: any
): ExtensionContext | { error: string } => {
  const extensionName = SafeExtractor.extractStringProperty(args, 'extension_name');
  if (!extensionName) return { error: 'extension_name is required' };

  if (!project.hasEventsFunctionsExtensionNamed(extensionName))
    return { error: `Extension "${extensionName}" not found.` };

  const extension = project.getEventsFunctionsExtension(extensionName);
  const result: ExtensionContext = { extension };

  const behaviorName = SafeExtractor.extractStringProperty(args, 'behavior_name');
  const objectName = SafeExtractor.extractStringProperty(args, 'object_name');

  if (behaviorName) {
    if (!extension.getEventsBasedBehaviors().has(behaviorName))
      return { error: `Behavior "${behaviorName}" not found in extension "${extensionName}".` };
    result.eventsBasedBehavior = extension.getEventsBasedBehaviors().get(behaviorName);
  }

  if (objectName) {
    if (!extension.getEventsBasedObjects().has(objectName))
      return { error: `Object "${objectName}" not found in extension "${extensionName}".` };
    result.eventsBasedObject = extension.getEventsBasedObjects().get(objectName);
  }

  const functionName = SafeExtractor.extractStringProperty(args, 'function_name');
  if (functionName) {
    const container = result.eventsBasedBehavior
      ? result.eventsBasedBehavior.getEventsFunctions()
      : result.eventsBasedObject
      ? result.eventsBasedObject.getEventsFunctions()
      : extension.getEventsFunctions();

    if (!container.hasEventsFunctionNamed(functionName))
      return { error: `Function "${functionName}" not found.` };
    result.eventsFunction = container.getEventsFunction(functionName);
  }

  return result;
};
```

### Reusing Existing Tools — "Container Resolution"

For tools that work with objects/instances/layers, we create a helper that resolves the target containers:

```javascript
type SceneOrObjectContainers = {|
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer,  // project-level for scenes, extension-level for objects
  initialInstances: gdInitialInstancesContainer,
  layers: gdLayersContainer,
|};

const resolveContainers = (
  project: gdProject,
  args: any
): SceneOrObjectContainers | { error: string } => {
  const sceneName = SafeExtractor.extractStringProperty(args, 'scene_name');

  if (sceneName) {
    // Existing behavior: resolve from scene
    const layout = project.getLayout(sceneName);
    return {
      objectsContainer: layout.getObjects(),
      globalObjectsContainer: project.getObjects(),
      initialInstances: layout.getInitialInstances(),
      layers: layout.getLayers(),
    };
  }

  // New behavior: resolve from custom object's internal scene
  const ctx = resolveExtensionContext(project, args);
  if (ctx.error) return { error: ctx.error };
  if (!ctx.eventsBasedObject)
    return { error: 'Either scene_name or extension_name+object_name required.' };

  const ebo = ctx.eventsBasedObject;
  return {
    objectsContainer: ebo.getObjects(),
    globalObjectsContainer: project.getObjects(),
    initialInstances: ebo.getInitialInstances(),
    layers: ebo.getLayers(),
  };
};
```

This means existing tool implementations can be refactored to use `resolveContainers` instead of directly calling `project.getLayout(sceneName)`, making them work for both scenes and custom object internals with minimal code change.

### Events Generation Adaptation

The `generateEvents` callback and the backend event generation service currently receive `sceneName`. For extension function events, we need to either:

**Option A (Recommended):** Extend `EventsGenerationOptions` to include optional extension context:
```javascript
type EventsGenerationOptions = {|
  sceneName: string,  // Keep for backward compatibility; use extension name or a synthetic name
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,
  existingEventsJson: string | null,
  placementHint: string,
  // NEW optional fields:
  extensionContext?: {|
    extensionName: string,
    behaviorName?: string,
    objectName?: string,
    functionName: string,
    functionParameters?: string,  // Text description of function parameters for AI context
  |},
|};
```

**Option B:** Keep `sceneName` as a descriptive label (e.g., `"Extension:MyExtension/Behavior:EnemyBehavior/Function:onUpdate"`) and let the backend handle it. The existing text rendering and events JSON still work because `renderNonTranslatedEventsAsText` and `serializeToJSON` accept any `gdEventsList`.

### Editor Callbacks Extension

New callbacks needed in `LaunchFunctionOptionsWithProject`:

```javascript
// Notify that extension function events were modified:
onExtensionFunctionEventsModified: (changes: {
  extensionName: string,
  behaviorName?: string,
  objectName?: string,
  functionName: string,
}) => void,

// Notify that custom object internal scene was modified:
onCustomObjectModifiedOutsideEditor: (changes: {
  extensionName: string,
  objectName: string,
}) => void,

// Open extension editor (analogous to onOpenLayout):
onOpenExtensionEditor: (extensionName: string, options?: {
  behaviorName?: string,
  objectName?: string,
  functionName?: string,
}) => void,
```

---

## Summary of All Tools (Existing + New)

### Existing Tools (Unchanged)
- `initialize_project`
- `read_full_docs`
- `add_or_edit_variable`

### Existing Tools (Extended with `extension_name`/`object_name` alternative to `scene_name`)
- `create_object` / `create_or_replace_object` — also works on custom object child objects
- `inspect_object_properties` — also works on custom object child objects
- `change_object_property` — also works on custom object child objects
- `add_behavior` — also works on custom object child objects
- `remove_behavior` — also works on custom object child objects
- `inspect_behavior_properties` — also works on custom object child objects
- `change_behavior_property` — also works on custom object child objects
- `describe_instances` — also works on custom object instances
- `put_2d_instances` — also works on custom object instances
- `put_3d_instances` — also works on custom object instances
- `inspect_scene_properties_layers_effects` — also works on custom object layers
- `change_scene_properties_layers_effects_groups` — also works on custom object layers

### New Tools — Extension Management
- `create_extension`
- `inspect_extension`
- `delete_extension`

### New Tools — Custom Behavior Management
- `create_behavior_in_extension`
- `inspect_behavior_definition`
- `delete_behavior_from_extension`

### New Tools — Custom Object Management
- `create_custom_object`
- `inspect_custom_object_definition`
- `delete_custom_object`

### New Tools — Function Management
- `create_extension_function`
- `inspect_extension_function`
- `delete_extension_function`

### New Tools — Property & Parameter Management
- `add_or_edit_extension_property`
- `remove_extension_property`
- `add_or_edit_function_parameter`
- `remove_function_parameter`

### New Tools — Extension Events
- `read_extension_function_events`
- `add_extension_function_events`

---

## Why This Design Works for LLMs

1. **Flat parameter space**: Every tool uses simple string/boolean/array parameters. No nested objects for addressing. The LLM just fills in `extension_name`, `behavior_name`, `object_name`, `function_name` as needed.

2. **Progressive complexity**: Simple tasks (editing scenes) use only `scene_name`. Extension tasks add `extension_name`. Behavior/object tasks add one more name. Functions add `function_name`. The LLM naturally provides more context as the task gets more specific.

3. **Familiar patterns**: The new tools follow the exact same `inspect_*` / `create_*` / `change_*` / `delete_*` naming convention as existing tools. An LLM that knows how to use `create_object` in a scene will intuitively understand `create_object` in a custom object context.

4. **Reuse over duplication**: By extending existing tools rather than creating parallel `create_object_in_custom_object`, `create_object_in_scene` variants, we keep the total tool count manageable (~30 tools total vs 40+ with full duplication).

5. **Clear disambiguation**: The presence/absence of `scene_name` vs `extension_name` unambiguously determines the target context. There's no confusing overlap.

6. **Descriptive inspect tools**: `inspect_extension`, `inspect_behavior_definition`, `inspect_custom_object_definition`, and `inspect_extension_function` give the LLM structured summaries it can reason about before making changes.

---

## Implementation Order (Suggested Phases)

### Phase 1: Foundation
- Implement `resolveExtensionContext` and `resolveContainers` helpers
- Implement `create_extension`, `inspect_extension`, `delete_extension`
- Add new editor callbacks (`onOpenExtensionEditor`, `onExtensionFunctionEventsModified`, `onCustomObjectModifiedOutsideEditor`)

### Phase 2: Behavior & Object CRUD
- Implement `create_behavior_in_extension`, `inspect_behavior_definition`, `delete_behavior_from_extension`
- Implement `create_custom_object`, `inspect_custom_object_definition`, `delete_custom_object`

### Phase 3: Function Management
- Implement `create_extension_function`, `inspect_extension_function`, `delete_extension_function`
- Implement `add_or_edit_function_parameter`, `remove_function_parameter`

### Phase 4: Property Management
- Implement `add_or_edit_extension_property`, `remove_extension_property`

### Phase 5: Custom Object Scene Editing (Reuse existing tools)
- Refactor existing tools to use `resolveContainers`
- Enable `create_object`, `put_2d_instances`, `describe_instances`, layer/effect editing for custom objects

### Phase 6: Extension Function Events
- Implement `read_extension_function_events`
- Implement `add_extension_function_events` (adapt `generateEvents` pipeline)
- Extend `EventsGenerationOptions` for extension function context

### Phase 7: AI Context Enhancement
- Extend `SimplifiedProject` to include more detail about project extensions being edited
- Include extension function events in AI context when editing extension functions
- Add extension-specific documentation to `read_full_docs`
