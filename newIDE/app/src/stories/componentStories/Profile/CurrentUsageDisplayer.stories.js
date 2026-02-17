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

export const WithSubscriptionLimitNotReached = (): React.Node => (
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

export const WithoutSubscriptionLimitNotReached = (): React.Node => (
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

export const WithSubscriptionLimitNotReached30Days = (): React.Node => (
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

export const WithSubscription1BuildRemaining = (): React.Node => (
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

export const WithSubscription1BuildRemaining30Days = (): React.Node => (
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

export const WithSubscriptionRedemptionCode = (): React.Node => (
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

export const WithSubscriptionExpiredRedemptionCode = (): React.Node => (
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

export const WithSubscriptionLimitReached = (): React.Node => (
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

export const WithProSubscriptionLimitReached = (): React.Node => (
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

export const WithoutSubscriptionLimitsReached = (): React.Node => (
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
