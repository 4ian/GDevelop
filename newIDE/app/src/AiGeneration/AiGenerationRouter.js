// @flow
/**
 * Router for AI generation requests.
 * Routes to either GDevelop's cloud API or local Claude Agent SDK server
 * based on the selected preset.
 */
import {
  createAiRequest as createCloudAiRequest,
  getAiRequest as getCloudAiRequest,
  getPartialAiRequest as getPartialCloudAiRequest,
  addMessageToAiRequest as addMessageToCloudAiRequest,
  getAiRequestSuggestions as getCloudAiRequestSuggestions,
  type AiRequest,
  type AiConfiguration,
  type AiRequestFunctionCallOutput,
} from '../Utils/GDevelopServices/Generation';
import {
  createLocalAiRequest,
  getLocalAiRequest,
  getPartialLocalAiRequest,
  addMessageToLocalAiRequest,
  getLocalAiRequestSuggestions,
  isLocalAiAvailable,
} from '../Utils/GDevelopServices/LocalGeneration';
import { isLocalAiPreset } from './AiConfiguration';

// Map request IDs to whether they are local
const localRequestIds = new Set<string>();

const isLocalRequest = (aiRequestId: string): boolean => {
  return localRequestIds.has(aiRequestId);
};

export const createAiRequestRouted = async (
  getAuthorizationHeader: () => Promise<string>,
  params: {|
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
  const presetId = params.aiConfiguration.presetId;

  // Check if this should use local AI
  if (isLocalAiPreset(presetId)) {
    // Check if local AI server is available
    const available = await isLocalAiAvailable();
    if (!available) {
      throw new Error(
        'Local AI server is not available. Make sure the server is running on http://localhost:3030'
      );
    }

    const request = await createLocalAiRequest({
      userId: params.userId,
      userRequest: params.userRequest,
      gameProjectJson: params.gameProjectJson,
      projectSpecificExtensionsSummaryJson: params.projectSpecificExtensionsSummaryJson,
      mode: params.mode,
      aiConfiguration: params.aiConfiguration,
      gameId: params.gameId,
      toolsVersion: params.toolsVersion,
    });

    // Mark this request as local
    localRequestIds.add(request.id);
    return request;
  }

  // Use cloud API
  return createCloudAiRequest(getAuthorizationHeader, params);
};

export const getAiRequestRouted = async (
  getAuthorizationHeader: () => Promise<string>,
  params: {|
    userId: string,
    aiRequestId: string,
  |}
): Promise<AiRequest> => {
  if (isLocalRequest(params.aiRequestId)) {
    return getLocalAiRequest(params);
  }
  return getCloudAiRequest(getAuthorizationHeader, params);
};

export const getPartialAiRequestRouted = async (
  getAuthorizationHeader: () => Promise<string>,
  params: {|
    userId: string,
    aiRequestId: string,
    include: string,
  |}
): Promise<$Shape<AiRequest>> => {
  if (isLocalRequest(params.aiRequestId)) {
    return getPartialLocalAiRequest(params);
  }
  return getPartialCloudAiRequest(getAuthorizationHeader, params);
};

export const addMessageToAiRequestRouted = async (
  getAuthorizationHeader: () => Promise<string>,
  params: {|
    userId: string,
    aiRequestId: string,
    userMessage: string,
    gameId?: string,
    functionCallOutputs: Array<AiRequestFunctionCallOutput>,
    payWithCredits: boolean,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
    paused?: boolean,
    mode?: 'chat' | 'agent',
    toolsVersion?: string,
  |}
): Promise<AiRequest> => {
  if (isLocalRequest(params.aiRequestId)) {
    return addMessageToLocalAiRequest({
      userId: params.userId,
      aiRequestId: params.aiRequestId,
      userMessage: params.userMessage,
      functionCallOutputs: params.functionCallOutputs,
      gameProjectJson: params.gameProjectJson,
      projectSpecificExtensionsSummaryJson: params.projectSpecificExtensionsSummaryJson,
      mode: params.mode,
      toolsVersion: params.toolsVersion,
    });
  }
  return addMessageToCloudAiRequest(getAuthorizationHeader, params);
};

export const getAiRequestSuggestionsRouted = async (
  getAuthorizationHeader: () => Promise<string>,
  params: {|
    userId: string,
    aiRequestId: string,
    suggestionsType: 'simple-list' | 'list-with-explanations',
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
  |}
): Promise<AiRequest> => {
  if (isLocalRequest(params.aiRequestId)) {
    return getLocalAiRequestSuggestions({
      userId: params.userId,
      aiRequestId: params.aiRequestId,
      suggestionsType: params.suggestionsType,
      gameProjectJson: params.gameProjectJson,
      projectSpecificExtensionsSummaryJson: params.projectSpecificExtensionsSummaryJson,
    });
  }
  return getCloudAiRequestSuggestions(getAuthorizationHeader, params);
};

// Clean up tracking for old requests
export const cleanupLocalRequestTracking = (aiRequestId: string) => {
  localRequestIds.delete(aiRequestId);
};
