// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../../PaperDecorator';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';
import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { AssetStoreNavigatorStateProvider } from '../../../../AssetStore/AssetStoreNavigator';
import { cdnClient } from '../../../../Utils/GDevelopServices/Asset';
import { BundleStoreStateProvider } from '../../../../AssetStore/Bundles/BundleStoreContext';
import { PrivateGameTemplateStoreStateProvider } from '../../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';

export default {
  title: 'AssetStore/AssetStore',
  component: AssetStore,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: {| children: React.Node |}) => {
  return (
    <FixedHeightFlexContainer height={500}>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <AssetStoreNavigatorStateProvider>
          <AssetStoreStateProvider>
            <BundleStoreStateProvider>
              <PrivateGameTemplateStoreStateProvider>
                {children}
              </PrivateGameTemplateStoreStateProvider>
            </BundleStoreStateProvider>
          </AssetStoreStateProvider>
        </AssetStoreNavigatorStateProvider>
      </AuthenticatedUserContext.Provider>
    </FixedHeightFlexContainer>
  );
};

export const Default = () => {
  return (
    <Wrapper>
      <AssetStore onOpenProfile={action('onOpenProfile')} displayPromotions />
    </Wrapper>
  );
};

export const WithoutPromotions = () => {
  return (
    <Wrapper>
      <AssetStore
        onOpenProfile={action('onOpenProfile')}
        displayPromotions={false}
      />
    </Wrapper>
  );
};

export const LoadingError = () => {
  const assetCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet(
        'https://resources.gdevelop-app.com/assets-database/assetPacks.json'
      )
      .reply(500, { data: 'status' });

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        // Clear so it does not impact other stories.
        assetCdnMock.restore();
      };
    },
    [assetCdnMock]
  );

  return (
    <Wrapper>
      <AssetStore onOpenProfile={action('onOpenProfile')} />
    </Wrapper>
  );
};
