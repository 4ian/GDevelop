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
import { ObjectStoreStateProvider } from '../../../AssetStore/ObjectStoreContext';

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
            <ObjectStoreStateProvider i18n={i18n}>
              <NewObjectDialog
                project={testProject.project}
                layout={testProject.testLayout}
                eventsFunctionsExtension={null}
                eventsBasedObject={null}
                onClose={action('onClose')}
                onCreateNewObject={action('onCreateNewObject')}
                onObjectsAddedFromAssets={action('onObjectsAddedFromAssets')}
                objectsContainer={testProject.testLayout.getObjects()}
                resourceManagementProps={fakeResourceManagementProps}
                onWillInstallExtension={action('extension will be installed')}
                onExtensionInstalled={action('onExtensionInstalled')}
              />
            </ObjectStoreStateProvider>
          )}
        </I18n>
      </AssetStoreStateProvider>
    </AssetStoreNavigatorStateProvider>
  );
};
