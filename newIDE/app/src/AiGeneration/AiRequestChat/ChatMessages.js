// @flow
import * as React from 'react';
import { ChatBubble } from './ChatBubble';
import { Column, Line, Spacer } from '../../UI/Grid';
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
  type AiRequestMessage,
} from '../../Utils/GDevelopServices/Generation';
import {
  type EditorFunctionCallResult,
  type EditorCallbacks,
} from '../../EditorFunctions';
import classes from './ChatMessages.module.css';
import { DislikeFeedbackDialog } from './DislikeFeedbackDialog';
import Text from '../../UI/Text';
import AlertMessage from '../../UI/AlertMessage';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import { FeedbackBanner } from './FeedbackBanner';
import Pause from '../../UI/CustomSvgIcons/Pause';
import Paper, { getBackgroundColor } from '../../UI/Paper';
import Play from '../../UI/CustomSvgIcons/Play';
import Floppy from '../../UI/CustomSvgIcons/Floppy';
import SubscriptionPlanTableSummary from '../../Profile/Subscription/PromotionSubscriptionDialog/SubscriptionPlanTableSummary';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { canUpgradeSubscription } from '../../Utils/GDevelopServices/Usage';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import Coin from '../../Credits/Icons/Coin';
import { CreditsPackageStoreContext } from '../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import RobotIcon from '../../ProjectCreation/RobotIcon';
import { Divider } from '@material-ui/core';
import CheckCircle from '@material-ui/icons/CheckCircle';
import Link from '../../UI/Link';
import { type FileMetadata } from '../../ProjectsStorage';
import UnsavedChangesContext from '../../MainFrame/UnsavedChangesContext';

const styles = {
  subscriptionPaper: {
    paddingTop: 5,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 5,
  },
  assistantChatBubbleLight: {
    background: 'linear-gradient(90deg, #F5F5F7 77%, #EAE3FF 100%)',
  },
  assistantChatBubbleDark: {
    background: 'linear-gradient(90deg, #25252E 0%, #312442 100%)',
  },
};

const getMessageSuggestionsLines = ({
  aiRequest,
  onUserRequestTextChange,
  disabled,
  message,
  messageIndex,
  onlyShowExplanationMessage,
  functionCallItems,
  project,
  onProcessFunctionCalls,
  editorCallbacks,
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
  functionCallItems?: Array<any>,
  project: ?gdProject,
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{|
      ignore?: boolean,
    |}
  ) => Promise<void>,
  editorCallbacks: EditorCallbacks,
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
          <Column noMargin>
            {functionCallItems && functionCallItems.length > 0 && (
              <FunctionCallsGroup>
                {functionCallItems.map(
                  ({
                    key: functionCallKey,
                    messageContent: functionCallMessageContent,
                    existingFunctionCallOutput,
                    editorFunctionCallResult,
                  }) => (
                    <FunctionCallRow
                      project={project}
                      key={functionCallKey}
                      onProcessFunctionCalls={onProcessFunctionCalls}
                      functionCall={functionCallMessageContent}
                      editorFunctionCallResult={editorFunctionCallResult}
                      existingFunctionCallOutput={existingFunctionCallOutput}
                      editorCallbacks={editorCallbacks}
                    />
                  )
                )}
              </FunctionCallsGroup>
            )}
            <ChatMarkdownText source={suggestions.explanationMessage} />
          </Column>
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
  fileMetadata: ?FileMetadata,
  onUserRequestTextChange: (
    userRequestText: string,
    aiRequestIdToChange: string
  ) => void,
  shouldBeWorkingIfNotPaused?: boolean,
  isPaused?: boolean,
  isForAnotherProject?: boolean,
  shouldDisplayFeedbackBanner?: boolean,
  onPause: (pause: boolean) => void,
  onScrollToBottom: () => void,
  hasStartedRequestButCannotContinue: boolean,
  onSwitchedToGDevelopCredits: () => void,

  onStartOrOpenChat: (options: ?{| aiRequestId: string | null |}) => void,
  isFetchingSuggestions: boolean,
  savingProjectForMessageId: ?string,
  forkingState: ?{| aiRequestId: string, messageId: string |},
  onRestore: ({|
    message: AiRequestMessage,
    aiRequest: AiRequest,
  |}) => Promise<void>,
|};

export const ChatMessages = React.memo<Props>(function ChatMessages({
  aiRequest,
  onSendFeedback,
  editorFunctionCallResults,
  onProcessFunctionCalls,
  editorCallbacks,
  project,
  fileMetadata,
  onUserRequestTextChange,
  shouldBeWorkingIfNotPaused,
  isPaused,
  isForAnotherProject,
  shouldDisplayFeedbackBanner,
  onPause,
  onScrollToBottom,
  hasStartedRequestButCannotContinue,
  onSwitchedToGDevelopCredits,
  onStartOrOpenChat,
  isFetchingSuggestions,
  savingProjectForMessageId,
  forkingState,
  onRestore,
}: Props) {
  const theme = React.useContext(GDevelopThemeContext);
  const isLightTheme = theme.palette.type === 'light';
  const {
    getSubscriptionPlansWithPricingSystems,
    openSubscriptionDialog,
  } = React.useContext(SubscriptionContext);
  const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
  const { subscription, limits } = React.useContext(AuthenticatedUserContext);
  const availableCredits = limits ? limits.credits.userBalance.amount : 0;
  const quota =
    (limits && limits.quotas && limits.quotas['consumed-ai-credits']) || null;
  const hasReachedLimit = !!quota && quota.limitReached;
  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);

  const {
    values: { automaticallyUseCreditsForAiRequests },
    setAutomaticallyUseCreditsForAiRequests,
  } = React.useContext(PreferencesContext);

  const { openCreditsPackageDialog } = React.useContext(
    CreditsPackageStoreContext
  );

  const suggestedSubscriptionPlanWithPricingSystem = React.useMemo(
    () => {
      if (
        !subscriptionPlansWithPricingSystems ||
        subscriptionPlansWithPricingSystems.length === 0 ||
        !hasReachedLimit ||
        (subscription && !canUpgradeSubscription(subscription)) ||
        !hasStartedRequestButCannotContinue
      )
        return null;

      const goldPlan = subscriptionPlansWithPricingSystems.find(
        plan => plan.id === 'gdevelop_gold'
      );
      const proPlan = subscriptionPlansWithPricingSystems.find(
        plan => plan.id === 'gdevelop_startup'
      );
      return (
        (subscription && subscription.planId === 'gdevelop_gold'
          ? proPlan
          : goldPlan) || subscriptionPlansWithPricingSystems[0]
      );
    },
    [
      subscriptionPlansWithPricingSystems,
      subscription,
      hasReachedLimit,
      hasStartedRequestButCannotContinue,
    ]
  );

  const shouldShowCreditsOrSubscriptionPrompt =
    subscriptionPlansWithPricingSystems && // To ensure it's loaded.
    hasReachedLimit &&
    hasStartedRequestButCannotContinue;

  React.useEffect(
    () => {
      if (
        shouldShowCreditsOrSubscriptionPrompt ||
        isFetchingSuggestions ||
        (shouldBeWorkingIfNotPaused && !isPaused)
      ) {
        onScrollToBottom();
      }
    },
    [
      shouldShowCreditsOrSubscriptionPrompt,
      isFetchingSuggestions,
      shouldBeWorkingIfNotPaused,
      isPaused,
      onScrollToBottom,
    ]
  );

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

  const isWorking = !!shouldBeWorkingIfNotPaused && !isPaused;
  const [isRestoring, setIsRestoring] = React.useState(false);
  const disabled = isWorking || isForAnotherProject || isRestoring;

  const [messageFeedbacks, setMessageFeedbacks] = React.useState({});
  const [
    dislikeFeedbackDialogOpenedFor,
    setDislikeFeedbackDialogOpenedFor,
  ] = React.useState(null);

  const onRestoreVersion = React.useCallback(
    async (params: {| message: AiRequestMessage, aiRequest: AiRequest |}) => {
      setIsRestoring(true);
      try {
        await onRestore(params);
      } finally {
        setIsRestoring(false);
      }
    },
    [onRestore]
  );

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
      const forkedAfterNewMessageId = aiRequest.forkedAfterNewMessageId;

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
          let pendingFunctionCallItems = [];

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
              // Attach pending function calls to this message content
              if (currentFunctionCallItems.length > 0) {
                pendingFunctionCallItems = [...currentFunctionCallItems];
                currentFunctionCallItems = [];
              }

              items.push({
                type: 'message_content',
                messageIndex,
                messageContentIndex,
                message,
                messageContent,
                isLastMessage,
                functionCallItems:
                  pendingFunctionCallItems.length > 0
                    ? pendingFunctionCallItems
                    : undefined,
              });

              pendingFunctionCallItems = [];
            }
          });
        }

        // Add save item for assistant messages or function call outputs with project version saves
        // or when a save is in progress for this message
        const isSavingProjectForThisMessage =
          savingProjectForMessageId &&
          message.messageId === savingProjectForMessageId;
        if (
          (message.type === 'function_call_output' ||
            (message.type === 'message' && message.role === 'assistant')) &&
          (message.projectVersionIdAfterMessage ||
            isSavingProjectForThisMessage)
        ) {
          flushFunctionCallGroup();
          items.push({
            type: 'save',
            messageIndex: messageIndex,
            message: message,
            isRestored:
              forkedAfterNewMessageId &&
              message.messageId === forkedAfterNewMessageId,
            isSaving:
              isSavingProjectForThisMessage &&
              !message.projectVersionIdAfterMessage,
          });
        }

        if (
          (message.type === 'function_call_output' ||
            (message.type === 'message' && message.role === 'assistant')) &&
          !!message.suggestions
        ) {
          // Attach pending function calls to suggestions if they have an explanation message
          const suggestionsHasExplanation =
            message.suggestions && message.suggestions.explanationMessage;
          const functionCallItemsForSuggestions =
            suggestionsHasExplanation && currentFunctionCallItems.length > 0
              ? [...currentFunctionCallItems]
              : undefined;

          if (functionCallItemsForSuggestions) {
            currentFunctionCallItems = [];
          } else {
            flushFunctionCallGroup();
          }

          items.push({
            type: 'suggestions',
            messageIndex: messageIndex,
            message: message,
            onlyShowExplanationMessage: !isLastMessage,
            functionCallItems: functionCallItemsForSuggestions,
          });
        }

        if (isLastMessage) {
          flushFunctionCallGroup();
        }
      });

      return items;
    },
    [
      aiRequest,
      editorFunctionCallResults,
      functionCallToFunctionCallOutput,
      savingProjectForMessageId,
    ]
  );

  const filteredRenderItems = React.useMemo(
    () => {
      if (!forkingState || forkingState.aiRequestId !== aiRequest.id) {
        return renderItems;
      }

      const forkSaveIndex = renderItems.findIndex(
        item =>
          item.type === 'save' &&
          item.message &&
          item.message.messageId === forkingState.messageId
      );

      if (forkSaveIndex === -1) return renderItems;

      // Only show items up to and including the save item.
      // The save item itself will show "Restoring..." state.
      return renderItems.slice(0, forkSaveIndex + 1);
    },
    [renderItems, forkingState, aiRequest.id]
  );

  // Scroll to bottom when suggestions are added.
  const hasSuggestions = React.useMemo(
    () => filteredRenderItems.some(item => item.type === 'suggestions'),
    [filteredRenderItems]
  );

  React.useEffect(
    () => {
      let timeoutId;
      if (hasSuggestions) {
        timeoutId = setTimeout(() => {
          onScrollToBottom();
        }, 100); // Delay to ensure rendering is done.
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    },
    [hasSuggestions, onScrollToBottom]
  );

  const forkedFromAiRequestId = aiRequest.forkedFromAiRequestId;

  return (
    <>
      {filteredRenderItems
        .flatMap((item, itemIndex) => {
          if (item.type === 'user_message') {
            const { messageIndex, message } = item;

            const currentVersionOpened = fileMetadata
              ? fileMetadata.version
              : null;
            const hasVersionToRestore = !!message.projectVersionIdBeforeMessage;

            const previousMessage =
              messageIndex > 0 ? aiRequest.output[messageIndex - 1] : null;
            const previousMessageHasSameVersionId =
              previousMessage &&
              hasVersionToRestore &&
              ((previousMessage.type === 'message' &&
                previousMessage.role === 'user' &&
                previousMessage.projectVersionIdBeforeMessage ===
                  message.projectVersionIdBeforeMessage) ||
                (previousMessage.type === 'function_call_output' &&
                  previousMessage.projectVersionIdAfterMessage ===
                    message.projectVersionIdBeforeMessage) ||
                (previousMessage.type === 'message' &&
                  previousMessage.role === 'assistant' &&
                  previousMessage.projectVersionIdAfterMessage ===
                    message.projectVersionIdBeforeMessage));

            const shouldShowRestore =
              project &&
              project.getProjectUuid() === aiRequest.gameId &&
              hasVersionToRestore &&
              !previousMessageHasSameVersionId;

            const shouldDisableRestore =
              disabled ||
              (!currentVersionOpened ||
                // Disable if the version before the message is the current opened version and there is no unsaved changes.
                (message.projectVersionIdBeforeMessage ===
                  currentVersionOpened &&
                  !hasUnsavedChanges));

            return [
              <Line key={messageIndex} justifyContent="flex-end">
                <ChatBubble
                  role="user"
                  restoreProps={
                    shouldShowRestore
                      ? {
                          onRestore: () => {
                            onRestoreVersion({
                              message,
                              aiRequest,
                            });
                          },
                          disabled: shouldDisableRestore,
                        }
                      : undefined
                  }
                >
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
              <Line key={`group-line-${itemIndex}`} justifyContent="flex-start">
                <ChatBubble role="assistant">
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
                          existingFunctionCallOutput={
                            existingFunctionCallOutput
                          }
                          editorCallbacks={editorCallbacks}
                        />
                      )
                    )}
                  </FunctionCallsGroup>
                </ChatBubble>
              </Line>,
            ];
          }

          if (item.type === 'message_content') {
            const {
              messageIndex,
              messageContentIndex,
              messageContent,
              isLastMessage,
              functionCallItems,
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
                    <Column noMargin>
                      {functionCallItems && functionCallItems.length > 0 && (
                        <FunctionCallsGroup>
                          {functionCallItems.map(
                            ({
                              key: functionCallKey,
                              messageContent: functionCallMessageContent,
                              existingFunctionCallOutput,
                              editorFunctionCallResult,
                            }) => (
                              <FunctionCallRow
                                project={project}
                                key={functionCallKey}
                                onProcessFunctionCalls={onProcessFunctionCalls}
                                functionCall={functionCallMessageContent}
                                editorFunctionCallResult={
                                  editorFunctionCallResult
                                }
                                existingFunctionCallOutput={
                                  existingFunctionCallOutput
                                }
                                editorCallbacks={editorCallbacks}
                              />
                            )
                          )}
                        </FunctionCallsGroup>
                      )}
                      <ChatMarkdownText source={trimmedText} />
                    </Column>
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

          if (item.type === 'save') {
            const { messageIndex, message, isRestored, isSaving } = item;
            const isForking =
              forkingState &&
              forkingState.aiRequestId === aiRequest.id &&
              forkingState.messageId === message.messageId;
            const currentVersionOpened = fileMetadata
              ? fileMetadata.version
              : null;
            const messageVersionIdToRestore =
              message.projectVersionIdAfterMessage;
            const hasVersionToRestore =
              (!!messageVersionIdToRestore &&
                !!currentVersionOpened &&
                messageVersionIdToRestore !== currentVersionOpened) ||
              hasUnsavedChanges;

            return [
              <Line key={`save-${messageIndex}`} justifyContent="flex-start">
                <ColumnStackLayout noMargin>
                  {isForking ? (
                    <LineStackLayout noMargin alignItems="center">
                      <RobotIcon rotating size={14} />
                      <Text size="body-small" noMargin color="secondary">
                        <Trans>Restoring...</Trans>
                      </Text>
                    </LineStackLayout>
                  ) : isSaving ? (
                    <LineStackLayout noMargin alignItems="center">
                      <Floppy fontSize="small" />
                      <Text size="body-small" noMargin color="secondary">
                        <Trans>Saving...</Trans>
                      </Text>
                    </LineStackLayout>
                  ) : (
                    <LineStackLayout noMargin alignItems="center">
                      <CheckCircle
                        style={{ color: theme.message.valid }}
                        fontSize="small"
                      />
                      <Text size="body-small" noMargin color="secondary">
                        <Trans>Project saved</Trans>
                      </Text>
                      <FlatButton
                        onClick={() => {
                          onRestoreVersion({
                            message,
                            aiRequest,
                          });
                        }}
                        label={<Trans>Restore version</Trans>}
                        disabled={disabled || !hasVersionToRestore}
                      />
                    </LineStackLayout>
                  )}
                  {isRestored && !isForking && forkedFromAiRequestId && (
                    <LineStackLayout
                      noMargin
                      alignItems="center"
                      justifyContent="flex-start"
                      expand
                    >
                      <div style={{ width: 20 }} />
                      <Text size="body-small" noMargin color="secondary">
                        <Trans>Restored</Trans> ↳{' '}
                        <Link
                          onClick={() => {
                            onStartOrOpenChat({
                              aiRequestId: forkedFromAiRequestId,
                            });
                          }}
                          href="#"
                          color="secondary"
                          disabled={disabled}
                        >
                          <Trans>View original chat</Trans>
                        </Link>
                      </Text>
                    </LineStackLayout>
                  )}
                </ColumnStackLayout>
              </Line>,
            ];
          }

          if (item.type === 'suggestions') {
            const {
              messageIndex,
              message,
              onlyShowExplanationMessage,
              functionCallItems,
            } = item;
            return [
              ...getMessageSuggestionsLines({
                aiRequest,
                onUserRequestTextChange,
                disabled,
                message,
                messageIndex,
                onlyShowExplanationMessage,
                functionCallItems,
                project,
                onProcessFunctionCalls,
                editorCallbacks,
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
              The AI encountered an error while handling your request - this
              request was not counted in your AI usage. Try again later.
            </Trans>
          </AlertMessage>
        </Line>
      ) : isFetchingSuggestions ? (
        <Line justifyContent="flex-start">
          <div className={classes.thinkingText}>
            <RobotIcon rotating size={14} />
            <Spacer />
            <Text
              noMargin
              displayInlineAsSpan
              size="body-small"
              color="inherit"
            >
              <Trans>Suggesting...</Trans>
            </Text>
          </div>
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

      {shouldShowCreditsOrSubscriptionPrompt && (
        <Line justifyContent="center">
          <Paper
            background="medium"
            style={{
              ...styles.subscriptionPaper,
              ...(isLightTheme
                ? styles.assistantChatBubbleLight
                : styles.assistantChatBubbleDark),
            }}
          >
            {suggestedSubscriptionPlanWithPricingSystem && (
              <ColumnStackLayout noMargin>
                <Line>
                  <RobotIcon size={20} sad />
                </Line>
                <Text size="block-title" noMargin>
                  <Trans>
                    You don't have enough AI credits to continue this
                    conversation.
                  </Trans>
                </Text>
                <Text>
                  {!!subscription ? (
                    <Trans>
                      Upgrade your Premium subscription to have more AI requests
                      and GDevelop coins to unlock the engine's extra benefits.
                    </Trans>
                  ) : (
                    <Trans>
                      Get a Premium subscription to have more AI requests and
                      GDevelop coins to unlock the engine's extra benefits.
                    </Trans>
                  )}
                </Text>
                <SubscriptionPlanTableSummary
                  subscriptionPlanWithPricingSystems={
                    suggestedSubscriptionPlanWithPricingSystem
                  }
                  displayedFeatures={['AI_PROTOTYPING', 'FREE_CREDITS']}
                  hideFullTableLink
                  actionLabel={<Trans>Upgrade</Trans>}
                />
              </ColumnStackLayout>
            )}

            {suggestedSubscriptionPlanWithPricingSystem && (
              <Line>
                <Column expand noMargin>
                  <Divider orientation="horizontal" />
                </Column>
              </Line>
            )}

            <ColumnStackLayout noMargin>
              {suggestedSubscriptionPlanWithPricingSystem ? (
                <Text size="sub-title">
                  <Trans>You can switch to GDevelop credits.</Trans>
                </Text>
              ) : (
                <ColumnStackLayout noMargin>
                  <Line>
                    <Coin />
                  </Line>
                  <Text size="block-title" noMargin>
                    <Trans>
                      You've ran out of GDevelop credits to continue this
                      conversation.
                    </Trans>
                  </Text>
                </ColumnStackLayout>
              )}
              <Text noMargin color="secondary">
                {availableCredits > 0 ? (
                  <Trans>
                    You still have {availableCredits} credits you can use for AI
                    requests.
                  </Trans>
                ) : (
                  <Trans>
                    You don't have any credits available. You can purchase
                    GDevelop credits to continue making AI requests.
                  </Trans>
                )}
              </Text>
              <Line noMargin>
                <Text>
                  <Trans>What would you like to do next?</Trans>
                </Text>
              </Line>
              <FlatButton
                color="ai"
                onClick={() => {
                  openSubscriptionDialog({
                    analyticsMetadata: {
                      reason: 'AI requests (subscribe)',
                      recommendedPlanId: suggestedSubscriptionPlanWithPricingSystem
                        ? suggestedSubscriptionPlanWithPricingSystem.id
                        : 'gdevelop_gold',
                      placementId: 'ai-requests',
                    },
                  });
                }}
                label={<Trans>See subscriptions</Trans>}
              />
              {availableCredits > 0 ? (
                <FlatButton
                  leftIcon={<Coin fontSize="small" />}
                  color="ai"
                  onClick={() => {
                    setAutomaticallyUseCreditsForAiRequests(true);
                    onSwitchedToGDevelopCredits();
                  }}
                  label={
                    automaticallyUseCreditsForAiRequests ? (
                      <Trans>Using GDevelop Credits</Trans>
                    ) : (
                      <Trans>Switch to GDevelop Credits</Trans>
                    )
                  }
                  disabled={automaticallyUseCreditsForAiRequests}
                />
              ) : (
                <FlatButton
                  leftIcon={<Coin fontSize="small" />}
                  color="ai"
                  onClick={openCreditsPackageDialog}
                  label={<Trans>Get more credits</Trans>}
                  disabled={false}
                />
              )}
            </ColumnStackLayout>
          </Paper>
        </Line>
      )}

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
