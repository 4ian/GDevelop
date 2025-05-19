// @flow
import * as React from 'react';
import { ChatBubble } from './ChatBubble';
import { Line } from '../../UI/Grid';
import { ChatMarkdownText } from './ChatMarkdownText';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { getFunctionCallToFunctionCallOutputMap } from './AiRequestUtils';
import { FunctionCallRow } from './FunctionCallRow';
import IconButton from '../../UI/IconButton';
import Like from '../../UI/CustomSvgIcons/Like';
import Dislike from '../../UI/CustomSvgIcons/Dislike';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../../Utils/GDevelopServices/Generation';
import {
  type EditorFunctionCallResult,
  type EditorCallbacks,
} from '../../EditorFunctions';
import classes from './ChatMessages.module.css';
import { DislikeFeedbackDialog } from './DislikeFeedbackDialog';
import LeftLoader from '../../UI/LeftLoader';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';

type Props = {|
  aiRequest: AiRequest,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string
  ) => Promise<void>,
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{|
      ignore?: boolean,
    |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
  project: gdProject | null,
|};

export const ChatMessages = React.memo<Props>(function ChatMessages({
  aiRequest,
  onSendFeedback,
  editorFunctionCallResults,
  onProcessFunctionCalls,
  editorCallbacks,
  project,
}: Props) {
  const theme = React.useContext(GDevelopThemeContext);

  const [messageFeedbacks, setMessageFeedbacks] = React.useState({});
  const [
    dislikeFeedbackDialogOpenedFor,
    setDislikeFeedbackDialogOpenedFor,
  ] = React.useState(null);

  const functionCallToFunctionCallOutput = aiRequest
    ? getFunctionCallToFunctionCallOutputMap({
        aiRequest,
      })
    : new Map();

  return (
    <>
      {aiRequest.output.flatMap((message, messageIndex) => {
        if (message.type === 'message' && message.role === 'user') {
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
        if (message.type === 'message' && message.role === 'assistant') {
          return [
            ...message.content
              .map((messageContent, messageContentIndex) => {
                const key = `messageIndex${messageIndex}-${messageContentIndex}`;
                if (messageContent.type === 'output_text') {
                  const feedbackKey = `${messageIndex}-${messageContentIndex}`;
                  const currentFeedback = messageFeedbacks[feedbackKey];

                  return (
                    <Line key={key} justifyContent="flex-start">
                      <ChatBubble
                        role="assistant"
                        feedbackButtons={
                          <div className={classes.feedbackButtonsContainer}>
                            <IconButton
                              size="small"
                              tooltip={t`Copy`}
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  messageContent.text
                                );
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
                                onSendFeedback(
                                  aiRequest.id,
                                  messageIndex,
                                  'like'
                                );
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
                        <ChatMarkdownText source={messageContent.text} />
                      </ChatBubble>
                    </Line>
                  );
                }
                if (messageContent.type === 'reasoning') {
                  return (
                    <Line key={key} justifyContent="flex-start">
                      <ChatBubble role="assistant">
                        <ChatMarkdownText
                          source={messageContent.summary.text}
                        />
                      </ChatBubble>
                    </Line>
                  );
                }
                if (messageContent.type === 'function_call') {
                  const existingFunctionCallOutput = functionCallToFunctionCallOutput.get(
                    messageContent
                  );
                  // If there is already an existing function call output,
                  // there can't be an editor function call result.
                  // Indeed, sometimes, two functions will
                  // have the same call_id (because of the way some LLM APIs are implemented).
                  // The editorFunctionCallResult always applies to the last function call,
                  // which has no function call output associated to it yet.
                  const editorFunctionCallResult =
                    (!existingFunctionCallOutput &&
                      editorFunctionCallResults &&
                      editorFunctionCallResults.find(
                        functionCallOutput =>
                          functionCallOutput.call_id === messageContent.call_id
                      )) ||
                    null;
                  return (
                    <FunctionCallRow
                      project={project}
                      key={key}
                      onProcessFunctionCalls={onProcessFunctionCalls}
                      functionCall={messageContent}
                      editorFunctionCallResult={editorFunctionCallResult}
                      existingFunctionCallOutput={existingFunctionCallOutput}
                      editorCallbacks={editorCallbacks}
                    />
                  );
                }
                return null;
              })
              .filter(Boolean),
          ];
        }
        if (message.type === 'function_call_output') {
          return [];
        }

        return [];
      })}

      {aiRequest.status === 'error' ? (
        <Line justifyContent="flex-start">
          <AlertMessage kind="error">
            <Trans>
              The AI encountered an error while handling your request - this was
              request was not counted in your AI usage. Try again later.
            </Trans>
          </AlertMessage>
        </Line>
      ) : aiRequest.status === 'working' ? (
        <Line justifyContent="flex-start">
          <div className={classes.thinkingText}>
            <LeftLoader isLoading>
              <Text noMargin displayInlineAsSpan>
                <Trans>Thinking about your request...</Trans>
              </Text>
            </LeftLoader>
          </div>
        </Line>
      ) : null}
      {dislikeFeedbackDialogOpenedFor && (
        <DislikeFeedbackDialog
          open
          onClose={() => setDislikeFeedbackDialogOpenedFor(null)}
          onSendFeedback={(reason: string) => {
            onSendFeedback(
              dislikeFeedbackDialogOpenedFor.aiRequestId,
              dislikeFeedbackDialogOpenedFor.messageIndex,
              'dislike',
              reason
            );
          }}
        />
      )}
    </>
  );
});
