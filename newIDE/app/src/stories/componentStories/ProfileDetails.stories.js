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

// $FlowFixMe[signature-verification-failure]
export const MyCompleteProfileWithoutSubscription = () => (
  <ProfileDetails
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
  />
);

// $FlowFixMe[signature-verification-failure]
export const MyCompleteProfileWithSilverSubscription = () => (
  <ProfileDetails authenticatedUser={fakeSilverAuthenticatedUser} />
);

// $FlowFixMe[signature-verification-failure]
export const MyCompleteProfileWithProSubscription = () => (
  <ProfileDetails authenticatedUser={fakeStartupAuthenticatedUser} />
);

// $FlowFixMe[signature-verification-failure]
export const MyProfileWithoutDiscordUsernameNorSubscription = () => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const MyProfileWithoutDiscordUsernameWithStartupSubscription = () => (
  <ProfileDetails
    authenticatedUser={{
      ...fakeStartupAuthenticatedUser,
      profile: { ...indieUserProfile, discordUsername: '' },
    }}
  />
);

// $FlowFixMe[signature-verification-failure]
export const Loading = () => (
  <ProfileDetails
    authenticatedUser={{
      ...defaultAuthenticatedUserWithNoSubscription,
      profile: null,
    }}
  />
);
