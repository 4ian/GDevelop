// @flow
import { Trans } from '@lingui/macro';

import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { ListItem } from 'material-ui/List';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import ObjectRow from './ObjectRow';
import NewObjectDialog from './NewObjectDialog';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListCommonItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { enumerateObjects, filterObjectsList } from './EnumerateObjects';
import type {
  ObjectWithContextList,
  ObjectWithContext,
} from '../ObjectsList/EnumerateObjects';
import { CLIPBOARD_KIND } from './ClipboardKind';
import TagChips from '../UI/TagChips';
import EditTagsDialog from '../UI/EditTagsDialog';
import { type Tags, getStringFromTags } from '../Utils/TagsHelper';

const listItemHeight = 48;
const styles = {
  listContainer: {
    flex: 1,
  },
};

const AddObjectRow = makeAddItem(ListItem);

const SortableObjectRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return (
    <div style={style}>
      <ObjectRow {...otherProps} />
    </div>
  );
});

const SortableAddObjectRow = SortableElement(props => {
  return <AddObjectRow {...props} />;
});

class ObjectsList extends Component<*, *> {
  list: any;

  forceUpdateGrid() {
    if (this.list) this.list.forceUpdateGrid();
  }

  render() {
    let { height, width, fullList, project, selectedObjectNames } = this.props;

    return (
      <List
        ref={list => (this.list = list)}
        height={height}
        rowCount={fullList.length}
        rowHeight={listItemHeight}
        rowRenderer={({ index, key, style }) => {
          const objectWithContext = fullList[index];
          if (objectWithContext.key === 'add-objects-row') {
            return (
              <SortableAddObjectRow
                index={fullList.length}
                key={key}
                style={style}
                disabled
                onClick={this.props.onAddNewObject}
                primaryText={<Trans>Click to add an object</Trans>}
              />
            );
          }

          const nameBeingEdited =
            this.props.renamedObjectWithContext &&
            this.props.renamedObjectWithContext.object ===
              objectWithContext.object &&
            this.props.renamedObjectWithContext.global ===
              objectWithContext.global;

          return (
            <SortableObjectRow
              index={index}
              key={objectWithContext.object.ptr}
              project={project}
              object={objectWithContext.object}
              isGlobalObject={objectWithContext.global}
              style={style}
              onEdit={
                this.props.onEditObject
                  ? () => this.props.onEditObject(objectWithContext.object)
                  : undefined
              }
              onEditVariables={() =>
                this.props.onEditVariables(objectWithContext.object)
              }
              onEditName={() => this.props.onEditName(objectWithContext)}
              onDelete={() => this.props.onDelete(objectWithContext)}
              onCopyObject={() => this.props.onCopyObject(objectWithContext)}
              onCutObject={() => this.props.onCutObject(objectWithContext)}
              onDuplicateObject={() =>
                this.props.onDuplicateObject(objectWithContext)
              }
              onPasteObject={() => this.props.onPasteObject(objectWithContext)}
              onRename={newName =>
                this.props.onRename(objectWithContext, newName)
              }
              onSetAsGlobalObject={
                objectWithContext.global
                  ? undefined
                  : () => this.props.onSetAsGlobalObject(objectWithContext)
              }
              onAddNewObject={this.props.onAddNewObject}
              editingName={nameBeingEdited}
              getThumbnail={this.props.getThumbnail}
              getAllObjectTags={this.props.getAllObjectTags}
              onObjectSelected={this.props.onObjectSelected}
              onEditTags={() => this.props.onEditTags(objectWithContext.object)}
              onChangeTags={objectTags =>
                this.props.onChangeTags(objectWithContext.object, objectTags)
              }
              selected={
                selectedObjectNames.indexOf(
                  objectWithContext.object.getName()
                ) !== -1
              }
            />
          );
        }}
        width={width}
      />
    );
  }
}

const SortableObjectsList = SortableContainer(ObjectsList, { withRef: true });

type StateType = {|
  newObjectDialogOpen: boolean,
  renamedObjectWithContext: ?ObjectWithContext,
  variablesEditedObject: ?gdObject,
  searchText: string,
  tagEditedObject: ?gdObject,
|};

export default class ObjectsListContainer extends React.Component<
  *,
  StateType
> {
  static defaultProps = {
    onDeleteObject: (objectWithContext: ObjectWithContext, cb: Function) =>
      cb(true),
    onRenameObject: (
      objectWithContext: ObjectWithContext,
      newName: string,
      cb: Function
    ) => cb(true),
  };

  sortableList: any;
  _displayedObjectsList: ObjectWithContextList = [];
  state: StateType = {
    newObjectDialogOpen: false,
    renamedObjectWithContext: null,
    variablesEditedObject: null,
    searchText: '',
    tagEditedObject: null,
  };

  shouldComponentUpdate(nextProps: *, nextState: StateType) {
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
      this.state.variablesEditedObject !== nextState.variablesEditedObject ||
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
      'NewObject',
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
          onObjectCreated(name);
          onObjectSelected(name);
        }
      }
    );
  };

  onAddNewObject = () => {
    this.setState({ newObjectDialogOpen: true });
  };

  _deleteObject = (objectWithContext: ObjectWithContext) => {
    const { object, global } = objectWithContext;
    const { project, objectsContainer } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this object? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteObject(objectWithContext, doRemove => {
      if (!doRemove) return;

      if (global) {
        project.removeObject(object.getName());
      } else {
        objectsContainer.removeObject(object.getName());
      }

      this.forceUpdate();
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

  _cutObject = (objectWithContext: ObjectWithContext) => {
    this._copyObject(objectWithContext);
    this._deleteObject(objectWithContext);
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
    const { object: copiedObject, type, name } = Clipboard.get(CLIPBOARD_KIND);
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
          project.getObjectPosition(pasteObject.getName())
        )
      : objectsContainer.insertNewObject(
          project,
          type,
          newName,
          objectsContainer.getObjectPosition(pasteObject.getName())
        );

    unserializeFromJSObject(
      newObject,
      copiedObject,
      'unserializeFrom',
      project
    );
    newObject.setName(newName); // Unserialization has overwritten the name.

    this.forceUpdate();
    if (onObjectPasted) onObjectPasted(newObject);

    return { object: newObject, global };
  };

  _editName = (objectWithContext: ?ObjectWithContext) => {
    this.setState(
      {
        renamedObjectWithContext: objectWithContext,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _editVariables = (object: ?gdObject) => {
    this.setState({
      variablesEditedObject: object,
    });
  };

  _rename = (objectWithContext: ObjectWithContext, newName: string) => {
    const { object } = objectWithContext;

    this.setState({
      renamedObjectWithContext: null,
    });

    if (this.props.canRenameObject(objectWithContext, newName)) {
      this.props.onRenameObject(objectWithContext, newName, doRename => {
        if (!doRename) return;

        object.setName(newName);
        this.forceUpdate();
      });
    }
  };

  _move = (oldIndex: number, newIndex: number) => {
    // Moving objects can be discarded by the parent (this is used to allow
    // dropping objects on the scene editor).
    if (!this.props.canMoveObjects) return;

    const { project, objectsContainer } = this.props;

    const movedObjectWithContext = this._displayedObjectsList[oldIndex];
    const destinationObjectWithContext = this._displayedObjectsList[newIndex];
    if (!movedObjectWithContext || !destinationObjectWithContext) return;

    if (movedObjectWithContext.global !== destinationObjectWithContext.global) {
      // Can't move an object from the objects container to the global objects
      // or vice-versa.
      return;
    }

    const container: gdObjectsContainer = movedObjectWithContext.global
      ? project
      : objectsContainer;
    container.moveObject(
      container.getObjectPosition(movedObjectWithContext.object.getName()),
      container.getObjectPosition(destinationObjectWithContext.object.getName())
    );

    this.forceUpdateList();
  };

  _onStartDraggingObject = ({ index }: { index: number }) => {
    const draggedObjectWithContext = this._displayedObjectsList[index];
    if (!draggedObjectWithContext) {
      return;
    }

    this.props.onStartDraggingObject(draggedObjectWithContext.object);
  };

  _setAsGlobalObject = (objectWithContext: ObjectWithContext) => {
    const { object } = objectWithContext;
    const { project, objectsContainer } = this.props;

    const objectName = object.getName();
    if (!objectsContainer.hasObjectNamed(objectName)) return;

    if (project.hasObjectNamed(objectName)) {
      showWarningBox(
        'A global object with this name already exists. Please change the object name before setting it as a global object'
      );
      return;
    }

    //eslint-disable-next-line
    const answer = confirm(
      "This object will be loaded and available in all the scenes. This is only recommended for objects that you reuse a lot and can't be undone. Make this object global?"
    );
    if (!answer) return;

    project.insertObject(
      objectsContainer.getObject(objectName),
      project.getObjectsCount()
    );
    objectsContainer.removeObject(objectName);

    this.forceUpdateList();
  };

  forceUpdateList = () => {
    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
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
    this.forceUpdateList();
  };

  render() {
    const { project, objectsContainer, selectedObjectTags } = this.props;
    const { searchText, tagEditedObject } = this.state;

    const lists = enumerateObjects(project, objectsContainer);
    this._displayedObjectsList = filterObjectsList(lists.allObjectsList, {
      searchText,
      selectedTags: selectedObjectTags,
    });
    const fullList = this._displayedObjectsList.concat({
      key: 'add-objects-row',
      object: null,
    });

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
              <SortableObjectsList
                key={listKey}
                ref={sortableList => (this.sortableList = sortableList)}
                fullList={fullList}
                project={project}
                width={width}
                height={height}
                renamedObjectWithContext={this.state.renamedObjectWithContext}
                getThumbnail={this.props.getThumbnail}
                getAllObjectTags={this.props.getAllObjectTags}
                onEditTags={this._openEditTagDialog}
                onChangeTags={this._changeObjectTags}
                selectedObjectNames={this.props.selectedObjectNames}
                onObjectSelected={this.props.onObjectSelected}
                onEditObject={this.props.onEditObject}
                onCopyObject={this._copyObject}
                onCutObject={this._cutObject}
                onDuplicateObject={this._duplicateObject}
                onSetAsGlobalObject={this._setAsGlobalObject}
                onPasteObject={this._pasteAndRename}
                onAddNewObject={this.onAddNewObject}
                onEditName={this._editName}
                onEditVariables={this._editVariables}
                onDelete={this._deleteObject}
                onRename={this._rename}
                onSortStart={this._onStartDraggingObject}
                onSortEnd={({ oldIndex, newIndex }) => {
                  this.props.onEndDraggingObject();
                  this._move(oldIndex, newIndex);
                }}
                helperClass="sortable-helper"
                distance={20}
              />
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
        />
        {this.state.newObjectDialogOpen && (
          <NewObjectDialog
            open={this.state.newObjectDialogOpen}
            onClose={() =>
              this.setState({
                newObjectDialogOpen: false,
              })
            }
            onChoose={this.addObject}
            project={project}
          />
        )}
        {this.state.variablesEditedObject && (
          <VariablesEditorDialog
            open
            variablesContainer={
              this.state.variablesEditedObject &&
              this.state.variablesEditedObject.getVariables()
            }
            onCancel={() => this._editVariables(null)}
            onApply={() => this._editVariables(null)}
            title="Object Variables"
            emptyExplanationMessage="When you add variables to an object, any instance of the object put on the scene or created during the game will have these variables attached to it."
            emptyExplanationSecondMessage="For example, you can have a variable called Life representing the health of the object."
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
