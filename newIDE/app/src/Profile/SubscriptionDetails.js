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
          Android in one-click!
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
          You don't have any subscription. Get one to access to all online
          services, including building your game for Android in one-click!
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
