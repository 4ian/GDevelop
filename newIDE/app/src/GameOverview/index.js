// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import Grid from '@material-ui/core/Grid';
import { I18n } from '@lingui/react';
import { I18n as I18nType } from '@lingui/core';
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
  setGameSlug,
  getAclsFromUserIds,
  setGameUserAcls,
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
import PublicGamePropertiesDialog, {
  type PublicGameAndProjectEditableProperties,
} from '../GameDashboard/PublicGamePropertiesDialog';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { showErrorBox } from '../UI/Messages/MessageBox';

type Props = {|
  project?: ?gdProject,
  game: Game,
  analyticsSource: 'profile' | 'homepage' | 'projectManager',
  currentView: GameDetailsTab,
  setCurrentView: GameDetailsTab => void,
  onBack: () => void,
  onGameUpdated: (game: Game) => void,
|};

const GameOverview = ({
  project,
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
  const [isUpdatingGame, setIsUpdatingGame] = React.useState<boolean>(false);
  const { showAlert } = useAlertDialog();
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

  const onUpdateGameStandaloneProperties = React.useCallback(
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

  const onUpdateGame = async (
    i18n: I18nType,
    properties: PublicGameAndProjectEditableProperties
  ) => {
    if (!profile || !publicGame) return false;
    const { ownerIds, userSlug, gameSlug, authorIds } = properties;

    if (!ownerIds || !ownerIds.length) {
      await showAlert({
        title: t`Select an owner`,
        message: t`You must select at least one user to be the owner of the game.`,
      });
      return false;
    }

    if (!authorIds || !authorIds.length) {
      await showAlert({
        title: t`Select an author`,
        message: t`You must select at least one user to be the author of the game.`,
      });
      return false;
    }

    try {
      setIsUpdatingGame(true);
      const updatedGame = await updateGame(
        getAuthorizationHeader,
        profile.id,
        publicGame.id,
        {
          gameName: properties.gameName || 'Untitled game',
          authorName: properties.authorName || 'Unspecified publisher',
          categories: properties.categories,
          // TODO: Fetch most recent build id to publish it
          publicWebBuildId: properties.publicWebBuildId,
          description: properties.description,
          playWithKeyboard: properties.playWithKeyboard,
          playWithGamepad: properties.playWithGamepad,
          playWithMobile: properties.playWithMobile,
          orientation: properties.orientation,
          thumbnailUrl: properties.thumbnailUrl,
          screenshotUrls: properties.screenshotUrls,
          discoverable: properties.discoverable,
          acceptsBuildComments: properties.acceptsBuildComments,
          acceptsGameComments: properties.acceptsGameComments,
          // TODO: Make sure it works.
          displayAdsOnGamePage: properties.displayAdsOnGamePage,
        }
      );

      if (userSlug && gameSlug && userSlug === profile.username) {
        try {
          await setGameSlug(
            getAuthorizationHeader,
            profile.id,
            publicGame.id,
            userSlug,
            gameSlug
          );
        } catch (error) {
          console.error(
            'Unable to update the game slug:',
            error.response || error.message
          );
          showErrorBox({
            message:
              i18n._(
                t`Unable to update the game slug. A slug must be 6 to 30 characters long and only contains letters, digits or dashes.`
              ) +
              ' ' +
              i18n._(t`Verify your internet connection or try again later.`),
            rawError: error,
            errorId: 'game-slug-update-error',
          });
          return false;
        }
      }
      try {
        const authorAcls = getAclsFromUserIds(authorIds);
        const ownerAcls = getAclsFromUserIds(ownerIds);
        await setGameUserAcls(
          getAuthorizationHeader,
          profile.id,
          publicGame.id,
          {
            ownership: ownerAcls,
            author: authorAcls,
          }
        );
      } catch (error) {
        console.error(
          'Unable to update the game owners or authors:',
          error.response || error.message
        );
        showErrorBox({
          message:
            i18n._(
              t`Unable to update the game owners or authors. Have you removed yourself from the owners?`
            ) +
            ' ' +
            i18n._(t`Verify your internet connection or try again later.`),
          rawError: error,
          errorId: 'game-acls-update-error',
        });
        return false;
      }
      onGameUpdated(updatedGame);
    } catch (error) {
      console.error(
        'Unable to update the game:',
        error.response || error.message
      );
      showErrorBox({
        message:
          i18n._(t`Unable to update the game details.`) +
          ' ' +
          i18n._(t`Verify your internet connection or try again later.`),
        rawError: error,
        errorId: 'game-details-update-error',
      });
      return false;
    } finally {
      setIsUpdatingGame(false);
    }

    return true;
  };

  const updateProjectFromGameIfMatching = (
    properties: PublicGameAndProjectEditableProperties
  ) => {
    if (project && project.getProjectUuid() === game.id) {
      // Get this information from the game object that should have just been updated
      // (maybe with fallback values).
      const { gameName, categories, description } = game;
      // Get those properties from the object as they are not stored on the Game.
      const { authorIds, authorUsernames } = properties;

      project.setName(gameName);
      project.setDescription(description || '');
      project.setPlayableWithKeyboard(game.playWithKeyboard);
      project.setPlayableWithGamepad(game.playWithGamepad);
      project.setPlayableWithMobile(game.playWithMobile);
      project.setOrientation(game.orientation || 'default');
      if (categories) {
        const projectCategories = project.getCategories();
        projectCategories.clear();
        categories.forEach(category => projectCategories.push_back(category));
      }
      if (authorIds) {
        const projectAuthorIds = project.getAuthorIds();
        projectAuthorIds.clear();
        authorIds.forEach(authorId => projectAuthorIds.push_back(authorId));
      }
      if (authorUsernames) {
        const projectAuthorUsernames = project.getAuthorUsernames();
        projectAuthorUsernames.clear();
        authorUsernames.forEach(authorUsername =>
          projectAuthorUsernames.push_back(authorUsername)
        );
      }
    }
  };

  const fetchPublicGame = React.useCallback(
    async () => {
      try {
        const publicGame = await getPublicGame(game.id);
        setPublicGame(publicGame);
      } catch (err) {
        console.error(`Unable to load the public game:`, err);
      }
    },
    [game.id]
  );

  React.useEffect(
    () => {
      setPublicGame(null);
      fetchPublicGame();
    },
    [fetchPublicGame]
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
                    onUpdateGame={onUpdateGameStandaloneProperties}
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
          {gameDetailsDialogOpen && publicGame && (
            <PublicGamePropertiesDialog
              i18n={i18n}
              onClose={() => setGameDetailsDialogOpen(false)}
              publicGame={publicGame}
              isLoading={isUpdatingGame}
              onApply={async properties => {
                const isGameUpdated = await onUpdateGame(i18n, properties);
                if (isGameUpdated) {
                  updateProjectFromGameIfMatching(properties);
                }
              }}
              onGameUpdated={() => {
                fetchPublicGame();
              }}
              onUpdatingGame={setIsUpdatingGame}
            />
          )}
        </>
      )}
    </I18n>
  );
};

export default GameOverview;
