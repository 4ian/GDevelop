import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { ClaudeResponse } from './types.js';

// GDevelop tool definitions for Claude Agent SDK
const gdevelopTools = [
  tool(
    'create_scene',
    'Create a new scene/level in the game project',
    {
      scene_name: z.string().describe('Name of the new scene to create'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, scene_name: args.scene_name }) }],
    })
  ),

  tool(
    'create_object',
    'Create a new game object (Sprite, TiledSprite, Text, etc.)',
    {
      scene_name: z.string().describe('Name of the scene to add the object to'),
      object_type: z.string().describe('Type of object: Sprite, TiledSpriteObject::TiledSprite, TextObject::Text, etc.'),
      object_name: z.string().describe('Name for the new object'),
      target_object_scope: z.enum(['scene', 'global']).optional().describe('Scope of the object'),
      description: z.string().optional().describe('Description to search for assets'),
      search_terms: z.string().optional().describe('Search terms for asset store'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, object_name: args.object_name }) }],
    })
  ),

  tool(
    'add_behavior',
    'Add a behavior to an existing object',
    {
      scene_name: z.string().describe('Name of the scene'),
      object_name: z.string().describe('Name of the object to add behavior to'),
      behavior_type: z.string().describe('Type of behavior: PlatformBehavior::PlatformerObjectBehavior, TopDownMovementBehavior::TopDownMovementBehavior, etc.'),
      behavior_name: z.string().describe('Name for the behavior instance'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, behavior_name: args.behavior_name }) }],
    })
  ),

  tool(
    'put_2d_instances',
    'Place 2D object instances in a scene',
    {
      scene_name: z.string().describe('Name of the scene'),
      object_name: z.string().describe('Name of the object to place'),
      layer_name: z.string().optional().describe('Layer to place on (empty for base layer)'),
      brush_kind: z.enum(['point', 'line', 'grid', 'random_in_circle', 'erase']).optional().describe('Placement brush type'),
      brush_position: z.object({ x: z.number(), y: z.number() }).optional().describe('Position for point placement'),
      x: z.number().optional().describe('X position (shorthand)'),
      y: z.number().optional().describe('Y position (shorthand)'),
      instances_size: z.object({ width: z.number(), height: z.number() }).optional().describe('Size of instances'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, placed: true }) }],
    })
  ),

  tool(
    'add_scene_events',
    'Add game logic events to a scene using natural language description',
    {
      scene_name: z.string().describe('Name of the scene'),
      events_description: z.string().describe('Natural language description of the events/logic to add'),
      extension_names_list: z.string().optional().describe('Comma-separated list of extensions needed'),
      objects_list: z.string().optional().describe('Comma-separated list of objects involved'),
      placement_hint: z.string().optional().describe('Where to place: "at_the_beginning", "at_the_end"'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, events_added: true }) }],
    })
  ),

  tool(
    'read_scene_events',
    'Read the current events/logic from a scene',
    {
      scene_name: z.string().describe('Name of the scene to read events from'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, events: '(events would be here)' }) }],
    })
  ),

  tool(
    'change_object_property',
    'Change properties of an existing object',
    {
      scene_name: z.string().describe('Name of the scene'),
      object_name: z.string().describe('Name of the object to modify'),
      changed_properties: z.array(z.object({
        property_name: z.string(),
        property_value: z.any(),
      })).describe('Array of properties to change'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true }) }],
    })
  ),

  tool(
    'add_or_edit_variable',
    'Add or edit a game variable',
    {
      variable_scope: z.enum(['global', 'scene']).describe('Scope of the variable'),
      scene_name: z.string().optional().describe('Scene name if scope is scene'),
      variable_name: z.string().describe('Name of the variable'),
      variable_type: z.enum(['number', 'string', 'boolean', 'structure', 'array']).describe('Type of the variable'),
      variable_value: z.any().optional().describe('Initial value'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, variable_name: args.variable_name }) }],
    })
  ),

  tool(
    'change_scene_properties_layers_effects_groups',
    'Modify scene properties, layers, effects, or object groups',
    {
      scene_name: z.string().describe('Name of the scene'),
      changes: z.object({
        add_layers: z.array(z.object({ name: z.string(), visibility: z.boolean().optional() })).optional(),
        remove_layers: z.array(z.string()).optional(),
        add_effects: z.array(z.any()).optional(),
        background_color: z.string().optional(),
      }).describe('Changes to apply'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true }) }],
    })
  ),

  tool(
    'initialize_project',
    'Initialize a new game project from scratch',
    {
      project_name: z.string().describe('Name for the new project'),
      orientation: z.enum(['landscape', 'portrait']).optional().describe('Game orientation'),
      resolution: z.object({ width: z.number(), height: z.number() }).optional().describe('Game resolution'),
    },
    async (args) => ({
      content: [{ type: 'text', text: JSON.stringify({ success: true, project_name: args.project_name }) }],
    })
  ),
];

// Create MCP server with GDevelop tools
const gdevelopMcpServer = createSdkMcpServer({
  name: 'gdevelop-tools',
  version: '1.0.0',
  tools: gdevelopTools,
});

// System prompt for GDevelop AI
const GDEVELOP_SYSTEM_PROMPT = `You are an AI assistant specialized in creating games with GDevelop 5.
You help users create game projects by using the available tools.

Available tools:
- create_scene: Create new scenes/levels
- create_object: Create game objects (Sprite, Text, TiledSprite, etc.)
- add_behavior: Add behaviors to objects (PlatformBehavior, TopDownMovement, etc.)
- put_2d_instances: Place objects in scenes at specific positions
- add_scene_events: Add game logic using natural language descriptions
- read_scene_events: Read existing events from a scene
- change_object_property: Modify object properties
- add_or_edit_variable: Create/modify game variables
- change_scene_properties_layers_effects_groups: Modify scene settings
- initialize_project: Create a new project

When the user asks you to create something, use the appropriate tools.
Always explain what you're doing and why.

Common behavior types:
- PlatformBehavior::PlatformerObjectBehavior - For platformer player characters
- PlatformBehavior::PlatformBehavior - For platforms
- TopDownMovementBehavior::TopDownMovementBehavior - For top-down games
- Physics2::Physics2Behavior - For physics-based objects

Common object types:
- Sprite - Animated sprite objects
- TiledSpriteObject::TiledSprite - Repeating tile patterns
- TextObject::Text - Text display
- PanelSpriteObject::PanelSprite - 9-slice panel sprites
`;

export class ClaudeAgentClient {
  private toolCallCounter = 0;

  async query(
    messages: Array<{ role: string; content: string }>,
    gameProjectJson: string | null,
    mode: 'chat' | 'agent'
  ): Promise<ClaudeResponse> {
    // Build the prompt with context
    let contextPrompt = '';
    if (gameProjectJson) {
      try {
        const project = JSON.parse(gameProjectJson);
        contextPrompt = `\n\nCurrent project context:\n${JSON.stringify(project, null, 2).slice(0, 4000)}...\n\n`;
      } catch {
        // Ignore parse errors
      }
    }

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      return { text: 'No user message found.' };
    }

    const fullPrompt = `${GDEVELOP_SYSTEM_PROMPT}${contextPrompt}User request: ${lastUserMessage.content}`;

    const response: ClaudeResponse = {
      functionCalls: [],
    };

    try {
      // Use async generator for streaming input
      async function* generateMessages() {
        yield {
          type: 'user' as const,
          message: {
            role: 'user' as const,
            content: fullPrompt,
          },
        };
      }

      // Query Claude with GDevelop tools
      for await (const message of query({
        prompt: generateMessages(),
        options: {
          mcpServers: {
            'gdevelop-tools': gdevelopMcpServer,
          },
          maxTurns: mode === 'agent' ? 10 : 3,
        },
      })) {
        // Process different message types
        if (message.type === 'assistant') {
          // Extract text content
          if (message.message?.content) {
            for (const block of message.message.content) {
              if (block.type === 'text') {
                response.text = (response.text || '') + block.text;
              } else if (block.type === 'tool_use') {
                // Convert tool use to GDevelop function call format
                response.functionCalls!.push({
                  call_id: `tool_${this.toolCallCounter++}_${block.name}`,
                  name: block.name,
                  arguments: JSON.stringify(block.input),
                });
              }
            }
          }
        } else if (message.type === 'result') {
          if (message.subtype === 'success' && message.result) {
            response.text = (response.text || '') + '\n' + message.result;
          } else if (message.subtype === 'error') {
            response.text = `Error: ${message.error}`;
          }
        }
      }

      return response;
    } catch (error: any) {
      console.error('Claude query error:', error);
      throw error;
    }
  }
}
