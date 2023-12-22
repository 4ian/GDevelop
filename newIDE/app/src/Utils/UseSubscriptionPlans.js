// @flow

import * as React from 'react';
import {
  listSubscriptionPlans,
  type SubscriptionPlanWithPrices,
} from './GDevelopServices/Usage';

/**
 * Hook to access subscription plans across the app.
 */
const useSubscriptionPlans = () => {
  const [
    subscriptionPlansWithPrices,
    setSubscriptionPlansWithPrices,
  ] = React.useState<?(SubscriptionPlanWithPrices[])>(null);

  const fetchSubscriptionPlans = React.useCallback(async () => {
    const plans = await listSubscriptionPlans();
    setSubscriptionPlansWithPrices(plans);
  }, []);

  React.useEffect(
    () => {
      fetchSubscriptionPlans();
    },
    [fetchSubscriptionPlans]
  );

  return { subscriptionPlansWithPrices };
};

export default useSubscriptionPlans;
