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
import { getFunctionCallsToProcess } from '../AiRequestUtils';
import CircularProgress from '../../UI/CircularProgress';
import TwoStatesButton from '../../UI/TwoStatesButton';
import Help from '../../UI/CustomSvgIcons/Help';
import Hammer from '../../UI/CustomSvgIcons/Hammer';
import { ChatMessages } from './ChatMessages';
import Send from '../../UI/CustomSvgIcons/Send';
import { FeedbackBanner } from './FeedbackBanner';
import classNames from 'classnames';
import {
  type AiConfigurationPresetWithAvailability,
  getDefaultAiConfigurationPresetId,
} from '../AiConfiguration';
import { AiConfigurationPresetSelector } from './AiConfigurationPresetSelector';
import { AiRequestContext } from '../AiRequestContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import CircledInfo from '../../UI/CustomSvgIcons/CircledInfo';
import Coin from '../../Credits/Icons/Coin';
import GoldCompact from '../../Profile/Subscription/Icons/GoldCompact';

const TOO_MANY_USER_MESSAGES_WARNING_COUNT = 5;
const TOO_MANY_USER_MESSAGES_ERROR_COUNT = 10;

const styles = {
  chatScrollView: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
    paddingTop: 14,
    maskImage: 'linear-gradient(to bottom, transparent, black 14px)',
    maskSize: '100% 100%',
    maskRepeat: 'no-repeat',
  },
};

type Props = {
  project: ?gdProject,
  i18n: I18nType,
  aiRequest: AiRequest | null,

  isSending: boolean,
  onStartNewAiRequest: (options: {|
    userRequest: string,
    mode: 'chat' | 'agent',
    aiConfigurationPresetId: string,
  |}) => void,
  onSendMessage: (options: {|
    userMessage: string,
    createdSceneNames?: Array<string>,
  |}) => Promise<void>,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string,
    freeFormDetails?: string
  ) => Promise<void>,
  hasOpenedProject: boolean,
  isAutoProcessingFunctionCalls: boolean,
  setAutoProcessFunctionCalls: boolean => void,
  onStartOrOpenChat: (
    ?{|
      mode: 'chat' | 'agent',
      aiRequestId: string | null,
    |}
  ) => void,
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>,

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

  standAloneForm?: boolean,
};

export type AiRequestChatInterface = {|
  resetUserInput: (aiRequestId: string | null) => void,
|};

const getPriceAndRequestsTextAndTooltip = ({
  quota,
  increaseQuotaOffering,
  price,
  availableCredits,
  isMobile,
  aiRequestMode,
  lastUserMessagePriceInCredits,
}: {|
  quota: Quota | null,
  increaseQuotaOffering: 'subscribe' | 'upgrade' | 'none',
  price: UsagePrice | null,
  availableCredits: number,
  isMobile: boolean,
  aiRequestMode: 'chat' | 'agent',
  lastUserMessagePriceInCredits?: number | null,
|}): {|
  text: React.Node | null,
  tooltipInfoIcon: React.Node | null,
|} => {
  if (!quota || !price)
    return {
      text: null,
      tooltipInfoIcon: null,
    };

  // Display a text if > 50% requests done.
  const shouldShowText = quota.current / quota.max >= 0.5;

  const requestsLeft = quota.max - quota.current;

  const currentQuotaText = isMobile ? (
    increaseQuotaOffering === 'subscribe' ? (
      requestsLeft === 1 ? (
        <Trans>{requestsLeft} trial request left</Trans>
      ) : (
        <Trans>{requestsLeft} trial requests left</Trans>
      )
    ) : requestsLeft === 1 ? (
      <Trans>{requestsLeft} request left</Trans>
    ) : (
      <Trans>{requestsLeft} requests left</Trans>
    )
  ) : quota.period === '30days' ? (
    increaseQuotaOffering === 'subscribe' ? (
      requestsLeft === 1 ? (
        <Trans>{requestsLeft} trial request left this month</Trans>
      ) : (
        <Trans>{requestsLeft} trial requests left this month</Trans>
      )
    ) : requestsLeft === 1 ? (
      <Trans>{requestsLeft} request left this month</Trans>
    ) : (
      <Trans>{requestsLeft} requests left this month</Trans>
    )
  ) : quota.period === '7days' ? (
    increaseQuotaOffering === 'subscribe' ? (
      requestsLeft === 1 ? (
        <Trans>{requestsLeft} trial request left this week</Trans>
      ) : (
        <Trans>{requestsLeft} trial requests left this week</Trans>
      )
    ) : requestsLeft === 1 ? (
      <Trans>{requestsLeft} request left this week</Trans>
    ) : (
      <Trans>{requestsLeft} requests left this week</Trans>
    )
  ) : quota.period === '1day' ? (
    increaseQuotaOffering === 'subscribe' ? (
      requestsLeft === 1 ? (
        <Trans>{requestsLeft} trial request left today</Trans>
      ) : (
        <Trans>{requestsLeft} trial requests left today</Trans>
      )
    ) : requestsLeft === 1 ? (
      <Trans>{requestsLeft} request left today</Trans>
    ) : (
      <Trans>{requestsLeft} requests left today</Trans>
    )
  ) : requestsLeft === 1 ? (
    <Trans>{requestsLeft} request left</Trans>
  ) : (
    <Trans>{requestsLeft} requests left</Trans>
  );
  const creditsText = (
    <Trans>{Math.max(0, availableCredits)} credits available</Trans>
  );
  const priceInCredits = price.priceInCredits;
  const maximumPriceInCredits =
    (price.variablePrice &&
      price.variablePrice[aiRequestMode] &&
      price.variablePrice[aiRequestMode]['default'] &&
      price.variablePrice[aiRequestMode]['default'].maximumPriceInCredits) ||
    null;
  const minimumPriceInCredits =
    (price.variablePrice &&
      price.variablePrice[aiRequestMode] &&
      price.variablePrice[aiRequestMode]['default'] &&
      price.variablePrice[aiRequestMode]['default'].minimumPriceInCredits) ||
    null;

  const priceText = maximumPriceInCredits
    ? `${minimumPriceInCredits || priceInCredits}-${maximumPriceInCredits}`
    : minimumPriceInCredits || priceInCredits;

  const tooltipText = (
    <ColumnStackLayout noMargin>
      <Line noMargin>
        {currentQuotaText} <Trans>(out of {quota.max} requests)</Trans>
      </Line>
      {increaseQuotaOffering === 'subscribe' ? (
        <Trans>Get GDevelop premium to get more requests.</Trans>
      ) : (
        <Trans>These are parts of your GDevelop premium membership.</Trans>
      )}
      {aiRequestMode === 'agent' ? (
        <>
          <Trans>
            You can also use credits once your quota is reached. Each request to
            the AI agent costs {priceText} credits. It depends on the amount of
            work the agent will do and the number of times it generates events.
          </Trans>{' '}
          {lastUserMessagePriceInCredits ? (
            <Trans>
              The last request used {lastUserMessagePriceInCredits} credits.
            </Trans>
          ) : null}
        </>
      ) : (
        <Trans>
          You can also use credits once your quota is reached. Each answer from
          the AI costs {priceText} credits.
        </Trans>
      )}
      {quota.limitReached ? creditsText : null}
    </ColumnStackLayout>
  );

  const tooltipInfoIcon = (
    <Tooltip title={tooltipText}>
      <CircledInfo color="disabled" />
    </Tooltip>
  );
  const text = shouldShowText ? (
    <Text size="body-small" color="secondary">
      {quota.limitReached ? creditsText : currentQuotaText}
    </Text>
  ) : null;
  return { text, tooltipInfoIcon };
};

const getSendButtonLabel = ({
  aiRequest,
  aiRequestMode,
  isWorking,
  hasReachedLimitAndCannotUseCredits,
  hasSubcription,
  isMobile,
  hasOpenedProject,
  standAloneForm,
}: {|
  aiRequest: AiRequest | null,
  aiRequestMode?: 'chat' | 'agent',
  isWorking: boolean,
  hasReachedLimitAndCannotUseCredits: boolean,
  hasSubcription: boolean,
  isMobile: boolean,
  hasOpenedProject: boolean,
  standAloneForm?: boolean,
|}): React.Node => {
  if (aiRequest && !standAloneForm) {
    // We're in a running chat, that is not standalone,
    // hide label, except if need to upgrade/buy credits.
    return hasReachedLimitAndCannotUseCredits ? (
      hasSubcription ? (
        <Trans>Get credits</Trans>
      ) : (
        <Trans>Upgrade</Trans>
      )
    ) : null;
  }

  return aiRequestMode === 'agent' ? (
    isWorking ? (
      <Trans>Building...</Trans>
    ) : hasReachedLimitAndCannotUseCredits ? (
      hasSubcription ? (
        <Trans>Get credits</Trans>
      ) : (
        <Trans>Upgrade</Trans>
      )
    ) : isMobile ? (
      <Trans>Build</Trans>
    ) : hasOpenedProject && !standAloneForm ? (
      <Trans>Build this on my game</Trans>
    ) : (
      <Trans>Start building the game</Trans>
    )
  ) : isWorking ? (
    <Trans>Sending...</Trans>
  ) : (
    <Trans>Send question</Trans>
  );
};

const getSendButtonIcon = ({
  hasReachedLimitAndCannotUseCredits,
  hasSubcription,
}) => {
  return hasReachedLimitAndCannotUseCredits ? (
    hasSubcription ? (
      <Coin fontSize="small" />
    ) : (
      <GoldCompact fontSize="small" />
    )
  ) : (
    <Send fontSize="small" />
  );
};

export const AiRequestChat = React.forwardRef<Props, AiRequestChatInterface>(
  (
    {
      aiConfigurationPresetsWithAvailability,
      project,
      aiRequest,
      isSending,
      onStartNewAiRequest,
      onSendMessage,
      onSendFeedback,
      onStartOrOpenChat,
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
      standAloneForm,
    }: Props,
    ref
  ) => {
    const {
      aiRequestHistory: { handleNavigateHistory, resetNavigation },
    } = React.useContext(AiRequestContext);
    const { values, setAiState } = React.useContext(PreferencesContext);
    const aiRequestMode = values.aiState.mode;

    const [
      aiConfigurationPresetId,
      setAiConfigurationPresetId,
    ] = React.useState<string | null>(null);

    React.useEffect(
      () => {
        if (!aiConfigurationPresetsWithAvailability.length) return;

        if (!aiConfigurationPresetId) return;

        if (
          aiConfigurationPresetsWithAvailability.find(
            preset =>
              preset.id === aiConfigurationPresetId &&
              preset.mode === aiRequestMode
          )
        ) {
          return;
        }

        // The selected preset is not a valid choice for the current mode - reset it.
        console.info(
          "Reset the AI configuration preset because it's not valid for the current mode."
        );
        setAiConfigurationPresetId(null);
      },
      [
        aiRequestMode,
        aiConfigurationPresetsWithAvailability,
        aiConfigurationPresetId,
      ]
    );

    const aiRequestId: string = aiRequest ? aiRequest.id : '';
    const [
      userRequestTextPerAiRequestId,
      setUserRequestTextPerRequestId,
    ] = React.useState<{ [string]: string }>({});

    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = React.useState<boolean>(
      true
    );
    const requiredGameId = (aiRequest && aiRequest.gameId) || null;

    // Auto-scroll to bottom when content changes, if user is at the bottom
    React.useEffect(
      () => {
        if (shouldAutoScroll && scrollViewRef.current) {
          scrollViewRef.current.scrollToBottom({
            behavior: 'smooth',
          });
        }
      },
      [aiRequest, editorFunctionCallResults, lastSendError, shouldAutoScroll]
    );

    const onScroll = React.useCallback(
      ({ remainingScreensToBottom }: { remainingScreensToBottom: number }) => {
        // Consider the user is at the bottom when they are less than 0.1 screen away from the bottom.
        const isAtBottom = remainingScreensToBottom < 0.1;
        setShouldAutoScroll(isAtBottom);
      },
      []
    );

    const newChatPlaceholder = React.useMemo(
      () => {
        const newChatPlaceholders: Array<MessageDescriptor> =
          aiRequestMode === 'agent'
            ? hasOpenedProject && !standAloneForm
              ? [
                  t`Add solid rocks that falls from the sky at a random position around the player every 0.5 seconds`,
                  t`Add a score and display it on the screen`,
                  t`Create a 3D explosion when the player is hit`,
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
                ...(hasOpenedProject && !standAloneForm
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
      [aiRequestMode, hasOpenedProject, standAloneForm]
    );

    const onUserRequestTextChange = React.useCallback(
      (userRequestText: string, aiRequestIdToChange: string) => {
        setUserRequestTextPerRequestId(userRequestTextPerAiRequestId => ({
          ...userRequestTextPerAiRequestId,
          [aiRequestIdToChange]: userRequestText,
        }));
        // Reset history navigation when field is cleared,
        // so that pressing up goes to the last message again.
        if (!userRequestText) {
          resetNavigation();
        }
      },
      [resetNavigation]
    );

    // Reset history navigation when aiRequest changes,
    // ensuring pressing up and down doesn't depend on the previous aiRequest.
    React.useEffect(
      () => {
        resetNavigation();
      },
      [resetNavigation, aiRequestId]
    );

    React.useImperativeHandle(ref, () => ({
      resetUserInput: (aiRequestId: string | null) => {
        const aiRequestIdToReset: string = aiRequestId || '';
        onUserRequestTextChange('', aiRequestIdToReset);

        if (scrollViewRef.current) {
          scrollViewRef.current.scrollToBottom({
            behavior: 'smooth',
          });
        }
      },
    }));

    const { isMobile } = useResponsiveWindowSize();

    const errorText = lastSendError ? (
      <Text size="body-small" color="error">
        <Trans>
          An error happened when sending your request, please try again.
        </Trans>
      </Text>
    ) : null;

    const priceAndRequestsTextAndTooltip = getPriceAndRequestsTextAndTooltip({
      quota,
      increaseQuotaOffering,
      price,
      availableCredits,
      isMobile,
      aiRequestMode,
      lastUserMessagePriceInCredits:
        (aiRequest && aiRequest.lastUserMessagePriceInCredits) || null,
    });
    const priceAndRequestsText = priceAndRequestsTextAndTooltip.text;
    const priceAndRequestsTooltipInfoIcon =
      priceAndRequestsTextAndTooltip.tooltipInfoIcon;

    const chosenOrDefaultAiConfigurationPresetId =
      aiConfigurationPresetId ||
      getDefaultAiConfigurationPresetId(
        aiRequestMode,
        aiConfigurationPresetsWithAvailability
      );
    const hasWorkingFunctionCalls =
      editorFunctionCallResults &&
      editorFunctionCallResults.some(
        functionCallOutput => functionCallOutput.status === 'working'
      );
    const isWorking =
      isSending ||
      ((!!hasWorkingFunctionCalls ||
        (!!aiRequest && aiRequest.status === 'working')) &&
        isAutoProcessingFunctionCalls);

    const hasReachedLimitAndCannotUseCredits =
      !!quota &&
      quota.limitReached &&
      !!price &&
      availableCredits <= price.priceInCredits;
    const hasSubcription = increaseQuotaOffering !== 'subscribe';

    const sendButtonLabel = getSendButtonLabel({
      aiRequest,
      aiRequestMode,
      isWorking,
      hasReachedLimitAndCannotUseCredits,
      hasSubcription,
      isMobile,
      hasOpenedProject,
      standAloneForm,
    });
    const sendButtonIcon = getSendButtonIcon({
      hasReachedLimitAndCannotUseCredits,
      hasSubcription,
      isMobile,
      standAloneForm,
    });

    if (!aiRequest || standAloneForm) {
      return (
        <div
          className={classNames({
            [classes.newChatContainer]: true,
            // Move the entire screen up when the soft keyboard is open:
            'avoid-soft-keyboard': true,
          })}
        >
          <ColumnStackLayout justifyContent="center" expand noMargin>
            {!standAloneForm && (
              <Line noMargin justifyContent="center">
                <RobotIcon rotating size={40} />
              </Line>
            )}
            {!standAloneForm && (
              <Column noMargin alignItems="center">
                <Text size="bold-title" align="center">
                  {aiRequestMode === 'agent' ? (
                    <Trans>What do you want to make?</Trans>
                  ) : (
                    <Trans>Ask any gamedev question</Trans>
                  )}
                </Text>
              </Column>
            )}
            {!standAloneForm && (
              <Line noMargin justifyContent="center">
                <TwoStatesButton
                  value={aiRequestMode}
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
                    setAiState({ mode: value, aiRequestId: null });
                  }}
                  disabled={isWorking}
                />
              </Line>
            )}
            <form
              onSubmit={() => {
                onStartNewAiRequest({
                  mode: aiRequestMode,
                  userRequest: userRequestTextPerAiRequestId[''],
                  aiConfigurationPresetId: chosenOrDefaultAiConfigurationPresetId,
                });
              }}
            >
              <Column noMargin alignItems="stretch" justifyContent="stretch">
                <Spacer />
                <CompactTextAreaFieldWithControls
                  maxLength={6000}
                  value={userRequestTextPerAiRequestId[''] || ''}
                  disabled={isWorking}
                  neonCorner
                  hasAnimatedNeonCorner={isWorking}
                  errored={!!lastSendError}
                  onChange={userRequestText => {
                    onUserRequestTextChange(userRequestText, '');
                  }}
                  onNavigateHistory={handleNavigateHistory}
                  onSubmit={() => {
                    onStartNewAiRequest({
                      mode: aiRequestMode,
                      userRequest: userRequestTextPerAiRequestId[''],
                      aiConfigurationPresetId: chosenOrDefaultAiConfigurationPresetId,
                    });
                  }}
                  placeholder={
                    isWorking
                      ? t`Thinking about your request...`
                      : newChatPlaceholder
                  }
                  rows={standAloneForm ? 2 : 5}
                  controls={
                    <Column>
                      <LineStackLayout
                        alignItems="flex-end"
                        justifyContent="space-between"
                      >
                        <AiConfigurationPresetSelector
                          chosenOrDefaultAiConfigurationPresetId={
                            chosenOrDefaultAiConfigurationPresetId
                          }
                          setAiConfigurationPresetId={
                            setAiConfigurationPresetId
                          }
                          aiConfigurationPresetsWithAvailability={
                            aiConfigurationPresetsWithAvailability
                          }
                          aiRequestMode={aiRequestMode}
                          disabled={isWorking}
                        />
                        <RaisedButton
                          color="primary"
                          icon={sendButtonIcon}
                          label={sendButtonLabel}
                          style={{ flexShrink: 0 }}
                          disabled={
                            isWorking ||
                            (!userRequestTextPerAiRequestId[aiRequestId] &&
                              !hasReachedLimitAndCannotUseCredits)
                          }
                          onClick={() => {
                            onStartNewAiRequest({
                              mode: aiRequestMode,
                              userRequest: userRequestTextPerAiRequestId[''],
                              aiConfigurationPresetId: chosenOrDefaultAiConfigurationPresetId,
                            });
                          }}
                        />
                      </LineStackLayout>
                    </Column>
                  }
                />
                <Line
                  expand
                  noMargin
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  {errorText}
                  {errorText ? '' : priceAndRequestsText}
                  {priceAndRequestsTooltipInfoIcon}
                </Line>
              </Column>
            </form>
          </ColumnStackLayout>
          <Spacer />
          {!standAloneForm && (
            <Column justifyContent="center">
              {aiRequestMode === 'agent' ? (
                <Text
                  size="body-small"
                  color="secondary"
                  align="center"
                  noMargin
                >
                  <Trans>
                    The AI agent will build simple games or features for you.{' '}
                    <Link
                      href={getHelpLink('/interface/ai')}
                      color="secondary"
                      onClick={() =>
                        Window.openExternalURL(getHelpLink('/interface/ai'))
                      }
                    >
                      It can inspect your game objects and events.
                    </Link>
                  </Trans>
                </Text>
              ) : (
                <Text
                  size="body-small"
                  color="secondary"
                  align="center"
                  noMargin
                >
                  <Trans>
                    The AI chat is experimental and still being improved.{' '}
                    <Link
                      href={getHelpLink('/interface/ai')}
                      color="secondary"
                      onClick={() =>
                        Window.openExternalURL(getHelpLink('/interface/ai'))
                      }
                    >
                      It has access to your game objects but not events.
                    </Link>
                  </Trans>
                </Text>
              )}
              {aiRequestMode === 'agent' ? (
                <Text
                  size="body-small"
                  color="secondary"
                  align="center"
                  noMargin
                >
                  <Trans>
                    Results may vary: experiment and use it for learning.
                  </Trans>
                </Text>
              ) : (
                <Text
                  size="body-small"
                  color="secondary"
                  align="center"
                  noMargin
                >
                  <Trans>Answers may have mistakes: always verify them.</Trans>
                </Text>
              )}
            </Column>
          )}
        </div>
      );
    }

    const userMessagesCount = aiRequest.output.filter(
      message => message.type === 'message' && message.role === 'user'
    ).length;
    const allFunctionCallsToProcess = getFunctionCallsToProcess({
      aiRequest,
      editorFunctionCallResults,
    });
    const isPausedAndHasFunctionCallsToProcess =
      !isAutoProcessingFunctionCalls && allFunctionCallsToProcess.length > 0;

    const lastMessageIndex = aiRequest.output.length - 1;
    const lastMessage = aiRequest.output[lastMessageIndex];
    const shouldDisplayFeedbackBanner =
      !hasWorkingFunctionCalls &&
      !isPausedAndHasFunctionCallsToProcess &&
      !isSending &&
      aiRequest.status === 'ready' &&
      aiRequest.mode === 'agent' &&
      lastMessage.type === 'message' &&
      lastMessage.role === 'assistant';
    const lastMessageFeedbackBanner = shouldDisplayFeedbackBanner && (
      <FeedbackBanner
        onSendFeedback={(
          feedback: 'like' | 'dislike',
          reason?: string,
          freeFormDetails?: string
        ) => {
          onSendFeedback(
            aiRequestId,
            lastMessageIndex,
            feedback,
            reason,
            freeFormDetails
          );
        }}
      />
    );

    const isForAnotherProject =
      !!requiredGameId &&
      (!project || requiredGameId !== project.getProjectUuid());
    const isForAnotherProjectText = isForAnotherProject ? (
      <Text size="body-small" color="secondary" align="center">
        <Trans>
          This request is for another project.{' '}
          <Link
            href="#"
            onClick={() =>
              onStartOrOpenChat({
                mode: aiRequest.mode || 'chat',
                aiRequestId: null,
              })
            }
          >
            Start a new chat
          </Link>{' '}
          to build on a new project.
        </Trans>
      </Text>
    ) : null;

    return (
      <div
        className={classNames({
          [classes.aiRequestChatContainer]: true,
        })}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScrollView}
          onScroll={onScroll}
        >
          <ChatMessages
            aiRequest={aiRequest}
            onSendFeedback={onSendFeedback}
            editorFunctionCallResults={editorFunctionCallResults}
            editorCallbacks={editorCallbacks}
            project={project}
            onProcessFunctionCalls={onProcessFunctionCalls}
          />
          <Spacer />
          <ColumnStackLayout noMargin>
            {lastMessageFeedbackBanner}
            {userMessagesCount >= TOO_MANY_USER_MESSAGES_WARNING_COUNT ? (
              <AlertMessage
                kind={
                  userMessagesCount >= TOO_MANY_USER_MESSAGES_ERROR_COUNT
                    ? 'error'
                    : 'warning'
                }
              >
                <Trans>
                  The chat is becoming long - consider creating a new chat to
                  ask other questions. The AI will better analyze your game and
                  request in a new chat.
                </Trans>
              </AlertMessage>
            ) : null}
          </ColumnStackLayout>
        </ScrollView>
        <form
          onSubmit={() => {
            onSendMessage({
              userMessage: userRequestTextPerAiRequestId[aiRequestId] || '',
            });
          }}
          className={classNames({
            // Move the form up when the soft keyboard is open:
            'avoid-soft-keyboard': true,
          })}
        >
          <Column justifyContent="stretch" alignItems="stretch" noMargin>
            {aiRequest.mode === 'agent' && isWorking ? (
              <Paper background="dark" variant="outlined">
                <Column>
                  <LineStackLayout
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <LineStackLayout alignItems="center" noMargin>
                      <CircularProgress variant="indeterminate" size={12} />
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
            ) : aiRequest.mode === 'agent' &&
              isPausedAndHasFunctionCallsToProcess ? (
              <Paper background="dark" variant="outlined">
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
                        <Trans>Resume all</Trans>
                      </Link>
                    </Text>
                  </LineStackLayout>
                </Column>
              </Paper>
            ) : null}
            {!standAloneForm && (
              <CompactTextAreaFieldWithControls
                maxLength={6000}
                value={userRequestTextPerAiRequestId[aiRequestId] || ''}
                disabled={isWorking || isForAnotherProject}
                errored={!!lastSendError}
                neonCorner
                hasAnimatedNeonCorner={isWorking}
                onChange={userRequestText =>
                  onUserRequestTextChange(userRequestText, aiRequestId)
                }
                onNavigateHistory={handleNavigateHistory}
                placeholder={
                  aiRequest.mode === 'agent'
                    ? isForAnotherProject
                      ? t`You must re-open the project to continue this chat.`
                      : isWorking
                      ? t`Thinking about your request...`
                      : t`Specify something more to the AI to build`
                    : t`Ask a follow up question`
                }
                rows={2}
                onSubmit={() => {
                  onSendMessage({
                    userMessage:
                      userRequestTextPerAiRequestId[aiRequestId] || '',
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
                        disabled={
                          isWorking ||
                          isForAnotherProject ||
                          (!userRequestTextPerAiRequestId[aiRequestId] &&
                            !hasReachedLimitAndCannotUseCredits)
                        }
                        icon={sendButtonIcon}
                        label={sendButtonLabel}
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
            )}
            {
              <Line
                noMargin
                expand
                alignItems="center"
                justifyContent="flex-end"
              >
                {isForAnotherProjectText}
                {isForAnotherProjectText ? '' : errorText}
                {isForAnotherProjectText || errorText
                  ? ''
                  : priceAndRequestsText}
                {priceAndRequestsTooltipInfoIcon}
              </Line>
            }
          </Column>
        </form>
      </div>
    );
  }
);
