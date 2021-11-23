// @flow
import * as React from 'react';
import withMock from 'storybook-addon-mock';
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
  },
};

type ArgsTypes = {|
  profile: Profile,
|};

const badges = [
  {
    achievementId: 'trivial_first-event',
    seen: false,
    unlockedAt: '2020-10-05T11:28:24.864Z',
    userId: 'userId',
  },
  {
    achievementId: 'game_success_1M-players',
    seen: false,
    unlockedAt: '2021-11-15T11:28:24.864Z',
    userId: 'userId',
  },
];

const apiDataServerSideError = {
  mockData: [
    {
      url:
        'https://yrun9q6udj.execute-api.us-east-1.amazonaws.com/dev/achievement',
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

export const MyProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} isAuthenticatedUserProfile badges={badges} />
);
export const MyProfileWithAchievementLoadingError = (args: ArgsTypes) => (
  <ProfileDetails {...args} isAuthenticatedUserProfile badges={badges} />
);
MyProfileWithAchievementLoadingError.decorators = [withMock];
MyProfileWithAchievementLoadingError.parameters = apiDataServerSideError;

export const OtherUserProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} badges={badges} />
);
export const OtherProfileWithAchievementLoadingError = (args: ArgsTypes) => (
  <ProfileDetails {...args} badges={badges} />
);
OtherProfileWithAchievementLoadingError.decorators = [withMock];
OtherProfileWithAchievementLoadingError.parameters = apiDataServerSideError;
export const Loading = (args: ArgsTypes) => (
  <ProfileDetails {...args} badges={[]} profile={null} />
);
export const Errored = (args: ArgsTypes) => (
  <ProfileDetails
    {...args}
    badges={[]}
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
Errored.argTypes = {
  profile: { control: { disable: true } },
};
