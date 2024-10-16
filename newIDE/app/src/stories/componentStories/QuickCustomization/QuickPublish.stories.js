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

const Template = ({ children }: { children: React.Node }) => (
  <EventsFunctionsExtensionsContext.Provider
    value={fakeEventsFunctionsExtensionsState}
  >
    <FixedHeightFlexContainer height={600}>{children}</FixedHeightFlexContainer>
  </EventsFunctionsExtensionsContext.Provider>
);

export const NotAuthenticated = () => {
  return (
    <Template>
      <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          cloudProjects: tenCloudProjects,
        }}
      >
        <QuickPublish
          project={testProject.project}
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
          isSavingProject={false}
          onSaveProject={async () => {}}
          onlineWebExporter={erroringOnlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
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
          onSaveProject={async () => {}}
          onlineWebExporter={onlineWebExporter}
          setIsNavigationDisabled={() => {}}
          onClose={action('onClose')}
          onContinueQuickCustomization={action('onContinueQuickCustomization')}
          onTryAnotherGame={action('onTryAnotherGame')}
        />
      </AuthenticatedUserContext.Provider>
    </Template>
  );
};
