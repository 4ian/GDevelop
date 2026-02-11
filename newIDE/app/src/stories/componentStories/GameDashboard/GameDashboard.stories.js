// @flow

import * as React from 'react';
import { random } from 'lodash';
import MockAdapter from 'axios-mock-adapter';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import GameDashboard from '../../../GameDashboard';
import CloudStorageProvider from '../../../ProjectsStorage/CloudStorageProvider';
import { type AuthenticatedUser } from '../../../Profile/AuthenticatedUserContext';
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
  pendingCordovaBuild,
  userEarningsBalance,
  userEarningsBalanceEmpty,
  basicFeaturingMarketingPlan,
  getPublicGameFromGame,
  allGameCategoriesMocked,
} from '../../../fixtures/GDevelopServicesTestData';
import { client as playApiAxiosClient } from '../../../Utils/GDevelopServices/Play';
import { client as buildApiAxiosClient } from '../../../Utils/GDevelopServices/Build';
import { client as analyticsApiAxiosClient } from '../../../Utils/GDevelopServices/Analytics';
import {
  client as gameApiAxiosClient,
  type Game,
} from '../../../Utils/GDevelopServices/Game';

import type { GameDetailsTab } from '../../../GameDashboard';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import {
  mockedLeaderboards,
  mockedEntries,
} from '../../MockLeaderboardProvider';
import { MarketingPlansStoreStateProvider } from '../../../MarketingPlans/MarketingPlansStoreContext';

export default {
  title: 'GameDashboard/GameDashboard',
  component: GameDashboard,
  decorators: [paperDecorator],
  argTypes: {
    game: { control: { type: false } }, // Hide default control.
    gameState: {
      options: ['Published', 'Not published'],
      control: { type: 'radio' },
    },
    isAcceptingFeedback: {
      options: ['No', 'Yes'],
      control: { type: 'radio' },
    },
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
      options: ['None', 'Some', 'Too many'],
      control: { type: 'radio' },
    },
    exports: {
      options: ['None', 'Some ongoing', 'All complete'],
      control: { type: 'radio' },
    },
  },
  args: {
    gameState: 'Published',
    isAcceptingFeedback: 'Yes',
    feedbacks: 'Some unprocessed',
    sessions: 'Some in the last week',
    userBalance: 'Some',
    leaderboards: 'Some',
    exports: 'All complete',
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
const gameServiceMock = new MockAdapter(gameApiAxiosClient, {
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
  gameState,
  isAcceptingFeedback,
  feedbacks,
  sessions,
  userBalance,
  leaderboards,
  exports,
}: {|
  gameState: 'Published' | 'Not published',
  isAcceptingFeedback: 'Yes' | 'No',
  feedbacks: 'None' | 'Some unprocessed' | 'All processed',
  sessions: 'None' | 'Some in the last week',
  userBalance: 'None' | 'Some',
  leaderboards: 'None' | 'Some' | 'Too many',
  exports: 'None' | 'Some ongoing' | 'All complete',
|}) => {
  const [game, setGame] = React.useState<Game>(game1);
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
    userBalance === 'None' ? userEarningsBalanceEmpty : userEarningsBalance;
  const leaderboardsToDisplay =
    leaderboards === 'None' ? [] : mockedLeaderboards;
  const buildsToDisplay =
    exports === 'None'
      ? []
      : exports === 'All complete'
      ? [completeCordovaBuild, completeElectronBuild, completeWebBuild]
      : [completeCordovaBuild, completeElectronBuild, pendingCordovaBuild];

  const publicGame = getPublicGameFromGame(game);

  React.useEffect(
    () => {
      setRenderCount(value => value + 1);
    },
    [feedbacks, sessions, userBalance, leaderboards, exports, gameState]
  );

  React.useEffect(
    () => {
      setGame(game => {
        return {
          ...game,
          publicWebBuildId:
            gameState === 'Published' ? game1.publicWebBuildId : null,
          acceptsGameComments: isAcceptingFeedback === 'Yes',
        };
      });
    },
    [isAcceptingFeedback, gameState]
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
    .reply(200, buildsToDisplay)
    .onAny()
    .reply(config => {
      console.error(`Unexpected call to ${config.url} (${config.method})`);
      return [504, null];
    });
  gameServiceMock
    .onGet(`/marketing-plan`)
    .reply(200, [basicFeaturingMarketingPlan])
    .onGet(`/game-featuring`)
    .reply(200, [])
    .onGet(`/game-category`)
    .reply(200, allGameCategoriesMocked)
    .onGet(`/public-game/${game1.id}`)
    .reply(200, publicGame)
    .onPatch(`/game/${game1.id}`, {
      asymmetricMatch: function(data) {
        if (data.publicWebBuildId) {
          action(`Published with build id ${data.publicWebBuildId}`)();
        }
        setGame({
          ...game,
          acceptsGameComments: data.acceptsGameComments === true,
          publicWebBuildId: data.publicWebBuildId
            ? data.publicWebBuildId
            : game.publicWebBuildId,
          displayAdsOnGamePage: data.displayAdsOnGamePage
            ? data.displayAdsOnGamePage
            : game.displayAdsOnGamePage,
        });
        return true;
      },
    })
    .reply(200)
    .onPost(`/game/action/set-slug`, {
      asymmetricMatch: function(data) {
        action('setSlug')(data);
        return true;
      },
    })
    .reply(200)
    .onPost(`/game/action/set-acls`, {
      asymmetricMatch: function(data) {
        action('setAcls')(data);
        return true;
      },
    })
    .reply(200)
    .onAny()
    .reply(config => {
      console.error(
        `Unexpected call to ${config.url} (${config.method} with body ${
          config.data
        })`
      );
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

  const authenticatedUser: AuthenticatedUser = {
    ...fakeSilverAuthenticatedUser,
    userEarningsBalance: userEarningsBalanceToDisplay,
    // $FlowIgnore - We know those fields are filled.
    limits: {
      ...fakeSilverAuthenticatedUser.limits,
      capabilities: {
        // $FlowIgnore - We know those fields are filled.
        ...fakeSilverAuthenticatedUser.limits.capabilities,
        leaderboards: {
          // $FlowIgnore - We know those fields are filled.
          ...fakeSilverAuthenticatedUser.limits.capabilities.leaderboards,
          maximumCountPerGame: leaderboards === 'Too many' ? 3 : -1,
        },
      },
    },
  };

  return (
    <AuthenticatedUserContext.Provider value={authenticatedUser}>
      <MarketingPlansStoreStateProvider>
        <GameDashboard
          currentFileMetadata={null}
          onOpenProject={action('onOpenProject')}
          storageProviders={[CloudStorageProvider]}
          game={game}
          key={renderCount.toFixed(0)}
          currentView={tab}
          setCurrentView={setTab}
          onBack={() => action('Back')}
          onGameUpdated={() => action('onGameUpdated')}
          onUnregisterGame={() => action('onUnregisterGame')}
          closeProject={action('closeProject')}
          disabled={false}
          onDeleteCloudProject={action('onDeleteCloudProject')}
        />
      </MarketingPlansStoreStateProvider>
    </AuthenticatedUserContext.Provider>
  );
};
