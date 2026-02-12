// @flow

import * as React from 'react';

import paperDecorator from '../../PaperDecorator';
import { GameAnalyticsPanel } from '../../../GameDashboard/GameAnalyticsPanel';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';

import {
  fakeSilverAuthenticatedUser,
  game1,
  gameRollingMetricsFor364Days,
  gameRollingMetricsWithUndefinedDurationMetrics,
  gameRollingMetricsWithOnly19Days,
  gameRollingMetricsWithOnly1Day,
  gameRollingMetricsWithHoles,
  gameRollingMetricsWithoutPlayersAndRetention1,
} from '../../../fixtures/GDevelopServicesTestData';
import { GDevelopAnalyticsApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export default {
  title: 'GameDashboard/GameAnalytics',
  component: GameAnalyticsPanel,
  decorators: [paperDecorator],
};

export const ErrorLoadingAnalytics = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(500)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const MissingAnalytics = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(404)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithPartialAnalytics = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithoutPlayersAndRetention1)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalytics = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsFor364Days)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalyticsWithMissingNewMetrics = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithUndefinedDurationMetrics)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalyticsOnlyFor19Days = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithOnly19Days)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalyticsWithHoles = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithHoles)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalyticsOnlyFor1Day = (): React.Node => {
  const mock = new MockAdapter(axios);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithOnly1Day)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAnalyticsLongLoading = (): React.Node => {
  const mock = new MockAdapter(axios, { delayResponse: 2000 });
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsFor364Days)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};
