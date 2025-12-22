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
  type CopilotAgent,
  type AgentRequest,
  type AgentContext,
  type AgentResponse,
  type CodeSuggestion,
} from './CopilotAgents';

export {
  conversationManager,
  getCurrentEditorContext,
  updateContextWithEditor,
  type ConversationMessage,
  type ConversationThread,
} from './ConversationManager';
