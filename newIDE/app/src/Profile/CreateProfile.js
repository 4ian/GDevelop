// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import BackgroundText from '../UI/BackgroundText';

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
    <Line justifyContent="center" alignItems="baseline">
      <RaisedButton
        label={<Trans>Create my account</Trans>}
        onClick={onLogin}
        primary
      />
      <Spacer />
      <Spacer />
      <BackgroundText>or</BackgroundText>
      <Spacer />
      <FlatButton label={<Trans>Login</Trans>} onClick={onLogin} />
    </Line>
  </Column>
);
