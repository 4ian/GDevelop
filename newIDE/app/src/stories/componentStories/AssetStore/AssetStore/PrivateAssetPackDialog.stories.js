// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import MockAdapter from 'axios-mock-adapter';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import PrivateAssetPackDialog from '../../../../AssetStore/PrivateAssetPackDialog';
import { GDevelopAssetApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import { client as assetApiAxiosClient } from '../../../../Utils/GDevelopServices/Asset';

export default {
  title: 'AssetStore/AssetStore/PrivateAssetPackDialog',
  component: PrivateAssetPackDialog,
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
};

const privateAssetPackDetails = {
  id: '56a50a9e-57ef-4d1d-a3f2-c918d593a6e2',
  content: {
    sprite: 1,
    audio: 1,
    '9patch': 1,
    particleEmitter: 1,
    font: 1,
  },
  previewImageUrls: [
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/preview1.png',
    'https://resources.gdevelop-app.com/staging/private-assets/French Food/preview2.png',
  ],
  updatedAt: '2022-09-15T08:17:59.977Z',
  createdAt: '2022-09-14T12:27:27.173Z',
  tag: 'french food',
  longDescription: 'This is the best asset pack about french food',
};

export const Default = () => {
  const mock = new MockAdapter(assetApiAxiosClient, { delayResponse: 2000 });
  mock
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
    <PrivateAssetPackDialog
      privateAssetPack={privateAssetPackListingData}
      onClose={() => action('close')()}
    />
  );
};

export const With404 = () => {
  const mock = new MockAdapter(assetApiAxiosClient, { delayResponse: 500 });
  mock
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
    <PrivateAssetPackDialog
      privateAssetPack={privateAssetPackListingData}
      onClose={() => action('close')()}
    />
  );
};

export const WithUnknownError = () => {
  const mock = new MockAdapter(assetApiAxiosClient, { delayResponse: 500 });
  mock
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
    <PrivateAssetPackDialog
      privateAssetPack={privateAssetPackListingData}
      onClose={() => action('close')()}
    />
  );
};
