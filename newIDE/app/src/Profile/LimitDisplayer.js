// @flow
import * as React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Column, Line } from '../UI/Grid';
import { type Limit, type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';

type Props = {|
  subscription: ?Subscription,
  limit: ?Limit,
  onChangeSubscription: Function,
|};

export default ({ subscription, limit, onChangeSubscription }: Props) => {
  if (!limit) return <PlaceholderLoader />;
  const hasSubscription = subscription && !!subscription.planId;
  const noSubscription = subscription && !subscription.planId;

  return (
    <Column noMargin>
      <p>
        You have {Math.max(limit.max - limit.current, 0)} remaining builds for
        today (out of {limit.max}).
      </p>
      {hasSubscription &&
        limit.limitReached && (
          <p>
            Need more power? You can upgrade to a new plan to increase the
            limit!
          </p>
        )}
      {hasSubscription &&
        limit.limitReached && (
          <Line justifyContent="center" alignItems="center">
            <RaisedButton
              label="Upgrade my account"
              onClick={onChangeSubscription}
              primary
            />
          </Line>
        )}
      {noSubscription && (
        <p>You don't have a subscription. Get one to increase the limits!</p>
      )}
      {noSubscription && (
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
