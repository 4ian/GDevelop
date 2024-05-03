// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import UserChipComponent from '../../../UI/User/UserChip';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserWithBadges,
  fakeAuthenticatedUserLoggingIn,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'User chips/UserChip',
  component: UserChipComponent,
  decorators: [paperDecorator],
};

export const Anonymous = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const LoggingIn = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeAuthenticatedUserLoggingIn}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const SignedIn = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const SignedInWithNotifications = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeAuthenticatedUserWithBadges}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};
