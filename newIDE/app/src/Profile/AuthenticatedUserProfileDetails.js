// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import ProfileDetails from './ProfileDetails';

type Props = {|
  onEditProfile: () => void,
  onChangeEmail: () => void,
  authenticatedUser: AuthenticatedUser,
|};

const AuthenticatedUserProfileDetails = ({
  onEditProfile,
  onChangeEmail,
  authenticatedUser,
}: Props) => {
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
            <FlatButton
              label={<Trans>Send it again</Trans>}
              onClick={openEmailVerificationDialog}
              primary
            />
          )}
        >
          <Trans>
            You are missing out on asset store discounts and other benefits!
            Verify your email address. Didn't receive it?
          </Trans>
        </AlertMessage>
      )}
      <ProfileDetails
        // The firebase user is the source of truth for the emails.
        profile={
          authenticatedUser.profile
            ? { ...authenticatedUser.profile, email: firebaseUser.email }
            : null
        }
        isAuthenticatedUserProfile
        onChangeEmail={onChangeEmail}
        onEditProfile={onEditProfile}
      />
    </ColumnStackLayout>
  ) : (
    <PlaceholderLoader />
  );
};

export default AuthenticatedUserProfileDetails;
