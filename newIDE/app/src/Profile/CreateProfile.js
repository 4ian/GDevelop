// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';

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
      <Text>
        {message ||
          'You are not connected. Create an account and connect to access to GDevelop online services, like building your game for Android in one click!'}
      </Text>
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
