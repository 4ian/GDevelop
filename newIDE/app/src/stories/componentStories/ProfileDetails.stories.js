// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import ProfileDetails from '../../Profile/ProfileDetails';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import { type PrivateAssetPackListingData } from '../../Utils/GDevelopServices/Shop';

const indieUserWithoutUsernameNorDescriptionProfile: Profile = {
  ...indieUserProfile,
  username: null,
  description: null,
};

export default {
  title: 'Profile/ProfileDetails',
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

const getAssetPacksListingData = (
  userId
): Array<PrivateAssetPackListingData> => [
  {
    id: 'assetPackId',
    sellerId: userId,
    productType: 'ASSET_PACK',
    listing: 'ASSET_PACK',
    name: 'French food',
    description: 'The best asset pack about french food',
    categories: ['props'],
    updatedAt: '2021-11-18T10:19:50.417Z',
    createdAt: '2021-11-18T10:19:50.417Z',
    thumbnailUrls: [
      'https://resources.gdevelop-app.com/private-assets/Blue Girl Platformer Pack/thumbnail.png',
    ],
    prices: [
      {
        value: 599,
        name: 'default',
        stripePriceId: 'stripePriceId',
      },
    ],
    appStoreProductId: null,
  },
];

export const MyProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} isAuthenticatedUserProfile />
);

export const OtherUserProfile = (args: ArgsTypes) => (
  <ProfileDetails {...args} assetPacksListingData={[]} />
);

export const OtherUserProfileWithPremiumAssetPacks = (args: ArgsTypes) => (
  <ProfileDetails
    {...args}
    assetPacksListingData={getAssetPacksListingData(args.profile.id)}
    onAssetPackOpen={action('open asset pack')}
  />
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
Errored.argTypes = {
  profile: { control: { disable: true } },
};
