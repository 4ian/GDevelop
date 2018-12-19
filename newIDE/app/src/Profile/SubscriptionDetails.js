// @flow
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import { type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from 'material-ui/RaisedButton';

type Props = {
  subscription: ?Subscription,
  onChangeSubscription: Function,
};

export default ({ subscription, onChangeSubscription }: Props) =>
  subscription && subscription.planId ? (
    <Column>
      <Line>
        <p>
          You are subscribed to {subscription.planId}. Congratulations! You have
          access to more online services, including building your game for
          Android, Windows, macOS and Linux in one click!
        </p>
      </Line>
      <Line justifyContent="center">
        <RaisedButton
          label="Upgrade/change"
          primary
          onClick={onChangeSubscription}
        />
      </Line>
    </Column>
  ) : subscription && !subscription.planId ? (
    <Column>
      <Line>
        <p>
          If you don't have a subscription, consider getting one now. Accounts
          allow you to access all of the online services. With just one click,
          you can build your game for Android, Windows, macOS and Linux!
        </p>
      </Line>
      <Line justifyContent="center">
        <RaisedButton
          label="Choose a subscription"
          primary
          onClick={onChangeSubscription}
        />
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
