// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderError from '../UI/PlaceholderError';
import { type Game, getGames } from '../Utils/GDevelopServices/Game';
import { GameCard } from './GameCard';
import { ColumnStackLayout } from '../UI/Layout';
import { GameRegistration } from './GameRegistration';
import { GameDetailsDialog, type GamesDetailsTab } from './GameDetailsDialog';

type Props = {|
  project: ?gdProject,
|};

export const GamesList = (props: Props) => {
  const [error, setError] = React.useState<?Error>(null);
  const [games, setGames] = React.useState<?Array<Game>>(null);
  const {
    authenticated,
    firebaseUser,
    getAuthorizationHeader,
  } = React.useContext(AuthenticatedUserContext);
  const [openedGame, setOpenedGame] = React.useState<?Game>(null);
  const [
    openedGameInitialTab,
    setOpenedGameInitialTab,
  ] = React.useState<GamesDetailsTab>('details');

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

  const projectUuid = props.project ? props.project.getProjectUuid() : null;
  const thisGame = games.find(game => !!projectUuid && game.id === projectUuid);
  const displayedGames = [
    thisGame,
    ...games.filter(game => game !== thisGame),
  ].filter(Boolean);

  return (
    <ColumnStackLayout noMargin>
      <GameRegistration
        project={props.project}
        hideIfRegistered
        hideLoader
        onGameRegistered={() => {
          loadGames();
        }}
      />
      {displayedGames.map(game => (
        <GameCard
          key={game.id}
          isCurrentGame={!!projectUuid && game.id === projectUuid}
          game={game}
          onOpenGameManager={(tab: GamesDetailsTab) => {
            setOpenedGameInitialTab(tab);
            setOpenedGame(game);
          }}
          onUpdateGame={loadGames}
        />
      ))}
      {openedGame && (
        <GameDetailsDialog
          game={openedGame}
          project={
            !!projectUuid && openedGame.id === projectUuid
              ? props.project
              : null
          }
          initialTab={openedGameInitialTab}
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
