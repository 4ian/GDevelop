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
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { CLIPBOARD_KIND } from './ClipboardKind';
import TagChips from '../UI/TagChips';
import EditTagsDialog from '../UI/EditTagsDialog';
import {
  type Tags,
  type SelectedTags,
  getStringFromTags,
  buildTagsMenuTemplate,
  getTagsFromString,
} from '../Utils/TagsHelper';
import TreeView, { type TreeViewInterface } from '../UI/TreeView';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import {
  enumerateFoldersInContainer,
  enumerateObjectFolderOrObjects,
  getObjectFolderOrObjectUnifiedName,
  type ObjectFolderOrObjectWithContext,
} from './EnumerateObjectFolderOrObject';
import { mapFor } from '../Utils/MapFor';
import IconButton from '../UI/IconButton';
import AddFolder from '../UI/CustomSvgIcons/AddFolder';
import { LineStackLayout } from '../UI/Layout';

const gd: libGDevelop = global.gd;
const sceneObjectsRootFolderId = 'scene-objects';
const globalObjectsRootFolderId = 'global-objects';
const globalObjectsEmptyPlaceholderId = 'global-empty-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

export type RootFolder = {|
  +label: string,
  +children: Array<ObjectWithContext>,
  +isRoot: true,
  +id: string,
|};

export type EmptyPlaceholder = {|
  +label: string,
  +isPlaceholder: true,
  +id: string,
|};

type TreeViewItem =
  | ObjectFolderOrObjectWithContext
  | RootFolder
  | EmptyPlaceholder;

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
  'TileMap::TileMap': 'NewTileMap',
  'TileMap::CollisionMask': 'NewTileMapMask',
  'MyDummyExtension::DummyObject': 'NewDummyObject',
  'Lighting::LightObject': 'NewLight',
  'TextInput::TextInputObject': 'NewTextInput',
  'Scene3D::Model3DObject': 'New3DModel',
  'Scene3D::Cube3DObject': 'New3DBox',
  'Video::VideoObject': 'NewVideo',
};

export const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

const getTreeViewItemName = (item: TreeViewItem) => {
  if (item.isRoot || item.isPlaceholder) return item.label;
  return getObjectFolderOrObjectUnifiedName(item.objectFolderOrObject);
};

const getTreeViewItemId = (item: TreeViewItem) => {
  if (item.isRoot || item.isPlaceholder) return item.id;
  const { objectFolderOrObject } = item;
  if (objectFolderOrObject.isFolder()) {
    // Add the ptr to the id since two folders can have the same name.
    return `object-folder-${objectFolderOrObject.getFolderName()}-${
      objectFolderOrObject.ptr
    }`;
  }
  return objectFolderOrObject.getObject().getName();
};

const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.isRoot || item.isPlaceholder ? undefined : `object-item-${index}`;

const getTreeViewItemChildren = (item: TreeViewItem) => {
  if (item.isPlaceholder) return null;
  if (item.isRoot) return item.children;
  const { objectFolderOrObject, global } = item;
  return mapFor(0, objectFolderOrObject.getChildrenCount(), i => ({
    objectFolderOrObject: objectFolderOrObject.getChildAt(i),
    global,
  }));
};
const getTreeViewItemData = (item: TreeViewItem) =>
  item.isRoot || item.isPlaceholder
    ? undefined
    : item.objectFolderOrObject.isFolder()
    ? undefined
    : {
        objectName: item.objectFolderOrObject.getObject().getName(),
        global: item.global.toString(),
      };

const isObjectFolderOrObjectWithContextGlobal = (
  objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
) => objectFolderOrObjectWithContext.global;

const getPasteLabel = (i18n: I18nType, isGlobalObject: boolean) => {
  let clipboardObjectName = '';
  if (Clipboard.has(CLIPBOARD_KIND)) {
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    clipboardObjectName =
      SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
  }

  return isGlobalObject
    ? i18n._(t`Paste ${clipboardObjectName} as a Global Object`)
    : i18n._(t`Paste ${clipboardObjectName}`);
};

export type ObjectsListInterface = {|
  forceUpdateList: () => void,
  openNewObjectDialog: () => void,
  closeNewObjectDialog: () => void,
  renameObjectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext => void,
|};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  initialInstances?: gdInitialInstancesContainer,
  objectsContainer: gdObjectsContainer,
  onSelectAllInstancesOfObjectInLayout?: string => void,
  resourceManagementProps: ResourceManagementProps,
  onDeleteObject: (
    objectWithContext: ObjectWithContext,
    cb: (boolean) => void
  ) => void,
  onRenameObjectFolderOrObjectWithContextFinish: (
    objectWithContext: ObjectFolderOrObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  selectedObjectFolderOrObjectsWithContext: Array<ObjectFolderOrObjectWithContext>,
  canInstallPrivateAsset: () => boolean,

  selectedObjectTags: SelectedTags,
  getAllObjectTags: () => Tags,
  onChangeSelectedObjectTags: SelectedTags => void,

  beforeSetAsGlobalObject?: (groupName: string) => boolean,
  canSetAsGlobalObject?: boolean,

  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onExportObject: (object: gdObject) => void,
  onObjectCreated: gdObject => void,
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
      initialInstances,
      objectsContainer,
      resourceManagementProps,
      onSelectAllInstancesOfObjectInLayout,
      onDeleteObject,
      onRenameObjectFolderOrObjectWithContextFinish,
      selectedObjectFolderOrObjectsWithContext,
      canInstallPrivateAsset,

      selectedObjectTags,
      getAllObjectTags,
      onChangeSelectedObjectTags,

      beforeSetAsGlobalObject,
      canSetAsGlobalObject,

      onEditObject,
      onExportObject,
      onObjectCreated,
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
    const preferences = React.useContext(PreferencesContext);
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    const [newObjectDialogOpen, setNewObjectDialogOpen] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      openNewObjectDialog: () => {
        setNewObjectDialogOpen(true);
      },
      closeNewObjectDialog: () => {
        setNewObjectDialogOpen(false);
      },
      renameObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext => {
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectFolderOrObjectWithContext);
      },
    }));

    const [searchText, setSearchText] = React.useState('');
    const [tagEditedObject, setTagEditedObject] = React.useState<?gdObject>(
      null
    );

    const addObject = React.useCallback(
      (objectType: string) => {
        const defaultName = project.hasEventsBasedObject(objectType)
          ? 'New' + project.getEventsBasedObject(objectType).getDefaultName()
          : objectTypeToDefaultName[objectType] || 'NewObject';
        const name = newNameGenerator(
          defaultName,
          name =>
            objectsContainer.hasObjectNamed(name) ||
            project.hasObjectNamed(name)
        );

        const object = objectsContainer.insertNewObject(
          project,
          objectType,
          name,
          objectsContainer.getObjectsCount()
        );
        object.setTags(getStringFromTags(selectedObjectTags));

        const objectFolderOrObjectWithContext = {
          // A new object is always added to the scene (layout) by default.
          objectFolderOrObject: objectsContainer
            .getRootFolder()
            .getObjectChild(name),
          global: false,
        };

        if (treeViewRef.current)
          treeViewRef.current.openItem(sceneObjectsRootFolderId);

        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectFolderOrObjectWithContext);
        }, 100); // A few ms is enough for a new render to be done.

        setNewObjectDialogOpen(false);
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
        objectsContainer,
        selectedObjectTags,
        onEditObject,
        onObjectCreated,
        onObjectFolderOrObjectWithContextSelected,
      ]
    );

    const onObjectsAddedFromAssets = React.useCallback(
      (objects: Array<gdObject>) => {
        objects.forEach(object => {
          object.setTags(getStringFromTags(selectedObjectTags));
          onObjectCreated(object);
        });
        if (treeViewRef.current)
          treeViewRef.current.openItem(sceneObjectsRootFolderId);

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
      [onObjectCreated, selectedObjectTags, objectsContainer]
    );

    const onAddNewObject = React.useCallback(() => {
      setNewObjectDialogOpen(true);
    }, []);

    const onObjectModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
    );

    const deleteObject = React.useCallback(
      (
        i18n: I18nType,
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
      ) => {
        const {
          objectFolderOrObject,
          global,
        } = objectFolderOrObjectWithContext;
        if (objectFolderOrObject.isFolder()) return;

        const answer = Window.showConfirmDialog(
          i18n._(
            t`Are you sure you want to remove this object? This can't be undone.`
          )
        );
        if (!answer) return;

        const objectWithContext = {
          object: objectFolderOrObject.getObject(),
          global,
        };

        // It's important to call onDeleteObject, because the parent might
        // have to do some refactoring/clean up work before the object is deleted
        // (typically, the SceneEditor will remove instances referring to the object,
        // leading to the removal of their renderer - which can keep a reference to
        // the object).
        onDeleteObject(objectWithContext, doRemove => {
          if (!doRemove) return;

          const { object } = objectWithContext;
          if (global) {
            project.removeObject(object.getName());
          } else {
            objectsContainer.removeObject(object.getName());
          }

          onObjectModified(false);
        });
      },
      [objectsContainer, onDeleteObject, onObjectModified, project]
    );

    const copyObject = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        const { objectFolderOrObject } = objectFolderOrObjectWithContext;
        if (objectFolderOrObject.isFolder()) return;
        const object = objectFolderOrObject.getObject();
        Clipboard.set(CLIPBOARD_KIND, {
          type: object.getType(),
          name: object.getName(),
          object: serializeToJSObject(object),
        });
      },
      []
    );

    const cutObject = React.useCallback(
      (
        i18n: I18nType,
        objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
      ) => {
        copyObject(objectFolderOrObjectWithContext);
        deleteObject(i18n, objectFolderOrObjectWithContext);
      },
      [copyObject, deleteObject]
    );

    const addSerializedObjectToObjectsContainer = React.useCallback(
      ({
        objectName,
        positionObjectFolderOrObjectWithContext,
        objectType,
        serializedObject,
      }: {|
        objectName: string,
        positionObjectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext,
        objectType: string,
        serializedObject: Object,
      |}): ObjectWithContext => {
        const newName = newNameGenerator(
          objectName,
          name =>
            objectsContainer.hasObjectNamed(name) ||
            project.hasObjectNamed(name),
          ''
        );

        const {
          objectFolderOrObject,
          global,
        } = positionObjectFolderOrObjectWithContext;

        const positionFolder = objectFolderOrObject.getParent();
        const positionInFolder = positionFolder.getChildPosition(
          objectFolderOrObject
        );

        const newObject = global
          ? project.insertNewObjectInFolder(
              project,
              objectType,
              newName,
              positionFolder,
              positionInFolder + 1
            )
          : objectsContainer.insertNewObjectInFolder(
              project,
              objectType,
              newName,
              positionFolder,
              positionInFolder + 1
            );

        unserializeFromJSObject(
          newObject,
          serializedObject,
          'unserializeFrom',
          project
        );
        newObject.setName(newName); // Unserialization has overwritten the name.

        return { object: newObject, global };
      },
      [objectsContainer, project]
    );

    const paste = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        if (!Clipboard.has(CLIPBOARD_KIND)) return;

        const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
        const copiedObject = SafeExtractor.extractObjectProperty(
          clipboardContent,
          'object'
        );
        const name = SafeExtractor.extractStringProperty(
          clipboardContent,
          'name'
        );
        const type = SafeExtractor.extractStringProperty(
          clipboardContent,
          'type'
        );
        if (!name || !type || !copiedObject) return;

        const newObjectWithContext = addSerializedObjectToObjectsContainer({
          objectName: name,
          positionObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext,
          objectType: type,
          serializedObject: copiedObject,
        });

        onObjectModified(false);
        if (onObjectPasted) onObjectPasted(newObjectWithContext.object);
      },
      [addSerializedObjectToObjectsContainer, onObjectModified, onObjectPasted]
    );

    const editName = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        if (!objectFolderOrObjectWithContext) return;
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectFolderOrObjectWithContext);
      },
      []
    );

    const duplicateObject = React.useCallback(
      (objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext) => {
        const {
          objectFolderOrObject,
          global,
        } = objectFolderOrObjectWithContext;
        if (objectFolderOrObject.isFolder()) return;

        const object = objectFolderOrObject.getObject();
        const type = object.getType();
        const name = object.getName();
        const serializedObject = serializeToJSObject(object);

        const newObjectWithContext = addSerializedObjectToObjectsContainer({
          objectName: name,
          positionObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext,
          objectType: type,
          serializedObject,
        });

        const newObjectFolderOrObjectWithContext = {
          objectFolderOrObject: objectFolderOrObject
            .getParent()
            .getObjectChild(newObjectWithContext.object.getName()),
          global,
        };

        forceUpdateList();
        editName(newObjectFolderOrObjectWithContext);
      },
      [addSerializedObjectToObjectsContainer, editName, forceUpdateList]
    );

    const rename = React.useCallback(
      (item: TreeViewItem, newName: string) => {
        if (item.isRoot || item.isPlaceholder) return;
        const { global, objectFolderOrObject } = item;

        if (
          getObjectFolderOrObjectUnifiedName(objectFolderOrObject) === newName
        )
          return;

        const validatedNewName = getValidatedObjectOrGroupName(newName, global);
        onRenameObjectFolderOrObjectWithContextFinish(
          item,
          validatedNewName,
          doRename => {
            if (!doRename) return;

            onObjectModified(false);
          }
        );
      },
      [
        getValidatedObjectOrGroupName,
        onObjectModified,
        onRenameObjectFolderOrObjectWithContextFinish,
      ]
    );

    const editItem = React.useCallback(
      (item: TreeViewItem) => {
        if (item.isRoot || item.isPlaceholder) return;
        const { objectFolderOrObject } = item;
        if (objectFolderOrObject.isFolder()) return;

        onEditObject(objectFolderOrObject.getObject());
      },
      [onEditObject]
    );

    const scrollToItem = (
      objectFolderOrObjectWithContext: ObjectFolderOrObjectWithContext
    ) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItem(objectFolderOrObjectWithContext);
      }
    };

    const {
      projectObjectFolderOrObjectsList,
      containerObjectFolderOrObjectsList,
    } = enumerateObjectFolderOrObjects(project, objectsContainer);
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        const treeViewItems = [
          {
            label: i18n._(t`Global Objects`),
            children:
              projectObjectFolderOrObjectsList.length > 0
                ? projectObjectFolderOrObjectsList
                : [
                    {
                      label: i18n._(t`There is no global object yet.`),
                      id: globalObjectsEmptyPlaceholderId,
                      isPlaceholder: true,
                    },
                  ],
            isRoot: true,
            id: globalObjectsRootFolderId,
          },
          {
            label: i18n._(t`Scene Objects`),
            children:
              containerObjectFolderOrObjectsList.length > 0
                ? containerObjectFolderOrObjectsList
                : [
                    {
                      label: i18n._(t`Start by adding a new object.`),
                      id: 'scene-empty-placeholder',
                      isPlaceholder: true,
                    },
                  ],
            isRoot: true,
            id: sceneObjectsRootFolderId,
          },
        ];
        // $FlowFixMe
        return treeViewItems;
      },
      [projectObjectFolderOrObjectsList, containerObjectFolderOrObjectsList]
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
            return true;
          }
          return false;
        }
        // Check if at least one element in the selection can be moved.
        if (
          selectedObjectFolderOrObjectsWithContext.every(
            selectedObject => selectedObject.global === destinationItem.global
          )
        ) {
          return true;
        } else if (
          selectedObjectFolderOrObjectsWithContext.length === 1 &&
          selectedObjectFolderOrObjectsWithContext.every(
            selectedObject => selectedObject.global === false
          ) &&
          destinationItem.global === true
        ) {
          return true;
        }

        return false;
      },
      [selectedObjectFolderOrObjectsWithContext]
    );

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
        const { objectFolderOrObject } = objectFolderOrObjectWithContext;
        const destinationFolder =
          folder && folder.isFolder() ? folder : project.getRootFolder();
        if (objectFolderOrObject.isFolder()) return;
        const object = objectFolderOrObject.getObject();

        const objectName: string = object.getName();
        if (!objectsContainer.hasObjectNamed(objectName)) return;

        if (project.hasObjectNamed(objectName)) {
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
            t`This object will be loaded and available in all the scenes. This is only recommended for objects that you reuse a lot and can't be undone. Make this object global?`
          )
        );
        if (!answer) return;

        if (treeViewRef.current)
          treeViewRef.current.openItem(globalObjectsRootFolderId);

        // It's safe to call moveObjectFolderOrObjectToAnotherContainerInFolder because
        // it does not invalidate the references to the object in memory - so other editors
        // like InstancesRenderer can continue to work.
        objectsContainer.moveObjectFolderOrObjectToAnotherContainerInFolder(
          objectFolderOrObject,
          project,
          destinationFolder,
          typeof index === 'number' ? index : project.getObjectsCount()
        );
        onObjectModified(true);

        const newObjectFolderOrObjectWithContext = {
          objectFolderOrObject,
          global: true,
        };

        // Scroll to the moved object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(newObjectFolderOrObjectWithContext);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [objectsContainer, onObjectModified, project, beforeSetAsGlobalObject]
    );

    const selectObject = React.useCallback(
      (objectFolderOrObjectWithContext: ?ObjectFolderOrObjectWithContext) => {
        onObjectFolderOrObjectWithContextSelected(
          objectFolderOrObjectWithContext
        );
      },
      [onObjectFolderOrObjectWithContextSelected]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'after' | 'before'
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
            onObjectModified(true);
            selectObject({
              ...selectedObjectFolderOrObjectWithContext,
              global: true,
            });
            return;
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
          const parent = destinationItem.objectFolderOrObject.getParent();
          setAsGlobalObject({
            i18n,
            objectFolderOrObjectWithContext: selectedObjectFolderOrObjectWithContext,
            folder: parent,
            index:
              parent.getChildPosition(destinationItem.objectFolderOrObject) +
              (where === 'after' ? 1 : 0),
          });
          onObjectModified(true);
          selectObject({
            ...selectedObjectFolderOrObjectWithContext,
            global: true,
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
          const selectedObjectFolderOrObjectParent = selectedObjectFolderOrObject.getParent();
          const destinationObjectFolderOrObject =
            destinationItem.objectFolderOrObject;
          const destinationParent = destinationObjectFolderOrObject.getParent();
          if (destinationParent === selectedObjectFolderOrObjectParent) {
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
            selectedObjectFolderOrObjectParent.moveObjectFolderOrObjectToAnotherFolder(
              selectedObjectFolderOrObject,
              destinationParent,
              destinationParent.getChildPosition(
                destinationObjectFolderOrObject
              ) + (where === 'after' ? 1 : 0)
            );
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
        selectObject,
      ]
    );

    const openEditTagDialog = React.useCallback(
      (tagEditedObject: ?gdObject) => {
        setTagEditedObject(tagEditedObject);
      },
      []
    );

    const changeObjectTags = React.useCallback(
      (object: gdObject, tags: Tags) => {
        object.setTags(getStringFromTags(tags));

        // Force update the list as it's possible that user removed a tag
        // from an object, that should then not be shown anymore in the list.
        onObjectModified(true);
      },
      [onObjectModified]
    );

    const getTreeViewItemThumbnail = React.useCallback(
      (item: TreeViewItem) => {
        if (item.isRoot || item.isPlaceholder) return null;
        const { objectFolderOrObject } = item;
        if (objectFolderOrObject.isFolder()) return 'FOLDER';
        return getThumbnail(
          project,
          objectFolderOrObject.getObject().getConfiguration()
        );
      },
      [getThumbnail, project]
    );

    const addFolder = React.useCallback(
      () => {
        if (selectedObjectFolderOrObjectsWithContext.length === 1) {
          const {
            objectFolderOrObject: selectedObjectFolderOrObject,
          } = selectedObjectFolderOrObjectsWithContext[0];
          const parentFolder = selectedObjectFolderOrObject.getParent();
          parentFolder.insertNewFolder(
            'NewFolder',
            parentFolder.getChildPosition(selectedObjectFolderOrObject)
          );
        }
        forceUpdateList();
      },
      [selectedObjectFolderOrObjectsWithContext, forceUpdateList]
    );

    const eventsFunctionsExtensionsState = React.useContext(
      EventsFunctionsExtensionsContext
    );
    const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

    const renderObjectMenuTemplate = React.useCallback(
      (i18n: I18nType) => (item: TreeViewItem, index: number) => {
        if (item.isRoot || item.isPlaceholder) return [];
        const { objectFolderOrObject } = item;

        const container = item.global ? project : objectsContainer;
        const folderAndPathsInContainer = enumerateFoldersInContainer(
          container
        ).filter(
          folderAndPath =>
            folderAndPath.folder !== item.objectFolderOrObject.getParent()
        );
        if (objectFolderOrObject.isFolder())
          return [
            {
              label: i18n._(t`Rename`),
              click: () => editName(item),
              accelerator: getShortcutDisplayName(
                preferences.values.userShortcutMap['RENAME_SCENE_OBJECT'] ||
                  defaultShortcuts.RENAME_SCENE_OBJECT
              ),
            },
            {
              label: i18n._('Move to folder'),
              submenu: folderAndPathsInContainer.map(({ folder, path }) => ({
                label: path,
                click: () => {
                  item.objectFolderOrObject
                    .getParent()
                    .moveObjectFolderOrObjectToAnotherFolder(
                      item.objectFolderOrObject,
                      folder,
                      0
                    );
                  onObjectModified(true);
                  if (treeViewRef.current)
                    treeViewRef.current.openItem(
                      getTreeViewItemId({
                        objectFolderOrObject: folder,
                        global: item.global,
                      })
                    );
                },
              })),
            },
          ];

        const object = objectFolderOrObject.getObject();
        const instanceCountOnScene = initialInstances
          ? getInstanceCountInLayoutForObject(
              initialInstances,
              object.getName()
            )
          : undefined;
        const objectMetadata = gd.MetadataProvider.getObjectMetadata(
          project.getCurrentPlatform(),
          object.getType()
        );
        return [
          {
            label: i18n._(t`Copy`),
            click: () => copyObject(item),
          },
          {
            label: i18n._(t`Cut`),
            click: () => cutObject(i18n, item),
          },
          {
            label: getPasteLabel(i18n, item.global),
            enabled: Clipboard.has(CLIPBOARD_KIND),
            click: () => paste(item),
          },
          {
            label: i18n._(t`Duplicate`),
            click: () => duplicateObject(item),
          },
          {
            label: i18n._(t`Rename`),
            click: () => editName(item),
            accelerator: getShortcutDisplayName(
              preferences.values.userShortcutMap['RENAME_SCENE_OBJECT'] ||
                defaultShortcuts.RENAME_SCENE_OBJECT
            ),
          },
          {
            label: i18n._(t`Delete`),
            click: () => deleteObject(i18n, item),
          },
          { type: 'separator' },
          {
            label: i18n._(t`Edit object`),
            click: () => onEditObject(object),
          },
          {
            label: i18n._(t`Edit object variables`),
            click: () => onEditObject(object, 'variables'),
          },
          {
            label: i18n._(t`Edit behaviors`),
            click: () => onEditObject(object, 'behaviors'),
          },
          {
            label: i18n._(t`Edit effects`),
            click: () => onEditObject(object, 'effects'),
            enabled: objectMetadata.hasDefaultBehavior(
              'EffectCapability::EffectBehavior'
            ),
          },
          eventsFunctionsExtensionWriter &&
          project.hasEventsBasedObject(object.getType())
            ? {
                label: i18n._(t`Export object`),
                click: () => onExportObject && onExportObject(object),
              }
            : null,
          { type: 'separator' },
          {
            label: i18n._(t`Set as global object`),
            enabled: !isObjectFolderOrObjectWithContextGlobal(item),
            click: () => {
              selectObject(null);
              setAsGlobalObject({
                i18n,
                objectFolderOrObjectWithContext: item,
              });
            },
            visible: canSetAsGlobalObject !== false,
          },
          {
            label: i18n._('Move to folder'),
            submenu: folderAndPathsInContainer.map(({ folder, path }) => ({
              label: path,
              click: () => {
                item.objectFolderOrObject
                  .getParent()
                  .moveObjectFolderOrObjectToAnotherFolder(
                    item.objectFolderOrObject,
                    folder,
                    0
                  );
                onObjectModified(true);
                if (treeViewRef.current)
                  treeViewRef.current.openItem(
                    getTreeViewItemId({
                      objectFolderOrObject: folder,
                      global: item.global,
                    })
                  );
              },
            })),
          },
          {
            label: i18n._(t`Tags`),
            submenu: buildTagsMenuTemplate({
              noTagLabel: i18n._(t`No tags`),
              getAllTags: getAllObjectTags,
              selectedTags: getTagsFromString(object.getTags()),
              onChange: objectTags => {
                changeObjectTags(object, objectTags);
              },
              editTagsLabel: i18n._(t`Add/edit tags...`),
              onEditTags: () => openEditTagDialog(object),
            }),
          },
          { type: 'separator' },
          {
            label: i18n._(t`Add instance to the scene`),
            click: () => onAddObjectInstance(object.getName()),
          },
          instanceCountOnScene !== undefined &&
          onSelectAllInstancesOfObjectInLayout
            ? {
                label: i18n._(
                  t`Select instances on scene (${instanceCountOnScene})`
                ),
                click: () =>
                  onSelectAllInstancesOfObjectInLayout(object.getName()),
                enabled: instanceCountOnScene > 0,
              }
            : undefined,
          { type: 'separator' },
          {
            label: i18n._(t`Add a new object...`),
            click: onAddNewObject,
          },
        ].filter(Boolean);
      },
      [
        changeObjectTags,
        copyObject,
        cutObject,
        deleteObject,
        duplicateObject,
        editName,
        getAllObjectTags,
        onAddNewObject,
        onAddObjectInstance,
        onEditObject,
        onExportObject,
        onSelectAllInstancesOfObjectInLayout,
        openEditTagDialog,
        paste,
        project,
        setAsGlobalObject,
        eventsFunctionsExtensionWriter,
        preferences.values.userShortcutMap,
        canSetAsGlobalObject,
        initialInstances,
        selectObject,
        objectsContainer,
        onObjectModified,
      ]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;
    const initiallyOpenedNodeIds = [
      projectObjectFolderOrObjectsList.length === 0
        ? null
        : globalObjectsRootFolderId,
      sceneObjectsRootFolderId,
    ].filter(Boolean);

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
              <IconButton size="small" onClick={addFolder}>
                <AddFolder />
              </IconButton>
            </Column>
          </LineStackLayout>
        </Column>
        <TagChips
          tags={selectedObjectTags}
          onChange={onChangeSelectedObjectTags}
        />
        <div style={styles.listContainer} id="objects-list">
          <I18n>
            {({ i18n }) => (
              <div style={{ flex: 1 }}>
                <AutoSizer style={{ width: '100%' }} disableWidth>
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
                      getItemChildren={getTreeViewItemChildren}
                      multiSelect={false}
                      getItemId={getTreeViewItemId}
                      getItemHtmlId={getTreeViewItemHtmlId}
                      getItemDataset={getTreeViewItemData}
                      onEditItem={editItem}
                      selectedItems={selectedObjectFolderOrObjectsWithContext}
                      onSelectItems={items => {
                        if (!items) selectObject(null);
                        const itemToSelect = items[0];
                        if ('isRoot' in itemToSelect) return;
                        selectObject(itemToSelect || null);
                      }}
                      onRenameItem={rename}
                      buildMenuTemplate={renderObjectMenuTemplate(i18n)}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
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
              onClick={onAddNewObject}
              id="add-new-object-button"
              icon={<Add />}
            />
          </Column>
        </Line>
        {newObjectDialogOpen && (
          <NewObjectDialog
            onClose={() => setNewObjectDialogOpen(false)}
            onCreateNewObject={addObject}
            onObjectsAddedFromAssets={onObjectsAddedFromAssets}
            project={project}
            layout={layout}
            objectsContainer={objectsContainer}
            resourceManagementProps={resourceManagementProps}
            canInstallPrivateAsset={canInstallPrivateAsset}
          />
        )}
        {tagEditedObject && (
          <EditTagsDialog
            tagsString={tagEditedObject.getTags()}
            onEdit={tags => {
              changeObjectTags(tagEditedObject, tags);
              openEditTagDialog(null);
            }}
            onCancel={() => openEditTagDialog(null)}
          />
        )}
      </Background>
    );
  }
);

const areEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to objects list is made outside
  // from the component.
  // If a change is made, the component won't notice it: you have to manually
  // call forceUpdate.
  prevProps.selectedObjectFolderOrObjectsWithContext ===
    nextProps.selectedObjectFolderOrObjectsWithContext &&
  prevProps.selectedObjectTags === nextProps.selectedObjectTags &&
  prevProps.project === nextProps.project &&
  prevProps.objectsContainer === nextProps.objectsContainer;

export default React.memo<Props, ObjectsListInterface>(ObjectsList, areEqual);
