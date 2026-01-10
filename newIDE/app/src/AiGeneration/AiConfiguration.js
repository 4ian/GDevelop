// @flow
import { type Limits } from '../Utils/GDevelopServices/Usage';
import {
  type AiConfigurationPreset,
  type AiSettings,
} from '../Utils/GDevelopServices/Generation';
import { LocalAiApi } from '../Utils/GDevelopServices/ApiConfigs';

export type AiConfigurationPresetWithAvailability = {|
  ...AiConfigurationPreset,
  disabled: boolean,
  enableWith: 'higher-tier-plan' | null,
  isLocal?: boolean,
|};

// Local Claude presets when local AI is enabled
const LOCAL_AI_PRESETS: Array<AiConfigurationPresetWithAvailability> = [
  {
    mode: 'agent',
    id: 'local-claude-agent',
    nameByLocale: { en: 'Claude Agent (Local)' },
    disabled: false,
    isDefault: true,
    enableWith: null,
    isLocal: true,
  },
  {
    mode: 'chat',
    id: 'local-claude-chat',
    nameByLocale: { en: 'Claude Chat (Local)' },
    disabled: false,
    isDefault: false,
    enableWith: null,
    isLocal: true,
  },
];

export const isLocalAiPreset = (presetId: string): boolean => {
  return presetId.startsWith('local-');
};

export const getAiConfigurationPresetsWithAvailability = ({
  getAiSettings,
  limits,
}: {|
  getAiSettings: () => AiSettings | null,
  limits: ?Limits,
|}): Array<AiConfigurationPresetWithAvailability> => {
  const aiSettings = getAiSettings();

  // If local AI is enabled, return local presets first
  const useLocalAi = LocalAiApi.isEnabled();

  if (!aiSettings) {
    // If no cloud settings, return local presets if enabled
    if (useLocalAi) {
      return LOCAL_AI_PRESETS;
    }
    return [];
  }

  // Get cloud presets
  let cloudPresets: Array<AiConfigurationPresetWithAvailability>;
  if (!limits) {
    cloudPresets = aiSettings.aiRequest.presets.map(preset => ({
      ...preset,
      enableWith: null,
      disabled: preset.isDefault ? false : true,
      isLocal: false,
    }));
  } else {
    cloudPresets = aiSettings.aiRequest.presets.map(preset => {
      const presetAvailability = limits.capabilities.ai.availablePresets.find(
        presetAvailability =>
          presetAvailability.id === preset.id &&
          presetAvailability.mode === preset.mode
      );

      return {
        ...preset,
        disabled:
          presetAvailability && presetAvailability.disabled !== undefined
            ? presetAvailability.disabled
            : preset.disabled,
        enableWith: (presetAvailability && presetAvailability.enableWith) || null,
        isLocal: false,
      };
    });
  }

  // If local AI is enabled, prepend local presets
  if (useLocalAi) {
    return [...LOCAL_AI_PRESETS, ...cloudPresets];
  }

  return cloudPresets;
};

export const getDefaultAiConfigurationPresetId = (
  mode: 'chat' | 'agent',
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>
): string => {
  const defaultPresetWithAvailability = aiConfigurationPresetsWithAvailability.find(
    preset => preset.isDefault && preset.mode === mode
  );

  return (
    (defaultPresetWithAvailability && defaultPresetWithAvailability.id) ||
    'default'
  );
};
