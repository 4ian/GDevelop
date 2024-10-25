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
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
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
  enumerateFoldersInContainer,
  enumerateFoldersInFolder,
  enumerateObjectsInFolder,
  getFoldersAscendanceWithoutRootFolder,
  getObjectFolderOrObjectUnifiedName,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { mapFor } from '../Utils/MapFor';
import IconButton from '../UI/IconButton';
import AddFolder from '../UI/CustomSvgIcons/AddFolder';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import { getInsertionParentAndPositionFromSelection } from '../Utils/ObjectFolders';
import { ObjectTreeViewItemContent } from './ObjectTreeViewItemContent';
import {
  ObjectFolderTreeViewItemContent,
  getObjectFolderTreeViewItemId,
} from './ObjectFolderTreeViewItemContent';

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

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getDataSet(): { [string]: string };
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
  moveAt(destinationIndex: number): void;
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
|}): Array<TreeViewItem> => {
  if (objectFolderOrObject.isFolder()) {
    return new ObjectFolderTreeViewItem({
      objectFolderOrObject: objectFolderOrObject,
      global: this.global,
      isRoot: false,
      content: new ObjectFolderTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        this.objectFolderTreeViewItemProps
      ),
    });
  } else {
    return new LeafTreeViewItem(
      new ObjectTreeViewItemContent(
        objectFolderOrObject,
        isGlobal,
        this.objectTreeViewItemProps
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
  placeholder: PlaceHolderTreeViewItem;
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
    placeholder: PlaceHolderTreeViewItem,
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
      return [this.placeholder];
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
    rightButton?: MenuButton,
    buildMenuTemplateFunction?: () => Array<MenuItemTemplate>
  ) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) =>
      [
        rightButton
          ? {
              id: rightButton.id,
              label: rightButton.label,
              click: rightButton.click,
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

  getDataSet(): { [string]: string } {
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

  moveAt(destinationIndex: number): void {}
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
|};

const ObjectsList = React.forwardRef<Props, ObjectsListInterface>(
  (
    {
      project,
      layout,
      eventsBasedObject,
      initialInstances,
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
          scrollToItem(objectFolderOrObjectWithContext);
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
        onObjectCreated,
        onObjectFolderOrObjectWithContextSelected,
      ]
    );

    const onObjectsAddedFromAssets = React.useCallback(
      (objects: Array<gdObject>) => {
        objects.forEach(object => {
          onObjectCreated(object);
        });
        if (treeViewRef.current)
          treeViewRef.current.openItems([sceneObjectsRootFolderId]);

        const lastObject = objects[objects.length - 1];
        const objectFolderOrObjectWithContext = {
          // A new object is always added to the scene (layout) by default.
          objectFolderOrObject: objectsContainer
            .getRootFolder()
            .getObjectChild(lastObject.getName()),
          global: false,
        };

        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectFolderOrObjectWithContext);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [onObjectCreated, objectsContainer]
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
      (item: ?TreeViewItem) => {
        if (!item) return;
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobile) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItem(item, 'start');
          }
          treeView.renameItem(item);
        }
      },
      [isMobile]
    );

    const scrollToItem = (item: TreeViewItem) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItem(item);
      }
    };

    const getClosestVisibleParent = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ): ?ObjectFolderOrObjectWithContext => {
      const treeView = treeViewRef.current;
      if (!treeView) return null;
      const { objectFolderOrObject, global } = objectFolderOrObjectWithContext;
      const topToBottomAscendanceWithContext = getFoldersAscendanceWithoutRootFolder(
        objectFolderOrObject
      )
        .reverse()
        .map(parent => ({ objectFolderOrObject: parent, global }));
      const topToBottomAscendanceOpenness = treeView.areItemsOpen(
        topToBottomAscendanceWithContext
      );
      const firstClosedFolderIndex = topToBottomAscendanceOpenness.indexOf(
        false
      );
      if (firstClosedFolderIndex === -1) {
        // If all parents are open, return the objectFolderOrObject given as input.
        return objectFolderOrObjectWithContext;
      }
      // $FlowFixMe - We are confident this TreeView item is in fact a ObjectFolderOrObjectWithContext
      return topToBottomAscendanceWithContext[firstClosedFolderIndex];
    };

    const setAsGlobalObject = React.useCallback(
      ({
        i18n,
        objectFolderOrObjectWithContext,
        index,
        folder,
      }: {
        i18n: I18nType,
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        index?: number,
        folder?: gdObjectFolderOrObject,
      }) => {
        if (!globalObjectsContainer) {
          return;
        }
        const { objectFolderOrObject } = objectFolderOrObjectWithContext;
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
            t`Global elements help to manage objects across multiple scenes and it is recommended for the most used objects. This action cannot be undone.

            Do you want to set as global object?`
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
          scrollToItem(newObjectFolderOrObjectWithContext);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [
        globalObjectsContainer,
        objectsContainer,
        beforeSetAsGlobalObject,
        onObjectModified,
        selectObjectFolderOrObjectWithContext,
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
              parentFolder.getChildPosition(selectedObjectFolderOrObject)
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

        editName(newObjectFolderOrObjectWithContext);
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
          const closestVisibleParent = getClosestVisibleParent(
            objectFolderOrObjectWithContext
          );
          if (closestVisibleParent) {
            treeView.animateItem(closestVisibleParent);
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
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
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
        forceUpdate,
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onSelectAllInstancesOfObjectInLayout,
        onEditObject,
        onDeleteObjects,
        onAddObjectInstance,
        initialInstances,
        onOpenEventBasedObjectEditor,
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
        forceUpdate,
      ]
    );

    const objectFolderTreeViewItemProps = React.useMemo<ObjectFolderTreeViewItemProps>(
      () => ({
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        forceUpdateList,
        forceUpdate,
      }),
      [
        project,
        globalObjectsContainer,
        objectsContainer,
        onObjectPasted,
        onObjectModified,
        expandFolders,
        addFolder,
        onAddNewObject,
        onMovedObjectFolderOrObjectToAnotherFolderInSameContainer,
        onRenameObjectFolderOrObjectWithContextFinish,
        onDeleteObjects,
        selectObjectFolderOrObjectWithContext,
        forceUpdateList,
        forceUpdate,
      ]
    );

    const globalObjectsRootFolder = globalObjectsContainer
      ? globalObjectsContainer.getRootFolder()
      : null;
    const objectsRootFolder = objectsContainer.getRootFolder();
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
                i18n._(t`Global Objects`)
              ),
              placeholder: new PlaceHolderTreeViewItem({
                label: (
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
                ),
                id: globalObjectsEmptyPlaceholderId,
              }),
              objectTreeViewItemProps,
              objectFolderTreeViewItemProps,
            }),
          new ObjectFolderTreeViewItem({
            objectFolderOrObject: objectsRootFolder,
            global: false,
            isRoot: true,
            content: new LabelTreeViewItemContent(
              sceneObjectsRootFolderId,
              i18n._(t`Scene Objects`),
              {
                icon: <Add />,
                label: i18n._(t`Add an object`),
                click: () => {
                  onAddNewObject(selectedObjectFolderOrObjectsWithContext[0]);
                },
                id: 'add-new-object-button',
              },
              () => [
                {
                  label: i18n._(t`Export as assets`),
                  click: () => onExportAssets(),
                },
              ]
            ),
            placeholder: new PlaceHolderTreeViewItem({
              label: i18n._(t`Start by adding a new object.`),
              id: sceneObjectsEmptyPlaceholderId,
            }),
            objectTreeViewItemProps,
            objectFolderTreeViewItemProps,
          }),
        ].filter(Boolean);
        // $FlowFixMe
        return treeViewItems;
      },
      [
        globalObjectsRootFolder,
        objectFolderTreeViewItemProps,
        objectTreeViewItemProps,
        objectsRootFolder,
        onAddNewObject,
        onExportAssets,
        selectedObjectFolderOrObjectsWithContext,
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
            deleteItem(selectedItems[0]);
          });
          keyboardShortcutsRef.current.setShortcutCallback(
            'onDuplicate',
            () => {
              duplicateItem(selectedItems[0]);
            }
          );
          keyboardShortcutsRef.current.setShortcutCallback('onRename', () => {
            editName(selectedItems[0]);
          });
        }
      },
      [selectedObjectFolderOrObjectsWithContext, editName, selectedItems]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) => {
        if (destinationItem.isRoot) return false;
        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.id === globalObjectsEmptyPlaceholderId &&
            selectedObjectFolderOrObjectsWithContext.length === 1 &&
            !selectedObjectFolderOrObjectsWithContext[0].global
          ) {
            // In that case, the user is drag n dropping a scene object on the
            // empty placeholder of the global objects section.
            return !selectedObjectFolderOrObjectsWithContext[0].objectFolderOrObject.isFolder();
          }
          return false;
        }
        // Check if at least one element in the selection can be moved.
        if (
          selectedObjectFolderOrObjectsWithContext.every(
            selectedObject => selectedObject.global === destinationItem.global
          )
        ) {
          if (
            selectedObjectFolderOrObjectsWithContext[0] &&
            destinationItem.objectFolderOrObject.isADescendantOf(
              selectedObjectFolderOrObjectsWithContext[0].objectFolderOrObject
            )
          ) {
            return false;
          }
          return true;
        } else if (
          selectedObjectFolderOrObjectsWithContext.length === 1 &&
          selectedObjectFolderOrObjectsWithContext.every(
            selectedObject => selectedObject.global === false
          ) &&
          destinationItem.global === true
        ) {
          return !selectedObjectFolderOrObjectsWithContext[0].objectFolderOrObject.isFolder();
        }

        return false;
      },
      [selectedObjectFolderOrObjectsWithContext]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (
          destinationItem.isRoot ||
          selectedObjectFolderOrObjectsWithContext.length !== 1
        )
          return;

        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.id === globalObjectsEmptyPlaceholderId &&
            selectedObjectFolderOrObjectsWithContext.length === 1 &&
            !selectedObjectFolderOrObjectsWithContext[0].global
          ) {
            const selectedObjectFolderOrObjectWithContext =
              selectedObjectFolderOrObjectsWithContext[0];

            setAsGlobalObject({
              i18n,
              objectFolderOrObjectWithContext: selectedObjectFolderOrObjectWithContext,
            });
          }
          return;
        }

        const selectedObjectFolderOrObjectWithContext =
          selectedObjectFolderOrObjectsWithContext[0];

        if (
          destinationItem.objectFolderOrObject ===
          selectedObjectFolderOrObjectWithContext.objectFolderOrObject
        ) {
          return;
        }

        if (
          selectedObjectFolderOrObjectWithContext.global === false &&
          destinationItem.global === true
        ) {
          let parent, index;
          if (
            where === 'inside' &&
            destinationItem.objectFolderOrObject.isFolder()
          ) {
            parent = destinationItem.objectFolderOrObject;
            index = 0;
          } else {
            parent = destinationItem.objectFolderOrObject.getParent();
            index =
              parent.getChildPosition(destinationItem.objectFolderOrObject) +
              (where === 'after' ? 1 : 0);
          }
          setAsGlobalObject({
            i18n,
            objectFolderOrObjectWithContext: selectedObjectFolderOrObjectWithContext,
            folder: parent,
            index,
          });
          return;
        }

        // At this point, the move is done from within the same container.
        if (
          selectedObjectFolderOrObjectWithContext.global ===
          destinationItem.global
        ) {
          const selectedObjectFolderOrObject =
            selectedObjectFolderOrObjectWithContext.objectFolderOrObject;
          const destinationObjectFolderOrObject =
            destinationItem.objectFolderOrObject;
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
            const fromIndex = selectedObjectFolderOrObjectParent.getChildPosition(
              selectedObjectFolderOrObject
            );
            let toIndex = selectedObjectFolderOrObjectParent.getChildPosition(
              destinationObjectFolderOrObject
            );
            if (toIndex > fromIndex) toIndex -= 1;
            if (where === 'after') toIndex += 1;
            selectedObjectFolderOrObjectParent.moveChild(fromIndex, toIndex);
          } else {
            if (
              destinationObjectFolderOrObject.isADescendantOf(
                selectedObjectFolderOrObject
              )
            ) {
              return;
            }
            const position =
              where === 'inside'
                ? 0
                : parent.getChildPosition(destinationObjectFolderOrObject) +
                  (where === 'after' ? 1 : 0);
            selectedObjectFolderOrObjectParent.moveObjectFolderOrObjectToAnotherFolder(
              selectedObjectFolderOrObject,
              parent,
              position
            );
            const treeView = treeViewRef.current;
            if (treeView) {
              const closestVisibleParent = getClosestVisibleParent({
                objectFolderOrObject: parent,
                global: destinationItem.global,
              });
              if (closestVisibleParent) {
                treeView.animateItem(closestVisibleParent);
              }
            }
          }
        } else {
          return;
        }
        onObjectModified(true);
      },
      [
        onObjectModified,
        selectedObjectFolderOrObjectsWithContext,
        setAsGlobalObject,
      ]
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback(
      (item: TreeViewItem) => {
        if (
          !selectedObjectFolderOrObjectsWithContext ||
          selectedObjectFolderOrObjectsWithContext.length !== 1 ||
          item.isPlaceholder
        )
          return;
        const { objectFolderOrObject: potentialParent } = item;
        const {
          objectFolderOrObject: selectedObjectFolderOrObject,
        } = selectedObjectFolderOrObjectsWithContext[0];
        if (!potentialParent || !selectedObjectFolderOrObject) return;
        if (selectedObjectFolderOrObject.isADescendantOf(potentialParent)) {
          selectObjectFolderOrObjectWithContext(null);
        }
      },
      [
        selectObjectFolderOrObjectWithContext,
        selectedObjectFolderOrObjectsWithContext,
      ]
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
        onGetItemInside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          if (!item.objectFolderOrObject.isFolder()) return null;
          else {
            if (item.objectFolderOrObject.getChildrenCount() === 0) return null;
            return {
              objectFolderOrObject: item.objectFolderOrObject.getChildAt(0),
              global: item.global,
            };
          }
        },
        onGetItemOutside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          const parent = item.objectFolderOrObject.getParent();
          if (parent.isRootFolder()) return null;
          return {
            objectFolderOrObject: parent,
            global: item.global,
          };
        },
      }),
      []
    );

    return (
      <Background maxWidth>
        <Column>
          <LineStackLayout>
            <Column expand noMargin>
              <SearchBar
                value={searchText}
                onRequestSearch={() => {}}
                onChange={text => setSearchText(text)}
                placeholder={t`Search objects`}
              />
            </Column>
            <Column noMargin>
              <IconButton
                size="small"
                onClick={() =>
                  addFolder(selectedObjectFolderOrObjectsWithContext)
                }
              >
                <AddFolder />
              </IconButton>
            </Column>
          </LineStackLayout>
        </Column>
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
                      selectedItems={selectedObjectFolderOrObjectsWithContext}
                      onSelectItems={items => {
                        if (!items) selectObjectFolderOrObjectWithContext(null);
                        const itemToSelect = items[0];
                        if (itemToSelect.isRoot) return;
                        selectObjectFolderOrObjectWithContext(
                          itemToSelect || null
                        );
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
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new object</Trans>}
              primary
              onClick={() =>
                onAddNewObject(selectedObjectFolderOrObjectsWithContext[0])
              }
              id="add-new-object-button"
              icon={<Add />}
            />
          </Column>
        </Line>
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
