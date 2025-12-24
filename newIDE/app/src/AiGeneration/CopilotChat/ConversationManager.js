// @flow
/**
 * Copilot Chat Context Manager
 * Manages conversation history, context, and intelligent code assistance
 * Based on VS Code Copilot Chat context system
 */

import type { AgentContext, AgentRequest } from './CopilotAgents';

export type ConversationMessage = {|
  id: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  timestamp: number,
  context?: AgentContext,
  suggestions?: Array<any>,
|};

export type ConversationThread = {|
  id: string,
  title: string,
  messages: Array<ConversationMessage>,
  createdAt: number,
  updatedAt: number,
  context: AgentContext,
|};

/**
 * Conversation Manager
 * Handles conversation threads and history
 */
class ConversationManager {
  threads: Map<string, ConversationThread>;
  activeThreadId: ?string;
  maxThreads: number;
  maxMessagesPerThread: number;

  constructor() {
    this.threads = new Map();
    this.activeThreadId = null;
    this.maxThreads = 50;
    this.maxMessagesPerThread = 100;
    
    this.loadFromStorage();
  }

  /**
   * Create a new conversation thread
   */
  createThread(context: AgentContext, title?: string): string {
    const threadId = `thread-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const thread: ConversationThread = {
      id: threadId,
      title: title || 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      context,
    };
    
    this.threads.set(threadId, thread);
    this.activeThreadId = threadId;
    
    // Cleanup old threads if exceeding limit
    if (this.threads.size > this.maxThreads) {
      this.cleanupOldThreads();
    }
    
    this.saveToStorage();
    return threadId;
  }

  /**
   * Add message to thread
   */
  addMessage(
    threadId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    context?: AgentContext,
    suggestions?: Array<any>
  ): void {
    const thread = this.threads.get(threadId);
    if (!thread) return;

    const message: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      role,
      content,
      timestamp: Date.now(),
      context,
      suggestions,
    };

    thread.messages.push(message);
    thread.updatedAt = Date.now();

    // Update thread title from first user message
    if (thread.messages.length === 1 && role === 'user') {
      thread.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
    }

    // Cleanup old messages if exceeding limit
    if (thread.messages.length > this.maxMessagesPerThread) {
      thread.messages = thread.messages.slice(-this.maxMessagesPerThread);
    }

    this.saveToStorage();
  }

  /**
   * Get thread by ID
   */
  getThread(threadId: string): ?ConversationThread {
    return this.threads.get(threadId);
  }

  /**
   * Get active thread
   */
  getActiveThread(): ?ConversationThread {
    if (!this.activeThreadId) return null;
    return this.threads.get(this.activeThreadId);
  }

  /**
   * Set active thread
   */
  setActiveThread(threadId: string): void {
    if (this.threads.has(threadId)) {
      this.activeThreadId = threadId;
      this.saveToStorage();
    }
  }

  /**
   * Get all threads
   */
  getAllThreads(): Array<ConversationThread> {
    return Array.from(this.threads.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Delete thread
   */
  deleteThread(threadId: string): void {
    this.threads.delete(threadId);
    
    if (this.activeThreadId === threadId) {
      const remaining = this.getAllThreads();
      this.activeThreadId = remaining.length > 0 ? remaining[0].id : null;
    }
    
    this.saveToStorage();
  }

  /**
   * Clear all threads
   */
  clearAll(): void {
    this.threads.clear();
    this.activeThreadId = null;
    this.saveToStorage();
  }

  /**
   * Get conversation history for context
   */
  getConversationHistory(threadId: string, limit: number = 10): Array<ConversationMessage> {
    const thread = this.threads.get(threadId);
    if (!thread) return [];
    
    return thread.messages.slice(-limit);
  }

  /**
   * Build context-aware request
   */
  buildContextualRequest(
    threadId: string,
    prompt: string,
    command?: string,
    additionalContext?: $Shape<AgentContext>
  ): AgentRequest {
    const thread = this.threads.get(threadId);
    const history = this.getConversationHistory(threadId, 5);
    
    // Merge thread context with additional context
    const context: AgentContext = ({
      ...(thread?.context || {}),
      ...(additionalContext || {}),
    }: any);
    
    // Extract variables from context
    const variables = {};
    
    if (context.selectedCode) {
      variables.selectedCode = context.selectedCode;
    }
    
    if (context.currentFile) {
      variables.currentFile = context.currentFile;
    }
    
    // Add conversation history as context
    if (history.length > 0) {
      variables.previousMessages = history.map(m => ({
        role: m.role,
        content: m.content,
      }));
    }
    
    return {
      prompt,
      command,
      context,
      variables,
    };
  }

  /**
   * Cleanup old threads
   */
  cleanupOldThreads(): void {
    const threads = this.getAllThreads();
    
    // Keep only the most recent threads
    const toDelete = threads.slice(this.maxThreads);
    
    toDelete.forEach(thread => {
      this.threads.delete(thread.id);
    });
  }

  /**
   * Save to localStorage
   */
  saveToStorage(): void {
    try {
      const data = {
        threads: Array.from(this.threads.entries()),
        activeThreadId: this.activeThreadId,
      };
      
      localStorage.setItem('copilot-conversations', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  /**
   * Load from localStorage
   */
  loadFromStorage(): void {
    try {
      const data = localStorage.getItem('copilot-conversations');
      
      if (data) {
        const parsed = JSON.parse(data);
        
        if (parsed.threads) {
          this.threads = new Map(parsed.threads);
        }
        
        if (parsed.activeThreadId) {
          this.activeThreadId = parsed.activeThreadId;
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  /**
   * Export conversations
   */
  exportConversations(): string {
    const data = {
      threads: this.getAllThreads(),
      exportedAt: Date.now(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import conversations
   */
  importConversations(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.threads && Array.isArray(data.threads)) {
        data.threads.forEach(thread => {
          this.threads.set(thread.id, thread);
        });
        
        this.saveToStorage();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      return false;
    }
  }
}

// Global conversation manager instance
export const conversationManager = new ConversationManager();

/**
 * Get current editor context
 * This would integrate with the actual editor
 */
export const getCurrentEditorContext = (): AgentContext => {
  // Placeholder - would get real editor state
  return {
    projectPath: undefined,
    currentFile: undefined,
    selectedCode: undefined,
    cursorPosition: undefined,
    openFiles: [],
    recentFiles: [],
  };
};

/**
 * Update context with editor state
 */
export const updateContextWithEditor = (
  baseContext: AgentContext,
  editorState: any
): AgentContext => {
  return {
    ...baseContext,
    currentFile: editorState.currentFile || baseContext.currentFile,
    selectedCode: editorState.selectedText || baseContext.selectedCode,
    cursorPosition: editorState.cursorPosition || baseContext.cursorPosition,
  };
};