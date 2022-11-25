// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line } from '../UI/Grid';
import {
  type CurrentUsage,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import { SubscriptionSuggestionContext } from './Subscription/SubscriptionSuggestionContext';

type Props = {|
  subscription: ?Subscription,
  currentUsage: ?CurrentUsage,
  onChangeSubscription: () => void,
|};

const CurrentUsageDisplayer = ({
  subscription,
  currentUsage,
  onChangeSubscription,
}: Props) => {
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  if (!currentUsage) return <PlaceholderLoader />;
  const hasSubscription = subscription && !!subscription.planId;
  const noSubscription = subscription && !subscription.planId;

  return (
    <Column noMargin>
      <Text>
        <Trans>
          You have {Math.max(currentUsage.max - currentUsage.current, 0)}{' '}
          remaining builds for today (out of {currentUsage.max}).
        </Trans>
      </Text>
      {hasSubscription && currentUsage.limitReached && (
        <Text>
          <Trans>
            Need more power? You can upgrade to a new plan to increase the
            limit!
          </Trans>
        </Text>
      )}
      {hasSubscription && currentUsage.limitReached && (
        <Line justifyContent="center" alignItems="center">
          <RaisedButton
            label={<Trans>Upgrade my account</Trans>}
            onClick={() => {
              onChangeSubscription();
              openSubscriptionDialog({ reason: 'Build limit reached' });
            }}
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
            onClick={() => {
              onChangeSubscription();
              openSubscriptionDialog({ reason: 'Build limit reached' });
            }}
            primary
          />
        </Line>
      )}
    </Column>
  );
};

export default CurrentUsageDisplayer;
