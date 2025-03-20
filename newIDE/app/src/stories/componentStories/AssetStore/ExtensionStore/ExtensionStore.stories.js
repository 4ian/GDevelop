// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { ExtensionStore } from '../../../../AssetStore/ExtensionStore';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ExtensionStoreStateProvider } from '../../../../AssetStore/ExtensionStore/ExtensionStoreContext';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { GDevelopAssetApi } from '../../../../Utils/GDevelopServices/ApiConfigs';
import { fakeExtensionsRegistry } from '../../../../fixtures/GDevelopServicesTestData/FakeExtensionsRegistry';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../../MainFrame/Preferences/PreferencesContext';

export default {
  title: 'AssetStore/ExtensionStore',
  component: ExtensionStore,
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
Default.parameters = apiDataFakeExtensions;

export const WithCommunityExtensions = () => {
  const [showCommunityExtensions, setShowCommunityExtensions] = React.useState(
    true
  );
  const preferences: Preferences = {
    ...initialPreferences,
    values: { ...initialPreferences.values, showCommunityExtensions },
    setShowCommunityExtensions,
  };

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
WithCommunityExtensions.parameters = apiDataFakeExtensions;

export const WithServerSideErrors = () => (
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
WithServerSideErrors.parameters = apiDataServerSideError;

export const ShowingAnAlreadyInstalledExtension = () => (
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
ShowingAnAlreadyInstalledExtension.parameters = apiDataFakeExtensions;

export const ExtensionBeingInstalled = () => (
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
ExtensionBeingInstalled.parameters = apiDataFakeExtensions;

export const OnlyWithBehaviors = () => (
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
OnlyWithBehaviors.parameters = apiDataFakeExtensions;
