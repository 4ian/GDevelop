// @flow
import axios from 'axios';
import { LocalAiApi } from './ApiConfigs';
import type {
  AiRequest,
  AiConfiguration,
} from './Generation';
import {
  ensureObjectHasProperty,
} from '../DataValidator';
import { getIDEVersionWithHash } from '../../Version';

/**
 * Local AI Generation service that uses Claude Agent SDK
 * running on localhost instead of GDevelop's cloud API.
 */

export const localAiClient = axios.create({
  // Will be updated dynamically
});

export const isLocalAiAvailable = async (): Promise<boolean> => {
  if (!LocalAiApi.isEnabled()) return false;

  try {
    const response = await axios.get(`${LocalAiApi.getBaseUrl()}/health`, {
      timeout: 2000,
    });
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
};

export const createLocalAiRequest = async ({
  userId,
  userRequest,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
  aiConfiguration,
  gameId,
  toolsVersion,
}: {|
  userId: string,
  userRequest: string,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  mode: 'chat' | 'agent',
  aiConfiguration: AiConfiguration,
  gameId: string | null,
  toolsVersion: string,
|}): Promise<AiRequest> => {
  const baseUrl = LocalAiApi.getBaseUrl();
  const response = await axios.post(
    `${baseUrl}/ai-request`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      userRequest,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      mode,
      aiConfiguration,
      gameId,
      toolsVersion,
    },
    {
      params: { userId },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request of Local AI Server',
  });
};

export const getLocalAiRequest = async ({
  userId,
  aiRequestId,
}: {|
  userId: string,
  aiRequestId: string,
|}): Promise<AiRequest> => {
  const baseUrl = LocalAiApi.getBaseUrl();
  const response = await axios.get(
    `${baseUrl}/ai-request/${aiRequestId}`,
    {
      params: { userId },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id} of Local AI Server',
  });
};

export const getPartialLocalAiRequest = async ({
  userId,
  aiRequestId,
  include,
}: {|
  userId: string,
  aiRequestId: string,
  include: string,
|}): Promise<$Shape<AiRequest>> => {
  const baseUrl = LocalAiApi.getBaseUrl();
  const response = await axios.get(
    `${baseUrl}/ai-request/${aiRequestId}`,
    {
      params: { userId, include },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id} of Local AI Server',
  });
};

export const addMessageToLocalAiRequest = async ({
  userId,
  aiRequestId,
  userMessage,
  functionCallOutputs,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
  toolsVersion,
}: {|
  userId: string,
  aiRequestId: string,
  userMessage: string,
  functionCallOutputs: Array<any>,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  mode?: 'chat' | 'agent',
  toolsVersion?: string,
|}): Promise<AiRequest> => {
  const baseUrl = LocalAiApi.getBaseUrl();
  const response = await axios.post(
    `${baseUrl}/ai-request/${aiRequestId}/action/add-message`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      userMessage,
      functionCallOutputs,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      mode,
      toolsVersion,
    },
    {
      params: { userId },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/add-message of Local AI Server',
  });
};

export const getLocalAiRequestSuggestions = async ({
  userId,
  aiRequestId,
  suggestionsType,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
}: {|
  userId: string,
  aiRequestId: string,
  suggestionsType: string,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
|}): Promise<AiRequest> => {
  const baseUrl = LocalAiApi.getBaseUrl();
  const response = await axios.post(
    `${baseUrl}/ai-request/${aiRequestId}/action/get-suggestions`,
    {
      suggestionsType,
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
    },
    {
      params: { userId },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/get-suggestions of Local AI Server',
  });
};

// Local AI settings with Claude as the default preset
export const fetchLocalAiSettings = async (): Promise<{
  aiRequest: { presets: Array<any> },
}> => {
  return {
    aiRequest: {
      presets: [
        {
          mode: 'agent',
          id: 'local-claude-agent',
          nameByLocale: { en: 'Claude (Local)' },
          disabled: false,
          isDefault: true,
        },
        {
          mode: 'chat',
          id: 'local-claude-chat',
          nameByLocale: { en: 'Claude Chat (Local)' },
          disabled: false,
          isDefault: false,
        },
      ],
    },
  };
};
