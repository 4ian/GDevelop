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
  AI_AGENT_TOOLS_VERSION,
  AI_CHAT_TOOLS_VERSION,
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
|};

const noop = () => {};

export const AskAiEditor = React.memo<Props>(
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
            onRefreshLimits();
          }
        },
        [isActive, onRefreshLimits]
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
                fileMetadata,
                storageProviderName,
                mode,
                toolsVersion:
                  mode === 'agent'
                    ? AI_AGENT_TOOLS_VERSION
                    : AI_CHAT_TOOLS_VERSION,
                aiConfiguration: {
                  presetId: aiConfigurationPresetId,
                },
              });

              console.info('Successfully created a new AI request:', aiRequest);
              setSendingAiRequest(null, false);
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
            }

            // Refresh the user limits, to ensure quota and credits information
            // is up-to-date after an AI request.
            await delay(500);
            try {
              await retryIfFailed({ times: 2 }, onRefreshLimits);
            } catch (error) {
              // Ignore limits refresh error.
            }
          })();
        },
        [
          aiRequestPriceInCredits,
          availableCredits,
          getAuthorizationHeader,
          onOpenCreateAccountDialog,
          onRefreshLimits,
          profile,
          project,
          fileMetadata,
          storageProvider,
          quota,
          selectedAiRequestId,
          setLastSendError,
          setAiState,
          setSendingAiRequest,
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
          mode?: 'chat' | 'agent',
        |}) => {
          if (
            !profile ||
            !selectedAiRequestId ||
            !selectedAiRequest ||
            isSendingAiRequest(selectedAiRequestId)
          )
            return;

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
          if (hasUnfinishedResult) return;
          if (hasFunctionsCallsToProcess) return;

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
                paused: hasJustInitializedProject,
                mode,
                toolsVersion:
                  mode === 'agent'
                    ? AI_AGENT_TOOLS_VERSION
                    : mode === 'chat'
                    ? AI_CHAT_TOOLS_VERSION
                    : undefined,
              })
            );
            updateAiRequest(aiRequest.id, () => aiRequest);
            setSendingAiRequest(aiRequest.id, false);
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
            // TODO: update the label of the button to send again.
            setLastSendError(selectedAiRequestId, error);
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
          try {
            await retryIfFailed({ times: 2 }, onRefreshLimits);
          } catch (error) {
            // Ignore limits refresh error.
          }

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
          updateAiRequest,
          clearEditorFunctionCallResults,
          getAuthorizationHeader,
          setLastSendError,
          onRefreshLimits,
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
      const {
        isAutoProcessingFunctionCalls,
        setAutoProcessFunctionCalls,
        onProcessFunctionCalls,
      } = useProcessFunctionCalls({
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
        // ensure function calls are not auto-processed,
        // except if specified otherwise.
        // Otherwise it will automatically resume processing on old requests,
        // affecting the project without the user explicitly asking for it.
        if (selectedAiRequestId) {
          // If not logged in, reset selection.
          if (!profile) {
            setAiState({
              aiRequestId: null,
            });
            return;
          }

          setAutoProcessFunctionCalls(
            selectedAiRequestId,
            !!continueProcessingFunctionCallsOnMount
          );
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
          const newOpenedRequestId = options && options.aiRequestId;
          if (newOpenedRequestId) {
            // If we're opening a new request,
            // ensure it is paused, so we don't resume processing
            // without the user's consent.
            setAutoProcessFunctionCalls(newOpenedRequestId, false);
          }
          if (options) {
            setAiState(options);
          }
        },
        [setAiState, setAutoProcessFunctionCalls]
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
        onSceneObjectsDeleted: noop,
        onSceneEventsModifiedOutsideEditor: noop,
        onInstancesModifiedOutsideEditor: noop,
        onObjectsModifiedOutsideEditor: noop,
        onObjectGroupsModifiedOutsideEditor: noop,
        startOrOpenChat: onStartOrOpenChat,
        notifyChangesToInGameEditor: setEditorHotReloadNeeded,
        switchInGameEditorIfNoHotReloadIsNeeded: noop,
      }));

      const onSendFeedback = React.useCallback(
        async (
          aiRequestId,
          messageIndex,
          feedback,
          reason,
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
                  const forkedAiRequest = await forkAiRequest(
                    getAuthorizationHeader,
                    {
                      userId: profile.id,
                      aiRequestId: aiRequest.id,
                      upToMessageId: forkToMessageId,
                    }
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
                  mode: 'chat' | 'agent',
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
                onSendFeedback={onSendFeedback}
                hasOpenedProject={!!project}
                isAutoProcessingFunctionCalls={
                  selectedAiRequest
                    ? isAutoProcessingFunctionCalls(selectedAiRequest.id)
                    : false
                }
                setAutoProcessFunctionCalls={shouldAutoProcess => {
                  if (!selectedAiRequest) return;
                  setAutoProcessFunctionCalls(
                    selectedAiRequest.id,
                    shouldAutoProcess
                  );
                }}
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
            onSelectAiRequest={aiRequest => {
              // Ensure function calls are not auto-processed when opening from history,
              // otherwise it will automatically resume processing.
              setAutoProcessFunctionCalls(aiRequest.id, false);
              // Immediately switch the UI and refresh in the background.
              updateAiRequest(aiRequest.id, () => aiRequest);
              setAiState({
                aiRequestId: aiRequest.id,
              });
              refreshAiRequest(aiRequest.id);
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
) => (
  <I18n>
    {({ i18n }) => (
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
