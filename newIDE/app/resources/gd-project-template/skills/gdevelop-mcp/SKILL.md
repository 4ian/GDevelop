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

The fastest way to see what's available is `gdevelop_capabilities` — it returns the core tools grouped by workflow (project state, reading, instruction discovery, creating objects/assets, authoring events, runtime verification, safety/persistence) in ONE call, so you don't need many tool searches. Call it first.

If MCP tools were reloaded or updated during a session, call `gdevelop_refresh_tool_catalog` to resync the current catalog and permission gates before guessing tool names.

Before deciding that a GDevelop MCP tool is unavailable:

1. Check the currently active tool list.
2. If `tool_search` is available, call it with the exact tool name first, for example `create_sprite_object_from_resource`, then use a broader query such as `GDevelop MCP sprite resource object` if the exact name does not appear.
3. If MCP introspection tools are visible, call `tools/list`, `inspect_tool_schema`, or `get_tool_usage_examples` to confirm the final tool name, schema, and examples before calling it.
4. If only `gdevelop_editor_call` is visible, it may still route known GDevelop MCP tool names through `{ "name": "...", "arguments": { ... } }`. Prefer direct discovered tools when available, but do not assume the underlying tool is missing only because it is not top-level visible.
5. Only report a tool as unavailable after discovery/introspection fails or the editor explicitly returns an unknown-tool or permission-disabled error.

Do not compensate for an undiscovered or disabled MCP tool by directly editing the opened project JSON file. Use another focused MCP tool, ask the user to enable/restart MCP tooling, or report the precise missing capability.

If you genuinely cannot tell how to use an MCP tool, what an object/instruction/serialized field means, or how a GDevelop feature is structured — and the metadata/examples tools (`gdevelop_get_instruction_metadata`, `gdevelop_get_events_json_examples`, `inspect_tool_schema`, `get_tool_usage_examples`) don't answer it — consult the GDevelop source code at **https://github.com/zhouzhipeng/Gdevelop** to determine the correct shape/behavior. It is the authoritative reference for object configurations (e.g. `Extensions/<Name>/JsExtension.js`), the serialized project format, instruction parameters (the extension `.cpp`/`.js` `AddAction`/`AddCondition` declarations), and runtime behavior (`GDJS/Runtime`). Prefer that over guessing.

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

- `gdevelop_get_editor_state`: project presence, scene names, permissions, and the absolute `projectFile` / `projectFolder` of the open project. Relative resource paths (`add_or_update_resource`, `bulk_edit_scene_assets`) resolve against `projectFolder`, which may differ from your cwd — read it first to avoid missing-file errors.
- `gdevelop_get_editor_selection`: current editor UI selection state, including active scene-like editor panes, selected objects, selected layers, selected scene instances, selected events/instructions when an events sheet is active, and the selected project-file asset/resource when the Resources editor is active.
- `gdevelop_get_project_summary`: compact project structure (also returns absolute `projectFile` / `projectFolder`), optionally scoped by `sceneName`.
- `gdevelop_read_project_json`: full project JSON; use sparingly and with `maxLength` for large projects.
- `gdevelop_list_scenes`: all scenes/layouts.
- `gdevelop_list_objects`: global objects and scene objects.
- `gdevelop_list_extensions`: project-specific events-functions extensions with metadata and counts.
- `gdevelop_inspect_extension`: extension detail. Full mode returns free functions, events-based behaviors/objects, parameters, properties, events, and serialized JSON. For large extensions, use `summary_only:true`, `list_functions_only:true`, `list_objects_only:true`, or `list_behaviors_only:true`; compact modes omit events/serialized JSON unless `include_events:true` or `include_serialized:true`.
- `gdevelop_inspect_extension_function`: one free/behavior/object function inside an extension.
- `gdevelop_inspect_extension_behavior`: one events-based behavior inside an extension. Pass `function_name` to inspect only one behavior function; this keeps large event payloads out of the response unless you explicitly need them.
- `gdevelop_inspect_extension_object`: one events-based object inside an extension. Pass `function_name` to inspect only one object function; this keeps large event payloads out of the response unless you explicitly need them.
- `gdevelop_inspect_extension_property`: one behavior/object property inside an extension.
- `validate_current_project_json`: serialize the current in-memory project, re-unserialize it into a temporary project, run project validation, and run extension function event/code-generation checks without mutating the live project.
- `inspect_custom_object_runtime_geometry`: inspect an events-based object prefab's declared area, child instance local coordinates, Sprite frame bounds/points/collision masks, and optional cursor-local hit checks. Use this before changing custom object areas or `IsCursorOnObject` behavior.
- `inspect_prefab_property_bindings`: inspect behavior/object property descriptors, child Sprite static frame resources, and event references to properties. Use this before assuming a Resource property dynamically drives a child Sprite image.
- `read_scene_events`: event sheet rendered as text.
- `read_serialized_scene`: one scene as serialized JSON. Pass `object_name` or `object_names` to return only those objects (and their instances) for a much smaller response, instead of dumping the whole scene to a file.
- `read_scene_events_serialized`: raw serialized event JSON for a scene, including event types the text renderer cannot describe. Pass `summary_only:true` for just root event counts/types; the JSON string copy is omitted unless you pass `include_json:true` (keeps responses small).
- `find_scene_events`: locate scene events by `event_path`, `ai_generated_event_id`, group name, event type, action type, condition type, parameter text, or serialized text. Pass `summary_only:true` to omit `serializedEvent`.
- `find_extension_events`: locate events inside extension free/behavior/object functions by the same filters. Use `extension_name`, optionally `parent_kind`, `parent_name`, or `function_name`, to find extension logic still directly operating a child object.
- `find_project_events`: search all scene events and extension function events together. Optionally restrict by `scene_name`, `extension_name`, `parent_kind`, `parent_name`, or `function_name`.
- `compare_scene_events_semantics`: compare two serialized event arrays while ignoring visual Group wrappers and stable IDs.
- `inspect_gameplay_rules`: higher-level heuristic event checks, such as whether a health bar/nameplate follows an object top or whether a state-machine variable/states are mentioned in events. This is not a proof; still verify runtime behavior.
- `inspect_project_resources`: resource table audit: name/kind/file, empty or missing files, unused resources, Sprite frame references, true event resource parameters, generic serialized references, and `suspiciousCollisionMasks` (Sprite frames with `hasCustomCollisionMask: true` but an empty `customCollisionMask`, which silently disables collisions).
- `inspect_resource_images`: image resource dimensions, transparent-pixel bounds, and visible-pixel thickness hints. Use it when a UI/sprite looks missing or too thin.
- `audit_project_asset_sources`: check whether local resources come from allowed project-relative roots such as `assets`.
- `compare_image_files`: compare a reference image and current screenshot/render, optionally writing a red diff heatmap for 1:1 remake work.
- `crop_scene_object_image`: crop and nearest-neighbor zoom a screenshot/render around a scene initial instance by object name, with optional bounds overlay.
- `inspect_project_cleanup`: read-only cleanup candidates: empty scenes, possibly unused scene objects, invalid resources, unused resources, missing Sprite frame references, and `suspiciousCollisionMasks` (empty custom masks that disable collisions).
- `describe_instances`: object instances in a scene, including non-empty per-instance `initialVariables`; use before `put_2d_instances`, `put_3d_instances`, or `delete_instance_variable`.
- `inspect_scene_draw_order`: static draw order by layer/zOrder with bounds. Use it to debug overlap/visibility before guessing.
- `inspect_object_properties`: object properties, behaviors, animations, size hints.
- `inspect_behavior_properties`: behavior details on an object.
- `list_available_behaviors`: list behavior types available in the project, each with the exact `behaviorType` to pass to `add_behavior` and the `defaultName` used in instruction behavior parameters. Optionally filter by `object_name` (only compatible behaviors) and/or a `search` query. Pass `include_properties:true` to get each behavior TYPE's property schema (name/label/type/default/choices) so you can learn its configurable properties (e.g. DestroyOutside's extra border distance) WITHOUT first adding it to an object. When `object_name` is given, the result also includes `objectBehaviors`: the behaviors already on the object — including hidden capability behaviors — with the exact NAME to use in instruction behavior parameters. The built-in capability behavior names are: Sprite/text → `Text`, animations → `Animation`, effects → `Effect`, opacity → `Opacity`, resize → `Resizable`, scale → `Scale`, flip → `Flippable`.
- `search_behavior_store`: search the COMMUNITY behavior registry (asset store) for behaviors that may not be installed yet (jump, flash, health, draggable, screen-wrap, platformer, etc.). Pass `query` (space-separated terms) and optionally `object_type` (e.g. `Sprite`). Each result gives the full `behaviorType` (e.g. `Flash::Flash`) to pass to `add_behavior`, which installs the required extension automatically. Use this to REUSE a ready-made behavior instead of writing events from scratch. Requires network access. For behaviors already in the project, use `list_available_behaviors` first.
- `inspect_scene_properties_layers_effects`: scene properties, layers, effects.
- `gdevelop_inspect_running_preview`: inspect a currently running preview to verify runtime behavior. Returns whether a preview is running (defaulting to the latest launched preview, reported as `latestDebuggerId`/`inspectedLatest`), status, `logs` (recent console/debugger logs captured for that preview, including DebuggerTools::ConsoleLog messages emitted before the inspect call), `errors`, `diagnostics` (classification such as `responsive`, `preview-not-connected-or-compiling`, `status-only-no-runtime-dump`, `debugger-channel-timeout`, or `runtime-error-or-crash`), and a compact `runtime` snapshot: per scene `sceneElapsedTimeSeconds`, per-object live instance counts, and variables. Pass `instance_positions_for: ["Player"]` to include live instance x/y/angle for specific objects. It also returns `activeSounds` and `inputState`. Launch a preview first.
- `capture_preview_screenshot`: capture a PNG of the current rendered frame from a running preview, to visually verify sprites, layout, and colors. Captured from the MAIN process (webContents.capturePage) when available, so it works even for a backgrounded preview whose renderer is suspended; falls back to the in-game canvas otherwise. Pass `canvas_only:true` or `capture_mode:"canvas"` to skip window capture and capture only the game canvas. Pass `target_width` + `target_height` (for example 800x450) to resize output when Electron `nativeImage` is available. Pass `file_path` to write a PNG, or omit it to get a base64 data URL. Pass `debugger_id` to target a specific preview; default is the latest preview.
- `preview_health_check`: read preview/debugger channel health, `diagnostics`, and recommended recovery actions before runtime calls when previews look stale or unresponsive. After a non-dry-run write, MCP tool results can include `staleStateAdvisory`; if `previewMayBeStale:true`, close/relaunch previews before trusting runtime checks.
- `wait_until_preview_ready`: block until the selected preview answers a targeted `getStatus`. Use it when a preview id exists but runtime tools report `connected-unresponsive`, or when you need to confirm a specific `debugger_id` before `run_frames`.
- Preview launch readiness contract: `launch_preview` returns `success:true` only after the preview runtime answers `getStatus`; with `start_paused:true`, pause must also be confirmed. If it returns `success:false` with `failurePhase:"runtime-ready"` or `"pause-confirmation"`, close all previews and relaunch instead of calling `run_frames` on that debugger id.
- `render_scene_to_png`: STATIC layout render to a PNG WITHOUT running the game — Sprite instances composite their REAL first-frame image (scaled to the instance size), while Text/undecodable objects show a labelled colored box; every instance gets a border so placement is clear. The reliable way to verify layout AND rough visuals when a live preview is unavailable (throttled window, or before launching). Returns `spritesComposited`. For an exact animated frame, use `capture_preview_screenshot`.
- `simulate_preview_input`: inject keyboard/mouse/touch input into a running preview to verify input-driven gameplay (movement, shooting, restart) end-to-end. Pass `inputs: [{ type, ... }]`. Key events use a key name (`"Left"`, `"Space"`, `"a"`) or `key_code`. Press and release are separate events; hold a key by sending `keyPressed` without `keyReleased`. To register a "just pressed" (e.g. restart on ENTER), send only `keyPressed` and let a frame pass (see `control_preview` step) before release. By default the tool reads the runtime input state back and returns it as `inputState`, so you get confirmation the keys/buttons actually registered without a separate inspect call (pass `confirm: false` to skip). After injecting, step a frame and use `gdevelop_inspect_running_preview` / `capture_preview_screenshot` to confirm the gameplay effect.
- `control_preview`: deterministically control a running preview — `action: "pause" | "play" | "step" | "close" | "focus"`. `step` advances exactly `frames` frames (with `frame_delta_ms` simulated time each) while paused, making runtime tests reproducible regardless of how long MCP round-trips take. `close` (with `close_all:true`) stops running previews — do this before relaunching so later screenshots/sound checks don't hit a stale window. `focus` brings the preview window(s) to the front and tries to un-throttle them — but the OS may still keep a window occluded, so focus is best-effort. Requests target the chosen `debugger_id` (default latest). The canonical deterministic test loop: pause → simulate_preview_input / set_runtime_state → step N frames → inspect.
- `run_frames`: the ROBUST atomic runtime-test primitive — inject inputs, step exactly N frames, and return the resulting live state (instance counts, variables, optional `instance_positions_for`) in ONE call. Prefer this over the multi-call pause→simulate_input→step→inspect loop, because (a) it cannot half-fail mid-sequence, and (b) it drives the simulation on the debugger channel, NOT requestAnimationFrame — so it keeps working even when the OS throttled a backgrounded/occluded preview window (the case where inspect/screenshot time out for the 2nd+ preview). The game is left paused (resume with `control_preview { action: "play" }`). It returns `heldKeys` (keys still pressed after the call) — a held key carries over to the NEXT run_frames and keeps driving the game, so pass `auto_release:true` (or send a keyReleased) to clear held keys when you don't want that. For mouse clicks that must stay pressed across frames, use `inputs:[{type:"clickAndHold", x, y, button:"left", frames:N}]`; it presses before stepping and releases after stepping. Pass `include_cursor_world_coordinates:true` and optional `cursor_layers` to debug `IsCursorOnObject` against shifted/zoomed layers. NOTE: only `capture_preview_screenshot` truly needs a rendered (focused) window; `run_frames` and `gdevelop_inspect_running_preview` read memory state and work while throttled.
- `launch_preview`: launch a new preview through the same `LAUNCH_DEBUG_PREVIEW` / "Start Preview and Debugger" path used by the UI, optionally `start_paused:true` to pause it the moment it connects — so a deterministic test can begin near frame 0 instead of after the real-time clock has already advanced (the game runs immediately on load and may be game-over by your next call). After launching paused, advance with `run_frames` / `control_preview step`, or `control_preview { action:"play" }` to run normally.
- `set_runtime_state`: inject test state into a running preview — `operations: [{ type, ... }]` for `setVariable` (scope scene/global), `moveInstance`, `spawnInstance`, `deleteInstance`, `deleteAllInstances` (clear every instance of an object in one op — avoids index-by-index not-found churn). Use to reach states that are hard to trigger naturally (e.g. set GameOver=0, spawn an enemy, reposition the player) instead of hacking game variables through the UI.
- `gdevelop_list_commands`: command palette command names.
- `search_docs` / `read_full_docs`: GDevelop docs when available through the editor integration.
- `read_game_project_json`: legacy full project JSON reader.

Event/introspection helpers:

- `gdevelop_get_events_json_examples`: examples of valid serialized event JSON and `add_scene_events` payloads — including Standard, Comment, Group, ForEach, Repeat, While, and Or/And sub-condition shapes. Also returns `parameterSyntaxRules` (which parameter types need quotes vs bare values), `variableExpressionSyntax` (how to reference scene/global/object variables in expressions), and `commonInstructionTypes` (a cheat-sheet of frequently-needed internal type names).
- `gdevelop_get_event_operation_reference`: supported `event_changes` operations and target path format.
- `gdevelop_validate_events_json`: parse, render, and check scene event JSON without modifying the project. Pass `dedupe_errors: true` to collapse repeated failures into one entry per root cause (with a `count`) instead of one entry per occurrence.
- `gdevelop_validate_extension_events_json`: parse, render, and check an extension free/behavior/object function event body without modifying the live extension. Pass the same target fields as `gdevelop_create_or_update_extension_function`; omit `events_json` to lint the function that already exists.
- `validate_events_json_file`: validate a local events JSON file without writing it. Use before `replace_scene_events_from_file` for large event sheets. Also supports `summary_only` and `dedupe_errors`.
- For instruction metadata while authoring extension functions, pass `target_scope` (`scene`, `extension_function`, `behavior_function`, `object_function`, or `async_function`) to `gdevelop_search_instruction_metadata` or `gdevelop_get_instruction_metadata`. Results include `eventScopes` and `targetScopeCompatibility`, making it clear whether an instruction is valid in the target event sheet before dry-run validation.
- `gdevelop_search_instruction_metadata`: find action/condition/expression metadata by internal type, name, description, object, or behavior. Multi-word queries are tokenized and ranked by the FRACTION of meaningful words matched (filler like "of"/"content"/"object" is ignored), so natural phrasings like "modify text string content of a text object" still find the right action. Common intents ("play sound", "key pressed", "change position", "delete object", "scene variable", "restart scene", "random number", "background music") are aliased to current GDevelop internal types while hidden/deprecated action and condition aliases are excluded. The result also includes `commonTaskHints` for hard-to-discover capability actions: when the query matches, it returns the EXACT type and a ready `parametersTemplate` for setting text (`TextContainerCapability::TextContainerBehavior::SetValue`), opacity, animation, looping music, etc. — use these instead of guessing. Pass `compact: true` to drop verbose per-parameter `valueType` discriminators while keeping parameter types and `literalSyntax` hints.
- `gdevelop_get_instruction_metadata`: exact metadata, including parameter order, parameter types, and a `literalSyntax` hint per parameter that states whether a literal needs quotes. It also returns `parameterShape` — `totalParameterCount`, `userParameterCount`, and `codeOnlyParameterIndexes` — so you know exactly how many parameters the serialized array needs and which indexes are hidden code-only slots that take `""` (e.g. Show has an extra code-only 2nd parameter that Hide does not). Pass `compact: true` for a trimmed result. The result also includes `fieldNotes` clarifying that `isRelevantForSceneEvents` maps to GDevelop's `isRelevantForLayoutEvents()` and does NOT forbid scene usage when false (object-variable instructions report false yet work in scenes).
- `lint_scene_events`: check MCP event authoring rules: root events must be semantic Groups; no JavaScript events unless explicitly requested; Group colors set and unique; empty Or/And/Not (`empty-logical-condition`); and likely multi-instance Create-without-ForEach. Suppress a rule you intend to violate via `disabled_rules: ["create-without-for-each"]`.

Write tools:

- `initialize_project`: create and OPEN a new project (it becomes the current project, so later tools operate on it). Pass `project_name` (required); omit `template_slug` (or use `""`/`"none"`/`"empty"`) for a blank one-scene project, or give an example slug to start from. On desktop the project is SAVED to local disk on creation (in the user's "GDevelop projects" folder; the path is returned as `projectFile`). It replaces the currently open project and discards an unsaved one without confirmation — save first if needed.
- `create_scene` / `delete_scene`: scene management.
- `rename_scene`: safely rename a scene/layout (`scene_name` → `new_scene_name`), updating references (change-scene actions) across the project and closing its open tabs. Use this instead of leaving placeholder names like "Untitled scene".
- `set_first_layout`: set the project startup scene/layout in the editor model. Use this instead of patching saved JSON.
- `set_project_properties`: set project name, startup scene, resolution, runtime resolution adaptation, FPS limits, orientation, and scale mode.
- `create_or_replace_object`: create, duplicate, replace, or move object definitions.
- `replace_object_definition`: replace/create a scene object from complete serialized object JSON; type changes are allowed after validation.
- `delete_scene_object`: delete a scene object and clean up references/instances through GDevelop refactoring.
- `set_object_properties`: set object properties using names from `inspect_object_properties`.
- `set_text_object_properties`: high-level TextObject setter for text, size, color, bold/italic, alignment, outline, shadow, font, and line height.
- `create_sprite_object_from_resource`: high-level Sprite authoring helper. It creates or updates a scene Sprite from an existing image resource, binds a default animation frame, and can create one initial instance. To build a MULTI-frame / multi-animation Sprite in one call, pass a full `animations` array (same shape as `set_sprite_animations`) instead of relying on the single default frame. Frames created without an explicit `collisionMask` default to a full-image (bounding box) collision mask so collisions work; pass `fullImageCollisionMask: true` or a non-empty `collisionMask` to override. Pass `summary_only:true` to omit the full serialized object from the response.
- `create_text_object`: high-level TextObject authoring helper. It creates or updates a scene TextObject with text properties and can create one initial instance.
- `add_or_update_resource`: add/update a project resource with `name`, `file`, `kind`, and metadata. For audio, use `metadata.preloadAsSound`, `metadata.preloadAsMusic`, `metadata.preloadInCache`, and `metadata.userAdded`.
- `generate_placeholder_asset`: generate placeholder art/audio on disk and register it as a resource — lets a from-scratch playable demo be built entirely inside MCP. Images: a solid rectangle, a `shape` (circle/ellipse/triangle/diamond), and/or a vertical 2-color gradient (`color` → `color2`). Sounds: a WAV with a `waveform` (sine/square/saw/triangle/noise) and optional `adsr` envelope. Replace with real assets later by overwriting the file and re-importing the same name.
- `set_sprite_animations`: replace a Sprite object's animations, directions, frames, origin/center/custom points, and collision masks. Set per-animation `loop` (false for one-shot animations like explosions, so HasAnimationEnded can become true) and `timeBetweenFrames` (seconds per frame) — these are first-class fields; do not rely on engine defaults for multi-frame animations. Pass `summary_only:true` to omit the full serialized object from the response.
- `slice_sprite_sheet`: turn a single sprite-sheet PNG into a usable animation in one call. It cuts the sheet into a grid of individual frame images on disk, registers each as an image resource, and binds them as one Sprite animation. Describe the grid with `frame_width`+`frame_height` OR `columns`+`rows` (cap with `frame_count`). Use this when art arrives as a packed sheet (walk cycle, explosion strip) instead of hand-listing frames in `set_sprite_animations`. (Requires the desktop/Electron runtime for the image cut.)
- `create_tilemap_object` / `set_tilemap_tiles` / `get_tilemap_tiles`: build and paint the built-in **Tile map** object (`TileMap::SimpleTileMap`) — a grid-based level made of reusable tiles from a tileset atlas image. `create_tilemap_object` defines the tileset (atlas image + `tile_size`; columns/rows are computed from the image) and optionally creates an instance with an initial grid. `set_tilemap_tiles` paints/clears tiles on an instance: the grid is `tiles[y][x]` (row-major), **empty = -1**, and a tile id = `row*columnCount + col` into the tileset (optionally flipped). It supports `map_width`/`map_height` (resize), a rectangular `fill`, individual `{ x, y, tile }` placements, `clear_all`, and layer opacity. Address tiles by numeric id, or by `{ col, row }` when `tileset_columns` is known. `get_tilemap_tiles` reads the grid back (raw + a decoded `{ id, flipX? }` view). The painted grid lives **per instance** (a `tilemap` string property), not on the object. Note: the tileset config (atlas/tile size) only fully applies inside the running editor where the TileMap extension is loaded; the per-instance tile grid works everywhere.
- `bulk_edit_scene_assets`: batch import resources, create/replace scene objects, bind Sprite animations, add behaviors, declare scene/global/object variables, place 2D instances, AND add scene events for one scene — in one call (applied in that order, events LAST). Use it for initial scene setup to avoid dozens of single-tool round-trips: pass `resources`, `objects`, `sprite_animations`, `behaviors` (`[{ object_name, behavior_type, behavior_name? }]`), `variables` (`[{ scope: "scene"|"global"|"object", name, value, type?, object_name? }]` — object variables supported via scope "object" + object_name), `instances`, and `events` (a serialized events array, same shape as `add_scene_events`; it goes through the SAME validation + lint, so Or/And children must be under `subInstructions`). Declaring variables in the same call before the events that use them avoids undeclared-variable errors. Pass `dry_run:true` to validate the WHOLE plan (including that events would NOT be written) without mutating — the result has `mutated:false`.
- `create_action` / `create_condition`: build a correctly-formed instruction JSON from a type + NAMED parameter values, so you don't hand-align parameter order, hidden code-only slots, or quoting. Pass `parameters` keyed by the metadata parameter name (or index); the result `instruction` drops straight into an event's actions/conditions array (or into `add_scene_events`). Discover the type + param names with `gdevelop_get_instruction_metadata`.
- `replace_project_resource`: repoint an EXISTING resource (e.g. a generated placeholder) at a new file under the same name, so every Sprite frame / reference picks it up; reports which objects use it. A running preview needs a fresh launch / hot reload to show new pixels.
- `snapshot_project` / `restore_project_snapshot`: coarse transaction safety — `snapshot_project` checkpoints the whole project in memory before a risky multi-step build; `restore_project_snapshot { snapshot_id }` rolls back if a step fails. Session-scoped, NOT a disk save (reopen scene tabs after a restore if the UI looks stale).
- `change_object_property`: edit object properties.
- `add_behavior` / `remove_behavior` / `change_behavior_property`: behavior management. `add_behavior` requires `behavior_type` (the internal type, e.g. `PlatformBehavior::PlatformerObjectBehavior`); discover built-in/installed types with `list_available_behaviors`, or community ones with `search_behavior_store`. If `behavior_type` belongs to a community extension that is not installed, `add_behavior` installs it automatically (with any required behaviors). `remove_behavior` and `change_behavior_property` take the behavior NAME (the instance name on the object), not the type. After adding, configure the behavior WITHOUT events via `inspect_behavior_properties` + `change_behavior_property`.
- `put_2d_instances` / `put_3d_instances`: place, move, update, or erase scene instances. Per-instance, use `align` (`"center"`, `"center-x"`, `"bottom center"`, `"top"`, `"left"`, etc.) to position by the scene resolution without computing `(sceneWidth - objectWidth)/2` yourself, and `initially_hidden:true` to start it not drawn (opacity 0 — note this does NOT stop collisions; for a fully inert hidden object also add a `SceneJustBegins -> Hide` event). Pass `summary_only:true` to omit the full serialized instance list (it grows with every instance in the scene).
- `add_or_edit_variable`: create or modify global, scene, object, behavior variables.
- `delete_scene_variable` / `delete_object_variable` / `delete_instance_variable`: delete one variable by name or nested path using focused containers instead of raw serialized patches. Use `delete_instance_variable` for initial-instance `initialVariables` that can remain after object/scene variables are removed.
- `change_scene_properties_layers_effects_groups`: scene/game properties, layers, effects, object groups. Pass `changed_properties` / `changed_layers` / `changed_layer_effects` / `changed_groups` arrays (see `get_tool_usage_examples`). Create a layer (e.g. a HUD layer) by naming a `layer_name` that does not exist yet in `changed_layers`.
- `add_scene_events`: direct event sheet edits. Prefer `events_json` or `event_changes`; both accept JSON strings or real serialized event arrays/objects.
- `generate_events`: alias for `add_scene_events`.
- `create_group`: create an empty scene event Group.
- `wrap_events_in_group`: create a Group and move sibling target events into it.
- `move_events_to_group`: move existing events into an existing Group.
- `rename_group`: rename a Group and optionally update folded state/color.
- `ensure_scene_event_ids`: assign stable `aiGeneratedEventId` values to events that do not already have one.
- `replace_scene_events_from_file`: replace a scene event sheet from a local JSON file after validation. Rejects structural mistakes that would silently lose data (e.g. Or/And/Not children under the wrong key) and returns `subInstructionsPreserved` (a write-back check that nested conditions/actions survived). Pass `dry_run: true` to validate and render the result (`eventsAsText`) WITHOUT writing — review it, then re-run to apply.
- `apply_validated_scene_patch`: apply focused scene JSON patch; for large patches use `patch_file`.
- `apply_validated_project_json_patch`: apply a JSON Patch to a controlled serialized target inside the in-memory project model (`project`, `scene`, `extension`, `extension_object`, or `extension_function`). It validates on a temporary project first, snapshots before live mutation, and can save only after validation. Use `dry_run:true` first for broad or structural changes.
- `sync_editor_from_validated_project_json`: load a complete project JSON object/string/file into the editor model only after serialize/unserialize validation and extension code-generation checks pass. This is for deliberate full-project syncs, not routine small edits.
- `create_or_update_plan`: store/update an AI orchestration plan when the task needs one.

Recent high-level helpers:

- `bind_sprite_animations_from_directory`: scan a unit asset directory (for example `Idle/Run/Attack` subfolders), register image resources, and bind them as Sprite animations with loop/frame timing.
- `inspect_tilemap_palette` / `set_tilemap_collision_tiles` / `inspect_tilemap_collision` / `check_tilemap_walkability`: inspect tile IDs, mark collision tile IDs, read blocked cells/ascii masks, and run grid walkability checks.
- `patch_scene_event_instruction`: patch one action/condition by stable event id/path plus instruction type/object name, avoiding brittle raw `/events/.../actions/...` JSON pointers.
- `attach_object_to_object_top`: add a standard event that keeps a follower object (health bar/nameplate) centered above a target object's top.
- `apply_validated_scene_patch` supports `summary_only:true` to return changed paths and validation summary without echoing the full serialized scene.

Extension write tools:

- `gdevelop_create_or_update_extension`: create/update extension metadata. Supports `extension_name`, optional `new_extension_name`, `namespace`, `full_name`, `short_description`, `description`, `version`, `category`, `dimension`, `help_path`, `icon_url`, `preview_icon_url`, `tags`, and advanced `serialized_extension`.
- `gdevelop_delete_extension`: delete a project-specific extension.
- `gdevelop_create_or_update_extension_function`: create/update a free, behavior, or object function. Supports `parent_kind` (`extension`, `behavior`, `object`), `parent_name`, `function_type`, `full_name`, `description`, `sentence`, `help_url`, privacy/async/deprecated flags, `parameters`, `parameters_mode`, `expression_type`, `events_json`, and advanced `serialized_function`. By default, `parameters` is the final caller-managed parameter list: old unused parameters are removed while GDevelop-maintained automatic behavior/object parameters are preserved. Set `parameters_mode:"upsert"` only for additive edits that should keep unspecified old parameters. Pass `dry_run:true` to validate the full serialized/function event payload on a temporary extension copy without mutating the live extension. It validates `events_json` and non-empty action/condition sentences before keeping the write.
- `replace_extension_function_events_from_file`: replace a free, behavior, or object extension function's event body from a local JSON file after validation. Use this for large extension functions instead of inlining escaped `events_json`.
- `apply_validated_extension_patch`: apply a JSON Patch to a controlled serialized extension target (`extension`, `extension_object`, `extension_behavior`, `extension_function`, or `property`). It validates on a temporary extension copy, checks extension function events/code generation, and snapshots before live mutation.
- `gdevelop_delete_extension_function`: delete a free, behavior, or object function.
- `gdevelop_create_or_update_extension_behavior`: create/update an events-based behavior. Supports `behavior_name`, optional rename, display metadata, `object_type`, privacy, icons, and advanced `serialized_behavior`.
- `gdevelop_delete_extension_behavior`: delete an events-based behavior.
- `gdevelop_create_or_update_extension_object`: create/update an events-based object. Supports `object_name`, optional rename, display metadata, default name, privacy, 3D/text/animation/inner-area flags, icons, `area`, and advanced `serialized_object` (child objects, instances, animations, properties, private flags, and event functions). Pass `dry_run:true` to validate the full serialized object payload on a temporary extension copy without mutating the live extension, and `summary_only:true` to avoid echoing large serialized output.
- `gdevelop_delete_extension_object`: delete an events-based object.
- `gdevelop_extract_prefab_from_object`: extract existing scene instances or extension-object child objects into a reusable events-based object prefab. `source_kind` is `scene_instances`, `extension_object`, or `scene_object`; use `dry_run:true` first to validate extraction on a temporary extension copy. Replacement/migration is explicit via `replace_in_scene_with_prefab_instance` or `replace_in_source_with_prefab_instance`. Event references are not auto-rewritten, so use `find_project_events`/`find_extension_events` before and after migration.
- `gdevelop_create_or_update_extension_property`: create/update a behavior/object property. Supports `target_kind`, `target_name`, `property_name`, optional rename, `property_type`, `value`, `label`, `description`, `measurement_unit`, `group`, visibility/advanced/deprecated flags, `extra_info`, `choices`, `is_shared` for behavior shared properties, and advanced `serialized_property`.
- `gdevelop_delete_extension_property`: delete a behavior/object property.
- `bind_child_sprite_resource_property`: best-effort helper for prefab Resource properties. It checks the property and child Sprite, then updates the child Sprite's static first-frame resource to the property's default resource. It reports the runtime dynamic-binding limitation instead of pretending a Resource property alone updates the Sprite image.

Command tool:

- `gdevelop_run_command`: run editor command palette commands, for example previewing. Only use after checking `gdevelop_list_commands`; command tools may be disabled.
- `gdevelop_save_project_and_wait`: save the project and wait for the editor save promise. Prefer this over `gdevelop_run_command` with `SAVE_PROJECT` when available. The result includes a `consistency` block (projectName, projectFile, firstLayout, sceneCount, sceneNames) so you can confirm the saved state matches intent. Note: renaming the game does NOT rename the `.json` file on disk (expected; no MCP capability to rename the file).
- `save_and_relaunch_preview_paused`: save through the editor, close stale previews/debugger connections, launch a fresh debug preview paused, then inspect the runtime. Use this after extension or project-wide JSON edits before trusting runtime evidence.

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

## Known Gaps And Inconveniences

These are current GDevelop MCP limitations observed during real project work. Treat them as design constraints when planning edits, and mention the relevant limitation to the user when it affects confidence or verification.

1. Tool discovery is improved but not fully automatic. `gdevelop_refresh_tool_catalog`, `gdevelop_capabilities`, `tool_search`, and schema introspection reduce guessing, but a client may still need an explicit refresh/search after MCP tools are reloaded or deferred.
2. Tilemap authoring is still data-oriented. `inspect_tilemap_palette`, `set_tilemap_tiles`, and `get_tilemap_tiles` help, but there is no editor-like visual brush, reference-image overlay, lasso selection, tile picker UI, or interactive fill preview.
3. Tilemap collision editing is tile-id based. `set_tilemap_collision_tiles`, `inspect_tilemap_collision`, and `check_tilemap_walkability` cover common solid-tile workflows, but there is no full visual collision painter, arbitrary per-cell polygon editor, or live collision-layer overlay in the editor.
4. Collision debugging is not a full runtime overlay. Resource audits, sprite collision mask checks, draw-order inspection, screenshots, and walkability checks help diagnose issues, but MCP still cannot reliably render every live object and tilemap collision mask over a preview frame.
5. Walkability checks are grid/path heuristics. They are useful for tilemap blocked-cell mistakes, but they do not prove full runtime movement with object hitboxes, acceleration, platformer physics, moving blockers, z-order changes, or behavior-specific collision rules.
6. Visual remake comparison is file-based. `compare_image_files`, `crop_scene_object_image`, `render_scene_to_png`, and preview screenshots help with 1:1 work, but MCP does not yet automatically align a reference image to the game camera, scale, crop, and parallax layers without manual inputs.
7. Static rendering is approximate. `render_scene_to_png` is valuable for layout checks, but it is not a pixel-perfect substitute for the running game; effects, shaders, particles, animations, runtime-created objects, text rendering differences, and custom object renderers may diverge.
8. Preview health can still be split-brain. Non-dry-run write results include `staleStateAdvisory` when MCP can detect running previews or affected editor panels, and `preview_health_check`, `run_frames`, `control_preview`, and main-process screenshots mitigate stale previews and debugger timeouts. Still close/relaunch previews when runtime evidence looks inconsistent.
9. Focused screenshots are limited by available instance data. `crop_scene_object_image` can zoom a screenshot/render around known scene instances, but it is not yet a universal live-runtime crop-by-instance-id tool with labels, collision boxes, origins, and animation frame metadata.
10. Event editing is safer but not fully semantic. Stable event ids, `find_scene_events`, `patch_scene_event_instruction`, and `event_changes` reduce brittle JSON paths, but complex restructuring can still require serialized event JSON and careful read-back.
11. Event validation is mostly structural and metadata-driven. `gdevelop_validate_events_json` and `lint_scene_events` catch many bad event shapes and common mistakes, but they cannot prove intent such as "the health bar always follows the enemy top" or "this state machine is logically complete" without runtime tests.
12. Gameplay rule checks are heuristic. `inspect_gameplay_rules` can flag likely missing follow/state-machine wiring, but it is not a verifier for all gameplay behavior and should not replace preview inspection, screenshots, or deterministic `run_frames` tests.
13. Image resource inspection cannot infer artistic intent. `inspect_resource_images` reports dimensions and transparent-pixel bounds, but it cannot decide the correct anchor, hitbox, scale, UI padding, or whether a sprite was visually modified from the original source.
14. Animation binding from directories is heuristic. `bind_sprite_animations_from_directory` works well for common `Idle`/`Run`/`Attack` folder layouts, but unusual naming, directional sheets, per-animation origins, frame-specific hitboxes, and transition/state events still need manual authoring.
15. Attachment helpers cover common cases only. `attach_object_to_object_top` avoids hand-written top-center formulas for health bars/nameplates, but MCP does not yet expose a general constraint/anchor system for arbitrary UI attachments, multiple targets, camera-relative HUD elements, or responsive layout rules.
16. State machines lack declarative authoring. Enemies, AI, and combat states are still usually built with object variables and standard events. There is no high-level MCP state-machine tool that declares states, transitions, actions, and debug overlays in one schema.
17. Asset-source compliance is path-based. `audit_project_asset_sources` checks local resource paths against allowed roots, but it does not cryptographically prove that assets are original, unmodified, or license-compliant.
18. Parameter schemas still require attention. Many tools accept both old and new naming conventions or advanced serialized payloads for compatibility. Prefer introspection (`inspect_tool_schema`, `get_tool_usage_examples`) and exact metadata over guessing `sceneName` vs `scene_name` or object parameter order.
19. Transactions are explicit, not automatic. `snapshot_project` and rollback helpers exist, and some focused writes roll back internally, but multi-step workflows still need intentional checkpoints and read-back. There is no universal "show diff then confirm save" transaction layer for every MCP batch.
20. Draw-order inspection is mostly static. `inspect_scene_draw_order` helps with initial layout, layers, and z-order, but runtime z-order changes, hidden objects, created instances, effects, masks, and camera/layer transforms still need preview verification.
21. Extension function validation is not full semantic compilation. MCP now validates `events_json` and sentence placeholders for extension functions, and GDJS code generation supports regular `object` parameters by passing object-list maps to free and behavior events functions. Still verify preview/code generation after changing extension function signatures because MCP validation does not prove that every caller context compiles or that the function body uses every parameter correctly.

## Permissions

Tools are permission-gated by the editor:

- If a write tool returns that write MCP tools are disabled, do not retry the same write. Ask the user to enable write tools in preferences or continue with read-only analysis.
- If `gdevelop_run_command` is disabled, do not simulate commands through unrelated write tools.
- `gdevelop_editor_call` is an escape hatch, not a shortcut around permissions. It still follows the same read/write restrictions.

Hard requirement: never directly edit, patch, overwrite, or otherwise mutate the opened GDevelop project `.json` file on disk. All project mutations must go through MCP tools, then be persisted with `gdevelop_save_project_and_wait` or a write tool's validated save path. Reading project JSON for verification is allowed; writing temporary events/patch JSON files for `validate_events_json_file`, `replace_scene_events_from_file`, `replace_extension_function_events_from_file`, `apply_validated_project_json_patch`, or `apply_validated_extension_patch` is allowed. Disk-only project JSON edits can be overwritten by the editor and can desynchronize MCP state.

## Validated Direct JSON Workflow

Prefer focused MCP tools for ordinary edits. Use direct serialized JSON only when no focused tool covers the required change, when moving large event/function bodies from files, or when syncing a deliberate full-project transform. Never write the opened project `.json` on disk yourself.

Use `validate_current_project_json` before risky work to establish the current serialized project can round-trip. For patch workflows, use `apply_validated_project_json_patch` or `apply_validated_extension_patch` with `dry_run:true` first. These tools apply RFC-6902-style operations (`add`, `replace`, `remove`, `test`) to a scoped in-memory target, validate by serialize/unserialize on a temporary copy, run project validation, and preflight extension function events/generated JavaScript before mutating the live editor model. Non-dry-run mutation creates an MCP snapshot first; if a write fails, do not keep patching blindly - inspect the error and restore the snapshot when needed.

Use `replace_extension_function_events_from_file` for large extension function event bodies. The file should contain a serialized event array. Validate/dry-run first, then apply, read back the function, save, and relaunch stale previews.

Use `sync_editor_from_validated_project_json` only for an intentional complete project replacement into the editor model. It is not a shortcut for small edits. Prefer `summary_only:true` or file-based payloads for large JSON so responses stay small.

After any successful project/extension JSON mutation, assume open editor panels and previews may be stale. Read back through MCP, save through the editor, and use `save_and_relaunch_preview_paused` or close-all plus `launch_preview { start_paused:true }` before runtime verification.

## Custom Object / Prefab Geometry

Events-based object child instances use local prefab coordinates. The custom object's declared area controls its parent runtime bounds and cursor hit area; widening this area can make `IsCursorOnObject(Object)` true even when the cursor is outside the visible child Sprite pixels. Prefer visible child bounds, Sprite points, and collision masks for visual/collision reasoning, and treat the parent area as the coarse container/hit target.

Before changing a prefab area, moving children, or debugging mouse-follow previews, call `inspect_custom_object_runtime_geometry`. Check `parentArea`, child local positions, estimated rendered bounds, Sprite origin/center/custom points, and collision mask bounds. If a cursor feels offset, pass local `cursor_x`/`cursor_y`; when you know the parent instance position, pass `parent_x`/`parent_y` plus `cursor_scene_x`/`cursor_scene_y` to get scene-space child bounds, point coordinates, and scene-to-local cursor checks.

For a mouse-follow preview sprite, keep the parent area close to the visible bounds, put the child Sprite at a clear local origin, set the Sprite origin/center intentionally, and verify with a paused fresh preview plus screenshot. If extension edits changed prefab geometry, stale previews can keep old object code/data; relaunch before trusting screenshots or `IsCursorOnObject` results.

## Resource Property Binding

A Resource property descriptor on a behavior/object is only data; it is not proof that a child Sprite dynamically uses that resource at runtime. Always inspect both the property descriptor and actual child Sprite frame resources.

Use `inspect_prefab_property_bindings` before changing prefab image resources. It reports Resource properties, child Sprite static frame images, event text references to properties, and warnings when a Resource property has no detected dynamic use. Use `bind_child_sprite_resource_property` only when a static default binding is enough: it updates the child Sprite's first-frame image to the property's default resource and reports the limitation that a general runtime set-image-from-resource action may not exist for Sprite objects.

After binding, read back with `inspect_prefab_property_bindings` or `gdevelop_inspect_extension_object`, save, relaunch a fresh paused preview, and visually verify the prefab.

## Event Editing Workflow

Use this sequence for adding or modifying events.

Hard requirement: every event the AI creates or modifies must end inside the appropriate semantic Group. The root event sheet should contain Group events as the organizing units; do not leave Standard, While, Repeat, JavaScript, or other gameplay events ungrouped at the root. This applies to scene event sheets and extension function event sheets. If related existing events are ungrouped, group them as part of the edit before the final read-back.

Hard requirement: unless the user explicitly requests JavaScript, implement business/gameplay logic with GDevelop's standard events, conditions, actions, expressions, behaviors, and extensions. Do not create JavaScript events, including serialized events such as `BuiltinCommonInstructions::JsCode`, as a shortcut for normal logic. If a task appears hard with standard events, search instruction metadata and available extensions first; ask for confirmation before using JavaScript.

1. `read_scene_events` to understand the current event sheet.
2. For precise edits, call `read_scene_events_serialized`. If events lack stable IDs, call `ensure_scene_event_ids` before doing multiple operations. Stable IDs survive grouping/moving better than `event-14` paths.
3. If the user asked to modify or insert near the currently selected event, call `gdevelop_get_editor_selection` while the events editor has focus. Use `primarySelection.selectedEvents[0].aiGeneratedEventId` when present, otherwise `eventPath`.
4. If the target is not selected, use `find_scene_events` by action type, condition type, group name, parameter text, or `ai_generated_event_id`; avoid guessing paths from rendered text.
5. Identify the semantic destination Group before drafting or writing: examples include `Player input`, `Enemy behavior`, `UI`, `Audio`, `Scoring`, `Scene setup`, or the specific extension function purpose.
6. If the destination Group does not exist, create it with `create_group` (it auto-assigns a distinct, non-default color when you don't pass one, so you rarely need a recolor pass — different Groups must use different colors). If related events already exist outside the Group, move or wrap them with `move_events_to_group` or `wrap_events_in_group` (also auto-colored).
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

Write results may include `staleStateAdvisory`. Treat it as part of verification:

- If `previewMayBeStale:true`, any preview that was already open was running old project code/data. Run `control_preview { action: "close", close_all: true }`, relaunch with `launch_preview { start_paused: true }` when deterministic verification matters, then inspect/screenshot the new preview.
- If `editorPanelsMayBeStale` mentions `scene-events`, `extension-function`, or `scene`, read back through MCP and be skeptical of already-open editor tabs until they visibly refresh. If the panel still shows old data, switch away/back or reopen it.
- Do not report runtime or visual verification based on a preview or editor panel that `staleStateAdvisory` says may be stale.

Never use `add_scene_events` with a natural language description expecting server-side generation. MCP direct event writing does not call the GDevelop AI event generation service. Always pass `events_json` or `event_changes`.

### Event-write paths (capability differences)

| Path                                                      | Input                                                                                                                | Auto-declares variables? | Use for                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------ |
| `add_scene_events` / `generate_events` with `events_json` | one JSON array, append-or-target                                                                                     | NO                       | simple appends; declare variables first                                  |
| `add_scene_events` with `event_changes`                   | per-change ops + `undeclared_variables`/`undeclared_object_variables`/`missing_object_behaviors`/`missing_resources` | YES (via those fields)   | precise edits; let the write auto-declare referenced variables/behaviors |
| `replace_scene_events_from_file`                          | whole sheet from a (project-relative or absolute) JSON file                                                          | NO                       | very large whole-sheet replacement                                       |
| `apply_validated_scene_patch`                             | JSON-pointer patch of the serialized scene                                                                           | n/a                      | small structural fixes no focused tool covers                            |

Hidden/code-only parameters (e.g. `currentScene`, `conditionInverted`, `objectsContext`) must still be present as empty-string `""` placeholders at their position in the `parameters` array — `gdevelop_get_instruction_metadata` lists every parameter including these; do not drop them. Condition negation has two mechanisms: most conditions use the event/instruction `type.inverted` boolean, but a few (e.g. `CollisionNP`) use a dedicated `conditionInverted` positional parameter — check the metadata for which applies.

`events_json` is a STRING containing a JSON array (double-encoded). Generate it programmatically (e.g. `JSON.stringify`) and prefer the file-based `validate_events_json_file` → `replace_scene_events_from_file` flow for anything non-trivial — inlining hand-escaped JSON strings is error-prone.

ForEach / Repeat / While / Or / And shapes: ForEach uses an `object` field; Repeat uses `repeatExpression`; While uses a `whileConditions` array; Or/And/Not nest their child conditions in a **`subInstructions`** array on a `BuiltinCommonInstructions::Or`/`::And`/`::Not` condition. CRITICAL: the children must be under `subInstructions`, NOT a `conditions`/`actions` key — the GDevelop serializer silently DROPS a `conditions` key on an instruction, so an Or written that way becomes empty (matches nothing) even though validation used to pass. The `subInstructions` array MUST be non-empty. `gdevelop_validate_events_json` now errors (`empty-or-misplaced-sub-instructions`) when an Or/And/Not has children under the wrong key or no children, and `lint_scene_events` errors (`empty-logical-condition`) if a written Or/And/Not ended up empty. See `gdevelop_get_events_json_examples` for exact JSON. Prefer one OR condition over duplicating an event per input (e.g. arrow keys + WASD).

Instruction internal names: GDevelop exposes both modern and legacy/French internal type names for some instructions (e.g. `SetX` and the legacy `MettreX`; `KeyPressed` vs `KeyFromTextPressed`). Prefer the modern name. MCP hides and rejects hidden/deprecated action and condition aliases, so always confirm the exact current `type` and parameter order with `gdevelop_get_instruction_metadata` rather than guessing.

`gdevelop_validate_events_json` and `add_scene_events` use GDevelop's own instruction metadata and `InstructionValidator` path for parameter validation. This catches expression type errors, unknown instruction types, missing parameters, invalid object/variable references, and malformed string/number expressions before events are inserted.

Resource parameters are also checked. If an event references an audio/image/etc. resource, validation must confirm the resource exists, has the expected kind, has a non-empty `file`, and the local file exists when the path can be resolved. If validation reports `resource-empty-file` or `resource-missing-file`, fix the resource with `add_or_update_resource` or inspect with `inspect_project_resources` before writing events.

Validation responses include `issueSummary`. Use it before inspecting every repeated issue: `byType` shows counts and `rootCauses` groups repeated errors by likely fix (or pass `dedupe_errors: true` to receive only the grouped causes). Quoting depends on the parameter TYPE, and each error reports its `parameterType` and a type-aware `suggestion`:

- String-expression parameters (`string`, `keyboardKey`, `color`, `sceneName`, `layer`, `file`, `identifier`) take a value WITH embedded double quotes, e.g. `"Space"`, `"220;30;55"`, `"Game Over"`. The `layer` parameter is one of these: the BASE layer is the empty string `""` (an empty quoted string), and a NAMED layer is a quoted string like `"\"HUD\""` in raw JSON — i.e. both are the quoted-string type; the base layer just happens to be empty. Note the Scene action's scene name parameter is also a quoted string, e.g. `"Game"`. As a safety net, `add_scene_events`/`generate_events` auto-wrap a bare literal for the unambiguous identifier-like types (`keyboardKey`, `color`, `sceneName`, `layer`, `identifier`, animation/effect names) — but `string`/`text` are NOT auto-wrapped (they often use `+` concatenation), so quote those yourself.
- Bare values (no quotes): object names, behavior NAMES (not behavior types), number/numeric expressions (e.g. `100`, `Variable(Score)`), and variable references.
- Resource-name parameters (`soundfile`, `musicfile`, `imageResource`, `fontResource`, `jsonResource`, `videoResource`, `bitmapFontResource`, `model3DResource`, `audioResource`, etc.) take a BARE resource name with NO quotes — e.g. `Shoot`, not `"Shoot"`. This is the opposite of string parameters and a common 6-error pitfall when adding sound/music actions. The resource must already exist (`add_or_update_resource`). The per-parameter `literalSyntax` from `gdevelop_get_instruction_metadata` states this explicitly.

Variable expression syntax (see `gdevelop_get_events_json_examples` -> `variableExpressionSyntax`): a scene variable is referenced by bare name (`Variable(Score)` in an expression, or just `Score` in a variable parameter) - not `SceneVariable(Score)`. A local event variable is declared in an event's `variables` array and uses the same bare-name syntax inside that event/sub-events. A global variable is `GlobalVariable(Name)`. An object variable is `Object.VariableName` in expressions (e.g. `Player.Life`) - not `VarObjet(...)`.

The field `isRelevantForSceneEvents` (from `gdevelop_get_instruction_metadata`) maps to GDevelop's `isRelevantForLayoutEvents()`. A value of false does NOT mean the instruction is unusable in scene events; some object-variable instructions report false yet work in scene events.

For extension function event bodies, use the same event JSON shape and metadata workflow. Use `gdevelop_validate_extension_events_json` when you only need validation/linting, and `gdevelop_create_or_update_extension_function` when you are ready to write. The write tool validates `events_json` before replacing the function's event list and validates non-empty action/condition sentences against the final parameter list. Invalid function event JSON or sentence placeholders must be fixed before retrying; failed writes are rolled back.

Extension function object parameters represent selected object lists at runtime. Use the regular `object` parameter type for caller-facing object parameters unless a specialized picking mode is intended (`objectListOrEmptyIfJustDeclared`, `objectListOrEmptyWithoutPicking`, or `objectPtr`). After changing object parameters on free or behavior extension functions, restart stale previews and verify the generated call path; object parameters should not appear as blank arguments or `null` in generated GDJS calls.

Events-based object functions cannot reliably spawn an external object parameter with the standard `Create` action. Linting reports this as `object-function-create-external-object-parameter`; create external scene objects from a scene/free function or expose an internal child object for the object function to manage.

Extension function sentence parameter indexes:

- Free functions reserve `_PARAM0_` for the hidden scene parameter. The first user parameter is `_PARAM1_`, the second is `_PARAM2_`, and so on.
- Behavior functions automatically insert object and behavior parameters first. The object is `_PARAM0_`; the behavior parameter is implicit and usually not written in the sentence; custom parameters start after these automatic parameters (usually `_PARAM2_`).
- Object functions automatically insert the object parameter first. The object is `_PARAM0_`; custom parameters usually start at `_PARAM1_`.
- If MCP returns a sentence error listing missing or wrong `_PARAMx_` values, correct the `sentence` or parameter list and retry. Do not ignore the error by writing events separately.

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
  "events_json": [
    {
      "type": "BuiltinCommonInstructions::Standard",
      "conditions": [],
      "actions": []
    }
  ]
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
      "generated_events": [
        {
          "type": "BuiltinCommonInstructions::Standard",
          "conditions": [],
          "actions": []
        }
      ]
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

Hard requirement: every Group must have an explicitly set color, and different Groups must use DIFFERENT colors. Do not leave a Group with the default/no color, and do not reuse the same color for two distinct Groups in a scene — distinct colors make the event sheet readable at a glance. Set the color when creating the Group (`create_group` / `wrap_events_in_group` accept `color: { r, g, b }`; in raw serialized event JSON it is `colorR` / `colorG` / `colorB`), or fix it afterwards with `rename_group`. Before finishing, verify each Group's color is set and unique within the scene; if two Groups collide, recolor one with `rename_group`.

1. `read_scene_events_serialized`.
2. `ensure_scene_event_ids` if target events do not already have `aiGeneratedEventId`.
3. `find_scene_events` to locate target events by stable id, action/condition type, group name, or text.
4. Decide the destination Group name from the feature/domain, not from implementation trivia.
5. `wrap_events_in_group` when sibling target events need a new Group — pass a `color: { r, g, b }` that is not already used by another Group in the scene.
6. `create_group` (with a distinct `color`) plus `move_events_to_group` when the Group already exists or the targets are being collected over multiple steps.
7. `rename_group` for group names, folded state, and color — use it to set or fix a Group's color so it is unique within the scene.
8. Read back with `read_scene_events_serialized`.
9. Confirm every created/modified event is inside the intended Group, and that every Group has a set, scene-unique color, before reporting completion.
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
7. When turning existing scene/extension children into a prefab, search references with `find_project_events` or `find_extension_events`, then call `gdevelop_extract_prefab_from_object` with `dry_run:true` before applying replacement flags.
8. Read back with `gdevelop_inspect_extension`.

Add an extension free function:

1. `gdevelop_inspect_extension`.
2. Decide exact `function_type`: `action`, `condition`, `expression`, `expression_and_condition`, or `action_with_operator`.
3. Draft the `sentence` with `_PARAM1_` for the first user parameter (`_PARAM0_` is hidden scene context).
4. If adding events, search instruction metadata and draft valid `events_json`.
5. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "extension"`.
6. `gdevelop_inspect_extension_function`.

Add a behavior method:

1. `gdevelop_inspect_extension_behavior`.
2. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "behavior"` and `parent_name`.
3. Remember GDevelop inserts mandatory behavior parameters first: object is `_PARAM0_`, behavior is implicit, and custom parameters usually start at `_PARAM2_`.
4. `gdevelop_inspect_extension_function`.

Add an object method:

1. `gdevelop_inspect_extension_object`.
2. Call `gdevelop_create_or_update_extension_function` with `parent_kind: "object"` and `parent_name`.
3. Remember GDevelop inserts the mandatory object parameter first: object is `_PARAM0_`, and custom parameters usually start at `_PARAM1_`.
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
4. Observe/read state as needed. Preview launch commands (e.g. `LAUNCH_DEBUG_PREVIEW` or `LAUNCH_NEW_PREVIEW`) only confirm that the editor accepted the command; they do not themselves return runtime state. To verify runtime behavior, call `gdevelop_inspect_running_preview` after launching (see "Verify runtime behavior"). Do not claim a runtime smoke test passed unless `gdevelop_inspect_running_preview` (or another runtime/debugger tool) actually reported the evidence.

Verify runtime behavior:

1. Launch a preview with `launch_preview { start_paused: true }` for deterministic tests from ~frame 0. It uses the same `LAUNCH_DEBUG_PREVIEW` / "Start Preview and Debugger" path as the UI, then waits for the debugger attach/pause handshake.
2. Call `gdevelop_inspect_running_preview`. It defaults to the most recently launched preview (`latestDebuggerId`); if several previews are open and you need another, pass `debugger_id`. If `running` is false, relaunch and retry, increasing `timeout_ms` if needed.
3. Read the result: `status`, `errors` (uncaught exceptions, crashes, error logs — check this first), `logs`, and `runtime` (running scene name, `sceneElapsedTimeSeconds`, `objectInstanceCounts` per object from live instances, and scene/global variable values). The counts are real live-instance counts; you do not need `include_raw_dump`. Use `instance_positions_for: ["Player"]` to read live coordinates. Use `sceneElapsedTimeSeconds` (game time) to judge game speed — do NOT infer it from MCP round-trip latency.
4. For DETERMINISTIC, reproducible tests, do not race the wall clock (the game keeps running between your MCP calls, so a stand-still player may already be dead by your next call). The simplest robust way is `run_frames` — one call that injects inputs, steps N frames, and returns the resulting state. While any preview is open the desktop app holds a power-save blocker so even a backgrounded/occluded preview's event loop keeps running and `run_frames`/inspect keep working; if a window still won't respond, `control_preview { action: "focus" }` or close-all + relaunch. The longer form (`control_preview { action: "pause" }` → inject input/state → `control_preview { action: "step", frames: N }` → inspect) is equivalent but is several calls. If the live preview is entirely unavailable, you can still check LAYOUT (placement/size) with `render_scene_to_png`, which renders a static diagram without running the game.
5. To verify INPUT-driven gameplay (movement, shooting, restart), the one-call path is `run_frames { inputs: [{type:"keyPressed", key:"Left"}], frames: 30, instance_positions_for: ["Player"] }` then read the returned `runtime`. For click/touch logic that depends on the button staying down across event frames, use `run_frames { inputs: [{type:"clickAndHold", x: 420, y: 180, button:"left", frames: 3}], include_cursor_world_coordinates: true, cursor_layers:["HUD"] }`; this presses before stepping, releases after stepping, and reports cursor world coordinates per layer for `IsCursorOnObject` debugging. Or use `simulate_preview_input` to inject keys/mouse (it returns the live `inputState` so you can confirm the key registered), then step a frame and inspect/screenshot. A "just pressed" condition (e.g. ENTER to restart) registers only across a frame boundary: send `keyPressed` (no release), step ≥1 frame, then optionally release. Key-condition compatibility: the simulator sets the key DOWN state, so it triggers `KeyPressed` / "key is pressed" conditions reliably. Text-based conditions like `KeyFromTextJustPressed` can require an actual key event and may not fire from a simulated DOWN state — if a "just pressed from text" condition doesn't respond, switch the event to the plain `KeyPressed`/`KeyReleased` condition (with the key as a quoted name) which the simulator drives directly.
6. To reach hard states, use `set_runtime_state` (e.g. set `GameOver=0`, spawn an enemy, reposition the player) rather than hacking variables through the UI.
7. Confirm audio: `gdevelop_inspect_running_preview` returns `recentSounds` (sounds/musics played since the last inspect — proves a one-shot `PlaySound` fired) and `activeSounds` (what is playing RIGHT NOW with its loop state — use this to confirm a looping BGM is still playing, not just that it started once).
8. Call `capture_preview_screenshot` with a `file_path` to save a PNG and visually verify sprites, layout, and colors. Read the image back to inspect it.
9. Use these to confirm gameplay actually works: live instance counts, `Score` changes, input registers in `inputState` and moves the player, expected `recentSounds`/`activeSounds`, empty `errors`, and a correct screenshot.
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
- Prefer `validate_events_json_file` before `replace_scene_events_from_file` so validation and writing are separate steps. For risky/complex sheets (Or/And/Not, deep nesting), use `replace_scene_events_from_file` with `dry_run: true` first and review `eventsAsText` + `subInstructionsPreserved` before applying.
- After writing events, confirm `subInstructionsPreserved` is true (or read back and verify nested conditions survived) — a "valid" write can still differ from intent if a wrong key dropped data. `compare_scene_events_semantics` can diff intended vs written.
- Read `projectFolder` from `gdevelop_get_editor_state` before registering resources by relative path; the open project folder may not be your cwd.
- Prefer `issueSummary.rootCauses` over reading every repeated validation issue; or pass `dedupe_errors: true` to validation to get grouped causes directly.
- Prefer `list_available_behaviors` over guessing a `behavior_type` string for `add_behavior`.
- Before hand-writing events to implement a common mechanic (jump/platformer, flash on hit, health/lives, draggable, screen wrap, follow/anchor, top-down/physics movement, tween, timer/destroy-outside), check for a ready-made behavior first: `list_available_behaviors` (installed) then `search_behavior_store` (community). Add it with `add_behavior` and configure it with `change_behavior_property` instead of reinventing it in events. Behaviors auto-add their required behaviors and refresh scene shared data.
- Prefer the per-error `parameterType`/`suggestion` and `literalSyntax` hints over guessing whether a parameter value needs quotes. For a `behavior`-type parameter, the metadata's `behaviorNameHint` tells you which behavior NAME to fill (the parameter's extraInfo is the required behavior TYPE, not the value to write).
- Prefer `compact: true` on `gdevelop_search_instruction_metadata` and `gdevelop_get_instruction_metadata` when you only need types and parameter shapes, to keep responses small. Add `target_scope` when authoring scene or extension-function event bodies so compatibility is explicit.
- Prefer `simulate_preview_input` to verify input-driven gameplay (movement, fire, restart) instead of editing variables as a hack; then inspect/screenshot to confirm. For the one-call, throttle-proof version use `run_frames`; use `clickAndHold` for mouse press/release timing and `include_cursor_world_coordinates` when layer/camera transforms affect hit testing.
- For reproducible runtime tests, prefer `run_frames` (one call: inputs + step N + state) over the multi-call pause/step/inspect loop — and `run_frames` keeps working on a throttled/backgrounded preview window where inspect/screenshot time out. Use `set_runtime_state` to set up hard-to-reach states.
- To set a Text object's text / opacity / animation (the hidden capability actions), don't guess the type — query `gdevelop_search_instruction_metadata` and read `commonTaskHints`. Text setter is `TextContainerCapability::TextContainerBehavior::SetValue` with params `[objectName, "Text", "=", "\"your text\""]` (operator + quoted value).
- Use `recentSounds` (fired since last inspect) and `activeSounds` (playing now, with loop state) from `gdevelop_inspect_running_preview` to confirm a sound actually played / a BGM is still looping; `simulate_preview_input` returns `inputState` so you can confirm a key registered.
- When an action must affect EACH instance of an object (e.g. every enemy fires a bullet), wrap it in a ForEach event — a plain Standard event's Create/action runs once for a single picked instance. `lint_scene_events` warns (`create-without-for-each`) on the likely-wrong pattern.
- Use `generate_placeholder_asset` to build a playable demo end-to-end inside MCP when you have no art/audio yet; swap in real assets later.
- When art arrives as a packed sprite sheet, use `slice_sprite_sheet` (grid by `columns`+`rows` or `frame_width`+`frame_height`) to cut and bind it as an animation in one call, instead of hand-listing every frame.
- For a grid level built from a tileset, use `create_tilemap_object` (tileset = atlas image + `tile_size`) then `set_tilemap_tiles`. Remember the grid is `tiles[y][x]`, empty is **-1**, and a tile id is `row*columnCount+col`; paint big areas with `fill` and read back with `get_tilemap_tiles`.
- If you're unsure how any tool/object/instruction works, the GDevelop source at https://github.com/zhouzhipeng/Gdevelop is the authoritative reference (object config in `Extensions/<Name>/JsExtension.js`, instructions in the extension `AddAction`/`AddCondition` declarations, runtime in `GDJS/Runtime`).
- Independent object/resource creates against one open project can be issued in parallel safely (they mutate the same in-memory project synchronously per call); still read back after the batch. Prefer `bulk_edit_scene_assets` over many parallel calls when possible.
- There is no "initially hidden" flag on an initial instance. The quickest approximation is `put_2d_instances` with `initially_hidden:true` (sets opacity 0 — but the object still collides); for a fully inert hidden object, create it normally and Hide it in a "scene start" (`SceneJustBegins`) event (which you can add in the same `bulk_edit_scene_assets` call via `events`).
- To center/anchor an instance, use the `align` field on `put_2d_instances` (e.g. `align: "center"` or `"bottom center"`) instead of hand-computing `(sceneWidth - objectWidth)/2`.
- If you compare a scene timer with `CompareTimer` (or `TimerElapsedTime`), make sure a `ResetTimer` action starts it somewhere — an unstarted timer compares as always-false and fails silently. `lint_scene_events` flags this as `timer-compared-but-never-started`.
- Operating on an object GROUP in a collision condition or an object-variable action (e.g. "bullet in collision with Enemies → subtract Enemies.hp") is a known per-instance footgun and may not affect members as you expect. `lint_scene_events` warns (`group-objectvar-or-collision`); VERIFY at runtime, and if it misbehaves use a ForEach over a single object type. This was the one functional bug in a recent build.
- For scene/global BOOLEAN flags use `SetBooleanVariable` (action) / `BooleanVariable` (condition) with a yes/no value — not 0/1 numbers and not the object/dialogue same-named instructions. See `commonInstructionTypes`.
- `gdevelop_get_instruction_metadata` returns `parameterShape.parameterTemplate` — a ready array with code-only slots pre-filled `""` and `<type>` placeholders for the rest, so you don't have to align hidden-parameter indexes by hand.
- Enumerated parameters (`operator`, `relationalOperator`, `yesorno`, `trueorfalse`) now carry `acceptedValues` in their metadata — fill from that list, don't guess. Operator/relationalOperator values depend on the manipulated type (carried in the parameter's extraInfo): a NUMBER operator accepts `=,+,-,*,/`; a BOOLEAN operator (e.g. `SetBooleanVariable`) accepts `True,False,Toggle`.
- For scene/global BOOLEAN flags, `SetBooleanVariable` params are `[variableName, "True"|"False"|"Toggle", ""]` — capitalized operator, NOT yes/no/1/0; the 3rd param is a hidden code-only `""`. See `commonTaskHints`.
- For a Sprite whose Create(x,y) should place by CENTER and rotate around the middle, pass `center_origin:true` to `create_sprite_object_from_resource` (it sets the origin to the image center) instead of hand-computing origin per object.
- `generate_placeholder_asset` for a non-rectangle `shape` returns a fitted `collisionMask` polygon — pass it to `create_sprite_object_from_resource` so transparent corners of a triangle/diamond/circle don't register collisions (the default is the full-image box).
- `create_sprite_object_from_resource` returns `framesPerAnimation` (name + framesCount per animation) so you can confirm a multi-frame animation bound without a separate read-back.
- To anchor a Text object to the screen CENTER or RIGHT edge, pass `align:"center"` / `align:"right"` to `create_text_object`; with no explicit width it spans the scene width and sets the matching textAlignment (a width-0 text would otherwise anchor its left edge off-target).
- To create an object AND initialize it (random speed, animation, etc.), Create it then set its variables/animation IN THE SAME event — there is no single create-with-values action (Create only takes object + x/y/layer). See the "Create an object WITH initial values" example in `gdevelop_get_events_json_examples`.
- `bulk_edit_scene_assets` supports `dry_run:true` — validate the asset/behavior/variable/instance plan (missing objects, unknown behavior types, malformed payloads) before applying, like the events validation flow.
- Screenshots reflect the last RENDERED frame and need a window that rendered; `run_frames`/`inspect` read memory and don't. So verify state with `run_frames`/`inspect` and use `capture_preview_screenshot` (main-process capture) for visuals — don't pause→play→screenshot in a loop chasing a fresh frame.
- Renaming the game (project name) does NOT rename the saved `.json` file on disk — that's expected; there is no MCP capability to rename the file.
- `dry_run:true` on `bulk_edit_scene_assets` is a HARD no-mutation path (result `mutated:false`), including events — use it to validate a build plan safely before applying.
- Before a risky multi-step build, `snapshot_project`; if something goes wrong, `restore_project_snapshot { snapshot_id }` to roll back (in memory, session-scoped).
- To author an instruction without hand-building JSON, use `create_action`/`create_condition` with NAMED params — it orders params, fills hidden code-only slots, and quotes by type for you.
- `add_scene_events` receipts now list `requestedOperations` + `operationSummary` + `lowLevelMutations` (a single replace expands to delete+insert, so the low-level count can exceed the requested operation count — that's expected, not a bug).
- `gdevelop_inspect_running_preview` returns `previewHealth`: `responsive` (got the dump), `connected-status-only`, or `connected-unresponsive` (socket up but the debugger dump didn't answer — usually an occluded/suspended window; use `run_frames` or `launch_preview`+focus). `capture_preview_screenshot` results carry `debuggerId` + `sceneName` + `sceneElapsedTimeSeconds` so you can tell a stale capture from a fresh one.
- Updating an EXISTING object's properties (e.g. set_text_object_properties) will NOT spawn a stray instance — instance creation is inferred only for brand-new objects, or when you pass `create_instance:true`/an explicit `instance` payload.
- For per-instance data on placed objects (e.g. each of 3 hearts an index), set `variables` directly on the instance in `put_2d_instances` instead of a scene-start Repeat+Create loop.
- For `set_runtime_state` spawnInstance, pass `x`/`y` to place the new instance (omitting them spawns at 0,0). To spawn relative to another object, read its position first via `run_frames`/inspect.
- In expressions, reference an object variable with the canonical `Object.Variable(Name)` form (the legacy `Object.Name` shorthand is tolerated but discouraged).
- Pass `summary_only:true` on write tools that echo the object/instances (`create_sprite_object_from_resource`, `create_text_object`, `set_sprite_animations`, `replace_object_definition`, `put_2d_instances`) to keep responses small — the full serialized object/instance list is omitted.
- To declare several variables at once (e.g. an object's hp/points/speed), use `bulk_edit_scene_assets` `variables` (scope "object" + object_name) instead of N `add_or_edit_variable` calls.
- Prefer `instance_positions_for` on `gdevelop_inspect_running_preview` over `include_raw_dump` to read a few instance coordinates.
- Use `sceneElapsedTimeSeconds` from the runtime snapshot to judge game speed; never infer timing from MCP latency.
- Pass resource-name parameters (sound/music/image/font) as BARE names, never quoted.
- To find a capability behavior's name on an object (for instruction behavior parameters), call `list_available_behaviors` with `object_name` and read `objectBehaviors` (Text, Animation, Effect, Opacity, Resizable, Scale, Flippable).
- Declare scene/global variables up front with `bulk_edit_scene_assets` `variables`, or auto-declare via the `event_changes` `undeclared_variables` field; an undeclared variable fails event validation even with a correct bare name.
- Prefer `bulk_edit_scene_assets` (now incl. behaviors + variables) for initial setup to cut round-trips.
- Prefer `capture_preview_screenshot` to visually verify a running preview rather than inferring appearance from instance coordinates. It defaults to the latest preview; pass `debugger_id` to target a specific one.
- When multiple previews accumulate, `control_preview { action: "close", close_all: true }` before relaunching so screenshots/sound checks don't hit a stale window.
- Clear many instances of an object at once with `set_runtime_state` `deleteAllInstances` instead of repeated `deleteInstance` by index.
- Rename placeholder scenes with `rename_scene` (don't leave "Untitled scene") — it updates references and is safe.
- For large event sheets, use `read_scene_events_serialized` with `summary_only:true`, or `read_serialized_scene` with `object_name`, to avoid dumping huge JSON into context.
- Prefer `read_serialized_scene` with `object_name`/`object_names` to inspect a single object instead of dumping the whole scene.
- File-based tools (`validate_events_json_file`, `replace_scene_events_from_file`, `apply_validated_scene_patch` with `patch_file`) accept project-relative paths (resolved against the project folder), the same as resource `file` paths; absolute paths also work.
- File-based project/extension JSON tools (`replace_extension_function_events_from_file`, `apply_validated_project_json_patch`, `sync_editor_from_validated_project_json`, `apply_validated_extension_patch`) also accept project-relative paths or absolute paths. Use them instead of inlining huge JSON.
- Prefer `inspect_project_resources` with `compact: true` before and after asset replacement tasks; request full output only when investigating references.
- Prefer `create_sprite_object_from_resource` for a simple Sprite from one image resource.
- Prefer `create_text_object` for new text labels/HUD, and `set_text_object_properties` for existing text objects.
- Prefer `inspect_project_cleanup` before removing old empty scenes, unused objects, or unused resources.
- Prefer `lint_scene_events` after any event write.
- Use `set_first_layout` or `set_project_properties` for project-level changes. Do not edit project JSON on disk.
- Use validated JSON patch tools only for controlled in-memory editor-model edits. They are not permission to hand-edit the opened `.json` file on disk.
- For custom object hitboxes and mouse targeting, inspect prefab geometry first; do not widen the parent area just to cover a visible child without understanding the `IsCursorOnObject` side effect.
- For prefab image resources, a Resource property is not enough by itself. Inspect binding evidence, then bind/read back/preview.
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
- Every Group has an explicitly set color, and no two Groups in the scene share the same color.
- No JavaScript event was created or modified unless the user explicitly requested JavaScript.
- `lint_scene_events` passed after event writes.
- Referenced resources have non-empty files and valid paths, or remaining invalid resource paths were explicitly reported.
- If cleanup was requested, `inspect_project_cleanup` was read first and any heuristic candidates were confirmed before deletion.
- The startup scene is set with `set_first_layout` or verified from `read_game_project_json`; do not rely on a disk-only patch.
- No opened project `.json` file was directly edited. All project changes went through MCP tools and were saved with `gdevelop_save_project_and_wait` when persistence was required.
- Any direct JSON patch/sync used `dry_run:true` or validation first, reported no validation/code-generation errors, and was read back after mutation.
- Custom object geometry changes were checked with `inspect_custom_object_runtime_geometry` when parent area, child bounds, or cursor hit behavior mattered.
- Prefab Resource property changes were checked with `inspect_prefab_property_bindings`, and any static binding limitation was reported.
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
- Leaving Groups with no color, or giving two different Groups the same color. Fix: set a distinct `color: { r, g, b }` on every Group (via `create_group`/`wrap_events_in_group`, or `rename_group` afterwards) so each Group's color is unique within the scene.
- Using JavaScript events to implement normal gameplay logic. Fix: use standard GDevelop events/instructions; only use JavaScript when the user explicitly asks for it.
- Editing instances without `describe_instances`. Fix: read existing IDs and positions first.
- Rewriting or patching the opened project JSON file for any change. Fix: use focused MCP tools, then `gdevelop_save_project_and_wait`.
- Treating validated JSON patch tools as disk-edit permission. Fix: use them only through MCP against the in-memory editor model; never modify the opened `.json` file directly.
- Replacing all scene events just to group them. Fix: use `wrap_events_in_group`, `move_events_to_group`, and `rename_group`.
- Continuing to use an old `event-N` path after moving/grouping events. Fix: assign/read `aiGeneratedEventId` and target by ID.
- Adding an audio resource with an empty `file`. Fix: call `add_or_update_resource` with a real local path and verify with `inspect_project_resources`.
- Assuming `SAVE_PROJECT` completed because `gdevelop_run_command` returned `launched`. Fix: use `gdevelop_save_project_and_wait`.
- Patching `firstLayout` directly in saved JSON while the editor is open. Fix: call `set_first_layout` or `set_project_properties`, then save through MCP.
- Creating many resources/objects/instances one by one for initial setup. Fix: use `bulk_edit_scene_assets` unless stepwise validation is needed.
- Hand-writing serialized Sprite/Text object JSON for simple objects. Fix: use `create_sprite_object_from_resource` or `create_text_object`.
- Treating preview launch as runtime verification. Fix: after launching, call `gdevelop_inspect_running_preview` (live counts, variables, `errors`) and `capture_preview_screenshot` (visual check), and report that evidence; a launched preview alone is not a passed smoke test.
- Ignoring `staleStateAdvisory` after a write. Fix: if it says `previewMayBeStale:true`, close/relaunch previews before runtime verification; if it lists editor panels, read back through MCP and refresh/reopen stale panels before trusting the UI.
- Trusting a prefab Resource property without checking the child Sprite. Fix: call `inspect_prefab_property_bindings`; if only a static default is needed, use `bind_child_sprite_resource_property` and read back.
- Making an events-based object parent area huge to catch mouse input. Fix: inspect geometry and prefer visible child bounds/points; remember `IsCursorOnObject(Object)` follows the parent area.
- Inspecting a stale preview after relaunching. Fix: `gdevelop_inspect_running_preview` and `capture_preview_screenshot` default to the latest preview; if needed target one via `debugger_id`, or `control_preview { action:"close", close_all:true }` before relaunching to remove stale windows entirely.
- A 2nd+ preview window whose `gdevelop_inspect_running_preview` / `capture_preview_screenshot` / `control_preview step` time out (`runtime` unavailable). Cause: the OS suspended the backgrounded/occluded window's renderer. Mitigations now in place: a power-save blocker keeps the app's event loop alive while a preview is open, and screenshots are taken from the main process — so `run_frames` and `gdevelop_inspect_running_preview` should keep working. If a specific window is still unresponsive, `control_preview { action:"focus" }`, or `close_all` and relaunch a single preview. For layout-only checks, `render_scene_to_png` never needs a running preview.
- Quoting a resource-name parameter. Fix: sound/music/image/font resource parameters take a BARE name (`Shoot`), not `"Shoot"`; check the param's `literalSyntax`.
- Authoring a multi-frame animation (e.g. an explosion) without setting `timeBetweenFrames`/`loop`. Fix: set them explicitly in `set_sprite_animations`; set `loop:false` for one-shot animations so HasAnimationEnded works.
- Passing a bare variable name that fails validation and assuming it is a quoting problem. Fix: the variable is almost certainly undeclared — declare it (`add_or_edit_variable` / `bulk_edit_scene_assets` `variables`) or use `event_changes` `undeclared_variables`. The bare-name format was already correct.
- Guessing a capability behavior's name (Text/Animation/etc.). Fix: call `list_available_behaviors` with `object_name` and read `objectBehaviors`.
- Trying to verify movement/fire/restart by watching an idle preview or editing variables as a hack. Fix: use `simulate_preview_input` to inject the keys, then inspect/screenshot.
- Racing the wall clock: testing live gameplay across slow MCP round-trips so the game is already over by your next call. Fix: `control_preview` pause + step N frames for deterministic timing; use `set_runtime_state` to set up states.
- Using `Create` (or another per-instance action) in a plain Standard event and expecting it to run for every instance. Fix: wrap it in a ForEach over that object; `lint_scene_events` flags this as `create-without-for-each`.
- Duplicating an event once per input key. Fix: use one event with an `Or` sub-condition (arrows + WASD in a single event). Put the children in the Or's `subInstructions` array (NOT a `conditions` key, which is silently dropped, leaving an empty Or that matches nothing).
- A simulated "just pressed from text" condition not firing. Fix: `KeyFromTextJustPressed` may not react to a simulated key-down; use the plain `KeyPressed` condition (quoted key name), which `simulate_preview_input` drives directly.
- Guessing between modern and legacy internal type names (e.g. `SetX` vs `MettreX`). Fix: confirm with `gdevelop_get_instruction_metadata`; use the modern non-deprecated name.
- Leaving placeholder scene names. Fix: `rename_scene` (safe, updates references).
- Dropping hidden/code-only parameters (currentScene, conditionInverted, objectsContext) from the parameters array. Fix: keep them as `""` placeholders; `gdevelop_get_instruction_metadata` lists every parameter.
- Guessing a `behavior_type` string for `add_behavior`, or passing a behavior TYPE where a behavior NAME is expected (in instruction behavior parameters, `remove_behavior`, or `change_behavior_property`). Fix: call `list_available_behaviors` for the exact type and default name; use the behavior NAME (e.g. `PlatformerObject`) in instruction parameters.
- Leaving a Sprite frame with `hasCustomCollisionMask: true` and an empty `customCollisionMask` (collisions silently never fire). Fix: check `suspiciousCollisionMasks` in `inspect_project_resources`/`inspect_project_cleanup`; give the frame a full-image or non-empty mask via `set_sprite_animations`.
- Omitting `scene_name` when adding an object variable to a scene object. Fix: pass `scene_name` for `variable_scope: "object"` unless the object is global.
- Assuming a multi-word instruction search returns nothing because the phrase is not a literal substring. Fix: `gdevelop_search_instruction_metadata` tokenizes queries and aliases common intents; phrases like "play sound effect" or "change position" now work and results are ranked.
- Assuming command names. Fix: call `gdevelop_list_commands`.
- Forgetting that events without conditions run every frame. Fix: add conditions such as `SceneJustBegins` or a trigger condition when appropriate.
- Adding object-specific events before the object exists. Fix: create/inspect object first.
- Editing extension functions without checking parent kind. Fix: pass `parent_kind` and `parent_name` for behavior/object methods.
- Writing extension function sentences with wrong `_PARAMx_` indexes. Fix: free functions start user parameters at `_PARAM1_`; behavior/object functions account for automatic object/behavior parameters. MCP rejects missing/wrong placeholders and rolls the write back.
- Using `is_shared` for object properties. Fix: only behavior properties can be shared.
