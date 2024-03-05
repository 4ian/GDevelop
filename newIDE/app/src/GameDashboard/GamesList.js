// @flow
import { Trans, t } from '@lingui/macro';
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
import Fuse from 'fuse.js';
import {
  getFuseSearchQueryForSimpleArray,
  sharedFuseConfiguration,
} from '../UI/Search/UseSearchStructuredItem';
import IconButton from '../UI/IconButton';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import Paper from '../UI/Paper';
import BackgroundText from '../UI/BackgroundText';

const pageSize = 10;

const styles = { noGameMessageContainer: { padding: 10 } };

const getGamesToDisplay = ({
  project,
  games,
  searchText,
  searchClient,
  currentPage,
}: {|
  project: ?gdProject,
  games: Array<Game>,
  searchText: string,
  searchClient: Fuse,
  currentPage: number,
|}): Array<Game> => {
  if (searchText) {
    const searchResults = searchClient.search(
      getFuseSearchQueryForSimpleArray(searchText)
    );
    return searchResults.map(result => result.item);
  }
  const projectUuid = project ? project.getProjectUuid() : null;
  const thisGame = games.find(game => !!projectUuid && game.id === projectUuid);
  const orderedGames = thisGame
    ? [thisGame, ...games.filter(game => game.id !== thisGame.id)]
    : games;
  return orderedGames.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
};

type Props = {|
  project: ?gdProject,
  games: Array<Game>,
  onRefreshGames: () => Promise<void>,
  onOpenGame: (?Game) => void,
|};

const GamesList = ({ project, games, onRefreshGames, onOpenGame }: Props) => {
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
  const [currentPage, setCurrentPage] = React.useState<number>(0);

  const searchClient = React.useMemo(
    () =>
      new Fuse(games, {
        ...sharedFuseConfiguration,
        keys: [{ name: 'gameName', weight: 1 }],
      }),
    [games]
  );

  const [displayedGames, setDisplayedGames] = React.useState<Array<Game>>(
    getGamesToDisplay({
      project,
      games,
      searchText,
      searchClient,
      currentPage,
    })
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

  const getGamesToDisplayDebounced = useDebounce(
    () => {
      setDisplayedGames(
        getGamesToDisplay({
          project,
          games,
          searchText,
          searchClient,
          currentPage,
        })
      );
    },
    // Use debounce when searching for a game.
    // Keep a lower debounce when changing pages so that the UI does not refresh until the
    // user stops changing pages, giving a sense of rapidity.
    searchText ? 250 : 150
  );

  // Refresh games to display when:
  // - search text changes (user input)
  // - games change (refresh following an update for instance)
  // - user changes page
  React.useEffect(getGamesToDisplayDebounced, [
    getGamesToDisplayDebounced,
    searchText,
    games,
    currentPage,
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
      <Line noMargin alignItems="center">
        <Column noMargin expand>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            // Search is triggered on each search text change
            onRequestSearch={() => {}}
            placeholder={t`Search by name`}
          />
        </Column>
        <IconButton
          tooltip={t`Previous page`}
          onClick={() => setCurrentPage(currentPage => currentPage - 1)}
          disabled={!!searchText || currentPage === 0}
        >
          <ChevronArrowLeft />
        </IconButton>
        <Text noMargin style={{ opacity: searchText ? 0.6 : 1 }}>
          {searchText ? 1 : currentPage + 1}
        </Text>
        <IconButton
          tooltip={t`Next page`}
          onClick={() => setCurrentPage(currentPage => currentPage + 1)}
          disabled={
            !!searchText || (currentPage + 1) * pageSize >= games.length
          }
        >
          <ChevronArrowRight />
        </IconButton>
      </Line>

      {displayedGames.length > 0 ? (
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
        ))
      ) : !!searchText ? (
        <Column expand noMargin>
          <Paper
            variant="outlined"
            background="dark"
            style={styles.noGameMessageContainer}
          >
            <BackgroundText>
              <Trans>No game matching your search.</Trans>
            </BackgroundText>
          </Paper>
        </Column>
      ) : null}
    </ColumnStackLayout>
  );
};

export default GamesList;
