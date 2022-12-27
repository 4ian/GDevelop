// @flow
import { t, Trans } from '@lingui/macro';
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import {
  type Game,
  getGames,
  registerGame,
} from '../Utils/GDevelopServices/Game';
import { GameCard } from './GameCard';
import { ColumnStackLayout } from '../UI/Layout';
import { GameRegistration } from './GameRegistration';
import { GameDetailsDialog, type GameDetailsTab } from './GameDetailsDialog';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import RouterContext from '../MainFrame/RouterContext';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';

type Props = {|
  project: ?gdProject,
|};

export const GamesList = ({ project }: Props) => {
  const {
    routeArguments,
    addRouteArguments,
    removeRouteArguments,
  } = React.useContext(RouterContext);
  const [error, setError] = React.useState<?Error>(null);
  const [games, setGames] = React.useState<?Array<Game>>(null);
  const {
    authenticated,
    firebaseUser,
    getAuthorizationHeader,
    profile,
  } = React.useContext(AuthenticatedUserContext);
  const [openedGame, setOpenedGame] = React.useState<?Game>(null);
  const { showAlert, showConfirmation } = useAlertDialog();
  const [isGameRegistering, setIsGameRegistering] = React.useState(false);

  const loadGames = React.useCallback(
    async () => {
      if (!authenticated || !firebaseUser) return;

      try {
        setError(null);
        const games = await getGames(getAuthorizationHeader, firebaseUser.uid);
        setGames(games);
      } catch (error) {
        console.error('Error while loading user games.', error);
        setError(error);
      }
    },
    [authenticated, firebaseUser, getAuthorizationHeader]
  );

  const onRegisterGame = React.useCallback(
    async () => {
      if (!profile || !project) return;

      const { id } = profile;
      try {
        setIsGameRegistering(true);
        await registerGame(getAuthorizationHeader, id, {
          gameId: project.getProjectUuid(),
          authorName: project.getAuthor() || 'Unspecified publisher',
          gameName: project.getName() || 'Untitled game',
          templateSlug: project.getTemplateSlug(),
        });
        await loadGames();
      } catch (error) {
        console.error('Unable to register the game.', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          await showAlert({
            title: t`Game already registered`,
            message: t`The project currently opened is registered online but you don't have
          access to it. Ask the original owner of the game to share it with you
          to be able to manage it.`,
          });
        } else {
          await showAlert({
            title: t`Unable to register the game`,
            message: t`An error happened while registering the game. Verify your internet connection
          or retry later.`,
          });
        }
      } finally {
        setIsGameRegistering(false);
      }
    },
    [getAuthorizationHeader, profile, project, showAlert, loadGames]
  );

  React.useEffect(
    () => {
      const loadInitialGame = async () => {
        // When games are loaded and we have an initial game id, try to open it.
        const initialGameId = routeArguments['game-id'];
        if (games && initialGameId) {
          const game = games.find(game => game.id === initialGameId);
          removeRouteArguments(['game-id']);
          if (game) {
            setOpenedGame(game);
          } else {
            // If the game is not in the list, then either
            // - allow to register it, if it's the current project.
            // - suggest to open the file before continuing, if it's not the current project.
            if (project && project.getProjectUuid() === initialGameId) {
              const answer = await showConfirmation({
                title: t`Game not found`,
                message: t`This project is not registered online. Register it now
              to get access to leaderboards, player accounts, analytics and more!`,
                confirmButtonLabel: t`Register`,
              });
              if (!answer) return;

              await onRegisterGame();
            } else {
              await showAlert({
                title: t`Game not found`,
                message: t`The game you're trying to open is not registered online. Open the project
              file, then register it before continuing.`,
              });
            }
          }
        }
      };
      loadInitialGame();
    },
    [
      games,
      routeArguments,
      removeRouteArguments,
      onRegisterGame,
      showConfirmation,
      showAlert,
      project,
    ]
  );

  React.useEffect(
    () => {
      loadGames();
    },
    [loadGames]
  );

  if (!authenticated) {
    return null;
  }

  if (!games && error) {
    return (
      <PlaceholderError
        onRetry={() => {
          loadGames();
        }}
      >
        <Trans>
          Can't load the games. Verify your internet connection or retry later.
        </Trans>
      </PlaceholderError>
    );
  }

  if (!games) {
    return <PlaceholderLoader />;
  }

  const projectUuid = project ? project.getProjectUuid() : null;
  const thisGame = games.find(game => !!projectUuid && game.id === projectUuid);
  const displayedGames = [
    thisGame,
    ...games.filter(game => game !== thisGame),
  ].filter(Boolean);

  return (
    <ColumnStackLayout noMargin>
      {!isGameRegistering && (
        <GameRegistration
          project={project}
          hideLoader
          onGameRegistered={loadGames}
        />
      )}
      {displayedGames.map(game => (
        <GameCard
          key={game.id}
          isCurrentGame={!!projectUuid && game.id === projectUuid}
          game={game}
          onOpenGameManager={(tab: GameDetailsTab) => {
            addRouteArguments({ 'games-dashboard-tab': tab });
            setOpenedGame(game);
          }}
          onUpdateGame={loadGames}
        />
      ))}
      {openedGame && (
        <GameDetailsDialog
          game={openedGame}
          project={
            !!projectUuid && openedGame.id === projectUuid ? project : null
          }
          onClose={() => {
            setOpenedGame(null);
          }}
          onGameUpdated={updatedGame => {
            setGames(
              games.map(game => (game === openedGame ? updatedGame : game))
            );
            setOpenedGame(updatedGame);
          }}
          onGameDeleted={() => {
            setOpenedGame(null);
            loadGames();
          }}
        />
      )}
    </ColumnStackLayout>
  );
};
