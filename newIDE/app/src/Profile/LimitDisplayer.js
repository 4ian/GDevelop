// @flow
import { Trans } from '@lingui/macro';

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
        <Trans>
          You have {Math.max(limit.max - limit.current, 0)} remaining builds for
          today (out of {limit.max}).
        </Trans>
      </p>
      {hasSubscription && limit.limitReached && (
        <p>
          <Trans>
            Need more power? You can upgrade to a new plan to increase the
            limit!
          </Trans>
        </p>
      )}
      {hasSubscription && limit.limitReached && (
        <Line justifyContent="center" alignItems="center">
          <RaisedButton
            label={<Trans>Upgrade my account</Trans>}
            onClick={onChangeSubscription}
            primary
          />
        </Line>
      )}
      {noSubscription && (
        <p>
          <Trans>
            You don't have a subscription. Get one to increase the limits!
          </Trans>
        </p>
      )}
      {noSubscription && (
        <Line justifyContent="center" alignItems="center">
          <RaisedButton
            label={<Trans>Get a subscription</Trans>}
            onClick={onChangeSubscription}
            primary
          />
        </Line>
      )}
    </Column>
  );
};
