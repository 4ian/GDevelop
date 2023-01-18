// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import {
  noSubscription,
  subscriptionForIndieUser,
  subscriptionForSilverUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import subscriptionSuggestionDecorator from '../../../SubscriptionSuggestionDecorator';
import SubscriptionDetails from '../../../../Profile/Subscription/SubscriptionDetails';

export default {
  title: 'Subscription/SubscriptionDetails',
  component: SubscriptionDetails,
  decorators: [subscriptionSuggestionDecorator, paperDecorator, muiDecorator],
};

export const WithSilverSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForSilverUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);
export const WithFormerSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForIndieUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);
export const NoSubscription = () => (
  <SubscriptionDetails
    subscription={noSubscription}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={false}
  />
);
export const LoadingManageSubscription = () => (
  <SubscriptionDetails
    subscription={subscriptionForSilverUser}
    onManageSubscription={action('manage subscription')}
    isManageSubscriptionLoading={true}
  />
);
