// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import { I18n } from '@lingui/react';
import LanguageSelector from './LanguageSelector';

type Props = {|
  open: boolean,
  onClose: (languageDidChange: boolean) => void,
|};

type State = {|
  languageDidChange: boolean,
|};

export default class LanguageDialog extends Component<Props, State> {
  state = {
    languageDidChange: false,
  };

  render() {
    const { open, onClose } = this.props;
    if (!open) return null;

    return (
      <I18n>
        {({ i18n }) => (
          <PreferencesContext.Consumer>
            {({ values }) => {
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
                  <LanguageSelector
                    onLanguageChanged={() =>
                      this.setState({ languageDidChange: true })
                    }
                  />
                </Dialog>
              );
            }}
          </PreferencesContext.Consumer>
        )}
      </I18n>
    );
  }
}
