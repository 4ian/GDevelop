// @flow
import * as React from 'react';
import Fuse from 'fuse.js';
import { Trans, t } from '@lingui/macro';
import { type Game } from '../Utils/GDevelopServices/Game';
import { GameCard } from './GameCard';
import { ColumnStackLayout, ResponsiveLineStackLayout } from '../UI/Layout';
import SearchBar from '../UI/SearchBar';
import { useDebounce } from '../Utils/UseDebounce';
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
import SelectOption from '../UI/SelectOption';
import SearchBarSelectField from '../UI/SearchBarSelectField';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../ProjectsStorage';

const pageSize = 10;

const styles = { noGameMessageContainer: { padding: 10 } };

const getGamesToDisplay = ({
  project,
  games,
  searchText,
  searchClient,
  currentPage,
  orderBy,
}: {|
  project: ?gdProject,
  games: Array<Game>,
  searchText: string,
  searchClient: Fuse,
  currentPage: number,
  orderBy: 'createdAt' | 'totalSessions' | 'weeklySessions',
|}): Array<Game> => {
  if (searchText) {
    const searchResults = searchClient.search(
      getFuseSearchQueryForSimpleArray(searchText)
    );
    return searchResults.map(result => result.item);
  }
  const projectUuid = project ? project.getProjectUuid() : null;
  const thisGame = games.find(game => !!projectUuid && game.id === projectUuid);

  // Do the ordering here, client-side, as we receive all the games from the API.
  const orderedGames =
    orderBy === 'totalSessions'
      ? [...games].sort(
          (a, b) =>
            (b.cachedTotalSessionsCount || 0) -
            (a.cachedTotalSessionsCount || 0)
        )
      : orderBy === 'weeklySessions'
      ? [...games].sort(
          (a, b) =>
            (b.cachedLastWeekSessionsCount || 0) -
            (a.cachedLastWeekSessionsCount || 0)
        )
      : thisGame
      ? [thisGame, ...games.filter(game => game.id !== thisGame.id)]
      : games;

  return orderedGames.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
};

type Props = {|
  storageProviders: Array<StorageProvider>,
  project: ?gdProject,
  games: Array<Game>,
  onRefreshGames: () => Promise<void>,
  onOpenGameId: (gameId: ?string) => void,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
|};

const GamesList = ({
  project,
  games,
  onRefreshGames,
  onOpenGameId,
  onOpenProject,
  storageProviders,
}: Props) => {
  const { values, setGamesListOrderBy } = React.useContext(PreferencesContext);
  const [searchText, setSearchText] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const { gamesListOrderBy: orderBy } = values;

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
      orderBy,
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
          orderBy,
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
    orderBy,
  ]);

  const projectUuid = project ? project.getProjectUuid() : null;

  return (
    <ColumnStackLayout noMargin>
      <Line noMargin>
        <Text size="section-title" noMargin>
          <Trans>Published games</Trans>
        </Text>
      </Line>
      <ResponsiveLineStackLayout expand noMargin alignItems="center">
        <SearchBarSelectField
          value={orderBy}
          onChange={(e, i, value: string) =>
            // $FlowFixMe
            setGamesListOrderBy(value)
          }
        >
          <SelectOption
            value="createdAt"
            label={t`Creation date (new to old)`}
          />
          <SelectOption
            value="totalSessions"
            label={t`Most sessions (all time)`}
          />
          <SelectOption
            value="weeklySessions"
            label={t`Most sessions (past 7 days)`}
          />
        </SearchBarSelectField>
        <Line noMargin expand alignItems="center">
          <Column noMargin expand>
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              // Search is triggered on each search text change
              onRequestSearch={() => {}}
              placeholder={t`Search by name`}
              autoFocus="desktop"
            />
          </Column>
          <IconButton
            tooltip={t`Previous page`}
            onClick={() => setCurrentPage(currentPage => currentPage - 1)}
            disabled={!!searchText || currentPage === 0}
            size="small"
          >
            <ChevronArrowLeft />
          </IconButton>
          <Text
            noMargin
            style={{
              opacity: searchText ? 0.6 : 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {searchText ? 1 : currentPage + 1}
          </Text>
          <IconButton
            tooltip={t`Next page`}
            onClick={() => setCurrentPage(currentPage => currentPage + 1)}
            disabled={
              !!searchText || (currentPage + 1) * pageSize >= games.length
            }
            size="small"
          >
            <ChevronArrowRight />
          </IconButton>
        </Line>
      </ResponsiveLineStackLayout>
      {displayedGames.length > 0 ? (
        displayedGames.map(game => (
          <GameCard
            storageProviders={storageProviders}
            key={game.id}
            isCurrentGame={!!projectUuid && game.id === projectUuid}
            game={game}
            onOpenGameManager={() => {
              onOpenGameId(game.id);
            }}
            onOpenProject={onOpenProject}
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
