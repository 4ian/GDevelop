// @flow

/**
 * Thin HTTP client for driving the generation backend with a backend API key,
 * the same way the GDevelop-ai-prompts e2e tests do. We deliberately do NOT
 * reuse `Utils/GDevelopServices/Generation.js` because that client is wired to
 * Firebase user auth; here we authenticate as a trusted (API-key) caller so we
 * can use the evaluation-only model override (see `aiConfiguration` below).
 *
 * Configuration via environment variables:
 *  - GENERATION_API_KEY (or GENERATION_API_KEY_DEV): the backend API key.
 *  - GDEVELOP_GENERATION_API_BASE_URL: defaults to the dev backend.
 */

import axios from 'axios';
import { type AiRequest } from './EvalTypes';

const DEFAULT_BASE_URL = 'https://api-dev.gdevelop.io/generation';

export type BackendClient = {|
  baseUrl: string,
  createAiRequest: (params: {|
    userRequest: string,
    gameProjectJson: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    mode: 'chat' | 'agent' | 'orchestrator',
    toolsVersion: string,
    /**
     * Eval-only: pins models per usage. Honored because we authenticate with an
     * API key. The map flows to spawned sub-agents (they inherit
     * `aiConfiguration`), so pinning 'agent-edit' here pins the edit sub-agent.
     */
    modelOverridesByUsage?: { [usage: string]: string } | null,
    presetId?: string,
  |}) => Promise<AiRequest>,
  getAiRequest: (aiRequestId: string) => Promise<AiRequest>,
  addMessage: (params: {|
    aiRequestId: string,
    functionCallOutputs: Array<{|
      type: 'function_call_output',
      call_id: string,
      output: string,
    |}>,
    gameProjectJson: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
  |}) => Promise<AiRequest>,
  createAiGeneratedEvent: (params: Object) => Promise<Object>,
  getAiGeneratedEvent: (aiGeneratedEventId: string) => Promise<Object>,
|};

export const makeBackendClient = (
  options: ?{| baseUrl?: string, apiKey?: string |}
): BackendClient => {
  const baseUrl =
    (options && options.baseUrl) ||
    process.env.GDEVELOP_GENERATION_API_BASE_URL ||
    DEFAULT_BASE_URL;
  const apiKey =
    (options && options.apiKey) ||
    process.env.GENERATION_API_KEY ||
    process.env.GENERATION_API_KEY_DEV;

  if (!apiKey) {
    throw new Error(
      'Missing backend API key. Set GENERATION_API_KEY (or GENERATION_API_KEY_DEV) in the environment / .env.local.'
    );
  }

  const headers = { Authorization: `api-key ${apiKey}` };

  const createAiRequest = async ({
    userRequest,
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
    mode,
    toolsVersion,
    modelOverridesByUsage,
    presetId,
  }) => {
    const aiConfiguration =
      modelOverridesByUsage || presetId
        ? {
            ...(presetId ? { presetId } : {}),
            ...(modelOverridesByUsage ? { modelOverridesByUsage } : {}),
          }
        : undefined;

    const response = await axios.post(
      `${baseUrl}/ai-request`,
      {
        userRequest,
        gameProjectJson,
        projectSpecificExtensionsSummaryJson,
        mode,
        toolsVersion,
        ...(aiConfiguration ? { aiConfiguration } : {}),
      },
      { headers }
    );
    return response.data;
  };

  const getAiRequest = async (aiRequestId: string) => {
    const response = await axios.get(`${baseUrl}/ai-request/${aiRequestId}`, {
      headers,
    });
    return response.data;
  };

  const addMessage = async ({
    aiRequestId,
    functionCallOutputs,
    gameProjectJson,
    projectSpecificExtensionsSummaryJson,
  }) => {
    const response = await axios.post(
      `${baseUrl}/ai-request/${aiRequestId}/action/add-message`,
      {
        functionCallOutputs,
        gameProjectJson,
        projectSpecificExtensionsSummaryJson,
      },
      { headers, validateStatus: () => true }
    );
    if (response.status !== 200) {
      throw new Error(
        `add-message failed with status ${response.status}: ${JSON.stringify(
          response.data
        )}`
      );
    }
    return response.data;
  };

  const createAiGeneratedEvent = async (params: Object) => {
    const response = await axios.post(`${baseUrl}/ai-generated-event`, params, {
      headers,
    });
    return response.data;
  };

  const getAiGeneratedEvent = async (aiGeneratedEventId: string) => {
    const response = await axios.get(
      `${baseUrl}/ai-generated-event/${aiGeneratedEventId}`,
      { headers }
    );
    return response.data;
  };

  return {
    baseUrl,
    createAiRequest,
    getAiRequest,
    addMessage,
    createAiGeneratedEvent,
    getAiGeneratedEvent,
  };
};
