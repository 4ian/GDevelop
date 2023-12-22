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
  subscriptionPlansWithPrices,
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
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={null}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const ManagingSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={true}
    />
  </AlertProvider>
);

export const WithNoSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={noSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForGoldUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithStartupSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForStartupUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscriptionFromEducationPlan = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForGoldUserFromEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithEducationSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscriptionButCancelAtPeriodEnd = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={silverSubscriptionButCancelAtPeriodEnd}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithValidSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={silverSubscriptionWithRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithExpiredSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={silverSubscriptionWithExpiredRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithPurchaselyGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={purchaselyGoldSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyIndieSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForIndieUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyProSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithNoSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
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
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
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
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
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
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
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
      subscriptionPlansWithPrices={subscriptionPlansWithPrices}
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);
