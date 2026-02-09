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

export const MyCompleteProfileWithoutSubscription = (): React.Node => (
  <ProfileDetails
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
  />
);

export const MyCompleteProfileWithSilverSubscription = (): React.Node => (
  <ProfileDetails authenticatedUser={fakeSilverAuthenticatedUser} />
);

export const MyCompleteProfileWithProSubscription = (): React.Node => (
  <ProfileDetails authenticatedUser={fakeStartupAuthenticatedUser} />
);

export const MyProfileWithoutDiscordUsernameNorSubscription = (): React.Node => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const MyProfileWithoutDiscordUsernameWithStartupSubscription = (): React.Node => (
  <ProfileDetails
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

export const Loading = (): React.Node => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: null,
    }}
  />
);
