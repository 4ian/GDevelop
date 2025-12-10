// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import AssetPackInstallDialog from '../../../../AssetStore/AssetPackInstallDialog';
import {
  fakeAsset1,
  fakePrivateAsset1,
  fakeAssetPacks,
  fakeAssetShortHeader1,
  fakeAssetShortHeader2,
  fakePrivateAssetShortHeader1,
} from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import PrivateAssetsAuthorizationContext from '../../../../AssetStore/PrivateAssets/PrivateAssetsAuthorizationContext';
import EventsFunctionsExtensionsContext from '../../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import fakeResourceManagementProps from '../../../FakeResourceManagement';
import { fakeEventsFunctionsExtensionsState } from '../../../FakeEventsFunctionsExtensionsContext';
import { AssetStoreNavigatorStateProvider } from '../../../../AssetStore/AssetStoreNavigator';
import { client as assetClient } from '../../../../Utils/GDevelopServices/Asset';

export default {
  title: 'AssetStore/AssetStore/AssetPackInstallDialog',
  component: AssetPackInstallDialog,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: {| children: React.Node |}) => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
      <AssetStoreNavigatorStateProvider>
        <AssetStoreStateProvider>{children}</AssetStoreStateProvider>
      </AssetStoreNavigatorStateProvider>
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const LayoutPublicAssetInstallSuccess = () => {
  const assetServiceMock = new MockAdapter(assetClient, {
    delayResponse: 250,
  });

  // Mock a successful response for the first asset:
  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader1.id}`, {
      params: { environment: 'live' },
    })
    .reply(200, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  assetServiceMock
    .onGet('https://resources-fake.gdevelop.io/fake-asset-1')
    .reply(200, fakeAsset1);

  return (
    <Wrapper>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout.getObjects()}
        resourceManagementProps={{
          ...fakeResourceManagementProps,
          canInstallPrivateAsset: () => true,
        }}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('onExtensionInstalled')}
      />
    </Wrapper>
  );
};

export const LayoutPublicAssetInstallFailure = () => {
  const assetServiceMock = new MockAdapter(assetClient, {
    delayResponse: 250,
  });

  // Mock a failed response for the first asset:
  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader1.id}`, {
      params: { environment: 'live' },
    })
    .reply(500, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  return (
    <Wrapper>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout.getObjects()}
        resourceManagementProps={{
          ...fakeResourceManagementProps,
          canInstallPrivateAsset: () => true,
        }}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('onExtensionInstalled')}
      />
    </Wrapper>
  );
};

export const LayoutPublicAssetAllAlreadyInstalled = () => (
  <Wrapper>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1]}
      addedAssetIds={new Set([fakeAssetShortHeader1.id])}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout.getObjects()}
      resourceManagementProps={{
        ...fakeResourceManagementProps,
        canInstallPrivateAsset: () => true,
      }}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('onExtensionInstalled')}
    />
  </Wrapper>
);

export const LayoutPublicAssetSomeAlreadyInstalled = () => {
  const assetServiceMock = new MockAdapter(assetClient, {
    delayResponse: 250,
  });

  // Mock successful responses for both assets:
  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader1.id}`, {
      params: { environment: 'live' },
    })
    .reply(200, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader2.id}`, {
      params: { environment: 'live' },
    })
    .reply(200, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  assetServiceMock
    .onGet('https://resources-fake.gdevelop.io/fake-asset-1')
    .reply(200, fakeAsset1);

  return (
    <Wrapper>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1, fakeAssetShortHeader2]}
        addedAssetIds={new Set([fakeAssetShortHeader1.id])}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout.getObjects()}
        resourceManagementProps={{
          ...fakeResourceManagementProps,
          canInstallPrivateAsset: () => true,
        }}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('onExtensionInstalled')}
      />
    </Wrapper>
  );
};

export const LayoutPrivateAssetInstallSuccess = () => {
  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken: null,
        updateAuthorizationToken: async () => {},
        fetchPrivateAsset: async () => fakePrivateAsset1,
        installPrivateAsset: async () => ({
          // Mock a successful installation
          createdObjects: [],
        }),
        getPrivateAssetPackAudioArchiveUrl: async () =>
          'https://resources.gevelop.io/path/to/audio/archive',
      }}
    >
      <AssetStoreNavigatorStateProvider>
        <AssetStoreStateProvider>
          <AssetPackInstallDialog
            assetPack={fakeAssetPacks.starterPacks[0]}
            assetShortHeaders={[fakePrivateAssetShortHeader1]}
            addedAssetIds={new Set<string>()}
            onClose={action('onClose')}
            onAssetsAdded={action('onAssetsAdded')}
            project={testProject.project}
            objectsContainer={testProject.testLayout.getObjects()}
            resourceManagementProps={{
              ...fakeResourceManagementProps,
              canInstallPrivateAsset: () => true,
            }}
            onWillInstallExtension={action('extension will be installed')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </AssetStoreStateProvider>
      </AssetStoreNavigatorStateProvider>
    </PrivateAssetsAuthorizationContext.Provider>
  );
};

export const LayoutPrivateAssetInstallFailure = () => {
  return (
    <PrivateAssetsAuthorizationContext.Provider
      value={{
        authorizationToken: null,
        updateAuthorizationToken: async () => {},
        fetchPrivateAsset: async () => fakePrivateAsset1,
        // Mock an error
        installPrivateAsset: async () => {
          throw new Error('Fake error during installation of a private asset.');
        },
        getPrivateAssetPackAudioArchiveUrl: async () =>
          'https://resources.gevelop.io/path/to/audio/archive',
      }}
    >
      <AssetStoreNavigatorStateProvider>
        <AssetStoreStateProvider>
          <AssetPackInstallDialog
            assetPack={fakeAssetPacks.starterPacks[0]}
            assetShortHeaders={[fakePrivateAssetShortHeader1]}
            addedAssetIds={new Set<string>()}
            onClose={action('onClose')}
            onAssetsAdded={action('onAssetsAdded')}
            project={testProject.project}
            objectsContainer={testProject.testLayout.getObjects()}
            resourceManagementProps={{
              ...fakeResourceManagementProps,
              canInstallPrivateAsset: () => true,
            }}
            onWillInstallExtension={action('extension will be installed')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </AssetStoreStateProvider>
      </AssetStoreNavigatorStateProvider>
    </PrivateAssetsAuthorizationContext.Provider>
  );
};

export const LayoutPrivateAssetButCantInstall = () => (
  <Wrapper>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakePrivateAssetShortHeader1]}
      addedAssetIds={new Set<string>()}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout.getObjects()}
      resourceManagementProps={fakeResourceManagementProps}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('onExtensionInstalled')}
    />
  </Wrapper>
);

export const LayoutPrivateAssetButInstallingTooMany = () => (
  <Wrapper>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={Array.from(
        { length: 120 },
        (_, index) => fakePrivateAssetShortHeader1
      )}
      addedAssetIds={new Set<string>()}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout.getObjects()}
      resourceManagementProps={{
        ...fakeResourceManagementProps,
        canInstallPrivateAsset: () => true,
      }}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('onExtensionInstalled')}
    />
  </Wrapper>
);

export const NoObjectsContainerPublicAssetInstallSuccess = () => {
  const assetServiceMock = new MockAdapter(assetClient, {
    delayResponse: 250,
  });

  // Mock successful responses for both assets:
  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader1.id}`, {
      params: { environment: 'live' },
    })
    .reply(200, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  assetServiceMock
    .onGet(`/asset/${fakeAssetShortHeader2.id}`, {
      params: { environment: 'live' },
    })
    .reply(200, {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    });

  assetServiceMock
    .onGet('https://resources-fake.gdevelop.io/fake-asset-1')
    .reply(200, fakeAsset1);

  return (
    <Wrapper>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1, fakeAssetShortHeader2]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={null}
        resourceManagementProps={{
          ...fakeResourceManagementProps,
          canInstallPrivateAsset: () => true,
        }}
        onWillInstallExtension={action('extension will be installed')}
        onExtensionInstalled={action('onExtensionInstalled')}
      />
    </Wrapper>
  );
};

export const NoObjectsContainerPrivateAssetButCantInstall = () => (
  <Wrapper>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakePrivateAssetShortHeader1]}
      addedAssetIds={new Set<string>()}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={null}
      resourceManagementProps={fakeResourceManagementProps}
      onWillInstallExtension={action('extension will be installed')}
      onExtensionInstalled={action('onExtensionInstalled')}
    />
  </Wrapper>
);
