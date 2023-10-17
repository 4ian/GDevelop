// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../UI/RaisedButton';
import {
  hasValidSubscriptionPlan,
  type CurrentUsage,
  type Subscription,
} from '../Utils/GDevelopServices/Usage';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import Text from '../UI/Text';
import { SubscriptionSuggestionContext } from './Subscription/SubscriptionSuggestionContext';
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
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  if (!currentUsage) return <PlaceholderLoader />;
  const hasSubscription = hasValidSubscriptionPlan(subscription);
  const loadedButHasNoSubscription =
    subscription && !hasValidSubscriptionPlan(subscription);

  return (
    <ColumnStackLayout noMargin>
      <AlertMessage kind="info">
        <Text>
          <Trans>
            You have {Math.max(currentUsage.max - currentUsage.current, 0)}{' '}
            remaining builds for today (out of {currentUsage.max}).
          </Trans>
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
