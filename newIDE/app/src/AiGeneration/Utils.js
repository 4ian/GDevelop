// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from '../MainFrame/EditorContainers/BaseEditor';
import {
  getAiRequest,
  getPartialAiRequest,
  getAiRequestSuggestions,
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../Utils/GDevelopServices/Generation';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  processEditorFunctionCalls,
  type EditorFunctionCallResult,
} from '../EditorFunctions/EditorFunctionCallRunner';
import { type EditorCallbacks } from '../EditorFunctions';
import {
  getFunctionCallNameByCallId,
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
} from './AiRequestUtils';
import { useEnsureExtensionInstalled } from './UseEnsureExtensionInstalled';
import { useGenerateEvents } from './UseGenerateEvents';
import { useSearchAndInstallAsset } from './UseSearchAndInstallAsset';
import { useSearchAndInstallResource } from './UseSearchAndInstallResource';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AiRequestContext } from './AiRequestContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useInterval } from '../Utils/UseInterval';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import { prepareAiUserContent } from './PrepareAiUserContent';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import { retryIfFailed } from '../Utils/RetryIfFailed';

const gd: libGDevelop = global.gd;

export const AI_AGENT_TOOLS_VERSION = 'v8';
export const AI_CHAT_TOOLS_VERSION = 'v8';

export const useProcessFunctionCalls = ({
  i18n,
  project,
  resourceManagementProps,
  editorCallbacks,
  selectedAiRequest,
  onSendEditorFunctionCallResults,
  getEditorFunctionCallResults,
  addEditorFunctionCallResults,
  onSceneEventsModifiedOutsideEditor,
  onInstancesModifiedOutsideEditor,
  onObjectsModifiedOutsideEditor,
  onObjectGroupsModifiedOutsideEditor,
  onWillInstallExtension,
  onExtensionInstalled,
  isReadyToProcessFunctionCalls,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  editorCallbacks: EditorCallbacks,
  selectedAiRequest: ?AiRequest,
  onSendEditorFunctionCallResults: (
    editorFunctionCallResults: Array<EditorFunctionCallResult>,
    options: {|
      createdSceneNames?: Array<string>,
      createdProject?: ?gdProject,
    |}
  ) => Promise<void>,
  getEditorFunctionCallResults: string => Array<EditorFunctionCallResult> | null,
  addEditorFunctionCallResults: (
    string,
    Array<EditorFunctionCallResult>
  ) => Array<EditorFunctionCallResult>,
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
  isReadyToProcessFunctionCalls: boolean,
|}) => {
  const { ensureExtensionInstalled } = useEnsureExtensionInstalled({
    project,
    i18n,
  });
  const { searchAndInstallAsset } = useSearchAndInstallAsset({
    project,
    resourceManagementProps,
    onWillInstallExtension,
    onExtensionInstalled,
  });
  const {
    searchAndInstallMissingResources,
  } = useSearchAndInstallResource({
    project,
    resourceManagementProps,
  });
  const { generateEvents } = useGenerateEvents({ project });

  const [
    aiRequestAutoProcessState,
    setAiRequestAutoprocessState,
  ] = React.useState<{
    [string]: boolean,
  }>({});
  const isAutoProcessingFunctionCalls = React.useCallback(
    (aiRequestId: string) =>
      aiRequestAutoProcessState[aiRequestId] !== undefined
        ? aiRequestAutoProcessState[aiRequestId]
        : true,
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
      if (!selectedAiRequest || !isReadyToProcessFunctionCalls) return;

      addEditorFunctionCallResults(
        selectedAiRequest.id,
        functionCalls.map(functionCall => ({
          status: 'working',
          call_id: functionCall.call_id,
        }))
      );

      const {
        results,
        createdSceneNames,
        createdProject,
      } = await processEditorFunctionCalls({
        project,
        editorCallbacks,
        toolOptions: selectedAiRequest.toolOptions || null,
        i18n,
        functionCalls: functionCalls.map(functionCall => ({
          name: functionCall.name,
          arguments: functionCall.arguments,
          call_id: functionCall.call_id,
        })),
        ignore: !!options && !!options.ignore,
        generateEvents: async options => {
          return await generateEvents({
            ...options,
            relatedAiRequestId: selectedAiRequest.id,
          });
        },
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        ensureExtensionInstalled,
        onWillInstallExtension,
        onExtensionInstalled,
        searchAndInstallAsset,
        searchAndInstallMissingResources,
      });

      const newResults = addEditorFunctionCallResults(
        selectedAiRequest.id,
        results
      );

      // We may have processed everything, so try to send the results
      // to the backend.
      await onSendEditorFunctionCallResults(newResults, {
        createdSceneNames,
        createdProject,
      });
    },
    [
      i18n,
      selectedAiRequest,
      isReadyToProcessFunctionCalls,
      addEditorFunctionCallResults,
      project,
      editorCallbacks,
      onSceneEventsModifiedOutsideEditor,
      onInstancesModifiedOutsideEditor,
      onObjectsModifiedOutsideEditor,
      onObjectGroupsModifiedOutsideEditor,
      ensureExtensionInstalled,
      onWillInstallExtension,
      onExtensionInstalled,
      searchAndInstallAsset,
      searchAndInstallMissingResources,
      generateEvents,
      onSendEditorFunctionCallResults,
    ]
  );

  const allFunctionCallsToProcess = React.useMemo(
    () =>
      selectedAiRequest
        ? getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            editorFunctionCallResults: getEditorFunctionCallResults(
              selectedAiRequest.id
            ),
          })
        : [],
    [selectedAiRequest, getEditorFunctionCallResults]
  );

  React.useEffect(
    () => {
      (async () => {
        if (!selectedAiRequest) return;

        if (isAutoProcessingFunctionCalls(selectedAiRequest.id)) {
          if (allFunctionCallsToProcess.length === 0) {
            return;
          }
          console.info('Automatically processing AI function calls...');
          await onProcessFunctionCalls(allFunctionCallsToProcess);
        }
      })();
    },
    [
      selectedAiRequest,
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

export const useAiRequestState = ({ project }: {| project: ?gdProject |}) => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
  } = React.useContext(AiRequestContext);
  const { aiRequests, updateAiRequest, isSendingAiRequest } = aiRequestStorage;
  const { getEditorFunctionCallResults } = editorFunctionCallResultsStorage;

  const { values, setAiState } = React.useContext(PreferencesContext);
  const selectedAiRequestId = values.aiState.aiRequestId;

  const selectedAiRequest =
    (selectedAiRequestId && aiRequests[selectedAiRequestId]) || null;

  const [shouldWatchRequest, setShouldWatchRequest] = React.useState<boolean>(
    false
  );

  // If the selected AI request is in a "working" state, watch it until it's finished.
  const status = selectedAiRequest ? selectedAiRequest.status : null;
  const onWatch = async () => {
    if (!profile) return;
    if (!selectedAiRequestId || !status || status !== 'working') return;

    try {
      // Use partial request to only fetch the status
      const partialAiRequest = await getPartialAiRequest(
        getAuthorizationHeader,
        {
          userId: profile.id,
          aiRequestId: selectedAiRequestId,
          include: 'status',
        }
      );

      if (partialAiRequest.status === 'working') {
        updateAiRequest(selectedAiRequestId, {
          ...aiRequests[selectedAiRequestId],
          ...partialAiRequest,
        });
      } else {
        // The request is not "working" anymore, refresh it entirely.
        // Note: if this fails, the request will be refreshed again on the next interval
        // (because no call to updateAiRequest is made).
        const aiRequest = await retryIfFailed({ times: 2 }, () =>
          getAiRequest(getAuthorizationHeader, {
            userId: profile.id,
            aiRequestId: selectedAiRequestId,
          })
        );

        updateAiRequest(selectedAiRequestId, aiRequest);
      }
    } catch (error) {
      console.warn(
        'Error while watching AI request. Ignoring and will retry on the next interval.',
        error
      );
    }
  };

  const watchPollingIntervalInMs =
    (selectedAiRequest &&
      selectedAiRequest.toolOptions &&
      selectedAiRequest.toolOptions.watchPollingIntervalInMs) ||
    1400;
  useInterval(
    () => {
      onWatch();
    },
    shouldWatchRequest ? watchPollingIntervalInMs : null
  );

  React.useEffect(
    () => {
      async function fetchSuggestionsIfNeeded() {
        // If the request :
        // - is an agent request,
        // - is not sending a new message right now,
        // - went from "working" to "ready",
        // - has a few messages already (not an empty request),
        // - does not have any tools waiting to run,
        // - and does not have any suggestions yet,
        // Then ask for some.
        if (
          !selectedAiRequest ||
          selectedAiRequest.mode !== 'agent' ||
          isSendingAiRequest(selectedAiRequest.id) ||
          selectedAiRequest.output.length === 0 ||
          selectedAiRequest.status !== 'ready' ||
          !profile
        )
          return;

        const hasFunctionsCallsToProcess =
          getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            editorFunctionCallResults: getEditorFunctionCallResults(
              selectedAiRequest.id
            ),
          }).length > 0;
        if (hasFunctionsCallsToProcess) return;

        const {
          hasUnfinishedResult,
        } = getFunctionCallOutputsFromEditorFunctionCallResults(
          getEditorFunctionCallResults(selectedAiRequest.id)
        );
        if (hasUnfinishedResult) return;

        const lastMessage =
          selectedAiRequest.output.length > 0
            ? selectedAiRequest.output[selectedAiRequest.output.length - 1]
            : null;
        if (
          !lastMessage ||
          (!(
            lastMessage.type === 'message' && lastMessage.role === 'assistant'
          ) &&
            lastMessage.type !== 'function_call_output') ||
          lastMessage.suggestions
        ) {
          return;
        }

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
        const preparedAiUserContent = await prepareAiUserContent({
          getAuthorizationHeader,
          userId: profile.id,
          simplifiedProjectJson,
          projectSpecificExtensionsSummaryJson,
          eventsJson: null,
        });

        const isLastMessageFunctionCallOutputProjectInitialization =
          lastMessage.type === 'function_call_output' &&
          getFunctionCallNameByCallId({
            aiRequest: selectedAiRequest,
            callId: lastMessage.call_id,
          }) === 'initialize_project';

        try {
          // The request will switch from "ready" to "working" while suggestions are generated.
          const aiRequestWithSuggestions = await getAiRequestSuggestions(
            getAuthorizationHeader,
            {
              userId: profile.id,
              aiRequestId: selectedAiRequest.id,
              suggestionsType: isLastMessageFunctionCallOutputProjectInitialization
                ? 'list-with-explanations'
                : 'simple-list',
              gameProjectJsonUserRelativeKey:
                preparedAiUserContent.gameProjectJsonUserRelativeKey,
              gameProjectJson: preparedAiUserContent.gameProjectJson,
              projectSpecificExtensionsSummaryJsonUserRelativeKey:
                preparedAiUserContent.projectSpecificExtensionsSummaryJsonUserRelativeKey,
              projectSpecificExtensionsSummaryJson:
                preparedAiUserContent.projectSpecificExtensionsSummaryJson,
            }
          );

          updateAiRequest(selectedAiRequest.id, aiRequestWithSuggestions);
        } catch (error) {
          const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
            error
          );
          if (
            extractedStatusAndCode &&
            extractedStatusAndCode.status === 400 &&
            extractedStatusAndCode.code === 'ai-request/request-still-working'
          ) {
            // Don't log anything.
            return;
          }

          console.error('Error getting AI request suggestions:', error);
          // Do not block updating the request if suggestions fetching fails.
        }
      }

      // Debounce the call to avoid too many requests in a short period
      const timeoutId = setTimeout(() => {
        fetchSuggestionsIfNeeded();
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [
      selectedAiRequest,
      profile,
      getAuthorizationHeader,
      project,
      getEditorFunctionCallResults,
      updateAiRequest,
      isSendingAiRequest,
    ]
  );

  React.useEffect(
    () => {
      if (
        selectedAiRequestId &&
        selectedAiRequest &&
        selectedAiRequest.status === 'working'
      ) {
        setShouldWatchRequest(true);
      } else {
        setShouldWatchRequest(false);
      }

      // Ensure we stop watching when the request is no longer working.
      return () => {
        setShouldWatchRequest(false);
      };
    },
    [selectedAiRequestId, selectedAiRequest]
  );

  React.useEffect(
    () => {
      // Reset selected request if user logs out.
      if (!profile) {
        setAiState({
          aiRequestId: null,
        });
      }
    },
    [profile, setAiState]
  );

  React.useEffect(
    () => {
      // Reset selected request if the request cannot be found.
      // This can happen if it's saved in the state, but not loaded yet,
      // so it's best to reset it and avoid a flickering effect.
      if (selectedAiRequestId && !selectedAiRequest) {
        setAiState({
          aiRequestId: null,
        });
      }
    },
    [selectedAiRequestId, selectedAiRequest, setAiState]
  );

  return {
    selectedAiRequest,
    selectedAiRequestId,
    setAiState,
  };
};

// If any of those props is undefined, the previous value is kept.
export type OpenAskAiOptions = {|
  aiRequestId?: string | null, // If null, a new request will be created.
  paneIdentifier?: 'left' | 'center' | 'right',
  continueProcessingFunctionCallsOnMount?: boolean,
|};

export type NewAiRequestOptions = {|
  mode: 'chat' | 'agent',
  userRequest: string,
  aiConfigurationPresetId: string,
|};
