// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';
import { useTheme } from '@material-ui/core/styles';

import React from 'react';
import { AutoSizer } from 'react-virtualized';
import SortableVirtualizedItemList from '../UI/SortableVirtualizedItemList';
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
import {
  enumerateObjects,
  filterObjectsList,
  isSameObjectWithContext,
} from './EnumerateObjects';
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
import TreeView from '../UI/TreeView';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
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
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import ArrowHeadBottom from '../UI/CustomSvgIcons/ArrowHeadBottom';
import ArrowHeadTop from '../UI/CustomSvgIcons/ArrowHeadTop';
import EmptyMessage from '../UI/EmptyMessage';

const gd: libGDevelop = global.gd;

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

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
  renamedObjectWithContext: ?ObjectWithContext,
  onRenameObjectStart: (?ObjectWithContext) => void,
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
      renamedObjectWithContext,
      onRenameObjectStart,
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
    const sortableList = React.useRef<?SortableVirtualizedItemList<ObjectWithContext>>(
      null
    );
    const theme = useTheme();
    const [globalObjectsOpen, setGlobalObjectsOpen] = React.useState<boolean>(
      true
    );
    const [sceneObjectsOpen, setSceneObjectsOpen] = React.useState<boolean>(
      true
    );
    const [
      objectListDividerYPosition,
      setObjectListDividerYPosition,
    ] = React.useState<number>(50);
    const isDraggingDivider = React.useRef<boolean>(false);
    const listContainerRef = React.useRef<?HTMLDivElement>(null);
    const forceUpdate = useForceUpdate();

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (sortableList.current) sortableList.current.forceUpdateGrid();
      },
      [forceUpdate]
    );

    const [newObjectDialogOpen, setNewObjectDialogOpen] = React.useState(false);

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (sortableList.current) sortableList.current.forceUpdateGrid();
      },
      openNewObjectDialog: () => {
        setNewObjectDialogOpen(true);
      },
      closeNewObjectDialog: () => {
        setNewObjectDialogOpen(false);
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
        forceUpdateList();
      },
      [forceUpdateList, onObjectCreated, selectedObjectTags]
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
        onRenameObjectStart(objectWithContext);
        // TODO Should it be called later?
        if (sortableList.current) sortableList.current.forceUpdateGrid();
      },
      [onRenameObjectStart]
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
      (objectWithContext: ObjectWithContext, newName: string) => {
        const { global } = objectWithContext;
        onRenameObjectStart(null);

        if (getObjectWithContextName(objectWithContext) === newName) return;

        const validatedNewName = getValidatedObjectOrGroupName(newName, global);
        onRenameObjectFinish(objectWithContext, validatedNewName, doRename => {
          if (!doRename) return;

          onObjectModified(false);
        });
      },
      [
        getValidatedObjectOrGroupName,
        onObjectModified,
        onRenameObjectStart,
        onRenameObjectFinish,
      ]
    );

    const scrollToItem = (objectWithContext: ObjectWithContext) => {
      if (sortableList.current) {
        sortableList.current.scrollToItem(objectWithContext);
      }
    };

    const lists = enumerateObjects(project, objectsContainer);
    const displayedObjectWithContextsList = filterObjectsList(
      lists.allObjectsList,
      {
        searchText,
        selectedTags: selectedObjectTags,
      }
    );
    const selectedObjects = displayedObjectWithContextsList.filter(
      objectWithContext =>
        selectedObjectNames.indexOf(objectWithContext.object.getName()) !== -1
    );
    const displayedRenamedObjectWithContext = displayedObjectWithContextsList.find(
      isSameObjectWithContext(renamedObjectWithContext)
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationObjectWithContext: ObjectWithContext) => {
        // Check if at least one element in the selection can be moved.
        const selectedObjectsWithContext = displayedObjectWithContextsList.filter(
          objectWithContext =>
            selectedObjectNames.indexOf(objectWithContext.object.getName()) !==
            -1
        );
        if (
          selectedObjectsWithContext.every(
            selectedObject =>
              selectedObject.global === destinationObjectWithContext.global
          )
        ) {
          return true;
        }

        const displayedGlobalObjectsWithContext = displayedObjectWithContextsList.filter(
          objectWithContext => objectWithContext.global
        );

        if (
          selectedObjectsWithContext.every(
            selectedObject => !selectedObject.global
          ) &&
          destinationObjectWithContext.global &&
          displayedGlobalObjectsWithContext.indexOf(
            destinationObjectWithContext
          ) === 0
        ) {
          return true;
        }
        return false;
      },
      [displayedObjectWithContextsList, selectedObjectNames]
    );

    const moveSelectionTo = React.useCallback(
      (destinationObjectWithContext: ObjectWithContext) => {
        const displayedGlobalObjectsWithContext = displayedObjectWithContextsList.filter(
          objectWithContext => objectWithContext.global
        );
        const displayedLocalObjectsWithContext = displayedObjectWithContextsList.filter(
          objectWithContext => !objectWithContext.global
        );

        const isDestinationItemFirstItemOfGlobalDisplayedList =
          destinationObjectWithContext.global &&
          displayedGlobalObjectsWithContext.indexOf(
            destinationObjectWithContext
          ) === 0;

        const selectedObjectsWithContext = displayedObjectWithContextsList.filter(
          objectWithContext =>
            selectedObjectNames.indexOf(objectWithContext.object.getName()) !==
            -1
        );
        selectedObjectsWithContext.forEach(movedObjectWithContext => {
          let container: gdObjectsContainer;
          let fromIndex: number;
          let toIndex: number;
          if (
            movedObjectWithContext.global ===
            destinationObjectWithContext.global
          ) {
            container = destinationObjectWithContext.global
              ? project
              : objectsContainer;

            fromIndex = container.getObjectPosition(
              movedObjectWithContext.object.getName()
            );
            toIndex = container.getObjectPosition(
              destinationObjectWithContext.object.getName()
            );
          } else if (
            !movedObjectWithContext.global &&
            isDestinationItemFirstItemOfGlobalDisplayedList
          ) {
            container = objectsContainer;
            fromIndex = container.getObjectPosition(
              movedObjectWithContext.object.getName()
            );
            toIndex = !searchText
              ? container.getObjectsCount()
              : container.getObjectPosition(
                  displayedLocalObjectsWithContext[
                    displayedLocalObjectsWithContext.length - 1
                  ].object.getName()
                ) + 1;
          } else {
            return;
          }
          if (toIndex > fromIndex) toIndex -= 1;
          container.moveObject(fromIndex, toIndex);
        });
        onObjectModified(true);
      },
      [
        displayedObjectWithContextsList,
        objectsContainer,
        onObjectModified,
        project,
        searchText,
        selectedObjectNames,
      ]
    );

    const setAsGlobalObject = React.useCallback(
      (i18n: I18nType, objectWithContext: ObjectWithContext) => {
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

        // It's safe to call moveObjectToAnotherContainer because it does not invalidate the
        // references to the object in memory - so other editors like InstancesRenderer can
        // continue to work.
        objectsContainer.moveObjectToAnotherContainer(
          objectName,
          project,
          project.getObjectsCount()
        );
        onObjectModified(true);
      },
      [objectsContainer, onObjectModified, project, beforeSetAsGlobalObject]
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

    const getObjectThumbnail = React.useCallback(
      (objectWithContext: ObjectWithContext) =>
        getThumbnail(project, objectWithContext.object.getConfiguration()),
      [getThumbnail, project]
    );

    const eventsFunctionsExtensionsState = React.useContext(
      EventsFunctionsExtensionsContext
    );
    const eventsFunctionsExtensionWriter = eventsFunctionsExtensionsState.getEventsFunctionsExtensionWriter();

    const renderObjectMenuTemplate = React.useCallback(
      (i18n: I18nType) => (
        objectWithContext: ObjectWithContext,
        index: number
      ) => {
        const { object } = objectWithContext;
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
            click: () => copyObject(objectWithContext),
          },
          {
            label: i18n._(t`Cut`),
            click: () => cutObject(i18n, objectWithContext),
          },
          {
            label: getPasteLabel(i18n, objectWithContext.global),
            enabled: Clipboard.has(CLIPBOARD_KIND),
            click: () => paste(objectWithContext),
          },
          {
            label: i18n._(t`Duplicate`),
            click: () => duplicateObject(objectWithContext),
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
            click: () => editName(objectWithContext),
            accelerator: getShortcutDisplayName(
              preferences.values.userShortcutMap['RENAME_SCENE_OBJECT'] ||
                defaultShortcuts.RENAME_SCENE_OBJECT
            ),
          },
          {
            label: i18n._(t`Set as global object`),
            enabled: !isObjectWithContextGlobal(objectWithContext),
            click: () => setAsGlobalObject(i18n, objectWithContext),
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
            click: () => deleteObject(i18n, objectWithContext),
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

    const changeDividerPosition = React.useCallback(
      (event: MouseEvent) => {
        if (listContainerRef.current) {
          if (!globalObjectsOpen) setGlobalObjectsOpen(true);
          const containerRectangle = listContainerRef.current.getBoundingClientRect();
          const targetPercentage =
            (100 * (event.clientY - containerRectangle.top)) /
            containerRectangle.height;
          if (targetPercentage < 3) {
            setGlobalObjectsOpen(false);
          } else {
            setObjectListDividerYPosition(targetPercentage);
          }
        }
      },
      [globalObjectsOpen]
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    const screenType = useScreenType();

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
        <div
          style={styles.listContainer}
          id="objects-list"
          ref={listContainerRef}
          onMouseUp={e => {
            isDraggingDivider.current = false;
          }}
          onMouseLeave={() => {
            isDraggingDivider.current = false;
          }}
          onMouseMove={event => {
            if (isDraggingDivider.current) {
              changeDividerPosition(event);
            }
          }}
        >
          <I18n>
            {({ i18n }) => (
              <>
                <div
                  style={{
                    height: globalObjectsOpen
                      ? `${objectListDividerYPosition}%`
                      : 0,
                    minHeight: 32,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Line noMargin alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => setGlobalObjectsOpen(!globalObjectsOpen)}
                    >
                      {globalObjectsOpen ? (
                        <ArrowHeadTop fontSize="small" />
                      ) : (
                        <ArrowHeadBottom fontSize="small" />
                      )}
                    </IconButton>
                    <Text size="sub-title">
                      <Trans>Global objects</Trans>
                    </Text>
                  </Line>
                  {globalObjectsOpen &&
                    (lists.projectObjectsList.length > 0 ? (
                      <div style={{ flex: 1, paddingLeft: 16 }}>
                        <AutoSizer>
                          {({ height, width }) => (
                            <TreeView
                              key={listKey}
                              ref={sortableList}
                              items={lists.projectObjectsList}
                              width={width}
                              height={height}
                              searchText={searchText}
                              getItemName={getObjectWithContextName}
                              getItemThumbnail={getObjectThumbnail}
                              getItemChildren={() => []}
                              multiSelect={false}
                              getItemId={objectWithContext =>
                                `object-item-${getObjectWithContextName(
                                  objectWithContext
                                )}`
                              }
                              // getItemData={(objectWithContext, index) => ({
                              //   objectName: objectWithContext.object.getName(),
                              //   global: objectWithContext.global.toString(),
                              // })}
                              // isItemBold={isObjectWithContextGlobal}
                              onEditItem={objectWithContext =>
                                onEditObject(objectWithContext.object)
                              }
                              selectedItems={selectedObjects}
                              onSelectItems={items =>
                                selectObject(items ? items[0] : null)
                              }
                              // renamedItem={displayedRenamedObjectWithContext}
                              onRenameItem={rename}
                              buildMenuTemplate={renderObjectMenuTemplate(i18n)}
                              onMoveSelectionToItem={moveSelectionTo}
                              canMoveSelectionToItem={canMoveSelectionTo}
                              // scaleUpItemIconWhenSelected={screenType === 'touch'}
                              reactDndType={objectWithContextReactDndType}
                            />
                          )}
                        </AutoSizer>
                      </div>
                    ) : (
                      <div>
                        <EmptyMessage>
                          <Trans>There are no global objects yet.</Trans>
                        </EmptyMessage>
                      </div>
                    ))}
                </div>
                <div
                  style={{
                    borderTop: `2px solid ${theme.palette.divider}`,
                    height: 4,
                    width: '100%',
                    boxSizing: 'border-box',
                    cursor: 'ns-resize',
                  }}
                  onMouseDown={e => {
                    e.stopPropagation();
                    isDraggingDivider.current = true;
                  }}
                />
                <div
                  style={{
                    height: `${100 - objectListDividerYPosition}%`,
                    minHeight: 32,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Line noMargin alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => setSceneObjectsOpen(!sceneObjectsOpen)}
                    >
                      {sceneObjectsOpen ? (
                        <ArrowHeadTop fontSize="small" />
                      ) : (
                        <ArrowHeadBottom fontSize="small" />
                      )}
                    </IconButton>
                    <Text size="sub-title">
                      <Trans>Scene objects</Trans>
                    </Text>
                  </Line>
                  {sceneObjectsOpen && (
                    <div style={{ flex: 1, paddingLeft: 16 }}>
                      <AutoSizer>
                        {({ height, width }) => {
                          return (
                            <TreeView
                              key={listKey}
                              ref={sortableList}
                              items={lists.containerObjectsList}
                              width={width}
                              height={height}
                              searchText={searchText}
                              getItemName={getObjectWithContextName}
                              getItemThumbnail={getObjectThumbnail}
                              getItemChildren={() => []}
                              multiSelect={false}
                              getItemId={objectWithContext =>
                                `object-item-${getObjectWithContextName(
                                  objectWithContext
                                )}`
                              }
                              // getItemData={(objectWithContext, index) => ({
                              //   objectName: objectWithContext.object.getName(),
                              //   global: objectWithContext.global.toString(),
                              // })}
                              // isItemBold={isObjectWithContextGlobal}
                              onEditItem={objectWithContext =>
                                onEditObject(objectWithContext.object)
                              }
                              selectedItems={selectedObjects}
                              onSelectItems={items =>
                                selectObject(items ? items[0] : null)
                              }
                              // renamedItem={displayedRenamedObjectWithContext}
                              onRenameItem={rename}
                              buildMenuTemplate={renderObjectMenuTemplate(i18n)}
                              onMoveSelectionToItem={moveSelectionTo}
                              canMoveSelectionToItem={canMoveSelectionTo}
                              // scaleUpItemIconWhenSelected={screenType === 'touch'}
                              reactDndType={objectWithContextReactDndType + 'e'}
                            />
                          );
                        }}
                      </AutoSizer>
                    </div>
                  )}
                </div>
              </>
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
