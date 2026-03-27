// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import { type ExtensionShortHeader } from '../../Utils/GDevelopServices/Extension';
import { ExtensionStoreContext } from './ExtensionStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { GridSearchResults } from '../../UI/Search/GridSearchResults';
import { ExtensionListItem } from './ExtensionListItem';
import { ExtensionGridItem } from './ExtensionGridItem';
import ExtensionInstallDialog from './ExtensionInstallDialog';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import {
  sendExtensionDetailsOpened,
  sendExtensionAddedToProject,
} from '../../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../../Hints/useDismissableTutorialMessage';
import { t, Trans } from '@lingui/macro';
import { ColumnStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import SearchBarSelectField from '../../UI/SearchBarSelectField';
import SelectOption from '../../UI/SelectOption';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import IconButton from '../../UI/IconButton';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import ViewList from '@material-ui/icons/ViewList';
import ViewModule from '@material-ui/icons/ViewModule';
import Tooltip from '@material-ui/core/Tooltip';

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
}: Props): React.Node => {
  const preferences = React.useContext(PreferencesContext);
  const [
    selectedExtensionShortHeader,
    setSelectedExtensionShortHeader,
  ] = React.useState<?ExtensionShortHeader>(null);
  const [currentTab, setCurrentTab] = React.useState<'all' | 'favorites'>(
    'all'
  );
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>(
    preferences.values.extensionStoreViewMode || 'list'
  );

  const handleViewModeChange = (newMode: 'list' | 'grid') => {
    setViewMode(newMode);
    preferences.setExtensionStoreViewMode(newMode);
  };

  const {
    searchResults,
    error,
    fetchExtensionsAndFilters,
    searchText,
    setSearchText,
    allCategories,
    chosenCategory,
    setChosenCategory,
  } = React.useContext(ExtensionStoreContext);

  React.useEffect(
    () => {
      fetchExtensionsAndFilters();
    },
    [fetchExtensionsAndFilters]
  );

  const filteredSearchResults = searchResults
    ? searchResults.filter(({ item: extensionShortHeader }) => {
        const matchesBehaviorFilter =
          !showOnlyWithBehaviors ||
          extensionShortHeader.eventsBasedBehaviorsCount > 0;

        const matchesFavoriteFilter =
          currentTab === 'all' ||
          preferences.isFavoriteExtension(extensionShortHeader.name);

        return matchesBehaviorFilter && matchesFavoriteFilter;
      })
    : null;

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
      <ColumnStackLayout expand noMargin useFullHeight>
        <Line noMargin alignItems="center" justifyContent="space-between">
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => setCurrentTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab value="all" label={<Trans>All Extensions</Trans>} />
            <Tab value="favorites" label={<Trans>Favorites</Trans>} />
          </Tabs>
          <Tooltip
            title={
              viewMode === 'list' ? (
                <Trans>Switch to grid view</Trans>
              ) : (
                <Trans>Switch to list view</Trans>
              )
            }
          >
            <IconButton
              size="small"
              onClick={() =>
                handleViewModeChange(viewMode === 'list' ? 'grid' : 'list')
              }
            >
              {viewMode === 'list' ? <ViewModule /> : <ViewList />}
            </IconButton>
          </Tooltip>
        </Line>
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
            <Line expand noMargin>
              <Column expand noMargin>
                <SearchBar
                  id="extension-search-bar"
                  value={searchText}
                  onChange={setSearchText}
                  onRequestSearch={() => {}}
                  placeholder={t`Search extensions`}
                  autoFocus="desktop"
                />
              </Column>
              <ElementWithMenu
                key="menu"
                element={
                  <IconButton size="small">
                    <ThreeDotsMenu />
                  </IconButton>
                }
                buildMenuTemplate={(i18n: I18nType) => [
                  {
                    label: preferences.values.showExperimentalExtensions
                      ? i18n._(t`Hide experimental extensions`)
                      : i18n._(t`Show experimental extensions`),
                    click: () => {
                      preferences.setShowExperimentalExtensions(
                        !preferences.values.showExperimentalExtensions
                      );
                    },
                  },
                ]}
              />
            </Line>
          </ResponsiveLineStackLayout>
          {DismissableTutorialMessage}
        </ColumnStackLayout>
        {viewMode === 'list' ? (
          <ListSearchResults
            disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
            onRetry={fetchExtensionsAndFilters}
            error={error}
            searchItems={
              filteredSearchResults &&
              filteredSearchResults.map(({ item }) => item)
            }
            getSearchItemUniqueId={getExtensionName}
            // $FlowFixMe[missing-local-annot]
            renderSearchItem={(extensionShortHeader, onHeightComputed) => (
              <ExtensionListItem
                id={`extension-list-item-${extensionShortHeader.name}`}
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
        ) : (
          <GridSearchResults
            disableAutoTranslate
            onRetry={fetchExtensionsAndFilters}
            error={error}
            searchItems={
              filteredSearchResults &&
              filteredSearchResults.map(({ item }) => item)
            }
            getSearchItemUniqueId={getExtensionName}
            columnCount={4}
            // $FlowFixMe[missing-local-annot]
            renderSearchItem={(extensionShortHeader, onHeightComputed) => (
              <ExtensionGridItem
                id={`extension-grid-item-${extensionShortHeader.name}`}
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
        )}
      </ColumnStackLayout>
      {!!selectedExtensionShortHeader && (
        <ExtensionInstallDialog
          project={project}
          isInstalling={isInstalling}
          extensionShortHeader={selectedExtensionShortHeader}
          onInstall={async () => {
            sendExtensionAddedToProject(selectedExtensionShortHeader.name);
            const wasInstalled = await onInstall(selectedExtensionShortHeader);
            // An errorBox is already displayed by `installExtension`.
            if (wasInstalled) setSelectedExtensionShortHeader(null);
          }}
          onClose={() => setSelectedExtensionShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
