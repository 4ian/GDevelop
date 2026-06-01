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
6. If the user's request refers to "selected", "current object", "this instance", "the thing I clicked", or similar UI context, call `gdevelop_get_editor_selection` before inferring targets from project data.
7. For layout work, call `describe_instances` before placing, moving, or deleting instances.
8. For object/behavior work, call `inspect_object_properties` and, when relevant, `inspect_behavior_properties`.
9. Make the smallest write that satisfies the user request.
10. Read back with the relevant read tool.
11. Summarize what changed and mention any remaining uncertainty.

Do not start by reading or rewriting the full project JSON unless a focused tool cannot answer the question.

## Tool Map

Read-only context:

- `gdevelop_get_editor_state`: project presence, scene names, permissions.
- `gdevelop_get_editor_selection`: current editor UI selection state, including active scene-like editor panes, selected objects, selected layers, and selected scene instances.
- `gdevelop_get_project_summary`: compact project structure, optionally scoped by `sceneName`.
- `gdevelop_read_project_json`: full project JSON; use sparingly and with `maxLength` for large projects.
- `gdevelop_list_scenes`: all scenes/layouts.
- `gdevelop_list_objects`: global objects and scene objects.
- `read_scene_events`: event sheet rendered as text.
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
- `change_object_property`: edit object properties.
- `add_behavior` / `remove_behavior` / `change_behavior_property`: behavior management.
- `put_2d_instances` / `put_3d_instances`: place, move, update, or erase scene instances.
- `add_or_edit_variable`: create or modify global, scene, object, behavior variables.
- `change_scene_properties_layers_effects_groups`: scene properties, layers, effects, object groups.
- `add_scene_events`: direct event sheet edits. Prefer `events_json` or `event_changes`.
- `generate_events`: alias for `add_scene_events`.
- `create_or_update_plan`: store/update an AI orchestration plan when the task needs one.

Command tool:

- `gdevelop_run_command`: run editor command palette commands, for example saving or previewing. Only use after checking `gdevelop_list_commands`; command tools may be disabled.

Resources:

- `gdevelop://editor/state`
- `gdevelop://project/summary`
- `gdevelop://project/json`
- `gdevelop://project/extensions-summary`
- `gdevelop://scene/{sceneName}/events.txt`
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

Use this sequence for adding or modifying events:

1. `read_scene_events` to understand the current event sheet.
2. `gdevelop_get_events_json_examples` to refresh the serialized shape if needed.
3. `gdevelop_search_instruction_metadata` for each action, condition, or expression you plan to use.
4. `gdevelop_get_instruction_metadata` for exact internal type and parameter order.
5. Draft `events_json` as a JSON string containing an array of serialized GDevelop events.
6. `gdevelop_validate_events_json` with the drafted string.
7. If validation reports any issue, stop and fix the JSON, metadata choice, parameter value, or missing project object/variable first. Do not write invalid events.
8. If valid, call `add_scene_events` with `events_json` for append-at-end, or `event_changes` for precise placement/replacement.
9. If the write tool rejects the events with validation errors, treat the write as not applied. Fix and validate again before retrying.
10. `read_scene_events` again.
11. If object/variable/resource references were created or expected, read the relevant object/variable/scene summary too.

Never use `add_scene_events` with a natural language description expecting server-side generation. MCP direct event writing does not call the GDevelop AI event generation service. Always pass `events_json` or `event_changes`.

`gdevelop_validate_events_json` and `add_scene_events` use GDevelop's own instruction metadata and `InstructionValidator` path for parameter validation. This catches expression type errors, unknown instruction types, missing parameters, invalid object/variable references, and malformed string/number expressions before events are inserted.

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
2. Search exact instruction metadata for needed conditions/actions.
3. Validate event JSON.
4. Write with `add_scene_events`.
5. Read events back.

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

## Decision Rules

- Prefer narrow tools over full JSON.
- Prefer readback over assumption.
- Prefer exact instruction metadata over remembered internal names.
- Prefer `event_changes` for modifying existing event sheets; use `events_json` for simple append.
- Do not delete or replace large event blocks unless the user requested broad refactoring or the current events are clearly wrong.
- When a write returns partial success or errors, stop and inspect the readback before trying another write.
- If the scene/object name is ambiguous, list options and choose the most likely target only when the user request gives enough context.

## Validation Checklist

Before claiming completion:

- The target project/scene/object was identified.
- Every generated instruction type came from metadata search or exact metadata lookup.
- Event JSON was validated before insertion, and `issues`/`errors` was empty.
- A write tool reported success or a non-error result.
- The affected scene/object/instance/event sheet was read back.
- Remaining limitations were reported honestly.

## Common Mistakes

- Calling `add_scene_events` with only an English description. Fix: provide `events_json` or `event_changes`.
- Guessing parameter order from display text. Fix: call `gdevelop_get_instruction_metadata`.
- Passing raw text where GDevelop expects a text expression. Fix: wrap text in quotes inside the parameter, for example `"Red"` or `"220;30;55"`.
- Writing events after validation returned issues. Fix: correct the events first; `add_scene_events` rejects invalid direct event writes.
- Editing instances without `describe_instances`. Fix: read existing IDs and positions first.
- Rewriting full project JSON for a small change. Fix: use focused editor tools.
- Assuming command names. Fix: call `gdevelop_list_commands`.
- Forgetting that events without conditions run every frame. Fix: add conditions such as `SceneJustBegins` or a trigger condition when appropriate.
- Adding object-specific events before the object exists. Fix: create/inspect object first.
