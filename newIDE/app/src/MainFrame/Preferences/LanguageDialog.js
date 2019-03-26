// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';
import Dialog from '../../UI/Dialog';
import { Column, Line } from '../../UI/Grid';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import AlertMessage from '../../UI/AlertMessage';
import LocalesMetadata from '../../locales/LocalesMetadata';
import { I18n } from '@lingui/react';
import Divider from 'material-ui/Divider';

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

const renderLanguageMenuItem = localeMetadata => {
  const translationRatio = localeMetadata.translationRatio || 0;
  const percent = (100 * localeMetadata.translationRatio).toFixed(0);
  const isStarted = translationRatio > 0;

  return (
    <MenuItem
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
              const isLoadingLanguage = i18n.language !== values.language;

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
                      onClick={onClose}
                      disabled={isLoadingLanguage}
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
                  open={open}
                  title={<Trans>Language</Trans>}
                >
                  <Column>
                    <Line>
                      <AlertMessage kind="info">
                        <Trans>
                          Support for translations is still new and in beta.
                          GDevelop needs your help to be translated in your
                          language!
                        </Trans>
                      </AlertMessage>
                    </Line>
                    <Line expand>
                      <SelectField
                        floatingLabelText={
                          <Trans>Choose GDevelop language</Trans>
                        }
                        value={values.language}
                        onChange={(e, i, value) => {
                          setLanguage(value);
                          this.setState({
                            languageDidChange: true,
                          });
                        }}
                        fullWidth
                      >
                        <MenuItem value="en" primaryText="English (default)" />
                        {goodProgressLocales.map(localeMetadata =>
                          renderLanguageMenuItem(localeMetadata)
                        )}
                        <Divider />
                        {startedLocales.map(localeMetadata =>
                          renderLanguageMenuItem(localeMetadata)
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
