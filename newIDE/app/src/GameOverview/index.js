// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Grid from '@material-ui/core/Grid';
import { I18n } from '@lingui/react';
import {
  getRecommendedMarketingPlan,
  listGameFeaturings,
  type Game,
  type PublicGame,
  type GameFeaturing,
  type MarketingPlan,
  type GameUpdatePayload,
  updateGame,
  getGameUrl,
  getPublicGame,
} from '../Utils/GDevelopServices/Game';
import { ColumnStackLayout } from '../UI/Layout';
import GameHeader from './GameHeader';
import FeedbackWidget from './FeedbackWidget';
import {
  getLobbyConfiguration,
  listComments,
  listGameActiveLeaderboards,
  type Comment,
  type Leaderboard,
  type LobbyConfiguration,
} from '../Utils/GDevelopServices/Play';
import { getBuilds, type Build } from '../Utils/GDevelopServices/Build';
import {
  getGameMetricsFrom,
  type GameMetrics,
} from '../Utils/GDevelopServices/Analytics';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import AnalyticsWidget from './AnalyticsWidget';
import ServicesWidget from './ServicesWidget';
import type { GameDetailsTab } from '../GameDashboard/GameDetails';
import { Column, Line } from '../UI/Grid';
import TextButton from '../UI/TextButton';
import ArrowLeft from '../UI/CustomSvgIcons/ArrowLeft';
import GameFeedback from '../GameDashboard/Feedbacks/GameFeedback';
import Builds from '../ExportAndShare/Builds';
import { GameAnalyticsPanel } from '../GameDashboard/GameAnalyticsPanel';
import LeaderboardAdmin from '../GameDashboard/LeaderboardAdmin';
import MultiplayerAdmin from '../GameDashboard/MultiplayerAdmin';
import BuildsWidget from './BuildsWidget';

type Props = {|
  game: Game,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
  currentView: GameDetailsTab,
  setCurrentView: GameDetailsTab => void,
  onBack: () => void,
  onGameUpdated: (game: Game) => void,
|};

const GameOverview = ({
  game,
  currentView,
  setCurrentView,
  onBack,
  onGameUpdated,
}: Props) => {
  const [
    gameDetailsDialogOpen,
    setGameDetailsDialogOpen,
  ] = React.useState<boolean>(false);

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { getAuthorizationHeader, profile } = authenticatedUser;
  const [feedbacks, setFeedbacks] = React.useState<?Array<Comment>>(null);
  const [builds, setBuilds] = React.useState<?Array<Build>>(null);
  const [publicGame, setPublicGame] = React.useState<?PublicGame>(null);
  const [gameRollingMetrics, setGameMetrics] = React.useState<?(GameMetrics[])>(
    null
  );
  const [
    recommendedMarketingPlan,
    setRecommendedMarketingPlan,
  ] = React.useState<?MarketingPlan>(null);
  const [
    gameFeaturings,
    setGameFeaturings,
  ] = React.useState<?(GameFeaturing[])>(null);
  const [leaderboards, setLeaderboards] = React.useState<?Array<Leaderboard>>(
    null
  );
  const [
    lobbyConfiguration,
    setLobbyConfiguration,
  ] = React.useState<?LobbyConfiguration>(null);
  const oneWeekAgo = React.useRef<Date>(
    new Date(new Date().setHours(0, 0, 0, 0) - 7 * 24 * 3600 * 1000)
  );

  const isPublishedOnGdGames = !!game.publicWebBuildId;
  const gameUrl = isPublishedOnGdGames ? getGameUrl(game) : null;

  const fetchGameFeaturings = React.useCallback(
    async () => {
      if (!profile) return;
      try {
        const gameFeaturings = await listGameFeaturings(
          getAuthorizationHeader,
          {
            gameId: game.id,
            userId: profile.id,
          }
        );
        setGameFeaturings(gameFeaturings);
      } catch (error) {
        console.error(
          'An error occurred while fetching game featurings.',
          error
        );
      }
    },
    [game, getAuthorizationHeader, profile]
  );

  const onUpdateGame = React.useCallback(
    async (payload: GameUpdatePayload) => {
      if (!profile) return;
      const updatedGame = await updateGame(
        getAuthorizationHeader,
        profile.id,
        game.id,
        payload
      );
      onGameUpdated(updatedGame);
    },
    [getAuthorizationHeader, profile, game.id, onGameUpdated]
  );

  React.useEffect(
    () => {
      const fetchPublicData = async () => {
        setPublicGame(null);
        try {
          const publicGame = await getPublicGame(game.id);
          setPublicGame(publicGame);
        } catch (err) {
          console.error(`Unable to load the public game:`, err);
        }
      };
      fetchPublicData();
    },
    [game.id]
  );

  React.useEffect(
    () => {
      if (!profile) {
        setFeedbacks(null);
        setBuilds(null);
        setGameMetrics(null);
        setLobbyConfiguration(null);
        setLeaderboards(null);
        setGameFeaturings(null);
        setRecommendedMarketingPlan(null);
        return;
      }

      const fetchAuthenticatedData = async () => {
        const [
          feedbacks,
          builds,
          gameRollingMetrics,
          lobbyConfiguration,
          leaderboards,
          recommendedMarketingPlan,
        ] = await Promise.all([
          listComments(getAuthorizationHeader, profile.id, {
            gameId: game.id,
            type: 'FEEDBACK',
          }),
          getBuilds(getAuthorizationHeader, profile.id, game.id),
          getGameMetricsFrom(
            getAuthorizationHeader,
            profile.id,
            game.id,
            oneWeekAgo.current.toISOString()
          ),
          getLobbyConfiguration(getAuthorizationHeader, profile.id, {
            gameId: game.id,
          }),
          listGameActiveLeaderboards(
            getAuthorizationHeader,
            profile.id,
            game.id
          ),
          getRecommendedMarketingPlan(getAuthorizationHeader, {
            gameId: game.id,
            userId: profile.id,
          }),
          fetchGameFeaturings(),
        ]);
        setFeedbacks(feedbacks);
        setBuilds(builds);
        setGameMetrics(gameRollingMetrics);
        setLobbyConfiguration(lobbyConfiguration);
        setLeaderboards(leaderboards);
        setRecommendedMarketingPlan(recommendedMarketingPlan);
      };

      fetchAuthenticatedData();
    },
    [getAuthorizationHeader, profile, fetchGameFeaturings, game.id]
  );

  const onClickBack = React.useCallback(
    () => {
      if (currentView === 'details') {
        onBack();
      } else {
        setCurrentView('details');
      }
    },
    [currentView, onBack, setCurrentView]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <Column noMargin expand>
            <Line>
              <TextButton
                onClick={onClickBack}
                icon={<ArrowLeft fontSize="small" />}
                label={
                  currentView === 'details' ? (
                    <Trans>Back</Trans>
                  ) : (
                    <Trans>Back to {game.gameName}</Trans>
                  )
                }
              />
            </Line>
            {currentView === 'feedback' ? (
              <GameFeedback
                authenticatedUser={authenticatedUser}
                game={game}
                i18n={i18n}
              />
            ) : currentView === 'builds' ? (
              <Builds
                game={game}
                authenticatedUser={authenticatedUser}
                onGameUpdated={onGameUpdated}
              />
            ) : currentView === 'analytics' ? (
              <GameAnalyticsPanel
                game={game}
                gameMetrics={gameRollingMetrics}
                gameFeaturings={gameFeaturings}
                fetchGameFeaturings={fetchGameFeaturings}
                recommendedMarketingPlan={recommendedMarketingPlan}
              />
            ) : currentView === 'leaderboards' ? (
              <LeaderboardAdmin gameId={game.id} onLoading={() => {}} />
            ) : currentView === 'multiplayer' ? (
              <MultiplayerAdmin gameId={game.id} />
            ) : (
              <ColumnStackLayout noMargin>
                <GameHeader
                  game={game}
                  onEditGame={() => setGameDetailsDialogOpen(true)}
                  gameUrl={gameUrl}
                />
                <Grid container spacing={2}>
                  <AnalyticsWidget
                    onSeeAll={() => setCurrentView('analytics')}
                    gameMetrics={gameRollingMetrics}
                    game={game}
                    gameUrl={gameUrl}
                  />
                  <FeedbackWidget
                    onSeeAll={() => setCurrentView('feedback')}
                    feedbacks={feedbacks}
                    game={game}
                    onUpdateGame={onUpdateGame}
                    gameUrl={gameUrl}
                  />
                  <ServicesWidget
                    onSeeAllLeaderboards={() => setCurrentView('leaderboards')}
                    onSeeLobbyConfiguration={() =>
                      setCurrentView('multiplayer')
                    }
                    leaderboards={leaderboards}
                    lobbyConfiguration={lobbyConfiguration}
                  />
                  <BuildsWidget
                    builds={builds}
                    onSeeAllBuilds={() => setCurrentView('builds')}
                  />
                </Grid>
              </ColumnStackLayout>
            )}
          </Column>
          {/* TODO: To do once the thumbnail logic is done. */}
          {/* {gameDetailsDialogOpen && (
            <div>Bonjour</div>
          )} */}
        </>
      )}
    </I18n>
  );
};

export default GameOverview;
