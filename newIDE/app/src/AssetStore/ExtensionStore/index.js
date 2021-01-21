// @flow
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import Background from '../../UI/Background';
import ScrollView from '../../UI/ScrollView';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import { FiltersChooser } from '../FiltersChooser';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { ListSearchResults } from './ListSearchResults';
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
  onInstallExtension: ExtensionShortHeader => void,
|};

export const ExtensionStore = ({
  isInstalling,
  project,
  onInstall,
  showOnlyWithBehaviors,
  onInstallExtension,
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
            />
            <Line
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
              <ListSearchResults
                onRetry={fetchExtensionsAndFilters}
                error={error}
                searchItems={filteredSearchResults}
                renderSearchItem={(extensionShortHeader, onHeightComputed) => (
                  <ExtensionListItem
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
            onInstallExtension(selectedExtensionShortHeader);
            onInstall(selectedExtensionShortHeader);
          }}
          onClose={() => setSelectedExtensionShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
