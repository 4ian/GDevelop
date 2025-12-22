// @flow
/**
 * AI Request Wrapper - Handles both GDevelop backend and direct API calls
 * Routes requests based on whether custom API keys are configured
 */

import {
  createAiRequest as gdCreateAiRequest,
  addMessageToAiRequest as gdAddMessageToAiRequest,
  type AiRequest,
  type AiConfiguration,
  type AiRequestFunctionCallOutput,
} from '../../Utils/GDevelopServices/Generation';
import {
  makeDirectApiCall,
  hasCustomApiKeys,
  type DirectApiMessage,
} from './DirectApiClient';
import { isLocalModelPreset } from '../AiConfiguration';

/**
 * Create AI request - routes to GDevelop backend or direct API based on configuration
 */
export const createAiRequestWithCustomKeys = async (
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
  // Check if using custom API keys or local model
  const isUsingCustomKeys = hasCustomApiKeys();
  const isLocal = isLocalModelPreset(params.aiConfiguration.presetId);

  if (isUsingCustomKeys && !isLocal) {
    // Use direct API call with custom keys
    return createDirectAiRequest(params);
  }

  // Use GDevelop's backend (default)
  return gdCreateAiRequest(getAuthorizationHeader, params);
};

/**
 * Add message to AI request - routes to GDevelop backend or direct API
 */
export const addMessageToAiRequestWithCustomKeys = async (
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
  // Check if this request was created with custom keys
  const isUsingCustomKeys = hasCustomApiKeys();

  if (isUsingCustomKeys) {
    // Continue with direct API
    return addDirectAiMessage(params);
  }

  // Use GDevelop's backend (default)
  return gdAddMessageToAiRequest(getAuthorizationHeader, params);
};

/**
 * Create AI request using direct API call
 */
const createDirectAiRequest = async (params: any): Promise<AiRequest> => {
  const messages: Array<DirectApiMessage> = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant for game development with GDevelop.',
    },
    {
      role: 'user',
      content: params.userRequest,
    },
  ];

  const response = await makeDirectApiCall(messages, {
    temperature: 0.7,
    maxTokens: 2000,
  });

  // Convert to AiRequest format
  return {
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: params.userId,
    gameId: params.gameId,
    status: response.success ? 'ready' : 'error',
    mode: params.mode,
    aiConfiguration: params.aiConfiguration,
    toolsVersion: params.toolsVersion,
    error: response.error
      ? {
          code: 'DIRECT_API_ERROR',
          message: response.error,
        }
      : null,
    output: [
      {
        type: 'message',
        status: 'completed',
        role: 'user',
        content: [
          {
            type: 'user_request',
            status: 'completed',
            text: params.userRequest,
          },
        ],
      },
      {
        type: 'message',
        status: 'completed',
        role: 'assistant',
        content: [
          {
            type: 'output_text',
            status: 'completed',
            text: response.content || '',
            annotations: [],
          },
        ],
      },
    ],
    lastUserMessagePriceInCredits: 0, // Free with custom keys!
    totalPriceInCredits: 0,
  };
};

/**
 * Add message using direct API call
 */
const addDirectAiMessage = async (params: any): Promise<AiRequest> => {
  // For now, create a new request
  // TODO: Implement conversation history tracking
  return createDirectAiRequest({
    ...params,
    userRequest: params.userMessage,
  });
};

/**
 * Check if current request is using custom API keys
 */
export const isUsingCustomApiKeys = (aiRequest: ?AiRequest): boolean => {
  if (!aiRequest) return false;
  return aiRequest.id.startsWith('custom-');
};
