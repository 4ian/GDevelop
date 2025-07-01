// @flow
import axios from 'axios';
import { GDevelopGenerationApi } from './ApiConfigs';

export type GenerationStatus = 'working' | 'ready' | 'error';

export type GeneratedProject = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  prompt: string,
  status: GenerationStatus,
  width: number,
  height: number,
  projectName: string,
  fileUrl?: string,
  synopsis?: string,
  error?: string,
};

export type AiRequestMessageAssistantFunctionCall = {|
  type: 'function_call',
  status: 'completed',
  call_id: string,
  name: string,
  arguments: string,
|};

export type AiRequestFunctionCallOutput = {
  type: 'function_call_output',
  call_id: string,
  output: string,
};

export type AiRequestMessage =
  | {
      type: 'message',
      status: 'completed',
      role: 'assistant',
      content: Array<
        | {
            type: 'reasoning',
            status: 'completed',
            summary: {
              text: string,
              type: 'summary_text',
            },
          }
        | {
            type: 'output_text',
            status: 'completed',
            text: string,
            annotations: Array<{}>,
          }
        | AiRequestMessageAssistantFunctionCall
      >,
    }
  | {
      type: 'message',
      status: 'completed',
      role: 'user',
      content: Array<{
        type: 'user_request',
        status: 'completed',
        text: string,
      }>,
    }
  | AiRequestFunctionCallOutput;

export type AiRequest = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  gameId?: string | null,
  gameProjectJson?: string | null,
  status: GenerationStatus,
  mode?: 'chat' | 'agent',
  toolsVersion?: string,

  error: {
    code: string,
    message: string,
  } | null,

  output: Array<AiRequestMessage>,

  lastUserMessagePriceInCredits?: number | null,
  totalPriceInCredits?: number | null,
};

export type AiGeneratedEventStats = {
  retriesCount: number,
  finalMissingTypes: string[],
  systemPromptTemplateHash: string,
  userPromptTemplateHash: string,
  allFeaturesSummaryContentHash: string,
  finalModelPublicId: string,
};

export type AiGeneratedEventUndeclaredVariable = {
  name: string,
  type: 'number' | 'string' | 'boolean' | 'structure' | 'array' | null,
  requiredScope: 'global' | 'scene' | 'none',
};

export type AiGeneratedEventChange = {
  operationName: string,
  operationTargetEvent: string | null,
  isEventsJsonValid: boolean | null,
  generatedEvents: string | null,
  areEventsValid: boolean | null,
  extensionNames: string[] | null,
  diagnosticLines: string[],
  undeclaredVariables: AiGeneratedEventUndeclaredVariable[],
  undeclaredObjectVariables: {
    [objectName: string]: AiGeneratedEventUndeclaredVariable[],
  },
};

export type AiGeneratedEvent = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string | null, // null for calls made by the API.
  status: GenerationStatus,

  partialGameProjectJson: string,
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,

  resultMessage: string | null,
  changes: Array<AiGeneratedEventChange> | null,

  error: {
    code: string,
    message: string,
  } | null,

  stats: AiGeneratedEventStats | null,
};

export type AssetSearch = {
  id: string,
  userId: string,
  createdAt: string,
  query: {
    searchTerms: string[],
    objectType: string,
    description: string | null,
    twoDimensionalViewKind: string | null,
  },
  status: 'completed' | 'failed',
  results: Array<{
    score: number,
    asset: any,
  }> | null,
};

export const getGeneratedProject = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    generatedProjectId,
  }: {|
    userId: string,
    generatedProjectId: string,
  |}
): Promise<GeneratedProject> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/generated-project/${generatedProjectId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const getGeneratedProjects = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<GeneratedProject>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/generated-project`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const createGeneratedProject = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    prompt,
    width,
    height,
    projectName,
  }: {|
    userId: string,
    prompt: string,
    width: number,
    height: number,
    projectName: string,
  |}
): Promise<GeneratedProject> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/generated-project`,
    {
      prompt,
      width,
      height,
      projectName,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const getAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
  }: {|
    userId: string,
    aiRequestId: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-request/${aiRequestId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const getAiRequests = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<AiRequest>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-request`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const createAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    userRequest,
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
    payWithCredits,
    mode,
    gameId,
    fileMetadata,
    storageProviderName,
  }: {|
    userId: string,
    userRequest: string,
    gameProjectJson: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    payWithCredits: boolean,
    mode: 'chat' | 'agent',
    gameId: string | null,
    fileMetadata: ?{
      fileIdentifier: string,
      version?: string,
      lastModifiedDate?: number,
      gameId?: string,
    },
    storageProviderName: ?string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/ai-request`,
    {
      userRequest,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      payWithCredits,
      mode,
      gameId,
      fileMetadata,
      storageProviderName,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const addMessageToAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    functionCallOutputs,
    userMessage,
    payWithCredits,
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
  }: {|
    userId: string,
    aiRequestId: string,
    userMessage: string,
    functionCallOutputs: Array<AiRequestFunctionCallOutput>,
    payWithCredits: boolean,
    gameProjectJson: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/add-message`,
    {
      functionCallOutputs,
      userMessage,
      payWithCredits,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const sendAiRequestFeedback = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    messageIndex,
    feedback,
    reason,
    freeFormDetails,
  }: {|
    userId: string,
    aiRequestId: string,
    messageIndex: number,
    feedback: 'like' | 'dislike',
    reason?: string,
    freeFormDetails?: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${
      GDevelopGenerationApi.baseUrl
    }/ai-request/${aiRequestId}/action/set-feedback`,
    {
      messageIndex,
      feedback,
      reason,
      freeFormDetails,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export type CreateAiGeneratedEventResult =
  | {|
      creationSucceeded: true,
      aiGeneratedEvent: AiGeneratedEvent,
    |}
  | {|
      creationSucceeded: false,
      errorMessage: string,
    |};

export const createAiGeneratedEvent = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    partialGameProjectJson,
    projectSpecificExtensionsSummaryJson,
    sceneName,
    eventsDescription,
    extensionNamesList,
    objectsList,
    existingEventsAsText,
    placementHint,
    relatedAiRequestId,
  }: {|
    userId: string,
    partialGameProjectJson: string,
    projectSpecificExtensionsSummaryJson: string,
    sceneName: string,
    eventsDescription: string,
    extensionNamesList: string,
    objectsList: string,
    existingEventsAsText: string,
    placementHint: string | null,
    relatedAiRequestId: string,
  |}
): Promise<CreateAiGeneratedEventResult> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/ai-generated-event`,
    {
      partialGameProjectJson,
      projectSpecificExtensionsSummaryJson,
      sceneName,
      eventsDescription,
      extensionNamesList,
      objectsList,
      existingEventsAsText,
      placementHint,
      relatedAiRequestId,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
      validateStatus: status => true,
    }
  );

  if (response.status === 200) {
    return {
      creationSucceeded: true,
      aiGeneratedEvent: response.data,
    };
  } else if (response.status === 400) {
    // Report the failure to give a chance to the caller to save this message
    // and retry the generation in a different way.
    return {
      creationSucceeded: false,
      errorMessage: JSON.stringify(response.data),
    };
  }

  // Unexpected error: throw an exception as this can be something like a network error
  // or a server error.
  throw new Error(
    `Error while running AI event generation: ${response.statusText}`
  );
};

export const getAiGeneratedEvent = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiGeneratedEventId,
  }: {|
    userId: string,
    aiGeneratedEventId: string,
  |}
): Promise<AiGeneratedEvent> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-generated-event/${aiGeneratedEventId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const createAssetSearch = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    searchTerms,
    description,
    objectType,
    twoDimensionalViewKind,
  }: {|
    userId: string,
    searchTerms: string,
    description: string,
    objectType: string,
    twoDimensionalViewKind: string,
  |}
): Promise<AssetSearch> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGenerationApi.baseUrl}/asset-search`,
    {
      searchTerms,
      description,
      objectType,
      twoDimensionalViewKind,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};
