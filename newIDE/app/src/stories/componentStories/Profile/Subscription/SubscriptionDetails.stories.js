// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import {
  fakeAuthenticatedUserLoggingIn,
  fakeAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeGoldAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  fakeAuthenticatedUserWithEducationPlan,
  fakeAuthenticatedUserWithLegacyIndieSubscription,
  fakeAuthenticatedUserWithLegacyProSubscription,
  fakeGoldWithPurchaselyAuthenticatedUser,
  silverYearlyPricingSystem,
  silverMonthlyPricingSystem,
  silverYearlyPricingSystemOld,
  silverMonthlyPricingSystemOld,
  goldYearlyPricingSystem,
  goldYearlyPricingSystemOld,
  goldMonthlyPricingSystem,
  goldMonthlyPricingSystemOld,
  startupYearlyPricingSystem,
  startupYearlyPricingSystemOld,
  startupMonthlyPricingSystem,
  startupMonthlyPricingSystemOld,
  educationYearlyPricingSystem,
  educationMonthlyPricingSystem,
  indieMonthlyPricingSystem,
  proMonthlyPricingSystem,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionDetails from '../../../../Profile/Subscription/SubscriptionDetails';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import { SubscriptionProvider } from '../../../../Profile/Subscription/SubscriptionContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

export default {
  title: 'Subscription/SubscriptionDetails',
  component: SubscriptionDetails,
  decorators: [paperDecorator],
  argTypes: {
    willCancelAtPeriodEndOrIsExpired: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
    simulateNativeMobileApp: {
      control: { type: 'boolean' },
    },
    userState: {
      control: 'radio',
      options: [
        'No Subscription',
        'Mobile subscription',
        'Silver Subscription',
        'Gold Subscription',
        'Startup Subscription',
        'Education Subscription',
        'Indie Subscription (Legacy)',
        'Pro Subscription (Legacy)',
      ],
    },
    pricingSystem: {
      options: [
        'monthly',
        'monthly (inactive)',
        'yearly',
        'yearly (inactive)',
        'redeemed',
        'team member',
        'manually added',
      ],
      control: { type: 'radio' },
    },
    subscription: {
      table: { disable: true },
    },
    subscriptionPricingSystem: {
      table: { disable: true },
    },
    subscriptionPlansWithPricingSystems: {
      table: { disable: true },
    },
    onManageSubscription: {
      table: { disable: true },
    },
    isManageSubscriptionLoading: {
      table: { disable: true },
    },
  },
};

const getUserFromState = (userState: string) => {
  switch (userState) {
    case 'Mobile subscription':
      return fakeGoldWithPurchaselyAuthenticatedUser;
    case 'Silver Subscription':
      return fakeSilverAuthenticatedUser;
    case 'Gold Subscription':
      return fakeGoldAuthenticatedUser;
    case 'Startup Subscription':
      return fakeStartupAuthenticatedUser;
    case 'Education Subscription':
      return fakeAuthenticatedUserWithEducationPlan;
    case 'Indie Subscription (Legacy)':
      return fakeAuthenticatedUserWithLegacyIndieSubscription;
    case 'Pro Subscription (Legacy)':
      return fakeAuthenticatedUserWithLegacyProSubscription;
    case 'No Subscription':
    default:
      return fakeAuthenticatedUserWithNoSubscription;
  }
};

export const Default = ({
  willCancelAtPeriodEndOrIsExpired,
  loading,
  simulateNativeMobileApp,
  userState,
  pricingSystem,
}: {|
  willCancelAtPeriodEndOrIsExpired: boolean,
  loading: boolean,
  simulateNativeMobileApp: boolean,
  userState: string,
  pricingSystem: string,
|}) => {
  const authenticatedUser = loading
    ? fakeAuthenticatedUserLoggingIn
    : getUserFromState(userState);

  if (authenticatedUser.subscription) {
    authenticatedUser.subscription.redemptionCode = null;
    authenticatedUser.subscription.redemptionCodeValidUntil = null;
    // $FlowIgnore
    authenticatedUser.subscriptionPricingSystem = null;

    if (pricingSystem === 'redeemed') {
      authenticatedUser.subscription.pricingSystemId = 'REDEMPTION_CODE';
      authenticatedUser.subscription.redemptionCode = 'test-123-code';
      // $FlowIgnore
      authenticatedUser.subscription.redemptionCodeValidUntil =
        Date.now() +
        (willCancelAtPeriodEndOrIsExpired ? -1 : 1) * 7 * 24 * 3600 * 1000;
    } else if (pricingSystem === 'team member') {
      authenticatedUser.subscription.pricingSystemId = 'TEAM_MEMBER';
    } else if (pricingSystem === 'manually added') {
      authenticatedUser.subscription.pricingSystemId = 'MANUALLY_ADDED';
    } else {
      authenticatedUser.subscription.cancelAtPeriodEnd = willCancelAtPeriodEndOrIsExpired;
      if (userState === 'Silver Subscription') {
        // $FlowIgnore
        authenticatedUser.subscriptionPricingSystem =
          pricingSystem === 'yearly'
            ? silverYearlyPricingSystem
            : pricingSystem === 'yearly (inactive)'
            ? silverYearlyPricingSystemOld
            : pricingSystem === 'monthly'
            ? silverMonthlyPricingSystem
            : silverMonthlyPricingSystemOld;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      } else if (userState === 'Gold Subscription') {
        // $FlowIgnore
        authenticatedUser.subscriptionPricingSystem =
          pricingSystem === 'yearly'
            ? goldYearlyPricingSystem
            : pricingSystem === 'yearly (inactive)'
            ? goldYearlyPricingSystemOld
            : pricingSystem === 'monthly'
            ? goldMonthlyPricingSystem
            : goldMonthlyPricingSystemOld;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      } else if (userState === 'Startup Subscription') {
        authenticatedUser.subscriptionPricingSystem =
          pricingSystem === 'yearly'
            ? startupYearlyPricingSystem
            : pricingSystem === 'yearly (inactive)'
            ? startupYearlyPricingSystemOld
            : pricingSystem === 'monthly'
            ? startupMonthlyPricingSystem
            : startupMonthlyPricingSystemOld;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      } else if (userState === 'Education Subscription') {
        authenticatedUser.subscriptionPricingSystem =
          pricingSystem === 'yearly'
            ? educationYearlyPricingSystem
            : pricingSystem === 'yearly (inactive)'
            ? educationYearlyPricingSystem
            : pricingSystem === 'monthly'
            ? educationMonthlyPricingSystem
            : educationMonthlyPricingSystem;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      } else if (userState === 'Indie Subscription (Legacy)') {
        authenticatedUser.subscriptionPricingSystem = indieMonthlyPricingSystem;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      } else if (userState === 'Pro Subscription (Legacy)') {
        authenticatedUser.subscriptionPricingSystem = proMonthlyPricingSystem;
        authenticatedUser.subscription.pricingSystemId =
          authenticatedUser.subscriptionPricingSystem.id;
      }
    }
  }

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={authenticatedUser}>
        <SubscriptionProvider>
          <SubscriptionDetails
            onManageSubscription={action('manage subscription')}
            isManageSubscriptionLoading={!!loading}
            simulateNativeMobileApp={!!simulateNativeMobileApp}
          />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

Default.args = {
  willCancelAtPeriodEndOrIsExpired: false,
  loading: false,
  simulateNativeMobileApp: false,
  userState: 'No Subscription',
  pricingSystem: 'monthly',
};
