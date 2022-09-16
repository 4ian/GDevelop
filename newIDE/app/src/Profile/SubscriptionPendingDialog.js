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
  onClose: Function,
  authenticatedUser: AuthenticatedUser,
|};

export default function SubscriptionPendingDialog({
  onClose,
  authenticatedUser,
}: Props) {
  const hasPlan =
    !!authenticatedUser &&
    !!authenticatedUser.subscription &&
    !!authenticatedUser.subscription.planId;
  useInterval(
    () => {
      authenticatedUser.onRefreshUserProfile().catch(() => {
        // Ignore any error, will be retried anyway.
      });
    },
    hasPlan ? null : 3900
  );

  return (
    <Dialog
      actions={[
        hasPlan ? (
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
      onRequestClose={onClose}
      maxWidth="sm"
      open
      noMargin
    >
      {!hasPlan ? (
        <Column>
          <Line>
            <Text>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'💜'}{' '}
              <b>
                <Trans>
                  Your browser will now open to enter your payment details.
                </Trans>
              </b>
            </Text>
          </Line>
          <Line justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            <Text>Waiting for the subscription confirmation...</Text>
          </Line>
          <Spacer />
          <Line justifyContent="center">
            <BackgroundText>
              <Trans>
                Once you're done, come back to GDevelop and your account will be
                upgraded automatically, unlocking the extra exports and online
                services.
              </Trans>
            </BackgroundText>
          </Line>
        </Column>
      ) : (
        <Column>
          <Line>
            <Text>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'💜'}
            </Text>
          </Line>
          <Line justifyContent="center" alignItems="center">
            <VerifiedUser />
            <Spacer />
            <Text>
              <b>
                <Trans>Your new plan is now activated.</Trans>
              </b>
            </Text>
          </Line>
          <Spacer />
          <Line justifyContent="center">
            <BackgroundText>
              <Trans>
                Your account is upgraded, with the extra exports and online
                services. If you wish to change later, come back to your profile
                and choose another plan.
              </Trans>
            </BackgroundText>
          </Line>
        </Column>
      )}
    </Dialog>
  );
}
