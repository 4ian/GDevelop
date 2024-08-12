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

export const NotAuthenticated = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <QuickPublish
      project={testProject.project}
      isSavingProject={false}
      onSaveProject={async () => {}}
      onlineWebExporter={onlineWebExporter}
      setIsNavigationDisabled={() => {}}
      shouldAutomaticallyStartExport={false}
    />
  </AuthenticatedUserContext.Provider>
);

export const Authenticated = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <QuickPublish
      project={testProject.project}
      isSavingProject={false}
      onSaveProject={async () => {}}
      onlineWebExporter={onlineWebExporter}
      setIsNavigationDisabled={() => {}}
      shouldAutomaticallyStartExport={false}
    />
  </AuthenticatedUserContext.Provider>
);
