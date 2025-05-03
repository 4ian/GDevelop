// @flow
import * as React from 'react';
import { I18n as I18nType } from '@lingui/core';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../../../Utils/GDevelopServices/Generation';
import RaisedButton from '../../../UI/RaisedButton';
import { CompactTextAreaField } from '../../../UI/CompactTextAreaField';
import { Column, Line } from '../../../UI/Grid';
import LeftLoader from '../../../UI/LeftLoader';
import Paper from '../../../UI/Paper';
import { ChatMarkdownText } from './ChatMarkdownText';
import ScrollView, { type ScrollViewInterface } from '../../../UI/ScrollView';
import AlertMessage from '../../../UI/AlertMessage';
import classes from './AiRequestChat.module.css';
import RobotIcon from '../../../ProjectCreation/RobotIcon';
import { useResponsiveWindowSize } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import GetSubscriptionCard from '../../../Profile/Subscription/GetSubscriptionCard';
import { type Quota } from '../../../Utils/GDevelopServices/Usage';
import IconButton from '../../../UI/IconButton';
import Like from '../../../UI/CustomSvgIcons/Like';
import Dislike from '../../../UI/CustomSvgIcons/Dislike';
import Copy from '../../../UI/CustomSvgIcons/Copy';
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';
import { type MessageDescriptor } from '../../../Utils/i18n/MessageDescriptor.flow';
import Link from '../../../UI/Link';
import { getHelpLink } from '../../../Utils/HelpLink';
import Window from '../../../Utils/Window';
import { DislikeFeedbackDialog } from './DislikeFeedbackDialog';
import { type EditorFunctionCallResult } from '../../../Commands/EditorFunctionCallRunner';
import { getFunctionCallToFunctionCallOutputMap } from './AiRequestUtils';
import { FunctionCallRow } from './FunctionCallRow';
import CircularProgress from '../../../UI/CircularProgress';

const TOO_MANY_USER_MESSAGES_WARNING_COUNT = 5;
const TOO_MANY_USER_MESSAGES_ERROR_COUNT = 10;

type Props = {
  i18n: I18nType,
  aiRequest: AiRequest | null,

  isLaunchingAiRequest: boolean,
  onSendUserRequest: string => Promise<void>,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string
  ) => Promise<void>,
  hasOpenedProject: boolean,
  isAutoProcessingFunctionCalls: boolean,
  setAutoProcessFunctionCalls: boolean => void,

  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
    options: ?{| ignore?: boolean |}
  ) => Promise<void>,
  editorFunctionCallResults: ?Array<EditorFunctionCallResult>,

  // Error that occurred while sending the last request.
  lastSendError: ?Error,

  // Quota available for using the feature.
  quota: Quota | null,
  increaseQuotaOffering: 'subscribe' | 'upgrade' | 'none',
  aiRequestPriceInCredits: number | null,
  availableCredits: number,
};

export type AiRequestChatInterface = {|
  resetUserInput: (aiRequestId: string | null) => void,
|};

const styles = {
  chatBubble: {
    paddingTop: 5,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 5,
  },
};

type ChatBubbleProps = {|
  children: React.Node,
  feedbackButtons?: React.Node,
  role: 'assistant' | 'user',
|};

const ChatBubble = ({ children, feedbackButtons, role }: ChatBubbleProps) => {
  return (
    <div className={classes.chatBubbleContainer}>
      <Paper
        background={role === 'user' ? 'light' : 'medium'}
        style={styles.chatBubble}
      >
        <div className={classes.chatBubbleContent}>{children}</div>
        {feedbackButtons}
      </Paper>
    </div>
  );
};

export const AiRequestChat = React.forwardRef<Props, AiRequestChatInterface>(
  (
    {
      aiRequest,
      isLaunchingAiRequest,
      onSendUserRequest,
      onSendFeedback,
      quota,
      increaseQuotaOffering,
      lastSendError,
      aiRequestPriceInCredits,
      availableCredits,
      hasOpenedProject,
      editorFunctionCallResults,
      onProcessFunctionCalls,
      isAutoProcessingFunctionCalls,
      setAutoProcessFunctionCalls,
      i18n,
    }: Props,
    ref
  ) => {
    const aiRequestId: string = aiRequest ? aiRequest.id : '';
    const [
      userRequestTextPerAiRequestId,
      setUserRequestTextPerRequestId,
    ] = React.useState<{ [string]: string }>({});
    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);
    const [messageFeedbacks, setMessageFeedbacks] = React.useState({});
    const theme = React.useContext(GDevelopThemeContext);
    const [
      dislikeFeedbackDialogOpenedFor,
      setDislikeFeedbackDialogOpenedFor,
    ] = React.useState(null);
    const functionCallToFunctionCallOutput = aiRequest
      ? getFunctionCallToFunctionCallOutputMap({
          aiRequest,
        })
      : new Map();

    const [newChatPlaceholder] = React.useState(() => {
      const newChatPlaceholders: Array<MessageDescriptor> = [
        t`How to add a leaderboard?`,
        t`How to display the health of my player?`,
        t`How to add an explosion when an enemy is destroyed?`,
        t`How to create a main menu for my game?`,
        ...(hasOpenedProject
          ? [
              t`What would you add to my game?`,
              t`How to make my game more fun?`,
              t`What is a good GDevelop feature I could use in my game?`,
            ]
          : []),
      ];

      return newChatPlaceholders[
        Math.floor(Math.random() * newChatPlaceholders.length)
      ];
    });

    React.useImperativeHandle(ref, () => ({
      resetUserInput: (aiRequestId: string | null) => {
        const aiRequestIdToReset: string = aiRequestId || '';
        setUserRequestTextPerRequestId(userRequestTextPerAiRequestId => ({
          ...userRequestTextPerAiRequestId,
          [aiRequestIdToReset]: '',
        }));

        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToBottom({
            behavior: 'smooth',
          });
        }
      },
    }));

    const { isMobile } = useResponsiveWindowSize();

    const quotaOrCreditsExplanation = !quota ? null /* User is probably not even logged in. */ : !quota.limitReached ? (
      increaseQuotaOffering === 'subscribe' ? (
        <Trans>
          You still have {quota.max - quota.current} free answers from the AI.
        </Trans>
      ) : (
        <Trans>
          You still have {quota.max - quota.current} free answers with your
          membership (refreshed every month).
        </Trans>
      )
    ) : aiRequestPriceInCredits ? (
      availableCredits ? (
        <Trans>
          Use an AI request for <b>{aiRequestPriceInCredits} credits</b> – you
          have {availableCredits} credits.
        </Trans>
      ) : (
        <Trans>
          Use an AI request for <b>{aiRequestPriceInCredits} credits.</b>
        </Trans>
      )
    ) : null;

    const subscriptionBanner =
      quota && quota.limitReached && increaseQuotaOffering !== 'none' ? (
        <GetSubscriptionCard
          subscriptionDialogOpeningReason={
            increaseQuotaOffering === 'subscribe'
              ? 'AI requests (subscribe)'
              : 'AI requests (upgrade)'
          }
          label={
            increaseQuotaOffering === 'subscribe' ? (
              <Trans>Get GDevelop premium</Trans>
            ) : (
              <Trans>Upgrade</Trans>
            )
          }
          recommendedPlanIdIfNoSubscription="gdevelop_gold"
          canHide
        >
          <Line>
            <Column noMargin>
              <Text noMargin>
                {increaseQuotaOffering === 'subscribe' ? (
                  <Trans>
                    Unlock AI requests included with a GDevelop premium plan.
                  </Trans>
                ) : (
                  <Trans>
                    Get even more AI requests included with a higher premium
                    plan.
                  </Trans>
                )}
              </Text>
            </Column>
          </Line>
        </GetSubscriptionCard>
      ) : null;

    const errorOrQuotaOrCreditsExplanation = (
      <Text size="body2" color={lastSendError ? 'error' : 'secondary'}>
        {lastSendError ? (
          <Trans>
            An error happened when sending your request, please try again.
          </Trans>
        ) : (
          quotaOrCreditsExplanation || '\u00a0'
        )}
      </Text>
    );

    if (!aiRequest) {
      return (
        <div className={classes.newChatContainer}>
          <ColumnStackLayout justifyContent="center" expand>
            <Line noMargin justifyContent="center">
              <RobotIcon rotating size={40} />
            </Line>
            <Column noMargin alignItems="center">
              <Text size="bold-title">
                <Trans>What do you want to make?</Trans>
              </Text>
            </Column>
            <form
              onSubmit={() => {
                onSendUserRequest(userRequestTextPerAiRequestId['']);
              }}
            >
              <ColumnStackLayout justifyContent="center" noMargin>
                <Column noMargin alignItems="stretch" justifyContent="stretch">
                  <CompactTextAreaField
                    maxLength={6000}
                    value={userRequestTextPerAiRequestId[''] || ''}
                    disabled={isLaunchingAiRequest}
                    onChange={userRequestText =>
                      setUserRequestTextPerRequestId(
                        userRequestTextPerAiRequestId => ({
                          ...userRequestTextPerAiRequestId,
                          '': userRequestText,
                        })
                      )
                    }
                    onSubmit={() => {
                      onSendUserRequest(userRequestTextPerAiRequestId['']);
                    }}
                    placeholder={newChatPlaceholder}
                    rows={5}
                  />
                </Column>
                <Line noMargin>
                  <ResponsiveLineStackLayout
                    noMargin
                    alignItems="flex-start"
                    justifyContent="space-between"
                    expand
                  >
                    {!isMobile && errorOrQuotaOrCreditsExplanation}
                    <Line noMargin justifyContent="flex-end">
                      <LeftLoader reserveSpace isLoading={isLaunchingAiRequest}>
                        <RaisedButton
                          color="primary"
                          label={<Trans>Send</Trans>}
                          style={{ flexShrink: 0 }}
                          disabled={
                            isLaunchingAiRequest ||
                            !userRequestTextPerAiRequestId[aiRequestId]
                          }
                          onClick={() => {
                            onSendUserRequest(
                              userRequestTextPerAiRequestId[aiRequestId]
                            );
                          }}
                        />
                      </LeftLoader>
                    </Line>
                    {isMobile && errorOrQuotaOrCreditsExplanation}
                  </ResponsiveLineStackLayout>
                </Line>
              </ColumnStackLayout>
            </form>
            {subscriptionBanner}
          </ColumnStackLayout>
          <Column justifyContent="center">
            <Text size="body-small" color="secondary" align="center" noMargin>
              <Trans>
                The AI is experimental and still being improved.{' '}
                <Link
                  href={getHelpLink('/interface/ask-ai')}
                  color="secondary"
                  onClick={() =>
                    Window.openExternalURL(getHelpLink('/interface/ask-ai'))
                  }
                >
                  It has access to your game objects but not events.
                </Link>
              </Trans>
            </Text>
            <Text size="body-small" color="secondary" align="center" noMargin>
              <Trans>Answers may have mistakes: always verify them.</Trans>
            </Text>
          </Column>
        </div>
      );
    }

    const userMessagesCount = aiRequest.output.filter(
      message => message.type === 'message' && message.role === 'user'
    ).length;

    return (
      <ColumnStackLayout
        expand
        alignItems="stretch"
        justifyContent="stretch"
        useFullHeight
      >
        <ScrollView ref={scrollViewRef}>
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
                      const editorFunctionCallResult =
                        editorFunctionCallResults &&
                        editorFunctionCallResults.find(
                          functionCallOutput =>
                            functionCallOutput.call_id ===
                            messageContent.call_id
                        );
                      const existingFunctionCallOutput = functionCallToFunctionCallOutput.get(
                        messageContent
                      );
                      return (
                        <FunctionCallRow
                          key={key}
                          onProcess={() =>
                            onProcessFunctionCalls([messageContent])
                          }
                          onIgnore={() =>
                            onProcessFunctionCalls([messageContent], {
                              ignore: true,
                            })
                          }
                          functionCall={messageContent}
                          editorFunctionCallResult={editorFunctionCallResult}
                          existingFunctionCallOutput={
                            existingFunctionCallOutput
                          }
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
                  The AI encountered an error while handling your request - this
                  was request was not counted in your AI usage. Try again later.
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
        </ScrollView>
        {userMessagesCount >= TOO_MANY_USER_MESSAGES_WARNING_COUNT ? (
          <AlertMessage
            kind={
              userMessagesCount >= TOO_MANY_USER_MESSAGES_ERROR_COUNT
                ? 'error'
                : 'warning'
            }
          >
            <Trans>
              The chat is becoming long - consider creating a new chat to ask
              other questions. The AI will better analyze your game and request
              in a new chat.
            </Trans>
          </AlertMessage>
        ) : (
          subscriptionBanner
        )}
        <form
          onSubmit={() => {
            onSendUserRequest(userRequestTextPerAiRequestId[aiRequestId] || '');
          }}
        >
          <ColumnStackLayout
            justifyContent="stretch"
            alignItems="stretch"
            noMargin
          >
            {isAutoProcessingFunctionCalls && (
              <Paper background="dark" variant="outlined" square>
                <Column>
                  <LineStackLayout
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <LineStackLayout alignItems="center" noMargin>
                      <CircularProgress variant="indeterminate" size={10} />
                      <Text size="body" color="secondary" noMargin>
                        <Trans>The AI is building your request.</Trans>
                      </Text>
                    </LineStackLayout>
                    <Text size="body" noMargin>
                      <Link
                        href={'#'}
                        color="secondary"
                        onClick={() => {
                          setAutoProcessFunctionCalls(false);
                        }}
                      >
                        <Trans>Pause</Trans>
                      </Link>
                    </Text>
                  </LineStackLayout>
                </Column>
              </Paper>
            )}
            <CompactTextAreaField
              maxLength={6000}
              value={userRequestTextPerAiRequestId[aiRequestId] || ''}
              disabled={isLaunchingAiRequest}
              onChange={userRequestText =>
                setUserRequestTextPerRequestId(
                  userRequestTextPerAiRequestId => ({
                    ...userRequestTextPerAiRequestId,
                    [aiRequestId]: userRequestText,
                  })
                )
              }
              placeholder={t`Ask a follow up question`}
              rows={2}
              onSubmit={() => {
                onSendUserRequest(userRequestTextPerAiRequestId[aiRequestId]);
              }}
            />
            <Column noMargin alignItems="flex-end">
              <ResponsiveLineStackLayout noMargin>
                {!isMobile && errorOrQuotaOrCreditsExplanation}
                <Line noMargin justifyContent="flex-end">
                  <LeftLoader reserveSpace isLoading={isLaunchingAiRequest}>
                    <RaisedButton
                      color="primary"
                      disabled={
                        aiRequest.status === 'working' || isLaunchingAiRequest
                      }
                      label={<Trans>Send</Trans>}
                      onClick={() => {
                        onSendUserRequest(
                          userRequestTextPerAiRequestId[aiRequestId]
                        );
                      }}
                    />
                  </LeftLoader>
                </Line>
                {isMobile && errorOrQuotaOrCreditsExplanation}
              </ResponsiveLineStackLayout>
            </Column>
          </ColumnStackLayout>
        </form>
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
      </ColumnStackLayout>
    );
  }
);
