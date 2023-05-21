// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';
import withMock from 'storybook-addon-mock';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { OnlineGameLink } from '../../../Export/GenericExporters/OnlineWebExport';
import {
  completeWebBuild,
  fakeGame,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import { testProject } from '../../GDevelopJsInitializerDecorator';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { GDevelopGameApi } from '../../../Utils/GDevelopServices/ApiConfigs';

export default {
  title: 'Export/OnlineGameLink',
  component: OnlineGameLink,
  decorators: [paperDecorator, muiDecorator, withMock],
  parameters: {
    mockData: [
      {
        url: `${GDevelopGameApi.baseUrl}/game/${completeWebBuild.gameId ||
          ''}?userId=indie-user`,
        method: 'GET',
        status: 200,
        response: fakeGame,
        delay: 500,
      },
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
        build={completeWebBuild}
        errored={false}
        exportStep={'export'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const ResourcesDownload = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'resources-download'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Compress = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'compress'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Upload = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'upload'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const WaitingForBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'waiting-for-build'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const Build = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'build'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const DoneWithPublicBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={{ ...completeWebBuild, id: fakeGame.publicWebBuildId || '' }}
        errored={false}
        exportStep={'done'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
export const DoneWithPrivateBuild = () => {
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <OnlineGameLink
        build={completeWebBuild}
        errored={false}
        exportStep={'done'}
        onSaveProject={action('onSaveProject')}
        project={testProject.project}
      />
    </AuthenticatedUserContext.Provider>
  );
};
