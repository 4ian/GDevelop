// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import { type ExampleShortHeader } from '../../Utils/GDevelopServices/Example';
import { FiltersChooser } from '../../UI/Search/FiltersChooser';
import { ExampleStoreContext } from './ExampleStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { ExampleListItem } from './ExampleListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import Subheader from '../../UI/Subheader';
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
|};

const getExampleName = (exampleShortHeader: ExampleShortHeader) =>
  exampleShortHeader.name;

export const ExampleStore = ({ isOpening, onOpen }: Props) => {
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

  React.useEffect(
    () => {
      fetchExamplesAndFilters();
    },
    [fetchExamplesAndFilters]
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
                    <Trans>Filters</Trans>
                  </Subheader>
                  <FiltersChooser
                    allFilters={filters}
                    filtersState={filtersState}
                    error={error}
                  />
                </ScrollView>
              </Background>
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
