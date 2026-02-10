// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { ExtensionStore } from '../../../../AssetStore/ExtensionStore';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ExtensionStoreStateProvider } from '../../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { fakeExtensionsRegistry } from '../../../../fixtures/GDevelopServicesTestData/FakeExtensionsRegistry';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';
import {
  client as extensionClient,
  cdnClient,
} from '../../../../Utils/GDevelopServices/Extension';

export default {
  title: 'AssetStore/ExtensionStore',
  component: ExtensionStore,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
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
        <FixedHeightFlexContainer height={400}>
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionStore
              project={testProject.project}
              isInstalling={false}
              onInstall={action('onInstall')}
              showOnlyWithBehaviors={false}
            />
          </ExtensionStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};

export const WithCommunityExtensions = (): React.Node => {
  const [
    showExperimentalExtensions,
    setShowExperimentalExtensions,
  ] = React.useState(true);
  // $FlowFixMe[incompatible-type]
  const preferences: Preferences = {
    ...initialPreferences,
    // $FlowFixMe[incompatible-type]
    values: { ...initialPreferences.values, showExperimentalExtensions },
    setShowExperimentalExtensions,
  };

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
        <PreferencesContext.Provider value={preferences}>
          <FixedHeightFlexContainer height={400}>
            <ExtensionStoreStateProvider i18n={i18n}>
              <ExtensionStore
                project={testProject.project}
                isInstalling={false}
                onInstall={action('onInstall')}
                showOnlyWithBehaviors={false}
              />
            </ExtensionStoreStateProvider>
          </FixedHeightFlexContainer>
        </PreferencesContext.Provider>
      )}
    </I18n>
  );
};

export const WithServerSideErrors = (): React.Node => {
  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock.onGet('/extensions-registry').reply(500, { data: 'status' });

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
        <FixedHeightFlexContainer height={400}>
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionStore
              project={testProject.project}
              isInstalling={false}
              onInstall={action('onInstall')}
              showOnlyWithBehaviors={false}
            />
          </ExtensionStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};

export const ShowingAnAlreadyInstalledExtension = (): React.Node => {
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
        <FixedHeightFlexContainer height={400}>
          <ExtensionStoreStateProvider
            i18n={i18n}
            defaultSearchText="Fake installed"
          >
            <ExtensionStore
              project={testProject.project}
              isInstalling={false}
              onInstall={action('onInstall')}
              showOnlyWithBehaviors={false}
            />
          </ExtensionStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};

export const ExtensionBeingInstalled = (): React.Node => {
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
        <FixedHeightFlexContainer height={400}>
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionStore
              project={testProject.project}
              isInstalling={true}
              onInstall={action('onInstall')}
              showOnlyWithBehaviors={false}
            />
          </ExtensionStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};

export const OnlyWithBehaviors = (): React.Node => {
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
        <FixedHeightFlexContainer height={400}>
          <ExtensionStoreStateProvider i18n={i18n}>
            <ExtensionStore
              project={testProject.project}
              isInstalling={false}
              onInstall={action('onInstall')}
              showOnlyWithBehaviors={true}
            />
          </ExtensionStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};
