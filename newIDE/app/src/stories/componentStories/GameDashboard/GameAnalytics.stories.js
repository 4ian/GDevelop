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

export const ErrorLoadingAnalytics = () => {
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

export const MissingAnalytics = () => {
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

export const WithPartialAnalytics = () => {
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

export const WithAnalytics = () => {
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

export const WithAnalyticsWithMissingNewMetrics = () => {
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

export const WithAnalyticsOnlyFor19Days = () => {
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

export const WithAnalyticsWithHoles = () => {
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

export const WithAnalyticsOnlyFor1Day = () => {
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

export const WithAnalyticsLongLoading = () => {
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
