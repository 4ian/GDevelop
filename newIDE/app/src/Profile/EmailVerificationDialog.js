// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import BackgroundText from '../UI/BackgroundText';
import Text from '../UI/Text';
import { useInterval } from '../Utils/UseInterval';
import CircularProgress from '../UI/CircularProgress';
import GDevelopGLogo from '../UI/CustomSvgIcons/GDevelopGLogo';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import UserVerified from '../UI/CustomSvgIcons/UserVerified';

type Props = {|
  onClose: () => void,
  authenticatedUser: AuthenticatedUser,
  sendEmailAutomatically: boolean,
  showSendEmailButton: boolean,
  onSendEmail: () => Promise<void>,
|};

export default function EmailVerificationDialog({
  onClose,
  authenticatedUser,
  sendEmailAutomatically,
  showSendEmailButton,
  onSendEmail,
}: Props) {
  const isVerified =
    !!authenticatedUser.firebaseUser &&
    !!authenticatedUser.firebaseUser.emailVerified;

  const [hasSentEmailManually, setHasSentEmailManually] = React.useState(false);

  // Send the email once on dialog opening if configured as so.
  React.useEffect(
    () => {
      if (!isVerified && sendEmailAutomatically) {
        onSendEmail();
      }
    },
    [isVerified, onSendEmail, sendEmailAutomatically]
  );

  // Check every 5 seconds if the email has been verified.
  useInterval(
    () => {
      authenticatedUser.onRefreshFirebaseProfile().catch(() => {
        // Ignore any error, will be retried anyway.
      });
    },
    !isVerified && (hasSentEmailManually || !showSendEmailButton) ? 5000 : null
  );

  return (
    <Dialog
      title={null} // This dialog has a custom design to be more welcoming, the title is set in the content.
      actions={[
        isVerified ? (
          <DialogPrimaryButton
            label={<Trans>Done!</Trans>}
            key="close"
            primary
            onClick={onClose}
          />
        ) : (
          <FlatButton
            label={<Trans>I'll do it later</Trans>}
            key="close"
            primary={false}
            onClick={onClose}
          />
        ),
      ]}
      maxWidth="sm"
      open
      onRequestClose={onClose}
      onApply={onClose}
    >
      <ColumnStackLayout
        noMargin
        expand
        justifyContent="center"
        alignItems="center"
      >
        <GDevelopGLogo fontSize="large" />
        {!authenticatedUser.firebaseUser ? null : !authenticatedUser
            .firebaseUser.emailVerified ? (
          <ColumnStackLayout noMargin alignItems="center">
            <Text size="title" align="center">
              <Trans>Confirm your email</Trans>
            </Text>
            <Text align="center">
              <Trans>
                You will get access to special discounts on the GDevelop asset
                store, as well as weekly stats about your games.
              </Trans>
            </Text>
            {!hasSentEmailManually && showSendEmailButton ? (
              <RaisedButton
                primary
                label={<Trans>Send it again</Trans>}
                onClick={() => {
                  setHasSentEmailManually(true);
                  onSendEmail();
                }}
              />
            ) : (
              <BackgroundText>
                <LineStackLayout justifyContent="center" alignItems="center">
                  <CircularProgress size={20} />
                  <Text>
                    <Trans>
                      Email sent to
                      {authenticatedUser.firebaseUser.email}, waiting for
                      validation...
                    </Trans>
                  </Text>
                </LineStackLayout>
              </BackgroundText>
            )}
          </ColumnStackLayout>
        ) : (
          <LineStackLayout justifyContent="center" alignItems="center">
            <UserVerified />
            <Text size="title" align="center">
              <Trans>Email verified</Trans>
            </Text>
          </LineStackLayout>
        )}
      </ColumnStackLayout>
    </Dialog>
  );
}
