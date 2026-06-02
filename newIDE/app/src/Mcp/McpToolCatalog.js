// @flow

export type McpPermissionOptions = {|
  allowWriteTools: boolean,
  allowCommandTools: boolean,
|};

export type McpTool = {|
  name: string,
  description: string,
  inputSchema: Object,
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

const objectInSceneSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout.',
    },
    object_name: {
      type: 'string',
      description: 'Name of the object to inspect or modify.',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const addSceneEventsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    events_json: {
      type: 'string',
      description:
        'Serialized GDevelop events JSON array to insert directly. Prefer this for MCP clients that already generated the events, as it does not call the GDevelop event generation service.',
    },
    event_changes: {
      type: 'array',
      description:
        'Advanced direct event operations. Each change can include operation_name, operation_target_event, generated_events, extension_names, missing_resources, undeclared_variables, undeclared_object_variables, and missing_object_behaviors.',
      items: {
        type: 'object',
        additionalProperties: true,
      },
    },
    generated_event_id: {
      type: 'string',
      description:
        'Optional stable id stamped on directly inserted or changed events.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
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
  },
  required: ['extension_name', 'function_name'],
  additionalProperties: true,
};

const extensionBehaviorSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    behavior_name: {
      type: 'string',
      description: 'Internal name of the events-based behavior.',
    },
  },
  required: ['extension_name', 'behavior_name'],
  additionalProperties: true,
};

const extensionObjectSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    object_name: {
      type: 'string',
      description: 'Internal name of the events-based object.',
    },
  },
  required: ['extension_name', 'object_name'],
  additionalProperties: true,
};

const extensionPropertySchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    target_kind: {
      type: 'string',
      description: 'Property owner kind: behavior or object.',
    },
    target_name: {
      type: 'string',
      description: 'Internal name of the target events-based behavior/object.',
    },
    property_name: {
      type: 'string',
      description: 'Internal property name.',
    },
    is_shared: {
      type: 'boolean',
      description:
        'For behavior properties only, true targets shared properties instead of instance properties.',
    },
  },
  required: ['extension_name', 'target_kind', 'target_name', 'property_name'],
  additionalProperties: true,
};

const readTools: Array<McpTool> = [
  {
    name: 'gdevelop_get_editor_state',
    description:
      'Return the current GDevelop editor state, including project availability, scene names, MCP permission state, and basic active project metadata.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_get_editor_selection',
    description:
      'Return the current editor UI selection state, including selected objects, scene instances, layers, and selected events/instructions when supported by the active editor.',
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
    name: 'gdevelop_read_project_json',
    description:
      'Return the full serialized GDevelop project JSON. Use a maxLength to avoid very large responses.',
    inputSchema: {
      type: 'object',
      properties: {
        maxLength: {
          type: 'number',
          description:
            'Optional maximum number of characters to return before truncating.',
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
    name: 'gdevelop_list_extensions',
    description:
      'List project-specific events-functions extensions with counts and metadata.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_inspect_extension',
    description:
      'Inspect a project-specific extension, including free functions, events-based behaviors, events-based objects, properties, parameters, events, and serialized JSON.',
    inputSchema: extensionNameSchema,
  },
  {
    name: 'gdevelop_inspect_extension_function',
    description:
      'Inspect a free, behavior, or object events function inside a project-specific extension.',
    inputSchema: extensionFunctionSchema,
  },
  {
    name: 'gdevelop_inspect_extension_behavior',
    description:
      'Inspect an events-based behavior inside a project-specific extension.',
    inputSchema: extensionBehaviorSchema,
  },
  {
    name: 'gdevelop_inspect_extension_object',
    description:
      'Inspect an events-based object inside a project-specific extension.',
    inputSchema: extensionObjectSchema,
  },
  {
    name: 'gdevelop_inspect_extension_property',
    description:
      'Inspect an events-based behavior/object property inside a project-specific extension.',
    inputSchema: extensionPropertySchema,
  },
  {
    name: 'gdevelop_list_commands',
    description:
      'List GDevelop command palette command names that can be launched with gdevelop_run_command when command tools are enabled.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_get_events_json_examples',
    description:
      'Return official-doc-informed, serializer-compatible GDevelop event JSON examples and add_scene_events payload shapes.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: {
          type: 'string',
          description:
            'Optional scene name. When include_existing_scene_events is true, examples can include current serialized events from this scene.',
        },
        include_existing_scene_events: {
          type: 'boolean',
          description:
            'When true, include current serialized scene events as a project-specific example if the scene has events.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_get_event_operation_reference',
    description:
      'Return the supported add_scene_events event_changes operation names, target path format, and required fields.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'gdevelop_validate_events_json',
    description:
      'Validate serialized GDevelop events JSON without modifying the project, render it as event-sheet text, and report instruction/parameter issues.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: {
          type: 'string',
          description:
            'Optional scene name used as context for future validation; the current validator does not modify it.',
        },
        events_json: {
          type: 'string',
          description:
            'JSON string containing an array of serialized GDevelop events.',
        },
      },
      required: ['events_json'],
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_search_instruction_metadata',
    description:
      'Search GDevelop action, condition, and expression metadata by internal type, displayed name, description, group, object, or behavior. Use before generating event JSON parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search text, for example SceneJustBegins, variable, collision, animation, sound, object type, or behavior type.',
        },
        kind: {
          type: 'string',
          description:
            'Optional kind: action, condition, expression, or all. Defaults to all.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return. Defaults to 20.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_get_instruction_metadata',
    description:
      'Return exact GDevelop action, condition, or expression metadata, including parameter order/types/defaults and event-scope relevance.',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description:
            'Exact internal action, condition, or expression type, for example SetNumberVariable or SceneJustBegins.',
        },
        kind: {
          type: 'string',
          description: 'Required kind: action, condition, or expression.',
        },
      },
      required: ['type', 'kind'],
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_editor_call',
    description:
      'Advanced escape hatch: call an exposed GDevelop EditorFunction by name. The target function still follows read/write MCP permission checks.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'EditorFunction name to call.',
        },
        arguments: {
          type: 'object',
          description: 'Arguments object for the EditorFunction.',
        },
      },
      required: ['name', 'arguments'],
      additionalProperties: false,
    },
  },
  {
    name: 'read_scene_events',
    description: 'Read the event sheet of a scene as text.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'describe_instances',
    description:
      'List object instances in a scene. Use filter_by_object_name to focus on one or more object names.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: sceneNameSchema.properties.scene_name,
        filter_by_object_name: {
          type: 'string',
          description: 'Optional comma-separated object names.',
        },
      },
      required: ['scene_name'],
      additionalProperties: true,
    },
  },
  {
    name: 'inspect_object_properties',
    description:
      'Inspect an object properties, behaviors, animation names, and size hints.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'inspect_behavior_properties',
    description: 'Inspect properties of a behavior on an object.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: sceneNameSchema.properties.scene_name,
        object_name: objectInSceneSchema.properties.object_name,
        behavior_name: {
          type: 'string',
          description: 'Behavior name on the object.',
        },
      },
      required: ['scene_name', 'object_name', 'behavior_name'],
      additionalProperties: true,
    },
  },
  {
    name: 'inspect_scene_properties_layers_effects',
    description: 'Inspect scene properties, layers, and effects.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'read_game_project_json',
    description:
      'Read the full GDevelop project JSON through the existing editor function.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'search_docs',
    description: 'Search GDevelop documentation.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'read_full_docs',
    description: 'Read full GDevelop documentation entries.',
    inputSchema: emptyObjectSchema,
  },
];

const writeTools: Array<McpTool> = [
  {
    name: 'initialize_project',
    description:
      'Create a new GDevelop project, optionally from a template slug.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'create_scene',
    description: 'Create a new scene/layout in the current project.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'delete_scene',
    description: 'Delete a scene/layout from the current project.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'create_or_replace_object',
    description:
      'Create, duplicate, replace, or move an object definition in a scene or globally.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'change_object_property',
    description: 'Change one or more object properties.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'add_behavior',
    description: 'Add a behavior to an object.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'remove_behavior',
    description: 'Remove a behavior from an object.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'change_behavior_property',
    description: 'Change one or more behavior properties on an object.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'put_2d_instances',
    description:
      'Place, move, update, or erase 2D object instances. Call describe_instances first to get existing instance ids.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'put_3d_instances',
    description:
      'Place, move, update, or erase 3D object instances. Call describe_instances first to get existing instance ids.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'add_scene_events',
    description:
      'Add events to a scene. For MCP clients, prefer passing events_json or event_changes to write directly without calling the GDevelop event generation service.',
    inputSchema: addSceneEventsSchema,
  },
  {
    name: 'change_scene_properties_layers_effects_groups',
    description: 'Change scene properties, layers, effects, or object groups.',
    inputSchema: sceneNameSchema,
  },
  {
    name: 'add_or_edit_variable',
    description: 'Add or edit global, scene, object, or behavior variables.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'create_or_update_plan',
    description:
      'Create or update an AI orchestration plan stored in the conversation output.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'generate_events',
    description: 'Alias for add_scene_events.',
    inputSchema: addSceneEventsSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension',
    description:
      'Create or update a project-specific extension. Supports metadata fields, tags, rename, and serialized_extension for advanced edits.',
    inputSchema: extensionNameSchema,
  },
  {
    name: 'gdevelop_delete_extension',
    description: 'Delete a project-specific extension by internal name.',
    inputSchema: extensionNameSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension_function',
    description:
      'Create or update a free, behavior, or object events function inside an extension, including type, metadata, parameters, and events_json.',
    inputSchema: extensionFunctionSchema,
  },
  {
    name: 'gdevelop_delete_extension_function',
    description:
      'Delete a free, behavior, or object events function inside an extension.',
    inputSchema: extensionFunctionSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension_behavior',
    description:
      'Create or update an events-based behavior inside an extension, including metadata and target object type.',
    inputSchema: extensionBehaviorSchema,
  },
  {
    name: 'gdevelop_delete_extension_behavior',
    description: 'Delete an events-based behavior inside an extension.',
    inputSchema: extensionBehaviorSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension_object',
    description:
      'Create or update an events-based object inside an extension, including metadata, 2D/3D flags, default name, and inner area bounds.',
    inputSchema: extensionObjectSchema,
  },
  {
    name: 'gdevelop_delete_extension_object',
    description: 'Delete an events-based object inside an extension.',
    inputSchema: extensionObjectSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension_property',
    description:
      'Create or update an events-based behavior/object property inside an extension, including type, default value, label, description, choices, and flags.',
    inputSchema: extensionPropertySchema,
  },
  {
    name: 'gdevelop_delete_extension_property',
    description:
      'Delete an events-based behavior/object property inside an extension.',
    inputSchema: extensionPropertySchema,
  },
];

const commandTools: Array<McpTool> = [
  {
    name: 'gdevelop_run_command',
    description:
      'Run a GDevelop command palette command by name. This can open dialogs, launch previews, save projects, or navigate the editor.',
    inputSchema: {
      type: 'object',
      properties: {
        commandName: {
          type: 'string',
          description: 'GDevelop command name, for example SAVE_PROJECT.',
        },
      },
      required: ['commandName'],
      additionalProperties: false,
    },
  },
];

const writeToolNames: Set<string> = new Set(writeTools.map(tool => tool.name));
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

  if (isWriteTool(toolName) && !permissions.allowWriteTools) {
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

export const getMcpTools = (
  permissions: McpPermissionOptions
): Array<McpTool> => [
  ...readTools,
  ...(permissions.allowWriteTools ? writeTools : []),
  ...(permissions.allowCommandTools ? commandTools : []),
];

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
  {
    uri: 'gdevelop://project/json',
    name: 'Project JSON',
    description: 'Full serialized GDevelop project JSON.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://project/extensions-summary',
    name: 'Project extensions summary',
    description: 'Summary of project-specific extensions.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/events.txt',
    name: 'Scene events',
    description: 'Events for a scene rendered as text.',
    mimeType: 'text/plain',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/instances.json',
    name: 'Scene instances',
    description: 'Instances for a scene serialized as JSON.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/objects.json',
    name: 'Scene objects',
    description: 'Objects available in a scene serialized as JSON.',
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
    name: 'implement-game-feature',
    description:
      'Implement a gameplay feature by reading relevant project context, making small tool calls, and verifying the result.',
    arguments: [
      {
        name: 'feature',
        description: 'Feature to implement.',
        required: true,
      },
    ],
  },
  {
    name: 'fix-scene-events',
    description:
      'Debug and repair a scene event sheet by reading events first, applying targeted changes, and reading back the result.',
    arguments: [
      {
        name: 'sceneName',
        description: 'Scene/layout to inspect and fix.',
        required: true,
      },
    ],
  },
  {
    name: 'layout-scene',
    description:
      'Improve scene layout by inspecting objects and instances, then using instance placement tools.',
    arguments: [
      {
        name: 'sceneName',
        description: 'Scene/layout to arrange.',
        required: true,
      },
    ],
  },
  {
    name: 'refactor-gameplay',
    description:
      'Refactor gameplay safely with readback between write operations and clear verification steps.',
  },
];
