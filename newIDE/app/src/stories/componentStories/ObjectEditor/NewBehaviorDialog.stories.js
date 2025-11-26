// @flow

import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import NewBehaviorDialog from '../../../BehaviorsEditor/NewBehaviorDialog';
import { BehaviorStoreStateProvider } from '../../../AssetStore/BehaviorStore/BehaviorStoreContext';
import { fakeBehaviorsRegistry } from '../../../fixtures/GDevelopServicesTestData/FakeBehaviorsRegistry';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import PreferencesContext, {
  initialPreferences,
  type Preferences,
} from '../../../MainFrame/Preferences/PreferencesContext';
import {
  client as extensionClient,
  cdnClient,
} from '../../../Utils/GDevelopServices/Extension';

export default {
  title: 'ObjectEditor/NewBehaviorDialog',
  component: NewBehaviorDialog,
};

export const DefaultForSpriteObject = () => {
  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock.onGet('/behavior', { params: { environment: 'live' } }).reply(200, {
      databaseUrl: 'https://fake-cdn.com/behaviors-database-v2.json',
    });

    return mock;
  }, []);

  const behaviorCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet('https://fake-cdn.com/behaviors-database-v2.json')
      .reply(200, fakeBehaviorsRegistry);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionApiMock.restore();
        behaviorCdnMock.restore();
      };
    },
    [extensionApiMock, behaviorCdnMock]
  );

  return (
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
            onWillInstallExtension={action('extension will be installed')}
            onExtensionInstalled={action('extension installed')}
          />
        </BehaviorStoreStateProvider>
      )}
    </I18n>
  );
};

export const WithCommunityExtensions = () => {
  const [
    showExperimentalExtensions,
    setShowExperimentalExtensions,
  ] = React.useState(true);
  const preferences: Preferences = {
    ...initialPreferences,
    values: { ...initialPreferences.values, showExperimentalExtensions },
    setShowExperimentalExtensions,
  };

  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock.onGet('/behavior', { params: { environment: 'live' } }).reply(200, {
      databaseUrl: 'https://fake-cdn.com/behaviors-database-v2.json',
    });

    return mock;
  }, []);

  const behaviorCdnMock = React.useMemo(() => {
    const mock = new MockAdapter(cdnClient, {
      delayResponse: 250,
    });

    mock
      .onGet('https://fake-cdn.com/behaviors-database-v2.json')
      .reply(200, fakeBehaviorsRegistry);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        extensionApiMock.restore();
        behaviorCdnMock.restore();
      };
    },
    [extensionApiMock, behaviorCdnMock]
  );

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
                onWillInstallExtension={action('extension will be installed')}
                onExtensionInstalled={action('extension installed')}
              />
            </BehaviorStoreStateProvider>
          </FixedHeightFlexContainer>
        </PreferencesContext.Provider>
      )}
    </I18n>
  );
};

export const WithServerSideErrors = () => {
  const extensionApiMock = React.useMemo(() => {
    const mock = new MockAdapter(extensionClient, {
      delayResponse: 250,
    });

    mock
      .onGet('/behavior', { params: { environment: 'live' } })
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
              onWillInstallExtension={action('extension will be installed')}
              onExtensionInstalled={action('extension installed')}
            />
          </BehaviorStoreStateProvider>
        </FixedHeightFlexContainer>
      )}
    </I18n>
  );
};
