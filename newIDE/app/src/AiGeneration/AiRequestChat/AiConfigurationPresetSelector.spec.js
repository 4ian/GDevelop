// @flow
import * as React from 'react';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import renderer from 'react-test-renderer';
import SelectOption from '../../UI/SelectOption';
import { AiConfigurationPresetSelector } from './AiConfigurationPresetSelector';

const i18n = setupI18n({
  language: 'en',
  catalogs: {
    en: { messages: {} },
  },
});
const muiTheme = createMuiTheme();

const renderSelector = ({
  disableCustomAiConfigurationPreset,
}: {|
  disableCustomAiConfigurationPreset?: boolean,
|} = {}) =>
  renderer.create(
    <I18nProvider i18n={i18n} language="en" catalogs={{ en: { messages: {} } }}>
      <ThemeProvider theme={muiTheme}>
        <AiConfigurationPresetSelector
          chosenOrDefaultAiConfigurationPresetId="default"
          setAiConfigurationPresetId={() => {}}
          aiConfigurationPresetsWithAvailability={[
            {
              id: 'default',
              mode: 'chat',
              nameByLocale: { en: 'Default' },
              disabled: false,
              enableWith: null,
              isDefault: true,
            },
            {
              id: 'gpt-5',
              mode: 'chat',
              nameByLocale: { en: 'GPT-5 (Gold & Pro only)' },
              disabled: true,
              enableWith: 'higher-tier-plan',
            },
          ]}
          aiRequestMode="chat"
          customAiConfigurationPresetId="custom-model"
          showCustomAiConfigurationPreset
          disableCustomAiConfigurationPreset={
            disableCustomAiConfigurationPreset
          }
        />
      </ThemeProvider>
    </I18nProvider>
  );

describe('AiConfigurationPresetSelector', () => {
  it('adds Custom Model without changing subscription-disabled entries', () => {
    const tree = renderSelector();
    const options = tree.root.findAllByType(SelectOption);

    expect(options.map(option => option.props.value)).toEqual([
      'default',
      'custom-model',
      'gpt-5',
    ]);
    expect(options.map(option => !!option.props.disabled)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('can disable Custom Model when no saved provider is selected', () => {
    const tree = renderSelector({ disableCustomAiConfigurationPreset: true });
    const options = tree.root.findAllByType(SelectOption);
    const customModelOption = options.find(
      option => option.props.value === 'custom-model'
    );

    if (!customModelOption) {
      throw new Error('Expected the Custom Model option to be rendered.');
    }

    expect(customModelOption.props.disabled).toBe(true);
  });
});
