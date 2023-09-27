// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { type Exporter } from '../../../../ExportAndShare/ShareDialog';

import {
  type ExporterSection,
  type ExporterSubSection,
} from '../../../../ExportAndShare/ShareDialog';
import PublishHome from '../../../../ExportAndShare/ShareDialog/PublishHome';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../../GDevelopJsInitializerDecorator';
import { fakeBrowserOnlineWebExportPipeline } from '../../../../fixtures/TestExporters';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import { fakeStartupAuthenticatedUser } from '../../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Share/PublishHome',
  component: PublishHome,
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
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<?ExporterSection>(null);
  const [
    chosenExporterSubSection,
    setChosenExporterSubSection,
  ] = React.useState<?ExporterSubSection>(null);
  return (
    <PublishHome
      project={testProject.project}
      onSaveProject={action('onSaveProject')}
      onGameUpdated={action('onGameUpdated')}
      onChangeSubscription={action('onChangeSubscription')}
      isNavigationDisabled={false}
      setIsNavigationDisabled={action('setIsNavigationDisabled')}
      selectedExporter={null}
      onChooseSection={setChosenExporterSection}
      onChooseSubSection={setChosenExporterSubSection}
      chosenSection={chosenExporterSection}
      chosenSubSection={chosenExporterSubSection}
      game={null}
    />
  );
};

export const OnlineWebExporterSelected = () => {
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<?ExporterSection>('browser');
  const [
    chosenExporterSubSection,
    setChosenExporterSubSection,
  ] = React.useState<?ExporterSubSection>('online');
  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <PublishHome
        project={testProject.project}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        onChangeSubscription={action('onChangeSubscription')}
        isNavigationDisabled={false}
        setIsNavigationDisabled={action('setIsNavigationDisabled')}
        selectedExporter={onlineWebExporter}
        onChooseSection={setChosenExporterSection}
        onChooseSubSection={setChosenExporterSubSection}
        chosenSection={chosenExporterSection}
        chosenSubSection={chosenExporterSubSection}
        game={null}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const OnlyOnlineWebExporter = () => {
  const [
    chosenExporterSection,
    setChosenExporterSection,
  ] = React.useState<?ExporterSection>('browser');
  const [
    chosenExporterSubSection,
    setChosenExporterSubSection,
  ] = React.useState<?ExporterSubSection>('online');
  return (
    <AuthenticatedUserContext.Provider value={fakeStartupAuthenticatedUser}>
      <PublishHome
        project={testProject.project}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        onChangeSubscription={action('onChangeSubscription')}
        isNavigationDisabled={false}
        setIsNavigationDisabled={action('setIsNavigationDisabled')}
        selectedExporter={onlineWebExporter}
        onChooseSection={setChosenExporterSection}
        onChooseSubSection={setChosenExporterSubSection}
        chosenSection={chosenExporterSection}
        chosenSubSection={chosenExporterSubSection}
        game={null}
        showOnlineWebExporterOnly
      />
    </AuthenticatedUserContext.Provider>
  );
};