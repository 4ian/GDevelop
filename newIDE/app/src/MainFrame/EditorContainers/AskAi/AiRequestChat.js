// @flow
import * as React from 'react';
import {
  ColumnStackLayout,
  ResponsiveLineStackLayout,
} from '../../../UI/Layout';
import Text from '../../../UI/Text';
import { Trans, t } from '@lingui/macro';
import { type AiRequest } from '../../../Utils/GDevelopServices/Generation';
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
import GDevelopThemeContext from '../../../UI/Theme/GDevelopThemeContext';

const TOO_MANY_MESSAGES_WARNING_COUNT = 9;
const TOO_MANY_MESSAGES_ERROR_COUNT = 14;

type Props = {
  aiRequest: AiRequest | null,

  isLaunchingAiRequest: boolean,
  onSendUserRequest: string => Promise<void>,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike'
  ) => Promise<void>,

  // Error that occurred while sending the last request.
  lastSendError: ?Error,

  // Quota available for using the feature.
  quota: Quota | null,
  increaseQuotaOffering: 'subscribe' | 'upgrade' | 'none',
  aiRequestPriceInCredits: number | null,
  availableCredits: number,
};

export type AiRequestChatInterface = {|
  resetUserInput: () => void,
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
    }: Props,
    ref
  ) => {
    const [userRequestText, setUserRequestText] = React.useState('');
    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);
    const [messageFeedbacks, setMessageFeedbacks] = React.useState({});
    const theme = React.useContext(GDevelopThemeContext);

    React.useImperativeHandle(ref, () => ({
      resetUserInput: () => {
        setUserRequestText('');
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToBottom({
            behavior: 'smooth',
          });
        }
      },
    }));

    const { isMobile } = useResponsiveWindowSize();

    const quotaOrCreditsExplanation = !quota ? null /* User is probably not even logged in. */ : !quota.limitReached ? (
      quota.current < 1 || increaseQuotaOffering === 'subscribe' ? null : (
        <Trans>
          You still have {quota.max - quota.current} free questions thanks to
          your membership.
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
        >
          <Line>
            <Column noMargin>
              <Text noMargin>
                {increaseQuotaOffering === 'subscribe' ? (
                  <Trans>
                    Get more free AI requests with a GDevelop premium plan.
                  </Trans>
                ) : (
                  <Trans>
                    Upgrade to another premium plan to get more free AI
                    requests.
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
          quotaOrCreditsExplanation
        )}
      </Text>
    );

    if (!aiRequest) {
      const disclaimer = errorOrQuotaOrCreditsExplanation || (
        <Text size="body2" color="secondary">
          <Trans>
            The AI will answer according to your game project. Always verify AI
            answers before applying them.
          </Trans>
        </Text>
      );

      return (
        <div className={classes.newChatContainer}>
          <Line noMargin justifyContent="center">
            <RobotIcon rotating size={40} />
          </Line>
          <Column noMargin alignItems="center">
            <Text size="bold-title">
              <Trans>What do you want to make?</Trans>
            </Text>
          </Column>
          <Column noMargin alignItems="stretch" justifyContent="stretch">
            <CompactTextAreaField
              maxLength={6000}
              value={userRequestText}
              disabled={isLaunchingAiRequest}
              onChange={userRequestText => setUserRequestText(userRequestText)}
              placeholder="How to add a leaderboard to my game?"
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
              {!isMobile && disclaimer}
              <Line noMargin justifyContent="flex-end">
                <LeftLoader reserveSpace isLoading={isLaunchingAiRequest}>
                  <RaisedButton
                    color="primary"
                    label={<Trans>Send</Trans>}
                    style={{ flexShrink: 0 }}
                    disabled={isLaunchingAiRequest}
                    onClick={() => {
                      onSendUserRequest(userRequestText);
                    }}
                  />
                </LeftLoader>
              </Line>
              {isMobile && disclaimer}
            </ResponsiveLineStackLayout>
          </Line>
          {subscriptionBanner}
        </div>
      );
    }

    return (
      <ColumnStackLayout
        expand
        alignItems="stretch"
        justifyContent="stretch"
        useFullHeight
      >
        <ScrollView ref={scrollViewRef}>
          {aiRequest.output.flatMap((message, messageIndex) => {
            if (message.role === 'user') {
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
            if (message.role === 'assistant') {
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
                                    onSendFeedback(
                                      aiRequest.id,
                                      messageIndex,
                                      'dislike'
                                    );
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
                    return null;
                  })
                  .filter(Boolean),
              ];
            }

            return [];
          })}

          {aiRequest.status === 'error' ? (
            <Line justifyContent="flex-start">
              <AlertMessage kind="error">
                <Trans>
                  The AI encountered an error while handling your request. Try
                  again later.
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
        {aiRequest.output.length >= TOO_MANY_MESSAGES_WARNING_COUNT ? (
          <AlertMessage
            kind={
              aiRequest.output.length >= TOO_MANY_MESSAGES_ERROR_COUNT
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
        <CompactTextAreaField
          maxLength={6000}
          value={userRequestText}
          disabled={isLaunchingAiRequest}
          onChange={userRequestText => setUserRequestText(userRequestText)}
          placeholder="Ask a follow up question"
          rows={2}
        />
        <Column noMargin alignItems="flex-end">
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
                  disabled={aiRequest.status === 'working'}
                  label={<Trans>Send</Trans>}
                  onClick={() => {
                    onSendUserRequest(userRequestText);
                  }}
                />
              </LeftLoader>
            </Line>
            {isMobile && errorOrQuotaOrCreditsExplanation}
          </ResponsiveLineStackLayout>
        </Column>
      </ColumnStackLayout>
    );
  }
);
