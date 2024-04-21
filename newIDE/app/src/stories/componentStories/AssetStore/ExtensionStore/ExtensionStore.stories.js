// @flow
import * as React from 'react';
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
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
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
    <PreferencesContext.Provider value={preferences}>
      <FixedHeightFlexContainer height={400}>
        <ExtensionStoreStateProvider>
          <ExtensionStore
            project={testProject.project}
            isInstalling={false}
            onInstall={action('onInstall')}
            showOnlyWithBehaviors={false}
          />
        </ExtensionStoreStateProvider>
      </FixedHeightFlexContainer>
    </PreferencesContext.Provider>
  );
};
WithCommunityExtensions.parameters = apiDataFakeExtensions;

export const WithServerSideErrors = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);
WithServerSideErrors.parameters = apiDataServerSideError;

export const ShowingAnAlreadyInstalledExtension = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider defaultSearchText="Fake installed">
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);
ShowingAnAlreadyInstalledExtension.parameters = apiDataFakeExtensions;

export const ExtensionBeingInstalled = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={true}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={false}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);
ExtensionBeingInstalled.parameters = apiDataFakeExtensions;

export const OnlyWithBehaviors = () => (
  <FixedHeightFlexContainer height={400}>
    <ExtensionStoreStateProvider>
      <ExtensionStore
        project={testProject.project}
        isInstalling={false}
        onInstall={action('onInstall')}
        showOnlyWithBehaviors={true}
      />
    </ExtensionStoreStateProvider>
  </FixedHeightFlexContainer>
);
OnlyWithBehaviors.parameters = apiDataFakeExtensions;
