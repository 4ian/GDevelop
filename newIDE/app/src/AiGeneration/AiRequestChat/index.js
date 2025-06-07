// @flow
import * as React from 'react';
import { I18n as I18nType } from '@lingui/core';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../../Utils/GDevelopServices/Generation';
import RaisedButton from '../../UI/RaisedButton';
import { CompactTextAreaFieldWithControls } from '../../UI/CompactTextAreaFieldWithControls';
import { Column, Line, Spacer } from '../../UI/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '../../UI/Paper';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import AlertMessage from '../../UI/AlertMessage';
import classes from './AiRequestChat.module.css';
import RobotIcon from '../../ProjectCreation/RobotIcon';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import GetSubscriptionCard from '../../Profile/Subscription/GetSubscriptionCard';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Link from '../../UI/Link';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { type EditorFunctionCallResult } from '../../EditorFunctions/EditorFunctionCallRunner';
import { type EditorCallbacks } from '../../EditorFunctions';
import { getFunctionCallsToProcess } from './AiRequestUtils';
import CircularProgress from '../../UI/CircularProgress';
import TwoStatesButton from '../../UI/TwoStatesButton';
import Help from '../../UI/CustomSvgIcons/Help';
import Hammer from '../../UI/CustomSvgIcons/Hammer';
import { ChatMessages } from './ChatMessages';

const TOO_MANY_USER_MESSAGES_WARNING_COUNT = 5;
const TOO_MANY_USER_MESSAGES_ERROR_COUNT = 10;

type Props = {
  project: gdProject | null,
  i18n: I18nType,
  aiRequest: AiRequest | null,

  isSending: boolean,
  onStartNewAiRequest: (options: {|
    userRequest: string,
    mode: 'chat' | 'agent',
  |}) => void,
  onSendMessage: (options: {|
    userMessage: string,
  |}) => Promise<void>,
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
  editorFunctionCallResults: Array<EditorFunctionCallResult> | null,
  editorCallbacks: EditorCallbacks,
  // Error that occurred while sending the last request.
  lastSendError: ?Error,

  // Quota available for using the feature.
  quota: Quota | null,
  increaseQuotaOffering: 'subscribe' | 'upgrade' | 'none',
  price: UsagePrice | null,
  availableCredits: number,
};

export type AiRequestChatInterface = {|
  resetUserInput: (aiRequestId: string | null) => void,
|};

const getQuotaOrCreditsText = ({
  quota,
  increaseQuotaOffering,
  price,
  availableCredits,
  isMobile,
}: {|
  quota: Quota | null,
  increaseQuotaOffering: 'subscribe' | 'upgrade' | 'none',
  price: UsagePrice | null,
  availableCredits: number,
  isMobile: boolean,
|}) => {
  if (!quota) return null;

  const quotaOrCreditsText = !quota.limitReached ? (
    <Tooltip
      title={
        <>
          {increaseQuotaOffering === 'subscribe' ? (
            <Trans>
              Get GDevelop premium to get more free requests every month.
            </Trans>
          ) : (
            <Trans>
              These are parts of your GDevelop premium membership ({quota.max}{' '}
              free requests per month).
            </Trans>
          )}{' '}
          <Trans>Free requests do not consume credits on your account.</Trans>
        </>
      }
    >
      <div>
        {isMobile ? (
          <Trans>{quota.max - quota.current} free requests left</Trans>
        ) : (
          <Trans>
            {quota.max - quota.current} of {quota.max} free requests left this
            month
          </Trans>
        )}
      </div>
    </Tooltip>
  ) : (
    <Trans>{Math.max(0, availableCredits)} credits available</Trans>
  );

  return quotaOrCreditsText;
};

const getPriceText = ({
  aiRequestMode,
  price,
}: {|
  aiRequestMode: 'chat' | 'agent',
  price: UsagePrice | null,
|}) => {
  if (!price) return null;

  const priceInCredits = price.priceInCredits;
  const maximumPriceInCredits =
    (price.variablePrice &&
      price.variablePrice[aiRequestMode] &&
      price.variablePrice[aiRequestMode].maximumPriceInCredits) ||
    null;

  const priceText = maximumPriceInCredits ? (
    <Trans>
      {priceInCredits} to {maximumPriceInCredits}
    </Trans>
  ) : (
    <Trans>{priceInCredits}</Trans>
  );

  return (
    <Tooltip
      title={
        aiRequestMode === 'agent' ? (
          <Trans>
            Each request to the AI agent costs {priceText} credits. It depends
            on the amount of work the agent will do and the number of times it
            generates events.
          </Trans>
        ) : (
          <Trans>Each answer from the AI costs {priceText} credits.</Trans>
        )
      }
    >
      <div>
        <LineStackLayout alignItems="center" noMargin>
          {aiRequestMode === 'agent' ? (
            <Hammer fontSize="small" />
          ) : (
            <Help fontSize="small" />
          )}
          {aiRequestMode === 'agent' ? (
            <Trans>{priceText} credits/request</Trans>
          ) : (
            <Trans>{priceText} credits/answer</Trans>
          )}
        </LineStackLayout>
      </div>
    </Tooltip>
  );
};

export const AiRequestChat = React.forwardRef<Props, AiRequestChatInterface>(
  (
    {
      project,
      aiRequest,
      isSending,
      onStartNewAiRequest,
      onSendMessage,
      onSendFeedback,
      quota,
      increaseQuotaOffering,
      lastSendError,
      price,
      availableCredits,
      hasOpenedProject,
      editorFunctionCallResults,
      onProcessFunctionCalls,
      isAutoProcessingFunctionCalls,
      setAutoProcessFunctionCalls,
      i18n,
      editorCallbacks,
    }: Props,
    ref
  ) => {
    // TODO: store the default mode in the user preferences?
    const [newAiRequestMode, setNewAiRequestMode] = React.useState<
      'chat' | 'agent'
    >('agent');
    const aiRequestId: string = aiRequest ? aiRequest.id : '';
    const [
      userRequestTextPerAiRequestId,
      setUserRequestTextPerRequestId,
    ] = React.useState<{ [string]: string }>({});
    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);

    const newChatPlaceholder = React.useMemo(
      () => {
        const newChatPlaceholders: Array<MessageDescriptor> =
          newAiRequestMode === 'agent'
            ? hasOpenedProject
              ? [
                  t`Add an enemy that spawns periodically`,
                  t`Display the score on the screen`,
                  t`Show an explosion when the player is hit`,
                ]
              : [
                  t`Build a platformer game with a score and coins to collect`,
                  t`Make a quizz game with a question and 4 answers`,
                  t`Make a game where the player must avoid obstacles`,
                ]
            : [
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
      },
      [newAiRequestMode, hasOpenedProject]
    );

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

    const priceText = (
      <Text size="body-small" color="secondary" noMargin>
        {getPriceText({
          aiRequestMode: aiRequest
            ? aiRequest.mode || 'chat'
            : newAiRequestMode,
          price,
        }) || '\u00A0'}
      </Text>
    );

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

    const errorText = lastSendError ? (
      <Text size="body-small" color="error" noMargin>
        <Trans>
          An error happened when sending your request, please try again.
        </Trans>
      </Text>
    ) : null;

    const quotaOrCreditsText = (
      <Text size="body-small" color="secondary" noMargin>
        {getQuotaOrCreditsText({
          quota,
          increaseQuotaOffering,
          price,
          availableCredits,
          isMobile,
        })}
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
                {newAiRequestMode === 'agent' ? (
                  <Trans>What do you want to make?</Trans>
                ) : (
                  <Trans>Ask any gamedev question</Trans>
                )}
              </Text>
            </Column>
            <Line noMargin justifyContent="center">
              <TwoStatesButton
                value={newAiRequestMode}
                leftButton={{
                  icon: <Hammer fontSize="small" />,
                  label: <Trans>Build for me</Trans>,
                  value: 'agent',
                }}
                rightButton={{
                  icon: <Help fontSize="small" />,
                  label: <Trans>Ask a question</Trans>,
                  value: 'chat',
                }}
                onChange={value => {
                  if (value !== 'chat' && value !== 'agent') {
                    return;
                  }
                  setNewAiRequestMode(value);
                }}
              />
            </Line>
            <form
              onSubmit={() => {
                onStartNewAiRequest({
                  mode: newAiRequestMode,
                  userRequest: userRequestTextPerAiRequestId[''],
                });
              }}
            >
              <ColumnStackLayout justifyContent="center" noMargin>
                <Column noMargin alignItems="stretch" justifyContent="stretch">
                  <Spacer />
                  <CompactTextAreaFieldWithControls
                    maxLength={6000}
                    value={userRequestTextPerAiRequestId[''] || ''}
                    disabled={isSending}
                    errored={!!lastSendError}
                    onChange={userRequestText =>
                      setUserRequestTextPerRequestId(
                        userRequestTextPerAiRequestId => ({
                          ...userRequestTextPerAiRequestId,
                          '': userRequestText,
                        })
                      )
                    }
                    onSubmit={() => {
                      onStartNewAiRequest({
                        mode: newAiRequestMode,
                        userRequest: userRequestTextPerAiRequestId[''],
                      });
                    }}
                    placeholder={newChatPlaceholder}
                    rows={5}
                    controls={
                      <Column>
                        <LineStackLayout
                          alignItems="center"
                          justifyContent="flex-end"
                        >
                          <RaisedButton
                            color="primary"
                            label={
                              newAiRequestMode === 'agent' ? (
                                hasOpenedProject ? (
                                  <Trans>Build this on my game</Trans>
                                ) : (
                                  <Trans>Start building the game</Trans>
                                )
                              ) : (
                                <Trans>Send question</Trans>
                              )
                            }
                            style={{ flexShrink: 0 }}
                            disabled={
                              isSending ||
                              !userRequestTextPerAiRequestId[aiRequestId]
                            }
                            onClick={() => {
                              onStartNewAiRequest({
                                mode: newAiRequestMode,
                                userRequest: userRequestTextPerAiRequestId[''],
                              });
                            }}
                          />
                        </LineStackLayout>
                      </Column>
                    }
                  />
                </Column>
                <Line noMargin>
                  <LineStackLayout
                    noMargin
                    alignItems="center"
                    justifyContent="space-between"
                    expand
                  >
                    {errorText || priceText}
                    {errorText ? null : quotaOrCreditsText}
                  </LineStackLayout>
                </Line>
              </ColumnStackLayout>
            </form>
            {subscriptionBanner}
          </ColumnStackLayout>
          <Column justifyContent="center">
            {newAiRequestMode === 'agent' ? (
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>
                  The AI agent will build simple games or features for you.{' '}
                  <Link
                    href={getHelpLink('/interface/ask-ai')}
                    color="secondary"
                    onClick={() =>
                      Window.openExternalURL(getHelpLink('/interface/ask-ai'))
                    }
                  >
                    It can inspect your game objects and events.
                  </Link>
                </Trans>
              </Text>
            ) : (
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>
                  The AI chat is experimental and still being improved.{' '}
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
            )}
            {newAiRequestMode === 'agent' ? (
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>
                  Results may vary: experiment and use it for learning.
                </Trans>
              </Text>
            ) : (
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>Answers may have mistakes: always verify them.</Trans>
              </Text>
            )}
          </Column>
        </div>
      );
    }

    const userMessagesCount = aiRequest.output.filter(
      message => message.type === 'message' && message.role === 'user'
    ).length;

    const hasWorkingFunctionCalls =
      editorFunctionCallResults &&
      editorFunctionCallResults.some(
        functionCallOutput => functionCallOutput.status === 'working'
      );
    const allFunctionCallsToProcess = getFunctionCallsToProcess({
      aiRequest,
      editorFunctionCallResults,
    });

    return (
      <ColumnStackLayout
        expand
        alignItems="stretch"
        justifyContent="stretch"
        useFullHeight
      >
        <ScrollView ref={scrollViewRef}>
          <ChatMessages
            aiRequest={aiRequest}
            onSendFeedback={onSendFeedback}
            editorFunctionCallResults={editorFunctionCallResults}
            editorCallbacks={editorCallbacks}
            project={project}
            onProcessFunctionCalls={onProcessFunctionCalls}
          />
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
            onSendMessage({
              userMessage: userRequestTextPerAiRequestId[aiRequestId] || '',
            });
          }}
        >
          <ColumnStackLayout
            justifyContent="stretch"
            alignItems="stretch"
            noMargin
          >
            {isAutoProcessingFunctionCalls &&
            (hasWorkingFunctionCalls ||
              isSending ||
              aiRequest.status === 'working') ? (
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
            ) : !isAutoProcessingFunctionCalls &&
              allFunctionCallsToProcess.length > 0 ? (
              <Paper background="dark" variant="outlined" square>
                <Column>
                  <LineStackLayout
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <LineStackLayout alignItems="center" noMargin>
                      <Text size="body" color="secondary" noMargin>
                        <Trans>The AI agent is paused.</Trans>
                      </Text>
                    </LineStackLayout>
                    <Text size="body" noMargin>
                      <Link
                        href={'#'}
                        color="secondary"
                        onClick={() => {
                          setAutoProcessFunctionCalls(true);
                          onProcessFunctionCalls(allFunctionCallsToProcess);
                        }}
                      >
                        <Trans>
                          Apply everything and continue autonomously
                        </Trans>
                      </Link>
                    </Text>
                  </LineStackLayout>
                </Column>
              </Paper>
            ) : null}
            <CompactTextAreaFieldWithControls
              maxLength={6000}
              value={userRequestTextPerAiRequestId[aiRequestId] || ''}
              disabled={isSending}
              errored={!!lastSendError}
              onChange={userRequestText =>
                setUserRequestTextPerRequestId(
                  userRequestTextPerAiRequestId => ({
                    ...userRequestTextPerAiRequestId,
                    [aiRequestId]: userRequestText,
                  })
                )
              }
              placeholder={
                aiRequest.mode === 'agent'
                  ? t`Specify something more to the AI to build`
                  : t`Ask a follow up question`
              }
              rows={2}
              onSubmit={() => {
                onSendMessage({
                  userMessage: userRequestTextPerAiRequestId[aiRequestId] || '',
                });
              }}
              controls={
                <Column>
                  <LineStackLayout
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <RaisedButton
                      color="primary"
                      disabled={aiRequest.status === 'working' || isSending}
                      label={<Trans>Send</Trans>}
                      onClick={() => {
                        onSendMessage({
                          userMessage:
                            userRequestTextPerAiRequestId[aiRequestId] || '',
                        });
                      }}
                    />
                  </LineStackLayout>
                </Column>
              }
            />
            <Column noMargin alignItems="stretch">
              <LineStackLayout
                expand
                noMargin
                alignItems="center"
                justifyContent="space-between"
              >
                {errorText || priceText}
                {errorText ? null : quotaOrCreditsText}
              </LineStackLayout>
            </Column>
          </ColumnStackLayout>
        </form>
      </ColumnStackLayout>
    );
  }
);
