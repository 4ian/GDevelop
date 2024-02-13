// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import PrivateGameTemplateInformationPage from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateInformationPage';
import {
  GDevelopAssetApi,
  GDevelopUserApi,
} from '../../../../Utils/GDevelopServices/ApiConfigs';
import {
  client as assetApiAxiosClient,
  type PrivateGameTemplate,
} from '../../../../Utils/GDevelopServices/Asset';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUserWithCloudProjects } from '../../../../fixtures/GDevelopServicesTestData';
import {
  PrivateGameTemplateStoreContext,
  initialPrivateGameTemplateStoreState,
} from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';

export default {
  title: 'AssetStore/AssetStore/PrivateGameTemplateInformationPage',
  component: PrivateGameTemplateInformationPage,
  decorators: [paperDecorator, muiDecorator],
};

const sellerPublicProfile = {
  id: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  username: 'CreatorUserName',
  description:
    'I create game templates for GDevelop for country-specific food.',
};

const privateGameTemplate1ListingData: PrivateGameTemplateListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'GAME_TEMPLATE',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'GAME_TEMPLATE',
  description: 'best food ever',
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

const privateGameTemplate1: PrivateGameTemplate = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  name: 'French Game',
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
  tag: 'french game',
  longDescription: 'This is the best game template about french food',
  gamePreviewLink: 'https://gamepreview.gdevelop-app.com',
};

const privateGameTemplate2ListingData: PrivateGameTemplateListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d568ef234',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'GAME_TEMPLATE',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'GAME_TEMPLATE',
  description: 'best sounds ever',
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

const privateGameTemplate2: PrivateGameTemplate = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d568ef234',
  name: 'French Sounds',
  previewImageUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
    'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
  ],
  updatedAt: '2022-09-15T08:17:59.977Z',
  createdAt: '2022-09-14T12:27:27.173Z',
  tag: 'french sounds',
  longDescription: 'This is the best game template about french sounds',
  gamePreviewLink: 'https://gamepreview.gdevelop-app.com',
};

const privateGameTemplateBundleListingData: PrivateGameTemplateListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918dabcop234',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  isSellerGDevelop: false,
  productType: 'GAME_TEMPLATE',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/assets/Packs/gdevelop platformer.png',
    'https://resources.gdevelop-app.com/assets/Packs/space shooter.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'GAME_TEMPLATE',
  description: 'best bundle ever',
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
    privateGameTemplate1ListingData.id,
    privateGameTemplate2ListingData.id,
  ],
};

const privateGameTemplateBundle: PrivateGameTemplate = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918dabcop234',
  name: 'French Bundle',
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
  tag: 'french bundle',
  longDescription: 'This is the best bundle about french games',
  gamePreviewLink: 'https://gamepreview.gdevelop-app.com',
};

export const Default = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(200, privateGameTemplate1)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={{
        ...initialPrivateGameTemplateStoreState,
        privateGameTemplateListingDatas: [
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
          privateGameTemplateBundleListingData,
        ],
      }}
    >
      <PrivateGameTemplateInformationPage
        privateGameTemplateListingData={privateGameTemplate1ListingData}
        isPurchaseDialogOpen={false}
        onOpenPurchaseDialog={() => action('open purchase dialog')()}
        onGameTemplateOpen={() => action('open game template')()}
        onCreateWithGameTemplate={() => action('create with game template')()}
        privateGameTemplateListingDatasFromSameCreator={[
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
        ]}
      />
    </PrivateGameTemplateStoreContext.Provider>
  );
};

export const ForABundle = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplateBundleListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplateBundleListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplateBundleListingData.id
      }`
    )
    .reply(200, privateGameTemplateBundle)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={{
        ...initialPrivateGameTemplateStoreState,
        privateGameTemplateListingDatas: [
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
          privateGameTemplateBundleListingData,
        ],
      }}
    >
      <PrivateGameTemplateInformationPage
        privateGameTemplateListingData={privateGameTemplateBundleListingData}
        isPurchaseDialogOpen={false}
        onOpenPurchaseDialog={() => action('open purchase dialog')()}
        onGameTemplateOpen={() => action('open game template')()}
        onCreateWithGameTemplate={() => action('create with game template')()}
      />
    </PrivateGameTemplateStoreContext.Provider>
  );
};

export const ForAlreadyPurchasedGameTemplate = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(200, privateGameTemplate1)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={{
        ...initialPrivateGameTemplateStoreState,
        privateGameTemplateListingDatas: [
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
          privateGameTemplateBundleListingData,
        ],
      }}
    >
      <AuthenticatedUserContext.Provider
        value={{
          ...fakeSilverAuthenticatedUserWithCloudProjects,
          receivedGameTemplates: [privateGameTemplate1],
        }}
      >
        <PrivateGameTemplateInformationPage
          privateGameTemplateListingData={privateGameTemplate1ListingData}
          isPurchaseDialogOpen={false}
          onOpenPurchaseDialog={() => action('open purchase dialog')()}
          onGameTemplateOpen={() => action('open game template')()}
          onCreateWithGameTemplate={() => action('create with game template')()}
          privateGameTemplateListingDatasFromSameCreator={[
            privateGameTemplate1ListingData,
            privateGameTemplate2ListingData,
          ]}
        />
      </AuthenticatedUserContext.Provider>
    </PrivateGameTemplateStoreContext.Provider>
  );
};

export const ForAlreadyPurchasedBundle = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplateBundleListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplateBundleListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplateBundleListingData.id
      }`
    )
    .reply(200, privateGameTemplateBundle)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={{
        ...initialPrivateGameTemplateStoreState,
        privateGameTemplateListingDatas: [
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
          privateGameTemplateBundleListingData,
        ],
      }}
    >
      <AuthenticatedUserContext.Provider
        value={{
          ...fakeSilverAuthenticatedUserWithCloudProjects,
          receivedGameTemplates: [
            privateGameTemplate1,
            privateGameTemplate2,
            privateGameTemplateBundle,
          ],
        }}
      >
        <PrivateGameTemplateInformationPage
          privateGameTemplateListingData={privateGameTemplateBundleListingData}
          isPurchaseDialogOpen={false}
          onOpenPurchaseDialog={() => action('open purchase dialog')()}
          onGameTemplateOpen={() => action('open game template')()}
          onCreateWithGameTemplate={() => action('create with game template')()}
        />
      </AuthenticatedUserContext.Provider>
    </PrivateGameTemplateStoreContext.Provider>
  );
};

export const WithPurchaseDialogOpen = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(200, privateGameTemplate1)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateStoreContext.Provider
      value={{
        ...initialPrivateGameTemplateStoreState,
        privateGameTemplateListingDatas: [
          privateGameTemplate1ListingData,
          privateGameTemplate2ListingData,
          privateGameTemplateBundleListingData,
        ],
      }}
    >
      <PrivateGameTemplateInformationPage
        privateGameTemplateListingData={privateGameTemplate1ListingData}
        isPurchaseDialogOpen
        onOpenPurchaseDialog={() => action('open purchase dialog')()}
        onGameTemplateOpen={() => action('open game template')()}
        onCreateWithGameTemplate={() => action('create with game template')()}
      />
    </PrivateGameTemplateStoreContext.Provider>
  );
};
export const Loading = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 10000 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient, {
    delayResponse: 10000,
  });
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(200, privateGameTemplate1)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateInformationPage
      privateGameTemplateListingData={privateGameTemplate1ListingData}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
      onGameTemplateOpen={() => action('open game template')()}
      onCreateWithGameTemplate={() => action('create with game template')()}
    />
  );
};

export const With404 = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(404, null)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateInformationPage
      privateGameTemplateListingData={privateGameTemplate1ListingData}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
      onGameTemplateOpen={() => action('open game template')()}
      onCreateWithGameTemplate={() => action('create with game template')()}
    />
  );
};

export const WithUnknownError = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateGameTemplate1ListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateGameTemplate1ListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/game-template/${
        privateGameTemplate1ListingData.id
      }`
    )
    .reply(500, 'Internal server error')
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateGameTemplateInformationPage
      privateGameTemplateListingData={privateGameTemplate1ListingData}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
      onGameTemplateOpen={() => action('open game template')()}
      onCreateWithGameTemplate={() => action('create with game template')()}
    />
  );
};
