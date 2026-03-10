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
  getAiRequestSuggestions,
  type AiRequest,
  type AiRequestMessage,
  type AiRequestMessageAssistantFunctionCall,
  updateAiRequestMessage,
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
  getLastMessagesFromAiRequestOutput,
  getLatestActivePlan,
} from './AiRequestUtils';
import { useEnsureExtensionInstalled } from './UseEnsureExtensionInstalled';
import { useGenerateEvents } from './UseGenerateEvents';
import { useSearchAndInstallAsset } from './UseSearchAndInstallAsset';
import { useSearchAndInstallResource } from './UseSearchAndInstallResource';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AiRequestContext } from './AiRequestContext';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';

import { delay } from '../Utils/Delay';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { makeSimplifiedProjectBuilder } from '../EditorFunctions/SimplifiedProject/SimplifiedProject';
import { prepareAiUserContent } from './PrepareAiUserContent';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import {
  type FileMetadata,
  type StorageProvider,
  type SaveAsLocation,
} from '../ProjectsStorage';
import CloudStorageProvider from '../ProjectsStorage/CloudStorageProvider';
import { checkIfHasTooManyCloudProjects } from '../MainFrame/EditorContainers/HomePage/CreateSection/MaxProjectCountAlertMessage';

const gd: libGDevelop = global.gd;

// How long to keep the "Calculating..." indicator visible after a refresh
// completes, to prevent it from flashing on fast calls.
const REFRESH_LIMITS_SETTLE_DELAY_MS = 200;

/**
 * Wraps `onRefreshLimits` with a loading state and a short settle delay so
 * the "Calculating..." indicator doesn't flash on fast network calls.
 */
export const useRefreshLimits = (
  onRefreshLimits: () => Promise<void>
): {|
  isRefreshingLimits: boolean,
  refreshLimits: (options?: {| withRetry?: boolean |}) => Promise<void>,
|} => {
  const [isRefreshingLimits, setIsRefreshingLimits] = React.useState(false);

  const refreshLimits = React.useCallback(
    async (options?: {| withRetry?: boolean |}) => {
      setIsRefreshingLimits(true);
      try {
        await retryIfFailed(
          { times: options && options.withRetry ? 2 : 1 },
          onRefreshLimits
        );
      } catch (error) {
        // Ignore limits refresh error.
      }
      await delay(REFRESH_LIMITS_SETTLE_DELAY_MS);
      setIsRefreshingLimits(false);
    },
    [onRefreshLimits]
  );

  return { isRefreshingLimits, refreshLimits };
};

export const AI_AGENT_TOOLS_VERSION = 'v8';
export const AI_CHAT_TOOLS_VERSION = 'v8';
export const AI_ORCHESTRATOR_TOOLS_VERSION = 'v1';

export const useProcessFunctionCalls = ({
  i18n,
  project,
  resourceManagementProps,
  editorCallbacks,
  selectedAiRequest,
  onSendEditorFunctionCallResults,
  getEditorFunctionCallResults,
  addEditorFunctionCallResults,
  resultsVersion,
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
  resultsVersion: number,
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
|}): {
  onProcessFunctionCalls: (
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>
  ) => Promise<void>,
} => {
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
  const { searchAndInstallResources } = useSearchAndInstallResource({
    project,
    resourceManagementProps,
  });
  const { generateEvents } = useGenerateEvents({ project });

  const onProcessFunctionCalls = React.useCallback(
    async (functionCalls: Array<AiRequestMessageAssistantFunctionCall>) => {
      if (!selectedAiRequest || !isReadyToProcessFunctionCalls) return;
      if (selectedAiRequest.status === 'suspended') return;

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
        // $FlowFixMe[incompatible-type]
        toolOptions: selectedAiRequest.toolOptions || null,
        i18n,
        functionCalls: functionCalls.map(functionCall => ({
          name: functionCall.name,
          arguments: functionCall.arguments,
          call_id: functionCall.call_id,
        })),
        relatedAiRequestId: selectedAiRequest.id,
        getRelatedAiRequestLastMessages: () =>
          getLastMessagesFromAiRequestOutput(selectedAiRequest.output),
        generateEvents,
        onSceneEventsModifiedOutsideEditor,
        onInstancesModifiedOutsideEditor,
        onObjectsModifiedOutsideEditor,
        onObjectGroupsModifiedOutsideEditor,
        ensureExtensionInstalled,
        onWillInstallExtension,
        onExtensionInstalled,
        searchAndInstallAsset,
        searchAndInstallResources,
      });

      // If the request was suspended while we were processing, discard the
      // results — we don't want to re-populate the cleared results or send
      // anything to a suspended request.
      if (results.some(r => r.status === 'aborted')) {
        return;
      }

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
      searchAndInstallResources,
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
    // `resultsVersion` is used instead of `getEditorFunctionCallResults`
    // (which is now stable/ref-based) to recompute when results change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAiRequest, resultsVersion]
  );

  React.useEffect(
    () => {
      (async () => {
        if (!selectedAiRequest) return;
        if (selectedAiRequest.status === 'suspended') return;
        if (allFunctionCallsToProcess.length === 0) return;
        console.info('Automatically processing AI function calls...');
        await onProcessFunctionCalls(allFunctionCallsToProcess);
      })();
    },
    [selectedAiRequest, onProcessFunctionCalls, allFunctionCallsToProcess]
  );

  // Safety net: if all function call results are finished but haven't been sent
  // (e.g. because a previous onSendMessage attempt returned early or errored),
  // retry sending them. This prevents the conversation from getting permanently
  // stuck when function call results are computed but never uploaded.
  React.useEffect(
    () => {
      if (!selectedAiRequest) return;
      if (selectedAiRequest.status === 'suspended') return;
      if (allFunctionCallsToProcess.length > 0) return;

      const editorFunctionCallResults = getEditorFunctionCallResults(
        selectedAiRequest.id
      );
      if (!editorFunctionCallResults || editorFunctionCallResults.length === 0)
        return;

      const {
        hasUnfinishedResult,
        functionCallOutputs,
      } = getFunctionCallOutputsFromEditorFunctionCallResults(
        editorFunctionCallResults
      );
      if (hasUnfinishedResult || functionCallOutputs.length === 0) return;

      // All results are finished, none are pending processing, but they
      // haven't been cleared yet (which means they were never sent).
      // Schedule a retry after a short delay to avoid racing with the
      // normal send path.
      const timeoutId = setTimeout(async () => {
        // Re-read the results to make sure they haven't been cleared
        // in the meantime (which would mean they were sent successfully).
        const currentResults = getEditorFunctionCallResults(
          selectedAiRequest.id
        );
        if (!currentResults || currentResults.length === 0) return;

        console.info(
          'Safety net: retrying send of finished function call results that were not sent.'
        );
        await onSendEditorFunctionCallResults(currentResults, {});
      }, 2000);

      return () => clearTimeout(timeoutId);
    },
    // `resultsVersion` is used instead of `getEditorFunctionCallResults`
    // (which is now stable/ref-based) to re-run when results change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedAiRequest,
      allFunctionCallsToProcess,
      resultsVersion,
      onSendEditorFunctionCallResults,
    ]
  );

  return {
    onProcessFunctionCalls,
  };
};

export const useAiRequestState = ({
  project,
  fileMetadata,
  storageProviderName,
  onSave,
  onSaveProjectAsWithStorageProvider,
}: {|
  project: ?gdProject,
  fileMetadata?: ?FileMetadata,
  storageProviderName?: ?string,
  onSave?: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  onSaveProjectAsWithStorageProvider?: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
|}): {
  isFetchingSuggestions: boolean,
  savingProjectForMessageId: ?string,
  selectedAiRequest: any,
  selectedAiRequestId: any,
  setAiState: any,
} => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
    isFetchingSuggestions,
    setIsFetchingSuggestions,
  } = React.useContext(AiRequestContext);
  const { aiRequests, updateAiRequest, isSendingAiRequest } = aiRequestStorage;
  const { getEditorFunctionCallResults } = editorFunctionCallResultsStorage;

  const { values, setAiState } = React.useContext(PreferencesContext);
  const selectedAiRequestId = values.aiState.aiRequestId;

  const selectedAiRequest =
    (selectedAiRequestId && aiRequests[selectedAiRequestId]) || null;
  const [
    savingProjectForMessageId,
    setSavingProjectForMessageId,
  ] = React.useState<?string>(null);

  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const isCloudProjectsMaximumReached = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );
  const isSavingRef = React.useRef<boolean>(false);

  const currentlyOpenedCloudProjectVersionId =
    fileMetadata && storageProviderName === CloudStorageProvider.internalName
      ? fileMetadata.version
      : null;

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
          (selectedAiRequest.mode !== 'agent' &&
            selectedAiRequest.mode !== 'orchestrator') ||
          isSendingAiRequest(selectedAiRequest.id) ||
          selectedAiRequest.output.length === 0 ||
          selectedAiRequest.status !== 'ready' ||
          !profile ||
          isFetchingSuggestions
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

        const isLastMessageFunctionCallOutputProjectInitialization =
          lastMessage.type === 'function_call_output' &&
          getFunctionCallNameByCallId({
            aiRequest: selectedAiRequest,
            callId: lastMessage.call_id,
          }) === 'initialize_project';

        if (selectedAiRequest.mode === 'orchestrator') {
          if (isLastMessageFunctionCallOutputProjectInitialization) {
            // Don't fetch suggestions right after project initialization, as a plan
            // will be generated in the next messages and we want to display it instead.
            return;
          }
          if (getLatestActivePlan(selectedAiRequest)) {
            // For orchestrator mode, don't fetch suggestions if there is an active plan
            // being displayed.
            return;
          }
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

        try {
          // The request will switch from "ready" to "working" while suggestions are generated.
          // It will be watched and eventually return to "ready" with suggestions.
          setIsFetchingSuggestions(true);
          const aiRequestWorkingForSuggestions = await getAiRequestSuggestions(
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

          // Merge with the latest state to preserve any concurrent updates (e.g., projectVersionId)
          updateAiRequest(selectedAiRequest.id, prevRequest => ({
            ...(prevRequest || {}),
            ...aiRequestWorkingForSuggestions,
          }));

          // If the request is already ready with suggestions, clear the flag immediately
          // Otherwise, it will be watched and cleared when it becomes ready
          if (aiRequestWorkingForSuggestions.status === 'ready') {
            setIsFetchingSuggestions(false);
          }
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

          setIsFetchingSuggestions(false);
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
      isFetchingSuggestions,
      setIsFetchingSuggestions,
    ]
  );

  React.useEffect(
    () => {
      async function updateAiRequestWithProjectVersion({
        lastMessageId,
        version,
        shouldSaveVersionBeforeMessage,
        shouldSaveVersionAfterMessage,
      }: {|
        lastMessageId: string,
        version: string,
        shouldSaveVersionBeforeMessage: boolean,
        shouldSaveVersionAfterMessage: boolean,
      |}) {
        if (!selectedAiRequest || !profile) return;

        const projectVersionIdBeforeMessage = shouldSaveVersionBeforeMessage
          ? version
          : undefined;
        const projectVersionIdAfterMessage = shouldSaveVersionAfterMessage
          ? version
          : undefined;

        await updateAiRequestMessage(getAuthorizationHeader, {
          userId: profile.id,
          aiRequestId: selectedAiRequest.id,
          aiRequestMessageId: lastMessageId,
          projectVersionIdBeforeMessage,
          projectVersionIdAfterMessage,
        });
        // Update the request with the project version, merging with the latest state
        updateAiRequest(selectedAiRequest.id, prevRequest => {
          if (!prevRequest) {
            console.error(
              'Attempting to update project version on non-existent request'
            );
            return selectedAiRequest;
          }
          return {
            ...prevRequest,
            output: prevRequest.output.map((message: AiRequestMessage) => {
              if (
                message.messageId === lastMessageId &&
                message.role !== 'user'
              ) {
                // $FlowFixMe[incompatible-type] - Flow is not able to understand this is the right type.
                return {
                  ...message,
                  projectVersionIdAfterMessage,
                };
              }
              if (
                message.messageId === lastMessageId &&
                message.role === 'user'
              ) {
                // $FlowFixMe[incompatible-type] - Flow is not able to understand this is the right type.
                return {
                  ...message,
                  projectVersionIdBeforeMessage,
                };
              }
              return message;
            }),
          };
        });
      }

      async function saveCloudProjectAndStoreOnMessageIfNeeded() {
        // If the request :
        // - is an agent request,
        // - is not sending a new message right now,
        // - has a few messages already (not an empty request),
        // Then we check depending on the type of the last message if we need to save the project
        // and link the project version to it,
        // to allow the user to restore the project to that state later.
        if (
          !selectedAiRequest ||
          (selectedAiRequest.mode !== 'agent' &&
            selectedAiRequest.mode !== 'orchestrator') ||
          isSendingAiRequest(selectedAiRequest.id) ||
          selectedAiRequest.output.length === 0 ||
          !profile ||
          !project ||
          !onSave ||
          !onSaveProjectAsWithStorageProvider ||
          !storageProviderName ||
          isSavingRef.current
        ) {
          return;
        }

        const lastMessage =
          selectedAiRequest.output.length > 0
            ? selectedAiRequest.output[selectedAiRequest.output.length - 1]
            : null;
        const lastMessageId = lastMessage ? lastMessage.messageId : null;
        if (!lastMessage || !lastMessageId) {
          return;
        }

        const hasFunctionsCallsToProcess =
          getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            editorFunctionCallResults: getEditorFunctionCallResults(
              selectedAiRequest.id
            ),
          }).length > 0;
        const {
          hasUnfinishedResult,
        } = getFunctionCallOutputsFromEditorFunctionCallResults(
          getEditorFunctionCallResults(selectedAiRequest.id)
        );

        const hasJustInitializedProject =
          lastMessage.type === 'function_call_output' &&
          getFunctionCallNameByCallId({
            aiRequest: selectedAiRequest,
            callId: lastMessage.call_id,
          }) === 'initialize_project';

        // Save as cloud project right after initialization, even if the request
        // is still working (orchestrator keeps running after initialize_project).
        const shouldSaveProjectAsAfterInitialization =
          hasJustInitializedProject &&
          !currentlyOpenedCloudProjectVersionId &&
          !isCloudProjectsMaximumReached;

        const shouldSaveVersionBeforeMessage =
          lastMessage.type === 'message' &&
          lastMessage.role === 'user' &&
          !lastMessage.projectVersionIdBeforeMessage;
        const shouldSaveVersionAfterMessage =
          selectedAiRequest.status === 'ready' &&
          (lastMessage.role === 'assistant' ||
            lastMessage.type === 'function_call_output') &&
          !lastMessage.projectVersionIdAfterMessage &&
          !hasFunctionsCallsToProcess &&
          !hasUnfinishedResult;
        if (
          !shouldSaveVersionBeforeMessage &&
          !shouldSaveVersionAfterMessage &&
          !shouldSaveProjectAsAfterInitialization
        ) {
          return;
        }
        try {
          if (shouldSaveProjectAsAfterInitialization) {
            console.info(
              'Saving project after initialization from AI Request...'
            );
            // Try to save the project in the cloud, giving the ability
            // to restore to previous versions.
            isSavingRef.current = true;
            setSavingProjectForMessageId(lastMessageId);
            onSaveProjectAsWithStorageProvider({
              requestedStorageProvider: CloudStorageProvider,
              forcedSavedAsLocation: {
                name: project ? project.getName() : 'Untitled game',
              },
              createdProject: project,
            }).then(async (newFileMetadata: ?FileMetadata) => {
              console.info(
                'Updating AI request message with latest project version after save...'
              );
              const newVersion = newFileMetadata
                ? newFileMetadata.version
                : null;
              if (!newVersion) {
                isSavingRef.current = false;
                setSavingProjectForMessageId(null);
                return;
              }

              try {
                await updateAiRequestWithProjectVersion({
                  lastMessageId,
                  version: newVersion,
                  // The initialization output is always an "after message" version.
                  shouldSaveVersionBeforeMessage: false,
                  shouldSaveVersionAfterMessage: true,
                });
              } catch (error) {
                console.error(
                  'Error updating AI request message with latest project version:',
                  error
                );
              }
              isSavingRef.current = false;
              setSavingProjectForMessageId(null);
            });
            return;
          }

          if (!currentlyOpenedCloudProjectVersionId) {
            // AI Request on a project not saved in the cloud, do not force saving it.
            return;
          }

          if (!hasUnsavedChanges) {
            console.info(
              'Updating AI request message with current project version...'
            );
            // No unsaved changes, just update the last message with the version opened.
            await updateAiRequestWithProjectVersion({
              lastMessageId,
              version: currentlyOpenedCloudProjectVersionId,
              shouldSaveVersionBeforeMessage,
              shouldSaveVersionAfterMessage,
            });
            return;
          }

          isSavingRef.current = true;
          setSavingProjectForMessageId(lastMessageId);
          console.info('Saving project as part of AI request...');
          // Trigger a save, and then update the last message with the new versionId.
          onSave({ skipNewVersionWarning: true }).then(
            async (newFileMetadata: ?FileMetadata) => {
              console.info(
                'Updating AI request message with latest project version after save...'
              );
              const newVersion = newFileMetadata
                ? newFileMetadata.version
                : null;
              if (!newVersion) {
                isSavingRef.current = false;
                setSavingProjectForMessageId(null);
                return;
              }

              try {
                await updateAiRequestWithProjectVersion({
                  lastMessageId,
                  version: newVersion,
                  shouldSaveVersionBeforeMessage,
                  shouldSaveVersionAfterMessage,
                });
              } catch (error) {
                console.error(
                  'Error updating AI request message with latest project version:',
                  error
                );
              }
              isSavingRef.current = false;
              setSavingProjectForMessageId(null);
            }
          );
        } catch (error) {
          console.error(
            'Error saving cloud project version after AI message:',
            error
          );
          // Do not block updating the request if save fails.
        }
      }

      // Debounce the call to avoid too many requests in a short period.
      const timeoutId = setTimeout(() => {
        saveCloudProjectAndStoreOnMessageIfNeeded();
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
      currentlyOpenedCloudProjectVersionId,
      hasUnsavedChanges,
      onSave,
      onSaveProjectAsWithStorageProvider,
      isCloudProjectsMaximumReached,
      fileMetadata,
      storageProviderName,
    ]
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
      // If a request ID is selected but not in storage, try to fetch it directly
      // This can happen when navigating to a request that hasn't been loaded yet (pagination)
      if (selectedAiRequestId && !selectedAiRequest && profile) {
        (async () => {
          try {
            const fetchedRequest = await getAiRequest(getAuthorizationHeader, {
              userId: profile.id,
              aiRequestId: selectedAiRequestId,
            });
            // Add it to the storage
            updateAiRequest(selectedAiRequestId, () => fetchedRequest);
          } catch (error) {
            console.error(
              'Error fetching AI request that is not in storage:',
              error
            );
            // If fetch fails, reset the selected request to avoid staying stuck
            setAiState({
              aiRequestId: null,
            });
          }
        })();
      }
    },
    [
      selectedAiRequestId,
      selectedAiRequest,
      profile,
      getAuthorizationHeader,
      updateAiRequest,
      setAiState,
    ]
  );

  return {
    selectedAiRequest,
    selectedAiRequestId,
    setAiState,
    isFetchingSuggestions,
    savingProjectForMessageId,
  };
};

// If any of those props is undefined, the previous value is kept.
export type OpenAskAiOptions = {|
  aiRequestId?: string | null, // If null, a new request will be created.
  paneIdentifier?: 'left' | 'center' | 'right',
  continueProcessingFunctionCallsOnMount?: boolean,
|};

export type NewAiRequestOptions = {|
  mode: 'chat' | 'agent' | 'orchestrator',
  userRequest: string,
  aiConfigurationPresetId: string,
|};
