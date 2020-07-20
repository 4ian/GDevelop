// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Info from '@material-ui/icons/Info';
import Warning from '@material-ui/icons/Warning';
import Error from '@material-ui/icons/Error';
import { Spacer } from './Grid';
import FlatButton from './FlatButton';
import Text from './Text';
import ThemeConsumer from './Theme/ThemeConsumer';
import { ResponsiveLineStackLayout } from './Layout';

const styles = {
  icon: { width: 28, height: 28, marginRight: 10, marginLeft: 10 },
  content: { flex: 1 },
};

type Props = {|
  kind: 'info' | 'warning' | 'error',
  children: React.Node,
  onHide?: () => void,
  renderLeftIcon?: () => React.Node,
  renderRightButton?: () => React.Node,
|};

/**
 * Show an hint, warning or other message. If you want to allow the user
 * to permanently hide the hint/alert/message, see DismissableAlertMessage.
 */
const AlertMessage = ({
  kind,
  children,
  onHide,
  renderRightButton,
  renderLeftIcon,
}: Props) => (
  <Paper>
    <ThemeConsumer>
      {muiTheme => (
        <ResponsiveLineStackLayout noMargin alignItems="center">
          {renderLeftIcon ? (
            <React.Fragment>
              <Spacer />
              {renderLeftIcon()}
              <Spacer />
            </React.Fragment>
          ) : (
            <React.Fragment>
              {kind === 'info' && <Info style={styles.icon} />}
              {kind === 'warning' && (
                <Warning
                  style={{
                    ...styles.icon,
                    color: muiTheme.message.warning,
                  }}
                />
              )}
              {kind === 'error' && (
                <Error
                  style={{
                    ...styles.icon,
                    color: muiTheme.message.error,
                  }}
                />
              )}
            </React.Fragment>
          )}
          <Text style={styles.content}>{children}</Text>
          {renderRightButton && renderRightButton()}
          {onHide && (
            <FlatButton label={<Trans>Hide</Trans>} onClick={() => onHide()} />
          )}
        </ResponsiveLineStackLayout>
      )}
    </ThemeConsumer>
  </Paper>
);

export default AlertMessage;
