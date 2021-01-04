// @flow
import * as React from 'react';
import SearchBar from '../UI/SearchBar';
import { Column, Line } from '../UI/Grid';
import Background from '../UI/Background';
import ScrollView from '../UI/ScrollView';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { SearchResults } from './SearchResults';
import { FiltersChooser } from './FiltersChooser';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
};

type Props = {
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  events: gdEventsList,
  onOpenDetails: AssetShortHeader => void,
};

export const AssetStore = ({
  project,
  objectsContainer,
  events,
  onOpenDetails,
}: Props) => {
  const {
    filters,
    searchResults,
    error,
    fetchAssetsAndFilters,
    filtersState,
    searchText,
    setSearchText,
  } = React.useContext(AssetStoreContext);

  React.useEffect(
    () => {
      fetchAssetsAndFilters();
    },
    [fetchAssetsAndFilters]
  );

  return (
    <ResponsiveWindowMeasurer>
      {windowWidth => (
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
                <FiltersChooser
                  allFilters={filters}
                  filtersState={filtersState}
                  error={error}
                />
              </ScrollView>
            </Background>
            <SearchResults
              baseSize={128}
              onRetry={fetchAssetsAndFilters}
              error={error}
              searchItems={searchResults}
              renderSearchItem={(assetShortHeader, size) => (
                <AssetCard
                  size={size}
                  onOpenDetails={() => onOpenDetails(assetShortHeader)}
                  assetShortHeader={assetShortHeader}
                />
              )}
            />
          </Line>
        </Column>
      )}
    </ResponsiveWindowMeasurer>
  );
};
