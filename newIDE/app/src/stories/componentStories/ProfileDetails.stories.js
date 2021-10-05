// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import ProfileDetails from '../../Profile/ProfileDetails';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';

export default {
  title: "ProfileDetails",
  component: ProfileDetails,
  decorators: [paperDecorator, muiDecorator],
  argTypes: {
    profile: {
      control: { type: 'radio' },
      options: ['Complete profile', 'Without username nor bio'],
      defaultValue: 'Complete profile',
      mapping: {
        'Complete profile': indieUserProfile,
        'Without username nor bio': {
          ...indieUserProfile,
          username: null,
          description: null
        }
      }
    }
  },
}

export const Profile = (args) => <ProfileDetails {...args} onEditProfile={action('edit profile')} />;
export const Loading = (args) => <ProfileDetails profile={null} onEditProfile={action('edit profile')} />;
Loading.argTypes = {
  profile: {control: {disable: true}}
}
