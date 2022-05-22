// @flow
import * as React from 'react';
import SearchBar from '../UI/SearchBar';
import { Column, Line } from '../UI/Grid';
import Background from '../UI/Background';
import ScrollView from '../UI/ScrollView';
import { type ShowcasedGame } from '../Utils/GDevelopServices/Game';
import { ListSearchResults } from '../UI/Search/ListSearchResults';
import { GamesShowcaseContext } from './GamesShowcaseContext';
import { ShowcasedGameListItem } from './ShowcasedGameListItem';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { Trans } from '@lingui/macro';
import Subheader from '../UI/Subheader';
import { CategoryChooser } from '../UI/Search/CategoryChooser';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
};

const getShowcasedGameTitle = (showcasedGame: ShowcasedGame) =>
  showcasedGame.title;

type Props = {};

export const GamesShowcase = (props: Props) => {
  const {
    filters,
    searchResults,
    error,
    fetchShowcasedGamesAndFilters,
    filtersState,
    searchText,
    setSearchText,
  } = React.useContext(GamesShowcaseContext);

  React.useEffect(() => {
    fetchShowcasedGamesAndFilters();
  }, [fetchShowcasedGamesAndFilters]);

  return (
    <ResponsiveWindowMeasurer>
      {(windowWidth) => (
        <Column expand noMargin useFullHeight>
          <SearchBar
            value={searchText}
            onChange={setSearchText}
            onRequestSearch={() => {}}
            style={styles.searchBar}
          />
          <Line
            expand
            overflow={
              'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
            }
          >
            <Background
              noFullHeight
              noExpand
              width={windowWidth === 'small' ? 150 : 250}
            >
              <ScrollView>
                <Subheader>
                  <Trans>Categories</Trans>
                </Subheader>
                <CategoryChooser
                  allItemsLabel={<Trans>All games</Trans>}
                  allFilters={filters}
                  filtersState={filtersState}
                  error={error}
                />
              </ScrollView>
            </Background>
            <ListSearchResults
              onRetry={fetchShowcasedGamesAndFilters}
              error={error}
              searchItems={searchResults}
              getSearchItemUniqueId={getShowcasedGameTitle}
              renderSearchItem={(showcasedGame, onHeightComputed) => (
                <ShowcasedGameListItem
                  onHeightComputed={onHeightComputed}
                  showcasedGame={showcasedGame}
                />
              )}
            />
          </Line>
        </Column>
      )}
    </ResponsiveWindowMeasurer>
  );
};
