// @flow
import * as React from 'react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { AssetDetails } from '../../../../AssetStore/AssetDetails';
import { fakeAssetShortHeader1 } from '../../../../fixtures/GDevelopServicesTestData';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import fakeResourceExternalEditors from '../../../FakeResourceExternalEditors';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';

export default {
  title: 'AssetStore/AssetStore/AssetDetails',
  component: AssetDetails,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <AssetDetails
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      resourceSources={[]}
      resourceExternalEditors={fakeResourceExternalEditors}
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onAdd={() => {}}
      onClose={() => {}}
      isAddedToScene={false}
      isBeingAddedToScene={false}
      onOpenDetails={assetShortHeader => {}}
    />
  </AssetStoreStateProvider>
);

export const BeingInstalled = () => (
  <AssetStoreStateProvider>
    <AssetDetails
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      resourceSources={[]}
      resourceExternalEditors={fakeResourceExternalEditors}
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onAdd={() => {}}
      onClose={() => {}}
      isAddedToScene={false}
      isBeingAddedToScene={true}
      onOpenDetails={assetShortHeader => {}}
    />
  </AssetStoreStateProvider>
);

export const AddedToProject = () => (
  <AssetStoreStateProvider>
    <AssetDetails
      project={testProject.project}
      objectsContainer={testProject.testLayout}
      resourceSources={[]}
      resourceExternalEditors={fakeResourceExternalEditors}
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onAdd={() => {}}
      onClose={() => {}}
      isAddedToScene={true}
      isBeingAddedToScene={false}
      onOpenDetails={assetShortHeader => {}}
    />
  </AssetStoreStateProvider>
);
