// @flow
import * as React from 'react';
import { type FiltersState, useFilters } from '../UI/Search/FiltersChooser';
import { type Filters } from '../Utils/GDevelopServices/Filters';
import {
  listAllShowcasedGames,
  type AllShowcasedGames,
  type ShowcasedGame,
} from '../Utils/GDevelopServices/Game';
import { useSearchItem } from '../UI/Search/UseSearchItem';
import { shuffle } from 'lodash';

const defaultSearchText = '';

type GamesShowcaseState = {|
  filters: ?Filters,
  searchResults: ?Array<ShowcasedGame>,
  fetchShowcasedGamesAndFilters: () => void,
  allShowcasedGames: ?Array<ShowcasedGame>,
  error: ?Error,
  searchText: string,
  setSearchText: string => void,
  filtersState: FiltersState,
|};

export const GamesShowcaseContext = React.createContext<GamesShowcaseState>({
  filters: null,
  searchResults: null,
  fetchShowcasedGamesAndFilters: () => {},
  allShowcasedGames: null,
  error: null,
  searchText: '',
  setSearchText: () => {},
  filtersState: {
    chosenFilters: new Set(),
    addFilter: () => {},
    removeFilter: () => {},
    chosenCategory: null,
    setChosenCategory: () => {},
  },
});

type GamesShowcaseStateProviderProps = {|
  children: React.Node,
|};

const getShowcasedGameSearchTerms = (showcasedGame: ShowcasedGame) => {
  return (
    showcasedGame.title +
    '\n' +
    showcasedGame.author +
    '\n' +
    showcasedGame.description +
    '\n' +
    showcasedGame.tags.join(',')
  );
};

export const GamesShowcaseStateProvider = ({
  children,
}: GamesShowcaseStateProviderProps) => {
  const [showcasedGamesByName, setShowcasedGamesByName] = React.useState<?{
    [string]: ShowcasedGame,
  }>(null);
  const [
    allShowcasedGames,
    setAllShowcasedGames,
  ] = React.useState<?Array<ShowcasedGame>>(null);
  const [filters, setFilters] = React.useState<?Filters>(null);
  const [error, setError] = React.useState<?Error>(null);
  const isLoading = React.useRef<boolean>(false);

  const [searchText, setSearchText] = React.useState(defaultSearchText);
  const filtersState = useFilters();

  const fetchShowcasedGamesAndFilters = React.useCallback(
    () => {
      // Don't attempt to load again games and filters if they
      // were loaded already.
      if (showcasedGamesByName || isLoading.current) return;

      (async () => {
        setError(null);
        isLoading.current = true;

        try {
          const allShowcasedGames: AllShowcasedGames = await listAllShowcasedGames();
          const { showcasedGames, filters } = allShowcasedGames;
          setAllShowcasedGames(shuffle(showcasedGames));

          const showcasedGamesByName = {};
          showcasedGames.forEach(showcasedGame => {
            showcasedGamesByName[showcasedGame.title] = showcasedGame;
          });

          console.info(
            `Loaded ${showcasedGames.length} games from the games showcase.`
          );
          setShowcasedGamesByName(showcasedGamesByName);
          setFilters(filters);
        } catch (error) {
          console.error(
            `Unable to load the games from the games showcase:`,
            error
          );
          setError(error);
        }

        isLoading.current = false;
      })();
    },
    [showcasedGamesByName, isLoading]
  );

  const { chosenCategory, chosenFilters } = filtersState;
  const searchResults: ?Array<ShowcasedGame> = useSearchItem(
    showcasedGamesByName,
    getShowcasedGameSearchTerms,
    searchText,
    chosenCategory,
    chosenFilters
  );

  const gamesShowcaseState = React.useMemo(
    () => ({
      searchResults,
      fetchShowcasedGamesAndFilters,
      allShowcasedGames,
      filters,
      error,
      searchText,
      setSearchText,
      filtersState,
    }),
    [
      searchResults,
      allShowcasedGames,
      error,
      filters,
      searchText,
      filtersState,
      fetchShowcasedGamesAndFilters,
    ]
  );

  return (
    <GamesShowcaseContext.Provider value={gamesShowcaseState}>
      {children}
    </GamesShowcaseContext.Provider>
  );
};
