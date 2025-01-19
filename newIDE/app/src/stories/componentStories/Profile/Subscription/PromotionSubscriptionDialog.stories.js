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
import useSubscriptionPlans, {
  getAvailableSubscriptionPlansWithPrices,
} from '../../../../Utils/UseSubscriptionPlans';
import LoaderModal from '../../../../UI/LoaderModal';

export default {
  title: 'Subscription/PromotionSubscriptionDialog',
  component: PromotionSubscriptionDialog,
  decorators: [paperDecorator],
};

export const NotAuthenticatedSilverRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeNotAuthenticatedUser,
  });
  return subscriptionPlansWithPricingSystems ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};

export const AuthenticatedSilverRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  return subscriptionPlansWithPricingSystems ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};

export const GoldRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  return subscriptionPlansWithPricingSystems ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_gold"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};

export const ProRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  return subscriptionPlansWithPricingSystems ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_startup"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};

export const EducationRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  return subscriptionPlansWithPricingSystems ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithPricingSystems
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_education"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};

export const WithoutSilverButRecommended = () => {
  const { subscriptionPlansWithPricingSystems } = useSubscriptionPlans({
    includeLegacy: true,
    authenticatedUser: fakeAuthenticatedUserWithNoSubscription,
  });
  const subscriptionPlansWithoutSilver = subscriptionPlansWithPricingSystems
    ? subscriptionPlansWithPricingSystems.filter(
        plan => plan.id !== 'gdevelop_silver'
      )
    : null;
  return subscriptionPlansWithoutSilver ? (
    <AlertProvider>
      <AuthenticatedUserContext.Provider
        value={fakeAuthenticatedUserWithNoSubscription}
      >
        <PromotionSubscriptionDialog
          subscriptionPlansWithPricingSystems={getAvailableSubscriptionPlansWithPrices(
            subscriptionPlansWithoutSilver
          )}
          onClose={() => action('on close')()}
          recommendedPlanId="gdevelop_silver"
          onOpenPendingDialog={() => action('on open pending dialog')()}
        />
      </AuthenticatedUserContext.Provider>
    </AlertProvider>
  ) : (
    <LoaderModal show />
  );
};
