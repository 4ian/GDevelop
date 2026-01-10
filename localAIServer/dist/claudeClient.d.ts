import { ClaudeResponse } from './types.js';
export declare class ClaudeAgentClient {
    private toolCallCounter;
    query(messages: Array<{
        role: string;
        content: string;
    }>, gameProjectJson: string | null, mode: 'chat' | 'agent'): Promise<ClaudeResponse>;
    private extractFunctionCalls;
}
