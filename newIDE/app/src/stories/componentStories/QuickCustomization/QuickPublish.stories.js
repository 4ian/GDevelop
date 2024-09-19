// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { QuickPublish } from '../../../QuickCustomization/QuickPublish';
import {
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
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

export const NotAuthenticated = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
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
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const Authenticated = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
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
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const AuthenticatedAndFails = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
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
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const AuthenticatedExistingGame = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
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
    </EventsFunctionsExtensionsContext.Provider>
  );
};

export const AuthenticatedNotOwnedGame = () => {
  return (
    <EventsFunctionsExtensionsContext.Provider
      value={fakeEventsFunctionsExtensionsState}
    >
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
    </EventsFunctionsExtensionsContext.Provider>
  );
};
