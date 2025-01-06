// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import NewObjectDialog from '../../../AssetStore/NewObjectDialog';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';

export default {
  title: 'AssetStore/NewObjectDialog',
  component: NewObjectDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  return (
    <AssetStoreNavigatorStateProvider>
      <AssetStoreStateProvider>
        <I18n>
          {({ i18n }) => (
            <NewObjectDialog
              project={testProject.project}
              layout={testProject.testLayout}
              eventsBasedObject={null}
              onClose={action('onClose')}
              onCreateNewObject={action('onCreateNewObject')}
              onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
              objectsContainer={testProject.testLayout.getObjects()}
              resourceManagementProps={fakeResourceManagementProps}
            />
          )}
        </I18n>
      </AssetStoreStateProvider>
    </AssetStoreNavigatorStateProvider>
  );
};
