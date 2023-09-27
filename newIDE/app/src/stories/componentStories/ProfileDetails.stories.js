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
  communityLinks: {},
};

export default {
  title: 'Profile/ProfileDetails',
  component: ProfileDetails,
  decorators: [paperDecorator, muiDecorator],
};

const getAssetPacksListingData = (
  userId
): Array<PrivateAssetPackListingData> => [
  {
    id: 'assetPackId',
    sellerId: userId,
    isSellerGDevelop: false,
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

export const MyProfile = () => (
  <ProfileDetails profile={indieUserProfile} isAuthenticatedUserProfile />
);

export const OtherUserProfile = () => (
  <ProfileDetails profile={indieUserProfile} assetPacksListingDatas={[]} />
);

export const IncompleteUserProfile = () => (
  <ProfileDetails
    profile={indieUserWithoutUsernameNorDescriptionProfile}
    assetPacksListingDatas={[]}
  />
);

export const OtherUserProfileWithPremiumAssetPacks = () => (
  <ProfileDetails
    profile={indieUserProfile}
    assetPacksListingDatas={getAssetPacksListingData(indieUserProfile.id)}
    onAssetPackOpen={action('open asset pack')}
  />
);

export const Loading = () => <ProfileDetails profile={null} />;

export const Errored = () => (
  <ProfileDetails
    profile={null}
    error={new Error('Connectivity Problems')}
    onRetry={() => {
      action('Retry profile fetch');
    }}
  />
);
