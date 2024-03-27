// @flow
import * as React from 'react';

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
  decorators: [paperDecorator],
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
    <AssetStore displayPromotions />
  </Wrapper>
);
Default.parameters = apiDataFakePacks;

export const WithoutPromotions = () => (
  <Wrapper>
    <AssetStore displayPromotions={false} />
  </Wrapper>
);
WithoutPromotions.parameters = apiDataFakePacks;

export const LoadingError = () => (
  <Wrapper>
    <AssetStore />
  </Wrapper>
);
LoadingError.parameters = apiDataServerSideError;
