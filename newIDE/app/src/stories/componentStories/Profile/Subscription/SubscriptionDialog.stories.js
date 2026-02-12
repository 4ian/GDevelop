// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
  fakeGoldAuthenticatedUser,
  fakeStartupAuthenticatedUser,
  fakeAuthenticatedUserWithEducationPlan,
  fakeAuthenticatedUserWithLegacyIndieSubscription,
  fakeAuthenticatedUserWithLegacyProSubscription,
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
  fakeGoldWithPurchaselyAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionDialog from '../../../../Profile/Subscription/SubscriptionDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import {
  SubscriptionContext,
  SubscriptionProvider,
} from '../../../../Profile/Subscription/SubscriptionContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';

export default {
  title: 'Subscription/SubscriptionDialog',
  component: SubscriptionDialog,
  decorators: [paperDecorator],
  argTypes: {
    userState: {
      control: 'radio',
      options: [
        'Not Authenticated',
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
    cancelAtPeriodEnd: {
      control: 'boolean',
    },
    pricingSystem: {
      control: 'radio',
      options: [
        'monthly',
        'monthly (inactive)',
        'yearly',
        'yearly (inactive)',
        'redeemed',
        'team member',
        'manually added',
      ],
    },
    recommendedPlanId: {
      control: 'radio',
      options: [
        'None',
        'gdevelop_silver',
        'gdevelop_gold',
        'gdevelop_startup',
        'gdevelop_education',
      ],
    },
    excludePlanId: {
      control: 'radio',
      options: ['None', 'gdevelop_silver', 'gdevelop_gold', 'gdevelop_startup'],
    },
    availableSubscriptionPlansWithPrices: {
      table: { disable: true },
    },
    userSubscriptionPlanEvenIfLegacy: {
      table: { disable: true },
    },
    onClose: {
      table: { disable: true },
    },
    onOpenPendingDialog: {
      table: { disable: true },
    },
  },
};

const getUserFromState = (userState: string) => {
  switch (userState) {
    case 'Not Authenticated':
      return fakeNotAuthenticatedUser;
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
  userState,
  cancelAtPeriodEnd,
  pricingSystem,
  recommendedPlanId,
  excludePlanId,
}: {
  userState: string,
  cancelAtPeriodEnd: boolean,
  pricingSystem: string,
  recommendedPlanId: string,
  excludePlanId: string,
}) => {
  const Component = () => {
    const {
      getSubscriptionPlansWithPricingSystems,
      getUserSubscriptionPlanEvenIfLegacy,
    } = React.useContext(SubscriptionContext);
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();
    const userSubscriptionPlanEvenIfLegacy = getUserSubscriptionPlanEvenIfLegacy();

    if (!subscriptionPlansWithPricingSystems) {
      return <PlaceholderLoader />;
    }

    const filteredPlans =
      excludePlanId === 'None'
        ? subscriptionPlansWithPricingSystems
        : subscriptionPlansWithPricingSystems.filter(
            plan => plan.id !== excludePlanId
          );

    const recommendedPlanIdFinal =
      recommendedPlanId === 'None' ? null : recommendedPlanId;

    return (
      <SubscriptionDialog
        availableSubscriptionPlansWithPrices={filteredPlans}
        userSubscriptionPlanEvenIfLegacy={userSubscriptionPlanEvenIfLegacy}
        onClose={() => action('on close')()}
        recommendedPlanId={recommendedPlanIdFinal}
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  const authenticatedUser = getUserFromState(userState);

  if (authenticatedUser.subscription) {
    if (pricingSystem === 'redeemed') {
      authenticatedUser.subscription.pricingSystemId = 'REDEMPTION_CODE';
      authenticatedUser.subscription.redemptionCode = 'test-123-code';
      // $FlowIgnore
      authenticatedUser.subscription.redemptionCodeValidUntil =
        Date.now() + (cancelAtPeriodEnd ? -1 : 1) * 7 * 24 * 3600 * 1000;
      // $FlowIgnore
      authenticatedUser.subscriptionPricingSystem = null;
    } else if (pricingSystem === 'team member') {
      authenticatedUser.subscription.pricingSystemId = 'TEAM_MEMBER';
      // $FlowIgnore
      authenticatedUser.subscriptionPricingSystem = null;
    } else if (pricingSystem === 'manually added') {
      authenticatedUser.subscription.pricingSystemId = 'MANUALLY_ADDED';
      // $FlowIgnore
      authenticatedUser.subscriptionPricingSystem = null;
    } else {
      authenticatedUser.subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
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
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

Default.args = {
  userState: 'No Subscription',
  cancelAtPeriodEnd: false,
  pricingSystem: 'monthly',
  recommendedPlanId: 'gdevelop_silver',
  excludePlanId: 'None',
};
