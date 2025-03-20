// @flow
import { Trans } from '@lingui/macro';

import React, { useContext } from 'react';
import SelectOption from '../../UI/SelectOption';
import { Column } from '../../UI/Grid';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import LocalesMetadata from '../../locales/LocalesMetadata';
import ExtensionLocalesMetadata from '../../locales/ExtensionLocalesMetadata';
import Text from '../../UI/Text';
import Link from '../../UI/Link';
import { LineStackLayout } from '../../UI/Layout';
import CompactSelectField from '../../UI/CompactSelectField';

type Props = {|
  onLanguageChanged: (language: string) => void,
|};

const displayLocaleMetadata = localeMetadata => {
  if (localeMetadata.languageCode === 'en') return false;
  if (localeMetadata.languageCode === 'pseudo_LOCALE') return Window.isDev();

  return true;
};

const localesToDisplay = LocalesMetadata.filter(displayLocaleMetadata).map(
  localeMetadata => {
    const extensionLocaleMetadata = ExtensionLocalesMetadata.find(
      extensionLocaleMetadata =>
        extensionLocaleMetadata.languageCode === localeMetadata.languageCode
    );
    const editorTranslationRatio = localeMetadata.translationRatio || 0;
    // We do a simple 50/50 split between the main GDevelop locales and the extension locales.
    // This is not perfect, but gives a rough idea of the translation progress.
    const translationRatioExtension = extensionLocaleMetadata
      ? extensionLocaleMetadata.translationRatio
      : 0;

    const translationRatio =
      (editorTranslationRatio + translationRatioExtension) / 2;
    return {
      ...localeMetadata,
      translationRatio,
    };
  }
);
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
      <LineStackLayout noMargin alignItems="center">
        <Column noMargin expand>
          <Text noMargin>
            <Trans>Choose GDevelop language</Trans>
          </Text>
        </Column>
        <Column noMargin expand>
          <CompactSelectField
            value={values.language}
            onChange={(value: string) => {
              setLanguage(value);
              onLanguageChanged(value);
            }}
          >
            <SelectOption value="en" label="English (default)" />
            {goodProgressLocales.map(localeMetadata =>
              renderLanguageSelectOption(localeMetadata)
            )}
            {startedLocales.map(localeMetadata =>
              renderLanguageSelectOption(localeMetadata)
            )}
          </CompactSelectField>
        </Column>
      </LineStackLayout>
      <Text color="secondary">
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
