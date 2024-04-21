// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserLoggingIn,
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserWithLegacyIndieSubscription,
  fakeGoldAuthenticatedUser,
  fakeAuthenticatedUserWithLegacyProSubscription,
  fakeAuthenticatedUserWithEducationPlan,
  fakeStartupAuthenticatedUser,
  subscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionDialog from '../../../../Profile/Subscription/SubscriptionDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import { getAvailableSubscriptionPlansWithPrices } from '../../../../Utils/UseSubscriptionPlans';

export default {
  title: 'Subscription/SubscriptionDialog',
  component: SubscriptionDialog,
  decorators: [paperDecorator],
  argTypes: {
    authenticated: {
      options: ['no', 'loading', 'yes'],
      control: { type: 'radio' },
    },
    willCancelAtPeriodEndOrIsExpired: {
      control: { type: 'boolean' },
    },
    filter: {
      options: ['none', 'individual', 'team', 'education'],
      control: { type: 'radio' },
    },
    userSubscriptionId: {
      options: [
        'none',
        'gdevelop_silver',
        'gdevelop_gold',
        'gdevelop_startup',
        'gdevelop_education',
        'gdevelop_indie',
        'gdevelop_pro',
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
  filter,
  userSubscriptionId,
  pricingSystem,
}: {|
  authenticated?: 'no' | 'loading' | 'yes',
  willCancelAtPeriodEndOrIsExpired?: boolean,
  filter?: 'none' | 'individual' | 'team' | 'education',
  userSubscriptionId?:
    | 'none'
    | 'gdevelop_silver'
    | 'gdevelop_gold'
    | 'gdevelop_startup'
    | 'gdevelop_education'
    | 'gdevelop_indie'
    | 'gdevelop_pro',
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
      : userSubscriptionId === 'gdevelop_startup'
      ? fakeStartupAuthenticatedUser
      : userSubscriptionId === 'gdevelop_education'
      ? fakeAuthenticatedUserWithEducationPlan
      : userSubscriptionId === 'gdevelop_indie'
      ? fakeAuthenticatedUserWithLegacyIndieSubscription
      : userSubscriptionId === 'gdevelop_pro'
      ? fakeAuthenticatedUserWithLegacyProSubscription
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
      } else if (userSubscriptionId === 'gdevelop_gold') {
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
  const userLegacySubscriptionPlanWithPricingSystem = userSubscription
    ? subscriptionPlansWithPricingSystems.find(
        planWithPricingSystem =>
          planWithPricingSystem.id === userSubscription.planId &&
          planWithPricingSystem.isLegacy
      )
    : null;

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={authenticatedUser}>
        <SubscriptionDialog
          open
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          userLegacySubscriptionPlanWithPricingSystem={
            userLegacySubscriptionPlanWithPricingSystem
          }
          onClose={() => action('on close')()}
          analyticsMetadata={{ reason: 'Debugger' }}
          filter={filter === 'none' ? undefined : filter}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
