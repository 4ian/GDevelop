// @flow
import * as React from 'react';
import {
  getAiRequest,
  fetchAiSettings,
  type AiRequest,
  type AiSettings,
  getAiRequests,
} from '../Utils/GDevelopServices/Generation';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type EditorFunctionCallResult } from '../EditorFunctions/EditorFunctionCallRunner';
import Window from '../Utils/Window';
import { AI_SETTINGS_FETCH_TIMEOUT } from '../Utils/GlobalFetchTimeouts';
import { useAsyncLazyMemo } from '../Utils/UseLazyMemo';
import { retryIfFailed } from '../Utils/RetryIfFailed';

type EditorFunctionCallResultsStorage = {|
  getEditorFunctionCallResults: (
    aiRequestId: string
  ) => Array<EditorFunctionCallResult> | null,
  addEditorFunctionCallResults: (
    aiRequestId: string,
    editorFunctionCallResults: EditorFunctionCallResult[]
  ) => void,
  clearEditorFunctionCallResults: (aiRequestId: string) => void,
|};

const useEditorFunctionCallResultsStorage = (): EditorFunctionCallResultsStorage => {
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

type AiRequestStorage = {|
  fetchAiRequests: () => Promise<void>,
  onLoadMoreAiRequests: () => Promise<void>,
  canLoadMore: boolean,
  error: ?Error,
  isLoading: boolean,
  aiRequests: { [string]: AiRequest },
  updateAiRequest: (aiRequestId: string, aiRequest: AiRequest) => void,
  refreshAiRequest: (aiRequestId: string) => Promise<void>,
  isSendingAiRequest: (aiRequestId: string | null) => boolean,
  getLastSendError: (aiRequestId: string | null) => ?Error,
  setSendingAiRequest: (aiRequestId: string | null, isSending: boolean) => void,
  setLastSendError: (aiRequestId: string | null, lastSendError: ?Error) => void,
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
  aiRequests: { [string]: AiRequest },
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
    (aiRequestId: string, aiRequest: AiRequest) => {
      setState(prevState => ({
        ...prevState,
        aiRequests: {
          ...(prevState.aiRequests || {}),
          [aiRequestId]: aiRequest,
        },
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
        .sort(
          // $FlowFixMe - Object.values() loses the type of aiRequests.
          (a: AiRequest, b: AiRequest) => {
            return (
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            );
          }
        )
        .forEach(
          // $FlowFixMe - Object.values() loses the type of aiRequests.
          (request: AiRequest) => {
            const userMessages = request.output
              .filter(
                message => message.type === 'message' && message.role === 'user'
              )
              .map(
                // $FlowFixMe - We filtered the type above.
                (message: AiRequestUserMessage) => {
                  const userRequest = message.content.find(
                    item => item.type === 'user_request'
                  );
                  return userRequest ? userRequest.text : '';
                }
              )
              .filter(text => text !== '');

            history.push(...userMessages);
          }
        );

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

type AiRequestContextState = {|
  aiRequestStorage: AiRequestStorage,
  aiRequestHistory: AiRequestHistory,
  editorFunctionCallResultsStorage: EditorFunctionCallResultsStorage,
  getAiSettings: () => AiSettings | null,
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
  },
  aiRequestHistory: {
    handleNavigateHistory: ({ direction, currentText, onChangeText }) => {},
    resetNavigation: () => {},
  },
  editorFunctionCallResultsStorage: {
    getEditorFunctionCallResults: () => [],
    addEditorFunctionCallResults: () => {},
    clearEditorFunctionCallResults: () => {},
  },
  getAiSettings: () => null,
};
export const AiRequestContext = React.createContext<AiRequestContextState>(
  initialAiRequestContextState
);

type AiRequestProviderProps = {|
  children: React.Node,
|};

export const AiRequestProvider = ({ children }: AiRequestProviderProps) => {
  const editorFunctionCallResultsStorage = useEditorFunctionCallResultsStorage();
  const aiRequestStorage = useAiRequestsStorage();
  const aiRequestHistory = useAiRequestHistory(aiRequestStorage);

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

  const state = React.useMemo(
    () => ({
      aiRequestStorage,
      aiRequestHistory,
      editorFunctionCallResultsStorage,
      getAiSettings,
    }),
    [
      aiRequestStorage,
      aiRequestHistory,
      editorFunctionCallResultsStorage,
      getAiSettings,
    ]
  );

  return (
    <AiRequestContext.Provider value={state}>
      {children}
    </AiRequestContext.Provider>
  );
};
