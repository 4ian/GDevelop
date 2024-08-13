// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import { QuickPublish } from '../../../QuickCustomization/QuickPublish';
import {
  fakeNotAuthenticatedUser,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeBrowserOnlineWebExportPipeline } from '../../../fixtures/TestExporters';
import { type Exporter } from '../../../ExportAndShare/ShareDialog';
import {
  fakeEmptyGameAndBuildsManager,
  fakeGameAndBuildsManager,
  fakeNotOwnedGameAndBuildsManager,
} from '../../../fixtures/GDevelopServicesTestData/FakeGameAndBuildsManager';

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

export const NotAuthenticated = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
      <QuickPublish
        project={testProject.project}
        gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
        isSavingProject={false}
        onSaveProject={async () => {}}
        onlineWebExporter={onlineWebExporter}
        setIsNavigationDisabled={() => {}}
        shouldAutomaticallyStartExport={false}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const Authenticated = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <QuickPublish
        project={testProject.project}
        gameAndBuildsManager={fakeEmptyGameAndBuildsManager}
        isSavingProject={false}
        onSaveProject={async () => {}}
        onlineWebExporter={onlineWebExporter}
        setIsNavigationDisabled={() => {}}
        shouldAutomaticallyStartExport={false}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const AuthenticatedExistingGame = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <QuickPublish
        project={testProject.project}
        gameAndBuildsManager={fakeGameAndBuildsManager}
        isSavingProject={false}
        onSaveProject={async () => {}}
        onlineWebExporter={onlineWebExporter}
        setIsNavigationDisabled={() => {}}
        shouldAutomaticallyStartExport={false}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const AuthenticatedNotOwnedGame = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <QuickPublish
        project={testProject.project}
        gameAndBuildsManager={fakeNotOwnedGameAndBuildsManager}
        isSavingProject={false}
        onSaveProject={async () => {}}
        onlineWebExporter={onlineWebExporter}
        setIsNavigationDisabled={() => {}}
        shouldAutomaticallyStartExport={false}
      />
    </AuthenticatedUserContext.Provider>
  );
};
