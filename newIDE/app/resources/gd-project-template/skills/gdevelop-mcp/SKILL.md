---
name: gdevelop-mcp
description: Use when an AI agent is connected to GDevelop through MCP and needs to inspect, create, modify, debug, or verify a GDevelop project, scene, object, instance, behavior, prefab, signal, variable, event sheet, or editor command.
---

# GDevelop MCP

## Operating Model

Operate the open GDevelop editor through MCP. Inspect before writing, mutate only through MCP tools, validate generated events before insertion, read back after every meaningful change, and save through the editor when persistence is required.

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
- Events: compact DSL reference, `gdevelop_validate_events`, `gdevelop_apply_events`, instruction metadata search, signal helpers, event finders/linters, and extension event writers.
- Variables/scenes: variable edits/deletes, Global Config edits, scene create/rename/delete, startup scene/project settings.
- Runtime verification: preview launch, health, `run_frames`, input simulation, runtime state injection, screenshots, static render.
- Safety/persistence: snapshots, validated in-memory JSON patches/sync, save-and-wait.

Keep responses small by using `compact:true`, `summary_only:true`, `errors_only:true`, `object_name`/`object_names`, or file-based payloads when tools support them. Event validation and event searches are compact by default; request `include_rendered_events`, `include_normalized_json`, or `include_serialized` only when the full payload is needed.

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

Use the compact event DSL by default. Raw serialized event JSON is an advanced compatibility path.

1. Read `read_scene_events`, then `read_scene_events_serialized`. Keep its `eventSheetRevision` for the write guard.
2. Find the semantic destination Group and stable target event id. Use `ensure_scene_event_ids` only for older events that do not have ids.
3. When an instruction type is unknown, call `gdevelop_search_instruction_metadata`. For exact parameters, call `gdevelop_get_instruction_metadata` and use each parameter's `dslName`.
4. Draft compact DSL with event `kind`, instruction `type`, named `parameters`, and `children`.
5. Call `gdevelop_validate_events`. It compiles and applies the patch to a temporary project, then returns compact diagnostics and proposed revisions without modifying the live project. Set `include_rendered_events:true` only when human-readable event text is needed.
6. Fix all errors. Warnings must either be fixed or deliberately justified.
7. Call `gdevelop_apply_events` with the same `events`/`operations` and `expected_revision` from step 1. Pass `save:true` only when this write must also be persisted before the call returns.
8. Require a structured receipt with `applied`, `oldRevision`, `newRevision`, `validationState`, and `saveState`. Read back the serialized events, confirm the returned revision/ids, and run `lint_scene_events`.
9. Runtime-verify gameplay changes before completion.

Hard requirements:

- Every AI-created or AI-modified gameplay event must end inside a semantic Group. Put new gameplay events in a `kind: "group"` event or target an existing Group with `op: "insert_child"`.
- Groups receive a distinct non-default color when DSL `color` is omitted. Use an explicit `#RRGGBB` only when a particular color is meaningful.
- Important events should have a descriptive `id`; missing ids are generated automatically. Target ids rather than paths whenever possible.
- Do not create or modify JavaScript events unless the user explicitly requested JavaScript. Use standard GDevelop events, expressions, behaviors, and extensions first.
- Never call an event write tool with only an English description.

Event write paths:

- `gdevelop_apply_events` with `events`: append compact DSL events.
- `gdevelop_apply_events` with `operations`: insert, replace, or delete with simple operation names and stable targets.
- `gdevelop_create_or_update_extension_function` and `gdevelop_create_or_update_on_signal` accept the same DSL in `events_dsl`.
- `bulk_edit_scene_assets` accepts the same DSL in `events` or `events_dsl` after creating required resources, objects, behaviors, variables, and instances.
- `add_scene_events` with `events_json`/`event_changes`: advanced raw serializer compatibility.
- `replace_scene_events_from_file`: large whole-sheet replacement; validate/dry-run first and check `subInstructionsPreserved`.
- `apply_validated_scene_patch`: focused serialized scene fixes when no structured tool covers the change.

Simple operation names are `append`, `insert_before`, `insert_after`, `insert_child`, `replace`, `replace_keep_children`, `append_instructions`, `prepend_instructions`, `replace_actions`, `replace_conditions`, and `delete`. Targets are strings or `{ "event_id": "..." }` / `{ "event_path": "event-0.1" }`.

After any write, inspect `staleStateAdvisory`. If previews may be stale, use `save_and_relaunch_preview_paused` before runtime verification so cleanup happens through the preview relaunch workflow. If editor panels may be stale, trust MCP readback over open tabs until they refresh.

## Event DSL Essentials

Common event shape:

```json
{
  "scene_name": "Level1",
  "expected_revision": "fnv1a:...",
  "events": [
    {
      "kind": "group",
      "name": "Initialization",
      "children": [
        {
          "kind": "standard",
          "conditions": [{ "type": "SceneJustBegins" }],
          "actions": [
            {
              "type": "SetNumberVariable",
              "parameters": {
                "variable": "Score",
                "modification_sign": "=",
                "value": 0
              }
            }
          ]
        }
      ]
    }
  ]
}
```

- Event kinds: `standard`, `group`, `comment`, `repeat`, `while`, `for_each`, `for_each_child_variable`, `else`, `link`, and explicitly requested `javascript`.
- Instruction `type` is the exact current action/condition type. Named parameter keys are case-insensitive and ignore spaces, underscores, hyphens, and possessive punctuation.
- Use `{ "any": [...] }`, `{ "all": [...] }`, and `{ "not": {...} }` for OR, AND, and NOT conditions. The compiler creates `subInstructions` correctly.
- Use `children` for sub-events, `times` for repeat, `object` for for-each, and `while_conditions` for while loops.
- Event-local scalar variables can be a map such as `{ "damage": 0, "armed": false }`.
- The compiler fills code-only parameters, orders named parameters, quotes safe string literals, generates missing ids, and assigns Group colors.
- Repeated metadata names are made unique (`first_object`, `second_object`, and so on). Use those `dslName` values; do not fall back to positional arrays for `CollisionNP` or similar instructions.
- Normal object and behavior actions operate on all picked instances. Use `for_each` only for instructions whose metadata contains an `objectPtr`, or when one nested execution is required per picked instance. Ambiguity diagnostics include a suggested `for_each` structure.

Parameter syntax:

- Pass literal values naturally in DSL. The compiler handles safe quoting according to metadata.
- Keep expressions as expression strings, for example `Variable(Score)`, `100 * TimeDelta()`, or `"Score: " + ToString(Variable(Score))`.
- Object, behavior, variable, and resource names remain names; do not invent expression wrappers for them.
- Use metadata `dslName`, `literalSyntax`, `acceptedValues`, and validation suggestions instead of guessing.

Variable and config syntax:

- Scene variable expression: `Variable(Score)`; variable parameter: `Score`.
- Global variable expression: `GlobalVariable(Name)`.
- Object variable expression: prefer `Object.Variable(Name)`.
- Scene/external events can read Global Config with exact placeholders such as `{{cards.Sunflower.price}}`. Extension/prefab/behavior events should receive config through parameters/properties, not direct Global Config expressions. Global Config is read-only at runtime; edit design-time values with `gdevelop_set_global_config_value` / `gdevelop_delete_global_config_value`.

Advanced raw event JSON:

- Use only when the DSL does not expose a required serializer field or when replacing a large exact event tree from a file.
- Raw instructions require exact positional arrays, code-only placeholders, quoting, serializer event types, and `subInstructions` placement.
- Validate raw scene JSON with `gdevelop_validate_events_json`; validate large files with `validate_events_json_file`.

Extension-specific rules:

- Use `gdevelop_validate_extension_events_json` with `events_dsl` for extension function bodies and `gdevelop_create_or_update_extension_function` with `events_dsl` when writing.
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
- Centered Text creation infers a nonzero text box height. Use `inspect_scene_draw_order` to see exact/inferred/fallback dimension sources.
- Put persistent UI on a dedicated top `HUD` layer. `inspect_scene_draw_order` reports base-layer UI risks when runtime Create actions could overtake its z-order.
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
- Check `outcome`, `requestedFrames`, `steppedFrames`, `stoppedEarly`, `failedFrame`, `eventId`, `instructionId`, `partialStateAvailable`, and `cleanup`. With `auto_release:true`, require `cleanup.keysReleased:true` even when an event fails.
- Use `simulate_preview_input` when needed, then step/inspect. For just-pressed behavior, send key down, step at least one frame, then release if needed.
- Use `set_runtime_state` to reach hard-to-trigger states instead of hacking editor variables.
- Verify with `gdevelop_inspect_running_preview`: errors/logs, live counts, variables, positions via `instance_positions_for`, `sceneElapsedTimeSeconds`, `recentSounds`, and `activeSounds`.
- Use `capture_preview_screenshot` for visual evidence. It renders before capture, defaults to the exact game canvas, detects suspicious black/transparent frames, retries, and reports `source`, dimensions, quality, attempts, and pixel hash. Use `capture_mode:"window"` only when a full Electron window capture is explicitly needed.
- If several previews exist or evidence looks stale, use `save_and_relaunch_preview_paused` to save, clean up stale previews, and relaunch one fresh paused preview.
- If relaunch still fails, use the returned recovery workflow: save, close all previews, `launch_preview { start_paused:true, force_new:true }`, then `wait_until_preview_ready`.
- A launched preview alone is not a passed smoke test. Report concrete runtime evidence.

Saving:

- Prefer `gdevelop_save_project_and_wait`.
- Treat `success:true` and `hashesMatch:true` in `persistence` as confirmed local-file persistence. Inspect `reason` to distinguish `saved`, `nothing-changed`, `project-not-marked-dirty`, `save-threw`, and disk verification failures.
- `gdevelop_run_command` with `SAVE_PROJECT` is special-cased: it awaits completion and returns the same persistence evidence as the dedicated save tool.
- Tool failures remain structured JSON in both `structuredContent` and text content. Parse the object and do not branch on free-form error text.

## Review Checklist

Before completion, confirm the applicable items:

- Target project/scene/object/event/function was identified from MCP state, not guessed.
- All mutations went through MCP tools; no opened project `.json` disk edit happened.
- Tool schemas/examples or instruction metadata were used where payload or parameter shape was unclear.
- Generated events were validated before writing; invalid issues were fixed first.
- Event writes were read back and `lint_scene_events` passed or remaining warnings were explicitly explained.
- Created/modified gameplay events are grouped, Group colors are unique (explicit or DSL-generated), and JavaScript was avoided unless requested.
- Objects, behaviors, variables, resources, Global Config values, and instances were read back when touched.
- Resource files are non-empty and valid, or invalid paths are reported.
- Direct JSON patch/sync used validation/dry-run first and was read back after mutation.
- Custom object geometry and Resource property bindings were inspected when those areas mattered.
- Runtime behavior was verified with live state and/or screenshots when the request involved gameplay, visuals, input, audio, or timing.
- Saves used `gdevelop_save_project_and_wait` when persistence was requested.
- Any limitation or uncertainty is stated plainly.

## High-Risk Mistakes

- Declaring a documented MCP tool unavailable before discovery/introspection.
- Writing positional instruction arrays when named DSL parameters and metadata `dslName` values are available.
- Forgetting that events without conditions run every frame.
- Forgetting to declare variables before event validation.
- Duplicating events per input key instead of one DSL `{ "any": [...] }` condition.
- Using a plain Standard event Create/action when it should run for each picked instance; use ForEach when needed.
- Comparing a timer that was never started with `ResetTimer`.
- Operating on an object group in collision/object-variable logic without runtime verification.
- Trusting stale previews or stale editor panels after writes.
- Replacing large event blocks when targeted event operations or group tools would suffice.
- Continuing to use old `event-N` paths after moving/grouping; prefer stable `aiGeneratedEventId`.
- Applying an event patch with a stale or omitted `expected_revision` after another write changed the sheet.
- Leaving placeholder scene names; use `rename_scene`.
- Assuming static render proves runtime behavior; use preview/runtime tools for gameplay.

## Known Limits

MCP improves safety but does not prove intent. The DSL compiler guarantees serializer shape and parameter ordering, not gameplay correctness. Event validation is structural/metadata-based; lints and gameplay-rule checks are heuristics. Static rendering is approximate and can differ from a running preview. Tilemap collision/walkability and resource audits are useful diagnostics, not full runtime proofs. When confidence matters, verify with a fresh preview, `run_frames`, runtime inspection, screenshots, and concrete state changes.
