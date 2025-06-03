// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeNotAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import PromotionSubscriptionDialog from '../../../../Profile/Subscription/PromotionSubscriptionDialog';
import AlertProvider from '../../../../UI/Alert/AlertProvider';
import { useGetAvailableSubscriptionPlansWithPrices } from './Utils';

export default {
  title: 'Subscription/PromotionSubscriptionDialog',
  component: PromotionSubscriptionDialog,
  decorators: [paperDecorator],
};

export const NotAuthenticatedSilverRecommended = () => {
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    {
      authenticatedUser: fakeNotAuthenticatedUser,
    }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
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
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    {
      authenticatedUser: fakeNotAuthenticatedUser,
    }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
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
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    {
      authenticatedUser: fakeNotAuthenticatedUser,
    }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
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
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    {
      authenticatedUser: fakeNotAuthenticatedUser,
    }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
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
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    {
      authenticatedUser: fakeNotAuthenticatedUser,
    }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
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
  const getAvailableSubscriptionPlansWithPrices = useGetAvailableSubscriptionPlansWithPrices(
    { authenticatedUser: fakeNotAuthenticatedUser, filterSilver: true }
  );
  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          getAvailableSubscriptionPlansWithPrices={
            getAvailableSubscriptionPlansWithPrices
          }
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
