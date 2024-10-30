// @flow

import * as React from 'react';
import { random } from 'lodash';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import GameOverview from '../../../GameOverview';

import {
  game1,
  commentUnprocessed,
  commentUnprocessed2,
  commentWithNoTextUnprocessed,
  commentProcessed,
  fakeSilverAuthenticatedUser,
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
  userEarningsBalance,
} from '../../../fixtures/GDevelopServicesTestData';
import { client as playApiAxiosClient } from '../../../Utils/GDevelopServices/Play';
import { client as buildApiAxiosClient } from '../../../Utils/GDevelopServices/Build';
import { client as analyticsApiAxiosClient } from '../../../Utils/GDevelopServices/Analytics';
import { apiClient as usageApiAxiosClient } from '../../../Utils/GDevelopServices/Usage';

import type { GameDetailsTab } from '../../../GameDashboard/GameDetails';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  mockedLeaderboards,
  mockedEntries,
} from '../../MockLeaderboardProvider';

export default {
  title: 'GameDashboard/GameOverview',
  component: GameOverview,
  decorators: [paperDecorator],
  argTypes: {
    analyticsSource: { control: { type: false } }, // Hide default control.
    game: { control: { type: false } }, // Hide default control.
    feedbacks: {
      options: ['None', 'Some unprocessed', 'All processed'],
      control: { type: 'radio' },
    },
    sessions: {
      options: ['None', 'Some in the last week'],
      control: { type: 'radio' },
    },
    userBalance: {
      options: ['None', 'Some'],
      control: { type: 'radio' },
    },
    leaderboards: {
      options: ['None', 'Some'],
      control: { type: 'radio' },
    },
  },
  args: {
    feedbacks: 'Some unprocessed',
    sessions: 'Some in the last week',
    userBalance: 'Some',
    leaderboards: 'Some',
  },
};

const delayResponse = 400;

const playServiceMock = new MockAdapter(playApiAxiosClient, {
  delayResponse,
});
const buildServiceMock = new MockAdapter(buildApiAxiosClient, {
  delayResponse,
});
const analyticsServiceMock = new MockAdapter(analyticsApiAxiosClient, {
  delayResponse,
});
const usageServiceMock = new MockAdapter(usageApiAxiosClient, {
  delayResponse,
});

const sessionDurations = [60, 180, 300, 600, 900];

const fakeGameMetrics = new Array(7).fill(0).map((_, index) => {
  const date = new Date(Date.now() - (7 - index) * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const sessions = Math.round(Math.random() * 50); // between 0 and 50 sessions.
  const duration = Math.random() * 300 + 20; // Between 20 and 320 seconds per session.
  const playersPercentage = (90 + (Math.random() - 0.5) * 5) / 100; // There are slightly less players than sessions (around 85%-95% of sessions).
  const players = Math.round(sessions * playersPercentage);
  const newPlayers = random(0, players); // A random number of players are new players.

  let remainingPlayers = players;
  const sessionsDurations = sessionDurations.map((duration, index) => {
    if (index === sessionDurations.length - 1) return remainingPlayers;
    const playersForThatDuration = random(0, remainingPlayers);
    remainingPlayers = remainingPlayers - playersForThatDuration;
    return playersForThatDuration;
  });
  return {
    gameId: game1.id,
    date,
    sessions: {
      d0Sessions: sessions,
      d0SessionsDurationTotal: duration,
    },
    players: {
      d0Players: players,
      d0NewPlayers: newPlayers,
      d0PlayersBelow60s: sessionsDurations[0],
      d0PlayersBelow180s: sessionsDurations[1],
      d0PlayersBelow300s: sessionsDurations[2],
      d0PlayersBelow600s: sessionsDurations[3],
      d0PlayersBelow900s: sessionsDurations[4],
    },
    retention: null,
  };
});

export const Default = ({
  feedbacks,
  sessions,
  userBalance,
  leaderboards,
}: {|
  feedbacks: 'None' | 'Some unprocessed' | 'All processed',
  sessions: 'None' | 'Some in the last week',
  userBalance: 'None' | 'Some',
  leaderboards: 'None' | 'Some',
|}) => {
  const [tab, setTab] = React.useState<GameDetailsTab>('details');
  const [renderCount, setRenderCount] = React.useState<number>(0);
  const feedbacksToDisplay =
    feedbacks === 'None'
      ? []
      : feedbacks === 'Some unprocessed'
      ? [
          commentProcessed,
          commentUnprocessed,
          commentWithNoTextUnprocessed,
          commentUnprocessed2,
        ]
      : [commentProcessed];
  const gameMetrics = sessions === 'None' ? [] : fakeGameMetrics;
  const userEarningsBalanceToDisplay =
    userBalance === 'None'
      ? [
          {
            amountInMilliUSDs: 0,
            amountInCredits: 0,
            minAmountToCashoutInMilliUSDs: 60000,
            userId: fakeSilverAuthenticatedUser.profile
              ? fakeSilverAuthenticatedUser.profile.id
              : '',
            updatedAt: Date.now(),
          },
        ]
      : [userEarningsBalance];
  const leaderboardsToDisplay =
    leaderboards === 'None' ? [] : mockedLeaderboards;

  React.useEffect(
    () => {
      setRenderCount(value => value + 1);
    },
    [feedbacks, sessions, userBalance, leaderboards]
  );

  playServiceMock
    .onGet(`/game/${game1.id}/comment`)
    .reply(200, feedbacksToDisplay)
    .onGet(`/game/${game1.id}/lobby-configuration`)
    .reply(200, {
      gameId: game1.id,
      maxPlayers: 6,
      minPlayers: 2,
      canJoinAfterStart: true,
    })
    .onGet(`/game/${game1.id}/leaderboard`)
    .reply(200, leaderboardsToDisplay)
    .onGet(new RegExp(`/game/${game1.id}/leaderboard/[a-zA-Z0-9-]+/entry`))
    .reply(200, mockedEntries, {})
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  buildServiceMock
    .onGet(`/build`)
    .reply(200, [completeCordovaBuild, completeElectronBuild, completeWebBuild])
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  analyticsServiceMock
    .onGet(`/game-metrics`)
    .reply(200, gameMetrics)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  usageServiceMock
    .onGet(`/user-earnings-balance`)
    .reply(200, userEarningsBalanceToDisplay)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });

  return (
    <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
      <GameOverview
        game={game1}
        analyticsSource="homepage"
        key={renderCount.toFixed(0)}
        currentView={tab}
        setCurrentView={setTab}
        onBack={() => action('Back')}
        onGameUpdated={() => action('onGameUpdated')}
      />
    </AuthenticatedUserContext.Provider>
  );
};
