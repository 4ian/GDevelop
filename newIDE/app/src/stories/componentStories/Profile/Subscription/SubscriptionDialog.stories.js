// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAuthenticatedButLoadingAuthenticatedUser,
  fakeIndieAuthenticatedUser,
  fakeNoSubscriptionAuthenticatedUser,
  fakeNotAuthenticatedAuthenticatedUser,
  fakeSubscriptionWithRedemptionCodeAuthenticatedUser,
  subscriptionForIndieUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import SubscriptionDialog from '../../../../Profile/Subscription/SubscriptionDialog';

export default {
  title: 'Subscription/SubscriptionDialog',
  component: SubscriptionDialog,
  decorators: [paperDecorator, muiDecorator],
};

const fakeIndieAuthenticatedUserWithFormerSubscription = {
  ...fakeIndieAuthenticatedUser,
  subscription: subscriptionForIndieUser,
};

export const NotAuthenticated = () => (
  <AuthenticatedUserContext.Provider
    value={fakeNotAuthenticatedAuthenticatedUser}
  >
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
export const AuthenticatedButLoading = () => (
  <AuthenticatedUserContext.Provider
    value={fakeAuthenticatedButLoadingAuthenticatedUser}
  >
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
export const AuthenticatedUserWithSubscription = () => (
  <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
export const AuthenticatedUserWithRedemptionCodeSubscription = () => (
  <AuthenticatedUserContext.Provider
    value={fakeSubscriptionWithRedemptionCodeAuthenticatedUser}
  >
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
export const AuthenticatedUserWithFormerSubscription = () => (
  <AuthenticatedUserContext.Provider
    value={fakeIndieAuthenticatedUserWithFormerSubscription}
  >
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
export const AuthenticatedUserWithNoSubscription = () => (
  <AuthenticatedUserContext.Provider
    value={fakeNoSubscriptionAuthenticatedUser}
  >
    <SubscriptionDialog
      open
      onClose={action('on close')}
      analyticsMetadata={{ reason: 'Debugger' }}
    />
  </AuthenticatedUserContext.Provider>
);
