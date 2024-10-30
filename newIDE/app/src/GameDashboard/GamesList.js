// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import { type Game } from '../Utils/GDevelopServices/Game';
import { GameCard } from './GameCard';
import { ColumnStackLayout } from '../UI/Layout';
import { type GameDetailsTab } from './GameDetails';
import RouterContext from '../MainFrame/RouterContext';
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
import { Column, Line, Spacer } from '../UI/Grid';
import Text from '../UI/Text';
import Paper from '../UI/Paper';
import BackgroundText from '../UI/BackgroundText';
import UserEarnings from './Monetization/UserEarnings';

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
  onOpenGameId: (gameId: ?string) => void,
|};

const GamesList = ({ project, games, onRefreshGames, onOpenGameId }: Props) => {
  const {
    addRouteArguments,
  } = React.useContext(RouterContext);
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
      <UserEarnings />
      <Spacer />
      <Line noMargin>
        <Text size="section-title" noMargin>
          <Trans>Published games</Trans>
        </Text>
      </Line>
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
              onOpenGameId(game.id);
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
