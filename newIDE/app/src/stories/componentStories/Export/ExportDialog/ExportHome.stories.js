// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { type Exporter } from '../../../../Export/ExportDialog';

import ExportHome from '../../../../Export/ExportDialog/ExportHome';
import { fakeSilverAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../../GDevelopJsInitializerDecorator';
import { fakeBrowserOnlineWebExportPipeline } from '../../../../fixtures/TestExporters';

export default {
  title: 'Export/ExportHome',
  component: ExportHome,
  decorators: [paperDecorator, muiDecorator, GDevelopJsInitializerDecorator],
};

const onlineWebExporter: Exporter = {
  key: 'onlinewebexport',
  tabName: 'Web',
  name: 'Web',
  helpPage: '/publishing/web',
  exportPipeline: fakeBrowserOnlineWebExportPipeline,
};

export const Default = () => {
  return (
    <ExportHome
      onlineWebExporter={onlineWebExporter}
      setChosenExporterKey={action('chooseExporterKey')}
      setChosenExporterSection={action('chooseExporterSection')}
      project={testProject.project}
      onSaveProject={action('onSaveProject')}
      onChangeSubscription={action('onChangeSubscription')}
      authenticatedUser={fakeSilverAuthenticatedUser}
      isNavigationDisabled={false}
      setIsNavigationDisabled={action('setIsNavigationDisabled')}
      onGameUpdated={action('onGameUpdated')}
      showOnlineWebExporterOnly={false}
    />
  );
};

export const OnlineWebExportOnly = () => {
  return (
    <ExportHome
      onlineWebExporter={onlineWebExporter}
      setChosenExporterKey={action('chooseExporterKey')}
      setChosenExporterSection={action('chooseExporterSection')}
      project={testProject.project}
      onSaveProject={action('onSaveProject')}
      onChangeSubscription={action('onChangeSubscription')}
      authenticatedUser={fakeSilverAuthenticatedUser}
      isNavigationDisabled={false}
      setIsNavigationDisabled={action('setIsNavigationDisabled')}
      onGameUpdated={action('onGameUpdated')}
      showOnlineWebExporterOnly
    />
  );
};
