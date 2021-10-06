// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import { useIsMounted } from '../Utils/UseIsMounted';

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
    <I18n>
      {({ i18n }) => (
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
                It looks like your email is not verified. Click on the link
                received by email to verify your account. Didn't receive it?
              </Trans>
            </AlertMessage>
          )}
          <Column>
            <Line alignItems="center">
              <Avatar src={getGravatarUrl(profile.email || '', { size: 40 })} />
              <Spacer />
              <Text
                size="title"
                style={{
                  opacity: profile.username ? 1.0 : 0.5,
                }}
              >
                {profile.username ||
                  i18n._(t`Edit your profile to pick a username!`)}
              </Text>
            </Line>
            <Line>
              <TextField
                value={profile.email}
                readOnly
                fullWidth
                floatingLabelText={<Trans>Email</Trans>}
                floatingLabelFixed={true}
              />
            </Line>
            <Line>
              <TextField
                value={profile.description || ''}
                readOnly
                fullWidth
                multiline
                floatingLabelText={<Trans>Bio</Trans>}
                floatingLabelFixed={true}
                hintText={t`No bio defined. Edit your profile to tell us what you are using GDevelop for!`}
                rows={3}
                rowsMax={5}
              />
            </Line>
            <Line justifyContent="flex-end">
              <RaisedButton
                label={<Trans>Change my email</Trans>}
                primary
                onClick={onChangeEmail}
              />
              <Spacer />
              <Spacer />
              <RaisedButton
                label={<Trans>Edit my profile</Trans>}
                primary
                onClick={onEditProfile}
              />
            </Line>
          </Column>
        </ColumnStackLayout>
      )}
    </I18n>
  ) : (
    <PlaceholderLoader />
  );
};
