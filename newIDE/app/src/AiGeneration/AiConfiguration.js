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

// A preset with a credit multiplier of 0 is "free": it costs no credits and
// is usable by everyone. Relying on the multiplier (from the AI settings)
// means future free presets are detected without hardcoding their ids.
const isFreePreset = (
  preset: ?AiConfigurationPresetWithAvailability
): boolean => !!preset && preset.creditsMultiplier === 0;

/**
 * Whether the given preset (identified by id + mode) is a "free" preset
 * (costs no credits, usable by everyone).
 */
export const getIsFreeAiConfigurationPreset = ({
  presetId,
  mode,
  aiConfigurationPresetsWithAvailability,
}: {|
  presetId: ?string,
  mode: 'chat' | 'agent' | 'orchestrator',
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>,
|}): boolean => {
  if (!presetId) return false;
  return isFreePreset(
    aiConfigurationPresetsWithAvailability.find(
      preset => preset.id === presetId && preset.mode === mode
    )
  );
};

/**
 * The id of the first available "free" preset for the given mode (used to
 * start a new conversation with free, open-source models), or null if none.
 */
export const getFirstFreeAiConfigurationPresetId = (
  mode: 'chat' | 'agent' | 'orchestrator',
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>
): string | null => {
  const freePreset = aiConfigurationPresetsWithAvailability.find(
    preset => preset.mode === mode && isFreePreset(preset) && !preset.disabled
  );
  return freePreset ? freePreset.id : null;
};
