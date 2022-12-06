// @flow
import * as React from 'react';
import withMock from 'storybook-addon-mock';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { GDevelopUserApi } from '../../Utils/GDevelopServices/ApiConfigs';

const indieUserWithoutUsernameNorDescriptionProfile: Profile = {
  ...indieUserProfile,
  username: null,
  description: null,
  donateLink: null,
};

export default {
  title: 'Profile/PublicProfileDialog',
  component: PublicProfileDialog,
  decorators: [paperDecorator, muiDecorator],
};

const badges = [
  {
    achievementId: 'trivial_first-event',
    seen: true,
    unlockedAt: '2020-10-05T11:28:24.864Z',
    userId: 'userId',
  },
  {
    achievementId: 'trivial_first-behavior',
    seen: false,
    unlockedAt: '2021-11-15T11:28:24.864Z',
    userId: 'userId',
  },
];

const apiDataFullUser = {
  mockData: [
    {
      url: `${GDevelopUserApi.baseUrl}/user-public-profile/user-id`,
      method: 'GET',
      status: 200,
      response: indieUserProfile,
    },
    {
      url: `${GDevelopUserApi.baseUrl}/user/user-id/badge`,
      method: 'GET',
      status: 200,
      response: badges,
    },
  ],
};

const apiDataEmptyUser = {
  mockData: [
    {
      url: `${GDevelopUserApi.baseUrl}/user-public-profile/user-id`,
      method: 'GET',
      status: 200,
      response: indieUserWithoutUsernameNorDescriptionProfile,
    },
    {
      url: `${GDevelopUserApi.baseUrl}/user/user-id/badge`,
      method: 'GET',
      status: 200,
      response: [],
    },
  ],
};

export const FullProfile = () => (
  <PublicProfileDialog userId="user-id" onClose={() => {}} />
);
FullProfile.decorators = [withMock];
FullProfile.parameters = apiDataFullUser;

export const EmptyProfile = () => (
  <PublicProfileDialog userId="user-id" onClose={() => {}} />
);
EmptyProfile.decorators = [withMock];
EmptyProfile.parameters = apiDataEmptyUser;
