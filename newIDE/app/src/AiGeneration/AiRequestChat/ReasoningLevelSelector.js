// @flow
import React from 'react';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import CompactSelectField from '../../UI/CompactSelectField';
import { selectMessageByLocale } from '../../Utils/i18n/MessageByLocale';
import SelectOption from '../../UI/SelectOption';
import { type AiConfigurationPresetWithAvailability } from '../AiConfiguration';
import Sparkle from '../../UI/CustomSvgIcons/Sparkle';
import Paper from '../../UI/Paper';

type ReasoningLevelSelectorProps = {
  chosenOrDefaultAiConfigurationPresetId: string,
  setAiConfigurationPresetId: string => void,
  aiConfigurationPresetsWithAvailability: Array<AiConfigurationPresetWithAvailability>,
  disabled?: boolean,
};

export const ReasoningLevelSelector = ({
  chosenOrDefaultAiConfigurationPresetId,
  setAiConfigurationPresetId,
  aiConfigurationPresetsWithAvailability,
  disabled,
}: ReasoningLevelSelectorProps): React.Node => {
  const orchestratorPresets = aiConfigurationPresetsWithAvailability.filter(
    preset => preset.mode === 'orchestrator'
  );

  // Deselect the current preset if it becomes disabled
  React.useEffect(
    () => {
      const currentPreset = orchestratorPresets.find(
        preset => preset.id === chosenOrDefaultAiConfigurationPresetId
      );

      if (currentPreset && currentPreset.disabled) {
        const firstEnabledPreset = orchestratorPresets.find(
          preset => !preset.disabled
        );

        if (firstEnabledPreset) {
          setAiConfigurationPresetId(firstEnabledPreset.id);
        }
      }
    },
    [
      chosenOrDefaultAiConfigurationPresetId,
      orchestratorPresets,
      setAiConfigurationPresetId,
    ]
  );

  const noUpgradePresets = orchestratorPresets.filter(
    preset => !preset.disabled || preset.enableWith !== 'higher-tier-plan'
  );
  const upgradePresets = orchestratorPresets.filter(
    preset => preset.disabled && preset.enableWith === 'higher-tier-plan'
  );

  if (orchestratorPresets.length === 0) return null;

  return (
    <I18n>
      {({ i18n }) => (
        <Paper
          background="light"
          style={{ borderRadius: 24, overflow: 'hidden', display: 'flex' }}
        >
          <CompactSelectField
            value={chosenOrDefaultAiConfigurationPresetId}
            onChange={value => {
              setAiConfigurationPresetId(value);
            }}
            disabled={disabled}
            renderLeftIcon={className => <Sparkle className={className} />}
            leftIconTooltip={i18n._(t`Reasoning level`)}
            rounded
          >
            {noUpgradePresets.map(preset => (
              <SelectOption
                key={preset.id}
                value={preset.id}
                label={selectMessageByLocale(i18n, preset.nameByLocale)}
                disabled={preset.disabled}
                shouldNotTranslate
              />
            ))}
            {upgradePresets.length > 0 && (
              <optgroup key="upgrade" label={i18n._(t`Upgrade for:`)}>
                {upgradePresets.map(preset => (
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
        </Paper>
      )}
    </I18n>
  );
};
