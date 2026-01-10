import { query } from '@anthropic-ai/claude-agent-sdk';
import { ClaudeResponse } from './types.js';

// System prompt for GDevelop AI
const GDEVELOP_SYSTEM_PROMPT = `You are an AI game developer that creates games with GDevelop 5.
When the user describes a game, immediately create it using the function calls below.
DO NOT ask for clarification - use your creativity to fill in any gaps.
DO NOT explain what you're going to do - just output the function calls directly.

Output each function as a JSON code block:
\`\`\`json
{"function": "function_name", "args": {...}}
\`\`\`

Available functions:
- initialize_project: {"project_name": string} - ALWAYS call this first if no project exists
- create_scene: {"scene_name": string}
- create_object: {"scene_name": string, "object_type": string, "object_name": string, "description"?: string}
- add_behavior: {"scene_name": string, "object_name": string, "behavior_type": string, "behavior_name": string}
- put_2d_instances: {"scene_name": string, "object_name": string, "x": number, "y": number}
- add_scene_events: {"scene_name": string, "events_description": string}

Common behavior types:
- PlatformBehavior::PlatformerObjectBehavior - Player characters in platformers
- PlatformBehavior::PlatformBehavior - Solid platforms
- TopDownMovementBehavior::TopDownMovementBehavior - Top-down movement
- DestroyOutsideBehavior::DestroyOutside - Auto-destroy when off-screen

Object types: Sprite, TiledSpriteObject::TiledSprite, TextObject::Text

IMPORTANT: Output ALL function calls needed to create a complete, playable game. Include:
1. Project initialization
2. Main game scene
3. All game objects with appropriate behaviors
4. Object instances placed in the scene
5. Game logic events
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
      // Query Claude with simple string prompt
      for await (const message of query({
        prompt: fullPrompt,
        options: {
          maxTurns: mode === 'agent' ? 10 : 3,
        },
      })) {
        // Process different message types
        if (message.type === 'assistant') {
          // Extract text content
          const msgContent = (message as any).message?.content;
          if (msgContent && Array.isArray(msgContent)) {
            for (const block of msgContent) {
              if (block.type === 'text') {
                response.text = (response.text || '') + block.text;

                // Try to extract function calls from text
                const functionCalls = this.extractFunctionCalls(block.text);
                if (functionCalls.length > 0) {
                  response.functionCalls!.push(...functionCalls);
                }
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
          const resultMsg = message as any;
          if (resultMsg.subtype === 'success' && resultMsg.result) {
            response.text = (response.text || '') + '\n' + resultMsg.result;
          } else if (resultMsg.subtype === 'error_during_execution') {
            response.text = `Error: ${resultMsg.error || 'Unknown error'}`;
          }
        }
      }

      return response;
    } catch (error: any) {
      console.error('Claude query error:', error);
      throw error;
    }
  }

  private extractFunctionCalls(text: string): Array<{ call_id: string; name: string; arguments: string }> {
    const calls: Array<{ call_id: string; name: string; arguments: string }> = [];

    // Extract JSON from code blocks first, then try inline
    const codeBlockRegex = /```(?:json)?\s*(\{[\s\S]*?\})\s*```/g;
    let match;

    // Try code blocks first
    while ((match = codeBlockRegex.exec(text)) !== null) {
      try {
        const json = JSON.parse(match[1]);
        if (json.function && json.args) {
          calls.push({
            call_id: `tool_${this.toolCallCounter++}_${json.function}`,
            name: json.function,
            arguments: JSON.stringify(json.args),
          });
        }
      } catch {
        // Not valid JSON, skip
      }
    }

    // Also try inline JSON (without code blocks)
    // Match {"function": "...", "args": {...}} with proper brace matching
    const inlineRegex = /\{"function"\s*:\s*"([^"]+)"\s*,\s*"args"\s*:\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\}/g;
    while ((match = inlineRegex.exec(text)) !== null) {
      const [fullMatch, funcName, argsJson] = match;
      // Skip if already found in code block
      if (!calls.some(c => c.name === funcName && c.arguments === argsJson)) {
        try {
          JSON.parse(argsJson); // Validate it's valid JSON
          calls.push({
            call_id: `tool_${this.toolCallCounter++}_${funcName}`,
            name: funcName,
            arguments: argsJson,
          });
        } catch {
          // Invalid JSON args, skip
        }
      }
    }

    return calls;
  }
}
