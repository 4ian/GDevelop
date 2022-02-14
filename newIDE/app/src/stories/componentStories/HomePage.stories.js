// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';
import withMock from 'storybook-addon-mock';

import muiDecorator from '../ThemeDecorator';

import { HomePage } from '../../MainFrame/EditorContainers/HomePage';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';

import { ExampleStoreStateProvider } from '../../AssetStore/ExampleStore/ExampleStoreContext';
import { GamesShowcaseStateProvider } from '../../GamesShowcase/GamesShowcaseContext';
import { TutorialStateProvider } from '../../Tutorial/TutorialContext';
import {
  GDevelopAssetApi,
  GDevelopGameApi,
} from '../../Utils/GDevelopServices/ApiConfigs';

const apiDataServerSideError = {
  mockData: [
    {
      url: `${GDevelopAssetApi.baseUrl}/example-short-header-and-filter`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
    {
      url: `${GDevelopAssetApi.baseUrl}/tutorial`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
    {
      url: `${GDevelopGameApi.baseUrl}/showcased-game`,
      method: 'GET',
      status: 500,
      response: { data: 'status' },
    },
  ],
};

const WrappedHomePage = ({ project }: {| project: ?gdProject |}) => (
  <ExampleStoreStateProvider>
    <TutorialStateProvider>
      <GamesShowcaseStateProvider>
        <HomePage
          project={project}
          isActive={true}
          projectItemName={null}
          setToolbar={() => {}}
          canOpen={true}
          onOpen={() => action('onOpen')()}
          onOpenRecentFile={() => action('onOpenRecentFile')()}
          onOpenExamples={() => action('onOpenExamples')()}
          onOpenProjectManager={() => action('onOpenProjectManager')()}
          onCloseProject={() => action('onCloseProject')()}
          onOpenTutorials={() => action('onOpenTutorials')()}
          onOpenGamesShowcase={() => action('onOpenGamesShowcase')()}
          onOpenHelpFinder={() => action('onOpenHelpFinder')()}
          onOpenLanguageDialog={() => action('open language dialog')()}
          onCreateFromExampleShortHeader={() => action('create from example')()}
          onOpenProjectAfterCreation={() =>
            action('call callback after project creation')()
          }
          onOpenProfile={() => action('open profile')()}
          onCreateBlank={() => action('create blank')()}
        />
      </GamesShowcaseStateProvider>
    </TutorialStateProvider>
  </ExampleStoreStateProvider>
);

export default {
  title: 'HomePage',
  component: WrappedHomePage,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator],
};

export const NoProjectOpened = () => <WrappedHomePage project={null} />;
export const ProjectOpened = () => (
  <WrappedHomePage project={testProject.project} />
);

export const WithServerSideErrors = () => (
  <WrappedHomePage project={testProject.project} />
);
WithServerSideErrors.decorators = [withMock];
WithServerSideErrors.parameters = apiDataServerSideError;
