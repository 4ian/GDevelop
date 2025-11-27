// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import ExtensionsSearchDialog from '../../../../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import { I18n } from '@lingui/react';
import { EventsFunctionsExtensionsProvider } from '../../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsProvider';
import { ExtensionStoreStateProvider } from '../../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { fakeExtensionsRegistry } from '../../../../fixtures/GDevelopServicesTestData/FakeExtensionsRegistry';
import {
  client as extensionClient,
  cdnClient,
} from '../../../../Utils/GDevelopServices/Extension';

export default {
  title: 'AssetStore/ExtensionStore/ExtensionSearchDialog',
  component: ExtensionsSearchDialog,
  decorators: [paperDecorator],
};

export const Default = () => {
  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock.onGet('/extension', { params: { environment: 'live' } }).reply(200, {
      databaseUrl: 'https://fake-cdn.com/extensions-database-v2.json',
    });

    return mock;
  }, []);

  const extensionCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet('https://fake-cdn.com/extensions-database-v2.json')
      .reply(200, fakeExtensionsRegistry);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionApiMock.restore();
        extensionCdnMock.restore();
      };
    },
    [extensionApiMock, extensionCdnMock]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <EventsFunctionsExtensionsProvider
          i18n={i18n}
          makeEventsFunctionCodeWriter={() => null}
          eventsFunctionsExtensionWriter={null}
          eventsFunctionsExtensionOpener={null}
        >
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionsSearchDialog
              project={testProject.project}
              onClose={action('onClose')}
              onCreateNew={action('onCreateNew')}
              onWillInstallExtension={action('extension will be installed')}
              onExtensionInstalled={action('onExtensionInstalled')}
            />
          </ExtensionStoreStateProvider>
        </EventsFunctionsExtensionsProvider>
      )}
    </I18n>
  );
};

export const WithServerSideError = () => {
  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/extension', { params: { environment: 'live' } })
      .reply(500, { data: 'status' });

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionApiMock.restore();
      };
    },
    [extensionApiMock]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <EventsFunctionsExtensionsProvider
          i18n={i18n}
          makeEventsFunctionCodeWriter={() => null}
          eventsFunctionsExtensionWriter={null}
          eventsFunctionsExtensionOpener={null}
        >
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionsSearchDialog
              project={testProject.project}
              onClose={action('onClose')}
              onCreateNew={action('onCreateNew')}
              onWillInstallExtension={action('extension will be installed')}
              onExtensionInstalled={action('onExtensionInstalled')}
            />
          </ExtensionStoreStateProvider>
        </EventsFunctionsExtensionsProvider>
      )}
    </I18n>
  );
};
