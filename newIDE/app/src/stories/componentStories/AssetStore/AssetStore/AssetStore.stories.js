// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';
import {
  fakeAssetPacks,
  fakeSilverAuthenticatedUser,
} from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { AssetStoreNavigatorStateProvider } from '../../../../AssetStore/AssetStoreNavigator';

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

const Wrapper = ({ children }: {| children: React.Node |}) => {
  return (
    <FixedHeightFlexContainer height={500}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <AssetStoreNavigatorStateProvider>
          <AssetStoreStateProvider>{children}</AssetStoreStateProvider>
        </AssetStoreNavigatorStateProvider>
      </AuthenticatedUserContext.Provider>
    </FixedHeightFlexContainer>
  );
};

export const Default = () => (
  <Wrapper>
    <AssetStore onOpenProfile={action('onOpenProfile')} displayPromotions />
  </Wrapper>
);
Default.parameters = apiDataFakePacks;

export const WithoutPromotions = () => (
  <Wrapper>
    <AssetStore
      onOpenProfile={action('onOpenProfile')}
      displayPromotions={false}
    />
  </Wrapper>
);
WithoutPromotions.parameters = apiDataFakePacks;

export const LoadingError = () => (
  <Wrapper>
    <AssetStore onOpenProfile={action('onOpenProfile')} />
  </Wrapper>
);
LoadingError.parameters = apiDataServerSideError;
