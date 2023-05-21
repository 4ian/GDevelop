// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import withMock from 'storybook-addon-mock';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import AssetPackInstallDialog from '../../../../AssetStore/AssetPackInstallDialog';
import {
  fakeAsset1,
  fakeAssetPacks,
  fakeAssetShortHeader1,
  fakeAssetShortHeader2,
  fakePrivateAssetShortHeader1,
} from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import PrivateAssetsAuthorizationContext from '../../../../AssetStore/PrivateAssets/PrivateAssetsAuthorizationContext';
import LocalEventsFunctionsExtensionWriter from '../../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionWriter';
import LocalEventsFunctionsExtensionOpener from '../../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionOpener';
import EventsFunctionsExtensionsContext from '../../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import fakeResourceManagementProps from '../../../FakeResourceManagement';

export default {
  title: 'AssetStore/AssetStore/AssetPackInstallDialog',
  component: AssetPackInstallDialog,
  decorators: [paperDecorator, muiDecorator],
};

const mockApiDataForPublicAssets = [
  // Mock a successful response for the first asset:
  {
    url: `https://api-dev.gdevelop.io/asset/asset/${
      fakeAssetShortHeader1.id
    }?environment=live`,
    method: 'GET',
    status: 200,
    response: {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    },
    delay: 250,
  },
  {
    url: `https://resources-fake.gdevelop.io/fake-asset-1`,
    method: 'GET',
    status: 200,
    response: fakeAsset1,
    delay: 250,
  },

  // Also mock a successful response for the second asset:
  {
    url: `https://api-dev.gdevelop.io/asset/asset/${
      fakeAssetShortHeader2.id
    }?environment=live`,
    method: 'GET',
    status: 200,
    response: {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    },
    delay: 250,
  },
];

const mockFailedApiDataForPublicAsset1 = [
  {
    url: `https://api-dev.gdevelop.io/asset/asset/${
      fakeAssetShortHeader1.id
    }?environment=live`,
    method: 'GET',
    status: 500,
    response: {
      assetUrl: 'https://resources-fake.gdevelop.io/fake-asset-1',
    },
    delay: 250,
  },
];

const fakeEventsFunctionsExtensionsContext = {
  loadProjectEventsFunctionsExtensions: async project => {},
  unloadProjectEventsFunctionsExtensions: project => {},
  unloadProjectEventsFunctionsExtension: (project, extensionName) => {},
  reloadProjectEventsFunctionsExtensions: async project => {},
  reloadProjectEventsFunctionsExtensionMetadata: (project, extension) => {},
  getEventsFunctionsExtensionWriter: () => LocalEventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => LocalEventsFunctionsExtensionOpener,
  ensureLoadFinished: async () => {},
  getIncludeFileHashs: () => ({}),
  eventsFunctionsExtensionsError: null,
};

export const LayoutPublicAssetInstallSuccess = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsContext}
    >
      <AssetStoreStateProvider>
        <AssetPackInstallDialog
          assetPack={fakeAssetPacks.starterPacks[0]}
          assetShortHeaders={[fakeAssetShortHeader1]}
          addedAssetIds={new Set<string>()}
          onClose={action('onClose')}
          onAssetsAdded={action('onAssetsAdded')}
          project={testProject.project}
          objectsContainer={testProject.testLayout}
          onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
          resourceManagementProps={fakeResourceManagementProps}
          canInstallPrivateAsset={() => true}
        />
      </AssetStoreStateProvider>
    </EventsFunctionsExtensionsContext.Provider>
  );
};
LayoutPublicAssetInstallSuccess.decorators = [withMock];
LayoutPublicAssetInstallSuccess.parameters = {
  mockData: mockApiDataForPublicAssets,
};

export const LayoutPublicAssetInstallFailure = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsContext}
    >
      <AssetStoreStateProvider>
        <AssetPackInstallDialog
          assetPack={fakeAssetPacks.starterPacks[0]}
          assetShortHeaders={[fakeAssetShortHeader1]}
          addedAssetIds={new Set<string>()}
          onClose={action('onClose')}
          onAssetsAdded={action('onAssetsAdded')}
          project={testProject.project}
          objectsContainer={testProject.testLayout}
          onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
          resourceManagementProps={fakeResourceManagementProps}
          canInstallPrivateAsset={() => true}
        />
      </AssetStoreStateProvider>
    </EventsFunctionsExtensionsContext.Provider>
  );
};
LayoutPublicAssetInstallFailure.decorators = [withMock];
LayoutPublicAssetInstallFailure.parameters = {
  mockData: mockFailedApiDataForPublicAsset1,
};

export const LayoutPublicAssetAllAlreadyInstalled = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1]}
      addedAssetIds={new Set([fakeAssetShortHeader1.id])}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
      resourceManagementProps={fakeResourceManagementProps}
      canInstallPrivateAsset={() => true}
    />
  </AssetStoreStateProvider>
);

export const LayoutPublicAssetSomeAlreadyInstalled = () => (
  <EventsFunctionsExtensionsContext.Provider
    value={fakeEventsFunctionsExtensionsContext}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1, fakeAssetShortHeader2]}
        addedAssetIds={new Set([fakeAssetShortHeader1.id])}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
        resourceManagementProps={fakeResourceManagementProps}
        canInstallPrivateAsset={() => true}
      />
    </AssetStoreStateProvider>
  </EventsFunctionsExtensionsContext.Provider>
);
LayoutPublicAssetSomeAlreadyInstalled.decorators = [withMock];
LayoutPublicAssetSomeAlreadyInstalled.parameters = {
  mockData: mockApiDataForPublicAssets,
};

export const LayoutPrivateAssetInstallSuccess = () => (
  <PrivateAssetsAuthorizationContext.Provider
    value={{
      authorizationToken: null,
      updateAuthorizationToken: async () => {},
      fetchPrivateAsset: async () => null,
      installPrivateAsset: async () => ({
        // Mock a successful installation
        createdObjects: [],
      }),
      getPrivateAssetPackAudioArchiveUrl: async () =>
        'https://resources.gevelop.io/path/to/audio/archive',
    }}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakePrivateAssetShortHeader1]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
        resourceManagementProps={fakeResourceManagementProps}
        canInstallPrivateAsset={() => true}
      />
    </AssetStoreStateProvider>
  </PrivateAssetsAuthorizationContext.Provider>
);

export const LayoutPrivateAssetInstallFailure = () => (
  <PrivateAssetsAuthorizationContext.Provider
    value={{
      authorizationToken: null,
      updateAuthorizationToken: async () => {},
      fetchPrivateAsset: async () => null,
      // Mock an error
      installPrivateAsset: async () => {
        throw new Error('Fake error during installation of a private asset.');
      },
      getPrivateAssetPackAudioArchiveUrl: async () =>
        'https://resources.gevelop.io/path/to/audio/archive',
    }}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakePrivateAssetShortHeader1]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
        resourceManagementProps={fakeResourceManagementProps}
        canInstallPrivateAsset={() => true}
      />
    </AssetStoreStateProvider>
  </PrivateAssetsAuthorizationContext.Provider>
);

export const LayoutPrivateAssetButCantInstall = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakePrivateAssetShortHeader1]}
      addedAssetIds={new Set<string>()}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
      resourceManagementProps={fakeResourceManagementProps}
      canInstallPrivateAsset={() => false}
    />
  </AssetStoreStateProvider>
);

export const NoObjectsContainerPublicAssetInstallSuccess = () => (
  <EventsFunctionsExtensionsContext.Provider
    value={fakeEventsFunctionsExtensionsContext}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakeAssetShortHeader1, fakeAssetShortHeader2]}
        addedAssetIds={new Set<string>()}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={null}
        onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
        resourceManagementProps={fakeResourceManagementProps}
        canInstallPrivateAsset={() => true}
      />
    </AssetStoreStateProvider>
  </EventsFunctionsExtensionsContext.Provider>
);
NoObjectsContainerPublicAssetInstallSuccess.decorators = [withMock];
NoObjectsContainerPublicAssetInstallSuccess.parameters = {
  mockData: mockApiDataForPublicAssets,
};

export const NoObjectsContainerPrivateAssetButCantInstall = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakePrivateAssetShortHeader1]}
      addedAssetIds={new Set<string>()}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={null}
      onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
      resourceManagementProps={fakeResourceManagementProps}
      canInstallPrivateAsset={() => false}
    />
  </AssetStoreStateProvider>
);
