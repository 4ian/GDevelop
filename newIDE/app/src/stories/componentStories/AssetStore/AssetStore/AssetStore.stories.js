// @flow
import * as React from 'react';
import withMock from 'storybook-addon-mock';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';
import { fakeAssetPacks } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'AssetStore/AssetStore',
  component: AssetStore,
  decorators: [paperDecorator, muiDecorator],
};

const apiDataServerSideError = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/assets-database/assetPacks.json`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const apiDataFakePacks = {
  mockData: [
    {
      url: `https://resources.gdevelop-app.com/assets-database/assetPacks.json`,
      method: 'GET',
      status: 200,
      response: fakeAssetPacks,
    },
  ],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <AssetStore
      onOpenDetails={action('onOpenDetails')}
      events={testProject.testLayout.getEvents()}
      project={testProject.project}
      layout={testProject.testLayout}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceSources={[]}
      onObjectAddedFromAsset={() => {}}
      resourceExternalEditors={[]}
      objectsContainer={testProject.testLayout}
    />
  </AssetStoreStateProvider>
);
Default.decorators = [withMock];
Default.parameters = apiDataFakePacks;

export const LoadingError = () => (
  <AssetStoreStateProvider>
    <AssetStore
      onOpenDetails={action('onOpenDetails')}
      events={testProject.testLayout.getEvents()}
      project={testProject.project}
      layout={testProject.testLayout}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceSources={[]}
      onObjectAddedFromAsset={() => {}}
      resourceExternalEditors={[]}
      objectsContainer={testProject.testLayout}
    />
  </AssetStoreStateProvider>
);
LoadingError.decorators = [withMock];
LoadingError.parameters = apiDataServerSideError;
