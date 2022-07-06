// @flow
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import { type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import Text from '../UI/Text';

type Props = {
  subscription: ?Subscription,
  onChangeSubscription: Function,
};

const SubscriptionDetails = ({ subscription, onChangeSubscription }: Props) =>
  subscription ? (
    <Column>
      <Line alignItems="center">
        <Text size="block-title">My online services subscriptions</Text>
      </Line>
      {subscription.planId ? (
        <>
          <Line>
            <Text>
              <Trans>
                You are subscribed to {subscription.planId}. Congratulations!
                You have access to more online services, including building your
                game for Android, Windows, macOS and Linux in one click!
              </Trans>
            </Text>
          </Line>
          <Line justifyContent="flex-end">
            <RaisedButton
              label={<Trans>Upgrade/change</Trans>}
              primary
              onClick={onChangeSubscription}
            />
          </Line>
        </>
      ) : (
        <>
          <Line>
            <Text>
              <Trans>
                If you don't have a subscription, consider getting one now.
                Accounts allow you to access all of the online services. With
                just one click, you can build your game for Android, Windows,
                macOS and Linux!
              </Trans>
            </Text>
          </Line>
          <Line justifyContent="flex-end">
            <RaisedButton
              label={<Trans>Choose a subscription</Trans>}
              primary
              onClick={onChangeSubscription}
            />
          </Line>
        </>
      )}
    </Column>
  ) : (
    <PlaceholderLoader />
  );

export default SubscriptionDetails;
