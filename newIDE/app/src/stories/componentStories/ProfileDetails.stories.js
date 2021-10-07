// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import ProfileDetails from '../../Profile/ProfileDetails';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';

const indieUserWithoutUsernameNorDescriptionProfile: Profile = {
  ...indieUserProfile,
  username: null,
  description: null,
};

export default {
  title: 'ProfileDetails',
  component: ProfileDetails,
  decorators: [paperDecorator, muiDecorator],
  argTypes: {
    profile: {
      control: { type: 'radio' },
      options: ['Complete profile', 'Without username nor bio'],
      defaultValue: 'Complete profile',
      mapping: {
        'Complete profile': indieUserProfile,
        'Without username nor bio': indieUserWithoutUsernameNorDescriptionProfile,
      },
    },
    onEditProfile: { action: 'edit profile' },
  },
};

type ArgsTypes = {|
  profile: Profile,
  onEditProfile: () => void,
|};

export const MyProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} isAuthenticatedUserProfile />
);
export const OtherUserProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} />
);
export const Loading = (args: ArgsTypes) => (
  <ProfileDetails {...args} profile={null} />
);
export const Errored = (args: ArgsTypes) => (
  <ProfileDetails
    {...args}
    profile={null}
    error={new Error('Connectivity Problems')}
    onRetry={() => {
      action('Retry profile fetch');
    }}
  />
);
Loading.argTypes = {
  profile: { control: { disable: true } },
};
