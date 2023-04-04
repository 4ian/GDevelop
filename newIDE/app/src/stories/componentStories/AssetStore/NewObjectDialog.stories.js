// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import NewObjectDialog from '../../../AssetStore/NewObjectDialog';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'AssetStore/NewObjectDialog',
  component: NewObjectDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <I18n>
      {({ i18n }) => (
        <NewObjectDialog
          project={testProject.project}
          layout={testProject.testLayout}
          onClose={action('onClose')}
          onCreateNewObject={action('onCreateNewObject')}
          onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
          objectsContainer={testProject.testLayout}
          resourceManagementProps={fakeResourceManagementProps}
          canInstallPrivateAsset={() => false}
        />
      )}
    </I18n>
  </AssetStoreStateProvider>
);
