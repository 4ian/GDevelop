---
name: gdevelop-mcp
description: Use when an AI agent is connected to GDevelop through MCP and needs to inspect, create, modify, debug, or verify a GDevelop project, scene, object, instance, behavior, variable, event sheet, or editor command.
---

# GDevelop MCP

## Overview

Use this skill to operate the GDevelop editor through MCP safely and predictably. Always inspect current editor/project state before writing, use MCP tools for every project mutation, validate generated event JSON before inserting it, and read back the result after every meaningful change.

GDevelop logic is event-based. A standard event contains `conditions` and `actions`; when all conditions are true, actions run. If an event has no conditions, its actions run every frame. Event order matters.

## Tool Discovery

Some GDevelop MCP tools can be deferred and may not be visible in the active tool list at the start of a session. A tool name listed in this skill is not proof that the tool is currently exposed.

Before deciding that a GDevelop MCP tool is unavailable:

1. Check the currently active tool list.
2. If `tool_search` is available, call it with the exact tool name first, for example `create_sprite_object_from_resource`, then use a broader query such as `GDevelop MCP sprite resource object` if the exact name does not appear.
3. If MCP introspection tools are visible, call `tools/list`, `inspect_tool_schema`, or `get_tool_usage_examples` to confirm the final tool name, schema, and examples before calling it.
4. If only `gdevelop_editor_call` is visible, it may still route known GDevelop MCP tool names through `{ "name": "...", "arguments": { ... } }`. Prefer direct discovered tools when available, but do not assume the underlying tool is missing only because it is not top-level visible.
5. Only report a tool as unavailable after discovery/introspection fails or the editor explicitly returns an unknown-tool or permission-disabled error.

Do not compensate for an undiscovered or disabled MCP tool by directly editing the opened project JSON file. Use another focused MCP tool, ask the user to enable/restart MCP tooling, or report the precise missing capability.

## First Response Workflow

When a user asks for any GDevelop edit:

1. Discover required GDevelop MCP tools first if they are not already visible. Do not skip tool discovery and do not judge a documented tool as missing from the initial active tool list alone.
2. Call `gdevelop_get_editor_state`.
3. If no project is open and the user asked to edit an existing project, report that no project is open. If the user asked to create one, use `initialize_project`.
4. Call `gdevelop_get_project_summary`. Scope it to a scene only after you know the scene name.
5. Call `gdevelop_list_scenes` if the target scene is unclear.
6. For scene work, call `gdevelop_list_objects` and `read_scene_events` for the target scene.
7. If the user's request refers to "selected", "current object", "this instance", "this event", "the thing I clicked", or similar UI context, call `gdevelop_get_editor_selection` before inferring targets from project data.
8. For layout work, call `describe_instances` before placing, moving, or deleting instances.
9. For object/behavior work, call `inspect_object_properties` and, when relevant, `inspect_behavior_properties`.
10. For extension work, call `gdevelop_list_extensions` and then `gdevelop_inspect_extension` for the target extension before editing functions, events-based objects, events-based behaviors, or extension properties.
11. Make the smallest write that satisfies the user request.
12. Read back with the relevant read tool.
13. Summarize what changed and mention any remaining uncertainty.

Do not start by reading the full project JSON unless a focused tool cannot answer the question. Never rewrite or patch the opened project JSON file on disk.

## Tool Map

This map is a reference for tool names and intent. A listed tool may still require tool discovery before it becomes callable in a particular client/session.

Read-only context:

- `gdevelop_get_editor_state`: project presence, scene names, permissions.
- `gdevelop_get_editor_selection`: current editor UI selection state, including active scene-like editor panes, selected objects, selected layers, selected scene instances, and selected events/instructions when an events sheet is active.
- `gdevelop_get_project_summary`: compact project structure, optionally scoped by `sceneName`.
- `gdevelop_read_project_json`: full project JSON; use sparingly and with `maxLength` for large projects.
- `gdevelop_list_scenes`: all scenes/layouts.
- `gdevelop_list_objects`: global objects and scene objects.
- `gdevelop_list_extensions`: project-specific events-functions extensions with metadata and counts.
- `gdevelop_inspect_extension`: full extension detail: free functions, events-based behaviors, events-based objects, parameters, properties, events, and serialized JSON.
- `gdevelop_inspect_extension_function`: one free/behavior/object function inside an extension.
- `gdevelop_inspect_extension_behavior`: one events-based behavior inside an extension.
- `gdevelop_inspect_extension_object`: one events-based object inside an extension.
- `gdevelop_inspect_extension_property`: one behavior/object property inside an extension.
- `read_scene_events`: event sheet rendered as text.
- `read_serialized_scene`: one scene as serialized JSON. Pass `object_name` or `object_names` to return only those objects (and their instances) for a much smaller response, instead of dumping the whole scene to a file.
- `read_scene_events_serialized`: raw serialized event JSON for a scene, including event types the text renderer cannot describe.
- `find_scene_events`: locate events by `event_path`, `ai_generated_event_id`, group name, event type, action type, condition type, parameter text, or serialized text.
- `compare_scene_events_semantics`: compare two serialized event arrays while ignoring visual Group wrappers and stable IDs.
- `inspect_project_resources`: resource table audit: name/kind/file, empty or missing files, unused resources, Sprite frame references, true event resource parameters, generic serialized references, and `suspiciousCollisionMasks` (Sprite frames with `hasCustomCollisionMask: true` but an empty `customCollisionMask`, which silently disables collisions).
- `inspect_project_cleanup`: read-only cleanup candidates: empty scenes, possibly unused scene objects, invalid resources, unused resources, missing Sprite frame references, and `suspiciousCollisionMasks` (empty custom masks that disable collisions).
- `describe_instances`: object instances in a scene; use before `put_2d_instances` or `put_3d_instances`.
- `inspect_object_properties`: object properties, behaviors, animations, size hints.
- `inspect_behavior_properties`: behavior details on an object.
- `list_available_behaviors`: list behavior types available in the project, each with the exact `behaviorType` to pass to `add_behavior` and the `defaultName` used in instruction behavior parameters. Optionally filter by `object_name` (only compatible behaviors) and/or a `search` query. When `object_name` is given, the result also includes `objectBehaviors`: the behaviors already on the object — including hidden capability behaviors — with the exact NAME to use in instruction behavior parameters. The built-in capability behavior names are: Sprite/text → `Text`, animations → `Animation`, effects → `Effect`, opacity → `Opacity`, resize → `Resizable`, scale → `Scale`, flip → `Flippable`.
- `inspect_scene_properties_layers_effects`: scene properties, layers, effects.
- `gdevelop_inspect_running_preview`: inspect a currently running preview to verify runtime behavior. Returns whether a preview is running (defaulting to the latest launched preview, reported as `latestDebuggerId`/`inspectedLatest`), its status, captured `logs`, a separate `errors` list (uncaught exceptions, crashes, error-level logs), and a compact `runtime` snapshot: per scene `sceneElapsedTimeSeconds` (game-time since the scene started — NOT debugger/wall-clock; do not infer game speed from MCP latency), per-object live instance counts (from live `_instances`), and scene/global variable values. Pass `instance_positions_for: ["Player"]` to include live instance x/y/angle for specific objects without pulling the raw dump. Launch a preview first with `gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }`.
- `capture_preview_screenshot`: capture a PNG of the current rendered frame from a running preview, to visually verify sprites, layout, and colors. Pass `file_path` to write a PNG (recommended), or omit it to get a base64 data URL. Launch a preview first.
- `simulate_preview_input`: inject keyboard/mouse/touch input into a running preview to verify input-driven gameplay (movement, shooting, restart) end-to-end. Pass `inputs: [{ type, ... }]`. Key events use a key name (`"Left"`, `"Space"`, `"a"`) or `key_code`. Press and release are separate events; hold a key by sending `keyPressed` without `keyReleased`. To register a "just pressed" (e.g. restart on ENTER), send only `keyPressed` and let a frame pass (see `control_preview` step) before release. After injecting, use `gdevelop_inspect_running_preview` / `capture_preview_screenshot` to confirm the effect.
- `control_preview`: deterministically control a running preview — `action: "pause" | "play" | "step"`. `step` advances exactly `frames` frames (with `frame_delta_ms` simulated time each) while paused, making runtime tests reproducible regardless of how long MCP round-trips take. The canonical deterministic test loop: pause → simulate_preview_input / set_runtime_state → step N frames → inspect.
- `set_runtime_state`: inject test state into a running preview — `operations: [{ type, ... }]` for `setVariable` (scope scene/global), `moveInstance`, `spawnInstance`, `deleteInstance`. Use to reach states that are hard to trigger naturally (e.g. set GameOver=0, spawn an enemy, reposition the player) instead of hacking game variables through the UI.
- `gdevelop_list_commands`: command palette command names.
- `search_docs` / `read_full_docs`: GDevelop docs when available through the editor integration.
- `read_game_project_json`: legacy full project JSON reader.

Event/introspection helpers:

- `gdevelop_get_events_json_examples`: examples of valid serialized event JSON and `add_scene_events` payloads — including Standard, Comment, Group, ForEach, Repeat, While, and Or/And sub-condition shapes. Also returns `parameterSyntaxRules` (which parameter types need quotes vs bare values), `variableExpressionSyntax` (how to reference scene/global/object variables in expressions), and `commonInstructionTypes` (a cheat-sheet of frequently-needed internal type names).
- `gdevelop_get_event_operation_reference`: supported `event_changes` operations and target path format.
- `gdevelop_validate_events_json`: parse, render, and check event JSON without modifying the project. Pass `dedupe_errors: true` to collapse repeated failures into one entry per root cause (with a `count`) instead of one entry per occurrence.
- `validate_events_json_file`: validate a local events JSON file without writing it. Use before `replace_scene_events_from_file` for large event sheets. Also supports `summary_only` and `dedupe_errors`.
- `gdevelop_search_instruction_metadata`: find action/condition/expression metadata by internal type, name, description, object, or behavior. Multi-word queries are tokenized (all words must match) and common intents ("play sound", "key pressed", "change position", "delete object", "scene variable", "restart scene", "random number") are aliased to GDevelop internal types (including French/legacy names like `MettreX`, `ModVarObjet`, `Scene`). Results are ranked by relevance. Pass `compact: true` to drop verbose per-parameter `valueType` discriminators while keeping parameter types and `literalSyntax` hints.
- `gdevelop_get_instruction_metadata`: exact metadata, including parameter order, parameter types, and a `literalSyntax` hint per parameter that states whether a literal needs quotes. Pass `compact: true` for a trimmed result. The result also includes `fieldNotes` clarifying that `isRelevantForSceneEvents` maps to GDevelop's `isRelevantForLayoutEvents()` and does NOT forbid scene usage when false (object-variable instructions report false yet work in scenes).
- `lint_scene_events`: check MCP event authoring rules: root events must be semantic Groups and JavaScript events are disallowed unless explicitly requested.

Write tools:

- `initialize_project`: create a project.
- `create_scene` / `delete_scene`: scene management.
- `set_first_layout`: set the project startup scene/layout in the editor model. Use this instead of patching saved JSON.
- `set_project_properties`: set project name, startup scene, resolution, runtime resolution adaptation, FPS limits, orientation, and scale mode.
- `create_or_replace_object`: create, duplicate, replace, or move object definitions.
- `replace_object_definition`: replace/create a scene object from complete serialized object JSON; type changes are allowed after validation.
- `delete_scene_object`: delete a scene object and clean up references/instances through GDevelop refactoring.
- `set_object_properties`: set object properties using names from `inspect_object_properties`.
- `set_text_object_properties`: high-level TextObject setter for text, size, color, bold/italic, alignment, outline, shadow, font, and line height.
- `create_sprite_object_from_resource`: high-level Sprite authoring helper. It creates or updates a scene Sprite from an existing image resource, binds a default animation frame, and can create one initial instance. Frames created without an explicit `collisionMask` default to a full-image (bounding box) collision mask so collisions work; pass `fullImageCollisionMask: true` or a non-empty `collisionMask` to override.
- `create_text_object`: high-level TextObject authoring helper. It creates or updates a scene TextObject with text properties and can create one initial instance.
- `add_or_update_resource`: add/update a project resource with `name`, `file`, `kind`, and metadata. For audio, use `metadata.preloadAsSound`, `metadata.preloadAsMusic`, `metadata.preloadInCache`, and `metadata.userAdded`.
- `generate_placeholder_asset`: generate a simple placeholder PNG image (solid color) or WAV sound (beep/noise) on disk and register it as a resource — lets a from-scratch playable demo be built entirely inside MCP without external art/audio tooling. Replace with real assets later by overwriting the file and re-importing the same name.
- `set_sprite_animations`: replace a Sprite object's animations, directions, frames, origin/center/custom points, and collision masks. Set per-animation `loop` (false for one-shot animations like explosions, so HasAnimationEnded can become true) and `timeBetweenFrames` (seconds per frame) — these are first-class fields; do not rely on engine defaults for multi-frame animations.
- `bulk_edit_scene_assets`: batch import resources, create/replace scene objects, bind Sprite animations, add behaviors, declare scene/global variables, and place 2D instances for one scene — in one call (applied in that order). Use it for initial scene setup to avoid dozens of single-tool round-trips: pass `resources`, `objects`, `sprite_animations`, `behaviors` (`[{ object_name, behavior_type, behavior_name? }]`), `variables` (`[{ scope, name, value, type? }]`), and `instances`.
- `change_object_property`: edit object properties.
- `add_behavior` / `remove_behavior` / `change_behavior_property`: behavior management. `add_behavior` requires `behavior_type` (the internal type, e.g. `PlatformBehavior::PlatformerObjectBehavior`); discover valid types with `list_available_behaviors`. `remove_behavior` and `change_behavior_property` take the behavior NAME (the instance name on the object), not the type.
- `put_2d_instances` / `put_3d_instances`: place, move, update, or erase scene instances.
- `add_or_edit_variable`: create or modify global, scene, object, behavior variables.
- `change_scene_properties_layers_effects_groups`: scene/game properties, layers, effects, object groups. Pass `changed_properties` / `changed_layers` / `changed_layer_effects` / `changed_groups` arrays (see `get_tool_usage_examples`). Create a layer (e.g. a HUD layer) by naming a `layer_name` that does not exist yet in `changed_layers`.
- `add_scene_events`: direct event sheet edits. Prefer `events_json` or `event_changes`.
- `generate_events`: alias for `add_scene_events`.
- `create_group`: create an empty scene event Group.
- `wrap_events_in_group`: create a Group and move sibling target events into it.
- `move_events_to_group`: move existing events into an existing Group.
- `rename_group`: rename a Group and optionally update folded state/color.
- `ensure_scene_event_ids`: assign stable `aiGeneratedEventId` values to events that do not already have one.
- `replace_scene_events_from_file`: replace a scene event sheet from a local JSON file after validation.
- `apply_validated_scene_patch`: apply focused scene JSON patch; for large patches use `patch_file`.
- `create_or_update_plan`: store/update an AI orchestration plan when the task needs one.

Extension write tools:

- `gdevelop_create_or_update_extension`: create/update extension metadata. Supports `extension_name`, optional `new_extension_name`, `namespace`, `full_name`, `short_description`, `description`, `version`, `category`, `dimension`, `help_path`, `icon_url`, `preview_icon_url`, `tags`, and advanced `serialized_extension`.
- `gdevelop_delete_extension`: delete a project-specific extension.
- `gdevelop_create_or_update_extension_function`: create/update a free, behavior, or object function. Supports `parent_kind` (`extension`, `behavior`, `object`), `parent_name`, `function_type`, `full_name`, `description`, `sentence`, `help_url`, privacy/async/deprecated flags, `parameters`, `expression_type`, `events_json`, and advanced `serialized_function`.
- `gdevelop_delete_extension_function`: delete a free, behavior, or object function.
- `gdevelop_create_or_update_extension_behavior`: create/update an events-based behavior. Supports `behavior_name`, optional rename, display metadata, `object_type`, privacy, icons, and advanced `serialized_behavior`.
- `gdevelop_delete_extension_behavior`: delete an events-based behavior.
- `gdevelop_create_or_update_extension_object`: create/update an events-based object. Supports `object_name`, optional rename, display metadata, default name, privacy, 3D/text/animation/inner-area flags, icons, `area`, and advanced `serialized_object`.
- `gdevelop_delete_extension_object`: delete an events-based object.
- `gdevelop_create_or_update_extension_property`: create/update a behavior/object property. Supports `target_kind`, `target_name`, `property_name`, optional rename, `property_type`, `value`, `label`, `description`, `measurement_unit`, `group`, visibility/advanced/deprecated flags, `extra_info`, `choices`, `is_shared` for behavior shared properties, and advanced `serialized_property`.
- `gdevelop_delete_extension_property`: delete a behavior/object property.

Command tool:

- `gdevelop_run_command`: run editor command palette commands, for example previewing. Only use after checking `gdevelop_list_commands`; command tools may be disabled.
- `gdevelop_save_project_and_wait`: save the project and wait for the editor save promise. Prefer this over `gdevelop_run_command` with `SAVE_PROJECT` when available.

Resources:

- `gdevelop://editor/state`
- `gdevelop://project/summary`
- `gdevelop://project/json`
- `gdevelop://project/resources.json`
- `gdevelop://project/extensions-summary`
- `gdevelop://scene/{sceneName}/events.txt`
- `gdevelop://scene/{sceneName}/events.json`
- `gdevelop://scene/{sceneName}/scene.json`
- `gdevelop://scene/{sceneName}/instances.json`
- `gdevelop://scene/{sceneName}/objects.json`

Prompts:

- `inspect-current-game`
- `implement-game-feature`
- `fix-scene-events`
- `layout-scene`
- `refactor-gameplay`

## Permissions

Tools are permission-gated by the editor:

- If a write tool returns that write MCP tools are disabled, do not retry the same write. Ask the user to enable write tools in preferences or continue with read-only analysis.
- If `gdevelop_run_command` is disabled, do not simulate commands through unrelated write tools.
- `gdevelop_editor_call` is an escape hatch, not a shortcut around permissions. It still follows the same read/write restrictions.

Hard requirement: never directly edit, patch, overwrite, or otherwise mutate the opened GDevelop project `.json` file on disk. All project mutations must go through MCP tools, then be persisted with `gdevelop_save_project_and_wait`. Reading project JSON for verification is allowed; writing temporary events JSON files for `validate_events_json_file` or `replace_scene_events_from_file` is allowed. Disk-only project JSON edits can be overwritten by the editor and can desynchronize MCP state.

## Event Editing Workflow

Use this sequence for adding or modifying events.

Hard requirement: every event the AI creates or modifies must end inside the appropriate semantic Group. The root event sheet should contain Group events as the organizing units; do not leave Standard, While, Repeat, JavaScript, or other gameplay events ungrouped at the root. This applies to scene event sheets and extension function event sheets. If related existing events are ungrouped, group them as part of the edit before the final read-back.

Hard requirement: unless the user explicitly requests JavaScript, implement business/gameplay logic with GDevelop's standard events, conditions, actions, expressions, behaviors, and extensions. Do not create JavaScript events, including serialized events such as `BuiltinCommonInstructions::JsCode`, as a shortcut for normal logic. If a task appears hard with standard events, search instruction metadata and available extensions first; ask for confirmation before using JavaScript.

1. `read_scene_events` to understand the current event sheet.
2. For precise edits, call `read_scene_events_serialized`. If events lack stable IDs, call `ensure_scene_event_ids` before doing multiple operations. Stable IDs survive grouping/moving better than `event-14` paths.
3. If the user asked to modify or insert near the currently selected event, call `gdevelop_get_editor_selection` while the events editor has focus. Use `primarySelection.selectedEvents[0].aiGeneratedEventId` when present, otherwise `eventPath`.
4. If the target is not selected, use `find_scene_events` by action type, condition type, group name, parameter text, or `ai_generated_event_id`; avoid guessing paths from rendered text.
5. Identify the semantic destination Group before drafting or writing: examples include `Player input`, `Enemy behavior`, `UI`, `Audio`, `Scoring`, `Scene setup`, or the specific extension function purpose.
6. If the destination Group does not exist, create it with `create_group`. If related events already exist outside the Group, move or wrap them with `move_events_to_group` or `wrap_events_in_group`.
7. `gdevelop_get_events_json_examples` to refresh the serialized shape if needed.
8. `gdevelop_search_instruction_metadata` for each action, condition, or expression you plan to use.
9. `gdevelop_get_instruction_metadata` for exact internal type and parameter order.
10. Declare required global/scene/object variables BEFORE validation. A bare variable name like `Score` that is not declared fails validation as `invalid-parameter` even though the value format is correct — the suggestion now says "Variable X is not declared". Either call `add_or_edit_variable` first (or `bulk_edit_scene_assets` with `variables`), OR use the `event_changes` write path with an `undeclared_variables` array to auto-declare them. Note: the plain `events_json` path does NOT auto-declare variables; only `event_changes` (with `undeclared_variables`/`undeclared_object_variables`) does. Do not wait for repeated invalid variable parameter errors.
11. Draft `events_json` as a JSON string containing an array of serialized GDevelop events. Use standard event types and standard instructions by default; do not include JavaScript event types unless the user explicitly requested JavaScript.
12. For large event sheets, write the JSON to a local file and call `validate_events_json_file` with `summary_only: true`. For small payloads, call `gdevelop_validate_events_json`.
13. If validation reports any issue, read `issueSummary.rootCauses` first (or pass `dedupe_errors: true` to get one entry per root cause directly), then fix the JSON, metadata choice, parameter value, or missing project object/variable/resource. Each invalid-parameter error includes `parameterType` and a type-aware `suggestion`; trust the suggestion over guessing whether to add quotes. Do not write invalid events.
14. If valid, call `add_scene_events` with `event_changes` targeting the destination Group/sub-event list, or `replace_scene_events_from_file` with `summary_only: true` for whole-sheet replacement. Use append-at-end only when the appended event is a Group or when immediately wrapping/moving the new events into the correct Group.
15. If the write tool rejects the events with validation errors, treat the write as not applied. Fix and validate again before retrying.
16. `read_scene_events` and `read_scene_events_serialized` again.
17. Run `lint_scene_events`. If it reports ungrouped root events or JavaScript events, fix them before finishing.
18. If object/variable/resource references were created or expected, read the relevant object/variable/scene/resource summary too.

Never use `add_scene_events` with a natural language description expecting server-side generation. MCP direct event writing does not call the GDevelop AI event generation service. Always pass `events_json` or `event_changes`.

### Event-write paths (capability differences)

| Path | Input | Auto-declares variables? | Use for |
|------|-------|--------------------------|---------|
| `add_scene_events` / `generate_events` with `events_json` | one JSON array, append-or-target | NO | simple appends; declare variables first |
| `add_scene_events` with `event_changes` | per-change ops + `undeclared_variables`/`undeclared_object_variables`/`missing_object_behaviors`/`missing_resources` | YES (via those fields) | precise edits; let the write auto-declare referenced variables/behaviors |
| `replace_scene_events_from_file` | whole sheet from a (project-relative or absolute) JSON file | NO | very large whole-sheet replacement |
| `apply_validated_scene_patch` | JSON-pointer patch of the serialized scene | n/a | small structural fixes no focused tool covers |

Hidden/code-only parameters (e.g. `currentScene`, `conditionInverted`, `objectsContext`) must still be present as empty-string `""` placeholders at their position in the `parameters` array — `gdevelop_get_instruction_metadata` lists every parameter including these; do not drop them. Condition negation has two mechanisms: most conditions use the event/instruction `type.inverted` boolean, but a few (e.g. `CollisionNP`) use a dedicated `conditionInverted` positional parameter — check the metadata for which applies.

`events_json` is a STRING containing a JSON array (double-encoded). Generate it programmatically (e.g. `JSON.stringify`) and prefer the file-based `validate_events_json_file` → `replace_scene_events_from_file` flow for anything non-trivial — inlining hand-escaped JSON strings is error-prone.

ForEach / Repeat / While / Or / And shapes: ForEach uses an `object` field; Repeat uses `repeatExpression`; While uses a `whileConditions` array; Or/And/Not nest their child conditions in a `conditions` array on a `BuiltinCommonInstructions::Or`/`::And`/`::Not` condition. See `gdevelop_get_events_json_examples` for exact JSON. Prefer one OR condition over duplicating an event per input (e.g. arrow keys + WASD).

`gdevelop_validate_events_json` and `add_scene_events` use GDevelop's own instruction metadata and `InstructionValidator` path for parameter validation. This catches expression type errors, unknown instruction types, missing parameters, invalid object/variable references, and malformed string/number expressions before events are inserted.

Resource parameters are also checked. If an event references an audio/image/etc. resource, validation must confirm the resource exists, has the expected kind, has a non-empty `file`, and the local file exists when the path can be resolved. If validation reports `resource-empty-file` or `resource-missing-file`, fix the resource with `add_or_update_resource` or inspect with `inspect_project_resources` before writing events.

Validation responses include `issueSummary`. Use it before inspecting every repeated issue: `byType` shows counts and `rootCauses` groups repeated errors by likely fix (or pass `dedupe_errors: true` to receive only the grouped causes). Quoting depends on the parameter TYPE, and each error reports its `parameterType` and a type-aware `suggestion`:

- String-expression parameters (`string`, `keyboardKey`, `color`, `sceneName`, `layer`, `file`, `identifier`) take a value WITH embedded double quotes, e.g. `"Space"`, `"220;30;55"`, `"Game Over"`. Note the Scene action's scene name parameter is also a quoted string, e.g. `"Game"`. As a safety net, `add_scene_events`/`generate_events` auto-wrap a bare literal for the unambiguous identifier-like types (`keyboardKey`, `color`, `sceneName`, `layer`, `identifier`, animation/effect names) — but `string`/`text` are NOT auto-wrapped (they often use `+` concatenation), so quote those yourself.
- Bare values (no quotes): object names, behavior NAMES (not behavior types), number/numeric expressions (e.g. `100`, `Variable(Score)`), and variable references.
- Resource-name parameters (`soundfile`, `musicfile`, `imageResource`, `fontResource`, `jsonResource`, `videoResource`, `bitmapFontResource`, `model3DResource`, `audioResource`, etc.) take a BARE resource name with NO quotes — e.g. `Shoot`, not `"Shoot"`. This is the opposite of string parameters and a common 6-error pitfall when adding sound/music actions. The resource must already exist (`add_or_update_resource`). The per-parameter `literalSyntax` from `gdevelop_get_instruction_metadata` states this explicitly.

Variable expression syntax (see `gdevelop_get_events_json_examples` → `variableExpressionSyntax`): a scene variable is referenced by bare name (`Variable(Score)` in an expression, or just `Score` in a variable parameter) — not `SceneVariable(Score)`. A global variable is `GlobalVariable(Name)`. An object variable is `Object.VariableName` in expressions (e.g. `Player.Life`) — not `VarObjet(...)`.

The field `isRelevantForSceneEvents` (from `gdevelop_get_instruction_metadata`) maps to GDevelop's `isRelevantForLayoutEvents()`. A value of false does NOT mean the instruction is unusable in scene events; object-variable instructions (`ModVarObjet` / `VarObjet`) report false yet work in scene events.

For extension function event bodies, use the same event JSON shape and metadata workflow. `gdevelop_create_or_update_extension_function` validates `events_json` before replacing the function's event list. Invalid function event JSON must be fixed before retrying.

## Event JSON Shape

A standard event:

```json
[
  {
    "type": "BuiltinCommonInstructions::Standard",
    "conditions": [
      {
        "type": { "value": "SceneJustBegins" },
        "parameters": [""]
      }
    ],
    "actions": [
      {
        "type": { "value": "SetNumberVariable" },
        "parameters": ["Score", "=", "0"]
      }
    ],
    "events": []
  }
]
```

Important rules:

- `events_json` must be a string containing a JSON array, not a raw array object.
- Instruction `type.value` must be the exact internal GDevelop type.
- `parameters` order must match `gdevelop_get_instruction_metadata`.
- Empty string parameters can be meaningful; do not omit them unless metadata says they are optional.
- Use double quotes inside text expressions, for example `"Hello"`. A color text expression must be `"220;30;55"` in the parameter string, not `220;30;55`.
- For numeric expressions, pass expression text such as `100 * TimeDelta()`.
- Object, behavior, variable, layer, and resource parameters are validated against the current project/scene scope. Create or declare them before validating, or include the relevant `undeclared_variables`, `undeclared_object_variables`, `missing_object_behaviors`, or `missing_resources` fields in `event_changes` when using direct writes that need them.
- Include nested `events` only when the event type can have sub-events.

## Event Operations

For append-at-end:

```json
{
  "scene_name": "Level1",
  "events_json": "[{\"type\":\"BuiltinCommonInstructions::Standard\",\"conditions\":[],\"actions\":[]}]"
}
```

For precise edits:

```json
{
  "scene_name": "Level1",
  "event_changes": [
    {
      "operation_name": "insert_after_event",
      "operation_target_event": "event-0",
      "generated_events": "[{\"type\":\"BuiltinCommonInstructions::Standard\",\"conditions\":[],\"actions\":[]}]"
    }
  ]
}
```

Target paths:

- `event-0`: first root event.
- `event-0.1`: second sub-event of first root event.
- An existing `aiGeneratedEventId` can also target generated events.

Common operations:

- `insert_at_end`: no target, appends root events.
- `insert_before_event` / `insert_after_event`: insert around a target.
- `insert_as_sub_event`: add generated events as sub-events.
- `insert_and_replace_event` or `replace_entire_event_and_sub_events`: replace target event and sub-events.
- `replace_event_but_keep_existing_sub_events`: replace target body but keep sub-events.
- `insert_actions_conditions_at_end` / `insert_actions_conditions_at_start`: merge generated standard-event actions/conditions into a target standard event.
- `replace_all_actions` / `replace_all_conditions`: replace those lists on the target standard event.
- `delete_event`: delete one event; comma-separated targets are supported only here.

Call `gdevelop_get_event_operation_reference` when unsure.

## Event Groups

Use event Group tools for organization instead of replacing the entire scene events array.

Grouping is mandatory for AI-authored event edits. Every added or changed event must belong to the semantic Group that explains why that logic exists. A compliant final event sheet has no newly added or modified gameplay event left ungrouped at the root. When an edit touches existing root-level logic, wrap or move that logic into the best matching Group as part of the same operation.

1. `read_scene_events_serialized`.
2. `ensure_scene_event_ids` if target events do not already have `aiGeneratedEventId`.
3. `find_scene_events` to locate target events by stable id, action/condition type, group name, or text.
4. Decide the destination Group name from the feature/domain, not from implementation trivia.
5. `wrap_events_in_group` when sibling target events need a new Group.
6. `create_group` plus `move_events_to_group` when the Group already exists or the targets are being collected over multiple steps.
7. `rename_group` for group names, folded state, and color.
8. Read back with `read_scene_events_serialized`.
9. Confirm every created/modified event is inside the intended Group before reporting completion.
10. If the edit was intended to only organize events, compare before/after arrays with `compare_scene_events_semantics`.

Do not rely on `event-14` after grouping or moving; paths can change. Prefer `ai_generated_event_id` once IDs have been assigned.

## Common Task Recipes

Create a new scene:

1. `gdevelop_get_editor_state`.
2. `gdevelop_list_scenes`.
3. `create_scene`.
4. `gdevelop_list_scenes`.

Add an object:

1. `gdevelop_list_objects` for the scene.
2. `create_or_replace_object`.
3. `inspect_object_properties`.
4. If it needs to appear in the scene, use `put_2d_instances` or `put_3d_instances`.

Import local images/audio and bind Sprite frames:

1. `inspect_project_resources` with `compact: true` to see current counts, invalid paths, true event resource references, and missing Sprite frame references without generic string-reference noise.
2. For initial scene setup or many assets, prefer `bulk_edit_scene_assets` with `resources`, `objects`, `sprite_animations`, `behaviors`, `variables`, and `instances` in one call.
3. For focused edits, call `add_or_update_resource` for each file. Use a non-empty relative path when the file is inside the project folder; absolute paths are accepted but must be valid. For audio, pass `kind: "audio"` and metadata such as `preloadAsSound: true` and `userAdded: true`. If you overwrite an image/audio file on disk under the same resource name, call `add_or_update_resource` again for that name to refresh the editor's texture/cache (re-importing the same name reloads it); a running preview needs a fresh preview launch or hot reload to pick up the new pixels.
4. For a simple Sprite from one image resource, prefer `create_sprite_object_from_resource` over hand-writing serialized Sprite object JSON. Use `create_instance: true` or top-level `x`/`y` fields when the object should appear in the scene.
5. For existing Sprite objects with multiple animations/directions/frames, call `set_sprite_animations`. Frame `image` must be the image resource name.
6. `inspect_project_resources` again, usually with `compact: true`. Check `invalidResources`, `missingSpriteFrameReferences`, `eventResourceReferences`, and `unusedResources`. `eventResourceReferences` reports parameters whose instruction metadata says they are resources; use full `stringReferences` only when investigating broad serialized matches.
7. `read_serialized_scene` to verify objects, instances, and frames.

Set text object properties:

1. If the Text object does not exist yet, use `create_text_object` with text properties and optional initial placement.
2. For existing `TextObject::Text`, use `set_text_object_properties`. Prefer it over raw `set_object_properties` for text, character size, color, bold, italic, alignment, outline, shadow, font, and line height.
3. Read back with `inspect_object_properties` or `read_serialized_scene`.

Find cleanup candidates:

1. Use `inspect_project_cleanup` before deleting old template scenes, unused objects, or unused resources.
2. Treat `possiblyUnusedSceneObjects` as a heuristic, not proof. Objects without initial instances may still be created by events or extensions.
3. Review `suspiciousCollisionMasks`. Each entry is a Sprite frame whose collision region is empty, so collisions against that object never trigger. Fix by giving the frame a full-image mask or a non-empty custom mask via `set_sprite_animations`.
4. Use focused delete tools only after confirming the item is safe to remove: `delete_scene`, `delete_scene_object`, or resource tools when available.

Set project startup/settings:

1. After creating/deleting scenes, call `set_first_layout` with the intended startup scene. The result reports `verifiedFirstLayout`; persist with `gdevelop_save_project_and_wait`, and if a later disk inspection shows `firstLayout` empty, re-run and save again.
2. Use `set_project_properties` for project name, startup scene, resolution, FPS, orientation, and scale mode. Note: changing the project (game) NAME does not rename the `.json` file on disk — there is no file-rename tool, so the display name and file name can legitimately differ; this is expected, not a bug.
3. Do not patch `firstLayout` only in the saved disk JSON; a later editor save can overwrite disk-only edits from the in-memory project model.

Place or move instances:

1. `describe_instances`.
2. If the user refers to the currently selected instance, call `gdevelop_get_editor_selection` and use `selectedInstances[].id` with `put_2d_instances` or `put_3d_instances`.
3. `inspect_object_properties` for dimensions and type.
4. `put_2d_instances` or `put_3d_instances`.
5. `describe_instances` again.

Add a behavior:

1. `inspect_object_properties`.
2. `list_available_behaviors` with `object_name` to get the exact `behaviorType` (and `defaultName`) compatible with the object, and `objectBehaviors` for the names of behaviors already on it (including capability behaviors like Text/Animation used in instruction behavior parameters). Do not guess behavior type or capability-name strings.
3. `add_behavior` with that `behavior_type` (or add several at once via `bulk_edit_scene_assets` `behaviors`). Omit `behavior_name` to use the default name (recommended); that default name is what you reference in instruction behavior parameters.
4. `inspect_behavior_properties`.
5. `change_behavior_property` if defaults need adjustment (target by behavior NAME, pass `changed_properties: [{ property_name, new_value }]`).

Change variables:

1. `gdevelop_get_project_summary` scoped to relevant scene if possible.
2. `add_or_edit_variable`. For an object variable (`variable_scope: "object"`), pass `scene_name` too unless the object is a global object — scene objects are not found without it. If you omit it for a scene object, the error names the owning scene.
3. Read summary or relevant object properties again.

Add gameplay logic:

1. Read current scene events and objects.
2. If the user refers to the currently selected event, call `gdevelop_get_editor_selection` and use `primarySelection.selectedEvents[0].eventPath` or `selectedEventPaths[0]` as the target path for `event_changes`.
3. Find or create the semantic Group for the gameplay feature. Do not add root-level gameplay events.
4. Search exact instruction metadata for needed standard conditions/actions. Do not use JavaScript events unless the user explicitly requested JavaScript.
5. Validate event JSON.
6. Write with `add_scene_events` targeting that Group, or write then immediately move/wrap into the Group.
7. Read events back and verify the new/changed events are grouped and not JavaScript events.

Create or edit an extension:

1. `gdevelop_list_extensions`.
2. If the extension exists, `gdevelop_inspect_extension`; otherwise call `gdevelop_create_or_update_extension`.
3. Add/edit behaviors with `gdevelop_create_or_update_extension_behavior`.
4. Add/edit objects with `gdevelop_create_or_update_extension_object`.
5. Add/edit behavior or object properties with `gdevelop_create_or_update_extension_property`.
6. Add/edit functions with `gdevelop_create_or_update_extension_function`.
7. Read back with `gdevelop_inspect_extension`.

Add an extension free function:

1. `gdevelop_inspect_extension`.
2. Decide exact `function_type`: `action`, `condition`, `expression`, `expression_and_condition`, or `action_with_operator`.
3. If adding events, search instruction metadata and draft valid `events_json`.
4. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "extension"`.
5. `gdevelop_inspect_extension_function`.

Add a behavior method:

1. `gdevelop_inspect_extension_behavior`.
2. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "behavior"` and `parent_name`.
3. Remember GDevelop inserts mandatory behavior parameters first: usually object and behavior parameters. Custom parameters follow them, so `_PARAM0_` and `_PARAM1_` may already be reserved in the sentence.
4. `gdevelop_inspect_extension_function`.

Add an object method:

1. `gdevelop_inspect_extension_object`.
2. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "object"` and `parent_name`.
3. Remember GDevelop inserts mandatory object parameters first. Custom parameters follow them.
4. `gdevelop_inspect_extension_function`.

Add a behavior/object property:

1. Inspect the target behavior/object first.
2. Use `gdevelop_create_or_update_extension_property`.
3. For behavior shared properties, pass `is_shared: true`; for object properties, omit it or pass false.
4. Inspect the target again.

Fix broken gameplay:

1. `read_scene_events`.
2. Inspect referenced objects/behaviors/variables.
3. Search metadata for suspicious unknown or mismatched instructions.
4. Use `event_changes` for a targeted replacement, not a full rewrite.
5. Validate, write, read back.

Run a command:

1. `gdevelop_list_commands`.
2. Confirm the exact command exists.
3. `gdevelop_run_command`.
4. Observe/read state as needed. Preview launch commands (e.g. `LAUNCH_NEW_PREVIEW`) only confirm that the editor accepted the command; they do not themselves return runtime state. To verify runtime behavior, call `gdevelop_inspect_running_preview` after launching (see "Verify runtime behavior"). Do not claim a runtime smoke test passed unless `gdevelop_inspect_running_preview` (or another runtime/debugger tool) actually reported the evidence.

Verify runtime behavior:

1. Launch a preview with `gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }` (requires command tools enabled).
2. Call `gdevelop_inspect_running_preview`. It defaults to the most recently launched preview (`latestDebuggerId`); if several previews are open and you need another, pass `debugger_id`. If `running` is false, relaunch and retry, increasing `timeout_ms` if needed.
3. Read the result: `status`, `errors` (uncaught exceptions, crashes, error logs — check this first), `logs`, and `runtime` (running scene name, `sceneElapsedTimeSeconds`, `objectInstanceCounts` per object from live instances, and scene/global variable values). The counts are real live-instance counts; you do not need `include_raw_dump`. Use `instance_positions_for: ["Player"]` to read live coordinates. Use `sceneElapsedTimeSeconds` (game time) to judge game speed — do NOT infer it from MCP round-trip latency.
4. For DETERMINISTIC, reproducible tests, do not race the wall clock (the game keeps running between your MCP calls, so a stand-still player may already be dead by your next call). Instead: `control_preview { action: "pause" }` → inject input/state → `control_preview { action: "step", frames: N }` to advance exactly N frames → inspect. This makes timing independent of how long you "think" between calls.
5. To verify INPUT-driven gameplay (movement, shooting, restart), use `simulate_preview_input` to inject keys/mouse, then step a frame and inspect/screenshot to confirm the effect (e.g. hold `Left`, step, then check the Player x decreased). A "just pressed" condition (e.g. ENTER to restart) registers only across a frame boundary: send `keyPressed` (no release), step ≥1 frame, then optionally release.
6. To reach hard states, use `set_runtime_state` (e.g. set `GameOver=0`, spawn an enemy, reposition the player) rather than hacking variables through the UI.
7. Confirm audio: `gdevelop_inspect_running_preview` returns `recentSounds` (sounds/musics played since the last inspect) — this is how you verify a `PlaySound` action actually fired.
8. Call `capture_preview_screenshot` with a `file_path` to save a PNG and visually verify sprites, layout, and colors. Read the image back to inspect it.
9. Use these to confirm gameplay actually works: live instance counts, `Score` changes, input moves the player, expected `recentSounds`, empty `errors`, and a correct screenshot.
10. Report concrete runtime evidence (counts, positions, variable values, sounds, screenshot, error list), not just "preview launched".

Save the project:

1. Prefer `gdevelop_save_project_and_wait`.
2. If it returns that the host cannot confirm writes, do not claim the project was saved. Use `gdevelop_run_command` with `SAVE_PROJECT` only as a launch command and tell the user it does not confirm write completion.
3. After saving, read project/resource/event state needed for final verification.

## Decision Rules

- Prefer narrow tools over full JSON.
- Prefer tool discovery before declaring a documented MCP tool unavailable.
- Prefer readback over assumption.
- Prefer exact instruction metadata over remembered internal names.
- Prefer `event_changes` for modifying existing event sheets; use `events_json` for simple append.
- Prefer `find_scene_events` plus stable `aiGeneratedEventId` over path-only references after the first edit.
- Prefer event Group tools over full `/events` replacement for organization-only changes.
- Prefer extension-specific tools over raw serialized extension JSON. Use `serialized_*` only when no structured field exists for the required edit.
- Prefer `replace_scene_events_from_file` with `summary_only: true` for very large event sheets instead of inlining huge JSON strings or returning the full sheet.
- Prefer `validate_events_json_file` before `replace_scene_events_from_file` so validation and writing are separate steps.
- Prefer `issueSummary.rootCauses` over reading every repeated validation issue; or pass `dedupe_errors: true` to validation to get grouped causes directly.
- Prefer `list_available_behaviors` over guessing a `behavior_type` string for `add_behavior`.
- Prefer the per-error `parameterType`/`suggestion` and `literalSyntax` hints over guessing whether a parameter value needs quotes.
- Prefer `compact: true` on `gdevelop_search_instruction_metadata` and `gdevelop_get_instruction_metadata` when you only need types and parameter shapes, to keep responses small.
- Prefer `simulate_preview_input` to verify input-driven gameplay (movement, fire, restart) instead of editing variables as a hack; then inspect/screenshot to confirm.
- For reproducible runtime tests, pause + step frames with `control_preview` rather than relying on wall-clock timing between MCP calls; use `set_runtime_state` to set up hard-to-reach states.
- Use `recentSounds` from `gdevelop_inspect_running_preview` to confirm a sound actually played.
- When an action must affect EACH instance of an object (e.g. every enemy fires a bullet), wrap it in a ForEach event — a plain Standard event's Create/action runs once for a single picked instance. `lint_scene_events` warns (`create-without-for-each`) on the likely-wrong pattern.
- Use `generate_placeholder_asset` to build a playable demo end-to-end inside MCP when you have no art/audio yet; swap in real assets later.
- Independent object/resource creates against one open project can be issued in parallel safely (they mutate the same in-memory project synchronously per call); still read back after the batch. Prefer `bulk_edit_scene_assets` over many parallel calls when possible.
- There is no "initially hidden" flag on an initial instance. To start an object hidden, create it normally and Hide it in a "scene start" (`SceneJustBegins`) event.
- Prefer `instance_positions_for` on `gdevelop_inspect_running_preview` over `include_raw_dump` to read a few instance coordinates.
- Use `sceneElapsedTimeSeconds` from the runtime snapshot to judge game speed; never infer timing from MCP latency.
- Pass resource-name parameters (sound/music/image/font) as BARE names, never quoted.
- To find a capability behavior's name on an object (for instruction behavior parameters), call `list_available_behaviors` with `object_name` and read `objectBehaviors` (Text, Animation, Effect, Opacity, Resizable, Scale, Flippable).
- Declare scene/global variables up front with `bulk_edit_scene_assets` `variables`, or auto-declare via the `event_changes` `undeclared_variables` field; an undeclared variable fails event validation even with a correct bare name.
- Prefer `bulk_edit_scene_assets` (now incl. behaviors + variables) for initial setup to cut round-trips.
- Prefer `capture_preview_screenshot` to visually verify a running preview rather than inferring appearance from instance coordinates.
- Prefer `read_serialized_scene` with `object_name`/`object_names` to inspect a single object instead of dumping the whole scene.
- File-based tools (`validate_events_json_file`, `replace_scene_events_from_file`, `apply_validated_scene_patch` with `patch_file`) accept project-relative paths (resolved against the project folder), the same as resource `file` paths; absolute paths also work.
- Prefer `inspect_project_resources` with `compact: true` before and after asset replacement tasks; request full output only when investigating references.
- Prefer `create_sprite_object_from_resource` for a simple Sprite from one image resource.
- Prefer `create_text_object` for new text labels/HUD, and `set_text_object_properties` for existing text objects.
- Prefer `inspect_project_cleanup` before removing old empty scenes, unused objects, or unused resources.
- Prefer `lint_scene_events` after any event write.
- Use `set_first_layout` or `set_project_properties` for project-level changes. Do not edit project JSON on disk.
- Prefer `bulk_edit_scene_assets` for initial game/scene construction with many resources, objects, Sprite animations, and instances.
- Never directly write the opened project `.json` file, even for small fixes. Use MCP tools and save through the editor.
- Do not delete or replace large event blocks unless the user requested broad refactoring or the current events are clearly wrong.
- When a write returns partial success or errors, stop and inspect the readback before trying another write.
- If the scene/object name is ambiguous, list options and choose the most likely target only when the user request gives enough context.
- When creating behavior/object functions, account for mandatory parameters that GDevelop inserts automatically before custom parameters.

## Validation Checklist

Before claiming completion:

- The target project/scene/object was identified.
- Every generated instruction type came from metadata search or exact metadata lookup.
- Event JSON was validated before insertion, and `issues`/`errors` was empty.
- For file-based event edits, `validate_events_json_file` passed before `replace_scene_events_from_file`.
- Every created or modified event is inside the appropriate semantic Group; no AI-authored gameplay event is left ungrouped at the root.
- No JavaScript event was created or modified unless the user explicitly requested JavaScript.
- `lint_scene_events` passed after event writes.
- Referenced resources have non-empty files and valid paths, or remaining invalid resource paths were explicitly reported.
- If cleanup was requested, `inspect_project_cleanup` was read first and any heuristic candidates were confirmed before deletion.
- The startup scene is set with `set_first_layout` or verified from `read_game_project_json`; do not rely on a disk-only patch.
- No opened project `.json` file was directly edited. All project changes went through MCP tools and were saved with `gdevelop_save_project_and_wait` when persistence was required.
- A write tool reported success or a non-error result.
- The affected scene/object/instance/event sheet/extension was read back.
- For save requests, `gdevelop_save_project_and_wait` returned a saved result, or the limitation of command-only saving was reported.
- Remaining limitations were reported honestly.

## Common Mistakes

- Calling `add_scene_events` with only an English description. Fix: provide `events_json` or `event_changes`.
- Assuming a documented MCP tool does not exist because it is not in the initial active tool list. Fix: use `tool_search` with the exact tool name, then MCP introspection such as `inspect_tool_schema` or `get_tool_usage_examples` when available.
- Guessing parameter order from display text. Fix: call `gdevelop_get_instruction_metadata`.
- Passing raw text where GDevelop expects a text expression. Fix: wrap text in quotes inside the parameter, for example `"Red"` or `"220;30;55"`.
- Passing multiline literal text as a raw parameter. Fix: use a valid text expression such as `"Game Over" + NewLine() + "Press Space"`, or keep the literal on one line inside quotes.
- Inlining a huge event JSON string just to validate. Fix: write a local file and call `validate_events_json_file`.
- Reading repeated validation errors one by one. Fix: use `issueSummary.rootCauses`.
- Forgetting to declare variables before event validation. Fix: call `add_or_edit_variable` first with `variable_scope`, `variable_name_or_path`, and `value`.
- Writing events after validation returned issues. Fix: correct the events first; `add_scene_events` rejects invalid direct event writes.
- Leaving newly created gameplay events at the root event sheet. Fix: create/find the semantic Group first, or immediately wrap/move the events into it.
- Using JavaScript events to implement normal gameplay logic. Fix: use standard GDevelop events/instructions; only use JavaScript when the user explicitly asks for it.
- Editing instances without `describe_instances`. Fix: read existing IDs and positions first.
- Rewriting or patching the opened project JSON file for any change. Fix: use focused MCP tools, then `gdevelop_save_project_and_wait`.
- Replacing all scene events just to group them. Fix: use `wrap_events_in_group`, `move_events_to_group`, and `rename_group`.
- Continuing to use an old `event-N` path after moving/grouping events. Fix: assign/read `aiGeneratedEventId` and target by ID.
- Adding an audio resource with an empty `file`. Fix: call `add_or_update_resource` with a real local path and verify with `inspect_project_resources`.
- Assuming `SAVE_PROJECT` completed because `gdevelop_run_command` returned `launched`. Fix: use `gdevelop_save_project_and_wait`.
- Patching `firstLayout` directly in saved JSON while the editor is open. Fix: call `set_first_layout` or `set_project_properties`, then save through MCP.
- Creating many resources/objects/instances one by one for initial setup. Fix: use `bulk_edit_scene_assets` unless stepwise validation is needed.
- Hand-writing serialized Sprite/Text object JSON for simple objects. Fix: use `create_sprite_object_from_resource` or `create_text_object`.
- Treating preview launch as runtime verification. Fix: after launching, call `gdevelop_inspect_running_preview` (live counts, variables, `errors`) and `capture_preview_screenshot` (visual check), and report that evidence; a launched preview alone is not a passed smoke test.
- Inspecting a stale preview after relaunching. Fix: `gdevelop_inspect_running_preview` defaults to the latest preview; if needed, target a specific one via `debugger_id` (see `availableDebuggerIds`).
- Quoting a resource-name parameter. Fix: sound/music/image/font resource parameters take a BARE name (`Shoot`), not `"Shoot"`; check the param's `literalSyntax`.
- Authoring a multi-frame animation (e.g. an explosion) without setting `timeBetweenFrames`/`loop`. Fix: set them explicitly in `set_sprite_animations`; set `loop:false` for one-shot animations so HasAnimationEnded works.
- Passing a bare variable name that fails validation and assuming it is a quoting problem. Fix: the variable is almost certainly undeclared — declare it (`add_or_edit_variable` / `bulk_edit_scene_assets` `variables`) or use `event_changes` `undeclared_variables`. The bare-name format was already correct.
- Guessing a capability behavior's name (Text/Animation/etc.). Fix: call `list_available_behaviors` with `object_name` and read `objectBehaviors`.
- Trying to verify movement/fire/restart by watching an idle preview or editing variables as a hack. Fix: use `simulate_preview_input` to inject the keys, then inspect/screenshot.
- Racing the wall clock: testing live gameplay across slow MCP round-trips so the game is already over by your next call. Fix: `control_preview` pause + step N frames for deterministic timing; use `set_runtime_state` to set up states.
- Using `Create` (or another per-instance action) in a plain Standard event and expecting it to run for every instance. Fix: wrap it in a ForEach over that object; `lint_scene_events` flags this as `create-without-for-each`.
- Duplicating an event once per input key. Fix: use one event with an `Or` sub-condition (arrows + WASD in a single event).
- Dropping hidden/code-only parameters (currentScene, conditionInverted, objectsContext) from the parameters array. Fix: keep them as `""` placeholders; `gdevelop_get_instruction_metadata` lists every parameter.
- Guessing a `behavior_type` string for `add_behavior`, or passing a behavior TYPE where a behavior NAME is expected (in instruction behavior parameters, `remove_behavior`, or `change_behavior_property`). Fix: call `list_available_behaviors` for the exact type and default name; use the behavior NAME (e.g. `PlatformerObject`) in instruction parameters.
- Leaving a Sprite frame with `hasCustomCollisionMask: true` and an empty `customCollisionMask` (collisions silently never fire). Fix: check `suspiciousCollisionMasks` in `inspect_project_resources`/`inspect_project_cleanup`; give the frame a full-image or non-empty mask via `set_sprite_animations`.
- Omitting `scene_name` when adding an object variable to a scene object. Fix: pass `scene_name` for `variable_scope: "object"` unless the object is global.
- Assuming a multi-word instruction search returns nothing because the phrase is not a literal substring. Fix: `gdevelop_search_instruction_metadata` tokenizes queries and aliases common intents; phrases like "play sound effect" or "change position" now work and results are ranked.
- Assuming command names. Fix: call `gdevelop_list_commands`.
- Forgetting that events without conditions run every frame. Fix: add conditions such as `SceneJustBegins` or a trigger condition when appropriate.
- Adding object-specific events before the object exists. Fix: create/inspect object first.
- Editing extension functions without checking parent kind. Fix: pass `parent_kind` and `parent_name` for behavior/object methods.
- Writing behavior/object function sentences with wrong `_PARAMx_` indexes. Fix: inspect the function after creation and account for mandatory inserted parameters.
- Using `is_shared` for object properties. Fix: only behavior properties can be shared.
