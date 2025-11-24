// @flow
import * as React from 'react';
import { ChatBubble } from './ChatBubble';
import { Line, Spacer } from '../../UI/Grid';
import { ChatMarkdownText } from './ChatMarkdownText';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { getFunctionCallToFunctionCallOutputMap } from '../AiRequestUtils';
import { FunctionCallRow } from './FunctionCallRow';
import { FunctionCallsGroup } from './FunctionCallsGroup';
import IconButton from '../../UI/IconButton';
import Like from '../../UI/CustomSvgIcons/Like';
import Dislike from '../../UI/CustomSvgIcons/Dislike';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
  type AiRequestAssistantMessage,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import {
  type EditorFunctionCallResult,
  type EditorCallbacks,
} from '../../EditorFunctions';
import classes from './ChatMessages.module.css';
import { DislikeFeedbackDialog } from './DislikeFeedbackDialog';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { FeedbackBanner } from './FeedbackBanner';
import Pause from '../../UI/CustomSvgIcons/Pause';
import { getBackgroundColor } from '../../UI/Paper';
import Play from '../../UI/CustomSvgIcons/Play';

const getMessageSuggestionsLines = ({
  aiRequest,
  onUserRequestTextChange,
  disabled,
  message,
  messageIndex,
  onlyShowExplanationMessage,
}: {|
  aiRequest: AiRequest,
  onUserRequestTextChange: (
    userRequestText: string,
    aiRequestIdToChange: string
  ) => void,
  disabled?: boolean,
  message: AiRequestAssistantMessage | AiRequestFunctionCallOutput,
  messageIndex: number,
  onlyShowExplanationMessage?: boolean,
|}) => {
  const lines = [];
  const suggestions = message.suggestions;

  if (suggestions && suggestions.explanationMessage) {
    lines.push(
      <Line
        key={`${messageIndex}-suggestion-message`}
        justifyContent="flex-start"
      >
        <ChatBubble role="assistant">
          <ChatMarkdownText source={suggestions.explanationMessage} />
        </ChatBubble>
      </Line>
    );
  }
  if (
    !onlyShowExplanationMessage &&
    suggestions &&
    suggestions.suggestions.length
  ) {
    lines.push(
      <Line
        key={`${messageIndex}-suggestions-title`}
        justifyContent="flex-start"
        noMargin
      >
        <Text size="sub-title">
          <Trans>What should I do next?</Trans>
        </Text>
      </Line>
    );
    lines.push(
      <Line
        key={`${messageIndex}-suggestions`}
        justifyContent="flex-start"
        noMargin
      >
        <ResponsiveLineStackLayout noMargin>
          {suggestions.suggestions.map((suggestion, suggestionIndex) => (
            <FlatButton
              key={`suggestion-${suggestionIndex}`}
              onClick={() => {
                onUserRequestTextChange(
                  suggestion.suggestedMessage,
                  aiRequest.id
                );
              }}
              label={suggestion.title}
              disabled={disabled}
              color="ai"
            />
          ))}
        </ResponsiveLineStackLayout>
      </Line>
    );
  }

  return lines;
};

type Props = {|
  aiRequest: AiRequest,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string,
    freeFormDetails?: string
  ) => Promise<void>,
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{|
      ignore?: boolean,
    |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
  project: ?gdProject,
  onUserRequestTextChange: (
    userRequestText: string,
    aiRequestIdToChange: string
  ) => void,
  shouldBeWorkingIfNotPaused?: boolean,
  isPaused?: boolean,
  isForAnotherProject?: boolean,
  shouldDisplayFeedbackBanner?: boolean,
  onPause: (pause: boolean) => void,
|};

export const ChatMessages = React.memo<Props>(function ChatMessages({
  aiRequest,
  onSendFeedback,
  editorFunctionCallResults,
  onProcessFunctionCalls,
  editorCallbacks,
  project,
  onUserRequestTextChange,
  shouldBeWorkingIfNotPaused,
  isPaused,
  isForAnotherProject,
  shouldDisplayFeedbackBanner,
  onPause,
}: Props) {
  const theme = React.useContext(GDevelopThemeContext);

  const lastMessageIndex = aiRequest.output.length - 1;
  const lastMessageFeedbackBanner = shouldDisplayFeedbackBanner && (
    <FeedbackBanner
      onSendFeedback={(
        feedback: 'like' | 'dislike',
        reason?: string,
        freeFormDetails?: string
      ) => {
        onSendFeedback(
          aiRequest.id,
          lastMessageIndex,
          feedback,
          reason,
          freeFormDetails
        );
      }}
      key={`feedback-banner-${aiRequest.id}-${lastMessageIndex}`}
    />
  );

  const [messageFeedbacks, setMessageFeedbacks] = React.useState({});
  const [
    dislikeFeedbackDialogOpenedFor,
    setDislikeFeedbackDialogOpenedFor,
  ] = React.useState(null);

  const functionCallToFunctionCallOutput = React.useMemo(
    () =>
      aiRequest
        ? getFunctionCallToFunctionCallOutputMap({
            aiRequest,
          })
        : new Map(),
    [aiRequest]
  );

  // Group consecutive function calls.
  const renderItems = React.useMemo(
    () => {
      const items = [];
      let currentFunctionCallItems = [];

      const flushFunctionCallGroup = () => {
        if (currentFunctionCallItems.length > 0) {
          items.push({
            type: 'function_call_group',
            items: currentFunctionCallItems,
          });
          currentFunctionCallItems = [];
        }
      };

      aiRequest.output.forEach((message, messageIndex) => {
        const isLastMessage = messageIndex === aiRequest.output.length - 1;

        if (message.type === 'message' && message.role === 'user') {
          flushFunctionCallGroup();
          items.push({
            type: 'user_message',
            messageIndex,
            message,
          });
        } else if (message.type === 'message' && message.role === 'assistant') {
          message.content.forEach((messageContent, messageContentIndex) => {
            if (messageContent.type === 'function_call') {
              const existingFunctionCallOutput = functionCallToFunctionCallOutput.get(
                messageContent
              );
              const editorFunctionCallResult =
                (!existingFunctionCallOutput &&
                  editorFunctionCallResults &&
                  editorFunctionCallResults.find(
                    functionCallOutput =>
                      functionCallOutput.call_id === messageContent.call_id
                  )) ||
                null;

              currentFunctionCallItems.push({
                key: `messageIndex${messageIndex}-${messageContentIndex}`,
                messageContent,
                existingFunctionCallOutput,
                editorFunctionCallResult,
              });
            } else {
              flushFunctionCallGroup();
              items.push({
                type: 'message_content',
                messageIndex,
                messageContentIndex,
                message,
                messageContent,
                isLastMessage,
              });
            }
          });
        }

        if (isLastMessage) {
          flushFunctionCallGroup();
        }

        if (
          (message.type === 'function_call_output' ||
            (message.type === 'message' && message.role === 'assistant')) &&
          !!message.suggestions
        ) {
          flushFunctionCallGroup();

          items.push({
            type: 'suggestions',
            messageIndex: messageIndex,
            message: message,
            onlyShowExplanationMessage: !isLastMessage,
          });
        }
      });

      return items;
    },
    [aiRequest, editorFunctionCallResults, functionCallToFunctionCallOutput]
  );

  const isWorking = !!shouldBeWorkingIfNotPaused && !isPaused;
  const disabled = isWorking || isForAnotherProject;

  return (
    <>
      {renderItems
        .flatMap((item, itemIndex) => {
          if (item.type === 'user_message') {
            const { messageIndex, message } = item;
            return [
              <Line key={messageIndex} justifyContent="flex-end">
                <ChatBubble role="user">
                  <ChatMarkdownText
                    source={message.content
                      .map(messageContent => messageContent.text)
                      .join('\n')}
                  />
                </ChatBubble>
              </Line>,
            ];
          }

          if (item.type === 'function_call_group') {
            return [
              <FunctionCallsGroup key={`group-${itemIndex}`}>
                {item.items.map(
                  ({
                    key,
                    messageContent,
                    existingFunctionCallOutput,
                    editorFunctionCallResult,
                  }) => (
                    <FunctionCallRow
                      project={project}
                      key={key}
                      onProcessFunctionCalls={onProcessFunctionCalls}
                      functionCall={messageContent}
                      editorFunctionCallResult={editorFunctionCallResult}
                      existingFunctionCallOutput={existingFunctionCallOutput}
                      editorCallbacks={editorCallbacks}
                    />
                  )
                )}
              </FunctionCallsGroup>,
            ];
          }

          if (item.type === 'message_content') {
            const {
              messageIndex,
              messageContentIndex,
              messageContent,
              isLastMessage,
            } = item;
            const key = `messageIndex${messageIndex}-${messageContentIndex}`;

            if (messageContent.type === 'output_text') {
              const feedbackKey = `${messageIndex}-${messageContentIndex}`;
              const currentFeedback = messageFeedbacks[feedbackKey];

              const trimmedText = messageContent.text.trim();
              if (!trimmedText) {
                return null;
              }

              return [
                <Line key={key} justifyContent="flex-start">
                  <ChatBubble
                    role="assistant"
                    feedbackButtons={
                      <div className={classes.feedbackButtonsContainer}>
                        <IconButton
                          size="small"
                          tooltip={t`Copy`}
                          onClick={() => {
                            navigator.clipboard.writeText(messageContent.text);
                          }}
                        >
                          <Copy fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          tooltip={t`This was helpful`}
                          onClick={() => {
                            setMessageFeedbacks({
                              ...messageFeedbacks,
                              [feedbackKey]: 'like',
                            });
                            onSendFeedback(aiRequest.id, messageIndex, 'like');
                          }}
                        >
                          <Like
                            fontSize="small"
                            htmlColor={
                              currentFeedback === 'like'
                                ? theme.message.valid
                                : undefined
                            }
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          tooltip={t`This needs improvement`}
                          onClick={() => {
                            setMessageFeedbacks({
                              ...messageFeedbacks,
                              [feedbackKey]: 'dislike',
                            });
                            setDislikeFeedbackDialogOpenedFor({
                              aiRequestId: aiRequest.id,
                              messageIndex,
                            });
                          }}
                        >
                          <Dislike
                            fontSize="small"
                            htmlColor={
                              currentFeedback === 'dislike'
                                ? theme.message.warning
                                : undefined
                            }
                          />
                        </IconButton>
                      </div>
                    }
                  >
                    <ChatMarkdownText source={trimmedText} />
                  </ChatBubble>
                </Line>,
                isLastMessage ? lastMessageFeedbackBanner : null,
              ];
            }

            if (messageContent.type === 'reasoning') {
              return [
                <Line key={key} justifyContent="flex-start">
                  <ChatBubble role="assistant">
                    <ChatMarkdownText source={messageContent.summary.text} />
                  </ChatBubble>
                </Line>,
              ];
            }

            return null;
          }

          if (item.type === 'suggestions') {
            const { messageIndex, message, onlyShowExplanationMessage } = item;
            return [
              ...getMessageSuggestionsLines({
                aiRequest,
                onUserRequestTextChange,
                disabled,
                message,
                messageIndex,
                onlyShowExplanationMessage,
              }),
            ];
          }

          return [];
        })
        .filter(Boolean)}

      {aiRequest.status === 'error' ? (
        <Line justifyContent="flex-start">
          <AlertMessage kind="error">
            <Trans>
              The AI encountered an error while handling your request - this was
              request was not counted in your AI usage. Try again later.
            </Trans>
          </AlertMessage>
        </Line>
      ) : shouldBeWorkingIfNotPaused ? (
        <Line justifyContent="flex-start">
          <div className={classes.thinkingText}>
            {onPause && aiRequest.mode === 'agent' && (
              <IconButton
                onClick={() => onPause(!isPaused)}
                size="small"
                style={{
                  backgroundColor: !isPaused
                    ? getBackgroundColor(theme, 'light')
                    : undefined,
                  borderRadius: 4,
                  padding: 0,
                }}
                selected={isPaused}
              >
                {isPaused ? <Play /> : <Pause />}
              </IconButton>
            )}
            <Spacer />
            <Text
              noMargin
              displayInlineAsSpan
              size="body-small"
              color="inherit"
            >
              {isPaused ? <Trans>Paused</Trans> : <Trans>Thinking...</Trans>}
            </Text>
          </div>
        </Line>
      ) : null}
      {dislikeFeedbackDialogOpenedFor && (
        <DislikeFeedbackDialog
          mode={aiRequest.mode || 'chat'}
          open
          onClose={() => setDislikeFeedbackDialogOpenedFor(null)}
          onSendFeedback={(reason: string, freeFormDetails: string) => {
            onSendFeedback(
              dislikeFeedbackDialogOpenedFor.aiRequestId,
              dislikeFeedbackDialogOpenedFor.messageIndex,
              'dislike',
              reason,
              freeFormDetails
            );
          }}
        />
      )}
    </>
  );
});
