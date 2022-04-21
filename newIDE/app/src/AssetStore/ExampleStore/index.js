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
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import {
  sendExampleDetailsOpened,
  sendExampleChosenAsProject,
} from '../../Utils/Analytics/EventSender';

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
      chosenTags: filtersState.chosenFilters,
    }),
    [filtersState]
  );

  const getExampleMatches = (
    exampleShortHeader: ExampleShortHeader
  ): SearchMatch[] => {
    if (!searchResults) return [];
    const exampleMatches = searchResults.find(
      result => result.item.id === exampleShortHeader.id
    );
    return exampleMatches ? exampleMatches.matches : [];
  };

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
                disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
                onRetry={fetchExamplesAndFilters}
                error={error}
                searchItems={
                  searchResults && searchResults.map(({ item }) => item)
                }
                getSearchItemUniqueId={getExampleName}
                renderSearchItem={(exampleShortHeader, onHeightComputed) => (
                  <ExampleListItem
                    isOpening={isOpening}
                    onHeightComputed={onHeightComputed}
                    exampleShortHeader={exampleShortHeader}
                    matches={getExampleMatches(exampleShortHeader)}
                    onChoose={() => {
                      sendExampleDetailsOpened({
                        id: exampleShortHeader.id,
                        name: exampleShortHeader.name,
                      });
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
            sendExampleChosenAsProject({
              id: selectedExampleShortHeader.id,
              name: selectedExampleShortHeader.name,
            });
            onOpen(selectedExampleShortHeader);
          }}
          onClose={() => setSelectedExampleShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
