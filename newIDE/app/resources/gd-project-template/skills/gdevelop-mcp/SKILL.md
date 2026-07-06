---
name: gdevelop-mcp
description: Use when an AI agent is connected to GDevelop through MCP and needs to inspect, create, modify, debug, or verify a GDevelop project, scene, object, instance, behavior, prefab, signal, variable, event sheet, or editor command.
---

# GDevelop MCP

## Operating Model

Operate the open GDevelop editor through MCP. Inspect before writing, mutate only through MCP tools, validate generated event JSON before insertion, read back after every meaningful change, and save through the editor when persistence is required.

GDevelop logic is event-based. A Standard event runs its actions when all conditions are true. An event with no conditions runs every frame. Event order matters.

Prefer reusable game architecture:

- Use events-based object prefabs for reusable actors, UI widgets, cards, enemies, projectiles, pickups, and repeated gameplay units.
- Use built-in, community, or events-based behaviors before hand-writing equivalent scene events.
- Keep scene events thin: spawning, setup, camera/UI routing, and global flow belong there; object-local mechanics belong in prefab object functions or behavior functions.
- Prefer signals between scene orchestration and prefab internals. Use signal emit helpers for commands/state changes, and receive prefab commands in `onSignal`.

## Tool Discovery

The active MCP tool list can be deferred, permission-gated, or refreshed during a session. A tool name in this skill is not proof that the tool is currently exposed.

Start GDevelop work by calling `gdevelop_capabilities` when visible. It returns the core tools by workflow with one-line summaries. Use `gdevelop_refresh_tool_catalog` after MCP tools reload or if the active catalog looks stale.

Before reporting a tool as unavailable:

1. Check the active tool list.
2. If `tool_search` exists, search the exact tool name, then a broader GDevelop query.
3. Use `inspect_tool_schema` and `get_tool_usage_examples` before guessing payload fields.
4. If only `gdevelop_editor_call` is visible, it may route known tools through `{ "name": "...", "arguments": { ... } }`; prefer direct tools when available.
5. Treat unknown-tool or permission-disabled errors as authoritative after discovery/introspection fails.

Do not compensate for a missing or disabled MCP tool by editing the opened project `.json` on disk. Use another focused MCP tool, ask the user to enable/restart MCP tooling, or report the precise missing capability.

If tool metadata, examples, and docs do not explain a GDevelop object/instruction/serialized shape, consult the GDevelop source at `https://github.com/zhouzhipeng/Gdevelop`. Use extension definitions (`Extensions/<Name>/JsExtension.js`), `AddAction`/`AddCondition` declarations, and `GDJS/Runtime` behavior as the source of truth.

## First Response Workflow

For any GDevelop edit:

1. Discover the required MCP tools if they are not already visible.
2. Call `gdevelop_get_editor_state`.
3. If no project is open, either report that for existing-project edits or use `initialize_project` when the user asked to create one.
4. Call `gdevelop_get_project_summary`; scope by scene only after the scene name is known.
5. Call `gdevelop_list_scenes` if the target scene is unclear.
6. For scene work, call `gdevelop_list_objects` and `read_scene_events`.
7. If the request references selected/current/clicked UI context, call `gdevelop_get_editor_selection`.
8. For layout or instance work, call `describe_instances` before placing, moving, or deleting instances.
9. For object/behavior work, call `inspect_object_properties` and, when relevant, `inspect_behavior_properties`.
10. For Global Config work, call `gdevelop_get_global_config` first and use exact placeholders like `{{cards.Sunflower.price}}`.
11. For extension work, call `gdevelop_list_extensions`, then inspect the target extension/function/object/behavior.
12. Make the smallest write that satisfies the request.
13. Read back with the relevant read tool.
14. Verify, save if requested/needed, and summarize concrete evidence.

Do not start by reading full project JSON unless focused tools cannot answer the question.

## Tool Routing

Use `gdevelop_capabilities` as the live tool map. It groups tools roughly as:

- Project/editor state: editor state, project summary, scenes, objects, selection, Global Config, current project validation.
- Reading/searching: serialized scene/object/events reads, instance/draw-order/resource audits, event finders, extension inspection, signal usage, cleanup, prefab geometry/bindings.
- Instruction discovery: event JSON examples, instruction search, exact instruction metadata.
- Object/assets: resources, Sprite/Text helpers, sprite sheets, tilemaps, bulk scene setup, instances, behaviors, prefab extraction.
- Events: `create_action`, `create_condition`, signal helpers, event write/patch/group tools, event validators, event linters, extension event writers.
- Variables/scenes: variable edits/deletes, Global Config edits, scene create/rename/delete, startup scene/project settings.
- Runtime verification: preview launch, health, `run_frames`, input simulation, runtime state injection, screenshots, static render.
- Safety/persistence: snapshots, validated in-memory JSON patches/sync, save-and-wait.

Keep responses small by using `compact:true`, `summary_only:true`, `object_name`/`object_names`, or file-based payloads when tools support them.

Use MCP resources when they are more direct than tool calls: editor state, project summary/json, Global Config, resources, extensions summary, and per-scene events/scene/objects/instances are exposed under `gdevelop://...`. Use MCP prompts such as `inspect-current-game`, `implement-game-feature`, `fix-scene-events`, `layout-scene`, and `refactor-gameplay` when the host exposes prompts and the task matches them.

When editor docs are available, use `search_docs` / `read_full_docs` for GDevelop documentation. For editor commands, call `gdevelop_list_commands` first, then `gdevelop_run_command`; a command launch is not proof that the resulting action completed.

## Safety And Permissions

Tools are permission-gated by the editor:

- If write tools are disabled, do not retry the same write. Ask the user to enable write tools or continue read-only.
- If command tools are disabled, do not simulate commands through unrelated writes.
- `gdevelop_editor_call` is an escape hatch, not a permission bypass.

Hard requirement: never directly edit, patch, overwrite, or otherwise mutate the opened GDevelop project `.json` file on disk. All project changes must go through MCP tools, then be persisted with `gdevelop_save_project_and_wait` or a validated save path. Reading project JSON is allowed. Writing temporary event/patch JSON files for MCP file-based validation/write tools is allowed.

Use direct serialized JSON only when focused tools do not cover the change, when moving large event/function bodies from files, or when deliberately syncing a full project. Use `validate_current_project_json`, `dry_run:true`, snapshots, and readback before live mutation. Validated JSON patch/sync tools operate on the in-memory editor model; they are not permission to edit disk JSON.

Read `projectFolder` from `gdevelop_get_editor_state` before registering relative resources. The open project folder can differ from the shell cwd.

Before risky multi-step work, call `snapshot_project`. If a write partially succeeds or returns errors, stop, read back, and restore the snapshot when needed instead of piling on more writes.

## Event Authoring

Use this sequence for scene or extension event changes:

1. Read existing events (`read_scene_events`, then serialized reads/finders for precise edits).
2. Assign/read stable event ids with `ensure_scene_event_ids` when doing multiple event operations.
3. Find the semantic destination Group before drafting events.
4. Use `gdevelop_get_events_json_examples`, `gdevelop_search_instruction_metadata`, and `gdevelop_get_instruction_metadata` for every nontrivial instruction.
5. Prefer `create_action` / `create_condition` when hand-aligning parameters, hidden code-only slots, or quoting would be risky.
6. Declare required scene/global/object variables before validation, or use `event_changes` with the appropriate undeclared/missing fields.
7. Validate small payloads with `gdevelop_validate_events_json`; validate large payloads with `validate_events_json_file`.
8. Write with `add_scene_events`/`event_changes`, group tools, file replacement, or a validated patch as appropriate.
9. Read events back and run `lint_scene_events`.
10. Fix validation/lint issues before claiming completion.

Hard requirements:

- Every AI-created or AI-modified gameplay event must end inside a semantic Group. Do not leave root-level Standard/While/Repeat/JavaScript gameplay events. Use `create_group`, `wrap_events_in_group`, `move_events_to_group`, and `rename_group`.
- Every Group must have an explicit, scene-unique color. Set color when creating/wrapping, or fix with `rename_group`.
- Do not create or modify JavaScript events unless the user explicitly requested JavaScript. Use standard GDevelop events, expressions, behaviors, and extensions first.
- Never call `add_scene_events` with only an English description; pass `events_json` or `event_changes`.

Event write paths:

- `add_scene_events` with `events_json`: simple append/target writes. It does not auto-declare variables.
- `add_scene_events` with `event_changes`: precise edits; can auto-declare variables/behaviors/resources through the provided missing/undeclared fields.
- `replace_scene_events_from_file`: large whole-sheet replacement; validate/dry-run first and check `subInstructionsPreserved`.
- `apply_validated_scene_patch`: focused serialized scene fixes when no structured tool covers the change.

Call `gdevelop_get_event_operation_reference` when unsure about `event_changes` operation names or target paths. For organization-only changes, prefer group tools and use `compare_scene_events_semantics` when you need to prove behavior stayed equivalent.

After any write, inspect `staleStateAdvisory`. If previews may be stale, close all previews and relaunch before runtime verification. If editor panels may be stale, trust MCP readback over open tabs until they refresh.

## Event JSON Essentials

Prefer tool-built instructions, but when writing serialized event JSON:

- `events_json` is a JSON string containing an array of serialized events.
- Instruction `type.value` must be the exact current internal type. Prefer modern non-deprecated names from metadata.
- `parameters` order and count must match metadata. Hidden/code-only parameters still need `""` placeholders.
- ForEach uses `object`; Repeat uses `repeatExpression`; While uses `whileConditions`.
- Or/And/Not child conditions go in the instruction's `subInstructions` array, not `conditions` or `actions`. Empty logical conditions match nothing.
- Include nested event `events` only where the event type supports sub-events.

Parameter syntax:

- Text/string-like expression parameters need embedded quotes, e.g. `"Game Over"` or `"220;30;55"`.
- Numeric expressions are bare expression text, e.g. `100`, `Variable(Score)`, `100 * TimeDelta()`.
- Object names, behavior names, variable names, and resource-name parameters are generally bare. Sound/music/image/font resource parameters are bare names such as `Shoot`, not `"Shoot"`.
- Use metadata `literalSyntax`, `acceptedValues`, `parameterShape.parameterTemplate`, and per-error suggestions instead of guessing.

Variable and config syntax:

- Scene variable expression: `Variable(Score)`; variable parameter: `Score`.
- Global variable expression: `GlobalVariable(Name)`.
- Object variable expression: prefer `Object.Variable(Name)`.
- Scene/external events can read Global Config with exact placeholders such as `{{cards.Sunflower.price}}`. Extension/prefab/behavior events should receive config through parameters/properties, not direct Global Config expressions. Global Config is read-only at runtime; edit design-time values with `gdevelop_set_global_config_value` / `gdevelop_delete_global_config_value`.

Extension-specific rules:

- Use `gdevelop_validate_extension_events_json` for extension function bodies and `gdevelop_create_or_update_extension_function` when writing.
- Free function sentences reserve `_PARAM0_` for hidden scene context; first user parameter is usually `_PARAM1_`.
- Behavior functions insert object and behavior parameters before custom parameters; custom sentence placeholders usually start at `_PARAM2_`.
- Object functions insert the object parameter first; custom placeholders usually start at `_PARAM1_`.
- Do not ignore sentence placeholder errors. Fix the sentence or parameter list and retry.
- Events-based object functions cannot reliably spawn arbitrary external object parameters with the normal Create action; spawn scene objects from scene/free functions or manage internal children.

## Task Routes

Assets and objects:

- Audit resources with `inspect_project_resources compact:true` before and after asset work.
- For initial setup, prefer `bulk_edit_scene_assets` with resources, objects, animations, behaviors, variables, instances, and events in one validated call.
- Use `create_sprite_object_from_resource` for simple Sprites and `set_sprite_animations` for existing/multi-frame Sprites. Set `timeBetweenFrames`, `loop`, origins/points, and collision masks intentionally.
- Use `slice_sprite_sheet` for packed sheets and `bind_sprite_animations_from_directory` for common animation folders.
- Use `create_text_object` / `set_text_object_properties` for Text objects.
- Do not hand-write serialized Sprite/Text object JSON when a focused tool covers the case.

Instances and layout:

- Call `describe_instances` first; if the user means the selected instance, read `gdevelop_get_editor_selection`.
- Use `put_2d_instances` / `put_3d_instances`; use `align` for centering/edge placement.
- Initial instance variables can be set directly in `put_2d_instances`.
- Use `inspect_scene_draw_order`, `render_scene_to_png`, or screenshots for visibility/overlap checks.

Behaviors:

- Use `list_available_behaviors` with `object_name` to get exact compatible `behaviorType`, default behavior names, and hidden capability behavior names.
- Use `search_behavior_store` before implementing common mechanics by events.
- Configure added behaviors with `inspect_behavior_properties` and `change_behavior_property`.
- In instruction parameters, use the behavior name, not the behavior type.

Variables and settings:

- Use `add_or_edit_variable` for one variable; use `bulk_edit_scene_assets` `variables` for many.
- Pass `scene_name` when editing variables on scene objects.
- Use `SetBooleanVariable` / `BooleanVariable` for scene/global boolean flags; fill enumerated operators from metadata.
- Use `set_first_layout` / `set_project_properties` for startup scene and project settings. Renaming the game does not rename the saved `.json` file.

Global Config:

- Read with `gdevelop_get_global_config`; write focused values with exact placeholder paths.
- Use `gdevelop_set_global_config` only for an intentional whole-map replacement.
- Read back and save if persistence is required.

Extensions and prefabs:

- Inspect before editing: extension, function, behavior, object, or property as narrowly as possible.
- Use extension-specific tools before raw serialized extension JSON.
- Use `gdevelop_create_or_update_on_signal` for prefab signal receivers; do not add custom parameters to `onSignal`.
- Before prefab area, child bounds, cursor hit, or mouse-follow changes, call `inspect_custom_object_runtime_geometry`. The parent area controls runtime bounds and `IsCursorOnObject`; do not simply enlarge it to cover visible children.
- A Resource property descriptor does not prove a child Sprite dynamically uses it. Call `inspect_prefab_property_bindings`; use `bind_child_sprite_resource_property` only when a static default binding is enough, then read back and preview.

Tilemaps and cleanup:

- Use `create_tilemap_object`, `set_tilemap_tiles`, and `get_tilemap_tiles` for tile grids. Tile ids are `row * columnCount + col`; empty cells are `-1`.
- Use `set_tilemap_collision_tiles`, `inspect_tilemap_collision`, and `check_tilemap_walkability` for grid collision/walkability, but treat walkability as a heuristic.
- Use `inspect_project_cleanup` before deleting old scenes, objects, resources, or suspicious collision masks. Treat unused candidates as heuristics.

Runtime verification:

- Launch deterministic previews with `launch_preview { start_paused: true }` or `save_and_relaunch_preview_paused`.
- Prefer `run_frames` for reproducible tests: inject input, step N frames, and return live state in one call. It avoids wall-clock races and works better with throttled/backgrounded previews.
- Use `simulate_preview_input` when needed, then step/inspect. For just-pressed behavior, send key down, step at least one frame, then release if needed.
- Use `set_runtime_state` to reach hard-to-trigger states instead of hacking editor variables.
- Verify with `gdevelop_inspect_running_preview`: errors/logs, live counts, variables, positions via `instance_positions_for`, `sceneElapsedTimeSeconds`, `recentSounds`, and `activeSounds`.
- Use `capture_preview_screenshot` for visual evidence. Screenshots reflect rendered frames; state tools read runtime memory.
- If several previews exist or evidence looks stale, `control_preview { action:"close", close_all:true }` and relaunch one fresh preview.
- A launched preview alone is not a passed smoke test. Report concrete runtime evidence.

Saving:

- Prefer `gdevelop_save_project_and_wait`.
- `gdevelop_run_command` with `SAVE_PROJECT` only confirms the command was launched; do not claim confirmed persistence from that alone.

## Review Checklist

Before completion, confirm the applicable items:

- Target project/scene/object/event/function was identified from MCP state, not guessed.
- All mutations went through MCP tools; no opened project `.json` disk edit happened.
- Tool schemas/examples or instruction metadata were used where payload or parameter shape was unclear.
- Generated events were validated before writing; invalid issues were fixed first.
- Event writes were read back and `lint_scene_events` passed or remaining warnings were explicitly explained.
- Created/modified gameplay events are grouped, Group colors are explicit/unique, and JavaScript was avoided unless requested.
- Objects, behaviors, variables, resources, Global Config values, and instances were read back when touched.
- Resource files are non-empty and valid, or invalid paths are reported.
- Direct JSON patch/sync used validation/dry-run first and was read back after mutation.
- Custom object geometry and Resource property bindings were inspected when those areas mattered.
- Runtime behavior was verified with live state and/or screenshots when the request involved gameplay, visuals, input, audio, or timing.
- Saves used `gdevelop_save_project_and_wait` when persistence was requested.
- Any limitation or uncertainty is stated plainly.

## High-Risk Mistakes

- Declaring a documented MCP tool unavailable before discovery/introspection.
- Guessing instruction parameter order, hidden slots, quotes, behavior names, or resource syntax instead of using metadata.
- Forgetting that events without conditions run every frame.
- Forgetting to declare variables before event validation.
- Duplicating events per input key instead of one Or condition with `subInstructions`.
- Using a plain Standard event Create/action when it should run for each picked instance; use ForEach when needed.
- Comparing a timer that was never started with `ResetTimer`.
- Operating on an object group in collision/object-variable logic without runtime verification.
- Trusting stale previews or stale editor panels after writes.
- Replacing large event blocks when targeted event operations or group tools would suffice.
- Continuing to use old `event-N` paths after moving/grouping; prefer stable `aiGeneratedEventId`.
- Leaving placeholder scene names; use `rename_scene`.
- Assuming static render proves runtime behavior; use preview/runtime tools for gameplay.

## Known Limits

MCP improves safety but does not prove intent. Event validation is structural/metadata-based; lints and gameplay-rule checks are heuristics. Static rendering is approximate and can differ from a running preview. Tilemap collision/walkability and resource audits are useful diagnostics, not full runtime proofs. When confidence matters, verify with a fresh preview, `run_frames`, runtime inspection, screenshots, and concrete state changes.
