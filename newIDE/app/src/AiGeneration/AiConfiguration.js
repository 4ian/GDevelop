// @flow
import { type Limits } from '../Utils/GDevelopServices/Usage';
import {
  type AiConfigurationPreset,
  type AiSettings,
} from '../Utils/GDevelopServices/Generation';
import { AVAILABLE_LOCAL_MODELS } from './Local/LocalModelManager';
import { shouldUseLocalModel, getActiveLocalModel } from './Local/LocalStorage';

export type AiConfigurationPresetWithAvailability = {|
  ...AiConfigurationPreset,
  disabled: boolean,
  enableWith: 'higher-tier-plan' | null,
  isLocalModel?: boolean,
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

  const onlinePresets = aiSettings.aiRequest.presets.map(preset => {
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
      isLocalModel: false,
    };
  });

  // Add local model presets
  const localModelPresets: Array<AiConfigurationPresetWithAvailability> = AVAILABLE_LOCAL_MODELS.map(
    model => ({
      mode: 'chat',
      id: `local-${model.id}`,
      nameByLocale: {
        en: `${model.name} (Local)`,
      },
      disabled: false,
      isDefault: false,
      enableWith: null,
      isLocalModel: true,
    })
  );

  return [...onlinePresets, ...localModelPresets];
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

/**
 * Check if a preset is a local model
 */
export const isLocalModelPreset = (presetId: string): boolean => {
  return presetId.startsWith('local-');
};

/**
 * Check if the current configuration uses unlimited requests
 * (local models or custom API keys)
 */
export const hasUnlimitedRequests = (presetId: string): boolean => {
  return isLocalModelPreset(presetId);
};
