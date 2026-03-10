// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
import {
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from '../MainFrame/EditorContainers/BaseEditor';
import { type ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import Paper from '../UI/Paper';
import { AiRequestChat, type AiRequestChatInterface } from './AiRequestChat';
import {
  addMessageToAiRequest,
  createAiRequest,
  sendAiRequestFeedback,
  forkAiRequest,
  suspendAiRequest,
  getAiRequest,
  type AiRequest,
  type AiRequestMessage,
} from '../Utils/GDevelopServices/Generation';
import {
  getCloudProjectFileMetadataIdentifier,
  type ExpandedCloudProjectVersion,
} from '../Utils/GDevelopServices/Project';
import { delay } from '../Utils/Delay';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { Toolbar } from './Toolbar';
import { AskAiHistory } from './AskAiHistory';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import {
  canUpgradeSubscription,
  hasValidSubscriptionPlan,
} from '../Utils/GDevelopServices/Usage';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { type EditorCallbacks } from '../EditorFunctions';
import {
  aiRequestHasWorkInProgress,
  getFunctionCallNameByCallId,
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { type EditorFunctionCallResult } from '../EditorFunctions/EditorFunctionCallRunner';
import { useStableUpToDateRef } from '../Utils/UseStableUpToDateCallback';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import {
  type FileMetadata,
  type StorageProvider,
  type SaveAsLocation,
} from '../ProjectsStorage';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import {
  sendAiRequestMessageSent,
  sendAiRequestStarted,
} from '../Utils/Analytics/EventSender';
import { listAllExamples } from '../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../ProjectsStorage/UrlStorageProvider';
import { prepareAiUserContent } from './PrepareAiUserContent';
import { AiRequestContext } from './AiRequestContext';
import { getAiConfigurationPresetsWithAvailability } from './AiConfiguration';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../EmbeddedGame/EmbeddedGameFrame';
import { type CreateProjectResult } from '../Utils/UseCreateProject';
import {
  useAiRequestState,
  type OpenAskAiOptions,
  type NewAiRequestOptions,
  useProcessFunctionCalls,
  useRefreshLimits,
  AI_AGENT_TOOLS_VERSION,
  AI_CHAT_TOOLS_VERSION,
  AI_ORCHESTRATOR_TOOLS_VERSION,
} from './Utils';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { t } from '@lingui/macro';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { SubscriptionContext } from '../Profile/Subscription/SubscriptionContext';

const gd: libGDevelop = global.gd;

const styles = {
  paper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 0,
    overflowY: 'scroll',
    overflowX: 'hidden',
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

type Props = {|
  isActive: boolean,
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
  storageProvider: ?StorageProvider,
  setToolbar: (?React.Node) => void,
  i18n: I18nType,
  onCreateProjectFromExample: (
    exampleProjectSetup: ExampleProjectSetup
  ) => Promise<CreateProjectResult>,
  onCreateEmptyProject: (
    newProjectSetup: NewProjectSetup
  ) => Promise<CreateProjectResult>,
  onOpenLayout: (
    sceneName: string,
    options: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onOpenAskAi: ({|
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
  gameEditorMode: 'embedded-game' | 'instances-editor',
  continueProcessingFunctionCallsOnMount?: boolean,
  onOpenAskAi: (?OpenAskAiOptions) => void,
  onCheckoutVersion: (
    version: ExpandedCloudProjectVersion,
    options?: {| dontSaveCheckedOutVersionStatus?: boolean |}
  ) => Promise<boolean>,
  getOrLoadProjectVersion: (
    versionId: string
  ) => Promise<?ExpandedCloudProjectVersion>,
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  onSaveProjectAsWithStorageProvider: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
|};

export type AskAiEditorInterface = {|
  getProject: () => void,
  updateToolbar: () => void,
  forceUpdateEditor: () => void,
  onEventsBasedObjectChildrenEdited: () => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext
  ) => void,
  onSceneObjectsDeleted: (scene: gdLayout) => void,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  startOrOpenChat: (
    ?{|
      aiRequestId: string | null,
    |}
  ) => void,
  notifyChangesToInGameEditor: (hotReloadSteps: HotReloadSteps) => void,
  switchInGameEditorIfNoHotReloadIsNeeded: () => void,
  /**
   * Call before closing this tab to reposition it to a different pane.
   * Prevents the unmount cleanup from suspending the active AI request,
   * since the tab is being moved rather than intentionally closed.
   */
  prepareToReposition: () => void,
|};

const noop = () => {};

export const AskAiEditor: React.ComponentType<Props> = React.memo<Props>(
  React.forwardRef<Props, AskAiEditorInterface>(
    (
      {
        isActive,
        setToolbar,
        project,
        resourceManagementProps,
        fileMetadata,
        storageProvider,
        i18n,
        onCreateProjectFromExample,
        onCreateEmptyProject,
        onOpenLayout,
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        onWillInstallExtension,
        onExtensionInstalled,
        onOpenAskAi,
        gameEditorMode,
        continueProcessingFunctionCallsOnMount,
        onCheckoutVersion,
        getOrLoadProjectVersion,
        onSave,
        onSaveProjectAsWithStorageProvider,
      }: Props,
      ref
    ) => {
      const onCreateProject = React.useCallback(
        async ({
          name,
          exampleSlug,
        }: {|
          name: string,
          exampleSlug: string | null,
        |}) => {
          const newProjectSetup: NewProjectSetup = {
            projectName: name,
            storageProvider: UrlStorageProvider,
            saveAsLocation: null,
            creationSource: 'ai-agent-request',
          };

          if (exampleSlug) {
            const { exampleShortHeaders } = await listAllExamples();
            const exampleShortHeader = exampleShortHeaders.find(
              header => header.slug === exampleSlug
            );
            if (exampleShortHeader) {
              const { createdProject } = await onCreateProjectFromExample({
                exampleShortHeader,
                newProjectSetup,
                i18n,
              });
              return { exampleSlug, createdProject };
            }

            // The example was not found - still create an empty project.
          }

          const { createdProject } = await onCreateEmptyProject(
            newProjectSetup
          );

          return { exampleSlug: null, createdProject };
        },
        [onCreateProjectFromExample, onCreateEmptyProject, i18n]
      );

      const editorCallbacks: EditorCallbacks = React.useMemo(
        () => ({
          onOpenLayout,
          onCreateProject,
        }),
        [onOpenLayout, onCreateProject]
      );

      const { triggerUnsavedChanges } = React.useContext(UnsavedChangesContext);
      const storageProviderName = storageProvider
        ? storageProvider.internalName
        : null;
      const {
        aiRequestStorage: {
          fetchAiRequests,
          aiRequests,
          forkingState,
          setForkingState,
        },
      } = React.useContext(AiRequestContext);
      const {
        selectedAiRequest,
        selectedAiRequestId,
        setAiState,
        isFetchingSuggestions,
        savingProjectForMessageId,
      } = useAiRequestState({
        project,
        fileMetadata,
        storageProviderName,
        onSave,
        onSaveProjectAsWithStorageProvider,
      });
      const upToDateSelectedAiRequestId = useStableUpToDateRef(
        selectedAiRequestId
      );

      const [
        newAiRequestOptions,
        startNewAiRequest,
      ] = React.useState<NewAiRequestOptions | null>(null);

      const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

      const { openSubscriptionDialog } = React.useContext(SubscriptionContext);

      // Clear forking state when viewing a different request
      React.useEffect(
        () => {
          if (
            forkingState &&
            selectedAiRequest &&
            forkingState.aiRequestId !== selectedAiRequest.id
          ) {
            setForkingState(null);
          }
        },
        [forkingState, selectedAiRequest, setForkingState]
      );

      const { showAlert, showConfirmation } = useAlertDialog();

      const [
        isReadyToProcessFunctionCalls,
        setIsReadyToProcessFunctionCalls,
      ] = React.useState<boolean>(!!continueProcessingFunctionCallsOnMount);

      React.useEffect(
        () => {
          if (isActive && Object.keys(aiRequests).length === 0) {
            fetchAiRequests();
          }
        },
        // Fetch when the editor becomes active, but only if there were no
        // requests done (as we provide a way to refresh in the history).
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isActive]
      );

      const canStartNewChat = !!selectedAiRequestId;

      const onOpenHistory = React.useCallback(() => {
        setIsHistoryOpen(true);
      }, []);

      const onCloseHistory = React.useCallback(() => {
        setIsHistoryOpen(false);
      }, []);

      const {
        aiRequestStorage,
        editorFunctionCallResultsStorage,
        getAiSettings,
      } = React.useContext(AiRequestContext);
      const {
        getEditorFunctionCallResults,
        addEditorFunctionCallResults,
        clearEditorFunctionCallResults,
      } = editorFunctionCallResultsStorage;
      const {
        updateAiRequest,
        refreshAiRequest,
        isSendingAiRequest,
        getLastSendError,
        setSendingAiRequest,
        setLastSendError,
      } = aiRequestStorage;

      const aiRequestChatRef = React.useRef<AiRequestChatInterface | null>(
        null
      );

      const {
        values: { automaticallyUseCreditsForAiRequests },
      } = React.useContext(PreferencesContext);

      const authenticatedUser = React.useContext(AuthenticatedUserContext);
      const {
        profile,
        getAuthorizationHeader,
        onOpenCreateAccountDialog,
        limits,
        onRefreshLimits,
        subscription,
      } = authenticatedUser;

      const { isRefreshingLimits, refreshLimits } = useRefreshLimits(
        onRefreshLimits
      );
      const [isSendingUserMessage, setIsSendingUserMessage] = React.useState(
        false
      );

      const availableCredits = limits ? limits.credits.userBalance.amount : 0;
      const quota =
        (limits && limits.quotas && limits.quotas['consumed-ai-credits']) ||
        null;
      const aiRequestPrice =
        (limits && limits.credits && limits.credits.prices['ai-request']) ||
        null;
      const aiRequestPriceInCredits = aiRequestPrice
        ? aiRequestPrice.priceInCredits
        : null;

      // Refresh limits when navigating ot this tab, as we want to be sure
      // we display the proper quota and credits information for the user.
      React.useEffect(
        () => {
          if (isActive) {
            refreshLimits();
          }
        },
        [isActive, refreshLimits]
      );

      // Trigger the start of the new AI request if the user has requested it
      // (or if triggered automatically by setting `newAiRequestOptions`, for example
      // after waiting for the project to be created for an AI agent request).
      React.useEffect(
        () => {
          (async () => {
            if (!newAiRequestOptions) return;
            console.info('Starting a new AI request...');

            if (!profile) {
              onOpenCreateAccountDialog();
              startNewAiRequest(null);
              return;
            }

            // Read the options and reset them (to avoid launching the same request twice).
            const {
              mode,
              userRequest,
              aiConfigurationPresetId,
            } = newAiRequestOptions;
            startNewAiRequest(null);

            // Ensure the user has enough credits to pay for the request, or ask them
            // to buy some more.
            let payWithCredits = false;
            if (quota && quota.limitReached && aiRequestPriceInCredits) {
              payWithCredits = true;
              const doesNotHaveEnoughCreditsToContinue =
                availableCredits < aiRequestPriceInCredits;
              const cannotContinue =
                !automaticallyUseCreditsForAiRequests ||
                doesNotHaveEnoughCreditsToContinue;

              if (cannotContinue) {
                return;
              }
            }

            // Request is now ready to be started.
            try {
              const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
              const simplifiedProjectJson = project
                ? JSON.stringify(
                    simplifiedProjectBuilder.getSimplifiedProject(project, {})
                  )
                : null;
              const projectSpecificExtensionsSummaryJson = project
                ? JSON.stringify(
                    simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(
                      project
                    )
                  )
                : null;

              setSendingAiRequest(null, true);
              setIsSendingUserMessage(true);

              const preparedAiUserContent = await prepareAiUserContent({
                getAuthorizationHeader,
                userId: profile.id,
                simplifiedProjectJson,
                projectSpecificExtensionsSummaryJson,
                eventsJson: null,
              });

              const aiRequest = await createAiRequest(getAuthorizationHeader, {
                userRequest: userRequest,
                userId: profile.id,
                gameProjectJsonUserRelativeKey:
                  preparedAiUserContent.gameProjectJsonUserRelativeKey,
                gameProjectJson: preparedAiUserContent.gameProjectJson,
                projectSpecificExtensionsSummaryJsonUserRelativeKey:
                  preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
                projectSpecificExtensionsSummaryJson:
                  preparedAiUserContent.projectSpecificExtensionsSummaryJson,
                payWithCredits,
                gameId: project ? project.getProjectUuid() : null,
                // $FlowFixMe[incompatible-type]
                fileMetadata,
                storageProviderName,
                mode,
                toolsVersion:
                  mode === 'agent'
                    ? AI_AGENT_TOOLS_VERSION
                    : mode === 'orchestrator'
                    ? AI_ORCHESTRATOR_TOOLS_VERSION
                    : AI_CHAT_TOOLS_VERSION,
                aiConfiguration: {
                  presetId: aiConfigurationPresetId,
                },
              });

              console.info('Successfully created a new AI request:', aiRequest);
              setSendingAiRequest(null, false);
              setIsSendingUserMessage(false);
              updateAiRequest(aiRequest.id, () => aiRequest);

              // Select the new AI request just created - unless the user switched to another one
              // in the meantime.
              if (!upToDateSelectedAiRequestId.current) {
                setAiState({
                  aiRequestId: aiRequest.id,
                });
              }

              const aiRequestChatRefCurrent = aiRequestChatRef.current;
              if (aiRequestChatRefCurrent) {
                aiRequestChatRefCurrent.resetUserInput('');
                aiRequestChatRefCurrent.resetUserInput(selectedAiRequestId);
              }

              sendAiRequestStarted({
                simplifiedProjectJsonLength: simplifiedProjectJson
                  ? simplifiedProjectJson.length
                  : 0,
                projectSpecificExtensionsSummaryJsonLength: projectSpecificExtensionsSummaryJson
                  ? projectSpecificExtensionsSummaryJson.length
                  : 0,
                payWithCredits,
                storageProviderName,
                mode,
                aiRequestId: aiRequest.id,
              });
            } catch (error) {
              console.error('Error starting a new AI request:', error);
              setLastSendError(null, error);
              setIsSendingUserMessage(false);
            }

            // Refresh the user limits, to ensure quota and credits information
            // is up-to-date after an AI request.
            await delay(500);
            await refreshLimits({ withRetry: true });
          })();
        },
        [
          aiRequestPriceInCredits,
          availableCredits,
          getAuthorizationHeader,
          onOpenCreateAccountDialog,
          refreshLimits,
          profile,
          project,
          fileMetadata,
          storageProvider,
          quota,
          selectedAiRequestId,
          setLastSendError,
          setAiState,
          setSendingAiRequest,
          setIsSendingUserMessage,
          upToDateSelectedAiRequestId,
          updateAiRequest,
          newAiRequestOptions,
          automaticallyUseCreditsForAiRequests,
          storageProviderName,
        ]
      );

      // Send the results of the function call outputs, if any, and the user message (if any).
      const onSendMessage = React.useCallback(
        async ({
          userMessage,
          createdSceneNames,
          createdProject,
          editorFunctionCallResults,
          mode,
        }: {|
          userMessage: string,
          createdSceneNames?: Array<string>,
          createdProject?: ?gdProject,
          editorFunctionCallResults: Array<EditorFunctionCallResult>,
          mode?: 'chat' | 'agent' | 'orchestrator',
        |}) => {
          if (!profile || !selectedAiRequestId || !selectedAiRequest) return;

          if (isSendingAiRequest(selectedAiRequestId)) {
            console.info(
              'Skipping send for AI request: another send is already in progress.'
            );
            return;
          }

          // Read the results from the editor that applied the function calls.
          // and transform them into the output that will be stored on the AI request.
          const {
            hasUnfinishedResult,
            functionCallOutputs,
          } = getFunctionCallOutputsFromEditorFunctionCallResults(
            editorFunctionCallResults
          );

          const hasFunctionsCallsToProcess =
            getFunctionCallsToProcess({
              aiRequest: selectedAiRequest,
              editorFunctionCallResults,
            }).length > 0;

          // If anything is not finished yet, stop there (we only send all
          // results at once, AI do not support partial results).
          if (hasUnfinishedResult) {
            console.info(
              'Skipping send for AI request: some function call results are not finished yet.'
            );
            return;
          }
          if (hasFunctionsCallsToProcess) {
            console.info(
              'Skipping send for AI request: there are still function calls to process.'
            );
            return;
          }

          // If nothing to send, stop there.
          if (functionCallOutputs.length === 0 && !userMessage) return;

          // Paying with credits is only when a user message is sent (and quota is exhausted).
          let payWithCredits = false;
          if (
            userMessage &&
            quota &&
            quota.limitReached &&
            aiRequestPriceInCredits
          ) {
            payWithCredits = true;
            const doesNotHaveEnoughCreditsToContinue =
              availableCredits < aiRequestPriceInCredits;
            const cannotContinue =
              !automaticallyUseCreditsForAiRequests ||
              doesNotHaveEnoughCreditsToContinue;

            if (cannotContinue) {
              return;
            }
          }

          try {
            setSendingAiRequest(selectedAiRequestId, true);
            if (userMessage) setIsSendingUserMessage(true);

            const upToDateProject = createdProject || project;

            const simplifiedProjectBuilder = makeSimplifiedProjectBuilder(gd);
            const simplifiedProjectJson = upToDateProject
              ? JSON.stringify(
                  simplifiedProjectBuilder.getSimplifiedProject(
                    upToDateProject,
                    {}
                  )
                )
              : null;
            const projectSpecificExtensionsSummaryJson = upToDateProject
              ? JSON.stringify(
                  simplifiedProjectBuilder.getProjectSpecificExtensionsSummary(
                    upToDateProject
                  )
                )
              : null;

            const preparedAiUserContent = await prepareAiUserContent({
              getAuthorizationHeader,
              userId: profile.id,
              simplifiedProjectJson,
              projectSpecificExtensionsSummaryJson,
              eventsJson: null,
            });

            // If we're updating the request, following a function call to initialize the project,
            // pause the request, so that suggestions can be given by the agent.
            const hasJustInitializedProject =
              functionCallOutputs.length > 0 &&
              functionCallOutputs.some(
                output =>
                  getFunctionCallNameByCallId({
                    aiRequest: selectedAiRequest,
                    callId: output.call_id,
                  }) === 'initialize_project'
              );
            if (functionCallOutputs.length > 0) {
              // Assume changes have happened, trigger unsaved changes.
              triggerUnsavedChanges();
            }

            const modeForThisMessage = mode || selectedAiRequest.mode || 'chat';

            const aiRequest: AiRequest = await retryIfFailed({ times: 2 }, () =>
              addMessageToAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: selectedAiRequestId,
                functionCallOutputs,
                gameProjectJsonUserRelativeKey:
                  preparedAiUserContent.gameProjectJsonUserRelativeKey,
                gameProjectJson: preparedAiUserContent.gameProjectJson,
                projectSpecificExtensionsSummaryJsonUserRelativeKey:
                  preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
                projectSpecificExtensionsSummaryJson:
                  preparedAiUserContent.projectSpecificExtensionsSummaryJson,
                gameId: upToDateProject
                  ? upToDateProject.getProjectUuid()
                  : undefined,
                payWithCredits,
                userMessage,
                paused:
                  hasJustInitializedProject && modeForThisMessage === 'agent',
                mode,
                toolsVersion:
                  mode === 'agent'
                    ? AI_AGENT_TOOLS_VERSION
                    : mode === 'orchestrator'
                    ? AI_ORCHESTRATOR_TOOLS_VERSION
                    : mode === 'chat'
                    ? AI_CHAT_TOOLS_VERSION
                    : undefined,
              })
            );
            updateAiRequest(aiRequest.id, () => aiRequest);
            setSendingAiRequest(aiRequest.id, false);
            setIsSendingUserMessage(false);
            clearEditorFunctionCallResults(aiRequest.id);

            if (userMessage) {
              sendAiRequestMessageSent({
                simplifiedProjectJsonLength: simplifiedProjectJson
                  ? simplifiedProjectJson.length
                  : 0,
                projectSpecificExtensionsSummaryJsonLength: projectSpecificExtensionsSummaryJson
                  ? projectSpecificExtensionsSummaryJson.length
                  : 0,
                payWithCredits,
                mode: modeForThisMessage,
                aiRequestId: aiRequest.id,
                outputLength: aiRequest.output.length,
              });
            }
          } catch (error) {
            console.error('Error while sending AI request message:', error);
            // TODO: update the label of the button to send again.
            setLastSendError(selectedAiRequestId, error);
            setIsSendingUserMessage(false);
          }

          if (userMessage) {
            const aiRequestChatRefCurrent = aiRequestChatRef.current;
            if (aiRequestChatRefCurrent) {
              aiRequestChatRefCurrent.resetUserInput('');
              aiRequestChatRefCurrent.resetUserInput(selectedAiRequestId);
            }
          }

          // Refresh the user limits, to ensure quota and credits information
          // is up-to-date after an AI request.
          await delay(500);
          await refreshLimits({ withRetry: true });

          if (
            selectedAiRequest &&
            createdSceneNames &&
            createdSceneNames.length > 0
          ) {
            createdSceneNames.forEach(sceneName => {
              onOpenLayout(sceneName, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              });
            });
          }
        },
        [
          profile,
          selectedAiRequestId,
          isSendingAiRequest,
          quota,
          aiRequestPriceInCredits,
          availableCredits,
          setSendingAiRequest,
          setIsSendingUserMessage,
          updateAiRequest,
          clearEditorFunctionCallResults,
          getAuthorizationHeader,
          setLastSendError,
          refreshLimits,
          project,
          onOpenLayout,
          selectedAiRequest,
          automaticallyUseCreditsForAiRequests,
          triggerUnsavedChanges,
        ]
      );
      const onSendEditorFunctionCallResults = React.useCallback(
        async (
          editorFunctionCallResults: Array<EditorFunctionCallResult>,
          options: {|
            createdProject?: ?gdProject,
            createdSceneNames?: Array<string>,
          |}
        ) => {
          await onSendMessage({
            userMessage: '',
            createdProject: options.createdProject,
            createdSceneNames: options.createdSceneNames,
            editorFunctionCallResults,
          });
        },
        [onSendMessage]
      );
      const { onProcessFunctionCalls } = useProcessFunctionCalls({
        project,
        resourceManagementProps,
        selectedAiRequest,
        editorCallbacks,
        onSendEditorFunctionCallResults,
        getEditorFunctionCallResults,
        addEditorFunctionCallResults,
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        i18n,
        onWillInstallExtension,
        onExtensionInstalled,
        isReadyToProcessFunctionCalls,
      });

      React.useEffect(() => {
        // When component is mounted, and an AI request was already selected,
        // ensure we reset the selection if not logged in.
        if (selectedAiRequestId) {
          if (!profile) {
            setAiState({
              aiRequestId: null,
            });
            return;
          }
        }

        setIsReadyToProcessFunctionCalls(true);
        // We only want this to run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      const onStartOrOpenChat = React.useCallback(
        (
          options: ?{|
            aiRequestId: string | null,
          |}
        ) => {
          if (options) {
            // Suspend the current request when navigating away from it.
            // upToDateOnStop is defined below - it is always up-to-date via the ref.
            if (
              selectedAiRequest &&
              options.aiRequestId !== selectedAiRequest.id
            ) {
              // upToDateOnStop is declared below this callback, but it is only
              // ever called at event-handler time (post-render), so it is always
              // initialised by the time this runs.
              // eslint-disable-next-line no-use-before-define
              upToDateOnStop.current().catch(err => {
                console.error(
                  'Failed to suspend AI request when starting new chat:',
                  err
                );
              });
            }
            setAiState(options);
          }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [setAiState, selectedAiRequest]
      );
      const onStartNewChat = React.useCallback(
        () => {
          onStartOrOpenChat({
            aiRequestId: null,
          });
        },
        [onStartOrOpenChat]
      );

      const updateToolbar = React.useCallback(
        () => {
          // $FlowFixMe[constant-condition]
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

      // $FlowFixMe[incompatible-type]
      React.useImperativeHandle(ref, () => ({
        getProject: noop,
        updateToolbar,
        forceUpdateEditor: noop,
        onEventsBasedObjectChildrenEdited: noop,
        onSceneObjectEdited: noop,
        onSceneObjectsDeleted: noop,
        onSceneEventsModifiedOutsideEditor: noop,
        onInstancesModifiedOutsideEditor: noop,
        onObjectsModifiedOutsideEditor: noop,
        onObjectGroupsModifiedOutsideEditor: noop,
        startOrOpenChat: onStartOrOpenChat,
        notifyChangesToInGameEditor: setEditorHotReloadNeeded,
        switchInGameEditorIfNoHotReloadIsNeeded: noop,
        prepareToReposition: () => {
          skipSuspendOnCloseRef.current = true;
        },
      }));

      const onSendFeedback = React.useCallback(
        async (
          // $FlowFixMe[missing-local-annot]
          aiRequestId,
          // $FlowFixMe[missing-local-annot]
          messageIndex,
          // $FlowFixMe[missing-local-annot]
          feedback,
          // $FlowFixMe[missing-local-annot]
          reason,
          // $FlowFixMe[missing-local-annot]
          freeFormDetails
        ) => {
          if (!profile) return;
          try {
            await retryIfFailed({ times: 2 }, () =>
              sendAiRequestFeedback(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId,
                messageIndex,
                feedback,
                reason,
                freeFormDetails,
              })
            );
          } catch (error) {
            console.error('Error sending feedback: ', error);
          }
        },
        [getAuthorizationHeader, profile]
      );

      const onStop = React.useCallback(
        async () => {
          if (!selectedAiRequest || !profile) return;
          const editorFunctionCallResultsForRequest =
            getEditorFunctionCallResults(selectedAiRequest.id) || [];
          if (
            !aiRequestHasWorkInProgress(
              selectedAiRequest,
              editorFunctionCallResultsForRequest
            )
          )
            return;
          // Optimistic update: mark as suspended locally immediately so that
          // any in-flight async code (e.g. processEditorFunctionCalls,
          // prepareAiUserContent) sees the suspended status after the next
          // React render — before the API call even completes.
          const requestIdToSuspend = selectedAiRequest.id;
          updateAiRequest(requestIdToSuspend, prevRequest => ({
            ...(prevRequest || selectedAiRequest),
            status: 'suspended',
          }));
          clearEditorFunctionCallResults(requestIdToSuspend);

          const suspendedRequest = await suspendAiRequest(
            getAuthorizationHeader,
            {
              userId: profile.id,
              aiRequestId: requestIdToSuspend,
            }
          );
          updateAiRequest(suspendedRequest.id, () => suspendedRequest);
        },
        [
          selectedAiRequest,
          profile,
          getAuthorizationHeader,
          updateAiRequest,
          clearEditorFunctionCallResults,
          getEditorFunctionCallResults,
        ]
      );

      const upToDateOnStop = useStableUpToDateRef(onStop);

      // Do a full fetch when the tab is opened to ensure the UI starts with
      // up-to-date server state (e.g. request may have been suspended while
      // the tab was closed).
      React.useEffect(
        () => {
          if (!selectedAiRequest || !profile) return;
          retryIfFailed({ times: 2 }, () =>
            getAiRequest(getAuthorizationHeader, {
              userId: profile.id,
              aiRequestId: selectedAiRequest.id,
            })
          )
            .then(aiRequest => {
              updateAiRequest(aiRequest.id, () => aiRequest);
            })
            .catch(error => {
              console.warn('Error fetching AI request on tab open:', error);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );

      // When set to true before unmount, the cleanup will skip suspending the
      // AI request (used when the tab is being repositioned to another pane).
      const skipSuspendOnCloseRef = React.useRef(false);

      // Suspend any running AI request when this editor tab is closed.
      React.useEffect(
        () => {
          return () => {
            if (skipSuspendOnCloseRef.current) {
              // Tab is being repositioned to another pane — do not suspend.
              return;
            }
            // Fire and forget - cannot await in a cleanup function.
            // We intentionally read upToDateOnStop.current at cleanup time so
            // we get the latest selectedAiRequest snapshot (that's the point of
            // the stable ref).
            // eslint-disable-next-line react-hooks/exhaustive-deps
            upToDateOnStop.current().catch(err => {
              console.error('Failed to suspend AI request on tab close:', err);
            });
          };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );

      const onRestore = React.useCallback(
        async ({
          message,
          aiRequest,
        }: {|
          message: AiRequestMessage,
          aiRequest: AiRequest,
        |}) => {
          if (!profile) return;
          const cloudProjectId = storageProvider
            ? getCloudProjectFileMetadataIdentifier(
                storageProvider.internalName,
                fileMetadata
              )
            : null;

          if (!project || !cloudProjectId) {
            await showAlert({
              title: t`Cannot restore project`,
              message: t`Open the project associated with this AI request to restore to this state.`,
            });
            return;
          }
          if (project.getProjectUuid() !== aiRequest.gameId) {
            await showAlert({
              title: t`Project mismatch`,
              message: t`The project associated with this AI request does not match the current project. Open the correct project to restore to this state.`,
            });
            return;
          }

          let projectVersionId: ?string;
          let forkToMessageId: ?string;
          if (message.type === 'message' && message.role === 'user') {
            projectVersionId = message.projectVersionIdBeforeMessage;
            // For user messages, we fork up to the previous message.
            const messages = aiRequest.output;
            const messageIndex = messages.findIndex(
              msg => msg.messageId === message.messageId
            );
            if (messageIndex > 0) {
              const previousMessage = messages[messageIndex - 1];
              forkToMessageId = previousMessage.messageId;
            }
          }
          if (
            message.type === 'function_call_output' ||
            message.role === 'assistant'
          ) {
            // For assistant messages, we fork up to this message.
            projectVersionId = message.projectVersionIdAfterMessage;
            forkToMessageId = message.messageId;
          }

          if (!projectVersionId) {
            await showAlert({
              title: t`No project save available`,
              message: t`No project save is available for this request message.`,
            });
            return;
          }

          let projectSave;
          try {
            projectSave = await getOrLoadProjectVersion(projectVersionId);
          } catch (error) {
            const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
              error
            );
            let title = t`Project save cannot be opened`;
            let message = t`An error occurred while fetching the project version, try again later.`;
            let type = 'alert';
            if (
              extractedStatusAndCode &&
              extractedStatusAndCode.status === 404
            ) {
              title = t`Project save not found`;
              message = t`The project save associated with this AI request message was not found. It may have been deleted.`;
            }
            if (
              extractedStatusAndCode &&
              extractedStatusAndCode.status === 403 &&
              extractedStatusAndCode.code ===
                'project-version/cannot-access-project'
            ) {
              title = t`Cannot access project save`;
              message = t`You do not have permission to access the project save associated with this AI request message.`;
            }
            if (
              extractedStatusAndCode &&
              extractedStatusAndCode.status === 403 &&
              extractedStatusAndCode.code ===
                'project-version/no-history-access'
            ) {
              title = t`No access to project save`;
              message = t`You do not have access to project saves with your current subscription plan. Please upgrade your plan to access this feature.`;
              type = 'confirmation';
            }
            if (
              extractedStatusAndCode &&
              extractedStatusAndCode.status === 403 &&
              extractedStatusAndCode.code ===
                'project-version/version-outside-retention'
            ) {
              title = t`Project save not available`;
              message = t`The project save associated with this AI request message is no longer available due to your current plan's limit. Upgrade your subscription to access older project saves.`;
              type = 'confirmation';
            }

            if (type === 'alert') {
              await showAlert({
                title,
                message,
              });
              return;
            }

            if (type === 'confirmation') {
              const answer = await showConfirmation({
                title,
                message,
                confirmButtonLabel: t`See plans`,
                dismissButtonLabel: t`Cancel`,
              });
              if (answer) {
                openSubscriptionDialog({
                  analyticsMetadata: {
                    reason: 'AI requests history',
                    recommendedPlanId: hasValidSubscriptionPlan()
                      ? 'gdevelop_startup'
                      : 'gdevelop_gold',
                    placementId: 'ai-requests',
                  },
                });
              }
              return;
            }
          }

          if (!projectSave) {
            await showAlert({
              title: t`No project save available`,
              message: t`No project save is available for this request message.`,
            });
            return;
          }

          const result = await showConfirmation({
            title: t`Restore project to this state?`,
            message: t`Are you sure you want to restore the project to the state saved at this point in the AI conversation? This will overwrite the current project state.`,
            confirmButtonLabel: t`Restore`,
            dismissButtonLabel: t`Cancel`,
            level: 'warning',
          });
          if (!result) return;

          // Check if this is the last message with a save in the conversation
          // Find the last message that has a projectVersionIdAfterMessage
          let lastMessageWithSave = null;
          for (let i = aiRequest.output.length - 1; i >= 0; i--) {
            const msg = aiRequest.output[i];
            if (
              (msg.type === 'function_call_output' ||
                (msg.type === 'message' && msg.role === 'assistant')) &&
              msg.projectVersionIdAfterMessage
            ) {
              lastMessageWithSave = msg;
              break;
            }
          }

          const isLastMessage =
            lastMessageWithSave &&
            lastMessageWithSave.messageId === forkToMessageId;

          if (forkToMessageId) {
            setForkingState({
              aiRequestId: aiRequest.id,
              messageId: forkToMessageId,
            });
          }

          try {
            const hasLoadSucceeded = await onCheckoutVersion(projectSave, {
              dontSaveCheckedOutVersionStatus: true,
            });

            if (hasLoadSucceeded && profile) {
              if (isLastMessage) {
                // This is the last message, no need to fork, just stay on the current request.
                setForkingState(null);
              } else if (!forkToMessageId) {
                // No message to fork to, we probably restored at the beginning of the conversation,
                // so let's just open a new chat.
                setForkingState(null);
                onStartOrOpenChat({ aiRequestId: null });
              } else {
                // Fork the AI request to create a new conversation
                try {
                  const forkedAiRequest: AiRequest = await retryIfFailed(
                    { times: 2 },
                    () =>
                      forkAiRequest(getAuthorizationHeader, {
                        userId: profile.id,
                        aiRequestId: aiRequest.id,
                        upToMessageId: forkToMessageId || undefined,
                      })
                  );
                  updateAiRequest(forkedAiRequest.id, () => forkedAiRequest);

                  // Open the new forked AI request
                  onStartOrOpenChat({ aiRequestId: forkedAiRequest.id });
                } catch (forkError) {
                  console.error(
                    'An error occurred while forking AI request:',
                    forkError
                  );
                  setForkingState(null);
                  // Don't show an error to the user since the restore succeeded
                  // The fork is a nice-to-have feature
                }
              }
            } else {
              setForkingState(null);
            }
          } catch (error) {
            console.error(
              'An error occurred while restoring project version:',
              error
            );
            setForkingState(null);
            await showAlert({
              title: t`Error`,
              message: t`An error occurred while restoring the project version: ${
                error.message
              }`,
            });
          }
        },
        [
          project,
          showAlert,
          showConfirmation,
          onCheckoutVersion,
          getOrLoadProjectVersion,
          profile,
          getAuthorizationHeader,
          updateAiRequest,
          onStartOrOpenChat,
          setForkingState,
          storageProvider,
          fileMetadata,
          openSubscriptionDialog,
        ]
      );

      return (
        <>
          <Paper square background="dark" style={styles.paper}>
            <div style={styles.chatContainer}>
              <AiRequestChat
                aiConfigurationPresetsWithAvailability={getAiConfigurationPresetsWithAvailability(
                  { limits, getAiSettings }
                )}
                project={project}
                fileMetadata={fileMetadata}
                ref={aiRequestChatRef}
                aiRequest={selectedAiRequest}
                onStartNewAiRequest={startNewAiRequest}
                onSendUserMessage={({
                  userMessage,
                  mode,
                }: {|
                  userMessage: string,
                  mode: 'chat' | 'agent' | 'orchestrator',
                |}) =>
                  onSendMessage({
                    userMessage,
                    mode,
                    editorFunctionCallResults: selectedAiRequest
                      ? getEditorFunctionCallResults(selectedAiRequest.id) || []
                      : [],
                  })
                }
                isSending={isSendingAiRequest(selectedAiRequestId)}
                isSendingUserMessage={isSendingUserMessage}
                lastSendError={getLastSendError(selectedAiRequestId)}
                quota={quota}
                increaseQuotaOffering={
                  !hasValidSubscriptionPlan(subscription)
                    ? 'subscribe'
                    : canUpgradeSubscription(subscription)
                    ? 'upgrade'
                    : 'none'
                }
                onProcessFunctionCalls={onProcessFunctionCalls}
                editorFunctionCallResults={
                  (selectedAiRequest &&
                    getEditorFunctionCallResults(selectedAiRequest.id)) ||
                  null
                }
                price={aiRequestPrice}
                availableCredits={availableCredits}
                isRefreshingLimits={isRefreshingLimits}
                onSendFeedback={onSendFeedback}
                hasOpenedProject={!!project}
                onStop={onStop}
                i18n={i18n}
                editorCallbacks={editorCallbacks}
                onStartOrOpenChat={onStartOrOpenChat}
                isFetchingSuggestions={isFetchingSuggestions}
                savingProjectForMessageId={savingProjectForMessageId}
                forkingState={forkingState}
                onRestore={onRestore}
              />
            </div>
          </Paper>
          <AskAiHistory
            open={isHistoryOpen}
            onClose={onCloseHistory}
            onSelectAiRequest={async aiRequest => {
              let requestToOpen = aiRequest;
              // Suspend the request if it was left with work in progress (e.g. from a previous session).
              const editorFunctionCallResultsForRequest =
                getEditorFunctionCallResults(aiRequest.id) || [];
              if (
                aiRequestHasWorkInProgress(
                  aiRequest,
                  editorFunctionCallResultsForRequest
                ) &&
                profile
              ) {
                try {
                  requestToOpen = await suspendAiRequest(
                    getAuthorizationHeader,
                    {
                      userId: profile.id,
                      aiRequestId: aiRequest.id,
                    }
                  );
                  clearEditorFunctionCallResults(requestToOpen.id);
                } catch (err) {
                  console.error(
                    'Failed to suspend AI request when opening from history:',
                    err
                  );
                }
              }
              // Immediately switch the UI and refresh in the background.
              updateAiRequest(requestToOpen.id, () => requestToOpen);
              setAiState({
                aiRequestId: requestToOpen.id,
              });
              refreshAiRequest(requestToOpen.id);
              onCloseHistory();
            }}
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

export const renderAskAiEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => (
  <I18n>
    {({ i18n }) => (
      // $FlowFixMe[incompatible-type]
      <AskAiEditor
        ref={props.ref}
        i18n={i18n}
        project={props.project}
        resourceManagementProps={props.resourceManagementProps}
        fileMetadata={props.fileMetadata}
        storageProvider={props.storageProvider}
        setToolbar={props.setToolbar}
        isActive={props.isActive}
        onCreateProjectFromExample={props.onCreateProjectFromExample}
        onCreateEmptyProject={props.onCreateEmptyProject}
        onOpenLayout={props.onOpenLayout}
        onSceneEventsModifiedOutsideEditor={
          props.onSceneEventsModifiedOutsideEditor
        }
        onInstancesModifiedOutsideEditor={
          props.onInstancesModifiedOutsideEditor
        }
        onObjectsModifiedOutsideEditor={props.onObjectsModifiedOutsideEditor}
        onObjectGroupsModifiedOutsideEditor={
          props.onObjectGroupsModifiedOutsideEditor
        }
        onWillInstallExtension={props.onWillInstallExtension}
        onExtensionInstalled={props.onExtensionInstalled}
        onOpenAskAi={props.onOpenAskAi}
        gameEditorMode={props.gameEditorMode}
        continueProcessingFunctionCallsOnMount={
          props.extraEditorProps
            ? props.extraEditorProps.continueProcessingFunctionCallsOnMount
            : false
        }
        onCheckoutVersion={props.onCheckoutVersion}
        getOrLoadProjectVersion={props.getOrLoadProjectVersion}
        onSave={props.onSave}
        onSaveProjectAsWithStorageProvider={
          props.onSaveProjectAsWithStorageProvider
        }
      />
    )}
  </I18n>
);
