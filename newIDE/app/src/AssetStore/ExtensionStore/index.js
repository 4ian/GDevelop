// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import SearchBar from '../../UI/SearchBar';
import { Column, Line } from '../../UI/Grid';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { ExtensionListItem } from './ExtensionListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import ExtensionInstallDialog from './ExtensionInstallDialog';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import {
  sendExtensionDetailsOpened,
  sendExtensionAddedToProject,
} from '../../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../../Hints/useDismissableTutorialMessage';
import { t } from '@lingui/macro';

type Props = {|
  isInstalling: boolean,
  project: gdProject,
  onInstall: ExtensionShortHeader => Promise<boolean>,
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
        ({ item: extensionShortHeader }) =>
          !showOnlyWithBehaviors ||
          extensionShortHeader.eventsBasedBehaviorsCount > 0
      )
    : null;

  const tagsHandler = React.useMemo(
    () => ({
      add: filtersState.addFilter,
      remove: filtersState.removeFilter,
      chosenTags: filtersState.chosenFilters,
    }),
    [filtersState]
  );

  const getExtensionsMatches = (
    extensionShortHeader: ExtensionShortHeader
  ): SearchMatch[] => {
    if (!searchResults) return [];
    const extensionMatches = searchResults.find(
      result => result.item.name === extensionShortHeader.name
    );
    return extensionMatches ? extensionMatches.matches : [];
  };

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-behaviors-and-functions'
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
              aspect="add-margins-only-if-modern-theme"
              tagsHandler={tagsHandler}
              tags={filters && filters.allTags}
              placeholder={t`Search extensions`}
            />
            {DismissableTutorialMessage && (
              <Line>
                <Column expand>{DismissableTutorialMessage}</Column>
              </Line>
            )}
            <ListSearchResults
              disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
              onRetry={fetchExtensionsAndFilters}
              error={error}
              searchItems={
                filteredSearchResults &&
                filteredSearchResults.map(({ item }) => item)
              }
              getSearchItemUniqueId={getExtensionName}
              renderSearchItem={(extensionShortHeader, onHeightComputed) => (
                <ExtensionListItem
                  key={extensionShortHeader.name}
                  project={project}
                  onHeightComputed={onHeightComputed}
                  extensionShortHeader={extensionShortHeader}
                  matches={getExtensionsMatches(extensionShortHeader)}
                  onChoose={() => {
                    sendExtensionDetailsOpened(extensionShortHeader.name);
                    setSelectedExtensionShortHeader(extensionShortHeader);
                  }}
                />
              )}
            />
          </Column>
        )}
      </ResponsiveWindowMeasurer>
      <I18n>
        {({ i18n }) =>
          !!selectedExtensionShortHeader && (
            <ExtensionInstallDialog
              project={project}
              isInstalling={isInstalling}
              extensionShortHeader={selectedExtensionShortHeader}
              onInstall={async () => {
                sendExtensionAddedToProject(selectedExtensionShortHeader.name);
                const wasInstalled = await onInstall(
                  selectedExtensionShortHeader
                );
                if (wasInstalled) setSelectedExtensionShortHeader(null);
              }}
              onClose={() => setSelectedExtensionShortHeader(null)}
              i18n={i18n}
            />
          )
        }
      </I18n>
    </React.Fragment>
  );
};
