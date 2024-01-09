// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  noSubscription,
  silverSubscriptionWithExpiredRedemptionCode,
  silverSubscriptionWithRedemptionCode,
  silverSubscriptionButCancelAtPeriodEnd,
  subscriptionForGoldUser,
  subscriptionForStartupUser,
  subscriptionForIndieUser,
  subscriptionForProUser,
  subscriptionForEducationPlan,
  subscriptionForSilverUser,
  purchaselyGoldSubscription,
  subscriptionForGoldUserFromEducationPlan,
  subscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData';
import subscriptionSuggestionDecorator from '../../../SubscriptionSuggestionDecorator';
import SubscriptionDetails from '../../../../Profile/Subscription/SubscriptionDetails';
import AlertProvider from '../../../../UI/Alert/AlertProvider';

export default {
  title: 'Subscription/SubscriptionDetails',
  component: SubscriptionDetails,
  decorators: [subscriptionSuggestionDecorator, paperDecorator, muiDecorator],
};

export const LoadingSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={null}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const ManagingSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={true}
    />
  </AlertProvider>
);

export const WithNoSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={noSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForGoldUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithStartupSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForStartupUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscriptionFromEducationPlan = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForGoldUserFromEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithEducationSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscriptionButCancelAtPeriodEnd = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={silverSubscriptionButCancelAtPeriodEnd}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithValidSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={silverSubscriptionWithRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithExpiredSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={silverSubscriptionWithExpiredRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithPurchaselyGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={purchaselyGoldSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyIndieSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForIndieUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyProSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithNoSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={noSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);

export const WithGoldSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForGoldUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);

export const WithExpiredSilverRedemptionCodeSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={silverSubscriptionWithExpiredRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);

export const WithPurchaselyGoldSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={purchaselyGoldSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);

export const WithLegacyProSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPricingSystems={subscriptionPlansWithPricingSystems}
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);
