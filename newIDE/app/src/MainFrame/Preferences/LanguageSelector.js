// @flow
import { Trans } from '@lingui/macro';

import React, { useContext } from 'react';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { Column, Line } from '../../UI/Grid';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import LocalesMetadata from '../../locales/LocalesMetadata';
import Text from '../../UI/Text';
import Link from '../../UI/Link';

type Props = {|
  onLanguageChanged: (language: string) => void,
|};

const displayLocaleMetadata = localeMetadata => {
  if (localeMetadata.languageCode === 'en') return false;
  if (localeMetadata.languageCode === 'pseudo_LOCALE') return Window.isDev();

  return true;
};

const localesToDisplay = LocalesMetadata.filter(displayLocaleMetadata);
const goodProgressLocales = localesToDisplay.filter(
  localeMetadata => localeMetadata.translationRatio > 0.5
);
const startedLocales = localesToDisplay.filter(
  localeMetadata => localeMetadata.translationRatio < 0.5
);

const renderLanguageSelectOption = localeMetadata => {
  const translationRatio = localeMetadata.translationRatio || 0;
  const percent = (100 * localeMetadata.translationRatio).toFixed(0);
  const isStarted = translationRatio > 0;

  return (
    <SelectOption
      value={localeMetadata.languageCode}
      label={`${localeMetadata.languageNativeName} (${
        localeMetadata.languageName
      })${isStarted ? ` - ~${percent}%` : ''}`}
      disabled={!isStarted}
      key={localeMetadata.languageCode}
    />
  );
};

const LanguageSelector = ({ onLanguageChanged }: Props) => {
  const { values, setLanguage } = useContext(PreferencesContext);

  return (
    <Column noMargin>
      <Line noMargin expand>
        <SelectField
          floatingLabelText={<Trans>Choose GDevelop language</Trans>}
          value={values.language}
          onChange={(e, i, value: string) => {
            setLanguage(value);
            onLanguageChanged(value);
          }}
          fullWidth
        >
          <SelectOption value="en" label="English (default)" />
          {goodProgressLocales.map(localeMetadata =>
            renderLanguageSelectOption(localeMetadata)
          )}
          {startedLocales.map(localeMetadata =>
            renderLanguageSelectOption(localeMetadata)
          )}
        </SelectField>
      </Line>
      <Text>
        <Trans>
          You can{' '}
          <Link
            href={'https://crowdin.com/project/gdevelop'}
            onClick={() =>
              Window.openExternalURL('https://crowdin.com/project/gdevelop')
            }
          >
            help to translate GDevelop in your language
          </Link>
          .
        </Trans>
      </Text>
    </Column>
  );
};

export default LanguageSelector;
