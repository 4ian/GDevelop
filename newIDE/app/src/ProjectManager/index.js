// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import CompactSearchBar, {
  type CompactSearchBarInterface,
} from '../UI/CompactSearchBar';
import GlobalVariablesDialog from '../VariablesList/GlobalVariablesDialog';
import ProjectPropertiesDialog from './ProjectPropertiesDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import ExtensionsSearchDialog from '../AssetStore/ExtensionStore/ExtensionsSearchDialog';
import ScenePropertiesDialog from '../SceneEditor/ScenePropertiesDialog';
import SceneVariablesDialog from '../VariablesList/SceneVariablesDialog';
import { isExtensionNameTaken } from './EventFunctionExtensionNameVerifier';
import UnsavedChangesContext, {
  type UnsavedChanges,
} from '../MainFrame/UnsavedChangesContext';
import ProjectManagerCommands from './ProjectManagerCommands';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type GamesList } from '../GameDashboard/UseGamesList';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import InstalledExtensionDetails from './InstalledExtensionDetails';
import { addDefaultLightToAllLayers } from '../ProjectCreation/CreateProject';
import ErrorBoundary from '../UI/ErrorBoundary';
import useForceUpdate from '../Utils/UseForceUpdate';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';

import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import PreferencesContext, {
  type Preferences,
} from '../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../UI/Grid';
import Add from '../UI/CustomSvgIcons/Add';
import CreateNewFolder from '@material-ui/icons/CreateNewFolder';
import ViewColumn from '@material-ui/icons/ViewColumn';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  SceneTreeViewItemContent,
  getSceneTreeViewItemId,
  type SceneTreeViewItemProps,
  type SceneTreeViewItemCallbacks,
} from './SceneTreeViewItemContent';
import SceneWorkflowDialog from './SceneWorkflowDialog';
import {
  SceneFolderTreeViewItemContent,
  type SceneFolderTreeViewItemProps,
  type SceneFolder,
} from './SceneFolderTreeViewItemContent';
import {
  getSceneFolderIdFromTreeViewItemId,
} from './SceneFolderUtils';
import {
  loadSceneWorkflowMetadata,
  saveSceneWorkflowMetadata,
  createDefaultSceneWorkflowMetadata,
  createRandomId,
  type SceneWorkflowMetadata,
} from './SceneWorkflowMetadata';
import {
  ExtensionTreeViewItemContent,
  getExtensionTreeViewItemId,
  type ExtensionTreeViewItemProps,
  type ExtensionTreeViewItemCallbacks,
} from './ExtensionTreeViewItemContent';
import {
  ExternalEventsTreeViewItemContent,
  getExternalEventsTreeViewItemId,
  type ExternalEventsTreeViewItemProps,
  type ExternalEventsTreeViewItemCallbacks,
} from './ExternalEventsTreeViewItemContent';
import {
  ExternalLayoutTreeViewItemContent,
  getExternalLayoutTreeViewItemId,
  type ExternalLayoutTreeViewItemProps,
  type ExternalLayoutTreeViewItemCallbacks,
} from './ExternalLayoutTreeViewItemContent';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import RouterContext from '../MainFrame/RouterContext';
import { type FileMetadata, type StorageProvider } from '../ProjectsStorage';
import {
  type MainMenuCallbacks,
  type BuildMainMenuProps,
} from '../MainFrame/MainMenu';
import ProjectManagerMainMenu from './ProjectManagerMainMenu';
import EmptyMessage from '../UI/EmptyMessage';
import { ColumnStackLayout } from '../UI/Layout';
import { isMacLike } from '../Utils/Platform';
import optionalRequire from '../Utils/OptionalRequire';
import { useShouldAutofocusInput } from '../UI/Responsive/ScreenTypeMeasurer';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { getSlugifiedUniqueNameFromProperty } from '../Utils/ObjectSplitter';
import { localFileStorageProviderInternalName } from '../ProjectsStorage/LocalFileStorageProvider/LocalFileStorageProviderInternalName';

const electron = optionalRequire('electron');
const childProcess = optionalRequire('child_process');
const path = optionalRequire('path');

export const getProjectManagerItemId = (identifier: string): string =>
  `project-manager-tab-${identifier}`;

const gameSettingsRootFolderId = getProjectManagerItemId('game-settings');
const gamePropertiesItemId = getProjectManagerItemId('game-properties');
const gameDashboardItemId = 'manage';
const globalVariablesItemId = getProjectManagerItemId('global-variables');
const gameResourcesItemId = getProjectManagerItemId('game-resources');
export const scenesRootFolderId: string = getProjectManagerItemId('scenes');
export const extensionsRootFolderId: string = getProjectManagerItemId(
  'extensions'
);
export const externalEventsRootFolderId: string = getProjectManagerItemId(
  'external-events'
);
export const externalLayoutsRootFolderId: string = getProjectManagerItemId(
  'external-layout'
);

const scenesEmptyPlaceholderId = 'scenes-placeholder';
const extensionsEmptyPlaceholderId = 'extensions-placeholder';
const externalEventsEmptyPlaceholderId = 'external-events-placeholder';
const externalLayoutEmptyPlaceholderId = 'external-layout-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 8px 8px 8px',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

type SceneVersionControlStatus = 'new' | 'modified';

const normalizeGitPath = (filePath: string): string =>
  filePath.replace(/\\/g, '/');

const parseGitStatusOutput = (
  output: string
): Map<string, SceneVersionControlStatus> => {
  const statusByPath = new Map();
  if (!output) return statusByPath;

  output.split(/\r?\n/).forEach(line => {
    if (!line || line.length < 4) return;
    const status = line.slice(0, 2);
    if (status === '!!') return;

    let filePath = line.slice(3).trim();
    if (!filePath) return;
    if (filePath.includes('->')) {
      filePath = filePath.split('->').pop().trim();
    }

    const indexStatus = status[0];
    const worktreeStatus = status[1];
    let sceneStatus = null;
    if (status === '??' || indexStatus === 'A' || worktreeStatus === 'A') {
      sceneStatus = 'new';
    } else if (indexStatus !== ' ' || worktreeStatus !== ' ') {
      sceneStatus = 'modified';
    }

    if (sceneStatus) statusByPath.set(filePath, sceneStatus);
  });

  return statusByPath;
};

const execFilePromise = (
  command: string,
  args: Array<string>,
  options: { cwd: string }
): Promise<{ error: ?Error, stdout: string, stderr: string }> =>
  new Promise(resolve => {
    if (!childProcess || !childProcess.execFile) {
      resolve({
        error: new Error('child_process not available'),
        stdout: '',
        stderr: '',
      });
      return;
    }

    childProcess.execFile(command, args, options, (error, stdout, stderr) => {
      resolve({
        error,
        stdout: stdout || '',
        stderr: stderr || '',
      });
    });
  });

const extensionItemReactDndType = 'GD_EXTENSION_ITEM';

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): ?HTMLDataset;
  getThumbnail(): ?string;
  onClick(): void;
  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate>;
  getRightButton(i18n: I18nType): ?MenuButton;
  renderRightComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  delete(): void;
  copy(): void;
  paste(): void;
  cut(): void;
  getIndex(): number;
  moveAt(destinationIndex: number): void;
  isDescendantOf(itemContent: TreeViewItemContent): boolean;
  getRootId(): string;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: TreeViewItemContent;
  getChildren(i18n: I18nType): ?Array<TreeViewItem>;
}

export type TreeItemProps = {|
  forceUpdate: () => void,
  forceUpdateList: () => void,
  unsavedChanges?: ?UnsavedChanges,
  preferences: Preferences,
  gdevelopTheme: GDevelopTheme,
  project: gdProject,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
  showDeleteConfirmation: (
    options: ShowConfirmDeleteDialogOptions
  ) => Promise<boolean>,
|};

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

// $FlowFixMe[incompatible-type]
class PlaceHolderTreeViewItem implements TreeViewItem {
  isPlaceholder = true;
  content: TreeViewItemContent;

  constructor(id: string, label: string | React.Node) {
    this.content = new LabelTreeViewItemContent(id, label);
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

class LabelTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  dataSet: { [string]: string };
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: ?(MenuButton | Array<MenuButton>);

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton | Array<MenuButton>
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      rightButton
        ? Array.isArray(rightButton)
          ? rightButton.map(button => ({
              id: button.id,
              label: button.label,
              click: button.click,
              enabled: button.enabled,
            }))
          : [
              {
                id: rightButton.id,
                label: rightButton.label,
                click: rightButton.click,
                enabled: rightButton.enabled,
              },
            ]
        : [];
    this.rightButton = rightButton;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): ?(MenuButton | Array<MenuButton>) {
    return this.rightButton;
  }

  getHtmlId(index: number): ?string {
    return this.id;
  }

  getDataSet(): ?HTMLDataset {
    return null;
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {}

  // $FlowFixMe[missing-local-annot]
  buildMenuTemplate(i18n: I18nType, index: number) {
    return this.buildMenuTemplateFunction(i18n, index);
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
  }
}

class ActionTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  thumbnail: ?string;
  onClickCallback: () => void;

  constructor(
    id: string,
    label: string | React.Node,
    onClickCallback: () => void,
    thumbnail?: string
  ) {
    this.id = id;
    this.label = label;
    this.onClickCallback = onClickCallback;
    this.thumbnail = thumbnail;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) => [];
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(i18n: I18nType): ?MenuButton {
    return null;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getHtmlId(index: number): ?string {
    return this.id;
  }

  getDataSet(): ?HTMLDataset {
    return null;
  }

  getThumbnail(): ?string {
    return this.thumbnail;
  }

  onClick(): void {
    this.onClickCallback();
  }

  // $FlowFixMe[missing-local-annot]
  buildMenuTemplate(i18n: I18nType, index: number) {
    return this.buildMenuTemplateFunction(i18n, index);
  }

  renderRightComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  delete(): void {}

  copy(): void {}

  paste(): void {}

  cut(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}

  isDescendantOf(itemContent: TreeViewItemContent): boolean {
    return false;
  }

  getRootId(): string {
    return '';
  }
}

const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId(index);
const getTreeViewItemChildren = (i18n: I18nType) => (item: TreeViewItem) =>
  item.getChildren(i18n);
const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemDataSet = (item: TreeViewItem) =>
  item.content.getDataSet();
const buildMenuTemplate = (i18n: I18nType) => (
  item: TreeViewItem,
  index: number
) => item.content.buildMenuTemplate(i18n, index);
const renderTreeViewItemRightComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderRightComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const onClickItem = (item: TreeViewItem) => {
  item.content.onClick();
};
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const deleteItem = (item: TreeViewItem) => {
  item.content.delete();
};
const getTreeViewItemRightButton = (i18n: I18nType) => (item: TreeViewItem) =>
  item.content.getRightButton(i18n);

export type ProjectManagerInterface = {|
  forceUpdateList: () => void,
  focusSearchBar: () => void,
|};

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  storageProvider: ?StorageProvider,
  onChangeProjectName: string => Promise<void>,
  onSaveProjectProperties: (options: { newName?: string }) => Promise<boolean>,
  ...SceneTreeViewItemCallbacks,
  ...ExtensionTreeViewItemCallbacks,
  ...ExternalEventsTreeViewItemCallbacks,
  ...ExternalLayoutTreeViewItemCallbacks,
  onOpenResources: () => void,
  onReloadEventsFunctionsExtensions: () => void,
  isOpen: boolean,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onShareProject: () => void,
  onOpenHomePage: () => void,
  toggleProjectManager: () => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onSceneAdded: () => void,
  onExternalLayoutAdded: () => void,

  // Main menu
  mainMenuCallbacks: MainMenuCallbacks,
  buildMainMenuProps: BuildMainMenuProps,

  projectScopedContainersAccessor: ProjectScopedContainersAccessor | null,

  // For resources:
  resourceManagementProps: ResourceManagementProps,

  // Games
  gamesList: GamesList,
|};

const ProjectManager = React.forwardRef<Props, ProjectManagerInterface>(
  (
    {
      project,
      fileMetadata,
      storageProvider,
      onChangeProjectName,
      onSaveProjectProperties,
      onDeleteLayout,
      onDeleteExternalEvents,
      onDeleteExternalLayout,
      onDeleteEventsFunctionsExtension,
      onRenameLayout,
      onRenameExternalEvents,
      onRenameExternalLayout,
      onRenameEventsFunctionsExtension,
      onOpenLayout,
      onOpenExternalEvents,
      onOpenExternalLayout,
      onOpenEventsFunctionsExtension,
      onOpenResources,
      onReloadEventsFunctionsExtensions,
      isOpen,
      hotReloadPreviewButtonProps,
      onWillInstallExtension,
      onShareProject,
      resourceManagementProps,
      projectScopedContainersAccessor,
      gamesList,
      onOpenHomePage,
      toggleProjectManager,
      mainMenuCallbacks,
      buildMainMenuProps,
      onExtensionInstalled,
      onSceneAdded,
      onExternalLayoutAdded,
    },
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);
    const unsavedChanges = React.useContext(UnsavedChangesContext);
    const { triggerUnsavedChanges } = unsavedChanges;
    const preferences = React.useContext(PreferencesContext);
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const { showDeleteConfirmation } = useAlertDialog();
    const { fetchGames } = gamesList;
    const { navigateToRoute } = React.useContext(RouterContext);
    const [sceneWorkflowDialogOpen, setSceneWorkflowDialogOpen] = React.useState(
      false
    );
    const [
      sceneWorkflowMetadata,
      setSceneWorkflowMetadata,
    ] = React.useState<?SceneWorkflowMetadata>(null);
    const [
      sceneVersionControlStatusByName,
      setSceneVersionControlStatusByName,
    ] = React.useState<{ [string]: SceneVersionControlStatus }>({});
    const sceneVersionControlRefreshInFlight = React.useRef(false);

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [searchText, setSearchText] = React.useState('');

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const [
      projectPropertiesDialogOpen,
      setProjectPropertiesDialogOpen,
    ] = React.useState(false);
    const [
      projectPropertiesDialogInitialTab,
      setProjectPropertiesDialogInitialTab,
    ] = React.useState('properties');
    const openProjectProperties = React.useCallback(() => {
      setProjectPropertiesDialogOpen(true);
      setProjectPropertiesDialogInitialTab('properties');
    }, []);
    const openProjectLoadingScreen = React.useCallback(() => {
      setProjectPropertiesDialogOpen(true);
      setProjectPropertiesDialogInitialTab('loading-screen');
    }, []);
    const openProjectIcons = React.useCallback(() => {
      setProjectPropertiesDialogOpen(true);
      setProjectPropertiesDialogInitialTab('icons');
    }, []);
    const onProjectPropertiesApplied = React.useCallback(
      (options: { newName?: string }) => {
        triggerUnsavedChanges();

        if (options.newName) {
          onChangeProjectName(options.newName);
        }
        setProjectPropertiesDialogOpen(false);
      },
      [triggerUnsavedChanges, onChangeProjectName]
    );

    const { profile } = React.useContext(AuthenticatedUserContext);
    const userId = profile ? profile.id : null;
    React.useEffect(
      () => {
        fetchGames();
      },
      [fetchGames, userId]
    );
    const onOpenGamesDashboardDialog = React.useCallback(
      () => {
        if (!project) return;

        navigateToRoute('games-dashboard', {
          'game-id': project.getProjectUuid(),
          'games-dashboard-tab': 'details',
        });
        onOpenHomePage();
        toggleProjectManager();
        // Refresh the games as it could have been modified using the game dashboard
        // in the "Manage" tab from the home page.
        fetchGames();
      },
      [
        fetchGames,
        navigateToRoute,
        onOpenHomePage,
        toggleProjectManager,
        project,
      ]
    );

    const [
      projectVariablesEditorOpen,
      setProjectVariablesEditorOpen,
    ] = React.useState(false);
    const openProjectVariables = React.useCallback(() => {
      setProjectVariablesEditorOpen(true);
    }, []);

    const [
      editedPropertiesLayout,
      setEditedPropertiesLayout,
    ] = React.useState<?gdLayout>(null);
    const [
      editedVariablesLayout,
      setEditedVariablesLayout,
    ] = React.useState<?gdLayout>(null);
    const onOpenLayoutProperties = React.useCallback((layout: ?gdLayout) => {
      setEditedPropertiesLayout(layout);
    }, []);
    const onOpenLayoutVariables = React.useCallback((layout: ?gdLayout) => {
      setEditedVariablesLayout(layout);
    }, []);

    const [
      extensionsSearchDialogOpen,
      setExtensionsSearchDialogOpen,
    ] = React.useState(false);
    const openSearchExtensionDialog = React.useCallback(() => {
      setExtensionsSearchDialogOpen(true);
    }, []);
    const [
      openedExtensionShortHeader,
      setOpenedExtensionShortHeader,
    ] = React.useState(null);
    const [openedExtensionName, setOpenedExtensionName] = React.useState(null);

    const searchBarRef = React.useRef<?CompactSearchBarInterface>(null);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      focusSearchBar: () => {
        if (searchBarRef.current) searchBarRef.current.focus();
      },
    }));

    const onProjectItemModified = React.useCallback(
      () => {
        forceUpdate();
        triggerUnsavedChanges();
      },
      [forceUpdate, triggerUnsavedChanges]
    );

    const getProjectSceneNames = React.useCallback(
      (): Array<string> => {
        if (!project) return [];
        return mapFor(0, project.getLayoutsCount(), i =>
          project.getLayoutAt(i).getName()
        );
      },
      [project]
    );

    const computeSceneVersionControlStatusByName = React.useCallback(
      async (): Promise<{ [string]: SceneVersionControlStatus }> => {
        if (!project || !fileMetadata || !storageProvider) return {};
        if (!childProcess || !path) return {};
        if (
          storageProvider.internalName !== localFileStorageProviderInternalName
        )
          return {};

        const projectFilePath = fileMetadata.fileIdentifier;
        if (!projectFilePath) return {};

        const projectFolderPath = path.dirname(projectFilePath);
        const repoRootResult = await execFilePromise(
          'git',
          ['rev-parse', '--show-toplevel'],
          { cwd: projectFolderPath }
        );
        if (repoRootResult.error) return {};

        const repoRoot = repoRootResult.stdout.trim();
        if (!repoRoot) return {};

        const sceneNames = getProjectSceneNames();
        if (!sceneNames.length) return {};

        const scenePathByName = {};
        let uniquePaths = [];
        if (project.isFolderProject()) {
          const slugifyLayoutName = getSlugifiedUniqueNameFromProperty('name');
          const allPaths = sceneNames.map(sceneName => {
            const slug = slugifyLayoutName({ name: sceneName }, '/layouts');
            const absolutePath = path.join(
              projectFolderPath,
              'layouts',
              `${slug}.json`
            );
            const relativePath = normalizeGitPath(
              path.relative(repoRoot, absolutePath)
            );
            scenePathByName[sceneName] = relativePath;
            return relativePath;
          });
          uniquePaths = Array.from(
            new Set(allPaths.filter(path => path))
          );
        } else {
          const relativeProjectPath = normalizeGitPath(
            path.relative(repoRoot, projectFilePath)
          );
          if (!relativeProjectPath) return {};
          sceneNames.forEach(sceneName => {
            scenePathByName[sceneName] = relativeProjectPath;
          });
          uniquePaths = [relativeProjectPath];
        }

        if (!uniquePaths.length) return {};

        const statusResult = await execFilePromise(
          'git',
          [
            'status',
            '--porcelain=v1',
            '--untracked-files=all',
            '--',
            ...uniquePaths,
          ],
          { cwd: repoRoot }
        );
        if (statusResult.error) return {};

        const statusByPath = parseGitStatusOutput(statusResult.stdout);
        if (!statusByPath.size) return {};

        const statusBySceneName = {};
        sceneNames.forEach(sceneName => {
          const scenePath = scenePathByName[sceneName];
          const status = scenePath ? statusByPath.get(scenePath) : null;
          if (status) statusBySceneName[sceneName] = status;
        });

        return statusBySceneName;
      },
      [project, fileMetadata, storageProvider, getProjectSceneNames]
    );

    React.useEffect(
      () => {
        let isDisposed = false;
        const refresh = async () => {
          if (sceneVersionControlRefreshInFlight.current) return;
          sceneVersionControlRefreshInFlight.current = true;
          try {
            const statusBySceneName =
              await computeSceneVersionControlStatusByName();
            if (!isDisposed) {
              setSceneVersionControlStatusByName(statusBySceneName);
            }
          } finally {
            sceneVersionControlRefreshInFlight.current = false;
          }
        };

        refresh();
        const intervalId = setInterval(refresh, 8000);
        return () => {
          isDisposed = true;
          clearInterval(intervalId);
        };
      },
      [computeSceneVersionControlStatusByName]
    );

    const getSceneVersionControlStatus = React.useCallback(
      (sceneName: string): ?SceneVersionControlStatus =>
        sceneVersionControlStatusByName[sceneName] || null,
      [sceneVersionControlStatusByName]
    );

    const normalizeSceneWorkflowMetadataForProject = React.useCallback(
      (
        metadata: SceneWorkflowMetadata,
        sceneNames: Array<string>
      ): SceneWorkflowMetadata => {
        const sceneNameSet = new Set(sceneNames);
        const columns =
          metadata.workflow.columns && metadata.workflow.columns.length
            ? metadata.workflow.columns
            : createDefaultSceneWorkflowMetadata().workflow.columns;
        const defaultColumnId = columns.find(
          column => column.id === metadata.workflow.defaultColumnId
        )
          ? metadata.workflow.defaultColumnId
          : columns[0].id;

        const sceneStatus = {};
        sceneNames.forEach(sceneName => {
          const status = metadata.sceneStatus[sceneName];
          const columnId =
            status && columns.find(column => column.id === status.columnId)
              ? status.columnId
              : defaultColumnId;
          sceneStatus[sceneName] = { columnId };
        });

        const uniqueStrings = (list: Array<string>): Array<string> => {
          const seen = new Set();
          return list.filter(value => {
            if (!value || seen.has(value)) return false;
            seen.add(value);
            return true;
          });
        };

        const foldersById = new Map();
        const rawFolders = Array.isArray(metadata.sceneFolders.folders)
          ? metadata.sceneFolders.folders
          : [];
        const normalizedFolders = rawFolders
          .map(folder => {
            if (!folder || !folder.id) return null;
            const childFolderIds = uniqueStrings(
              Array.isArray(folder.childFolderIds) ? folder.childFolderIds : []
            ).filter(id => id !== folder.id);
            const folderSceneNames = uniqueStrings(
              Array.isArray(folder.sceneNames) ? folder.sceneNames : []
            ).filter(sceneName => sceneNameSet.has(sceneName));
            const normalizedFolder = {
              id: folder.id,
              name: folder.name || folder.id,
              childFolderIds,
              sceneNames: folderSceneNames,
            };
            foldersById.set(folder.id, normalizedFolder);
            return normalizedFolder;
          })
          .filter(Boolean);

        normalizedFolders.forEach(folder => {
          folder.childFolderIds = folder.childFolderIds.filter(id =>
            foldersById.has(id)
          );
        });

        const childFolderIdsSet = new Set();
        normalizedFolders.forEach(folder => {
          folder.childFolderIds.forEach(id => childFolderIdsSet.add(id));
        });

        const rootFolderIds = uniqueStrings(
          Array.isArray(metadata.sceneFolders.rootFolderIds)
            ? metadata.sceneFolders.rootFolderIds
            : []
        )
          .filter(id => foldersById.has(id))
          .filter(id => !childFolderIdsSet.has(id));

        const assignedScenes = new Set();
        const rootSceneNames = [];
        const addSceneToRoot = (sceneName: string) => {
          if (!sceneNameSet.has(sceneName) || assignedScenes.has(sceneName))
            return;
          assignedScenes.add(sceneName);
          rootSceneNames.push(sceneName);
        };

        const rawRootSceneNames = Array.isArray(
          metadata.sceneFolders.rootSceneNames
        )
          ? metadata.sceneFolders.rootSceneNames
          : [];
        rawRootSceneNames.forEach(addSceneToRoot);

        const finalFolders = normalizedFolders.map(folder => {
          const folderSceneNames = [];
          folder.sceneNames.forEach(sceneName => {
            if (!sceneNameSet.has(sceneName) || assignedScenes.has(sceneName))
              return;
            assignedScenes.add(sceneName);
            folderSceneNames.push(sceneName);
          });
          return {
            ...folder,
            sceneNames: folderSceneNames,
          };
        });

        sceneNames.forEach(sceneName => {
          if (!assignedScenes.has(sceneName)) {
            assignedScenes.add(sceneName);
            rootSceneNames.push(sceneName);
          }
        });

        return {
          ...metadata,
          workflow: {
            columns,
            defaultColumnId,
          },
          sceneStatus,
          sceneFolders: {
            rootFolderIds,
            rootSceneNames,
            folders: finalFolders,
          },
        };
      },
      []
    );

    React.useEffect(
      () => {
        if (!project) {
          setSceneWorkflowMetadata(null);
          return;
        }
        const loaded = loadSceneWorkflowMetadata(project);
        const normalized = normalizeSceneWorkflowMetadataForProject(
          loaded,
          getProjectSceneNames()
        );
        setSceneWorkflowMetadata(normalized);
      },
      [project, getProjectSceneNames, normalizeSceneWorkflowMetadataForProject]
    );

    const projectSceneNames = getProjectSceneNames();
    const projectSceneNamesKey = projectSceneNames.join('|');

    const sceneWorkflowMetadataValue = React.useMemo(
      () =>
        sceneWorkflowMetadata || createDefaultSceneWorkflowMetadata(),
      [sceneWorkflowMetadata]
    );

    const updateSceneWorkflowMetadata = React.useCallback(
      (
        updater: SceneWorkflowMetadata => SceneWorkflowMetadata
      ) => {
        if (!project) return;
        setSceneWorkflowMetadata(previous => {
          const base = previous || createDefaultSceneWorkflowMetadata();
          const updated = updater(base);
          const normalized = normalizeSceneWorkflowMetadataForProject(
            updated,
            getProjectSceneNames()
          );
          saveSceneWorkflowMetadata(project, normalized);
          triggerUnsavedChanges();
          return normalized;
        });
      },
      [
        project,
        triggerUnsavedChanges,
        getProjectSceneNames,
        normalizeSceneWorkflowMetadataForProject,
      ]
    );

    React.useEffect(
      () => {
        if (!project || !sceneWorkflowMetadata) return;
        const normalized = normalizeSceneWorkflowMetadataForProject(
          sceneWorkflowMetadata,
          projectSceneNames
        );
        if (JSON.stringify(normalized) !== JSON.stringify(sceneWorkflowMetadata)) {
          updateSceneWorkflowMetadata(() => normalized);
        }
      },
      [
        project,
        projectSceneNamesKey,
        sceneWorkflowMetadata,
        normalizeSceneWorkflowMetadataForProject,
        updateSceneWorkflowMetadata,
      ]
    );

    const sceneFoldersById = React.useMemo(() => {
      const map = new Map();
      sceneWorkflowMetadataValue.sceneFolders.folders.forEach(folder => {
        map.set(folder.id, folder);
      });
      return map;
    }, [sceneWorkflowMetadataValue]);

    const sceneFolderParentById = React.useMemo(() => {
      const parentById = {};
      sceneWorkflowMetadataValue.sceneFolders.folders.forEach(folder => {
        folder.childFolderIds.forEach(childId => {
          if (!parentById[childId]) parentById[childId] = folder.id;
        });
      });
      return parentById;
    }, [sceneWorkflowMetadataValue]);

    const sceneFolderPathsForMenu = React.useMemo(() => {
      const paths = [];
      const visitFolder = (folderId: string, prefix: string) => {
        const folder = sceneFoldersById.get(folderId);
        if (!folder) return;
        const path = prefix ? `${prefix}/${folder.name}` : folder.name;
        paths.push({ id: folder.id, path });
        folder.childFolderIds.forEach(childId => visitFolder(childId, path));
      };
      sceneWorkflowMetadataValue.sceneFolders.rootFolderIds.forEach(folderId =>
        visitFolder(folderId, '')
      );
      return paths;
    }, [sceneFoldersById, sceneWorkflowMetadataValue.sceneFolders.rootFolderIds]);

    const sceneFolderIdBySceneName = React.useMemo(() => {
      const map = {};
      sceneWorkflowMetadataValue.sceneFolders.folders.forEach(folder => {
        folder.sceneNames.forEach(sceneName => {
          if (!map[sceneName]) map[sceneName] = folder.id;
        });
      });
      return map;
    }, [sceneWorkflowMetadataValue]);

    const getSceneFolderId = React.useCallback(
      (sceneName: string): ?string =>
        sceneFolderIdBySceneName[sceneName] || null,
      [sceneFolderIdBySceneName]
    );

    const isSceneInFolder = React.useCallback(
      (sceneName: string, folderId: string): boolean =>
        sceneFolderIdBySceneName[sceneName] === folderId,
      [sceneFolderIdBySceneName]
    );

    const isFolderDescendantOf = React.useCallback(
      (folderId: string, ancestorFolderId: string): boolean => {
        if (folderId === ancestorFolderId) return false;
        const visited = new Set();
        const stack = [ancestorFolderId];
        while (stack.length) {
          const currentId = stack.pop();
          if (!currentId || visited.has(currentId)) continue;
          visited.add(currentId);
          const folder = sceneFoldersById.get(currentId);
          if (!folder) continue;
          if (folder.childFolderIds.includes(folderId)) return true;
          folder.childFolderIds.forEach(childId => stack.push(childId));
        }
        return false;
      },
      [sceneFoldersById]
    );

    const getFolderIndex = React.useCallback(
      (folderId: string): number => {
        const parentId = sceneFolderParentById[folderId];
        if (parentId && sceneFoldersById.has(parentId)) {
          const parentFolder = sceneFoldersById.get(parentId);
          return parentFolder.childFolderIds.indexOf(folderId);
        }
        return sceneWorkflowMetadataValue.sceneFolders.rootFolderIds.indexOf(
          folderId
        );
      },
      [sceneFolderParentById, sceneFoldersById, sceneWorkflowMetadataValue]
    );

    const getSceneWorkflowColumn = React.useCallback(
      (sceneName: string): ?{| name: string, color: string |} => {
        const status = sceneWorkflowMetadataValue.sceneStatus[sceneName];
        const columnId =
          (status && status.columnId) ||
          sceneWorkflowMetadataValue.workflow.defaultColumnId;
        const column = sceneWorkflowMetadataValue.workflow.columns.find(
          workflowColumn => workflowColumn.id === columnId
        );
        return column ? { name: column.name, color: column.color } : null;
      },
      [sceneWorkflowMetadataValue]
    );

    const getSceneOrderFromMetadata = React.useCallback(
      (metadata: SceneWorkflowMetadata): Array<string> => {
        const ordered = [];
        const foldersById = new Map();
        metadata.sceneFolders.folders.forEach(folder => {
          foldersById.set(folder.id, folder);
        });
        const visited = new Set();
        const visitFolder = (folderId: string) => {
          if (visited.has(folderId)) return;
          visited.add(folderId);
          const folder = foldersById.get(folderId);
          if (!folder) return;
          folder.childFolderIds.forEach(childId => visitFolder(childId));
          folder.sceneNames.forEach(sceneName => ordered.push(sceneName));
        };
        metadata.sceneFolders.rootFolderIds.forEach(folderId =>
          visitFolder(folderId)
        );
        metadata.sceneFolders.rootSceneNames.forEach(sceneName =>
          ordered.push(sceneName)
        );
        return ordered;
      },
      []
    );

    const applySceneOrderToProject = React.useCallback(
      (metadata: SceneWorkflowMetadata) => {
        if (!project) return;
        const orderedSceneNames = getSceneOrderFromMetadata(metadata);
        orderedSceneNames.forEach((sceneName, targetIndex) => {
          if (!project.hasLayoutNamed(sceneName)) return;
          const currentIndex = project.getLayoutPosition(sceneName);
          if (currentIndex !== targetIndex) {
            project.moveLayout(currentIndex, targetIndex);
          }
        });
      },
      [project, getSceneOrderFromMetadata]
    );

    const insertAt = (
      list: Array<any>,
      index: ?number,
      item: any
    ): Array<any> => {
      const next = [...list];
      const insertionIndex =
        index === undefined || index === null
          ? next.length
          : Math.max(0, Math.min(index, next.length));
      next.splice(insertionIndex, 0, item);
      return next;
    };

    const removeSceneFromFolders = (
      sceneFolders: $PropertyType<SceneWorkflowMetadata, 'sceneFolders'>,
      sceneName: string
    ) => ({
      ...sceneFolders,
      rootSceneNames: sceneFolders.rootSceneNames.filter(
        name => name !== sceneName
      ),
      folders: sceneFolders.folders.map(folder => ({
        ...folder,
        sceneNames: folder.sceneNames.filter(name => name !== sceneName),
      })),
    });

    const updateSceneFoldersForSceneMove = (
      sceneFolders: $PropertyType<SceneWorkflowMetadata, 'sceneFolders'>,
      sceneName: string,
      destinationFolderId: ?string,
      destinationIndex: ?number
    ) => {
      const withoutScene = removeSceneFromFolders(sceneFolders, sceneName);
      if (destinationFolderId) {
        return {
          ...withoutScene,
          folders: withoutScene.folders.map(folder =>
            folder.id === destinationFolderId
              ? {
                  ...folder,
                  sceneNames: insertAt(
                    folder.sceneNames,
                    destinationIndex,
                    sceneName
                  ),
                }
              : folder
          ),
        };
      }
      return {
        ...withoutScene,
        rootSceneNames: insertAt(
          withoutScene.rootSceneNames,
          destinationIndex,
          sceneName
        ),
      };
    };

    const removeFolderFromParents = (
      sceneFolders: $PropertyType<SceneWorkflowMetadata, 'sceneFolders'>,
      folderId: string
    ) => ({
      ...sceneFolders,
      rootFolderIds: sceneFolders.rootFolderIds.filter(id => id !== folderId),
      folders: sceneFolders.folders.map(folder => ({
        ...folder,
        childFolderIds: folder.childFolderIds.filter(id => id !== folderId),
      })),
    });

    const updateSceneFoldersForFolderMove = (
      sceneFolders: $PropertyType<SceneWorkflowMetadata, 'sceneFolders'>,
      folderId: string,
      destinationFolderId: ?string,
      destinationIndex: ?number
    ) => {
      const withoutFolder = removeFolderFromParents(sceneFolders, folderId);
      if (destinationFolderId) {
        return {
          ...withoutFolder,
          folders: withoutFolder.folders.map(folder =>
            folder.id === destinationFolderId
              ? {
                  ...folder,
                  childFolderIds: insertAt(
                    folder.childFolderIds,
                    destinationIndex,
                    folderId
                  ),
                }
              : folder
          ),
        };
      }
      return {
        ...withoutFolder,
        rootFolderIds: insertAt(
          withoutFolder.rootFolderIds,
          destinationIndex,
          folderId
        ),
      };
    };

    const onAddSceneFolder = React.useCallback(
      (parentFolderId: ?string, defaultName: string) => {
        updateSceneWorkflowMetadata(previous => {
          const existingNames = previous.sceneFolders.folders.map(
            folder => folder.name
          );
          const uniqueName = newNameGenerator(defaultName, name =>
            existingNames.includes(name)
          );
          const newFolder: SceneFolder = {
            id: createRandomId('folder'),
            name: uniqueName,
            childFolderIds: [],
            sceneNames: [],
          };
          const nextSceneFolders = updateSceneFoldersForFolderMove(
            {
              ...previous.sceneFolders,
              folders: [...previous.sceneFolders.folders, newFolder],
            },
            newFolder.id,
            parentFolderId,
            null
          );
          const nextMetadata = {
            ...previous,
            sceneFolders: nextSceneFolders,
          };
          applySceneOrderToProject(nextMetadata);
          return nextMetadata;
        });
      },
      [updateSceneWorkflowMetadata, applySceneOrderToProject]
    );

    const onCreateSceneFolderWithScene = React.useCallback(
      (sceneName: string, defaultName: string) => {
        updateSceneWorkflowMetadata(previous => {
          const existingNames = previous.sceneFolders.folders.map(
            folder => folder.name
          );
          const uniqueName = newNameGenerator(defaultName, name =>
            existingNames.includes(name)
          );
          const newFolder: SceneFolder = {
            id: createRandomId('folder'),
            name: uniqueName,
            childFolderIds: [],
            sceneNames: [],
          };
          const nextFoldersWithNew = [
            ...previous.sceneFolders.folders,
            newFolder,
          ];
          const withNewFolder = {
            ...previous.sceneFolders,
            folders: nextFoldersWithNew,
          };
          const movedSceneFolders = updateSceneFoldersForSceneMove(
            withNewFolder,
            sceneName,
            newFolder.id,
            null
          );
          const nextMetadata = {
            ...previous,
            sceneFolders: movedSceneFolders,
          };
          applySceneOrderToProject(nextMetadata);
          return nextMetadata;
        });
      },
      [updateSceneWorkflowMetadata, applySceneOrderToProject]
    );

    const onRenameSceneFolder = React.useCallback(
      (folderId: string, newName: string) => {
        updateSceneWorkflowMetadata(previous => ({
          ...previous,
          sceneFolders: {
            ...previous.sceneFolders,
            folders: previous.sceneFolders.folders.map(folder =>
              folder.id === folderId ? { ...folder, name: newName } : folder
            ),
          },
        }));
      },
      [updateSceneWorkflowMetadata]
    );

    const onDeleteSceneFolder = React.useCallback(
      async (folderId: string) => {
        const folder = sceneFoldersById.get(folderId);
        if (!folder) return;
        const hasContent =
          folder.childFolderIds.length > 0 || folder.sceneNames.length > 0;
        const shouldDelete = await showDeleteConfirmation({
          title: t`Delete folder`,
          message: hasContent
            ? t`This folder contains items. They will be moved to the root folder. Continue?`
            : t`Delete this empty folder?`,
          confirmButtonLabel: t`Delete`,
        });
        if (!shouldDelete) return;

        updateSceneWorkflowMetadata(previous => {
          const folderToDelete = previous.sceneFolders.folders.find(
            candidate => candidate.id === folderId
          );
          const withoutFolder = {
            ...previous.sceneFolders,
            folders: previous.sceneFolders.folders.filter(
              candidate => candidate.id !== folderId
            ),
          };
          const removedFromParents = removeFolderFromParents(
            withoutFolder,
            folderId
          );
          const movedChildrenToRoot = folderToDelete
            ? {
                ...removedFromParents,
                rootFolderIds: [
                  ...removedFromParents.rootFolderIds,
                  ...folderToDelete.childFolderIds,
                ],
                rootSceneNames: [
                  ...removedFromParents.rootSceneNames,
                  ...folderToDelete.sceneNames,
                ],
              }
            : removedFromParents;
          const nextMetadata = {
            ...previous,
            sceneFolders: movedChildrenToRoot,
          };
          applySceneOrderToProject(nextMetadata);
          return nextMetadata;
        });
      },
      [
        sceneFoldersById,
        showDeleteConfirmation,
        updateSceneWorkflowMetadata,
        applySceneOrderToProject,
      ]
    );

    const onMoveSceneToFolder = React.useCallback(
      (sceneName: string, folderId: ?string) => {
        updateSceneWorkflowMetadata(previous => {
          const nextSceneFolders = updateSceneFoldersForSceneMove(
            previous.sceneFolders,
            sceneName,
            folderId,
            null
          );
          const nextMetadata = {
            ...previous,
            sceneFolders: nextSceneFolders,
          };
          applySceneOrderToProject(nextMetadata);
          return nextMetadata;
        });
      },
      [updateSceneWorkflowMetadata, applySceneOrderToProject]
    );

    const onSceneCreated = React.useCallback(
      (scene: gdLayout, sourceSceneName?: ?string) => {
        const sceneName = scene.getName();
        updateSceneWorkflowMetadata(previous => {
          const defaultColumnId = previous.workflow.defaultColumnId;
          const nextSceneStatus = {
            ...previous.sceneStatus,
            [sceneName]: { columnId: defaultColumnId },
          };

          let destinationFolderId = null;
          let destinationIndex = null;
          if (sourceSceneName) {
            let sourceFolderId = null;
            let sourceIndex = -1;
            previous.sceneFolders.folders.some(folder => {
              const index = folder.sceneNames.indexOf(sourceSceneName);
              if (index === -1) return false;
              sourceFolderId = folder.id;
              sourceIndex = index;
              return true;
            });
            if (sourceFolderId) {
              destinationFolderId = sourceFolderId;
              destinationIndex = sourceIndex + 1;
            } else {
              const rootIndex = previous.sceneFolders.rootSceneNames.indexOf(
                sourceSceneName
              );
              if (rootIndex !== -1) {
                destinationFolderId = null;
                destinationIndex = rootIndex + 1;
              }
            }
          }

          const nextSceneFolders = updateSceneFoldersForSceneMove(
            previous.sceneFolders,
            sceneName,
            destinationFolderId,
            destinationIndex
          );
          const nextMetadata = {
            ...previous,
            sceneStatus: nextSceneStatus,
            sceneFolders: nextSceneFolders,
          };
          applySceneOrderToProject(nextMetadata);
          return nextMetadata;
        });
      },
      [updateSceneWorkflowMetadata, applySceneOrderToProject]
    );

    const scenePtrNameMapRef = React.useRef<?Map<string, string>>(null);

    React.useEffect(
      () => {
        if (!project || !sceneWorkflowMetadataValue) return;
        const nextMap = new Map();
        const renames = [];
        mapFor(0, project.getLayoutsCount(), i => {
          const layout = project.getLayoutAt(i);
          const ptrKey = String(layout.ptr);
          const name = layout.getName();
          nextMap.set(ptrKey, name);
          if (scenePtrNameMapRef.current &&
            scenePtrNameMapRef.current.has(ptrKey)) {
            const previousName = scenePtrNameMapRef.current.get(ptrKey);
            if (previousName && previousName !== name) {
              renames.push({ oldName: previousName, newName: name });
            }
          }
        });
        scenePtrNameMapRef.current = nextMap;
        if (!renames.length) return;

        updateSceneWorkflowMetadata(previous => {
          let nextMetadata = previous;
          renames.forEach(({ oldName, newName }) => {
            if (oldName === newName) return;
            const updatedSceneStatus = { ...nextMetadata.sceneStatus };
            if (
              updatedSceneStatus[oldName] &&
              !updatedSceneStatus[newName]
            ) {
              updatedSceneStatus[newName] = updatedSceneStatus[oldName];
            }
            delete updatedSceneStatus[oldName];

            const renameSceneInList = (list: Array<string>) => {
              if (!list.includes(oldName)) return list;
              const withoutOld = list.filter(name => name !== oldName);
              return withoutOld.includes(newName)
                ? withoutOld
                : [...withoutOld, newName];
            };

            const updatedSceneFolders = {
              ...nextMetadata.sceneFolders,
              rootSceneNames: renameSceneInList(
                nextMetadata.sceneFolders.rootSceneNames
              ),
              folders: nextMetadata.sceneFolders.folders.map(folder => ({
                ...folder,
                sceneNames: renameSceneInList(folder.sceneNames),
              })),
            };

            nextMetadata = {
              ...nextMetadata,
              sceneStatus: updatedSceneStatus,
              sceneFolders: updatedSceneFolders,
            };
          });
          return nextMetadata;
        });
      },
      [
        project,
        projectSceneNamesKey,
        sceneWorkflowMetadataValue,
        updateSceneWorkflowMetadata,
      ]
    );

    const editName = React.useCallback(
      (itemId: string) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobile) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItemFromId(itemId, 'start');
          }
          treeView.renameItemFromId(itemId);
        }
      },
      [isMobile]
    );

    const addNewScene = React.useCallback(
      (index: number, i18n: I18nType) => {
        if (!project) return;

        const newName = newNameGenerator(i18n._(t`Untitled scene`), name =>
          project.hasLayoutNamed(name)
        );
        const newScene = project.insertNewLayout(newName, index + 1);
        newScene.setName(newName);
        newScene.updateBehaviorsSharedData(project);
        addDefaultLightToAllLayers(newScene);

        onSceneCreated(newScene, null);
        onSceneAdded();

        onProjectItemModified();

        const sceneItemId = getSceneTreeViewItemId(newScene);
        if (treeViewRef.current) {
          treeViewRef.current.openItems([sceneItemId, scenesRootFolderId]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(sceneItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(sceneItemId);
      },
      [
        project,
        onProjectItemModified,
        editName,
        scrollToItem,
        onSceneAdded,
        onSceneCreated,
      ]
    );

    const onCreateNewExtension = React.useCallback(
      (project: gdProject, i18n: I18nType) => {
        const newName = newNameGenerator(i18n._(t`UntitledExtension`), name =>
          isExtensionNameTaken(name, project)
        );
        const eventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
          newName,
          project.getEventsFunctionsExtensionsCount()
        );
        setExtensionsSearchDialogOpen(false);
        onProjectItemModified();

        const extensionItemId = getExtensionTreeViewItemId(
          eventsFunctionsExtension
        );
        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            extensionItemId,
            extensionsRootFolderId,
          ]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(extensionItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(extensionItemId);
      },
      [editName, onProjectItemModified, scrollToItem]
    );

    const { translatedExtensionShortHeadersByName } = React.useContext(
      ExtensionStoreContext
    );

    const onEditEventsFunctionExtensionOrSeeDetails = React.useCallback(
      (eventsFunctionsExtension: gdEventsFunctionsExtension) => {
        const name = eventsFunctionsExtension.getName();
        // If the extension is coming from the store, open its details.
        // If that's not the case, or if it cannot be found in the store, edit it directly.
        const originName = eventsFunctionsExtension.getOriginName();
        if (originName !== 'gdevelop-extension-store') {
          onOpenEventsFunctionsExtension(name);
          return;
        }
        const originIdentifier = eventsFunctionsExtension.getOriginIdentifier();
        const extensionShortHeader =
          translatedExtensionShortHeadersByName[originIdentifier];
        if (!extensionShortHeader) {
          console.warn(
            `This extension was downloaded from the store but its reference ${originIdentifier} couldn't be found in the store. Opening the extension in the editor...`
          );
          onOpenEventsFunctionsExtension(name);
          return;
        }
        // $FlowFixMe[incompatible-type]
        setOpenedExtensionShortHeader(extensionShortHeader);
        // $FlowFixMe[incompatible-type]
        setOpenedExtensionName(name);
      },
      [translatedExtensionShortHeadersByName, onOpenEventsFunctionsExtension]
    );

    const addExternalEvents = React.useCallback(
      (index: number, i18n: I18nType) => {
        if (!project) return;

        const newName = newNameGenerator(
          i18n._(t`Untitled external events`),
          name => project.hasExternalEventsNamed(name)
        );
        const newExternalEvents = project.insertNewExternalEvents(
          newName,
          index + 1
        );
        onProjectItemModified();

        const externalEventsItemId = getExternalEventsTreeViewItemId(
          newExternalEvents
        );
        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            externalEventsItemId,
            externalEventsRootFolderId,
          ]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(externalEventsItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(externalEventsItemId);
      },
      [project, onProjectItemModified, editName, scrollToItem]
    );

    const addExternalLayout = React.useCallback(
      (index: number, i18n: I18nType) => {
        if (!project) return;

        const newName = newNameGenerator(
          i18n._(t`Untitled external layout`),
          name => project.hasExternalLayoutNamed(name)
        );
        const newExternalLayout = project.insertNewExternalLayout(
          newName,
          index + 1
        );

        onExternalLayoutAdded();

        onProjectItemModified();

        const externalLayoutItemId = getExternalLayoutTreeViewItemId(
          newExternalLayout
        );
        if (treeViewRef.current) {
          treeViewRef.current.openItems([
            externalLayoutItemId,
            externalLayoutsRootFolderId,
          ]);
        }
        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(externalLayoutItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        editName(externalLayoutItemId);
      },
      [
        project,
        onProjectItemModified,
        editName,
        scrollToItem,
        onExternalLayoutAdded,
      ]
    );

    const onTreeModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, triggerUnsavedChanges]
    );

    // Initialize keyboard shortcuts as empty.
    // onDelete callback is set outside because it deletes the selected
    // item (that is a props). As it is stored in a ref, the keyboard shortcut
    // instance does not update with selectedItems changes.
    const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
      new KeyboardShortcuts({
        shortcutCallbacks: {},
      })
    );
    React.useEffect(
      () => {
        if (keyboardShortcutsRef.current) {
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            if (selectedItems.length > 0) {
              deleteItem(selectedItems[0]);
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            if (selectedItems.length > 0) {
              editName(selectedItems[0].content.getId());
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onCopy', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.copy();
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onPaste', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.paste();
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback('onCut', () => {
            if (selectedItems.length > 0) {
              selectedItems[0].content.cut();
            }
          });
        }
      },
      [editName, selectedItems]
    );

    const sceneTreeViewItemProps = React.useMemo<?SceneTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              editName,
              scrollToItem,
              onSceneAdded,
              onSceneCreated,
              onDeleteLayout,
              onRenameLayout,
              onOpenLayout,
              onOpenLayoutProperties,
              onOpenLayoutVariables,
              getSceneFoldersForMenu: () => sceneFolderPathsForMenu,
              getSceneFolderId,
              onMoveSceneToFolder,
              onCreateSceneFolderWithScene,
              getSceneWorkflowColumn,
              getSceneVersionControlStatus,
              isSceneInFolder,
            }
          : null,
      [
        project,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onSceneAdded,
        onSceneCreated,
        onDeleteLayout,
        onRenameLayout,
        onOpenLayout,
        onOpenLayoutProperties,
        onOpenLayoutVariables,
        sceneFolderPathsForMenu,
        getSceneFolderId,
        onMoveSceneToFolder,
        onCreateSceneFolderWithScene,
        getSceneWorkflowColumn,
        getSceneVersionControlStatus,
        isSceneInFolder,
      ]
    );

    const sceneFolderTreeViewItemProps = React.useMemo<?SceneFolderTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              editName,
              scrollToItem,
              onRenameSceneFolder,
              onDeleteSceneFolder,
              onAddSceneFolder,
              isFolderDescendantOf,
              getFolderIndex,
            }
          : null,
      [
        project,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onRenameSceneFolder,
        onDeleteSceneFolder,
        onAddSceneFolder,
        isFolderDescendantOf,
        getFolderIndex,
      ]
    );

    const extensionTreeViewItemProps = React.useMemo<?ExtensionTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              editName,
              scrollToItem,
              onDeleteEventsFunctionsExtension,
              onRenameEventsFunctionsExtension,
              onOpenEventsFunctionsExtension,
              onReloadEventsFunctionsExtensions,
              onEditEventsFunctionExtensionOrSeeDetails,
            }
          : null,
      [
        project,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onDeleteEventsFunctionsExtension,
        onRenameEventsFunctionsExtension,
        onOpenEventsFunctionsExtension,
        onReloadEventsFunctionsExtensions,
        onEditEventsFunctionExtensionOrSeeDetails,
      ]
    );

    const externalEventsTreeViewItemProps = React.useMemo<?ExternalEventsTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              editName,
              scrollToItem,
              onDeleteExternalEvents,
              onRenameExternalEvents,
              onOpenExternalEvents,
            }
          : null,
      [
        project,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onDeleteExternalEvents,
        onRenameExternalEvents,
        onOpenExternalEvents,
      ]
    );

    const externalLayoutTreeViewItemProps = React.useMemo<?ExternalLayoutTreeViewItemProps>(
      () =>
        project
          ? {
              project,
              unsavedChanges,
              preferences,
              gdevelopTheme,
              forceUpdate,
              forceUpdateList,
              showDeleteConfirmation,
              editName,
              scrollToItem,
              onExternalLayoutAdded,
              onDeleteExternalLayout,
              onRenameExternalLayout,
              onOpenExternalLayout,
            }
          : null,
      [
        project,
        unsavedChanges,
        preferences,
        gdevelopTheme,
        forceUpdate,
        forceUpdateList,
        showDeleteConfirmation,
        editName,
        scrollToItem,
        onExternalLayoutAdded,
        onDeleteExternalLayout,
        onRenameExternalLayout,
        onOpenExternalLayout,
      ]
    );

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return !project ||
          !sceneTreeViewItemProps ||
          !sceneFolderTreeViewItemProps ||
          !extensionTreeViewItemProps ||
          !externalEventsTreeViewItemProps ||
          !externalLayoutTreeViewItemProps
          ? []
          : [
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  gameSettingsRootFolderId,
                  i18n._(t`Game settings`)
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  return [
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        gamePropertiesItemId,
                        i18n._(t`Properties & Icons`),
                        openProjectProperties,
                        'res/icons_default/properties_black.svg'
                      )
                    ),
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        globalVariablesItemId,
                        i18n._(t`Global variables`),
                        openProjectVariables,
                        'res/icons_default/global_variable24_black.svg'
                      )
                    ),
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        gameResourcesItemId,
                        i18n._(t`Resources`),
                        onOpenResources,
                        'res/icons_default/project_resources_black.svg'
                      )
                    ),
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        gameDashboardItemId,
                        i18n._(t`Game Dashboard`),
                        onOpenGamesDashboardDialog,
                        'res/icons_default/graphs_black.svg'
                      )
                    ),
                  ];
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  scenesRootFolderId,
                  i18n._(t`Scenes`),
                  [
                    {
                      icon: <Add />,
                      label: i18n._(t`Add a scene`),
                      click: () => {
                        // TODO Add after selected scene?
                        const index = project.getLayoutsCount() - 1;
                        addNewScene(index, i18n);
                      },
                      id: 'add-new-scene-button',
                      primary: true,
                    },
                    {
                      icon: <CreateNewFolder />,
                      label: i18n._(t`Add a folder`),
                      click: () => onAddSceneFolder(null, i18n._(t`New folder`)),
                      id: 'add-new-scene-folder-button',
                    },
                    {
                      icon: <ViewColumn />,
                      label: i18n._(t`Scene workflow`),
                      click: () => setSceneWorkflowDialogOpen(true),
                      id: 'open-scene-workflow-button',
                    },
                  ]
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  const createSceneItem = (sceneName: string) => {
                    if (!project.hasLayoutNamed(sceneName)) return null;
                    return new LeafTreeViewItem(
                      new SceneTreeViewItemContent(
                        project.getLayout(sceneName),
                        sceneTreeViewItemProps
                      )
                    );
                  };

                  const createSceneFolderItem = (folder: SceneFolder) => ({
                    content: new SceneFolderTreeViewItemContent(
                      folder,
                      sceneFolderTreeViewItemProps
                    ),
                    getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                      const childItems = [];
                      folder.childFolderIds.forEach(childId => {
                        const childFolder = sceneFoldersById.get(childId);
                        if (!childFolder) return;
                        childItems.push(createSceneFolderItem(childFolder));
                      });
                      folder.sceneNames.forEach(sceneName => {
                        const item = createSceneItem(sceneName);
                        if (item) childItems.push(item);
                      });
                      return childItems;
                    },
                  });

                  const items = [];
                  sceneWorkflowMetadataValue.sceneFolders.rootFolderIds.forEach(
                    folderId => {
                      const folder = sceneFoldersById.get(folderId);
                      if (!folder) return;
                      items.push(createSceneFolderItem(folder));
                    }
                  );
                  sceneWorkflowMetadataValue.sceneFolders.rootSceneNames.forEach(
                    sceneName => {
                      const item = createSceneItem(sceneName);
                      if (item) items.push(item);
                    }
                  );

                  if (items.length === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        scenesEmptyPlaceholderId,
                        i18n._(t`Start by adding a new scene.`)
                      ),
                    ];
                  }
                  return items;
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  extensionsRootFolderId,
                  i18n._(t`Extensions`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Create or search for new extensions`),
                    click: openSearchExtensionDialog,
                    id: 'project-manager-extension-search-or-create',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  if (project.getEventsFunctionsExtensionsCount() === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        extensionsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new function.`)
                      ),
                    ];
                  }
                  return mapFor(
                    0,
                    project.getEventsFunctionsExtensionsCount(),
                    i =>
                      new LeafTreeViewItem(
                        new ExtensionTreeViewItemContent(
                          project.getEventsFunctionsExtensionAt(i),
                          extensionTreeViewItemProps
                        )
                      )
                  );
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  externalEventsRootFolderId,
                  i18n._(t`External events`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add external events`),
                    click: () => {
                      // TODO Add after selected scene?
                      const index = project.getExternalEventsCount() - 1;
                      addExternalEvents(index, i18n);
                    },
                    id: 'add-new-external-events-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  if (project.getExternalEventsCount() === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        externalEventsEmptyPlaceholderId,
                        i18n._(t`Start by adding new external events.`)
                      ),
                    ];
                  }
                  return mapFor(
                    0,
                    project.getExternalEventsCount(),
                    i =>
                      new LeafTreeViewItem(
                        new ExternalEventsTreeViewItemContent(
                          project.getExternalEventsAt(i),
                          externalEventsTreeViewItemProps
                        )
                      )
                  );
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  externalLayoutsRootFolderId,
                  i18n._(t`External layouts`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Add an external layout`),
                    click: () => {
                      // TODO Add after selected scene?
                      const index = project.getExternalLayoutsCount() - 1;
                      addExternalLayout(index, i18n);
                    },
                    id: 'add-new-external-layout-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  if (project.getExternalLayoutsCount() === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        externalLayoutEmptyPlaceholderId,
                        i18n._(t`Start by adding a new external layout.`)
                      ),
                    ];
                  }
                  return mapFor(
                    0,
                    project.getExternalLayoutsCount(),
                    i =>
                      new LeafTreeViewItem(
                        new ExternalLayoutTreeViewItemContent(
                          project.getExternalLayoutAt(i),
                          externalLayoutTreeViewItemProps
                        )
                      )
                  );
                },
              },
            ];
      },
      [
        addExternalEvents,
        addExternalLayout,
        addNewScene,
        onAddSceneFolder,
        sceneFoldersById,
        sceneFolderTreeViewItemProps,
        sceneWorkflowMetadataValue,
        extensionTreeViewItemProps,
        externalEventsTreeViewItemProps,
        externalLayoutTreeViewItemProps,
        onOpenGamesDashboardDialog,
        onOpenResources,
        openProjectProperties,
        openProjectVariables,
        openSearchExtensionDialog,
        project,
        sceneTreeViewItemProps,
        setSceneWorkflowDialogOpen,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem, where: 'before' | 'inside' | 'after') => {
        if (selectedItems.length === 0) return false;
        const selectedItem = selectedItems[0];
        const selectedId = selectedItem.content.getId();
        const destinationId = destinationItem.content.getId();
        const selectedFolderId = getSceneFolderIdFromTreeViewItemId(selectedId);
        const destinationFolderId = getSceneFolderIdFromTreeViewItemId(
          destinationId
        );
        const selectedIsFolder = !!selectedFolderId;
        const selectedIsScene =
          selectedId.startsWith('scene-') && !selectedIsFolder;
        const destinationIsFolder = !!destinationFolderId;
        const destinationIsScene =
          destinationId.startsWith('scene-') && !destinationIsFolder;
        const destinationIsRoot =
          destinationItem.isRoot && destinationId === scenesRootFolderId;

        if (selectedIsScene || selectedIsFolder) {
          if (
            !destinationIsRoot &&
            destinationItem.content.getRootId() !== scenesRootFolderId
          )
            return false;
          if (selectedIsScene) {
            if (destinationIsScene) return true;
            if (destinationIsFolder) return where === 'inside';
            if (destinationIsRoot) return where === 'inside';
            return false;
          }
          if (selectedIsFolder) {
            if (destinationIsScene) return false;
            if (destinationIsFolder) {
              if (!selectedFolderId || !destinationFolderId) return false;
              if (selectedFolderId === destinationFolderId) return false;
              if (isFolderDescendantOf(destinationFolderId, selectedFolderId))
                return false;
              return true;
            }
            if (destinationIsRoot) return where === 'inside';
            return false;
          }
        }

        return selectedItems.every(item => {
          return (
            // Project and game settings children `getRootId` return an empty string.
            item.content.getRootId().length > 0 &&
            item.content.getRootId() === destinationItem.content.getRootId()
          );
        });
      },
      [selectedItems, isFolderDescendantOf]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (selectedItems.length === 0) {
          return;
        }
        const selectedItem = selectedItems[0];
        const selectedId = selectedItem.content.getId();
        const destinationId = destinationItem.content.getId();
        const selectedFolderId = getSceneFolderIdFromTreeViewItemId(selectedId);
        const destinationFolderId = getSceneFolderIdFromTreeViewItemId(
          destinationId
        );
        const selectedIsFolder = !!selectedFolderId;
        const selectedIsScene =
          selectedId.startsWith('scene-') && !selectedIsFolder;
        const destinationIsFolder = !!destinationFolderId;
        const destinationIsScene =
          destinationId.startsWith('scene-') && !destinationIsFolder;
        const destinationIsRoot =
          destinationItem.isRoot && destinationId === scenesRootFolderId;

        if (selectedIsScene || selectedIsFolder) {
          if (selectedIsScene) {
            const selectedSceneName = selectedItem.content.getName();
            if (typeof selectedSceneName !== 'string') return;
            let targetFolderId = null;
            let targetIndex = null;

            if (destinationIsScene) {
              const destinationSceneName = destinationItem.content.getName();
              if (typeof destinationSceneName !== 'string') return;
              const destinationParentFolderId =
                sceneFolderIdBySceneName[destinationSceneName] || null;
              const destinationParentFolder = destinationParentFolderId
                ? sceneFoldersById.get(destinationParentFolderId)
                : null;
              const destinationList =
                destinationParentFolder && destinationParentFolderId
                  ? destinationParentFolder.sceneNames
                  : sceneWorkflowMetadataValue.sceneFolders.rootSceneNames;
              const destinationIndex =
                destinationList.indexOf(destinationSceneName);
              targetFolderId = destinationParentFolderId;
              targetIndex =
                destinationIndex + (where === 'after' ? 1 : 0);
              const selectedIndex = destinationList.indexOf(selectedSceneName);
              if (selectedIndex !== -1 && selectedIndex < destinationIndex) {
                targetIndex -= 1;
              }
            } else if (destinationIsFolder && where === 'inside') {
              targetFolderId = destinationFolderId;
              targetIndex = null;
            } else if (destinationIsRoot && where === 'inside') {
              targetFolderId = null;
              targetIndex = null;
            } else {
              return;
            }

            updateSceneWorkflowMetadata(previous => {
              const nextSceneFolders = updateSceneFoldersForSceneMove(
                previous.sceneFolders,
                selectedSceneName,
                targetFolderId,
                targetIndex
              );
              const nextMetadata = {
                ...previous,
                sceneFolders: nextSceneFolders,
              };
              applySceneOrderToProject(nextMetadata);
              return nextMetadata;
            });
            onTreeModified(true);
            return;
          }

          if (selectedIsFolder) {
            if (!selectedFolderId) return;
            let targetFolderId = null;
            let targetIndex = null;
            if (destinationIsFolder) {
              if (!destinationFolderId) return;
              if (selectedFolderId === destinationFolderId) return;
              const destinationParentId =
                sceneFolderParentById[destinationFolderId] || null;
              const destinationParentFolder = destinationParentId
                ? sceneFoldersById.get(destinationParentId)
                : null;
              const destinationList =
                destinationParentFolder && destinationParentId
                  ? destinationParentFolder.childFolderIds
                  : sceneWorkflowMetadataValue.sceneFolders.rootFolderIds;
              const destinationIndex =
                destinationList.indexOf(destinationFolderId);
              targetFolderId =
                where === 'inside' ? destinationFolderId : destinationParentId;
              if (where === 'inside') {
                targetIndex = null;
              } else {
                targetIndex =
                  destinationIndex + (where === 'after' ? 1 : 0);
                const selectedIndex = destinationList.indexOf(selectedFolderId);
                if (selectedIndex !== -1 && selectedIndex < destinationIndex) {
                  targetIndex -= 1;
                }
              }
            } else if (destinationIsRoot && where === 'inside') {
              targetFolderId = null;
              targetIndex = null;
            } else {
              return;
            }

            updateSceneWorkflowMetadata(previous => {
              const nextSceneFolders = updateSceneFoldersForFolderMove(
                previous.sceneFolders,
                selectedFolderId,
                targetFolderId,
                targetIndex
              );
              const nextMetadata = {
                ...previous,
                sceneFolders: nextSceneFolders,
              };
              applySceneOrderToProject(nextMetadata);
              return nextMetadata;
            });
            onTreeModified(true);
            return;
          }
        }

        selectedItem.content.moveAt(
          destinationItem.content.getIndex() + (where === 'after' ? 1 : 0)
        );
        onTreeModified(true);
      },
      [
        selectedItems,
        sceneFolderIdBySceneName,
        sceneFoldersById,
        sceneWorkflowMetadataValue,
        sceneFolderParentById,
        updateSceneWorkflowMetadata,
        applySceneOrderToProject,
        onTreeModified,
      ]
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback(
      (item: TreeViewItem) => {
        if (selectedItems.length !== 1 || item.isPlaceholder) {
          return;
        }
        if (selectedItems[0].content.isDescendantOf(item.content)) {
          setSelectedItems([]);
        }
      },
      [selectedItems]
    );

    // Force List component to be mounted again if project
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project ? project.ptr : 'no-project';
    const initiallyOpenedNodeIds = [
      gameSettingsRootFolderId,
      scenesRootFolderId,
      extensionsRootFolderId,
      externalEventsRootFolderId,
      externalLayoutsRootFolderId,
    ];

    const [
      selectedMainMenuItemIndices,
      setSelectedMainMenuItemIndices,
      // $FlowFixMe[missing-empty-array-annot]
    ] = React.useState([]);
    const isNavigatingInMainMenuItem = selectedMainMenuItemIndices.length > 0;
    const shouldHideMainMenu = isMacLike() && !!electron;

    // Unselect items when the project manager is closed.
    React.useEffect(
      () => {
        if (!isOpen) {
          setSelectedMainMenuItemIndices([]);
        }
      },
      [isOpen]
    );

    return (
      <Background maxWidth>
        <ProjectManagerCommands
          project={project}
          onOpenProjectProperties={openProjectProperties}
          onOpenProjectLoadingScreen={openProjectLoadingScreen}
          onOpenProjectVariables={openProjectVariables}
          onOpenResourcesDialog={onOpenResources}
          onOpenPlatformSpecificAssetsDialog={openProjectIcons}
          onOpenSearchExtensionDialog={openSearchExtensionDialog}
        />
        <Line expand>
          <ColumnStackLayout noMargin expand>
            {!shouldHideMainMenu && (
              <ProjectManagerMainMenu
                project={project}
                mainMenuCallbacks={mainMenuCallbacks}
                buildMainMenuProps={buildMainMenuProps}
                selectedMainMenuItemIndices={selectedMainMenuItemIndices}
                setSelectedMainMenuItemIndices={setSelectedMainMenuItemIndices}
                closeDrawer={toggleProjectManager}
              />
            )}
            {!isNavigatingInMainMenuItem && project && (
              <Line noMargin>
                <Column expand>
                  <CompactSearchBar
                    ref={searchBarRef}
                    value={searchText}
                    onChange={setSearchText}
                    placeholder={t`Search in project`}
                  />
                </Column>
              </Line>
            )}
            <I18n>
              {({ i18n }) => (
                <>
                  {isNavigatingInMainMenuItem ? null : project ? (
                    <div
                      id="project-manager"
                      style={{
                        ...styles.listContainer,
                        ...styles.autoSizerContainer,
                      }}
                      onKeyDown={keyboardShortcutsRef.current.onKeyDown}
                      onKeyUp={keyboardShortcutsRef.current.onKeyUp}
                    >
                      <AutoSizer style={styles.autoSizer} disableWidth>
                        {({ height }) => (
                          // $FlowFixMe[incompatible-type]
                          // $FlowFixMe[incompatible-exact]
                          <TreeView
                            key={listKey}
                            ref={treeViewRef}
                            items={getTreeViewData(i18n)}
                            height={height}
                            forceAllOpened={!!currentlyRunningInAppTutorial}
                            searchText={searchText}
                            getItemName={getTreeViewItemName}
                            getItemThumbnail={getTreeViewItemThumbnail}
                            getItemChildren={getTreeViewItemChildren(i18n)}
                            multiSelect={false}
                            getItemId={getTreeViewItemId}
                            getItemHtmlId={getTreeViewItemHtmlId}
                            getItemDataset={getTreeViewItemDataSet}
                            onEditItem={editItem}
                            onCollapseItem={onCollapseItem}
                            selectedItems={selectedItems}
                            onSelectItems={items => {
                              const itemToSelect = items[0];
                              if (!itemToSelect) return;
                              if (itemToSelect.isRoot) return;
                              setSelectedItems(items);
                            }}
                            onClickItem={onClickItem}
                            onRenameItem={renameItem}
                            buildMenuTemplate={buildMenuTemplate(i18n)}
                            getItemRightButton={getTreeViewItemRightButton(
                              i18n
                            )}
                            renderRightComponent={renderTreeViewItemRightComponent(
                              i18n
                            )}
                            onMoveSelectionToItem={(destinationItem, where) =>
                              moveSelectionTo(i18n, destinationItem, where)
                            }
                            canMoveSelectionToItem={canMoveSelectionTo}
                            reactDndType={extensionItemReactDndType}
                            initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                            forceDefaultDraggingPreview
                            shouldHideMenuIcon={item =>
                              !item.content.getRootId()
                            }
                          />
                        )}
                      </AutoSizer>
                    </div>
                  ) : (
                    <EmptyMessage>
                      <Trans>To begin, open or create a new project.</Trans>
                    </EmptyMessage>
                  )}
                  {projectPropertiesDialogOpen &&
                    project &&
                    projectScopedContainersAccessor && (
                      <ProjectPropertiesDialog
                        open
                        // $FlowFixMe[incompatible-type]
                        initialTab={projectPropertiesDialogInitialTab}
                        project={project}
                        onClose={() => setProjectPropertiesDialogOpen(false)}
                        onApply={onSaveProjectProperties}
                        onPropertiesApplied={onProjectPropertiesApplied}
                        resourceManagementProps={resourceManagementProps}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        hotReloadPreviewButtonProps={
                          hotReloadPreviewButtonProps
                        }
                        i18n={i18n}
                      />
                    )}
                  {project && projectVariablesEditorOpen && (
                    <GlobalVariablesDialog
                      project={project}
                      open
                      onCancel={() => setProjectVariablesEditorOpen(false)}
                      onApply={() => {
                        triggerUnsavedChanges();
                        setProjectVariablesEditorOpen(false);
                      }}
                      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                      isListLocked={false}
                    />
                  )}
                  {!!editedPropertiesLayout &&
                    project &&
                    projectScopedContainersAccessor && (
                      <ScenePropertiesDialog
                        open
                        layout={editedPropertiesLayout}
                        project={project}
                        onApply={() => {
                          triggerUnsavedChanges();
                          onOpenLayoutProperties(null);
                        }}
                        onClose={() => onOpenLayoutProperties(null)}
                        onEditVariables={() => {
                          onOpenLayoutVariables(editedPropertiesLayout);
                          onOpenLayoutProperties(null);
                        }}
                        resourceManagementProps={resourceManagementProps}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        onBackgroundColorChanged={() => {
                          // TODO This can probably wait the rework of scene properties.
                        }}
                      />
                    )}
                  {project && !!editedVariablesLayout && (
                    <SceneVariablesDialog
                      open
                      project={project}
                      layout={editedVariablesLayout}
                      onCancel={() => onOpenLayoutVariables(null)}
                      onApply={() => {
                        triggerUnsavedChanges();
                        onOpenLayoutVariables(null);
                      }}
                      hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                      isListLocked={false}
                    />
                  )}
                  {project && sceneWorkflowDialogOpen && (
                    <SceneWorkflowDialog
                      open
                      project={project}
                      metadata={sceneWorkflowMetadataValue}
                      onUpdateMetadata={updateSceneWorkflowMetadata}
                      onOpenScene={sceneName =>
                        onOpenLayout(sceneName, {
                          openEventsEditor: true,
                          openSceneEditor: true,
                          focusWhenOpened: 'scene',
                        })
                      }
                      onClose={() => setSceneWorkflowDialogOpen(false)}
                    />
                  )}
                  {project && extensionsSearchDialogOpen && (
                    <ExtensionsSearchDialog
                      project={project}
                      onClose={() => setExtensionsSearchDialogOpen(false)}
                      onWillInstallExtension={onWillInstallExtension}
                      onCreateNew={() => {
                        onCreateNewExtension(project, i18n);
                      }}
                      onExtensionInstalled={onExtensionInstalled}
                    />
                  )}
                  {project &&
                    openedExtensionShortHeader &&
                    openedExtensionName && (
                      <InstalledExtensionDetails
                        project={project}
                        onClose={() => {
                          setOpenedExtensionShortHeader(null);
                          setOpenedExtensionName(null);
                        }}
                        onOpenEventsFunctionsExtension={
                          onOpenEventsFunctionsExtension
                        }
                        extensionShortHeader={openedExtensionShortHeader}
                        extensionName={openedExtensionName}
                        onWillInstallExtension={onWillInstallExtension}
                        onExtensionInstalled={onExtensionInstalled}
                      />
                    )}
                </>
              )}
            </I18n>
          </ColumnStackLayout>
        </Line>
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to the tree is made outside
  // from the component.
  // If a change is made, the component won't notice it: you have to manually
  // call forceUpdate.
  !nextProps.isOpen;

// $FlowFixMe[incompatible-type]
const MemoizedProjectManager = React.memo<Props, ProjectManagerInterface>(
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  ProjectManager,
  arePropsEqual
);

const ProjectManagerWithErrorBoundary: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<ProjectManagerInterface>,
}> = React.forwardRef<Props, ProjectManagerInterface>((props, outerRef) => {
  const projectManagerRef = React.useRef<?ProjectManagerInterface>(null);
  const shouldAutofocusInput = useShouldAutofocusInput();

  React.useEffect(
    () => {
      const timeoutId = setTimeout(() => {
        if (props.isOpen && shouldAutofocusInput && projectManagerRef.current) {
          projectManagerRef.current.focusSearchBar();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    },
    [props.isOpen, shouldAutofocusInput]
  );

  return (
    <ErrorBoundary
      componentTitle={<Trans>Project manager</Trans>}
      scope="project-manager"
    >
      {/* $FlowFixMe[incompatible-type] */}
      <MemoizedProjectManager
        // $FlowFixMe[missing-local-annot]
        ref={ref => {
          projectManagerRef.current = ref;
          if (typeof outerRef === 'function') outerRef(ref);
          // $FlowFixMe[incompatible-use]
          else if (outerRef !== null) outerRef.current = ref;
        }}
        {...props}
      />
    </ErrorBoundary>
  );
});

export default ProjectManagerWithErrorBoundary;
