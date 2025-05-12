// @flow
import * as React from 'react';
import { type RenderEditorContainerPropsWithRef } from '../BaseEditor';
import { type ObjectWithContext } from '../../../ObjectsList/EnumerateObjects';
import Paper from '../../../UI/Paper';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addUserMessageToAiRequest,
  createAiRequest,
  getAiRequest,
  sendAiRequestFeedback,
  type AiRequest,
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
  onEditorShown: () => void,
  onEditorHidden: () => void,
|};

const noop = () => {};

export const AskAi = React.memo<Props>(
  React.forwardRef<Props, AskAiEditorInterface>(
    ({ isActive, setToolbar, project }: Props, ref) => {
      const [
        selectedAiRequest,
        setSelectedAiRequest,
      ] = React.useState<AiRequest | null>(null);
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
        onEditorShown: noop,
        onEditorHidden: noop,
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
                aiRequestPriceInCredits={aiRequestPriceInCredits}
                availableCredits={availableCredits}
                onSendFeedback={onSendFeedback}
                hasOpenedProject={!!project}
              />
            </div>
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
