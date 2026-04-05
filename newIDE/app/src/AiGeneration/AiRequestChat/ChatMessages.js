// @flow
import * as React from 'react';
import useStableValue from '../../Utils/useStableValue';
import { ChatBubble } from './ChatBubble';
import { Column, Line, Spacer } from '../../UI/Grid';
import { ChatMarkdownText } from './ChatMarkdownText';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { getFunctionCallToFunctionCallOutputMap } from '../AiRequestUtils';
import { FunctionCallRow } from './FunctionCallRow';
import { FunctionCallsGroup } from './FunctionCallsGroup';
import { SuggestionLines } from './SuggestionLines';
import {
  editorFunctions,
  editorFunctionsWithoutProject,
} from '../../EditorFunctions';
import IconButton from '../../UI/IconButton';
import Like from '../../UI/CustomSvgIcons/Like';
import Dislike from '../../UI/CustomSvgIcons/Dislike';
import Copy from '../../UI/CustomSvgIcons/Copy';
import { Trans, t } from '@lingui/macro';
import {
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
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
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import Paper from '../../UI/Paper';
import Floppy from '../../UI/CustomSvgIcons/Floppy';
import SubscriptionPlanTableSummary from '../../Profile/Subscription/SubscriptionDialog/SubscriptionPlanTableSummary';
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
import { exceptionallyGuardAgainstDeadObject } from '../../Utils/IsNullPtr';
import { OrchestratorPlan } from './OrchestratorPlan';
import { type FunctionCallItem, type RenderItem } from './Utils';

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

// Phrases displayed while the AI is thinking/waiting (no active function calls).
// Defined outside the component so the array is stable across renders.
const thinkingPhrases: Array<React.Node> = [
  <Trans>Reading the documentation</Trans>,
  <Trans>Analyzing the project</Trans>,
  <Trans>Reviewing the game structure</Trans>,
  <Trans>Studying the event sheets</Trans>,
  <Trans>Thinking through the approach</Trans>,
  <Trans>Considering the possibilities</Trans>,
  <Trans>Examining the behaviors</Trans>,
  <Trans>Reading through the events</Trans>,
  <Trans>Understanding the context</Trans>,
  <Trans>Evaluating the game logic</Trans>,
  <Trans>Reviewing the scene data</Trans>,
  <Trans>Analyzing the object properties</Trans>,
  <Trans>Thinking through the details</Trans>,
  <Trans>Reviewing the current state</Trans>,
  <Trans>Studying the object behaviors</Trans>,
  <Trans>Considering the best approach</Trans>,
];

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
  isForAnotherProject?: boolean,
  shouldDisplayFeedbackBanner?: boolean,
  onScrollToBottom: () => void,
  hasStartedRequestButCannotContinue: boolean,
  onSwitchedToGDevelopCredits: () => void,

  onStartOrOpenChat: (options: ?{| aiRequestId: string | null |}) => void,
  isFetchingSuggestions: boolean,
  isSending?: boolean,
  savingProjectForMessageId: ?string,
  forkingState: ?{| aiRequestId: string, messageId: string |},
  onRestore: ({|
    message: AiRequestMessage,
    aiRequest: AiRequest,
  |}) => Promise<void>,
|};

type MessageFeedbackButtonsProps = {|
  currentFeedback: 'like' | 'dislike' | void,
  onLike: () => void,
  onDislike: () => void,
  textToCopy?: string,
|};

const MessageFeedbackButtons = ({
  currentFeedback,
  onLike,
  onDislike,
  textToCopy,
}: MessageFeedbackButtonsProps): React.Node => {
  const theme = React.useContext(GDevelopThemeContext);
  return (
    <div className={classes.feedbackButtonsContainer}>
      <Text size="body-small" color="secondary" noMargin>
        <Trans>Did it work?</Trans>
      </Text>
      <LineStackLayout expand noMargin justifyContent="flex-end">
        {textToCopy != null && (
          <IconButton
            size="small"
            tooltip={t`Copy`}
            onClick={() => navigator.clipboard.writeText(textToCopy)}
          >
            <Copy fontSize="small" />
          </IconButton>
        )}
        <IconButton size="small" tooltip={t`This was helpful`} onClick={onLike}>
          <Like
            fontSize="small"
            htmlColor={
              currentFeedback === 'like' ? theme.message.valid : undefined
            }
          />
        </IconButton>
        <IconButton
          size="small"
          tooltip={t`This needs improvement`}
          onClick={onDislike}
        >
          <Dislike
            fontSize="small"
            htmlColor={
              currentFeedback === 'dislike' ? theme.message.warning : undefined
            }
          />
        </IconButton>
      </LineStackLayout>
    </div>
  );
};

export const ChatMessages: React.ComponentType<Props> = React.memo<Props>(
  function ChatMessages({
    aiRequest,
    onSendFeedback,
    editorFunctionCallResults,
    onProcessFunctionCalls,
    editorCallbacks,

    project: nullableProject,
    fileMetadata,
    onUserRequestTextChange,
    shouldBeWorkingIfNotPaused,
    isForAnotherProject,
    shouldDisplayFeedbackBanner,
    onScrollToBottom,
    hasStartedRequestButCannotContinue,
    onSwitchedToGDevelopCredits,
    onStartOrOpenChat,
    isFetchingSuggestions,
    isSending,
    savingProjectForMessageId,
    forkingState,
    onRestore,
  }: Props) {
    const project = exceptionallyGuardAgainstDeadObject(nullableProject);
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
          shouldBeWorkingIfNotPaused
        ) {
          onScrollToBottom();
        }
      },
      [
        shouldShowCreditsOrSubscriptionPrompt,
        isFetchingSuggestions,
        shouldBeWorkingIfNotPaused,
        onScrollToBottom,
      ]
    );

    const isWorking = !!shouldBeWorkingIfNotPaused;
    const [isRestoring, setIsRestoring] = React.useState(false);
    const disabled = isWorking || isForAnotherProject || isRestoring;

    const [messageFeedbacks, setMessageFeedbacks] = React.useState<{
      [string]: 'like' | 'dislike',
    }>({});
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
        const items: Array<RenderItem> = [];
        // Function calls from the current assistant message (rendered inside the
        // same bubble as any following text content in that message).
        let currentFunctionCallItems: Array<FunctionCallItem> = [];
        // Function calls accumulated across previous messages that haven't been
        // flushed yet. They are rendered as a standalone group right before the
        // next text content, keeping consecutive cross-message function calls
        // together while preventing them from being lost when absorbed into a plan.
        let crossMessageFunctionCallItems: Array<FunctionCallItem> = [];
        const forkedAfterNewMessageId = aiRequest.forkedAfterNewMessageId;
        const seenProjectVersionIds: Set<string> = new Set();

        const flushFunctionCallGroup = () => {
          const allItems = [
            ...crossMessageFunctionCallItems,
            ...currentFunctionCallItems,
          ];
          crossMessageFunctionCallItems = [];
          currentFunctionCallItems = [];
          if (allItems.length > 0) {
            items.push({
              type: 'function_call_group',
              items: allItems,
            });
          }
        };

        const output = aiRequest.output || [];
        output.forEach((message, messageIndex) => {
          const isLastMessage = messageIndex === output.length - 1;

          if (message.type === 'message' && message.role === 'user') {
            flushFunctionCallGroup();
            items.push({
              type: 'user_message',
              messageIndex,
              message,
            });
          } else if (
            message.type === 'message' &&
            message.role === 'assistant'
          ) {
            // Move any function calls from previous messages into the cross-message
            // accumulator so they stay grouped together but don't bleed into this
            // message's same-bubble functionCallItems.
            if (currentFunctionCallItems.length > 0) {
              crossMessageFunctionCallItems = [
                ...crossMessageFunctionCallItems,
                ...currentFunctionCallItems,
              ];
              currentFunctionCallItems = [];
            }

            let pendingFunctionCallItems: Array<FunctionCallItem> = [];

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

                // Don't display create_or_update_plan calls — the plan is shown
                // separately via the OrchestratorPlan component.
                if (messageContent.name === 'create_or_update_plan') {
                  return;
                }

                // Don't display function calls with a taskId here — they are
                // shown inside their task row in the OrchestratorPlan component.
                if (messageContent.taskId) {
                  return;
                }

                currentFunctionCallItems.push({
                  key: `messageIndex${messageIndex}-${messageContentIndex}`,
                  messageContent,
                  existingFunctionCallOutput,
                  editorFunctionCallResult,
                });
              } else {
                // Flush cross-message function calls as a standalone group first,
                // so they appear before this text content and don't get attached
                // to the message_content (where they could be silently dropped if
                // the item is absorbed into a plan bubble as followingText).
                if (crossMessageFunctionCallItems.length > 0) {
                  items.push({
                    type: 'function_call_group',
                    items: crossMessageFunctionCallItems,
                  });
                  crossMessageFunctionCallItems = [];
                }

                // Attach same-message function calls to this content (same bubble).
                if (currentFunctionCallItems.length > 0) {
                  pendingFunctionCallItems = [...currentFunctionCallItems];
                  currentFunctionCallItems = [];
                }

                items.push({
                  type: 'message_content',
                  messageIndex,
                  messageContentIndex,
                  message,
                  // $FlowFixMe[incompatible-type] - messageContent types are complex
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
            // Deduplicate: skip if we already showed a save item for this version
            const versionId = message.projectVersionIdAfterMessage;
            const isDuplicate =
              versionId && seenProjectVersionIds.has(versionId);
            if (!isDuplicate) {
              if (versionId) seenProjectVersionIds.add(versionId);
              flushFunctionCallGroup();
              items.push({
                type: 'save',
                messageIndex: messageIndex,
                message: message,
                isRestored: !!(
                  forkedAfterNewMessageId &&
                  message.messageId === forkedAfterNewMessageId
                ),
                isSaving: !!(
                  isSavingProjectForThisMessage &&
                  !message.projectVersionIdAfterMessage
                ),
              });
            }
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
              // $FlowFixMe[incompatible-type] - message can be assistant or function_call_output
              message: message,
              onlyShowExplanationMessage: !isLastMessage,
              functionCallItems: functionCallItemsForSuggestions,
            });
          }

          // Display plan when a function_call_output contains plan data.
          if (
            aiRequest.mode === 'orchestrator' &&
            message.type === 'function_call_output' &&
            message.output
          ) {
            try {
              const output = JSON.parse(message.output);
              if (output && output.plan && Array.isArray(output.plan.tasks)) {
                flushFunctionCallGroup();
                items.push({
                  type: 'orchestrator_plan',
                  plan: output.plan,
                  messageIndex,
                  messageId: message.messageId || '',
                });
              }
            } catch (e) {
              // Ignore parse errors.
            }
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

    // Collect text descriptions of function calls that are actively being worked on,
    // so we can display them in the status bar instead of a generic "Working..." label.
    const workingFunctionCallTexts: Array<React.Node> = React.useMemo(
      () => {
        if (!shouldBeWorkingIfNotPaused) return [];
        const texts: Array<React.Node> = [];
        // Iterate all assistant messages directly so we capture function calls
        // that have a taskId (which are excluded from renderItems but still
        // need to appear in the status bar when running).
        for (const message of aiRequest.output || []) {
          if (message.type !== 'message' || message.role !== 'assistant')
            continue;
          for (const messageContent of message.content) {
            if (messageContent.type !== 'function_call') continue;
            if (messageContent.name === 'create_or_update_plan') continue;
            const existingFunctionCallOutput = functionCallToFunctionCallOutput.get(
              messageContent
            );
            const editorFunctionCallResult =
              (!existingFunctionCallOutput &&
                editorFunctionCallResults &&
                editorFunctionCallResults.find(
                  r => r.call_id === messageContent.call_id
                )) ||
              null;
            if (
              !editorFunctionCallResult ||
              editorFunctionCallResult.status !== 'working'
            )
              continue;
            const editorFunction =
              // $FlowFixMe[incompatible-type]
              editorFunctions[messageContent.name] ||
              // $FlowFixMe[incompatible-type]
              editorFunctionsWithoutProject[messageContent.name] ||
              null;
            if (!editorFunction) continue;
            try {
              const result = editorFunction.renderForEditor({
                project,
                args: JSON.parse(messageContent.arguments),
                editorCallbacks,
                shouldShowDetails: false,
                editorFunctionCallResultOutput: null,
              });
              if (result.text) texts.push(result.text);
            } catch (e) {
              // Ignore rendering errors for the status bar.
            }
          }
        }
        return texts;
      },
      [
        shouldBeWorkingIfNotPaused,
        aiRequest.output || [],
        project,
        editorCallbacks,
        editorFunctionCallResults,
        functionCallToFunctionCallOutput,
      ]
    );

    // Index used to rotate through working function call texts or thinking phrases.
    // Start at a random offset so the first phrase shown is not always the same.
    const [rotationIndex, setRotationIndex] = React.useState(() =>
      Math.floor(Math.random() * thinkingPhrases.length)
    );

    // Keep function-call texts visible for at least 3s after they finish, so
    // fast calls don't flash in and out immediately.
    const hasWorkingFunctionCallTexts = useStableValue({
      minimumDuration: 3000,
      value: workingFunctionCallTexts.length > 0,
    });
    // Remember the last non-empty texts so they're still shown during the
    // grace period after workingFunctionCallTexts becomes empty.
    const lastWorkingFunctionCallTextsRef = React.useRef(
      workingFunctionCallTexts
    );
    if (workingFunctionCallTexts.length > 0) {
      lastWorkingFunctionCallTextsRef.current = workingFunctionCallTexts;
    }

    // Compute here (not inside JSX) so the ref is always up to date regardless
    // of which render branch is active (e.g. isFetchingSuggestions vs working).
    const textsToShow = hasWorkingFunctionCallTexts
      ? lastWorkingFunctionCallTextsRef.current
      : thinkingPhrases;

    // Ref holding current texts so the setInterval callback can pick a random
    // next index without going stale.
    const textsToShowRef = React.useRef<Array<React.Node>>(textsToShow);
    textsToShowRef.current = textsToShow;

    const isActivelyWorking =
      !!shouldBeWorkingIfNotPaused || isFetchingSuggestions;

    React.useEffect(
      () => {
        if (!isActivelyWorking) return;
        const interval = setInterval(() => {
          setRotationIndex(prev => {
            const texts = textsToShowRef.current;
            const len = texts.length;
            if (len <= 1) return prev;
            // Random skip of 1..len-1 to guarantee a different item each rotation.
            const skip = 1 + Math.floor(Math.random() * (len - 1));
            return (prev + skip) % len;
          });
        }, 8000);
        return () => clearInterval(interval);
      },
      [isActivelyWorking]
    );

    const filteredRenderItems = React.useMemo(
      () => {
        let items = renderItems;

        if (forkingState && forkingState.aiRequestId === aiRequest.id) {
          const forkSaveIndex = items.findIndex(
            item =>
              item.type === 'save' &&
              item.message &&
              item.message.messageId === forkingState.messageId
          );

          if (forkSaveIndex !== -1) {
            // Only show items up to and including the save item.
            // The save item itself will show "Restoring..." state.
            items = items.slice(0, forkSaveIndex + 1);
          }
        }

        // Deduplicate consecutive plan items: if multiple plans appear with no
        // user or assistant message between them, only show the latest one
        // (it's just a status update to the same plan).
        const planIndicesToRemove: Set<number> = new Set();
        let lastPlanIndex = -1;
        items.forEach((item, index) => {
          if (item.type === 'orchestrator_plan') {
            if (lastPlanIndex !== -1) {
              planIndicesToRemove.add(lastPlanIndex);
            }
            lastPlanIndex = index;
          } else if (
            item.type === 'user_message' ||
            item.type === 'message_content'
          ) {
            // A real message resets the sequence — plans after it are independent.
            lastPlanIndex = -1;
          }
        });
        if (planIndicesToRemove.size > 0) {
          items = items.filter((_, index) => !planIndicesToRemove.has(index));
        }

        return items;
      },
      [renderItems, forkingState, aiRequest.id]
    );

    // Map each plan task id to the function call items linked to it (via taskId),
    // so the OrchestratorPlan component can show them inside the task row.
    const functionCallItemsByTaskId: Map<
      string,
      Array<FunctionCallItem>
    > = React.useMemo(
      () => {
        const map: Map<string, Array<FunctionCallItem>> = new Map();
        (aiRequest.output || []).forEach(message => {
          if (message.type === 'message' && message.role === 'assistant') {
            message.content.forEach(messageContent => {
              if (
                messageContent.type === 'function_call' &&
                messageContent.taskId
              ) {
                const taskId = messageContent.taskId;
                const existingFunctionCallOutput = functionCallToFunctionCallOutput.get(
                  messageContent
                );
                const editorFunctionCallResult =
                  (!existingFunctionCallOutput &&
                    editorFunctionCallResults &&
                    editorFunctionCallResults.find(
                      r => r.call_id === messageContent.call_id
                    )) ||
                  null;
                if (!map.has(taskId)) map.set(taskId, []);
                const taskItems = map.get(taskId);
                if (taskItems) {
                  taskItems.push({
                    key: `task-${taskId}-${messageContent.call_id}`,
                    messageContent,
                    existingFunctionCallOutput,
                    editorFunctionCallResult,
                  });
                }
              }
            });
          }
        });
        return map;
      },
      [aiRequest, editorFunctionCallResults, functionCallToFunctionCallOutput]
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

    // Pre-compute which message_content items are absorbed into the preceding
    // plan bubble so they don't render as a separate ChatBubble.
    const absorbedMessageContentIndices: Set<number> = React.useMemo(
      () => {
        const set: Set<number> = new Set();
        filteredRenderItems.forEach((item, index) => {
          if (item.type === 'orchestrator_plan') {
            const next = filteredRenderItems[index + 1];
            if (
              next &&
              next.type === 'message_content' &&
              next.messageContent.type === 'output_text' &&
              next.messageContent.text &&
              next.messageContent.text.trim()
            ) {
              set.add(index + 1);
            }
          }
        });
        return set;
      },
      [filteredRenderItems]
    );

    return (
      <>
        {filteredRenderItems
          .flatMap((item, itemIndex) => {
            if (item.type === 'orchestrator_plan') {
              const nextItem = filteredRenderItems[itemIndex + 1];
              const followingText =
                nextItem &&
                nextItem.type === 'message_content' &&
                nextItem.messageContent.type === 'output_text' &&
                nextItem.messageContent.text
                  ? nextItem.messageContent.text.trim()
                  : undefined;
              const absorbedNextItem =
                nextItem &&
                nextItem.type === 'message_content' &&
                absorbedMessageContentIndices.has(itemIndex + 1)
                  ? nextItem
                  : null;
              const isLastVisiblePlanItem =
                itemIndex === filteredRenderItems.length - 1 ||
                (absorbedNextItem !== null && absorbedNextItem.isLastMessage);
              const feedbackMessageIndex = absorbedNextItem
                ? // $FlowFixMe[incompatible-type]
                  absorbedNextItem.messageIndex
                : item.messageIndex;
              const feedbackMessageContentIndex = absorbedNextItem
                ? // $FlowFixMe[incompatible-type]
                  absorbedNextItem.messageContentIndex
                : 0;
              const planFeedbackKey = `${feedbackMessageIndex}-${feedbackMessageContentIndex}`;
              const planFeedbackButtons =
                isLastVisiblePlanItem && shouldDisplayFeedbackBanner ? (
                  <MessageFeedbackButtons
                    currentFeedback={messageFeedbacks[planFeedbackKey]}
                    onLike={() => {
                      setMessageFeedbacks({
                        ...messageFeedbacks,
                        [planFeedbackKey]: 'like',
                      });
                      // $FlowFixMe[incompatible-type]
                      onSendFeedback(
                        aiRequest.id,
                        feedbackMessageIndex,
                        'like'
                      );
                    }}
                    onDislike={() => {
                      setMessageFeedbacks({
                        ...messageFeedbacks,
                        [planFeedbackKey]: 'dislike',
                      });
                      // $FlowFixMe[incompatible-type]
                      setDislikeFeedbackDialogOpenedFor({
                        aiRequestId: aiRequest.id,
                        messageIndex: feedbackMessageIndex,
                      });
                    }}
                  />
                ) : (
                  undefined
                );
              return [
                <Line
                  key={`orchestrator-plan-${item.messageIndex}`}
                  justifyContent="flex-start"
                >
                  <OrchestratorPlan
                    tasks={item.plan.tasks}
                    messageId={item.messageId}
                    followingText={followingText}
                    feedbackButtons={planFeedbackButtons}
                    functionCallItemsByTaskId={functionCallItemsByTaskId}
                    project={project}
                    onProcessFunctionCalls={onProcessFunctionCalls}
                    editorCallbacks={editorCallbacks}
                  />
                </Line>,
              ];
            }

            if (absorbedMessageContentIndices.has(itemIndex)) {
              return ([]: Array<React.Node>);
            }

            if (item.type === 'user_message') {
              const { messageIndex, message } = item;

              const currentVersionOpened = fileMetadata
                ? fileMetadata.version
                : null;
              // $FlowFixMe[incompatible-use]
              const hasVersionToRestore = !!message.projectVersionIdBeforeMessage;

              const previousMessage =
                // $FlowFixMe[unsafe-arithmetic]
                // $FlowFixMe[invalid-compare]
                messageIndex > 0 ? (aiRequest.output || [])[messageIndex - 1] : null;
              const previousMessageHasSameVersionId =
                previousMessage &&
                hasVersionToRestore &&
                ((previousMessage.type === 'message' &&
                  previousMessage.role === 'user' &&
                  previousMessage.projectVersionIdBeforeMessage ===
                    // $FlowFixMe[incompatible-use]
                    message.projectVersionIdBeforeMessage) ||
                  (previousMessage.type === 'function_call_output' &&
                    previousMessage.projectVersionIdAfterMessage ===
                      // $FlowFixMe[incompatible-use]
                      message.projectVersionIdBeforeMessage) ||
                  (previousMessage.type === 'message' &&
                    previousMessage.role === 'assistant' &&
                    previousMessage.projectVersionIdAfterMessage ===
                      // $FlowFixMe[incompatible-use]
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
                  // $FlowFixMe[incompatible-use]
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
                                // $FlowFixMe[incompatible-type]
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
                      // $FlowFixMe[incompatible-use]
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
                <Line
                  key={`group-line-${itemIndex}`}
                  justifyContent="flex-start"
                >
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
              // $FlowFixMe[incompatible-type]
              const key = `messageIndex${messageIndex}-${messageContentIndex}`;

              // $FlowFixMe[incompatible-use]
              if (messageContent.type === 'output_text') {
                // $FlowFixMe[incompatible-type]
                const feedbackKey = `${messageIndex}-${messageContentIndex}`;
                const currentFeedback = messageFeedbacks[feedbackKey];

                // $FlowFixMe[incompatible-use]
                const trimmedText = messageContent.text.trim();
                if (!trimmedText) {
                  return null;
                }

                return [
                  <Line key={key} justifyContent="flex-start">
                    <ChatBubble
                      role="assistant"
                      feedbackButtons={
                        isLastMessage && shouldDisplayFeedbackBanner ? (
                          <MessageFeedbackButtons
                            currentFeedback={currentFeedback}
                            // $FlowFixMe[incompatible-use]
                            textToCopy={messageContent.text || undefined}
                            onLike={() => {
                              setMessageFeedbacks({
                                ...messageFeedbacks,
                                [feedbackKey]: 'like',
                              });
                              // $FlowFixMe[incompatible-type]
                              onSendFeedback(
                                aiRequest.id,
                                messageIndex,
                                'like'
                              );
                            }}
                            onDislike={() => {
                              setMessageFeedbacks({
                                ...messageFeedbacks,
                                [feedbackKey]: 'dislike',
                              });
                              // $FlowFixMe[incompatible-type]
                              setDislikeFeedbackDialogOpenedFor({
                                aiRequestId: aiRequest.id,
                                messageIndex,
                              });
                            }}
                          />
                        ) : (
                          undefined
                        )
                      }
                    >
                      <Column noMargin>
                        {functionCallItems && functionCallItems.length > 0 && (
                          <FunctionCallsGroup>
                            {functionCallItems.map(
                              // $FlowFixMe[missing-local-annot]
                              ({
                                key: functionCallKey,
                                messageContent: functionCallMessageContent,
                                existingFunctionCallOutput,
                                editorFunctionCallResult,
                              }) => (
                                <FunctionCallRow
                                  project={project}
                                  key={functionCallKey}
                                  onProcessFunctionCalls={
                                    onProcessFunctionCalls
                                  }
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
                ];
              }

              if (messageContent.type === 'reasoning') {
                return [
                  <Line key={key} justifyContent="flex-start">
                    <ChatBubble role="assistant">
                      {/* $FlowFixMe[incompatible-use] */}
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
                // $FlowFixMe[incompatible-use]
                forkingState.messageId === message.messageId;
              const currentVersionOpened = fileMetadata
                ? fileMetadata.version
                : null;
              const messageVersionIdToRestore =
                // $FlowFixMe[incompatible-use]
                message.projectVersionIdAfterMessage;
              const hasVersionToRestore =
                (!!messageVersionIdToRestore &&
                  !!currentVersionOpened &&
                  messageVersionIdToRestore !== currentVersionOpened) ||
                hasUnsavedChanges;

              return [
                // $FlowFixMe[incompatible-type]
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
                          {hasVersionToRestore && (
                            <>
                              {' '}
                              <Link
                                onClick={() => {
                                  onRestoreVersion({
                                    // $FlowFixMe[incompatible-type]
                                    message,
                                    aiRequest,
                                  });
                                }}
                                href="#"
                                color="secondary"
                                disabled={disabled}
                              >
                                <Trans>Restore version</Trans>
                              </Link>
                            </>
                          )}
                        </Text>
                      </LineStackLayout>
                    )}
                    {isRestored && !isForking && forkedFromAiRequestId && (
                      <LineStackLayout
                        noMargin
                        alignItems="center"
                        justifyContent="flex-start"
                        expand
                      >
                        <Spacer />
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
                <SuggestionLines
                  key={`suggestions-${messageIndex}`}
                  aiRequest={aiRequest}
                  onUserRequestTextChange={onUserRequestTextChange}
                  disabled={disabled}
                  // $FlowFixMe[incompatible-type]
                  message={message}
                  messageIndex={messageIndex}
                  onlyShowExplanationMessage={onlyShowExplanationMessage}
                  functionCallItems={functionCallItems}
                  project={project}
                  onProcessFunctionCalls={onProcessFunctionCalls}
                  editorCallbacks={editorCallbacks}
                />,
              ];
            }

            // $FlowFixMe[missing-empty-array-annot]
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
        ) : aiRequest.status === 'suspended' && !shouldBeWorkingIfNotPaused ? (
          <Line justifyContent="flex-start">
            <div className={classes.suspendedIndicator}>
              <div className={classes.suspendedDot} />
              <Spacer />
              <Text
                noMargin
                displayInlineAsSpan
                size="body-small"
                color="secondary"
              >
                <Trans>Stopped. Ready when you are.</Trans>
              </Text>
            </div>
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
                <span className={classes.cursorWrapper}>
                  <span>
                    <Trans>Thinking...</Trans>
                  </span>
                  <span className={classes.cursor} />
                </span>
              </Text>
            </div>
          </Line>
        ) : isSending ? (
          <Line justifyContent="flex-start">
            <div className={classes.thinkingText}>
              <Text
                noMargin
                displayInlineAsSpan
                size="body-small"
                color="inherit"
              >
                <span className={classes.cursorWrapper}>
                  <span className={classes.typeReveal}>
                    <Trans>Sending...</Trans>
                  </span>
                  <span className={classes.cursor} />
                </span>
              </Text>
            </div>
          </Line>
        ) : shouldBeWorkingIfNotPaused ? (
          <Line justifyContent="flex-start">
            <div className={classes.thinkingText}>
              <Text
                noMargin
                displayInlineAsSpan
                size="body-small"
                color="inherit"
              >
                <span className={classes.cursorWrapper}>
                  {(() => {
                    const singleItem = textsToShow.length === 1;
                    return (
                      <>
                        <span
                          key={singleItem ? 'stable' : rotationIndex}
                          className={classes.typeReveal}
                        >
                          {textsToShow[rotationIndex % textsToShow.length]}
                          {'...'}
                        </span>
                        {!singleItem && (
                          <span
                            key={`c${rotationIndex}`}
                            className={classes.cursor}
                          />
                        )}
                      </>
                    );
                  })()}
                </span>
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
                        Upgrade your Premium subscription to have more AI
                        requests and GDevelop coins to unlock the engine's extra
                        benefits.
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
                      You still have {availableCredits} credits you can use for
                      AI requests.
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

        {/* $FlowFixMe[constant-condition] */}
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
  }
);
