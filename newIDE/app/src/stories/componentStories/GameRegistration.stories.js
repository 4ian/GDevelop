// @flow
import * as React from 'react';
import MockAdapter from 'axios-mock-adapter';

import paperDecorator from '../PaperDecorator';

import { GameRegistration } from '../../GameDashboard/GameRegistration';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../GDevelopJsInitializerDecorator';
import {
  fakeSilverAuthenticatedUser,
  fakeNotAuthenticatedUser,
} from '../../fixtures/GDevelopServicesTestData';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { client as gameApiClient } from '../../Utils/GDevelopServices/Game';

export default {
  title: 'GameDashboard/GameRegistration',
  component: GameRegistration,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};

export const NoProjectLoaded = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration project={null} onGameRegistered={() => {}} />
  </AuthenticatedUserContext.Provider>
);

export const NotLoggedIn = (): React.Node => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);

export const NotAuthorized = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(403, {});

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const GameNotExisting = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(404, {});

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const ErrorLoadingGame = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(500, {});

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const RegisteredWithAdditionalActions = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(200, {
      id: 'game-id',
      name: 'My game',
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
        suggestAdditionalActions
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const RegisteredWithLoader = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(200, {
      id: 'game-id',
      name: 'My game',
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const RegisteredWithoutLoader = (): React.Node => {
  const gameServiceMock = new MockAdapter(gameApiClient, {
    delayResponse: 500,
  });
  gameServiceMock
    .onGet('/game/', { params: { userId: 'indie-user' } })
    .reply(200, {
      id: 'game-id',
      name: 'My game',
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameRegistration
        project={testProject.project}
        onGameRegistered={() => {}}
        hideLoader
      />
    </AuthenticatedUserContext.Provider>
  );
};
