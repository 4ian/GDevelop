// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import SearchBar, { useShouldAutofocusSearchbar } from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import { FiltersChooser } from '../../UI/Search/FiltersChooser';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { ExtensionListItem } from './ExtensionListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import ExtensionInstallDialog from './ExtensionInstallDialog';
import Subheader from '../../UI/Subheader';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
};

type Props = {|
  isInstalling: Boolean,
  project: gdProject,
  onInstall: ExtensionShortHeader => Promise<void>,
  showOnlyWithBehaviors: Boolean,
  focusOnMount?: Boolean,
|};

const getExtensionName = (extensionShortHeader: ExtensionShortHeader) =>
  extensionShortHeader.name;

export const ExtensionStore = ({
  isInstalling,
  project,
  onInstall,
  showOnlyWithBehaviors,
  focusOnMount,
}: Props) => {
  const [
    selectedExtensionShortHeader,
    setSelectedExtensionShortHeader,
  ] = React.useState<?ExtensionShortHeader>(null);
  const {
    filters,
    searchResults,
    error,
    fetchExtensionsAndFilters,
    filtersState,
    searchText,
    setSearchText,
  } = React.useContext(ExtensionStoreContext);

  const searchBar = React.useRef<?SearchBar>(null);
  const shouldAutofocusSearchbar = useShouldAutofocusSearchbar();

  React.useEffect(
    () => {
      fetchExtensionsAndFilters();
    },
    [fetchExtensionsAndFilters]
  );

  const filteredSearchResults = searchResults
    ? searchResults.filter(
        extensionShortHeader =>
          !showOnlyWithBehaviors ||
          extensionShortHeader.eventsBasedBehaviorsCount > 0
      )
    : null;

  React.useEffect(
    () => {
      if (focusOnMount && shouldAutofocusSearchbar && searchBar) {
        searchBar.current.focus();
      }
    },
    [shouldAutofocusSearchbar]
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
                onRetry={fetchExtensionsAndFilters}
                error={error}
                searchItems={filteredSearchResults}
                getSearchItemUniqueId={getExtensionName}
                renderSearchItem={(extensionShortHeader, onHeightComputed) => (
                  <ExtensionListItem
                    key={extensionShortHeader.name}
                    project={project}
                    onHeightComputed={onHeightComputed}
                    extensionShortHeader={extensionShortHeader}
                    onChoose={() => {
                      setSelectedExtensionShortHeader(extensionShortHeader);
                    }}
                  />
                )}
              />
            </Line>
          </Column>
        )}
      </ResponsiveWindowMeasurer>
      {!!selectedExtensionShortHeader && (
        <ExtensionInstallDialog
          isInstalling={isInstalling}
          extensionShortHeader={selectedExtensionShortHeader}
          alreadyInstalled={project.hasEventsFunctionsExtensionNamed(
            selectedExtensionShortHeader.name
          )}
          onInstall={() => {
            onInstall(selectedExtensionShortHeader);
          }}
          onClose={() => setSelectedExtensionShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
