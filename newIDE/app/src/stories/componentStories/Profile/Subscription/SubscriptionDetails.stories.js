// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import {
  subscriptionPlansWithPricingSystems,
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserLoggingIn,
  fakeAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeGoldAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  fakeAuthenticatedGoldUserFromEducationPlan,
  fakeAuthenticatedUserWithEducationPlan,
  fakeAuthenticatedUserWithLegacyIndieSubscription,
  fakeAuthenticatedUserWithLegacyProSubscription,
  fakeGoldWithPurchaselyAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import subscriptionSuggestionDecorator from '../../../SubscriptionSuggestionDecorator';
import SubscriptionDetails from '../../../../Profile/Subscription/SubscriptionDetails';
import AlertProvider from '../../../../UI/Alert/AlertProvider';

export default {
  title: 'Subscription/SubscriptionDetails',
  component: SubscriptionDetails,
  decorators: [subscriptionSuggestionDecorator, paperDecorator],
  argTypes: {
    authenticated: {
      options: ['no', 'loading', 'yes'],
      control: { type: 'radio' },
    },
    willCancelAtPeriodEndOrIsExpired: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    simulateNativeMobileApp: {
      control: { type: 'boolean' },
    },
    userSubscriptionId: {
      options: [
        'none',
        'gdevelop_silver',
        'gdevelop_gold',
        'gdevelop_gold benefitting from education plan',
        'gdevelop_startup',
        'gdevelop_education',
        'gdevelop_indie',
        'gdevelop_pro',
        'gold purchasely subscription',
      ],
      control: { type: 'radio' },
    },
    pricingSystem: {
      options: [
        'monthly',
        'yearly',
        'redeemed',
        'team member',
        'manually added',
      ],
      control: { type: 'radio' },
    },
  },
};

export const Default = ({
  authenticated,
  willCancelAtPeriodEndOrIsExpired,
  loading,
  simulateNativeMobileApp,
  userSubscriptionId,
  pricingSystem,
}: {|
  authenticated?: 'no' | 'loading' | 'yes',
  willCancelAtPeriodEndOrIsExpired?: boolean,
  loading?: boolean,
  simulateNativeMobileApp?: boolean,
  userSubscriptionId?:
    | 'none'
    | 'gdevelop_silver'
    | 'gdevelop_gold'
    | 'gdevelop_gold benefitting from education plan'
    | 'gdevelop_startup'
    | 'gdevelop_education'
    | 'gdevelop_indie'
    | 'gdevelop_pro'
    | 'gold purchasely subscription',
  pricingSystem?:
    | 'monthly'
    | 'yearly'
    | 'redeemed'
    | 'team member'
    | 'manually added',
|}) => {
  const authenticatedUser =
    authenticated === 'no'
      ? fakeNotAuthenticatedUser
      : authenticated === 'loading'
      ? fakeAuthenticatedUserLoggingIn
      : userSubscriptionId === 'none'
      ? fakeAuthenticatedUserWithNoSubscription
      : userSubscriptionId === 'gdevelop_silver'
      ? fakeSilverAuthenticatedUser
      : userSubscriptionId === 'gdevelop_gold'
      ? fakeGoldAuthenticatedUser
      : userSubscriptionId === 'gdevelop_gold benefitting from education plan'
      ? fakeAuthenticatedGoldUserFromEducationPlan
      : userSubscriptionId === 'gdevelop_startup'
      ? fakeStartupAuthenticatedUser
      : userSubscriptionId === 'gdevelop_education'
      ? fakeAuthenticatedUserWithEducationPlan
      : userSubscriptionId === 'gdevelop_indie'
      ? fakeAuthenticatedUserWithLegacyIndieSubscription
      : userSubscriptionId === 'gdevelop_pro'
      ? fakeAuthenticatedUserWithLegacyProSubscription
      : userSubscriptionId === 'gold purchasely subscription'
      ? fakeGoldWithPurchaselyAuthenticatedUser
      : fakeNotAuthenticatedUser;

  if (authenticatedUser.subscription) {
    if (pricingSystem === 'redeemed') {
      authenticatedUser.subscription.pricingSystemId = 'REDEMPTION_CODE';
      authenticatedUser.subscription.redemptionCode = 'test-123-code';
      // $FlowIgnore
      authenticatedUser.subscription.redemptionCodeValidUntil =
        Date.now() +
        (!!willCancelAtPeriodEndOrIsExpired ? -1 : 1) * 7 * 24 * 3600 * 1000;
    } else if (pricingSystem === 'team member') {
      authenticatedUser.subscription.pricingSystemId = 'TEAM_MEMBER';
    } else if (pricingSystem === 'manually added') {
      authenticatedUser.subscription.pricingSystemId = 'MANUALLY_ADDED';
    } else {
      authenticatedUser.subscription.cancelAtPeriodEnd = !!willCancelAtPeriodEndOrIsExpired;
      if (userSubscriptionId === 'gdevelop_silver') {
        if (pricingSystem === 'yearly') {
          authenticatedUser.subscription.pricingSystemId =
            'silver_1year_3599EUR';
        } else {
          authenticatedUser.subscription.pricingSystemId =
            'silver_1month_499EUR';
        }
      } else if (
        userSubscriptionId === 'gdevelop_gold' &&
        userSubscriptionId !== 'gold purchasely subscription'
      ) {
        if (pricingSystem === 'yearly') {
          authenticatedUser.subscription.pricingSystemId = 'gold_1year_7199EUR';
        } else {
          authenticatedUser.subscription.pricingSystemId = 'gold_1month_999EUR';
        }
      } else if (userSubscriptionId === 'gdevelop_startup') {
        if (pricingSystem === 'yearly') {
          authenticatedUser.subscription.pricingSystemId =
            'startup_1year_30900EUR';
        } else {
          authenticatedUser.subscription.pricingSystemId =
            'startup_1month_3000EUR';
        }
      } else if (userSubscriptionId === 'gdevelop_education') {
        if (pricingSystem === 'yearly') {
          authenticatedUser.subscription.pricingSystemId =
            'education_1year_2999EUR';
        } else {
          authenticatedUser.subscription.pricingSystemId =
            'education_1month_299EUR';
        }
      } else if (userSubscriptionId === 'gdevelop_indie') {
        authenticatedUser.subscription.pricingSystemId = 'indie_1month';
      } else if (userSubscriptionId === 'gdevelop_pro') {
        authenticatedUser.subscription.pricingSystemId = 'pro_1month';
      }
    }
  }

  const { subscription: userSubscription } = authenticatedUser;

  return (
    <AlertProvider>
      <SubscriptionDetails
        subscriptionPlansWithPricingSystems={
          subscriptionPlansWithPricingSystems
        }
        subscription={userSubscription}
        onManageSubscription={action('manage subscription')}
        isManageSubscriptionLoading={!!loading}
        simulateNativeMobileApp={!!simulateNativeMobileApp}
      />
    </AlertProvider>
  );
};
