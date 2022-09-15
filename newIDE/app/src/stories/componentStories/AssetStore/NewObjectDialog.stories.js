// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import NewObjectDialog from '../../../AssetStore/NewObjectDialog';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';

export default {
  title: 'AssetStore/NewObjectDialog',
  component: NewObjectDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <NewObjectDialog
      project={testProject.project}
      layout={testProject.testLayout}
      onClose={action('onClose')}
      onCreateNewObject={action('onCreateNewObject')}
      onObjectAddedFromAsset={action('onObjectAddedFromAsset')}
      objectsContainer={testProject.testLayout}
      resourceManagementProps={{
        onFetchNewlyAddedResources: async () => {},
        resourceSources: [],
        onChooseResource: () => Promise.reject('Unimplemented'),
        resourceExternalEditors: fakeResourceExternalEditors,
      }}
      canInstallPrivateAsset={() => false}
    />
  </AssetStoreStateProvider>
);
