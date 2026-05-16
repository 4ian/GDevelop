// @flow
import axios from 'axios';
import { GDevelopAiCdn, GDevelopGenerationApi } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { getIDEVersionWithHash } from '../../Version';
import { extractNextPageUriFromLinkHeader } from './Play';
import {
  ensureIsArray,
  ensureIsObject,
  ensureObjectHasProperty,
} from '../DataValidator';

export type Environment = 'staging' | 'live';

export type GenerationStatus = 'working' | 'ready' | 'error' | 'suspended';

export type AiRequestSuggestion = {
  title: string,
  suggestedMessage: string,
};

export type AiRequestSuggestions = {
  explanationMessage: string,
  suggestions: Array<AiRequestSuggestion>,
};

export type AiRequestPlanTask = {
  id: string,
  title: string,
  description: string,
  status: 'pending' | 'in_progress' | 'done' | 'voided',
  dependsOn: string[],
};

export type AiRequestPlan = {
  tasks: AiRequestPlanTask[],
};

export type AiRequestMessageAssistantFunctionCall = {|
  type: 'function_call',
  status: 'completed',
  call_id: string,
  name: string,
  arguments: string,
  taskId?: string,
|};

export type AiRequestFunctionCallOutput = {
  type: 'function_call_output',
  call_id: string,
  output: string,
  suggestions?: AiRequestSuggestions,
  messageId?: string,
  projectVersionIdAfterMessage?: string,
};

type AiRequestAssistantMessageContent = Array<
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
>;

export type AiRequestAssistantMessage = {
  type: 'message',
  status: 'completed',
  role: 'assistant',
  content: AiRequestAssistantMessageContent,
  suggestions?: AiRequestSuggestions,
  messageId?: string,
  projectVersionIdAfterMessage?: string,
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
  messageId?: string,
  projectVersionIdBeforeMessage?: string,
};

export type AiRequestMessage =
  | AiRequestAssistantMessage
  | AiRequestUserMessage
  | AiRequestFunctionCallOutput;

export type AiProviderConfigurationType = 'openai-compatible';

export type AiProviderConfigurationConnectionStatus =
  | 'connected'
  | 'expired'
  | 'unavailable'
  | 'error';

export type AiProviderReasoningEffort =
  | 'none'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh';

export type AiProviderConfiguration = {|
  id: string,
  name: string,
  providerType: AiProviderConfigurationType,
  baseUrl?: string,
  model?: string,
  temperature?: number | null,
  maxTokens?: number | null,
  reasoningEffort?: AiProviderReasoningEffort | null,
  hasApiKey?: boolean,
  connectionStatus?: AiProviderConfigurationConnectionStatus,
  connectionErrorMessage?: string | null,
  createdAt: string,
  updatedAt: string,
|};

export type AiProviderConfigurationWritePayload = {|
  name: string,
  providerType: AiProviderConfigurationType,
  baseUrl: string,
  model: string,
  temperature?: number | null,
  maxTokens?: number | null,
  reasoningEffort?: AiProviderReasoningEffort | null,
  apiKey?: string,
|};

export type AiConfiguration = {
  presetId: string,
  providerConfigurationId?: string | null,
  providerConfiguration?: AiProviderConfigurationWritePayload,
};

export type AiProviderConfigurationTestResult = {|
  success: boolean,
  message?: string,
|};

export type AiRequestCustomProviderSupport = {|
  enabled: boolean,
  openAiCompatible: boolean,
|};

type AiRequestToolOptions = {
  includeEventsJson?: boolean,
  watchPollingIntervalInMs?: number,
};

export type AiRequest = {
  id: string,
  createdAt: string,
  updatedAt: string,
  userId: string,
  gameId?: string | null,
  gameProjectJson?: string | null,
  status: GenerationStatus,
  mode?: 'chat' | 'agent' | 'orchestrator',
  aiConfiguration?: AiConfiguration,
  toolsVersion?: string,
  toolOptions?: AiRequestToolOptions | null,
  forkedFromAiRequestId?: string | null,
  forkedAfterOriginalMessageId?: string | null,
  forkedAfterNewMessageId?: string | null,

  error: {
    code: string,
    message: string,
  } | null,

  output?: Array<AiRequestMessage>,

  lastUserMessagePriceInCredits?: number | null,
  totalPriceInCredits?: number | null,
};

export const getAiRequestWithPreservedAiConfiguration = ({
  aiRequest,
  aiConfiguration,
}: {|
  aiRequest: AiRequest,
  aiConfiguration?: AiConfiguration | null,
|}): AiRequest => {
  if (
    aiRequest.aiConfiguration &&
    (aiRequest.aiConfiguration.providerConfigurationId ||
      aiRequest.aiConfiguration.providerConfiguration)
  ) {
    return aiRequest;
  }

  if (
    !aiConfiguration ||
    (!aiConfiguration.providerConfigurationId &&
      !aiConfiguration.providerConfiguration)
  ) {
    return aiRequest;
  }

  const preservedAiConfiguration: AiConfiguration = {
    ...aiConfiguration,
    ...(aiRequest.aiConfiguration || {}),
    providerConfigurationId: aiConfiguration.providerConfigurationId,
  };
  if (aiConfiguration.providerConfiguration) {
    preservedAiConfiguration.providerConfiguration =
      aiConfiguration.providerConfiguration;
  }

  return { ...aiRequest, aiConfiguration: preservedAiConfiguration };
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

export type AiGeneratedEventMissingResource = {
  resourceName: string,
  resourceKind:
    | 'image'
    | 'audio'
    | 'font'
    | 'video'
    | 'json'
    | 'tilemap'
    | 'tileset'
    | 'model3D'
    | 'atlas'
    | 'spine'
    | 'spritesheet'
    | 'bitmapFont'
    | string,
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
  missingResources: AiGeneratedEventMissingResource[],
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
  existingEventsJson: string | null,
  existingEventsJsonUserRelativeKey: string | null,

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
    relatedAiRequestId: string | null,
    lastUserMessage: string | null,
    lastAssistantMessages: string[],
  },
  status: 'completed' | 'failed',
  results: Array<{
    score: number,
    asset: any,
  }> | null,
};

export type ResourceSearch = {
  id: string,
  userId: string,
  createdAt: string,
  query: {
    searchTerms: string[],
    resourceKind: string,
  },
  status: 'completed' | 'failed',
  results: Array<{
    score: number,
    resource: {
      name: string,
      url: string,
    },
  }> | null,
};

// $FlowFixMe[cannot-resolve-name]
export const apiClient: Axios = axios.create({
  baseURL: GDevelopGenerationApi.baseUrl,
});

export const AI_PROVIDER_UNAVAILABLE_ERROR_CODE = 'AI_PROVIDER_UNAVAILABLE';

export const isAiProviderUnavailableError = (error: any): boolean =>
  !!error &&
  !!error.response &&
  !!error.response.data &&
  error.response.data.code === AI_PROVIDER_UNAVAILABLE_ERROR_CODE;

const localAiProviderConfigurationsStorageKey = 'gd-ai-provider-configurations';
const localAiRequestIdPrefix = 'local-custom-provider-ai-request-';
const localAiGeneratedEventIdPrefix =
  'local-custom-provider-ai-generated-event-';
const openAiCompatibleChatCompletionTimeoutMs = 180000;
const localEventGenerationMinimumMaxTokens = 4096;

type LocalAiProviderConfiguration = {|
  id: string,
  name: string,
  providerType: AiProviderConfigurationType,
  baseUrl: string,
  model: string,
  temperature?: number | null,
  maxTokens?: number | null,
  reasoningEffort?: AiProviderReasoningEffort | null,
  apiKey: string,
  createdAt: string,
  updatedAt: string,
|};

type OpenAiCompatibleToolCall = {|
  id: string,
  type: 'function',
  function: {|
    name: string,
    arguments: string,
  |},
|};

type OpenAiCompatibleMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool',
  content?: string | null,
  tool_call_id?: string,
  tool_calls?: Array<OpenAiCompatibleToolCall>,
};

type OpenAiCompatibleTool = {
  type: 'function',
  function: {
    name: string,
    description: string,
    parameters: any,
  },
};

type OpenAiCompatibleAssistantResult = {|
  text: string,
  functionCalls: Array<AiRequestMessageAssistantFunctionCall>,
|};

type ProviderErrorDetails = {|
  status: number | null,
  code: string,
  param: string,
  message: string,
|};

type OpenAiCompatibleUnsupportedFeature =
  | 'reasoning_effort'
  | 'temperature'
  | 'max_tokens'
  | 'tools';

type OpenAiCompatibleProviderCompatibility = {|
  unsupportedReasoningEffort?: boolean,
  unsupportedTemperature?: boolean,
  unsupportedMaxTokens?: boolean,
  unsupportedTools?: boolean,
|};

let localAiProviderConfigurationsInMemoryByUserId: {
  [userId: string]: Array<LocalAiProviderConfiguration>,
} = {};
let localAiRequestsInMemory: { [aiRequestId: string]: AiRequest } = {};
let localAiRequestProviderConfigurationsInMemory: {
  [aiRequestId: string]: AiProviderConfigurationWritePayload,
} = {};
let localAiGeneratedEventsInMemory: {
  [aiGeneratedEventId: string]: AiGeneratedEvent,
} = {};
let openAiCompatibleProviderCompatibilityByKey: {
  [key: string]: OpenAiCompatibleProviderCompatibility,
} = {};

const getResponseHeader = (error: any, headerName: string): string | null => {
  const headers =
    error && error.response && error.response.headers
      ? error.response.headers
      : null;
  if (!headers) return null;

  const normalizedHeaderName = headerName.toLowerCase();
  const matchingHeaderName = Object.keys(headers).find(
    headerName => headerName.toLowerCase() === normalizedHeaderName
  );
  if (!matchingHeaderName) return null;

  const value = headers[matchingHeaderName];
  return typeof value === 'string' ? value : null;
};

const getParsedJsonObject = (value: string): any | null => {
  try {
    const parsedValue = JSON.parse(value);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : null;
  } catch (error) {
    return null;
  }
};

const getProviderErrorDetails = (error: any): ProviderErrorDetails => {
  const response = error && error.response ? error.response : null;
  const responseData = response ? response.data : null;
  const status =
    response && typeof response.status === 'number' ? response.status : null;
  const messages: Array<string> = [];
  let code = '';
  let param = '';

  const addMessage = (value: any) => {
    if (typeof value === 'string' && value) messages.push(value);
  };

  const collectFromObject = (value: any) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;

    addMessage(value.message);
    if (!code && typeof value.code === 'string') code = value.code;
    if (!param && typeof value.param === 'string') param = value.param;

    if (typeof value.error === 'string') {
      addMessage(value.error);
      const parsedError = getParsedJsonObject(value.error);
      if (parsedError) collectFromObject(parsedError);
    } else if (value.error && typeof value.error === 'object') {
      collectFromObject(value.error);
    }
  };

  if (typeof responseData === 'string') {
    addMessage(responseData);
    const parsedResponseData = getParsedJsonObject(responseData);
    if (parsedResponseData) collectFromObject(parsedResponseData);
  } else {
    collectFromObject(responseData);
  }

  if (!messages.length && error instanceof Error) addMessage(error.message);

  return {
    status,
    code,
    param,
    message: messages.join('\n'),
  };
};

const isExplicitAuthenticationProviderError = (
  details: ProviderErrorDetails
): boolean => {
  if (details.status === 401) return true;

  return /AUTHENTICATION_FAILED|UNAUTHENTICATED|UNAUTHORIZED|INVALID_TOKEN|EXPIRED_TOKEN|ACCESS_DENIED|permission denied/i.test(
    `${details.code} ${details.message}`
  );
};

const getProviderErrorDisplayMessage = (error: any): string | null => {
  const details = getProviderErrorDetails(error);
  const parts = [];
  if (details.status) parts.push(`HTTP ${details.status}`);
  if (details.message) parts.push(details.message);
  const metadata = [];
  if (details.code) metadata.push(`code: ${details.code}`);
  if (details.param) metadata.push(`param: ${details.param}`);

  const mainMessage =
    parts.length > 0
      ? parts.join(': ')
      : error instanceof Error
      ? error.message
      : '';
  const metadataMessage = metadata.length ? ` (${metadata.join(', ')})` : '';
  return mainMessage ? `${mainMessage}${metadataMessage}` : null;
};

export const isAiProviderConfigurationRouteUnavailableError = (
  error: any
): boolean => {
  const errorType = getResponseHeader(error, 'x-amzn-errortype');
  if (!!errorType && errorType.indexOf('IncompleteSignatureException') === 0) {
    return true;
  }

  const details = getProviderErrorDetails(error);
  const message = details.message;
  if (
    /Invalid key=value pair \(missing equal-sign\) in Authorization header/i.test(
      message
    )
  ) {
    return true;
  }

  const generationApiBaseUrl =
    (apiClient.defaults && apiClient.defaults.baseURL) ||
    GDevelopGenerationApi.baseUrl;
  const isDevGenerationApi =
    typeof generationApiBaseUrl === 'string' &&
    generationApiBaseUrl.indexOf('https://api-dev.gdevelop.io/generation') ===
      0;
  return (
    details.status === 403 &&
    isDevGenerationApi &&
    !isExplicitAuthenticationProviderError(details)
  );
};

const getLocalAiProviderConfigurationsStorageKey = (userId: string): string =>
  `${localAiProviderConfigurationsStorageKey}:${userId}`;

const getLocalAiProviderConfigurations = (
  userId: string
): Array<LocalAiProviderConfiguration> => {
  if (typeof localStorage === 'undefined') {
    return localAiProviderConfigurationsInMemoryByUserId[userId] || [];
  }

  try {
    const serializedConfigurations = localStorage.getItem(
      getLocalAiProviderConfigurationsStorageKey(userId)
    );
    return serializedConfigurations ? JSON.parse(serializedConfigurations) : [];
  } catch (error) {
    console.error('Unable to read local AI provider configurations:', error);
    return [];
  }
};

const saveLocalAiProviderConfigurations = (
  userId: string,
  configurations: Array<LocalAiProviderConfiguration>
) => {
  if (typeof localStorage === 'undefined') {
    localAiProviderConfigurationsInMemoryByUserId = {
      ...localAiProviderConfigurationsInMemoryByUserId,
      [userId]: configurations,
    };
    return;
  }

  try {
    localStorage.setItem(
      getLocalAiProviderConfigurationsStorageKey(userId),
      JSON.stringify(configurations)
    );
  } catch (error) {
    console.error('Unable to save local AI provider configurations:', error);
  }
};

const localConfigurationToAiProviderConfiguration = (
  configuration: LocalAiProviderConfiguration
): AiProviderConfiguration => ({
  id: configuration.id,
  name: configuration.name,
  providerType: configuration.providerType,
  baseUrl: configuration.baseUrl,
  model: configuration.model,
  temperature: configuration.temperature,
  maxTokens: configuration.maxTokens,
  reasoningEffort: configuration.reasoningEffort,
  hasApiKey: !!configuration.apiKey,
  connectionStatus: 'connected',
  connectionErrorMessage: null,
  createdAt: configuration.createdAt,
  updatedAt: configuration.updatedAt,
});

const createLocalAiProviderConfigurationId = (): string =>
  `local-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;

export const isLocalAiProviderConfigurationId = (
  providerConfigurationId: string
): boolean => providerConfigurationId.indexOf('local-') === 0;

export const isLocalAiProviderBaseUrl = (baseUrl: string): boolean => {
  try {
    const { hostname } = new URL(baseUrl.trim());
    const normalizedHostname = hostname.toLowerCase();
    return (
      normalizedHostname === 'localhost' ||
      normalizedHostname === '127.0.0.1' ||
      normalizedHostname === '[::1]' ||
      normalizedHostname === '::1'
    );
  } catch (error) {
    return false;
  }
};

const getLocalOnlyAiProviderConfigurations = (
  userId: string
): Array<LocalAiProviderConfiguration> =>
  getLocalAiProviderConfigurations(userId).filter(configuration =>
    isLocalAiProviderConfigurationId(configuration.id)
  );

const saveLocalAiProviderConfiguration = (
  userId: string,
  providerConfigurationId: string,
  configuration: AiProviderConfigurationWritePayload,
  dates?: {| createdAt?: string, updatedAt?: string |}
): AiProviderConfiguration => {
  const configurations = getLocalAiProviderConfigurations(userId);
  const existingConfiguration = configurations.find(
    configuration => configuration.id === providerConfigurationId
  );
  const now = new Date().toISOString();
  const localConfiguration = {
    id: providerConfigurationId,
    name: configuration.name,
    providerType: configuration.providerType,
    baseUrl: configuration.baseUrl,
    model: configuration.model,
    temperature: configuration.temperature,
    maxTokens: configuration.maxTokens,
    reasoningEffort: configuration.reasoningEffort,
    apiKey:
      configuration.apiKey ||
      (existingConfiguration ? existingConfiguration.apiKey : ''),
    createdAt:
      (dates && dates.createdAt) ||
      (existingConfiguration ? existingConfiguration.createdAt : now),
    updatedAt: (dates && dates.updatedAt) || now,
  };

  saveLocalAiProviderConfigurations(userId, [
    ...configurations.filter(
      configuration => configuration.id !== providerConfigurationId
    ),
    localConfiguration,
  ]);
  return localConfigurationToAiProviderConfiguration(localConfiguration);
};

const createLocalAiProviderConfiguration = (
  userId: string,
  configuration: AiProviderConfigurationWritePayload
): AiProviderConfiguration =>
  saveLocalAiProviderConfiguration(
    userId,
    createLocalAiProviderConfigurationId(),
    configuration
  );

const deleteLocalAiProviderConfiguration = (
  userId: string,
  providerConfigurationId: string
) => {
  saveLocalAiProviderConfigurations(
    userId,
    getLocalAiProviderConfigurations(userId).filter(
      configuration => configuration.id !== providerConfigurationId
    )
  );
};

const getLocalAiProviderConfigurationPayload = (
  userId: string,
  providerConfigurationId: string
): AiProviderConfigurationWritePayload | null => {
  const configuration = getLocalAiProviderConfigurations(userId).find(
    configuration => configuration.id === providerConfigurationId
  );
  if (!configuration) return null;

  return {
    name: configuration.name,
    providerType: configuration.providerType,
    baseUrl: configuration.baseUrl,
    model: configuration.model,
    temperature: configuration.temperature,
    maxTokens: configuration.maxTokens,
    reasoningEffort: configuration.reasoningEffort,
    apiKey: configuration.apiKey,
  };
};

const getAiConfigurationWithLocalProvider = (
  userId: string,
  aiConfiguration: AiConfiguration
): AiConfiguration => {
  if (!aiConfiguration.providerConfigurationId) return aiConfiguration;
  if (
    !isLocalAiProviderConfigurationId(aiConfiguration.providerConfigurationId)
  ) {
    return aiConfiguration;
  }

  const providerConfiguration = getLocalAiProviderConfigurationPayload(
    userId,
    aiConfiguration.providerConfigurationId
  );
  return providerConfiguration
    ? { ...aiConfiguration, providerConfiguration }
    : aiConfiguration;
};

const createLocalAiRequestId = (): string =>
  `${localAiRequestIdPrefix}${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;

export const isLocalAiRequestId = (aiRequestId: string): boolean =>
  aiRequestId.indexOf(localAiRequestIdPrefix) === 0;

const createLocalAiRequestMessageId = (role: 'user' | 'assistant'): string =>
  `${role}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;

const createLocalAiGeneratedEventId = (): string =>
  `${localAiGeneratedEventIdPrefix}${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2)}`;

export const isLocalAiGeneratedEventId = (
  aiGeneratedEventId: string
): boolean => aiGeneratedEventId.indexOf(localAiGeneratedEventIdPrefix) === 0;

const createLocalFunctionCallId = (): string =>
  `call_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;

const getPublicAiConfiguration = (
  aiConfiguration: AiConfiguration
): AiConfiguration => {
  const publicAiConfiguration: AiConfiguration = {
    presetId: aiConfiguration.presetId,
  };
  if (aiConfiguration.providerConfigurationId) {
    publicAiConfiguration.providerConfigurationId =
      aiConfiguration.providerConfigurationId;
  }
  return publicAiConfiguration;
};

const getMissingLocalProviderConfigurationError = (): Error =>
  new Error(
    'Custom Model needs the provider API key saved locally. Open Preferences, edit this AI provider, paste the API key, and save it again.'
  );

const assertUsableOpenAiCompatibleConfiguration = (
  providerConfiguration: AiProviderConfigurationWritePayload
) => {
  if (!providerConfiguration.baseUrl || !providerConfiguration.model) {
    throw new Error('Custom Model needs a base URL and model.');
  }
  if (!providerConfiguration.apiKey) {
    throw getMissingLocalProviderConfigurationError();
  }
};

const getOpenAiCompatibleProviderCompatibilityKey = (
  providerConfiguration: AiProviderConfigurationWritePayload
): string =>
  `${providerConfiguration.baseUrl.replace(/\/+$/, '')}|${
    providerConfiguration.model
  }`;

const getOpenAiCompatibleProviderCompatibility = (
  providerConfiguration: AiProviderConfigurationWritePayload
): OpenAiCompatibleProviderCompatibility =>
  openAiCompatibleProviderCompatibilityByKey[
    getOpenAiCompatibleProviderCompatibilityKey(providerConfiguration)
  ] || {};

const markOpenAiCompatibleProviderUnsupportedFeature = (
  providerConfiguration: AiProviderConfigurationWritePayload,
  feature: OpenAiCompatibleUnsupportedFeature
) => {
  const key = getOpenAiCompatibleProviderCompatibilityKey(
    providerConfiguration
  );
  const compatibility: OpenAiCompatibleProviderCompatibility = {
    ...(openAiCompatibleProviderCompatibilityByKey[key] || {}),
  };
  if (feature === 'reasoning_effort') {
    compatibility.unsupportedReasoningEffort = true;
  } else if (feature === 'temperature') {
    compatibility.unsupportedTemperature = true;
  } else if (feature === 'max_tokens') {
    compatibility.unsupportedMaxTokens = true;
  } else if (feature === 'tools') {
    compatibility.unsupportedTools = true;
  }
  openAiCompatibleProviderCompatibilityByKey[key] = compatibility;
};

export const clearOpenAiCompatibleProviderCompatibilityCacheForTests = () => {
  openAiCompatibleProviderCompatibilityByKey = {};
};

const isOpenAiCompatibleTimeoutError = (error: any): boolean =>
  !!error &&
  (error.code === 'ECONNABORTED' ||
    /timeout|timed out/i.test(error.message || ''));

const makeOpenAiCompatibleProviderError = (error: any): Error => {
  if (isOpenAiCompatibleTimeoutError(error)) {
    return new Error(
      'Custom Model did not respond within 180 seconds. Check that the provider is running and try again.'
    );
  }

  const providerMessage = getProviderErrorDisplayMessage(error);
  return new Error(
    providerMessage
      ? `Custom Model request failed: ${providerMessage}`
      : 'Custom Model request failed.'
  );
};

const getOpenAiCompatibleChatCompletionsUrl = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');
  return /\/chat\/completions$/.test(trimmedBaseUrl)
    ? trimmedBaseUrl
    : `${trimmedBaseUrl}/chat/completions`;
};

const makeOpenAiCompatibleTool = ({
  name,
  description,
  properties,
  required,
}: {|
  name: string,
  description: string,
  properties: any,
  required: string[],
|}): OpenAiCompatibleTool => ({
  type: 'function',
  function: {
    name,
    description,
    parameters: {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    },
  },
});

const stringSchema = (description: string): any => ({
  type: 'string',
  description,
});

const numberSchema = (description: string): any => ({
  type: 'number',
  description,
});

const booleanSchema = (description: string): any => ({
  type: 'boolean',
  description,
});

const changedPropertiesSchema = {
  type: 'array',
  description:
    'Properties to change, using exact property names whenever known.',
  items: {
    type: 'object',
    properties: {
      property_name: stringSchema('Property name to edit.'),
      new_value: stringSchema('New value as a string.'),
    },
    required: ['property_name', 'new_value'],
    additionalProperties: false,
  },
};

const localEditorTools: Array<OpenAiCompatibleTool> = [
  makeOpenAiCompatibleTool({
    name: 'initialize_project',
    description:
      'Create or initialize a project when no project is currently open. Use this before other project-editing tools if needed.',
    properties: {
      project_name: stringSchema('Name for the project.'),
      template_slug: stringSchema(
        'Starter template slug, or "empty" for a blank project.'
      ),
      also_read_existing_events: booleanSchema(
        'Whether to include existing starter-template events in the result.'
      ),
    },
    required: ['project_name', 'template_slug'],
  }),
  makeOpenAiCompatibleTool({
    name: 'create_scene',
    description: 'Create a scene/layout in the project.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      include_ui_layer: booleanSchema('Whether to add a UI layer.'),
      background_color: stringSchema(
        'Optional background color, for example "#111827".'
      ),
    },
    required: ['scene_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'create_or_replace_object',
    description:
      'Create, duplicate, or replace an object. Common object_type values include "Sprite", "TextObject::Text", "TiledSpriteObject::TiledSprite", and "PrimitiveDrawing::Drawer".',
    properties: {
      scene_name: stringSchema('Scene where the object is used.'),
      object_name: stringSchema('Object name.'),
      object_type: stringSchema(
        'GDevelop object type. Use "Sprite" for simple visual game objects.'
      ),
      target_object_scope: stringSchema('"scene" or "global". Prefer "scene".'),
      replace_existing_object: booleanSchema(
        'Whether to replace an existing object.'
      ),
      duplicated_object_name: stringSchema(
        'Optional existing object to duplicate.'
      ),
      duplicated_object_scene: stringSchema(
        'Optional scene of the object to duplicate.'
      ),
      search_terms: stringSchema('Optional asset-store search terms.'),
      description: stringSchema('Visual/functional description of the object.'),
      two_dimensional_view_kind: stringSchema(
        'Optional visual kind such as "side", "top-down", or "front".'
      ),
      asset_id: stringSchema('Optional exact or partial asset id.'),
    },
    required: ['scene_name', 'object_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'put_2d_instances',
    description:
      'Create, move, resize, rotate, or erase 2D instances in a scene. Use brush_kind "put" to place objects and "erase" to delete.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      object_name: stringSchema('Object to place or edit.'),
      layer_name: stringSchema(
        'Layer name. Use an empty string for the base layer.'
      ),
      brush_kind: stringSchema('"put" or "erase".'),
      brush_position: stringSchema('Position as "x,y".'),
      brush_end_position: stringSchema(
        'Optional end position as "x,y" for lines/grids.'
      ),
      brush_size: numberSchema('Brush radius/spacing in pixels.'),
      existing_instance_ids: stringSchema(
        'Comma-separated instance id prefixes to edit.'
      ),
      new_instances_count: numberSchema('Number of new instances to create.'),
      row_count: numberSchema('Optional row count for a grid.'),
      column_count: numberSchema('Optional column count for a grid.'),
      instances_z_order: numberSchema('Z order for instances.'),
      instances_size: stringSchema('Optional size as "width,height".'),
    },
    required: ['scene_name', 'object_name', 'layer_name', 'brush_kind'],
  }),
  makeOpenAiCompatibleTool({
    name: 'change_object_property',
    description:
      'Change properties of an existing object. Inspect first if unsure about property names.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      object_name: stringSchema('Object name.'),
      changed_properties: changedPropertiesSchema,
    },
    required: ['scene_name', 'object_name', 'changed_properties'],
  }),
  makeOpenAiCompatibleTool({
    name: 'inspect_object_properties',
    description:
      'Inspect object properties, behaviors, animations, and size information.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      object_name: stringSchema('Object name.'),
    },
    required: ['scene_name', 'object_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'add_behavior',
    description: 'Add a behavior to an object.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      object_name: stringSchema('Object name.'),
      behavior_type: stringSchema('Behavior type name.'),
      behavior_name: stringSchema('Optional behavior instance name.'),
    },
    required: ['scene_name', 'object_name', 'behavior_type'],
  }),
  makeOpenAiCompatibleTool({
    name: 'change_behavior_property',
    description: 'Change behavior properties on an object.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      object_name: stringSchema('Object name.'),
      behavior_name: stringSchema('Behavior name.'),
      changed_properties: changedPropertiesSchema,
    },
    required: [
      'scene_name',
      'object_name',
      'behavior_name',
      'changed_properties',
    ],
  }),
  makeOpenAiCompatibleTool({
    name: 'describe_instances',
    description: 'Read existing scene instances and their ids/positions.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      filter_by_object_name: stringSchema('Optional object-name filter.'),
    },
    required: ['scene_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'read_scene_events',
    description: 'Read the current events of a scene.',
    properties: {
      scene_name: stringSchema('Scene name.'),
    },
    required: ['scene_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'add_scene_events',
    description:
      'Add or modify scene events. For local custom providers, the same model will generate event-change JSON that GDevelop applies.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      events_description: stringSchema(
        'Detailed description of the event logic to create or modify.'
      ),
      extension_names_list: stringSchema(
        'Comma-separated extension names needed by the events, or an empty string.'
      ),
      objects_list: stringSchema(
        'Comma-separated relevant object names and roles.'
      ),
      placement_hint: stringSchema(
        'Where to place the events, for example "insert_at_end".'
      ),
      estimated_complexity: numberSchema(
        'Optional complexity estimate from 1 to 10.'
      ),
    },
    required: ['scene_name', 'events_description', 'extension_names_list'],
  }),
  makeOpenAiCompatibleTool({
    name: 'change_scene_properties_layers_effects_groups',
    description:
      'Change scene/project properties, layers, layer effects, or object groups.',
    properties: {
      scene_name: stringSchema('Scene name.'),
      changed_properties: changedPropertiesSchema,
      changed_layers: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
      },
      changed_layer_effects: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
      },
      changed_groups: {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
      },
    },
    required: ['scene_name'],
  }),
  makeOpenAiCompatibleTool({
    name: 'add_or_edit_variable',
    description: 'Add or edit a global, scene, or object variable.',
    properties: {
      variable_name_or_path: stringSchema('Variable name or child path.'),
      value: stringSchema('Value as a string.'),
      variable_type: stringSchema(
        'Optional: number, string, boolean, structure, or array.'
      ),
      variable_scope: stringSchema('"global", "scene", or "object".'),
      scene_name: stringSchema('Scene name for scene/object variables.'),
      object_name: stringSchema('Object name for object variables.'),
    },
    required: ['variable_name_or_path', 'value', 'variable_scope'],
  }),
];

const shouldUseLocalTools = (
  mode: 'chat' | 'agent' | 'orchestrator'
): boolean => mode === 'agent' || mode === 'orchestrator';

const localEditorToolNames = localEditorTools.map(tool => tool.function.name);

const getProjectContextMessage = ({
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
}: {|
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  mode: 'chat' | 'agent' | 'orchestrator',
|}): OpenAiCompatibleMessage => {
  const contextMessages = [];
  if (gameProjectJson) {
    contextMessages.push(`Simplified project JSON:\n${gameProjectJson}`);
  }
  if (projectSpecificExtensionsSummaryJson) {
    contextMessages.push(
      `Project-specific extensions summary JSON:\n${projectSpecificExtensionsSummaryJson}`
    );
  }

  return {
    role: 'system',
    content: [
      'You are an AI assistant inside GDevelop, a game development app.',
      'Answer the user directly and use the project context when it is available.',
      mode === 'agent' || mode === 'orchestrator'
        ? [
            'The user selected a build/edit mode. You must use the available tools to create or modify the project whenever a tool can do the work.',
            'Do not answer with manual setup steps instead of tool calls. Only explain limitations when no tool can apply the requested change.',
            'For common 2D games, create objects, place instances, then add scene events. Common object types include "Sprite" and "TextObject::Text".',
          ].join(' ')
        : '',
      ...contextMessages,
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
};

const getTextFromOpenAiCompatibleContent = (content: any): string => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  return content
    .map(part => {
      if (typeof part === 'string') return part;
      if (!part || typeof part !== 'object') return '';
      if (part.type === 'function_call') return '';
      return typeof part.text === 'string' ? part.text : '';
    })
    .filter(Boolean)
    .join('\n');
};

const normalizeFunctionCallArguments = (args: any): string => {
  if (typeof args === 'string') return args || '{}';
  if (args === null || typeof args === 'undefined') return '{}';
  return JSON.stringify(args);
};

const createAiRequestFunctionCall = ({
  callId,
  name,
  args,
}: {|
  callId?: string,
  name: string,
  args: any,
|}): AiRequestMessageAssistantFunctionCall => ({
  type: 'function_call',
  status: 'completed',
  call_id: callId || createLocalFunctionCallId(),
  name,
  arguments: normalizeFunctionCallArguments(args),
});

const getFunctionCallsFromOpenAiCompatibleToolCalls = (
  toolCalls: any
): Array<AiRequestMessageAssistantFunctionCall> => {
  if (!Array.isArray(toolCalls)) return [];

  return toolCalls
    .map(toolCall => {
      if (!toolCall || typeof toolCall !== 'object') return null;
      const functionPayload =
        toolCall.function && typeof toolCall.function === 'object'
          ? toolCall.function
          : toolCall;
      const name =
        typeof functionPayload.name === 'string' ? functionPayload.name : null;
      if (!name) return null;

      return createAiRequestFunctionCall({
        callId:
          typeof toolCall.id === 'string'
            ? toolCall.id
            : typeof toolCall.call_id === 'string'
            ? toolCall.call_id
            : undefined,
        name,
        args:
          typeof functionPayload.arguments !== 'undefined'
            ? functionPayload.arguments
            : functionPayload.input,
      });
    })
    .filter(Boolean);
};

const getFunctionCallsFromOpenAiCompatibleContent = (
  content: any
): Array<AiRequestMessageAssistantFunctionCall> => {
  if (!Array.isArray(content)) return [];

  return content
    .map(part => {
      if (!part || typeof part !== 'object') return null;
      if (part.type !== 'function_call') return null;
      const name = typeof part.name === 'string' ? part.name : null;
      if (!name) return null;

      return createAiRequestFunctionCall({
        callId:
          typeof part.call_id === 'string'
            ? part.call_id
            : typeof part.id === 'string'
            ? part.id
            : undefined,
        name,
        args:
          typeof part.arguments !== 'undefined' ? part.arguments : part.input,
      });
    })
    .filter(Boolean);
};

const getOpenAiCompatibleAssistantResultFromResponse = (
  responseData: any
): OpenAiCompatibleAssistantResult => {
  const choices =
    responseData && Array.isArray(responseData.choices)
      ? responseData.choices
      : [];
  const firstChoice = choices[0];
  const message = firstChoice && firstChoice.message ? firstChoice.message : {};
  const content =
    message && 'content' in message
      ? message.content
      : firstChoice
      ? firstChoice.text
      : null;
  const text = getTextFromOpenAiCompatibleContent(content);
  const functionCalls = [
    ...getFunctionCallsFromOpenAiCompatibleToolCalls(
      message ? message.tool_calls : null
    ),
    ...getFunctionCallsFromOpenAiCompatibleToolCalls(
      message && message.function_call ? [message.function_call] : null
    ),
    ...getFunctionCallsFromOpenAiCompatibleContent(content),
  ];

  if (!text && !functionCalls.length) {
    throw new Error('AI provider returned an empty response.');
  }

  return { text, functionCalls };
};

const getOpenAiCompatibleToolCallsFromAiRequestMessage = (
  message: AiRequestAssistantMessage
): Array<OpenAiCompatibleToolCall> => {
  const toolCalls: Array<OpenAiCompatibleToolCall> = [];
  message.content.forEach(content => {
    if (content.type === 'function_call') {
      toolCalls.push({
        id: content.call_id,
        type: 'function',
        function: {
          name: content.name,
          arguments: content.arguments,
        },
      });
    }
  });
  return toolCalls;
};

const getOpenAiCompatibleTextFromAiRequestMessage = (
  message: AiRequestAssistantMessage | AiRequestUserMessage
): string =>
  message.content
    .map(content => {
      if (content.type === 'user_request') return content.text;
      if (content.type === 'output_text') return content.text;
      return '';
    })
    .filter(Boolean)
    .join('\n');

const addAiRequestMessageToOpenAiCompatibleMessages = (
  messages: Array<OpenAiCompatibleMessage>,
  message: AiRequestMessage
) => {
  if (message.type === 'function_call_output') {
    messages.push({
      role: 'tool',
      tool_call_id: message.call_id,
      content: message.output || '',
    });
    return;
  }

  if (message.role === 'user') {
    const text = getOpenAiCompatibleTextFromAiRequestMessage(message);
    if (text) messages.push({ role: 'user', content: text });
    return;
  }

  const text = getOpenAiCompatibleTextFromAiRequestMessage(message);
  const toolCalls = getOpenAiCompatibleToolCallsFromAiRequestMessage(message);
  if (text || toolCalls.length) {
    messages.push({
      role: 'assistant',
      content: text || null,
      ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
    });
  }
};

const getOpenAiCompatibleToolCallPlainText = (
  toolCall: OpenAiCompatibleToolCall
): string =>
  `${toolCall.function.name}(${toolCall.function.arguments || '{}'})`;

const getOpenAiCompatibleMessagesWithoutToolRoles = (
  messages: Array<OpenAiCompatibleMessage>
): Array<OpenAiCompatibleMessage> =>
  messages.map(message => {
    if (message.role === 'tool') {
      return {
        role: 'user',
        content: [
          message.tool_call_id
            ? `Tool result for ${message.tool_call_id}:`
            : 'Tool result:',
          message.content || '',
        ].join('\n'),
      };
    }

    if (message.role === 'assistant' && message.tool_calls) {
      return {
        role: 'assistant',
        content: [
          message.content || '',
          'Tool calls:',
          message.tool_calls
            .map(getOpenAiCompatibleToolCallPlainText)
            .join('\n'),
        ]
          .filter(Boolean)
          .join('\n'),
      };
    }

    return message;
  });

const getOpenAiCompatibleMessagesFromAiRequest = ({
  aiRequest,
  userMessage,
  functionCallOutputs,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  mode,
}: {|
  aiRequest?: AiRequest,
  userMessage: string,
  functionCallOutputs?: Array<AiRequestFunctionCallOutput>,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  mode: 'chat' | 'agent' | 'orchestrator',
|}): Array<OpenAiCompatibleMessage> => {
  const messages = [
    getProjectContextMessage({
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      mode,
    }),
  ];

  if (aiRequest && aiRequest.output) {
    aiRequest.output.forEach(message => {
      addAiRequestMessageToOpenAiCompatibleMessages(messages, message);
    });
  }

  if (functionCallOutputs) {
    functionCallOutputs.forEach(functionCallOutput => {
      addAiRequestMessageToOpenAiCompatibleMessages(
        messages,
        functionCallOutput
      );
    });
  }
  if (userMessage) messages.push({ role: 'user', content: userMessage });
  return messages;
};

const isOpenAiCompatibleUnsupportedTemperatureError = (error: any): boolean => {
  const details = getProviderErrorDetails(error);
  if (details.status !== 400 && details.status !== 422) return false;
  const detailsText = `${details.code} ${details.param} ${details.message}`;
  const usesUnsupportedParameterLanguage = /unsupported[\s_-]*(?:value|parameter|argument)|not\s+supported|unknown\s+(?:parameter|argument)|unrecognized\s+(?:parameter|argument|request\s+argument)/i.test(
    detailsText
  );

  const isUnsupportedTemperatureParam =
    details.param === 'temperature' &&
    (details.code === 'unsupported_value' ||
      details.code === 'unsupported_parameter' ||
      details.code === 'unsupported_argument' ||
      usesUnsupportedParameterLanguage);
  const isUnsupportedTemperatureMessage =
    usesUnsupportedParameterLanguage && /temperature/i.test(detailsText);

  return isUnsupportedTemperatureParam || isUnsupportedTemperatureMessage;
};

const isOpenAiCompatibleUnsupportedReasoningEffortError = (
  error: any
): boolean => {
  const details = getProviderErrorDetails(error);
  if (details.status !== 400 && details.status !== 422) return false;
  const detailsText = `${details.code} ${details.param} ${details.message}`;
  const mentionsReasoningEffort = /reasoning[\s_-]*effort/i.test(detailsText);
  const usesUnsupportedParameterLanguage = /unsupported[\s_-]*(?:value|parameter|argument)|not\s+supported|unknown\s+(?:parameter|argument)|unrecognized\s+(?:parameter|argument|request\s+argument)/i.test(
    detailsText
  );

  const isUnsupportedReasoningEffortParam =
    details.param === 'reasoning_effort' &&
    (details.code === 'unsupported_value' ||
      details.code === 'unsupported_parameter' ||
      details.code === 'unsupported_argument' ||
      usesUnsupportedParameterLanguage);
  const isUnsupportedReasoningEffortMessage =
    mentionsReasoningEffort && usesUnsupportedParameterLanguage;

  return (
    isUnsupportedReasoningEffortParam || isUnsupportedReasoningEffortMessage
  );
};

const isOpenAiCompatibleUnsupportedToolsError = (error: any): boolean => {
  const details = getProviderErrorDetails(error);
  if (details.status !== 400 && details.status !== 422) return false;
  const detailsText = `${details.code} ${details.param} ${details.message}`;
  const mentionsTools = /tools?|tool_choice|function/i.test(detailsText);
  const usesUnsupportedParameterLanguage = /unsupported[\s_-]*(?:value|parameter|argument)|not\s+supported|unknown\s+(?:parameter|argument)|unrecognized\s+(?:parameter|argument|request\s+argument)/i.test(
    detailsText
  );

  return mentionsTools && usesUnsupportedParameterLanguage;
};

const isOpenAiCompatibleUnsupportedMaxTokensError = (error: any): boolean => {
  const details = getProviderErrorDetails(error);
  if (details.status !== 400 && details.status !== 422) return false;
  const detailsText = `${details.code} ${details.param} ${details.message}`;
  const mentionsMaxTokens = /max[\s_-]*tokens|maximum[\s_-]*tokens/i.test(
    detailsText
  );
  const usesUnsupportedParameterLanguage = /unsupported[\s_-]*(?:value|parameter|argument)|not\s+supported|unknown\s+(?:parameter|argument)|unrecognized\s+(?:parameter|argument|request\s+argument)/i.test(
    detailsText
  );

  return mentionsMaxTokens && usesUnsupportedParameterLanguage;
};

const getOpenAiCompatibleChatCompletionBody = ({
  providerConfiguration,
  messages,
  tools,
  toolChoice,
  omitMaxTokens,
}: {|
  providerConfiguration: AiProviderConfigurationWritePayload,
  messages: Array<OpenAiCompatibleMessage>,
  tools?: Array<OpenAiCompatibleTool>,
  toolChoice?: string,
  omitMaxTokens?: boolean,
|}): any => {
  const compatibility = getOpenAiCompatibleProviderCompatibility(
    providerConfiguration
  );
  const messagesForProvider = compatibility.unsupportedTools
    ? getOpenAiCompatibleMessagesWithoutToolRoles(messages)
    : messages;
  const body: any = {
    model: providerConfiguration.model,
    messages: messagesForProvider,
  };
  if (
    typeof providerConfiguration.temperature === 'number' &&
    !compatibility.unsupportedTemperature
  ) {
    body.temperature = providerConfiguration.temperature;
  }
  if (
    typeof providerConfiguration.maxTokens === 'number' &&
    !omitMaxTokens &&
    !compatibility.unsupportedMaxTokens
  ) {
    body.max_tokens = providerConfiguration.maxTokens;
  }
  if (
    providerConfiguration.reasoningEffort &&
    !compatibility.unsupportedReasoningEffort
  ) {
    body.reasoning_effort = providerConfiguration.reasoningEffort;
  }
  if (tools && tools.length && !compatibility.unsupportedTools) {
    body.tools = tools;
    if (toolChoice) body.tool_choice = toolChoice;
  }
  return body;
};

const postOpenAiCompatibleChatCompletion = async ({
  providerConfiguration,
  body,
}: {|
  providerConfiguration: AiProviderConfigurationWritePayload,
  body: any,
|}): Promise<any> => {
  const response = await axios.post<any>(
    getOpenAiCompatibleChatCompletionsUrl(providerConfiguration.baseUrl),
    body,
    {
      headers: {
        Authorization: `Bearer ${providerConfiguration.apiKey || ''}`,
        'Content-Type': 'application/json',
      },
      timeout: openAiCompatibleChatCompletionTimeoutMs,
    }
  );
  return response.data;
};

const postOpenAiCompatibleChatCompletionWithParameterFallbacks = async ({
  providerConfiguration,
  body,
}: {|
  providerConfiguration: AiProviderConfigurationWritePayload,
  body: any,
|}): Promise<any> => {
  let bodyToSend = body;
  let didRemoveTemperature = false;
  let didRemoveReasoningEffort = false;
  let didRemoveMaxTokens = false;

  for (;;) {
    try {
      return await postOpenAiCompatibleChatCompletion({
        providerConfiguration,
        body: bodyToSend,
      });
    } catch (error) {
      if (
        !didRemoveReasoningEffort &&
        typeof bodyToSend.reasoning_effort === 'string' &&
        isOpenAiCompatibleUnsupportedReasoningEffortError(error)
      ) {
        markOpenAiCompatibleProviderUnsupportedFeature(
          providerConfiguration,
          'reasoning_effort'
        );
        const bodyWithoutReasoningEffort = { ...bodyToSend };
        delete bodyWithoutReasoningEffort.reasoning_effort;
        bodyToSend = bodyWithoutReasoningEffort;
        didRemoveReasoningEffort = true;
        continue;
      }

      if (
        !didRemoveTemperature &&
        typeof bodyToSend.temperature === 'number' &&
        isOpenAiCompatibleUnsupportedTemperatureError(error)
      ) {
        markOpenAiCompatibleProviderUnsupportedFeature(
          providerConfiguration,
          'temperature'
        );
        const bodyWithoutTemperature = { ...bodyToSend };
        delete bodyWithoutTemperature.temperature;
        bodyToSend = bodyWithoutTemperature;
        didRemoveTemperature = true;
        continue;
      }

      if (
        !didRemoveMaxTokens &&
        typeof bodyToSend.max_tokens === 'number' &&
        isOpenAiCompatibleUnsupportedMaxTokensError(error)
      ) {
        markOpenAiCompatibleProviderUnsupportedFeature(
          providerConfiguration,
          'max_tokens'
        );
        const bodyWithoutMaxTokens = { ...bodyToSend };
        delete bodyWithoutMaxTokens.max_tokens;
        bodyToSend = bodyWithoutMaxTokens;
        didRemoveMaxTokens = true;
        continue;
      }

      if (bodyToSend.tools && isOpenAiCompatibleUnsupportedToolsError(error)) {
        markOpenAiCompatibleProviderUnsupportedFeature(
          providerConfiguration,
          'tools'
        );
        throw error;
      }

      throw makeOpenAiCompatibleProviderError(error);
    }
  }
};

const parseJsonFromOpenAiCompatibleText = (text: string): any => {
  const trimmedText = text.trim();
  const candidates = [trimmedText];
  const fencedJsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJsonMatch) candidates.push(fencedJsonMatch[1].trim());

  const firstObjectIndex = trimmedText.indexOf('{');
  const lastObjectIndex = trimmedText.lastIndexOf('}');
  if (firstObjectIndex !== -1 && lastObjectIndex > firstObjectIndex) {
    candidates.push(trimmedText.slice(firstObjectIndex, lastObjectIndex + 1));
  }

  const firstArrayIndex = trimmedText.indexOf('[');
  const lastArrayIndex = trimmedText.lastIndexOf(']');
  if (firstArrayIndex !== -1 && lastArrayIndex > firstArrayIndex) {
    candidates.push(trimmedText.slice(firstArrayIndex, lastArrayIndex + 1));
  }

  let lastError = null;
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Custom Model returned invalid JSON: ${
      lastError instanceof Error ? lastError.message : 'Unable to parse JSON.'
    }`
  );
};

const getFunctionCallsFromStrictJsonToolResponse = (
  text: string
): Array<AiRequestMessageAssistantFunctionCall> => {
  const parsed = parseJsonFromOpenAiCompatibleText(text);
  const rawToolCalls = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.tool_calls)
    ? parsed.tool_calls
    : Array.isArray(parsed.function_calls)
    ? parsed.function_calls
    : Array.isArray(parsed.calls)
    ? parsed.calls
    : [];

  return rawToolCalls
    .map(rawToolCall => {
      if (!rawToolCall || typeof rawToolCall !== 'object') return null;
      const functionPayload =
        rawToolCall.function && typeof rawToolCall.function === 'object'
          ? rawToolCall.function
          : rawToolCall;
      const name =
        typeof functionPayload.name === 'string' ? functionPayload.name : null;
      if (!name || localEditorToolNames.indexOf(name) === -1) return null;

      return createAiRequestFunctionCall({
        callId:
          typeof rawToolCall.id === 'string'
            ? rawToolCall.id
            : typeof rawToolCall.call_id === 'string'
            ? rawToolCall.call_id
            : undefined,
        name,
        args:
          typeof functionPayload.arguments !== 'undefined'
            ? functionPayload.arguments
            : functionPayload.input,
      });
    })
    .filter(Boolean);
};

const getStrictJsonToolCallMessages = (
  messages: Array<OpenAiCompatibleMessage>
): Array<OpenAiCompatibleMessage> => [
  ...messages,
  {
    role: 'system',
    content: [
      'The previous response did not contain native tool calls.',
      'Reply only with a JSON object shaped like {"tool_calls":[{"name":"create_scene","arguments":{"scene_name":"Game"}}]}.',
      'Use only these available tool schemas:',
      JSON.stringify(localEditorTools.map(tool => tool.function)),
      'Do not include Markdown, prose, setup instructions, or fields outside the JSON payload.',
    ].join('\n'),
  },
];

const getOpenAiCompatibleChatCompletionResult = async ({
  providerConfiguration,
  messages,
  mode,
  allowTextOnlyResponse = false,
  omitMaxTokens = false,
}: {|
  providerConfiguration: AiProviderConfigurationWritePayload,
  messages: Array<OpenAiCompatibleMessage>,
  mode: 'chat' | 'agent' | 'orchestrator',
  allowTextOnlyResponse?: boolean,
  omitMaxTokens?: boolean,
|}): Promise<OpenAiCompatibleAssistantResult> => {
  assertUsableOpenAiCompatibleConfiguration(providerConfiguration);

  if (!shouldUseLocalTools(mode)) {
    return getOpenAiCompatibleAssistantResultFromResponse(
      await postOpenAiCompatibleChatCompletionWithParameterFallbacks({
        providerConfiguration,
        body: getOpenAiCompatibleChatCompletionBody({
          providerConfiguration,
          messages,
          omitMaxTokens,
        }),
      })
    );
  }

  if (
    !getOpenAiCompatibleProviderCompatibility(providerConfiguration)
      .unsupportedTools
  ) {
    try {
      const result = getOpenAiCompatibleAssistantResultFromResponse(
        await postOpenAiCompatibleChatCompletionWithParameterFallbacks({
          providerConfiguration,
          body: getOpenAiCompatibleChatCompletionBody({
            providerConfiguration,
            messages,
            tools: localEditorTools,
            toolChoice: 'auto',
            omitMaxTokens,
          }),
        })
      );
      if (result.functionCalls.length) return result;
      if (allowTextOnlyResponse) return result;
    } catch (error) {
      if (!isOpenAiCompatibleUnsupportedToolsError(error)) throw error;
    }
  }

  const fallbackResult = getOpenAiCompatibleAssistantResultFromResponse(
    await postOpenAiCompatibleChatCompletionWithParameterFallbacks({
      providerConfiguration,
      body: getOpenAiCompatibleChatCompletionBody({
        providerConfiguration,
        messages: getStrictJsonToolCallMessages(messages),
        omitMaxTokens,
      }),
    })
  );
  if (fallbackResult.functionCalls.length) return fallbackResult;

  let fallbackFunctionCalls: Array<AiRequestMessageAssistantFunctionCall> = [];
  try {
    fallbackFunctionCalls = getFunctionCallsFromStrictJsonToolResponse(
      fallbackResult.text
    );
  } catch (error) {
    if (allowTextOnlyResponse) return fallbackResult;
    throw new Error(
      `Custom Model did not return any tool calls for this build request. ${
        error instanceof Error ? error.message : ''
      }`
    );
  }
  if (fallbackFunctionCalls.length) {
    return {
      text: '',
      functionCalls: fallbackFunctionCalls,
    };
  }

  throw new Error(
    'Custom Model did not return any tool calls for this build request. Choose a model/provider with tool/function calling support or try a more direct build instruction.'
  );
};

const createUserAiRequestMessage = ({
  text,
  projectVersionIdBeforeMessage,
}: {|
  text: string,
  projectVersionIdBeforeMessage?: string | null,
|}): AiRequestUserMessage => {
  let message: AiRequestUserMessage = {
    type: 'message',
    status: 'completed',
    role: 'user',
    content: [
      {
        type: 'user_request',
        status: 'completed',
        text,
      },
    ],
    messageId: createLocalAiRequestMessageId('user'),
  };
  if (projectVersionIdBeforeMessage) {
    message = { ...message, projectVersionIdBeforeMessage };
  }
  return message;
};

const createAssistantAiRequestMessage = ({
  text,
  functionCalls,
}: OpenAiCompatibleAssistantResult): AiRequestAssistantMessage => {
  const content: AiRequestAssistantMessageContent = [];
  if (text) {
    content.push({
      type: 'output_text',
      status: 'completed',
      text,
      annotations: [],
    });
  }
  content.push(...functionCalls);

  return {
    type: 'message',
    status: 'completed',
    role: 'assistant',
    content,
    messageId: createLocalAiRequestMessageId('assistant'),
  };
};

const createLocalChatAiRequest = async ({
  userId,
  userRequest,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  aiConfiguration,
  providerConfiguration,
  gameId,
  projectVersionIdBeforeMessage,
  mode,
  toolsVersion,
  onLocalAiRequestCreated,
}: {|
  userId: string,
  userRequest: string,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  aiConfiguration: AiConfiguration,
  providerConfiguration: AiProviderConfigurationWritePayload,
  gameId: string | null,
  projectVersionIdBeforeMessage?: string | null,
  mode: 'chat' | 'agent' | 'orchestrator',
  toolsVersion: string,
  onLocalAiRequestCreated?: AiRequest => void,
|}): Promise<AiRequest> => {
  const now = new Date().toISOString();
  const aiRequestId = createLocalAiRequestId();
  const workingAiRequest: AiRequest = {
    id: aiRequestId,
    createdAt: now,
    updatedAt: now,
    userId,
    gameId,
    status: 'working',
    mode,
    aiConfiguration: getPublicAiConfiguration(aiConfiguration),
    toolsVersion,
    toolOptions: null,
    error: null,
    output: [
      createUserAiRequestMessage({
        text: userRequest,
        projectVersionIdBeforeMessage,
      }),
    ],
    lastUserMessagePriceInCredits: 0,
    totalPriceInCredits: 0,
  };

  localAiRequestsInMemory[workingAiRequest.id] = workingAiRequest;
  localAiRequestProviderConfigurationsInMemory[
    workingAiRequest.id
  ] = providerConfiguration;
  if (onLocalAiRequestCreated) onLocalAiRequestCreated(workingAiRequest);

  let assistantResult: OpenAiCompatibleAssistantResult;
  try {
    assistantResult = await getOpenAiCompatibleChatCompletionResult({
      providerConfiguration,
      mode,
      messages: getOpenAiCompatibleMessagesFromAiRequest({
        userMessage: userRequest,
        gameProjectJson,
        projectSpecificExtensionsSummaryJson,
        mode,
      }),
    });
  } catch (error) {
    const latestAiRequest = localAiRequestsInMemory[workingAiRequest.id];
    if (latestAiRequest && latestAiRequest.status !== 'suspended') {
      localAiRequestsInMemory[workingAiRequest.id] = {
        ...latestAiRequest,
        updatedAt: new Date().toISOString(),
        status: 'error',
        error: {
          code: 'ai-request/local-provider-error',
          message:
            error instanceof Error
              ? error.message
              : 'Custom Model request failed.',
        },
      };
    }
    throw error;
  }

  const latestAiRequest = localAiRequestsInMemory[workingAiRequest.id];
  if (latestAiRequest && latestAiRequest.status === 'suspended') {
    return latestAiRequest;
  }

  const aiRequest: AiRequest = {
    ...(latestAiRequest || workingAiRequest),
    updatedAt: new Date().toISOString(),
    status: 'ready',
    error: null,
    output: [
      ...((latestAiRequest || workingAiRequest).output || []),
      createAssistantAiRequestMessage(assistantResult),
    ],
    lastUserMessagePriceInCredits: 0,
    totalPriceInCredits: 0,
  };

  localAiRequestsInMemory[aiRequest.id] = aiRequest;
  localAiRequestProviderConfigurationsInMemory[
    aiRequest.id
  ] = providerConfiguration;
  return aiRequest;
};

const addMessageToLocalChatAiRequest = async ({
  aiRequestId,
  userMessage,
  functionCallOutputs,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  projectVersionIdBeforeMessage,
  providerConfiguration,
  mode,
}: {|
  aiRequestId: string,
  userMessage: string,
  functionCallOutputs: Array<AiRequestFunctionCallOutput>,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  projectVersionIdBeforeMessage?: string | null,
  providerConfiguration: AiProviderConfigurationWritePayload,
  mode: 'chat' | 'agent' | 'orchestrator',
|}): Promise<AiRequest> => {
  const existingAiRequest = localAiRequestsInMemory[aiRequestId];
  if (!existingAiRequest) {
    throw new Error(
      'This Custom Model chat is no longer available. Start a new Custom Model chat.'
    );
  }
  if (!userMessage && functionCallOutputs.length === 0) {
    throw new Error('Enter a message before sending to Custom Model.');
  }

  const assistantResult = await getOpenAiCompatibleChatCompletionResult({
    providerConfiguration,
    mode,
    messages: getOpenAiCompatibleMessagesFromAiRequest({
      aiRequest: existingAiRequest,
      userMessage,
      functionCallOutputs,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      mode,
    }),
    allowTextOnlyResponse: functionCallOutputs.length > 0,
  });
  const latestAiRequest = localAiRequestsInMemory[aiRequestId];
  if (latestAiRequest && latestAiRequest.status === 'suspended') {
    return latestAiRequest;
  }

  const nextOutput = [
    ...(existingAiRequest.output || []),
    ...functionCallOutputs,
  ];
  if (userMessage) {
    nextOutput.push(
      createUserAiRequestMessage({
        text: userMessage,
        projectVersionIdBeforeMessage,
      })
    );
  }
  nextOutput.push(createAssistantAiRequestMessage(assistantResult));

  const aiRequest: AiRequest = {
    ...existingAiRequest,
    updatedAt: new Date().toISOString(),
    status: 'ready',
    error: null,
    output: nextOutput,
    lastUserMessagePriceInCredits: 0,
    totalPriceInCredits: 0,
  };

  localAiRequestsInMemory[aiRequest.id] = aiRequest;
  localAiRequestProviderConfigurationsInMemory[
    aiRequest.id
  ] = providerConfiguration;
  return aiRequest;
};

const getProviderErrorMessage = (error: any): string | null => {
  return getProviderErrorDisplayMessage(error);
};

const testLocalAiProviderConfiguration = async (
  userId: string,
  providerConfigurationId: string
): Promise<AiProviderConfigurationTestResult> => {
  const configuration = getLocalAiProviderConfigurations(userId).find(
    configuration => configuration.id === providerConfigurationId
  );
  if (!configuration || !configuration.apiKey) {
    return {
      success: false,
      message: 'Enter an API key before testing this provider.',
    };
  }

  try {
    const baseUrl = configuration.baseUrl.replace(/\/+$/, '');
    await axios.get<any>(
      configuration.baseUrl.indexOf('https://openrouter.ai/') === 0
        ? 'https://openrouter.ai/api/v1/key'
        : `${baseUrl}/models`,
      {
        headers: {
          Authorization: `Bearer ${configuration.apiKey}`,
        },
      }
    );
    return { success: true, message: 'AI provider test succeeded.' };
  } catch (error) {
    return {
      success: false,
      message: getProviderErrorMessage(error) || 'AI provider test failed.',
    };
  }
};

export const listAiProviderConfigurations = async (
  getAuthorizationHeader: () => Promise<string>,
  { userId }: {| userId: string |}
): Promise<Array<AiProviderConfiguration>> => {
  const authorizationHeader = await getAuthorizationHeader();
  try {
    const response = await apiClient.get('/ai-provider-configuration', {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    });
    const backendConfigurations = ensureIsArray({
      data: response.data,
      endpointName: '/ai-provider-configuration of Generation API',
    });
    return [
      ...backendConfigurations,
      ...getLocalOnlyAiProviderConfigurations(userId)
        .filter(
          localConfiguration =>
            !backendConfigurations.some(
              backendConfiguration =>
                backendConfiguration.id === localConfiguration.id
            )
        )
        .map(localConfigurationToAiProviderConfiguration),
    ];
  } catch (error) {
    if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;

    return getLocalAiProviderConfigurations(userId).map(
      localConfigurationToAiProviderConfiguration
    );
  }
};

export const createAiProviderConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    configuration,
  }: {|
    userId: string,
    configuration: AiProviderConfigurationWritePayload,
  |}
): Promise<AiProviderConfiguration> => {
  if (isLocalAiProviderBaseUrl(configuration.baseUrl)) {
    return createLocalAiProviderConfiguration(userId, configuration);
  }

  const authorizationHeader = await getAuthorizationHeader();
  try {
    const response = await apiClient.post(
      '/ai-provider-configuration',
      configuration,
      {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );
    const savedConfiguration = ensureObjectHasProperty({
      data: response.data,
      propertyName: 'id',
      endpointName: '/ai-provider-configuration of Generation API',
    });
    return savedConfiguration;
  } catch (error) {
    if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;

    return createLocalAiProviderConfiguration(userId, configuration);
  }
};

export const updateAiProviderConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    providerConfigurationId,
    configuration,
  }: {|
    userId: string,
    providerConfigurationId: string,
    configuration: AiProviderConfigurationWritePayload,
  |}
): Promise<AiProviderConfiguration> => {
  if (isLocalAiProviderConfigurationId(providerConfigurationId)) {
    if (isLocalAiProviderBaseUrl(configuration.baseUrl)) {
      return saveLocalAiProviderConfiguration(
        userId,
        providerConfigurationId,
        configuration
      );
    }

    const localConfiguration = getLocalAiProviderConfigurationPayload(
      userId,
      providerConfigurationId
    );
    const configurationWithApiKey: AiProviderConfigurationWritePayload = {
      ...configuration,
    };
    const apiKey =
      configuration.apiKey ||
      (localConfiguration ? localConfiguration.apiKey : null);
    if (apiKey) configurationWithApiKey.apiKey = apiKey;
    const authorizationHeader = await getAuthorizationHeader();
    try {
      const response = await apiClient.post(
        '/ai-provider-configuration',
        configurationWithApiKey,
        {
          params: {
            userId,
          },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      );
      const savedConfiguration = ensureObjectHasProperty({
        data: response.data,
        propertyName: 'id',
        endpointName: '/ai-provider-configuration of Generation API',
      });
      deleteLocalAiProviderConfiguration(userId, providerConfigurationId);
      return savedConfiguration;
    } catch (error) {
      if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;

      return saveLocalAiProviderConfiguration(
        userId,
        providerConfigurationId,
        configurationWithApiKey
      );
    }
  }
  if (isLocalAiProviderBaseUrl(configuration.baseUrl)) {
    return createLocalAiProviderConfiguration(userId, configuration);
  }

  const authorizationHeader = await getAuthorizationHeader();
  try {
    const response = await apiClient.patch(
      `/ai-provider-configuration/${providerConfigurationId}`,
      configuration,
      {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );
    const savedConfiguration = ensureObjectHasProperty({
      data: response.data,
      propertyName: 'id',
      endpointName: '/ai-provider-configuration/{id} of Generation API',
    });
    return savedConfiguration;
  } catch (error) {
    if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;

    return createLocalAiProviderConfiguration(userId, configuration);
  }
};

export const deleteAiProviderConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    providerConfigurationId,
  }: {| userId: string, providerConfigurationId: string |}
): Promise<void> => {
  if (isLocalAiProviderConfigurationId(providerConfigurationId)) {
    deleteLocalAiProviderConfiguration(userId, providerConfigurationId);
    return;
  }

  const authorizationHeader = await getAuthorizationHeader();
  try {
    await apiClient.delete(
      `/ai-provider-configuration/${providerConfigurationId}`,
      {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );
  } catch (error) {
    if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;
  }
  deleteLocalAiProviderConfiguration(userId, providerConfigurationId);
};

export const testAiProviderConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    providerConfigurationId,
  }: {| userId: string, providerConfigurationId: string |}
): Promise<AiProviderConfigurationTestResult> => {
  if (isLocalAiProviderConfigurationId(providerConfigurationId)) {
    return testLocalAiProviderConfiguration(userId, providerConfigurationId);
  }

  const authorizationHeader = await getAuthorizationHeader();
  try {
    const response = await apiClient.post(
      `/ai-provider-configuration/${providerConfigurationId}/action/test`,
      {},
      {
        params: {
          userId,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      }
    );
    return ensureIsObject({
      data: response.data,
      endpointName:
        '/ai-provider-configuration/{id}/action/test of Generation API',
    });
  } catch (error) {
    if (!isAiProviderConfigurationRouteUnavailableError(error)) throw error;

    return testLocalAiProviderConfiguration(userId, providerConfigurationId);
  }
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
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (localAiRequest) return localAiRequest;
    throw new Error(
      'This Custom Model chat is no longer available. Start a new Custom Model chat.'
    );
  }

  const authorizationHeader = await getAuthorizationHeader();
  // $FlowFixMe[underconstrained-implicit-instantiation]
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id} of Generation API',
  });
};

export const getPartialAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    include,
  }: {|
    userId: string,
    aiRequestId: string,
    include: string,
  |}
): // $FlowFixMe[deprecated-utility]
Promise<$Shape<AiRequest>> => {
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (localAiRequest) {
      return include === 'status'
        ? {
            id: localAiRequest.id,
            status: localAiRequest.status,
            updatedAt: localAiRequest.updatedAt,
          }
        : localAiRequest;
    }
    throw new Error(
      'This Custom Model chat is no longer available. Start a new Custom Model chat.'
    );
  }

  const authorizationHeader = await getAuthorizationHeader();
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const response = await axios.get(
    `${GDevelopGenerationApi.baseUrl}/ai-request/${aiRequestId}`,
    {
      params: {
        userId,
        include,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id} of Generation API',
  });
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

  // $FlowFixMe[incompatible-type]
  const response = await apiClient.get(uri, {
    headers: {
      Authorization: authorizationHeader,
    },
    params: forceUri ? { userId } : { userId, perPage: 10 },
  });
  const nextPageUri = response.headers.link
    ? extractNextPageUriFromLinkHeader(response.headers.link)
    : null;
  return {
    aiRequests: ensureIsArray({
      data: response.data,
      endpointName: '/ai-request of Generation API',
    }),
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
    projectVersionIdBeforeMessage,
    fileMetadata,
    storageProviderName,
    toolsVersion,
    onLocalAiRequestCreated,
  }: {|
    userId: string,
    userRequest: string,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
    payWithCredits: boolean,
    mode: 'chat' | 'agent' | 'orchestrator',
    aiConfiguration: AiConfiguration,
    gameId: string | null,
    projectVersionIdBeforeMessage?: string | null,
    fileMetadata: ?{
      fileIdentifier: string,
      version?: string,
      lastModifiedDate?: number,
      gameId?: string,
    },
    storageProviderName: ?string,
    toolsVersion: string,
    onLocalAiRequestCreated?: AiRequest => void,
  |}
): Promise<AiRequest> => {
  const aiConfigurationWithLocalProvider = getAiConfigurationWithLocalProvider(
    userId,
    aiConfiguration
  );
  const providerConfiguration =
    aiConfigurationWithLocalProvider.providerConfiguration || null;
  const isUsingLocalAiProvider =
    !!providerConfiguration ||
    (!!aiConfigurationWithLocalProvider.providerConfigurationId &&
      isLocalAiProviderConfigurationId(
        aiConfigurationWithLocalProvider.providerConfigurationId
      ));

  if (isUsingLocalAiProvider) {
    if (!providerConfiguration) {
      throw getMissingLocalProviderConfigurationError();
    }

    return createLocalChatAiRequest({
      userId,
      userRequest,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      aiConfiguration: aiConfigurationWithLocalProvider,
      providerConfiguration,
      gameId,
      projectVersionIdBeforeMessage,
      mode,
      toolsVersion,
      onLocalAiRequestCreated,
    });
  }

  const authorizationHeader = await getAuthorizationHeader();
  const publicAiConfiguration = getPublicAiConfiguration(aiConfiguration);
  const isUsingCustomAiProvider = !!publicAiConfiguration.providerConfigurationId;
  const response = await apiClient.post(
    '/ai-request',
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      userRequest,
      gameProjectJson,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJson,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
      payWithCredits: !isUsingCustomAiProvider && !!payWithCredits,
      payWithAiCredits: !isUsingCustomAiProvider && !payWithCredits,
      mode,
      aiConfiguration: publicAiConfiguration,
      providerConfigurationId:
        publicAiConfiguration.providerConfigurationId || null,
      gameId,
      projectVersionIdBeforeMessage,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request of Generation API',
  });
};

export const addMessageToAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    functionCallOutputs,
    userMessage,
    gameId,
    projectVersionIdBeforeMessage,
    payWithCredits,
    gameProjectJson,
    gameProjectJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
    paused,
    mode,
    toolsVersion,
    aiConfiguration,
  }: {|
    userId: string,
    aiRequestId: string,
    userMessage: string,
    gameId?: string,
    projectVersionIdBeforeMessage?: string | null,
    functionCallOutputs: Array<AiRequestFunctionCallOutput>,
    payWithCredits: boolean,
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
    paused?: boolean,
    mode?: 'chat' | 'agent' | 'orchestrator',
    toolsVersion?: string,
    aiConfiguration?: AiConfiguration,
  |}
): Promise<AiRequest> => {
  const aiConfigurationWithLocalProvider = aiConfiguration
    ? getAiConfigurationWithLocalProvider(userId, aiConfiguration)
    : undefined;
  const providerConfiguration =
    (aiConfigurationWithLocalProvider &&
      aiConfigurationWithLocalProvider.providerConfiguration) ||
    (isLocalAiRequestId(aiRequestId)
      ? localAiRequestProviderConfigurationsInMemory[aiRequestId]
      : null) ||
    null;
  const isUsingLocalAiProvider =
    isLocalAiRequestId(aiRequestId) ||
    !!providerConfiguration ||
    !!(
      aiConfigurationWithLocalProvider &&
      aiConfigurationWithLocalProvider.providerConfigurationId &&
      isLocalAiProviderConfigurationId(
        aiConfigurationWithLocalProvider.providerConfigurationId
      )
    );

  if (isUsingLocalAiProvider) {
    if (!providerConfiguration) {
      throw getMissingLocalProviderConfigurationError();
    }

    return addMessageToLocalChatAiRequest({
      aiRequestId,
      userMessage,
      functionCallOutputs,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      projectVersionIdBeforeMessage,
      providerConfiguration,
      mode: mode || 'chat',
    });
  }

  const authorizationHeader = await getAuthorizationHeader();
  const publicAiConfiguration = aiConfigurationWithLocalProvider
    ? getPublicAiConfiguration(aiConfigurationWithLocalProvider)
    : undefined;
  const isUsingCustomAiProvider = !!(
    publicAiConfiguration && publicAiConfiguration.providerConfigurationId
  );
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/add-message`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      functionCallOutputs,
      userMessage,
      gameId,
      projectVersionIdBeforeMessage,
      payWithCredits: !isUsingCustomAiProvider && !!payWithCredits,
      payWithAiCredits: !isUsingCustomAiProvider && !payWithCredits,
      gameProjectJson,
      gameProjectJsonUserRelativeKey,
      projectSpecificExtensionsSummaryJson,
      projectSpecificExtensionsSummaryJsonUserRelativeKey,
      paused,
      mode,
      toolsVersion,
      aiConfiguration: publicAiConfiguration,
      providerConfigurationId:
        (publicAiConfiguration &&
          publicAiConfiguration.providerConfigurationId) ||
        null,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/add-message of Generation API',
  });
};

export const suspendAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  { userId, aiRequestId }: {| userId: string, aiRequestId: string |}
): Promise<AiRequest> => {
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (!localAiRequest) {
      throw new Error(
        'This Custom Model chat is no longer available. Start a new Custom Model chat.'
      );
    }

    const suspendedAiRequest: AiRequest = {
      ...localAiRequest,
      status: 'suspended',
      updatedAt: new Date().toISOString(),
    };
    localAiRequestsInMemory[aiRequestId] = suspendedAiRequest;
    return suspendedAiRequest;
  }

  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/suspend`,
    {},
    { params: { userId }, headers: { Authorization: authorizationHeader } }
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/suspend of Generation API',
  });
};

export const updateAiRequestMessage = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    aiRequestMessageId,
    projectVersionIdBeforeMessage,
    projectVersionIdAfterMessage,
  }: {|
    userId: string,
    aiRequestId: string,
    aiRequestMessageId: string,
    projectVersionIdBeforeMessage?: ?string,
    projectVersionIdAfterMessage?: ?string,
  |}
): Promise<void> => {
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (!localAiRequest) {
      throw new Error(
        'This Custom Model chat is no longer available. Start a new Custom Model chat.'
      );
    }

    localAiRequestsInMemory[aiRequestId] = {
      ...localAiRequest,
      updatedAt: new Date().toISOString(),
      output: (localAiRequest.output || []).map(
        (message: AiRequestMessage): AiRequestMessage => {
          if (message.messageId !== aiRequestMessageId) return message;
          if (message.type === 'message' && message.role === 'user') {
            return projectVersionIdBeforeMessage
              ? {
                  ...message,
                  projectVersionIdBeforeMessage,
                }
              : message;
          }
          return projectVersionIdAfterMessage
            ? {
                ...message,
                projectVersionIdAfterMessage,
              }
            : message;
        }
      ),
    };
    return;
  }

  const authorizationHeader = await getAuthorizationHeader();
  await apiClient.patch(
    `/ai-request/${aiRequestId}/message/${aiRequestMessageId}`,
    {
      projectVersionIdBeforeMessage,
      projectVersionIdAfterMessage,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/set-feedback of Generation API',
  });
};

export const getAiRequestSuggestions = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    suggestionsType,
    gameProjectJson,
    gameProjectJsonUserRelativeKey,
    projectSpecificExtensionsSummaryJson,
    projectSpecificExtensionsSummaryJsonUserRelativeKey,
  }: {|
    userId: string,
    aiRequestId: string,
    suggestionsType: 'simple-list' | 'list-with-explanations',
    gameProjectJson: string | null,
    gameProjectJsonUserRelativeKey: string | null,
    projectSpecificExtensionsSummaryJson: string | null,
    projectSpecificExtensionsSummaryJsonUserRelativeKey: string | null,
  |}
): Promise<AiRequest> => {
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (localAiRequest) return localAiRequest;
    throw new Error(
      'This Custom Model chat is no longer available. Start a new Custom Model chat.'
    );
  }

  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/get-suggestions`,
    {
      suggestionsType,
      gdevelopVersionWithHash: getIDEVersionWithHash(),
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/get-suggestions of Generation API',
  });
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

const getLocalAiRequestProviderConfiguration = (
  aiRequestId: string
): AiProviderConfigurationWritePayload => {
  const providerConfiguration =
    localAiRequestProviderConfigurationsInMemory[aiRequestId];
  if (!providerConfiguration) {
    throw new Error(
      'This Custom Model build request is no longer available. Start a new Custom Model build request.'
    );
  }
  return providerConfiguration;
};

const getStringArrayOrNull = (value: any): string[] | null => {
  if (!Array.isArray(value)) return null;
  return value.filter(item => typeof item === 'string');
};

const getObjectOrEmpty = (value: any): { [key: string]: any } =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {};

const normalizeLocalAiGeneratedEventChanges = (
  rawResponse: any
): Array<AiGeneratedEventChange> => {
  const rawChanges = Array.isArray(rawResponse)
    ? rawResponse
    : rawResponse && Array.isArray(rawResponse.changes)
    ? rawResponse.changes
    : null;
  if (!rawChanges) {
    throw new Error(
      'Custom Model event response must include a "changes" array.'
    );
  }

  const changes = rawChanges.map((rawChange, index) => {
    if (!rawChange || typeof rawChange !== 'object') {
      throw new Error(`Event change ${index + 1} must be an object.`);
    }

    const operationName =
      typeof rawChange.operationName === 'string'
        ? rawChange.operationName
        : null;
    if (!operationName) {
      throw new Error(`Event change ${index + 1} is missing operationName.`);
    }

    let generatedEvents = null;
    if (
      rawChange.generatedEvents !== null &&
      typeof rawChange.generatedEvents !== 'undefined'
    ) {
      generatedEvents =
        typeof rawChange.generatedEvents === 'string'
          ? rawChange.generatedEvents
          : JSON.stringify(rawChange.generatedEvents);
      try {
        JSON.parse(generatedEvents);
      } catch (error) {
        throw new Error(
          `Custom Model returned invalid generatedEvents JSON for ${operationName}: ${
            error instanceof Error ? error.message : 'Unable to parse JSON.'
          }`
        );
      }
    }

    return {
      operationName,
      operationTargetEvent:
        typeof rawChange.operationTargetEvent === 'string'
          ? rawChange.operationTargetEvent
          : null,
      isEventsJsonValid:
        typeof rawChange.isEventsJsonValid === 'boolean'
          ? rawChange.isEventsJsonValid
          : generatedEvents
          ? true
          : null,
      generatedEvents,
      areEventsValid:
        typeof rawChange.areEventsValid === 'boolean'
          ? rawChange.areEventsValid
          : generatedEvents
          ? true
          : null,
      extensionNames: getStringArrayOrNull(rawChange.extensionNames),
      diagnosticLines: getStringArrayOrNull(rawChange.diagnosticLines) || [],
      undeclaredVariables: Array.isArray(rawChange.undeclaredVariables)
        ? rawChange.undeclaredVariables
        : [],
      undeclaredObjectVariables: getObjectOrEmpty(
        rawChange.undeclaredObjectVariables
      ),
      missingObjectBehaviors: getObjectOrEmpty(
        rawChange.missingObjectBehaviors
      ),
      missingResources: Array.isArray(rawChange.missingResources)
        ? rawChange.missingResources
        : [],
    };
  });

  if (!changes.length) {
    throw new Error('Custom Model event response did not include any changes.');
  }
  return changes;
};

const createLocalAiGeneratedEvent = async ({
  userId,
  gameProjectJson,
  projectSpecificExtensionsSummaryJson,
  sceneName,
  eventsDescription,
  extensionNamesList,
  objectsList,
  existingEventsAsText,
  existingEventsJson,
  existingEventsJsonUserRelativeKey,
  placementHint,
  relatedAiRequestId,
  estimatedComplexity,
  repairInstructions,
}: {|
  userId: string,
  gameProjectJson: string | null,
  projectSpecificExtensionsSummaryJson: string | null,
  sceneName: string,
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,
  existingEventsJson: string | null,
  existingEventsJsonUserRelativeKey: string | null,
  placementHint: string | null,
  relatedAiRequestId: string,
  estimatedComplexity: number | null,
  repairInstructions?: string | null,
|}): Promise<CreateAiGeneratedEventResult> => {
  try {
    const providerConfiguration = getLocalAiRequestProviderConfiguration(
      relatedAiRequestId
    );
    const omitMaxTokens =
      typeof providerConfiguration.maxTokens === 'number' &&
      providerConfiguration.maxTokens < localEventGenerationMinimumMaxTokens;
    const maxAttempts = repairInstructions ? 1 : 2;
    let currentRepairInstructions = repairInstructions || null;
    let lastValidationError: Error | null = null;

    for (let attemptIndex = 0; attemptIndex < maxAttempts; attemptIndex++) {
      const assistantResult = await getOpenAiCompatibleChatCompletionResult({
        providerConfiguration,
        mode: 'chat',
        omitMaxTokens,
        messages: [
          {
            role: 'system',
            content: [
              'You generate GDevelop scene event changes.',
              'Return only JSON shaped like {"resultMessage":"...","changes":[AiGeneratedEventChange]}.',
              'Each change must include operationName. For inserted or replacement events, generatedEvents must be a valid serialized GDevelop EventsList JSON string.',
              'Use operationName "insert_at_end" when adding new events at the end of the scene unless the placement hint requires another supported operation.',
              currentRepairInstructions
                ? [
                    'The previous event response failed validation or could not be applied by GDevelop.',
                    'Use the repair details to correct the same requested event changes.',
                    'Return only the existing event-change JSON shape, with no Markdown, prose, or manual setup instructions.',
                  ].join(' ')
                : 'Do not include Markdown or manual setup instructions.',
            ].join('\n'),
          },
          {
            role: 'user',
            content: JSON.stringify(
              {
                sceneName,
                eventsDescription,
                extensionNamesList,
                objectsList,
                existingEventsAsText,
                existingEventsJson,
                existingEventsJsonUserRelativeKey,
                placementHint,
                estimatedComplexity,
                gameProjectJson,
                projectSpecificExtensionsSummaryJson,
                repairInstructions: currentRepairInstructions,
              },
              null,
              2
            ),
          },
        ],
      });

      try {
        if (!assistantResult.text) {
          throw new Error(
            'Custom Model event response did not include JSON text.'
          );
        }

        const rawResponse = parseJsonFromOpenAiCompatibleText(
          assistantResult.text
        );
        const changes = normalizeLocalAiGeneratedEventChanges(rawResponse);
        const now = new Date().toISOString();
        const aiGeneratedEvent: AiGeneratedEvent = {
          id: createLocalAiGeneratedEventId(),
          createdAt: now,
          updatedAt: now,
          userId,
          status: 'ready',
          partialGameProjectJson: gameProjectJson || '',
          eventsDescription,
          extensionNamesList,
          objectsList,
          existingEventsAsText,
          existingEventsJson,
          existingEventsJsonUserRelativeKey,
          resultMessage:
            rawResponse &&
            typeof rawResponse === 'object' &&
            typeof rawResponse.resultMessage === 'string'
              ? rawResponse.resultMessage
              : 'Custom Model generated event changes.',
          changes,
          error: null,
          stats: null,
        };
        localAiGeneratedEventsInMemory[aiGeneratedEvent.id] = aiGeneratedEvent;

        return {
          creationSucceeded: true,
          aiGeneratedEvent,
        };
      } catch (validationError) {
        lastValidationError =
          validationError instanceof Error
            ? validationError
            : new Error('Custom Model could not generate valid event JSON.');
        currentRepairInstructions = [
          'The previous Custom Model event response failed validation.',
          `Validation error: ${lastValidationError.message}`,
          'Return only JSON shaped like {"resultMessage":"...","changes":[AiGeneratedEventChange]}.',
        ].join('\n');
      }
    }

    throw lastValidationError ||
      new Error('Custom Model could not generate valid event JSON.');
  } catch (error) {
    return {
      creationSucceeded: false,
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Custom Model could not generate valid event JSON.',
    };
  }
};

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
    existingEventsJson,
    existingEventsJsonUserRelativeKey,
    placementHint,
    relatedAiRequestId,
    estimatedComplexity,
    repairInstructions,
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
    existingEventsJson: string | null,
    existingEventsJsonUserRelativeKey: string | null,
    placementHint: string | null,
    relatedAiRequestId: string,
    estimatedComplexity: number | null,
    repairInstructions?: string | null,
  |}
): Promise<CreateAiGeneratedEventResult> => {
  if (isLocalAiRequestId(relatedAiRequestId)) {
    return createLocalAiGeneratedEvent({
      userId,
      gameProjectJson,
      projectSpecificExtensionsSummaryJson,
      sceneName,
      eventsDescription,
      extensionNamesList,
      objectsList,
      existingEventsAsText,
      existingEventsJson,
      existingEventsJsonUserRelativeKey,
      placementHint,
      relatedAiRequestId,
      estimatedComplexity,
      repairInstructions,
    });
  }

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
      existingEventsJson,
      existingEventsJsonUserRelativeKey,
      placementHint,
      relatedAiRequestId,
      estimatedComplexity,
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
    const data = ensureObjectHasProperty({
      data: response.data,
      propertyName: 'id',
      endpointName: '/ai-generated-event of Generation API',
    });
    return {
      creationSucceeded: true,
      aiGeneratedEvent: data,
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
  if (isLocalAiGeneratedEventId(aiGeneratedEventId)) {
    const localAiGeneratedEvent =
      localAiGeneratedEventsInMemory[aiGeneratedEventId];
    if (localAiGeneratedEvent) return localAiGeneratedEvent;
    throw new Error(
      'This Custom Model event generation is no longer available. Start a new Custom Model build request.'
    );
  }

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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-generated-event/{id} of Generation API',
  });
};

export const createAssetSearch = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    searchTerms,
    description,
    objectType,
    twoDimensionalViewKind,
    exactOrPartialAssetId,
    relatedAiRequestId,
    lastUserMessage,
    lastAssistantMessages,
  }: {|
    userId: string,
    searchTerms: string,
    description: string,
    objectType: string | null,
    twoDimensionalViewKind: string,
    exactOrPartialAssetId?: string | null,
    relatedAiRequestId?: string | null,
    lastUserMessage?: string | null,
    lastAssistantMessages?: string[],
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
      exactOrPartialAssetId,
      relatedAiRequestId,
      lastUserMessage,
      lastAssistantMessages,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/asset-search of Generation API',
  });
};

export const createResourceSearch = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    searchTerms,
    resourceKind,
  }: {|
    userId: string,
    searchTerms: string,
    resourceKind: string,
  |}
): Promise<ResourceSearch> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/resource-search`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      searchTerms,
      resourceKind,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/resource-search of Generation API',
  });
};

export type AiUserContentPresignedUrlsResult = {
  gameProjectJsonSignedUrl?: string,
  gameProjectJsonUserRelativeKey?: string,
  projectSpecificExtensionsSummaryJsonSignedUrl?: string,
  projectSpecificExtensionsSummaryJsonUserRelativeKey?: string,
  eventsJsonSignedUrl?: string,
  eventsJsonUserRelativeKey?: string,
};

export const createAiUserContentPresignedUrls = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    gameProjectJsonHash,
    projectSpecificExtensionsSummaryJsonHash,
    eventsJsonHash,
  }: {|
    userId: string,
    gameProjectJsonHash: string | null,
    projectSpecificExtensionsSummaryJsonHash: string | null,
    eventsJsonHash: string | null,
  |}
): Promise<AiUserContentPresignedUrlsResult> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-user-content/action/create-presigned-urls`,
    {
      gdevelopVersionWithHash: getIDEVersionWithHash(),
      gameProjectJsonHash,
      projectSpecificExtensionsSummaryJsonHash,
      eventsJsonHash,
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
  return ensureIsObject({
    data: response.data,
    endpointName:
      '/ai-user-content/action/create-presigned-urls of Generation API',
  });
};

export type AiConfigurationPreset = {|
  mode: 'chat' | 'agent' | 'orchestrator',
  id: string,
  nameByLocale: MessageByLocale,
  disabled: boolean,
  isDefault?: boolean,
|};

export type AiSettings = {
  aiRequest: {
    presets: Array<AiConfigurationPreset>,
    customProviderSupport?: AiRequestCustomProviderSupport,
  },
};

export const developmentDefaultAiRequestCustomProviderSupport: AiRequestCustomProviderSupport = {
  enabled: true,
  openAiCompatible: true,
};

export const getAiRequestCustomProviderSupport = ({
  aiSettings,
  enableDevelopmentFallback,
}: {|
  aiSettings: AiSettings | null,
  enableDevelopmentFallback: boolean,
|}): AiRequestCustomProviderSupport | null => {
  if (
    aiSettings &&
    aiSettings.aiRequest &&
    aiSettings.aiRequest.customProviderSupport
  ) {
    return aiSettings.aiRequest.customProviderSupport;
  }

  return enableDevelopmentFallback
    ? developmentDefaultAiRequestCustomProviderSupport
    : null;
};

export const forkAiRequest = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    aiRequestId,
    upToMessageId,
  }: {|
    userId: string,
    aiRequestId: string,
    upToMessageId?: string,
  |}
): Promise<AiRequest> => {
  if (isLocalAiRequestId(aiRequestId)) {
    const localAiRequest = localAiRequestsInMemory[aiRequestId];
    if (!localAiRequest) {
      throw new Error(
        'This Custom Model chat is no longer available. Start a new Custom Model chat.'
      );
    }

    const output = localAiRequest.output || [];
    let forkedOutput = output;
    let forkedAfterMessageId: string | null = null;
    if (upToMessageId) {
      const messageIndex = output.findIndex(
        message => message.messageId === upToMessageId
      );
      if (messageIndex === -1) {
        throw new Error(
          'This Custom Model chat message is no longer available. Start a new Custom Model chat.'
        );
      }

      forkedOutput = output.slice(0, messageIndex + 1);
      forkedAfterMessageId = upToMessageId;
    }

    const now = new Date().toISOString();
    const forkedAiRequest: AiRequest = {
      ...localAiRequest,
      id: createLocalAiRequestId(),
      createdAt: now,
      updatedAt: now,
      status: 'ready',
      output: forkedOutput,
      forkedFromAiRequestId: localAiRequest.id,
      forkedAfterOriginalMessageId: forkedAfterMessageId,
      forkedAfterNewMessageId: forkedAfterMessageId,
    };
    localAiRequestsInMemory[forkedAiRequest.id] = forkedAiRequest;
    const providerConfiguration =
      localAiRequestProviderConfigurationsInMemory[aiRequestId];
    if (providerConfiguration) {
      localAiRequestProviderConfigurationsInMemory[
        forkedAiRequest.id
      ] = providerConfiguration;
    }
    return forkedAiRequest;
  }

  const authorizationHeader = await getAuthorizationHeader();
  const response = await apiClient.post(
    `/ai-request/${aiRequestId}/action/fork`,
    {
      upToMessageId,
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
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'id',
    endpointName: '/ai-request/{id}/action/fork of Generation API',
  });
};

export const fetchAiSettings = async ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AiSettings> => {
  // $FlowFixMe[underconstrained-implicit-instantiation]
  const response = await axios.get(
    `${GDevelopAiCdn.baseUrl[environment]}/ai-settings.json`
  );
  return ensureObjectHasProperty({
    data: response.data,
    propertyName: 'aiRequest',
    endpointName: '/ai-settings.json of Generation API',
  });
};
