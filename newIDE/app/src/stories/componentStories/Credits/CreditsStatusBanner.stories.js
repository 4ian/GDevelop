// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import CreditsStatusBanner from '../../../Credits/CreditsStatusBanner';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedUserWithNoSubscription,
  fakeAuthenticatedUserWithNoSubscriptionAndCredits,
  fakeNotAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Credits/CreditsStatusBanner',
  component: CreditsStatusBanner,
  decorators: [paperDecorator],
};

export const Loading = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <CreditsStatusBanner displayPurchaseAction />
    </AuthenticatedUserContext.Provider>
  );
};

export const Default = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscription}
    >
      <CreditsStatusBanner displayPurchaseAction />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithCredits = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <CreditsStatusBanner displayPurchaseAction />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithoutPurchaseAction = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={fakeAuthenticatedUserWithNoSubscriptionAndCredits}
    >
      <CreditsStatusBanner displayPurchaseAction={false} />
    </AuthenticatedUserContext.Provider>
  );
};
