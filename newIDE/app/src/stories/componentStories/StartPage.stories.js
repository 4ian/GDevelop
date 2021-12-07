// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { action } from '@storybook/addon-actions';
import withMock from 'storybook-addon-mock';

import muiDecorator from '../ThemeDecorator';

import { StartPage } from '../../MainFrame/EditorContainers/StartPage';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';

import { ExampleStoreStateProvider } from '../../AssetStore/ExampleStore/ExampleStoreContext';
import { GamesShowcaseStateProvider } from '../../GamesShowcase/GamesShowcaseContext';
import { TutorialStateProvider } from '../../Tutorial/TutorialContext';
import { GDevelopAssetApi, GDevelopGameApi } from '../../Utils/GDevelopServices/ApiConfigs';

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

const WrappedStartPage = ({ project }: {| project: ?gdProject |}) => (
  <ExampleStoreStateProvider>
    <TutorialStateProvider>
      <GamesShowcaseStateProvider>
        <StartPage
          project={project}
          isActive={true}
          projectItemName={null}
          setToolbar={() => {}}
          canOpen={true}
          onOpen={() => action('onOpen')()}
          onCreate={() => action('onCreate')()}
          onOpenProjectManager={() => action('onOpenProjectManager')()}
          onCloseProject={() => action('onCloseProject')()}
          onOpenTutorials={() => action('onOpenTutorials')()}
          onOpenGamesShowcase={() => action('onOpenGamesShowcase')()}
          onOpenHelpFinder={() => action('onOpenHelpFinder')()}
          onOpenLanguageDialog={() => action('open language dialog')()}
          onCreateFromExampleShortHeader={() => action('create from example')}
          onOpenFromExampleShortHeader={() =>
            action('call callback after project creation')
          }
          onOpenProfile={() => action('open profile')}
        />
      </GamesShowcaseStateProvider>
    </TutorialStateProvider>
  </ExampleStoreStateProvider>
);

export default {
  title: 'StartPage',
  component: WrappedStartPage,
  decorators: [muiDecorator, GDevelopJsInitializerDecorator],
};

export const NoProjectOpened = () => <WrappedStartPage project={null} />;
export const ProjectOpened = () => (
  <WrappedStartPage project={testProject.project} />
);

export const WithServerSideErrors = () => (
  <WrappedStartPage project={testProject.project} />
)
WithServerSideErrors.decorators = [withMock]
WithServerSideErrors.parameters = apiDataServerSideError