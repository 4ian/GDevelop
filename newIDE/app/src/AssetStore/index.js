// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import SearchBar, { useShouldAutofocusSearchbar } from '../UI/SearchBar';
import { Column, Line } from '../UI/Grid';
import Background from '../UI/Background';
import ScrollView from '../UI/ScrollView';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { BoxSearchResults } from '../UI/Search/BoxSearchResults';
import { type SearchBarInterface } from '../UI/SearchBar';
import { FiltersChooser } from '../UI/Search/FiltersChooser';
import { AssetStoreContext } from './AssetStoreContext';
import { AssetCard } from './AssetCard';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Subheader from '../UI/Subheader';
import { CategoryChooser } from '../UI/Search/CategoryChooser';

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
  focusOnMount?: boolean,
};

export const AssetStore = ({
  project,
  objectsContainer,
  events,
  onOpenDetails,
  focusOnMount,
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

  const searchBar = React.useRef<?SearchBarInterface>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();

  React.useEffect(
    () => {
      if (focusOnMount && shouldAutofocusSearchbar && searchBar.current) {
        searchBar.current.focus();
      }
    },
    [shouldAutofocusSearchbar, focusOnMount]
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
            ref={searchBar}
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
                  allItemsLabel={<Trans>All assets</Trans>}
                  allFilters={filters}
                  filtersState={filtersState}
                  error={error}
                />
                <Subheader>
                  <Trans>Filters</Trans>
                </Subheader>
                <FiltersChooser
                  allFilters={filters}
                  filtersState={filtersState}
                  error={error}
                />
              </ScrollView>
            </Background>
            <BoxSearchResults
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
