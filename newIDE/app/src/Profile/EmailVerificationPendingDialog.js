// @flow
import { Trans } from '@lingui/macro';

import React, { useEffect, useRef } from 'react';
import FlatButton from '../UI/FlatButton';
import RaisedButton from '../UI/RaisedButton';
import Dialog from '../UI/Dialog';
import { type AuthenticatedUser } from './AuthenticatedUserContext';
import { Column, Line, Spacer } from '../UI/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import BackgroundText from '../UI/BackgroundText';
import VerifiedUser from '@material-ui/icons/VerifiedUser';
import Text from '../UI/Text';

type Props = {|
  onClose: Function,
  authenticatedUser: AuthenticatedUser,
|};

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(
    () => {
      function tick() {
        if (savedCallback.current) savedCallback.current();
      }

      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    },
    [delay]
  );
}

export default function EmailVerificationPendingDialog({
  onClose,
  authenticatedUser,
}: Props) {
  console.log(authenticatedUser);
  const isVerified =
    !!authenticatedUser &&
    !!authenticatedUser.firebaseUser &&
    !!authenticatedUser.firebaseUser.emailVerified;
  useInterval(
    () => authenticatedUser.onRefreshUserProfile(),
    isVerified ? null : 3900
  );

  return (
    <Dialog
      actions={[
        isVerified ? (
          <RaisedButton
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
      title={undefined}
      maxWidth="sm"
      cannotBeDismissed={true}
      open
      noMargin
    >
      {!isVerified && (
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
                - and come back here when it's done
              </Trans>
            </BackgroundText>
          </Line>
        </Column>
      )}
      {isVerified && (
        <Column>
          <Line>
            <Text>
              <Trans>Your email is now verified!</Trans> {'❤️'}
            </Text>
          </Line>
        </Column>
      )}
    </Dialog>
  );
}
