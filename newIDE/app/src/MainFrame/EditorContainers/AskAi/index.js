// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { I18n } from '@lingui/react';
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
  createAiEventGeneration,
  getAiGeneratedEvent,
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
import { ExtensionStoreContext } from '../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { installExtension } from '../../../AssetStore/ExtensionStore/InstallExtension';
import EventsFunctionsExtensionsContext from '../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { useTriggerAtNextRender } from '../../../Utils/useTriggerAtNextRender';

const useEditorFunctionCallResultsPerRequest = () => {
  const [
    editorFunctionCallResultsPerRequest,
    setEditorFunctionCallResultsPerRequest,
  ] = React.useState<{
    [aiRequestId: string]: Array<EditorFunctionCallResult>,
  }>({});

  return {
    getEditorFunctionCallResults: React.useCallback(
      (aiRequestId: string): Array<EditorFunctionCallResult> | null =>
        editorFunctionCallResultsPerRequest[aiRequestId] || null,
      [editorFunctionCallResultsPerRequest]
    ),
    addEditorFunctionCallResults: React.useCallback(
      (
        aiRequestId: string,
        editorFunctionCallResults: EditorFunctionCallResult[]
      ) => {
        setEditorFunctionCallResultsPerRequest(
          editorFunctionCallResultsPerRequest => {
            const existingEditorFunctionCallResults = (
              editorFunctionCallResultsPerRequest[aiRequestId] || []
            ).filter(existingEditorFunctionCallResult => {
              return !editorFunctionCallResults.some(
                editorFunctionCallResult => {
                  return (
                    editorFunctionCallResult.call_id ===
                    existingEditorFunctionCallResult.call_id
                  );
                }
              );
            });

            return {
              ...editorFunctionCallResultsPerRequest,
              [aiRequestId]: [
                ...existingEditorFunctionCallResults,
                ...editorFunctionCallResults,
              ],
            };
          }
        );
      },
      []
    ),
    clearEditorFunctionCallResults: React.useCallback((aiRequestId: string) => {
      setEditorFunctionCallResultsPerRequest(
        editorFunctionCallResultsPerRequest => ({
          ...editorFunctionCallResultsPerRequest,
          [aiRequestId]: null,
        })
      );
    }, []),
  };
};

const useProcessFunctionCalls = ({
  i18n,
  project,
  selectedAiRequest,
  onSendEditorFunctionCallResults,
  getEditorFunctionCallResults,
  addEditorFunctionCallResults,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  selectedAiRequest: ?AiRequest,
  onSendEditorFunctionCallResults: () => Promise<void>,
  getEditorFunctionCallResults: string => Array<EditorFunctionCallResult> | null,
  addEditorFunctionCallResults: (
    string,
    Array<EditorFunctionCallResult>
  ) => void,
|}) => {
  const { ensureExtensionInstalled } = useEnsureExtensionInstalled({
    project,
    i18n,
  });
  const { launchEventsGeneration } = useGenerateEvents({ project });

  const triggerSendEditorFunctionCallResults = useTriggerAtNextRender(
    onSendEditorFunctionCallResults
  );

  const [
    aiRequestAutoProcessState,
    setAiRequestAutoprocessState,
  ] = React.useState<{
    [string]: boolean,
  }>({});
  const isAutoProcessingFunctionCalls = React.useCallback(
    (aiRequestId: string) => !!aiRequestAutoProcessState[aiRequestId],
    [aiRequestAutoProcessState]
  );

  const setAutoProcessFunctionCalls = React.useCallback(
    (aiRequestId: string, shouldAutoProcess: boolean) => {
      setAiRequestAutoprocessState(aiRequestAutoProcessState => ({
        ...aiRequestAutoProcessState,
        [aiRequestId]: shouldAutoProcess,
      }));
    },
    [setAiRequestAutoprocessState]
  );

  const onProcessFunctionCalls = React.useCallback(
    async (
      functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
      options: ?{|
        ignore?: boolean,
      |}
    ) => {
      if (!project || !selectedAiRequest) return;

      addEditorFunctionCallResults(
        selectedAiRequest.id,
        functionCalls.map(functionCall => ({
          status: 'working',
          call_id: functionCall.call_id,
        }))
      );

      const editorFunctionCallResults = await processEditorFunctionCalls({
        project,
        functionCalls: functionCalls.map(functionCall => ({
          name: functionCall.name,
          arguments: functionCall.arguments,
          call_id: functionCall.call_id,
        })),
        ignore: !!options && !!options.ignore,
        launchEventsGeneration: async options => {
          return await launchEventsGeneration({
            ...options,
            relatedAiRequestId: selectedAiRequest.id,
          });
        },
        onEnsureExtensionInstalled: async ({ extensionName }) => {
          await ensureExtensionInstalled(extensionName);
        },
      });

      addEditorFunctionCallResults(
        selectedAiRequest.id,
        editorFunctionCallResults
      );

      // We may have processed everything, so try to send the results
      // to the backend.
      triggerSendEditorFunctionCallResults();
    },
    [
      project,
      selectedAiRequest,
      addEditorFunctionCallResults,
      ensureExtensionInstalled,
      launchEventsGeneration,
      triggerSendEditorFunctionCallResults,
    ]
  );

  const allFunctionCallsToProcess = React.useMemo(
    () =>
      selectedAiRequest
        ? getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            editorFunctionCallResults:
              getEditorFunctionCallResults(selectedAiRequest.id) || [],
          })
        : [],
    [selectedAiRequest, getEditorFunctionCallResults]
  );

  React.useEffect(
    () => {
      (async () => {
        if (isAutoProcessingFunctionCalls) {
          if (allFunctionCallsToProcess.length === 0) {
            return;
          }
          console.info('Automatically processing AI function calls...');
          await onProcessFunctionCalls(allFunctionCallsToProcess);
        }
      })();
    },
    [
      isAutoProcessingFunctionCalls,
      onProcessFunctionCalls,
      allFunctionCallsToProcess,
    ]
  );

  return {
    isAutoProcessingFunctionCalls,
    setAutoProcessFunctionCalls,
    onProcessFunctionCalls,
  };
};

export const useGenerateEvents = ({ project }: {| project: ?gdProject |}) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const launchEventsGeneration = React.useCallback(
    async ({
      sceneName,
      eventsDescription,
      extensionNamesList,
      objectsList,
      relatedAiRequestId,
    }: {|
      sceneName: string,
      eventsDescription: string,
      extensionNamesList: string,
      objectsList: string,
      relatedAiRequestId: string,
    |}) => {
      if (!project) throw new Error('No project is opened.');
      if (!profile) throw new Error('Use should be authenticated.');

      let aiGeneratedEvent = await retryIfFailed({ times: 2 }, () =>
        createAiEventGeneration(getAuthorizationHeader, {
          userId: profile.id,
          partialGameProjectJson: JSON.stringify(
            getSimplifiedProjectJson(project, {
              scopeToScene: sceneName,
            }),
            null,
            2
          ),
          eventsDescription: eventsDescription,
          extensionNamesList: extensionNamesList,
          objectsList: objectsList,
          relatedAiRequestId,
        })
      );

      while (aiGeneratedEvent.status === 'working') {
        await delay(1000);
        aiGeneratedEvent = await getAiGeneratedEvent(getAuthorizationHeader, {
          userId: profile.id,
          aiGeneratedEventId: aiGeneratedEvent.id,
        });
      }

      return aiGeneratedEvent;
    },
    [getAuthorizationHeader, project, profile]
  );

  return { launchEventsGeneration };
};

export const useEnsureExtensionInstalled = ({
  project,
  i18n,
}: {|
  project: ?gdProject,
  i18n: I18nType,
|}) => {
  const { translatedExtensionShortHeadersByName } = React.useContext(
    ExtensionStoreContext
  );
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );

  return {
    ensureExtensionInstalled: React.useCallback(
      async (extensionName: string) => {
        if (!project) return;
        if (project.getCurrentPlatform().isExtensionLoaded(extensionName))
          return;

        const extensionShortHeader =
          translatedExtensionShortHeadersByName[extensionName];
        if (!extensionShortHeader) {
          throw new Error("Can't find extension with the required name.");
        }

        await installExtension(
          i18n,
          project,
          eventsFunctionsExtensionsState,
          extensionShortHeader
        );
      },
      [
        eventsFunctionsExtensionsState,
        i18n,
        project,
        translatedExtensionShortHeadersByName,
      ]
    ),
  };
};

type AiRequestSendState = {|
  isSending: boolean,
  lastSendError: ?Error,
|};

export const useAiRequests = () => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const [aiRequests, setAiRequests] = React.useState<{ [string]: AiRequest }>(
    {}
  );
  const [selectedAiRequestId, setSelectedAiRequestId] = React.useState<
    string | null
  >(null);

  const updateAiRequest = React.useCallback(
    (aiRequestId: string, aiRequest: AiRequest) => {
      setAiRequests(aiRequests => ({
        ...aiRequests,
        [aiRequestId]: aiRequest,
      }));
    },
    []
  );

  const refreshAiRequest = React.useCallback(
    async (aiRequestId: string) => {
      if (!profile) return;

      try {
        const updatedAiRequest = await getAiRequest(getAuthorizationHeader, {
          userId: profile.id,
          aiRequestId: aiRequestId,
        });
        updateAiRequest(updatedAiRequest.id, updatedAiRequest);
      } catch (error) {
        console.error(
          'Error while background refreshing AI request - ignoring:',
          error
        );
      }
    },
    [getAuthorizationHeader, profile, updateAiRequest]
  );

  const selectedAiRequest =
    (selectedAiRequestId && aiRequests[selectedAiRequestId]) || null;

  // If the selected AI request is in a "working" state, watch it until it's finished.
  const status = selectedAiRequest ? selectedAiRequest.status : null;
  React.useEffect(
    () => {
      if (!profile) return;
      if (!selectedAiRequestId || !status) return;

      let stopWatching = false;

      const watch = async () => {
        while (true) {
          await delay(1000);
          if (stopWatching) return;

          const aiRequest = await getAiRequest(getAuthorizationHeader, {
            userId: profile.id,
            aiRequestId: selectedAiRequestId,
          });
          if (stopWatching) return;

          updateAiRequest(selectedAiRequestId, aiRequest);
        }
      };

      if (status === 'working') {
        console.info(`Started watching AI request ${selectedAiRequestId}.`);
        watch();
      }

      return () => {
        if (status === 'working') {
          console.info(`Stopped watching AI request ${selectedAiRequestId}.`);
        }
        stopWatching = true;
      };
    },
    [
      selectedAiRequestId,
      status,
      profile,
      getAuthorizationHeader,
      updateAiRequest,
    ]
  );

  const [aiRequestSendStates, setAiRequestSendStates] = React.useState<{
    [string]: AiRequestSendState,
  }>({});
  const isSendingAiRequest = React.useCallback(
    (aiRequestId: string | null) =>
      !!aiRequestSendStates[aiRequestId || ''] &&
      aiRequestSendStates[aiRequestId || ''].isSending,
    [aiRequestSendStates]
  );
  const getLastSendError = React.useCallback(
    (aiRequestId: string | null) =>
      (aiRequestSendStates[aiRequestId || ''] &&
        aiRequestSendStates[aiRequestId || ''].lastSendError) ||
      null,
    [aiRequestSendStates]
  );
  const setSendingAiRequest = React.useCallback(
    (aiRequestId: string | null, isSending: boolean) => {
      const aiRequestIdToSet: string = aiRequestId || '';
      setAiRequestSendStates(aiRequestSendStates => ({
        ...aiRequestSendStates,
        [aiRequestIdToSet]: {
          isSending,
          lastSendError: null,
        },
      }));
    },
    [setAiRequestSendStates]
  );
  const setLastSendError = React.useCallback(
    (aiRequestId: string | null, lastSendError: ?Error) => {
      const aiRequestIdToSet: string = aiRequestId || '';
      setAiRequestSendStates(aiRequestSendStates => ({
        ...aiRequestSendStates,
        [aiRequestIdToSet]: {
          isSending: false,
          lastSendError,
        },
      }));
    },
    [setAiRequestSendStates]
  );

  return {
    selectedAiRequest,
    selectedAiRequestId,
    setSelectedAiRequestId,
    updateAiRequest,
    refreshAiRequest,
    isSendingAiRequest,
    setSendingAiRequest,
    setLastSendError,
    getLastSendError,
  };
};

type Props = {|
  isActive: boolean,
  project: ?gdProject,
  setToolbar: (?React.Node) => void,
  i18n: I18nType,
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
    ({ isActive, setToolbar, project, i18n }: Props, ref) => {
      const {
        selectedAiRequest,
        selectedAiRequestId,
        setSelectedAiRequestId,
        updateAiRequest,
        refreshAiRequest,
        setSendingAiRequest,
        isSendingAiRequest,
        getLastSendError,
        setLastSendError,
      } = useAiRequests();
      const upToDateSelectedAiRequestId = useStableUpToDateRef(
        selectedAiRequestId
      );

      const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false);

      const canStartNewChat = !!selectedAiRequestId;
      const onStartNewChat = React.useCallback(
        () => {
          setSelectedAiRequestId(null);
        },
        [setSelectedAiRequestId]
      );

      const onOpenHistory = React.useCallback(() => {
        setIsHistoryOpen(true);
      }, []);

      const onCloseHistory = React.useCallback(() => {
        setIsHistoryOpen(false);
      }, []);

      const {
        getEditorFunctionCallResults,
        addEditorFunctionCallResults,
        clearEditorFunctionCallResults,
      } = useEditorFunctionCallResultsPerRequest();

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
            ? JSON.stringify(getSimplifiedProjectJson(project, {}))
            : null;

          try {
            setSendingAiRequest(selectedAiRequestId, true);

            if (selectedAiRequestId) {
              // User request on an existing AI request.
              const aiRequest = await addUserMessageToAiRequest(
                getAuthorizationHeader,
                {
                  aiRequestId: selectedAiRequestId,
                  userId: profile.id,
                  userRequest: userRequestText,
                  simplifiedProjectJson,
                  payWithCredits,
                }
              );
              updateAiRequest(aiRequest.id, aiRequest);
            } else {
              // New AI request:
              const aiRequest = await createAiRequest(getAuthorizationHeader, {
                userRequest: userRequestText,
                userId: profile.id,
                simplifiedProjectJson,
                payWithCredits,
              });
              updateAiRequest(aiRequest.id, aiRequest);

              // Select the new AI request just created - unless the user switched to another one
              // in the meantime.
              if (!upToDateSelectedAiRequestId.current) {
                setSelectedAiRequestId(aiRequest.id);
              }
            }

            setSendingAiRequest(selectedAiRequestId, false);
            if (aiRequestChatRef.current)
              aiRequestChatRef.current.resetUserInput(selectedAiRequestId);
          } catch (error) {
            setLastSendError(selectedAiRequestId, error);
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
          aiRequestPriceInCredits,
          availableCredits,
          getAuthorizationHeader,
          onOpenCreateAccountDialog,
          onRefreshLimits,
          openCreditsPackageDialog,
          profile,
          project,
          quota,
          selectedAiRequestId,
          setLastSendError,
          setSelectedAiRequestId,
          setSendingAiRequest,
          upToDateSelectedAiRequestId,
          updateAiRequest,
        ]
      );

      const onSendEditorFunctionCallResults = React.useCallback(
        async () => {
          if (
            !profile ||
            !selectedAiRequestId ||
            isSendingAiRequest(selectedAiRequestId)
          )
            return;

          // Read the results from the editor that applied the function calls.
          const editorFunctionCallResults = getEditorFunctionCallResults(
            selectedAiRequestId
          );
          if (!editorFunctionCallResults) return;

          // Transform them into the output that will be stored on the AI request.
          let hasUnfinishedResult = false;
          const functionCallOutputs = editorFunctionCallResults
            .map(functionCallOutput => {
              if (functionCallOutput.status === 'finished') {
                return {
                  type: 'function_call_output',
                  call_id: functionCallOutput.call_id,
                  output: JSON.stringify({
                    success: functionCallOutput.success,
                    ...functionCallOutput.output,
                  }),
                };
              } else if (functionCallOutput.status === 'ignored') {
                return {
                  type: 'function_call_output',
                  call_id: functionCallOutput.call_id,
                  output: JSON.stringify({
                    ignored: true,
                    message: 'This was marked as ignored by the user.',
                  }),
                };
              }

              hasUnfinishedResult = true;
              return null;
            })
            .filter(Boolean);

          // If anything is not finished yet, stop there (we only send all
          // results at once).
          if (hasUnfinishedResult || editorFunctionCallResults.length === 0)
            return;

          try {
            console.info(
              'Sending editor function call results:',
              editorFunctionCallResults
            );
            setSendingAiRequest(selectedAiRequestId, true);

            const aiRequest = await retryIfFailed({ times: 2 }, () =>
              addFunctionCallOutputsToAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: selectedAiRequestId,
                functionCallOutputs,
              })
            );
            updateAiRequest(aiRequest.id, aiRequest);
            setSendingAiRequest(aiRequest.id, false);
            clearEditorFunctionCallResults(aiRequest.id);
          } catch (error) {
            // TODO: add button to send again.
            setLastSendError(selectedAiRequestId, error);
          }
        },
        [
          profile,
          selectedAiRequestId,
          isSendingAiRequest,
          getEditorFunctionCallResults,
          setSendingAiRequest,
          updateAiRequest,
          clearEditorFunctionCallResults,
          getAuthorizationHeader,
          setLastSendError,
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

      const {
        isAutoProcessingFunctionCalls,
        setAutoProcessFunctionCalls,
        onProcessFunctionCalls,
      } = useProcessFunctionCalls({
        project,
        selectedAiRequest,
        onSendEditorFunctionCallResults,
        getEditorFunctionCallResults,
        addEditorFunctionCallResults,
        i18n,
      });

      return (
        <>
          <Paper square background="dark" style={styles.paper}>
            <div style={styles.chatContainer}>
              <AiRequestChat
                ref={aiRequestChatRef}
                aiRequest={selectedAiRequest}
                onSendUserRequest={sendUserRequest}
                isLaunchingAiRequest={isSendingAiRequest(selectedAiRequestId)}
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
                aiRequestPriceInCredits={aiRequestPriceInCredits}
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
              />
            </div>
          </Paper>
          <AskAiHistory
            open={isHistoryOpen}
            onClose={onCloseHistory}
            onSelectAiRequest={aiRequest => {
              // Immediately switch the UI and refresh in the background.
              updateAiRequest(aiRequest.id, aiRequest);
              setSelectedAiRequestId(aiRequest.id);
              refreshAiRequest(aiRequest.id);
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

export const renderAskAiContainer = (
  props: RenderEditorContainerPropsWithRef
) => (
  <I18n>
    {({ i18n }) => (
      <AskAi
        ref={props.ref}
        project={props.project}
        setToolbar={props.setToolbar}
        isActive={props.isActive}
        i18n={i18n}
      />
    )}
  </I18n>
);
