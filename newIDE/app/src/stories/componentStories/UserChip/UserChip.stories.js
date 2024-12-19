// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { getPaperDecorator } from '../../PaperDecorator';

import UserChipComponent from '../../../UI/User/UserChip';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
  fakeAuthenticatedUserLoggingIn,
  defaultAuthenticatedUserWithNoSubscription,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { ColumnStackLayout } from '../../../UI/Layout';
import Text from '../../../UI/Text';

export default {
  title: 'User chips/UserChip',
  component: UserChipComponent,
  decorators: [getPaperDecorator('medium')],
};

const LoggedOut = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

const LoggingIn = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeAuthenticatedUserLoggingIn}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

const SignedInNoSubscription = () => {
  return (
    <AuthenticatedUserContext.Provider
      value={defaultAuthenticatedUserWithNoSubscription}
    >
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

const SignedInWithSubscription = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <UserChipComponent onOpenProfile={action('open profile')} />
    </AuthenticatedUserContext.Provider>
  );
};

export const UserChips = () => (
  <ColumnStackLayout>
    <Text>Logged Out</Text>
    <LoggedOut />
    <Text>Logging In</Text>
    <LoggingIn />
    <Text>Signed in - No Subscription</Text>
    <SignedInNoSubscription />
    <Text>Signed in - With Subscription</Text>
    <SignedInWithSubscription />
  </ColumnStackLayout>
);
