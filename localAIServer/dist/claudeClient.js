import { query } from '@anthropic-ai/claude-agent-sdk';
// System prompt for GDevelop AI
const GDEVELOP_SYSTEM_PROMPT = `You are an AI assistant specialized in creating games with GDevelop 5.
You help users create game projects. When you need to perform actions, output them as JSON function calls.

Available functions (output as JSON with format {"function": "name", "args": {...}}):
- create_scene: {"scene_name": string}
- create_object: {"scene_name": string, "object_type": string, "object_name": string, "description"?: string}
- add_behavior: {"scene_name": string, "object_name": string, "behavior_type": string, "behavior_name": string}
- put_2d_instances: {"scene_name": string, "object_name": string, "x": number, "y": number}
- add_scene_events: {"scene_name": string, "events_description": string}
- read_scene_events: {"scene_name": string}
- initialize_project: {"project_name": string}

Common behavior types:
- PlatformBehavior::PlatformerObjectBehavior - For platformer player characters
- PlatformBehavior::PlatformBehavior - For platforms
- TopDownMovementBehavior::TopDownMovementBehavior - For top-down games

Common object types:
- Sprite - Animated sprite objects
- TiledSpriteObject::TiledSprite - Repeating tile patterns
- TextObject::Text - Text display
`;
export class ClaudeAgentClient {
    toolCallCounter = 0;
    async query(messages, gameProjectJson, mode) {
        // Build the prompt with context
        let contextPrompt = '';
        if (gameProjectJson) {
            try {
                const project = JSON.parse(gameProjectJson);
                contextPrompt = `\n\nCurrent project context:\n${JSON.stringify(project, null, 2).slice(0, 4000)}...\n\n`;
            }
            catch {
                // Ignore parse errors
            }
        }
        // Get the last user message
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (!lastUserMessage) {
            return { text: 'No user message found.' };
        }
        const fullPrompt = `${GDEVELOP_SYSTEM_PROMPT}${contextPrompt}User request: ${lastUserMessage.content}`;
        const response = {
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
                    const msgContent = message.message?.content;
                    if (msgContent && Array.isArray(msgContent)) {
                        for (const block of msgContent) {
                            if (block.type === 'text') {
                                response.text = (response.text || '') + block.text;
                                // Try to extract function calls from text
                                const functionCalls = this.extractFunctionCalls(block.text);
                                if (functionCalls.length > 0) {
                                    response.functionCalls.push(...functionCalls);
                                }
                            }
                            else if (block.type === 'tool_use') {
                                // Convert tool use to GDevelop function call format
                                response.functionCalls.push({
                                    call_id: `tool_${this.toolCallCounter++}_${block.name}`,
                                    name: block.name,
                                    arguments: JSON.stringify(block.input),
                                });
                            }
                        }
                    }
                }
                else if (message.type === 'result') {
                    const resultMsg = message;
                    if (resultMsg.subtype === 'success' && resultMsg.result) {
                        response.text = (response.text || '') + '\n' + resultMsg.result;
                    }
                    else if (resultMsg.subtype === 'error_during_execution') {
                        response.text = `Error: ${resultMsg.error || 'Unknown error'}`;
                    }
                }
            }
            return response;
        }
        catch (error) {
            console.error('Claude query error:', error);
            throw error;
        }
    }
    extractFunctionCalls(text) {
        const calls = [];
        // Look for JSON function calls in the text
        const jsonRegex = /\{"function"\s*:\s*"([^"]+)"\s*,\s*"args"\s*:\s*(\{[^}]+\})\}/g;
        let match;
        while ((match = jsonRegex.exec(text)) !== null) {
            const [, funcName, argsJson] = match;
            calls.push({
                call_id: `tool_${this.toolCallCounter++}_${funcName}`,
                name: funcName,
                arguments: argsJson,
            });
        }
        return calls;
    }
}
