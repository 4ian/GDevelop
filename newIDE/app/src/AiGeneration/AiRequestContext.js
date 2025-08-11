// @flow
import * as React from 'react';
import {
  getAiRequest,
  fetchAiSettings,
  type AiRequest,
  type AiSettings,
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
  aiRequests: { [string]: AiRequest },
  updateAiRequest: (aiRequestId: string, aiRequest: AiRequest) => void,
  refreshAiRequest: (aiRequestId: string) => Promise<void>,
  isSendingAiRequest: (aiRequestId: string | null) => boolean,
  getLastSendError: (aiRequestId: string | null) => ?Error,
  setSendingAiRequest: (aiRequestId: string | null, isSending: boolean) => void,
  setLastSendError: (aiRequestId: string | null, lastSendError: ?Error) => void,
|};

type AiRequestSendState = {|
  isSending: boolean,
  lastSendError: ?Error,
|};

export const useAiRequestsStorage = (): AiRequestStorage => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const [aiRequests, setAiRequests] = React.useState<{ [string]: AiRequest }>(
    {}
  );

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
    aiRequests,
    updateAiRequest,
    refreshAiRequest,
    isSendingAiRequest,
    setSendingAiRequest,
    setLastSendError,
    getLastSendError,
  };
};

type AiRequestContextState = {|
  aiRequestStorage: AiRequestStorage,
  editorFunctionCallResultsStorage: EditorFunctionCallResultsStorage,
  getAiSettings: () => AiSettings | null,
|};

export const AiRequestContext = React.createContext<AiRequestContextState>({
  aiRequestStorage: {
    aiRequests: {},
    updateAiRequest: () => {},
    refreshAiRequest: async () => {},
    isSendingAiRequest: () => false,
    getLastSendError: () => null,
    setSendingAiRequest: () => {},
    setLastSendError: () => {},
  },
  editorFunctionCallResultsStorage: {
    getEditorFunctionCallResults: () => [],
    addEditorFunctionCallResults: () => {},
    clearEditorFunctionCallResults: () => {},
  },
  getAiSettings: () => null,
});

type AiRequestProviderProps = {|
  children: React.Node,
|};

export const AiRequestProvider = ({ children }: AiRequestProviderProps) => {
  const editorFunctionCallResultsStorage = useEditorFunctionCallResultsStorage();
  const aiRequestStorage = useAiRequestsStorage();

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
      editorFunctionCallResultsStorage,
      getAiSettings,
    }),
    [aiRequestStorage, editorFunctionCallResultsStorage, getAiSettings]
  );

  return (
    <AiRequestContext.Provider value={state}>
      {children}
    </AiRequestContext.Provider>
  );
};
