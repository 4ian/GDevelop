// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import BackgroundText from '../UI/BackgroundText';

type Props = {
  message?: React.Node,
  onLogin: () => void,
  onCreateAccount: () => void,
  justifyContent?: 'center',
};

const CreateProfile = ({
  message,
  onLogin,
  onCreateAccount,
  justifyContent,
}: Props) => (
  <Column noMargin>
    <Line justifyContent={justifyContent}>
      <Text>
        {message || (
          <Trans>
            You are not connected. Create an account to build your game for
            Android, Windows, macOS and Linux in one click, and get access to
            metrics for your game.
          </Trans>
        )}
      </Text>
    </Line>
    <Line justifyContent="center" alignItems="baseline">
      <RaisedButton
        label={<Trans>Create my account</Trans>}
        onClick={onCreateAccount}
        primary
      />
      <Spacer />
      <BackgroundText>or</BackgroundText>
      <Spacer />
      <FlatButton label={<Trans>Login</Trans>} onClick={onLogin} />
    </Line>
  </Column>
);

export default CreateProfile;
