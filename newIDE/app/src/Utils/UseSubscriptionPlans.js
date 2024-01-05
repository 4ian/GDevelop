// @flow

import * as React from 'react';
import {
  listSubscriptionPlanPrices,
  listSubscriptionPlans,
  type SubscriptionPlanWithPrices,
  type SubscriptionPlan,
  type SubscriptionPlanPrice,
} from './GDevelopServices/Usage';

const mergeSubscriptionPlansWithPrices = (
  subscriptionPlans: SubscriptionPlan[],
  subscriptionPlanPrices: SubscriptionPlanPrice[]
): SubscriptionPlanWithPrices[] => {
  return subscriptionPlans
    .map(subscriptionPlan => {
      if (subscriptionPlan.id === 'free') {
        return {
          ...subscriptionPlan,
          prices: [],
        };
      }
      // Filter operation here keeps the order of the prices sent by the server.
      const matchingPricingSystems = subscriptionPlanPrices.filter(
        pricingSystem => pricingSystem.planId === subscriptionPlan.id
      );
      if (matchingPricingSystems.length === 0) return null;
      return {
        ...subscriptionPlan,
        prices: matchingPricingSystems,
      };
    })
    .filter(Boolean);
};

export const getAvailableSubscriptionPlansWithPrices = (
  subscriptionPlansWithPrices: SubscriptionPlanWithPrices[]
): SubscriptionPlanWithPrices[] => {
  return subscriptionPlansWithPrices.filter(
    subscriptionPlanWithPrices => !subscriptionPlanWithPrices.isLegacy
  );
};

type Props = {| includeLegacy: boolean |};

/**
 * Hook to access subscription plans across the app.
 */
const useSubscriptionPlans = ({ includeLegacy }: Props) => {
  const [
    subscriptionPlansWithPrices,
    setSubscriptionPlansWithPrices,
  ] = React.useState<?(SubscriptionPlanWithPrices[])>(null);

  const fetchSubscriptionPlansAndPrices = React.useCallback(
    async () => {
      const results = await Promise.all([
        listSubscriptionPlans({ includeLegacy }),
        listSubscriptionPlanPrices(),
      ]);
      setSubscriptionPlansWithPrices(
        mergeSubscriptionPlansWithPrices(results[0], results[1])
      );
    },
    [includeLegacy]
  );

  React.useEffect(
    () => {
      fetchSubscriptionPlansAndPrices();
    },
    [fetchSubscriptionPlansAndPrices]
  );

  return { subscriptionPlansWithPrices };
};

export default useSubscriptionPlans;
