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
import { processEditorFunctionCalls } from '../EditorFunctions/EditorFunctionCallRunner';
import {
  type EditorCallbacks,
  type EditorFunctionCallResult,
  editorFunctions,
  editorFunctionsWithoutProject,
} from '../EditorFunctions';
import {
  getAllSubAgentFunctionCalls,
  getFunctionCallNameByCallId,
  getFunctionCallOutputsFromEditorFunctionCallResults,
  getFunctionCallsToProcess,
  getPendingSubAgentFunctionCalls,
  getLastMessagesFromAiRequestOutput,
  getLatestActivePlan,
} from './AiRequestUtils';
import { useEnsureExtensionInstalled } from './UseEnsureExtensionInstalled';
import { useGenerateEvents } from './UseGenerateEvents';
import { useSearchAndInstallAsset } from './UseSearchAndInstallAsset';
import { useSearchAndInstallResource } from './UseSearchAndInstallResource';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { AiRequestContext } from './AiRequestContext';
import { ObjectStoreContext } from '../AssetStore/ObjectStoreContext';
import { enumerateObjectTypes } from '../ObjectsList/EnumerateObjects';

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

// All requests are made in orchestrator mode, and sub-agents (explorer, edit)
// are created server-side with the same tools version as the orchestrator.
export const AI_ORCHESTRATOR_TOOLS_VERSION = 'v4';

/**
 * A pending request for the user to approve (or refuse) a project-modifying
 * edit, surfaced inline in the chat when auto-edit is off.
 */
export type EditApprovalRequest = {|
  // The AI request whose calls are gated (the orchestrator itself, or one of
  // its edit sub-agents).
  aiRequestId: string,
  // The project-modifying call ids waiting for approval.
  callIds: Array<string>,
  // A short label pointing at what is about to run: the name of the edit agent
  // (when the call is inside a sub-agent) or the tool itself (for a direct
  // modifying call). Rendered the same way it appears in the chat.
  label: React.Node,
|};

/**
 * Whether a function call, if run, would modify the project. This is the
 * signal used to gate edits behind a user confirmation when auto-edit is off.
 */
const doesFunctionCallModifyProject = (
  functionCall: AiRequestMessageAssistantFunctionCall
): boolean => {
  const editorFunctionDef =
    editorFunctions[functionCall.name] ||
    editorFunctionsWithoutProject[functionCall.name] ||
    null;
  return !!(editorFunctionDef && editorFunctionDef.modifiesProject);
};

/**
 * Render a single function call to the same short label shown for it in the
 * chat (via the editor function's renderForEditor). Falls back to the raw
 * function name when the call can't be rendered.
 */
const renderFunctionCallLabel = ({
  functionCall,
  project,
  editorCallbacks,
}: {|
  functionCall: AiRequestMessageAssistantFunctionCall,
  project: ?gdProject,
  editorCallbacks: EditorCallbacks,
|}): React.Node => {
  const editorFunction =
    editorFunctions[functionCall.name] ||
    editorFunctionsWithoutProject[functionCall.name] ||
    null;
  if (!editorFunction || !editorFunction.renderForEditor) {
    return functionCall.name;
  }
  try {
    const result = editorFunction.renderForEditor({
      project,
      args: JSON.parse(functionCall.arguments),
      editorCallbacks,
      shouldShowDetails: false,
      editorFunctionCallResultOutput: null,
    });
    return result.text || functionCall.name;
  } catch (error) {
    return functionCall.name;
  }
};

/**
 * Build the short label shown in the confirmation prompt when auto-edit is off,
 * pointing at what is about to run rather than describing the whole change.
 *
 * For an edit agent (a sub-agent, identified by its parentAiRequestId), we show
 * the agent's name — the label of the call that launched it in the parent
 * request (its short_title), the same name shown for the agent in the chat.
 * For a direct modifying call (e.g. generate_events on the orchestrator), we
 * show the tool's own label(s).
 */
const getEditApprovalLabel = ({
  aiRequest,
  modifyingFunctionCalls,
  aiRequests,
  project,
  editorCallbacks,
}: {|
  aiRequest: AiRequest,
  modifyingFunctionCalls: Array<AiRequestMessageAssistantFunctionCall>,
  aiRequests: { [string]: AiRequest },
  project: ?gdProject,
  editorCallbacks: EditorCallbacks,
|}): React.Node => {
  if (aiRequest.parentAiRequestId) {
    const parentRequest = aiRequests[aiRequest.parentAiRequestId] || null;
    const launchingCall = parentRequest
      ? getAllSubAgentFunctionCalls({ aiRequest: parentRequest }).find(
          functionCall => functionCall.subAgentAiRequestId === aiRequest.id
        )
      : null;
    if (launchingCall) {
      return renderFunctionCallLabel({
        functionCall: launchingCall,
        project,
        editorCallbacks,
      });
    }
  }

  return modifyingFunctionCalls.map((functionCall, index) => (
    <React.Fragment key={functionCall.call_id}>
      {index > 0 ? ', ' : null}
      {renderFunctionCallLabel({ functionCall, project, editorCallbacks })}
    </React.Fragment>
  ));
};

export const useProcessFunctionCalls = ({
  i18n,
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
  onWillInstallExtension,
  onExtensionInstalled,
  isReadyToProcessFunctionCalls,
  getIsAutoEditEnabled,
  suspendAiRequest,
  requestEditApproval,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  editorCallbacks: EditorCallbacks,
  aiRequestsToProcess: Array<AiRequest>,
  onSendEditorFunctionCallResults: (
    aiRequestId: string,
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
  getIsAutoEditEnabled: () => boolean,
  suspendAiRequest: (aiRequestId: string) => Promise<void>,
  requestEditApproval: (request: EditApprovalRequest) => Promise<boolean>,
|}): {
  onProcessFunctionCalls: (
    aiRequest: AiRequest,
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

  const { translatedObjectShortHeadersByType, fetchObjects } = React.useContext(
    ObjectStoreContext
  );

  // Latest map of all AI requests, kept in a ref so the (heavily-memoized)
  // onProcessFunctionCalls callback can look up a sub-agent's parent at edit
  // approval time without taking a dependency on the frequently-changing map.
  const { aiRequestStorage } = React.useContext(AiRequestContext);
  const aiRequestsRef = React.useRef(aiRequestStorage.aiRequests);
  aiRequestsRef.current = aiRequestStorage.aiRequests;

  React.useEffect(
    () => {
      fetchObjects();
    },
    [fetchObjects]
  );
  const getAssetStoreTagForNewObject = React.useCallback(
    (objectType: string): string | null => {
      // Prefer the installed object metadata (same source as the
      // "New object" dialog in the editor).
      const installedObjectMetadata = project
        ? enumerateObjectTypes(project, null).find(
            enumeratedObjectMetadata =>
              enumeratedObjectMetadata.type === objectType
          )
        : null;
      if (installedObjectMetadata && installedObjectMetadata.assetStoreTag) {
        return installedObjectMetadata.assetStoreTag;
      }

      const header = translatedObjectShortHeadersByType[objectType];
      return (header && header.assetStoreTag) || null;
    },
    [project, translatedObjectShortHeadersByType]
  );

  // In-memory guard against duplicate processing of the same function call.
  //
  // The main protection is marking calls as "working" in the ref-backed
  // results store (see useEditorFunctionCallResultsStorage).  However,
  // React 18 can re-run an effect before a forceUpdate() re-render has
  // propagated (e.g. StrictMode double-invocations in development, or a
  // polling update that recreates onProcessFunctionCalls while the previous
  // invocation is still awaiting).
  // This Set acts as an immediate, synchronous lock keyed by
  // "<requestId>:<callId>" so a call that is already being processed is
  // never started a second time.
  const inFlightFunctionCallIdsRef = React.useRef<Set<string>>(new Set());

  // When auto-edit is off, the user approves edits one batch at a time. Once a
  // batch is approved we remember it here so the rest of that edit agent's
  // tools (and any later modifying rounds) run without asking again.
  // Keys are `req:<aiRequestId>` (for a whole edit agent) or
  // `call:<callId>` (for a single direct modifying call like generate_events).
  const approvedEditBatchKeysRef = React.useRef<Set<string>>(new Set());

  const onProcessFunctionCalls = React.useCallback(
    async (
      aiRequest: AiRequest,
      functionCalls: Array<AiRequestMessageAssistantFunctionCall>
    ) => {
      if (!isReadyToProcessFunctionCalls) return;
      if (aiRequest.status === 'suspended') return;

      const functionCallsToProcess = functionCalls.filter(
        functionCall =>
          !inFlightFunctionCallIdsRef.current.has(
            `${aiRequest.id}:${functionCall.call_id}`
          )
      );
      if (functionCallsToProcess.length === 0) {
        console.info(
          'All function calls are already being processed (in-flight guard), skipping.'
        );
        return;
      }

      // Lock these call IDs so concurrent invocations skip them.
      functionCallsToProcess.forEach(functionCall => {
        inFlightFunctionCallIdsRef.current.add(
          `${aiRequest.id}:${functionCall.call_id}`
        );
      });

      // Gate project-modifying calls behind a user confirmation when auto-edit
      // is off. Read-only calls (exploration, inspection) always run. The first
      // time an edit agent (or a direct modifying call) is about to change the
      // project, ask the user; once approved, the rest of that batch runs
      // without asking again. On refusal, suspend the request so the user can
      // explain what to do differently.
      //
      // This must happen after the in-flight lock above and before the calls
      // are marked "working": on refusal we intentionally keep the lock held
      // (we never reach the `finally` that releases it) so the now-suspended
      // calls are not re-processed before the suspension propagates.
      if (!getIsAutoEditEnabled()) {
        const batchKey = aiRequest.parentAiRequestId
          ? `req:${aiRequest.id}`
          : null;
        const isCallApproved = (
          functionCall: AiRequestMessageAssistantFunctionCall
        ) =>
          (!!batchKey && approvedEditBatchKeysRef.current.has(batchKey)) ||
          approvedEditBatchKeysRef.current.has(`call:${functionCall.call_id}`);

        const modifyingFunctionCalls = functionCallsToProcess.filter(
          functionCall =>
            doesFunctionCallModifyProject(functionCall) &&
            !isCallApproved(functionCall)
        );

        if (modifyingFunctionCalls.length > 0) {
          const label = getEditApprovalLabel({
            aiRequest,
            modifyingFunctionCalls,
            aiRequests: aiRequestsRef.current,
            project,
            editorCallbacks,
          });
          // Ask the user inline, in the chat (see EditApprovalRow). The promise
          // resolves when they click Apply/Cancel. The in-flight lock stays held
          // while we wait, so the same calls are not re-processed meanwhile.
          const accepted = await requestEditApproval({
            aiRequestId: aiRequest.id,
            callIds: modifyingFunctionCalls.map(
              functionCall => functionCall.call_id
            ),
            label,
          });

          if (!accepted) {
            // Refused: suspend the request (the parent orchestrator if this is
            // an edit agent) so the whole flow pauses and the user can redirect.
            // Keep the in-flight lock held so these calls are not re-processed.
            const requestToSuspendId =
              aiRequest.parentAiRequestId || aiRequest.id;
            try {
              await suspendAiRequest(requestToSuspendId);
            } catch (error) {
              console.error(
                'Error while suspending AI request after a refused edit:',
                error
              );
            }
            return;
          }

          // Approved: remember the approval for the whole batch so subsequent
          // modifying calls from the same edit agent run without asking again.
          // Avoid unbounded growth across a long session.
          if (approvedEditBatchKeysRef.current.size > 500) {
            approvedEditBatchKeysRef.current.clear();
          }
          if (batchKey) {
            approvedEditBatchKeysRef.current.add(batchKey);
          } else {
            modifyingFunctionCalls.forEach(functionCall =>
              approvedEditBatchKeysRef.current.add(
                `call:${functionCall.call_id}`
              )
            );
          }
        }
      }

      addEditorFunctionCallResults(
        aiRequest.id,
        functionCallsToProcess.map(functionCall => ({
          status: 'working',
          call_id: functionCall.call_id,
        }))
      );

      try {
        const {
          results,
          createdSceneNames,
          createdProject,
        } = await processEditorFunctionCalls({
          project,
          editorCallbacks,
          // $FlowFixMe[incompatible-type]
          toolOptions: aiRequest.toolOptions || null,
          i18n,
          functionCalls: functionCallsToProcess.map(functionCall => ({
            name: functionCall.name,
            arguments: functionCall.arguments,
            call_id: functionCall.call_id,
          })),
          relatedAiRequestId: aiRequest.id,
          getRelatedAiRequestLastMessages: () =>
            getLastMessagesFromAiRequestOutput(aiRequest.output || []),
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
          getAssetStoreTagForNewObject,
        });

        // If the request was suspended while we were processing, discard the
        // results — we don't want to re-populate the cleared results or send
        // anything to a suspended request.
        if (results.some(r => r.status === 'aborted')) {
          console.info(
            'Some function call results were aborted (request was likely suspended during processing), discarding all results.'
          );
          return;
        }

        const newResults = addEditorFunctionCallResults(aiRequest.id, results);

        await onSendEditorFunctionCallResults(aiRequest.id, newResults, {
          createdSceneNames,
          createdProject,
        });
      } finally {
        // Release the lock so these calls can be retried if needed
        // (e.g. after an error or a suspension).
        functionCallsToProcess.forEach(functionCall => {
          inFlightFunctionCallIdsRef.current.delete(
            `${aiRequest.id}:${functionCall.call_id}`
          );
        });
      }
    },
    [
      i18n,
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
      getAssetStoreTagForNewObject,
      generateEvents,
      onSendEditorFunctionCallResults,
      getIsAutoEditEnabled,
      suspendAiRequest,
      requestEditApproval,
    ]
  );

  // Collect all function calls to process across all active AI requests.
  const allFunctionCallsToProcess: Array<{|
    aiRequest: AiRequest,
    functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
  |}> = React.useMemo(
    () => {
      const result = [];
      for (const aiRequest of aiRequestsToProcess) {
        const functionCalls = getFunctionCallsToProcess({
          aiRequest,
          editorFunctionCallResults: getEditorFunctionCallResults(aiRequest.id),
        });
        if (functionCalls.length > 0) {
          result.push({ aiRequest, functionCalls });
        }
      }
      return result;
    },
    [aiRequestsToProcess, getEditorFunctionCallResults]
  );

  React.useEffect(
    () => {
      if (allFunctionCallsToProcess.length === 0) return;

      (async () => {
        for (const { aiRequest, functionCalls } of allFunctionCallsToProcess) {
          if (aiRequest.status === 'suspended') continue;
          console.info(
            `Automatically processing AI function calls for request ${
              aiRequest.id
            }...`
          );
          await onProcessFunctionCalls(aiRequest, functionCalls);
        }
      })();
    },
    [onProcessFunctionCalls, allFunctionCallsToProcess]
  );

  return {
    onProcessFunctionCalls,
  };
};

/**
 * Detects sub-agent function calls in the selected AI request and activates
 * them so that AiRequestContext starts polling and processing them.
 */
export const useActivatePendingSubAgents = ({
  selectedAiRequest,
}: {|
  selectedAiRequest: ?AiRequest,
|}) => {
  const { activateSubAgent } = React.useContext(AiRequestContext);

  React.useEffect(
    () => {
      if (!selectedAiRequest) return;

      const subAgentCalls = getPendingSubAgentFunctionCalls({
        aiRequest: selectedAiRequest,
      });
      subAgentCalls.forEach(call => {
        if (call.subAgentAiRequestId) {
          activateSubAgent(
            call.subAgentAiRequestId,
            selectedAiRequest.id,
            call.call_id
          );
        }
      });
    },
    [selectedAiRequest, activateSubAgent]
  );
};

/**
 * For every sub-agent function call in the selected AI request, ensures that
 * its AiRequest is loaded into the shared `aiRequests` storage so its details
 * can be displayed (e.g. for historical or suspended parents whose sub-agents
 * are no longer being polled by `useActivatePendingSubAgents`).
 *
 * One-shot fetch only — the polling/activation pipeline remains responsible
 * for live updates of still-running sub-agents.
 */
export const useLoadSubAgentRequests = ({
  selectedAiRequest,
}: {|
  selectedAiRequest: ?AiRequest,
|}) => {
  const { aiRequestStorage } = React.useContext(AiRequestContext);
  const { aiRequests, refreshAiRequest } = aiRequestStorage;
  const attemptedFetchRef = React.useRef<Set<string>>(new Set());

  React.useEffect(
    () => {
      if (!selectedAiRequest) return;

      const subAgentCalls = getAllSubAgentFunctionCalls({
        aiRequest: selectedAiRequest,
      });
      for (const call of subAgentCalls) {
        const subAgentAiRequestId = call.subAgentAiRequestId;
        if (!subAgentAiRequestId) continue;
        if (aiRequests[subAgentAiRequestId]) continue;
        if (attemptedFetchRef.current.has(subAgentAiRequestId)) continue;
        attemptedFetchRef.current.add(subAgentAiRequestId);
        refreshAiRequest(subAgentAiRequestId);
      }
    },
    [selectedAiRequest, aiRequests, refreshAiRequest]
  );
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
} => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const {
    aiRequestStorage,
    editorFunctionCallResultsStorage,
    isFetchingSuggestions,
    setIsFetchingSuggestions,
    selectedAiRequestId,
    setSelectedAiRequestId,
    selectedAiRequest,
  } = React.useContext(AiRequestContext);
  const { updateAiRequest, isSendingAiRequest } = aiRequestStorage;
  const { getEditorFunctionCallResults } = editorFunctionCallResultsStorage;

  const [
    savingProjectForMessageId,
    setSavingProjectForMessageId,
  ] = React.useState<?string>(null);

  const prevProjectRef = React.useRef(project);
  React.useEffect(
    () => {
      if (prevProjectRef.current !== project) {
        const hadPreviousProject = prevProjectRef.current !== null;
        prevProjectRef.current = project;
        // Only clear the selected request when switching away from an existing
        // project (closing or switching projects). Do NOT clear when a project
        // is first opened from scratch (null → project), e.g. when the AI
        // creates a new project — we want to keep the in-progress request.
        if (hadPreviousProject) {
          setSelectedAiRequestId(null);
        }
      }
    },
    [project, setSelectedAiRequestId]
  );

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
          !selectedAiRequest.output ||
          selectedAiRequest.output.length === 0 ||
          selectedAiRequest.status !== 'ready' ||
          !profile ||
          isFetchingSuggestions
        )
          return;

        // No suggestions until there is an actual project: before that, the AI
        // is still discussing the game idea or making a plan with the user.
        if (!project) return;

        // Check if there are tools being run. If so, no suggestions at this time.
        const hasFunctionsCallsToProcess =
          getFunctionCallsToProcess({
            aiRequest: selectedAiRequest,
            editorFunctionCallResults: getEditorFunctionCallResults(
              selectedAiRequest.id
            ),
          }).length > 0;
        if (hasFunctionsCallsToProcess) return;

        // If there are sub-agents running, it means the request is still running,
        // so no suggestions at this time.
        const hasPendingSubAgentCalls =
          getPendingSubAgentFunctionCalls({
            aiRequest: selectedAiRequest,
          }).length > 0;
        if (hasPendingSubAgentCalls) return;

        const {
          hasUnfinishedResult,
        } = getFunctionCallOutputsFromEditorFunctionCallResults(
          getEditorFunctionCallResults(selectedAiRequest.id)
        );
        if (hasUnfinishedResult) return;

        const outputForSuggestions = selectedAiRequest.output || [];
        const lastMessage =
          outputForSuggestions.length > 0
            ? outputForSuggestions[outputForSuggestions.length - 1]
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
            output: (prevRequest.output || []).map(
              (message: AiRequestMessage) => {
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
              }
            ),
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
          !selectedAiRequest.output ||
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

        const outputForSave = selectedAiRequest.output || [];
        const lastMessage =
          outputForSave.length > 0
            ? outputForSave[outputForSave.length - 1]
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
        const hasPendingSubAgentCalls =
          getPendingSubAgentFunctionCalls({
            aiRequest: selectedAiRequest,
          }).length > 0;

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
          !hasUnfinishedResult &&
          !hasPendingSubAgentCalls;
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
        setSelectedAiRequestId(null);
      }
    },
    [profile, setSelectedAiRequestId]
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
            setSelectedAiRequestId(null);
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
      setSelectedAiRequestId,
    ]
  );

  return {
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
