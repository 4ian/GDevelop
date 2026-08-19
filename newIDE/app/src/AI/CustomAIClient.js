// @flow
import axios from 'axios';
import {
  type AiRequest,
  type AiRequestMessage,
  type AiRequestFunctionCallOutput,
  type AiRequestUserMessage,
  type AiRequestSuggestions,
  type AiGeneratedEvent,
  type CreateAiGeneratedEventResult,
  type AssetSearch,
  type ResourceSearch,
  type GenerationStatus,
  type AiSettings,
} from '../Utils/GDevelopServices/Generation';

export const LOCAL_BYOK_USER_ID = 'local-byok-user';

export type CustomAIConfig = {|
  enabled: boolean,
  baseUrl: string,
  apiKey: string,
  model: string,
  temperature: number,
  maxTokens?: number,
  customHeaders?: { [string]: string },
|};

export const DEFAULT_CUSTOM_AI_CONFIG: CustomAIConfig = {
  enabled: false,
  baseUrl: 'http://localhost:11434/v1',
  apiKey: '',
  model: 'qwen2.5-coder',
  temperature: 0.7,
};

const LOCAL_STORAGE_CONFIG_KEY = 'gd-custom-ai-config';
const LOCAL_STORAGE_REQUESTS_KEY = 'gd-custom-ai-requests';
const MAX_LOCAL_SAVED_REQUESTS = 20;

/**
 * In-memory configuration cache.
 */
let cachedConfig: ?CustomAIConfig = null;

/**
 * Load custom AI config from local storage or default.
 */
export const getCustomEndpointConfig = (): CustomAIConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const persisted = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        cachedConfig = {
          ...DEFAULT_CUSTOM_AI_CONFIG,
          ...parsed,
        };
        return cachedConfig;
      }
    }
  } catch (err) {
    console.warn('Error reading custom AI config from localStorage:', err);
  }

  cachedConfig = { ...DEFAULT_CUSTOM_AI_CONFIG };
  return cachedConfig;
};

/**
 * Save custom AI config to local storage and update in-memory cache.
 * Excludes apiKey from cleartext localStorage while retaining it in memory.
 */
export const setCustomEndpointConfig = (
  updates: $Shape<CustomAIConfig>
): CustomAIConfig => {
  const current = getCustomEndpointConfig();
  const nextConfig: CustomAIConfig = {
    ...current,
    ...updates,
  };
  cachedConfig = nextConfig;

  try {
    if (typeof localStorage !== 'undefined') {
      const { apiKey, ...persistableConfig } = nextConfig;
      localStorage.setItem(
        LOCAL_STORAGE_CONFIG_KEY,
        JSON.stringify(persistableConfig)
      );
    }
  } catch (err) {
    console.warn('Error saving custom AI config to localStorage:', err);
  }

  return nextConfig;
};

/**
 * Check if the custom AI endpoint is enabled.
 */
export const isCustomEndpointEnabled = (): boolean => {
  const config = getCustomEndpointConfig();
  return !!config.enabled;
};

/**
 * Normalize base URL ensuring protocol and removing trailing slashes.
 * Preserves the configured path exactly without automatically appending /v1.
 */
export const normalizeBaseUrl = (baseUrl: string): string => {
  let url = (baseUrl || '').trim();
  if (!url) {
    return 'http://localhost:11434/v1';
  }
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  // If user entered a schemeless URL, default to http:// for loopback and https:// otherwise
  if (!/^https?:\/\//i.test(url)) {
    if (/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/.*)?$/i.test(url)) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }
  return url;
};

/**
 * Build the full endpoint URL for a given path.
 */
export const getEndpointUrl = (
  baseUrl: string,
  endpointPath: string
): string => {
  const normalized = normalizeBaseUrl(baseUrl);
  const cleanPath = endpointPath.startsWith('/')
    ? endpointPath
    : `/${endpointPath}`;

  return `${normalized}${cleanPath}`;
};

/**
 * In-memory cache for local AI requests.
 */
const localAiRequestsCache: { [id: string]: AiRequest } = {};

/**
 * Reset CustomAIClient state (for testing).
 */
export const _resetCustomAiClientForTesting = () => {
  cachedConfig = null;
  for (const key of Object.keys(localAiRequestsCache)) {
    delete localAiRequestsCache[key];
  }
};

/**
 * Load local AI requests from local storage.
 */
export const loadLocalAiRequests = (): { [id: string]: AiRequest } => {
  try {
    if (typeof localStorage !== 'undefined') {
      const persisted = localStorage.getItem(LOCAL_STORAGE_REQUESTS_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        Object.assign(localAiRequestsCache, parsed);
      }
    }
  } catch (err) {
    console.warn('Error loading local AI requests from localStorage:', err);
  }
  return localAiRequestsCache;
};

/**
 * Save local AI requests to local storage, retaining a bounded number of requests
 * and excluding full gameProjectJson to prevent storage quota exhaustion.
 */
export const saveLocalAiRequests = () => {
  if (typeof localStorage === 'undefined') return;

  const keys = Object.keys(localAiRequestsCache);
  const recentKeys = keys.slice(-MAX_LOCAL_SAVED_REQUESTS);
  const persistableMap: { [id: string]: AiRequest } = {};

  for (const key of recentKeys) {
    const req = localAiRequestsCache[key];
    if (req) {
      const { gameProjectJson, ...persistableReq } = req;
      persistableMap[key] = (persistableReq: any);
    }
  }

  localStorage.setItem(
    LOCAL_STORAGE_REQUESTS_KEY,
    JSON.stringify(persistableMap)
  );
};

// Initialize requests from localStorage
loadLocalAiRequests();

/**
 * OpenAI Tool definitions for GDevelop Editor Functions.
 */
export const GDEVELOP_OPENAI_TOOLS: Array<{|
  type: 'function',
  function: {|
    name: string,
    description: string,
    parameters: Object,
  |},
|}> = [
  {
    type: 'function',
    function: {
      name: 'create_scene',
      description:
        'Create a new scene in the GDevelop project with the given name.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the new scene to create.',
          },
        },
        required: ['scene_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_or_replace_object',
      description:
        'Create or replace an object in a scene (or global if scene_name is omitted).',
      parameters: {
        type: 'object',
        properties: {
          object_name: {
            type: 'string',
            description: 'Name of the object.',
          },
          object_type: {
            type: 'string',
            description:
              'Type of object (e.g. "Sprite", "TiledSpriteObject::TiledSprite", "TextObject::Text", "PanelSpriteObject::PanelSprite", "Tilemap::Tilemap", "Scene3D::Cube3D").',
          },
          scene_name: {
            type: 'string',
            description:
              'Name of the scene. If omitted or empty, creates a global object.',
          },
          description: {
            type: 'string',
            description: 'Optional description of the object purpose.',
          },
        },
        required: ['object_name', 'object_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_behavior',
      description: 'Add a behavior to an object in the project.',
      parameters: {
        type: 'object',
        properties: {
          object_name: {
            type: 'string',
            description: 'Name of the object to add behavior to.',
          },
          behavior_name: {
            type: 'string',
            description:
              'Unique name for this behavior instance on the object.',
          },
          behavior_type: {
            type: 'string',
            description:
              'Type of behavior (e.g. "PlatformBehavior::PlatformerObjectBehavior", "PlatformBehavior::PlatformBehavior", "TopDownMovementBehavior::TopDownMovementBehavior", "Physics2::Physics2Behavior", "DestroyOutsideBehavior::DestroyOutside", "SmoothCamera::SmoothCamera").',
          },
          scene_name: {
            type: 'string',
            description:
              'Name of the scene (if object is a scene object). Omit for global objects.',
          },
        },
        required: ['object_name', 'behavior_name', 'behavior_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'put_2d_instances',
      description:
        'Place one or more 2D instances of objects into a scene at specified coordinates.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the scene.',
          },
          instances: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                object_name: {
                  type: 'string',
                  description: 'Name of the object to instantiate.',
                },
                x: { type: 'number', description: 'X position in pixels.' },
                y: { type: 'number', description: 'Y position in pixels.' },
                layer_name: {
                  type: 'string',
                  description:
                    'Layer name (default empty string for base layer).',
                },
                angle: {
                  type: 'number',
                  description: 'Angle in degrees (default 0).',
                },
                z_order: { type: 'number', description: 'Z-order.' },
              },
              required: ['object_name', 'x', 'y'],
            },
            description: 'List of instances to place.',
          },
        },
        required: ['scene_name', 'instances'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_scene_events',
      description:
        'Generate or modify scene events in GDevelop based on natural language description.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the scene whose events are being modified.',
          },
          events_description: {
            type: 'string',
            description:
              'Detailed natural language description of the events logic to implement.',
          },
          objects_list: {
            type: 'string',
            description:
              'Comma-separated list of objects involved in these events.',
          },
          extension_names_list: {
            type: 'string',
            description:
              'Comma-separated list of extensions/behaviors used (e.g. "PlatformBehavior::PlatformerObjectBehavior, Keyboard, Scene").',
          },
        },
        required: ['scene_name', 'events_description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_script',
      description:
        'Execute a JavaScript script in the GDevelop editor to inspect or modify the project.',
      parameters: {
        type: 'object',
        properties: {
          script: {
            type: 'string',
            description:
              'JavaScript code to execute in the editor environment. Has access to exposed editor functions and project APIs.',
          },
        },
        required: ['script'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_events_source',
      description:
        'Read the current events of a scene in EventScript source format.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the scene.',
          },
        },
        required: ['scene_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'describe_instances',
      description: 'List all instances present in a scene.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the scene.',
          },
          filter_by_object_name: {
            type: 'string',
            description:
              'Optional comma-separated list of object names to filter by.',
          },
        },
        required: ['scene_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_object_properties_effects',
      description: 'Inspect properties and effects of an object.',
      parameters: {
        type: 'object',
        properties: {
          object_name: { type: 'string', description: 'Name of the object.' },
          scene_name: {
            type: 'string',
            description: 'Scene name if scene object.',
          },
        },
        required: ['object_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_behavior_properties',
      description: 'Inspect properties of a behavior attached to an object.',
      parameters: {
        type: 'object',
        properties: {
          object_name: { type: 'string', description: 'Name of the object.' },
          behavior_name: {
            type: 'string',
            description: 'Name of the behavior instance.',
          },
          scene_name: {
            type: 'string',
            description: 'Scene name if scene object.',
          },
        },
        required: ['object_name', 'behavior_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_scene_properties_layers_effects',
      description: 'Inspect properties, layers, and effects of a scene.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: { type: 'string', description: 'Name of the scene.' },
        },
        required: ['scene_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_scene_properties_layers_effects_groups',
      description:
        'Change properties of a scene (such as backgroundColor, resolution, name, firstScene), layers, effects, or object groups.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: {
            type: 'string',
            description: 'Name of the scene.',
          },
          changed_properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_name: {
                  type: 'string',
                  description:
                    'Name of the scene property: "backgroundColor" (hex string like "#3498db" or "rgb(52, 152, 219)"), "gameResolutionWidth", "gameResolutionHeight", "name", "isFirstScene", "stopSoundsOnStartup", "gameOrientation", "gameScaleMode", "gameName".',
                },
                new_value: {
                  type: 'string',
                  description: 'The new value for the property as a string.',
                },
              },
              required: ['property_name', 'new_value'],
            },
            description: 'List of scene properties to update.',
          },
          changed_layers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                layer_name: { type: 'string' },
                new_layer_name: { type: 'string' },
                is_lighting_layer: { type: 'boolean' },
                is_follow_base_layer_camera: { type: 'boolean' },
                delete_this_layer: { type: 'boolean' },
              },
              required: ['layer_name'],
            },
            description: 'List of layers to modify, create or remove.',
          },
          delete_this_scene: {
            type: 'boolean',
            description: 'Set to true to delete this scene.',
          },
        },
        required: ['scene_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_object_properties_effects',
      description: 'Change properties and visual effects of an object.',
      parameters: {
        type: 'object',
        properties: {
          object_name: { type: 'string', description: 'Name of the object.' },
          scene_name: {
            type: 'string',
            description: 'Name of the scene (omit for global object).',
          },
          changed_properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_name: { type: 'string' },
                new_value: { type: 'string' },
              },
              required: ['property_name', 'new_value'],
            },
          },
          delete_this_object: { type: 'boolean' },
        },
        required: ['object_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_behavior_property',
      description: 'Change a property of a behavior attached to an object.',
      parameters: {
        type: 'object',
        properties: {
          object_name: { type: 'string', description: 'Name of the object.' },
          behavior_name: {
            type: 'string',
            description: 'Name of the behavior instance.',
          },
          property_name: {
            type: 'string',
            description: 'Name of the behavior property to modify.',
          },
          new_value: { type: 'string', description: 'New value as a string.' },
          scene_name: {
            type: 'string',
            description: 'Scene name if scene object.',
          },
          delete_this_behavior: {
            type: 'boolean',
            description: 'Set to true to remove this behavior.',
          },
        },
        required: [
          'object_name',
          'behavior_name',
          'property_name',
          'new_value',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_project_properties_resources',
      description:
        'Change global project settings such as window resolution, orientation, scale mode, or game name.',
      parameters: {
        type: 'object',
        properties: {
          changed_properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_name: {
                  type: 'string',
                  description:
                    'Property name: "gameResolutionWidth", "gameResolutionHeight", "gameOrientation", "gameScaleMode", "gameName", "packageName", "version", "author", "loadingScreenBackgroundColor".',
                },
                new_value: { type: 'string' },
              },
              required: ['property_name', 'new_value'],
            },
            description: 'List of project properties to update.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_project_properties_resources',
      description: 'Inspect project global properties and resources list.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_or_edit_variable',
      description: 'Add or edit a variable at project, scene, or object level.',
      parameters: {
        type: 'object',
        properties: {
          variable_scope: {
            type: 'string',
            enum: ['global', 'scene', 'object', 'group', 'instance'],
            description: 'Scope of the variable ("global", "scene", "object").',
          },
          scope: {
            type: 'string',
            enum: ['global', 'scene', 'object', 'group', 'instance'],
            description: 'Alias for variable_scope.',
          },
          variable_name_or_path: {
            type: 'string',
            description:
              'Variable name or path (e.g. "Score" or "Player.Health").',
          },
          name: {
            type: 'string',
            description: 'Alias for variable_name_or_path.',
          },
          variable_type: {
            type: 'string',
            enum: ['number', 'string', 'boolean', 'structure', 'array'],
            description: 'Variable type.',
          },
          type: {
            type: 'string',
            enum: ['number', 'string', 'boolean', 'structure', 'array'],
            description: 'Alias for variable_type.',
          },
          value: { description: 'Initial or updated value for the variable.' },
          scene_name: {
            type: 'string',
            description: 'Scene name if scope is scene or object.',
          },
          object_name: {
            type: 'string',
            description: 'Object name if scope is object.',
          },
          delete_this_variable: {
            type: 'boolean',
            description: 'Set to true to delete this variable.',
          },
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                variable_name_or_path: { type: 'string' },
                name: { type: 'string' },
                value: { type: 'string' },
                variable_type: { type: 'string' },
                type: { type: 'string' },
                delete_this_variable: { type: 'boolean' },
              },
            },
            description: 'Optional batch of variable operations.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'put_3d_instances',
      description:
        'Place 3D instances of objects into a scene at specified 3D coordinates.',
      parameters: {
        type: 'object',
        properties: {
          scene_name: { type: 'string', description: 'Name of the scene.' },
          object_name: {
            type: 'string',
            description: 'Name of the 3D object.',
          },
          layer_name: {
            type: 'string',
            description: 'Layer name (default "").',
          },
          brush_kind: {
            type: 'string',
            enum: ['create', 'erase', 'modify'],
            description: 'Action to perform.',
          },
          brush_position: {
            type: 'string',
            description: 'Position "x, y, z" in 3D space.',
          },
          new_instances_count: {
            type: 'number',
            description: 'Number of instances to create (default 1).',
          },
        },
        required: ['scene_name', 'layer_name', 'brush_kind'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'inspect_variables',
      description: 'Inspect variables at global, scene, or object level.',
      parameters: {
        type: 'object',
        properties: {
          variable_scope: {
            type: 'string',
            enum: ['global', 'scene', 'object'],
            description: 'Scope of the variables to inspect.',
          },
          scene_name: {
            type: 'string',
            description: 'Name of the scene (if scope is scene or object).',
          },
          object_name: {
            type: 'string',
            description: 'Name of the object (if scope is object).',
          },
          variable_names_or_paths: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Optional list of specific variable names or paths to inspect.',
          },
        },
        required: ['variable_scope'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_game_project_json',
      description: 'Read the complete or partial game project structure JSON.',
      parameters: {
        type: 'object',
        properties: {
          section: {
            type: 'string',
            description: 'Optional section of project JSON to inspect.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_object_asset_store',
      description:
        'Search the GDevelop asset store for 2D/3D objects and sprite packs.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term (e.g. "player", "coin", "platform").',
          },
          category: { type: 'string', description: 'Optional asset category.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_resource_store',
      description:
        'Search the GDevelop resource store for audio sounds, music, and fonts.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term (e.g. "jump", "laser", "music").',
          },
          resource_kind: {
            type: 'string',
            enum: ['audio', 'font', 'image'],
            description: 'Kind of resource to search.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_docs',
      description:
        'Search GDevelop documentation for functions, behaviors, and instructions.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Documentation search query.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_full_docs',
      description:
        'Read full documentation for specific GDevelop extensions or features.',
      parameters: {
        type: 'object',
        properties: {
          extension_names: {
            type: 'string',
            description:
              'Comma-separated names of extensions to read docs for.',
          },
        },
        required: ['extension_names'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'initialize_project',
      description: 'Initialize a new project from a starter template.',
      parameters: {
        type: 'object',
        properties: {
          project_name: {
            type: 'string',
            description: 'Name of the new project/game.',
          },
          game_name: { type: 'string', description: 'Alias for project_name.' },
          name: { type: 'string', description: 'Alias for project_name.' },
          template_slug: {
            type: 'string',
            description:
              'Slug of the starter template (e.g. "empty", "platformer", "top-down").',
          },
          also_read_existing_events: {
            type: 'boolean',
            description: 'Whether to read existing events from template.',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_game_starter_summary',
      description:
        'Get a summary of an example starter template to study its structure.',
      parameters: {
        type: 'object',
        properties: {
          template_slug: {
            type: 'string',
            description: 'Slug of the starter template.',
          },
        },
        required: ['template_slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_or_update_plan',
      description: 'Create or update the step-by-step orchestrator plan.',
      parameters: {
        type: 'object',
        properties: {
          tasks: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Task ID (e.g. "task_1").' },
                title: { type: 'string', description: 'Short task title.' },
                description: { type: 'string', description: 'Task details.' },
                status: {
                  type: 'string',
                  enum: ['pending', 'in_progress', 'done', 'voided'],
                  description: 'Task status.',
                },
                dependsOn: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of task IDs this task depends on.',
                },
              },
              required: ['id', 'title', 'status'],
            },
          },
        },
        required: ['tasks'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_gameplay_test',
      description:
        'Run or save a gameplay test in the project or an extension.',
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['project', 'extension'] },
              extension_name: { type: 'string' },
            },
            required: ['type'],
            description:
              'Test scope ({ type: "project" } or { type: "extension", extension_name: "..." }).',
          },
          test_name: { type: 'string', description: 'Name of the test.' },
          source: {
            type: 'string',
            description: 'Optional test JavaScript code.',
          },
          persist: {
            type: 'boolean',
            description: 'Whether to save the test (default true).',
          },
          timeout_ms: {
            type: 'number',
            description: 'Timeout in milliseconds.',
          },
        },
        required: ['scope', 'test_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'change_gameplay_tests',
      description:
        'Change properties of or delete gameplay tests in the project.',
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['project', 'extension'] },
              extension_name: { type: 'string' },
            },
            required: ['type'],
          },
          changes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                test_name: { type: 'string' },
                delete_this_test: { type: 'boolean' },
                changed_properties: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      property_name: { type: 'string' },
                      new_value: { type: 'string' },
                    },
                    required: ['property_name', 'new_value'],
                  },
                },
              },
              required: ['test_name'],
            },
          },
        },
        required: ['scope', 'changes'],
      },
    },
  },
];

/**
 * Extract thinking / reasoning content from text or OpenAI reasoning fields.
 */
export const extractThinkingAndContent = (
  rawContent: ?string,
  reasoningContent: ?string
): {|
  thinking: string | null,
  cleanContent: string,
  content: string,
|} => {
  if (reasoningContent && reasoningContent.trim()) {
    const clean = (rawContent || '').trim();
    return {
      thinking: reasoningContent.trim(),
      cleanContent: clean,
      content: clean,
    };
  }

  if (!rawContent) {
    return { thinking: null, cleanContent: '', content: '' };
  }

  const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
  if (thinkMatch) {
    const thinking = thinkMatch[1].trim();
    const cleanContent = rawContent
      .replace(/<think>[\s\S]*?<\/think>/i, '')
      .trim();
    return { thinking: thinking || null, cleanContent, content: cleanContent };
  }

  const clean = rawContent.trim();
  return { thinking: null, cleanContent: clean, content: clean };
};

/**
 * Format GDevelop conversation messages into OpenAI standard format.
 */
export const transformGDevelopMessagesToOpenAi = (
  outputMessages: Array<any>,
  systemPromptOrGameProjectJson?: ?string,
  projectSpecificExtensionsSummaryJson?: ?string,
  mode?: string
): Array<{|
  role: 'system' | 'user' | 'assistant' | 'tool',
  content?: string | null,
  tool_calls?: Array<{|
    id: string,
    type: 'function',
    function: {|
      name: string,
      arguments: string,
    |},
  |}>,
  tool_call_id?: string,
|}> => {
  const openAiMessages = [];

  let effectiveSystemPrompt: ?string = null;
  if (systemPromptOrGameProjectJson) {
    if (
      systemPromptOrGameProjectJson.includes('You are GDevelop AI Assistant')
    ) {
      effectiveSystemPrompt = systemPromptOrGameProjectJson;
    } else {
      effectiveSystemPrompt = buildSystemPrompt({
        gameProjectJson: systemPromptOrGameProjectJson,
        projectSpecificExtensionsSummaryJson,
        mode: (mode: any),
      });
    }
  }

  if (effectiveSystemPrompt) {
    openAiMessages.push({
      role: 'system',
      content: effectiveSystemPrompt,
    });
  }

  for (const msg of outputMessages || []) {
    if (
      msg.role === 'user' ||
      msg.type === 'user' ||
      (msg.type === 'message' && msg.role === 'user')
    ) {
      const text =
        msg.text ||
        (typeof msg.content === 'string' ? msg.content : '') ||
        (Array.isArray(msg.content)
          ? msg.content
              .filter(item => item.type === 'user_request' || item.text)
              .map(item => item.text)
              .join('\n')
          : '');
      openAiMessages.push({
        role: 'user',
        content: text,
      });
    } else if (
      msg.role === 'assistant' ||
      msg.type === 'assistant' ||
      (msg.type === 'message' && msg.role === 'assistant')
    ) {
      const content = msg.text || '';
      const toolCalls = [];

      // Extract function calls
      if (Array.isArray(msg.functionCalls)) {
        for (const fc of msg.functionCalls) {
          toolCalls.push({
            id: fc.id || `call_${Date.now()}`,
            type: 'function',
            function: {
              name: fc.name,
              arguments:
                typeof fc.callArguments === 'string'
                  ? fc.callArguments
                  : JSON.stringify(fc.callArguments || {}),
            },
          });
        }
      }

      if (Array.isArray(msg.content)) {
        for (const item of msg.content) {
          if (item.type === 'function_call') {
            toolCalls.push({
              id:
                item.call_id || item.callId || item.id || `call_${Date.now()}`,
              type: 'function',
              function: {
                name: item.name,
                arguments:
                  typeof item.arguments === 'string'
                    ? item.arguments
                    : JSON.stringify(item.arguments || {}),
              },
            });
          }
        }
      }

      const assistantMsg: Object = {
        role: 'assistant',
        content: content || null,
      };
      if (toolCalls.length > 0) {
        // De-duplicate tool calls by ID
        const seenCallIds = new Set<string>();
        const uniqueToolCalls = [];
        for (const tc of toolCalls) {
          if (!seenCallIds.has(tc.id)) {
            seenCallIds.add(tc.id);
            uniqueToolCalls.push(tc);
          }
        }
        assistantMsg.tool_calls = uniqueToolCalls;
      }
      openAiMessages.push(assistantMsg);
    } else if (msg.type === 'function_call_output' || msg.role === 'tool') {
      if (Array.isArray(msg.functionCallOutputs)) {
        for (const fco of msg.functionCallOutputs) {
          openAiMessages.push({
            role: 'tool',
            tool_call_id: fco.callId || fco.call_id || fco.id,
            content:
              typeof fco.output === 'string'
                ? fco.output
                : JSON.stringify(fco.output || {}),
          });
        }
      } else {
        openAiMessages.push({
          role: 'tool',
          tool_call_id: msg.callId || msg.call_id || msg.id,
          content:
            typeof msg.output === 'string'
              ? msg.output
              : JSON.stringify(msg.output || {}),
        });
      }
    }
  }

  // Ensure consecutive tool outputs don't have duplicate tool_call_id
  const seenToolOutputIds = new Set<string>();
  return openAiMessages.filter(msg => {
    if (msg.role === 'tool' && msg.tool_call_id) {
      if (seenToolOutputIds.has(msg.tool_call_id)) {
        return false;
      }
      seenToolOutputIds.add(msg.tool_call_id);
    }
    return true;
  });
};

/**
 * Build the system prompt with project structure and guidelines.
 */
export const buildSystemPrompt = ({
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
}: {|
  gameProjectJson?: string | null,
  projectSpecificExtensionsSummaryJson?: string | null,
  mode?: 'chat' | 'agent' | 'orchestrator',
|}): string => {
  let prompt = `You are GDevelop AI Assistant, an expert game engine developer. You help users build games in GDevelop 5.

Guidelines:
1. Always use available tools/functions to inspect or modify the project.
2. When creating objects, use \`create_or_replace_object\`.
3. When adding behaviors, use \`add_behavior\`.
4. When placing instances in scenes, use \`put_2d_instances\` or \`put_3d_instances\`.
5. When changing scene properties (e.g. background color), use \`change_scene_properties_layers_effects_groups\`.
6. To modify scene events:
   Call add_scene_events.
7. If using run_script:
   You MUST sequentially await every function call with \`await\` (e.g. \`await change_scene_properties_layers_effects_groups({ scene_name: '...', changed_properties: [{ property_name: 'backgroundColor', new_value: '#123456' }] });\`). Never call editor functions concurrently or without \`await\`.

`;

  if (gameProjectJson) {
    prompt += `\nCurrent Project Structure:\n${gameProjectJson}\n`;
  }
  if (projectSpecificExtensionsSummaryJson) {
    prompt += `\nInstalled Project Extensions:\n${projectSpecificExtensionsSummaryJson}\n`;
  }

  return prompt;
};

/**
 * Send a chat completion request to the OpenAI-compatible endpoint.
 */
export const sendChatCompletion = async ({
  messages,
  tools,
  config,
  signal,
}: {|
  messages: Array<Object>,
  tools?: ?Array<Object>,
  config?: ?CustomAIConfig,
  signal?: ?AbortSignal,
|}): Promise<Object> => {
  const currentConfig = config || getCustomEndpointConfig();
  const baseUrl = normalizeBaseUrl(currentConfig.baseUrl);
  const endpointUrl = getEndpointUrl(baseUrl, '/chat/completions');

  const headers: { [string]: string } = {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://gdevelop.io',
    'X-Title': 'GDevelop IDE',
    ...(currentConfig.customHeaders || {}),
  };

  if (currentConfig.apiKey && currentConfig.apiKey.trim()) {
    headers['Authorization'] = `Bearer ${currentConfig.apiKey.trim()}`;
  }

  const payload: Object = {
    model: currentConfig.model || 'qwen2.5-coder',
    messages,
    temperature:
      typeof currentConfig.temperature === 'number'
        ? currentConfig.temperature
        : 0.7,
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  if (currentConfig.maxTokens) {
    payload.max_tokens = currentConfig.maxTokens;
  }

  let cancelToken;
  if (signal) {
    const cancelTokenSource = axios.CancelToken.source();
    cancelToken = cancelTokenSource.token;
    if (signal.aborted) {
      cancelTokenSource.cancel('Aborted');
    } else {
      signal.addEventListener('abort', () => {
        cancelTokenSource.cancel('Aborted');
      });
    }
  }

  try {
    const response = await axios.post(endpointUrl, payload, {
      headers,
      cancelToken,
      timeout: 120000,
    });

    if (
      response.data &&
      response.data.choices &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message;
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error) || (signal && signal.aborted)) {
      throw new Error('AI request was aborted.');
    }
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const errorMsg =
        (data && data.error && (data.error.message || data.error)) ||
        error.message ||
        `HTTP error ${status}`;
      throw new Error(`AI Provider Error (${status}): ${errorMsg}`);
    }
    throw error;
  }
};

const SIDE_EFFECT_FREE_TOOLS = new Set([
  'describe_instances',
  'describe_events',
  'describe_scene_layers_effects_groups',
  'describe_variables',
  'read_game_project_json',
  'read_full_docs',
  'search_docs',
  'get_game_starter_summary',
]);

/**
 * Parse an OpenAI assistant message response into GDevelop's internal format.
 */
export const parseAssistantMessage = (
  openAiMessageOrChoiceOrResponse: Object,
  messageId?: string
): AiRequestMessage => {
  const openAiMessage =
    openAiMessageOrChoiceOrResponse.message ||
    (openAiMessageOrChoiceOrResponse.choices &&
      openAiMessageOrChoiceOrResponse.choices[0] &&
      openAiMessageOrChoiceOrResponse.choices[0].message) ||
    openAiMessageOrChoiceOrResponse;

  const rawContent = openAiMessage.content || '';
  const reasoningContent = openAiMessage.reasoning_content || null;

  let { thinking, cleanContent } = extractThinkingAndContent(rawContent);
  if (!thinking && reasoningContent) {
    thinking = reasoningContent;
  }

  const contentArray: Array<any> = [];
  if (cleanContent) {
    contentArray.push({
      type: 'text',
      status: 'completed',
      text: cleanContent,
    });
  }

  const functionCalls: Array<any> = [];

  // Standard tool_calls
  if (Array.isArray(openAiMessage.tool_calls)) {
    for (const toolCall of openAiMessage.tool_calls) {
      if (toolCall.function) {
        const functionName = toolCall.function.name;
        const functionArgs = toolCall.function.arguments;
        let parsedArgs = {};
        try {
          parsedArgs =
            typeof functionArgs === 'string'
              ? JSON.parse(functionArgs)
              : functionArgs || {};
        } catch (e) {
          console.warn('Error parsing function call arguments JSON:', e);
        }
        const callId =
          toolCall.id ||
          `call_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 5)}`;
        contentArray.push({
          type: 'function_call',
          status: 'completed',
          call_id: callId,
          name: functionName,
          arguments: functionArgs || '{}',
        });
        functionCalls.push({
          id: callId,
          name: functionName,
          callArguments: parsedArgs,
        });
      }
    }
  }

  // Fallback: If no tool_calls but content contains markdown JSON tool call blocks (restricted to side-effect-free tools)
  if (
    (!openAiMessage.tool_calls || openAiMessage.tool_calls.length === 0) &&
    cleanContent
  ) {
    const jsonBlockRegex = /```(?:json)?\s*(\{\s*"(?:function|name|tool)":[\s\S]*?\})\s*```/gi;
    let match;
    while ((match = jsonBlockRegex.exec(cleanContent)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const name = parsed.function || parsed.name || parsed.tool;
        const args = parsed.arguments || parsed.args || parsed.parameters || {};
        if (
          name &&
          typeof name === 'string' &&
          SIDE_EFFECT_FREE_TOOLS.has(name)
        ) {
          const callId = `call_parsed_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 5)}`;
          const argsStr =
            typeof args === 'string' ? args : JSON.stringify(args);
          const parsedArgsObj =
            typeof args === 'string' ? JSON.parse(args) : args;
          contentArray.push({
            type: 'function_call',
            status: 'completed',
            call_id: callId,
            name,
            arguments: argsStr,
          });
          functionCalls.push({
            id: callId,
            name,
            callArguments: parsedArgsObj,
          });
        }
      } catch (e) {
        // Not a tool call JSON block, ignore
      }
    }
  }

  return {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    text: cleanContent,
    thinking,
    functionCalls,
    content: contentArray,
    messageId: messageId || `msg-asst-${Date.now()}`,
  };
};

/**
 * Client-side Create AI Request implementation.
 */
export const customCreateAiRequest = async ({
  userRequest,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
  aiConfiguration,
  gameId,
}: {|
  userRequest: string,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  mode?: 'chat' | 'agent' | 'orchestrator',
  aiConfiguration?: any,
  gameId?: string | null,
|}): Promise<AiRequest> => {
  const reqId = `local-ai-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 7)}`;
  const userMsgId = `msg-user-${Date.now()}`;
  const assistantMsgId = `msg-asst-${Date.now()}`;

  const userMessage: AiRequestUserMessage = {
    type: 'message',
    status: 'completed',
    role: 'user',
    content: [
      {
        type: 'user_request',
        status: 'completed',
        text: userRequest,
      },
    ],
    messageId: userMsgId,
  };

  const output: Array<AiRequestMessage> = [userMessage];

  const systemPrompt = buildSystemPrompt({
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
    mode,
  });

  const openAiMessages = transformGDevelopMessagesToOpenAi(
    output,
    systemPrompt
  );

  const assistantResponse = await sendChatCompletion({
    messages: openAiMessages,
    tools: GDEVELOP_OPENAI_TOOLS,
  });

  const assistantMessage = parseAssistantMessage(
    assistantResponse,
    assistantMsgId
  );
  output.push(assistantMessage);

  const now = new Date().toISOString();
  const aiRequest: AiRequest = {
    id: reqId,
    createdAt: now,
    updatedAt: now,
    userId: LOCAL_BYOK_USER_ID,
    gameId: gameId || null,
    gameProjectJson: gameProjectJson || null,
    status: 'ready',
    mode: mode || 'orchestrator',
    aiConfiguration: aiConfiguration || { presetId: 'default' },
    toolsVersion: 'v14',
    toolOptions: null,
    error: null,
    output,
    lastUserMessagePriceInCredits: 0,
    totalPriceInCredits: 0,
  };

  localAiRequestsCache[reqId] = aiRequest;
  saveLocalAiRequests();

  return aiRequest;
};

/**
 * Client-side Add Message To AI Request implementation.
 */
export const customAddMessageToAiRequest = async ({
  aiRequestId,
  userMessage,
  functionCallOutputs,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
}: {|
  aiRequestId: string,
  userMessage?: string,
  functionCallOutputs?: Array<AiRequestFunctionCallOutput>,
  gameProjectJson?: string | null,
  projectSpecificExtensionsSummaryJson?: string | null,
  mode?: 'chat' | 'agent' | 'orchestrator',
|}): Promise<AiRequest> => {
  const existing = localAiRequestsCache[aiRequestId] || {
    id: aiRequestId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: LOCAL_BYOK_USER_ID,
    status: 'ready',
    output: [],
    error: null,
  };

  const output = [...(existing.output || [])];

  if (functionCallOutputs && functionCallOutputs.length > 0) {
    for (const fcOutput of functionCallOutputs) {
      output.push({
        type: 'function_call_output',
        call_id: fcOutput.call_id,
        output: fcOutput.output,
        messageId: `msg-fco-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,
      });
    }
  }

  if (userMessage && userMessage.trim()) {
    output.push({
      type: 'message',
      status: 'completed',
      role: 'user',
      content: [
        {
          type: 'user_request',
          status: 'completed',
          text: userMessage,
        },
      ],
      messageId: `msg-user-${Date.now()}`,
    });
  }

  const systemPrompt = buildSystemPrompt({
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
    mode: mode || existing.mode,
  });

  const openAiMessages = transformGDevelopMessagesToOpenAi(
    output,
    systemPrompt
  );

  const assistantResponse = await sendChatCompletion({
    messages: openAiMessages,
    tools: GDEVELOP_OPENAI_TOOLS,
  });

  const assistantMsgId = `msg-asst-${Date.now()}`;
  const assistantMessage = parseAssistantMessage(
    assistantResponse,
    assistantMsgId
  );
  output.push(assistantMessage);

  const updatedAiRequest: AiRequest = {
    ...existing,
    updatedAt: new Date().toISOString(),
    status: 'ready',
    output,
  };

  localAiRequestsCache[aiRequestId] = updatedAiRequest;
  saveLocalAiRequests();

  return updatedAiRequest;
};

/**
 * Client-side Get AI Request.
 */
export const customGetAiRequest = (aiRequestId: string): AiRequest => {
  const request = localAiRequestsCache[aiRequestId];
  if (request) return request;

  const now = new Date().toISOString();
  const fallback: AiRequest = {
    id: aiRequestId,
    createdAt: now,
    updatedAt: now,
    userId: LOCAL_BYOK_USER_ID,
    status: 'ready',
    error: null,
    output: [],
  };
  return fallback;
};

/**
 * Client-side Get AI Requests list.
 */
export const customGetAiRequests = (): {
  aiRequests: Array<AiRequest>,
  nextPageUri: ?string,
} => {
  loadLocalAiRequests();
  const requests = Object.values(localAiRequestsCache);
  requests.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return {
    aiRequests: requests,
    nextPageUri: null,
  };
};

/**
 * Client-side Get AI Request Statuses.
 */
export const customGetAiRequestStatuses = (
  aiRequestIds: Array<string>
): Array<{| id: string, status: GenerationStatus, userId: ?string |}> => {
  return aiRequestIds.map(id => {
    const req = localAiRequestsCache[id];
    return {
      id,
      status: req ? req.status : 'ready',
      userId: LOCAL_BYOK_USER_ID,
    };
  });
};

/**
 * Client-side Suspend AI Request.
 */
export const customSuspendAiRequest = (aiRequestId: string): AiRequest => {
  const existing = localAiRequestsCache[aiRequestId];
  if (existing) {
    existing.status = 'suspended';
    existing.updatedAt = new Date().toISOString();
    saveLocalAiRequests();
    return existing;
  }
  return customGetAiRequest(aiRequestId);
};

/**
 * Client-side Fork AI Request.
 */
export const customForkAiRequest = (
  aiRequestId: string,
  upToMessageId?: string
): AiRequest => {
  const original = localAiRequestsCache[aiRequestId];
  const newReqId = `local-ai-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 7)}`;
  let output = [];

  if (original && original.output) {
    if (upToMessageId) {
      const idx = original.output.findIndex(m => m.messageId === upToMessageId);
      output =
        idx >= 0 ? original.output.slice(0, idx + 1) : [...original.output];
    } else {
      output = [...original.output];
    }
  }

  const now = new Date().toISOString();
  const forked: AiRequest = {
    ...(original || {}),
    id: newReqId,
    createdAt: now,
    updatedAt: now,
    userId: LOCAL_BYOK_USER_ID,
    status: 'ready',
    forkedFromAiRequestId: aiRequestId,
    output,
  };

  localAiRequestsCache[newReqId] = forked;
  saveLocalAiRequests();
  return forked;
};

/**
 * Client-side Suggestions Generator.
 */
export const customGetAiRequestSuggestions = async (
  aiRequestId: string
): Promise<{|
  ...AiRequest,
  suggestions: Array<{| title: string, suggestedMessage: string |}>,
  explanationMessage: string,
|}> => {
  const req = customGetAiRequest(aiRequestId);
  const defaultSuggestions = {
    explanationMessage: 'Here are some things you can do next:',
    suggestions: [
      {
        title: 'Add Movement',
        suggestedMessage: 'Add top-down movement behavior',
      },
      {
        title: 'Add Collisions',
        suggestedMessage: 'Add collision events between player and obstacles',
      },
      {
        title: 'Add Sound Effects',
        suggestedMessage: 'Play a sound when collecting items',
      },
    ],
  };

  try {
    const prompt = `Based on the current GDevelop game project and conversation, provide 2 to 3 concise, helpful next step suggestions for the game creator.
Return your response STRICTLY as a JSON object with this format:
{
  "explanationMessage": "Here are some things you can do next:",
  "suggestions": [
    { "title": "Add Enemy Patrol", "suggestedMessage": "Add an enemy with patrol behavior" },
    { "title": "Add Sound Effects", "suggestedMessage": "Play sound when collecting coins" }
  ]
}`;

    const res = await sendChatCompletion({
      messages: [
        ...transformGDevelopMessagesToOpenAi(req.output || []),
        { role: 'user', content: prompt },
      ],
    });

    const clean = (res.content || '')
      .replace(/```(?:json)?/gi, '')
      .replace(/```/gi, '')
      .trim();
    const parsed: AiRequestSuggestions = JSON.parse(clean);

    if (req.output && req.output.length > 0) {
      const lastMsg = req.output[req.output.length - 1];
      if (lastMsg.type === 'message' && lastMsg.role === 'assistant') {
        lastMsg.suggestions = parsed;
      }
    }
    saveLocalAiRequests();
    return {
      ...req,
      suggestions: parsed.suggestions || defaultSuggestions.suggestions,
      explanationMessage:
        parsed.explanationMessage || defaultSuggestions.explanationMessage,
    };
  } catch (err) {
    return {
      ...req,
      suggestions: defaultSuggestions.suggestions,
      explanationMessage: defaultSuggestions.explanationMessage,
    };
  }
};

/**
 * Client-side Create AI Generated Event implementation.
 */
export const customCreateAiGeneratedEvent = async ({
  sceneName,
  eventsDescription,
  eventBatches,
  extensionNamesList,
  objectsList,
  existingEventsAsText,
}: {|
  sceneName: string,
  eventsDescription: string | null,
  eventBatches?: any,
  extensionNamesList?: string,
  objectsList?: string,
  existingEventsAsText?: string,
|}): Promise<CreateAiGeneratedEventResult> => {
  const prompt = `You are the GDevelop Event Generation Engine.
Generate the GDevelop events in JSON format matching GDevelop's internal event structure for scene "${sceneName}".
Description of events to generate: "${eventsDescription || ''}"
Available Objects: ${objectsList || 'None'}
Available Extensions: ${extensionNamesList || 'Builtin'}
Existing Events in Scene:
${existingEventsAsText || 'None'}

Return a valid JSON object with the following structure:
{
  "operationName": "insert",
  "operationTargetEvent": null,
  "generatedEvents": "[]",
  "diagnosticLines": [],
  "undeclaredVariables": [],
  "undeclaredObjectVariables": {},
  "missingObjectBehaviors": {},
  "missingResources": []
}
Ensure generatedEvents is a JSON string of standard GDevelop event objects (e.g. StandardEvent with conditions and actions).`;

  try {
    const res = await sendChatCompletion({
      messages: [
        { role: 'system', content: 'You are a GDevelop 5 Event generator.' },
        { role: 'user', content: prompt },
      ],
    });

    const clean = (res.content || '')
      .replace(/```(?:json)?/gi, '')
      .replace(/```/gi, '')
      .trim();
    let changeData;
    try {
      changeData = JSON.parse(clean);
    } catch (parseErr) {
      changeData = {
        operationName: 'insert',
        operationTargetEvent: null,
        generatedEvents: '[]',
        diagnosticLines: [],
        undeclaredVariables: [],
        undeclaredObjectVariables: {},
        missingObjectBehaviors: {},
        missingResources: [],
      };
    }

    const aiGeneratedEvent: AiGeneratedEvent = {
      id: `local-evt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: LOCAL_BYOK_USER_ID,
      status: 'ready',
      partialGameProjectJson: '',
      eventsDescription: eventsDescription || null,
      eventBatches: eventBatches || null,
      extensionNamesList: extensionNamesList || '',
      objectsList: objectsList || '',
      existingEventsAsText: existingEventsAsText || '',
      existingEventsJson: null,
      existingEventsJsonUserRelativeKey: null,
      resultMessage: 'Events generated locally via custom AI endpoint.',
      changes: [
        {
          operationName: changeData.operationName || 'insert',
          operationTargetEvent: changeData.operationTargetEvent || null,
          isEventsJsonValid: true,
          generatedEvents:
            typeof changeData.generatedEvents === 'string'
              ? changeData.generatedEvents
              : JSON.stringify(changeData.generatedEvents || []),
          areEventsValid: true,
          extensionNames: changeData.extensionNames || [],
          diagnosticLines: changeData.diagnosticLines || [],
          undeclaredVariables: changeData.undeclaredVariables || [],
          undeclaredObjectVariables: changeData.undeclaredObjectVariables || {},
          missingObjectBehaviors: changeData.missingObjectBehaviors || {},
          missingResources: changeData.missingResources || [],
        },
      ],
      error: null,
      stats: null,
    };

    return {
      creationSucceeded: true,
      aiGeneratedEvent,
    };
  } catch (error) {
    return {
      creationSucceeded: false,
      errorMessage:
        error.message || 'Failed to generate events with custom AI endpoint.',
    };
  }
};

/**
 * Test connectivity with the configured custom endpoint.
 */
export const testConnection = async (
  customConfig?: $Shape<CustomAIConfig>
): Promise<{|
  success: boolean,
  message: string,
  models?: Array<string>,
|}> => {
  const config = {
    ...getCustomEndpointConfig(),
    ...(customConfig || {}),
  };
  const baseUrl = normalizeBaseUrl(config.baseUrl);

  // First attempt: Try GET /models
  try {
    const modelsUrl = getEndpointUrl(baseUrl, '/models');
    const headers: { [string]: string } = {
      'HTTP-Referer': 'https://gdevelop.io',
      'X-Title': 'GDevelop IDE',
      ...(config.customHeaders || {}),
    };
    if (config.apiKey && config.apiKey.trim()) {
      headers['Authorization'] = `Bearer ${config.apiKey.trim()}`;
    }

    const response = await axios.get(modelsUrl, { headers, timeout: 5000 });
    if (response.status === 200 && response.data) {
      const data = response.data.data || response.data.models || response.data;
      const models = Array.isArray(data)
        ? data.map(item => item.id || item.name || String(item)).filter(Boolean)
        : [];
      return {
        success: true,
        message: `Successfully connected to endpoint. Found ${
          models.length
        } model(s).`,
        models,
      };
    }
  } catch (err) {
    // If /models failed, fallback to a lightweight completion test
  }

  // Second attempt: Minimal chat completion
  try {
    const res = await sendChatCompletion({
      messages: [{ role: 'user', content: 'Say "OK"' }],
      config,
    });
    return {
      success: true,
      message: `Successfully connected! Model responded: ${res.content ||
        'OK'}`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Connection failed: ${err.message ||
        'Failed to connect to custom endpoint.'}`,
    };
  }
};

/**
 * Client-side Asset Search.
 */
export const customCreateAssetSearch = async ({
  searchTerms,
  objectType,
}: {|
  searchTerms: string,
  objectType?: string | null,
|}): Promise<AssetSearch> => {
  return {
    id: `local-asset-search-${Date.now()}`,
    userId: LOCAL_BYOK_USER_ID,
    createdAt: new Date().toISOString(),
    query: {
      searchTerms: [searchTerms],
      objectType: objectType || '',
      description: null,
      twoDimensionalViewKind: null,
      relatedAiRequestId: null,
      lastUserMessage: null,
      lastAssistantMessages: [],
    },
    status: 'completed',
    results: [],
  };
};

/**
 * Client-side Resource Search.
 */
export const customCreateResourceSearch = async ({
  searchTerms,
  resourceKind,
}: {|
  searchTerms: string,
  resourceKind: string,
|}): Promise<ResourceSearch> => {
  return {
    id: `local-resource-search-${Date.now()}`,
    userId: LOCAL_BYOK_USER_ID,
    createdAt: new Date().toISOString(),
    query: {
      searchTerms: [searchTerms],
      resourceKind,
    },
    status: 'completed',
    results: [],
  };
};

/**
 * Default fallback AI configuration presets when offline or in custom endpoint mode.
 */
export const DEFAULT_LOCAL_AI_SETTINGS: AiSettings = {
  aiRequest: {
    presets: [
      {
        mode: 'orchestrator',
        id: 'default',
        nameByLocale: { en: 'Custom / BYOK AI (Default)' },
        disabled: false,
        isDefault: true,
      },
      {
        mode: 'chat',
        id: 'chat-default',
        nameByLocale: { en: 'Custom / BYOK Chat' },
        disabled: false,
        isDefault: true,
      },
      {
        mode: 'agent',
        id: 'agent-default',
        nameByLocale: { en: 'Custom / BYOK Agent' },
        disabled: false,
        isDefault: true,
      },
    ],
  },
};
