// @flow
import * as React from 'react';
import SearchBar, {
  type SearchBarInterface,
  useShouldAutofocusSearchbar,
} from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { ExampleStoreContext } from './ExampleStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { ExampleListItem } from './ExampleListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import { ExampleDialog } from './ExampleDialog';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
};

type Props = {|
  isOpening: boolean,
  onOpen: ExampleShortHeader => Promise<void>,
  focusOnMount?: boolean,
|};

const getExampleName = (exampleShortHeader: ExampleShortHeader) =>
  exampleShortHeader.name;

export const ExampleStore = ({ isOpening, onOpen, focusOnMount }: Props) => {
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortHeader,
  ] = React.useState<?ExampleShortHeader>(null);
  const {
    filters,
    searchResults,
    error,
    fetchExamplesAndFilters,
    filtersState,
    searchText,
    setSearchText,
  } = React.useContext(ExampleStoreContext);

  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();
  const searchBarRef = React.useRef<?SearchBarInterface>(null);

  React.useEffect(
    () => {
      fetchExamplesAndFilters();
    },
    [fetchExamplesAndFilters]
  );

  React.useEffect(
    () => {
      if (focusOnMount && shouldAutofocusSearchbar && searchBarRef.current)
        searchBarRef.current.focus();
    },
    [shouldAutofocusSearchbar, focusOnMount]
  );

  const tagsHandler = React.useMemo(
    () => ({
      add: filtersState.addFilter,
      remove: filtersState.removeFilter,
      chosenTags: Array.from(filtersState.chosenFilters),
    }),
    [filtersState]
  );

  return (
    <React.Fragment>
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <Column expand noMargin useFullHeight>
            <SearchBar
              value={searchText}
              onChange={setSearchText}
              onRequestSearch={() => {}}
              style={styles.searchBar}
              tagsHandler={tagsHandler}
              tags={filters && filters.defaultTags}
              ref={searchBarRef}
            />
            <Line
              expand
              overflow={
                'hidden' /* Somehow required on Chrome/Firefox to avoid children growing (but not on Safari) */
              }
            >
              <ListSearchResults
                onRetry={fetchExamplesAndFilters}
                error={error}
                searchItems={searchResults}
                getSearchItemUniqueId={getExampleName}
                renderSearchItem={(exampleShortHeader, onHeightComputed) => (
                  <ExampleListItem
                    isOpening={isOpening}
                    onHeightComputed={onHeightComputed}
                    exampleShortHeader={exampleShortHeader}
                    onChoose={() => {
                      setSelectedExampleShortHeader(exampleShortHeader);
                    }}
                    onOpen={() => {
                      onOpen(exampleShortHeader);
                    }}
                  />
                )}
              />
            </Line>
          </Column>
        )}
      </ResponsiveWindowMeasurer>
      {!!selectedExampleShortHeader && (
        <ExampleDialog
          isOpening={isOpening}
          exampleShortHeader={selectedExampleShortHeader}
          onOpen={() => {
            onOpen(selectedExampleShortHeader);
          }}
          onClose={() => setSelectedExampleShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
