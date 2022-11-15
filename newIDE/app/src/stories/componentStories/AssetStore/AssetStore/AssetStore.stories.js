// @flow
import * as React from 'react';
import withMock from 'storybook-addon-mock';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';
import {
  fakeAssetPacks,
  fakeIndieAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';

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
  <FixedHeightFlexContainer height={500}>
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <AssetStoreStateProvider>
        <AssetStore project={testProject.project} />
      </AssetStoreStateProvider>
    </AuthenticatedUserContext.Provider>
  </FixedHeightFlexContainer>
);
Default.decorators = [withMock];
Default.parameters = apiDataFakePacks;

export const LoadingError = () => (
  <FixedHeightFlexContainer height={500}>
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <AssetStoreStateProvider>
        <AssetStore project={testProject.project} />
      </AssetStoreStateProvider>
    </AuthenticatedUserContext.Provider>
  </FixedHeightFlexContainer>
);
LoadingError.decorators = [withMock];
LoadingError.parameters = apiDataServerSideError;
