// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import CurrentUsageDisplayer from '../../../Profile/CurrentUsageDisplayer';
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
  decorators: [paperDecorator],
};

export const WithSubscriptionLimitNotReached = (): renders any => (
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

export const WithoutSubscriptionLimitNotReached = (): renders any => (
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

export const WithSubscriptionLimitNotReached30Days = (): renders any => (
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

export const WithSubscription1BuildRemaining = (): renders any => (
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

export const WithSubscription1BuildRemaining30Days = (): renders any => (
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

export const WithSubscriptionRedemptionCode = (): renders any => (
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

export const WithSubscriptionExpiredRedemptionCode = (): renders any => (
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

export const WithSubscriptionLimitReached = (): renders any => (
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

export const WithProSubscriptionLimitReached = (): renders any => (
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

export const WithoutSubscriptionLimitsReached = (): renders any => (
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
