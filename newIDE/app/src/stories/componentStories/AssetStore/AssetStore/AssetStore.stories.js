// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';
import {
  fakeAssetPacks,
  fakeSilverAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { useShopNavigation } from '../../../../AssetStore/AssetStoreNavigator';

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

const Wrapper = ({ children }: { children: React.Node }) => {
  const navigationState = useShopNavigation();
  return (
    <FixedHeightFlexContainer height={500}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <AssetStoreStateProvider shopNavigationState={navigationState}>
          {children}
        </AssetStoreStateProvider>
      </AuthenticatedUserContext.Provider>
    </FixedHeightFlexContainer>
  );
};

export const Default = () => (
  <Wrapper>
    <AssetStore />
  </Wrapper>
);
Default.parameters = apiDataFakePacks;

export const LoadingError = () => (
  <Wrapper>
    <AssetStore />
  </Wrapper>
);
LoadingError.parameters = apiDataServerSideError;
