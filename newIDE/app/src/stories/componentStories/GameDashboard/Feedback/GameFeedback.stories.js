// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';

import GameFeedback from '../../../../GameDashboard/Feedbacks/GameFeedback';

import {
  commentProcessed,
  commentUnprocessed,
  completeWebBuild,
  fakeSilverAuthenticatedUser,
  game1,
} from '../../../../fixtures/GDevelopServicesTestData';
import MockAdapter from 'axios-mock-adapter';
import Axios from 'axios';
import {
  GDevelopBuildApi,
  GDevelopPlayApi,
} from '../../../../Utils/GDevelopServices/ApiConfigs';
import { getPaperDecorator } from '../../../PaperDecorator';

export default {
  title: 'GameDashboard/Feedback/GameFeedback',
  component: GameFeedback,
  decorators: [getPaperDecorator('medium')],
};

export const DefaultGameFeedback = () => {
  const mock = new MockAdapter(Axios);
  mock
    .onGet(`${GDevelopPlayApi.baseUrl}/game/${game1.id}/comment`)
    .reply(200, [commentProcessed, commentUnprocessed])
    .onGet(`${GDevelopBuildApi.baseUrl}/build`)
    .reply(200, [completeWebBuild])
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
          authenticatedUser={fakeSilverAuthenticatedUser}
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
    .reply(200, [commentProcessed])
    .onGet(`${GDevelopBuildApi.baseUrl}/build`)
    .reply(200, [completeWebBuild])
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
          authenticatedUser={fakeSilverAuthenticatedUser}
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
    .onGet(`${GDevelopBuildApi.baseUrl}/build`)
    .reply(200, [completeWebBuild])
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
          authenticatedUser={fakeSilverAuthenticatedUser}
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
    .onGet(`${GDevelopBuildApi.baseUrl}/build`)
    .reply(200, [completeWebBuild])
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
          authenticatedUser={fakeSilverAuthenticatedUser}
          game={game1}
        />
      )}
    </I18n>
  );
};
