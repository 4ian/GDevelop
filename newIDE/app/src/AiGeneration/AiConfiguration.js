// @flow
import { type Limits } from '../Utils/GDevelopServices/Usage';
import {
  type AiConfigurationPreset,
  type AiSettings,
} from '../Utils/GDevelopServices/Generation';
import {
  isCustomEndpointEnabled,
  DEFAULT_LOCAL_AI_SETTINGS,
} from '../AI/CustomAIClient';

export type AiConfigurationPresetWithAvailability = {|
  ...AiConfigurationPreset,
  disabled: boolean,
  enableWith: 'higher-tier-plan' | null,
  enabledWithPlans: Array<string>,
|};

export const getAiConfigurationPresetsWithAvailability = ({
  getAiSettings,
  limits,
}: {|
  getAiSettings: () => AiSettings | null,
  limits: ?Limits,
|}): Array<AiConfigurationPresetWithAvailability> => {
  if (isCustomEndpointEnabled()) {
    const aiSettings = getAiSettings() || DEFAULT_LOCAL_AI_SETTINGS;
    return aiSettings.aiRequest.presets.map(preset => ({
      ...preset,
      enableWith: null,
      enabledWithPlans: [],
      disabled: false,
    }));
  }

  const aiSettings = getAiSettings();
  if (!aiSettings) return [];

  if (!limits) {
    return aiSettings.aiRequest.presets.map(preset => ({
      ...preset,
      enableWith: null,
      enabledWithPlans: [],
      disabled: !preset.isDefault,
    }));
  }

  return aiSettings.aiRequest.presets.map(preset => {
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
      enabledWithPlans:
        (presetAvailability && presetAvailability.enabledWithPlans) || [],
    };
  });
};

export const getDefaultAiConfigurationPresetId = (
  mode: 'chat' | 'agent' | 'orchestrator',
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
