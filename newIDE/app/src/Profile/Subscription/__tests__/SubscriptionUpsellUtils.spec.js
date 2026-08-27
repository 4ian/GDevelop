// @flow
import { getSubscriptionPlanToUpsell } from '../SubscriptionUpsellUtils';
import { fakeSubscriptionPlansWithPricingSystems } from '../../../fixtures/GDevelopServicesTestData/FakeSubscriptionPlans';
import {
  noSubscription,
  subscriptionForSilverUser,
  subscriptionForGoldUser,
  subscriptionForStartupUser,
  subscriptionForIndieUser,
  subscriptionForProUser,
  subscriptionForEducationPlan,
  subscriptionForGoldUserFromEducationPlan,
} from '../../../fixtures/GDevelopServicesTestData';

const getPlanIdToUpsell = (subscription: ?Object): ?string => {
  const plan = getSubscriptionPlanToUpsell({
    subscription,
    subscriptionPlansWithPricingSystems: fakeSubscriptionPlansWithPricingSystems,
  });
  return plan ? plan.id : null;
};

describe('getSubscriptionPlanToUpsell', () => {
  it('offers Gold to a user without a subscription', () => {
    expect(getPlanIdToUpsell(null)).toBe('gdevelop_gold');
    expect(getPlanIdToUpsell(noSubscription)).toBe('gdevelop_gold');
  });

  it('offers Gold to a Silver user', () => {
    expect(getPlanIdToUpsell(subscriptionForSilverUser)).toBe('gdevelop_gold');
  });

  it('offers Pro to a Gold user', () => {
    expect(getPlanIdToUpsell(subscriptionForGoldUser)).toBe('gdevelop_startup');
  });

  it('offers nothing to a Pro user', () => {
    expect(getPlanIdToUpsell(subscriptionForStartupUser)).toBe(null);
  });

  // The legacy plans still give the benefits of the current plan they map to, so
  // a user on one of them must be offered the plan above, never the one they
  // already effectively have.
  it('offers Gold to a user on the legacy Silver plan', () => {
    expect(getPlanIdToUpsell(subscriptionForIndieUser)).toBe('gdevelop_gold');
  });

  it('offers Pro to a user on the legacy Gold plan', () => {
    expect(getPlanIdToUpsell(subscriptionForProUser)).toBe('gdevelop_startup');
  });

  it('offers nothing to a user of an education plan', () => {
    expect(getPlanIdToUpsell(subscriptionForEducationPlan)).toBe(null);
    expect(getPlanIdToUpsell(subscriptionForGoldUserFromEducationPlan)).toBe(
      null
    );
  });

  it('offers nothing rather than a lower plan when the plan to offer is missing', () => {
    expect(
      getSubscriptionPlanToUpsell({
        subscription: subscriptionForGoldUser,
        // Only the plans up to Gold: there is nothing above to offer.
        subscriptionPlansWithPricingSystems: fakeSubscriptionPlansWithPricingSystems.filter(
          plan => plan.id !== 'gdevelop_startup'
        ),
      })
    ).toBe(null);
  });

  it('offers nothing while the plans are not loaded', () => {
    expect(
      getSubscriptionPlanToUpsell({
        subscription: null,
        subscriptionPlansWithPricingSystems: null,
      })
    ).toBe(null);
    expect(
      getSubscriptionPlanToUpsell({
        subscription: null,
        subscriptionPlansWithPricingSystems: [],
      })
    ).toBe(null);
  });
});
