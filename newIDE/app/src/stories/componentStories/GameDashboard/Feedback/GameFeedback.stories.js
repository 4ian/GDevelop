// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import GameFeedback from '../../../../GameDashboard/Feedbacks/GameFeedback';

import {
  commentSolved,
  commentUnsolved,
  fakeIndieAuthenticatedUser,
  game1,
} from '../../../../fixtures/GDevelopServicesTestData';
import MockAdapter from 'axios-mock-adapter';
import Axios from 'axios';
import { GDevelopPlayApi } from '../../../../Utils/GDevelopServices/ApiConfigs';

export default {
  title: 'GameDashboard/Feedback/GameFeedback',
  component: GameFeedback,
  decorators: [muiDecorator, paperDecorator],
};

export const DefaultGameFeedback = () => {
  const mock = new MockAdapter(Axios);
  mock
    .onGet(`${GDevelopPlayApi.baseUrl}/game/${game1.id}/comment`)
    .reply(200, [commentSolved, commentUnsolved])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <I18n>
      {({ i18n }) => (
        <GameFeedback
          i18n={i18n}
          authenticatedUser={fakeIndieAuthenticatedUser}
          game={game1}
        />
      )}
    </I18n>
  );
};

export const GameFeedbackOneSolvedComment = () => {
  const mock = new MockAdapter(Axios);
  mock
    .onGet(`${GDevelopPlayApi.baseUrl}/game/${game1.id}/comment`)
    .reply(200, [commentSolved])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <I18n>
      {({ i18n }) => (
        <GameFeedback
          i18n={i18n}
          authenticatedUser={fakeIndieAuthenticatedUser}
          game={game1}
        />
      )}
    </I18n>
  );
};

export const GameFeedbackWithError = () => {
  const mock = new MockAdapter(Axios);
  mock
    .onGet(`${GDevelopPlayApi.baseUrl}/game/${game1.id}/comment`)
    .reply(500, 'Internal server error')
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <I18n>
      {({ i18n }) => (
        <GameFeedback
          i18n={i18n}
          authenticatedUser={fakeIndieAuthenticatedUser}
          game={game1}
        />
      )}
    </I18n>
  );
};

export const GameFeedbackEmpty = () => {
  const mock = new MockAdapter(Axios);
  mock
    .onGet(`${GDevelopPlayApi.baseUrl}/game/${game1.id}/comment`)
    .reply(200, [])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  return (
    <I18n>
      {({ i18n }) => (
        <GameFeedback
          i18n={i18n}
          authenticatedUser={fakeIndieAuthenticatedUser}
          game={game1}
        />
      )}
    </I18n>
  );
};
