// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import semverGreaterThan from 'semver/functions/gt';
import semverValid from 'semver/functions/valid';
import SearchBar from '../../UI/SearchBar';
import {
  getBreakingChanges,
  isCompatibleWithGDevelopVersion,
} from '../../Utils/Extension/ExtensionCompatibilityChecker.js';
import { type BehaviorShortHeader } from '../../Utils/GDevelopServices/Extension';
import { BehaviorStoreContext } from './BehaviorStoreContext';
import { ListSearchResults } from '../../UI/Search/ListSearchResults';
import { GridSearchResults } from '../../UI/Search/GridSearchResults';
import { BehaviorListItem } from './BehaviorListItem';
import { BehaviorGridItem } from './BehaviorGridItem';
import { type SearchMatch } from '../../UI/Search/UseSearchStructuredItem';
import { sendExtensionAddedToProject } from '../../Utils/Analytics/EventSender';
import useDismissableTutorialMessage from '../../Hints/useDismissableTutorialMessage';
import { t, Trans } from '@lingui/macro';
import { ColumnStackLayout, LineStackLayout } from '../../UI/Layout';
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
import ViewList from '@material-ui/icons/ViewList';
import ViewModule from '@material-ui/icons/ViewModule';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonBase from '@material-ui/core/ButtonBase';
import Text from '../../UI/Text';
import FolderIcon from '../../UI/CustomSvgIcons/Folder';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import SettingsIcon from '@material-ui/icons/Settings';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import SportsEsportsIcon from '@material-ui/icons/SportsEsports';
import CategoryIcon from '@material-ui/icons/Category';
import KeyboardIcon from '@material-ui/icons/Keyboard';
import DirectionsRunIcon from '@material-ui/icons/DirectionsRun';
import PeopleIcon from '@material-ui/icons/People';
import WebIcon from '@material-ui/icons/Web';
import PaletteIcon from '@material-ui/icons/Palette';

export const useExtensionUpdateAlertDialog = (): ((
  project: gdProject,
  behaviorShortHeader: BehaviorShortHeader
) => Promise<boolean>) => {
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
          : // Experimental extensions are checked as much as possible
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
  isChildObject: boolean,
  installedBehaviorMetadataList: Array<BehaviorShortHeader>,
  deprecatedBehaviorMetadataList: Array<BehaviorShortHeader>,
  onInstall: (behaviorShortHeader: BehaviorShortHeader) => Promise<boolean>,
  onChoose: (behaviorType: string) => void,
  onCategoryFolderNavigationChange?: (isInsideCategoryFolder: boolean) => void,
  backToCategoryFoldersSignal?: number,
|};

const getBehaviorType = (behaviorShortHeader: BehaviorShortHeader) =>
  behaviorShortHeader.type;

const NONE_CATEGORY_VALUE = '__none__';
const ALL_CATEGORIES_VALUE = '__all__';

const getBehaviorCategoryIcon = (category: string): React.Node => {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory === 'advanced') return <SettingsIcon />;
  if (normalizedCategory === 'camera') return <PhotoCameraIcon />;
  if (normalizedCategory === 'game mechanic') return <SportsEsportsIcon />;
  if (normalizedCategory === 'general') return <CategoryIcon />;
  if (normalizedCategory === 'input') return <KeyboardIcon />;
  if (normalizedCategory === 'movement') return <DirectionsRunIcon />;
  if (normalizedCategory === 'players') return <PeopleIcon />;
  if (normalizedCategory === 'user interface') return <WebIcon />;
  if (normalizedCategory === 'visual effect') return <PaletteIcon />;

  return <FolderIcon />;
};

const categoryItemStyles = {
  button: { width: '100%' },
  listContainer: {
    display: 'flex',
    textAlign: 'left',
    overflow: 'hidden',
    width: '100%',
  },
  gridWrapper: {
    paddingTop: 4,
    paddingRight: 1,
    paddingBottom: 4,
    paddingLeft: 1,
    boxSizing: 'border-box',
  },
  gridButton: {
    width: '100%',
    display: 'block',
    aspectRatio: '1 / 0.88',
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    padding: 24,
    boxSizing: 'border-box',
  },
};

const BehaviorCategoryListItem = ({
  category,
  onChoose,
  onHeightComputed,
}: {|
  category: string,
  onChoose: () => void,
  onHeightComputed: number => void,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [hover, setHover] = React.useState(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(
        Math.ceil(containerRef.current.getBoundingClientRect().height)
      );
  });

  return (
    <ButtonBase
      style={categoryItemStyles.button}
      onClick={onChoose}
      focusRipple
    >
      <div
        ref={containerRef}
        style={
          hover
            ? {
                ...categoryItemStyles.listContainer,
                ...gdevelopTheme.list.hover,
              }
            : categoryItemStyles.listContainer
        }
        onPointerEnter={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <LineStackLayout alignItems="center">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(getBehaviorCategoryIcon(category), {
              style: { fontSize: 48 },
            })}
          </div>
          <Column expand>
            <Text noMargin style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {category}
            </Text>
            <Text noMargin size="body2" color="secondary">
              <Trans>Show behaviors in this category</Trans>
            </Text>
          </Column>
        </LineStackLayout>
      </div>
    </ButtonBase>
  );
};

const BehaviorCategoryGridItem = ({
  category,
  onChoose,
  onHeightComputed,
}: {|
  category: string,
  onChoose: () => void,
  onHeightComputed: number => void,
|}): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [hover, setHover] = React.useState(false);
  const containerRef = React.useRef<?HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (containerRef.current)
      onHeightComputed(
        Math.ceil(containerRef.current.getBoundingClientRect().height)
      );
  });

  return (
    <div ref={containerRef} style={categoryItemStyles.gridWrapper}>
      <ButtonBase
        style={categoryItemStyles.gridButton}
        onClick={onChoose}
        focusRipple
      >
        <div
          style={{
            ...categoryItemStyles.gridContainer,
            backgroundColor: hover
              ? gdevelopTheme.list.hover.backgroundColor
              : gdevelopTheme.list.itemsBackgroundColor,
          }}
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(getBehaviorCategoryIcon(category), {
              style: { fontSize: 136 },
            })}
          </div>
          <Text
            noMargin
            allowBrowserAutoTranslate={false}
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: '1.2',
            }}
          >
            {category}
          </Text>
        </div>
      </ButtonBase>
    </div>
  );
};

export const BehaviorStore = ({
  isInstalling,
  project,
  objectType,
  objectBehaviorsTypes,
  isChildObject,
  installedBehaviorMetadataList,
  deprecatedBehaviorMetadataList,
  onInstall,
  onChoose,
  onCategoryFolderNavigationChange,
  backToCategoryFoldersSignal,
}: Props): React.Node => {
  const preferences = React.useContext(PreferencesContext);
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>(
    preferences.values.behaviorStoreViewMode || 'list'
  );
  const [
    selectedBehaviorShortHeader,
    setSelectedBehaviorShortHeader,
  ] = React.useState<?BehaviorShortHeader>(null);
  const {
    searchResults,
    error,
    fetchBehaviors,
    searchText,
    setSearchText,
    allCategories,
    chosenCategory,
    setChosenCategory,
    setInstalledBehaviorMetadataList,
  } = React.useContext(BehaviorStoreContext);

  const [showDeprecated, setShowDeprecated] = React.useState(false);
  const [
    selectedCategoryValue,
    setSelectedCategoryValue,
  ] = React.useState<string>(chosenCategory || ALL_CATEGORIES_VALUE);

  const handleViewModeChange = React.useCallback(
    (newMode: 'list' | 'grid') => {
      setViewMode(newMode);
      preferences.setBehaviorStoreViewMode(newMode);
    },
    [preferences]
  );

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

  const filteredSearchResults = React.useMemo(
    () => {
      if (!searchResults) return null;
      if (
        selectedCategoryValue === NONE_CATEGORY_VALUE ||
        selectedCategoryValue === ALL_CATEGORIES_VALUE
      ) {
        return searchResults;
      }

      return searchResults.filter(
        ({ item }) => item.category === selectedCategoryValue
      );
    },
    [searchResults, selectedCategoryValue]
  );
  const shouldShowCategoryFolders =
    selectedCategoryValue === NONE_CATEGORY_VALUE && !searchText.trim();
  const isInsideCategoryFolder =
    selectedCategoryValue !== NONE_CATEGORY_VALUE &&
    selectedCategoryValue !== ALL_CATEGORIES_VALUE;
  const categorySearchItems = React.useMemo(
    () => allCategories.filter(Boolean),
    [allCategories]
  );

  React.useEffect(
    () => {
      if (onCategoryFolderNavigationChange) {
        onCategoryFolderNavigationChange(isInsideCategoryFolder);
      }
    },
    [isInsideCategoryFolder, onCategoryFolderNavigationChange]
  );

  React.useEffect(
    () => {
      if (!backToCategoryFoldersSignal) return;
      setSelectedCategoryValue(NONE_CATEGORY_VALUE);
      setChosenCategory('');
      setSearchText('');
    },
    [backToCategoryFoldersSignal, setChosenCategory, setSearchText]
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
        if (
          !semverValid(behaviorShortHeader.version) ||
          !semverValid(installedVersion)
        ) {
          // Don't try to update the extension if we don't know which one is more recent.
          onChoose(behaviorShortHeader.type);
          return;
        }
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
              value={selectedCategoryValue}
              onChange={(e, i, value: string) => {
                setSelectedCategoryValue(value);
                if (
                  value === NONE_CATEGORY_VALUE ||
                  value === ALL_CATEGORIES_VALUE
                ) {
                  setChosenCategory('');
                } else {
                  setChosenCategory(value);
                }
              }}
            >
              <SelectOption value={NONE_CATEGORY_VALUE} label={t`None`} />
              <SelectOption
                value={ALL_CATEGORIES_VALUE}
                label={t`All categories`}
              />
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
                  placeholder={t`Search behaviors`}
                  autoFocus="desktop"
                />
              </Column>
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
                      ? i18n._(t`Hide experimental behaviors`)
                      : i18n._(t`Show experimental behaviors`),
                    click: () => {
                      preferences.setShowExperimentalExtensions(
                        !preferences.values.showExperimentalExtensions
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
        {viewMode === 'list' ? (
          <ListSearchResults
            disableAutoTranslate // Search results text highlighting conflicts with dom handling by browser auto-translations features. Disables auto translation to prevent crashes.
            onRetry={fetchBehaviors}
            error={error}
            columnCount={2}
            searchItems={
              shouldShowCategoryFolders
                ? categorySearchItems
                : filteredSearchResults &&
                  filteredSearchResults.map(({ item }) => item)
            }
            getSearchItemUniqueId={
              shouldShowCategoryFolders ? category => category : getBehaviorType
            }
            // $FlowFixMe[missing-local-annot]
            renderSearchItem={(item, onHeightComputed) =>
              shouldShowCategoryFolders ? (
                <BehaviorCategoryListItem
                  key={item}
                  category={item}
                  onHeightComputed={onHeightComputed}
                  onChoose={() => {
                    setSelectedCategoryValue(item);
                    setChosenCategory(item);
                  }}
                />
              ) : (
                <BehaviorListItem
                  id={'behavior-item-' + item.type.replace(/:/g, '-')}
                  key={item.type}
                  objectType={objectType}
                  objectBehaviorsTypes={objectBehaviorsTypes}
                  isChildObject={isChildObject}
                  onHeightComputed={onHeightComputed}
                  behaviorShortHeader={item}
                  matches={getExtensionsMatches(item)}
                  onChoose={() => {
                    installAndChoose(item);
                  }}
                  onShowDetails={() => {
                    if (item.headerUrl) {
                      setSelectedBehaviorShortHeader(item);
                    }
                  }}
                  platform={project.getCurrentPlatform()}
                />
              )
            }
          />
        ) : (
          <GridSearchResults
            disableAutoTranslate
            onRetry={fetchBehaviors}
            error={error}
            searchItems={
              shouldShowCategoryFolders
                ? categorySearchItems
                : filteredSearchResults &&
                  filteredSearchResults.map(({ item }) => item)
            }
            getSearchItemUniqueId={
              shouldShowCategoryFolders ? category => category : getBehaviorType
            }
            columnCount={3}
            // $FlowFixMe[missing-local-annot]
            renderSearchItem={(item, onHeightComputed) =>
              shouldShowCategoryFolders ? (
                <BehaviorCategoryGridItem
                  key={item}
                  category={item}
                  onHeightComputed={onHeightComputed}
                  onChoose={() => {
                    setSelectedCategoryValue(item);
                    setChosenCategory(item);
                  }}
                />
              ) : (
                <BehaviorGridItem
                  id={'behavior-grid-item-' + item.type.replace(/:/g, '-')}
                  key={item.type}
                  objectType={objectType}
                  objectBehaviorsTypes={objectBehaviorsTypes}
                  isChildObject={isChildObject}
                  onHeightComputed={onHeightComputed}
                  behaviorShortHeader={item}
                  matches={getExtensionsMatches(item)}
                  onChoose={() => {
                    installAndChoose(item);
                  }}
                  onShowDetails={() => {
                    if (item.headerUrl) {
                      setSelectedBehaviorShortHeader(item);
                    }
                  }}
                  platform={project.getCurrentPlatform()}
                />
              )
            }
          />
        )}
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
