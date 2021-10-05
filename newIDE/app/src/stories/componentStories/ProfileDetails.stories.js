// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import ProfileDetails from '../../Profile/ProfileDetails';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import {type Profile as ProfileType} from '../../Utils/GDevelopServices/Authentication'

export default {
  title: "ProfileDetails",
  component: ProfileDetails,
  decorators: [paperDecorator, muiDecorator],
  argTypes: {
    onEditProfile: {action: 'edit profile'},
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

type ArgsTypes = {|
  profile: ProfileType,
  onEditProfile: () => void,
|}

export const Profile = (args: ArgsTypes) => <ProfileDetails {...args} />;
export const Loading = (args: ArgsTypes) => <ProfileDetails {...args} profile={null} />;
Loading.argTypes = {
  profile: {control: {disable: true}}
}
