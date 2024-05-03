// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog from '../../UI/Dialog';
import Window from '../../Utils/Window';
import PreferencesContext from './PreferencesContext';
import { I18n } from '@lingui/react';
import LanguageSelector from './LanguageSelector';

type Props = {|
  open: boolean,
  onClose: (options: {| languageDidChange: boolean |}) => void,
|};

const LanguageDialog = ({ open, onClose }: Props) => {
  const { values } = React.useContext(PreferencesContext);

  const [languageDidChange, setLanguageDidChange] = React.useState<boolean>(
    false
  );

  if (!open) return null;

  return (
    <I18n>
      {({ i18n }) => {
        const isLoadingLanguage =
          i18n.language !== values.language.replace('_', '-');

        return (
          <Dialog
            title={<Trans>Language</Trans>}
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
                  onClose({ languageDidChange });
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
            cannotBeDismissed={isLoadingLanguage}
            onRequestClose={() => onClose({ languageDidChange })}
            open={open}
            maxWidth="sm"
          >
            <LanguageSelector
              onLanguageChanged={() => setLanguageDidChange(true)}
            />
          </Dialog>
        );
      }}
    </I18n>
  );
};
export default LanguageDialog;
