// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  noSubscription,
  silverSubscriptionWithExpiredRedemptionCode,
  silverSubscriptionWithRedemptionCode,
  subscriptionForGoldUser,
  subscriptionForIndieUser,
  subscriptionForProUser,
  subscriptionForSilverUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import subscriptionSuggestionDecorator from '../../../SubscriptionSuggestionDecorator';
import SubscriptionDetails from '../../../../Profile/Subscription/SubscriptionDetails';

export default {
  title: 'Subscription/SubscriptionDetails',
  component: SubscriptionDetails,
  decorators: [subscriptionSuggestionDecorator, paperDecorator, muiDecorator],
};

export const LoadingSubscription = () => (
  <SubscriptionDetails
    subscription={null}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const ManagingSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForSilverUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={true}
  />
);

export const WithNoSubscription = () => (
  <SubscriptionDetails
    subscription={noSubscription}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithSilverSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForSilverUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithGoldSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForGoldUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithValidSilverRedemptionCodeSubscription = () => (
  <SubscriptionDetails
    subscription={silverSubscriptionWithRedemptionCode}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithExpiredSilverRedemptionCodeSubscription = () => (
  <SubscriptionDetails
    subscription={silverSubscriptionWithExpiredRedemptionCode}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithLegacyIndieSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForIndieUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);

export const WithLegacyProSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForProUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);
