// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import CompactSelectField from '../../UI/CompactSelectField';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import SelectOption from '../../UI/SelectOption';
import { type AiConfigurationPresetWithAvailability } from '../AiConfiguration';

type AiConfigurationPresetSelectorProps = {
  chosenOrDefaultAiConfigurationPresetId: string,
  setAiConfigurationPresetId: string => void,
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>,
  aiRequestMode: string,
  disabled?: boolean,
};

export const AiConfigurationPresetSelector = ({
  chosenOrDefaultAiConfigurationPresetId,
  setAiConfigurationPresetId,
  aiConfigurationPresetsWithAvailability,
  aiRequestMode,
  disabled,
}: AiConfigurationPresetSelectorProps) => {
  const filteredAiConfigurationPresets = aiConfigurationPresetsWithAvailability.filter(
    preset => preset.mode === aiRequestMode
  );

  // Deselect the current preset if it becomes disabled
  React.useEffect(
    () => {
      const currentPreset = filteredAiConfigurationPresets.find(
        preset => preset.id === chosenOrDefaultAiConfigurationPresetId
      );

      if (currentPreset && currentPreset.disabled) {
        // Find the first enabled preset as a fallback
        const firstEnabledPreset = filteredAiConfigurationPresets.find(
          preset => !preset.disabled
        );

        if (firstEnabledPreset) {
          setAiConfigurationPresetId(firstEnabledPreset.id);
        }
      }
    },
    [
      chosenOrDefaultAiConfigurationPresetId,
      filteredAiConfigurationPresets,
      setAiConfigurationPresetId,
    ]
  );

  const noUpgradeAiConfigurationPresets = filteredAiConfigurationPresets.filter(
    preset => !preset.disabled || preset.enableWith !== 'higher-tier-plan'
  );
  const upgradeAiConfigurationPresets = filteredAiConfigurationPresets.filter(
    preset => preset.disabled && preset.enableWith === 'higher-tier-plan'
  );

  return (
    <I18n>
      {({ i18n }) => (
        <CompactSelectField
          value={chosenOrDefaultAiConfigurationPresetId}
          onChange={value => {
            setAiConfigurationPresetId(value);
          }}
          disabled={disabled}
        >
          {noUpgradeAiConfigurationPresets.map(preset => (
            <SelectOption
              key={preset.id}
              value={preset.id}
              label={selectMessageByLocale(i18n, preset.nameByLocale)}
              disabled={preset.disabled}
              shouldNotTranslate
            />
          ))}
          {upgradeAiConfigurationPresets.length > 0 && (
            <optgroup key={`upgrade`} label={i18n._(t`Upgrade for:`)}>
              {upgradeAiConfigurationPresets.map(preset => (
                <SelectOption
                  key={preset.id}
                  value={preset.id}
                  label={selectMessageByLocale(i18n, preset.nameByLocale)}
                  disabled={preset.disabled}
                  shouldNotTranslate
                />
              ))}
            </optgroup>
          )}
        </CompactSelectField>
      )}
    </I18n>
  );
};
