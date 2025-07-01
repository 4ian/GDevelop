// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import semverGreaterThan from 'semver/functions/gt';
import SearchBar from '../../UI/SearchBar';
import {
  getBreakingChanges,
  isCompatibleWithGDevelopVersion,
} from '../../Utils/Extension/ExtensionCompatibilityChecker.js';
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
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import IconButton from '../../UI/IconButton';
import ThreeDotsMenu from '../../UI/CustomSvgIcons/ThreeDotsMenu';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import ExtensionInstallDialog from '../ExtensionStore/ExtensionInstallDialog';
import { getIDEVersion } from '../../Version';
import InAppTutorialContext from '../../InAppTutorial/InAppTutorialContext';

export const useExtensionUpdateAlertDialog = () => {
  const { showConfirmation } = useAlertDialog();
  const { currentlyRunningInAppTutorial } = React.useContext(
    InAppTutorialContext
  );
  return async (
    project: gdProject,
    behaviorShortHeader: BehaviorShortHeader
  ): Promise<boolean> => {
    if (currentlyRunningInAppTutorial) {
      return false;
    }
    return await showConfirmation({
      title: t`Extension update`,
      message:
        behaviorShortHeader.tier === 'reviewed'
          ? // Reviewed extensions are closely watched
            // and any breaking change will be added to the extension metadata.
            t`This behavior can be updated with new features and fixes.${'\n\n'}Do you want to update it now ?`
          : // Community extensions are checked as much as possible
            // but we can't ensure every breaking changes will be added to the extension metadata.
            t`This behavior can be updated. You may have to do some adaptations to make sure your game still works.${'\n\n'}Do you want to update it now ?`,
      confirmButtonLabel: t`Update the extension`,
      dismissButtonLabel: t`Skip the update`,
    });
  };
};

type Props = {|
  isInstalling: boolean,
  project: gdProject,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  installedBehaviorMetadataList: Array<BehaviorShortHeader>,
  deprecatedBehaviorMetadataList: Array<BehaviorShortHeader>,
  onInstall: (behaviorShortHeader: BehaviorShortHeader) => Promise<boolean>,
  onChoose: (behaviorType: string) => void,
|};

const getBehaviorType = (behaviorShortHeader: BehaviorShortHeader) =>
  behaviorShortHeader.type;

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
    (extensionShortHeader: BehaviorShortHeader): SearchMatch[] => {
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
    async (behaviorShortHeader: BehaviorShortHeader) => {
      if (behaviorShortHeader.tier === 'installed') {
        // The extension is not in the repository.
        // It's either built-in or user made.
        // It can't be updated.
        onChoose(behaviorShortHeader.type);
        return;
      }
      const isExtensionAlreadyInstalled =
        behaviorShortHeader.extensionName &&
        project.hasEventsFunctionsExtensionNamed(
          behaviorShortHeader.extensionName
        );
      if (isExtensionAlreadyInstalled) {
        const installedVersion = project
          .getEventsFunctionsExtension(behaviorShortHeader.extensionName)
          .getVersion();
        // repository version <= installed version
        if (!semverGreaterThan(behaviorShortHeader.version, installedVersion)) {
          // The extension is already up to date.
          onChoose(behaviorShortHeader.type);
          return;
        }
        if (
          !isCompatibleWithGDevelopVersion(
            getIDEVersion(),
            behaviorShortHeader.gdevelopVersion
          )
        ) {
          // Don't suggest to update the extension if the editor can't understand it.
          onChoose(behaviorShortHeader.type);
          return;
        }
        const breakingChanges = getBreakingChanges(
          installedVersion,
          behaviorShortHeader
        );
        if (breakingChanges && breakingChanges.length > 0) {
          // Don't suggest to update the extension if it would break the project.
          onChoose(behaviorShortHeader.type);
          return;
        }
        const shouldUpdateExtension = await showExtensionUpdateConfirmation(
          project,
          behaviorShortHeader
        );
        if (!shouldUpdateExtension) {
          onChoose(behaviorShortHeader.type);
          return;
        }
      }
      // Behaviors from the store that are not compatible with the editor are
      // greyed out in the list and can't be chosen by users.
      // No need to check `isCompatibleWithGDevelopVersion`.

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
