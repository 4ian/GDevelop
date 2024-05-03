// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../../../PaperDecorator';
import PrivateAssetPackInformationPage from '../../../../AssetStore/PrivateAssets/PrivateAssetPackInformationPage';
import {
  client as assetApiAxiosClient,
  type PrivateAssetPack,
} from '../../../../Utils/GDevelopServices/Asset';
import { client as userApiAxiosClient } from '../../../../Utils/GDevelopServices/User';
import { client as shopApiAxiosClient } from '../../../../Utils/GDevelopServices/Shop';
import { type PrivateAssetPackListingData } from '../../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  fakeAssetPackLicenses,
  fakeGoldAuthenticatedUser,
  fakeSilverAuthenticatedUserWithCloudProjects,
  defaultAuthenticatedUserWithNoSubscription,
  fakeAuthenticatedUserWithEducationPlan,
} from '../../../../fixtures/GDevelopServicesTestData';
import {
  AssetStoreContext,
  initialAssetStoreState,
} from '../../../../AssetStore/AssetStoreContext';
import { ProductLicenseStoreStateProvider } from '../../../../AssetStore/ProductLicense/ProductLicenseStoreContext';
import { SubscriptionSuggestionProvider } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type AuthenticatedUser } from '../../../../Profile/AuthenticatedUserContext';

export default {
  title: 'AssetStore/AssetStore/PrivateAssetPackInformationPage',
  component: PrivateAssetPackInformationPage,
  decorators: [paperDecorator],
};

const sellerPublicProfile = {
  id: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  username: 'CreatorUserName',
  description: 'I create asset packs for GDevelop for country-specific food.',
};

const privateAssetPack1ListingData: PrivateAssetPackListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/thumbnail1.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'ASSET_PACK',
  description: '5 assets',
  name: 'French Food',
  categories: ['props'],
  prices: [
    {
      value: 1500,
      name: 'commercial_USD',
      stripePriceId: 'stripePriceId',
      currency: 'USD',
      usageType: 'commercial',
    },
  ],
  creditPrices: [
    {
      amount: 1500,
      usageType: 'commercial',
    },
  ],
  appStoreProductId: null,
  sellerStripeAccountId: 'sellerStripeProductId',
  stripeProductId: 'stripeProductId',
};

const privateAssetPack1: PrivateAssetPack = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  name: 'French Food',
  content: {
    sprite: 14,
    audio: 2,
    tiled: 1,
    '9patch': 7,
    particleEmitter: 2,
    font: 1,
    partial: 2,
  },
  previewImageUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
    'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
    'https://resources.gdevelop-app.com/assets/Packs/particles emitter.png',
    'https://resources.gdevelop-app.com/assets/Packs/lucid icons pack.png',
    'https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png',
    'https://resources.gdevelop-app.com/assets/Packs/casual buttons pack.png',
  ],
  updatedAt: '2022-09-15T08:17:59.977Z',
  createdAt: '2022-09-14T12:27:27.173Z',
  tag: 'french food',
  longDescription: 'This is the best asset pack about french food',
};

const privateAssetPack2ListingData: PrivateAssetPackListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d568ef234',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Sounds/thumbnail0.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'ASSET_PACK',
  description: '8 assets',
  name: 'French Sounds',
  categories: ['sounds'],
  prices: [
    {
      value: 1000,
      usageType: 'commercial',
      stripePriceId: 'stripePriceId',
      currency: 'USD',
      name: 'commercial_USD',
    },
  ],
  creditPrices: [
    {
      amount: 1000,
      usageType: 'commercial',
    },
  ],
  appStoreProductId: 'fake.product.id',
  sellerStripeAccountId: 'sellerStripeProductId',
  stripeProductId: 'stripeProductId',
};

const privateAssetPackBundleListingData: PrivateAssetPackListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918dabcop234',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Sounds/thumbnail0.png',
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/thumbnail1.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'ASSET_PACK',
  description: '13 assets',
  name: 'French Bundle',
  categories: ['sounds', 'props'],
  prices: [
    {
      value: 2000,
      name: 'commercial_USD',
      stripePriceId: 'stripePriceId',
      currency: 'USD',
      usageType: 'commercial',
    },
  ],
  creditPrices: [
    {
      amount: 2000,
      usageType: 'commercial',
    },
  ],
  appStoreProductId: 'fake.product.id',
  sellerStripeAccountId: 'sellerStripeProductId',
  stripeProductId: 'stripeProductId',
  includedListableProductIds: [
    privateAssetPack1ListingData.id,
    privateAssetPack2ListingData.id,
  ],
};

const privateAssetPackBundle: PrivateAssetPack = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918dabcop234',
  name: 'French Food and Sounds',
  content: {
    sprite: 14,
    audio: 2,
    tiled: 1,
    '9patch': 7,
    particleEmitter: 2,
    font: 1,
    partial: 2,
  },
  previewImageUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
    'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
    'https://resources.gdevelop-app.com/assets/Packs/particles emitter.png',
    'https://resources.gdevelop-app.com/assets/Packs/lucid icons pack.png',
    'https://resources.gdevelop-app.com/assets/Packs/wesxdz skullcup.png',
    'https://resources.gdevelop-app.com/assets/Packs/casual buttons pack.png',
  ],
  updatedAt: '2022-09-15T08:17:59.977Z',
  createdAt: '2022-09-14T12:27:27.173Z',
  tag: 'french food',
  longDescription: 'This is the best asset pack about french food',
};

const allPrivateAssetPackListingData = [
  privateAssetPack1ListingData,
  privateAssetPack2ListingData,
  privateAssetPackBundleListingData,
];

const privateAssetPacks = [privateAssetPack1, privateAssetPackBundle];

const PrivateAssetPackInformationPageStory = ({
  privateAssetPackListingData,
  receivedAssetPacks = [],
  authenticatedUser = fakeSilverAuthenticatedUserWithCloudProjects,
  delayResponse = 0,
  errorCode,
  errorMessage,
}: {
  privateAssetPackListingData: PrivateAssetPackListingData,
  authenticatedUser?: AuthenticatedUser,
  receivedAssetPacks?: Array<PrivateAssetPack>,
  delayResponse?: number,
  errorCode?: number,
  errorMessage?: string,
}) => {
  const userServiceMock = new MockAdapter(userApiAxiosClient, {
    delayResponse,
  });
  userServiceMock
    .onGet(`/user-public-profile/${privateAssetPackListingData.sellerId}`)
    .reply(200, sellerPublicProfile)
    .onGet(`/user/${privateAssetPackListingData.sellerId}/badge`)
    .reply(200, [])
    .onGet(`/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient, {
    delayResponse,
  });
  assetServiceMock
    .onGet(`/asset-pack/${privateAssetPackListingData.id}`)
    .reply(
      errorCode || 200,
      errorCode
        ? errorMessage || null
        : privateAssetPacks.find(
            assetPack => assetPack.id === privateAssetPackListingData.id
          )
    )
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  const shopServiceMock = new MockAdapter(shopApiAxiosClient, {
    delayResponse,
  });
  shopServiceMock
    .onGet('/product-license')
    .reply(200, fakeAssetPackLicenses)
    .onPost(`/product/${privateAssetPackListingData.id}/action/redeem`)
    .reply(config => {
      action('Claim asset pack')();
      return [200, 'OK'];
    })
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AssetStoreContext.Provider
      value={{
        ...initialAssetStoreState,
        privateAssetPackListingDatas: allPrivateAssetPackListingData,
      }}
    >
      <AuthenticatedUserContext.Provider
        value={{
          ...authenticatedUser,
          receivedAssetPacks,
          assetPackPurchases: receivedAssetPacks.map(privateAssetPack => ({
            id: 'purchase-id',
            productType: 'ASSET_PACK',
            usageType: 'commercial',
            productId: privateAssetPack.id,
            buyerId: authenticatedUser.profile
              ? authenticatedUser.profile.id
              : 'userId',
            receiverId: authenticatedUser.profile
              ? authenticatedUser.profile.id
              : 'userId',
            createdAt: new Date(1707519600000).toString(),
          })),
        }}
      >
        <SubscriptionSuggestionProvider>
          <ProductLicenseStoreStateProvider>
            <PrivateAssetPackInformationPage
              privateAssetPackListingData={privateAssetPackListingData}
              onAssetPackOpen={() => action('open asset pack')()}
              onGameTemplateOpen={() => action('open game template')()}
              privateAssetPackListingDatasFromSameCreator={allPrivateAssetPackListingData.filter(
                assetPackListingData =>
                  assetPackListingData.id !== privateAssetPackListingData.id
              )}
            />
          </ProductLicenseStoreStateProvider>
        </SubscriptionSuggestionProvider>
      </AuthenticatedUserContext.Provider>
    </AssetStoreContext.Provider>
  );
};

export const Default = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPack1ListingData}
  />
);

export const ForABundle = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPackBundleListingData}
  />
);

export const ForAlreadyPurchasedAssetPack = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPack1ListingData}
    receivedAssetPacks={[
      {
        id: privateAssetPack1ListingData.id,
        // Below is useless data for the component.
        name: privateAssetPack1ListingData.name,
        createdAt: '2',
        updatedAt: '2',
        longDescription: 'longDescription',
        content: { sprite: 9 },
        previewImageUrls: [],
        tag: 'tag',
      },
    ]}
  />
);

export const Loading = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPack1ListingData}
    delayResponse={10000}
  />
);

export const WithRedeemableAssetPackWithoutSubscription = () => (
  <PrivateAssetPackInformationPageStory
    authenticatedUser={defaultAuthenticatedUserWithNoSubscription}
    privateAssetPackListingData={{
      ...privateAssetPack1ListingData,
      redeemConditions: [
        {
          reason: 'subscription',
          condition: 'gdevelop_gold',
          usageType: 'commercial',
        },
      ],
    }}
    delayResponse={0}
  />
);

export const WithRedeemableAssetPackWithSilverSubscription = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={{
      ...privateAssetPack1ListingData,
      redeemConditions: [
        {
          reason: 'subscription',
          condition: 'gdevelop_gold',
          usageType: 'commercial',
        },
      ],
    }}
    delayResponse={0}
  />
);

export const WithRedeemableAssetPackWithGoldSubscription = () => (
  <PrivateAssetPackInformationPageStory
    authenticatedUser={fakeGoldAuthenticatedUser}
    privateAssetPackListingData={{
      ...privateAssetPack1ListingData,
      redeemConditions: [
        {
          reason: 'subscription',
          condition: 'gdevelop_gold',
          usageType: 'commercial',
        },
      ],
    }}
    delayResponse={1000}
  />
);

export const WithRedeemableAssetPackWithEducationSubscription = () => (
  <PrivateAssetPackInformationPageStory
    authenticatedUser={fakeAuthenticatedUserWithEducationPlan}
    privateAssetPackListingData={{
      ...privateAssetPack1ListingData,
      redeemConditions: [
        {
          reason: 'subscription',
          condition: 'gdevelop_gold',
          usageType: 'commercial',
        },
      ],
    }}
    delayResponse={1000}
  />
);

export const With404 = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPack1ListingData}
    errorCode={404}
  />
);

export const WithUnknownError = () => (
  <PrivateAssetPackInformationPageStory
    privateAssetPackListingData={privateAssetPack1ListingData}
    errorCode={500}
    errorMessage={'Internal server error'}
  />
);
