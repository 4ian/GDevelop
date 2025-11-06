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
  type AiRequest,
  type AiRequestMessageAssistantFunctionCall,
} from '../Utils/GDevelopServices/Generation';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  processEditorFunctionCalls,
  type EditorFunctionCallResult,
} from '../EditorFunctions/EditorFunctionCallRunner';
import { type EditorCallbacks } from '../EditorFunctions';
import { getFunctionCallsToProcess } from './AiRequestUtils';
import { useTriggerAtNextRender } from '../Utils/useTriggerAtNextRender';
import { useEnsureExtensionInstalled } from './UseEnsureExtensionInstalled';
import { useGenerateEvents } from './UseGenerateEvents';
import { useSearchAndInstallAsset } from './UseSearchAndInstallAsset';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AiRequestContext } from './AiRequestContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { useInterval } from '../Utils/UseInterval';

export const AI_AGENT_TOOLS_VERSION = 'v7';
export const AI_CHAT_TOOLS_VERSION = 'v7';

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
  onExtensionInstalled,
  isReadyToProcessFunctionCalls,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  editorCallbacks: EditorCallbacks,
  selectedAiRequest: ?AiRequest,
  onSendEditorFunctionCallResults: (
    options: null | {| createdSceneNames: Array<string> |}
  ) => Promise<void>,
  getEditorFunctionCallResults: string => Array<EditorFunctionCallResult> | null,
  addEditorFunctionCallResults: (
    string,
    Array<EditorFunctionCallResult>
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
    onExtensionInstalled,
  });
  const { generateEvents } = useGenerateEvents({ project });

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

      const { results, createdSceneNames } = await processEditorFunctionCalls({
        project,
        editorCallbacks,
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
        searchAndInstallAsset,
      });

      addEditorFunctionCallResults(selectedAiRequest.id, results);

      // We may have processed everything, so try to send the results
      // to the backend.
      triggerSendEditorFunctionCallResults({
        createdSceneNames,
      });
    },
    [
      project,
      selectedAiRequest,
      addEditorFunctionCallResults,
      ensureExtensionInstalled,
      searchAndInstallAsset,
      generateEvents,
      onSceneEventsModifiedOutsideEditor,
      onInstancesModifiedOutsideEditor,
      onObjectsModifiedOutsideEditor,
      onObjectGroupsModifiedOutsideEditor,
      triggerSendEditorFunctionCallResults,
      editorCallbacks,
      isReadyToProcessFunctionCalls,
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

export const useAiRequestState = () => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { aiRequestStorage } = React.useContext(AiRequestContext);
  const { aiRequests, updateAiRequest } = aiRequestStorage;

  const { values, setAiState } = React.useContext(PreferencesContext);
  const selectedAiRequestId = values.aiState.aiRequestId;
  const selectedAiRequestMode = values.aiState.mode;

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

    const aiRequest = await getAiRequest(getAuthorizationHeader, {
      userId: profile.id,
      aiRequestId: selectedAiRequestId,
    });

    updateAiRequest(selectedAiRequestId, aiRequest);
  };

  useInterval(
    () => {
      onWatch();
    },
    shouldWatchRequest ? 1000 : null
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
          mode: selectedAiRequestMode,
        });
      }
    },
    [profile, setAiState, selectedAiRequestMode]
  );

  React.useEffect(
    () => {
      // Reset selected request if the request cannot be found.
      // This can happen if it's saved in the state, but not loaded yet,
      // so it's best to reset it and avoid a flickering effect.
      if (selectedAiRequestId && !selectedAiRequest) {
        setAiState({
          aiRequestId: null,
          mode: selectedAiRequestMode,
        });
      }
    },
    [selectedAiRequestId, selectedAiRequestMode, selectedAiRequest, setAiState]
  );

  return {
    selectedAiRequest,
    selectedAiRequestId,
    selectedAiRequestMode,
    setAiState,
  };
};

// If any of those props is undefined, the previous value is kept.
export type OpenAskAiOptions = {|
  mode?: 'chat' | 'agent',
  aiRequestId?: string | null, // If null, a new request will be created.
  paneIdentifier?: 'left' | 'center' | 'right',
  continueProcessingFunctionCallsOnMount?: boolean,
|};

export type NewAiRequestOptions = {|
  mode: 'chat' | 'agent',
  userRequest: string,
  aiConfigurationPresetId: string,
|};
