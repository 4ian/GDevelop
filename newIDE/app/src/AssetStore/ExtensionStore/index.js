// @flow
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import { Column } from '../../UI/Grid';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { ExtensionListItem } from './ExtensionListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import ExtensionInstallDialog from './ExtensionInstallDialog';

const styles = {
  searchBar: {
    // TODO: Can we put this in the search bar by default?
    flexShrink: 0,
  },
};

type Props = {|
  isInstalling: boolean,
  project: gdProject,
  onInstall: ExtensionShortHeader => Promise<void>,
  showOnlyWithBehaviors: boolean,
|};

const getExtensionName = (extensionShortHeader: ExtensionShortHeader) =>
  extensionShortHeader.name;

export const ExtensionStore = ({
  isInstalling,
  project,
  onInstall,
  showOnlyWithBehaviors,
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
              tagsHandler={{
                add: filtersState.addFilter,
                remove: filtersState.removeFilter,
                chosenTags: Array.from(filtersState.chosenFilters),
              }}
              tags={filters && filters.allTags}
            />
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
