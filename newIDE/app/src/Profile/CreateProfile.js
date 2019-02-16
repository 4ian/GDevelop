// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';

const styles = {
  orDivider: {
    marginLeft: 15,
    marginTop: 2,
  },
};

type Props = {
  message?: string,
  onLogin: Function,
};

export default ({ message, onLogin }: Props) => (
  <Column noMargin>
    <Line>
      <p>
        {message ||
          'You are not connected. Create an account and connect to access to GDevelop online services, like building your game for Android in one click!'}
      </p>
    </Line>
    <Line justifyContent="center" alignItems="center">
      <RaisedButton
        label={<Trans>Create my account</Trans>}
        onClick={onLogin}
        primary
      />
      <span style={styles.orDivider}>or</span>
      <FlatButton label={<Trans>Login</Trans>} onClick={onLogin} />
    </Line>
  </Column>
);
