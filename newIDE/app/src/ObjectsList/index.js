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
import { enumerateObjects } from './EnumerateObjects';
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

type TreeViewItem = ObjectWithContext | RootFolder | EmptyPlaceholder;

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

const getObjectWithContextName = (objectWithContext: ObjectWithContext) =>
  objectWithContext.object.getName();

const getTreeViewItemName = (item: TreeViewItem) =>
  item.isRoot || item.isPlaceholder ? item.label : item.object.getName();

const getTreeViewItemId = (item: TreeViewItem) =>
  item.isRoot || item.isPlaceholder
    ? item.id
    : `object-item-${getObjectWithContextName(item)}`;
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.isRoot || item.isPlaceholder ? undefined : `object-item-${index}`;

const getTreeViewItemChildren = (item: TreeViewItem) =>
  item.isRoot ? item.children : null;
const getTreeViewItemData = (item: TreeViewItem) =>
  item.isRoot || item.isPlaceholder
    ? undefined
    : {
        objectName: item.object.getName(),
        global: item.global.toString(),
      };

const isObjectWithContextGlobal = (objectWithContext: ObjectWithContext) =>
  objectWithContext.global;

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
  renameObjectWithContext: ObjectWithContext => void,
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
  onRenameObjectFinish: (
    objectWithContext: ObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  selectedObjectNames: Array<string>,
  canInstallPrivateAsset: () => boolean,

  selectedObjectTags: SelectedTags,
  getAllObjectTags: () => Tags,
  onChangeSelectedObjectTags: SelectedTags => void,

  beforeSetAsGlobalObject?: (groupName: string) => boolean,
  canSetAsGlobalObject?: boolean,

  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onExportObject: (object: gdObject) => void,
  onObjectCreated: gdObject => void,
  onObjectSelected: (?ObjectWithContext) => void,
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
      onRenameObjectFinish,
      selectedObjectNames,
      canInstallPrivateAsset,

      selectedObjectTags,
      getAllObjectTags,
      onChangeSelectedObjectTags,

      beforeSetAsGlobalObject,
      canSetAsGlobalObject,

      onEditObject,
      onExportObject,
      onObjectCreated,
      onObjectSelected,
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
      renameObjectWithContext: objectWithContext => {
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectWithContext);
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

        const objectWithContext: ObjectWithContext = {
          object,
          global: false, // A new object is always added to the scene (layout) by default.
        };

        if (treeViewRef.current)
          treeViewRef.current.openItem(sceneObjectsRootFolderId);

        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectWithContext);
        }, 100); // A few ms is enough for a new render to be done.

        setNewObjectDialogOpen(false);
        // TODO Should it be called later?
        if (onEditObject) {
          onEditObject(object);
          onObjectCreated(object);
          onObjectSelected(objectWithContext);
        }
      },
      [
        project,
        objectsContainer,
        selectedObjectTags,
        onEditObject,
        onObjectCreated,
        onObjectSelected,
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

        const lastObjectWithContext = {
          object: objects[objects.length - 1],
          // Objects are added as scene objects.
          global: false,
        };

        // Scroll to the new object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(lastObjectWithContext);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [onObjectCreated, selectedObjectTags]
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
      (i18n: I18nType, objectWithContext: ObjectWithContext) => {
        const { object, global } = objectWithContext;

        const answer = Window.showConfirmDialog(
          i18n._(
            t`Are you sure you want to remove this object? This can't be undone.`
          )
        );
        if (!answer) return;

        // It's important to call onDeleteObject, because the parent might
        // have to do some refactoring/clean up work before the object is deleted
        // (typically, the SceneEditor will remove instances referring to the object,
        // leading to the removal of their renderer - which can keep a reference to
        // the object).
        onDeleteObject(objectWithContext, doRemove => {
          if (!doRemove) return;

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
      (objectWithContext: ObjectWithContext) => {
        const { object } = objectWithContext;
        Clipboard.set(CLIPBOARD_KIND, {
          type: object.getType(),
          name: object.getName(),
          object: serializeToJSObject(object),
        });
      },
      []
    );

    const cutObject = React.useCallback(
      (i18n: I18nType, objectWithContext: ObjectWithContext) => {
        copyObject(objectWithContext);
        deleteObject(i18n, objectWithContext);
      },
      [copyObject, deleteObject]
    );

    const addSerializedObjectToObjectsContainer = React.useCallback(
      ({
        objectName,
        positionObjectName,
        objectType,
        global,
        serializedObject,
      }: {|
        objectName: string,
        positionObjectName: string,
        objectType: string,
        global: boolean,
        serializedObject: Object,
      |}): ObjectWithContext => {
        const newName = newNameGenerator(
          objectName,
          name =>
            objectsContainer.hasObjectNamed(name) ||
            project.hasObjectNamed(name),
          ''
        );

        const newObject = global
          ? project.insertNewObject(
              project,
              objectType,
              newName,
              project.getObjectPosition(positionObjectName) + 1
            )
          : objectsContainer.insertNewObject(
              project,
              objectType,
              newName,
              objectsContainer.getObjectPosition(positionObjectName) + 1
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
      (objectWithContext: ObjectWithContext): ?ObjectWithContext => {
        if (!Clipboard.has(CLIPBOARD_KIND)) return null;

        const { object: pasteObject, global } = objectWithContext;
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
          positionObjectName: pasteObject.getName(),
          objectType: type,
          serializedObject: copiedObject,
          global,
        });

        onObjectModified(false);
        if (onObjectPasted) onObjectPasted(newObjectWithContext.object);

        return newObjectWithContext;
      },
      [addSerializedObjectToObjectsContainer, onObjectModified, onObjectPasted]
    );

    const editName = React.useCallback(
      (objectWithContext: ?ObjectWithContext) => {
        if (!objectWithContext) return;
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectWithContext);
      },
      []
    );

    const duplicateObject = React.useCallback(
      (objectWithContext: ObjectWithContext) => {
        const { object, global } = objectWithContext;

        const type = object.getType();
        const name = object.getName();
        const serializedObject = serializeToJSObject(object);

        const newObjectWithContext = addSerializedObjectToObjectsContainer({
          objectName: name,
          positionObjectName: name,
          objectType: type,
          serializedObject,
          global,
        });

        editName(newObjectWithContext);
      },
      [addSerializedObjectToObjectsContainer, editName]
    );

    const rename = React.useCallback(
      (item: TreeViewItem, newName: string) => {
        if (item.isRoot || item.isPlaceholder) return;
        const { global } = item;

        if (getObjectWithContextName(item) === newName) return;

        const validatedNewName = getValidatedObjectOrGroupName(newName, global);
        onRenameObjectFinish(item, validatedNewName, doRename => {
          if (!doRename) return;

          onObjectModified(false);
        });
      },
      [getValidatedObjectOrGroupName, onObjectModified, onRenameObjectFinish]
    );

    const editItem = React.useCallback(
      (item: TreeViewItem) => {
        if (item.isRoot || item.isPlaceholder) return;
        onEditObject(item.object);
      },
      [onEditObject]
    );

    const scrollToItem = (objectWithContext: ObjectWithContext) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItem(objectWithContext);
      }
    };

    const lists = enumerateObjects(project, objectsContainer);
    const selectedObjects: $ReadOnlyArray<TreeViewItem> = lists.allObjectsList.filter(
      objectWithContext =>
        selectedObjectNames.indexOf(objectWithContext.object.getName()) !== -1
    );
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        const treeViewItems = [
          {
            label: i18n._(t`Global Objects`),
            children:
              lists.projectObjectsList.length > 0
                ? lists.projectObjectsList
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
              lists.containerObjectsList.length > 0
                ? lists.containerObjectsList
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
      [lists]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) => {
        if (destinationItem.isRoot) return false;
        const selectedObjectsWithContext = lists.allObjectsList.filter(
          objectWithContext =>
            selectedObjectNames.indexOf(objectWithContext.object.getName()) !==
            -1
        );
        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.id === globalObjectsEmptyPlaceholderId &&
            selectedObjectsWithContext.length === 1 &&
            !selectedObjectsWithContext[0].global
          ) {
            // In that case, the user is drag n dropping a scene object on the
            // empty placeholder of the global objects section.
            return true;
          }
          return false;
        }
        // Check if at least one element in the selection can be moved.
        if (
          selectedObjectsWithContext.every(
            selectedObject => selectedObject.global === destinationItem.global
          )
        ) {
          return true;
        } else if (
          selectedObjectsWithContext.length === 1 &&
          selectedObjectsWithContext.every(
            selectedObject => selectedObject.global === false
          ) &&
          destinationItem.global === true
        ) {
          return true;
        }

        return false;
      },
      [lists.allObjectsList, selectedObjectNames]
    );

    const setAsGlobalObject = React.useCallback(
      (
        i18n: I18nType,
        objectWithContext: ObjectWithContext,
        index?: number
      ) => {
        const { object } = objectWithContext;

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

        // It's safe to call moveObjectToAnotherContainer because it does not invalidate the
        // references to the object in memory - so other editors like InstancesRenderer can
        // continue to work.
        objectsContainer.moveObjectToAnotherContainer(
          objectName,
          project,
          typeof index === 'number' ? index : project.getObjectsCount()
        );
        onObjectModified(true);

        // Scroll to the moved object.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectWithContext);
        }, 100); // A few ms is enough for a new render to be done.
      },
      [objectsContainer, onObjectModified, project, beforeSetAsGlobalObject]
    );

    const moveSelectionTo = React.useCallback(
      (i18n: I18nType, destinationItem: TreeViewItem) => {
        if (destinationItem.isRoot) return;

        const selectedObjectsWithContext = lists.allObjectsList.filter(
          objectWithContext =>
            selectedObjectNames.indexOf(objectWithContext.object.getName()) !==
            -1
        );

        if (destinationItem.isPlaceholder) {
          if (
            destinationItem.id === globalObjectsEmptyPlaceholderId &&
            selectedObjectsWithContext.length === 1 &&
            !selectedObjectsWithContext[0].global
          ) {
            const selectedObjectWithContext = selectedObjectsWithContext[0];
            setAsGlobalObject(i18n, selectedObjectWithContext, 0);
            return;
          }
          return;
        }

        if (selectedObjectsWithContext.length === 1) {
          const selectedObjectWithContext = selectedObjectsWithContext[0];
          if (
            selectedObjectWithContext.global === false &&
            destinationItem.global === true
          ) {
            const destinationIndex = project.getObjectPosition(
              destinationItem.object.getName()
            );
            setAsGlobalObject(
              i18n,
              selectedObjectWithContext,
              destinationIndex
            );
            return;
          }
        }

        selectedObjectsWithContext.forEach(movedObjectWithContext => {
          let container: gdObjectsContainer;
          let fromIndex: number;
          let toIndex: number;
          if (movedObjectWithContext.global === destinationItem.global) {
            container = destinationItem.global ? project : objectsContainer;

            fromIndex = container.getObjectPosition(
              movedObjectWithContext.object.getName()
            );
            toIndex = container.getObjectPosition(
              destinationItem.object.getName()
            );
          } else {
            return;
          }
          if (toIndex > fromIndex) toIndex -= 1;
          container.moveObject(fromIndex, toIndex);
        });
        onObjectModified(true);
      },
      [
        lists.allObjectsList,
        objectsContainer,
        onObjectModified,
        project,
        selectedObjectNames,
        setAsGlobalObject,
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

    const selectObject = React.useCallback(
      (objectWithContext: ?ObjectWithContext) => {
        onObjectSelected(objectWithContext);
      },
      [onObjectSelected]
    );

    const getTreeViewItemThumbnail = React.useCallback(
      (item: TreeViewItem) =>
        item.isRoot || item.isPlaceholder
          ? null
          : getThumbnail(project, item.object.getConfiguration()),
      [getThumbnail, project]
    );

    const eventsFunctionsExtensionsState = React.useContext(
      EventsFunctionsExtensionsContext
    );
    const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

    const renderObjectMenuTemplate = React.useCallback(
      (i18n: I18nType) => (item: TreeViewItem, index: number) => {
        if (item.isRoot || item.isPlaceholder) return;
        const { object } = item;
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
              'EffectCapacity::EffectBehavior'
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
            label: i18n._(t`Rename`),
            click: () => editName(item),
            accelerator: getShortcutDisplayName(
              preferences.values.userShortcutMap['RENAME_SCENE_OBJECT'] ||
                defaultShortcuts.RENAME_SCENE_OBJECT
            ),
          },
          {
            label: i18n._(t`Set as global object`),
            enabled: !isObjectWithContextGlobal(item),
            click: () => setAsGlobalObject(i18n, item),
            visible: canSetAsGlobalObject !== false,
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
          {
            label: i18n._(t`Delete`),
            click: () => deleteObject(i18n, item),
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
      ]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    return (
      <Background maxWidth>
        <Line>
          <Column expand>
            <SearchBar
              value={searchText}
              onRequestSearch={() => {}}
              onChange={text => setSearchText(text)}
              placeholder={t`Search objects`}
            />
          </Column>
        </Line>
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
                      // $FlowFixMe
                      selectedItems={selectedObjects}
                      onSelectItems={items => {
                        if (!items) selectObject(null);
                        const itemToSelect = items[0];
                        if ('isRoot' in itemToSelect) return;
                        selectObject(itemToSelect || null);
                      }}
                      onRenameItem={rename}
                      buildMenuTemplate={renderObjectMenuTemplate(i18n)}
                      onMoveSelectionToItem={destinationItem =>
                        moveSelectionTo(i18n, destinationItem)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
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
  prevProps.selectedObjectNames === nextProps.selectedObjectNames &&
  prevProps.selectedObjectTags === nextProps.selectedObjectTags &&
  prevProps.project === nextProps.project &&
  prevProps.objectsContainer === nextProps.objectsContainer;

export default React.memo<Props, ObjectsListInterface>(ObjectsList, areEqual);
