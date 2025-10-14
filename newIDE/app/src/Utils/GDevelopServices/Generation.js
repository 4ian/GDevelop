// @flow
import axios from 'axios';
import { GDevelopAiCdn, GDevelopGenerationApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { getIDEVersionWithHash } from '../../Version';
import { extractNextPageUriFromLinkHeader } from './Play';

export type Environment = 'staging' | 'live';

export type GenerationStatus = 'working' | 'ready' | 'error';

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

export type AiRequestAssistantMessage = {
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
};

export type AiRequestUserMessage = {
  type: 'message',
  status: 'completed',
  role: 'user',
  content: Array<{
    type: 'user_request',
    status: 'completed',
    text: string,
  }>,
};

export type AiRequestMessage =
  | AiRequestAssistantMessage
  | AiRequestUserMessage
  | AiRequestFunctionCallOutput;

export type AiConfiguration = {
  presetId: string,
};

export type AiRequest = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  gameId?: string | null,
  gameProjectJson?: string | null,
  status: GenerationStatus,
  mode?: 'chat' | 'agent',
  aiConfiguration?: AiConfiguration,
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

export type AiGeneratedEventMissingObjectBehavior = {
  /** The name of the object that is missing the behavior. */
  objectName: string,
  /** The name of the behavior that is missing. */
  name: string,
  /** The type of the behavior that is missing. */
  type: string,
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
  missingObjectBehaviors: {
    [objectName: string]: AiGeneratedEventMissingObjectBehavior[],
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

export const apiClient = axios.create({
  baseURL: GDevelopGenerationApi.baseUrl,
});

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
    forceUri,
  }: {|
    userId: string,
    forceUri: ?string,
  |}
): Promise<{
  aiRequests: Array<AiRequest>,
  nextPageUri: ?string,
}> => {
  const authorizationHeader = await getAuthorizationHeader();
  const uri = forceUri || '/ai-request';

  // $FlowFixMe
  const response = await apiClient.get(uri, {
    headers: {
      Authorization: authorizationHeader,
    },
    params: forceUri ? { userId } : { userId, perPage: 10 },
  });
  const nextPageUri = response.headers.link
    ? extractNextPageUriFromLinkHeader(response.headers.link)
    : null;
  const aiRequests = response.data;
  if (!Array.isArray(aiRequests)) {
    throw new Error('Invalid response from Ai requests API.');
  }

  return {
    aiRequests,
    nextPageUri,
  };
};

export const createAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    userRequest,
    gameProjectJson,
    gameProjectJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
    payWithCredits,
    mode,
    aiConfiguration,
    gameId,
    fileMetadata,
    storageProviderName,
    toolsVersion,
  }: {|
    userId: string,
    userRequest: string,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
    payWithCredits: boolean,
    mode: 'chat' | 'agent',
    aiConfiguration: AiConfiguration,
    gameId: string | null,
    fileMetadata: ?{
      fileIdentifier: string,
      version?: string,
      lastModifiedDate?: number,
      gameId?: string,
    },
    storageProviderName: ?string,
    toolsVersion: string,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    '/ai-request',
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      userRequest,
      gameProjectJson,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJson,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
      payWithCredits,
      mode,
      aiConfiguration,
      gameId,
      fileMetadata,
      storageProviderName,
      toolsVersion,
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
    gameProjectJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
  }: {|
    userId: string,
    aiRequestId: string,
    userMessage: string,
    functionCallOutputs: Array<AiRequestFunctionCallOutput>,
    payWithCredits: boolean,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
  |}
): Promise<AiRequest> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/add-message`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      functionCallOutputs,
      userMessage,
      payWithCredits,
      gameProjectJson,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJson,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
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
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/set-feedback`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
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
    gameProjectJson,
    gameProjectJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
    sceneName,
    eventsDescription,
    extensionNamesList,
    objectsList,
    existingEventsAsText,
    placementHint,
    relatedAiRequestId,
  }: {|
    userId: string,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
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
  const response = await apiClient.post(
    `/ai-generated-event`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      gameProjectJson,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJson,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
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
  const response = await apiClient.get(
    `/ai-generated-event/${aiGeneratedEventId}`,
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
  const response = await apiClient.post(
    `/asset-search`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
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

export type AiUserContentPresignedUrlsResult = {
  gameProjectJsonSignedUrl?: string,
  gameProjectJsonUserRelativeKey?: string,
  projectSpecificExtensionsSummaryJsonSignedUrl?: string,
  projectSpecificExtensionsSummaryJsonUserRelativeKey?: string,
};

export const createAiUserContentPresignedUrls = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    gameProjectJsonHash,
    projectSpecificExtensionsSummaryJsonHash,
  }: {|
    userId: string,
    gameProjectJsonHash: string | null,
    projectSpecificExtensionsSummaryJsonHash: string | null,
  |}
): Promise<AiUserContentPresignedUrlsResult> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-user-content/action/create-presigned-urls`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      gameProjectJsonHash,
      projectSpecificExtensionsSummaryJsonHash,
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

export type AiConfigurationPreset = {|
  mode: 'chat' | 'agent',
  id: string,
  nameByLocale: MessageByLocale,
  disabled: boolean,
  isDefault?: boolean,
|};

export type AiSettings = {
  aiRequest: {
    presets: Array<AiConfigurationPreset>,
  },
};

export const fetchAiSettings = async ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AiSettings> => {
  const response = await axios.get(
    `${GDevelopAiCdn.baseUrl[environment]}/ai-settings.json`
  );
  return response.data;
};
