// @flow
import * as React from 'react';

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
import { GDevelopGameApi } from '../../Utils/GDevelopServices/ApiConfigs';

export default {
  title: 'GameDashboard/GameRegistration',
  component: GameRegistration,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};

export const NoProjectLoaded = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration project={null} onGameRegistered={() => {}} />
  </AuthenticatedUserContext.Provider>
);

export const NotLoggedIn = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);

export const NotLoggedInWithoutLogin = () => (
  <AuthenticatedUserContext.Provider value={fakeNotAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
      hideLogin
    />
  </AuthenticatedUserContext.Provider>
);

export const NotAuthorized = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);
NotAuthorized.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 403,
      response: {},
      delay: 500,
    },
  ],
};

export const GameNotExisting = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);
GameNotExisting.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 404,
      response: {},
      delay: 500,
    },
  ],
};

export const ErrorLoadingGame = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);
ErrorLoadingGame.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 500,
      response: {},
      delay: 500,
    },
  ],
};

export const RegisteredWithAdditionalActions = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
      suggestAdditionalActions
    />
  </AuthenticatedUserContext.Provider>
);
RegisteredWithAdditionalActions.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 200,
      response: {
        id: 'game-id',
        name: 'My game',
      },
      delay: 500,
    },
  ],
};

export const RegisteredWithLoader = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
    />
  </AuthenticatedUserContext.Provider>
);
RegisteredWithLoader.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 200,
      response: {
        id: 'game-id',
        name: 'My game',
      },
      delay: 500,
    },
  ],
};

export const RegisteredWithoutLoader = () => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <GameRegistration
      project={testProject.project}
      onGameRegistered={() => {}}
      hideLoader
    />
  </AuthenticatedUserContext.Provider>
);
RegisteredWithoutLoader.parameters = {
  mockData: [
    {
      url: `${GDevelopGameApi.baseUrl}/game/?userId=indie-user`,
      method: 'GET',
      status: 200,
      response: {
        id: 'game-id',
        name: 'My game',
      },
      delay: 500,
    },
  ],
};
