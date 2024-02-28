// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';

const styles = {
  container: {
    maxWidth: '480px',
    whiteSpace: 'normal',
  },
};

type Props = {
  message?: React.Node,
  onOpenLoginDialog: () => void,
  onOpenCreateAccountDialog: () => void,
  justifyContent?: 'center',
};

const CreateProfile = ({
  message,
  onOpenLoginDialog,
  onOpenCreateAccountDialog,
  justifyContent,
}: Props) => (
  <Column alignItems="center">
    <div style={styles.container}>
      <ColumnStackLayout>
        <Text noMargin align="center">
          {message || (
            <Trans>
              You are not connected. Create an account to build your game for
              Android, Windows, macOS and Linux in one click, and get access to
              metrics for your game.
            </Trans>
          )}
        </Text>
        <ResponsiveLineStackLayout justifyContent="center" noMargin>
          <RaisedButton
            id="create-account-button"
            label={<Trans>Create my account</Trans>}
            onClick={onOpenCreateAccountDialog}
            primary
          />
          <FlatButton
            label={<Trans>Login</Trans>}
            onClick={onOpenLoginDialog}
          />
        </ResponsiveLineStackLayout>
      </ColumnStackLayout>
    </div>
  </Column>
);

export default CreateProfile;
