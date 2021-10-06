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
import { Column, Line } from '../UI/Grid';
import RaisedButton from '../UI/RaisedButton';

type Props = {|
  onEditProfile: () => void,
  onChangeEmail: () => void,
  authenticatedUser: AuthenticatedUser,
|};

export default ({ onEditProfile, onChangeEmail, authenticatedUser }: Props) => {
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

  const loadUserProfile = React.useCallback(
    () => authenticatedUser.onRefreshUserProfile(),
    // We don't want to fetch again when authenticatedUser changes,
    // just the first time this page opens.
    [authenticatedUser.onRefreshUserProfile] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Reload user every time the Profile is opened
  React.useEffect(
    () => {
      loadUserProfile();
    },
    [loadUserProfile]
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
      <ProfileDetails profile={authenticatedUser.profile} isPrivate />
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
