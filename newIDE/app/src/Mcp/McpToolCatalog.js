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

const addBehaviorSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout that owns the object.',
    },
    object_name: {
      type: 'string',
      description:
        'Name of the object (scene object or global object) to add the behavior to.',
    },
    behavior_type: {
      type: 'string',
      description:
        'Required. The internal behavior type, e.g. "PlatformBehavior::PlatformerObjectBehavior", "TopDownMovementBehavior::TopDownMovementBehavior", or "DestroyOutsideBehavior::DestroyOutside". Use list_available_behaviors to discover exact types compatible with an object.',
    },
    behavior_name: {
      type: 'string',
      description:
        "Optional behavior instance name. Defaults to the behavior's default name (recommended). This is the name you reference in instruction behavior parameters.",
    },
  },
  required: ['scene_name', 'object_name', 'behavior_type'],
  additionalProperties: true,
};

const removeBehaviorSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout that owns the object.',
    },
    object_name: {
      type: 'string',
      description: 'Name of the object to remove the behavior from.',
    },
    behavior_name: {
      type: 'string',
      description:
        "Required. The behavior instance NAME on the object (not the behavior type). See inspect_object_properties for the object's behavior names.",
    },
  },
  required: ['scene_name', 'object_name', 'behavior_name'],
  additionalProperties: true,
};

const changeBehaviorPropertySchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout that owns the object.',
    },
    object_name: {
      type: 'string',
      description: 'Name of the object whose behavior is modified.',
    },
    behavior_name: {
      type: 'string',
      description:
        'Required. The behavior instance NAME on the object (not the type). See inspect_object_properties or inspect_behavior_properties.',
    },
    changed_properties: {
      type: 'array',
      description:
        'List of property changes. Use inspect_behavior_properties to discover property_name values.',
      items: {
        type: 'object',
        properties: {
          property_name: {
            type: 'string',
            description: 'The behavior property name to change.',
          },
          new_value: {
            type: 'string',
            description:
              'The new value as a string (numbers and booleans are coerced).',
          },
        },
        required: ['property_name', 'new_value'],
        additionalProperties: true,
      },
    },
  },
  required: ['scene_name', 'object_name', 'behavior_name'],
  additionalProperties: true,
};

const changeScenePropertiesLayersEffectsGroupsSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Name of the GDevelop scene/layout to modify.',
    },
    changed_properties: {
      type: 'array',
      description:
        'Scene/game property changes. Each item is { property_name, new_value }. Known property_name values: backgroundColor (RGB like "32;32;64"), gameResolutionWidth, gameResolutionHeight, gameOrientation, gameScaleMode, gameName, stopSoundsOnStartup.',
      items: {
        type: 'object',
        properties: {
          property_name: { type: 'string' },
          new_value: { type: 'string' },
        },
        required: ['property_name', 'new_value'],
        additionalProperties: true,
      },
    },
    changed_layers: {
      type: 'array',
      description:
        'Layer changes. Create a layer by naming a layer_name that does not exist yet (e.g. a "HUD" layer above the base layer). To rename set new_layer_name; to reorder set new_layer_position; to delete set delete_this_layer:true (optionally move_instances_to_layer to keep instances).',
      items: {
        type: 'object',
        properties: {
          layer_name: {
            type: 'string',
            description:
              'Target layer name. The empty string "" is the base layer. A new name creates a new layer.',
          },
          new_layer_name: { type: 'string' },
          new_layer_position: { type: 'number' },
          delete_this_layer: { type: 'boolean' },
          move_instances_to_layer: { type: 'string' },
        },
        required: ['layer_name'],
        additionalProperties: true,
      },
    },
    changed_layer_effects: {
      type: 'array',
      description:
        'Layer effect changes. Each item targets { layer_name, effect_name }; set effect_type to create, new_effect_name/new_effect_position to edit, delete_this_effect:true to remove.',
      items: {
        type: 'object',
        properties: {
          layer_name: { type: 'string' },
          effect_name: { type: 'string' },
          effect_type: { type: 'string' },
          new_effect_name: { type: 'string' },
          new_effect_position: { type: 'number' },
          delete_this_effect: { type: 'boolean' },
        },
        required: ['layer_name', 'effect_name'],
        additionalProperties: true,
      },
    },
    changed_groups: {
      type: 'array',
      description:
        'Object group changes. Each item targets { group_name }; set objects (array of object names) to define membership, new_group_name to rename, delete_this_group:true to remove.',
      items: {
        type: 'object',
        properties: {
          group_name: { type: 'string' },
          new_group_name: { type: 'string' },
          delete_this_group: { type: 'boolean' },
          objects: { type: 'array', items: { type: 'string' } },
        },
        required: ['group_name'],
        additionalProperties: true,
      },
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const addOrUpdateResourceSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Resource name as stored in the GDevelop project.',
    },
    file: {
      type: 'string',
      description:
        'Resource file path or URL. For local PNG imports, pass the relative or absolute PNG path.',
    },
    kind: {
      type: 'string',
      description:
        'Resource kind, for example image, audio, font, video, json, bitmapFont, model3D, atlas, spine, or javascript.',
    },
    metadata: {
      type: 'object',
      description:
        'Optional resource-specific metadata. For image resources, supports { smooth: boolean }.',
      additionalProperties: true,
    },
    replace_kind: {
      type: 'boolean',
      description:
        'When true, recreate an existing resource if it exists with a different kind.',
    },
  },
  required: ['name', 'file', 'kind'],
  additionalProperties: true,
};

const generatePlaceholderAssetSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Resource name to register (also the default file stem).',
    },
    asset_type: {
      type: 'string',
      description: '"image" (PNG, default) or "sound" (WAV).',
    },
    file: {
      type: 'string',
      description:
        'Optional output path (project-relative recommended). Defaults to assets/<name>.png or .wav.',
    },
    width: { type: 'number', description: 'Image width (default 64).' },
    height: { type: 'number', description: 'Image height (default 64).' },
    color: {
      type: 'string',
      description:
        'Image fill color as "r;g;b" or "r;g;b;a" (default opaque magenta 255;0;255).',
    },
    duration_ms: {
      type: 'number',
      description: 'Sound duration in ms (default 150).',
    },
    frequency: {
      type: 'number',
      description: 'Sound tone frequency in Hz (default 440).',
    },
    sound_kind: {
      type: 'string',
      description: '"sine" (tone, default) or "noise" (burst).',
    },
  },
  required: ['name'],
  additionalProperties: true,
};

const spriteAnimationFrameSchema = {
  type: 'object',
  properties: {
    image: {
      type: 'string',
      description:
        'Image resource name for the frame. resourceName and imageName aliases are also accepted.',
    },
    origin: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
      },
      additionalProperties: false,
    },
    center: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
      },
      additionalProperties: false,
    },
    fullImageCollisionMask: {
      type: 'boolean',
      description: 'Use the whole image as collision mask.',
    },
    collisionMask: {
      type: 'array',
      description:
        'Array of polygons, each polygon being an array of { x, y } vertices.',
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' },
          },
          required: ['x', 'y'],
          additionalProperties: false,
        },
      },
    },
    points: {
      type: 'array',
      description: 'Optional custom points: [{ name, x, y }].',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
        },
        required: ['name', 'x', 'y'],
        additionalProperties: false,
      },
    },
  },
  required: ['image'],
  additionalProperties: true,
};

const setSpriteAnimationsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: objectInSceneSchema.properties.object_name,
    animations: {
      type: 'array',
      description:
        'Complete Sprite animation list. Existing Sprite animations are replaced.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          useMultipleDirections: { type: 'boolean' },
          loop: {
            type: 'boolean',
            description:
              'Whether the animation loops. Applied to every direction. Set false for one-shot animations (e.g. an explosion) so HasAnimationEnded can become true.',
          },
          timeBetweenFrames: {
            type: 'number',
            description:
              'Seconds between frames (frame duration). Applied to every direction. e.g. 0.08 for a fast 12.5 FPS animation. Set this explicitly for multi-frame animations; the default may play them too slowly.',
          },
          directions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                loop: {
                  type: 'boolean',
                  description:
                    'Per-direction loop override (falls back to the animation-level loop).',
                },
                timeBetweenFrames: {
                  type: 'number',
                  description:
                    'Per-direction frame duration in seconds (falls back to the animation-level value).',
                },
                frames: {
                  type: 'array',
                  items: spriteAnimationFrameSchema,
                },
              },
              required: ['frames'],
              additionalProperties: true,
            },
          },
          frames: {
            type: 'array',
            description:
              'Shortcut for a single direction: [{ image, origin, center, collisionMask }].',
            items: spriteAnimationFrameSchema,
          },
        },
        additionalProperties: true,
      },
    },
  },
  required: ['scene_name', 'object_name', 'animations'],
  additionalProperties: true,
};

const replaceObjectDefinitionSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: objectInSceneSchema.properties.object_name,
    object_type: {
      type: 'string',
      description:
        'Optional object type override. If omitted, serialized_object.type is used.',
    },
    serialized_object: {
      type: 'object',
      description:
        'Complete serialized GDevelop object definition. Existing scene object is overwritten and type changes are allowed.',
      additionalProperties: true,
    },
  },
  required: ['scene_name', 'object_name', 'serialized_object'],
  additionalProperties: true,
};

const setObjectPropertiesSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: objectInSceneSchema.properties.object_name,
    properties: {
      type: 'object',
      description:
        'Map of property names from inspect_object_properties to new values, for example { text: "Score: 0", characterSize: 36, color: "255;255;255" }.',
      additionalProperties: true,
    },
  },
  required: ['scene_name', 'object_name', 'properties'],
  additionalProperties: true,
};

const setTextObjectPropertiesSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: objectInSceneSchema.properties.object_name,
    text: {
      type: 'string',
      description: 'Initial text displayed by the Text object.',
    },
    character_size: {
      type: 'number',
      description: 'Text character size in pixels.',
    },
    color: {
      type: 'string',
      description: 'Text color as an RGB string, for example 255;255;255.',
    },
    bold: { type: 'boolean' },
    italic: { type: 'boolean' },
    font_name: {
      type: 'string',
      description: 'Optional font resource name.',
    },
    text_alignment: {
      type: 'string',
      description: 'Horizontal alignment: left, center, or right.',
    },
    vertical_text_alignment: {
      type: 'string',
      description: 'Vertical alignment: top, center, or bottom.',
    },
    line_height: {
      type: 'number',
      description: 'Multiline line height.',
    },
    outline: {
      type: 'object',
      description: 'Optional outline settings: { enabled, color, thickness }.',
      additionalProperties: true,
    },
    shadow: {
      type: 'object',
      description:
        'Optional shadow settings: { enabled, color, distance, angle, opacity, blur_radius }.',
      additionalProperties: true,
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const projectPropertiesSchema = {
  type: 'object',
  properties: {
    project_name: {
      type: 'string',
      description: 'Project/game name.',
    },
    first_layout: {
      type: 'string',
      description: 'Startup scene/layout name. The scene must exist.',
    },
    scene_name: {
      type: 'string',
      description:
        'Alias for first_layout when using set_first_layout or when only setting the startup scene.',
    },
    game_resolution_width: {
      type: 'number',
      description: 'Game resolution width in pixels.',
    },
    game_resolution_height: {
      type: 'number',
      description: 'Game resolution height in pixels.',
    },
    adapt_game_resolution_at_runtime: {
      type: 'boolean',
      description: 'Whether the game resolution adapts at runtime.',
    },
    min_fps: {
      type: 'number',
      description: 'Minimum FPS setting.',
    },
    max_fps: {
      type: 'number',
      description: 'Maximum FPS setting.',
    },
    orientation: {
      type: 'string',
      description: 'Game orientation, for example landscape or portrait.',
    },
    scale_mode: {
      type: 'string',
      description: 'Game scale mode, for example linear or nearest.',
    },
    include_serialized_project: {
      type: 'boolean',
      description:
        'When true, include the full serialized project after applying changes.',
    },
  },
  additionalProperties: true,
};

const firstLayoutSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Scene/layout to use as the project startup scene.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const put2dInstancesSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    operation: {
      type: 'string',
      description:
        'Structured operation for instances array: create, update, delete/remove, or upsert. Existing legacy brush_kind payloads are still accepted.',
    },
    instances: {
      type: 'array',
      description:
        'Structured instances to create/update/delete. Use describe_instances first to read ids for updates/deletes.',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description:
              'Short id from describe_instances. Required for update/delete.',
          },
          operation: {
            type: 'string',
            description:
              'Optional per-instance operation overriding the top-level operation.',
          },
          object_name: { type: 'string' },
          objectName: { type: 'string' },
          x: { type: 'number' },
          y: { type: 'number' },
          z: { type: 'number' },
          angle: { type: 'number' },
          rotation: { type: 'number' },
          rotationX: { type: 'number' },
          rotationY: { type: 'number' },
          layer: { type: 'string' },
          layer_name: { type: 'string' },
          zOrder: { type: 'number' },
          z_order: { type: 'number' },
          opacity: { type: 'number' },
          width: { type: 'number' },
          height: { type: 'number' },
          depth: { type: 'number' },
          customSize: {
            type: 'object',
            properties: {
              width: { type: 'number' },
              height: { type: 'number' },
              depth: { type: 'number' },
            },
            additionalProperties: false,
          },
          custom_size: {
            type: 'object',
            properties: {
              width: { type: 'number' },
              height: { type: 'number' },
              depth: { type: 'number' },
            },
            additionalProperties: false,
          },
          locked: { type: 'boolean' },
          sealed: { type: 'boolean' },
        },
        additionalProperties: true,
      },
    },
    object_name: {
      type: 'string',
      description: 'Legacy brush payload object name.',
    },
    layer_name: {
      type: 'string',
      description:
        'Legacy brush payload layer name; empty string is base layer.',
    },
    brush_kind: {
      type: 'string',
      description:
        'Legacy brush payload: point, line, grid, random_in_circle, erase, or none.',
    },
    brush_position: {
      type: 'string',
      description: 'Legacy brush payload "x,y".',
    },
    existing_instance_ids: {
      type: 'string',
      description: 'Legacy comma-separated ids from describe_instances.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const createSpriteObjectFromResourceSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: objectInSceneSchema.properties.object_name,
    resource_name: {
      type: 'string',
      description: 'Existing image resource name to use as the Sprite frame.',
    },
    image_resource: {
      type: 'string',
      description: 'Alias for resource_name.',
    },
    animation_name: {
      type: 'string',
      description: 'Optional animation name. Defaults to Default.',
    },
    origin: spriteAnimationFrameSchema.properties.origin,
    center: spriteAnimationFrameSchema.properties.center,
    fullImageCollisionMask:
      spriteAnimationFrameSchema.properties.fullImageCollisionMask,
    collisionMask: spriteAnimationFrameSchema.properties.collisionMask,
    points: spriteAnimationFrameSchema.properties.points,
    create_instance: {
      type: 'boolean',
      description:
        'When true, also create one initial instance. If omitted, top-level instance fields or instance create one.',
    },
    instance: put2dInstancesSchema.properties.instances.items,
    x: { type: 'number' },
    y: { type: 'number' },
    zOrder: { type: 'number' },
    layer: { type: 'string' },
    width: { type: 'number' },
    height: { type: 'number' },
    customSize:
      put2dInstancesSchema.properties.instances.items.properties.customSize,
  },
  required: ['scene_name', 'object_name', 'resource_name'],
  additionalProperties: true,
};

const createTextObjectSchema = {
  type: 'object',
  properties: {
    ...setTextObjectPropertiesSchema.properties,
    create_instance: {
      type: 'boolean',
      description:
        'When true, also create one initial instance. If omitted, top-level instance fields or instance create one.',
    },
    instance: put2dInstancesSchema.properties.instances.items,
    x: { type: 'number' },
    y: { type: 'number' },
    zOrder: { type: 'number' },
    layer: { type: 'string' },
    width: { type: 'number' },
    height: { type: 'number' },
    customSize:
      put2dInstancesSchema.properties.instances.items.properties.customSize,
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const scenePatchSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    patch: {
      type: 'array',
      description:
        'RFC-6902-style JSON patch subset for one serialized scene. Supports add, replace, remove with JSON pointer paths.',
      items: {
        type: 'object',
        properties: {
          op: {
            type: 'string',
            description: 'Patch operation: add, replace, or remove.',
          },
          path: {
            type: 'string',
            description: 'JSON pointer path, for example /objects/0/name.',
          },
          value: {
            description: 'Value for add/replace.',
          },
        },
        required: ['op', 'path'],
        additionalProperties: true,
      },
    },
    patch_file: {
      type: 'string',
      description:
        'Optional local file containing the JSON patch array. Use instead of patch for large patches.',
    },
    dry_run: {
      type: 'boolean',
      description:
        'When true, validate and return the patched serialized scene without applying it.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const inspectProjectResourcesSchema = {
  type: 'object',
  properties: {
    compact: {
      type: 'boolean',
      description:
        'When true, return counts and problem lists only. Omits full resourcesByName and generic stringReferences.',
    },
    summary_only: {
      type: 'boolean',
      description: 'Alias for compact.',
    },
    include_serialized_project: {
      type: 'boolean',
      description:
        'When true, include the full serialized project alongside resource audit results.',
    },
  },
  additionalProperties: false,
};

const inspectProjectCleanupSchema = {
  type: 'object',
  properties: {
    include_scene_summaries: {
      type: 'boolean',
      description:
        'Default true. Set false to omit the per-scene summary list from the response.',
    },
  },
  additionalProperties: false,
};

const listAvailableBehaviorsSchema = {
  type: 'object',
  properties: {
    object_name: {
      type: 'string',
      description:
        'Optional object name. When set, only behaviors compatible with this object type are returned. Searches the given scene first (if scene_name is set), then global objects, then all scenes.',
    },
    scene_name: {
      type: 'string',
      description:
        'Optional scene name to disambiguate object_name when the same name exists in multiple scopes.',
    },
    search: {
      type: 'string',
      description:
        'Optional space-separated search terms matched (all tokens) against behavior type, name, description, category, and tags.',
    },
    include_hidden: {
      type: 'boolean',
      description:
        'Default false. When true, also include default capability behaviors that cannot be added manually.',
    },
  },
  additionalProperties: false,
};

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
        'How long to wait (200-10000 ms, default 2500) for the runtime dump reply before returning status/logs only.',
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
        'Optional object names to include live instance positions (x/y/angle/zOrder, up to 50 each) in the compact summary — e.g. ["Player"] to confirm where the player is, without pulling the raw dump.',
    },
    include_instance_positions: {
      type: 'boolean',
      description:
        'Default false. When true, include instance positions for ALL objects (can be large).',
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
  },
  additionalProperties: false,
};

const simulatePreviewInputSchema = {
  type: 'object',
  properties: {
    inputs: {
      type: 'array',
      description:
        'Ordered list of input events to inject into the running game. Press and release are separate events; hold a key by sending keyPressed without a matching keyReleased (the game keeps it pressed across frames until released).',
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
        'pause (freeze the game loop), play (resume), step (advance exactly N frames while paused for deterministic testing), or close (stop the targeted preview; pass close_all:true to close every preview). Defaults to step.',
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
        'For action=close: close ALL running previews instead of just the targeted one. Useful before relaunching to avoid stale windows.',
    },
    debugger_id: {
      type: 'string',
      description:
        'Optional preview/debugger id. Defaults to the latest running preview.',
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
          x: { type: 'number' },
          y: { type: 'number' },
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

const readSerializedSceneSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: {
      type: 'string',
      description:
        "Optional. Return only this object's serialized definition (and its instances) instead of the whole scene. Useful to inspect e.g. one object's animation/behavior config without dumping the entire scene.",
    },
    object_names: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Optional. Like object_name but for several objects at once. Both scene and matching global objects are returned; missing names are listed in notFound.',
    },
    include_instances: {
      type: 'boolean',
      description:
        'Default true when filtering by object name(s): also return the initial instances of those objects. Set false to omit instances.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const bulkEditSceneAssetsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    resources: {
      type: 'array',
      description:
        'Resource payloads accepted by add_or_update_resource: [{ name, file, kind, metadata }].',
      items: addOrUpdateResourceSchema,
    },
    objects: {
      type: 'array',
      description:
        'Object replacement payloads accepted by replace_object_definition. scene_name can be omitted and defaults to this tool scene_name.',
      items: replaceObjectDefinitionSchema,
    },
    sprite_animations: {
      type: 'array',
      description:
        'Sprite animation payloads accepted by set_sprite_animations. scene_name can be omitted and defaults to this tool scene_name.',
      items: setSpriteAnimationsSchema,
    },
    behaviors: {
      type: 'array',
      description:
        "Behaviors to add to objects in this scene (applied after objects exist): [{ object_name, behavior_type, behavior_name? }]. behavior_name defaults to the behavior's default name.",
      items: {
        type: 'object',
        properties: {
          object_name: { type: 'string' },
          behavior_type: { type: 'string' },
          behavior_name: { type: 'string' },
        },
        required: ['object_name', 'behavior_type'],
        additionalProperties: true,
      },
    },
    variables: {
      type: 'array',
      description:
        'Scene/global variables to declare in one call: [{ scope: "scene"|"global", name, value, type? }]. Declare these before writing events that reference them. For object variables use add_or_edit_variable.',
      items: {
        type: 'object',
        properties: {
          scope: { type: 'string' },
          name: { type: 'string' },
          value: {},
          type: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: true,
      },
    },
    instances: {
      type: 'array',
      description:
        '2D instance payloads accepted by put_2d_instances. The default operation is create.',
      items: put2dInstancesSchema.properties.instances.items,
    },
    instances_operation: {
      type: 'string',
      description:
        'Optional default operation for instances: create, update, delete/remove, or upsert.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const eventTargetSchema = {
  type: 'object',
  properties: {
    event_path: {
      type: 'string',
      description: 'Event path such as event-0 or event-0.1.',
    },
    ai_generated_event_id: {
      type: 'string',
      description: 'Stable aiGeneratedEventId on the target event.',
    },
    group_name: {
      type: 'string',
      description: 'Exact group event name.',
    },
    action_type: {
      type: 'string',
      description: 'Exact action type to match, for example PlaySound.',
    },
    condition_type: {
      type: 'string',
      description:
        'Exact condition type to match, for example SceneJustBegins.',
    },
    parameter_contains: {
      type: 'string',
      description:
        'Text that must appear in serialized instruction parameters.',
    },
    text_contains: {
      type: 'string',
      description: 'Text that must appear anywhere in the serialized event.',
    },
  },
  additionalProperties: true,
};

const findSceneEventsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    event_path: eventTargetSchema.properties.event_path,
    ai_generated_event_id: eventTargetSchema.properties.ai_generated_event_id,
    event_type: {
      type: 'string',
      description:
        'Exact event type, for example BuiltinCommonInstructions::Group.',
    },
    group_name: eventTargetSchema.properties.group_name,
    action_type: eventTargetSchema.properties.action_type,
    condition_type: eventTargetSchema.properties.condition_type,
    parameter_contains: eventTargetSchema.properties.parameter_contains,
    text_contains: eventTargetSchema.properties.text_contains,
    limit: {
      type: 'number',
      description: 'Maximum matches to return. Defaults to 50.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const createGroupSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    group_name: {
      type: 'string',
      description: 'Name of the new event group.',
    },
    parent_event: {
      type: 'object',
      description:
        'Optional parent event target. If omitted, the group is inserted at root level.',
      additionalProperties: true,
    },
    insert_index: {
      type: 'number',
      description: 'Insertion index in the parent event list.',
    },
    folded: {
      type: 'boolean',
      description: 'Whether the new group is folded in the event sheet.',
    },
    color: {
      type: 'object',
      properties: {
        r: { type: 'number' },
        g: { type: 'number' },
        b: { type: 'number' },
      },
      additionalProperties: false,
    },
    ai_generated_event_id: {
      type: 'string',
      description: 'Optional stable id for the group event.',
    },
  },
  required: ['scene_name', 'group_name'],
  additionalProperties: true,
};

const wrapEventsInGroupSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    group_name: createGroupSchema.properties.group_name,
    target_events: {
      type: 'array',
      description:
        'Sibling events to wrap. Each target can use event_path, ai_generated_event_id, group_name, action_type, condition_type, or text_contains.',
      items: eventTargetSchema,
    },
    folded: createGroupSchema.properties.folded,
    color: createGroupSchema.properties.color,
    ai_generated_event_id: createGroupSchema.properties.ai_generated_event_id,
  },
  required: ['scene_name', 'group_name', 'target_events'],
  additionalProperties: true,
};

const moveEventsToGroupSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    group_name: {
      type: 'string',
      description:
        'Destination group name. Use group_event for precise targeting.',
    },
    group_event: {
      type: 'object',
      description:
        'Destination group target, for example { event_path: "event-0" } or { ai_generated_event_id: "group-id" }.',
      additionalProperties: true,
    },
    target_events: wrapEventsInGroupSchema.properties.target_events,
    insert_index: createGroupSchema.properties.insert_index,
  },
  required: ['scene_name', 'target_events'],
  additionalProperties: true,
};

const renameGroupSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    group_name: {
      type: 'string',
      description:
        'Existing group name. Use group_event for precise targeting.',
    },
    group_event: moveEventsToGroupSchema.properties.group_event,
    new_group_name: {
      type: 'string',
      description: 'New group name.',
    },
    folded: createGroupSchema.properties.folded,
    color: createGroupSchema.properties.color,
  },
  required: ['scene_name', 'new_group_name'],
  additionalProperties: true,
};

const ensureSceneEventIdsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    id_prefix: {
      type: 'string',
      description: 'Prefix to use for newly assigned event ids.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const replaceSceneEventsFromFileSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    events_json_file: {
      type: 'string',
      description:
        'Local file containing a JSON array of serialized GDevelop events.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, return only success, scene name, and event count instead of the full event sheet.',
    },
  },
  required: ['scene_name', 'events_json_file'],
  additionalProperties: true,
};

const compareSceneEventsSemanticsSchema = {
  type: 'object',
  properties: {
    before_events_json: {
      type: 'string',
      description:
        'JSON string containing the event array before the edit. Group visual wrappers are ignored.',
    },
    after_events_json: {
      type: 'string',
      description:
        'JSON string containing the event array after the edit. Group visual wrappers are ignored.',
    },
  },
  required: ['before_events_json', 'after_events_json'],
  additionalProperties: false,
};

const validateEventsJsonFileSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    events_json_file: {
      type: 'string',
      description:
        'Local file containing a JSON array of serialized GDevelop events to validate without writing.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit rendered event text and normalized JSON from the response.',
    },
    dedupe_errors: {
      type: 'boolean',
      description:
        'When true, return errors deduplicated by root cause (each with a count) instead of one entry per occurrence. Much smaller for repetitive failures.',
    },
    allow_javascript_events: {
      type: 'boolean',
      description:
        'Default false. Set true only when the user explicitly requested JavaScript events.',
    },
  },
  required: ['events_json_file'],
  additionalProperties: true,
};

const lintSceneEventsSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    require_root_groups: {
      type: 'boolean',
      description:
        'Default true. When true, root-level non-Group events are reported.',
    },
    allow_javascript_events: {
      type: 'boolean',
      description:
        'Default false. Set true only when the user explicitly requested JavaScript events.',
    },
  },
  required: ['scene_name'],
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

const variableSchema = {
  type: 'object',
  properties: {
    variable_scope: {
      type: 'string',
      description: 'Variable scope: global, scene, or object.',
    },
    variable_name_or_path: {
      type: 'string',
      description:
        'Variable name or slash/dot-like path used by GDevelop variable helpers, for example Score or Player/Health.',
    },
    value: {
      type: 'string',
      description:
        'Serialized variable value. Use plain numbers/text for simple variables, JSON for structures/arrays when needed.',
    },
    variable_type: {
      type: 'string',
      description:
        'Optional forced variable type, for example number, string, boolean, structure, or array.',
    },
    scene_name: {
      type: 'string',
      description:
        'Required for scene variables. Also required for object variables when the object is a scene object (the usual case) — only omit it for variables of a global object. If omitted for a scene object, the call fails and names the owning scene.',
    },
    object_name: {
      type: 'string',
      description:
        'Required for object variables (variable_scope="object"). The object whose variable is set.',
    },
  },
  required: ['variable_scope', 'variable_name_or_path', 'value'],
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
        dedupe_errors: {
          type: 'boolean',
          description:
            'When true, return errors deduplicated by root cause (each with a count) instead of one entry per occurrence.',
        },
        allow_javascript_events: {
          type: 'boolean',
          description:
            'Default false. Set true only when the user explicitly requested JavaScript events.',
        },
      },
      required: ['events_json'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_events_json_file',
    description:
      'Validate a local file containing serialized GDevelop events JSON without modifying the project. Use for large event sheets before replacing events.',
    inputSchema: validateEventsJsonFileSchema,
  },
  {
    name: 'lint_scene_events',
    description:
      'Lint a scene event sheet for MCP authoring rules, including mandatory semantic Groups at root and no JavaScript events unless explicitly allowed.',
    inputSchema: lintSceneEventsSchema,
  },
  {
    name: 'gdevelop_search_instruction_metadata',
    description:
      'Search GDevelop action, condition, and expression metadata by internal type, displayed name, description, group, object, or behavior. Multi-word queries are tokenized (all words must match) and common intents (play sound, key pressed, change position, delete object, scene variable, restart scene, random number) are aliased to internal types. Results are ranked by relevance. Use before generating event JSON parameters.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search text, for example SceneJustBegins, variable, collision, animation, sound, object type, or behavior type. Multi-word phrases work (all words must match).',
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
        compact: {
          type: 'boolean',
          description:
            'When true, omit verbose per-parameter valueType discriminators and metadata flags; keep type, names, descriptions, parameter types, and literalSyntax hints. Greatly reduces response size.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_get_instruction_metadata',
    description:
      'Return exact GDevelop action, condition, or expression metadata, including parameter order/types/defaults, literalSyntax hints (which parameters need quotes), and event-scope relevance.',
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
        compact: {
          type: 'boolean',
          description:
            'When true, return a trimmed result (no verbose valueType nesting), keeping parameter types and literalSyntax hints.',
        },
      },
      required: ['type', 'kind'],
      additionalProperties: false,
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
    name: 'read_serialized_scene',
    description:
      'Read one scene/layout as complete serialized JSON, without reading the whole project. Pass object_name or object_names to return only those objects (and their instances) for a much smaller response.',
    inputSchema: readSerializedSceneSchema,
  },
  {
    name: 'read_scene_events_serialized',
    description:
      'Read one scene event sheet as raw serialized event JSON, including event types unsupported by text rendering. Pass summary_only:true for just root event counts/types (avoids dumping a huge tree); the JSON string is omitted by default — pass include_json:true to also get it.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: sceneNameSchema.properties.scene_name,
        summary_only: {
          type: 'boolean',
          description:
            'Return only a compact summary (root event count + per-type counts) instead of the full serialized tree.',
        },
        include_json: {
          type: 'boolean',
          description:
            'Also include serializedEventsJson (a string copy of the events). Off by default to keep the response small.',
        },
      },
      required: ['scene_name'],
      additionalProperties: true,
    },
  },
  {
    name: 'inspect_project_resources',
    description:
      'Audit project resources and references, including empty files, missing local files, unused resources, Sprite frame references, true event resource parameters, generic serialized string references, and suspicious Sprite collision masks (hasCustomCollisionMask:true with an empty mask, which silently disables collisions).',
    inputSchema: inspectProjectResourcesSchema,
  },
  {
    name: 'inspect_project_cleanup',
    description:
      'Return read-only cleanup candidates: empty scenes, possibly unused scene objects, invalid resources, unused resources, missing Sprite frame references, and suspicious Sprite collision masks (empty custom masks that disable collisions).',
    inputSchema: inspectProjectCleanupSchema,
  },
  {
    name: 'list_available_behaviors',
    description:
      'List behavior types available in the project, with the exact behavior_type to pass to add_behavior and the default behavior name (used in instruction behavior parameters). Optionally filter by an object (only compatible behaviors) and/or a search query. When object_name is given, the result also includes objectBehaviors: the behaviors already on the object (including hidden capability behaviors like Text/Animation/Effect/Opacity) with the exact NAME to use in instruction behavior parameters.',
    inputSchema: listAvailableBehaviorsSchema,
  },
  {
    name: 'gdevelop_inspect_running_preview',
    description:
      'Inspect a currently running preview to verify runtime behavior: returns whether a preview is running (defaulting to the latest launched one), its status, captured console logs, a separate errors list (uncaught exceptions, crashes, error-level logs), recentSounds (sounds/musics played since the last inspect — confirms PlaySound actually fired), and a compact runtime snapshot (running scene name, sceneElapsedTimeSeconds, per-object live instance counts, and scene/global variable values). Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }. Use this to confirm a game actually runs and behaves, not just that a preview was launched.',
    inputSchema: inspectRunningPreviewSchema,
  },
  {
    name: 'capture_preview_screenshot',
    description:
      'Capture a PNG screenshot of the current rendered frame from a running preview, to visually verify sprites, layout, and colors. Writes the PNG to file_path (recommended) or returns it as a base64 data URL. Launch a preview first with gdevelop_run_command { commandName: "LAUNCH_NEW_PREVIEW" }.',
    inputSchema: capturePreviewScreenshotSchema,
  },
  {
    name: 'simulate_preview_input',
    description:
      'Inject simulated keyboard/mouse/touch input into a running preview so you can verify input-driven gameplay (movement, shooting, restart) end-to-end, not just autonomous logic. Press and release are separate events; hold a key by sending keyPressed without keyReleased. Then use gdevelop_inspect_running_preview / capture_preview_screenshot to verify the effect. Launch a preview first.',
    inputSchema: simulatePreviewInputSchema,
  },
  {
    name: 'control_preview',
    description:
      'Deterministically control a running preview: pause, play, or step N frames. Pause + step makes runtime testing reproducible (no wall-clock drift between MCP calls): pause → simulate_preview_input / set_runtime_state → control_preview step → gdevelop_inspect_running_preview. Launch a preview first.',
    inputSchema: controlPreviewSchema,
  },
  {
    name: 'set_runtime_state',
    description:
      'Inject test state into a running preview: set scene/global variables and move/spawn/delete instances, to reach gameplay states that are hard to trigger naturally (e.g. set GameOver=0, give the player a position, spawn an enemy). Pause first with control_preview for reproducibility. Launch a preview first.',
    inputSchema: setRuntimeStateSchema,
  },
  {
    name: 'find_scene_events',
    description:
      'Find scene events by stable id, path, group name, event type, action type, condition type, parameter text, or serialized text.',
    inputSchema: findSceneEventsSchema,
  },
  {
    name: 'compare_scene_events_semantics',
    description:
      'Compare two serialized event arrays while ignoring visual Group wrappers, folded state, colors, names, sources, and aiGeneratedEventId fields.',
    inputSchema: compareSceneEventsSemanticsSchema,
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
    name: 'rename_scene',
    description:
      'Safely rename a scene/layout, updating references (e.g. change-scene actions) across the project and closing its open editor tabs. Use this instead of leaving placeholder names like "Untitled scene".',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: {
          type: 'string',
          description: 'Current scene/layout name.',
        },
        new_scene_name: {
          type: 'string',
          description: 'New name for the scene/layout (must be unique).',
        },
      },
      required: ['scene_name', 'new_scene_name'],
      additionalProperties: true,
    },
  },
  {
    name: 'create_or_replace_object',
    description:
      'Create, duplicate, replace, or move an object definition in a scene or globally.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'set_project_properties',
    description:
      'Set project-level properties in the open editor model, including project name, first layout/startup scene, game resolution, runtime resolution adaptation, FPS limits, orientation, and scale mode.',
    inputSchema: projectPropertiesSchema,
  },
  {
    name: 'set_first_layout',
    description:
      'Set the project startup scene/layout directly. Prefer this over patching saved JSON firstLayout on disk.',
    inputSchema: firstLayoutSchema,
  },
  {
    name: 'replace_object_definition',
    description:
      'Replace or create a scene object with a complete serialized object definition. This explicitly allows changing the object type.',
    inputSchema: replaceObjectDefinitionSchema,
  },
  {
    name: 'delete_scene_object',
    description:
      'Delete a scene object definition and clean up references/instances through the same refactorer used by the editor.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'change_object_property',
    description: 'Change one or more object properties.',
    inputSchema: objectInSceneSchema,
  },
  {
    name: 'set_object_properties',
    description:
      'Set object properties using the property names returned by inspect_object_properties, for example TextObject text, characterSize, and color.',
    inputSchema: setObjectPropertiesSchema,
  },
  {
    name: 'set_text_object_properties',
    description:
      'Set TextObject::Text properties with a high-level payload: text, character size, color, bold/italic, alignment, outline, shadow, font, and line height.',
    inputSchema: setTextObjectPropertiesSchema,
  },
  {
    name: 'create_sprite_object_from_resource',
    description:
      'Create or update a Sprite scene object from an existing image resource, bind a default animation frame, and optionally create an initial instance.',
    inputSchema: createSpriteObjectFromResourceSchema,
  },
  {
    name: 'create_text_object',
    description:
      'Create or update a TextObject::Text scene object with high-level text properties and optionally create an initial instance.',
    inputSchema: createTextObjectSchema,
  },
  {
    name: 'add_or_update_resource',
    description:
      'Add or update a project resource such as a local PNG image resource with name, file, and kind.',
    inputSchema: addOrUpdateResourceSchema,
  },
  {
    name: 'generate_placeholder_asset',
    description:
      'Generate a simple placeholder asset (a solid-color PNG image, or a short WAV beep/noise sound) on disk and register it as a project resource — so a from-scratch playable demo can be built entirely through MCP without external image/audio tooling. Replace with real art/audio later by overwriting the file and re-importing the same name.',
    inputSchema: generatePlaceholderAssetSchema,
  },
  {
    name: 'set_sprite_animations',
    description:
      'Replace a Sprite object animation list with named animations, directions, frames, origin/center points, custom points, and collision masks.',
    inputSchema: setSpriteAnimationsSchema,
  },
  {
    name: 'bulk_edit_scene_assets',
    description:
      'Batch import resources, create/replace scene objects, bind Sprite animations, add behaviors, declare scene/global variables, and place 2D instances for one scene — in one call. Applied in order: resources → objects → sprite animations → behaviors → variables → instances. Use for initial scene setup to drastically reduce single-tool round-trips.',
    inputSchema: bulkEditSceneAssetsSchema,
  },
  {
    name: 'add_behavior',
    description:
      'Add a behavior to an object. Requires behavior_type (the internal type). Use list_available_behaviors to find compatible behavior types.',
    inputSchema: addBehaviorSchema,
  },
  {
    name: 'remove_behavior',
    description:
      'Remove a behavior from an object by its behavior_name (the instance name, not the type).',
    inputSchema: removeBehaviorSchema,
  },
  {
    name: 'change_behavior_property',
    description:
      'Change one or more behavior properties on an object. Target the behavior by behavior_name; pass changed_properties as [{ property_name, new_value }].',
    inputSchema: changeBehaviorPropertySchema,
  },
  {
    name: 'put_2d_instances',
    description:
      'Place, move, update, or erase 2D object instances. Call describe_instances first to get existing instance ids.',
    inputSchema: put2dInstancesSchema,
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
    description:
      'Change scene/game properties, layers (create/rename/reorder/delete, e.g. add a HUD layer), layer effects, or object groups. Pass changed_properties / changed_layers / changed_layer_effects / changed_groups arrays.',
    inputSchema: changeScenePropertiesLayersEffectsGroupsSchema,
  },
  {
    name: 'apply_validated_scene_patch',
    description:
      'Apply a focused JSON patch to one serialized scene after validating scene structure and GDevelop unserialization. Use as a safe fallback when focused tools do not cover a small edit.',
    inputSchema: scenePatchSchema,
  },
  {
    name: 'create_group',
    description:
      'Create an empty scene event Group at root level or under a parent event.',
    inputSchema: createGroupSchema,
  },
  {
    name: 'wrap_events_in_group',
    description:
      'Create a scene event Group and move sibling target events into it while preserving their serialized content and stable ids.',
    inputSchema: wrapEventsInGroupSchema,
  },
  {
    name: 'move_events_to_group',
    description:
      'Move existing scene events into an existing Group by stable id, path, group name, action type, condition type, or text match.',
    inputSchema: moveEventsToGroupSchema,
  },
  {
    name: 'rename_group',
    description:
      'Rename an existing scene event Group and optionally update its folded state or background color.',
    inputSchema: renameGroupSchema,
  },
  {
    name: 'ensure_scene_event_ids',
    description:
      'Assign stable aiGeneratedEventId values to scene events that do not already have one.',
    inputSchema: ensureSceneEventIdsSchema,
  },
  {
    name: 'replace_scene_events_from_file',
    description:
      'Replace one scene event sheet from a local events JSON file after GDevelop validation. Use this instead of inlining very large event JSON.',
    inputSchema: replaceSceneEventsFromFileSchema,
  },
  {
    name: 'add_or_edit_variable',
    description: 'Add or edit global, scene, object, or behavior variables.',
    inputSchema: variableSchema,
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
  {
    name: 'gdevelop_save_project_and_wait',
    description:
      'Save the current project and wait for the editor save promise to resolve, returning saved/failed status instead of a launched command.',
    inputSchema: emptyObjectSchema,
  },
];

const toolUsageExamples: { [string]: Array<Object> } = {
  set_project_properties: [
    {
      description:
        'Set project name, startup scene, resolution, FPS, orientation, and scale mode in the editor model.',
      arguments: {
        project_name: 'Sky Battle',
        first_layout: 'Sky Battle',
        game_resolution_width: 1280,
        game_resolution_height: 720,
        adapt_game_resolution_at_runtime: true,
        min_fps: 20,
        max_fps: 120,
        orientation: 'landscape',
        scale_mode: 'linear',
      },
    },
  ],
  set_first_layout: [
    {
      description:
        'Set the startup scene directly after creating/deleting layouts.',
      arguments: {
        scene_name: 'Sky Battle',
      },
    },
  ],
  add_or_update_resource: [
    {
      description: 'Import or update a local PNG image resource.',
      arguments: {
        name: 'PlayerIdle.png',
        file: 'assets/PlayerIdle.png',
        kind: 'image',
        metadata: {
          smooth: false,
        },
      },
    },
    {
      description:
        'Import or update an audio resource and mark it as user-added/preloaded as a sound.',
      arguments: {
        name: 'Laser.wav',
        file: 'assets/Laser.wav',
        kind: 'audio',
        metadata: {
          userAdded: true,
          preloadAsSound: true,
          preloadAsMusic: false,
          preloadInCache: false,
        },
      },
    },
  ],
  generate_placeholder_asset: [
    {
      description:
        'Generate a 64x64 blue placeholder sprite image and register it as a resource.',
      arguments: {
        name: 'Player',
        asset_type: 'image',
        width: 64,
        height: 64,
        color: '60;120;220',
      },
    },
    {
      description: 'Generate a short shoot beep sound effect.',
      arguments: {
        name: 'Shoot',
        asset_type: 'sound',
        duration_ms: 120,
        frequency: 660,
      },
    },
  ],
  set_sprite_animations: [
    {
      description:
        'Attach one image resource to a Sprite object as a named animation with origin, center, and a rectangular collision mask.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        animations: [
          {
            name: 'Idle',
            directions: [
              {
                frames: [
                  {
                    image: 'PlayerIdle.png',
                    origin: { x: 0, y: 0 },
                    center: { x: 16, y: 24 },
                    collisionMask: [
                      [
                        { x: 0, y: 0 },
                        { x: 32, y: 0 },
                        { x: 32, y: 48 },
                        { x: 0, y: 48 },
                      ],
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
  set_text_object_properties: [
    {
      description:
        'Set common TextObject::Text properties without relying on raw serialized object fields.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'ScoreLabel',
        text: 'Score: 0',
        character_size: 32,
        color: '255;255;255',
        bold: true,
        text_alignment: 'left',
        vertical_text_alignment: 'top',
        outline: {
          enabled: true,
          color: '0;0;0',
          thickness: 2,
        },
      },
    },
  ],
  create_sprite_object_from_resource: [
    {
      description:
        'Create a Sprite object from an existing image resource and place one instance.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        resource_name: 'PlayerIdle.png',
        animation_name: 'Idle',
        origin: { x: 0, y: 0 },
        center: { x: 16, y: 24 },
        fullImageCollisionMask: true,
        create_instance: true,
        x: 100,
        y: 200,
        zOrder: 10,
      },
    },
  ],
  create_text_object: [
    {
      description:
        'Create a TextObject::Text object, set display properties, and place it on the scene.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'ScoreLabel',
        text: 'Score: 0',
        character_size: 32,
        color: '255;255;255',
        bold: true,
        create_instance: true,
        x: 16,
        y: 16,
        zOrder: 100,
      },
    },
  ],
  bulk_edit_scene_assets: [
    {
      description:
        'Import resources, create a Sprite object, attach frames, and place an initial instance in one call.',
      arguments: {
        scene_name: 'Level1',
        resources: [
          {
            name: 'PlayerIdle.png',
            file: 'assets/PlayerIdle.png',
            kind: 'image',
          },
        ],
        objects: [
          {
            object_name: 'Player',
            object_type: 'Sprite',
            serialized_object: {
              name: 'Player',
              type: 'Sprite',
              variables: [],
              behaviors: [],
              effects: [],
              animations: [],
            },
          },
        ],
        sprite_animations: [
          {
            object_name: 'Player',
            animations: [
              {
                name: 'Idle',
                frames: [{ image: 'PlayerIdle.png' }],
              },
            ],
          },
        ],
        instances: [{ object_name: 'Player', x: 100, y: 200 }],
      },
    },
  ],
  replace_object_definition: [
    {
      description:
        'Replace an existing scene object with a full serialized object, allowing the type to change.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        serialized_object: {
          name: 'Player',
          type: 'Sprite',
          variables: [],
          behaviors: [],
          effects: [],
          animations: [],
        },
      },
    },
  ],
  delete_scene_object: [
    {
      description:
        'Delete a scene object and clean up references through GDevelop refactoring.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
      },
    },
  ],
  set_object_properties: [
    {
      description:
        'Set TextObject properties by using names from inspect_object_properties.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'ScoreText',
        properties: {
          text: 'Score: 0',
          characterSize: 36,
          color: '255;255;255',
        },
      },
    },
  ],
  put_2d_instances: [
    {
      description:
        'Create a 2D instance with exact placement, size, layer, and z order.',
      arguments: {
        scene_name: 'Level1',
        operation: 'create',
        instances: [
          {
            object_name: 'Player',
            x: 128,
            y: 256,
            layer: '',
            zOrder: 10,
            customSize: {
              width: 64,
              height: 64,
            },
          },
        ],
      },
    },
    {
      description:
        'Update an existing 2D instance by id returned from describe_instances.',
      arguments: {
        scene_name: 'Level1',
        operation: 'update',
        instances: [
          {
            id: 'abcdef1234',
            x: 200,
            y: 300,
            angle: 15,
          },
        ],
      },
    },
    {
      description:
        'Delete an existing 2D instance by id returned from describe_instances.',
      arguments: {
        scene_name: 'Level1',
        operation: 'delete',
        instances: [
          {
            id: 'abcdef1234',
          },
        ],
      },
    },
  ],
  read_serialized_scene: [
    {
      description: 'Read a single scene serialized JSON.',
      arguments: {
        scene_name: 'Level1',
      },
    },
  ],
  apply_validated_scene_patch: [
    {
      description:
        'Rename the first serialized scene object after validating the patched scene.',
      arguments: {
        scene_name: 'Level1',
        patch: [
          {
            op: 'replace',
            path: '/objects/0/name',
            value: 'Player',
          },
        ],
      },
    },
  ],
  read_scene_events_serialized: [
    {
      description:
        'Read raw serialized events for a scene, including event types that text rendering may not support.',
      arguments: {
        scene_name: 'Level1',
      },
    },
  ],
  inspect_project_resources: [
    {
      description:
        'Audit resources before saving or after replacing sprites/audio.',
      arguments: {},
    },
    {
      description:
        'Return only resource counts and problem lists for final validation.',
      arguments: {
        compact: true,
      },
    },
  ],
  inspect_project_cleanup: [
    {
      description:
        'List empty scenes, possibly unused scene objects, invalid resources, and unused resources before cleanup.',
      arguments: {},
    },
  ],
  list_available_behaviors: [
    {
      description:
        'List every behavior type available, to discover the exact behavior_type for add_behavior.',
      arguments: {},
    },
    {
      description:
        'List only behaviors compatible with a specific object and matching a search query.',
      arguments: {
        object_name: 'Player',
        scene_name: 'Level1',
        search: 'physics',
      },
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
  validate_events_json_file: [
    {
      description:
        'Validate a large event sheet from a local file without writing it.',
      arguments: {
        scene_name: 'Level1',
        events_json_file: 'C:/tmp/level1-events.json',
        summary_only: true,
      },
    },
  ],
  lint_scene_events: [
    {
      description:
        'Check that AI-authored events are grouped and do not use JavaScript events by default.',
      arguments: {
        scene_name: 'Level1',
      },
    },
  ],
  find_scene_events: [
    {
      description: 'Find all events that play a sound.',
      arguments: {
        scene_name: 'Level1',
        action_type: 'PlaySound',
      },
    },
    {
      description: 'Find an event by stable id.',
      arguments: {
        scene_name: 'Level1',
        ai_generated_event_id: 'mcp-test-0',
      },
    },
  ],
  create_group: [
    {
      description: 'Create an empty event group at the end of a scene.',
      arguments: {
        scene_name: 'Level1',
        group_name: 'Initialization',
        folded: true,
      },
    },
  ],
  wrap_events_in_group: [
    {
      description: 'Wrap two generated events into a new group.',
      arguments: {
        scene_name: 'Level1',
        group_name: 'Enemy logic',
        target_events: [
          { ai_generated_event_id: 'enemy-spawn-event' },
          { ai_generated_event_id: 'enemy-move-event' },
        ],
      },
    },
  ],
  move_events_to_group: [
    {
      description: 'Move an event found by action type into an existing group.',
      arguments: {
        scene_name: 'Level1',
        group_name: 'Audio',
        target_events: [{ action_type: 'PlaySound' }],
      },
    },
  ],
  rename_group: [
    {
      description: 'Rename a group by old group name.',
      arguments: {
        scene_name: 'Level1',
        group_name: 'Setup',
        new_group_name: 'Initialization',
      },
    },
  ],
  ensure_scene_event_ids: [
    {
      description: 'Assign stable ids before doing multiple event edits.',
      arguments: {
        scene_name: 'Level1',
        id_prefix: 'mcp-level1',
      },
    },
  ],
  replace_scene_events_from_file: [
    {
      description:
        'Replace an event sheet from a local JSON file instead of inlining a large events_json string.',
      arguments: {
        scene_name: 'Level1',
        events_json_file: 'C:/tmp/level1-events.json',
        summary_only: true,
      },
    },
  ],
  compare_scene_events_semantics: [
    {
      description:
        'Check that wrapping events in visual groups did not change executable event content.',
      arguments: {
        before_events_json:
          '[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]',
        after_events_json:
          '[{"type":"BuiltinCommonInstructions::Group","name":"Group","events":[{"type":"BuiltinCommonInstructions::Standard","conditions":[],"actions":[]}]}]',
      },
    },
  ],
  gdevelop_save_project_and_wait: [
    {
      description:
        'Save and wait for write completion instead of only launching SAVE_PROJECT.',
      arguments: {},
    },
  ],
  add_or_edit_variable: [
    {
      description: 'Create or update a scene variable before writing events.',
      arguments: {
        variable_scope: 'scene',
        scene_name: 'Level1',
        variable_name_or_path: 'Score',
        value: '0',
        variable_type: 'number',
      },
    },
    {
      description: 'Create or update an object variable.',
      arguments: {
        variable_scope: 'object',
        scene_name: 'Level1',
        object_name: 'Player',
        variable_name_or_path: 'Health',
        value: '3',
        variable_type: 'number',
      },
    },
  ],
  add_behavior: [
    {
      description:
        'Add the platformer character behavior to the Player object (uses the default behavior name).',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        behavior_type: 'PlatformBehavior::PlatformerObjectBehavior',
      },
    },
    {
      description:
        'Destroy bullets once they leave the screen by adding DestroyOutside.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Bullet',
        behavior_type: 'DestroyOutsideBehavior::DestroyOutside',
      },
    },
  ],
  remove_behavior: [
    {
      description: 'Remove a behavior by its instance name.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        behavior_name: 'PlatformerObject',
      },
    },
  ],
  change_behavior_property: [
    {
      description: 'Change two platformer behavior properties at once.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        behavior_name: 'PlatformerObject',
        changed_properties: [
          { property_name: 'jumpSpeed', new_value: '900' },
          { property_name: 'gravity', new_value: '1500' },
        ],
      },
    },
  ],
  change_scene_properties_layers_effects_groups: [
    {
      description: 'Set the scene background color (RGB string).',
      arguments: {
        scene_name: 'Level1',
        changed_properties: [
          { property_name: 'backgroundColor', new_value: '32;32;64' },
        ],
      },
    },
    {
      description: 'Create a dedicated HUD layer above the base layer.',
      arguments: {
        scene_name: 'Level1',
        changed_layers: [{ layer_name: 'HUD' }],
      },
    },
    {
      description: 'Define an object group membership.',
      arguments: {
        scene_name: 'Level1',
        changed_groups: [{ group_name: 'Enemies', objects: ['Enemy', 'Boss'] }],
      },
    },
  ],
};

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

export const getAllMcpToolsForIntrospection = (): Array<McpTool> => [
  ...readTools,
  ...writeTools,
  ...commandTools,
];

export const getMcpToolUsageExamples = (
  toolName?: ?string
): { [string]: Array<Object> } => {
  if (!toolName) return toolUsageExamples;
  return {
    [toolName]: toolUsageExamples[toolName] || [],
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
    uri: 'gdevelop://project/resources.json',
    name: 'Project resources audit',
    description:
      'Project resources, file validity, unused resources, and reference audit.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/events.txt',
    name: 'Scene events',
    description: 'Events for a scene rendered as text.',
    mimeType: 'text/plain',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/events.json',
    name: 'Serialized scene events',
    description: 'Raw serialized event JSON for a scene.',
    mimeType: 'application/json',
  },
  {
    uri: 'gdevelop://scene/{sceneName}/scene.json',
    name: 'Serialized scene',
    description: 'Complete serialized JSON for one scene/layout.',
    mimeType: 'application/json',
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
