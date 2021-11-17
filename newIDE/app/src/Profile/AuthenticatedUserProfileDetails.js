// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import { useIsMounted } from '../Utils/UseIsMounted';
import ProfileDetails from './ProfileDetails';
import { Column } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';
import UserAchievements from './Achievement/UserAchievements';

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
  const isMounted = useIsMounted();
  const [emailSent, setEmailSent] = React.useState<boolean>(false);
  const sendEmail = React.useCallback(
    () => {
      authenticatedUser.onSendEmailVerification();
      setEmailSent(true);
      setTimeout(() => {
        if (!isMounted.current) return;
        setEmailSent(false);
      }, 3000);
    },
    [authenticatedUser, isMounted]
  );

  return firebaseUser && profile ? (
    <ColumnStackLayout noMargin>
      {firebaseUser && !firebaseUser.emailVerified && (
        <AlertMessage
          kind="info"
          renderRightButton={() => (
            <FlatButton
              label={
                emailSent ? (
                  <Trans>Email sent!</Trans>
                ) : (
                  <Trans>Send it again</Trans>
                )
              }
              onClick={sendEmail}
              disabled={emailSent}
              primary
            />
          )}
        >
          <Trans>
            It looks like your email is not verified. Click on the link received
            by email to verify your account. Didn't receive it?
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
      />
      <UserAchievements badges={authenticatedUser.badges} />
      <Column>
        <ResponsiveLineStackLayout justifyContent="flex-end">
          <RaisedButton
            label={<Trans>Change my email</Trans>}
            onClick={onChangeEmail}
          />
          <RaisedButton
            label={<Trans>Edit my profile</Trans>}
            primary
            onClick={onEditProfile}
          />
        </ResponsiveLineStackLayout>
      </Column>
    </ColumnStackLayout>
  ) : (
    <PlaceholderLoader />
  );
};

export default AuthenticatedUserProfileDetails;
