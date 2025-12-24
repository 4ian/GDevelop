// @flow
/**
 * Copilot Chat Module
 * VS Code Copilot Chat-inspired AI assistance for GDevelop
 * Based on concepts from microsoft/vscode-copilot-chat
 */

export { default as CopilotChatPanel } from './CopilotChatPanel';

export {
  COPILOT_AGENTS,
  getAgentById,
  getAgentByCommand,
  getDefaultAgent,
  parseCommand,
} from './CopilotAgents';

export type {
  CopilotAgent,
  AgentRequest,
  AgentContext,
  AgentResponse,
  CodeSuggestion,
} from './CopilotAgents';

export {
  conversationManager,
  getCurrentEditorContext,
  updateContextWithEditor,
} from './ConversationManager';

export type {
  ConversationMessage,
  ConversationThread,
} from './ConversationManager';
