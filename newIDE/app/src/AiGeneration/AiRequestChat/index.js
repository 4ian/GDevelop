// @flow
import * as React from 'react';
import { I18n as I18nType } from '@lingui/core';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessage,
  type AiRequestMessageAssistantFunctionCall,
} from '../../Utils/GDevelopServices/Generation';
import RaisedButton from '../../UI/RaisedButton';
import { CompactTextAreaFieldWithControls } from '../../UI/CompactTextAreaFieldWithControls';
import { Column, Line, Spacer } from '../../UI/Grid';
import Tooltip from '@material-ui/core/Tooltip';
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
import {
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from '../AiRequestUtils';
import HelpQuestion from '../../UI/CustomSvgIcons/HelpQuestion';
import Hammer from '../../UI/CustomSvgIcons/Hammer';
import { ChatMessages } from './ChatMessages';
import Send from '../../UI/CustomSvgIcons/Send';
import classNames from 'classnames';
import {
  type AiConfigurationPresetWithAvailability,
  getDefaultAiConfigurationPresetId,
} from '../AiConfiguration';
import { AiConfigurationPresetSelector } from './AiConfigurationPresetSelector';
import { AiRequestContext } from '../AiRequestContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useStickyVisibility } from './UseStickyVisibility';
import CircledInfo from '../../UI/CustomSvgIcons/CircledInfo';
import Coin from '../../Credits/Icons/Coin';
import FlatButton from '../../UI/FlatButton';
import GoldCompact from '../../Profile/Subscription/Icons/GoldCompact';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import { CreditsPackageStoreContext } from '../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import Paper from '../../UI/Paper';
import SelectOption from '../../UI/SelectOption';
import CompactSelectField from '../../UI/CompactSelectField';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type FileMetadata } from '../../ProjectsStorage';

const TOO_MANY_USER_MESSAGES_WARNING_COUNT = 15;
const TOO_MANY_USER_MESSAGES_ERROR_COUNT = 20;

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
  creditOrSubscriptionPaper: {
    margin: 2,
    display: 'flex',
    alignItems: 'center',
  },
};

const getRowsAndHeight = ({
  standAloneForm,
}: {|
  standAloneForm?: boolean,
|}) => {
  const rows = standAloneForm ? 2 : 5;
  // Matching height to avoid layout shifts when showing subscription/credits prompt.
  const height = standAloneForm ? 93 : 153;
  return { rows, height };
};

const getPriceAndRequestsTextAndTooltip = ({
  quota,
  price,
  availableCredits,
  selectedMode,
  automaticallyUseCreditsForAiRequests,
}: {|
  quota: Quota | null,
  price: UsagePrice | null,
  availableCredits: number,
  selectedMode: 'chat' | 'agent',
  automaticallyUseCreditsForAiRequests: boolean,
|}): React.Node => {
  if (!quota || !price) {
    // Placeholder to avoid layout shift.
    return <div style={{ height: 29 }} />;
  }

  const aiCreditsAvailable = Math.max(0, quota.max - quota.current);

  const currentQuotaText = (
    <Trans>{aiCreditsAvailable} AI credits available</Trans>
  );
  const creditsText = (
    <Trans>{Math.max(0, availableCredits)} credits available</Trans>
  );

  const timeForReset = quota.resetsAt ? new Date(quota.resetsAt) : null;
  const now = new Date();
  let summarySentence =
    quota.period === '7days' ? (
      <Trans>Your credits reset every week.</Trans>
    ) : quota.period === '30days' ? (
      <Trans>Your credits reset every month.</Trans>
    ) : (
      <Trans>Your credits reset every day.</Trans>
    );
  if (timeForReset) {
    const timeDiff = timeForReset.getTime() - now.getTime();
    // Date to look like 'Nov 30th'
    const dateString = timeForReset.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    // Time to look like '14:05'
    const timeString = timeForReset.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    if (timeDiff <= 0) {
      summarySentence = <Trans>Your credits will reset soon.</Trans>;
    } else {
      summarySentence = (
        <Trans>
          You need to wait until {dateString} at {timeString} to reset to
          {quota.max} AI credits.
        </Trans>
      );
    }
  }

  const tooltipText = (
    <ColumnStackLayout noMargin>
      {summarySentence && <Line noMargin>{summarySentence}</Line>}
      <Line noMargin>
        <Link
          href={getHelpLink('/interface/ai/', 'cost-of-ai-requests')}
          color="secondary"
          onClick={() =>
            Window.openExternalURL(
              getHelpLink('/interface/ai/', 'cost-of-ai-requests')
            )
          }
        >
          Learn more
        </Link>
      </Line>
    </ColumnStackLayout>
  );

  const shouldShowCredits =
    quota.limitReached && automaticallyUseCreditsForAiRequests;

  return (
    <LineStackLayout alignItems="center" noMargin>
      {shouldShowCredits && <Coin fontSize="small" />}
      <Text size="body-small" color="secondary" noMargin>
        {shouldShowCredits ? creditsText : currentQuotaText}
        <span
          style={{
            verticalAlign: 'middle',
            display: 'inline-block',
            marginRight: -3,
            marginTop: 1,
          }}
        >
          <Tooltip title={tooltipText} placement="top" interactive>
            <CircledInfo color="inherit" />
          </Tooltip>
        </span>
      </Text>
    </LineStackLayout>
  );
};

const getSendButtonLabelAndIcon = ({
  aiRequest,
  selectedMode,
  isWorking,
  isMobile,
  hasOpenedProject,
  standAloneForm,
}: {|
  aiRequest: AiRequest | null,
  selectedMode?: 'chat' | 'agent',
  isWorking: boolean,
  isMobile: boolean,
  hasOpenedProject: boolean,
  standAloneForm?: boolean,
|}): { label: React.Node, icon: React.Node } => {
  if (aiRequest && !standAloneForm) {
    // We're in a running chat, that is not standalone,
    // hide label.
    return { label: null, icon: <Send fontSize="small" /> };
  }

  return selectedMode === 'agent'
    ? isWorking
      ? { label: <Trans>Building...</Trans>, icon: <Send fontSize="small" /> }
      : isMobile
      ? { label: <Trans>Build</Trans>, icon: <Send fontSize="small" /> }
      : hasOpenedProject && !standAloneForm
      ? {
          label: <Trans>Build this on my game</Trans>,
          icon: <Send fontSize="small" />,
        }
      : {
          label: <Trans>Start building the game</Trans>,
          icon: <Send fontSize="small" />,
        }
    : isWorking
    ? { label: <Trans>Sending...</Trans>, icon: <Send fontSize="small" /> }
    : { label: <Trans>Send</Trans>, icon: <Send fontSize="small" /> };
};

const actionsOnExistingProject = [
  t`Add solid rocks that falls from the sky at a random position around the player every 0.5 seconds`,
  t`Add a score and display it on the screen`,
  t`Create a 3D explosion when the player is hit`,
];

const actionsToCreateAProject = [
  t`Start a simple platformer with a player that can move and jump`,
  t`Begin a top-down adventure with one controllable character.`,
  t`Start a game where a ball can bounce around the screen`,
  t`Start a quizz game with a question and 4 answers`,
  t`Make a minimal 3D shooter`,
  t`Start a simple endless runner game`,
  t`Begin a driving game with a controllable car`,
  t`Create a simple flying game with obstacles to avoid`,
];

const generalQuestions = [
  t`How to add a leaderboard?`,
  t`How to display the health of my player?`,
  t`How to add an explosion when an enemy is destroyed?`,
  t`How to create a main menu for my game?`,
];

const questionsOnExistingProject = [
  t`What would you add to my game?`,
  t`How to make my game more fun?`,
  t`What is a good GDevelop feature I could use in my game?`,
];

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  i18n: I18nType,
  aiRequest: AiRequest | null,

  isSending: boolean,
  onStartNewAiRequest: ({|
    mode: 'chat' | 'agent',
    userRequest: string,
    aiConfigurationPresetId: string,
  |}) => void,
  onSendUserMessage: ({|
    userMessage: string,
    mode: 'chat' | 'agent',
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

  isFetchingSuggestions: boolean,
  savingProjectForMessageId: ?string,
  forkingState: ?{| aiRequestId: string, messageId: string |},
  onRestore: ({|
    message: AiRequestMessage,
    aiRequest: AiRequest,
  |}) => Promise<void>,
|};

export type AiRequestChatInterface = {|
  resetUserInput: (aiRequestId: string | null) => void,
|};

export const AiRequestChat = React.forwardRef<Props, AiRequestChatInterface>(
  (
    {
      aiConfigurationPresetsWithAvailability,
      project,
      fileMetadata,
      aiRequest,
      isSending,
      onStartNewAiRequest,
      onSendUserMessage,
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
      isFetchingSuggestions,
      savingProjectForMessageId,
      forkingState,
      onRestore,
    }: Props,
    ref
  ) => {
    const {
      aiRequestHistory: { handleNavigateHistory, resetNavigation },
    } = React.useContext(AiRequestContext);
    const [selectedMode, setSelectedMode] = React.useState<'chat' | 'agent'>(
      (aiRequest && aiRequest.mode) || (hasOpenedProject ? 'chat' : 'agent')
    );
    const {
      values: { automaticallyUseCreditsForAiRequests },
      setAutomaticallyUseCreditsForAiRequests,
    } = React.useContext(PreferencesContext);
    const { openSubscriptionDialog } = React.useContext(SubscriptionContext);
    const { openCreditsPackageDialog } = React.useContext(
      CreditsPackageStoreContext
    );
    const [
      hasStartedRequestButCannotContinue,
      setHasStartedRequestButCannotContinue,
    ] = React.useState<boolean>(false);
    const [
      hasSwitchedToGDevelopCreditsMidChat,
      setHasSwitchedToGDevelopCreditsMidChat,
    ] = React.useState<boolean>(false);
    const { showConfirmation } = useAlertDialog();
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
              preset.mode === selectedMode
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
        selectedMode,
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

    const scrollToBottom = React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToBottom({ behavior: 'smooth' });
      }
    }, []);

    // Auto-scroll to bottom when content changes, if user is at the bottom.
    React.useEffect(
      () => {
        if (shouldAutoScroll) scrollToBottom();
      },
      [
        scrollToBottom,
        aiRequest,
        editorFunctionCallResults,
        lastSendError,
        shouldAutoScroll,
      ]
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
          selectedMode === 'agent'
            ? hasOpenedProject && !standAloneForm
              ? actionsOnExistingProject
              : actionsToCreateAProject
            : hasOpenedProject && !standAloneForm
            ? [...questionsOnExistingProject, ...generalQuestions]
            : generalQuestions;

        return newChatPlaceholders[
          Math.floor(Math.random() * newChatPlaceholders.length)
        ];
      },
      [selectedMode, hasOpenedProject, standAloneForm]
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

        scrollToBottom();
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

    const priceAndRequestsText = getPriceAndRequestsTextAndTooltip({
      quota,
      price,
      availableCredits,
      selectedMode,
      automaticallyUseCreditsForAiRequests,
    });

    const chosenOrDefaultAiConfigurationPresetId =
      aiConfigurationPresetId ||
      getDefaultAiConfigurationPresetId(
        selectedMode,
        aiConfigurationPresetsWithAvailability
      );
    const hasFunctionsCallsToProcess =
      aiRequest &&
      getFunctionCallsToProcess({
        aiRequest: aiRequest,
        editorFunctionCallResults,
      }).length > 0;
    const hasWorkingFunctionCalls =
      editorFunctionCallResults &&
      editorFunctionCallResults.some(
        functionCallOutput => functionCallOutput.status === 'working'
      );
    const hasUnfinishedResult =
      aiRequest &&
      getFunctionCallOutputsFromEditorFunctionCallResults(
        editorFunctionCallResults
      ).hasUnfinishedResult;
    const hasWorkToProcess =
      hasUnfinishedResult ||
      !!hasWorkingFunctionCalls ||
      !!hasFunctionsCallsToProcess ||
      (!!aiRequest && aiRequest.status === 'working');
    const isPaused = !!aiRequest && !isAutoProcessingFunctionCalls;
    const isWorking = isSending || (hasWorkToProcess && !isPaused);

    const doesNotHaveEnoughCreditsToContinue =
      !!price && availableCredits < price.priceInCredits;
    const cannotContinue =
      !!quota &&
      quota.limitReached &&
      (!automaticallyUseCreditsForAiRequests ||
        doesNotHaveEnoughCreditsToContinue);

    const isForAnotherProject =
      !!requiredGameId &&
      (!project || requiredGameId !== project.getProjectUuid());
    const isForking =
      forkingState && aiRequest && forkingState.aiRequestId === aiRequest.id;
    const shouldDisableButton =
      (hasStartedRequestButCannotContinue &&
        !hasSwitchedToGDevelopCreditsMidChat) ||
      isWorking ||
      isForking ||
      !userRequestTextPerAiRequestId[aiRequestId];
    const shouldReplaceFormWithCreditsOrSubscriptionPrompt =
      // Cannot continue because either no AI credits or has not
      // automatically switched to GDevelop credits.
      hasStartedRequestButCannotContinue &&
      // If the user accepts to switch to GDevelop credits, then we hide it,
      // except if they still cannot continue because they don't have enough GDevelop credits.
      (!hasSwitchedToGDevelopCreditsMidChat ||
        doesNotHaveEnoughCreditsToContinue) &&
      // We only replace the form if no Ai Request exists yet (Editor or StandAlone form),
      // If a request is ongoing, the ChatMessages.js will show the prompt instead.
      !aiRequest;

    const {
      label: sendButtonLabel,
      icon: sendButtonIcon,
    } = getSendButtonLabelAndIcon({
      aiRequest,
      selectedMode,
      isWorking,
      isMobile,
      hasOpenedProject,
      standAloneForm,
    });

    const onSubmitForNewChat = React.useCallback(
      async () => {
        scrollToBottom();

        setHasStartedRequestButCannotContinue(cannotContinue);
        if (cannotContinue) return;

        if (hasOpenedProject && standAloneForm) {
          const response = await showConfirmation({
            title: t`Start a new game?`,
            message: t`This will close your current project. Unsaved changes will be lost.`,
            confirmButtonLabel: t`Continue`,
          });

          if (!response) {
            return;
          }
        }

        onStartNewAiRequest({
          userRequest: userRequestTextPerAiRequestId[''],
          aiConfigurationPresetId: chosenOrDefaultAiConfigurationPresetId,
          mode: selectedMode,
        });
      },
      [
        onStartNewAiRequest,
        userRequestTextPerAiRequestId,
        chosenOrDefaultAiConfigurationPresetId,
        scrollToBottom,
        cannotContinue,
        hasOpenedProject,
        showConfirmation,
        selectedMode,
        standAloneForm,
      ]
    );

    const onSubmitForExistingChat = React.useCallback(
      () => {
        scrollToBottom();

        setHasStartedRequestButCannotContinue(cannotContinue);
        if (cannotContinue) return;

        setAutoProcessFunctionCalls(true);
        onSendUserMessage({
          userMessage: userRequestTextPerAiRequestId[aiRequestId] || '',
          mode: selectedMode,
        });
      },
      [
        aiRequestId,
        onSendUserMessage,
        userRequestTextPerAiRequestId,
        scrollToBottom,
        setAutoProcessFunctionCalls,
        cannotContinue,
        selectedMode,
      ]
    );

    // Calculate feedback banner visibility for sticky behavior
    // (must be before conditional returns to follow React hooks rules)
    const allFunctionCallsToProcess =
      aiRequest && editorFunctionCallResults
        ? getFunctionCallsToProcess({
            aiRequest,
            editorFunctionCallResults,
          })
        : [];
    const isPausedAndHasFunctionCallsToProcess =
      !isAutoProcessingFunctionCalls && allFunctionCallsToProcess.length > 0;
    const shouldDisplayFeedbackBannerNow =
      !hasWorkingFunctionCalls &&
      !isPausedAndHasFunctionCallsToProcess &&
      !isSending &&
      !!aiRequest &&
      aiRequest.status === 'ready' &&
      aiRequest.mode === 'agent';
    const shouldDisplayFeedbackBanner = useStickyVisibility({
      shouldShow: shouldDisplayFeedbackBannerNow,
      showDelayMs: 1000,
      hideDelayMs: 300,
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
                  <Trans>What do you want to make?</Trans>
                </Text>
              </Column>
            )}
            <form onSubmit={onSubmitForNewChat}>
              <ColumnStackLayout
                noMargin
                alignItems="stretch"
                justifyContent="stretch"
              >
                {!shouldReplaceFormWithCreditsOrSubscriptionPrompt ? (
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
                    onSubmit={onSubmitForNewChat}
                    placeholder={
                      isWorking
                        ? t`Thinking about your request...`
                        : newChatPlaceholder
                    }
                    rows={getRowsAndHeight({ standAloneForm }).rows}
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
                            aiRequestMode={selectedMode}
                            disabled={isWorking}
                          />
                          <RaisedButton
                            color="primary"
                            icon={sendButtonIcon}
                            label={sendButtonLabel}
                            style={{ flexShrink: 0 }}
                            disabled={shouldDisableButton}
                            onClick={onSubmitForNewChat}
                          />
                        </LineStackLayout>
                      </Column>
                    }
                  />
                ) : (
                  <div
                    className={classNames({
                      [classes.creditOrSubscriptionPromptContainer]: true,
                    })}
                  >
                    <Paper
                      background="light"
                      style={{
                        ...styles.creditOrSubscriptionPaper,
                        minHeight: getRowsAndHeight({ standAloneForm }).height,
                      }}
                    >
                      <Column expand>
                        <LineStackLayout
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <LineStackLayout alignItems="center" noMargin>
                            <RobotIcon size={24} sad />
                            <Column noMargin>
                              <Text>
                                {!automaticallyUseCreditsForAiRequests ? (
                                  <Trans>
                                    You've ran out of free AI requests.
                                  </Trans>
                                ) : (
                                  <Trans>
                                    You've ran out of GDevelop Credits.
                                  </Trans>
                                )}
                              </Text>
                              <Text>
                                {!automaticallyUseCreditsForAiRequests ? (
                                  <Trans>
                                    Switch to GDevelop credits or keep building
                                    with AI.
                                  </Trans>
                                ) : increaseQuotaOffering === 'subscribe' ? (
                                  <Trans>
                                    Get a subscription to keep building with AI.
                                  </Trans>
                                ) : increaseQuotaOffering === 'upgrade' ? (
                                  <Trans>
                                    Upgrade your subscription to keep building
                                    with AI.
                                  </Trans>
                                ) : (
                                  <Trans>
                                    Get more GDevelop credits to keep building
                                    with AI.
                                  </Trans>
                                )}
                              </Text>
                            </Column>
                          </LineStackLayout>
                          {!automaticallyUseCreditsForAiRequests ? (
                            <FlatButton
                              leftIcon={<Coin fontSize="small" />}
                              primary
                              onClick={() => {
                                setAutomaticallyUseCreditsForAiRequests(true);
                                setHasSwitchedToGDevelopCreditsMidChat(true);
                              }}
                              label={<Trans>Use GDevelop Credits</Trans>}
                              noBackground
                            />
                          ) : increaseQuotaOffering !== 'none' ? (
                            <RaisedButton
                              icon={<GoldCompact fontSize="small" />}
                              primary
                              onClick={() => {
                                openSubscriptionDialog({
                                  analyticsMetadata: {
                                    reason: 'AI requests (subscribe)',
                                    recommendedPlanId: 'gdevelop_gold',
                                    placementId: 'ai-requests',
                                  },
                                });
                              }}
                              label={
                                increaseQuotaOffering === 'subscribe' ? (
                                  <Trans>Get subscription</Trans>
                                ) : (
                                  <Trans>Upgrade subscription</Trans>
                                )
                              }
                            />
                          ) : (
                            <RaisedButton
                              icon={<Coin fontSize="small" />}
                              primary
                              onClick={() => openCreditsPackageDialog()}
                              label={<Trans>Get more credits</Trans>}
                            />
                          )}
                        </LineStackLayout>
                      </Column>
                    </Paper>
                  </div>
                )}
                <Line
                  noMargin
                  expand
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Column noMargin>
                    {!standAloneForm && (
                      <CompactSelectField
                        disabled={isWorking}
                        value={selectedMode}
                        onChange={value => {
                          if (value !== 'chat' && value !== 'agent') {
                            return;
                          }
                          setSelectedMode(value);
                        }}
                        renderOptionIcon={className =>
                          selectedMode === 'chat' ? (
                            <HelpQuestion className={className} />
                          ) : (
                            <Hammer className={className} />
                          )
                        }
                        rounded
                      >
                        <SelectOption key="chat" value="chat" label={t`Ask`} />
                        <SelectOption
                          key="agent"
                          value="agent"
                          label={t`Build`}
                        />
                      </CompactSelectField>
                    )}
                  </Column>
                  <Column noMargin>{errorText || priceAndRequestsText}</Column>
                </Line>
              </ColumnStackLayout>
            </form>
          </ColumnStackLayout>
          {!standAloneForm && (
            <Column justifyContent="center">
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>
                  The AI is experimental and still being improved.{' '}
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
              <Text size="body-small" color="secondary" align="center" noMargin>
                <Trans>
                  Changes and answers may have mistakes: experiment and use it
                  for learning.
                </Trans>
              </Text>
            </Column>
          )}
        </div>
      );
    }

    const userMessagesCount = aiRequest.output.filter(
      message => message.type === 'message' && message.role === 'user'
    ).length;

    const isForAnotherProjectText = isForAnotherProject ? (
      <Text size="body-small" color="secondary" align="center">
        <Trans>
          This request is for another project.{' '}
          <Link
            href="#"
            onClick={() =>
              onStartOrOpenChat({
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
            fileMetadata={fileMetadata}
            onProcessFunctionCalls={onProcessFunctionCalls}
            onUserRequestTextChange={onUserRequestTextChange}
            isPaused={isPaused}
            shouldBeWorkingIfNotPaused={hasWorkToProcess || isWorking}
            isForAnotherProject={isForAnotherProject}
            shouldDisplayFeedbackBanner={shouldDisplayFeedbackBanner}
            onPause={(pause: boolean) => setAutoProcessFunctionCalls(!pause)}
            onScrollToBottom={scrollToBottom}
            hasStartedRequestButCannotContinue={
              hasStartedRequestButCannotContinue
            }
            onSwitchedToGDevelopCredits={() =>
              setHasSwitchedToGDevelopCreditsMidChat(true)
            }
            onStartOrOpenChat={onStartOrOpenChat}
            isFetchingSuggestions={isFetchingSuggestions}
            savingProjectForMessageId={savingProjectForMessageId}
            forkingState={forkingState}
            onRestore={onRestore}
          />
          <Spacer />
          <ColumnStackLayout noMargin>
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
          onSubmit={onSubmitForExistingChat}
          className={classNames({
            // Move the form up when the soft keyboard is open:
            'avoid-soft-keyboard': true,
          })}
        >
          <ColumnStackLayout
            justifyContent="stretch"
            alignItems="stretch"
            noMargin
          >
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
                maxRows={6}
                onSubmit={onSubmitForExistingChat}
                controls={
                  <Column>
                    <LineStackLayout
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <RaisedButton
                        color="primary"
                        disabled={shouldDisableButton}
                        icon={sendButtonIcon}
                        label={sendButtonLabel}
                        onClick={onSubmitForExistingChat}
                      />
                    </LineStackLayout>
                  </Column>
                }
              />
            )}
            <Line
              noMargin
              expand
              alignItems="center"
              justifyContent="space-between"
            >
              <Column noMargin>
                <CompactSelectField
                  disabled={isWorking}
                  value={selectedMode}
                  onChange={value => {
                    if (value !== 'chat' && value !== 'agent') {
                      return;
                    }
                    setSelectedMode(value);
                  }}
                  renderOptionIcon={className =>
                    selectedMode === 'chat' ? (
                      <HelpQuestion className={className} />
                    ) : (
                      <Hammer className={className} />
                    )
                  }
                  rounded
                >
                  <SelectOption key="chat" value="chat" label={t`Ask`} />
                  <SelectOption key="agent" value="agent" label={t`Build`} />
                </CompactSelectField>
              </Column>
              <Column noMargin>
                {isForAnotherProjectText || errorText || priceAndRequestsText}
              </Column>
            </Line>
          </ColumnStackLayout>
        </form>
      </div>
    );
  }
);
