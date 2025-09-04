// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import NewBehaviorDialog from '../../../BehaviorsEditor/NewBehaviorDialog';
import { BehaviorStoreStateProvider } from '../../../AssetStore/BehaviorStore/BehaviorStoreContext';
import { GDevelopAssetApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import { fakeBehaviorsRegistry } from '../../../fixtures/GDevelopServicesTestData/FakeBehaviorsRegistry';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';

export default {
  title: 'ObjectEditor/NewBehaviorDialog',
  component: NewBehaviorDialog,
};

const apiDataServerSideError = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/behavior?environment=live`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const apiDataFakeBehaviors = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/behavior?environment=live`,
      method: 'GET',
      status: 200,
      response: {
        databaseUrl: 'https://fake-cdn.com/behaviors-database-v2.json',
      },
    },
    {
      url: `https://fake-cdn.com/behaviors-database-v2.json`,
      method: 'GET',
      status: 200,
      response: fakeBehaviorsRegistry,
    },
  ],
};

export const DefaultForSpriteObject = () => (
  <I18n>
    {({ i18n }) => (
      <BehaviorStoreStateProvider i18n={i18n}>
        <NewBehaviorDialog
          open
          project={testProject.project}
          eventsFunctionsExtension={null}
          objectType={'Sprite'}
          isChildObject={false}
          onClose={action('on close')}
          onChoose={action('on choose')}
          objectBehaviorsTypes={[
            'DestroyOutsideBehavior::DestroyOutside',
            'PlatformBehavior::PlatformBehavior',
          ]}
          onExtensionInstalled={action('extension installed')}
        />
      </BehaviorStoreStateProvider>
    )}
  </I18n>
);
DefaultForSpriteObject.parameters = apiDataFakeBehaviors;

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
            <BehaviorStoreStateProvider i18n={i18n}>
              <NewBehaviorDialog
                open
                project={testProject.project}
                eventsFunctionsExtension={null}
                objectType={'Sprite'}
                isChildObject={false}
                onClose={action('on close')}
                onChoose={action('on choose')}
                objectBehaviorsTypes={[
                  'DestroyOutsideBehavior::DestroyOutside',
                  'PlatformBehavior::PlatformBehavior',
                ]}
                onExtensionInstalled={action('extension installed')}
              />
            </BehaviorStoreStateProvider>
          </FixedHeightFlexContainer>
        </PreferencesContext.Provider>
      )}
    </I18n>
  );
};
WithCommunityExtensions.parameters = apiDataFakeBehaviors;

export const WithServerSideErrors = () => (
  <I18n>
    {({ i18n }) => (
      <FixedHeightFlexContainer height={400}>
        <BehaviorStoreStateProvider i18n={i18n}>
          <NewBehaviorDialog
            open
            project={testProject.project}
            eventsFunctionsExtension={null}
            objectType={'Sprite'}
            isChildObject={false}
            onClose={action('on close')}
            onChoose={action('on choose')}
            objectBehaviorsTypes={[
              'DestroyOutsideBehavior::DestroyOutside',
              'PlatformBehavior::PlatformBehavior',
            ]}
            onExtensionInstalled={action('extension installed')}
          />
        </BehaviorStoreStateProvider>
      </FixedHeightFlexContainer>
    )}
  </I18n>
);
WithServerSideErrors.parameters = apiDataServerSideError;
