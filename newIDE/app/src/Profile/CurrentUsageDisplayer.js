// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import {
  hasValidSubscriptionPlan,
  type CurrentUsage,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import GetSubscriptionCard from './Subscription/GetSubscriptionCard';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';

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
  if (!currentUsage) return <PlaceholderLoader />;
  const hasSubscription = hasValidSubscriptionPlan(subscription);
  const loadedButHasNoSubscription =
    subscription && !hasValidSubscriptionPlan(subscription);
  const remainingBuilds = Math.max(currentUsage.max - currentUsage.current, 0);
  const remainingMultipleMessage = (
    <Trans>
      You have {remainingBuilds} builds remaining (You have used{' '}
      {currentUsage.current}/{currentUsage.max} in the last 24h).
    </Trans>
  );
  const remainingSingleMessage = (
    <Trans>
      You have {remainingBuilds} build remaining (You have used{' '}
      {currentUsage.current}/{currentUsage.max} in the last 24h).
    </Trans>
  );

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage kind="info">
        <Text>
          {remainingBuilds === 1
            ? remainingSingleMessage
            : remainingMultipleMessage}
        </Text>
      </AlertMessage>
      {hasSubscription && currentUsage.limitReached && (
        <GetSubscriptionCard subscriptionDialogOpeningReason="Build limit reached">
          <Text>
            <Trans>
              Need more power? You can upgrade to a new plan to increase the
              limit!
            </Trans>
          </Text>
        </GetSubscriptionCard>
      )}
      {loadedButHasNoSubscription && (
        <GetSubscriptionCard subscriptionDialogOpeningReason="Build limit reached">
          <Text>
            <Trans>
              You don't have a subscription. Get one to increase the limits!
            </Trans>
          </Text>
        </GetSubscriptionCard>
      )}
    </ColumnStackLayout>
  );
};

export default CurrentUsageDisplayer;
