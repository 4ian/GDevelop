// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import SelectField from '../../UI/SelectField';
import FlatButton from '../../UI/FlatButton';
import SelectOption from '../../UI/SelectOption';
import Dialog from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import LocalesMetadata from '../../locales/LocalesMetadata';
import { I18n } from '@lingui/react';

type Props = {|
  open: boolean,
  onClose: (languageDidChange: boolean) => void,
|};

type State = {|
  languageDidChange: boolean,
|};

const displayLocaleMetadata = localeMetadata => {
  if (localeMetadata.languageCode === 'en') return false;
  if (localeMetadata.languageCode === 'pseudo_LOCALE') return Window.isDev();

  return true;
};

const renderLanguageSelectOption = localeMetadata => {
  const translationRatio = localeMetadata.translationRatio || 0;
  const percent = (100 * localeMetadata.translationRatio).toFixed(0);
  const isStarted = translationRatio > 0;

  return (
    <SelectOption
      value={localeMetadata.languageCode}
      primaryText={
        localeMetadata.languageNativeName +
        ' (' +
        localeMetadata.languageName +
        ')' +
        (isStarted ? ` - ~${percent}%` : '')
      }
      disabled={!isStarted}
      key={localeMetadata.languageCode}
    />
  );
};

export default class LanguageDialog extends Component<Props, State> {
  state = {
    languageDidChange: false,
  };

  render() {
    const { open, onClose } = this.props;
    if (!open) return null;

    const localesToDisplay = LocalesMetadata.filter(displayLocaleMetadata);
    const goodProgressLocales = localesToDisplay.filter(
      localeMetadata => localeMetadata.translationRatio > 0.5
    );
    const startedLocales = localesToDisplay.filter(
      localeMetadata => localeMetadata.translationRatio < 0.5
    );

    return (
      <I18n>
        {({ i18n }) => (
          <PreferencesContext.Consumer>
            {({ values, setLanguage }) => {
              const isLoadingLanguage =
                i18n.language !== values.language.replace('_', '-');

              return (
                <Dialog
                  actions={[
                    <FlatButton
                      label={
                        isLoadingLanguage ? (
                          <Trans>Loading...</Trans>
                        ) : (
                          <Trans>Close</Trans>
                        )
                      }
                      primary={false}
                      onClick={() => {
                        onClose(this.state.languageDidChange);
                      }}
                      disabled={isLoadingLanguage}
                      key="close"
                    />,
                  ]}
                  secondaryActions={[
                    <FlatButton
                      label={<Trans>Report a wrong translation</Trans>}
                      key="report-wrong-translation"
                      primary={false}
                      onClick={() =>
                        Window.openExternalURL(
                          'https://github.com/4ian/GDevelop/issues/969'
                        )
                      }
                    />,
                  ]}
                  onRequestClose={() => onClose(this.state.languageDidChange)}
                  cannotBeDismissed={false}
                  open={open}
                  title={<Trans>Language</Trans>}
                >
                  <Column noMargin>
                    <Line expand>
                      <SelectField
                        floatingLabelText={
                          <Trans>Choose GDevelop language</Trans>
                        }
                        value={values.language}
                        onChange={(e, i, value: string) => {
                          setLanguage(value);
                          this.setState({
                            languageDidChange: true,
                          });
                        }}
                        fullWidth
                      >
                        <SelectOption
                          value="en"
                          primaryText="English (default)"
                        />
                        {goodProgressLocales.map(localeMetadata =>
                          renderLanguageSelectOption(localeMetadata)
                        )}
                        {startedLocales.map(localeMetadata =>
                          renderLanguageSelectOption(localeMetadata)
                        )}
                      </SelectField>
                    </Line>
                    <Line expand>
                      <FlatButton
                        primary
                        label={
                          <Trans>Help to translate GD in your language</Trans>
                        }
                        onClick={() =>
                          Window.openExternalURL(
                            'https://crowdin.com/project/gdevelop'
                          )
                        }
                        fullWidth
                      />
                    </Line>
                  </Column>
                </Dialog>
              );
            }}
          </PreferencesContext.Consumer>
        )}
      </I18n>
    );
  }
}
