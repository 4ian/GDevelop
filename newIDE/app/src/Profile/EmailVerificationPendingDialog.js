// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../UI/Dialog';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import { Column, Line, Spacer } from '../UI/Grid';
import BackgroundText from '../UI/BackgroundText';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import Text from '../UI/Text';
import { useInterval } from '../Utils/UseInterval';
import CircularProgress from '../UI/CircularProgress';

type Props = {|
  onClose: () => void,
  authenticatedUser: AuthenticatedUser,
|};

export default function EmailVerificationPendingDialog({
  onClose,
  authenticatedUser,
}: Props) {
  const isVerified =
    !!authenticatedUser &&
    !!authenticatedUser.firebaseUser &&
    !!authenticatedUser.firebaseUser.emailVerified;
  useInterval(
    () => {
      authenticatedUser.onRefreshFirebaseProfile().catch(() => {
        // Ignore any error, will be retried anyway.
      });
    },
    isVerified ? null : 3900
  );

  return (
    <Dialog
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
            label={<Trans>Cancel and close</Trans>}
            key="close"
            primary={false}
            onClick={onClose}
          />
        ),
      ]}
      maxWidth="sm"
      open
      noMargin
      onRequestClose={onClose}
      onApply={onClose}
    >
      {!isVerified ? (
        <Column>
          <Line justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <Text>Waiting for the email verification...</Text>
          </Line>
          <Spacer />
          <Line justifyContent="center">
            <BackgroundText>
              <Trans>
                Check your inbox and click the link to verify your email address
                - and come back here when it's done.
              </Trans>
            </BackgroundText>
          </Line>
        </Column>
      ) : (
        <Column>
          <Line justifyContent="center" alignItems="center">
            <VerifiedUser />
            <Spacer />
            <Text>
              <Trans>Your email is now verified!</Trans>
            </Text>
          </Line>
        </Column>
      )}
    </Dialog>
  );
}
