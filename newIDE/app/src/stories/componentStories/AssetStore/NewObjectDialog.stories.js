// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import NewObjectDialog from '../../../AssetStore/NewObjectDialog';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { useShopNavigation } from '../../../AssetStore/AssetStoreNavigator';

export default {
  title: 'AssetStore/NewObjectDialog',
  component: NewObjectDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  const navigationState = useShopNavigation();
  return (
    <AssetStoreStateProvider shopNavigationState={navigationState}>
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
};
