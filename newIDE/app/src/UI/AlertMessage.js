// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Paper from 'material-ui/Paper';
import Info from 'material-ui/svg-icons/action/info';
import Warning from 'material-ui/svg-icons/alert/warning';
import { Line } from './Grid';
import { FlatButton } from 'material-ui';

const styles = {
  icon: { width: 28, height: 28, marginRight: 10, marginLeft: 10 },
  content: { flex: 1 },
};

type Props = {|
  kind: 'info' | 'warning',
  children: React.Node,
  onHide?: () => void,
|};

/**
 * Show an hint, warning or other message. If you want to allow the user
 * to permanently hide the hint/alert/message, see DismissableAlertMessage.
 */
const AlertMessage = ({ kind, children, onHide }: Props) => (
  <Paper>
    <Line noMargin alignItems="center">
      {kind === 'info' && <Info style={styles.icon} />}
      {kind === 'warning' && <Warning style={styles.icon} />}
      <p style={styles.content}>{children}</p>
      {onHide && (
        <FlatButton label={<Trans>Hide</Trans>} onClick={() => onHide()} />
      )}
    </Line>
  </Paper>
);

export default AlertMessage;
