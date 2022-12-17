// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import AssetPackInstallDialog from '../../../../AssetStore/AssetPackInstallDialog';
import {
  fakeAssetPacks,
  fakeAssetShortHeader1,
  fakeAssetShortHeader2,
  fakePrivateAssetShortHeader1,
} from '../../../../fixtures/GDevelopServicesTestData';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import fakeResourceExternalEditors from '../../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../../ProjectsStorage/ProjectStorageProviders';
import PrivateAssetsAuthorizationContext from '../../../../AssetStore/PrivateAssets/PrivateAssetsAuthorizationContext';

export default {
  title: 'AssetStore/AssetStore/AssetPackInstallDialog',
  component: AssetPackInstallDialog,
  decorators: [paperDecorator, muiDecorator],
};

// TODO: mock requests?
export const LayoutPublicAsset = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1]}
      addedAssetIds={[]}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => true}
    />
  </AssetStoreStateProvider>
);

export const LayoutPublicAssetAllAlreadyInstalled = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1]}
      addedAssetIds={[fakeAssetShortHeader1.id]}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => true}
    />
  </AssetStoreStateProvider>
);

export const LayoutPublicAssetSomeAlreadyInstalled = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1, fakeAssetShortHeader2]}
      addedAssetIds={[fakeAssetShortHeader1.id]}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => true}
    />
  </AssetStoreStateProvider>
);

export const LayoutPrivateAssetInstallSuccess = () => (
  <PrivateAssetsAuthorizationContext.Provider
    value={{
      authorizationToken: null,
      updateAuthorizationToken: () => {},
      fetchPrivateAsset: async () => null,
      installPrivateAsset: async () => ({
        // Mock a successful installation
        createdObjects: [],
      }),
    }}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakePrivateAssetShortHeader1]}
        addedAssetIds={[]}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
        canInstallPrivateAsset={() => true}
      />
    </AssetStoreStateProvider>
  </PrivateAssetsAuthorizationContext.Provider>
);

export const LayoutPrivateAssetInstallFailure = () => (
  <PrivateAssetsAuthorizationContext.Provider
    value={{
      authorizationToken: null,
      updateAuthorizationToken: () => {},
      fetchPrivateAsset: async () => null,
      // Mock an error
      installPrivateAsset: async () => {
        throw new Error('Fake error during installation of a private asset.');
      },
    }}
  >
    <AssetStoreStateProvider>
      <AssetPackInstallDialog
        assetPack={fakeAssetPacks.starterPacks[0]}
        assetShortHeaders={[fakePrivateAssetShortHeader1]}
        addedAssetIds={[]}
        onClose={action('onClose')}
        onAssetsAdded={action('onAssetsAdded')}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
        resourceManagementProps={{
          getStorageProvider: () => emptyStorageProvider,
          onFetchNewlyAddedResources: async () => {},
          resourceSources: [],
          onChooseResource: () => Promise.reject('Unimplemented'),
          resourceExternalEditors: fakeResourceExternalEditors,
        }}
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
      addedAssetIds={[]}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => false}
    />
  </AssetStoreStateProvider>
);

// TODO: no objectsContainer specified.
export const NoObjectsContainerPublicAsset = () => (
  <AssetStoreStateProvider>
    <AssetPackInstallDialog
      assetPack={fakeAssetPacks.starterPacks[0]}
      assetShortHeaders={[fakeAssetShortHeader1]}
      addedAssetIds={[]}
      onClose={action('onClose')}
      onAssetsAdded={action('onAssetsAdded')}
      project={testProject.project}
      objectsContainer={null}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      resourceManagementProps={{
        getStorageProvider: () => emptyStorageProvider,
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => true}
    />
  </AssetStoreStateProvider>
);
