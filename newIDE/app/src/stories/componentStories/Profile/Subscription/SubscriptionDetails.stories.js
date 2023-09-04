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
      subscription={null}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const ManagingSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={true}
    />
  </AlertProvider>
);

export const WithNoSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={noSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForSilverUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForGoldUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithStartupSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForStartupUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithGoldSubscriptionFromEducationPlan = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForGoldUserFromEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithEducationSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForEducationPlan}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithSilverSubscriptionButCancelAtPeriodEnd = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={silverSubscriptionButCancelAtPeriodEnd}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithValidSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={silverSubscriptionWithRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithExpiredSilverRedemptionCodeSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={silverSubscriptionWithExpiredRedemptionCode}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithPurchaselyGoldSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={purchaselyGoldSubscription}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyIndieSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForIndieUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithLegacyProSubscription = () => (
  <AlertProvider>
    <SubscriptionDetails
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
    />
  </AlertProvider>
);

export const WithNoSubscriptionOnMobile = () => (
  <AlertProvider>
    <SubscriptionDetails
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
      subscription={subscriptionForProUser}
      onManageSubscription={action('manage subscription')}
      isManageSubscriptionLoading={false}
      simulateNativeMobileApp
    />
  </AlertProvider>
);
