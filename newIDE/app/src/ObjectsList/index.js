// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import NewObjectDialog from '../AssetStore/NewObjectDialog';
import AssetSwappingDialog from '../AssetStore/AssetSwappingDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import Window from '../Utils/Window';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import {
  getFoldersAscendanceWithoutRootFolder,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { mapFor } from '../Utils/MapFor';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import { getInsertionParentAndPositionFromSelection } from '../Utils/ObjectFolders';
import {
  ObjectTreeViewItemContent,
  getObjectTreeViewItemId,
  type ObjectTreeViewItemProps,
} from './ObjectTreeViewItemContent';
import {
  ObjectFolderTreeViewItemContent,
  getObjectFolderTreeViewItemId,
  expandAllSubfolders,
  type ObjectFolderTreeViewItemProps,
} from './ObjectFolderTreeViewItemContent';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import type { MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import type { EventsScope } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const sceneObjectsRootFolderId = 'scene-objects';
const globalObjectsRootFolderId = 'global-objects';
const globalObjectsEmptyPlaceholderId = 'global-empty-placeholder';
const sceneObjectsEmptyPlaceholderId = 'scene-empty-placeholder';

const globalObjectsWikiLink = getHelpLink(
  '/interface/scene-editor/global-objects/',
  ':~:text=Global%20objects%20are%20objects%20which,are%20usable%20by%20all%20Scenes'
);

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

export const getLabelsForObjectsAndGroupsLists = (
  scope: EventsScope
): {|
  localScopeObjectsTitle: MessageDescriptor,
  higherScopeObjectsTitle: MessageDescriptor | null,
  localScopeGroupsTitle: MessageDescriptor | null,
  higherScopeGroupsTitle: MessageDescriptor | null,
|} => {
  if (scope.layout) {
    return {
      localScopeObjectsTitle: t`Scene Objects`,
      higherScopeObjectsTitle: t`Global Objects`,
      localScopeGroupsTitle: t`Scene Groups`,
      higherScopeGroupsTitle: t`Global Groups`,
    };
  } else if (scope.eventsBasedObject) {
    return {
      localScopeObjectsTitle: t`Object's children`,
      higherScopeObjectsTitle: null, // Global objects not accessible from custom object.
      localScopeGroupsTitle: t`Object's groups`,
      higherScopeGroupsTitle: null,
    };
  }

  throw new Error('Scope not recognized.');
};

export const getTreeViewItemIdFromObjectFolderOrObject = (
  objectFolderOrObject: gdObjectFolderOrObject
): string => {
  return objectFolderOrObject.isFolder()
    ? getObjectFolderTreeViewItemId(objectFolderOrObject)
    : getObjectTreeViewItemId(objectFolderOrObject.getObject());
};

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
  duplicate(): void;
  getIndex(): number;
  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean;
  isSibling(treeViewItemContent: TreeViewItemContent): boolean;
  isGlobal(): boolean;
  getObjectFolderOrObject(): gdObjectFolderOrObject | null;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: TreeViewItemContent;
  getChildren(i18n: I18nType): ?Array<TreeViewItem>;
}

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    return null;
  }
}

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

const createTreeViewItem = ({
  objectFolderOrObject,
  isGlobal,
  objectFolderTreeViewItemProps,
  objectTreeViewItemProps,
}: {|
  objectFolderOrObject: gdObjectFolderOrObject,
  isGlobal: boolean,
  objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps,
  objectTreeViewItemProps: ObjectTreeViewItemProps,
|}): TreeViewItem => {
  if (objectFolderOrObject.isFolder()) {
    return new ObjectFolderTreeViewItem({
      objectFolderOrObject: objectFolderOrObject,
      global: isGlobal,
      isRoot: false,
      objectFolderTreeViewItemProps,
      objectTreeViewItemProps,
      content: new ObjectFolderTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        objectFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new ObjectTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        objectTreeViewItemProps
      )
    );
  }
};

class ObjectFolderTreeViewItem implements TreeViewItem {
  isRoot: boolean;
  global: boolean;
  isPlaceholder = false;
  content: TreeViewItemContent;
  objectFolderOrObject: gdObjectFolderOrObject;
  placeholder: ?PlaceHolderTreeViewItem;
  objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps;
  objectTreeViewItemProps: ObjectTreeViewItemProps;

  constructor({
    objectFolderOrObject,
    global,
    isRoot,
    content,
    placeholder,
    objectFolderTreeViewItemProps,
    objectTreeViewItemProps,
  }: {|
    objectFolderOrObject: gdObjectFolderOrObject,
    global: boolean,
    isRoot: boolean,
    content: TreeViewItemContent,
    placeholder?: PlaceHolderTreeViewItem,
    objectFolderTreeViewItemProps: ObjectFolderTreeViewItemProps,
    objectTreeViewItemProps: ObjectTreeViewItemProps,
  |}) {
    this.isRoot = isRoot;
    this.global = global;
    this.content = content;
    this.objectFolderOrObject = objectFolderOrObject;
    this.placeholder = placeholder;
    this.objectFolderTreeViewItemProps = objectFolderTreeViewItemProps;
    this.objectTreeViewItemProps = objectTreeViewItemProps;
  }

  getChildren(i18n: I18nType): ?Array<TreeViewItem> {
    if (this.objectFolderOrObject.getChildrenCount() === 0) {
      return this.placeholder ? [this.placeholder] : [];
    }
    return mapFor(0, this.objectFolderOrObject.getChildrenCount(), i => {
      const child = this.objectFolderOrObject.getChildAt(i);
      return createTreeViewItem({
        objectFolderOrObject: child,
        isGlobal: this.global,
        objectFolderTreeViewItemProps: this.objectFolderTreeViewItemProps,
        objectTreeViewItemProps: this.objectTreeViewItemProps,
      });
    });
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
    rightButton?: MenuButton | null,
    buildMenuTemplateFunction?: () => Array<MenuItemTemplate>
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      [
        rightButton
          ? {
              id: rightButton.id,
              label: i18n._(rightButton.label),
              click: rightButton.click,
              enabled: rightButton.enabled,
            }
          : null,
        ...(buildMenuTemplateFunction ? buildMenuTemplateFunction() : []),
      ].filter(Boolean);
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
    return {};
  }

  getThumbnail(): ?string {
    return null;
  }

  onClick(): void {}

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

  duplicate(): void {}

  getIndex(): number {
    return 0;
  }

  isDescendantOf(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  isSibling(treeViewItemContent: TreeViewItemContent): boolean {
    return false;
  }

  isGlobal(): boolean {
    return false;
  }

  getObjectFolderOrObject(): gdObjectFolderOrObject | null {
    return null;
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
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const deleteItem = (item: TreeViewItem) => {
  item.content.delete();
};
const duplicateItem = (item: TreeViewItem) => {
  item.content.duplicate();
};
const getTreeViewItemRightButton = (i18n: I18nType) => (item: TreeViewItem) =>
  item.content.getRightButton(i18n);

export const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

const objectTypeToDefaultName = {
  Sprite: 'NewSprite',
  'TiledSpriteObject::TiledSprite': 'NewTiledSprite',
  'ParticleSystem::ParticleEmitter': 'NewParticlesEmitter',
  'PanelSpriteObject::PanelSprite': 'NewPanelSprite',
  'PrimitiveDrawing::Drawer': 'NewShapePainter',
  'TextObject::Text': 'NewText',
  'BBText::BBText': 'NewBBText',
  'BitmapText::BitmapTextObject': 'NewBitmapText',
  'TextEntryObject::TextEntry': 'NewTextEntry',
  'TileMap::SimpleTileMap': 'NewTileMap',
  'TileMap::TileMap': 'NewExternalTileMap',
  'TileMap::CollisionMask': 'NewExternalTileMapMask',
  'MyDummyExtension::DummyObject': 'NewDummyObject',
  'Lighting::LightObject': 'NewLight',
  'TextInput::TextInputObject': 'NewTextInput',
  'Scene3D::Model3DObject': 'New3DModel',
  'Scene3D::Cube3DObject': 'New3DBox',
  'SpineObject::SpineObject': 'NewSpine',
  'Video::VideoObject': 'NewVideo',
};

export type ObjectsListInterface = {|
  forceUpdateList: () => void,
  openNewObjectDialog: () => void,
  closeNewObjectDialog: () => void,
|};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  eventsBasedObject: gdEventsBasedObject | null,
  initialInstances?: gdInitialInstancesContainer,
  /** The objects retrieved from ProjectScopedContainers must never be kept in a
   * state as they may be temporary copies.
   * It also contains "fake" objects like "Object" for the parent of custom objects.
   * It's useful to check if an object name is taken, but not to edit ObjectsContainer.
   * Also see `ProjectScopedContainers::MakeNewProjectScopedContainersForEventsBasedObject`.
   * Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
   * in the codebase.
   */
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,

  // These 2 containers always contains the "real" objects.
  // TODO: they should be replaced by projectScopedContainersAccessor, but we can't use this
  // as `ProjectScopedContainers` may return temporary objects that can't be edited or have references
  // to them kept.
  // Search for "ProjectScopedContainers wrongly containing temporary objects containers or objects"
  // in the codebase.
  globalObjectsContainer: gdObjectsContainer | null,
  objectsContainer: gdObjectsContainer,

  onSelectAllInstancesOfObjectInLayout?: string => void,
  resourceManagementProps: ResourceManagementProps,
  onDeleteObjects: (
    objectWithContext: ObjectWithContext[],
    cb: (boolean) => void
  ) => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,

  beforeSetAsGlobalObject?: (groupName: string) => boolean,
  canSetAsGlobalObject?: boolean,

  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onExportAssets: () => void,
  onObjectCreated: gdObject => void,
  onObjectEdited: ObjectWithContext => void,
  onObjectFolderOrObjectWithContextSelected: (
    ?ObjectFolderOrObjectWithContext
  ) => void,
  onObjectPasted?: gdObject => void,
  getValidatedObjectOrGroupName: (newName: string, global: boolean) => string,
  onAddObjectInstance: (objectName: string) => void,

  getThumbnail: (
    project: gdProject,
    objectConfiguration: gdObjectConfiguration
  ) => string,
  unsavedChanges?: ?UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  isListLocked: boolean,
|};

const ObjectsList = React.forwardRef<Props, ObjectsListInterface>(
  (
    {
      project,
      layout,
      eventsBasedObject,
      initialInstances,
      projectScopedContainersAccessor,
      globalObjectsContainer,
      objectsContainer,
      resourceManagementProps,
      onSelectAllInstancesOfObjectInLayout,
      onDeleteObjects,
      onRenameObjectFolderOrObjectWithContextFinish,
      selectedObjectFolderOrObjectsWithContext,

      beforeSetAsGlobalObject,
      canSetAsGlobalObject,

      onEditObject,
      onOpenEventBasedObjectEditor,
      onOpenEventBasedObjectVariantEditor,
      onExportAssets,
      onObjectCreated,
      onObjectEdited,
      onObjectFolderOrObjectWithContextSelected,
      onObjectPasted,
      getValidatedObjectOrGroupName,
      onAddObjectInstance,

      getThumbnail,
      unsavedChanges,
      hotReloadPreviewButtonProps,
      isListLocked,
    }: Props,
    ref
  ) => {
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const [searchText, setSearchText] = React.useState('');
    const { showDeleteConfirmation } = useAlertDialog();
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const { isMobile } = useResponsiveWindowSize();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [newObjectDialogOpen, setNewObjectDialogOpen] = React.useState<{
      from: ObjectFolderOrObjectWithContext | null,
    } | null>(null);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      openNewObjectDialog: () => {
        setNewObjectDialogOpen({ from: null });
      },
      closeNewObjectDialog: () => {
        setNewObjectDialogOpen(null);
      },
    }));

    const [
      objectAssetSwappingDialogOpen,
      setObjectAssetSwappingDialogOpen,
    ] = React.useState<{ objectWithContext: ObjectWithContext } | null>(null);

    // Initialize keyboard shortcuts as empty.
    // onDelete, onDuplicate and onRename callbacks are set in an effect because it applies
    // to the selected item (that is a props). As it is stored in a ref, the keyboard shortcut
    // instance does not update with selectedObjectFolderOrObjectsWithContext changes.
    const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
      new KeyboardShortcuts({
        shortcutCallbacks: {},
      })
    );

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const addObject = React.useCallback(
      (objectType: string) => {
        const defaultName = project.hasEventsBasedObject(objectType)
          ? 'New' +
            (project.getEventsBasedObject(objectType).getDefaultName() ||
              project.getEventsBasedObject(objectType).getName())
          : objectTypeToDefaultName[objectType] || 'NewObject';
        const name = newNameGenerator(
          defaultName,
          name =>
            objectsContainer.hasObjectNamed(name) ||
            (!!globalObjectsContainer &&
              globalObjectsContainer.hasObjectNamed(name))
        );

        let object;
        let objectFolderOrObjectWithContext;
        if (
          newObjectDialogOpen &&
          newObjectDialogOpen.from &&
          // If a scene objectFolderOrObject is selected, insert new object next to or inside it.
          !newObjectDialogOpen.from.global
        ) {
          const selectedItem = newObjectDialogOpen.from.objectFolderOrObject;
          const {
            folder: parentFolder,
            position,
          } = getInsertionParentAndPositionFromSelection(selectedItem);

          object = objectsContainer.insertNewObjectInFolder(
            project,
            objectType,
            name,
            parentFolder,
            position
          );
          objectFolderOrObjectWithContext = {
            objectFolderOrObject: parentFolder.getObjectChild(name),
            global: false,
          };

          if (treeViewRef.current) {
            treeViewRef.current.openItems([
              getObjectFolderTreeViewItemId(parentFolder),
            ]);
          }
        } else {
          object = objectsContainer.insertNewObject(
            project,
            objectType,
            name,
            objectsContainer.getObjectsCount()
          );
          objectFolderOrObjectWithContext = {
            objectFolderOrObject: objectsContainer
              .getRootFolder()
              .getObjectChild(name),
            global: false,
          };
        }

        if (treeViewRef.current)
          treeViewRef.current.openItems([sceneObjectsRootFolderId]);

        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(object));
        }, 100); // A few ms is enough for a new render to be done.

        setNewObjectDialogOpen(null);
        // TODO Should it be called later?
        if (onEditObject) {
          onEditObject(object);
          onObjectCreated(object);
          onObjectFolderOrObjectWithContextSelected(
            objectFolderOrObjectWithContext
          );
        }
      },
      [
        project,
        newObjectDialogOpen,
        onEditObject,
        objectsContainer,
        globalObjectsContainer,
        scrollToItem,
        onObjectCreated,
        onObjectFolderOrObjectWithContextSelected,
      ]
    );

    const onObjectsAddedFromAssets = React.useCallback(
      (objects: Array<gdObject>) => {
        if (objects.length === 0) return;

        objects.forEach(object => {
          onObjectCreated(object);
        });

        // Here, the last object in the array might not be the last object
        // in the tree view, given the fact that assets are added in parallel
        // See (AssetPackInstallDialog.onInstallAssets).
        const lastObject = objects[objects.length - 1];

        if (newObjectDialogOpen && newObjectDialogOpen.from) {
          const {
            objectFolderOrObject: selectedObjectFolderOrObject,
          } = newObjectDialogOpen.from;
          if (treeViewRef.current) {
            treeViewRef.current.openItems(
              getFoldersAscendanceWithoutRootFolder(
                selectedObjectFolderOrObject
              ).map(folder => getObjectFolderTreeViewItemId(folder))
            );
          }
        } else {
          if (treeViewRef.current) {
            treeViewRef.current.openItems([sceneObjectsRootFolderId]);
          }
        }
        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(lastObject));
        }, 100); // A few ms is enough for a new render to be done.
      },
      [onObjectCreated, scrollToItem, newObjectDialogOpen]
    );

    const swapObjectAsset = React.useCallback(
      (objectWithContext: ObjectWithContext) => {
        setObjectAssetSwappingDialogOpen({ objectWithContext });
      },
      []
    );

    const onAddNewObject = React.useCallback(
      (item: ObjectFolderOrObjectWithContext | null) => {
        setNewObjectDialogOpen({ from: item });
      },
      []
    );

    const onObjectModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
    );

    const selectObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        onObjectFolderOrObjectWithContextSelected(
          objectFolderOrObjectWithContext
        );
      },
      [onObjectFolderOrObjectWithContextSelected]
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

    const getClosestVisibleParentId = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ): ?string => {
      const treeView = treeViewRef.current;
      if (!treeView) return null;
      const { objectFolderOrObject } = objectFolderOrObjectWithContext;
      const topToBottomAscendanceId = getFoldersAscendanceWithoutRootFolder(
        objectFolderOrObject
      )
        .reverse()
        .map(parent => getObjectFolderTreeViewItemId(objectFolderOrObject));
      const topToBottomAscendanceOpenness = treeView.areItemsOpenFromId(
        topToBottomAscendanceId
      );
      const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(
        false
      );
      if (firstClosedFolderIndex === -1) {
        // If all parents are open, return the objectFolderOrObject given as input.
        return getTreeViewItemIdFromObjectFolderOrObject(objectFolderOrObject);
      }
      // $FlowFixMe - We are confident this TreeView item is in fact a ObjectFolderOrObjectWithContext
      return topToBottomAscendanceId[firstClosedFolderIndex];
    };

    const setAsGlobalObject = React.useCallback(
      ({
        i18n,
        objectFolderOrObject,
        index,
        folder,
      }: {
        i18n: I18nType,
        objectFolderOrObject: gdObjectFolderOrObject,
        index?: number,
        folder?: gdObjectFolderOrObject,
      }) => {
        if (!globalObjectsContainer) {
          return;
        }
        const destinationFolder =
          folder && folder.isFolder()
            ? folder
            : globalObjectsContainer.getRootFolder();
        if (objectFolderOrObject.isFolder()) return;
        const object = objectFolderOrObject.getObject();

        const objectName: string = object.getName();
        if (!objectsContainer.hasObjectNamed(objectName)) return;

        if (globalObjectsContainer.hasObjectNamed(objectName)) {
          showWarningBox(
            i18n._(
              t`A global object with this name already exists. Please change the object name before setting it as a global object`
            ),
            { delayToNextTick: true }
          );
          return;
        }

        if (beforeSetAsGlobalObject && !beforeSetAsGlobalObject(objectName)) {
          return;
        }

        const answer = Window.showConfirmDialog(
          i18n._(
            t`Global elements help manage objects across multiple scenes and are recommended for frequently used objects. This action cannot be undone.

            Do you want to set this as global object?`
          )
        );
        if (!answer) return;

        // It's safe to call moveObjectFolderOrObjectToAnotherContainerInFolder because
        // it does not invalidate the references to the object in memory - so other editors
        // like InstancesRenderer can continue to work.
        objectsContainer.moveObjectFolderOrObjectToAnotherContainerInFolder(
          objectFolderOrObject,
          globalObjectsContainer,
          destinationFolder,
          typeof index === 'number'
            ? index
            : globalObjectsContainer.getObjectsCount()
        );
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
        onObjectModified(true);

        const newObjectFolderOrObjectWithContext = {
          objectFolderOrObject,
          global: true,
        };
        selectObjectFolderOrObjectWithContext(
          newObjectFolderOrObjectWithContext
        );

        // Scroll to the moved object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(getObjectTreeViewItemId(object));
        }, 100); // A few ms is enough for a new render to be done.
      },
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        beforeSetAsGlobalObject,
        onObjectModified,
        selectObjectFolderOrObjectWithContext,
        scrollToItem,
      ]
    );

    const addFolder = React.useCallback(
      (items: Array<ObjectFolderOrObjectWithContext>) => {
        let newObjectFolderOrObjectWithContext;
        if (items.length === 1) {
          const {
            objectFolderOrObject: selectedObjectFolderOrObject,
            global,
          } = items[0];
          if (selectedObjectFolderOrObject.isFolder()) {
            const newFolder = selectedObjectFolderOrObject.insertNewFolder(
              'NewFolder',
              0
            );
            newObjectFolderOrObjectWithContext = {
              objectFolderOrObject: newFolder,
              global,
            };
            if (treeViewRef.current) {
              treeViewRef.current.openItems([
                getObjectFolderTreeViewItemId(items[0].objectFolderOrObject),
              ]);
            }
          } else {
            const parentFolder = selectedObjectFolderOrObject.getParent();
            const newFolder = parentFolder.insertNewFolder(
              'NewFolder',
              parentFolder.getChildPosition(selectedObjectFolderOrObject) + 1
            );
            newObjectFolderOrObjectWithContext = {
              objectFolderOrObject: newFolder,
              global,
            };
          }
        } else {
          const rootFolder = objectsContainer.getRootFolder();
          const newFolder = rootFolder.insertNewFolder('NewFolder', 0);
          newObjectFolderOrObjectWithContext = {
            objectFolderOrObject: newFolder,
            global: false,
          };
        }
        selectObjectFolderOrObjectWithContext(
          newObjectFolderOrObjectWithContext
        );
        const itemsToOpen = getFoldersAscendanceWithoutRootFolder(
          newObjectFolderOrObjectWithContext.objectFolderOrObject
        ).map(folder => getObjectFolderTreeViewItemId(folder));
        itemsToOpen.push(
          newObjectFolderOrObjectWithContext.global
            ? globalObjectsRootFolderId
            : sceneObjectsRootFolderId
        );
        if (treeViewRef.current) treeViewRef.current.openItems(itemsToOpen);

        editName(
          getObjectFolderTreeViewItemId(
            newObjectFolderOrObjectWithContext.objectFolderOrObject
          )
        );
        forceUpdateList();
      },
      [
        forceUpdateList,
        objectsContainer,
        selectObjectFolderOrObjectWithContext,
        editName,
      ]
    );

    const onMovedObjectFolderOrObjectToAnotherFolderInSameContainer = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          const closestVisibleParentId = getClosestVisibleParentId(
            objectFolderOrObjectWithContext
          );
          if (closestVisibleParentId) {
            treeView.animateItemFromId(closestVisibleParentId);
          }
        }
        onObjectModified(true);
      },
      [onObjectModified]
    );

    const expandFolders = React.useCallback(
      (
        objectFolderOrObjectWithContexts: Array<ObjectFolderOrObjectWithContext>
      ) => {
        if (treeViewRef.current) {
          treeViewRef.current.openItems(
            objectFolderOrObjectWithContexts.map(
              objectFolderOrObjectWithContext =>
                getObjectFolderTreeViewItemId(
                  objectFolderOrObjectWithContext.objectFolderOrObject
                )
            )
          );
        }
      },
      []
    );

    const objectTreeViewItemProps = React.useMemo<ObjectTreeViewItemProps>(
      () => ({
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onSelectAllInstancesOfObjectInLayout,
        editName,
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
        onOpenEventBasedObjectVariantEditor,
        getValidatedObjectOrGroupName,
        onRenameObjectFolderOrObjectWithContextFinish,
        onObjectModified,
        swapObjectAsset,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        canSetAsGlobalObject,
        setAsGlobalObject,
        getThumbnail,
        showDeleteConfirmation,
        selectObjectFolderOrObjectWithContext,
        addFolder,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onSelectAllInstancesOfObjectInLayout,
        editName,
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
        onOpenEventBasedObjectVariantEditor,
        getValidatedObjectOrGroupName,
        onRenameObjectFolderOrObjectWithContextFinish,
        onObjectModified,
        swapObjectAsset,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        canSetAsGlobalObject,
        setAsGlobalObject,
        getThumbnail,
        showDeleteConfirmation,
        selectObjectFolderOrObjectWithContext,
        addFolder,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      ]
    );

    const objectFolderTreeViewItemProps = React.useMemo<ObjectFolderTreeViewItemProps>(
      () => ({
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        editName,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        showDeleteConfirmation,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        editName,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        showDeleteConfirmation,
        forceUpdateList,
        forceUpdate,
        isListLocked,
      ]
    );

    const globalObjectsRootFolder = globalObjectsContainer
      ? globalObjectsContainer.getRootFolder()
      : null;
    const objectsRootFolder = objectsContainer.getRootFolder();
    const labels = React.useMemo(
      () =>
        getLabelsForObjectsAndGroupsLists(
          projectScopedContainersAccessor.getScope()
        ),
      [projectScopedContainersAccessor]
    );

    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        const treeViewItems = [
          globalObjectsRootFolder &&
            new ObjectFolderTreeViewItem({
              objectFolderOrObject: globalObjectsRootFolder,
              global: true,
              isRoot: true,
              content: new LabelTreeViewItemContent(
                globalObjectsRootFolderId,
                i18n._(labels.higherScopeObjectsTitle),
                null,
                () => [
                  {
                    label: i18n._(t`Add a folder`),
                    click: () =>
                      addFolder([
                        {
                          objectFolderOrObject: globalObjectsRootFolder,
                          global: true,
                        },
                      ]),
                  },
                  { type: 'separator' },
                  {
                    label: i18n._(t`Expand all sub folders`),
                    click: () =>
                      expandAllSubfolders(
                        globalObjectsRootFolder,
                        true,
                        expandFolders
                      ),
                  },
                ]
              ),
              placeholder: new PlaceHolderTreeViewItem(
                globalObjectsEmptyPlaceholderId,
                (
                  <Trans>
                    There is no{' '}
                    <Link
                      href={globalObjectsWikiLink}
                      onClick={() =>
                        Window.openExternalURL(globalObjectsWikiLink)
                      }
                    >
                      global object
                    </Link>{' '}
                    yet.
                  </Trans>
                )
              ),
              objectTreeViewItemProps,
              objectFolderTreeViewItemProps,
            }),
          new ObjectFolderTreeViewItem({
            objectFolderOrObject: objectsRootFolder,
            global: false,
            isRoot: true,
            content: new LabelTreeViewItemContent(
              sceneObjectsRootFolderId,
              i18n._(labels.localScopeObjectsTitle),
              {
                icon: <Add />,
                label: t`Add an object`,
                click: () => {
                  onAddNewObject(selectedObjectFolderOrObjectsWithContext[0]);
                },
                id: 'add-new-object-button',
                enabled: !isListLocked,
              },
              () => [
                {
                  label: i18n._(t`Add a folder`),
                  click: () =>
                    addFolder([
                      {
                        objectFolderOrObject: objectsRootFolder,
                        global: false,
                      },
                    ]),
                  enabled: !isListLocked,
                },
                { type: 'separator' },
                {
                  label: i18n._(t`Expand all sub folders`),
                  click: () =>
                    expandAllSubfolders(
                      objectsRootFolder,
                      false,
                      expandFolders
                    ),
                },
                { type: 'separator' },
                {
                  label: i18n._(t`Export as assets`),
                  click: () => onExportAssets(),
                },
              ]
            ),
            placeholder: new PlaceHolderTreeViewItem(
              sceneObjectsEmptyPlaceholderId,
              i18n._(t`Start by adding a new object.`)
            ),
            objectTreeViewItemProps,
            objectFolderTreeViewItemProps,
          }),
        ].filter(Boolean);
        // $FlowFixMe
        return treeViewItems;
      },
      [
        globalObjectsRootFolder,
        labels.higherScopeObjectsTitle,
        labels.localScopeObjectsTitle,
        objectTreeViewItemProps,
        objectFolderTreeViewItemProps,
        objectsRootFolder,
        isListLocked,
        addFolder,
        expandFolders,
        onAddNewObject,
        selectedObjectFolderOrObjectsWithContext,
        onExportAssets,
      ]
    );

    const selectedItems = React.useMemo(
      () => {
        return selectedObjectFolderOrObjectsWithContext.map(
          ({ objectFolderOrObject, global }) => {
            return createTreeViewItem({
              objectFolderOrObject,
              isGlobal: global,
              objectFolderTreeViewItemProps,
              objectTreeViewItemProps,
            });
          }
        );
      },
      [
        selectedObjectFolderOrObjectsWithContext,
        objectFolderTreeViewItemProps,
        objectTreeViewItemProps,
      ]
    );

    React.useEffect(
      () => {
        if (keyboardShortcutsRef.current) {
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            if (!isListLocked) {
              deleteItem(selectedItems[0]);
            }
          });
          keyboardShortcutsRef.current.setShortcutCallback(
            'onDuplicate',
            () => {
              if (!isListLocked) {
                duplicateItem(selectedItems[0]);
              }
            }
          );
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            if (!isListLocked) {
              editName(selectedItems[0].content.getId());
            }
          });
        }
      },
      [
        selectedObjectFolderOrObjectsWithContext,
        editName,
        selectedItems,
        isListLocked,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) => {
        if (destinationItem.isRoot) return false;
        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.content.getId() ===
              globalObjectsEmptyPlaceholderId &&
            selectedItems.length === 1 &&
            !selectedItems[0].content.isGlobal()
          ) {
            // In that case, the user is drag n dropping a scene object on the
            // empty placeholder of the global objects section.
            const objectFolderOrObject = selectedItems[0].content.getObjectFolderOrObject();
            return !!objectFolderOrObject && !objectFolderOrObject.isFolder();
          }
          return false;
        }
        // Check if at least one element in the selection can be moved.
        if (
          selectedItems.every(
            selectedItem =>
              selectedItem.content.isGlobal() ===
              destinationItem.content.isGlobal()
          )
        ) {
          if (
            selectedItems[0] &&
            destinationItem.content.isDescendantOf(selectedItems[0].content)
          ) {
            return false;
          }
          return true;
        } else if (
          selectedItems.length === 1 &&
          selectedItems.every(
            selectedObject => selectedObject.content.isGlobal() === false
          ) &&
          destinationItem.content.isGlobal()
        ) {
          const objectFolderOrObject = selectedItems[0].content.getObjectFolderOrObject();
          return !!objectFolderOrObject && !objectFolderOrObject.isFolder();
        }

        return false;
      },
      [selectedItems]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (destinationItem.isRoot || selectedItems.length !== 1) {
          return;
        }
        const selectedItem = selectedItems[0];
        const selectedObjectFolderOrObject = selectedItem.content.getObjectFolderOrObject();

        if (
          !selectedObjectFolderOrObject ||
          destinationItem.content.getId() === selectedItem.content.getId()
        ) {
          return;
        }

        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.content.getId() ===
              globalObjectsEmptyPlaceholderId &&
            selectedItems.length === 1 &&
            !selectedItem.content.isGlobal()
          ) {
            setAsGlobalObject({
              i18n,
              objectFolderOrObject: selectedObjectFolderOrObject,
            });
          }
          return;
        }

        const destinationObjectFolderOrObject = destinationItem.content.getObjectFolderOrObject();
        if (!destinationObjectFolderOrObject) {
          return;
        }
        if (
          selectedItem.content.isGlobal() === false &&
          destinationItem.content.isGlobal()
        ) {
          let parent, index;
          if (
            where === 'inside' &&
            destinationObjectFolderOrObject.isFolder()
          ) {
            parent = destinationObjectFolderOrObject;
            index = 0;
          } else {
            parent = destinationObjectFolderOrObject.getParent();
            index =
              destinationItem.content.getIndex() + (where === 'after' ? 1 : 0);
          }
          setAsGlobalObject({
            i18n,
            objectFolderOrObject: selectedObjectFolderOrObject,
            folder: parent,
            index,
          });
          return;
        }

        // At this point, the move is done from within the same container.
        if (
          selectedItem.content.isGlobal() === destinationItem.content.isGlobal()
        ) {
          let parent;
          if (
            where === 'inside' &&
            destinationObjectFolderOrObject.isFolder()
          ) {
            parent = destinationObjectFolderOrObject;
          } else {
            parent = destinationObjectFolderOrObject.getParent();
          }
          const selectedObjectFolderOrObjectParent = selectedObjectFolderOrObject.getParent();
          if (parent === selectedObjectFolderOrObjectParent) {
            const fromIndex = selectedItem.content.getIndex();
            let toIndex = destinationItem.content.getIndex();
            if (toIndex > fromIndex) toIndex -= 1;
            if (where === 'after') toIndex += 1;
            selectedObjectFolderOrObjectParent.moveChild(fromIndex, toIndex);
          } else {
            if (destinationItem.content.isDescendantOf(selectedItem.content)) {
              return;
            }
            const position =
              where === 'inside'
                ? 0
                : destinationItem.content.getIndex() +
                  (where === 'after' ? 1 : 0);
            selectedObjectFolderOrObjectParent.moveObjectFolderOrObjectToAnotherFolder(
              selectedObjectFolderOrObject,
              parent,
              position
            );
            const treeView = treeViewRef.current;
            if (treeView) {
              const closestVisibleParentId = getClosestVisibleParentId({
                objectFolderOrObject: parent,
                global: destinationItem.content.isGlobal(),
              });
              if (closestVisibleParentId) {
                treeView.animateItemFromId(closestVisibleParentId);
              }
            }
          }
        } else {
          return;
        }
        onObjectModified(true);
      },
      [onObjectModified, selectedItems, setAsGlobalObject]
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback(
      (item: TreeViewItem) => {
        if (!selectedItems || selectedItems.length !== 1) return;
        const selectedItem = selectedItems[0];
        if (!selectedItem) return;
        if (selectedItem.content.isDescendantOf(item.content)) {
          selectObjectFolderOrObjectWithContext(null);
        }
      },
      [selectObjectFolderOrObjectWithContext, selectedItems]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;
    const initiallyOpenedNodeIds = [
      globalObjectsRootFolder && globalObjectsRootFolder.getChildrenCount() > 0
        ? globalObjectsRootFolderId
        : null,
      sceneObjectsRootFolderId,
    ].filter(Boolean);

    const arrowKeyNavigationProps = React.useMemo(
      () => ({
        onGetItemInside: (item: TreeViewItem): ?TreeViewItem => {
          if (item.isPlaceholder || item.isRoot) return null;
          const objectFolderOrObject = item.content.getObjectFolderOrObject();
          if (!objectFolderOrObject) return null;
          if (!objectFolderOrObject.isFolder()) return null;
          else {
            if (objectFolderOrObject.getChildrenCount() === 0) return null;
            return createTreeViewItem({
              objectFolderOrObject: objectFolderOrObject.getChildAt(0),
              isGlobal: item.content.isGlobal(),
              objectFolderTreeViewItemProps,
              objectTreeViewItemProps,
            });
          }
        },
        onGetItemOutside: (item: TreeViewItem): ?TreeViewItem => {
          if (item.isPlaceholder || item.isRoot) return null;
          const objectFolderOrObject = item.content.getObjectFolderOrObject();
          if (!objectFolderOrObject) return null;
          const parent = objectFolderOrObject.getParent();
          if (parent.isRootFolder()) return null;
          return createTreeViewItem({
            objectFolderOrObject: parent,
            isGlobal: item.content.isGlobal(),
            objectFolderTreeViewItemProps,
            objectTreeViewItemProps,
          });
        },
      }),
      [objectFolderTreeViewItemProps, objectTreeViewItemProps]
    );

    return (
      <Background maxWidth>
        <LineStackLayout>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={setSearchText}
              placeholder={t`Search objects`}
            />
          </Column>
        </LineStackLayout>
        <div
          style={styles.listContainer}
          onKeyDown={keyboardShortcutsRef.current.onKeyDown}
          onKeyUp={keyboardShortcutsRef.current.onKeyUp}
          id="objects-list"
        >
          <I18n>
            {({ i18n }) => (
              <div style={styles.autoSizerContainer}>
                <AutoSizer style={styles.autoSizer} disableWidth>
                  {({ height }) => (
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
                        if (!items) {
                          selectObjectFolderOrObjectWithContext(null);
                          return;
                        }
                        const itemContentToSelect = items[0].content;
                        const objectFolderOrObjectToSelect = itemContentToSelect.getObjectFolderOrObject();
                        if (objectFolderOrObjectToSelect) {
                          selectObjectFolderOrObjectWithContext({
                            objectFolderOrObject: objectFolderOrObjectToSelect,
                            global: itemContentToSelect.isGlobal(),
                          });
                        } else {
                          selectObjectFolderOrObjectWithContext(null);
                        }
                      }}
                      onRenameItem={renameItem}
                      buildMenuTemplate={buildMenuTemplate(i18n)}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      arrowKeyNavigationProps={arrowKeyNavigationProps}
                      shouldSelectUponContextMenuOpening
                      getItemRightButton={getTreeViewItemRightButton(i18n)}
                      renderRightComponent={renderTreeViewItemRightComponent(
                        i18n
                      )}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
        {newObjectDialogOpen && (
          <NewObjectDialog
            onClose={() => setNewObjectDialogOpen(null)}
            onCreateNewObject={addObject}
            onObjectsAddedFromAssets={onObjectsAddedFromAssets}
            project={project}
            layout={layout}
            eventsBasedObject={eventsBasedObject}
            objectsContainer={objectsContainer}
            resourceManagementProps={resourceManagementProps}
            targetObjectFolderOrObjectWithContext={newObjectDialogOpen.from}
          />
        )}
        {objectAssetSwappingDialogOpen && (
          <AssetSwappingDialog
            onClose={({ swappingDone }) => {
              setObjectAssetSwappingDialogOpen(null);
              if (swappingDone)
                onObjectEdited(objectAssetSwappingDialogOpen.objectWithContext);
            }}
            project={project}
            layout={layout}
            eventsBasedObject={eventsBasedObject}
            objectsContainer={objectsContainer}
            object={objectAssetSwappingDialogOpen.objectWithContext.object}
            resourceManagementProps={resourceManagementProps}
          />
        )}
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to objects list is made outside
  // from the component.
  // If a change is made, the component won't notice it: you have to manually
  // call forceUpdate.
  prevProps.selectedObjectFolderOrObjectsWithContext ===
    nextProps.selectedObjectFolderOrObjectsWithContext &&
  prevProps.project === nextProps.project &&
  prevProps.globalObjectsContainer === nextProps.globalObjectsContainer &&
  prevProps.objectsContainer === nextProps.objectsContainer;

const MemoizedObjectsList = React.memo<Props, ObjectsListInterface>(
  ObjectsList,
  arePropsEqual
);

const ObjectsListWithErrorBoundary = React.forwardRef<
  Props,
  ObjectsListInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Objects list</Trans>}
    scope="scene-editor-objects-list"
  >
    <MemoizedObjectsList ref={ref} {...props} />
  </ErrorBoundary>
));

export default ObjectsListWithErrorBoundary;
