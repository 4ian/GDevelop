// @flow
import * as React from 'react';
import { Column, Line } from '../UI/Grid';
import { type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

type Props = {
  subscription: ?Subscription,
};

export default ({ subscription }: Props) =>
  subscription && subscription.planId ? (
    <Column>
      <Line>
        <p>
          You are subscribed to {subscription.planId}. Congratulations! You have
          access to more online services, including building your game for
          Android in one-click!
        </p>
      </Line>
      <Line>
        <RaisedButton label="Upgrade/change" disabled />
        <FlatButton label="Cancel subscription" disabled />
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
      <Line>
        <RaisedButton label="Choose a subscription" disabled />
      </Line>
    </Column>
  ) : (
    <PlaceholderLoader />
  );
