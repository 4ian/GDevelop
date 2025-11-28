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
  type AiRequest,
} from '../Utils/GDevelopServices/Generation';
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
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { type EditorFunctionCallResult } from '../EditorFunctions/EditorFunctionCallRunner';
import { useStableUpToDateRef } from '../Utils/UseStableUpToDateCallback';
import {
  type NewProjectSetup,
  type ExampleProjectSetup,
} from '../ProjectCreation/NewProjectSetupDialog';
import { type FileMetadata, type StorageProvider } from '../ProjectsStorage';
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
    mode: 'chat' | 'agent',
    aiRequestId: string | null,
    paneIdentifier: 'left' | 'center' | 'right' | null,
  |}) => void,
  gameEditorMode: 'embedded-game' | 'instances-editor',
  continueProcessingFunctionCallsOnMount?: boolean,
  onOpenAskAi: (?OpenAskAiOptions) => void,
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
      mode: 'chat' | 'agent',
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

      const {
        aiRequestStorage: { fetchAiRequests, aiRequests },
      } = React.useContext(AiRequestContext);
      const {
        selectedAiRequest,
        selectedAiRequestId,
        selectedAiRequestMode,
        setAiState,
      } = useAiRequestState({ project });
      const upToDateSelectedAiRequestId = useStableUpToDateRef(
        selectedAiRequestId
      );

      const [
        newAiRequestOptions,
        startNewAiRequest,
      ] = React.useState<NewAiRequestOptions | null>(null);

      const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);
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
              const storageProviderName = storageProvider
                ? storageProvider.internalName
                : null;

              setSendingAiRequest(null, true);

              const preparedAiUserContent = await prepareAiUserContent({
                getAuthorizationHeader,
                userId: profile.id,
                simplifiedProjectJson,
                projectSpecificExtensionsSummaryJson,
              });

              const aiRequest = await createAiRequest(getAuthorizationHeader, {
                userRequest: userRequest,
                userId: profile.id,
                ...preparedAiUserContent,
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
              updateAiRequest(aiRequest.id, aiRequest);

              // Select the new AI request just created - unless the user switched to another one
              // in the meantime.
              if (!upToDateSelectedAiRequestId.current) {
                setAiState({
                  aiRequestId: aiRequest.id,
                  mode: selectedAiRequestMode,
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
          selectedAiRequestMode,
          setAiState,
          setSendingAiRequest,
          upToDateSelectedAiRequestId,
          updateAiRequest,
          newAiRequestOptions,
          automaticallyUseCreditsForAiRequests,
        ]
      );

      // Send the results of the function call outputs, if any, and the user message (if any).
      const onSendMessage = React.useCallback(
        async ({
          userMessage,
          createdSceneNames,
          createdProject,
          editorFunctionCallResults,
        }: {|
          userMessage: string,
          createdSceneNames?: Array<string>,
          createdProject?: ?gdProject,
          editorFunctionCallResults: Array<EditorFunctionCallResult>,
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
            });

            // If we're updating the request, following a function call to initialize the project,
            // pause the request, so that suggestions can be given by the agent.
            const paused =
              functionCallOutputs.length > 0 &&
              functionCallOutputs.some(
                output => output.call_id.indexOf('initialize_project') !== -1
              );

            const aiRequest: AiRequest = await retryIfFailed({ times: 2 }, () =>
              addMessageToAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: selectedAiRequestId,
                functionCallOutputs,
                ...preparedAiUserContent,
                gameId: upToDateProject
                  ? upToDateProject.getProjectUuid()
                  : undefined,
                payWithCredits,
                userMessage,
                paused,
              })
            );
            updateAiRequest(aiRequest.id, aiRequest);
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
                mode: aiRequest.mode || 'chat',
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
              mode: selectedAiRequestMode,
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
            mode: 'chat' | 'agent',
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
          // Keep mode, but reset aiRequestId to start a new chat.
          onStartOrOpenChat({
            mode: selectedAiRequestMode,
            aiRequestId: null,
          });
        },
        [onStartOrOpenChat, selectedAiRequestMode]
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

      return (
        <>
          <Paper square background="dark" style={styles.paper}>
            <div style={styles.chatContainer}>
              <AiRequestChat
                aiConfigurationPresetsWithAvailability={getAiConfigurationPresetsWithAvailability(
                  { limits, getAiSettings }
                )}
                project={project}
                ref={aiRequestChatRef}
                aiRequest={selectedAiRequest}
                aiRequestMode={selectedAiRequestMode}
                onStartNewAiRequest={startNewAiRequest}
                onSendUserMessage={(userMessage: string) =>
                  onSendMessage({
                    userMessage,
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
              updateAiRequest(aiRequest.id, aiRequest);
              setAiState({
                aiRequestId: aiRequest.id,
                mode: aiRequest.mode || selectedAiRequestMode,
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
      />
    )}
  </I18n>
);
