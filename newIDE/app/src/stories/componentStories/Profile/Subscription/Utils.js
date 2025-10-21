// @flow
import * as React from 'react';
import useSubscriptionPlans, {
  filterAvailableSubscriptionPlansWithPrices,
} from '../../../../Utils/UseSubscriptionPlans';
import { useLazyMemo } from '../../../../Utils/UseLazyMemo';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';

export const useGetAvailableSubscriptionPlansWithPrices = ({
  authenticatedUser,
  filterSilver,
}: {
  authenticatedUser: AuthenticatedUser,
  filterSilver?: boolean,
}) => {
  const { getSubscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser,
  });
  const getAvailableSubscriptionPlansWithPrices = useLazyMemo(
    React.useCallback(
      () => {
        const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
        if (!subscriptionPlansWithPricingSystems) return null;

        return filterAvailableSubscriptionPlansWithPrices(
          subscriptionPlansWithPricingSystems.filter(plan =>
            filterSilver ? plan.id !== 'gdevelop_silver' : true
          )
        );
      },
      [getSubscriptionPlansWithPricingSystems, filterSilver]
    )
  );

  return getAvailableSubscriptionPlansWithPrices;
};
