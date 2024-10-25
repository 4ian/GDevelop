// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import GameDashboardV2 from '../../../GameDashboardV2';

import {
  game1,
  commentUnprocessed,
  commentUnprocessed2,
  commentWithNoTextUnprocessed,
  commentProcessed,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';
import { client as playApiAxiosClient } from '../../../Utils/GDevelopServices/Play';

import MockAdapter from 'axios-mock-adapter';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

export default {
  title: 'GameDashboard/GameDashboardV2',
  component: GameDashboardV2,
  decorators: [paperDecorator],
};

const delayResponse = 400;

const playServiceMock = new MockAdapter(playApiAxiosClient, {
  delayResponse,
});

export const Default = () => {
  playServiceMock
    .onGet(`/game/${game1.id}/comment`)
    .reply(200, [
      commentProcessed,
      commentUnprocessed,
      commentWithNoTextUnprocessed,
      commentUnprocessed2,
    ])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameDashboardV2 game={game1} analyticsSource="homepage" />
    </AuthenticatedUserContext.Provider>
  );
};
