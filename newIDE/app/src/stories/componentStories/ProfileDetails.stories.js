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

export const MyCompleteProfileWithoutSubscription = (): renders* => (
  <ProfileDetails
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
  />
);

export const MyCompleteProfileWithSilverSubscription = (): renders* => (
  <ProfileDetails authenticatedUser={fakeSilverAuthenticatedUser} />
);

export const MyCompleteProfileWithProSubscription = (): renders* => (
  <ProfileDetails authenticatedUser={fakeStartupAuthenticatedUser} />
);

export const MyProfileWithoutDiscordUsernameNorSubscription = (): renders* => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const MyProfileWithoutDiscordUsernameWithStartupSubscription = (): renders* => (
  <ProfileDetails
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const Loading = (): renders* => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: null,
    }}
  />
);
