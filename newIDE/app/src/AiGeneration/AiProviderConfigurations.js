// @flow
import {
  type AiProviderConfiguration,
  type AiRequestCustomProviderSupport,
} from '../Utils/GDevelopServices/Generation';

export type AiProviderPreset = {|
  id: string,
  name: string,
  baseUrl: string,
  model: string,
|};

export const CUSTOM_PROVIDER_SELECTION_ID = 'custom-new';
export const PRESET_SELECTION_PREFIX = 'preset:';
export const CONFIGURATION_SELECTION_PREFIX = 'configuration:';

export const aiProviderPresets: Array<AiProviderPreset> = [
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-5.5',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'openai/gpt-5.2',
  },
  {
    id: 'google-gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: 'gemini-2.5-flash',
  },
  {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'openai/gpt-oss-20b',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    model: 'codestral-latest',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro',
  },
  {
    id: 'xai',
    name: 'xAI',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-4.3',
  },
];

export const getPresetSelectionId = (presetId: string): string =>
  `${PRESET_SELECTION_PREFIX}${presetId}`;

export const getConfigurationSelectionId = (configurationId: string): string =>
  `${CONFIGURATION_SELECTION_PREFIX}${configurationId}`;

export const getPresetIdFromSelectionId = (
  selectionId: string
): string | null =>
  selectionId.indexOf(PRESET_SELECTION_PREFIX) === 0
    ? selectionId.slice(PRESET_SELECTION_PREFIX.length)
    : null;

export const getConfigurationIdFromSelectionId = (
  selectionId: string
): string | null =>
  selectionId.indexOf(CONFIGURATION_SELECTION_PREFIX) === 0
    ? selectionId.slice(CONFIGURATION_SELECTION_PREFIX.length)
    : null;

export const configurationMatchesPreset = (
  configuration: AiProviderConfiguration,
  preset: AiProviderPreset
): boolean =>
  configuration.name === preset.name &&
  configuration.baseUrl === preset.baseUrl;

const getConfigurationUpdatedAtTimestamp = (
  configuration: AiProviderConfiguration
): number => {
  const updatedAtTimestamp = Date.parse(configuration.updatedAt || '');
  return Number.isFinite(updatedAtTimestamp) ? updatedAtTimestamp : 0;
};

export const getPresetConfiguration = (
  configurations: Array<AiProviderConfiguration>,
  preset: AiProviderPreset
): AiProviderConfiguration | null =>
  configurations
    .filter(configuration => configurationMatchesPreset(configuration, preset))
    .sort(
      (configurationA, configurationB) =>
        getConfigurationUpdatedAtTimestamp(configurationB) -
        getConfigurationUpdatedAtTimestamp(configurationA)
    )[0] || null;

export const isPresetConfiguration = (
  configuration: AiProviderConfiguration
): boolean =>
  aiProviderPresets.some(preset =>
    configurationMatchesPreset(configuration, preset)
  );

export const getSelectionIdFromAiProviderConfiguration = (
  configuration: AiProviderConfiguration
): string => {
  const matchingPreset =
    aiProviderPresets.find(preset =>
      configurationMatchesPreset(configuration, preset)
    ) || null;
  return matchingPreset
    ? getPresetSelectionId(matchingPreset.id)
    : getConfigurationSelectionId(configuration.id);
};

export const shouldFetchAiProviderConfigurations = ({
  hasAuthenticatedUser,
  customProviderSupport,
}: {|
  hasAuthenticatedUser: boolean,
  customProviderSupport: AiRequestCustomProviderSupport | null,
|}): boolean =>
  hasAuthenticatedUser &&
  !!customProviderSupport &&
  customProviderSupport.enabled &&
  customProviderSupport.openAiCompatible;

export const getAvailableAiProviderConfigurations = ({
  aiProviderConfigurations,
  customProviderSupport,
}: {|
  aiProviderConfigurations: Array<AiProviderConfiguration>,
  customProviderSupport: AiRequestCustomProviderSupport | null,
|}): Array<AiProviderConfiguration> => {
  if (
    !customProviderSupport ||
    !customProviderSupport.enabled ||
    !customProviderSupport.openAiCompatible
  ) {
    return [];
  }

  return aiProviderConfigurations.filter(
    configuration => configuration.providerType === 'openai-compatible'
  );
};

export const getAiProviderConfigurationFromSelectionId = ({
  selectionId,
  aiProviderConfigurations,
  customProviderSupport,
}: {|
  selectionId: string | null,
  aiProviderConfigurations: Array<AiProviderConfiguration>,
  customProviderSupport: AiRequestCustomProviderSupport | null,
|}): AiProviderConfiguration | null => {
  if (!selectionId) return null;

  const availableAiProviderConfigurations = getAvailableAiProviderConfigurations(
    {
      aiProviderConfigurations,
      customProviderSupport,
    }
  );

  const configurationId = getConfigurationIdFromSelectionId(selectionId);
  if (configurationId) {
    return (
      availableAiProviderConfigurations.find(
        configuration => configuration.id === configurationId
      ) || null
    );
  }

  const presetId = getPresetIdFromSelectionId(selectionId);
  if (!presetId) return null;

  const preset =
    aiProviderPresets.find(preset => preset.id === presetId) || null;
  return preset
    ? getPresetConfiguration(availableAiProviderConfigurations, preset)
    : null;
};
