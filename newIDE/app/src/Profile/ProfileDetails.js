// @flow
import { Trans, t } from '@lingui/macro';

import * as React from 'react';
import { User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import Avatar from '@material-ui/core/Avatar';
import { Column, Line, Spacer } from '../UI/Grid';
import { type Profile } from '../Utils/GDevelopServices/Authentication';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import { getGravatarUrl } from '../UI/GravatarUrl';
import Text from '../UI/Text';
import RaisedButton from '../UI/RaisedButton';
import TextField from '../UI/TextField';
import { I18n } from '@lingui/react';
import BackgroundText from '../UI/BackgroundText';
import FlatButton from '../UI/FlatButton';
import { ColumnStackLayout } from '../UI/Layout';
import AlertMessage from '../UI/AlertMessage';
import EmailVerificationPendingDialog from './EmailVerificationPendingDialog';
import { type AuthenticatedUser } from './AuthenticatedUserContext';

type Props = {|
  onEditProfile: Function,
  authenticatedUser: AuthenticatedUser,
|};

export default ({ onEditProfile, authenticatedUser }: Props) => {
  const profile = authenticatedUser.profile;
  const [emailSent, setEmailSent] = React.useState<boolean>(false);
  const [
    emailVerificationPendingDialogOpen,
    setEmailVerificationPendingDialogOpen,
  ] = React.useState<boolean>(false);

  const sendEmail = React.useCallback(
    () => {
      try {
        sendEmailVerification(authenticatedUser.firebaseUser).then(() => {
          setEmailVerificationPendingDialogOpen(true);
          setEmailSent(true);
          setTimeout(() => setEmailSent(false), 3000);
        });
      } catch (error) {
        console.log("couldn't send the email verification");
      }
    },
    [authenticatedUser.firebaseUser]
  );

  return authenticatedUser && authenticatedUser.firebaseUser && profile ? (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          {authenticatedUser.firebaseUser &&
            !authenticatedUser.firebaseUser.emailVerified && (
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
                label={<Trans>Edit my profile</Trans>}
                primary
                onClick={onEditProfile}
              />
            </Line>
          </Column>
          {emailVerificationPendingDialogOpen && (
            <EmailVerificationPendingDialog
              authenticatedUser={authenticatedUser}
              onClose={() => {
                setEmailVerificationPendingDialogOpen(false);
                authenticatedUser.onRefreshUserProfile();
              }}
            />
          )}
        </ColumnStackLayout>
      )}
    </I18n>
  ) : (
    <PlaceholderLoader />
  );
};
