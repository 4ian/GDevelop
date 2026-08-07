// @flow
import * as React from 'react';
import useStableValue from '../../Utils/useStableValue';
import { exceptionallyGuardAgainstDeadObject } from '../../Utils/IsNullPtr';
import type { I18n as I18nType } from '@lingui/core';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import Text from '../../UI/Text';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessage,
  type AiRequestMessageAssistantFunctionCall,
} from '../../Utils/GDevelopServices/Generation';
import RaisedButton from '../../UI/RaisedButton';
import {
  CompactTextAreaFieldWithControls,
  type CompactTextAreaFieldWithControlsInterface,
} from '../../UI/CompactTextAreaFieldWithControls';
import { Column, Line, Spacer } from '../../UI/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import ScrollView, { type ScrollViewInterface } from '../../UI/ScrollView';
import AlertMessage from '../../UI/AlertMessage';
import classes from './AiRequestChat.module.css';
import RobotIcon from '../../ProjectCreation/RobotIcon';
import {
  type Quota,
  type UsagePrice,
} from '../../Utils/GDevelopServices/Usage';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import Link from '../../UI/Link';
import { getHelpLink } from '../../Utils/HelpLink';
import Window from '../../Utils/Window';
import { type EditorFunctionCallResult } from '../../EditorFunctions';
import { type EditorCallbacks } from '../../EditorFunctions';
import {
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from '../AiRequestUtils';
import { ChatMessages } from './ChatMessages';
import Send from '../../UI/CustomSvgIcons/Send';
import classNames from 'classnames';
import {
  type AiConfigurationPresetWithAvailability,
  getDefaultAiConfigurationPresetId,
} from '../AiConfiguration';
import { ReasoningLevelSelector } from './ReasoningLevelSelector';
import { AiRequestContext } from '../AiRequestContext';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useStickyVisibility } from './UseStickyVisibility';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import CircledInfo from '../../UI/CustomSvgIcons/CircledInfo';
import Coin from '../../Credits/Icons/Coin';
import LinearProgress from '../../UI/LinearProgress';
import FlatButton from '../../UI/FlatButton';
import GoldCompact from '../../Profile/Subscription/Icons/GoldCompact';
import { SubscriptionContext } from '../../Profile/Subscription/SubscriptionContext';
import { CreditsPackageStoreContext } from '../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import Paper from '../../UI/Paper';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { type FileMetadata } from '../../ProjectsStorage';
import Stop from '../../UI/CustomSvgIcons/Stop';
import AutoEditButton from './AutoEditButton';
import { EditApprovalRow } from './EditApprovalRow';
import { type EditApprovalRequest } from '../Utils';

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
  quotaContainer: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    gap: 4,
    width: '100%',
  },
  quotaInfoIconSpan: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
  quotaInfoIcon: {
    fontSize: 18,
  },
  quotaProgressBarWrapper: {
    width: 30,
  },
  quotaProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  quotaCoinSpan: {
    verticalAlign: 'middle',
    display: 'inline-block',
    marginRight: 4,
  },
  quotaPlaceholder: {
    height: 29,
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
  automaticallyUseCreditsForAiRequests,
  isRefreshingLimits,
  progressBarColor,
  progressTrackColor,
  onOpenSubscriptionDialog,
  hideLabel,
}: {|
  quota: Quota | null,
  price: UsagePrice | null,
  availableCredits: number,
  automaticallyUseCreditsForAiRequests: boolean,
  isRefreshingLimits?: boolean,
  progressBarColor: string,
  progressTrackColor: string,
  onOpenSubscriptionDialog: () => void,
  hideLabel?: boolean,
|}): React.Node => {
  if (!quota || !price) {
    if (isRefreshingLimits) {
      // No value yet: show only the indeterminate bar and the (i) icon, no label.
      return (
        <div style={styles.quotaContainer}>
          <div style={styles.quotaProgressBarWrapper}>
            <LinearProgress
              variant="indeterminate"
              barColor={progressBarColor}
              trackColor={progressTrackColor}
              style={{ ...styles.quotaProgressBar }}
            />
          </div>
          <span style={styles.quotaInfoIconSpan}>
            <CircledInfo color="inherit" style={styles.quotaInfoIcon} />
          </span>
        </div>
      );
    }
    // Placeholder to avoid layout shift.
    return <div style={styles.quotaPlaceholder} />;
  }

  const aiCreditsAvailable = Math.max(0, quota.max - quota.current);
  const percentage =
    quota.max > 0 ? Math.round((aiCreditsAvailable / quota.max) * 100) : 0;

  const timeForReset = quota.resetsAt ? new Date(quota.resetsAt) : null;
  const now = new Date();

  let dateString = '';
  let timeString = '';
  if (timeForReset && timeForReset.getTime() - now.getTime() > 0) {
    dateString = timeForReset.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    timeString = timeForReset.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  const hasTimeForReset = !!dateString;

  const tooltipSentence = hasTimeForReset ? (
    quota.period === '7days' ? (
      <Trans>
        You still have {percentage}% left on this week's AI usage. It resets on{' '}
        {dateString} at {timeString}.
      </Trans>
    ) : quota.period === '30days' ? (
      <Trans>
        You still have {percentage}% left on this month's AI usage. It resets on{' '}
        {dateString} at {timeString}.
      </Trans>
    ) : (
      <Trans>
        You still have {percentage}% left on today's AI usage. It resets on{' '}
        {dateString} at {timeString}.
      </Trans>
    )
  ) : quota.period === '7days' ? (
    <Trans>You still have {percentage}% left on this week's AI usage.</Trans>
  ) : quota.period === '30days' ? (
    <Trans>You still have {percentage}% left on this month's AI usage.</Trans>
  ) : (
    <Trans>You still have {percentage}% left on today's AI usage.</Trans>
  );

  const tooltipText = (
    <ColumnStackLayout noMargin>
      <Line noMargin>{tooltipSentence}</Line>
      <Line noMargin justifyContent="space-between">
        <Link href="#" color="secondary" onClick={onOpenSubscriptionDialog}>
          <Trans>Need more?</Trans>
        </Link>
        <Link
          href={getHelpLink('/interface/ai/', 'cost-of-ai-requests')}
          color="secondary"
          onClick={() =>
            Window.openExternalURL(
              getHelpLink('/interface/ai/', 'cost-of-ai-requests')
            )
          }
        >
          <Trans>Learn more</Trans>
        </Link>
      </Line>
    </ColumnStackLayout>
  );

  const shouldShowCredits =
    quota.limitReached && automaticallyUseCreditsForAiRequests;

  return (
    <div style={styles.quotaContainer}>
      {!hideLabel && (
        <Text size="body-small" color="secondary" noMargin>
          {shouldShowCredits ? (
            <>
              <span style={styles.quotaCoinSpan}>
                <Coin fontSize="small" />
              </span>
              <Trans>{Math.max(0, availableCredits)} credits available</Trans>
            </>
          ) : (
            <Trans>{percentage}% left</Trans>
          )}
        </Text>
      )}
      {!shouldShowCredits && (
        <div style={styles.quotaProgressBarWrapper}>
          <LinearProgress
            variant={isRefreshingLimits ? 'indeterminate' : 'determinate'}
            value={isRefreshingLimits ? undefined : percentage}
            barColor={progressBarColor}
            trackColor={progressTrackColor}
            style={{ ...styles.quotaProgressBar }}
          />
        </div>
      )}
      <span style={styles.quotaInfoIconSpan}>
        <Tooltip
          title={tooltipText}
          placement="top"
          interactive
          // Show on simple touch (not long press) and leave time to tap the links.
          enterTouchDelay={0}
          leaveTouchDelay={5000}
        >
          <CircledInfo color="inherit" style={styles.quotaInfoIcon} />
        </Tooltip>
      </span>
    </div>
  );
};

const getSendButtonIcon = (): React.Node => <Send fontSize="small" />;

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

const actionsOnExistingProject = [
  t`What would you add to my game?`,
  t`How to make my game more fun?`,
  t`What is a good GDevelop feature I could use in my game?`,
  t`I want to add a leaderboard`,
  t`I want to display the health of my player`,
  t`I want to add an explosion when an enemy is destroyed`,
  t`I want to create a main menu for my game`,
  t`Add solid rocks that falls from the sky at a random position around the player every 0.5 seconds`,
  t`Add a score and display it on the screen`,
  t`Create a 3D explosion when the player is hit`,
];

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  i18n: I18nType,
  aiRequest: AiRequest | null,

  isSending: boolean,
  isSendingUserMessage?: boolean,
  onStartNewAiRequest: ({|
    mode: 'chat' | 'agent' | 'orchestrator',
    userRequest: string,
    aiConfigurationPresetId: string,
  |}) => void,
  onSendUserMessage: ({|
    userMessage: string,
  |}) => Promise<void>,
  // Called whenever the local "Auto edit" toggle changes (and on mount), so the
  // container can gate project-modifying tool calls behind a confirmation when
  // it is off. Auto edit is a frontend-only concern and is not sent to the API.
  onIsAutoEditEnabledChange?: (isAutoEditEnabled: boolean) => void,
  onSendFeedback: (
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string,
    freeFormDetails?: string
  ) => Promise<void>,
  hasOpenedProject: boolean,
  onStop: () => Promise<void>,
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
  isRefreshingLimits?: boolean,

  standAloneForm?: boolean,

  isFetchingSuggestions: boolean,
  savingProjectForMessageId: ?string,
  forkingState: ?{| aiRequestId: string, messageId: string |},
  onRestore: ({|
    message: AiRequestMessage,
    aiRequest: AiRequest,
  |}) => Promise<void>,
  // Inline "Apply this edit?" approval, shown when auto-edit is off and the AI
  // is about to modify the project. Absent in contexts that never gate edits
  // (e.g. the standalone form).
  pendingEditApproval?: EditApprovalRequest | null,
  onResolveEditApproval?: (accepted: boolean) => void,
|};

export type AiRequestChatInterface = {|
  resetUserInput: (aiRequestId: string | null) => void,
|};

export const AiRequestChat: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<AiRequestChatInterface>,
}> = React.forwardRef<Props, AiRequestChatInterface>(
  (
    {
      aiConfigurationPresetsWithAvailability,
      project: nullableProject,
      fileMetadata,
      aiRequest,
      isSending,
      isSendingUserMessage,
      onStartNewAiRequest,
      onSendUserMessage,
      onSendFeedback,
      onStartOrOpenChat,
      quota,
      increaseQuotaOffering,
      lastSendError,
      price,
      availableCredits,
      isRefreshingLimits,
      hasOpenedProject,
      editorFunctionCallResults,
      onProcessFunctionCalls,
      onStop,
      i18n,
      editorCallbacks,
      standAloneForm,
      isFetchingSuggestions,
      savingProjectForMessageId,
      forkingState,
      onRestore,
      onIsAutoEditEnabledChange,
      pendingEditApproval,
      onResolveEditApproval,
    }: Props,
    ref
  ) => {
    const project = exceptionallyGuardAgainstDeadObject(nullableProject);
    const { isMobile } = useResponsiveWindowSize();
    const {
      aiRequestHistory: { handleNavigateHistory, resetNavigation },
      activeSubAgents,
    } = React.useContext(AiRequestContext);
    const {
      values: {
        automaticallyUseCreditsForAiRequests,
        automaticallyApplyAiRequestEditsByProjectId,
      },
      setAutomaticallyUseCreditsForAiRequests,
      setAutomaticallyApplyAiRequestEditsForProjectId,
    } = React.useContext(PreferencesContext);
    const selectedMode = 'orchestrator';
    const aiRequestId: string = aiRequest ? aiRequest.id : '';
    const projectId = project ? project.getProjectUuid() : null;
    // "Auto edit" defaults to on, unless the user turned it off for this project.
    const isAutoEditEnabled =
      !hasOpenedProject ||
      !!standAloneForm ||
      projectId == null ||
      automaticallyApplyAiRequestEditsByProjectId[projectId] !== false;
    // Persist the choice for the project.
    const toggleAutoEdit = React.useCallback(
      () => {
        if (projectId == null) return;
        setAutomaticallyApplyAiRequestEditsForProjectId(
          projectId,
          !isAutoEditEnabled
        );
      },
      [
        projectId,
        isAutoEditEnabled,
        setAutomaticallyApplyAiRequestEditsForProjectId,
      ]
    );
    // Accept the pending edit and turn auto-edit on for the project.
    const acceptEditAndEnableAutoEdit = React.useCallback(
      () => {
        if (projectId != null)
          setAutomaticallyApplyAiRequestEditsForProjectId(projectId, true);
        if (onResolveEditApproval) onResolveEditApproval(true);
      },
      [
        projectId,
        setAutomaticallyApplyAiRequestEditsForProjectId,
        onResolveEditApproval,
      ]
    );
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const progressBarColor =
      gdevelopTheme.palette.type === 'light' ? '#7046EC' : '#9979F1';
    const progressTrackColor =
      gdevelopTheme.palette.type === 'light' ? '#D9D9DE' : '#32323B';
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
    const [isButtonLoading, setIsButtonLoading] = React.useState<boolean>(
      false
    );
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
      [aiConfigurationPresetsWithAvailability, aiConfigurationPresetId]
    );

    const [
      userRequestTextPerAiRequestId,
      setUserRequestTextPerRequestId,
    ] = React.useState<{ [string]: string }>({});

    const scrollViewRef = React.useRef<ScrollViewInterface | null>(null);
    const existingChatTextFieldRef = React.useRef<CompactTextAreaFieldWithControlsInterface | null>(
      null
    );
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

    // Always scroll to the bottom when an edit approval prompt appears
    // ("Apply this change?"), even if the user scrolled up: the request is
    // paused on it, so they must see it to answer.
    React.useEffect(
      () => {
        if (pendingEditApproval) scrollToBottom();
      },
      [pendingEditApproval, scrollToBottom]
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
          !hasOpenedProject || standAloneForm
            ? actionsToCreateAProject
            : actionsOnExistingProject;

        return newChatPlaceholders[
          Math.floor(Math.random() * newChatPlaceholders.length)
        ];
      },
      [hasOpenedProject, standAloneForm]
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

    // Bridge the local "Auto edit" toggle up to the container so it can gate
    // project-modifying tool calls behind a confirmation when it is off. Auto
    // edit is a frontend-only concern (not persisted on the AI request).
    React.useEffect(
      () => {
        if (onIsAutoEditEnabledChange) {
          onIsAutoEditEnabledChange(isAutoEditEnabled);
        }
      },
      [isAutoEditEnabled, onIsAutoEditEnabledChange]
    );

    React.useImperativeHandle(ref, () => ({
      resetUserInput: (aiRequestId: string | null) => {
        const aiRequestIdToReset: string = aiRequestId || '';
        onUserRequestTextChange('', aiRequestIdToReset);

        scrollToBottom();
      },
    }));

    const errorText = lastSendError ? (
      <Text size="body-small" color="error">
        <Trans>
          An error happened when sending your request, please try again.
        </Trans>
      </Text>
    ) : null;

    // Show "Calculating..." for at least 2s so it doesn't flash on fast calls.
    const isRefreshingLimitsStable = useStableValue({
      minimumDuration: 2000,
      value: !!isRefreshingLimits,
    });

    const priceAndRequestsText = getPriceAndRequestsTextAndTooltip({
      quota,
      price,
      availableCredits,
      automaticallyUseCreditsForAiRequests,
      isRefreshingLimits: isRefreshingLimitsStable,
      progressBarColor,
      progressTrackColor,
      hideLabel: isMobile,
      onOpenSubscriptionDialog: () =>
        openSubscriptionDialog({
          analyticsMetadata: {
            reason: 'AI requests (subscribe)',
            recommendedPlanId: 'gdevelop_gold',
            placementId: 'ai-requests',
          },
        }),
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
    const hasActiveSubAgents =
      !!aiRequest &&
      Object.values(activeSubAgents).some(
        subAgent => subAgent.parentAiRequestId === aiRequest.id
      );
    const hasWorkToProcess =
      hasUnfinishedResult ||
      !!hasWorkingFunctionCalls ||
      !!hasFunctionsCallsToProcess ||
      hasActiveSubAgents ||
      // Fetching suggestions also flips the request to "working" on the backend,
      // but that is best-effort background work and must not block the input.
      (!!aiRequest && aiRequest.status === 'working' && !isFetchingSuggestions);
    const isWorking = isSending || hasWorkToProcess;
    const canRequestBeStopped = isWorking && !!aiRequest;

    // When the AI finishes working, the input field gets re-enabled but has
    // lost the focus (it was disabled while working). Focus it again, unless
    // the user moved the focus to another element in the meantime.
    const previousIsWorkingRef = React.useRef<boolean>(isWorking);
    React.useEffect(
      () => {
        if (previousIsWorkingRef.current && !isWorking) {
          const activeElement = document.activeElement;
          if (
            (!activeElement || activeElement === document.body) &&
            existingChatTextFieldRef.current
          ) {
            existingChatTextFieldRef.current.focus();
          }
        }
        previousIsWorkingRef.current = isWorking;
      },
      [isWorking]
    );

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

    const sendButtonIcon = getSendButtonIcon();

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
        standAloneForm,
      ]
    );

    const onSubmitForExistingChat = React.useCallback(
      () => {
        scrollToBottom();

        setHasStartedRequestButCannotContinue(cannotContinue);
        if (cannotContinue) return;

        return onSendUserMessage({
          userMessage: userRequestTextPerAiRequestId[aiRequestId] || '',
        });
      },
      [
        aiRequestId,
        onSendUserMessage,
        userRequestTextPerAiRequestId,
        scrollToBottom,
        cannotContinue,
      ]
    );

    const onClickExistingChatButton = React.useCallback(
      () => {
        setIsButtonLoading(true);
        if (canRequestBeStopped) {
          onStop()
            .catch(err => console.error('Failed to stop AI request:', err))
            .finally(() => setIsButtonLoading(false));
        } else {
          const promise = onSubmitForExistingChat();
          (promise || Promise.resolve())
            .catch(err => console.error('Failed to send message:', err))
            .finally(() => setIsButtonLoading(false));
        }
      },
      [canRequestBeStopped, onStop, onSubmitForExistingChat]
    );

    const onClickNewChatButton = React.useCallback(
      () => {
        setIsButtonLoading(true);
        onSubmitForNewChat()
          .catch(err => console.error('Failed to start chat:', err))
          .finally(() => setIsButtonLoading(false));
      },
      [onSubmitForNewChat]
    );

    // Calculate feedback banner visibility for sticky behavior
    // (must be before conditional returns to follow React hooks rules)
    const shouldDisplayFeedbackBannerNow =
      !!aiRequest &&
      (aiRequest.mode === 'agent' || aiRequest.mode === 'orchestrator') &&
      (aiRequest.status === 'suspended' ||
        (!hasWorkingFunctionCalls &&
          !isSending &&
          aiRequest.status === 'ready'));
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
            <form onSubmit={onClickNewChatButton}>
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
                    onSubmit={onClickNewChatButton}
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
                          justifyContent="flex-end"
                        >
                          <RaisedButton
                            color="primary"
                            icon={sendButtonIcon}
                            style={{ flexShrink: 0 }}
                            disabled={isButtonLoading || shouldDisableButton}
                            onClick={onClickNewChatButton}
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
                <LineStackLayout
                  noMargin
                  expand
                  alignItems="center"
                  justifyContent={
                    // In the standalone form the left-side controls (auto-edit,
                    // reasoning selector) are never rendered, so keep the usage
                    // text on the right whether or not a project is open.
                    standAloneForm ? 'flex-end' : 'space-between'
                  }
                >
                  {!standAloneForm && (
                    <LineStackLayout noMargin alignItems="center" neverShrink>
                      {hasOpenedProject && (
                        <AutoEditButton
                          isAutoEditEnabled={isAutoEditEnabled}
                          onToggle={toggleAutoEdit}
                        />
                      )}
                      <ReasoningLevelSelector
                        chosenOrDefaultAiConfigurationPresetId={
                          chosenOrDefaultAiConfigurationPresetId
                        }
                        setAiConfigurationPresetId={setAiConfigurationPresetId}
                        aiConfigurationPresetsWithAvailability={
                          aiConfigurationPresetsWithAvailability
                        }
                        disabled={isWorking}
                        showSelectedLabel={!hasOpenedProject}
                      />
                    </LineStackLayout>
                  )}
                  <Column noMargin noOverflowParent>
                    {errorText || priceAndRequestsText}
                  </Column>
                </LineStackLayout>
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

    const userMessagesCount = (aiRequest.output || []).filter(
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
            shouldBeWorkingIfNotPaused={hasWorkToProcess || isWorking}
            isForAnotherProject={isForAnotherProject}
            shouldDisplayFeedbackBanner={shouldDisplayFeedbackBanner}
            onScrollToBottom={scrollToBottom}
            hasStartedRequestButCannotContinue={
              hasStartedRequestButCannotContinue
            }
            onSwitchedToGDevelopCredits={() =>
              setHasSwitchedToGDevelopCreditsMidChat(true)
            }
            onStartOrOpenChat={onStartOrOpenChat}
            isSending={isSendingUserMessage}
            isWaitingForEditApproval={!!pendingEditApproval}
            savingProjectForMessageId={savingProjectForMessageId}
            forkingState={forkingState}
            onRestore={onRestore}
          />
          <Spacer />
          <ColumnStackLayout noMargin>
            {pendingEditApproval && onResolveEditApproval ? (
              <EditApprovalRow
                pendingEditApproval={pendingEditApproval}
                onResolveEditApproval={onResolveEditApproval}
                onAcceptAndEnableAutoEdit={acceptEditAndEnableAutoEdit}
              />
            ) : null}
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
            {/* $FlowFixMe[constant-condition] */}
            {!standAloneForm && (
              <CompactTextAreaFieldWithControls
                ref={existingChatTextFieldRef}
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
                  aiRequest.mode === 'agent' ||
                  aiRequest.mode === 'orchestrator'
                    ? isForAnotherProject
                      ? t`You must re-open the project to continue this chat.`
                      : isWorking
                      ? t`Thinking about your request...`
                      : t`Specify something more to the AI to build`
                    : t`Ask a follow up question`
                }
                rows={2}
                maxRows={6}
                onSubmit={onClickExistingChatButton}
                controls={
                  <Column>
                    <LineStackLayout
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <RaisedButton
                        primary={!canRequestBeStopped}
                        disabled={
                          isButtonLoading ||
                          (canRequestBeStopped ? false : shouldDisableButton)
                        }
                        icon={
                          canRequestBeStopped ? (
                            <Stop fontSize="small" />
                          ) : (
                            sendButtonIcon
                          )
                        }
                        label={null}
                        onClick={onClickExistingChatButton}
                      />
                    </LineStackLayout>
                  </Column>
                }
              />
            )}
            <LineStackLayout
              noMargin
              expand
              alignItems="center"
              justifyContent="space-between"
            >
              <LineStackLayout noMargin alignItems="center" neverShrink>
                {hasOpenedProject && (
                  <AutoEditButton
                    isAutoEditEnabled={isAutoEditEnabled}
                    onToggle={toggleAutoEdit}
                  />
                )}
                <ReasoningLevelSelector
                  chosenOrDefaultAiConfigurationPresetId={
                    chosenOrDefaultAiConfigurationPresetId
                  }
                  setAiConfigurationPresetId={setAiConfigurationPresetId}
                  aiConfigurationPresetsWithAvailability={
                    aiConfigurationPresetsWithAvailability
                  }
                  disabled={isWorking}
                  showSelectedLabel={!hasOpenedProject}
                />
              </LineStackLayout>
              <Column noMargin noOverflowParent>
                {isForAnotherProjectText || errorText || priceAndRequestsText}
              </Column>
            </LineStackLayout>
          </ColumnStackLayout>
        </form>
      </div>
    );
  }
);
