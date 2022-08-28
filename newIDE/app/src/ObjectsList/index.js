// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

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
import type {
  ObjectWithContextList,
  ObjectWithContext,
} from '../ObjectsList/EnumerateObjects';
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
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
const gd: libGDevelop = global.gd;

const styles = {
  listContainer: {
    flex: 1,
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
  'Video::VideoObject': 'NewVideo',
};

export const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

const getObjectWithContextName = (objectWithContext: ObjectWithContext) =>
  objectWithContext.object.getName();

const isObjectWithContextGlobal = (objectWithContext: ObjectWithContext) =>
  objectWithContext.global;

const getPasteLabel = isGlobalObject => {
  let clipboardObjectName = '';
  if (Clipboard.has(CLIPBOARD_KIND)) {
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    clipboardObjectName =
      SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
  }

  return isGlobalObject
    ? 'Paste ' + clipboardObjectName + ' as a Global Object'
    : 'Paste ' + clipboardObjectName;
};

type State = {|
  newObjectDialogOpen: boolean,
  renamedObjectWithContext: ?ObjectWithContext,
  searchText: string,
  tagEditedObject: ?gdObject,
|};

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  objectsContainer: gdObjectsContainer,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  onDeleteObject: (
    objectWithContext: ObjectWithContext,
    cb: (boolean) => void
  ) => void,
  onRenameObject: (
    objectWithContext: ObjectWithContext,
    newName: string,
    cb: (boolean) => void
  ) => void,
  selectedObjectNames: Array<string>,

  selectedObjectTags: SelectedTags,
  getAllObjectTags: () => Tags,
  onChangeSelectedObjectTags: SelectedTags => void,

  onEditObject: (object: gdObject, initialTab: ?ObjectEditorTab) => void,
  onObjectCreated: gdObject => void,
  onObjectSelected: string => void,
  onObjectPasted?: gdObject => void,
  canRenameObject: (newName: string) => boolean,
  onAddObjectInstance: (objectName: string) => void,

  getThumbnail: (project: gdProject, object: gdObject) => string,
  unsavedChanges?: ?UnsavedChanges,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
|};

export default class ObjectsList extends React.Component<Props, State> {
  sortableList: ?SortableVirtualizedItemList<ObjectWithContext>;
  _displayedObjectWithContextsList: ObjectWithContextList = [];
  state = {
    newObjectDialogOpen: false,
    renamedObjectWithContext: null,
    searchText: '',
    tagEditedObject: null,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to objects list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (
      this.state.newObjectDialogOpen !== nextState.newObjectDialogOpen ||
      this.state.renamedObjectWithContext !==
        nextState.renamedObjectWithContext ||
      this.state.searchText !== nextState.searchText ||
      this.state.tagEditedObject !== nextState.tagEditedObject
    )
      return true;

    if (
      this.props.selectedObjectNames !== nextProps.selectedObjectNames ||
      this.props.selectedObjectTags !== nextProps.selectedObjectTags
    )
      return true;

    if (
      this.props.project !== nextProps.project ||
      this.props.objectsContainer !== nextProps.objectsContainer
    )
      return true;

    return false;
  }

  addObject = (objectType: string) => {
    const {
      project,
      objectsContainer,
      onEditObject,
      onObjectCreated,
      onObjectSelected,
    } = this.props;

    const name = newNameGenerator(
      objectTypeToDefaultName[objectType] || 'NewObject',
      name =>
        objectsContainer.hasObjectNamed(name) || project.hasObjectNamed(name)
    );

    const object = objectsContainer.insertNewObject(
      project,
      objectType,
      name,
      objectsContainer.getObjectsCount()
    );
    object.setTags(getStringFromTags(this.props.selectedObjectTags));

    this.setState(
      {
        newObjectDialogOpen: false,
      },
      () => {
        if (onEditObject) {
          onEditObject(object);
          onObjectCreated(object);
          onObjectSelected(name);
        }
      }
    );
  };

  _onObjectAddedFromAsset = (object: gdObject) => {
    const { onObjectCreated } = this.props;

    object.setTags(getStringFromTags(this.props.selectedObjectTags));
    onObjectCreated(object);

    this.forceUpdateList();
  };

  onAddNewObject = () => {
    this.setState({ newObjectDialogOpen: true });
  };

  _deleteObject = (i18n: I18nType, objectWithContext: ObjectWithContext) => {
    const { object, global } = objectWithContext;
    const { project, objectsContainer } = this.props;

    const answer = Window.showConfirmDialog(
      i18n._(
        t`Are you sure you want to remove this object? This can't be undone.`
      )
    );
    if (!answer) return;

    // It's important to call onDeleteObject, because the parent might
    // have to do some refactoring/clean up work before the object is deleted
    // (typically, the SceneEditor will remove instances refering to the object,
    // leading to the removal of their renderer - which can keep a reference to
    // the object).
    this.props.onDeleteObject(objectWithContext, doRemove => {
      if (!doRemove) return;

      if (global) {
        project.removeObject(object.getName());
      } else {
        objectsContainer.removeObject(object.getName());
      }

      this._onObjectModified(false);
    });
  };

  _copyObject = (objectWithContext: ObjectWithContext) => {
    const { object } = objectWithContext;
    Clipboard.set(CLIPBOARD_KIND, {
      type: object.getType(),
      name: object.getName(),
      object: serializeToJSObject(object),
    });
  };

  _cutObject = (i18n: I18nType, objectWithContext: ObjectWithContext) => {
    this._copyObject(objectWithContext);
    this._deleteObject(i18n, objectWithContext);
  };

  _duplicateObject = (objectWithContext: ObjectWithContext) => {
    this._copyObject(objectWithContext);
    this._pasteAndRename(objectWithContext);
  };

  _pasteAndRename = (objectWithContext: ObjectWithContext) => {
    this._editName(this._paste(objectWithContext));
  };

  _paste = (objectWithContext: ObjectWithContext): ?ObjectWithContext => {
    if (!Clipboard.has(CLIPBOARD_KIND)) return null;

    const { object: pasteObject, global } = objectWithContext;
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    const copiedObject = SafeExtractor.extractObjectProperty(
      clipboardContent,
      'object'
    );
    const name = SafeExtractor.extractStringProperty(clipboardContent, 'name');
    const type = SafeExtractor.extractStringProperty(clipboardContent, 'type');
    if (!name || !type || !copiedObject) return;

    const { project, objectsContainer, onObjectPasted } = this.props;

    const newName = newNameGenerator(
      name,
      name =>
        objectsContainer.hasObjectNamed(name) || project.hasObjectNamed(name),
      ''
    );

    const newObject = global
      ? project.insertNewObject(
          project,
          type,
          newName,
          project.getObjectPosition(pasteObject.getName()) + 1
        )
      : objectsContainer.insertNewObject(
          project,
          type,
          newName,
          objectsContainer.getObjectPosition(pasteObject.getName()) + 1
        );

    unserializeFromJSObject(
      newObject,
      copiedObject,
      'unserializeFrom',
      project
    );
    newObject.setName(newName); // Unserialization has overwritten the name.

    this._onObjectModified(false);
    if (onObjectPasted) onObjectPasted(newObject);

    return { object: newObject, global };
  };

  _editName = (objectWithContext: ?ObjectWithContext) => {
    this.setState(
      {
        renamedObjectWithContext: objectWithContext,
      },
      () => {
        if (this.sortableList) this.sortableList.forceUpdateGrid();
      }
    );
  };

  _rename = (objectWithContext: ObjectWithContext, newName: string) => {
    const { object } = objectWithContext;
    this.setState({
      renamedObjectWithContext: null,
    });

    if (getObjectWithContextName(objectWithContext) === newName) return;

    if (this.props.canRenameObject(newName)) {
      this.props.onRenameObject(objectWithContext, newName, doRename => {
        if (!doRename) return;

        object.setName(newName);
        this._onObjectModified(false);
      });
    }
  };

  _canMoveSelectionTo = (destinationObjectWithContext: ObjectWithContext) => {
    // Check if at least one element in the selection can be moved.
    const selectedObjectsWithContext = this._displayedObjectWithContextsList.filter(
      objectWithContext =>
        this.props.selectedObjectNames.indexOf(
          objectWithContext.object.getName()
        ) !== -1
    );
    if (
      selectedObjectsWithContext.every(
        selectedObject =>
          selectedObject.global === destinationObjectWithContext.global
      )
    ) {
      return true;
    }

    const displayedGlobalObjectsWithContext = this._displayedObjectWithContextsList.filter(
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
  };

  _moveSelectionTo = (destinationObjectWithContext: ObjectWithContext) => {
    const { project, objectsContainer } = this.props;

    const displayedGlobalObjectsWithContext = this._displayedObjectWithContextsList.filter(
      objectWithContext => objectWithContext.global
    );
    const displayedLocalObjectsWithContext = this._displayedObjectWithContextsList.filter(
      objectWithContext => !objectWithContext.global
    );

    const isDestinationItemFirstItemOfGlobalDisplayedList =
      destinationObjectWithContext.global &&
      displayedGlobalObjectsWithContext.indexOf(
        destinationObjectWithContext
      ) === 0;

    const selectedObjectsWithContext = this._displayedObjectWithContextsList.filter(
      objectWithContext =>
        this.props.selectedObjectNames.indexOf(
          objectWithContext.object.getName()
        ) !== -1
    );
    selectedObjectsWithContext.forEach(movedObjectWithContext => {
      let container: gdObjectsContainer;
      let fromIndex: number;
      let toIndex: number;
      if (
        movedObjectWithContext.global === destinationObjectWithContext.global
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
        toIndex = !this.state.searchText
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
    this._onObjectModified(true);
  };

  _setAsGlobalObject = (objectWithContext: ObjectWithContext) => {
    const { object } = objectWithContext;
    const { project, objectsContainer } = this.props;

    const objectName: string = object.getName();
    if (!objectsContainer.hasObjectNamed(objectName)) return;

    if (project.hasObjectNamed(objectName)) {
      showWarningBox(
        'A global object with this name already exists. Please change the object name before setting it as a global object',
        { delayToNextTick: true }
      );
      return;
    }

    const answer = Window.showConfirmDialog(
      "This object will be loaded and available in all the scenes. This is only recommended for objects that you reuse a lot and can't be undone. Make this object global?"
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
    this._onObjectModified(true);
  };

  forceUpdateList = () => {
    this.forceUpdate();
    if (this.sortableList) this.sortableList.forceUpdateGrid();
  };

  _openEditTagDialog = (tagEditedObject: ?gdObject) => {
    this.setState({
      tagEditedObject,
    });
  };

  _changeObjectTags = (object: gdObject, tags: Tags) => {
    object.setTags(getStringFromTags(tags));

    // Force update the list as it's possible that user removed a tag
    // from an object, that should then not be shown anymore in the list.
    this._onObjectModified(true);
  };

  _selectObject = (objectWithContext: ?ObjectWithContext) => {
    this.props.onObjectSelected(
      objectWithContext ? objectWithContext.object.getName() : ''
    );
  };

  _getObjectThumbnail = (objectWithContext: ObjectWithContext) =>
    this.props.getThumbnail(this.props.project, objectWithContext.object);

  _renderObjectMenuTemplate = (i18n: I18nType) => (
    objectWithContext: ObjectWithContext,
    index: number
  ) => {
    const { object } = objectWithContext;
    const objectMetadata = gd.MetadataProvider.getObjectMetadata(
      this.props.project.getCurrentPlatform(),
      object.getType()
    );
    return [
      {
        label: i18n._(t`Copy`),
        click: () => this._copyObject(objectWithContext),
      },
      {
        label: i18n._(t`Cut`),
        click: () => this._cutObject(i18n, objectWithContext),
      },
      {
        label: getPasteLabel(objectWithContext.global),
        enabled: Clipboard.has(CLIPBOARD_KIND),
        click: () => this._paste(objectWithContext),
      },
      {
        label: i18n._(t`Duplicate`),
        click: () => this._duplicateObject(objectWithContext),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Edit object`),
        click: () => this.props.onEditObject(object),
      },
      {
        label: i18n._(t`Edit object variables`),
        click: () => this.props.onEditObject(object, 'variables'),
      },
      {
        label: i18n._(t`Edit behaviors`),
        click: () => this.props.onEditObject(object, 'behaviors'),
      },
      {
        label: i18n._(t`Edit effects`),
        click: () => this.props.onEditObject(object, 'effects'),
        enabled: !objectMetadata.isUnsupportedBaseObjectCapability('effect'),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Rename`),
        click: () => this._editName(objectWithContext),
      },
      {
        label: i18n._(t`Set as global object`),
        enabled: !isObjectWithContextGlobal(objectWithContext),
        click: () => this._setAsGlobalObject(objectWithContext),
      },
      {
        label: i18n._(t`Tags`),
        submenu: buildTagsMenuTemplate({
          noTagLabel: 'No tags',
          getAllTags: this.props.getAllObjectTags,
          selectedTags: getTagsFromString(object.getTags()),
          onChange: objectTags => {
            this._changeObjectTags(object, objectTags);
          },
          editTagsLabel: 'Add/edit tags...',
          onEditTags: () => this._openEditTagDialog(object),
        }),
      },
      {
        label: i18n._(t`Delete`),
        click: () => this._deleteObject(i18n, objectWithContext),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add instance to the scene`),
        click: () => this.props.onAddObjectInstance(object.getName()),
      },
      { type: 'separator' },
      {
        label: i18n._(t`Add a new object...`),
        click: () => this.onAddNewObject(),
      },
    ];
  };

  _onObjectModified = (shouldForceUpdateList: boolean) => {
    if (this.props.unsavedChanges)
      this.props.unsavedChanges.triggerUnsavedChanges();

    if (shouldForceUpdateList) this.forceUpdateList();
    else this.forceUpdate();
  };

  render() {
    const {
      project,
      layout,
      objectsContainer,
      resourceSources,
      onChooseResource,
      resourceExternalEditors,
      selectedObjectTags,
    } = this.props;
    const { searchText, tagEditedObject } = this.state;

    const lists = enumerateObjects(project, objectsContainer);
    this._displayedObjectWithContextsList = filterObjectsList(
      lists.allObjectsList,
      {
        searchText,
        selectedTags: selectedObjectTags,
      }
    );
    const selectedObjects = this._displayedObjectWithContextsList.filter(
      objectWithContext =>
        this.props.selectedObjectNames.indexOf(
          objectWithContext.object.getName()
        ) !== -1
    );
    const renamedObjectWithContext = this._displayedObjectWithContextsList.find(
      isSameObjectWithContext(this.state.renamedObjectWithContext)
    );

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    return (
      <Background maxWidth>
        <TagChips
          tags={this.props.selectedObjectTags}
          onChange={this.props.onChangeSelectedObjectTags}
        />
        <div style={styles.listContainer}>
          <AutoSizer>
            {({ height, width }) => (
              <I18n>
                {({ i18n }) => (
                  <SortableVirtualizedItemList
                    key={listKey}
                    ref={sortableList => (this.sortableList = sortableList)}
                    fullList={this._displayedObjectWithContextsList}
                    width={width}
                    height={height}
                    getItemName={getObjectWithContextName}
                    getItemThumbnail={this._getObjectThumbnail}
                    getItemId={(objectWithContext, index) => {
                      return 'object-item-' + index;
                    }}
                    isItemBold={isObjectWithContextGlobal}
                    onEditItem={objectWithContext =>
                      this.props.onEditObject(objectWithContext.object)
                    }
                    onAddNewItem={this.onAddNewObject}
                    addNewItemLabel={<Trans>Add a new object</Trans>}
                    addNewItemId="add-new-object-button"
                    selectedItems={selectedObjects}
                    onItemSelected={this._selectObject}
                    renamedItem={renamedObjectWithContext}
                    onRename={this._rename}
                    buildMenuTemplate={this._renderObjectMenuTemplate(i18n)}
                    onMoveSelectionToItem={this._moveSelectionTo}
                    canMoveSelectionToItem={this._canMoveSelectionTo}
                    scaleUpItemIconWhenSelected={useScreenType() === 'touch'}
                    reactDndType={objectWithContextReactDndType}
                  />
                )}
              </I18n>
            )}
          </AutoSizer>
        </div>
        <SearchBar
          value={searchText}
          onRequestSearch={() => {}}
          onChange={text =>
            this.setState({
              searchText: text,
            })
          }
          aspect="integrated-search-bar"
          placeholder={t`Search objects`}
        />
        {this.state.newObjectDialogOpen && (
          <NewObjectDialog
            onClose={() =>
              this.setState({
                newObjectDialogOpen: false,
              })
            }
            onCreateNewObject={this.addObject}
            onObjectAddedFromAsset={this._onObjectAddedFromAsset}
            project={project}
            layout={layout}
            objectsContainer={objectsContainer}
            resourceSources={resourceSources}
            onChooseResource={onChooseResource}
            resourceExternalEditors={resourceExternalEditors}
          />
        )}
        {tagEditedObject && (
          <EditTagsDialog
            tagsString={tagEditedObject.getTags()}
            onEdit={tags => {
              this._changeObjectTags(tagEditedObject, tags);
              this._openEditTagDialog(null);
            }}
            onCancel={() => this._openEditTagDialog(null)}
          />
        )}
      </Background>
    );
  }
}
