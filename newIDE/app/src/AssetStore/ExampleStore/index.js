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
import { sendExampleDetailsOpened } from '../../Utils/Analytics/EventSender';
import { t } from '@lingui/macro';

// When showing examples, always put the starters first.
export const prepareExamples = (
  examples: Array<ExampleShortHeader>
): Array<ExampleShortHeader> =>
  examples.sort((example1, example2) => {
    const isExample1Starter = example1.tags.includes('Starter');
    const isExample2Starter = example2.tags.includes('Starter');
    return isExample1Starter && !isExample2Starter
      ? -1
      : !isExample1Starter && isExample2Starter
      ? 1
      : 0;
  });

const getExampleName = (exampleShortHeader: ExampleShortHeader) =>
  exampleShortHeader.name;

type Props = {|
  isOpening: boolean,
  onOpen: ExampleShortHeader => Promise<void>,
  focusOnMount?: boolean,
  initialExampleShortHeader: ?ExampleShortHeader,
|};

export const ExampleStore = ({
  isOpening,
  onOpen,
  focusOnMount,
  initialExampleShortHeader,
}: Props) => {
  const [
    selectedExampleShortHeader,
    setSelectedExampleShortHeader,
  ] = React.useState<?ExampleShortHeader>(initialExampleShortHeader);
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
            <Line>
              <Column expand>
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  onRequestSearch={() => {}}
                  tagsHandler={tagsHandler}
                  tags={filters && filters.defaultTags}
                  ref={searchBarRef}
                  placeholder={t`Search examples`}
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
              <ListSearchResults
                disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
                onRetry={fetchExamplesAndFilters}
                error={error}
                searchItems={
                  searchResults &&
                  prepareExamples(searchResults.map(({ item }) => item))
                }
                getSearchItemUniqueId={getExampleName}
                renderSearchItem={(exampleShortHeader, onHeightComputed) => (
                  <ExampleListItem
                    isOpening={isOpening}
                    onHeightComputed={onHeightComputed}
                    exampleShortHeader={exampleShortHeader}
                    matches={getExampleMatches(exampleShortHeader)}
                    onChoose={() => {
                      sendExampleDetailsOpened(exampleShortHeader.slug);
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
