// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import PreferencesContext, {
  type AlertMessageIdentifier,
} from '../../MainFrame/Preferences/PreferencesContext';

type Props = {|
  identifier: AlertMessageIdentifier,
  message: React.Node,
  show: boolean,
|};

export default class InfoBar extends React.PureComponent<Props> {
  render() {
    const { identifier } = this.props;

    return (
      <PreferencesContext.Consumer>
        {({ values, showAlertMessage }) => (
          <Snackbar
            open={this.props.show && !values.hiddenAlertMessages[identifier]}
            message={this.props.message}
            action={
              <Button
                key="undo"
                color="primary"
                size="small"
                onClick={() => {
                  showAlertMessage(identifier, false);
                }}
              >
                <Trans>Got it</Trans>
              </Button>
            }
          />
        )}
      </PreferencesContext.Consumer>
    );
  }
}
