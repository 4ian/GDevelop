// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';
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
import { client as gameClient } from '../../../Utils/GDevelopServices/Game';

export default {
  title: 'Share/OnlineGameLink',
  component: OnlineGameLink,
  decorators: [paperDecorator],
};

const Wrapper = ({ children }: {| children: React.Node |}) => {
  const gameApiMock = React.useMemo(() => {
    const mock = new MockAdapter(gameClient, {
      delayResponse: 500,
    });

    mock
      .onGet('/game-slug', {
        params: {
          userId: 'indie-user',
          gameId: completeWebBuild.gameId || '',
        },
      })
      .reply(200, [
        {
          username: 'sonic-fan',
          gameSlug: 'super-slug',
          createdAt: 1606065498,
        },
      ]);

    return mock;
  }, []);

  React.useEffect(
    () => {
      return () => {
        gameApiMock.restore();
      };
    },
    [gameApiMock]
  );

  return <>{children}</>;
};

export const Export = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'export'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const SavingProject = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'export'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const ResourcesDownload = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'resources-download'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const Compress = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'compress'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const Upload = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'upload'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const WaitingForBuild = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'waiting-for-build'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const Build = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'build'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const DoneWithPublicBuild = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={{ ...completeWebBuild, id: fakeGame.publicWebBuildId || '' }}
          errored={false}
          exportStep={'done'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
export const DoneWithPrivateBuild = () => {
  return (
    <Wrapper>
      <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
        <OnlineGameLink
          game={fakeGame}
          build={completeWebBuild}
          errored={false}
          exportStep={'done'}
          onSaveProject={action('onSaveProject')}
          onRefreshGame={action('onRefreshGame')}
          onGameUpdated={action('onGameUpdated')}
          isSavingProject={false}
          project={testProject.project}
          shouldShowShareDialog
        />
      </AuthenticatedUserContext.Provider>
    </Wrapper>
  );
};
