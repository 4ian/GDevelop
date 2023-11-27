// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type Game, registerGame } from '../Utils/GDevelopServices/Game';
import { GameCard } from './GameCard';
import { ColumnStackLayout } from '../UI/Layout';
import { GameRegistration } from './GameRegistration';
import { type GameDetailsTab } from './GameDetails';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import RouterContext from '../MainFrame/RouterContext';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import SearchBar from '../UI/SearchBar';
import { useDebounce } from '../Utils/UseDebounce';

const getGamesToDisplay = ({
  project,
  games,
  searchText,
}: {|
  project: ?gdProject,
  games: Array<Game>,
  searchText: string,
|}): Array<Game> => {
  const projectUuid = project ? project.getProjectUuid() : null;
  const thisGame = games.find(game => !!projectUuid && game.id === projectUuid);
  const displayedGames = [
    thisGame,
    ...games.filter(game => game !== thisGame),
  ].filter(Boolean);
  if (!searchText) return displayedGames;
  return displayedGames.filter(game =>
    game.gameName.toLowerCase().includes(searchText.toLowerCase())
  );
};

type Props = {|
  project: ?gdProject,
  games: Array<Game>,
  onRefreshGames: () => Promise<void>,
  onGameUpdated: Game => void,
  onOpenGame: (?Game) => void,
|};

const GamesList = ({
  project,
  games,
  onRefreshGames,
  onGameUpdated,
  onOpenGame,
}: Props) => {
  const {
    routeArguments,
    addRouteArguments,
    removeRouteArguments,
  } = React.useContext(RouterContext);
  const { getAuthorizationHeader, profile } = React.useContext(
    AuthenticatedUserContext
  );
  const { showAlert, showConfirmation } = useAlertDialog();
  const [isGameRegistering, setIsGameRegistering] = React.useState(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const [displayedGames, setDisplayedGames] = React.useState<Array<Game>>(
    games
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
        await onRefreshGames();
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
    [getAuthorizationHeader, profile, project, showAlert, onRefreshGames]
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
            onOpenGame(game);
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
      onOpenGame,
    ]
  );

  const getGamesToDisplayDebounced = useDebounce(() => {
    setDisplayedGames(
      getGamesToDisplay({
        project,
        games,
        searchText,
      })
    );
  }, 250);

  // Refresh games to display when:
  // - search text changes (user input)
  // - games change (refresh following an update for instance)
  React.useEffect(getGamesToDisplayDebounced, [
    getGamesToDisplayDebounced,
    searchText,
    games,
  ]);

  const projectUuid = project ? project.getProjectUuid() : null;

  return (
    <ColumnStackLayout noMargin>
      {!isGameRegistering && (
        <GameRegistration
          project={project}
          hideLoader
          onGameRegistered={onRefreshGames}
        />
      )}
      <SearchBar
        value={searchText}
        onChange={setSearchText}
        // Search is triggered on each search text change
        onRequestSearch={() => {}}
        placeholder={t`Search by name`}
      />
      {displayedGames &&
        displayedGames.map(game => (
          <GameCard
            key={game.id}
            isCurrentGame={!!projectUuid && game.id === projectUuid}
            game={game}
            onOpenGameManager={(tab: GameDetailsTab) => {
              addRouteArguments({ 'games-dashboard-tab': tab });
              onOpenGame(game);
            }}
            onUpdateGame={onRefreshGames}
          />
        ))}
    </ColumnStackLayout>
  );
};

export default GamesList;
