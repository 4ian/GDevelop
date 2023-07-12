// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import {
  type BehaviorShortHeader,
  type ExtensionShortHeader,
} from '../../Utils/GDevelopServices/Extension';
import { BehaviorStoreContext } from './BehaviorStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { BehaviorListItem } from './BehaviorListItem';
import { ResponsiveWindowMeasurer } from '../../UI/Reponsive/ResponsiveWindowMeasurer';
import ExtensionInstallDialog from '../ExtensionStore/ExtensionInstallDialog';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import Toggle from '../../UI/Toggle';
import {
  sendExtensionDetailsOpened,
  sendExtensionAddedToProject,
} from '../../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../../Hints/useDismissableTutorialMessage';
import { t } from '@lingui/macro';
import { ColumnStackLayout } from '../../UI/Layout';
import { Column } from '../../UI/Grid';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import SearchBarSelectField from '../../UI/SearchBarSelectField';
import SelectOption from '../../UI/SelectOption';
import { type SearchableBehaviorMetadata } from './BehaviorStoreContext';

type Props = {|
  isInstalling: boolean,
  project: gdProject,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  installedBehaviorMetadataByName: {
    [name: string]: SearchableBehaviorMetadata,
  },
  onInstall: (
    (BehaviorShortHeader | SearchableBehaviorMetadata) & { url: string }
  ) => Promise<boolean>,
  onChoose: (behaviorType: string) => void,
|};

const getBehaviorName = (
  behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
) => behaviorShortHeader.name;

export const BehaviorStore = ({
  isInstalling,
  project,
  objectType,
  objectBehaviorsTypes,
  installedBehaviorMetadataByName,
  onInstall,
  onChoose,
}: Props) => {
  const preferences = React.useContext(PreferencesContext);
  const {
    filters,
    searchResults,
    error,
    fetchExtensionsAndFilters,
    filtersState,
    searchText,
    setSearchText,
    allCategories,
    chosenCategory,
    setChosenCategory,
    setInstalledBehaviorMetadataByName,
  } = React.useContext(BehaviorStoreContext);

  React.useEffect(
    () => {
      fetchExtensionsAndFilters();
    },
    [fetchExtensionsAndFilters]
  );

  React.useEffect(
    () => {
      setInstalledBehaviorMetadataByName(installedBehaviorMetadataByName);
    },
    [installedBehaviorMetadataByName, setInstalledBehaviorMetadataByName]
  );

  const filteredSearchResults = searchResults ? searchResults : null;

  const tagsHandler = React.useMemo(
    () => ({
      add: filtersState.addFilter,
      remove: filtersState.removeFilter,
      chosenTags: filtersState.chosenFilters,
    }),
    [filtersState]
  );

  const getExtensionsMatches = (
    extensionShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
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

  const installAndChoose = React.useCallback(
    async (
      behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
    ) => {
      // TODO Handle updates for new behaviors.
      if (behaviorShortHeader.url) {
        sendExtensionAddedToProject(behaviorShortHeader.name);
        const wasInstalled = await onInstall(behaviorShortHeader);
      }
      onChoose(behaviorShortHeader.type);
    },
    [onInstall, onChoose]
  );

  return (
    <React.Fragment>
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <ColumnStackLayout expand noMargin useFullHeight>
            <ColumnStackLayout noMargin>
              <ResponsiveLineStackLayout noMargin>
                <SearchBarSelectField
                  value={chosenCategory}
                  onChange={(e, i, value: string) => {
                    setChosenCategory(value);
                  }}
                >
                  <SelectOption value="" label={t`All categories`} />
                  {allCategories.map(category => (
                    <SelectOption
                      key={category}
                      value={category}
                      label={category}
                    />
                  ))}
                </SearchBarSelectField>
                <Column expand noMargin>
                  <SearchBar
                    id="extension-search-bar"
                    value={searchText}
                    onChange={setSearchText}
                    onRequestSearch={() => {}}
                    tagsHandler={tagsHandler}
                    tags={filters && filters.allTags}
                    placeholder={t`Search extensions`}
                    autoFocus="desktop"
                  />
                </Column>
              </ResponsiveLineStackLayout>
              <Column>
                <Toggle
                  onToggle={(e, check) =>
                    preferences.setShowCommunityExtensions(check)
                  }
                  toggled={preferences.values.showCommunityExtensions}
                  labelPosition="right"
                  label={
                    <Trans>
                      Show community extensions (not officially reviewed)
                    </Trans>
                  }
                />
              </Column>
              {DismissableTutorialMessage}
            </ColumnStackLayout>
            <ListSearchResults
              disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
              onRetry={fetchExtensionsAndFilters}
              error={error}
              searchItems={
                filteredSearchResults &&
                filteredSearchResults.map(({ item }) => item)
              }
              getSearchItemUniqueId={getBehaviorName}
              renderSearchItem={(behaviorShortHeader, onHeightComputed) => (
                <BehaviorListItem
                  id={`behavior-list-item-${behaviorShortHeader.name}`}
                  key={behaviorShortHeader.name}
                  objectType={objectType}
                  objectBehaviorsTypes={objectBehaviorsTypes}
                  onHeightComputed={onHeightComputed}
                  behaviorShortHeader={behaviorShortHeader}
                  matches={getExtensionsMatches(behaviorShortHeader)}
                  onChoose={() => {
                    installAndChoose(behaviorShortHeader);
                  }}
                />
              )}
            />
          </ColumnStackLayout>
        )}
      </ResponsiveWindowMeasurer>
    </React.Fragment>
  );
};
