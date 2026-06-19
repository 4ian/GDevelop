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
import ProjectExtensionsDialog from './ProjectExtensionsDialog';
import CreateEventsFunctionExtensionItemDialog, {
  type ExtensionItemKind,
  type CreateExtensionItemPayload,
} from './CreateEventsFunctionExtensionItemDialog';
import ProjectItemUsageDialog from './ProjectItemUsageDialog';
import { type ProjectItemUsageTarget } from './ProjectItemUsageFinder';
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
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  SceneTreeViewItemContent,
  SceneEventsTreeViewItemContent,
  getSceneTreeViewItemId,
  getSceneEventsTreeViewItemId,
  type SceneTreeViewItemProps,
  type SceneTreeViewItemCallbacks,
} from './SceneTreeViewItemContent';
import {
  getExtensionTreeViewItemId,
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
import {
  CustomObjectTreeViewItemContent,
  CustomObjectVariantTreeViewItemContent,
  getCustomObjectTreeViewItemId,
  getCustomObjectVariantTreeViewItemId,
  type CustomObjectTreeViewItemProps,
  type CustomObjectTreeViewItemCallbacks,
} from './CustomObjectTreeViewItemContent';
import {
  BehaviorShortcutTreeViewItemContent,
  getBehaviorShortcutTreeViewItemId,
  type BehaviorShortcutTreeViewItemProps,
  type BehaviorShortcutTreeViewItemCallbacks,
} from './BehaviorShortcutTreeViewItemContent';
import {
  FunctionShortcutTreeViewItemContent,
  getFunctionShortcutTreeViewItemId,
  type FunctionShortcutTreeViewItemProps,
  type FunctionShortcutTreeViewItemCallbacks,
} from './FunctionShortcutTreeViewItemContent';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { type ShowConfirmDeleteDialogOptions } from '../UI/Alert/AlertContext';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import { ExtensionStoreContext } from '../AssetStore/ExtensionStore/ExtensionStoreContext';
import { type HTMLDataset } from '../Utils/HTMLDataset';
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
import { enumerateFunctionsInFolder } from '../EventsFunctionsList/EnumerateFunctionFolderOrFunction';
import PreferencesIcon from '../UI/CustomSvgIcons/Preferences';
import classes from './ProjectManager.module.css';

const electron = optionalRequire('electron');
const gd: libGDevelop = global.gd;

export const getProjectManagerItemId = (identifier: string): string =>
  `project-manager-tab-${identifier}`;

const gameSettingsRootFolderId = getProjectManagerItemId('game-settings');
const gamePropertiesItemId = getProjectManagerItemId('game-properties');
const gameResourcesItemId = getProjectManagerItemId('game-resources');
const gameExtensionsItemId = getProjectManagerItemId('game-extensions');
const gameShareItemId = getProjectManagerItemId('game-share');
export const scenesRootFolderId: string = getProjectManagerItemId('scenes');
export const customObjectsRootFolderId: string = getProjectManagerItemId(
  'custom-objects'
);
export const behaviorsRootFolderId: string = getProjectManagerItemId(
  'behaviors'
);
export const functionsRootFolderId: string = getProjectManagerItemId(
  'functions'
);
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
const customObjectsEmptyPlaceholderId = 'custom-objects-placeholder';
const behaviorsEmptyPlaceholderId = 'behaviors-placeholder';
const functionsEmptyPlaceholderId = 'functions-placeholder';
const externalEventsEmptyPlaceholderId = 'external-events-placeholder';
const externalLayoutEmptyPlaceholderId = 'external-layout-placeholder';

/**
 * Given the currently focused editor tab (its kind and the name of the
 * layout/external layout/external events/extension/custom object it edits),
 * returns the id of the matching item in the project manager tree view, or null
 * if there is no corresponding item. This is used to highlight and scroll to
 * the item matching the focused page when the project manager is opened.
 *
 * `editorKind` and `projectItemName` come from the EditorTab and are kept as
 * plain values (rather than importing the EditorKind type) to avoid pulling
 * editor containers into the project manager module.
 */
export const getProjectManagerTreeViewItemIdForEditorTab = (
  project: ?gdProject,
  editorKind: ?string,
  projectItemName: ?string
): ?string => {
  if (!project || !editorKind) return null;

  switch (editorKind) {
    case 'resources':
      return gameResourcesItemId;
    case 'layout':
      return projectItemName && project.hasLayoutNamed(projectItemName)
        ? getSceneTreeViewItemId(project.getLayout(projectItemName))
        : null;
    case 'layout events':
      return projectItemName && project.hasLayoutNamed(projectItemName)
        ? getSceneEventsTreeViewItemId(project.getLayout(projectItemName))
        : null;
    case 'external layout':
      return projectItemName && project.hasExternalLayoutNamed(projectItemName)
        ? getExternalLayoutTreeViewItemId(
            project.getExternalLayout(projectItemName)
          )
        : null;
    case 'external events':
      return projectItemName && project.hasExternalEventsNamed(projectItemName)
        ? getExternalEventsTreeViewItemId(
            project.getExternalEvents(projectItemName)
          )
        : null;
    case 'events functions extension':
      return projectItemName &&
        project.hasEventsFunctionsExtensionNamed(projectItemName)
        ? getExtensionTreeViewItemId(
            project.getEventsFunctionsExtension(projectItemName)
          )
        : null;
    case 'behavior detail': {
      // projectItemName is "extensionName::behaviorName".
      if (!projectItemName) return null;
      const [extensionName, behaviorName] = projectItemName.split('::');
      if (
        !extensionName ||
        !behaviorName ||
        !project.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
        return null;
      }
      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
      if (!eventsBasedBehaviors.has(behaviorName)) return null;
      return getBehaviorShortcutTreeViewItemId(
        eventsFunctionsExtension,
        eventsBasedBehaviors.get(behaviorName)
      );
    }
    case 'function detail': {
      // projectItemName is "extensionName::functionName".
      if (!projectItemName) return null;
      const [extensionName, functionName] = projectItemName.split('::');
      if (
        !extensionName ||
        !functionName ||
        !project.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
        return null;
      }
      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      const eventsFunctions = eventsFunctionsExtension.getEventsFunctions();
      if (!eventsFunctions.hasEventsFunctionNamed(functionName)) return null;
      return getFunctionShortcutTreeViewItemId(
        eventsFunctionsExtension,
        eventsFunctions.getEventsFunction(functionName)
      );
    }
    case 'prefab detail': {
      // projectItemName is "extensionName::objectName".
      if (!projectItemName) return null;
      const [extensionName, objectName] = projectItemName.split('::');
      if (
        !extensionName ||
        !objectName ||
        !project.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
        return null;
      }
      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
      if (!eventsBasedObjects.has(objectName)) return null;
      return getCustomObjectTreeViewItemId(
        eventsFunctionsExtension,
        eventsBasedObjects.get(objectName)
      );
    }
    case 'custom object': {
      // projectItemName is "extensionName::objectName[::variantName]".
      if (!projectItemName) return null;
      const [extensionName, objectName, variantName] = projectItemName.split(
        '::'
      );
      if (
        !extensionName ||
        !objectName ||
        !project.hasEventsFunctionsExtensionNamed(extensionName)
      ) {
        return null;
      }
      const eventsFunctionsExtension = project.getEventsFunctionsExtension(
        extensionName
      );
      const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
      if (!eventsBasedObjects.has(objectName)) return null;
      const eventsBasedObject = eventsBasedObjects.get(objectName);
      if (
        variantName &&
        eventsBasedObject.getVariants().hasVariantNamed(variantName)
      ) {
        return getCustomObjectVariantTreeViewItemId(
          eventsFunctionsExtension,
          eventsBasedObject,
          eventsBasedObject.getVariants().getVariant(variantName)
        );
      }
      return getCustomObjectTreeViewItemId(
        eventsFunctionsExtension,
        eventsBasedObject
      );
    }
    default:
      return null;
  }
};

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

const extensionItemReactDndType = 'GD_EXTENSION_ITEM';

const isProjectManagerShortcutRootId = (rootId: string): boolean =>
  rootId === customObjectsRootFolderId ||
  rootId === behaviorsRootFolderId ||
  rootId === functionsRootFolderId;

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
  openItems: (itemIds: Array<string>) => void,
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

class TreeViewItemWithChildren implements TreeViewItem {
  content: TreeViewItemContent;
  children: Array<TreeViewItem>;

  constructor(content: TreeViewItemContent, children: Array<TreeViewItem>) {
    this.content = content;
    this.children = children;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return this.children;
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
  rightButton: ?MenuButton;

  constructor(
    id: string,
    label: string | React.Node,
    rightButton?: MenuButton
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      rightButton
        ? [
            {
              id: rightButton.id,
              label: rightButton.label,
              click: rightButton.click,
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

  getRightButton(i18n: I18nType): ?MenuButton {
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

/**
 * Recursively search the tree for an item with the given id, collecting the
 * ids of its ancestors along the way (so they can be opened to make the item
 * visible). Returns null if no matching item is found.
 */
const findTreeViewItemById = (
  items: Array<TreeViewItem>,
  itemId: string,
  i18n: I18nType,
  ancestorIds: Array<string> = []
): ?{| item: TreeViewItem, ancestorIds: Array<string> |} => {
  for (const item of items) {
    if (item.content.getId() === itemId) {
      return { item, ancestorIds };
    }
    const children = item.getChildren(i18n);
    if (children) {
      const found = findTreeViewItemById(children, itemId, i18n, [
        ...ancestorIds,
        item.content.getId(),
      ]);
      if (found) return found;
    }
  }
  return null;
};

export type ProjectManagerInterface = {|
  forceUpdateList: () => void,
  focusSearchBar: () => void,
  selectAndScrollToItemFromId: (itemId: string) => void,
|};

type Props = {|
  project: ?gdProject,
  onChangeProjectName: string => Promise<void>,
  onSaveProjectProperties: (options: { newName?: string }) => Promise<boolean>,
  ...SceneTreeViewItemCallbacks,
  ...ExtensionTreeViewItemCallbacks,
  ...ExternalEventsTreeViewItemCallbacks,
  ...ExternalLayoutTreeViewItemCallbacks,
  ...CustomObjectTreeViewItemCallbacks,
  ...BehaviorShortcutTreeViewItemCallbacks,
  ...FunctionShortcutTreeViewItemCallbacks,
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
      onOpenCustomObjectEditor,
      onRenamedEventsBasedObject,
      onDeletedEventsBasedObject,
      onRenamedEventsBasedObjectVariant,
      onDeletedEventsBasedObjectVariant,
      onEventsBasedObjectChildrenEdited,
      onEventBasedObjectTypeChanged,
      onOpenResources,
      onReloadEventsFunctionsExtensions,
      isOpen,
      hotReloadPreviewButtonProps,
      onWillInstallExtension,
      onShareProject,
      resourceManagementProps,
      projectScopedContainersAccessor,
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
    // Keep references to the latest i18n and tree data builder so imperative
    // methods (which run outside of the render's <I18n> render prop and before
    // getTreeViewData is declared) can traverse the tree.
    const i18nRef = React.useRef<?I18nType>(null);
    const getTreeViewDataRef = React.useRef<?(
      i18n: I18nType
    ) => Array<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();
    const { showDeleteConfirmation } = useAlertDialog();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [searchText, setSearchText] = React.useState('');
    const [
      usageTarget,
      setUsageTarget,
    ] = React.useState<?ProjectItemUsageTarget>(null);
    const onFindUsage = React.useCallback((target: ProjectItemUsageTarget) => {
      setUsageTarget(target);
    }, []);

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);
    const openItems = React.useCallback((itemIds: Array<string>) => {
      if (treeViewRef.current) {
        treeViewRef.current.openItems(itemIds);
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
      projectExtensionsDialogOpen,
      setProjectExtensionsDialogOpen,
    ] = React.useState(false);
    const openProjectExtensionsDialog = React.useCallback(() => {
      setProjectExtensionsDialogOpen(true);
    }, []);
    const [
      createExtensionItemKind,
      setCreateExtensionItemKind,
    ] = React.useState<?ExtensionItemKind>(null);
    const openCreateExtensionItemDialog = React.useCallback(
      (itemKind: ExtensionItemKind) => {
        setCreateExtensionItemKind(itemKind);
      },
      []
    );
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
      selectAndScrollToItemFromId: (itemId: string) => {
        const i18n = i18nRef.current;
        const getTreeViewData = getTreeViewDataRef.current;
        const treeView = treeViewRef.current;
        if (!i18n || !getTreeViewData || !treeView) return;

        const found = findTreeViewItemById(getTreeViewData(i18n), itemId, i18n);
        if (!found) return;

        // Open ancestor folders so the item is visible, then select and scroll
        // to it. Selecting the actual item (not just the id) keeps keyboard
        // shortcuts (rename, delete...) working on it.
        if (found.ancestorIds.length > 0) {
          treeView.openItems(found.ancestorIds);
        }
        setSelectedItems([found.item]);
        // Wait a few ms for the newly opened folders to render before scrolling.
        setTimeout(() => {
          if (treeViewRef.current) {
            treeViewRef.current.scrollToItemFromId(itemId, 'smart');
          }
        }, 100);
      },
    }));

    const onProjectItemModified = React.useCallback(
      () => {
        forceUpdate();
        triggerUnsavedChanges();
      },
      [forceUpdate, triggerUnsavedChanges]
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
      [project, onProjectItemModified, editName, scrollToItem, onSceneAdded]
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
        onOpenEventsFunctionsExtension(
          eventsFunctionsExtension.getName(),
          null,
          null,
          null
        );
      },
      [onOpenEventsFunctionsExtension, onProjectItemModified]
    );

    const onCreateExtensionItem = React.useCallback(
      (payload: CreateExtensionItemPayload) => {
        if (!project) return;

        const eventsFunctionsExtension = payload.newExtensionName
          ? project.insertNewEventsFunctionsExtension(
              payload.newExtensionName,
              project.getEventsFunctionsExtensionsCount()
            )
          : project.getEventsFunctionsExtension(payload.extensionName);

        setCreateExtensionItemKind(null);

        if (payload.itemKind === 'prefab') {
          const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
          const eventsBasedObject = eventsBasedObjects.insertNew(
            payload.itemName,
            eventsBasedObjects.getCount()
          );
          eventsBasedObject.markAsRenderedIn3D(false);
          onProjectItemModified();
          forceUpdateList();

          const itemId = getCustomObjectTreeViewItemId(
            eventsFunctionsExtension,
            eventsBasedObject
          );
          openItems([customObjectsRootFolderId, itemId]);
          setTimeout(() => scrollToItem(itemId), 100);
          onOpenCustomObjectEditor(
            eventsFunctionsExtension,
            eventsBasedObject,
            ''
          );
          return;
        }

        if (payload.itemKind === 'behavior') {
          const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
          const eventsBasedBehavior = eventsBasedBehaviors.insertNew(
            payload.itemName,
            eventsBasedBehaviors.getCount()
          );
          onProjectItemModified();
          forceUpdateList();

          const itemId = getBehaviorShortcutTreeViewItemId(
            eventsFunctionsExtension,
            eventsBasedBehavior
          );
          openItems([behaviorsRootFolderId]);
          setTimeout(() => scrollToItem(itemId), 100);
          onOpenEventsFunctionsExtension(
            eventsFunctionsExtension.getName(),
            null,
            eventsBasedBehavior.getName(),
            null
          );
          return;
        }

        const eventsFunctionsContainer = eventsFunctionsExtension.getEventsFunctions();
        const rootFolder = eventsFunctionsContainer.getRootFolder();
        const eventsFunction = eventsFunctionsContainer.insertNewEventsFunctionInFolder(
          payload.itemName,
          rootFolder,
          rootFolder.getChildrenCount()
        );
        eventsFunction.setFunctionType(payload.functionType);
        if (eventsFunction.isCondition() && !eventsFunction.isExpression()) {
          gd.PropertyFunctionGenerator.generateConditionSkeleton(
            project,
            eventsFunction
          );
        }
        onProjectItemModified();
        forceUpdateList();

        const itemId = getFunctionShortcutTreeViewItemId(
          eventsFunctionsExtension,
          eventsFunction
        );
        openItems([functionsRootFolderId]);
        setTimeout(() => scrollToItem(itemId), 100);
        onOpenEventsFunctionsExtension(
          eventsFunctionsExtension.getName(),
          eventsFunction.getName(),
          null,
          null
        );
      },
      [
        forceUpdateList,
        onOpenCustomObjectEditor,
        onOpenEventsFunctionsExtension,
        onProjectItemModified,
        openItems,
        project,
        scrollToItem,
      ]
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
              openItems,
              onSceneAdded,
              onDeleteLayout,
              onRenameLayout,
              onOpenLayout,
              onOpenLayoutProperties,
              onOpenLayoutVariables,
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
        openItems,
        onSceneAdded,
        onDeleteLayout,
        onRenameLayout,
        onOpenLayout,
        onOpenLayoutProperties,
        onOpenLayoutVariables,
      ]
    );

    const customObjectTreeViewItemProps = React.useMemo<?CustomObjectTreeViewItemProps>(
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
              openItems,
              onOpenCustomObjectEditor,
              onRenamedEventsBasedObject,
              onDeletedEventsBasedObject,
              onRenamedEventsBasedObjectVariant,
              onDeletedEventsBasedObjectVariant,
              onEventsBasedObjectChildrenEdited,
              onEventBasedObjectTypeChanged,
              onFindUsage,
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
        openItems,
        onOpenCustomObjectEditor,
        onRenamedEventsBasedObject,
        onDeletedEventsBasedObject,
        onRenamedEventsBasedObjectVariant,
        onDeletedEventsBasedObjectVariant,
        onEventsBasedObjectChildrenEdited,
        onEventBasedObjectTypeChanged,
        onFindUsage,
      ]
    );

    const behaviorShortcutTreeViewItemProps = React.useMemo<?BehaviorShortcutTreeViewItemProps>(
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
              openItems,
              onOpenEventsFunctionsExtension,
              onFindUsage,
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
        openItems,
        onOpenEventsFunctionsExtension,
        onFindUsage,
      ]
    );

    const functionShortcutTreeViewItemProps = React.useMemo<?FunctionShortcutTreeViewItemProps>(
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
              openItems,
              onOpenEventsFunctionsExtension,
              onFindUsage,
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
        openItems,
        onOpenEventsFunctionsExtension,
        onFindUsage,
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
              openItems,
              onDeleteExternalEvents,
              onRenameExternalEvents,
              onOpenExternalEvents,
              onFindUsage,
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
        openItems,
        onDeleteExternalEvents,
        onRenameExternalEvents,
        onOpenExternalEvents,
        onFindUsage,
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
              openItems,
              onExternalLayoutAdded,
              onDeleteExternalLayout,
              onRenameExternalLayout,
              onOpenExternalLayout,
              onFindUsage,
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
        openItems,
        onExternalLayoutAdded,
        onDeleteExternalLayout,
        onRenameExternalLayout,
        onOpenExternalLayout,
        onFindUsage,
      ]
    );

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return !project ||
          !sceneTreeViewItemProps ||
          !customObjectTreeViewItemProps ||
          !behaviorShortcutTreeViewItemProps ||
          !functionShortcutTreeViewItemProps ||
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
                        gameResourcesItemId,
                        i18n._(t`Resources`),
                        onOpenResources,
                        'res/icons_default/project_resources_black.svg'
                      )
                    ),
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        gameExtensionsItemId,
                        i18n._(t`Extensions`),
                        openProjectExtensionsDialog,
                        'res/functions/extension_black.svg'
                      )
                    ),
                    new LeafTreeViewItem(
                      new ActionTreeViewItemContent(
                        gameShareItemId,
                        i18n._(t`Export & Share`),
                        onShareProject,
                        'res/icons_default/publish_black.svg'
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
                  {
                    icon: <Add />,
                    label: i18n._(t`Add a scene`),
                    click: () => {
                      // TODO Add after selected scene?
                      const index = project.getLayoutsCount() - 1;
                      addNewScene(index, i18n);
                    },
                    id: 'add-new-scene-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  if (project.getLayoutsCount() === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        scenesEmptyPlaceholderId,
                        i18n._(t`Start by adding a new scene.`)
                      ),
                    ];
                  }
                  return mapFor(0, project.getLayoutsCount(), i => {
                    const scene = project.getLayoutAt(i);
                    return new TreeViewItemWithChildren(
                      new SceneTreeViewItemContent(
                        scene,
                        sceneTreeViewItemProps
                      ),
                      [
                        new LeafTreeViewItem(
                          new SceneEventsTreeViewItemContent(
                            scene,
                            sceneTreeViewItemProps,
                            i18n._(t`Events`)
                          )
                        ),
                      ]
                    );
                  });
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  customObjectsRootFolderId,
                  i18n._(t`Prefabs`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Create`),
                    click: () => openCreateExtensionItemDialog('prefab'),
                    id: 'create-prefab-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  const customObjectItems: Array<TreeViewItem> = [];
                  const eventsFunctionsExtensionsCount = project.getEventsFunctionsExtensionsCount();
                  for (
                    let extensionIndex = 0;
                    extensionIndex < eventsFunctionsExtensionsCount;
                    extensionIndex++
                  ) {
                    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
                      extensionIndex
                    );
                    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
                    const eventsBasedObjectsCount = eventsBasedObjects.size();
                    for (
                      let objectIndex = 0;
                      objectIndex < eventsBasedObjectsCount;
                      objectIndex++
                    ) {
                      const eventsBasedObject = eventsBasedObjects.at(
                        objectIndex
                      );
                      const variants = eventsBasedObject.getVariants();
                      const variantItems: Array<TreeViewItem> = [];
                      for (
                        let variantIndex = 0;
                        variantIndex < variants.getVariantsCount();
                        variantIndex++
                      ) {
                        const variant = variants.getVariantAt(variantIndex);
                        if (!variant.getName()) continue;

                        variantItems.push(
                          new LeafTreeViewItem(
                            new CustomObjectVariantTreeViewItemContent(
                              eventsFunctionsExtension,
                              eventsBasedObject,
                              variant,
                              customObjectTreeViewItemProps
                            )
                          )
                        );
                      }

                      const objectItemContent = new CustomObjectTreeViewItemContent(
                        eventsFunctionsExtension,
                        eventsBasedObject,
                        customObjectTreeViewItemProps
                      );
                      customObjectItems.push(
                        variantItems.length > 0
                          ? new TreeViewItemWithChildren(
                              objectItemContent,
                              variantItems
                            )
                          : new LeafTreeViewItem(objectItemContent)
                      );
                    }
                  }

                  if (customObjectItems.length === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        customObjectsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new prefab in extension.`)
                      ),
                    ];
                  }

                  return customObjectItems;
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  behaviorsRootFolderId,
                  i18n._(t`Behaviors`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Create`),
                    click: () => openCreateExtensionItemDialog('behavior'),
                    id: 'create-behavior-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  const behaviorItems: Array<TreeViewItem> = [];
                  const eventsFunctionsExtensionsCount = project.getEventsFunctionsExtensionsCount();
                  for (
                    let extensionIndex = 0;
                    extensionIndex < eventsFunctionsExtensionsCount;
                    extensionIndex++
                  ) {
                    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
                      extensionIndex
                    );
                    const eventsBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
                    const eventsBasedBehaviorsCount = eventsBasedBehaviors.size();
                    for (
                      let behaviorIndex = 0;
                      behaviorIndex < eventsBasedBehaviorsCount;
                      behaviorIndex++
                    ) {
                      behaviorItems.push(
                        new LeafTreeViewItem(
                          new BehaviorShortcutTreeViewItemContent(
                            eventsFunctionsExtension,
                            eventsBasedBehaviors.at(behaviorIndex),
                            behaviorShortcutTreeViewItemProps
                          )
                        )
                      );
                    }
                  }

                  if (behaviorItems.length === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        behaviorsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new behavior in extension.`)
                      ),
                    ];
                  }

                  return behaviorItems;
                },
              },
              {
                isRoot: true,
                content: new LabelTreeViewItemContent(
                  functionsRootFolderId,
                  i18n._(t`Functions`),
                  {
                    icon: <Add />,
                    label: i18n._(t`Create`),
                    click: () => openCreateExtensionItemDialog('function'),
                    id: 'create-function-button',
                  }
                ),
                getChildren(i18n: I18nType): ?Array<TreeViewItem> {
                  const functionItems: Array<TreeViewItem> = [];
                  const eventsFunctionsExtensionsCount = project.getEventsFunctionsExtensionsCount();
                  for (
                    let extensionIndex = 0;
                    extensionIndex < eventsFunctionsExtensionsCount;
                    extensionIndex++
                  ) {
                    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
                      extensionIndex
                    );
                    const eventsFunctions = enumerateFunctionsInFolder(
                      eventsFunctionsExtension
                        .getEventsFunctions()
                        .getRootFolder()
                    );
                    for (
                      let functionIndex = 0;
                      functionIndex < eventsFunctions.length;
                      functionIndex++
                    ) {
                      functionItems.push(
                        new LeafTreeViewItem(
                          new FunctionShortcutTreeViewItemContent(
                            eventsFunctionsExtension,
                            eventsFunctions[functionIndex],
                            functionShortcutTreeViewItemProps
                          )
                        )
                      );
                    }
                  }

                  if (functionItems.length === 0) {
                    return [
                      new PlaceHolderTreeViewItem(
                        functionsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new function in extension.`)
                      ),
                    ];
                  }

                  return functionItems;
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
        behaviorShortcutTreeViewItemProps,
        customObjectTreeViewItemProps,
        externalEventsTreeViewItemProps,
        externalLayoutTreeViewItemProps,
        functionShortcutTreeViewItemProps,
        onOpenResources,
        onShareProject,
        openProjectExtensionsDialog,
        openProjectProperties,
        openCreateExtensionItemDialog,
        project,
        sceneTreeViewItemProps,
      ]
    );
    // Expose the latest tree data builder to imperative methods.
    getTreeViewDataRef.current = getTreeViewData;

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem, where: 'before' | 'inside' | 'after') =>
        selectedItems.every(item => {
          const rootId = item.content.getRootId();
          return (
            // Project and game settings children `getRootId` return an empty string.
            rootId.length > 0 &&
            // Shortcut rows are not owning project items.
            !isProjectManagerShortcutRootId(rootId) &&
            rootId === destinationItem.content.getRootId()
          );
        }),
      [selectedItems]
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
        selectedItem.content.moveAt(
          destinationItem.content.getIndex() + (where === 'after' ? 1 : 0)
        );
        onTreeModified(true);
      },
      [onTreeModified, selectedItems]
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
    const initiallyOpenedNodeIds = React.useMemo(
      () => {
        const nodeIds = [
          gameSettingsRootFolderId,
          scenesRootFolderId,
          customObjectsRootFolderId,
          behaviorsRootFolderId,
          functionsRootFolderId,
          externalEventsRootFolderId,
          externalLayoutsRootFolderId,
        ];

        if (!project) return nodeIds;

        const eventsFunctionsExtensionsCount = project.getEventsFunctionsExtensionsCount();
        for (
          let extensionIndex = 0;
          extensionIndex < eventsFunctionsExtensionsCount;
          extensionIndex++
        ) {
          const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(
            extensionIndex
          );
          const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
          const eventsBasedObjectsCount = eventsBasedObjects.size();
          for (
            let objectIndex = 0;
            objectIndex < eventsBasedObjectsCount;
            objectIndex++
          ) {
            const eventsBasedObject = eventsBasedObjects.at(objectIndex);
            if (eventsBasedObject.getVariants().getVariantsCount() > 0) {
              nodeIds.push(
                getCustomObjectTreeViewItemId(
                  eventsFunctionsExtension,
                  eventsBasedObject
                )
              );
            }
          }
        }

        return nodeIds;
      },
      [project]
    );

    const [
      selectedMainMenuItemIndices,
      setSelectedMainMenuItemIndices,
    ] = React.useState<Array<number>>([]);
    const isNavigatingInMainMenuItem = selectedMainMenuItemIndices.length > 0;
    const shouldHideMainMenu = isMacLike() && !!electron;
    const openPreferencesFromQuickLink = React.useCallback(
      () => {
        mainMenuCallbacks.onOpenPreferences(true);
        toggleProjectManager();
      },
      [mainMenuCallbacks, toggleProjectManager]
    );

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
            {!isNavigatingInMainMenuItem && project && (
              <div className={classes.quickLinkContainer}>
                <button
                  type="button"
                  className={classes.quickLinkButton}
                  onClick={openPreferencesFromQuickLink}
                >
                  <PreferencesIcon
                    className={classes.quickLinkIcon}
                    fontSize="small"
                  />
                  <span className={classes.quickLinkLabel}>
                    <Trans>Preferences</Trans>
                  </span>
                </button>
              </div>
            )}
            <I18n>
              {({ i18n }) => {
                // Capture the latest i18n so imperative methods can traverse
                // the tree outside of this render prop.
                i18nRef.current = i18n;
                return (
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
                    {project && usageTarget && (
                      <ProjectItemUsageDialog
                        project={project}
                        target={usageTarget}
                        onClose={() => setUsageTarget(null)}
                      />
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
                        hotReloadPreviewButtonProps={
                          hotReloadPreviewButtonProps
                        }
                        isListLocked={false}
                        initiallySelectedVariable={null}
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
                        hotReloadPreviewButtonProps={
                          hotReloadPreviewButtonProps
                        }
                        isListLocked={false}
                        initiallySelectedVariable={null}
                      />
                    )}
                    {project && projectExtensionsDialogOpen && (
                      <ProjectExtensionsDialog
                        project={project}
                        onClose={() => setProjectExtensionsDialogOpen(false)}
                        onInstallExtension={() => {
                          setProjectExtensionsDialogOpen(false);
                          openSearchExtensionDialog();
                        }}
                        onExtensionPropertiesChanged={() => {
                          onProjectItemModified();
                          forceUpdateList();
                        }}
                        onShowExtensionStoreDetails={eventsFunctionsExtension => {
                          setProjectExtensionsDialogOpen(false);
                          onEditEventsFunctionExtensionOrSeeDetails(
                            eventsFunctionsExtension
                          );
                        }}
                        onDeleteEventsFunctionsExtension={async eventsFunctionsExtension => {
                          await onDeleteEventsFunctionsExtension(
                            eventsFunctionsExtension
                          );
                          forceUpdateList();
                        }}
                      />
                    )}
                    {project && createExtensionItemKind && (
                      <CreateEventsFunctionExtensionItemDialog
                        project={project}
                        itemKind={createExtensionItemKind}
                        onCancel={() => setCreateExtensionItemKind(null)}
                        onCreate={onCreateExtensionItem}
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
                );
              }}
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
