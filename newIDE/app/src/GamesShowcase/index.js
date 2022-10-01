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
import { t, Trans } from '@lingui/macro';
import Subheader from '../UI/Subheader';
import { CategoryChooser } from '../UI/Search/CategoryChooser';

const getShowcasedGameTitle = (showcasedGame: ShowcasedGame) =>
  showcasedGame.title;

const styles = {
  categories: {
    width: 250,
  },
};

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

  React.useEffect(
    () => {
      fetchShowcasedGamesAndFilters();
    },
    [fetchShowcasedGamesAndFilters]
  );

  return (
    <ResponsiveWindowMeasurer>
      {windowWidth => (
        <Column expand noMargin useFullHeight>
          <Line>
            <Column expand noMargin>
              <SearchBar
                value={searchText}
                onChange={setSearchText}
                onRequestSearch={() => {}}
                placeholder={t`Search games`}
              />
            </Column>
          </Line>
          <Line
            expand
            overflow={
              'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
            }
            noMargin
          >
            {windowWidth !== 'small' /* Hide categories on small screens */ && (
              <Background noFullHeight noExpand width={styles.categories.width}>
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
            )}
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
