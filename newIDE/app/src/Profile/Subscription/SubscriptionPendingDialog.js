// @flow
import { Trans } from '@lingui/macro';

import React from 'react';
import FlatButton from '../../UI/FlatButton';
import Dialog, { DialogPrimaryButton } from '../../UI/Dialog';
import { type AuthenticatedUser } from '../AuthenticatedUserContext';
import { Column, Line, Spacer } from '../../UI/Grid';
import BackgroundText from '../../UI/BackgroundText';
import UserVerified from '../../UI/CustomSvgIcons/UserVerified';
import Text from '../../UI/Text';
import { useInterval } from '../../Utils/UseInterval';
import CircularProgress from '../../UI/CircularProgress';

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
      title={<Trans>Confirming your subscription</Trans>}
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
    >
      {!hasPlan ? (
        <Column noMargin>
          <Line expand alignItems="center" justifyContent="center">
            <Text>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'💜'}
            </Text>
          </Line>
          <Line expand alignItems="center" justifyContent="center" noMargin>
            <Text>
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
            <Text>
              <Trans>Waiting for the subscription confirmation...</Trans>
            </Text>
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
        <Column noMargin>
          <Line expand alignItems="center" justifyContent="center">
            <Text>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'💜'}
            </Text>
          </Line>
          <Line justifyContent="center" alignItems="center">
            <UserVerified />
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
