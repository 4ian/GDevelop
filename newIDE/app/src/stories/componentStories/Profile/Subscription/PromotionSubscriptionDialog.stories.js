// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
  subscriptionPlansWithPricingSystems,
} from '../../../../fixtures/GDevelopServicesTestData';
import PromotionSubscriptionDialog from '../../../../Profile/Subscription/PromotionSubscriptionDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import { getAvailableSubscriptionPlansWithPrices } from '../../../../Utils/UseSubscriptionPlans';

export default {
  title: 'Subscription/PromotionSubscriptionDialog',
  component: PromotionSubscriptionDialog,
  decorators: [paperDecorator],
};

const availableSubscriptionPlansWithPrices = getAvailableSubscriptionPlansWithPrices(
  subscriptionPlansWithPricingSystems
);

export const NotAuthenticatedSilverRecommended = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={
            availableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const AuthenticatedSilverRecommended = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={
            availableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const GoldRecommended = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={
            availableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_gold"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const ProRecommended = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={
            availableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_startup"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const EducationRecommended = () => {
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={
            availableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_education"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const WithoutSilverButRecommended = () => {
  const availableSubscriptionPlansWithPrices = getAvailableSubscriptionPlansWithPrices(
    subscriptionPlansWithPricingSystems
  );
  const subscritionPlansWithoutSilver = availableSubscriptionPlansWithPrices.filter(
    plan => plan.id !== 'gdevelop_silver'
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={subscritionPlansWithoutSilver}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
