// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line } from '../UI/Grid';
import { type Limit, type Subscription } from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';

type Props = {|
  subscription: ?Subscription,
  limit: ?Limit,
  onChangeSubscription: Function,
|};

const LimitDisplayer = ({
  subscription,
  limit,
  onChangeSubscription,
}: Props) => {
  if (!limit) return <PlaceholderLoader />;
  const hasSubscription = subscription && !!subscription.planId;
  const noSubscription = subscription && !subscription.planId;

  return (
    <Column noMargin>
      <Text>
        <Trans>
          You have {Math.max(limit.max - limit.current, 0)} remaining builds for
          today (out of {limit.max}).
        </Trans>
      </Text>
      {hasSubscription && limit.limitReached && (
        <Text>
          <Trans>
            Need more power? You can upgrade to a new plan to increase the
            limit!
          </Trans>
        </Text>
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
        <Text>
          <Trans>
            You don't have a subscription. Get one to increase the limits!
          </Trans>
        </Text>
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

export default LimitDisplayer;
