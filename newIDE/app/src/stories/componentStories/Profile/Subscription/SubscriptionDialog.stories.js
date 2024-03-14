// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserLoggingIn,
  fakeSilverAuthenticatedUser,
  fakeSilverButCancelAtPeriodEndAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserWithValidSilverRedemptionCode,
  fakeAuthenticatedUserWithExpiredSilverRedemptionCode,
  fakeAuthenticatedUserWithLegacyIndieSubscription,
  fakeGoldAuthenticatedUser,
  fakeAuthenticatedUserWithLegacyProSubscription,
  fakeAuthenticatedUserWithEducationPlan,
  fakeStartupAuthenticatedUser,
  subscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionDialog from '../../../../Profile/Subscription/SubscriptionDialog';
import { type SubscriptionType } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import { getAvailableSubscriptionPlansWithPrices } from '../../../../Utils/UseSubscriptionPlans';

export default {
  title: 'Subscription/SubscriptionDialog',
  component: SubscriptionDialog,
  decorators: [paperDecorator, muiDecorator],
};

const SubscriptionDialogWrapper = ({
  authenticatedUser,
  filter,
}: {
  authenticatedUser: AuthenticatedUser,
  filter?: ?SubscriptionType,
}) => {
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
          filter={filter}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const NotAuthenticated = () => (
  <SubscriptionDialogWrapper authenticatedUser={fakeNotAuthenticatedUser} />
);

export const AuthenticatedButLoading = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserLoggingIn}
  />
);

export const WithNoSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
  />
);

export const FilteredOnIndividual = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    filter="individual"
  />
);

export const FilteredOnTeam = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    filter="team"
  />
);

export const FilteredOnEducation = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithNoSubscription}
    filter="education"
  />
);

export const WithSilverSubscription = () => (
  <SubscriptionDialogWrapper authenticatedUser={fakeSilverAuthenticatedUser} />
);

export const WithSilverButCancelAtPeriodEndSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeSilverButCancelAtPeriodEndAuthenticatedUser}
  />
);

export const WithGoldSubscription = () => (
  <SubscriptionDialogWrapper authenticatedUser={fakeGoldAuthenticatedUser} />
);

export const WithStartupSubscription = () => (
  <SubscriptionDialogWrapper authenticatedUser={fakeStartupAuthenticatedUser} />
);

export const WithEducationPlan = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithEducationPlan}
  />
);

export const WithValidSilverRedemptionCodeSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithValidSilverRedemptionCode}
  />
);

export const WithExpiredSilverRedemptionCodeSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithExpiredSilverRedemptionCode}
  />
);

export const WithLegacyIndieSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithLegacyIndieSubscription}
  />
);

export const WithLegacyProSubscription = () => (
  <SubscriptionDialogWrapper
    authenticatedUser={fakeAuthenticatedUserWithLegacyProSubscription}
  />
);
