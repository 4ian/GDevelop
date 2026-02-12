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

export const MyCompleteProfileWithoutSubscription = () => (
  <ProfileDetails
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
  />
);

export const MyCompleteProfileWithSilverSubscription = () => (
  <ProfileDetails authenticatedUser={fakeSilverAuthenticatedUser} />
);

export const MyCompleteProfileWithProSubscription = () => (
  <ProfileDetails authenticatedUser={fakeStartupAuthenticatedUser} />
);

export const MyProfileWithoutDiscordUsernameNorSubscription = () => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const MyProfileWithoutDiscordUsernameWithStartupSubscription = () => (
  <ProfileDetails
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const Loading = () => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: null,
    }}
  />
);
