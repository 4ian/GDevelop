// @flow
/**
 * Copilot Chat Enhanced UI
 * UI components for VS Code Copilot Chat-style interactions
 */

import * as React from 'react';
import { I18n } from '@lingui/react';
import { t, Trans } from '@lingui/macro';
import { Column, Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import TextField from '../../UI/TextField';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import IconButton from '../../UI/IconButton';
import Paper from '../../UI/Paper';
import {
  COPILOT_AGENTS,
  getAgentByCommand,
  getDefaultAgent,
  parseCommand,
  type CopilotAgent,
  type AgentResponse,
} from './CopilotAgents';
import {
  conversationManager,
  getCurrentEditorContext,
  type ConversationThread,
  type ConversationMessage,
} from './ConversationManager';

type Props = {|
  onSuggestionApply?: (code: string) => void,
  editorContext?: any,
|};

const CopilotChatPanel = ({ onSuggestionApply, editorContext }: Props) => {
  const [input, setInput] = React.useState('');
  const [activeThread, setActiveThread] = React.useState<?ConversationThread>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedAgent, setSelectedAgent] = React.useState<?CopilotAgent>(null);
  const messagesEndRef = React.useRef<?HTMLDivElement>(null);

  // Initialize or get active thread
  React.useEffect(() => {
    let thread = conversationManager.getActiveThread();
    
    if (!thread) {
      const context = getCurrentEditorContext();
      const threadId = conversationManager.createThread(context, 'Copilot Chat');
      thread = conversationManager.getThread(threadId);
    }
    
    setActiveThread(thread);
  }, []);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread?.messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || !activeThread) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    try {
      // Parse command if present
      const { command, prompt } = parseCommand(userMessage);

      // Add user message to thread
      conversationManager.addMessage(
        activeThread.id,
        'user',
        userMessage,
        editorContext
      );

      // Get appropriate agent
      let agent = selectedAgent;
      
      if (command) {
        agent = getAgentByCommand(command) || getDefaultAgent();
      } else if (!agent) {
        agent = getDefaultAgent();
      }

      // Build contextual request
      const request = conversationManager.buildContextualRequest(
        activeThread.id,
        prompt,
        command || undefined,
        editorContext
      );

      // Invoke agent
      const response: AgentResponse = await agent.invoke(request);

      // Add assistant response
      conversationManager.addMessage(
        activeThread.id,
        'assistant',
        response.content,
        undefined,
        response.suggestions
      );

      // Update active thread
      const updatedThread = conversationManager.getThread(activeThread.id);
      setActiveThread(updatedThread);
    } catch (error) {
      console.error('Error processing message:', error);
      conversationManager.addMessage(
        activeThread.id,
        'assistant',
        `Error: ${error.message || 'Failed to process request'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplySuggestion = (code: string) => {
    if (onSuggestionApply) {
      onSuggestionApply(code);
    }
  };

  const handleNewConversation = () => {
    const context = getCurrentEditorContext();
    const threadId = conversationManager.createThread(context, 'New Chat');
    const thread = conversationManager.getThread(threadId);
    setActiveThread(thread);
    setSelectedAgent(null);
  };

  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <Line
        key={message.id}
        justifyContent={isUser ? 'flex-end' : 'flex-start'}
        noMargin
      >
        <Paper
          background={isUser ? 'light' : 'medium'}
          style={{
            maxWidth: '80%',
            padding: 12,
            marginBottom: 8,
          }}
        >
          <Column noMargin>
            <Text size="body">
              {message.content}
            </Text>
            
            {message.suggestions && message.suggestions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Column noMargin>
                  {message.suggestions.map((suggestion, idx) => (
                  <Paper key={idx} background="dark" style={{ padding: 8, marginTop: 4 }}>
                    <div style={{ fontFamily: 'monospace' }}>
                      <Text size="body-small" style={{ whiteSpace: 'pre-wrap' }}>
                        {suggestion.code}
                      </Text>
                    </div>
                    <Line justifyContent="space-between" alignItems="center">
                      <Text size="body-small" color="secondary">
                        {suggestion.description}
                      </Text>
                      <FlatButton
                        label={<Trans>Apply</Trans>}
                        onClick={() => handleApplySuggestion(suggestion.code)}
                        primary
                      />
                    </Line>
                  </Paper>
                ))}
              </Column>
              </div>
            )}
            
            <Text size="body-small" color="secondary">
              {new Date(message.timestamp).toLocaleTimeString()}
            </Text>
          </Column>
        </Paper>
      </Line>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Column expand noMargin>
          {/* Header */}
          <Line justifyContent="space-between" alignItems="center">
            <Text size="block-title">
              <Trans>Copilot Chat</Trans>
            </Text>
            <Line>
              <FlatButton
                label={<Trans>New Chat</Trans>}
                onClick={handleNewConversation}
              />
            </Line>
          </Line>

          {/* Agent Selector */}
          <Line>
            <Text size="body-small" color="secondary">
              <Trans>Available Commands:</Trans>
            </Text>
            {COPILOT_AGENTS.map(agent => (
              <FlatButton
                key={agent.id}
                label={agent.supportedCommands[0]}
                onClick={() => setSelectedAgent(agent)}
                primary={selectedAgent?.id === agent.id}
              />
            ))}
          </Line>

          {/* Messages */}
          <div
            style={{
              overflowY: 'auto',
              padding: 8,
              minHeight: 300,
              maxHeight: 500,
            }}
          >
            <Column expand noMargin>
              {activeThread?.messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </Column>
          </div>

          {/* Input */}
          <Line noMargin>
            <TextField
              value={input}
              onChange={(e, value) => setInput(value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              hintText={i18n._(
                t`Ask Copilot... (use /command for specific actions)`
              )}
              fullWidth
              multiline
              disabled={isProcessing}
            />
            <RaisedButton
              label={<Trans>Send</Trans>}
              onClick={handleSendMessage}
              primary
              disabled={!input.trim() || isProcessing}
            />
          </Line>

          {/* Help */}
          <Text size="body-small" color="secondary">
            <Trans>
              Commands: /generate, /explain, /fix, /test, /refactor, /doc
            </Trans>
          </Text>
        </Column>
      )}
    </I18n>
  );
};

export default CopilotChatPanel;