// @flow

export type McpPermissionOptions = {|
  allowWriteTools: boolean,
  allowCommandTools: boolean,
|};

export type McpTool = {|
  name: string,
  title?: string,
  description: string,
  inputSchema: Object,
  outputSchema?: Object,
  annotations?: {|
    readOnlyHint?: boolean,
    destructiveHint?: boolean,
    idempotentHint?: boolean,
    openWorldHint?: boolean,
  |},
|};

export type McpResource = {|
  uri: string,
  name: string,
  description: string,
  mimeType: string,
|};

export type McpPrompt = {|
  name: string,
  description: string,
  arguments?: Array<{|
    name: string,
    description: string,
    required?: boolean,
  |}>,
|};

const emptyObjectSchema = {
  type: 'object',
  properties: {},
  additionalProperties: true,
};

const noInputSchema = {
  type: 'object',
  properties: {},
  additionalProperties: false,
};

const openProjectSchema = {
  type: 'object',
  properties: {
    project_path: {
      type: 'string',
      description:
        'Absolute path to a local project.gdevelop entry file or a legacy GDevelop JSON project file.',
    },
    discard_unsaved_changes: {
      type: 'boolean',
      description:
        'Default false. Must be true when the currently open project has unsaved in-memory changes; those changes will be discarded before opening the requested project.',
    },
  },
  required: ['project_path'],
  additionalProperties: false,
};

const reloadProjectSchema = {
  type: 'object',
  properties: {
    mode: {
      type: 'string',
      enum: ['wait', 'start', 'status'],
      description:
        'wait (default) starts or attaches and waits for completion. start starts or attaches but returns the operation_id and current phase immediately. status never starts a reload and returns an immediate snapshot; omit operation_id to discover the active or latest retained operation after a caller interruption.',
    },
    timeout_ms: {
      type: 'number',
      minimum: 1000,
      maximum: 600000,
      description:
        'Optional wait timeout in milliseconds. Defaults to 120000. If the wait expires, the reload continues and the timeout error returns an operation_id.',
    },
    operation_id: {
      type: 'string',
      description:
        'Optional reload operation ID returned by start mode, a previous timeout, or status discovery. Reattaches to the running operation or returns its retained terminal receipt without starting another reload.',
    },
  },
  additionalProperties: false,
};

const sceneNameSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const toolNameSchema = {
  type: 'object',
  properties: {
    tool_name: {
      type: 'string',
      description:
        'Optional MCP tool name. When omitted, returns information for every tool.',
    },
  },
  additionalProperties: false,
};

// Shared tile-spec item used by tilemap tools: a tile is a number (tileId; <0
// clears), or an object addressing the tileset cell + optional flips.

const inspectRunningPreviewSchema = {
  type: 'object',
  properties: {
    debugger_id: {
      type: 'string',
      description:
        'Optional specific preview/debugger id to inspect. Defaults to the latest (most recently launched) running preview. availableDebuggerIds and latestDebuggerId are returned so you can target another one.',
    },
    timeout_ms: {
      type: 'number',
      description:
        'How long to wait (200-10000 ms, default 2500) for the runtime dump reply before returning status/logs/diagnostics only.',
    },
    include_raw_dump: {
      type: 'boolean',
      description:
        'Default false. When true, include the full raw runtime game dump (very large) in addition to the compact summary.',
    },
    instance_positions_for: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Optional object names to include live instance positions (x/y/angle/layer/zOrder, up to 50 each) in the compact summary — e.g. ["Player"] to confirm where the player is, without pulling the raw dump.',
    },
    include_instance_positions: {
      type: 'boolean',
      description:
        'Default false. When true, include instance positions for ALL objects (can be large).',
    },
    objects: {
      type: 'array',
      maxItems: 50,
      items: { type: 'string' },
      description:
        'Optional object names for bounded per-instance runtime inspection. Returns at most 50 instances per object and reports missing objects explicitly.',
    },
    include: {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
        enum: ['position', 'angle', 'forces', 'variables', 'behaviors'],
      },
      description:
        'Fields to return for objects. Defaults to position, angle, forces, variables, and behaviors when objects is provided.',
    },
    instance_indexes: {
      type: 'array',
      uniqueItems: true,
      maxItems: 50,
      items: { type: 'integer', minimum: 0 },
      description:
        'Optional zero-based instance indexes to return for every requested object. Missing indexes are reported explicitly.',
    },
  },
  additionalProperties: false,
};

const previewHealthCheckSchema = {
  type: 'object',
  properties: {
    debugger_id: inspectRunningPreviewSchema.properties.debugger_id,
    timeout_ms: {
      type: 'number',
      description:
        'How long to wait (200-5000 ms, default 1000) for a targeted getStatus reply before classifying the connected preview as unresponsive.',
    },
  },
  additionalProperties: false,
};

const waitUntilPreviewReadySchema = {
  type: 'object',
  properties: {
    debugger_id: inspectRunningPreviewSchema.properties.debugger_id,
    timeout_ms: {
      type: 'number',
      description:
        'How long to wait (500-30000 ms, default 6000) for a targeted getStatus reply before reporting the preview as connected-unresponsive.',
    },
    require_paused: {
      type: 'boolean',
      description:
        'Default false. When true, readiness requires getStatus to report isPaused:true.',
    },
  },
  additionalProperties: false,
};

const capturePreviewScreenshotSchema = {
  type: 'object',
  properties: {
    file_path: {
      type: 'string',
      description:
        'Absolute path to write the PNG to (parent directories are created). If omitted, the screenshot is returned as a base64 data URL instead of a file.',
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id to capture. Defaults to the latest launched preview, so you do not capture a stale game-over window. See availableDebuggerIds from gdevelop_inspect_running_preview.',
    },
    canvas_only: {
      type: 'boolean',
      description:
        'Canvas capture is already the default. Set true to forbid the full-window fallback.',
    },
    capture_mode: {
      type: 'string',
      enum: ['canvas', 'window'],
      description:
        'Default "canvas": force a render and capture exact game-canvas pixels. Use "window" only when the Electron preview chrome/content area is intentionally needed.',
    },
    exact_game_resolution: {
      type: 'boolean',
      description:
        'When true, require intrinsic game-canvas output and disable the full-window fallback.',
    },
    retry_count: {
      type: 'number',
      description:
        'Automatic retries for black, transparent, dimensionally inconsistent, or unavailable canvas frames. Defaults to 2 (3 total attempts), maximum 5.',
    },
    target_width: {
      type: 'number',
      description:
        'Optional fixed output PNG width. Must be used with target_height. Resizes the captured PNG when Electron nativeImage is available.',
    },
    target_height: {
      type: 'number',
      description:
        'Optional fixed output PNG height. Must be used with target_width. For pixel-level game-canvas checks, prefer canvas_only:true plus the game resolution (for example 800x450).',
    },
  },
  additionalProperties: false,
};

const simulatePreviewInputSchema = {
  type: 'object',
  properties: {
    inputs: {
      type: 'array',
      description:
        'Ordered list of input events to inject into the running game. In the Electron editor, mouseButtonPressed also injects a native Chromium click/user gesture so pointer lock and WebAudio are unlocked before runtime input is applied. Press and release are separate events; hold a key by sending keyPressed without a matching keyReleased (the game keeps it pressed across frames until released).',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description:
              'One of: keyPressed, keyReleased, releaseAllKeys, mouseMove, mouseButtonPressed, mouseButtonReleased, touchStart, touchMove, touchEnd.',
          },
          key: {
            type: 'string',
            description:
              'Key name for keyPressed/keyReleased, e.g. "Left", "Right", "Up", "Down", "Space", "Return", "Escape", "a"-"z", "F1". Case-insensitive.',
          },
          key_code: {
            type: 'number',
            description: 'Raw DOM key code (alternative to key).',
          },
          button: {
            description:
              'Mouse button for mouseButton* — number (0=left,1=right,2=middle) or name ("left"/"right"/"middle").',
          },
          x: {
            type: 'number',
            description: 'Game (scene) X coordinate for mouse/touch events.',
          },
          y: {
            type: 'number',
            description: 'Game (scene) Y coordinate for mouse/touch events.',
          },
          identifier: {
            type: 'number',
            description: 'Touch identifier for touch events (default 0).',
          },
        },
        required: ['type'],
        additionalProperties: true,
      },
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id. Defaults to the latest running preview.',
    },
    confirm: {
      type: 'boolean',
      description:
        'Default true. After injecting, read back the InputManager state (returned as inputState: pressedKeyCodes/lastPressedKey/mouseX/mouseY) so you can confirm the game actually received the input. Set false to skip.',
    },
  },
  required: ['inputs'],
  additionalProperties: false,
};

const controlPreviewSchema = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      description:
        'pause (freeze the game loop), play (resume), step (advance exactly N frames while paused for deterministic testing), close (stop previews directly), or focus (bring all preview windows to front - fixes timed-out inspect/screenshot when a backgrounded preview is throttled). Defaults to step. For stale-preview cleanup before verification, close all previews here, then call launch_preview with start_paused=true and force_new=true.',
    },
    frames: {
      type: 'number',
      description: 'For action=step: number of frames to advance (default 1).',
    },
    frame_delta_ms: {
      type: 'number',
      description:
        'For action=step: simulated milliseconds per frame (default ~16.67 = 60 FPS). Keep small; large values are clamped by the engine.',
    },
    close_all: {
      type: 'boolean',
      description:
        'For action=close: close ALL running previews instead of just the targeted one. Then call launch_preview with start_paused=true and force_new=true for a fresh paused preview.',
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id. Defaults to the latest running preview.',
    },
    timeout_ms: {
      type: 'number',
      description:
        'Total timeout for the runFrames reply (500-30000 ms, default 6000). A getStatus readiness preflight uses up to the first 3000 ms.',
    },
    skip_ready_check: {
      type: 'boolean',
      description:
        'Default false. When true, skip the getStatus readiness preflight and send runFrames immediately.',
    },
  },
  additionalProperties: false,
};

const runFramesSchema = {
  type: 'object',
  properties: {
    inputs: {
      type: 'array',
      description:
        'Optional input events to inject BEFORE stepping (same shape as simulate_preview_input: [{ type, key/key_code/button/x/y, ... }]). In the Electron editor, mouse presses also inject a native Chromium click/user gesture before deterministic stepping, which unlocks pointer lock and WebAudio. Held keys (keyPressed without keyReleased) stay pressed across all stepped frames. run_frames also supports { type:"clickAndHold", x, y, button?, frames? }: it moves the cursor, presses before stepping, releases after stepping, and uses frames as the hold duration when top-level frames is omitted.',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          key: { type: 'string' },
          key_code: { type: 'number' },
          button: {},
          x: { type: 'number' },
          y: { type: 'number' },
          identifier: { type: 'number' },
          frames: { type: 'number' },
          hold_frames: { type: 'number' },
        },
        required: ['type'],
        additionalProperties: true,
      },
    },
    frames: {
      type: 'number',
      description: 'Number of frames to step (default 1, max 2000).',
    },
    frame_delta_ms: {
      type: 'number',
      description:
        'Simulated milliseconds per frame (default ~16.67 = 60 FPS). Keep small.',
    },
    auto_release: {
      type: 'boolean',
      description:
        'When true, release ALL held keys in a guaranteed cleanup path after success or runtime failure. The response reports cleanup confirmation and any currently-held keys.',
    },
    instance_positions_for: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Object names whose live instance x/y/angle/layer/zOrder to include in the returned runtime snapshot.',
    },
    objects: inspectRunningPreviewSchema.properties.objects,
    include: inspectRunningPreviewSchema.properties.include,
    instance_indexes: inspectRunningPreviewSchema.properties.instance_indexes,
    include_cursor_world_coordinates: {
      type: 'boolean',
      description:
        'When true, return cursorWorldCoordinates computed after stepping: canvas cursor x/y plus world x/y for each requested layer. Use this to debug IsCursorOnObject when layers or cameras are shifted/zoomed.',
    },
    cursor_layers: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Optional layer names for include_cursor_world_coordinates. Defaults to all layers in the running scene. Use "" for the base layer.',
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id. Defaults to the latest running preview.',
    },
  },
  additionalProperties: false,
};

const verifyProjectChangeSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description:
        'Optional scene to launch. Defaults to the project first scene.',
    },
    close_existing_previews: {
      type: 'boolean',
      description:
        'Default true. Close stale previews before launching a fresh paused preview.',
    },
    timeout_ms: {
      type: 'number',
      minimum: 500,
      maximum: 30000,
      description: 'Timeout used for preview launch and inspection.',
    },
    frames: {
      type: 'integer',
      minimum: 0,
      maximum: 2000,
      description: 'Frames to advance after launch. Defaults to 1.',
    },
    frame_delta_ms: runFramesSchema.properties.frame_delta_ms,
    inputs: runFramesSchema.properties.inputs,
    objects: inspectRunningPreviewSchema.properties.objects,
    include: inspectRunningPreviewSchema.properties.include,
    instance_indexes: inspectRunningPreviewSchema.properties.instance_indexes,
    assertions: {
      type: 'array',
      maxItems: 100,
      description:
        'Closed, typed runtime assertions. Assertion strings or executable code are never accepted.',
      items: {
        oneOf: [
          {
            type: 'object',
            properties: {
              type: { const: 'object_count' },
              object_name: { type: 'string' },
              operator: {
                type: 'string',
                enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
              },
              value: { type: 'number' },
            },
            required: ['type', 'object_name', 'operator', 'value'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              type: { const: 'instance_position_finite' },
              object_name: { type: 'string' },
              instance_index: { type: 'integer', minimum: 0 },
            },
            required: ['type', 'object_name'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              type: { const: 'runtime_error_count' },
              operator: {
                type: 'string',
                enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
              },
              value: { type: 'number' },
            },
            required: ['type', 'operator', 'value'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [
                  'renderer_has_three_group',
                  'renderer_visible_mesh_count',
                  'renderer_failed_texture_count',
                  'renderer_rejected_object_count',
                ],
              },
              layer_name: { type: 'string' },
              operator: {
                type: 'string',
                enum: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'],
              },
              value: { type: ['number', 'boolean'] },
            },
            required: ['type', 'operator', 'value'],
            additionalProperties: false,
          },
        ],
      },
    },
    screenshot: {
      type: 'object',
      properties: capturePreviewScreenshotSchema.properties,
      additionalProperties: false,
      description:
        'Optional screenshot request performed only after every assertion passes.',
    },
  },
  additionalProperties: false,
};

const launchPreviewSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description:
        "Which scene/layout to preview. When omitted, the project's FIRST scene (firstLayout) is launched — NOT whatever tab happens to be open in the editor. Pass a scene name to preview that specific layout. The result echoes requestedScene/expectedScene/actualScene and sets sceneMismatch:true if the running scene differs, so you can detect a wrong-scene launch instead of it silently succeeding.",
    },
    start_paused: {
      type: 'boolean',
      description:
        'When true, pause the preview as soon as it connects to the debugger, so you can run a deterministic test near frame 0 (the game otherwise runs in real time immediately and may end before your next call). Then use run_frames / control_preview step to advance, or control_preview play to run normally. When attaching to an already-running preview, it is paused in place instead.',
    },
    force_new: {
      type: 'boolean',
      description:
        'When true, always open a NEW preview window. By default (false) this attaches to an already-running preview (the editor shares one debugger channel), avoiding duplicate windows and stale game-over windows; set this only when you specifically need a fresh window.',
    },
    display_collision_shapes: {
      type: 'boolean',
      description:
        'Show object collision shapes in the preview. When omitted, the editor toolbar setting is used. Passing either true or false opens a new preview window because an already-running preview cannot be reconfigured.',
    },
    timeout_ms: {
      type: 'number',
      description:
        'How long to wait for debugger connection and runtime getStatus readiness (500-30000 ms, default 15000). If start_paused is true, pause must also be confirmed before success:true is returned.',
    },
  },
  additionalProperties: false,
};

const setRuntimeStateSchema = {
  type: 'object',
  properties: {
    operations: {
      type: 'array',
      description:
        'Test/debug state operations applied to the running game, in order.',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description:
              'setVariable | moveInstance | spawnInstance | deleteInstance | deleteAllInstances.',
          },
          scope: {
            type: 'string',
            description: 'For setVariable: "scene" or "global".',
          },
          name: {
            type: 'string',
            description: 'For setVariable: variable name.',
          },
          value: {
            description: 'For setVariable: number, string, or boolean.',
          },
          objectName: {
            type: 'string',
            description: 'For move/spawn/deleteInstance: the object name.',
          },
          index: {
            type: 'number',
            description:
              'For move/deleteInstance: which instance (default 0, the first).',
          },
          x: {
            type: 'number',
            description:
              'For moveInstance/spawnInstance: scene X. For spawnInstance, if x AND y are both given the new instance is placed exactly there; if omitted it spawns at the object default (0,0). To spawn relative to another object (e.g. above the player), read that position first via run_frames/inspect and compute x/y.',
          },
          y: {
            type: 'number',
            description: 'For moveInstance/spawnInstance: scene Y (see x).',
          },
        },
        required: ['type'],
        additionalProperties: true,
      },
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id. Defaults to the latest running preview.',
    },
  },
  required: ['operations'],
  additionalProperties: false,
};

const extensionNameSchema = {
  type: 'object',
  properties: {
    extension_name: {
      type: 'string',
      description: 'Name of the project events-functions extension.',
    },
  },
  required: ['extension_name'],
  additionalProperties: true,
};

const extensionInspectSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    summary_only: {
      type: 'boolean',
      description:
        'Return only extension counts plus function/object/behavior names. Omits events and serialized JSON by default.',
    },
    list_functions_only: {
      type: 'boolean',
      description:
        'Return only free/behavior/object functions in a flat list. Omits events and serialized JSON by default unless include_events/include_serialized are true.',
    },
    list_objects_only: {
      type: 'boolean',
      description:
        'Return only events-based objects. Omits function events and serialized JSON by default unless include_events/include_serialized are true.',
    },
    list_behaviors_only: {
      type: 'boolean',
      description:
        'Return only events-based behaviors. Omits function events and serialized JSON by default unless include_events/include_serialized are true.',
    },
    include_events: {
      type: 'boolean',
      description:
        'Override whether function eventsAsText/eventsJson are included. Default true for full inspect, false for compact modes.',
    },
    include_serialized: {
      type: 'boolean',
      description:
        'Override whether serializedExtension/serializedFunction/serializedObject/serializedProperty fields are included. Default true for full inspect, false for compact modes.',
    },
  },
  required: ['extension_name'],
  additionalProperties: true,
};

const extensionFunctionSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    function_name: {
      type: 'string',
      description: 'Internal name of the events function.',
    },
    parent_kind: {
      type: 'string',
      description:
        'Optional parent kind: extension, behavior, or object. Defaults to extension/free function.',
    },
    parent_name: {
      type: 'string',
      description:
        'Required when parent_kind is behavior or object: internal behavior/object name.',
    },
    new_function_name: {
      type: 'string',
      description:
        'Optional new internal name for renaming the events function.',
    },
    function_type: {
      type: 'string',
      description:
        'Function kind: action, condition, expression, expression_and_condition, or action_with_operator.',
    },
    full_name: {
      type: 'string',
      description: 'Display name shown in the editor.',
    },
    description: {
      type: 'string',
      description: 'Description shown in the editor.',
    },
    sentence: {
      type: 'string',
      description:
        'Sentence shown in the events sheet. MCP validates _PARAMx_ placeholders against the final parameter list and rolls back invalid updates. Free functions start user parameters at _PARAM1_ because _PARAM0_ is the hidden scene parameter. Behavior/object functions use _PARAM0_ for the object; behavior parameters are implicit and user parameters come after the automatic object/behavior parameters.',
    },
    parameters: {
      type: 'array',
      description:
        'Function parameter metadata. By default this is the final caller-managed parameter list: old unused parameters are removed. Set parameters_mode:"upsert" for additive edits. For behavior/object functions, automatic object/behavior parameters are maintained by GDevelop before sentence validation.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: {
            type: 'string',
            description:
              'GDevelop parameter type, for example object, expression, string, variable, layer, or behavior. For type "variable" inside extension functions, use CopyArgumentToVariable2 / CopyVariableToArgument2 in events; do not pass the parameter name directly to NumberVariable or SetNumberVariable.',
          },
          description: { type: 'string' },
          long_description: { type: 'string' },
          value_type: {
            type: 'object',
            description: 'Optional value type metadata.',
            additionalProperties: true,
          },
        },
        required: ['name'],
        additionalProperties: true,
      },
    },
    parameters_mode: {
      type: 'string',
      description:
        'Default "replace": the provided parameters array is the final caller-managed parameter list, so old unused parameters are removed. Use "upsert" only for additive edits that must preserve unspecified existing parameters. Automatic behavior/object parameters are always preserved.',
    },
    events_json: {
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
        },
        { type: 'object', additionalProperties: true },
      ],
      description:
        'Serialized GDevelop events to replace the function events. Accepts a JSON string, events array, single serialized event object, or { events: [...] }. It is validated before writing, generated JavaScript is preflighted, and function metadata/events are rolled back if validation fails.',
    },
    serialized_function: {
      type: 'object',
      description:
        'Complete serialized events function for advanced edits. Other provided fields are applied afterward.',
      additionalProperties: true,
    },
    dry_run: {
      type: 'boolean',
      description:
        'Validate and summarize the final function without modifying the project. Uses the same unserialize/apply/sentence validation path as a real write, then rolls back.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit eventsJson/eventsAsText and serializedFunction from create/update or inspect responses.',
    },
    compact: {
      type: 'boolean',
      description:
        'For inspect, return only function metadata plus compact event/action/condition summaries. Omits eventsAsText, eventsJson, and serializedFunction.',
    },
    include_events: extensionInspectSchema.properties.include_events,
    include_serialized: extensionInspectSchema.properties.include_serialized,
  },
  required: ['extension_name', 'function_name'],
  additionalProperties: true,
};

const inspectSignalUsageSchema = {
  type: 'object',
  properties: {
    signal_name: {
      type: 'string',
      description:
        'Optional signal name filter for emit actions and Signal received conditions.',
    },
    scene_name: sceneNameSchema.properties.scene_name,
    extension_name: extensionNameSchema.properties.extension_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    function_name: extensionFunctionSchema.properties.function_name,
    include_events: {
      type: 'boolean',
      description:
        'When true, include onSignal handler events as text/json. Default false.',
    },
    include_serialized: {
      type: 'boolean',
      description:
        'When true, include serialized matching events/functions. Default false.',
    },
    limit: {
      type: 'number',
      description: 'Maximum matches per section. Defaults to 100.',
    },
  },
  additionalProperties: true,
};

const readTools: Array<McpTool> = [
  {
    name: 'open_project',
    description:
      'Open a specific local GDevelop project in the current editor window by absolute entry-file path. Accepts project.gdevelop or a legacy JSON project file and waits for project loading, resource fetching, and extension loading to finish. By default, refuses to replace a project with unsaved in-memory changes; pass discard_unsaved_changes:true to explicitly discard them. Opening project.gdevelop may bootstrap missing generated .gdevelop catalogs; opening legacy JSON may migrate it to the multi-file format.',
    inputSchema: openProjectSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'gdevelop_get_editor_state',
    description:
      'Return the current GDevelop editor state, including project availability, scene names, MCP permission state, and basic active project metadata.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_get_editor_selection',
    description:
      'Return the current editor UI selection state, including selected objects, scene instances, layers, selected events/instructions, and selected project-file assets in the Resources editor when supported by the active editor.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_get_project_summary',
    description:
      'Return a compact JSON summary of the current GDevelop project, including scenes, objects, variables, resources, and layers.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneName: {
          type: 'string',
          description: 'Optional scene name to scope the project summary.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_list_scenes',
    description: 'List all scenes/layouts in the current GDevelop project.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_list_objects',
    description:
      'List global and scene objects. Pass sceneName to include objects scoped to one scene.',
    inputSchema: {
      type: 'object',
      properties: {
        sceneName: {
          type: 'string',
          description: 'Optional scene name.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_inspect_signal_usage',
    description:
      'Inspect signal emit actions, scene/external-scene Signal received conditions, and object onSignal handlers across the project, optionally filtered by signal name or extension scope.',
    inputSchema: inspectSignalUsageSchema,
  },
  {
    name: 'generate-catalogs',
    description:
      'Regenerate .gdevelop/instructions-catalog.json, .gdevelop/deprecated-instructions-catalog.json, .gdevelop/settings-catalog.json, .gdevelop/runtime-api.d.ts, and .gdevelop/project-api.d.ts from the current local multi-file project sources. The settings catalog includes the embedded-layout schema and contexts. The call waits for all five generated authoring files to be written and verified before returning. Accepts no inputs, writes only generated authoring files, removes the retired layout-catalog.json, and does not validate sources or reload editor memory. Call this after structural project-file changes, then read the refreshed catalogs and declarations before making dependent edits.',
    inputSchema: noInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'validate_project_files',
    description:
      'Load the current local multi-file project from project.gdevelop, regenerate all catalogs and public JavaScript declaration files, reload the sources using the fresh instruction catalog, reconstruct the legacy game.json representation in memory, validate JavaScript event blocks against the generated context-aware API, then validate through GDevelop and preflight generated extension JavaScript. strict=true JavaScript API violations block validation; compatibility blocks report semantic warnings while syntax errors still block. valid:true proves structural, JavaScript authoring-API, and code-generation validity only; it does NOT verify runtime gameplay semantics, object picking, or action side effects. Accepts no inputs, writes only generated .gdevelop authoring files, does not reload editor memory, and reports the blocking file, error code, line, column, and source excerpt when available. Call this after direct project-file edits and require valid:true before reload_project, then runtime-test behavior-sensitive changes with a paused preview and run_frames.',
    inputSchema: noInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'inspect_tool_schema',
    description:
      'Return MCP tool input schema and usage examples. Use this before calling a tool whose payload shape is unclear.',
    inputSchema: toolNameSchema,
  },
  {
    name: 'get_tool_usage_examples',
    description:
      'Return concrete MCP tool argument examples. Use this to avoid guessing payload names.',
    inputSchema: toolNameSchema,
  },
  {
    name: 'gdevelop_inspect_running_preview',
    description:
      'Inspect a currently running preview to verify runtime behavior: returns whether a preview is running (defaulting to the latest launched one), its status, recent captured console/debugger logs, runtime errors, sounds, input state, and a compact runtime snapshot. Pass objects plus include to get bounded per-instance position, angle, force, variable, and behavior state without requesting the huge raw dump; missing objects, indexes, or fields are explicit. Launch first with launch_preview { start_paused: true }, then advance with run_frames for deterministic tests. Use this to confirm a game actually runs and behaves, not just that a preview was launched.',
    inputSchema: inspectRunningPreviewSchema,
  },
  {
    name: 'reload_project',
    description:
      'Reload the current project from its disk files and regenerate all catalogs plus public JavaScript declarations. This discards stale or unsaved in-memory editor changes. Use mode:"start" to receive the operation_id and current phase immediately, then mode:"status" for non-blocking progress; status without an operation_id discovers the active/latest operation after caller interruption. The default mode:"wait" waits up to timeout_ms (120 seconds by default). Retrying an operation_id never starts a duplicate reload. After editing project files directly, require a completed reload before launch_preview.',
    inputSchema: reloadProjectSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'preview_health_check',
    description:
      'Ping the selected preview/debugger channel before runtime calls: reports whether a preview is connected and responsive, available debugger ids, likely stale/disconnected state, and recommended recovery actions such as launch_preview, focus, close, or relaunch.',
    inputSchema: previewHealthCheckSchema,
  },
  {
    name: 'wait_until_preview_ready',
    description:
      'Wait until the selected preview debugger channel answers getStatus. Use after launch_preview or before run_frames when a preview is still compiling/loading; returns success:false with failurePhase/runtime diagnostics if the connected preview stays unresponsive.',
    inputSchema: waitUntilPreviewReadySchema,
  },
  {
    name: 'capture_preview_screenshot',
    description:
      'Capture a PNG after forcing a render without stepping game logic. Defaults to the exact game canvas, detects suspicious black/transparent or inconsistent frames, retries automatically, and reports source, attempts, quality, and pixel hash. Use capture_mode:"window" only for a full Electron window capture. Writes to file_path or returns a base64 data URL.',
    inputSchema: capturePreviewScreenshotSchema,
  },
  {
    name: 'simulate_preview_input',
    description:
      'Inject simulated keyboard/mouse/touch input into a running preview so you can verify input-driven gameplay (movement, shooting, restart) end-to-end, not just autonomous logic. Mouse presses in Electron additionally pass through the native preview window and a Chromium user gesture, unlocking pointer lock and WebAudio; the result includes a userGesture receipt. Press and release are separate events; hold a key by sending keyPressed without keyReleased. Returns inputState so you can confirm the game received the input. Then use gdevelop_inspect_running_preview / capture_preview_screenshot to verify the effect. Launch a preview first.',
    inputSchema: simulatePreviewInputSchema,
  },
  {
    name: 'control_preview',
    description:
      'Deterministically control a running preview: pause, play, step N frames, close, or focus. Pause + step makes runtime testing reproducible (no wall-clock drift between MCP calls). For a throttled/backgrounded preview window (2nd+ window whose inspect/screenshot times out), prefer run_frames — it steps the simulation on the debugger channel without needing the window to render. Launch a preview first.',
    inputSchema: controlPreviewSchema,
  },
  {
    name: 'set_runtime_state',
    description:
      'Inject test state into a running preview: set scene/global variables and move/spawn/delete instances, to reach gameplay states that are hard to trigger naturally (e.g. set GameOver=0, give the player a position, spawn an enemy). Pause first with control_preview for reproducibility. Launch a preview first.',
    inputSchema: setRuntimeStateSchema,
  },
  {
    name: 'launch_preview',
    description:
      'Launch or attach to a game preview and confirm the runtime debugger is ready by waiting for getStatus. By DEFAULT it previews the project\'s FIRST scene (firstLayout), independent of which scene tab is open in the editor; pass scene_name to preview a specific layout. Set display_collision_shapes to show or hide object collision shapes; an explicit value opens a new preview so the setting is applied. New preview windows are opened through the same "Start Preview and Debugger" command used by the UI. With start_paused:true, success also requires the pause to be confirmed. The result reports requestedScene/expectedScene/actualScene and sets sceneMismatch:true when the running scene differs from what was requested. Returns success:false with failurePhase details if the window/debugger connects but the runtime stays unresponsive. By default it attaches to an already-running preview; pass force_new:true to always open a fresh window (when scene_name is given and the running preview is on another scene, a fresh one is launched on the requested scene).',
    inputSchema: launchPreviewSchema,
  },
  {
    name: 'run_frames',
    description:
      'ATOMIC runtime test: preflight the selected preview, inject inputs, step up to N frames, and return live or partial state. Mouse presses in Electron first inject a native Chromium click/user gesture so pointer lock and WebAudio work during automated verification; the result includes userGesture and recentSounds receipts. Pass objects plus include for bounded per-instance position, angle, force, variable, and behavior state in the same receipt. auto_release runs in guaranteed cleanup even after event failure.',
    inputSchema: runFramesSchema,
  },
  {
    name: 'verify_project_change',
    description:
      'Run the complete file-first verification gate in one bounded workflow: validate disk sources, reload editor memory, optionally close stale previews, launch the requested scene paused, advance frames with normalized input and guaranteed release, inspect bounded runtime/renderer diagnostics, evaluate only closed typed assertions, and optionally capture a screenshot. Stops at the first failed stage and returns every completed stage receipt. A successful result sets runtimeVerified:true and completionReady:true.',
    inputSchema: verifyProjectChangeSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
  },
];

const writeTools: Array<McpTool> = [
  {
    name: 'import_extension',
    description:
      'Import an official GDevelop extension by its registry name (persistence protocol v3). GDevelop downloads the legacy extension JSON with its required dependencies, loads it through the native extension model, waits for any active save, immediately saves the project again, reads the canonical multi-file extension sources back from disk before reporting success, and returns the original writer error when persistence fails. After this one conversion step, edit the returned .settings, .layout, and .events files directly.',
    inputSchema: {
      type: 'object',
      properties: {
        extension_name: {
          type: 'string',
          description:
            'Exact extension name from the official GDevelop extensions repository/registry, for example "StarRatingBar".',
        },
      },
      required: ['extension_name'],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
];

const commandTools: Array<McpTool> = [];

const toolUsageExamples: { [string]: Array<Object> } = {
  open_project: [
    {
      description: 'Open a local multi-file GDevelop project.',
      arguments: {
        project_path: 'C:\\Games\\MyGame\\project.gdevelop',
      },
    },
    {
      description:
        'Open another project and explicitly discard unsaved changes in the current editor project.',
      arguments: {
        project_path: 'C:\\Games\\AnotherGame\\project.gdevelop',
        discard_unsaved_changes: true,
      },
    },
  ],
  'generate-catalogs': [
    {
      description:
        'Regenerate and verify the three project-source catalogs and two JavaScript declaration files after structural file changes.',
      arguments: {},
    },
  ],
  import_extension: [
    {
      description:
        'Import StarRatingBar and generate its canonical multi-file project sources.',
      arguments: { extension_name: 'StarRatingBar' },
    },
  ],
  reload_project: [
    {
      description:
        'Start loading direct project-file edits and receive a correlation ID immediately.',
      arguments: { mode: 'start' },
    },
    {
      description:
        'Discover the active or latest retained reload after a caller interruption.',
      arguments: { mode: 'status' },
    },
    {
      description: 'Wait for a known reload operation to complete.',
      arguments: {
        mode: 'wait',
        operation_id: 'reload-project-1',
        timeout_ms: 120000,
      },
    },
  ],
  gdevelop_inspect_signal_usage: [
    {
      description:
        'Find all emitters, scene receivers, and onSignal handlers for a signal name.',
      arguments: {
        signal_name: 'Attack',
      },
    },
    {
      description:
        'Audit a prefab signal contract and include onSignal handler event bodies when checking how prefabs react.',
      arguments: {
        signal_name: 'CardSlot.Select',
        extension_name: 'Cards',
        include_events: true,
      },
    },
  ],
  validate_project_files: [
    {
      description:
        'Validate all current multi-file disk sources before reloading them into the editor.',
      arguments: {},
    },
  ],
  gdevelop_inspect_running_preview: [
    {
      description:
        'Inspect the running preview to verify the game runs and read live object counts and variables.',
      arguments: {},
    },
    {
      description:
        'Wait longer and include the full raw runtime dump for deep inspection.',
      arguments: {
        timeout_ms: 4000,
        include_raw_dump: true,
      },
    },
    {
      description:
        'Inspect one Bullet instance with bounded force, variable, and behavior state instead of returning the raw dump.',
      arguments: {
        objects: ['Bullet'],
        include: ['position', 'angle', 'forces', 'variables', 'behaviors'],
        instance_indexes: [0],
      },
    },
  ],
  preview_health_check: [
    {
      description:
        'Check whether the preview/debugger channel is connected before run_frames or screenshot calls.',
      arguments: {},
    },
  ],
  wait_until_preview_ready: [
    {
      description:
        'Block until the latest preview answers getStatus before runtime checks.',
      arguments: {
        timeout_ms: 12000,
      },
    },
    {
      description:
        'Wait for a specific preview id and require that it is paused.',
      arguments: {
        debugger_id: 'preview-ws-23',
        timeout_ms: 12000,
        require_paused: true,
      },
    },
  ],
  capture_preview_screenshot: [
    {
      description:
        'Save a screenshot of the running preview to a PNG file for visual verification.',
      arguments: {
        file_path: '/tmp/gdevelop-preview.png',
      },
    },
    {
      description:
        'Return the screenshot as a base64 data URL instead of writing a file.',
      arguments: {},
    },
    {
      description:
        'Capture only the game canvas and resize the PNG to the project resolution for pixel checks.',
      arguments: {
        file_path: '/tmp/gdevelop-canvas.png',
        canvas_only: true,
        target_width: 800,
        target_height: 450,
      },
    },
  ],
  simulate_preview_input: [
    {
      description:
        'Hold the Left arrow (press without release) so the player keeps moving; inspect or screenshot afterwards to verify movement.',
      arguments: {
        inputs: [{ type: 'keyPressed', key: 'Left' }],
      },
    },
    {
      description:
        'Tap Space (press then release) to fire/jump/restart, in one call.',
      arguments: {
        inputs: [
          { type: 'keyPressed', key: 'Space' },
          { type: 'keyReleased', key: 'Space' },
        ],
      },
    },
    {
      description:
        'Move the mouse to a game coordinate and click the left button.',
      arguments: {
        inputs: [
          { type: 'mouseMove', x: 360, y: 640 },
          { type: 'mouseButtonPressed', button: 'left' },
          { type: 'mouseButtonReleased', button: 'left' },
        ],
      },
    },
  ],
  control_preview: [
    {
      description:
        'Pause the game, then advance 30 frames (~0.5s at 60 FPS) deterministically for a reproducible test.',
      arguments: { action: 'step', frames: 30 },
    },
    {
      description: 'Pause the running preview.',
      arguments: { action: 'pause' },
    },
    {
      description: 'Resume normal play.',
      arguments: { action: 'play' },
    },
  ],
  set_runtime_state: [
    {
      description:
        'Force the game out of a game-over state and reposition the player to test mid-game logic.',
      arguments: {
        operations: [
          { type: 'setVariable', scope: 'scene', name: 'GameOver', value: 0 },
          { type: 'moveInstance', objectName: 'Player', x: 360, y: 900 },
        ],
      },
    },
    {
      description: 'Spawn an enemy to test collision/scoring.',
      arguments: {
        operations: [
          { type: 'spawnInstance', objectName: 'EnemyBig', x: 360, y: 100 },
        ],
      },
    },
  ],
  run_frames: [
    {
      description:
        'Hold Left for 30 frames and read back the result in one call — confirms the player actually moved left. Works even on a throttled/backgrounded preview window.',
      arguments: {
        inputs: [{ type: 'keyPressed', key: 'Left' }],
        frames: 30,
        timeout_ms: 10000,
        instance_positions_for: ['Player'],
      },
    },
    {
      description:
        'Just advance 60 frames (~1s) and inspect autonomous state (e.g. enemies spawned, score) without any input.',
      arguments: { frames: 60 },
    },
    {
      description:
        'Tap Space once (register a "just pressed" shot), step a few frames, and inspect the created bullet force and state.',
      arguments: {
        inputs: [{ type: 'keyPressed', key: 'Space' }],
        frames: 5,
        objects: ['Bullet'],
        include: ['position', 'angle', 'forces', 'variables', 'behaviors'],
        instance_indexes: [0],
      },
    },
    {
      description:
        'Click and hold on a shifted HUD/game layer long enough for IsCursorOnObject to see the press, then inspect cursor world coordinates per layer.',
      arguments: {
        inputs: [{ type: 'clickAndHold', x: 420, y: 180, button: 'left' }],
        frames: 3,
        include_cursor_world_coordinates: true,
        cursor_layers: ['', 'HUD'],
      },
    },
  ],
  verify_project_change: [
    {
      description:
        'Validate, reload, launch the first scene paused, step one frame, and require a healthy 3D renderer with no runtime or texture errors.',
      arguments: {
        frames: 1,
        assertions: [
          { type: 'runtime_error_count', operator: 'eq', value: 0 },
          {
            type: 'renderer_has_three_group',
            layer_name: '',
            operator: 'eq',
            value: true,
          },
          {
            type: 'renderer_failed_texture_count',
            layer_name: '',
            operator: 'eq',
            value: 0,
          },
        ],
      },
    },
  ],
  launch_preview: [
    {
      description:
        "Launch the project's first scene paused for a deterministic frame-0 test.",
      arguments: {
        start_paused: true,
      },
    },
    {
      description:
        'Preview a specific scene with collision shapes visible (independent of the open editor tab), paused.',
      arguments: {
        scene_name: 'main',
        start_paused: true,
        display_collision_shapes: true,
      },
    },
  ],
};

const writeToolNames: Set<string> = new Set(writeTools.map(tool => tool.name));
const alwaysAvailableWriteToolNames: Set<string> = new Set([
  'import_extension',
]);
const commandToolNames: Set<string> = new Set(
  commandTools.map(tool => tool.name)
);
const readToolNames: Set<string> = new Set(readTools.map(tool => tool.name));

export const isWriteTool = (toolName: string): boolean =>
  writeToolNames.has(toolName);

export const isCommandTool = (toolName: string): boolean =>
  commandToolNames.has(toolName);

export const isKnownMcpTool = (toolName: string): boolean =>
  readToolNames.has(toolName) ||
  writeToolNames.has(toolName) ||
  commandToolNames.has(toolName);

export const canCallMcpTool = (
  toolName: string,
  permissions: McpPermissionOptions
): {| canCall: boolean, reason?: string |} => {
  if (!isKnownMcpTool(toolName)) {
    return {
      canCall: false,
      reason: `Unknown MCP tool: ${toolName}.`,
    };
  }

  if (
    isWriteTool(toolName) &&
    !alwaysAvailableWriteToolNames.has(toolName) &&
    !permissions.allowWriteTools
  ) {
    return {
      canCall: false,
      reason: 'Write MCP tools are disabled in GDevelop preferences.',
    };
  }

  if (isCommandTool(toolName) && !permissions.allowCommandTools) {
    return {
      canCall: false,
      reason: 'Command MCP tools are disabled in GDevelop preferences.',
    };
  }

  return { canCall: true };
};

const withDefaultToolAnnotations = (tool: McpTool): McpTool => {
  const annotations: any = {
    readOnlyHint: readToolNames.has(tool.name),
    ...(tool.annotations || {}),
  };
  if (
    readToolNames.has(tool.name) &&
    annotations.destructiveHint === undefined
  ) {
    annotations.destructiveHint = false;
  }
  return { ...tool, annotations };
};

export const getMcpTools = (
  permissions: McpPermissionOptions
): Array<McpTool> =>
  [
    ...readTools,
    ...writeTools.filter(
      tool =>
        permissions.allowWriteTools ||
        alwaysAvailableWriteToolNames.has(tool.name)
    ),
    ...(permissions.allowCommandTools ? commandTools : []),
  ].map(withDefaultToolAnnotations);

export const getAllMcpToolsForIntrospection = (): Array<McpTool> =>
  [...readTools, ...writeTools, ...commandTools].map(
    withDefaultToolAnnotations
  );

export const getMcpToolUsageExamples = (
  toolName?: ?string
): { [string]: Array<Object> } => {
  if (!toolName) {
    const examples: { [string]: Array<Object> } = {};
    getAllMcpToolsForIntrospection().forEach(({ name }) => {
      if (toolUsageExamples[name]) examples[name] = toolUsageExamples[name];
    });
    return examples;
  }
  return {
    [toolName]: isKnownMcpTool(toolName)
      ? toolUsageExamples[toolName] || []
      : [],
  };
};

// A categorized overview of the core tools so callers can discover capabilities
// in ONE call instead of many tool searches. Only lists tools available under
// the given permissions; each entry has the tool name + its one-line summary.
export const getCapabilitiesSummary = (
  permissions: McpPermissionOptions
): Object => {
  const available = new Set(getMcpTools(permissions).map(tool => tool.name));
  const allByName: { [string]: McpTool } = {};
  getAllMcpToolsForIntrospection().forEach(tool => {
    allByName[tool.name] = tool;
  });
  const categories: { [string]: Array<string> } = {
    'Extension import': ['import_extension'],
    'Project opening': ['open_project'],
    'Editor queries': [
      'gdevelop_get_editor_state',
      'gdevelop_get_editor_selection',
      'gdevelop_get_project_summary',
      'gdevelop_list_scenes',
      'gdevelop_list_objects',
      'gdevelop_inspect_signal_usage',
    ],
    'Project-file validation': [
      'generate-catalogs',
      'validate_project_files',
      'reload_project',
    ],
    'Tool discovery': ['inspect_tool_schema', 'get_tool_usage_examples'],
    'Preview runtime': [
      'launch_preview',
      'wait_until_preview_ready',
      'preview_health_check',
      'gdevelop_inspect_running_preview',
      'run_frames',
      'verify_project_change',
      'capture_preview_screenshot',
      'control_preview',
      'simulate_preview_input',
      'set_runtime_state',
    ],
  };
  const result: { [string]: Array<Object> } = {};
  Object.keys(categories).forEach(category => {
    const entries = categories[category]
      .filter(name => available.has(name))
      .map(name => ({
        name,
        summary: allByName[name] ? allByName[name].description : undefined,
      }));
    if (entries.length) result[category] = entries;
  });
  return {
    note:
      'GDevelop MCP is intentionally limited to local project opening, one extension import/conversion tool, editor queries, synchronization, validation, and preview debugging. There are no Constants MCP tools: the AI model must read and modify constants.toml directly on disk. After import_extension generates canonical sources, author the game through project files and the generated .gdevelop/settings-catalog.json (including embedded-layout authoring data) and .gdevelop/instructions-catalog.json. Before authoring JavaScript events, also read .gdevelop/runtime-api.d.ts and .gdevelop/project-api.d.ts.',
    permissions: {
      writeToolsEnabled: !!permissions.allowWriteTools,
      commandToolsEnabled: !!permissions.allowCommandTools,
    },
    categories: result,
  };
};

export const getMcpResources = (): Array<McpResource> => [
  {
    uri: 'gdevelop://editor/state',
    name: 'Editor state',
    description: 'Current GDevelop editor and MCP server state.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://project/summary',
    name: 'Project summary',
    description: 'Compact summary of the current GDevelop project.',
    mimeType: 'application/json',
  },
];

export const getMcpPrompts = (): Array<McpPrompt> => [
  {
    name: 'inspect-current-game',
    description:
      'Inspect the current game by reading editor state, project summary, scenes, objects, and obvious risks before proposing changes.',
  },
  {
    name: 'debug-preview',
    description:
      'Launch and inspect a debug preview for a game authored through project files.',
    arguments: [
      {
        name: 'sceneName',
        description: 'Optional scene/layout to preview.',
      },
    ],
  },
];
