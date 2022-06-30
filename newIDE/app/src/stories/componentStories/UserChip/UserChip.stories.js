// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import UserChipComponent from '../../../UI/User/UserChip';
import { indieUserProfile } from '../../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../../Utils/GDevelopServices/Authentication';

export default {
  title: 'User chips/UserChip',
  component: UserChipComponent,
  decorators: [paperDecorator, muiDecorator],
  argTypes: {
    withNotifications: {
      name: 'With notifications',
      type: { name: 'boolean', required: true },
      defaultValue: false,
    },
    profile: {
      name: 'User profile',
      control: { type: 'radio' },
      options: ['Signed in', 'Anonymous'],
      defaultValue: 'Signed in',
      mapping: {
        'Signed in': indieUserProfile,
        Anonymous: null,
      },
    },
  },
};

export const UserChip = ({
  withNotifications,
  profile,
}: {|
  withNotifications: boolean,
  profile: ?Profile,
|}) => (
  <UserChipComponent
    profile={profile}
    onClick={() => action('click user chip')}
    displayNotificationBadge={withNotifications}
  />
);
