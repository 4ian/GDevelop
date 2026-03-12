// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import ProfileDetails from './ProfileDetails';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  onOpenEditProfileDialog: () => void,
  onOpenChangeEmailDialog: () => void,
  authenticatedUser: AuthenticatedUser,
|};

const AuthenticatedUserProfileDetails = ({
  onOpenEditProfileDialog,
  onOpenChangeEmailDialog,
  authenticatedUser,
}: Props): React.Node => {
  const profile = authenticatedUser.profile;
  const firebaseUser = authenticatedUser.firebaseUser;
  const openEmailVerificationDialog = React.useCallback(
    () => {
      authenticatedUser.onOpenEmailVerificationDialog({
        sendEmailAutomatically: true,
        showSendEmailButton: false,
      });
    },
    [authenticatedUser]
  );

  return firebaseUser && profile ? (
    <ColumnStackLayout noMargin>
      {firebaseUser && !firebaseUser.emailVerified && (
        <AlertMessage
          kind="info"
          renderRightButton={() => (
            <RaisedButton
              label={<Trans>Send it again</Trans>}
              onClick={openEmailVerificationDialog}
              primary
            />
          )}
        >
          <Trans>
            Verify your email address to unlock all account benefits. Didn't
            receive it?
          </Trans>
        </AlertMessage>
      )}
      <ProfileDetails
        authenticatedUser={authenticatedUser}
        onOpenChangeEmailDialog={onOpenChangeEmailDialog}
        onOpenEditProfileDialog={onOpenEditProfileDialog}
      />
    </ColumnStackLayout>
  ) : (
    <PlaceholderLoader />
  );
};

export default AuthenticatedUserProfileDetails;
