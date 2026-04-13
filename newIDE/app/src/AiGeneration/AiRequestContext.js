// @flow
import * as React from 'react';
import {
  getAiRequest,
  getPartialAiRequest,
  fetchAiSettings,
  type AiRequest,
  type AiSettings,
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

type AiRequestContextState = {|
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

  // Watch the selected AI request while it needs polling (backend is working,
  // or sub-agents are running). Every ~1.4s we do a partial (status-only) fetch;
  // every 5s we do a full fetch to pick up new messages.
  const onWatch = async () => {
    if (!profile) return;
    if (!selectedAiRequestId || !selectedAiRequest) return;
    if (!aiRequestShouldBeWatched(selectedAiRequest)) return;

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

    const now = Date.now();
    const shouldDoFullFetch =
      now - lastFullFetchTimeRef.current >= fullFetchIntervalInMs;

    try {
      if (shouldDoFullFetch) {
        lastFullFetchTimeRef.current = now;
        const aiRequest = await retryIfFailed({ times: 2 }, () =>
          getAiRequest(getAuthorizationHeader, {
            userId: profile.id,
            aiRequestId: selectedAiRequestId,
          })
        );

        updateAiRequest(selectedAiRequestId, () => aiRequest);
        clearFetchingSuggestionsIfDone(aiRequest);
      } else {
        // Use partial request to only fetch the status between full fetches.
        const partialAiRequest = await getPartialAiRequest(
          getAuthorizationHeader,
          {
            userId: profile.id,
            aiRequestId: selectedAiRequestId,
            include: 'status',
          }
        );

        if (partialAiRequest.status === selectedAiRequest.status) {
          // No status change — just merge the partial data.
          updateAiRequest(selectedAiRequestId, prevRequest => ({
            ...(prevRequest || {}),
            ...partialAiRequest,
          }));
        } else {
          // Status changed — do a full fetch immediately to get the latest data.
          lastFullFetchTimeRef.current = now;
          const aiRequest = await retryIfFailed({ times: 2 }, () =>
            getAiRequest(getAuthorizationHeader, {
              userId: profile.id,
              aiRequestId: selectedAiRequestId,
            })
          );

          updateAiRequest(selectedAiRequestId, () => aiRequest);
          clearFetchingSuggestionsIfDone(aiRequest);
        }
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
      console.info('Activating sub-agent:', subAgentAiRequestId, {
        parentAiRequestId,
        callId,
      });
      if (activeSubAgentsRef.current[subAgentAiRequestId]) return;
      activeSubAgentsRef.current = {
        ...activeSubAgentsRef.current,
        [subAgentAiRequestId]: { parentAiRequestId, callId },
      };
      forceUpdateForSubAgents();
    },
    [forceUpdateForSubAgents]
  );

  const removeSubAgent = React.useCallback(
    (subAgentAiRequestId: string) => {
      console.info('Removing sub-agent:', subAgentAiRequestId);
      const { [subAgentAiRequestId]: _, ...rest } = activeSubAgentsRef.current;
      activeSubAgentsRef.current = rest;
      forceUpdateForSubAgents();
    },
    [forceUpdateForSubAgents]
  );

  // Poll active sub-agent requests & wake up parent when done.
  const subAgentLastFullFetchTimeRef = React.useRef<{
    [subAgentAiRequestId: string]: number,
  }>({});

  const hasActiveSubAgents = Object.keys(activeSubAgentsRef.current).length > 0;

  /**
   * Remove a sub-agent only when the parent AI request has received a
   * function_call_output for the sub-agent's call. Until that point the
   * sub-agent must stay active so it remains in `aiRequestsToProcess` and
   * its own function calls can be processed by the editor.
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
        console.info('Removing sub-agent as done:', subAgentId);
        delete subAgentLastFullFetchTimeRef.current[subAgentId];
        removeSubAgent(subAgentId);
      }
    },
    [aiRequests, removeSubAgent]
  );

  useInterval(
    () => {
      if (!profile) return;
      const subAgents = activeSubAgentsRef.current;
      const subAgentIds = Object.keys(subAgents);
      if (subAgentIds.length === 0) return;

      subAgentIds.forEach(async subAgentId => {
        const now = Date.now();
        const lastFullFetch =
          subAgentLastFullFetchTimeRef.current[subAgentId] || 0;
        const shouldDoFullFetch = now - lastFullFetch >= fullFetchIntervalInMs;

        try {
          if (shouldDoFullFetch) {
            subAgentLastFullFetchTimeRef.current[subAgentId] = now;
            const aiRequest = await retryIfFailed({ times: 2 }, () =>
              getAiRequest(getAuthorizationHeader, {
                userId: profile.id,
                aiRequestId: subAgentId,
              })
            );
            updateAiRequest(subAgentId, () => aiRequest);

            if (aiRequest.status === 'ready' || aiRequest.status === 'error') {
              removeSubAgentIfDone(subAgentId);
            }
          } else {
            const partialAiRequest = await getPartialAiRequest(
              getAuthorizationHeader,
              {
                userId: profile.id,
                aiRequestId: subAgentId,
                include: 'status',
              }
            );

            if (partialAiRequest.status !== 'working') {
              // Status changed — do a full fetch immediately.
              subAgentLastFullFetchTimeRef.current[subAgentId] = now;
              const aiRequest = await retryIfFailed({ times: 2 }, () =>
                getAiRequest(getAuthorizationHeader, {
                  userId: profile.id,
                  aiRequestId: subAgentId,
                })
              );
              updateAiRequest(subAgentId, () => aiRequest);

              if (
                aiRequest.status === 'ready' ||
                aiRequest.status === 'error'
              ) {
                removeSubAgentIfDone(subAgentId);
              }
            } else {
              updateAiRequest(subAgentId, prevRequest => ({
                ...(prevRequest || {}),
                ...partialAiRequest,
              }));
            }
          }
        } catch (error) {
          console.warn(
            `Error while watching sub-agent AI request ${subAgentId}. Will retry on next interval.`,
            error
          );
        }
      });
    },
    hasActiveSubAgents ? watchPollingIntervalInMs : null
  );

  // Clear sub-agents when the parent request is suspended.
  // TODO: is this necessary?
  React.useEffect(
    () => {
      if (selectedAiRequest && selectedAiRequest.status === 'suspended') {
        const subAgents = activeSubAgentsRef.current;
        const subAgentIds = Object.keys(subAgents).filter(
          id => subAgents[id].parentAiRequestId === selectedAiRequestId
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
      }
    },
    [selectedAiRequest, selectedAiRequestId, forceUpdateForSubAgents]
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
