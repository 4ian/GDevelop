// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CurrentUsageDisplayer from '../../../Profile/CurrentUsageDisplayer';
import subscriptionSuggestionDecorator from '../../SubscriptionSuggestionDecorator';
import {
  limitsReached,
  noSubscription,
  silverSubscriptionWithExpiredRedemptionCode,
  silverSubscriptionWithRedemptionCode,
  subscriptionForIndieUser,
  subscriptionForStartupUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/CurrentUsageDisplayer',
  component: CurrentUsageDisplayer,
  decorators: [subscriptionSuggestionDecorator, paperDecorator],
};

export const WithSubscriptionLimitNotReached = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForIndieUser}
    quota={{
      current: 2,
      max: 10,
      limitReached: false,
      period: '1day',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithoutSubscriptionLimitNotReached = () => (
  <CurrentUsageDisplayer
    subscription={noSubscription}
    quota={{
      current: 0,
      max: 1,
      limitReached: false,
      period: '1day',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscriptionLimitNotReached30Days = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForIndieUser}
    quota={{
      current: 2,
      max: 10,
      limitReached: false,
      period: '30days',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscription1BuildRemaining = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForIndieUser}
    quota={{
      current: 4,
      max: 5,
      limitReached: false,
      period: '1day',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscription1BuildRemaining30Days = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForIndieUser}
    quota={{
      current: 4,
      max: 5,
      limitReached: false,
      period: '30days',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscriptionRedemptionCode = () => (
  <CurrentUsageDisplayer
    subscription={silverSubscriptionWithRedemptionCode}
    quota={{
      current: 2,
      max: 10,
      limitReached: false,
      period: '1day',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscriptionExpiredRedemptionCode = () => (
  <CurrentUsageDisplayer
    subscription={silverSubscriptionWithExpiredRedemptionCode}
    quota={{
      current: 2,
      max: 10,
      limitReached: false,
      period: '1day',
    }}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithSubscriptionLimitReached = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForIndieUser}
    quota={limitsReached.quotas['cordova-build']}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithProSubscriptionLimitReached = () => (
  <CurrentUsageDisplayer
    subscription={subscriptionForStartupUser}
    quota={limitsReached.quotas['cordova-build']}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);

export const WithoutSubscriptionLimitsReached = () => (
  <CurrentUsageDisplayer
    subscription={noSubscription}
    quota={limitsReached.quotas['cordova-build']}
    usagePrice={{
      priceInCredits: 100,
    }}
    onChangeSubscription={action('on change subscription callback')}
    onStartBuildWithCredits={action('on start build with credits callback')}
  />
);
