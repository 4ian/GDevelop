// @flow
import { Trans } from '@lingui/macro';

import React, { useEffect, useRef } from 'react';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from '../UI/Dialog';
import { type UserProfile } from './UserProfileContext';
import { Column, Line, Spacer } from '../UI/Grid';
import CircularProgress from 'material-ui/CircularProgress';
import BackgroundText from '../UI/BackgroundText';
import VerifiedUser from 'material-ui/svg-icons/action/verified-user';

type Props = {|
  onClose: Function,
  userProfile: UserProfile,
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

export default function SubscriptionPendingDialog({
  onClose,
  userProfile,
}: Props) {
  const hasPlan =
    !!userProfile &&
    !!userProfile.subscription &&
    !!userProfile.subscription.planId;
  useInterval(() => userProfile.onRefreshUserProfile(), hasPlan ? null : 3900);

  return (
    <Dialog
      actions={[
        hasPlan ? (
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
      open
      noMargin
      autoScrollBodyContent
    >
      {!hasPlan && (
        <Column>
          <Line>
            <p>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'❤️'}
              <b>
                <Trans>
                  Your browser will now open to enter your payment details
                  (handled securely by Stripe.com).
                </Trans>
              </b>
            </p>
          </Line>
          <Line justifyContent="center" alignItems="center">
            <CircularProgress size={20} />
            <Spacer />
            Waiting for the subscription confirmation...
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
      )}
      {hasPlan && (
        <Column>
          <Line>
            <p>
              <Trans>
                Thanks for getting a subscription and supporting GDevelop!
              </Trans>{' '}
              {'❤️'}
            </p>
          </Line>
          <Line justifyContent="center" alignItems="center">
            <VerifiedUser />
            <Spacer />
            <b>
              <Trans>Your new plan is now activated</Trans>
            </b>
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
