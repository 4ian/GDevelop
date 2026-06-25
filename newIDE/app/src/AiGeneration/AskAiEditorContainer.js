// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';
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
  suspendAiRequest as apiSuspendAiRequest,
  getAiRequest,
  type AiRequest,
  type AiRequestMessage,
  type AiRequestMessageAssistantFunctionCall,
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
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { type EditorFunctionCallResult } from '../EditorFunctions';
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
  useActivatePendingSubAgents,
  useLoadSubAgentRequests,
  useRefreshLimits,
  AI_ORCHESTRATOR_TOOLS_VERSION,
} from './Utils';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
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
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) => void,
  onSceneObjectEdited: (
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
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
  selectAllInsideEditor: () => void,
  startOrOpenChat: (
    ?{|
      aiRequestId: string | null,
    |}
  ) => void,
  notifyChangesToInGameEditor: (hotReloadSteps: HotReloadSteps) => void,
  switchInGameEditorIfNoHotReloadIsNeeded: () => void,
  /**
   * Call whenever the AI editor is about to be closed (tab cross, pane close,
   * mobile drawer close, "close all/other tabs", project close...). If an AI
   * request is currently working, the user is asked to confirm — closing stops
   * the AI — and the request is suspended on confirmation. Returns true if the
   * close should proceed, false if the user cancelled (keep the editor open).
   *
   * This is the single place where a running AI request is suspended on close.
   * Suspending is therefore only ever triggered by explicit, known user actions
   * (this method or the "Stop" button), never as a side effect of unmounting —
   * so repositioning the tab or switching between the mobile/desktop layouts
   * never stops the AI.
   */
  requestClose: () => Promise<boolean>,
|};

const noop = () => {};

export const AskAiEditor: React.ComponentType<Props> = React.memo<Props>(
  React.forwardRef<Props, AskAiEditorInterface>(
    (
      {
        isActive,
        setToolbar,
        project: nullableProject,
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
      const project = exceptionallyGuardAgainstDeadObject(nullableProject);

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
        selectedAiRequestId,
        selectedAiRequest,
        setSelectedAiRequestId,
        activeSubAgents,
      } = React.useContext(AiRequestContext);
      const {
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

      // "Auto edit" is a frontend-only toggle owned by the chat UI. We keep its
      // live value in a ref here so function-call processing can gate
      // project-modifying tools behind a confirmation when it is off, without
      // re-rendering the whole container on every toggle.
      const isAutoEditEnabledRef = React.useRef<boolean>(true);
      const getIsAutoEditEnabled = React.useCallback(
        () => isAutoEditEnabledRef.current,
        []
      );

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

      const { showAlert, showConfirmation, showYesNoCancel } = useAlertDialog();
      const { isMobile } = useResponsiveWindowSize();

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
        // fetchAiRequests is also a dependency so that if the profile was not
        // yet loaded when the editor first became active, the fetch is retried
        // once it becomes available.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isActive, fetchAiRequests]
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
        suspendAiRequest,
        pendingEditApproval,
        requestEditApproval,
        resolveEditApproval,
        setIsFetchingSuggestions,
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
          if (isActive && profile) {
            refreshLimits();
          }
        },
        [isActive, profile, refreshLimits]
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
                toolsVersion: AI_ORCHESTRATOR_TOOLS_VERSION,
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
                setSelectedAiRequestId(aiRequest.id);
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
          setSelectedAiRequestId,
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
          aiRequestId,
          userMessage,
          createdSceneNames,
          createdProject,
          editorFunctionCallResults,
        }: {|
          aiRequestId: string,
          userMessage: string,
          createdSceneNames?: Array<string>,
          createdProject?: ?gdProject,
          editorFunctionCallResults: Array<EditorFunctionCallResult>,
        |}) => {
          if (!profile) return;

          const aiRequestForMessage = aiRequests[aiRequestId];
          if (!aiRequestForMessage) return;

          if (isSendingAiRequest(aiRequestId)) {
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
              aiRequest: aiRequestForMessage,
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
            setSendingAiRequest(aiRequestId, true);
            // Sending takes over the UI: drop any in-flight best-effort
            // suggestions fetch so its "working" state can't keep the input
            // enabled while the real request runs.
            setIsFetchingSuggestions(false);
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

            if (
              editorFunctionCallResults &&
              editorFunctionCallResults.some(
                result =>
                  result.status === 'finished' && result.didModifyProject
              )
            ) {
              triggerUnsavedChanges();
            }

            const aiRequest: AiRequest = await retryIfFailed({ times: 2 }, () =>
              addMessageToAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId,
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
                // All requests made by the user are in orchestrator mode: set
                // it (and the tools version) when a user message is sent, in
                // case an older request made with another mode is being
                // continued. Don't set it otherwise, as this can be a message
                // sent to a sub-agent request (explorer or edit agent).
                mode: userMessage ? 'orchestrator' : undefined,
                toolsVersion: userMessage
                  ? AI_ORCHESTRATOR_TOOLS_VERSION
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
                mode: 'orchestrator',
                aiRequestId: aiRequest.id,
                outputLength: aiRequest.output ? aiRequest.output.length : 0,
              });
            }
          } catch (error) {
            console.error('Error while sending AI request message:', error);
            // TODO: update the label of the button to send again.
            setLastSendError(aiRequestId, error);
            setIsSendingUserMessage(false);
          }

          if (userMessage && aiRequestId === selectedAiRequestId) {
            const aiRequestChatRefCurrent = aiRequestChatRef.current;
            if (aiRequestChatRefCurrent) {
              aiRequestChatRefCurrent.resetUserInput('');
              aiRequestChatRefCurrent.resetUserInput(aiRequestId);
            }
          }

          // Refresh the user limits, to ensure quota and credits information
          // is up-to-date after an AI request.
          await delay(500);
          await refreshLimits({ withRetry: true });

          if (createdSceneNames && createdSceneNames.length > 0) {
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
          aiRequests,
          isSendingAiRequest,
          quota,
          aiRequestPriceInCredits,
          availableCredits,
          setSendingAiRequest,
          setIsFetchingSuggestions,
          setIsSendingUserMessage,
          updateAiRequest,
          clearEditorFunctionCallResults,
          getAuthorizationHeader,
          setLastSendError,
          refreshLimits,
          project,
          onOpenLayout,
          automaticallyUseCreditsForAiRequests,
          triggerUnsavedChanges,
        ]
      );
      useActivatePendingSubAgents({ selectedAiRequest });
      useLoadSubAgentRequests({ selectedAiRequest });

      const onSendEditorFunctionCallResults = React.useCallback(
        async (
          aiRequestId: string,
          editorFunctionCallResults: Array<EditorFunctionCallResult>,
          options: {|
            createdSceneNames?: Array<string>,
            createdProject?: ?gdProject,
          |}
        ) => {
          await onSendMessage({
            aiRequestId,
            userMessage: '',
            createdProject: options.createdProject,
            createdSceneNames: options.createdSceneNames,
            editorFunctionCallResults,
          });
        },
        [onSendMessage]
      );

      /**
       * Collect all AI requests to process: the selected request, and all sub-agent requests.
       */
      const aiRequestsToProcess = React.useMemo(
        () => {
          const result = [];
          if (selectedAiRequest) {
            result.push(selectedAiRequest);
          }
          const subAgentIds = Object.keys(activeSubAgents);
          for (const subAgentId of subAgentIds) {
            const subAgentRequest = aiRequests[subAgentId];
            if (subAgentRequest) {
              result.push(subAgentRequest);
            }
          }
          return result;
        },
        [selectedAiRequest, activeSubAgents, aiRequests]
      );

      const {
        onProcessFunctionCalls,
        clearApprovedEditBatches,
      } = useProcessFunctionCalls({
        project,
        resourceManagementProps,
        editorCallbacks,
        aiRequestsToProcess,
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
        getIsAutoEditEnabled,
        suspendAiRequest,
        requestEditApproval,
      });

      // Wrap onProcessFunctionCalls to bind the selected AI request for the chat UI.
      const onProcessSelectedAiRequestFunctionCalls = React.useCallback(
        async (functionCalls: Array<AiRequestMessageAssistantFunctionCall>) => {
          if (!selectedAiRequest) return;
          await onProcessFunctionCalls(selectedAiRequest, functionCalls);
        },
        [selectedAiRequest, onProcessFunctionCalls]
      );

      React.useEffect(() => {
        // When component is mounted, and an AI request was already selected,
        // ensure we reset the selection if not logged in.
        if (selectedAiRequestId) {
          if (!profile) {
            setSelectedAiRequestId(null);
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
          if (!options) return;
          const { aiRequestId } = options;
          // When navigating away from a working request, ask the user to confirm
          // stopping it (or to cancel). Unlike closing the editor, we do NOT
          // offer to keep it running in the background here: a request you have
          // navigated away from while opening another chat would be confusing.
          if (selectedAiRequest && aiRequestId !== selectedAiRequest.id) {
            // upToDateConfirmStopping is declared below this callback, but it is
            // only ever called at event-handler time (post-render), so it is
            // always initialised by the time this runs.
            // eslint-disable-next-line no-use-before-define
            upToDateConfirmStopping
              .current({
                title: t`Open another chat?`,
                message: t`The AI is currently working on your project. Opening another chat will stop it. Do you want to continue?`,
              })
              .then(shouldProceed => {
                if (shouldProceed) setSelectedAiRequestId(aiRequestId);
              });
            return;
          }
          setSelectedAiRequestId(aiRequestId);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [setSelectedAiRequestId, selectedAiRequest]
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
        selectAllInsideEditor: noop,
        startOrOpenChat: onStartOrOpenChat,
        notifyChangesToInGameEditor: setEditorHotReloadNeeded,
        switchInGameEditorIfNoHotReloadIsNeeded: noop,
        requestClose,
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

      const getHasWorkInProgress = React.useCallback(
        () => {
          if (!selectedAiRequest) return false;
          const editorFunctionCallResultsForRequest =
            getEditorFunctionCallResults(selectedAiRequest.id) || [];
          return aiRequestHasWorkInProgress(
            selectedAiRequest,
            editorFunctionCallResultsForRequest
          );
        },
        [selectedAiRequest, getEditorFunctionCallResults]
      );

      const onStop = React.useCallback(
        async () => {
          if (!selectedAiRequest) return;
          if (!getHasWorkInProgress()) return;
          // Delegates to the provider so the suspend logic lives in a single
          // place and also works when triggered outside of this editor.
          await suspendAiRequest(selectedAiRequest.id);
        },
        [selectedAiRequest, getHasWorkInProgress, suspendAiRequest]
      );

      const upToDateOnStop = useStableUpToDateRef(onStop);

      // Shared confirmation used whenever the user leaves a working AI request —
      // either by closing the editor or by opening another chat. Asks whether
      // the AI should keep working in the background, be stopped, or whether the
      // action should be cancelled. Returns true if the caller should proceed
      // (and suspends the request when the user chose "Stop working"). This is
      // the only place, besides the "Stop" button, that suspends a request.
      const confirmLeavingWorkingRequest = React.useCallback(
        async ({
          title,
          message,
        }: {|
          title: MessageDescriptor,
          message: MessageDescriptor,
        |}): Promise<boolean> => {
          if (pendingEditApproval) {
            // Paused on an inline edit approval (not actively working): leaving
            // refuses the pending change, which suspends the request. Don't show
            // the "is working" prompt.
            resolveEditApproval(false);
            return true;
          }
          if (!getHasWorkInProgress()) return true;
          const answer = await showYesNoCancel({
            title,
            message,
            // Primary action (right): keep the request running. Shorter labels
            // on mobile so the three buttons don't wrap onto two lines.
            yesButtonLabel: isMobile ? t`Continue` : t`Continue working`,
            // Secondary action (right): stop the request, then proceed.
            noButtonLabel: isMobile ? t`Stop` : t`Stop working`,
            // Left action: do not proceed.
            cancelButtonLabel: t`Cancel`,
          });
          // showYesNoCancel resolves with 0 (yes), 1 (no) or 2 (cancel).
          // $FlowFixMe[invalid-compare] - resolves to a number, not a boolean.
          if (answer === 2) {
            // Cancel: do nothing, keep the request and the editor as-is.
            return false;
          }
          // $FlowFixMe[invalid-compare] - resolves to a number, not a boolean.
          if (answer === 1) {
            // Stop working: suspend the request, then allow the action.
            await upToDateOnStop.current();
          }
          // Continue working (0): proceed without suspending — the request keeps
          // running in the background.
          return true;
        },
        [
          pendingEditApproval,
          resolveEditApproval,
          getHasWorkInProgress,
          showYesNoCancel,
          upToDateOnStop,
          isMobile,
        ]
      );

      // Called when the AI editor is about to be closed by an explicit user
      // action (see AskAiEditorInterface.requestClose).
      const requestClose = React.useCallback(
        (): Promise<boolean> =>
          confirmLeavingWorkingRequest({
            title: t`Close the AI chat?`,
            message: t`The AI is currently working on your project. Should it continue working while the tab is closed?`,
          }),
        [confirmLeavingWorkingRequest]
      );

      // Used when leaving a working request in a context where keeping it
      // running in the background would be confusing (opening another chat, or
      // closing the project that the AI is working on). Only offers to stop the
      // request or cancel. Returns true if the action should proceed.
      const confirmStoppingWorkingRequest = React.useCallback(
        async ({
          title,
          message,
        }: {|
          title: MessageDescriptor,
          message: MessageDescriptor,
        |}): Promise<boolean> => {
          if (pendingEditApproval) {
            // Paused on an inline edit approval (not actively working): leaving
            // refuses the pending change, which suspends the request. Don't show
            // the "is working" prompt.
            resolveEditApproval(false);
            return true;
          }
          if (!getHasWorkInProgress()) return true;
          const shouldStop = await showConfirmation({
            title,
            message,
            confirmButtonLabel: t`Stop working`,
            dismissButtonLabel: t`Cancel`,
          });
          if (!shouldStop) return false;
          await upToDateOnStop.current();
          return true;
        },
        [
          pendingEditApproval,
          resolveEditApproval,
          getHasWorkInProgress,
          showConfirmation,
          upToDateOnStop,
        ]
      );
      const upToDateConfirmStopping = useStableUpToDateRef(
        confirmStoppingWorkingRequest
      );

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

      // NB: the AI request is intentionally NOT suspended on unmount. Suspending
      // only happens through explicit user actions — the "Stop" button or
      // requestClose() (tab/pane/drawer/project close) — so unmounting for any
      // other reason (repositioning the tab, switching between the mobile and
      // desktop layouts, re-rendering...) never stops a running request.

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
            const messages = aiRequest.output || [];
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
          const outputMessages = aiRequest.output || [];
          for (let i = outputMessages.length - 1; i >= 0; i--) {
            const msg = outputMessages[i];
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
                onSendUserMessage={async ({
                  userMessage,
                }: {|
                  userMessage: string,
                |}) => {
                  if (!selectedAiRequestId) return;
                  await onSendMessage({
                    aiRequestId: selectedAiRequestId,
                    userMessage,
                    editorFunctionCallResults: selectedAiRequest
                      ? getEditorFunctionCallResults(selectedAiRequest.id) || []
                      : [],
                  });
                }}
                onIsAutoEditEnabledChange={enabled => {
                  isAutoEditEnabledRef.current = enabled;
                  // Toggling auto-edit revokes any blanket approvals already
                  // granted in the current sub-agent batch, so turning it on
                  // then off again re-prompts for the upcoming edits.
                  clearApprovedEditBatches();
                }}
                pendingEditApproval={pendingEditApproval}
                onResolveEditApproval={resolveEditApproval}
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
                onProcessFunctionCalls={onProcessSelectedAiRequestFunctionCalls}
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
                  requestToOpen = await apiSuspendAiRequest(
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
              setSelectedAiRequestId(requestToOpen.id);
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
