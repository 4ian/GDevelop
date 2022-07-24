// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column, LargeSpacer } from '../UI/Grid';
import Text from '../UI/Text';
import { ResponsiveLineStackLayout } from '../UI/Layout';

const styles = {
  container: {
    maxWidth: '480px',
    whiteSpace: 'normal',
  },
};

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
  <Column alignItems="center">
    <div style={styles.container}>
      <Column>
        <Text>
          {message || (
            <Trans>
              You are not connected. Create an account to build your game for
              Android, Windows, macOS and Linux in one click, and get access to
              metrics for your game.
            </Trans>
          )}
        </Text>
        <LargeSpacer />
        <ResponsiveLineStackLayout justifyContent="center" noMargin>
          <RaisedButton
            label={<Trans>Create my account</Trans>}
            onClick={onCreateAccount}
            primary
          />
          <FlatButton label={<Trans>Login</Trans>} onClick={onLogin} />
        </ResponsiveLineStackLayout>
      </Column>
    </div>
  </Column>
);

export default CreateProfile;
