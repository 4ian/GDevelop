// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from '../MainFrame/Preferences/PreferencesContext';
import AlertMessage from './AlertMessage';
import useAlertDialog from './Alert/useAlertDialog';

type Props = {|
  kind: 'info' | 'warning',
  children: React.Node,
  identifier: AlertMessageIdentifier,
|};

/**
 * Show an alert that can be permanently hidden. Hidden messages
 * will be stored in preferences.
 */
const DismissableAlertMessage = ({
  identifier,
  kind,
  children,
}: Props): React.Node => {
  const { values, showAlertMessage } = React.useContext(PreferencesContext);
  const { showConfirmation } = useAlertDialog();

  if (values.hiddenAlertMessages[identifier]) return null;

  return (
    <AlertMessage
      kind={kind}
      children={children}
      onHide={async () => {
        const answer = await showConfirmation({
          title: t`Hide this hint?`,
          message: t`Are you sure you want to hide this hint? You won't see it again, unless you re-activate it from the preferences.`,
        });

        if (!answer) return;

        showAlertMessage(identifier, false);
      }}
    />
  );
};

export default DismissableAlertMessage;
