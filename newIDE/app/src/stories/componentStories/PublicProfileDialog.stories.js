// @flow
import * as React from 'react';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import PublicProfileDialog from '../../Profile/PublicProfileDialog';
import { indieUserProfile } from '../../fixtures/GDevelopServicesTestData';
import { type Profile } from '../../Utils/GDevelopServices/Authentication';
import {
  GDevelopShopApi,
  GDevelopUserApi,
} from '../../Utils/GDevelopServices/ApiConfigs';

const indieUserWithoutUsernameNorDescriptionProfile: Profile = {
  ...indieUserProfile,
  username: null,
  description: null,
  donateLink: null,
  communityLinks: {},
};

export default {
  title: 'Profile/PublicProfileDialog',
  component: PublicProfileDialog,
  decorators: [paperDecorator, muiDecorator],
};

const userId = 'user-id';

const assetPacks = new Array(5).fill(0).map((_, i) => ({
  id: `644db285-6ed7-4ba6-abf4-06ea825f441${i}`,
  sellerId: userId,
  createdAt: '2022-12-14T10:11:49.305Z',
  updatedAt: '2022-12-14T10:11:49.305Z',
  name: 'Blue Girl Platformer Pack',
  description: '28 assets',
  sellerStripeAccountId: 'acct_14EN2o46T03ISJOc',
  productType: 'ASSET_PACK',
  listing: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/private-assets/Blue Girl Platformer Pack/thumbnail.png',
  ],
  stripeProductId: 'prod_MypbkdW56ntnME',
  prices: [
    {
      name: 'default',
      value: 399,
      stripePriceId: 'price_1MErwH46T03ISJOcghK9hyKB',
    },
  ],
}));

const apiDataFullUser = {
  mockData: [
    {
      url: `${GDevelopUserApi.baseUrl}/user-public-profile/${userId}`,
      method: 'GET',
      status: 200,
      response: indieUserProfile,
      delay: 500,
    },
    {
      url: `${
        GDevelopShopApi.baseUrl
      }/user/${userId}/product?productType=asset-pack`,
      method: 'GET',
      status: 200,
      response: assetPacks,
      delay: 1000,
    },
  ],
};

const apiDataEmptyUser = {
  mockData: [
    {
      url: `${GDevelopUserApi.baseUrl}/user-public-profile/${userId}`,
      method: 'GET',
      status: 200,
      response: indieUserWithoutUsernameNorDescriptionProfile,
      delay: 1000,
    },
    {
      url: `${
        GDevelopShopApi.baseUrl
      }/user/${userId}/product?productType=asset-pack`,
      method: 'GET',
      status: 200,
      response: [],
      delay: 1000,
    },
  ],
};

export const FullProfile = () => (
  <PublicProfileDialog
    userId={userId}
    onClose={() => {}}
    onAssetPackOpen={() => {}}
  />
);
FullProfile.parameters = apiDataFullUser;

export const EmptyProfile = () => (
  <PublicProfileDialog
    userId={userId}
    onClose={() => {}}
    onAssetPackOpen={() => {}}
  />
);
EmptyProfile.parameters = apiDataEmptyUser;
