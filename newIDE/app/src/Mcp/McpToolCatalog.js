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
    shape: {
      type: 'string',
      description:
        'Image shape: "rectangle" (default), "circle", "ellipse", "triangle", or "diamond". Non-rectangle shapes are drawn over a transparent background.',
    },
    color2: {
      type: 'string',
      description:
        'Optional second color "r;g;b[;a]" — when given, the image is filled with a vertical gradient from color (top) to color2 (bottom).',
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
    waveform: {
      type: 'string',
      description:
        'Sound waveform: "sine" (default), "square", "saw", "triangle", or "noise". Squares/saws sound more "game-y" than a pure sine.',
    },
    adsr: {
      type: 'object',
      description:
        'Optional ADSR envelope as fractions of total duration: { attack, decay, sustain, release } (e.g. { attack:0.01, decay:0.1, sustain:0.6, release:0.3 }). Gives a shaped sound instead of a flat fade-out.',
      additionalProperties: true,
    },
  },
  required: ['name'],
  additionalProperties: true,
};

const renderSceneToPngSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Scene whose layout to render.',
    },
    file: {
      type: 'string',
      description:
        'Optional output PNG path (project-relative recommended). Defaults to renders/<scene>-layout.png.',
    },
    max_width: {
      type: 'number',
      description:
        'Cap the rendered width in px (the scene is scaled to fit; default 960).',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const sliceSpriteSheetSchema = {
  type: 'object',
  properties: {
    sheet_file: {
      type: 'string',
      description:
        'Path to the sprite-sheet PNG (project-relative recommended, e.g. assets/walk_sheet.png).',
    },
    object_name: {
      type: 'string',
      description:
        'Sprite object to receive the sliced animation (created/updated via set_sprite_animations).',
    },
    scene_name: {
      type: 'string',
      description:
        'Scene containing the object. Omit to target a global object.',
    },
    animation_name: {
      type: 'string',
      description: 'Animation name to create (default "Default").',
    },
    frame_width: {
      type: 'number',
      description:
        'Per-frame width in px. Provide with frame_height, OR use columns+rows instead.',
    },
    frame_height: {
      type: 'number',
      description: 'Per-frame height in px (pair with frame_width).',
    },
    columns: {
      type: 'number',
      description:
        'Grid columns. Provide with rows as an alternative to frame_width/frame_height.',
    },
    rows: { type: 'number', description: 'Grid rows (pair with columns).' },
    frame_count: {
      type: 'number',
      description:
        'Optional cap on number of frames to extract (default: all grid cells, row-major).',
    },
    output_dir: {
      type: 'string',
      description:
        'Optional output folder for the cut frame PNGs (default assets/<object>_<animation>).',
    },
  },
  required: ['sheet_file', 'object_name'],
  additionalProperties: true,
};

const bindSpriteAnimationsFromDirectorySchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: {
      type: 'string',
      description:
        'Sprite object to receive the animations. Pass create_object:true to create it when missing.',
    },
    directory: {
      type: 'string',
      description:
        'Project-relative or absolute directory. Subdirectories such as Idle/Run/Attack become animation names; root image files become one animation when there are no subdirectories.',
    },
    create_object: {
      type: 'boolean',
      description: 'Create the Sprite object if it does not already exist.',
    },
    frame_duration: {
      type: 'number',
      description: 'Time between frames in seconds. Defaults to 0.08.',
    },
    loop: {
      type: 'boolean',
      description: 'Whether generated animations loop. Defaults to true.',
    },
    recursive: {
      type: 'boolean',
      description:
        'Read images recursively inside each animation directory. Defaults to true.',
    },
    include_root_files: {
      type: 'boolean',
      description:
        'Also bind root-level image files as an animation even when subdirectory animations exist.',
    },
    animation_name: {
      type: 'string',
      description:
        'Animation name to use for root-level image files. Defaults to Default.',
    },
  },
  required: ['scene_name', 'object_name', 'directory'],
  additionalProperties: true,
};

// Shared tile-spec item used by tilemap tools: a tile is a number (tileId; <0
// clears), or an object addressing the tileset cell + optional flips.
const tilemapTileItemSchema = {
  type: 'object',
  properties: {
    x: { type: 'number', description: 'Map column (0-based).' },
    y: { type: 'number', description: 'Map row (0-based).' },
    tile: {
      description:
        'The tile to place: a tile id number (row*columnCount+col), { id } or { col, row } (needs tileset_columns), or null / { clear:true } to erase. Use { id|col,row, flipX, flipY } to flip.',
    },
  },
  required: ['x', 'y'],
  additionalProperties: true,
};

const createTilemapObjectSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string', description: 'Scene to add the tilemap to.' },
    object_name: {
      type: 'string',
      description: 'Name for the TileMap::SimpleTileMap object.',
    },
    atlas_image: {
      type: 'string',
      description:
        'The tileset atlas IMAGE RESOURCE name (must already exist; add it with add_or_update_resource). columns/rows are computed from this image size and tile_size.',
    },
    tile_size: {
      type: 'number',
      description: 'Square tile size in pixels (default 16).',
    },
    columns: {
      type: 'number',
      description:
        'Override the tileset column count (default: floor(atlasWidth / tile_size)).',
    },
    rows: {
      type: 'number',
      description:
        'Override the tileset row count (default: floor(atlasHeight / tile_size)).',
    },
    tiles_with_hit_box: {
      type: 'string',
      description:
        'Comma-separated tile ids that should have a collision hit box (e.g. "0,1,5").',
    },
    create_instance: {
      type: 'boolean',
      description:
        'Also create one instance in the scene. Implied if you pass x/y/map_width/map_height/tiles.',
    },
    x: { type: 'number', description: 'Instance X (scene coords).' },
    y: { type: 'number', description: 'Instance Y (scene coords).' },
    layer: { type: 'string', description: 'Instance layer (default base).' },
    map_width: {
      type: 'number',
      description:
        'Initial map width in tiles (columns) for the instance grid.',
    },
    map_height: {
      type: 'number',
      description: 'Initial map height in tiles (rows) for the instance grid.',
    },
    tiles: {
      type: 'array',
      description:
        'Optional initial tiles to paint on the created instance (same shape as set_tilemap_tiles tiles).',
      items: tilemapTileItemSchema,
    },
  },
  required: ['scene_name', 'object_name', 'atlas_image'],
  additionalProperties: true,
};

const setTilemapTilesSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: {
      type: 'string',
      description: 'The tilemap object whose instance to paint.',
    },
    instance_id: {
      type: 'string',
      description:
        'Target a specific instance (from describe_instances). Defaults to the first instance of the object.',
    },
    create_instance: {
      type: 'boolean',
      description:
        'Create an instance if none exists for the object (positioned at x/y).',
    },
    x: { type: 'number' },
    y: { type: 'number' },
    layer: { type: 'string' },
    map_width: {
      type: 'number',
      description:
        'Resize the map to this many columns (else grows to fit the tiles).',
    },
    map_height: {
      type: 'number',
      description:
        'Resize the map to this many rows (else grows to fit the tiles).',
    },
    clear_all: {
      type: 'boolean',
      description: 'Erase the whole grid before applying tiles/fill.',
    },
    tile_size: {
      type: 'number',
      description:
        'Tile size in px, used only when creating a brand-new grid (default 16; ideally matches the object tile_size).',
    },
    tileset_columns: {
      type: 'number',
      description:
        'The tileset column count, required to address tiles by { col, row } (the object columnCount is used automatically inside the editor).',
    },
    opacity: {
      type: 'number',
      description: 'Layer opacity 0..1 (or 0..255).',
    },
    fill: {
      type: 'object',
      description:
        'Rectangular fill: { x, y, width, height, tile }. Applied before individual tiles.',
      additionalProperties: true,
    },
    tiles: {
      type: 'array',
      description:
        'Tile placements: [{ x, y, tile }]. tile = tileId number (row*columnCount+col), { id } or { col, row } (+ optional flipX/flipY), or null/{clear:true} to erase.',
      items: tilemapTileItemSchema,
    },
    summary_only: {
      type: 'boolean',
      description: 'Omit the full returned grid (keep the response small).',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const getTilemapTilesSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: { type: 'string' },
    instance_id: {
      type: 'string',
      description: 'Optional specific instance; defaults to the first.',
    },
    raw: {
      type: 'boolean',
      description:
        'When true, return only the raw tiles[y][x] grid without the decoded { id, flipX } view.',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: false,
};

const inspectTilemapPaletteSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: { type: 'string' },
    atlas_image: {
      type: 'string',
      description:
        'Optional image resource name when the TileMap object config cannot be read.',
    },
    tile_size: {
      type: 'number',
      description:
        'Optional tile size override. Defaults to the object tileSize config or 16.',
    },
    columns: {
      type: 'number',
      description:
        'Optional tileset column count override. Otherwise inferred from config or atlas image width.',
    },
    rows: {
      type: 'number',
      description:
        'Optional tileset row count override. Otherwise inferred from config or atlas image height.',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const setTilemapCollisionTilesSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: { type: 'string' },
    tile_ids: {
      type: 'array',
      items: { type: 'number' },
      description:
        'Tile ids that should use the TileMap native collision hit box. Written to the object tilesWithHitBox property.',
    },
    tiles_with_hit_box: {
      type: 'string',
      description:
        'Comma-separated tile ids, alias for tile_ids when copying existing TileMap config.',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: true,
};

const inspectTilemapCollisionSchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: { type: 'string' },
    instance_id: {
      type: 'string',
      description: 'Optional specific tilemap instance; defaults to the first.',
    },
    summary_only: {
      type: 'boolean',
      description: 'Omit the full grid while keeping blocked cells/ascii mask.',
    },
  },
  required: ['scene_name', 'object_name'],
  additionalProperties: false,
};

const checkTilemapWalkabilitySchema = {
  type: 'object',
  properties: {
    scene_name: { type: 'string' },
    object_name: { type: 'string' },
    instance_id: {
      type: 'string',
      description: 'Optional specific tilemap instance; defaults to the first.',
    },
    start: {
      type: 'object',
      description: 'Start tile coordinate, { x, y } in tile cells.',
      additionalProperties: true,
    },
    goal: {
      type: 'object',
      description: 'Goal tile coordinate, { x, y } in tile cells.',
      additionalProperties: true,
    },
  },
  required: ['scene_name', 'object_name', 'start', 'goal'],
  additionalProperties: false,
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

const staticDataReadSchema = {
  type: 'object',
  properties: {
    placeholder_path: {
      type: 'string',
      description:
        'Optional exact Static Data placeholder path to read, for example {{cards.Sunflower.price}}. Omit to read the complete Static Data object.',
    },
  },
  additionalProperties: false,
};

const staticDataReplaceSchema = {
  type: 'object',
  properties: {
    static_data: {
      type: 'object',
      description:
        'Complete replacement static data object. The root must be a JSON object.',
      additionalProperties: true,
    },
    static_data_json: {
      type: 'string',
      description:
        'Alternative complete Static Data replacement as a JSON string. The root must be an object.',
    },
    include_static_data: {
      type: 'boolean',
      description:
        'When true, include the written Static Data object in the response.',
    },
  },
  additionalProperties: true,
};

const staticDataValueSchema = {
  type: 'object',
  properties: {
    placeholder_path: {
      type: 'string',
      description:
        'Exact static data placeholder path, for example {{cards.Sunflower.price}}. Placeholder syntax is required.',
    },
    value: {
      description:
        'JSON value to write at placeholder_path. Use a number/boolean/object/array for typed Static Data values, or a string for text values.',
    },
    value_json: {
      type: 'string',
      description:
        'Alternative value as a JSON string, useful for explicitly writing objects, arrays, null, numbers, or booleans.',
    },
  },
  required: ['placeholder_path'],
  additionalProperties: true,
};

const staticDataDeleteSchema = {
  type: 'object',
  properties: {
    placeholder_path: staticDataValueSchema.properties.placeholder_path,
  },
  required: ['placeholder_path'],
  additionalProperties: false,
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
          align: {
            type: 'string',
            description:
              'Optional alignment within the scene resolution instead of explicit x/y: "center", "center-x", "center-y", "top", "bottom", "left", "right" (combine like "bottom center"). Uses the instance/object effective size — removes the need to hand-compute (sceneWidth - objectWidth)/2.',
          },
          initially_hidden: {
            type: 'boolean',
            description:
              'Start the instance not drawn (opacity 0). Note: initial instances have no native visible flag; opacity 0 hides visually but does NOT stop collisions — for a fully inert hidden object add a SceneJustBegins -> Hide event too.',
          },
          variables: {
            description:
              'Per-instance variables (initial instances support these). Either an object { name: value } or an array [{ name, value, type? }]. Useful to give each placed instance its own data (e.g. each of 3 hearts an index) without a scene-start Repeat loop.',
          },
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
    summary_only: {
      type: 'boolean',
      description:
        'When true, return only the per-change list + instanceCount, omitting the full serialized instance list (which grows with every instance in the scene). Recommended to keep responses small.',
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
    center_origin: {
      type: 'boolean',
      description:
        'When true, set the frame ORIGIN to the image center, so Create(x,y) places the object by its center and rotation pivots around the middle (no need to compute origin per object). Reads the image size from disk.',
    },
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
    animations: {
      type: 'array',
      description:
        'Optional full animation list (same shape as set_sprite_animations) to build a MULTI-frame / multi-animation Sprite in one call. When given, it replaces the single-frame default built from resource_name. Set per-animation loop / timeBetweenFrames for multi-frame animations.',
      items: setSpriteAnimationsSchema.properties.animations.items,
    },
    loop: {
      type: 'boolean',
      description:
        'For the default single animation: whether it loops (set false for one-shot).',
    },
    time_between_frames: {
      type: 'number',
      description: 'For the default single animation: seconds per frame.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit the full serialized object from the response (smaller output).',
    },
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

const jsonPatchOperationSchema = {
  type: 'object',
  properties: {
    op: {
      type: 'string',
      description: 'Patch operation: add, replace, remove, or test.',
    },
    path: {
      type: 'string',
      description: 'JSON pointer path, for example /objects/0/name.',
    },
    value: {
      description: 'Value for add, replace, or test.',
    },
  },
  required: ['op', 'path'],
  additionalProperties: true,
};

const scenePatchSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    patch: {
      type: 'array',
      description:
        'RFC-6902-style JSON patch subset for one serialized scene. Supports add, replace, remove, and test with JSON pointer paths.',
      items: jsonPatchOperationSchema,
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
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit the full serializedScene and return only changedPaths, operation count, and validation status.',
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

const inspectResourceImagesSchema = {
  type: 'object',
  properties: {
    resource_names: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Optional image resource names to inspect. Omit to inspect every image resource.',
    },
  },
  additionalProperties: false,
};

const auditProjectAssetSourcesSchema = {
  type: 'object',
  properties: {
    allowed_roots: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Project-relative folders that are allowed as resource origins. Defaults to ["assets"].',
    },
  },
  additionalProperties: false,
};

const compareImageFilesSchema = {
  type: 'object',
  properties: {
    reference_file: {
      type: 'string',
      description:
        'Reference PNG/JPG/WebP/BMP file, project-relative or absolute.',
    },
    actual_file: {
      type: 'string',
      description:
        'Current render/screenshot file to compare against the reference.',
    },
    reference_region: {
      type: 'object',
      description:
        'Optional { x, y, width, height } crop in the reference file.',
      additionalProperties: true,
    },
    actual_region: {
      type: 'object',
      description: 'Optional { x, y, width, height } crop in the actual file.',
      additionalProperties: true,
    },
    threshold: {
      type: 'number',
      description:
        'Per-channel max difference threshold. Pixels above this are counted as mismatches. Defaults to 24.',
    },
    output_heatmap_file: {
      type: 'string',
      description:
        'Optional project-relative/absolute PNG file for a red transparent diff heatmap.',
    },
  },
  required: ['reference_file', 'actual_file'],
  additionalProperties: true,
};

const cropSceneObjectImageSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: {
      type: 'string',
      description: 'Initial instance object name to crop around.',
    },
    instance_id: {
      type: 'string',
      description: 'Optional short persistent instance id to disambiguate.',
    },
    source_file: {
      type: 'string',
      description:
        'Screenshot/render PNG path to crop, project-relative or absolute.',
    },
    output_file: {
      type: 'string',
      description: 'Output PNG path for the cropped/zoomed image.',
    },
    padding: {
      type: 'number',
      description: 'Padding around the object in scene pixels. Defaults to 16.',
    },
    zoom: {
      type: 'number',
      description: 'Nearest-neighbor zoom factor. Defaults to 2.',
    },
    overlay_bounds: {
      type: 'boolean',
      description:
        'Draw a red rectangle around the object bounds in the crop. Defaults to true.',
    },
  },
  required: ['scene_name', 'object_name', 'source_file', 'output_file'],
  additionalProperties: true,
};

const inspectSceneDrawOrderSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: {
      type: 'string',
      description: 'Optional object name to filter the draw-order listing.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
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
    include_properties: {
      type: 'boolean',
      description:
        "Default false. When true, include each behavior TYPE's property schema (name/label/type/default value/choices) so you can learn configurable properties (e.g. DestroyOutside's extra border distance) WITHOUT first adding the behavior to an object.",
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
        'pause (freeze the game loop), play (resume), step (advance exactly N frames while paused for deterministic testing), close (stop previews directly), or focus (bring all preview windows to front - fixes timed-out inspect/screenshot when a backgrounded preview is throttled). Defaults to step. For stale-preview cleanup before verification, prefer save_and_relaunch_preview_paused so cleanup and relaunch happen as one supported workflow.',
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
        'For action=close: close ALL running previews instead of just the targeted one. For stale-preview cleanup before runtime verification, prefer save_and_relaunch_preview_paused.',
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
        'Optional input events to inject BEFORE stepping (same shape as simulate_preview_input: [{ type, key/key_code/button/x/y, ... }]). Held keys (keyPressed without keyReleased) stay pressed across all stepped frames. run_frames also supports { type:"clickAndHold", x, y, button?, frames? }: it moves the cursor, presses before stepping, releases after stepping, and uses frames as the hold duration when top-level frames is omitted.',
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
    timeout_ms: {
      type: 'number',
      description:
        'How long to wait for debugger connection and runtime getStatus readiness (500-30000 ms, default 6000). If start_paused is true, pause must also be confirmed before success:true is returned.',
    },
  },
  additionalProperties: false,
};

const saveAndRelaunchPreviewPausedSchema = {
  type: 'object',
  properties: {
    scene_name: launchPreviewSchema.properties.scene_name,
    timeout_ms: launchPreviewSchema.properties.timeout_ms,
    relaunch_attempts: {
      type: 'number',
      description:
        'Number of fresh launch attempts after awaited preview cleanup. Defaults to 2, maximum 4, with exponential backoff.',
    },
  },
  additionalProperties: true,
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

const eventWriteOptionsSchema = {
  dry_run: {
    type: 'boolean',
    description:
      'Apply serialized events to a temporary event sheet, validate, and render without modifying the project.',
  },
  expected_revision: {
    type: 'string',
    description:
      'Optional eventSheetRevision from read_scene_events_serialized. The write is rejected if the event sheet changed.',
  },
  allow_javascript_events: {
    type: 'boolean',
    description:
      'Default false. Enable only when the user explicitly requested JavaScript events.',
  },
};

const eventValidationOptionsSchema = {
  summary_only: {
    type: 'boolean',
    description:
      'Default true. Return diagnostics without rendered events or normalized JSON.',
  },
  errors_only: {
    type: 'boolean',
    description: 'Return only validity, event count, and errors.',
  },
  include_rendered_events: {
    type: 'boolean',
    description: 'Include rendered event-sheet text in the response.',
  },
  include_normalized_json: {
    type: 'boolean',
    description: 'Include normalized serialized events JSON in the response.',
  },
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
        'Variables to declare in one call: [{ scope: "scene"|"global"|"object", name, value, type?, object_name? }]. For scope "object", also pass object_name. Declare these before writing events that reference them.',
      items: {
        type: 'object',
        properties: {
          scope: { type: 'string' },
          name: { type: 'string' },
          value: {},
          type: { type: 'string' },
          object_name: {
            type: 'string',
            description: 'Required when scope is "object".',
          },
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
    events: {
      type: 'array',
      description:
        'Optional serialized GDevelop events to add last. Alias of events_json for array-valued callers.',
      items: { type: 'object', additionalProperties: true },
    },
    events_json: {
      type: 'string',
      description:
        'Alternative to events: the events array as a JSON string (same as add_scene_events events_json).',
    },
    dry_run: {
      type: 'boolean',
      description:
        'When true, validate the plan WITHOUT applying it: reports missing resource fields, behaviors/instances referencing objects that will not exist, unknown behavior types, and malformed variable payloads. Re-run without dry_run to apply.',
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
    compact: {
      type: 'boolean',
      description:
        'Default true. Omit serializedEvent from matches. Set false for a full event payload.',
    },
    summary_only: {
      type: 'boolean',
      description: 'Alias for compact:true.',
    },
    include_serialized: {
      type: 'boolean',
      description:
        'Explicitly include or omit serializedEvent. Overrides compact and summary_only.',
    },
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const patchSceneEventInstructionSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    event: {
      type: 'object',
      description:
        'Stable event target. Prefer { ai_generated_event_id } or { event_path } instead of brittle raw JSON paths.',
      additionalProperties: true,
    },
    event_id: {
      type: 'string',
      description: 'Alias for event.ai_generated_event_id.',
    },
    event_path: {
      type: 'string',
      description: 'Alias for event.event_path, for example event-4-event-7.',
    },
    instruction_kind: {
      type: 'string',
      enum: ['action', 'condition'],
      description:
        'Whether to edit an action or a condition. Defaults to action.',
    },
    instruction_type: {
      type: 'string',
      description:
        'Exact GDevelop instruction type to edit, for example SetX, SetNumberVariable, or KeyPressed.',
    },
    object_name: {
      type: 'string',
      description:
        'Optional object name that must appear in the instruction parameters to disambiguate multiple matching instructions.',
    },
    parameters: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Complete replacement parameter array in GDevelop order. Use create_action/create_condition or metadata tools to build the correct order.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit serializedEvents/eventsAsText and return only the edited event/instruction summary.',
    },
  },
  required: ['scene_name', 'instruction_type', 'parameters'],
  additionalProperties: true,
};

const replaceJavascriptEventCodeSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    event: {
      type: 'object',
      description:
        'Stable event target. Prefer { ai_generated_event_id } or { event_path }.',
      additionalProperties: true,
    },
    event_id: {
      type: 'string',
      description: 'Alias for event.ai_generated_event_id.',
    },
    event_path: {
      type: 'string',
      description: 'Alias for event.event_path, for example event-0.1.',
    },
    code_string: {
      type: 'string',
      description: 'Complete replacement JavaScript inline code.',
    },
    parameter_objects: {
      type: 'string',
      description:
        'Optional comma-separated object names exposed to the JavaScript event.',
    },
    summary_only: patchSceneEventInstructionSchema.properties.summary_only,
  },
  required: ['scene_name', 'code_string'],
  additionalProperties: true,
};

const attachObjectToObjectTopSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    follower_object_name: {
      type: 'string',
      description:
        'Object to position above the target, such as HealthBar or NameLabel.',
    },
    target_object_name: {
      type: 'string',
      description: 'Object whose top edge is followed, such as Enemy.',
    },
    x_offset: {
      type: 'number',
      description:
        'Horizontal pixel offset added after centering. Defaults to 0.',
    },
    y_offset: {
      type: 'number',
      description:
        'Vertical pixel offset added to target.Y()-follower.Height(). Defaults to 0.',
    },
    event_id: {
      type: 'string',
      description:
        'Stable aiGeneratedEventId for the generated follow event. Defaults to <follower>-follow-<target>-top.',
    },
    insert_index: {
      type: 'number',
      description: 'Root event insertion index. Defaults to the end.',
    },
  },
  required: ['scene_name', 'follower_object_name', 'target_object_name'],
  additionalProperties: true,
};

const inspectGameplayRulesSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    top_attachments: {
      type: 'array',
      description:
        'Heuristic checks for follower/target UI attachments. Items use follower_object_name and target_object_name.',
      items: { type: 'object', additionalProperties: true },
    },
    state_machines: {
      type: 'array',
      description:
        'Heuristic checks for object variable state machines. Items use object_name, variable_name, and optional states array.',
      items: { type: 'object', additionalProperties: true },
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
    dry_run: {
      type: 'boolean',
      description:
        'When true, validate and render the would-be result (eventsAsText) WITHOUT writing, so you can review it first. Also reports whether nested sub-instructions are preserved.',
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
        'Default true. Omit rendered event text and normalized JSON from the response.',
    },
    errors_only: eventValidationOptionsSchema.errors_only,
    include_rendered_events:
      eventValidationOptionsSchema.include_rendered_events,
    include_normalized_json:
      eventValidationOptionsSchema.include_normalized_json,
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
    disabled_rules: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Rule types to suppress, e.g. ["create-without-for-each"] when a single-instance Create is intentional, or ["timer-compared-but-never-started"].',
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
      oneOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'object', additionalProperties: true },
        },
        { type: 'object', additionalProperties: true },
      ],
      description:
        'Serialized GDevelop events to insert directly. Accepts a JSON string, an events array, a single serialized event object, or { events: [...] }. Prefer this for MCP clients that already generated the events, as it does not call the GDevelop event generation service.',
    },
    event_changes: {
      type: 'array',
      description:
        'Advanced direct event operations. Each change can include operation_name, operation_target_event, generated_events, extension_names, missing_resources, undeclared_variables, undeclared_object_variables, and missing_object_behaviors. generated_events accepts a JSON string, events array, a single serialized event object, or { events: [...] }.',
      items: {
        type: 'object',
        properties: {
          operation_name: {
            type: 'string',
            enum: [
              'insert_at_end',
              'insert_before_event',
              'insert_after_event',
              'insert_as_sub_event',
              'insert_and_replace_event',
              'replace_entire_event_and_sub_events',
              'replace_event_but_keep_existing_sub_events',
              'insert_actions_conditions_at_end',
              'insert_actions_conditions_at_start',
              'replace_all_actions',
              'replace_all_conditions',
              'delete_event',
            ],
            description:
              'Operation such as insert_at_end, insert_before_event, insert_after_event, replace_entire_event_and_sub_events, replace_event_but_keep_existing_sub_events, or delete_event.',
          },
          operation_target_event: {
            type: 'string',
            description:
              'Stable aiGeneratedEventId or event path target. Not required for insert_at_end.',
          },
          generated_events: {
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: { type: 'object', additionalProperties: true },
              },
              { type: 'object', additionalProperties: true },
            ],
            description:
              'Events to insert/replace. Accepts a JSON string, an events array, a single serialized event object, or { events: [...] }.',
          },
        },
        additionalProperties: true,
      },
    },
    generated_event_id: {
      type: 'string',
      description:
        'Optional stable id stamped on directly inserted or changed events.',
    },
    dry_run: eventWriteOptionsSchema.dry_run,
    expected_revision: eventWriteOptionsSchema.expected_revision,
    allow_javascript_events: eventWriteOptionsSchema.allow_javascript_events,
  },
  required: ['scene_name'],
  additionalProperties: true,
};

const deleteSceneVariableSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    variable_name_or_path: {
      type: 'string',
      description:
        'Scene variable name or nested path, for example Score, State.Mode, or Inventory[0].Name.',
    },
  },
  required: ['scene_name', 'variable_name_or_path'],
  additionalProperties: true,
};

const validateCurrentProjectJsonSchema = {
  type: 'object',
  properties: {
    include_generated_code: {
      type: 'boolean',
      description:
        'Default true. When true, extension function generated JavaScript is preflighted as part of validation.',
    },
  },
  additionalProperties: true,
};

const projectJsonPatchSchema = {
  type: 'object',
  properties: {
    patch: {
      type: 'array',
      description:
        'RFC-6902-style JSON patch array. Paths are relative to the selected scope root; omit scope or use scope:"project" for full project paths.',
      items: jsonPatchOperationSchema,
    },
    patch_file: {
      type: 'string',
      description:
        'Optional local file containing the JSON patch array. Relative paths resolve from the active project folder.',
    },
    scope: {
      type: 'string',
      description:
        'Optional scope for relative patch paths: project, scene, extension, extension_object, or extension_function.',
    },
    scene_name: sceneNameSchema.properties.scene_name,
    extension_name: {
      type: 'string',
      description: 'Name of the project events-functions extension.',
    },
    parent_kind: {
      type: 'string',
      description:
        'For extension_function scope: extension, behavior, or object.',
    },
    parent_name: {
      type: 'string',
      description:
        'For extension_function scope when parent_kind is behavior/object.',
    },
    object_name: {
      type: 'string',
      description: 'For extension_object scope.',
    },
    function_name: {
      type: 'string',
      description: 'For extension_function scope.',
    },
    dry_run: scenePatchSchema.properties.dry_run,
    summary_only: scenePatchSchema.properties.summary_only,
    include_generated_code:
      validateCurrentProjectJsonSchema.properties.include_generated_code,
    save: {
      type: 'boolean',
      description:
        'When true, save the editor project after a successful validated apply. Validation failures and dry runs never save.',
    },
    snapshot_label: {
      type: 'string',
      description:
        'Optional label for the automatic in-memory snapshot created before a real apply.',
    },
  },
  additionalProperties: true,
};

const syncEditorFromValidatedProjectJsonSchema = {
  type: 'object',
  properties: {
    dry_run: {
      type: 'boolean',
      description:
        'Validate the saved project JSON and report whether it differs from editor memory without reloading it.',
    },
    include_generated_code:
      validateCurrentProjectJsonSchema.properties.include_generated_code,
  },
  additionalProperties: true,
};

const batchDeleteSceneVariablesSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    variable_names_or_paths: {
      type: 'array',
      items: { type: 'string' },
      description:
        'Scene variable names or nested paths to delete, for example ["OldScore", "State.Mode"]. Each root variable is reference-checked against scene events.',
    },
    dry_run: {
      type: 'boolean',
      description:
        'When true, report what would be deleted without modifying the scene.',
    },
    ignore_references: {
      type: 'boolean',
      description:
        'Default false. When false, variables whose root name appears in scene events are skipped instead of deleted.',
    },
  },
  required: ['scene_name', 'variable_names_or_paths'],
  additionalProperties: true,
};

const deleteObjectVariableSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    object_name: {
      type: 'string',
      description: 'Scene or global object whose object variable is deleted.',
    },
    variable_name_or_path:
      deleteSceneVariableSchema.properties.variable_name_or_path,
  },
  required: ['scene_name', 'object_name', 'variable_name_or_path'],
  additionalProperties: true,
};

const deleteInstanceVariableSchema = {
  type: 'object',
  properties: {
    scene_name: sceneNameSchema.properties.scene_name,
    instance_id: {
      type: 'string',
      description:
        'Short instance id from describe_instances. Prefer this when available.',
    },
    object_name: {
      type: 'string',
      description:
        'Object name used when instance_id is omitted. Targets the first matching instance unless instance_index is provided.',
    },
    instance_index: {
      type: 'number',
      description:
        'Zero-based index among initial instances of object_name. Defaults to 0.',
    },
    variable_name_or_path:
      deleteSceneVariableSchema.properties.variable_name_or_path,
  },
  required: ['scene_name', 'variable_name_or_path'],
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

const patchExtensionEventInstructionSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    function_name: extensionFunctionSchema.properties.function_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    event: patchSceneEventInstructionSchema.properties.event,
    event_id: patchSceneEventInstructionSchema.properties.event_id,
    event_path: patchSceneEventInstructionSchema.properties.event_path,
    instruction_kind:
      patchSceneEventInstructionSchema.properties.instruction_kind,
    instruction_type:
      patchSceneEventInstructionSchema.properties.instruction_type,
    object_name: patchSceneEventInstructionSchema.properties.object_name,
    parameters: patchSceneEventInstructionSchema.properties.parameters,
    include_serialized: {
      type: 'boolean',
      description:
        'When true, include serializedFunction and eventsAsText after the patch. Default false keeps the response compact.',
    },
  },
  required: [
    'extension_name',
    'function_name',
    'instruction_type',
    'parameters',
  ],
  additionalProperties: true,
};

const lintExtensionFunctionEventsSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    function_name: extensionFunctionSchema.properties.function_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    require_root_groups: {
      type: 'boolean',
      description:
        'Default true. When true, root extension function events that are not Groups are reported as warnings.',
    },
    include_generated_code: {
      type: 'boolean',
      description:
        'Default true. When true, run GDevelop extension JavaScript generation and syntax preflight.',
    },
  },
  required: ['extension_name', 'function_name'],
  additionalProperties: true,
};

const validateExtensionEventsJsonSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    function_name: extensionFunctionSchema.properties.function_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    function_type: extensionFunctionSchema.properties.function_type,
    sentence: extensionFunctionSchema.properties.sentence,
    parameters: extensionFunctionSchema.properties.parameters,
    parameters_mode: extensionFunctionSchema.properties.parameters_mode,
    events_json: extensionFunctionSchema.properties.events_json,
    require_root_groups:
      lintExtensionFunctionEventsSchema.properties.require_root_groups,
    include_generated_code:
      lintExtensionFunctionEventsSchema.properties.include_generated_code,
    summary_only: extensionFunctionSchema.properties.summary_only,
  },
  required: ['extension_name', 'function_name'],
  additionalProperties: true,
};

const replaceExtensionFunctionEventsFromFileSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    function_name: extensionFunctionSchema.properties.function_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    events_json_file:
      replaceSceneEventsFromFileSchema.properties.events_json_file,
    dry_run: replaceSceneEventsFromFileSchema.properties.dry_run,
    summary_only: extensionFunctionSchema.properties.summary_only,
    include_generated_code:
      lintExtensionFunctionEventsSchema.properties.include_generated_code,
  },
  required: ['extension_name', 'function_name', 'events_json_file'],
  additionalProperties: true,
};

const extensionPatchSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    patch: projectJsonPatchSchema.properties.patch,
    patch_file: projectJsonPatchSchema.properties.patch_file,
    scope: {
      type: 'string',
      description:
        'Optional scope for relative patch paths: extension, extension_object, extension_behavior, extension_function, or property.',
    },
    object_name: {
      type: 'string',
      description: 'Internal name of the events-based object.',
    },
    behavior_name: {
      type: 'string',
      description: 'Internal name of the events-based behavior.',
    },
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    function_name: extensionFunctionSchema.properties.function_name,
    property_name: {
      type: 'string',
      description: 'For property scope: internal property name.',
    },
    dry_run: scenePatchSchema.properties.dry_run,
    summary_only: scenePatchSchema.properties.summary_only,
    include_generated_code:
      lintExtensionFunctionEventsSchema.properties.include_generated_code,
  },
  required: ['extension_name'],
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
    function_name: {
      type: 'string',
      description:
        'Optional function name filter for inspect calls. When provided, only this behavior function is returned and serializedBehavior is omitted by default to avoid huge outputs.',
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
    function_name: {
      type: 'string',
      description:
        'Optional function name filter for inspect calls. When provided, only this object function is returned and serializedObject is omitted by default to avoid huge outputs.',
    },
    new_object_name: {
      type: 'string',
      description:
        'Optional new internal name for renaming the events-based object.',
    },
    full_name: {
      type: 'string',
      description: 'Display name shown in the editor/object picker.',
    },
    description: {
      type: 'string',
      description: 'Description shown in the editor/object picker.',
    },
    default_name: {
      type: 'string',
      description:
        'Default scene object name proposed when adding this prefab/custom object.',
    },
    is_rendered_in_3d: {
      type: 'boolean',
      description:
        'Maps to markAsRenderedIn3D. Controls whether the events-based object is treated as a 3D-rendered object.',
    },
    is_private: {
      type: 'boolean',
      description: 'Maps to setPrivate. Hides the object from public listings.',
    },
    is_inner_area_following_parent_size: {
      type: 'boolean',
      description:
        'Maps to markAsInnerAreaFollowingParentSize for responsive child layouting.',
    },
    is_text_container: {
      type: 'boolean',
      description:
        'Maps to markAsTextContainer so text-container actions can apply.',
    },
    is_animatable: {
      type: 'boolean',
      description: 'Maps to markAsAnimatable so object animations can apply.',
    },
    icon_url: {
      type: 'string',
      description: 'Icon URL/path shown in the editor.',
    },
    preview_icon_url: {
      type: 'string',
      description: 'Preview icon URL/path shown in the editor.',
    },
    area: {
      type: 'object',
      description:
        'Inner area bounds. Effective numeric fields: min_x, min_y, min_z, max_x, max_y, max_z.',
      properties: {
        min_x: { type: 'number' },
        min_y: { type: 'number' },
        min_z: { type: 'number' },
        max_x: { type: 'number' },
        max_y: { type: 'number' },
        max_z: { type: 'number' },
      },
      additionalProperties: false,
    },
    serialized_object: {
      type: 'object',
      description:
        'Complete serialized events-based object for advanced edits. The object is unserialized first, then object_name/new_object_name/full_name/description/default_name/flags/icons/area are applied afterward. Effective top-level serialized fields include name, fullName, description, defaultName, areaMinX/Y/Z, areaMaxX/Y/Z, objects, instances, layers, propertyDescriptors, eventsFunctions, variants, is3D, isAnimatable, isTextContainer, and isInnerAreaFollowingParentSize.',
      examples: [
        {
          name: 'HealthBarPrefab',
          fullName: 'Health bar prefab',
          description: 'Reusable health bar composed from child objects.',
          defaultName: 'HealthBar',
          areaMinX: 0,
          areaMinY: 0,
          areaMaxX: 96,
          areaMaxY: 12,
          objects: [
            {
              name: 'Fill',
              type: 'PanelSpriteObject::PanelSprite',
              variables: [],
              effects: [],
              behaviors: [],
            },
          ],
          instances: [
            {
              objectName: 'Fill',
              x: 0,
              y: 0,
            },
          ],
          eventsFunctions: [],
          propertyDescriptors: [],
          variants: [],
        },
      ],
      additionalProperties: true,
    },
    dry_run: {
      type: 'boolean',
      description:
        'Validate and summarize the final object without modifying the project. Uses the same unserialize/apply path as a real write, then rolls back.',
    },
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit function events and serializedObject from create/update or inspect responses.',
    },
    include_events: extensionInspectSchema.properties.include_events,
    include_serialized: extensionInspectSchema.properties.include_serialized,
  },
  required: ['extension_name', 'object_name'],
  additionalProperties: true,
};

const findExtensionEventsSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    function_name: extensionFunctionSchema.properties.function_name,
    event_path: eventTargetSchema.properties.event_path,
    ai_generated_event_id: eventTargetSchema.properties.ai_generated_event_id,
    event_type: findSceneEventsSchema.properties.event_type,
    group_name: eventTargetSchema.properties.group_name,
    action_type: eventTargetSchema.properties.action_type,
    condition_type: eventTargetSchema.properties.condition_type,
    parameter_contains: eventTargetSchema.properties.parameter_contains,
    text_contains: eventTargetSchema.properties.text_contains,
    limit: findSceneEventsSchema.properties.limit,
    summary_only: {
      type: 'boolean',
      description:
        'When true, omit serializedEvent from matches. New extension/project searches are compact by default.',
    },
    compact: findSceneEventsSchema.properties.compact,
    include_serialized: {
      type: 'boolean',
      description:
        'When true, include serializedEvent for each match. Default false for extension/project searches.',
    },
  },
  required: ['extension_name'],
  additionalProperties: true,
};

const findProjectEventsSchema = {
  type: 'object',
  properties: {
    scene_name: {
      type: 'string',
      description: 'Optional scene name to restrict scene-event search.',
    },
    extension_name: {
      type: 'string',
      description:
        'Optional extension name to restrict extension-event search.',
    },
    parent_kind: extensionFunctionSchema.properties.parent_kind,
    parent_name: extensionFunctionSchema.properties.parent_name,
    function_name: extensionFunctionSchema.properties.function_name,
    event_path: eventTargetSchema.properties.event_path,
    ai_generated_event_id: eventTargetSchema.properties.ai_generated_event_id,
    event_type: findSceneEventsSchema.properties.event_type,
    group_name: eventTargetSchema.properties.group_name,
    action_type: eventTargetSchema.properties.action_type,
    condition_type: eventTargetSchema.properties.condition_type,
    parameter_contains: eventTargetSchema.properties.parameter_contains,
    text_contains: eventTargetSchema.properties.text_contains,
    limit: {
      type: 'number',
      description: 'Maximum aggregate matches to return. Defaults to 100.',
    },
    summary_only: findExtensionEventsSchema.properties.summary_only,
    compact: findExtensionEventsSchema.properties.compact,
    include_serialized: findExtensionEventsSchema.properties.include_serialized,
  },
  additionalProperties: true,
};

const extractPrefabFromObjectSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    object_name: {
      type: 'string',
      description:
        'Internal name of the new events-based object prefab to create.',
    },
    source_kind: {
      type: 'string',
      description:
        'Source mode: scene_instances, scene_object, or extension_object. Defaults to scene_instances when scene_name is present, otherwise extension_object.',
    },
    scene_name: {
      type: 'string',
      description:
        'Scene name for source_kind scene_instances or scene_object.',
    },
    source_object_names: {
      type: 'array',
      items: { type: 'string' },
      description:
        'For source_kind scene_instances: scene/global object names whose initial instances are extracted into the prefab.',
    },
    source_extension_name: {
      type: 'string',
      description:
        'For source_kind extension_object: extension containing the source events-based object. Defaults to extension_name.',
    },
    source_object_name: {
      type: 'string',
      description:
        'For source_kind extension_object/scene_object: source object name to inspect/copy from.',
    },
    child_object_names: {
      type: 'array',
      items: { type: 'string' },
      description:
        'For extension_object/scene_object: child object names to extract. If omitted, all child objects are copied.',
    },
    replace_existing: {
      type: 'boolean',
      description:
        'Overwrite an existing target events-based object with object_name. Default false.',
    },
    normalize_origin: {
      type: 'boolean',
      description:
        'Default true. Subtract the extracted AABB min from child instances so the new prefab starts at 0,0,0.',
    },
    replace_in_scene_with_prefab_instance: {
      type: 'boolean',
      description:
        'For source_kind scene_instances: remove extracted scene instances and insert one instance of the new prefab at their old AABB origin.',
    },
    prefab_scene_object_name: {
      type: 'string',
      description:
        'Optional scene object name to use when replace_in_scene_with_prefab_instance is true.',
    },
    remove_scene_objects_when_unused: {
      type: 'boolean',
      description:
        'For scene migration: remove extracted scene object definitions when no initial instances of them remain.',
    },
    replace_in_source_with_prefab_instance: {
      type: 'boolean',
      description:
        'For source_kind extension_object/scene_object: replace extracted child instances in the source object with one child instance of the new prefab.',
    },
    prefab_child_object_name: {
      type: 'string',
      description:
        'Optional child object name to use in the source object when replace_in_source_with_prefab_instance is true.',
    },
    remove_extracted_children: {
      type: 'boolean',
      description:
        'For extension-object migration: remove extracted child object definitions from the source object when no child instances of them remain.',
    },
    dry_run: {
      type: 'boolean',
      description:
        'Validate and summarize the extraction/migration without modifying the project.',
    },
    summary_only: {
      type: 'boolean',
      description: 'Omit the full serializedObject from the response.',
    },
    full_name: extensionObjectSchema.properties.full_name,
    description: extensionObjectSchema.properties.description,
    default_name: extensionObjectSchema.properties.default_name,
    is_rendered_in_3d: extensionObjectSchema.properties.is_rendered_in_3d,
    is_private: extensionObjectSchema.properties.is_private,
    area: extensionObjectSchema.properties.area,
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
    new_property_name: {
      type: 'string',
      description: 'Optional new internal property name for renaming.',
    },
    property_type: {
      type: 'string',
      description:
        'Property type, for example Number, String, Boolean, Choice, Color, or Behavior.',
    },
    value: {
      type: 'string',
      description:
        'Default serialized value for the property, for example "10", "true", or a string default.',
    },
    label: {
      type: 'string',
      description: 'Display label shown in property editors.',
    },
    description: {
      type: 'string',
      description: 'Property description shown in the editor.',
    },
    measurement_unit: {
      type: 'string',
      description: 'Optional measurement unit shown next to numeric values.',
    },
    group: {
      type: 'string',
      description: 'Optional property group/category shown in the editor.',
    },
    is_hidden: {
      type: 'boolean',
      description: 'When true, hide this property in normal property editors.',
    },
    is_advanced: {
      type: 'boolean',
      description: 'When true, mark this as an advanced property.',
    },
    is_deprecated: {
      type: 'boolean',
      description: 'When true, mark this property deprecated.',
    },
    extra_info: {
      type: 'string',
      description:
        'Optional type-specific metadata, such as behavior type constraints.',
    },
    choices: {
      type: 'array',
      description:
        'Optional choice descriptors for Choice properties: [{ value, label }].',
      items: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          label: { type: 'string' },
        },
        additionalProperties: true,
      },
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

const customObjectRuntimeGeometrySchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    object_name: extensionObjectSchema.properties.object_name,
    parent_x: {
      type: 'number',
      description:
        'Optional parent custom-object scene X. When provided with parent_y, child scene positions and scene bounds are reported.',
    },
    parent_y: {
      type: 'number',
      description:
        'Optional parent custom-object scene Y. When provided with parent_x, child scene positions and scene bounds are reported.',
    },
    cursor_x: {
      type: 'number',
      description:
        'Optional local/custom-object-space cursor X to test against parent area and rendered child bounds.',
    },
    cursor_y: {
      type: 'number',
      description:
        'Optional local/custom-object-space cursor Y to test against parent area and rendered child bounds.',
    },
    cursor_scene_x: {
      type: 'number',
      description:
        'Optional scene/world cursor X. When parent_x is provided, MCP converts this to custom-object local cursor_x.',
    },
    cursor_scene_y: {
      type: 'number',
      description:
        'Optional scene/world cursor Y. When parent_y is provided, MCP converts this to custom-object local cursor_y.',
    },
    layer_name: {
      type: 'string',
      description:
        'Optional layer name attached to cursor scene coordinates for reporting. Camera/layer conversion should come from runtime tools such as run_frames.',
    },
  },
  required: ['extension_name', 'object_name'],
  additionalProperties: true,
};

const prefabPropertyBindingsSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    object_name: extensionObjectSchema.properties.object_name,
  },
  required: ['extension_name', 'object_name'],
  additionalProperties: true,
};

const bindChildSpriteResourcePropertySchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    object_name: extensionObjectSchema.properties.object_name,
    child_object_name: {
      type: 'string',
      description:
        'Child Sprite object whose frame image should use the property default resource.',
    },
    property_name: {
      type: 'string',
      description: 'Resource property descriptor on the events-based object.',
    },
    resource_name: {
      type: 'string',
      description:
        'Optional resource name to use. Defaults to the Resource property descriptor value.',
    },
    animation_name: {
      type: 'string',
      description:
        'Optional Sprite animation name to target. Omit to target the first matching frame.',
    },
    frame_index: {
      type: 'number',
      description:
        'Frame index to update when replace_all_frames is false. Defaults to 0.',
    },
    replace_all_frames: {
      type: 'boolean',
      description:
        'When true, replace every matching frame resource in the selected child Sprite animation(s).',
    },
    dry_run: scenePatchSchema.properties.dry_run,
  },
  required: [
    'extension_name',
    'object_name',
    'child_object_name',
    'property_name',
  ],
  additionalProperties: true,
};

const signalEmitActionSchema = {
  type: 'object',
  properties: {
    target_kind: {
      type: 'string',
      description:
        'Signal target: scene, object_instance, or picked_objects. Use scene for prefab-to-scene notifications, object_instance for scene-to-one-prefab commands, and picked_objects for scene-to-picked-prefabs commands. In extension event sheets, use only scene or object_instance.',
    },
    signal_name: {
      type: 'string',
      description:
        'Signal name string expression. Bare names such as Attack or CardSlot.Select are quoted automatically.',
    },
    payload: {
      type: 'string',
      description:
        'Optional string payload expression. Keep payloads small. Bare text is quoted automatically; use ToString(...) for numeric data. Inside onSignal, use GetArgumentAsString("Payload") or the fixed Payload parameter, not scene-only SignalPayload().',
    },
    object_name: {
      type: 'string',
      description: 'Target object list name for picked_objects targets.',
    },
    objects: {
      type: 'string',
      description:
        'Object list parameter for picked_objects targets; alias for object_name.',
    },
    instance_id: {
      description:
        'Object instance id expression for object_instance targets, for example Enemy.InstanceId() or SignalSenderInstanceId().',
    },
    object_group_name: {
      type: 'string',
      description:
        'Legacy field; object_group signal emit actions are no longer generated.',
    },
    target_scope: {
      type: 'string',
      description:
        'Optional scope guard: scene, extension_function, behavior_function, object_function, or async_function. Extension scopes reject picked_objects targets.',
    },
  },
  required: ['target_kind', 'signal_name'],
  additionalProperties: true,
};

const signalReceivedConditionSchema = {
  type: 'object',
  properties: {
    signal_name: {
      type: 'string',
      description:
        'Signal name string expression. Bare names such as Attack or CardSlot.Selected are quoted automatically.',
    },
    target_scope: {
      type: 'string',
      description:
        'Optional documentation-only scope hint. Signal received is valid only in scene and external scene event sheets. Prefabs receive signals with onSignal instead.',
    },
  },
  required: ['signal_name'],
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

const onSignalFunctionSchema = {
  type: 'object',
  properties: {
    extension_name: extensionNameSchema.properties.extension_name,
    parent_kind: {
      type: 'string',
      description:
        'Receiver kind: object. onSignal is not a free extension function.',
    },
    parent_name: extensionFunctionSchema.properties.parent_name,
    events_json: {
      ...extensionFunctionSchema.properties.events_json,
      description:
        'Serialized events for the onSignal lifecycle handler. Branch on the fixed SignalName parameter, read Payload through GetArgumentAsString("Payload") or the fixed Payload parameter, and do not use scene-only SignalPayload()/SignalSender* expressions here.',
    },
    dry_run: extensionFunctionSchema.properties.dry_run,
    summary_only: extensionFunctionSchema.properties.summary_only,
  },
  required: ['extension_name', 'parent_kind', 'parent_name'],
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
    name: 'gdevelop_get_static_data',
    description:
      'Read the project Static Data map. Omit placeholder_path for the full object, or pass an exact placeholder path such as {{cards.Sunflower.price}} to read one value.',
    inputSchema: staticDataReadSchema,
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
      'Inspect a project-specific extension. Defaults to full detail, but supports summary_only, list_functions_only, list_objects_only, list_behaviors_only, include_events, and include_serialized to avoid huge/truncated responses.',
    inputSchema: extensionInspectSchema,
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
    name: 'gdevelop_inspect_signal_usage',
    description:
      'Inspect signal emit actions, scene/external-scene Signal received conditions, and object onSignal handlers across the project, optionally filtered by signal name or extension scope.',
    inputSchema: inspectSignalUsageSchema,
  },
  {
    name: 'validate_current_project_json',
    description:
      'Validate the currently open in-memory project by serializing it, unserializing it through GDevelop, scanning events/resources, and preflighting generated extension JavaScript when enabled. This does not verify runtime gameplay semantics, object picking, or action side effects. Does not mutate or save.',
    inputSchema: validateCurrentProjectJsonSchema,
  },
  {
    name: 'generate-catalogs',
    description:
      'Regenerate .gdevelop/instructions-catalog.json, .gdevelop/settings-catalog.json, and .gdevelop/layout-catalog.json from the current local multi-file project sources. The call waits for all three files to be written and verified before returning. Accepts no inputs, writes only generated catalogs, and does not validate sources or reload editor memory. Call this after structural project-file changes, then read the refreshed catalogs before making dependent edits.',
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
      'Load the current local multi-file project from project.settings, regenerate all instruction, settings, and layout catalogs, reload the sources using the fresh instruction catalog, reconstruct the legacy game.json representation in memory from all referenced .settings, .layout, and .events files, then validate it through GDevelop and preflight generated extension JavaScript. valid:true proves structural/code-generation validity only; it does NOT verify runtime gameplay semantics, object picking, or action side effects. Accepts no inputs, writes only generated .gdevelop catalogs, does not reload editor memory, and reports the blocking file, error code, line, column, and source excerpt when available. Call this after direct project-file edits and require valid:true before reload_project, then runtime-test behavior-sensitive changes with a paused preview and run_frames.',
    inputSchema: noInputSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  {
    name: 'inspect_custom_object_runtime_geometry',
    description:
      'Inspect events-based object geometry for prefab coordinate debugging: parent/custom object area, estimated visible child bounds, child local positions, Sprite points/collision masks, and cursor hit-test hints.',
    inputSchema: customObjectRuntimeGeometrySchema,
  },
  {
    name: 'inspect_prefab_property_bindings',
    description:
      'Inspect events-based object public properties, Resource properties, child Sprite static frame resources, and function event references to warn when a Resource property is not actually used dynamically.',
    inputSchema: prefabPropertyBindingsSchema,
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
      'Return serializer-compatible GDevelop event JSON examples for add_scene_events.',
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
      'Return add_scene_events event_changes operation names and target requirements.',
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
        summary_only: eventValidationOptionsSchema.summary_only,
        errors_only: eventValidationOptionsSchema.errors_only,
        include_rendered_events:
          eventValidationOptionsSchema.include_rendered_events,
        include_normalized_json:
          eventValidationOptionsSchema.include_normalized_json,
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
    name: 'gdevelop_validate_extension_events_json',
    description:
      'Validate extension function events without modifying the project. With events_json, validates a replacement payload on a temporary extension copy using the target function metadata/scope; without events_json, lints the existing function events.',
    inputSchema: validateExtensionEventsJsonSchema,
  },
  {
    name: 'lint_scene_events',
    description:
      'Lint a scene event sheet for MCP authoring rules: mandatory semantic Groups at root, no JavaScript events unless explicitly allowed, likely multi-instance Create-without-ForEach, empty Group names, Group colors (flags Groups left at the default color and distinct Groups sharing the same color — each Group must have a distinct color), and scene timers compared with CompareTimer but never started with ResetTimer (always-false silent bug).',
    inputSchema: lintSceneEventsSchema,
  },
  {
    name: 'lint_extension_function_events',
    description:
      'Lint one project extension function for extension-scope validation errors, variable-parameter misuse, instructions that render with warning/deprecated styling in the function scope, ungrouped root events, and generated JavaScript/codegen hazards.',
    inputSchema: lintExtensionFunctionEventsSchema,
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
            'Default true. Omit verbose valueType discriminators and metadata flags. Set false only for deep metadata inspection.',
        },
        target_scope: {
          type: 'string',
          description:
            'Optional scope compatibility lens: scene, extension_function, behavior_function, object_function, or async_function. Results include eventScopes and targetScopeCompatibility so you can see whether a type is valid in that event sheet.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_get_instruction_metadata',
    description:
      'Return exact GDevelop action, condition, or expression metadata, including each stable parameterName, positional order/types/defaults, literalSyntax hints, and event-scope relevance.',
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
            'Default true. Return a trimmed result while keeping unique parameterName values, parameter types, and literal syntax. Set false for full metadata.',
        },
        target_scope: {
          type: 'string',
          description:
            'Optional scope compatibility lens: scene, extension_function, behavior_function, object_function, or async_function. The result includes eventScopes and targetScopeCompatibility so you can see whether this exact type is valid in that event sheet.',
        },
      },
      required: ['type', 'kind'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_action',
    description:
      "Build a correctly-formed ACTION instruction JSON from an instruction type + NAMED parameter values, so you do not hand-align parameter order, hidden code-only slots, or quoting. Pass parameters keyed by the metadata parameter NAME (or by index). Returns { instruction, parameters, warnings } — drop instruction into an event's actions array (or pass to add_scene_events). Discover the type/param names with gdevelop_get_instruction_metadata.",
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Exact action type, e.g. SetNumberVariable, Create.',
        },
        parameters: {
          type: 'object',
          description:
            'Map of metadata parameterName/name (or index) to value. Matching ignores case and punctuation. Numbers/operators/object names go in bare; string-expression literals are auto-quoted; code-only params are auto-filled.',
          additionalProperties: true,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_condition',
    description:
      "Build a correctly-formed CONDITION instruction JSON from an instruction type + NAMED parameter values (same as create_action but for conditions). Returns { instruction, parameters, warnings } for an event's conditions array.",
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Exact condition type, e.g. KeyPressed, CompareTimer.',
        },
        parameters: {
          type: 'object',
          description: 'Map of parameter NAME (or index) to value.',
          additionalProperties: true,
        },
      },
      required: ['type'],
      additionalProperties: false,
    },
  },
  {
    name: 'create_signal_emit_action',
    description:
      'Build a correctly-formed signal emit ACTION instruction JSON for scene, object_instance, or picked_objects targets. Use it for scene-to-prefab commands and prefab-to-scene notifications. Handles hidden currentScene, signalName quoting, string payload, and required emitter object parameter ordering.',
    inputSchema: signalEmitActionSchema,
  },
  {
    name: 'create_signal_received_condition',
    description:
      'Build a correctly-formed Signal received CONDITION instruction JSON for scene or external scene event sheets only. Use it for scene-level signal dispatchers; prefabs receive with onSignal. Handles hidden currentScene and signalName quoting.',
    inputSchema: signalReceivedConditionSchema,
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
    name: 'gdevelop_capabilities',
    description:
      'Return a categorized overview of the core GDevelop MCP tools by workflow (project state, reading, instruction discovery, creating objects/assets, authoring events, runtime verification, safety/persistence). Call this FIRST to discover what is available in one shot, instead of many tool searches.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'gdevelop_refresh_tool_catalog',
    description:
      'Return the current MCP tool catalog, permission gates, and capability categories in one read-only call. Use this after changing or reloading the GDevelop MCP server so clients can resync instead of guessing tool names.',
    inputSchema: emptyObjectSchema,
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
    name: 'get_tilemap_tiles',
    description:
      "Read a Tile map (TileMap::SimpleTileMap) instance's painted grid: returns map size, the raw tiles[y][x] grid (-1 = empty, else tileId = row*columnCount+col), and a decoded { id, flipX?, flipY? } view.",
    inputSchema: getTilemapTilesSchema,
  },
  {
    name: 'inspect_tilemap_palette',
    description:
      'List a Tile map tileset atlas as selectable tile ids with row/column/source-rect coordinates, so callers can choose ids visually instead of guessing.',
    inputSchema: inspectTilemapPaletteSchema,
  },
  {
    name: 'inspect_tilemap_collision',
    description:
      'Inspect a Tile map object collision setup as editable cells: reports native collision tile ids, blocked grid cells for an instance, and an ASCII mask (# = blocked, . = walkable).',
    inputSchema: inspectTilemapCollisionSchema,
  },
  {
    name: 'check_tilemap_walkability',
    description:
      'Run a grid pathability check through a Tile map collision mask from start {x,y} to goal {x,y}; returns whether a route exists plus the first blocking reason and reachable cells.',
    inputSchema: checkTilemapWalkabilitySchema,
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
    name: 'inspect_resource_images',
    description:
      'Inspect image resources with file paths, dimensions, and transparent-pixel bounds when Electron nativeImage can read the file. Use this for thin/transparent sprite or UI assets before hand-tuning positions.',
    inputSchema: inspectResourceImagesSchema,
  },
  {
    name: 'audit_project_asset_sources',
    description:
      'Check local project resources against allowed project-relative asset roots (default: assets). Reports resources outside those roots so projects can enforce original-asset-only workflows.',
    inputSchema: auditProjectAssetSourcesSchema,
  },
  {
    name: 'compare_image_files',
    description:
      'Compare a reference image and a current render/screenshot pixel-by-pixel, with optional crop regions and an optional diff heatmap PNG for 1:1 visual remake workflows.',
    inputSchema: compareImageFilesSchema,
  },
  {
    name: 'crop_scene_object_image',
    description:
      'Crop and nearest-neighbor zoom a screenshot/render around a scene initial instance by object name, with an optional bounds overlay for focused visual debugging.',
    inputSchema: cropSceneObjectImageSchema,
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
    name: 'search_behavior_store',
    description:
      'Search the COMMUNITY behavior registry (asset store) for behaviors — including ones not yet installed in the project. Returns each behavior\'s full behaviorType (e.g. "Flash::Flash") to pass to add_behavior, which installs the required extension automatically. Use this to find ready-made behaviors (jump, flash, health, platformer, draggable, screen-wrap, etc.) instead of writing events from scratch. For behaviors already in the project, prefer list_available_behaviors. Requires network access.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Space-separated search terms matched against behavior name/full name/description/category/extension/tags (all terms must match). Omit to browse.',
        },
        object_type: {
          type: 'string',
          description:
            'Optional object type (e.g. "Sprite") to only return behaviors compatible with it. Behaviors that apply to any object are always included.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of behaviors to return (default 20).',
        },
      },
      additionalProperties: false,
    },
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
      'Reload the current project from its disk files, wait for the editor to finish loading them, and regenerate the instruction, settings, and layout catalogs for local multi-file projects. This discards stale or unsaved in-memory editor changes. After editing project files directly, call this at least once before launch_preview so the preview and generated catalogs use the new disk sources.',
    inputSchema: emptyObjectSchema,
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
      'Inject simulated keyboard/mouse/touch input into a running preview so you can verify input-driven gameplay (movement, shooting, restart) end-to-end, not just autonomous logic. Press and release are separate events; hold a key by sending keyPressed without keyReleased. Returns inputState (the InputManager state after injecting) so you can confirm the game actually received the input — if a pressed key is missing from inputState.pressedKeyCodes, the window likely was not focused (try control_preview action:"focus"), which is different from a logic bug. Then use gdevelop_inspect_running_preview / capture_preview_screenshot to verify the effect. Launch a preview first.',
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
      'Launch or attach to a game preview and confirm the runtime debugger is ready by waiting for getStatus. By DEFAULT it previews the project\'s FIRST scene (firstLayout), independent of which scene tab is open in the editor; pass scene_name to preview a specific layout. New preview windows are opened through the same "Start Preview and Debugger" command used by the UI. With start_paused:true, success also requires the pause to be confirmed. The result reports requestedScene/expectedScene/actualScene and sets sceneMismatch:true when the running scene differs from what was requested. Returns success:false with failurePhase details if the window/debugger connects but the runtime stays unresponsive. By default it attaches to an already-running preview; pass force_new:true to always open a fresh window (when scene_name is given and the running preview is on another scene, a fresh one is launched on the requested scene).',
    inputSchema: launchPreviewSchema,
  },
  {
    name: 'run_frames',
    description:
      'ATOMIC runtime test: preflight the selected preview, inject inputs, step up to N frames, and return live or partial state. Pass objects plus include for bounded per-instance position, angle, force, variable, and behavior state in the same receipt. The receipt distinguishes completed, partial, failed, timeout, preflight-failed, and cleanup-failed outcomes with requested/stepped frames, failed frame, event/instruction ids when available, and cleanup status. auto_release runs in guaranteed cleanup even after event failure.',
    inputSchema: runFramesSchema,
  },
  {
    name: 'find_scene_events',
    description:
      'Find scene events by stable id, path, group name, event type, action type, condition type, parameter text, or serialized text.',
    inputSchema: findSceneEventsSchema,
  },
  {
    name: 'find_extension_events',
    description:
      'Find events inside project extension functions (free, behavior, and object functions) by stable id, path, group name, action/condition type, parameter text, or serialized text.',
    inputSchema: findExtensionEventsSchema,
  },
  {
    name: 'find_project_events',
    description:
      'Find matching events across all scenes and project extension functions. Optionally restrict by scene_name, extension_name, parent_kind, parent_name, or function_name.',
    inputSchema: findProjectEventsSchema,
  },
  {
    name: 'inspect_gameplay_rules',
    description:
      'Run higher-level heuristic checks over scene events, such as whether a health bar follows an enemy top or whether state-machine variables/states are mentioned.',
    inputSchema: inspectGameplayRulesSchema,
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
    name: 'inspect_scene_draw_order',
    description:
      'Return static initial-instance draw order by layer and zOrder, including bounds, so overlapping/zOrder issues can be diagnosed without a screenshot.',
    inputSchema: inspectSceneDrawOrderSchema,
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
  {
    name: 'initialize_project',
    description:
      'Create and open a NEW GDevelop project (it becomes the current project, so subsequent tools operate on it). By default an empty project with one scene; pass template_slug to start from an example. On desktop it is SAVED to local disk immediately (under the user\'s "GDevelop projects" folder; the saved path is returned as projectFile). NOTE: this replaces the currently open project — an unsaved open project is discarded without confirmation, so save first if needed.',
    inputSchema: {
      type: 'object',
      properties: {
        project_name: {
          type: 'string',
          description: 'Name for the new project.',
        },
        template_slug: {
          type: 'string',
          description:
            'Optional example/template slug to start from. Omit, or use "" / "none" / "empty", for a blank project with one scene.',
        },
        also_read_existing_events: {
          type: 'boolean',
          description:
            'When true (mainly for template-based projects), return the events of each created scene as text.',
        },
      },
      required: ['project_name'],
      additionalProperties: true,
    },
  },
  {
    name: 'create_scene',
    description: 'Create a new scene/layout in the current project.',
    inputSchema: {
      type: 'object',
      properties: {
        scene_name: {
          type: 'string',
          pattern: '^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$',
          description:
            'Name of the new scene/layout. Use camelCase or snake_case with no whitespace.',
        },
      },
      required: ['scene_name'],
      additionalProperties: true,
    },
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
    name: 'gdevelop_set_static_data',
    description:
      'Replace the project Static Data map with a complete JSON object in the open editor model. Prefer gdevelop_set_static_data_value for small focused edits.',
    inputSchema: staticDataReplaceSchema,
  },
  {
    name: 'gdevelop_set_static_data_value',
    description:
      'Set one Static Data value by exact placeholder path such as {{cards.Sunflower.price}}. Creates missing parent objects/arrays as needed.',
    inputSchema: staticDataValueSchema,
  },
  {
    name: 'gdevelop_delete_static_data_value',
    description:
      'Delete one Static Data value by exact placeholder path such as {{cards.Sunflower.price}}.',
    inputSchema: staticDataDeleteSchema,
  },
  {
    name: 'snapshot_project',
    description:
      'Take an in-memory snapshot of the WHOLE project (a coarse checkpoint for transaction-style safety). Call before a risky multi-step build; if a later step fails, restore_project_snapshot rolls back. Session-scoped (lost on reload) and NOT a disk save. Returns a snapshot_id.',
    inputSchema: {
      type: 'object',
      properties: {
        label: {
          type: 'string',
          description: 'Optional label for the snapshot.',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'restore_project_snapshot',
    description:
      'Roll the project back to a previous snapshot_project checkpoint (in memory). Open scene tabs may need reopening afterward; re-inspect to confirm. Does not touch disk.',
    inputSchema: {
      type: 'object',
      properties: {
        snapshot_id: {
          type: 'string',
          description: 'The snapshot_id returned by snapshot_project.',
        },
      },
      required: ['snapshot_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'apply_validated_project_json_patch',
    description:
      'Apply a controlled JSON patch to the currently open editor project. MCP creates an automatic in-memory snapshot, validates full GDevelop unserialization/events/generated extension JavaScript first, applies only if valid, optionally saves, and reports a compact semantic diff.',
    inputSchema: projectJsonPatchSchema,
  },
  {
    name: 'sync_editor_from_validated_project_json',
    description:
      'Reload the editor project model from the active project JSON file after validating the saved file through GDevelop. Creates an in-memory snapshot before replacing editor memory and warns when disk differs from current memory.',
    inputSchema: syncEditorFromValidatedProjectJsonSchema,
  },
  {
    name: 'replace_object_definition',
    description:
      'Replace or create a scene object with a complete serialized object definition. This explicitly allows changing the object type. Pass summary_only:true to omit the full serialized object from the response.',
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
      'Create or update a Sprite scene object from an existing image resource. Pass a full animations array to build a MULTI-frame / multi-animation Sprite in one call (otherwise a single default frame is bound). Optionally create an initial instance. Pass summary_only:true to omit the full serialized object from the response.',
    inputSchema: createSpriteObjectFromResourceSchema,
  },
  {
    name: 'create_text_object',
    description:
      'Create or update a TextObject::Text scene object with high-level text properties and optionally create an initial instance. Pass summary_only:true to omit the full serialized object from the response.',
    inputSchema: createTextObjectSchema,
  },
  {
    name: 'add_or_update_resource',
    description:
      'Add or update a project resource such as a local PNG image resource with name, file, and kind.',
    inputSchema: addOrUpdateResourceSchema,
  },
  {
    name: 'replace_project_resource',
    description:
      "Replace an EXISTING resource's file in place (e.g. swap a generated placeholder for finished art under the same name) so every Sprite frame / reference that uses the name picks up the new file automatically. Requires the resource to already exist; reports which scene objects reference it. A running preview needs a fresh launch / hot reload to show the new pixels.",
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Existing resource name to repoint.',
        },
        file: {
          type: 'string',
          description:
            'New file path (project-relative recommended) the resource should point at.',
        },
      },
      required: ['name', 'file'],
      additionalProperties: true,
    },
  },
  {
    name: 'generate_placeholder_asset',
    description:
      'Generate a placeholder asset on disk and register it as a project resource, so a from-scratch playable demo can be built entirely through MCP. Images: a solid rectangle, a SHAPE (circle/ellipse/triangle/diamond), and/or a vertical 2-color GRADIENT (color → color2). Sounds: a WAV with a chosen waveform (sine/square/saw/triangle/noise) and optional ADSR envelope. Replace with real art/audio later by overwriting the file and re-importing the same name.',
    inputSchema: generatePlaceholderAssetSchema,
  },
  {
    name: 'render_scene_to_png',
    description:
      'Statically render a scene LAYOUT to a PNG without running the game: one colored, positioned box per initial instance (sized to the object/instance size, colored stably per object name). Use this to verify object placement and layout — especially when a live preview is unavailable (throttled/occluded window) — without launching anything. It is a schematic, not pixel-accurate art; for final visuals use capture_preview_screenshot on a running preview.',
    inputSchema: renderSceneToPngSchema,
  },
  {
    name: 'set_sprite_animations',
    description:
      'Replace a Sprite object animation list with named animations, directions, frames, origin/center points, custom points, and collision masks. Pass summary_only:true to omit the full serialized object from the response.',
    inputSchema: setSpriteAnimationsSchema,
  },
  {
    name: 'slice_sprite_sheet',
    description:
      'Slice one sprite-sheet PNG into a grid of individual frame images (cut on disk with Electron nativeImage), register each frame as an image resource, and bind them as a single Sprite animation. Specify the grid with frame_width+frame_height OR columns+rows. Use this to turn a downloaded sheet into a usable walk/explosion/idle animation in one call.',
    inputSchema: sliceSpriteSheetSchema,
  },
  {
    name: 'bind_sprite_animations_from_directory',
    description:
      'Scan a unit asset directory (for example Idle/Run/Attack subfolders), register image resources, and bind them as Sprite animations with frame timing and loop settings.',
    inputSchema: bindSpriteAnimationsFromDirectorySchema,
  },
  {
    name: 'create_tilemap_object',
    description:
      'Create the built-in Tile map object (TileMap::SimpleTileMap) from a tileset atlas image: sets atlasImage + tile_size and computes the tileset columns/rows from the image. Optionally creates an instance and paints an initial grid. Use set_tilemap_tiles to paint tiles. (Tileset config applies inside the running editor; the per-instance tile grid works everywhere.)',
    inputSchema: createTilemapObjectSchema,
  },
  {
    name: 'set_tilemap_tiles',
    description:
      'Paint / clear tiles on a Tile map (TileMap::SimpleTileMap) instance. Writes the per-instance grid: tiles are tiles[y][x], empty = -1, a tile id = row*columnCount+col into the tileset (optionally flipped). Supports resizing (map_width/map_height), a rectangular fill, individual { x, y, tile } placements, clear_all, and layer opacity. Address a tile by id, or by { col, row } when tileset_columns is known.',
    inputSchema: setTilemapTilesSchema,
  },
  {
    name: 'set_tilemap_collision_tiles',
    description:
      'Set the Tile map object collision tile ids using its native tilesWithHitBox property, so painted cells using those tile ids become solid. Accepts tile_ids or tiles_with_hit_box.',
    inputSchema: setTilemapCollisionTilesSchema,
  },
  {
    name: 'bulk_edit_scene_assets',
    description:
      'Batch import resources, create/replace scene objects, bind Sprite animations, add behaviors, declare scene/global/object variables, place 2D instances, AND add scene events for one scene — in one call. Applied in order: resources → objects → sprite animations → behaviors → variables → instances → events. Events go through the same validation + lint as add_scene_events. Use for initial scene setup to drastically reduce single-tool round-trips.',
    inputSchema: bulkEditSceneAssetsSchema,
  },
  {
    name: 'add_behavior',
    description:
      'Add a behavior to an object. Requires behavior_type (the internal type). Use list_available_behaviors for built-in/installed behaviors, or search_behavior_store for community ones. If behavior_type belongs to a community extension that is not installed yet, it is installed automatically (along with any required behaviors). Then configure it without events via inspect_behavior_properties / change_behavior_property.',
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
      'Place, move, update, or erase 2D object instances. Per-instance you can set align ("center"/"bottom center"/...) to position by scene resolution without computing coordinates, and initially_hidden to start it not drawn. Call describe_instances first to get existing instance ids. Pass summary_only:true to omit the full serialized instance list from the response (it grows with every instance in the scene).',
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
      'Insert or patch raw serializer-compatible GDevelop events using events_json or event_changes. Supports revision guards, validation, and dry-run simulation.',
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
    name: 'patch_scene_event_instruction',
    description:
      'Patch one action or condition inside a scene event by stable event id/path plus instruction type, avoiding brittle raw /events/... JSON paths for common parameter edits.',
    inputSchema: patchSceneEventInstructionSchema,
  },
  {
    name: 'patch_extension_event_instruction',
    description:
      'Patch one action or condition inside an extension function event by stable event id/path plus instruction type, then validate generated extension JavaScript before keeping the edit.',
    inputSchema: patchExtensionEventInstructionSchema,
  },
  {
    name: 'replace_javascript_event_code',
    description:
      'Replace the inline code of one existing JavaScript event by stable event id/path, without replacing the whole parent event.',
    inputSchema: replaceJavascriptEventCodeSchema,
  },
  {
    name: 'attach_object_to_object_top',
    description:
      'Add a high-level follow event that keeps one object centered above another object top, useful for health bars/nameplates without hand-written X()-40/Y()-38 formulas.',
    inputSchema: attachObjectToObjectTopSchema,
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
      'Replace one scene event sheet from a local events JSON file after GDevelop validation. Use this instead of inlining very large event JSON. Rejects structural mistakes that would silently lose data (e.g. Or/And/Not children under the wrong key) and reports subInstructionsPreserved as a write-back check. Pass dry_run:true to validate + render the result without writing.',
    inputSchema: replaceSceneEventsFromFileSchema,
  },
  {
    name: 'replace_extension_function_events_from_file',
    description:
      'Replace a free/behavior/object extension function event body from a local events JSON file, using the active project internally. Validates extension scope and generated JavaScript before applying; dry_run validates without writing.',
    inputSchema: replaceExtensionFunctionEventsFromFileSchema,
  },
  {
    name: 'add_or_edit_variable',
    description:
      'Add or edit ONE global, scene, object, or behavior variable. To declare MANY variables at once (e.g. an object with hp/points/speed), prefer bulk_edit_scene_assets with its variables array (supports scope "scene"/"global"/"object") — one call instead of N.',
    inputSchema: variableSchema,
  },
  {
    name: 'delete_scene_variable',
    description:
      'Delete one scene variable by name or nested path using the scene variable container, without applying a raw serialized scene patch.',
    inputSchema: deleteSceneVariableSchema,
  },
  {
    name: 'batch_delete_scene_variables',
    description:
      'Delete multiple scene variables or nested paths in one call, with conservative scene-event reference checking before deletion.',
    inputSchema: batchDeleteSceneVariablesSchema,
  },
  {
    name: 'delete_object_variable',
    description:
      'Delete one object variable by name or nested path from a scene/global object, without replacing the whole object definition.',
    inputSchema: deleteObjectVariableSchema,
  },
  {
    name: 'delete_instance_variable',
    description:
      'Delete one initial instance variable by instance id or object/index, so per-instance initialVariables are not missed.',
    inputSchema: deleteInstanceVariableSchema,
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
      'Create or update a free, behavior, or object events function inside an extension, including type, metadata, parameters, sentence placeholder validation, events_json, extension-scope linting, and generated JavaScript preflight.',
    inputSchema: extensionFunctionSchema,
  },
  {
    name: 'gdevelop_create_or_update_on_signal',
    description:
      'Create or update the reserved object onSignal lifecycle function in an extension. Use it for prefab signal receivers. GDevelop maintains the fixed Object, SignalName, and Payload parameters; inside onSignal, branch on SignalName and read Payload directly.',
    inputSchema: onSignalFunctionSchema,
  },
  {
    name: 'apply_validated_extension_patch',
    description:
      'Apply a focused JSON patch inside one project extension, events-based object/behavior, function, or property descriptor. Uses a temporary extension copy for GDevelop unserialization and generated-code validation before touching the live extension.',
    inputSchema: extensionPatchSchema,
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
      'Create or update an events-based object inside an extension, including metadata, 2D/3D flags, default name, inner area bounds, and advanced serialized_object. Supports dry_run validation.',
    inputSchema: extensionObjectSchema,
  },
  {
    name: 'gdevelop_delete_extension_object',
    description: 'Delete an events-based object inside an extension.',
    inputSchema: extensionObjectSchema,
  },
  {
    name: 'gdevelop_extract_prefab_from_object',
    description:
      'Extract existing scene instances or extension-object child objects into a new reusable events-based object prefab, with optional dry-run and explicit migration/replacement flags.',
    inputSchema: extractPrefabFromObjectSchema,
  },
  {
    name: 'gdevelop_create_or_update_extension_property',
    description:
      'Create or update an events-based behavior/object property inside an extension, including type, default value, label, description, choices, and flags.',
    inputSchema: extensionPropertySchema,
  },
  {
    name: 'bind_child_sprite_resource_property',
    description:
      'Best-effort helper for events-based object Resource properties and Sprite children. It updates the selected child Sprite frame resource to the property default and reads back bindings; for Sprite it reports that this is a static default, not a true dynamic per-instance binding.',
    inputSchema: bindChildSpriteResourcePropertySchema,
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
      'Run a GDevelop command palette command by name. SAVE_PROJECT is special-cased to await completion and return verified persistence evidence. Other commands report launch only. CLOSE_PREVIEW is not a command; use save_and_relaunch_preview_paused for stale preview cleanup.',
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
      'Save the current project, await completion, then compare canonical editor and disk hashes. Returns project path, timestamps, dirty counts, disk write evidence, hashesMatch, and a reason distinguishing saved, nothing changed, not marked dirty, save failure, and verification failure.',
    inputSchema: emptyObjectSchema,
  },
  {
    name: 'save_and_relaunch_preview_paused',
    description:
      "Save with persistence evidence, await stale preview/window cleanup, then launch a fresh paused debug preview with retry and exponential backoff. Reports requested, attempted, and confirmed pause states plus every launch attempt and a fallback recovery workflow. By default previews the project's first scene; pass scene_name for a specific layout.",
    inputSchema: saveAndRelaunchPreviewPausedSchema,
  },
];

const toolUsageExamples: { [string]: Array<Object> } = {
  'generate-catalogs': [
    {
      description:
        'Regenerate and verify all three project-source catalogs after structural file changes.',
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
  gdevelop_refresh_tool_catalog: [
    {
      description:
        'Return the current GDevelop MCP tool catalog and capability categories after a reload.',
      arguments: {},
    },
  ],
  gdevelop_capabilities: [
    {
      description:
        'List the curated tool categories before choosing a GDevelop MCP workflow.',
      arguments: {},
    },
  ],
  reload_project: [
    {
      description:
        'Load direct project-file edits into the editor before launching a preview.',
      arguments: {},
    },
  ],
  create_signal_emit_action: [
    {
      description: 'Emit a scene signal with a string payload.',
      arguments: {
        target_kind: 'scene',
        signal_name: 'Attack',
        payload: 'heavy',
      },
    },
    {
      description:
        'Scene event sends a command to the currently picked CardSlot prefab instance. Put the returned instruction in the event actions array.',
      arguments: {
        target_kind: 'object_instance',
        instance_id: 'CardSlot.InstanceId()',
        signal_name: 'CardSlot.Select',
        payload: 'VariableString(SelectedCardId)',
      },
    },
    {
      description:
        'Prefab onSignal/object function emits a reply back to the scene. In object_function scope, scene and object_instance targets keep the prefab decoupled from scene object names.',
      arguments: {
        target_kind: 'scene',
        target_scope: 'object_function',
        signal_name: 'CardSlot.Selected',
        payload: 'GetArgumentAsString("Payload")',
      },
    },
    {
      description:
        'Emit a reply to one object instance by id, using a signal expression as the target id.',
      arguments: {
        target_kind: 'object_instance',
        instance_id: 'SignalSenderInstanceId()',
        signal_name: 'Attack.Reply',
        payload: 'Blocked',
      },
    },
    {
      description: 'Emit a signal to currently picked object instances.',
      arguments: {
        target_kind: 'picked_objects',
        objects: 'Enemy',
        signal_name: 'EnemyHit',
        payload: 'SignalPayload()',
      },
    },
  ],
  create_signal_received_condition: [
    {
      description: 'Create a scene-level signal received condition.',
      arguments: {
        signal_name: 'Attack',
      },
    },
    {
      description:
        'Scene receives a prefab reply. Put the returned condition in a scene/external-scene event, then use SignalPayload(), SignalSenderObjectName(), and SignalSenderInstanceId() in its sub-events/actions.',
      arguments: {
        signal_name: 'CardSlot.Selected',
        target_scope: 'scene',
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
  gdevelop_get_static_data: [
    {
      description: 'Read the full Static Data object.',
      arguments: {},
    },
    {
      description: 'Read one Static Data value by placeholder path.',
      arguments: {
        placeholder_path: '{{cards.Sunflower.price}}',
      },
    },
  ],
  gdevelop_set_static_data: [
    {
      description: 'Replace the full Static Data object.',
      arguments: {
        static_data: {
          cards: {
            Sunflower: {
              name: 'Sunflower',
              price: 50,
              canUse: true,
            },
          },
        },
      },
    },
  ],
  gdevelop_set_static_data_value: [
    {
      description: 'Set one numeric Static Data value.',
      arguments: {
        placeholder_path: '{{cards.Sunflower.price}}',
        value: 50,
      },
    },
    {
      description:
        'Set one object Static Data value from JSON text when the MCP client cannot pass a nested value directly.',
      arguments: {
        placeholder_path: '{{cards.Sunflower}}',
        value_json: '{"name":"Sunflower","price":50,"canUse":true}',
      },
    },
  ],
  gdevelop_delete_static_data_value: [
    {
      description: 'Delete one Static Data value.',
      arguments: {
        placeholder_path: '{{cards.Sunflower.previewObjectName}}',
      },
    },
  ],
  initialize_project: [
    {
      description: 'Create and open a new, empty project.',
      arguments: { project_name: 'My Game' },
    },
    {
      description: 'Create a new project starting from an example/template.',
      arguments: { project_name: 'My Platformer', template_slug: 'platformer' },
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
  slice_sprite_sheet: [
    {
      description:
        'Slice a 6-column x 1-row walk sheet into 6 frames and bind them as a "Walk" animation on the Player object.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        sheet_file: 'assets/player_walk.png',
        animation_name: 'Walk',
        columns: 6,
        rows: 1,
      },
    },
    {
      description:
        'Slice by fixed 32x32 cells (grid size inferred from the sheet), capping at the first 8 frames.',
      arguments: {
        object_name: 'Explosion',
        sheet_file: 'assets/explosion_sheet.png',
        animation_name: 'Boom',
        frame_width: 32,
        frame_height: 32,
        frame_count: 8,
      },
    },
  ],
  bind_sprite_animations_from_directory: [
    {
      description:
        'Bind Idle/Run/Attack subfolders from a unit asset directory as Sprite animations.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Warrior',
        directory: 'assets/Warrior',
        create_object: true,
        frame_duration: 0.08,
        loop: true,
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
  set_tilemap_tiles: [
    {
      description:
        'Paint two solid wall tiles into an existing Tile map instance.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundTilemap',
        tiles: [{ x: 4, y: 8, tile: 5 }, { x: 5, y: 8, tile: 5 }],
        summary_only: true,
      },
    },
  ],
  inspect_tilemap_palette: [
    {
      description:
        'List tile ids and source rectangles for a tileset atlas before painting.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundTilemap',
      },
    },
  ],
  set_tilemap_collision_tiles: [
    {
      description:
        'Mark tile id 5 as solid using the Tile map native collision setting.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundTilemap',
        tile_ids: [5],
      },
    },
  ],
  inspect_tilemap_collision: [
    {
      description:
        'Show which painted cells are blocked by native Tile map collision tiles.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundTilemap',
      },
    },
  ],
  check_tilemap_walkability: [
    {
      description:
        'Check whether a player can walk from one tile cell to another without crossing solid tiles.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundTilemap',
        start: { x: 0, y: 10 },
        goal: { x: 18, y: 10 },
      },
    },
  ],
  inspect_scene_draw_order: [
    {
      description:
        'Check which instances draw above others by layer and zOrder.',
      arguments: {
        scene_name: 'Level1',
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
  add_scene_events: [
    {
      description:
        'Append a serialized event array directly. aiGeneratedEventId values in the events are preserved.',
      arguments: {
        scene_name: 'Level1',
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Comment',
            aiGeneratedEventId: 'intro-comment',
            comment: 'Initialize the level state.',
          },
        ],
      },
    },
    {
      description:
        'Insert events after a target event using event_changes with a real JSON array, not a JSON string.',
      arguments: {
        scene_name: 'Level1',
        event_changes: [
          {
            operation_name: 'insert_after_event',
            operation_target_event: 'intro-comment',
            generated_events: [
              {
                type: 'BuiltinCommonInstructions::Comment',
                aiGeneratedEventId: 'after-intro-comment',
                comment: 'Spawn the first wave.',
              },
            ],
          },
        ],
      },
    },
    {
      description:
        'Append a standard event that declares and uses an event-local variable.',
      arguments: {
        scene_name: 'Level1',
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            aiGeneratedEventId: 'local-damage-example',
            variables: [
              {
                name: 'DamageThisTick',
                type: 'number',
                value: 0,
              },
            ],
            conditions: [
              {
                type: { value: 'SceneJustBegins' },
                parameters: [''],
              },
            ],
            actions: [
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['DamageThisTick', '=', '25'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['Score', '+', 'Variable(DamageThisTick)'],
              },
            ],
          },
        ],
      },
    },
    {
      description:
        'Add a grouped scene signal receiver. This is the scene side of a prefab signal contract: receive CardSlot.Selected, read SignalPayload(), and store it in a scene variable.',
      arguments: {
        scene_name: 'Level1',
        event_changes: [
          {
            operation_name: 'insert_at_end',
            undeclared_variables: [
              { name: 'SelectedCardId', type: 'string', value: '' },
            ],
            generated_events: [
              {
                type: 'BuiltinCommonInstructions::Group',
                aiGeneratedEventId: 'signal-dispatchers',
                name: 'Signal dispatchers',
                folded: false,
                colorR: 90,
                colorG: 140,
                colorB: 230,
                events: [
                  {
                    type: 'BuiltinCommonInstructions::Standard',
                    aiGeneratedEventId: 'receive-card-slot-selected',
                    conditions: [
                      {
                        type: { value: 'SignalReceived' },
                        parameters: ['', '"CardSlot.Selected"'],
                      },
                    ],
                    actions: [
                      {
                        type: { value: 'SetStringVariable' },
                        parameters: ['SelectedCardId', '=', 'SignalPayload()'],
                      },
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
        summary_only: true,
      },
    },
  ],
  validate_current_project_json: [
    {
      description:
        'Validate the open editor project before or after risky generated edits.',
      arguments: {
        include_generated_code: true,
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
  apply_validated_project_json_patch: [
    {
      description:
        'Patch one scene through the full-project validator, with paths relative to that scene.',
      arguments: {
        scope: 'scene',
        scene_name: 'Level1',
        patch: [{ op: 'replace', path: '/name', value: 'LevelOne' }],
        dry_run: true,
        summary_only: true,
      },
    },
    {
      description:
        'Patch a Resource property inside an events-based object and save only after validation passes.',
      arguments: {
        scope: 'extension_object',
        extension_name: 'PlantCards',
        object_name: 'PlantCardSlot',
        patch: [
          {
            op: 'replace',
            path: '/propertyDescriptors/0/value',
            value: 'SunflowerCard',
          },
        ],
        save: true,
        summary_only: true,
      },
    },
  ],
  sync_editor_from_validated_project_json: [
    {
      description:
        'Validate the active project file on disk and report whether reloading it would overwrite editor memory.',
      arguments: {
        dry_run: true,
      },
    },
  ],
  replace_extension_function_events_from_file: [
    {
      description:
        'Replace a large events-based object function from a local JSON file without inlining the event array.',
      arguments: {
        extension_name: 'PlantCards',
        parent_kind: 'object',
        parent_name: 'PlantCardSlot',
        function_name: 'Handle',
        events_json_file: 'D:/tmp/PlantCardSlot_Handle.events.json',
        summary_only: true,
      },
    },
  ],
  apply_validated_extension_patch: [
    {
      description:
        'Patch an events-based object area on a temporary extension copy first.',
      arguments: {
        extension_name: 'PlantCards',
        scope: 'extension_object',
        object_name: 'PlantCardSlot',
        patch: [
          { op: 'replace', path: '/areaMinX', value: 0 },
          { op: 'replace', path: '/areaMinY', value: 0 },
          { op: 'replace', path: '/areaMaxX', value: 105 },
          { op: 'replace', path: '/areaMaxY', value: 67 },
        ],
        dry_run: true,
        summary_only: true,
      },
    },
  ],
  inspect_custom_object_runtime_geometry: [
    {
      description:
        'Inspect parent area versus visible child bounds to debug IsCursorOnObject on a prefab.',
      arguments: {
        extension_name: 'PlantCards',
        object_name: 'PlantCardSlot',
        parent_x: 320,
        parent_y: 160,
        cursor_scene_x: 440,
        cursor_scene_y: 200,
        layer_name: 'HUD',
      },
    },
  ],
  inspect_prefab_property_bindings: [
    {
      description:
        'Check whether Resource properties are static child defaults or actually used in object function events.',
      arguments: {
        extension_name: 'PlantCards',
        object_name: 'PlantCardSlot',
      },
    },
  ],
  bind_child_sprite_resource_property: [
    {
      description:
        'Use a Resource property default as the static child Sprite frame resource and read back the binding audit.',
      arguments: {
        extension_name: 'PlantCards',
        object_name: 'PlantCardSlot',
        child_object_name: 'MousePreview',
        property_name: 'MousePreviewSpriteImage',
        animation_name: 'Default',
        frame_index: 0,
      },
    },
  ],
  patch_scene_event_instruction: [
    {
      description:
        'Patch one action by stable event id instead of using a fragile raw /events/... JSON path.',
      arguments: {
        scene_name: 'Level1',
        event_id: 'health-follow',
        instruction_kind: 'action',
        instruction_type: 'SetX',
        object_name: 'HealthBar',
        parameters: ['HealthBar', '=', 'Enemy.CenterX()-HealthBar.Width()/2'],
        summary_only: true,
      },
    },
  ],
  patch_extension_event_instruction: [
    {
      description:
        'Patch one extension-function action by stable event id, then validate the generated extension JavaScript.',
      arguments: {
        extension_name: 'GameplayLogic',
        function_name: 'AddSun',
        event_id: 'add-sun-count',
        instruction_kind: 'action',
        instruction_type: 'SetNumberVariable',
        parameters: ['LocalSunCount', '+', '1'],
      },
    },
  ],
  lint_extension_function_events: [
    {
      description:
        'Validate one extension function before saving or launching preview.',
      arguments: {
        extension_name: 'GameplayLogic',
        function_name: 'AddSun',
      },
    },
  ],
  replace_javascript_event_code: [
    {
      description:
        'Replace only the inline code of an existing JavaScript event.',
      arguments: {
        scene_name: 'Level1',
        event_id: 'level-script',
        code_string:
          'const dt = runtimeScene.getElapsedTime() / 1000;\\nruntimeScene.getVariables().get("Elapsed").add(dt);',
        summary_only: true,
      },
    },
  ],
  attach_object_to_object_top: [
    {
      description:
        'Keep a health bar centered above an enemy without manually computing X/Y formulas.',
      arguments: {
        scene_name: 'Level1',
        follower_object_name: 'EnemyHealthBar',
        target_object_name: 'Enemy',
        y_offset: -4,
        event_id: 'enemy-healthbar-follow',
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
  inspect_resource_images: [
    {
      description:
        'Inspect image dimensions and transparent-pixel bounds for a health bar sprite.',
      arguments: {
        resource_names: ['EnemyHealthBar.png'],
      },
    },
  ],
  audit_project_asset_sources: [
    {
      description:
        'Verify every local resource comes from the project assets folder.',
      arguments: {
        allowed_roots: ['assets'],
      },
    },
  ],
  compare_image_files: [
    {
      description:
        'Compare a current preview screenshot against a reference and write a diff heatmap.',
      arguments: {
        reference_file: 'assets/reference.png',
        actual_file: 'captures/current.png',
        threshold: 16,
        output_heatmap_file: 'captures/diff-heatmap.png',
      },
    },
  ],
  crop_scene_object_image: [
    {
      description: 'Crop and zoom a health bar from a full preview screenshot.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'EnemyHealthBar',
        source_file: 'captures/current.png',
        output_file: 'captures/EnemyHealthBar-4x.png',
        padding: 12,
        zoom: 4,
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
  search_behavior_store: [
    {
      description:
        'Find a ready-made "flash on hit" behavior in the community store, then add it with add_behavior using the returned behaviorType.',
      arguments: { query: 'flash blink' },
    },
    {
      description: 'Find Sprite-compatible health/lives behaviors.',
      arguments: { query: 'health lives', object_type: 'Sprite' },
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
  gdevelop_inspect_extension: [
    {
      description:
        'Inspect only extension functions without dumping every serialized object/event tree.',
      arguments: {
        extension_name: 'GameplayUI',
        list_functions_only: true,
      },
    },
    {
      description:
        'Return a compact extension summary when the full inspect output is too large.',
      arguments: {
        extension_name: 'GameplayUI',
        summary_only: true,
      },
    },
  ],
  gdevelop_inspect_extension_function: [
    {
      description:
        'Inspect a compact structured view of one extension function without duplicated eventsAsText/eventsJson/serializedFunction.',
      arguments: {
        extension_name: 'GameplayLogic',
        function_name: 'AddSun',
        compact: true,
      },
    },
  ],
  gdevelop_create_or_update_extension_function: [
    {
      description:
        'Use an event-local variable when working with a variable function parameter.',
      arguments: {
        extension_name: 'GameplayLogic',
        function_name: 'AddSun',
        function_type: 'action',
        sentence: 'Add sun to _PARAM1_',
        parameters: [
          {
            name: 'SunCountVariable',
            type: 'variable',
            description: 'Variable argument that stores the sun count',
          },
        ],
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            aiGeneratedEventId: 'add-sun-count',
            variables: [{ name: 'LocalSunCount', type: 'number', value: 0 }],
            conditions: [],
            actions: [
              {
                type: { value: 'CopyArgumentToVariable2' },
                parameters: ['"SunCountVariable"', 'LocalSunCount'],
              },
              {
                type: { value: 'SetNumberVariable' },
                parameters: ['LocalSunCount', '+', '1'],
              },
              {
                type: { value: 'CopyVariableToArgument2' },
                parameters: ['"SunCountVariable"', 'LocalSunCount'],
              },
            ],
          },
        ],
        summary_only: true,
      },
    },
  ],
  gdevelop_create_or_update_on_signal: [
    {
      description:
        'Create or update an events-based object onSignal lifecycle function. Branch on the fixed SignalName parameter and read Payload through GetArgumentAsString("Payload") or the fixed Payload parameter; scene-only SignalPayload() is not available inside onSignal.',
      arguments: {
        extension_name: 'Cards',
        parent_kind: 'object',
        parent_name: 'CardSlot',
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            aiGeneratedEventId: 'card-slot-select-signal',
            conditions: [
              {
                type: { value: 'CompareArgumentAsString' },
                parameters: ['"SignalName"', '=', '"CardSlot.Select"'],
              },
            ],
            actions: [
              {
                type: { value: 'SetStringObjectVariable' },
                parameters: [
                  'Object',
                  'SelectedCardId',
                  '=',
                  'GetArgumentAsString("Payload")',
                ],
              },
              {
                type: { value: 'EmitSceneSignal' },
                parameters: [
                  '',
                  '"CardSlot.Selected"',
                  'GetArgumentAsString("Payload")',
                ],
              },
            ],
          },
        ],
        summary_only: true,
      },
    },
    {
      description:
        'Create a prefab reset handler. The scene can emit CardSlot.Reset to one instance or picked CardSlot instances without knowing the prefab children.',
      arguments: {
        extension_name: 'Cards',
        parent_kind: 'object',
        parent_name: 'CardSlot',
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            aiGeneratedEventId: 'card-slot-reset-signal',
            conditions: [
              {
                type: { value: 'CompareArgumentAsString' },
                parameters: ['"SignalName"', '=', '"CardSlot.Reset"'],
              },
            ],
            actions: [
              {
                type: { value: 'SetStringObjectVariable' },
                parameters: ['Object', 'SelectedCardId', '=', '""'],
              },
            ],
          },
        ],
        dry_run: true,
        summary_only: true,
      },
    },
  ],
  gdevelop_validate_extension_events_json: [
    {
      description:
        'Validate a replacement extension function event body without mutating the live extension.',
      arguments: {
        extension_name: 'GameplayLogic',
        function_name: 'AddSun',
        function_type: 'action',
        sentence: 'Add sun to _PARAM1_',
        parameters: [
          {
            name: 'SunCountVariable',
            type: 'variable',
          },
        ],
        events_json: [
          {
            type: 'BuiltinCommonInstructions::Standard',
            variables: [{ name: 'LocalSunCount', type: 'number', value: 0 }],
            conditions: [],
            actions: [
              {
                type: { value: 'CopyArgumentToVariable2' },
                parameters: ['"SunCountVariable"', 'LocalSunCount'],
              },
            ],
          },
        ],
        summary_only: true,
      },
    },
  ],
  gdevelop_create_or_update_extension_property: [
    {
      description:
        'Create a visible numeric instance property on an events-based behavior.',
      arguments: {
        extension_name: 'GameplayLogic',
        target_kind: 'behavior',
        target_name: 'PlantBehavior',
        property_name: 'SunCost',
        property_type: 'Number',
        value: '50',
        label: 'Sun cost',
        description: 'Amount of sun deducted when this plant is placed.',
        is_hidden: false,
        is_advanced: false,
        is_shared: false,
      },
    },
    {
      description: 'Create a Choice property with explicit selectable values.',
      arguments: {
        extension_name: 'GameplayLogic',
        target_kind: 'object',
        target_name: 'PlantCard',
        property_name: 'PlantKind',
        property_type: 'Choice',
        value: 'Sunflower',
        label: 'Plant kind',
        choices: [
          { value: 'Sunflower', label: 'Sunflower' },
          { value: 'Peashooter', label: 'Peashooter' },
        ],
      },
    },
  ],
  gdevelop_create_or_update_extension_object: [
    {
      description:
        'Dry-run validate a serialized events-based object before writing it.',
      arguments: {
        extension_name: 'GameplayUI',
        object_name: 'HealthBarPrefab',
        dry_run: true,
        summary_only: true,
        serialized_object: {
          name: 'HealthBarPrefab',
          defaultName: 'HealthBar',
          areaMinX: 0,
          areaMinY: 0,
          areaMaxX: 96,
          areaMaxY: 12,
          objects: [],
          instances: [],
          eventsFunctions: [],
          propertyDescriptors: [],
          variants: [],
        },
      },
    },
  ],
  find_extension_events: [
    {
      description:
        'Find extension-object functions that still mention a child health bar object.',
      arguments: {
        extension_name: 'GameplayUI',
        parent_kind: 'object',
        parent_name: 'EnemyPanel',
        parameter_contains: 'HealthBar',
        summary_only: true,
      },
    },
  ],
  find_project_events: [
    {
      description:
        'Search all scenes and extension functions for direct health bar references.',
      arguments: {
        text_contains: 'HealthBar',
        limit: 100,
        summary_only: true,
      },
    },
  ],
  gdevelop_extract_prefab_from_object: [
    {
      description:
        'Dry-run extract all EnemyHealthBar/EnemyHealthText scene instances into a reusable prefab.',
      arguments: {
        extension_name: 'GameplayUI',
        object_name: 'EnemyHealthBadge',
        source_kind: 'scene_instances',
        scene_name: 'Level1',
        source_object_names: ['EnemyHealthBar', 'EnemyHealthText'],
        dry_run: true,
        summary_only: true,
      },
    },
    {
      description:
        'Extract selected child objects from an existing extension object and replace them in the source with one prefab child instance.',
      arguments: {
        extension_name: 'GameplayUI',
        object_name: 'EnemyHealthBadge',
        source_kind: 'extension_object',
        source_extension_name: 'GameplayUI',
        source_object_name: 'EnemyPanel',
        child_object_names: ['HealthBar', 'HealthText'],
        replace_in_source_with_prefab_instance: true,
        remove_extracted_children: true,
        summary_only: true,
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
  inspect_gameplay_rules: [
    {
      description:
        'Check that a health bar follow event and an enemy State variable are wired in events.',
      arguments: {
        scene_name: 'Level1',
        top_attachments: [
          {
            follower_object_name: 'EnemyHealthBar',
            target_object_name: 'Enemy',
          },
        ],
        state_machines: [
          {
            object_name: 'Enemy',
            variable_name: 'State',
            states: ['Patrol', 'Chase', 'Attack'],
          },
        ],
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
        'Preview a specific scene (independent of the open editor tab), paused.',
      arguments: {
        scene_name: 'main',
        start_paused: true,
      },
    },
  ],
  save_and_relaunch_preview_paused: [
    {
      description:
        'Recover from stale extension edits by saving, closing previews, and relaunching one paused debug preview.',
      arguments: {
        timeout_ms: 10000,
      },
    },
    {
      description:
        'Save and relaunch a paused preview on a specific scene after editing it.',
      arguments: {
        scene_name: 'main',
      },
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
  delete_scene_variable: [
    {
      description:
        'Delete a scene variable by name or nested path without a serialized scene patch.',
      arguments: {
        scene_name: 'Level1',
        variable_name_or_path: 'Score',
      },
    },
  ],
  batch_delete_scene_variables: [
    {
      description:
        'Delete several unreferenced scene variables in one call, skipping any still referenced by scene events.',
      arguments: {
        scene_name: 'Level1',
        variable_names_or_paths: ['OldScore', 'UnusedState.Mode'],
      },
    },
    {
      description: 'Preview a batch cleanup without modifying the scene.',
      arguments: {
        scene_name: 'Level1',
        variable_names_or_paths: ['OldScore', 'TemporaryFlag'],
        dry_run: true,
      },
    },
  ],
  delete_object_variable: [
    {
      description:
        'Delete an object variable without replacing the full object definition.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'Player',
        variable_name_or_path: 'Health',
      },
    },
  ],
  delete_instance_variable: [
    {
      description:
        'Delete a per-instance initial variable using an id from describe_instances.',
      arguments: {
        scene_name: 'Level1',
        instance_id: 'abcdef1234',
        variable_name_or_path: 'IsAnchor',
      },
    },
    {
      description:
        'Delete a per-instance initial variable from the first instance of an object.',
      arguments: {
        scene_name: 'Level1',
        object_name: 'GroundSlot',
        variable_name_or_path: 'IsAnchor',
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

const EXPOSED_MCP_TOOL_NAMES: Set<string> = new Set([
  'gdevelop_get_editor_state',
  'gdevelop_get_editor_selection',
  'gdevelop_get_project_summary',
  'gdevelop_get_static_data',
  'gdevelop_set_static_data',
  'gdevelop_set_static_data_value',
  'gdevelop_delete_static_data_value',
  'gdevelop_list_scenes',
  'gdevelop_list_objects',
  'generate-catalogs',
  'validate_project_files',
  'inspect_tool_schema',
  'get_tool_usage_examples',
  'reload_project',
  'launch_preview',
  'wait_until_preview_ready',
  'preview_health_check',
  'gdevelop_inspect_running_preview',
  'run_frames',
  'simulate_preview_input',
  'control_preview',
  'set_runtime_state',
  'capture_preview_screenshot',
  'import_extension',
]);

const exposedReadTools = readTools.filter(tool =>
  EXPOSED_MCP_TOOL_NAMES.has(tool.name)
);
const exposedWriteTools = writeTools.filter(tool =>
  EXPOSED_MCP_TOOL_NAMES.has(tool.name)
);
const exposedCommandTools = commandTools.filter(tool =>
  EXPOSED_MCP_TOOL_NAMES.has(tool.name)
);

const writeToolNames: Set<string> = new Set(
  exposedWriteTools.map(tool => tool.name)
);
const alwaysAvailableWriteToolNames: Set<string> = new Set([
  'import_extension',
]);
const commandToolNames: Set<string> = new Set(
  exposedCommandTools.map(tool => tool.name)
);
const readToolNames: Set<string> = new Set(
  exposedReadTools.map(tool => tool.name)
);

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
    ...exposedReadTools,
    ...exposedWriteTools.filter(
      tool =>
        permissions.allowWriteTools ||
        alwaysAvailableWriteToolNames.has(tool.name)
    ),
    ...(permissions.allowCommandTools ? exposedCommandTools : []),
  ].map(withDefaultToolAnnotations);

export const getAllMcpToolsForIntrospection = (): Array<McpTool> =>
  [...exposedReadTools, ...exposedWriteTools, ...exposedCommandTools].map(
    withDefaultToolAnnotations
  );

export const getMcpToolUsageExamples = (
  toolName?: ?string
): { [string]: Array<Object> } => {
  if (!toolName) {
    const exposedExamples: { [string]: Array<Object> } = {};
    EXPOSED_MCP_TOOL_NAMES.forEach(name => {
      if (toolUsageExamples[name])
        exposedExamples[name] = toolUsageExamples[name];
    });
    return exposedExamples;
  }
  return {
    [toolName]: EXPOSED_MCP_TOOL_NAMES.has(toolName)
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
    'Editor queries': [
      'gdevelop_get_editor_state',
      'gdevelop_get_project_summary',
      'gdevelop_get_static_data',
      'gdevelop_list_scenes',
      'gdevelop_list_objects',
      'gdevelop_get_editor_selection',
      'gdevelop_capabilities',
      'gdevelop_refresh_tool_catalog',
      'validate_current_project_json',
    ],
    'Read scene / objects / events': [
      'read_serialized_scene',
      'read_scene_events',
      'read_scene_events_serialized',
      'get_tilemap_tiles',
      'inspect_tilemap_palette',
      'inspect_tilemap_collision',
      'check_tilemap_walkability',
      'describe_instances',
      'inspect_scene_draw_order',
      'find_scene_events',
      'find_extension_events',
      'find_project_events',
      'gdevelop_inspect_signal_usage',
      'gdevelop_validate_extension_events_json',
      'lint_extension_function_events',
      'inspect_object_properties',
      'list_available_behaviors',
      'search_behavior_store',
      'inspect_project_resources',
      'inspect_custom_object_runtime_geometry',
      'inspect_prefab_property_bindings',
      'inspect_resource_images',
      'audit_project_asset_sources',
      'compare_image_files',
      'crop_scene_object_image',
    ],
    'Instruction discovery': [
      'gdevelop_search_instruction_metadata',
      'gdevelop_get_instruction_metadata',
      'gdevelop_get_events_json_examples',
    ],
    'Create / edit objects & assets': [
      'bulk_edit_scene_assets',
      'create_sprite_object_from_resource',
      'create_text_object',
      'set_sprite_animations',
      'slice_sprite_sheet',
      'bind_sprite_animations_from_directory',
      'create_tilemap_object',
      'set_tilemap_tiles',
      'set_tilemap_collision_tiles',
      'add_or_update_resource',
      'generate_placeholder_asset',
      'replace_project_resource',
      'put_2d_instances',
      'add_behavior',
      'gdevelop_extract_prefab_from_object',
      'bind_child_sprite_resource_property',
    ],
    'Author events': [
      'create_action',
      'create_condition',
      'create_signal_emit_action',
      'create_signal_received_condition',
      'add_scene_events',
      'patch_scene_event_instruction',
      'patch_extension_event_instruction',
      'replace_javascript_event_code',
      'attach_object_to_object_top',
      'validate_events_json_file',
      'gdevelop_validate_extension_events_json',
      'replace_extension_function_events_from_file',
      'apply_validated_extension_patch',
      'lint_scene_events',
      'lint_extension_function_events',
      'inspect_gameplay_rules',
      'create_group',
      'gdevelop_create_or_update_on_signal',
    ],
    'Variables & scenes': [
      'add_or_edit_variable',
      'gdevelop_set_static_data',
      'gdevelop_set_static_data_value',
      'gdevelop_delete_static_data_value',
      'delete_scene_variable',
      'batch_delete_scene_variables',
      'delete_object_variable',
      'delete_instance_variable',
      'create_scene',
      'rename_scene',
      'set_first_layout',
    ],
    'Preview debugging': [
      'generate-catalogs',
      'validate_project_files',
      'reload_project',
      'launch_preview',
      'wait_until_preview_ready',
      'run_frames',
      'preview_health_check',
      'gdevelop_inspect_running_preview',
      'save_and_relaunch_preview_paused',
      'capture_preview_screenshot',
      'render_scene_to_png',
      'control_preview',
      'simulate_preview_input',
      'set_runtime_state',
    ],
    'Safety & persistence': [
      'snapshot_project',
      'restore_project_snapshot',
      'apply_validated_project_json_patch',
      'sync_editor_from_validated_project_json',
      'gdevelop_save_project_and_wait',
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
      'GDevelop MCP is intentionally limited to one extension import/conversion tool, editor queries, Static Data editing, and preview debugging. After import_extension generates canonical sources, author the game through project files and the generated .gdevelop/settings-catalog.json, .gdevelop/layout-catalog.json, and .gdevelop/instructions-catalog.json.',
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
