// Types that match GDevelop's Generation API format

export interface AiRequestFunctionCall {
  type: 'function_call';
  status: 'completed';
  call_id: string;
  name: string;
  arguments: string;
}

export interface AiRequestFunctionCallOutput {
  type: 'function_call_output';
  call_id: string;
  output: string;
}

export interface AiRequestAssistantMessage {
  type: 'message';
  status: 'completed';
  role: 'assistant';
  content: Array<
    | { type: 'reasoning'; status: 'completed'; summary: { text: string; type: 'summary_text' } }
    | { type: 'output_text'; status: 'completed'; text: string; annotations: any[] }
    | AiRequestFunctionCall
  >;
  suggestions?: any;
}

export interface AiRequestUserMessage {
  type: 'message';
  status: 'completed';
  role: 'user';
  content: Array<{ type: 'user_request'; status: 'completed'; text: string }>;
}

export type AiRequestMessage =
  | AiRequestAssistantMessage
  | AiRequestUserMessage
  | AiRequestFunctionCallOutput;

export interface AiRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  gameId?: string | null;
  gameProjectJson?: string | null;
  status: 'working' | 'ready' | 'error';
  mode?: 'chat' | 'agent';
  toolsVersion?: string;
  toolOptions?: {
    includeEventsJson?: boolean;
    watchPollingIntervalInMs?: number;
  } | null;
  error: { code: string; message: string } | null;
  output: AiRequestMessage[];
  lastUserMessagePriceInCredits?: number | null;
  totalPriceInCredits?: number | null;
}

export interface ClaudeResponse {
  text?: string;
  functionCalls?: Array<{
    call_id: string;
    name: string;
    arguments: string;
  }>;
}
