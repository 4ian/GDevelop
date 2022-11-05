// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import PrivateAssetPackInformationDialog from '../../../../AssetStore/PrivateAssets/PrivateAssetPackInformationDialog';
import {
  GDevelopAssetApi,
  GDevelopUserApi,
} from '../../../../Utils/GDevelopServices/ApiConfigs';
import { client as assetApiAxiosClient } from '../../../../Utils/GDevelopServices/Asset';

export default {
  title: 'AssetStore/AssetStore/PrivateAssetPackInformationDialog',
  component: PrivateAssetPackInformationDialog,
  decorators: [paperDecorator, muiDecorator],
};

const privateAssetPackListingData = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  sellerId: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  productType: 'ASSET_PACK',
  thumbnailUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/thumbnail1.png',
  ],
  updatedAt: '2022-09-14T12:43:51.329Z',
  createdAt: '2022-09-14T12:43:51.329Z',
  listing: 'ASSET_PACK',
  description: '5 assets',
  name: 'French Food',
  prices: [{ value: 1500, name: 'default', stripePriceId: 'stripePriceId' }],
};

const sellerPublicProfile = {
  id: 'tVUYpNMz1AfsbzJtxUEpPTuu4Mn1',
  username: 'CreatorUserName',
  description: 'I create asset packs for GDevelop for country-specific food.',
};

const privateAssetPackDetails = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
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

export const Default = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateAssetPackListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateAssetPackListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/asset-pack/${privateAssetPackListingData.id}`
    )
    .reply(200, privateAssetPackDetails)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateAssetPackInformationDialog
      privateAssetPackListingData={privateAssetPackListingData}
      onClose={() => action('close')()}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
    />
  );
};
export const WithPurchaseDialogOpen = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateAssetPackListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateAssetPackListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/asset-pack/${privateAssetPackListingData.id}`
    )
    .reply(200, privateAssetPackDetails)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateAssetPackInformationDialog
      privateAssetPackListingData={privateAssetPackListingData}
      onClose={() => action('close')()}
      isPurchaseDialogOpen
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
    />
  );
};
export const Loading = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 10000 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateAssetPackListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateAssetPackListingData.sellerId
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
      `${GDevelopAssetApi.baseUrl}/asset-pack/${privateAssetPackListingData.id}`
    )
    .reply(200, privateAssetPackDetails)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateAssetPackInformationDialog
      privateAssetPackListingData={privateAssetPackListingData}
      onClose={() => action('close')()}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
    />
  );
};

export const With404 = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateAssetPackListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateAssetPackListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/asset-pack/${privateAssetPackListingData.id}`
    )
    .reply(404, null)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateAssetPackInformationDialog
      privateAssetPackListingData={privateAssetPackListingData}
      onClose={() => action('close')()}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
    />
  );
};

export const WithUnknownError = () => {
  const axiosMock = new MockAdapter(axios, { delayResponse: 0 });
  axiosMock
    .onGet(
      `${GDevelopUserApi.baseUrl}/user-public-profile/${
        privateAssetPackListingData.sellerId
      }`
    )
    .reply(200, sellerPublicProfile)
    .onGet(
      `${GDevelopUserApi.baseUrl}/user/${
        privateAssetPackListingData.sellerId
      }/badge`
    )
    .reply(200, [])
    .onGet(`${GDevelopUserApi.baseUrl}/achievement`)
    .reply(200, []);
  const assetServiceMock = new MockAdapter(assetApiAxiosClient);
  assetServiceMock
    .onGet(
      `${GDevelopAssetApi.baseUrl}/asset-pack/${privateAssetPackListingData.id}`
    )
    .reply(500, 'Internal server error')
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <PrivateAssetPackInformationDialog
      privateAssetPackListingData={privateAssetPackListingData}
      onClose={() => action('close')()}
      isPurchaseDialogOpen={false}
      onOpenPurchaseDialog={() => action('open purchase dialog')()}
    />
  );
};
