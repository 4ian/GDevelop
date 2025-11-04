// @flow
import { type Limits } from '../Utils/GDevelopServices/Usage';
import {
  type AiConfigurationPreset,
  type AiSettings,
} from '../Utils/GDevelopServices/Generation';

export type AiConfigurationPresetWithAvailability = {|
  ...AiConfigurationPreset,
  disabled: boolean,
  enableWith: 'higher-tier-plan' | null,
|};

export const getAiConfigurationPresetsWithAvailability = ({
  getAiSettings,
  limits,
}: {|
  getAiSettings: () => AiSettings | null,
  limits: ?Limits,
|}): Array<AiConfigurationPresetWithAvailability> => {
  const aiSettings = getAiSettings();
  if (!aiSettings) {
    return [];
  }

  if (!limits) {
    return aiSettings.aiRequest.presets.map(preset => ({
      ...preset,
      enableWith: null,
      disabled: preset.isDefault ? false : true,
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
    };
  });
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
