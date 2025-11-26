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
import {
  SubscriptionContext,
  SubscriptionProvider,
} from '../../../../Profile/Subscription/SubscriptionContext';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';

export default {
  title: 'Subscription/PromotionSubscriptionDialog',
  component: PromotionSubscriptionDialog,
  decorators: [paperDecorator],
};

export const NotAuthenticatedSilverRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_silver"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const AuthenticatedSilverRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_silver"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const GoldRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_gold"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const ProRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_startup"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const EducationRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={
          subscriptionPlansWithPricingSystems
        }
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_education"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};

export const WithoutSilverButRecommended = () => {
  const Component = () => {
    const { getSubscriptionPlansWithPricingSystems } = React.useContext(
      SubscriptionContext
    );
    const subscriptionPlansWithPricingSystems = getSubscriptionPlansWithPricingSystems();

    return !subscriptionPlansWithPricingSystems ? (
      <PlaceholderLoader />
    ) : (
      <PromotionSubscriptionDialog
        availableSubscriptionPlansWithPrices={subscriptionPlansWithPricingSystems.filter(
          plan => plan.id !== 'gdevelop_silver'
        )}
        onClose={() => action('on close')()}
        recommendedPlanId="gdevelop_silver"
        onOpenPendingDialog={() => action('on open pending dialog')()}
      />
    );
  };

  return (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <SubscriptionProvider>
          <Component />
        </SubscriptionProvider>
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  );
};
