// @flow

import * as React from 'react';
import {
  listSubscriptionPlanPricingSystems,
  listSubscriptionPlans,
  type SubscriptionPlanWithPricingSystems,
  type SubscriptionPlan,
  type SubscriptionPlanPricingSystem,
} from './GDevelopServices/Usage';
import { type AuthenticatedUser } from '../Profile/AuthenticatedUserContext';

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
  const nonLegacyPlans = subscriptionPlansWithPricingSystems.filter(
    subscriptionPlanWithPrices => !subscriptionPlanWithPrices.isLegacy
  );
  const availableSubscriptionPlansWithPrices = nonLegacyPlans.map(
    planWithPricingSystems => ({
      ...planWithPricingSystems,
      pricingSystems: planWithPricingSystems.pricingSystems.filter(
        pricingSystem => pricingSystem.status === 'active'
      ),
    })
  );
  return availableSubscriptionPlansWithPrices;
};

type Props = {|
  includeLegacy: boolean,
  authenticatedUser?: AuthenticatedUser,
|};

/**
 * Hook to access subscription plans across the app.
 */
const useSubscriptionPlans = ({ includeLegacy, authenticatedUser }: Props) => {
  const [
    subscriptionPlansWithPricingSystems,
    setSubscriptionPlansWithPrices,
  ] = React.useState<?(SubscriptionPlanWithPricingSystems[])>(null);
  const userId =
    authenticatedUser && authenticatedUser.profile
      ? authenticatedUser.profile.id
      : null;
  const getAuthorizationHeader = authenticatedUser
    ? authenticatedUser.getAuthorizationHeader
    : null;

  const fetchSubscriptionPlansAndPrices = React.useCallback(
    async () => {
      const results = await Promise.all([
        listSubscriptionPlans({
          includeLegacy,
          getAuthorizationHeader,
          userId,
        }),
        listSubscriptionPlanPricingSystems({
          includeLegacy,
          getAuthorizationHeader,
          userId,
        }),
      ]);
      setSubscriptionPlansWithPrices(
        mergeSubscriptionPlansWithPrices(results[0], results[1])
      );
    },
    [includeLegacy, getAuthorizationHeader, userId]
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
