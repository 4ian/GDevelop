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
  gameRollingMetricsWithFewPlayers,
  gameRollingMetricsWithLowRetention,
  gameRollingMetricsReadyToGrow,
  completeWebBuild,
  basicFeaturingMarketingPlan,
  gameRollingMetricsWithoutPlayersAndRetention1,
} from '../../../fixtures/GDevelopServicesTestData';
import { GDevelopAnalyticsApi } from '../../../Utils/GDevelopServices/ApiConfigs';
import { client as analyticsApiClient } from '../../../Utils/GDevelopServices/Analytics';
import MockAdapter from 'axios-mock-adapter';
import {
  type GameMetrics,
  type GameVersionMetrics,
  type GameSourceMetrics,
} from '../../../Utils/GDevelopServices/Analytics';
import { type GameFeaturing } from '../../../Utils/GDevelopServices/Game';
import { type Build } from '../../../Utils/GDevelopServices/Build';

export default {
  title: 'GameDashboard/GameAnalytics',
  component: GameAnalyticsPanel,
  decorators: [paperDecorator],
};

export const ErrorLoadingAnalytics = (): React.Node => {
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient);
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

export const WithAnalyticsAndMarketingPlan = (): React.Node => {
  const mock = new MockAdapter(analyticsApiClient);
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
      <GameAnalyticsPanel
        game={game1}
        recommendedMarketingPlan={basicFeaturingMarketingPlan}
        gameFeaturings={[]}
        fetchGameFeaturings={async () => {}}
      />
    </AuthenticatedUserContext.Provider>
  );
};

const mockGameMetrics = (
  gameMetrics: Array<GameMetrics>,
  gameVersionMetrics: Array<GameVersionMetrics> = [],
  gameSourceMetrics: Array<GameSourceMetrics> = []
) => {
  const mock = new MockAdapter(analyticsApiClient);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameMetrics)
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-version-metrics`)
    .reply(200, gameVersionMetrics)
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-source-metrics`)
    .reply(200, gameSourceMetrics)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
};

const oneDayInMs = 24 * 60 * 60 * 1000;

const gameFeaturings: Array<GameFeaturing> = [
  {
    gameId: game1.id,
    featuring: 'games-platform-home',
    createdAt: (Date.now() - 16 * oneDayInMs) / 1000,
    updatedAt: (Date.now() - 16 * oneDayInMs) / 1000,
    expiresAt: (Date.now() - 9 * oneDayInMs) / 1000,
  },
];

const builds: Array<Build> = [
  {
    ...completeWebBuild,
    id: 'build-1',
    updatedAt: Date.now() - 22 * oneDayInMs,
  },
  {
    ...completeWebBuild,
    id: 'build-2',
    updatedAt: Date.now() - 4 * oneDayInMs,
  },
];

// The advice is about players leaving in the first minute.
export const WithMarketingBoostAndBuilds = (): React.Node => {
  mockGameMetrics(gameRollingMetricsFor364Days);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel
        game={game1}
        gameFeaturings={gameFeaturings}
        builds={builds}
      />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithVersionsAndSources = (): React.Node => {
  const getIsoDay = (daysCountBeforeToday: number) =>
    new Date(Date.now() - daysCountBeforeToday * oneDayInMs)
      .toISOString()
      .substring(0, 10);
  mockGameMetrics(
    gameRollingMetricsFor364Days,
    [
      {
        gameId: game1.id,
        date: getIsoDay(20),
        version: '1.0.0',
        d0Players: 900,
        d0SessionsDurationTotal: 900 * 150,
        d0PlayersBelow60s: 380,
      },
      {
        gameId: game1.id,
        date: getIsoDay(3),
        version: '1.0.0',
        d0Players: 120,
        d0SessionsDurationTotal: 120 * 140,
        d0PlayersBelow60s: 52,
      },
      {
        gameId: game1.id,
        date: getIsoDay(3),
        version: '1.1.0',
        d0Players: 640,
        d0SessionsDurationTotal: 640 * 260,
        d0PlayersBelow60s: 150,
      },
      {
        gameId: game1.id,
        date: getIsoDay(1),
        version: '1.2.0',
        d0Players: 12,
        d0SessionsDurationTotal: 12 * 300,
        d0PlayersBelow60s: 2,
      },
    ],
    [
      ...[
        ['android-app', 2400, 700],
        ['gd.games', 1300, 480],
        ['itch.io', 900, 190],
        ['poki.com', 640, 90],
        ['ios-app', 310, 80],
        ['desktop-app', 85, 9],
        ['my-own-website.com', 14, 6],
      ].map(([source, playersCount, bouncedPlayersCount]) => ({
        gameId: game1.id,
        date: getIsoDay(2),
        source,
        d0Players: playersCount,
        d0SessionsDurationTotal:
          playersCount * (source === 'poki.com' ? 420 : 200),
        d0PlayersBelow60s: bouncedPlayersCount,
      })),
    ]
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAdviceAboutRetention = (): React.Node => {
  mockGameMetrics(gameRollingMetricsWithLowRetention);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithAdviceToGrow = (): React.Node => {
  mockGameMetrics(gameRollingMetricsReadyToGrow);

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

// The players per platform are not returned by the backend yet.
export const WithoutPlatforms = (): React.Node => {
  mockGameMetrics(
    gameRollingMetricsFor364Days.map(gameMetrics => ({
      ...gameMetrics,
      platforms: null,
    }))
  );

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameAnalyticsPanel game={game1} />
    </AuthenticatedUserContext.Provider>
  );
};

export const WithFewPlayers = (): React.Node => {
  const mock = new MockAdapter(analyticsApiClient);
  mock
    .onGet(`${GDevelopAnalyticsApi.baseUrl}/game-metrics`)
    .reply(200, gameRollingMetricsWithFewPlayers)
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
  const mock = new MockAdapter(analyticsApiClient);
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
  const mock = new MockAdapter(analyticsApiClient, { delayResponse: 2000 });
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
