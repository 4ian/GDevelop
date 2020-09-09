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

const styles = {
  previewBackground: {
    background: 'url("res/transparentback.png") repeat',
    width: 150,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chip: {
    marginBottom: 2,
    marginRight: 2,
  },
  previewImage: {
    maxWidth: 150,
    verticalAlign: 'middle',
    pointerEvents: 'none',
  },
  content: {
    flex: '1',
  },
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
    <Column expand noMargin useFullHeight>
      <SearchBar
        value={searchText}
        onChange={setSearchText}
        onRequestSearch={() => {}}
        style={styles.searchBar}
      />
      <Line
        overflow={
          'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
        }
      >
        <Background noFullHeight noExpand width={250}>
          <ScrollView>
            <FiltersChooser
              allFilters={filters}
              filtersState={filtersState}
              error={error}
            />
          </ScrollView>
        </Background>
        <SearchResults
          onOpenDetails={onOpenDetails}
          onRetry={fetchAssetsAndFilters}
          error={error}
          assetShortHeaders={searchResults}
        />
      </Line>
    </Column>
  );
};
