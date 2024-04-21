// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import ExtensionsSearchDialog from '../../../../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import { I18n } from '@lingui/react';
import EventsFunctionsExtensionsProvider from '../../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';
import { ExtensionStoreStateProvider } from '../../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { GDevelopAssetApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import { fakeExtensionsRegistry } from '../../../../fixtures/GDevelopServicesTestData/FakeExtensionsRegistry';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionSearchDialog',
  component: ExtensionsSearchDialog,
  decorators: [paperDecorator],
};

const apiDataServerSideError = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/extensions-registry`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const apiDataFakeExtensions = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/extensions-registry`,
      method: 'GET',
      status: 200,
      response: fakeExtensionsRegistry,
    },
  ],
};

export const Default = () => (
  <I18n>
    {({ i18n }) => (
      <EventsFunctionsExtensionsProvider
        i18n={i18n}
        makeEventsFunctionCodeWriter={() => null}
        eventsFunctionsExtensionWriter={null}
        eventsFunctionsExtensionOpener={null}
      >
        <ExtensionStoreStateProvider>
          <ExtensionsSearchDialog
            project={testProject.project}
            onClose={action('onClose')}
            onInstallExtension={action('onInstallExtension')}
            onCreateNew={action('onCreateNew')}
          />
        </ExtensionStoreStateProvider>
      </EventsFunctionsExtensionsProvider>
    )}
  </I18n>
);
Default.parameters = apiDataFakeExtensions;

export const WithServerSideError = () => (
  <I18n>
    {({ i18n }) => (
      <EventsFunctionsExtensionsProvider
        i18n={i18n}
        makeEventsFunctionCodeWriter={() => null}
        eventsFunctionsExtensionWriter={null}
        eventsFunctionsExtensionOpener={null}
      >
        <ExtensionStoreStateProvider>
          <ExtensionsSearchDialog
            project={testProject.project}
            onClose={action('onClose')}
            onInstallExtension={action('onInstallExtension')}
            onCreateNew={action('onCreateNew')}
          />
        </ExtensionStoreStateProvider>
      </EventsFunctionsExtensionsProvider>
    )}
  </I18n>
);
WithServerSideError.parameters = apiDataServerSideError;
