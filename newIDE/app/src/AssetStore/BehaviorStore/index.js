// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import SearchBar from '../../UI/SearchBar';
import { type BehaviorShortHeader } from '../../Utils/GDevelopServices/Extension';
import { BehaviorStoreContext } from './BehaviorStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { BehaviorListItem } from './BehaviorListItem';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import { sendExtensionAddedToProject } from '../../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../../Hints/useDismissableTutorialMessage';
import { t } from '@lingui/macro';
import { ColumnStackLayout } from '../../UI/Layout';
import { Column, Line } from '../../UI/Grid';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { ResponsiveLineStackLayout } from '../../UI/Layout';
import SearchBarSelectField from '../../UI/SearchBarSelectField';
import SelectOption from '../../UI/SelectOption';
import { type SearchableBehaviorMetadata } from './BehaviorStoreContext';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import IconButton from '../../UI/IconButton';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import ExtensionInstallDialog from '../ExtensionStore/ExtensionInstallDialog';

export const useExtensionUpdateAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  return async (): Promise<boolean> => {
    return await showConfirmation({
      title: t`Extension update`,
      message: t`This behavior needs an extension update. You may have to do some adaptations to make sure your game still works.${'\n\n'}Do you want to update it now ?`,
      confirmButtonLabel: t`Update the extension`,
      dismissButtonLabel: t`Cancel`,
    });
  };
};

type Props = {|
  isInstalling: boolean,
  project: gdProject,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  installedBehaviorMetadataList: Array<SearchableBehaviorMetadata>,
  deprecatedBehaviorMetadataList: Array<SearchableBehaviorMetadata>,
  onInstall: (behaviorShortHeader: BehaviorShortHeader) => Promise<boolean>,
  onChoose: (behaviorType: string) => void,
|};

const getBehaviorType = (
  behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
) => behaviorShortHeader.type;

export const BehaviorStore = ({
  isInstalling,
  project,
  objectType,
  objectBehaviorsTypes,
  installedBehaviorMetadataList,
  deprecatedBehaviorMetadataList,
  onInstall,
  onChoose,
}: Props) => {
  const preferences = React.useContext(PreferencesContext);
  const [
    selectedBehaviorShortHeader,
    setSelectedBehaviorShortHeader,
  ] = React.useState<?BehaviorShortHeader>(null);
  const {
    filters,
    searchResults,
    error,
    fetchBehaviors,
    filtersState,
    searchText,
    setSearchText,
    allCategories,
    chosenCategory,
    setChosenCategory,
    setInstalledBehaviorMetadataList,
  } = React.useContext(BehaviorStoreContext);

  const [showDeprecated, setShowDeprecated] = React.useState(false);

  React.useEffect(
    () => {
      setInstalledBehaviorMetadataList(
        showDeprecated
          ? [
              ...installedBehaviorMetadataList,
              ...deprecatedBehaviorMetadataList,
            ]
          : installedBehaviorMetadataList
      );
    },
    [
      deprecatedBehaviorMetadataList,
      installedBehaviorMetadataList,
      setInstalledBehaviorMetadataList,
      showDeprecated,
    ]
  );

  React.useEffect(
    () => {
      fetchBehaviors();
    },
    [fetchBehaviors]
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

  const getExtensionsMatches = React.useCallback(
    (
      extensionShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
    ): SearchMatch[] => {
      if (!searchResults) return [];
      const extensionMatches = searchResults.find(
        result => result.item.type === extensionShortHeader.type
      );
      return extensionMatches ? extensionMatches.matches : [];
    },
    [searchResults]
  );

  const { DismissableTutorialMessage } = useDismissableTutorialMessage(
    'intro-behaviors-and-functions'
  );

  const showExtensionUpdateConfirmation = useExtensionUpdateAlertDialog();

  const installAndChoose = React.useCallback(
    async (
      behaviorShortHeader: BehaviorShortHeader | SearchableBehaviorMetadata
    ) => {
      const isExtensionAlreadyInstalled =
        behaviorShortHeader.extensionName &&
        project.hasEventsFunctionsExtensionNamed(
          behaviorShortHeader.extensionName
        );
      if (isExtensionAlreadyInstalled) {
        const shouldUpdateExtension = await showExtensionUpdateConfirmation();
        if (!shouldUpdateExtension) {
          return;
        }
      }

      if (behaviorShortHeader.url) {
        sendExtensionAddedToProject(behaviorShortHeader.name);
        const wasInstalled = await onInstall(behaviorShortHeader);
        // An errorBox is already displayed by `installExtension`.
        if (wasInstalled) {
          onChoose(behaviorShortHeader.type);
        }
      } else {
        onChoose(behaviorShortHeader.type);
      }
    },
    [project, onChoose, showExtensionUpdateConfirmation, onInstall]
  );

  return (
    <React.Fragment>
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
            <Line expand noMargin>
              <Column expand noMargin>
                <SearchBar
                  id="extension-search-bar"
                  value={searchText}
                  onChange={setSearchText}
                  onRequestSearch={() => {}}
                  tagsHandler={tagsHandler}
                  tags={filters && filters.allTags}
                  placeholder={t`Search behaviors`}
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
                    label: preferences.values.showCommunityExtensions
                      ? i18n._(
                          t`Hide community behaviors (not officially reviewed)`
                        )
                      : i18n._(
                          t`Show community behaviors (not officially reviewed)`
                        ),
                    click: () => {
                      preferences.setShowCommunityExtensions(
                        !preferences.values.showCommunityExtensions
                      );
                    },
                  },
                  {
                    label: showDeprecated
                      ? i18n._(
                          t`Hide deprecated behaviors (prefer not to use anymore)`
                        )
                      : i18n._(
                          t`Show deprecated behaviors (prefer not to use anymore)`
                        ),
                    click: () => {
                      setShowDeprecated(!showDeprecated);
                    },
                  },
                ]}
              />
            </Line>
          </ResponsiveLineStackLayout>
          {DismissableTutorialMessage}
        </ColumnStackLayout>
        <ListSearchResults
          disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
          onRetry={fetchBehaviors}
          error={error}
          searchItems={
            filteredSearchResults &&
            filteredSearchResults.map(({ item }) => item)
          }
          getSearchItemUniqueId={getBehaviorType}
          renderSearchItem={(behaviorShortHeader, onHeightComputed) => (
            <BehaviorListItem
              id={
                'behavior-item-' + behaviorShortHeader.type.replace(/:/g, '-')
              }
              key={behaviorShortHeader.type}
              objectType={objectType}
              objectBehaviorsTypes={objectBehaviorsTypes}
              onHeightComputed={onHeightComputed}
              behaviorShortHeader={behaviorShortHeader}
              matches={getExtensionsMatches(behaviorShortHeader)}
              onChoose={() => {
                installAndChoose(behaviorShortHeader);
              }}
              onShowDetails={() => {
                if (behaviorShortHeader.headerUrl) {
                  setSelectedBehaviorShortHeader(behaviorShortHeader);
                }
              }}
              platform={project.getCurrentPlatform()}
            />
          )}
        />
      </ColumnStackLayout>
      {!!selectedBehaviorShortHeader && (
        <ExtensionInstallDialog
          project={project}
          isInstalling={isInstalling}
          extensionShortHeader={selectedBehaviorShortHeader}
          onClose={() => setSelectedBehaviorShortHeader(null)}
        />
      )}
    </React.Fragment>
  );
};
