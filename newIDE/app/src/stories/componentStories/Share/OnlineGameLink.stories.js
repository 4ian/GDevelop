// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import paperDecorator from '../../PaperDecorator';

import { OnlineGameLink } from '../../../ExportAndShare/GenericExporters/OnlineWebExport';
import {
  completeWebBuild,
  fakeGame,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { GDevelopGameApi } from '../../../Utils/GDevelopServices/ApiConfigs';

export default {
  title: 'Share/OnlineGameLink',
  component: OnlineGameLink,
  decorators: [paperDecorator],
  parameters: {
    mockData: [
      {
        url: `${
          GDevelopGameApi.baseUrl
        }/game-slug?userId=indie-user&gameId=${completeWebBuild.gameId || ''}`,
        method: 'GET',
        status: 200,
        response: [
          {
            username: 'sonic-fan',
            gameSlug: 'super-slug',
            createdAt: 1606065498,
          },
        ],
        delay: 500,
      },
    ],
  },
};

export const Export = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'export'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const SavingProject = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'export'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const ResourcesDownload = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'resources-download'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Compress = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'compress'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Upload = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'upload'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const WaitingForBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'waiting-for-build'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Build = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'build'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const DoneWithPublicBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={{ ...completeWebBuild, id: fakeGame.publicWebBuildId || '' }}
        errored={false}
        exportStep={'done'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const DoneWithPrivateBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        game={fakeGame}
        build={completeWebBuild}
        errored={false}
        exportStep={'done'}
        onSaveProject={action('onSaveProject')}
        onGameUpdated={action('onGameUpdated')}
        isSavingProject={false}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
