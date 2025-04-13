// @flow
import * as React from 'react';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import Paper from '../../../UI/Paper';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addUserMessageToAiRequest,
  addFunctionCallOutputsToAiRequest,
  createAiRequest,
  getAiRequest,
  sendAiRequestFeedback,
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../../../Utils/GDevelopServices/Generation';
import { delay } from '../../../Utils/Delay';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { Toolbar } from './Toolbar';
import { AskAiHistory } from './AskAiHistory';
import { getSimplifiedProjectJson } from '../../../Utils/SimplifiedProjectJson';
import {
  canUpgradeSubscription,
  hasValidSubscriptionPlan,
} from '../../../Utils/GDevelopServices/Usage';
import { retryIfFailed } from '../../../Utils/RetryIfFailed';
import { CreditsPackageStoreContext } from '../../../AssetStore/CreditsPackages/CreditsPackageStoreContext';
import {
  processEditorFunctionCalls,
  type EditorFunctionCallResult,
} from '../../../Commands/EditorFunctionCallRunner';
import { getFunctionCallsToProcess } from './AiRequestUtils';
import { useStableUpToDateRef } from '../../../Utils/UseStableUpToDateCallback';

type Props = {|
  isActive: boolean,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
|};

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: 'min(100%, 800px)',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
    minHeight: 0,
    minWidth: 0,
  },
};

export type AskAiEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
|};

const noop = () => {};

export const AskAi = React.memo<Props>(
  React.forwardRef<Props, AskAiEditorInterface>(
    ({ isActive, setToolbar, project }: Props, ref) => {
      const [
        selectedAiRequest,
        setSelectedAiRequest,
      ] = React.useState<AiRequest | null>(null);
      // Allow long running tasks to check if the selected AI request has changed.
      const upToDateSelectedAiRequest = useStableUpToDateRef(selectedAiRequest);

      const [lastError, setLastError] = React.useState<Error | null>(null);
      const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

      const onStartNewChat = React.useCallback(() => {
        setSelectedAiRequest(null);
      }, []);

      const onOpenHistory = React.useCallback(() => {
        setIsHistoryOpen(true);
      }, []);

      const onCloseHistory = React.useCallback(() => {
        setIsHistoryOpen(false);
      }, []);

      // Rename to "appliedFunctionCallOutputs" or something like that?
      const [
        appliedFunctionCallOutputs,
        setAppliedFunctionCallOutputs,
      ] = React.useState<{
        [aiRequestId: string]: Array<EditorFunctionCallResult>,
      }>({});

      const canStartNewChat = !!selectedAiRequest;
      const updateToolbar = React.useCallback(
        () => {
          if (setToolbar) {
            setToolbar(
              <Toolbar
                onStartNewChat={onStartNewChat}
                canStartNewChat={canStartNewChat}
                onOpenHistory={onOpenHistory}
              />
            );
          }
        },
        [setToolbar, onStartNewChat, canStartNewChat, onOpenHistory]
      );

      React.useEffect(updateToolbar, [updateToolbar]);

      React.useImperativeHandle(ref, () => ({
        getProject: noop,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
      }));

      const aiRequestChatRef = React.useRef<AiRequestChatInterface | null>(
        null
      );

      const [isLaunchingAiRequest, setIsLaunchingAiRequest] = React.useState(
        false
      );

      const { openCreditsPackageDialog } = React.useContext(
        CreditsPackageStoreContext
      );

      const {
        profile,
        getAuthorizationHeader,
        onOpenCreateAccountDialog,
        limits,
        onRefreshLimits,
        subscription,
      } = React.useContext(AuthenticatedUserContext);

      const availableCredits = limits ? limits.credits.userBalance.amount : 0;
      const quota =
        (limits && limits.quotas && limits.quotas['ai-request']) || null;
      const aiRequestPriceInCredits =
        (limits &&
          limits.credits &&
          limits.credits.prices['ai-request'] &&
          limits.credits.prices['ai-request'].priceInCredits) ||
        null;

      // Refresh limits when navigating ot this tab, as we want to be sure
      // we display the proper quota and credits information for the user.
      React.useEffect(
        () => {
          if (isActive) {
            onRefreshLimits();
          }
        },
        [isActive, onRefreshLimits]
      );

      const selectedAiRequestId = selectedAiRequest
        ? selectedAiRequest.id
        : null;

      const sendUserRequest = React.useCallback(
        async (userRequestText: string) => {
          if (!profile) {
            onOpenCreateAccountDialog();
            return;
          }

          let payWithCredits = false;
          if (quota && quota.limitReached && aiRequestPriceInCredits) {
            payWithCredits = true;
            if (availableCredits < aiRequestPriceInCredits) {
              openCreditsPackageDialog({
                missingCredits: aiRequestPriceInCredits - availableCredits,
              });
              return;
            }
          }

          const simplifiedProjectJson = project
            ? JSON.stringify(getSimplifiedProjectJson(project))
            : null;

          try {
            setIsLaunchingAiRequest(true);
            setLastError(null);

            let aiRequest;
            try {
              // Either create a new ai request or continue the existing one with a new message.
              aiRequest = selectedAiRequestId
                ? await addUserMessageToAiRequest(getAuthorizationHeader, {
                    aiRequestId: selectedAiRequestId,
                    userId: profile.id,
                    userRequest: userRequestText,
                    simplifiedProjectJson,
                    payWithCredits,
                  })
                : await createAiRequest(getAuthorizationHeader, {
                    userRequest: userRequestText,
                    userId: profile.id,
                    simplifiedProjectJson,
                    payWithCredits,
                  });
            } finally {
              if (
                upToDateSelectedAiRequest.current &&
                upToDateSelectedAiRequest.current.id !== selectedAiRequestId
              ) {
                // Abort watching the request if it has changed.
                return;
              }
              setIsLaunchingAiRequest(false);
            }
            setIsLaunchingAiRequest(false);
            setSelectedAiRequest(aiRequest);
            if (aiRequestChatRef.current) {
              aiRequestChatRef.current.resetUserInput();
            }

            while (aiRequest.status === 'working') {
              await delay(1000);
              aiRequest = await getAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: aiRequest.id,
              });

              if (
                upToDateSelectedAiRequest.current &&
                upToDateSelectedAiRequest.current.id !== selectedAiRequestId
              ) {
                // Abort watching the request if it has changed.
                // TODO: this could be changed by making this into a different effect.
                // so that watching starts again if we navigate back to a "working"
                // request.
                return;
              }

              setSelectedAiRequest(aiRequest);
            }
          } catch (error) {
            setLastError(error);
          }

          // Refresh the user limits, to ensure quota and credits information
          // is up-to-date after an AI request.
          await delay(500);
          try {
            await retryIfFailed({ times: 2 }, onRefreshLimits);
          } catch (error) {
            // Ignore limits refresh error.
          }
        },
        [
          profile,
          quota,
          aiRequestPriceInCredits,
          project,
          onOpenCreateAccountDialog,
          availableCredits,
          openCreditsPackageDialog,
          selectedAiRequestId,
          getAuthorizationHeader,
          onRefreshLimits,
          upToDateSelectedAiRequest,
        ]
      );

      // TODO: add button to retry in case of error
      const onSendPendingFunctionCallOutputs = React.useCallback(
        async () => {
          if (!profile || !selectedAiRequestId || isLaunchingAiRequest) return;
          try {
            const aiRequestPendingFunctionCallOutputs =
              appliedFunctionCallOutputs[selectedAiRequestId];

            if (!aiRequestPendingFunctionCallOutputs) return;

            try {
              console.info(
                'Sending pending function call outputs: ',
                aiRequestPendingFunctionCallOutputs
              );
              setIsLaunchingAiRequest(true);
              setLastError(null);

              let aiRequest;
              try {
                aiRequest = await retryIfFailed({ times: 2 }, () =>
                  addFunctionCallOutputsToAiRequest(getAuthorizationHeader, {
                    userId: profile.id,
                    aiRequestId: selectedAiRequestId,
                    functionCallOutputs: aiRequestPendingFunctionCallOutputs.map(
                      functionCallOutput => ({
                        type: 'function_call_output',
                        call_id: functionCallOutput.call_id,
                        output: functionCallOutput.output,
                      })
                    ),
                  })
                );
              } finally {
                setIsLaunchingAiRequest(false);
              }
              setIsLaunchingAiRequest(false);
              setAppliedFunctionCallOutputs(appliedFunctionCallOutputs => ({
                ...appliedFunctionCallOutputs,
                [selectedAiRequestId]: null,
              }));
              setSelectedAiRequest(aiRequest);
              if (aiRequestChatRef.current) {
                aiRequestChatRef.current.resetUserInput();
              }

              while (aiRequest.status === 'working') {
                await delay(1000);
                aiRequest = await getAiRequest(getAuthorizationHeader, {
                  userId: profile.id,
                  aiRequestId: aiRequest.id,
                });
                setSelectedAiRequest(aiRequest);
              }
            } catch (error) {
              setLastError(error);
            }
          } catch (error) {
            console.error(
              'Error sending pending function call outputs: ',
              error
            );
            // TODO: do something to not send again repeatly?
          }
        },
        [
          profile,
          selectedAiRequestId,
          appliedFunctionCallOutputs,
          getAuthorizationHeader,
          isLaunchingAiRequest,
        ]
      );

      const onSendFeedback = React.useCallback(
        async (aiRequestId, messageIndex, feedback, reason) => {
          if (!profile) return;
          try {
            await retryIfFailed({ times: 2 }, () =>
              sendAiRequestFeedback(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId,
                messageIndex,
                feedback,
                reason,
              })
            );
          } catch (error) {
            console.error('Error sending feedback: ', error);
          }
        },
        [getAuthorizationHeader, profile]
      );

      // TODO: update to avoid multiple calls in a short time.
      const onProcessFunctionCall = React.useCallback(
        async () => {
          if (!project || !selectedAiRequest) return;

          const functionCalls = getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            appliedFunctionCallOutputs:
              appliedFunctionCallOutputs[selectedAiRequest.id] || [],
          });
          console.info('Processing function calls:', functionCalls);

          try {
            const editorFunctionCallResults = await processEditorFunctionCalls({
              project,
              functionCalls: functionCalls.map(functionCall => ({
                name: functionCall.name,
                arguments: functionCall.arguments,
                call_id: functionCall.call_id,
              })),
              launchEventsGeneration: async options => {
                console.log('Generate events');
              },
            });

            setAppliedFunctionCallOutputs(appliedFunctionCallOutputs => ({
              ...appliedFunctionCallOutputs,
              [selectedAiRequest.id]: editorFunctionCallResults,
            }));
          } catch (error) {
            console.error('Error processing function call: ', error);
          }
        },
        [project, selectedAiRequest, appliedFunctionCallOutputs]
      );

      return (
        <>
          <Paper square background="dark" style={styles.paper}>
            <div style={styles.chatContainer}>
              <AiRequestChat
                ref={aiRequestChatRef}
                aiRequest={selectedAiRequest}
                onSendUserRequest={sendUserRequest}
                isLaunchingAiRequest={isLaunchingAiRequest}
                lastSendError={lastError}
                quota={quota}
                increaseQuotaOffering={
                  !hasValidSubscriptionPlan(subscription)
                    ? 'subscribe'
                    : canUpgradeSubscription(subscription)
                    ? 'upgrade'
                    : 'none'
                }
                appliedFunctionCallOutputs={
                  (selectedAiRequest &&
                    appliedFunctionCallOutputs[selectedAiRequest.id]) ||
                  null
                }
                aiRequestPriceInCredits={aiRequestPriceInCredits}
                availableCredits={availableCredits}
                onSendFeedback={onSendFeedback}
                hasOpenedProject={!!project}
              />
            </div>
            <button onClick={onProcessFunctionCall}>Process</button>
            <button onClick={onSendPendingFunctionCallOutputs}>Continue</button>
          </Paper>
          <AskAiHistory
            open={isHistoryOpen}
            onClose={onCloseHistory}
            onSelectAiRequest={setSelectedAiRequest}
            selectedAiRequestId={selectedAiRequestId}
          />
        </>
      );
    }
  ),
  // Prevent any update to the editor if the editor is not active,
  // and so not visible to the user.
  (prevProps, nextProps) => prevProps.isActive || nextProps.isActive
);

export const renderAskAiContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <AskAi
    ref={props.ref}
    project={props.project}
    setToolbar={props.setToolbar}
    isActive={props.isActive}
  />
);
