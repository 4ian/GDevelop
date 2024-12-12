// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { QuickPublish } from '../../../QuickCustomization/QuickPublish';
import {
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
  fakeAuthenticatedUserWithNoSubscriptionAndCredits,
  tenCloudProjects,
} from '../../../fixtures/GDevelopServicesTestData';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  fakeBrowserOnlineWebExportPipeline,
  fakeErroringBrowserOnlineWebExportPipeline,
} from '../../../fixtures/TestExporters';
import { type Exporter } from '../../../ExportAndShare/ShareDialog';
import {
  fakeEmptyGameAndBuildsManager,
  fakeGameAndBuildsManager,
  fakeNotOwnedGameAndBuildsManager,
} from '../../../fixtures/GDevelopServicesTestData/FakeGameAndBuildsManager';
import EventsFunctionsExtensionsContext from '../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { fakeEventsFunctionsExtensionsState } from '../../FakeEventsFunctionsExtensionsContext';
import { GDevelopGameApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import { client as gameApiClient } from '../../../Utils/GDevelopServices/Game';
import MockAdapter from 'axios-mock-adapter';

export default {
  title: 'QuickCustomization/QuickPublish',
  component: QuickPublish,
  decorators: [paperDecorator],
};

const onlineWebExporter: Exporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: 'Web',
  helpPage: '/publishing/web',
  exportPipeline: fakeBrowserOnlineWebExportPipeline,
};

const erroringOnlineWebExporter: Exporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: 'Web',
  helpPage: '/publishing/web',
  exportPipeline: fakeErroringBrowserOnlineWebExportPipeline,
};

const Template = ({ children }: {| children: React.Node |}) => {
  const fakeGame = fakeGameAndBuildsManager.game;
  if (!fakeGame)
    throw new Error(
      'Game was expected to be defined in `fakeGameAndBuildsManager`.'
    );

  const axiosMock = new MockAdapter(gameApiClient, { delayResponse: 500 });
  axiosMock
    .onPatch(`${GDevelopGameApi.baseUrl}/game/${fakeGame.id}`)
    .reply(200, fakeGame)
    .onAny()
    .reply(501);

  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
      <FixedHeightFlexContainer height={600}>
        {children}
      </FixedHeightFlexContainer>
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const NotAuthenticated = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const NotAuthenticatedWithScreenshot = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[
            'https://i.ytimg.com/vi/PguDpz7TC7g/hqdefault.jpg',
          ]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedWithAvailableCloudProjectsRoom = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedWithTooManyCloudProjects = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider
        value={{
          ...fakeAuthenticatedUserWithNoSubscriptionAndCredits,
          // We have more projects than the maximum allowed, so we must tell the user
          // that the project can't be saved yet with their current subscription.
          cloudProjects: tenCloudProjects,
        }}
      >
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedWithCloudProjectsMaximumReachedButSavedAlready = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider
        value={{
          ...fakeAuthenticatedUserWithNoSubscriptionAndCredits,
          // We have more projects than the maximum allowed, but the project is already saved
          // so there are no problems.
          cloudProjects: tenCloudProjects,
        }}
      >
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() =>
            // Indicates that the project is already saved, there will be
            // no need to save it as a new cloud project.
            false
          }
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedAndLoadingUserCloudProjects = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider
        value={{
          ...fakeAuthenticatedUserWithNoSubscriptionAndCredits,
          cloudProjects: null,
        }}
      >
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedAndFails = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={erroringOnlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedExistingGame = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};

export const AuthenticatedNotOwnedGame = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeNotOwnedGameAndBuildsManager}
          isSavingProject={false}
          isRequiredToSaveAsNewCloudProject={() => true}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          gameScreenshotUrls={[]}
          onScreenshotsClaimed={action('onScreenshotsClaimed')}
          onLaunchPreview={action('onLaunchPreview')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};
