// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

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
      layout={testProject.testLayout}
      objectsContainer={testProject.testLayout}
      resourceSources={[]}
      resourceExternalEditors={fakeResourceExternalEditors}
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onAdd={() => {}}
      onClose={() => {}}
      canInstall={true}
      isBeingInstalled={false}
    />
  </AssetStoreStateProvider>
);

export const BeingInstalled = () => (
  <AssetStoreStateProvider>
    <AssetDetails
      project={testProject.project}
      layout={testProject.testLayout}
      objectsContainer={testProject.testLayout}
      resourceSources={[]}
      resourceExternalEditors={fakeResourceExternalEditors}
      onTagSelection={() => {}}
      assetShortHeader={fakeAssetShortHeader1}
      onAdd={() => {}}
      onClose={() => {}}
      canInstall={true}
      isBeingInstalled={true}
    />
  </AssetStoreStateProvider>
);
