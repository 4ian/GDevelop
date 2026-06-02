---
name: gdevelop-mcp
description: Use when an AI agent is connected to GDevelop through MCP and needs to inspect, create, modify, debug, or verify a GDevelop project, scene, object, instance, behavior, variable, event sheet, or editor command.
---

# GDevelop MCP

## Overview

Use this skill to operate the GDevelop editor through MCP safely and predictably. Always inspect current editor/project state before writing, prefer specialized tools over raw project JSON edits, validate generated event JSON before inserting it, and read back the result after every meaningful change.

GDevelop logic is event-based. A standard event contains `conditions` and `actions`; when all conditions are true, actions run. If an event has no conditions, its actions run every frame. Event order matters.

## First Response Workflow

When a user asks for any GDevelop edit:

1. Call `gdevelop_get_editor_state`.
2. If no project is open and the user asked to edit an existing project, report that no project is open. If the user asked to create one, use `initialize_project`.
3. Call `gdevelop_get_project_summary`. Scope it to a scene only after you know the scene name.
4. Call `gdevelop_list_scenes` if the target scene is unclear.
5. For scene work, call `gdevelop_list_objects` and `read_scene_events` for the target scene.
6. If the user's request refers to "selected", "current object", "this instance", "this event", "the thing I clicked", or similar UI context, call `gdevelop_get_editor_selection` before inferring targets from project data.
7. For layout work, call `describe_instances` before placing, moving, or deleting instances.
8. For object/behavior work, call `inspect_object_properties` and, when relevant, `inspect_behavior_properties`.
9. For extension work, call `gdevelop_list_extensions` and then `gdevelop_inspect_extension` for the target extension before editing functions, events-based objects, events-based behaviors, or extension properties.
10. Make the smallest write that satisfies the user request.
11. Read back with the relevant read tool.
12. Summarize what changed and mention any remaining uncertainty.

Do not start by reading or rewriting the full project JSON unless a focused tool cannot answer the question.

## Tool Map

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
- `read_scene_events_serialized`: raw serialized event JSON for a scene, including event types the text renderer cannot describe.
- `find_scene_events`: locate events by `event_path`, `ai_generated_event_id`, group name, event type, action type, condition type, parameter text, or serialized text.
- `compare_scene_events_semantics`: compare two serialized event arrays while ignoring visual Group wrappers and stable IDs.
- `inspect_project_resources`: resource table audit: name/kind/file, empty or missing files, unused resources, Sprite frame references, and generic serialized references.
- `describe_instances`: object instances in a scene; use before `put_2d_instances` or `put_3d_instances`.
- `inspect_object_properties`: object properties, behaviors, animations, size hints.
- `inspect_behavior_properties`: behavior details on an object.
- `inspect_scene_properties_layers_effects`: scene properties, layers, effects.
- `gdevelop_list_commands`: command palette command names.
- `search_docs` / `read_full_docs`: GDevelop docs when available through the editor integration.
- `read_game_project_json`: legacy full project JSON reader.

Event/introspection helpers:

- `gdevelop_get_events_json_examples`: examples of valid serialized event JSON and `add_scene_events` payloads.
- `gdevelop_get_event_operation_reference`: supported `event_changes` operations and target path format.
- `gdevelop_validate_events_json`: parse, render, and check event JSON without modifying the project.
- `gdevelop_search_instruction_metadata`: find action/condition/expression metadata by internal type, name, description, object, or behavior.
- `gdevelop_get_instruction_metadata`: exact metadata, including parameter order and parameter types.

Write tools:

- `initialize_project`: create a project.
- `create_scene` / `delete_scene`: scene management.
- `create_or_replace_object`: create, duplicate, replace, or move object definitions.
- `replace_object_definition`: replace/create a scene object from complete serialized object JSON; type changes are allowed after validation.
- `delete_scene_object`: delete a scene object and clean up references/instances through GDevelop refactoring.
- `set_object_properties`: set object properties using names from `inspect_object_properties`.
- `add_or_update_resource`: add/update a project resource with `name`, `file`, `kind`, and metadata. For audio, use `metadata.preloadAsSound`, `metadata.preloadAsMusic`, `metadata.preloadInCache`, and `metadata.userAdded`.
- `set_sprite_animations`: replace a Sprite object's animations, directions, frames, origin/center/custom points, and collision masks.
- `change_object_property`: edit object properties.
- `add_behavior` / `remove_behavior` / `change_behavior_property`: behavior management.
- `put_2d_instances` / `put_3d_instances`: place, move, update, or erase scene instances.
- `add_or_edit_variable`: create or modify global, scene, object, behavior variables.
- `change_scene_properties_layers_effects_groups`: scene properties, layers, effects, object groups.
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
10. Draft `events_json` as a JSON string containing an array of serialized GDevelop events. Use standard event types and standard instructions by default; do not include JavaScript event types unless the user explicitly requested JavaScript.
11. `gdevelop_validate_events_json` with the drafted string.
12. If validation reports any issue, stop and fix the JSON, metadata choice, parameter value, or missing project object/variable/resource first. Do not write invalid events.
13. If valid, call `add_scene_events` with `event_changes` targeting the destination Group/sub-event list. Use append-at-end only when the appended event is a Group or when immediately wrapping/moving the new events into the correct Group.
14. If the write tool rejects the events with validation errors, treat the write as not applied. Fix and validate again before retrying.
15. `read_scene_events` and `read_scene_events_serialized` again.
16. Verify no created or modified non-Group event remains outside its semantic Group. If any do, call `move_events_to_group` or `wrap_events_in_group` before finishing.
17. Verify no JavaScript event was added or modified unless the user explicitly requested JavaScript.
18. If object/variable/resource references were created or expected, read the relevant object/variable/scene/resource summary too.

Never use `add_scene_events` with a natural language description expecting server-side generation. MCP direct event writing does not call the GDevelop AI event generation service. Always pass `events_json` or `event_changes`.

`gdevelop_validate_events_json` and `add_scene_events` use GDevelop's own instruction metadata and `InstructionValidator` path for parameter validation. This catches expression type errors, unknown instruction types, missing parameters, invalid object/variable references, and malformed string/number expressions before events are inserted.

Resource parameters are also checked. If an event references an audio/image/etc. resource, validation must confirm the resource exists, has the expected kind, has a non-empty `file`, and the local file exists when the path can be resolved. If validation reports `resource-empty-file` or `resource-missing-file`, fix the resource with `add_or_update_resource` or inspect with `inspect_project_resources` before writing events.

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

1. `inspect_project_resources` to see current names and invalid paths.
2. `add_or_update_resource` for each file. Use a non-empty relative path when the file is inside the project folder; absolute paths are accepted but must be valid. For audio, pass `kind: "audio"` and metadata such as `preloadAsSound: true` and `userAdded: true`.
3. For Sprite objects, call `set_sprite_animations` with animations/directions/frames. Frame `image` must be the image resource name.
4. `inspect_project_resources` again. Check `invalidResources`, `spriteFrameReferences`, and `unusedResources`.
5. `read_serialized_scene` to verify objects, instances, and frames.

Place or move instances:

1. `describe_instances`.
2. If the user refers to the currently selected instance, call `gdevelop_get_editor_selection` and use `selectedInstances[].id` with `put_2d_instances` or `put_3d_instances`.
3. `inspect_object_properties` for dimensions and type.
4. `put_2d_instances` or `put_3d_instances`.
5. `describe_instances` again.

Add a behavior:

1. `inspect_object_properties`.
2. `add_behavior`.
3. `inspect_behavior_properties`.
4. `change_behavior_property` if defaults need adjustment.

Change variables:

1. `gdevelop_get_project_summary` scoped to relevant scene if possible.
2. `add_or_edit_variable`.
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
4. Observe/read state as needed.

Save the project:

1. Prefer `gdevelop_save_project_and_wait`.
2. If it returns that the host cannot confirm writes, do not claim the project was saved. Use `gdevelop_run_command` with `SAVE_PROJECT` only as a launch command and tell the user it does not confirm write completion.
3. After saving, read project/resource/event state needed for final verification.

## Decision Rules

- Prefer narrow tools over full JSON.
- Prefer readback over assumption.
- Prefer exact instruction metadata over remembered internal names.
- Prefer `event_changes` for modifying existing event sheets; use `events_json` for simple append.
- Prefer `find_scene_events` plus stable `aiGeneratedEventId` over path-only references after the first edit.
- Prefer event Group tools over full `/events` replacement for organization-only changes.
- Prefer extension-specific tools over raw serialized extension JSON. Use `serialized_*` only when no structured field exists for the required edit.
- Prefer `replace_scene_events_from_file` for very large event sheets instead of inlining huge JSON strings.
- Prefer `inspect_project_resources` before and after asset replacement tasks.
- Do not delete or replace large event blocks unless the user requested broad refactoring or the current events are clearly wrong.
- When a write returns partial success or errors, stop and inspect the readback before trying another write.
- If the scene/object name is ambiguous, list options and choose the most likely target only when the user request gives enough context.
- When creating behavior/object functions, account for mandatory parameters that GDevelop inserts automatically before custom parameters.

## Validation Checklist

Before claiming completion:

- The target project/scene/object was identified.
- Every generated instruction type came from metadata search or exact metadata lookup.
- Event JSON was validated before insertion, and `issues`/`errors` was empty.
- Every created or modified event is inside the appropriate semantic Group; no AI-authored gameplay event is left ungrouped at the root.
- No JavaScript event was created or modified unless the user explicitly requested JavaScript.
- Referenced resources have non-empty files and valid paths, or remaining invalid resource paths were explicitly reported.
- A write tool reported success or a non-error result.
- The affected scene/object/instance/event sheet/extension was read back.
- For save requests, `gdevelop_save_project_and_wait` returned a saved result, or the limitation of command-only saving was reported.
- Remaining limitations were reported honestly.

## Common Mistakes

- Calling `add_scene_events` with only an English description. Fix: provide `events_json` or `event_changes`.
- Guessing parameter order from display text. Fix: call `gdevelop_get_instruction_metadata`.
- Passing raw text where GDevelop expects a text expression. Fix: wrap text in quotes inside the parameter, for example `"Red"` or `"220;30;55"`.
- Writing events after validation returned issues. Fix: correct the events first; `add_scene_events` rejects invalid direct event writes.
- Leaving newly created gameplay events at the root event sheet. Fix: create/find the semantic Group first, or immediately wrap/move the events into it.
- Using JavaScript events to implement normal gameplay logic. Fix: use standard GDevelop events/instructions; only use JavaScript when the user explicitly asks for it.
- Editing instances without `describe_instances`. Fix: read existing IDs and positions first.
- Rewriting full project JSON for a small change. Fix: use focused editor tools.
- Replacing all scene events just to group them. Fix: use `wrap_events_in_group`, `move_events_to_group`, and `rename_group`.
- Continuing to use an old `event-N` path after moving/grouping events. Fix: assign/read `aiGeneratedEventId` and target by ID.
- Adding an audio resource with an empty `file`. Fix: call `add_or_update_resource` with a real local path and verify with `inspect_project_resources`.
- Assuming `SAVE_PROJECT` completed because `gdevelop_run_command` returned `launched`. Fix: use `gdevelop_save_project_and_wait`.
- Assuming command names. Fix: call `gdevelop_list_commands`.
- Forgetting that events without conditions run every frame. Fix: add conditions such as `SceneJustBegins` or a trigger condition when appropriate.
- Adding object-specific events before the object exists. Fix: create/inspect object first.
- Editing extension functions without checking parent kind. Fix: pass `parent_kind` and `parent_name` for behavior/object methods.
- Writing behavior/object function sentences with wrong `_PARAMx_` indexes. Fix: inspect the function after creation and account for mandatory inserted parameters.
- Using `is_shared` for object properties. Fix: only behavior properties can be shared.
