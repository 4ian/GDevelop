// @flow
import * as React from 'react';

import paperDecorator from '../PaperDecorator';

import ProfileDetails from '../../Profile/ProfileDetails';
import {
  indieUserProfile,
  defaultAuthenticatedUserWithNoSubscription,
  fakeSilverAuthenticatedUser,
  fakeStartupAuthenticatedUser,
} from '../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Profile/ProfileDetails',
  component: ProfileDetails,
  decorators: [paperDecorator],
};

export const MyCompleteProfileWithoutSubscription = (): renders any => (
  <ProfileDetails
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
  />
);

export const MyCompleteProfileWithSilverSubscription = (): renders any => (
  <ProfileDetails authenticatedUser={fakeSilverAuthenticatedUser} />
);

export const MyCompleteProfileWithProSubscription = (): renders any => (
  <ProfileDetails authenticatedUser={fakeStartupAuthenticatedUser} />
);

export const MyProfileWithoutDiscordUsernameNorSubscription = (): renders any => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const MyProfileWithoutDiscordUsernameWithStartupSubscription = (): renders any => (
  <ProfileDetails
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const Loading = (): renders any => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: null,
    }}
  />
);
