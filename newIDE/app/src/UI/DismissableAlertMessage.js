// @flow
import * as React from 'react';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from '../MainFrame/Preferences/PreferencesContext';
import AlertMessage from './AlertMessage';
import Window from '../Utils/Window';

type Props = {|
  kind: 'info' | 'warning',
  children: React.Node,
  identifier: AlertMessageIdentifier,
|};

/**
 * Show an alert that can be permanently hidden. Hidden messages
 * will be stored in preferences.
 */
const DismissableAlertMessage = ({ identifier, kind, children }: Props) => (
  <PreferencesContext.Consumer>
    {({ values, showAlertMessage }) =>
      !values.hiddenAlertMessages[identifier] && (
        <AlertMessage
          kind={kind}
          children={children}
          onHide={() => {
            const answer = Window.showConfirmDialog(
              "Are you sure you want to hide this hint? You won't see it again, unless you re-activate it from the preferences."
            );

            if (!answer) return;

            showAlertMessage(identifier, false);
          }}
        />
      )
    }
  </PreferencesContext.Consumer>
);

export default DismissableAlertMessage;
