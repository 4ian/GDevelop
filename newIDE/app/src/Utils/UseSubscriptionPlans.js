// @flow

import * as React from 'react';
import {
  listSubscriptionPlanPricingSystems,
  listSubscriptionPlans,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlan,
  type SubscriptionPlanPricingSystem,
} from './GDevelopServices/Usage';

const mergeSubscriptionPlansWithPrices = (
  subscriptionPlans: SubscriptionPlan[],
  subscriptionPlanPricingSystems: SubscriptionPlanPricingSystem[]
): SubscriptionPlanWithPricingSystems[] => {
  return subscriptionPlans
    .map(subscriptionPlan => {
      if (subscriptionPlan.id === 'free') {
        return {
          ...subscriptionPlan,
          pricingSystems: [],
        };
      }
      // Filter operation here keeps the order of the prices sent by the server.
      const matchingPricingSystems = subscriptionPlanPricingSystems.filter(
        pricingSystem => pricingSystem.planId === subscriptionPlan.id
      );
      if (matchingPricingSystems.length === 0) return null;
      return {
        ...subscriptionPlan,
        pricingSystems: matchingPricingSystems,
      };
    })
    .filter(Boolean);
};

export const getAvailableSubscriptionPlansWithPrices = (
  subscriptionPlansWithPricingSystems: SubscriptionPlanWithPricingSystems[]
): SubscriptionPlanWithPricingSystems[] => {
  return subscriptionPlansWithPricingSystems.filter(
    subscriptionPlanWithPrices => !subscriptionPlanWithPrices.isLegacy
  );
};

type Props = {| includeLegacy: boolean |};

/**
 * Hook to access subscription plans across the app.
 */
const useSubscriptionPlans = ({ includeLegacy }: Props) => {
  const [
    subscriptionPlansWithPricingSystems,
    setSubscriptionPlansWithPrices,
  ] = React.useState<?(SubscriptionPlanWithPricingSystems[])>(null);

  const fetchSubscriptionPlansAndPrices = React.useCallback(
    async () => {
      const results = await Promise.all([
        listSubscriptionPlans({ includeLegacy }),
        listSubscriptionPlanPricingSystems({ includeLegacy }),
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

  return { subscriptionPlansWithPricingSystems };
};

export default useSubscriptionPlans;
