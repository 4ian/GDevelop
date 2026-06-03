// @flow
import * as React from 'react';
import {
  getAiRequest,
  getAiRequestStatuses,
  fetchAiSettings,
  type AiRequest,
  type AiSettings,
  type GenerationStatus,
  getAiRequests,
} from '../Utils/GDevelopServices/Generation';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type EditorFunctionCallResult } from '../EditorFunctions';
import Window from '../Utils/Window';
import { AI_SETTINGS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';
import { useAsyncLazyMemo } from '../Utils/UseLazyMemo';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import { useInterval } from '../Utils/UseInterval';
import useForceUpdate from '../Utils/UseForceUpdate';
import { aiRequestShouldBeWatched } from './AiRequestUtils';

type EditorFunctionCallResultsStorage = {|
  getEditorFunctionCallResults: (
    aiRequestId: string
  ) => Array<EditorFunctionCallResult> | null,
  addEditorFunctionCallResults: (
    aiRequestId: string,
    editorFunctionCallResults: EditorFunctionCallResult[]
  ) => EditorFunctionCallResult[],
  clearEditorFunctionCallResults: (aiRequestId: string) => void,
|};

type EditorFunctionCallResultsPerRequest = {
  [aiRequestId: string]: ?Array<EditorFunctionCallResult>,
};

const useEditorFunctionCallResultsStorage = (): EditorFunctionCallResultsStorage => {
  const editorFunctionCallResultsPerRequestRef = React.useRef<EditorFunctionCallResultsPerRequest>(
    {}
  );
  const forceUpdate = useForceUpdate();

  return {
    getEditorFunctionCallResults: React.useCallback(
      (aiRequestId: string): Array<EditorFunctionCallResult> | null =>
        editorFunctionCallResultsPerRequestRef.current[aiRequestId] || null,
      []
    ),
    addEditorFunctionCallResults: React.useCallback(
      (
        aiRequestId: string,
        editorFunctionCallResults: EditorFunctionCallResult[]
      ) => {
        const previousState = editorFunctionCallResultsPerRequestRef.current;
        const existingEditorFunctionCallResults = (
          previousState[aiRequestId] || []
        ).filter(existingEditorFunctionCallResult => {
          return !editorFunctionCallResults.some(editorFunctionCallResult => {
            return (
              editorFunctionCallResult.call_id ===
              existingEditorFunctionCallResult.call_id
            );
          });
        });

        const computedResults = [
          ...existingEditorFunctionCallResults,
          ...editorFunctionCallResults,
        ];

        // Store results in the ref so that they are visible immediately
        // to any code that calls getEditorFunctionCallResults — even within
        // the same async tick.  Without this, React 18 automatic batching
        // would defer the state update, causing other callbacks (e.g. the
        // processing effect) to read stale data and potentially re-process
        // the same function calls.
        // forceUpdate() schedules a re-render so the UI stays in sync.
        editorFunctionCallResultsPerRequestRef.current = {
          ...editorFunctionCallResultsPerRequestRef.current,
          [aiRequestId]: computedResults,
        };
        forceUpdate();

        return computedResults;
      },
      [forceUpdate]
    ),
    clearEditorFunctionCallResults: React.useCallback(
      (aiRequestId: string) => {
        editorFunctionCallResultsPerRequestRef.current = {
          ...editorFunctionCallResultsPerRequestRef.current,
          [aiRequestId]: null,
        };
        forceUpdate();
      },
      [forceUpdate]
    ),
  };
};

type AiRequestStorage = {|
  fetchAiRequests: () => Promise<void>,
  onLoadMoreAiRequests: () => Promise<void>,
  canLoadMore: boolean,
  error: ?Error,
  isLoading: boolean,
  aiRequests: { [string]: AiRequest },
  updateAiRequest: (
    aiRequestId: string,
    updateFn: (prevAiRequest: ?AiRequest) => AiRequest
  ) => void,
  refreshAiRequest: (aiRequestId: string) => Promise<void>,
  isSendingAiRequest: (aiRequestId: string | null) => boolean,
  getLastSendError: (aiRequestId: string | null) => ?Error,
  setSendingAiRequest: (aiRequestId: string | null, isSending: boolean) => void,
  setLastSendError: (aiRequestId: string | null, lastSendError: ?Error) => void,
  forkingState: ?{| aiRequestId: string, messageId: string |},
  setForkingState: (?{| aiRequestId: string, messageId: string |}) => void,
|};

type AiRequestHistory = {|
  handleNavigateHistory: ({|
    direction: 'up' | 'down',
    currentText: string,
    onChangeText: (text: string) => void,
  |}) => void,
  resetNavigation: () => void,
|};

type AiRequestSendState = {|
  isSending: boolean,
  lastSendError: ?Error,
|};

type PaginationState = {|
  aiRequests: { [aiRequestId: string]: AiRequest },
  nextPageUri: ?Object,
|};

const emptyPaginationState: PaginationState = {
  aiRequests: {},
  nextPageUri: null,
};

export const useAiRequestsStorage = (): AiRequestStorage => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const [state, setState] = React.useState<PaginationState>(
    emptyPaginationState
  );
  const [error, setError] = React.useState<Error | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [forkingState, setForkingState] = React.useState<?{|
    aiRequestId: string,
    messageId: string,
  |}>(null);

  const fetchAiRequests = React.useCallback(
    async () => {
      if (!profile) return;

      setIsLoading(true);
      setError(null);

      try {
        const history = await getAiRequests(getAuthorizationHeader, {
          userId: profile.id,
          forceUri: null, // Fetch the first page.
        });
        if (!history) return;
        const aiRequestsById = history.aiRequests.reduce(
          (accumulator, aiRequest) => {
            // $FlowFixMe[prop-missing]
            accumulator[aiRequest.id] = aiRequest;
            return accumulator;
          },
          {}
        );
        setState({
          aiRequests: aiRequestsById,
          nextPageUri: history.nextPageUri,
        });
      } catch (err) {
        setError(err);
        console.error('Error fetching AI requests:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [profile, getAuthorizationHeader]
  );

  const onLoadMoreAiRequests = React.useCallback(
    async () => {
      if (!profile) return;

      setIsLoading(true);
      setError(null);

      try {
        const history = await getAiRequests(getAuthorizationHeader, {
          userId: profile.id,
          forceUri: state.nextPageUri,
        });
        if (!history) return;
        const newRequests = history.aiRequests;
        const currentRequestsById = state.aiRequests;

        newRequests.forEach(newRequest => {
          // Add new requests to the state.
          if (!currentRequestsById[newRequest.id]) {
            currentRequestsById[newRequest.id] = newRequest;
          }
        });
        setState({
          aiRequests: currentRequestsById,
          nextPageUri: history.nextPageUri,
        });
      } catch (err) {
        setError(err);
        console.error('Error fetching AI requests:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [profile, getAuthorizationHeader, state.nextPageUri, state.aiRequests]
  );

  const updateAiRequest = React.useCallback(
    (
      aiRequestId: string,
      updateFn: (prevAiRequest: ?AiRequest) => AiRequest
    ) => {
      setState(prevState => {
        const currentAiRequest = prevState.aiRequests
          ? prevState.aiRequests[aiRequestId]
          : null;
        const newAiRequest = updateFn(currentAiRequest || null);
        return {
          ...prevState,
          aiRequests: {
            ...(prevState.aiRequests || {}),
            [aiRequestId]: newAiRequest,
          },
        };
      });
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
        updateAiRequest(updatedAiRequest.id, () => updatedAiRequest);
      } catch (error) {
        console.error(
          'Error while background refreshing AI request - ignoring:',
          error
        );
      }
    },
    [getAuthorizationHeader, profile, updateAiRequest]
  );

  React.useEffect(
    () => {
      // Reset AI requests when the user logs out.
      if (!profile) {
        setState(emptyPaginationState);
      }
    },
    [profile]
  );

  // Store send states in a ref so that isSendingAiRequest reads are
  // immediately consistent — even within the same async tick.
  // Without this, React 18 automatic batching would defer the state
  // update from setSendingAiRequest, causing guards (e.g. in
  // onSendMessage) to read stale data and potentially trigger
  // duplicate API calls.
  // forceUpdate() schedules a re-render so the UI stays in sync.
  const aiRequestSendStatesRef = React.useRef<{
    [string]: AiRequestSendState,
  }>({});
  const forceUpdateForSendStates = useForceUpdate();
  const isSendingAiRequest = React.useCallback(
    (aiRequestId: string | null) =>
      !!aiRequestSendStatesRef.current[aiRequestId || ''] &&
      aiRequestSendStatesRef.current[aiRequestId || ''].isSending,
    []
  );
  const getLastSendError = React.useCallback(
    (aiRequestId: string | null) =>
      (aiRequestSendStatesRef.current[aiRequestId || ''] &&
        aiRequestSendStatesRef.current[aiRequestId || ''].lastSendError) ||
      null,
    []
  );
  const setSendingAiRequest = React.useCallback(
    (aiRequestId: string | null, isSending: boolean) => {
      const aiRequestIdToSet: string = aiRequestId || '';
      aiRequestSendStatesRef.current = {
        ...aiRequestSendStatesRef.current,
        [aiRequestIdToSet]: {
          isSending,
          lastSendError: null,
        },
      };
      forceUpdateForSendStates();
    },
    [forceUpdateForSendStates]
  );
  const setLastSendError = React.useCallback(
    (aiRequestId: string | null, lastSendError: ?Error) => {
      const aiRequestIdToSet: string = aiRequestId || '';
      aiRequestSendStatesRef.current = {
        ...aiRequestSendStatesRef.current,
        [aiRequestIdToSet]: {
          isSending: false,
          lastSendError,
        },
      };
      forceUpdateForSendStates();
    },
    [forceUpdateForSendStates]
  );

  return {
    fetchAiRequests,
    onLoadMoreAiRequests,
    canLoadMore: !!state.nextPageUri,
    error,
    isLoading,
    aiRequests: state.aiRequests,
    updateAiRequest,
    refreshAiRequest,
    isSendingAiRequest,
    setSendingAiRequest,
    setLastSendError,
    getLastSendError,
    forkingState,
    setForkingState,
  };
};

export const useAiRequestHistory = (
  aiRequestStorage: AiRequestStorage
): AiRequestHistory => {
  const { aiRequests } = aiRequestStorage;
  const [historyIndex, setHistoryIndex] = React.useState<number>(-1);
  const [savedCurrentText, setSavedCurrentText] = React.useState<string>('');
  // Build history from sent user messages across all aiRequests
  const requestsHistory = React.useMemo(
    () => {
      const history: Array<string> = [];

      // Iterate through all aiRequests ordered by request update date.
      // A request can request multiple user messages, but we only know the
      // information about the request date, not the date of each user message.
      Object.values(aiRequests)
        .sort((a: AiRequest, b: AiRequest) => {
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        })
        .forEach((request: AiRequest) => {
          if (!request.output) return;

          const userMessages = request.output
            .filter(
              message => message.type === 'message' && message.role === 'user'
            )
            .map(
              // $FlowFixMe[cannot-resolve-name]
              (message: AiRequestUserMessage) => {
                const content = message.content;
                if (!Array.isArray(content)) return '';
                const userRequest = content.find(
                  item => item.type === 'user_request'
                );
                return userRequest ? userRequest.text : '';
              }
            )
            .filter(text => text !== '');

          history.push(...userMessages);
        });

      return history;
    },
    [aiRequests]
  );

  const handleNavigateHistory = React.useCallback(
    ({
      direction,
      currentText,
      onChangeText,
    }: {
      direction: 'up' | 'down',
      currentText: string,
      onChangeText: (text: string) => void,
    }) => {
      if (direction === 'up') {
        // Save current text when starting navigation,
        // so we can restore it if going back to current.
        if (historyIndex === -1) {
          setSavedCurrentText(currentText);
        }

        const newIndex = historyIndex + 1;
        if (newIndex < requestsHistory.length) {
          setHistoryIndex(newIndex);
          const historicalText =
            requestsHistory[requestsHistory.length - 1 - newIndex];
          onChangeText(historicalText);
        }
      } else if (direction === 'down') {
        const newIndex = historyIndex - 1;

        if (newIndex === -1) {
          // We're at the end of the history. Restore the saved current text.
          setHistoryIndex(-1);
          onChangeText(savedCurrentText);
        } else if (newIndex >= 0) {
          setHistoryIndex(newIndex);
          const historicalText =
            requestsHistory[requestsHistory.length - 1 - newIndex];
          onChangeText(historicalText);
        }
      }
    },
    [historyIndex, requestsHistory, savedCurrentText]
  );

  const resetNavigation = React.useCallback(() => {
    setHistoryIndex(-1);
    setSavedCurrentText('');
  }, []);

  return {
    handleNavigateHistory,
    resetNavigation,
  };
};

export type ActiveSubAgent = {|
  parentAiRequestId: string,
  callId: string,
|};

export type AiRequestContextState = {|
  aiRequestStorage: AiRequestStorage,
  aiRequestHistory: AiRequestHistory,
  editorFunctionCallResultsStorage: EditorFunctionCallResultsStorage,
  getAiSettings: () => AiSettings | null,
  isFetchingSuggestions: boolean,
  setIsFetchingSuggestions: (value: boolean) => void,
  selectedAiRequestId: string | null,
  setSelectedAiRequestId: (aiRequestId: string | null) => void,
  selectedAiRequest: AiRequest | null,
  activeSubAgents: { [subAgentAiRequestId: string]: ActiveSubAgent },
  activateSubAgent: (
    subAgentAiRequestId: string,
    parentAiRequestId: string,
    callId: string
  ) => void,
|};

export const initialAiRequestContextState: AiRequestContextState = {
  aiRequestStorage: {
    fetchAiRequests: async () => {},
    onLoadMoreAiRequests: async () => {},
    canLoadMore: true,
    error: null,
    isLoading: false,
    aiRequests: {},
    updateAiRequest: () => {},
    refreshAiRequest: async () => {},
    isSendingAiRequest: () => false,
    getLastSendError: () => null,
    setSendingAiRequest: () => {},
    setLastSendError: () => {},
    forkingState: null,
    setForkingState: () => {},
  },
  aiRequestHistory: {
    handleNavigateHistory: ({ direction, currentText, onChangeText }) => {},
    resetNavigation: () => {},
  },
  editorFunctionCallResultsStorage: {
    getEditorFunctionCallResults: () => [],
    addEditorFunctionCallResults: () => [],
    clearEditorFunctionCallResults: () => {},
  },
  getAiSettings: () => null,
  isFetchingSuggestions: false,
  setIsFetchingSuggestions: () => {},
  selectedAiRequestId: null,
  setSelectedAiRequestId: () => {},
  selectedAiRequest: null,
  activeSubAgents: {},
  activateSubAgent: () => {},
};
export const AiRequestContext: React.Context<AiRequestContextState> = React.createContext<AiRequestContextState>(
  initialAiRequestContextState
);

type AiRequestProviderProps = {|
  children: React.Node,
|};

// Merge an incremental fetch (only the messages from `outputFromMessageId` onward)
// back onto the cached request. When the response isn't an incremental slice
// of what we have (no cache, unknown id, or the backend returned the full
// output), we just use the fetched request as-is.
export const mergeIncrementalAiRequest = (
  previousAiRequest: ?AiRequest,
  fetchedAiRequest: AiRequest,
  outputFromMessageId: ?string
): AiRequest => {
  const fetchedOutput = fetchedAiRequest.output || [];
  const previousOutput = previousAiRequest && previousAiRequest.output;
  const isIncrementalSlice =
    !!outputFromMessageId &&
    !!previousOutput &&
    fetchedOutput.length > 0 &&
    fetchedOutput[0].messageId === outputFromMessageId;
  if (!isIncrementalSlice || !previousOutput) return fetchedAiRequest;

  const spliceIndex = previousOutput.findIndex(
    message => message.messageId === outputFromMessageId
  );
  if (spliceIndex === -1) return fetchedAiRequest;

  return {
    ...fetchedAiRequest,
    output: [...previousOutput.slice(0, spliceIndex), ...fetchedOutput],
  };
};

export const AiRequestProvider = ({
  children,
}: AiRequestProviderProps): React.MixedElement => {
  const editorFunctionCallResultsStorage = useEditorFunctionCallResultsStorage();
  const aiRequestStorage = useAiRequestsStorage();
  const aiRequestHistory = useAiRequestHistory(aiRequestStorage);

  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [selectedAiRequestId, setSelectedAiRequestId] = React.useState<
    string | null
  >(null);
  const { aiRequests, updateAiRequest } = aiRequestStorage;
  const selectedAiRequest =
    (selectedAiRequestId && aiRequests[selectedAiRequestId]) || null;

  const [shouldWatchRequest, setShouldWatchRequest] = React.useState<boolean>(
    false
  );
  const [
    isFetchingSuggestions,
    setIsFetchingSuggestions,
  ] = React.useState<boolean>(false);
  const lastFullFetchTimeRef = React.useRef<number>(0);
  const fullFetchIntervalInMs = 5000;

  // The selected AI request and its active sub-agents are watched together by a
  // single polling loop defined further below (see `onWatch`), so that a parent
  // request and all its sub-agents are status-polled in one batched request per
  // tick instead of one request per entity.
  const watchPollingIntervalInMs =
    (selectedAiRequest &&
      selectedAiRequest.toolOptions &&
      selectedAiRequest.toolOptions.watchPollingIntervalInMs) ||
    1400;

  React.useEffect(
    () => {
      if (
        selectedAiRequestId &&
        selectedAiRequest &&
        aiRequestShouldBeWatched(selectedAiRequest)
      ) {
        setShouldWatchRequest(true);
      } else {
        setShouldWatchRequest(false);
      }

      return () => {
        setShouldWatchRequest(false);
      };
    },
    [selectedAiRequestId, selectedAiRequest]
  );

  // --- Sub-agent tracking & polling ---
  // Use a ref-backed map for immediate consistency (same pattern as send states).
  const activeSubAgentsRef = React.useRef<{
    [subAgentAiRequestId: string]: ActiveSubAgent,
  }>({});
  const forceUpdateForSubAgents = useForceUpdate();

  const activateSubAgent = React.useCallback(
    (
      subAgentAiRequestId: string,
      parentAiRequestId: string,
      callId: string
    ) => {
      if (activeSubAgentsRef.current[subAgentAiRequestId]) return;
      activeSubAgentsRef.current = {
        ...activeSubAgentsRef.current,
        [subAgentAiRequestId]: { parentAiRequestId, callId },
      };
      forceUpdateForSubAgents();
    },
    [forceUpdateForSubAgents]
  );

  const subAgentLastFullFetchTimeRef = React.useRef<{
    [subAgentAiRequestId: string]: number,
  }>({});

  const removeSubAgent = React.useCallback(
    (subAgentAiRequestId: string) => {
      delete subAgentLastFullFetchTimeRef.current[subAgentAiRequestId];
      const { [subAgentAiRequestId]: _, ...rest } = activeSubAgentsRef.current;
      activeSubAgentsRef.current = rest;
      forceUpdateForSubAgents();
    },
    [forceUpdateForSubAgents]
  );

  const removeSubAgentsOfRequest = React.useCallback(
    (aiRequestId: string): Array<string> => {
      const subAgents = activeSubAgentsRef.current;
      const subAgentIds = Object.keys(subAgents).filter(
        id => subAgents[id].parentAiRequestId === aiRequestId
      );
      if (subAgentIds.length > 0) {
        subAgentIds.forEach(id => {
          delete subAgentLastFullFetchTimeRef.current[id];
        });
        const remaining = { ...activeSubAgentsRef.current };
        subAgentIds.forEach(id => delete remaining[id]);
        activeSubAgentsRef.current = remaining;
        forceUpdateForSubAgents();
      }

      return subAgentIds;
    },
    [forceUpdateForSubAgents]
  );

  const hasActiveSubAgents = Object.keys(activeSubAgentsRef.current).length > 0;

  /**
   * Remove a sub-agent only when the parent AI request has received a
   * function_call_output for the sub-agent's call. Until that point the
   * sub-agent must stay active (its own function calls can be processed by the editor).
   */
  const removeSubAgentIfDone = React.useCallback(
    (subAgentId: string) => {
      const subAgentInfo = activeSubAgentsRef.current[subAgentId];
      if (!subAgentInfo) return;

      const parentRequest = aiRequests[subAgentInfo.parentAiRequestId];
      if (!parentRequest) return;

      const parentOutput = parentRequest.output || [];
      const hasOutputForSubAgent = parentOutput.some(
        message =>
          message.type === 'function_call_output' &&
          message.call_id === subAgentInfo.callId
      );

      if (hasOutputForSubAgent) {
        removeSubAgent(subAgentId);
        console.info(
          `Removed sub-agent #${subAgentId} of parent #${
            subAgentInfo.parentAiRequestId
          } as done.`
        );
      }
    },
    [aiRequests, removeSubAgent]
  );

  // Unified watch loop for the selected AI request and all its active
  // sub-agents. Each entity still does a full fetch every ~5s (to pick up new
  // messages) and a status-only check in between. The key difference from doing
  // this per-entity is that all the status-only checks for a given tick are
  // batched into a SINGLE request (`getAiRequestStatuses`) instead of one
  // request (and one Lambda invocation) per entity. The polling cadence — and
  // therefore the latency to react to a sub-agent's editor tool call — is
  // unchanged.
  const onWatch = async () => {
    if (!profile) return;
    const now = Date.now();

    const clearFetchingSuggestionsIfDone = (aiRequest: AiRequest) => {
      if (!isFetchingSuggestions) return;
      const output = aiRequest.output || [];
      const lastMessage = output.length > 0 ? output[output.length - 1] : null;
      const hasSuggestions =
        lastMessage &&
        ((lastMessage.type === 'message' && lastMessage.role === 'assistant') ||
          lastMessage.type === 'function_call_output') &&
        lastMessage.suggestions;
      if (aiRequest.status === 'ready' || hasSuggestions) {
        setIsFetchingSuggestions(false);
      }
    };

    const subAgentIds = Object.keys(activeSubAgentsRef.current);
    const subAgentIdSet = new Set(subAgentIds);

    const doFullFetch = async (aiRequestId: string) => {
      const isSubAgent = subAgentIdSet.has(aiRequestId);
      if (isSubAgent) {
        subAgentLastFullFetchTimeRef.current[aiRequestId] = now;
      } else {
        lastFullFetchTimeRef.current = now;
      }
      // Only fetch the messages we don't have yet: ask for everything from the
      // last message we already have onward (re-fetched so its in-place
      // updates, like suggestions, are picked up).
      const currentOutput = (aiRequests[aiRequestId] || {}).output;
      const lastMessage =
        currentOutput && currentOutput.length > 0
          ? currentOutput[currentOutput.length - 1]
          : null;
      const outputFromMessageId =
        (lastMessage && lastMessage.messageId) || undefined;
      const fetchedAiRequest = await retryIfFailed({ times: 2 }, () =>
        getAiRequest(getAuthorizationHeader, {
          userId: profile.id,
          aiRequestId,
          outputFromMessageId,
        })
      );
      updateAiRequest(aiRequestId, prevRequest =>
        mergeIncrementalAiRequest(
          prevRequest,
          fetchedAiRequest,
          outputFromMessageId
        )
      );
      if (isSubAgent) {
        if (
          fetchedAiRequest.status === 'ready' ||
          fetchedAiRequest.status === 'error'
        ) {
          removeSubAgentIfDone(aiRequestId);
        }
      } else {
        clearFetchingSuggestionsIfDone(fetchedAiRequest);
      }
    };

    // Decide, per watched entity, whether it is due for a full fetch or only a
    // status check this tick.
    const fullFetchPromises: Array<Promise<void>> = [];
    const statusOnlyIds: Array<string> = [];

    const watchParent =
      !!selectedAiRequestId &&
      !!selectedAiRequest &&
      aiRequestShouldBeWatched(selectedAiRequest);
    if (watchParent && selectedAiRequestId) {
      if (now - lastFullFetchTimeRef.current >= fullFetchIntervalInMs) {
        fullFetchPromises.push(doFullFetch(selectedAiRequestId));
      } else {
        statusOnlyIds.push(selectedAiRequestId);
      }
    }
    for (const subAgentId of subAgentIds) {
      const lastFullFetch =
        subAgentLastFullFetchTimeRef.current[subAgentId] || 0;
      if (now - lastFullFetch >= fullFetchIntervalInMs) {
        fullFetchPromises.push(doFullFetch(subAgentId));
      } else {
        statusOnlyIds.push(subAgentId);
      }
    }

    // Batch all status-only checks into a single request. For any entity whose
    // status changed, do a full fetch immediately to pick up the new messages.
    const statusOnlyPromise = (async () => {
      if (statusOnlyIds.length === 0) return;
      const statuses = await getAiRequestStatuses(getAuthorizationHeader, {
        userId: profile.id,
        aiRequestIds: statusOnlyIds,
      });
      const statusById: Map<string, GenerationStatus> = new Map(
        statuses.map(({ id, status }) => [id, status])
      );
      await Promise.all(
        statusOnlyIds.map(async aiRequestId => {
          const newStatus = statusById.get(aiRequestId);
          // Missing from the response (not found / not visible): leave as-is.
          if (newStatus === undefined) return;
          const currentRequest = aiRequests[aiRequestId];
          // Only status-polled entities are already in storage; if not, a full
          // fetch will populate it on a later tick. Nothing to merge into here.
          if (!currentRequest) return;
          if (newStatus !== currentRequest.status) {
            // Status changed — full fetch immediately to pick up new messages.
            await doFullFetch(aiRequestId);
          } else {
            updateAiRequest(aiRequestId, prevRequest => ({
              ...(prevRequest || currentRequest),
              status: newStatus,
            }));
          }
        })
      );
    })();

    try {
      await Promise.all([...fullFetchPromises, statusOnlyPromise]);
    } catch (error) {
      console.warn(
        'Error while watching AI requests. Ignoring and will retry on the next interval.',
        error
      );
    }
  };

  useInterval(
    () => {
      onWatch();
    },
    shouldWatchRequest || hasActiveSubAgents ? watchPollingIntervalInMs : null
  );

  // Clear sub-agents when the parent request is suspended.
  React.useEffect(
    () => {
      if (selectedAiRequest && selectedAiRequest.status === 'suspended') {
        const subAgentIds = removeSubAgentsOfRequest(selectedAiRequest.id);
        if (subAgentIds.length > 0) {
          console.info(
            `Removed ${subAgentIds.length} sub-agents of parent #${
              selectedAiRequest.id
            } as suspended.`
          );
        }
      }
    },
    [selectedAiRequest, removeSubAgentsOfRequest]
  );
  // Clear sub-agents when the selected AI request is changed.
  React.useEffect(
    () => {
      if (!selectedAiRequestId) return;
      return () => {
        const subAgentIds = removeSubAgentsOfRequest(selectedAiRequestId);
        if (subAgentIds.length > 0) {
          console.info(
            `Removed ${
              subAgentIds.length
            } sub-agents of parent #${selectedAiRequestId} as selected AI request changed.`
          );
        }
      };
    },
    [selectedAiRequestId, removeSubAgentsOfRequest]
  );

  const environment = Window.isDev() ? 'staging' : 'live';
  const getAiSettings = useAsyncLazyMemo(
    React.useCallback(
      async (): Promise<AiSettings | null> => {
        try {
          const aiSettings = await retryIfFailed({ times: 2 }, () =>
            fetchAiSettings({
              environment,
            })
          );

          return aiSettings;
        } catch (error) {
          console.error('Error while fetching AI settings:', error);
          return null;
        }
      },
      [environment]
    )
  );

  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        getAiSettings();
      }, AI_SETTINGS_FETCH_TIMEOUT);
      return () => clearTimeout(timeoutId);
    },
    [getAiSettings]
  );

  const activeSubAgents = activeSubAgentsRef.current;

  const state = React.useMemo(
    (): AiRequestContextState => ({
      aiRequestStorage,
      aiRequestHistory,
      editorFunctionCallResultsStorage,
      getAiSettings,
      isFetchingSuggestions,
      setIsFetchingSuggestions,
      selectedAiRequestId,
      setSelectedAiRequestId,
      selectedAiRequest,
      activeSubAgents,
      activateSubAgent,
    }),
    [
      aiRequestStorage,
      aiRequestHistory,
      editorFunctionCallResultsStorage,
      getAiSettings,
      isFetchingSuggestions,
      setIsFetchingSuggestions,
      selectedAiRequestId,
      setSelectedAiRequestId,
      selectedAiRequest,
      activeSubAgents,
      activateSubAgent,
    ]
  );

  return (
    <AiRequestContext.Provider value={state}>
      {children}
    </AiRequestContext.Provider>
  );
};
