// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import UserChipComponent from '../../../UI/User/UserChip';
import {
  fakeIndieAuthenticatedUser,
  fakeNotAuthenticatedAuthenticatedUser,
  fakeAuthenticatedUserWithBadges,
  fakeAuthenticatedButLoadingAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'User chips/UserChip',
  component: UserChipComponent,
  decorators: [paperDecorator, muiDecorator],
  argTypes: {
    user: {
      name: 'User',
      control: { type: 'radio' },
      options: [
        'Anonymous',
        'Logging in',
        'Signed in',
        'Signed in with notifications',
      ],
      defaultValue: 'Signed in',
      mapping: {
        Anonymous: fakeNotAuthenticatedAuthenticatedUser,
        'Logging in': fakeAuthenticatedButLoadingAuthenticatedUser,
        'Signed in': fakeIndieAuthenticatedUser,
        'Signed in with notifications': fakeAuthenticatedUserWithBadges,
      },
    },
  },
};

export const UserChip = ({ user }: {| user: AuthenticatedUser |}) => (
  <AuthenticatedUserContext.Provider value={user}>
    <UserChipComponent onOpenProfile={action('open profile')} />
  </AuthenticatedUserContext.Provider>
);
