// @flow
import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';
import { type Limit, type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';

type Props = {
  subscription: ?Subscription,
  limit: ?Limit,
  onChangeSubscription: Function,
};

export default ({ subscription, limit, onChangeSubscription }: Props) => {
  if (!limit) return <PlaceholderLoader />;

  return (
    <Column noMargin>
      <p>
        You have {Math.max(limit.max - limit.current, 0)} remaining builds for
        today (out of {limit.max}).
      </p>
      {subscription &&
        limit.limitReached && (
          <p>
            Need more power? You can upgrade to a new plan to increase the
            limit!
          </p>
        )}
      {subscription &&
        limit.limitReached && (
          <RaisedButton
            label="Upgrade my account"
            onClick={onChangeSubscription}
            primary
          />
        )}
      {!subscription && (
        <Line>
          <p>You don't have a subscription. Get one to increase the limits!</p>
        </Line>
      )}
      {!subscription && (
        <Line justifyContent="center" alignItems="center">
          <RaisedButton
            label="Get a subscription"
            onClick={onChangeSubscription}
            primary
          />
        </Line>
      )}
    </Column>
  );
};
