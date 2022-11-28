// @flow

import * as React from 'react';

import muiDecorator from '../../ThemeDecorator';

import paperDecorator from '../../PaperDecorator';
import {
  fakeIndieAuthenticatedUser,
  game1,
  game2,
} from '../../../fixtures/GDevelopServicesTestData';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { GDevelopGameApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { GamesList } from '../../../GameDashboard/GamesList';

export default {
  title: 'GameDashboard/GamesList',
  component: GamesList,
  decorators: [paperDecorator, muiDecorator],
};

export const WithoutAProjectOpened = () => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopGameApi.baseUrl}/game`)
    .reply(200, [game1, game2])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <GamesList
        project={null}
        initialGameId={null}
        initialTab={null}
        onGameDetailsDialogClose={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithoutAProjectOpenedLongLoading = () => {
  const mock = new MockAdapter(axios, { delayResponse: 2500 });
  mock
    .onGet(`${GDevelopGameApi.baseUrl}/game`)
    .reply(200, [game1, game2])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <GamesList
        project={null}
        initialGameId={null}
        initialTab={null}
        onGameDetailsDialogClose={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnError = () => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopGameApi.baseUrl}/game`)
    .reply(500)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <AuthenticatedUserContext.Provider value={fakeIndieAuthenticatedUser}>
      <GamesList
        project={null}
        initialGameId={null}
        initialTab={null}
        onGameDetailsDialogClose={() => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};
