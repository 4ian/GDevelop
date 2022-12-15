// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import {
  fakeAssetShortHeader,
  fakeAssetWithCustomObject,
} from '../../../../fixtures/GDevelopServicesTestData';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import withMock from 'storybook-addon-mock';
import { GDevelopUserApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import PublicProfileProvider from '../../../../Profile/PublicProfileProvider';

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator, muiDecorator],
};

export const PublicAsset = () => {
  return (
    <AssetStoreStateProvider>
      <AssetDetails
        project={testProject.project}
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader}
        onOpenDetails={assetShortHeader => {}}
      />
    </AssetStoreStateProvider>
  );
};
PublicAsset.decorators = [withMock];
PublicAsset.parameters = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader.id
      }.json`,
      method: 'GET',
      status: 200,
      response: fakeAssetWithCustomObject,
    },
  ],
};

export const PrivateAsset = () => (
  <PublicProfileProvider>
    <AssetStoreStateProvider>
      <AssetDetails
        project={testProject.project}
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader}
        onOpenDetails={assetShortHeader => {}}
      />
    </AssetStoreStateProvider>
  </PublicProfileProvider>
);
PrivateAsset.decorators = [withMock];
PrivateAsset.parameters = {
  mockData: [
    {
      url: `${
        GDevelopUserApi.baseUrl
      }/user-public-profile?id=ZJxWdIDmJzUA5iAWryEItxINA7n1`,
      method: 'GET',
      status: 200,
      response: {
        ZJxWdIDmJzUA5iAWryEItxINA7n1: {
          id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1',
          username: 'Clem',
          description: "I'm Clement\n\ntada",
          donateLink: 'https://ko-fi/clem',
        },
      },
    },
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader.id
      }.json`,
      method: 'GET',
      status: 200,
      response: {
        ...fakeAssetWithCustomObject,
        authorIds: ['ZJxWdIDmJzUA5iAWryEItxINA7n1'],
        authors: [],
      },
    },
  ],
};

export const AssetWithMultipleAuthors = () => (
  <PublicProfileProvider>
    <AssetStoreStateProvider>
      <AssetDetails
        project={testProject.project}
        onTagSelection={() => {}}
        assetShortHeader={fakeAssetShortHeader}
        onOpenDetails={assetShortHeader => {}}
      />
    </AssetStoreStateProvider>
  </PublicProfileProvider>
);
PrivateAsset.decorators = [withMock];
PrivateAsset.parameters = {
  mockData: [
    {
      url: `${
        GDevelopUserApi.baseUrl
      }/user-public-profile?id=ZJxWdIDmJzUA5iAWryEItxINA7n1,ABCWdIDmJzUA5iAWryEItxINA7n1`,
      method: 'GET',
      status: 200,
      response: {
        ZJxWdIDmJzUA5iAWryEItxINA7n1: {
          id: 'ZJxWdIDmJzUA5iAWryEItxINA7n1',
          username: 'Clem',
          description: "I'm Clement\n\ntada",
          donateLink: 'https://ko-fi/clem',
        },
        ABCWdIDmJzUA5iAWryEItxINA7n1: {
          id: 'ABCWdIDmJzUA5iAWryEItxINA7n1',
          username: 'Clem2',
          description: "I'm Clement 2\n\ntada",
          donateLink: 'https://ko-fi/clem2',
        },
      },
    },
    {
      url: `https://resources.gdevelop-app.com/assets-database/assets/${
        fakeAssetShortHeader.id
      }.json`,
      method: 'GET',
      status: 200,
      response: {
        ...fakeAssetWithCustomObject,
        authorIds: [
          'ZJxWdIDmJzUA5iAWryEItxINA7n1',
          'ABCWdIDmJzUA5iAWryEItxINA7n1',
        ],
      },
    },
  ],
};
