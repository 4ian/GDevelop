// @flow
import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import SearchBar from 'material-ui-search-bar';
import ObjectRow from './ObjectRow';
import NewObjectDialog from './NewObjectDialog';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListAddItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { enumerateObjects, filterObjectsList } from './EnumerateObjects';
import type {
  ObjectWithContextList,
  ObjectWithContext,
} from '../ObjectsList/EnumerateObjects';

const listItemHeight = 48;
const styles = {
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
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
    let { height, width, fullList, project, selectedObjectName } = this.props;

    console.log('RENDERList', this.props.disableSort);
    return (
      <List
        ref={list => (this.list = list)}
        height={height}
        rowCount={fullList.length}
        rowHeight={listItemHeight}
        rowRenderer={({ index, key, style }) => {
          const objectWithScope = fullList[index];
          if (objectWithScope.key === 'add-objects-row') {
            return (
              <SortableAddObjectRow
                index={fullList.length}
                key={key}
                style={style}
                disabled
                onClick={this.props.onAddNewObject}
                primaryText="Click to add an object"
              />
            );
          }

          const nameBeingEdited =
            this.props.renamedObjectWithScope &&
            this.props.renamedObjectWithScope.object ===
              objectWithScope.object &&
            this.props.renamedObjectWithScope.global === objectWithScope.global;

          return (
            <SortableObjectRow
              index={index}
              key={objectWithScope.object.ptr}
              project={project}
              object={objectWithScope.object}
              style={style}
              onEdit={
                this.props.onEditObject
                  ? () => this.props.onEditObject(objectWithScope.object)
                  : undefined
              }
              onEditVariables={() =>
                this.props.onEditVariables(objectWithScope.object)}
              onEditName={() => this.props.onEditName(objectWithScope)}
              onDelete={() => this.props.onDelete(objectWithScope)}
              onRename={newName =>
                this.props.onRename(objectWithScope, newName)}
              onAddNewObject={this.props.onAddNewObject}
              editingName={nameBeingEdited}
              getThumbnail={this.props.getThumbnail}
              selected={objectWithScope.object.getName() === selectedObjectName}
              onObjectSelected={this.props.onObjectSelected}
              disabled={this.props.disableSort}
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
  renamedObjectWithScope: ?ObjectWithContext,
  variablesEditedObject: any,
  searchText: string,
|};

export default class ObjectsListContainer extends React.Component<
  *,
  StateType
> {
  static defaultProps = {
    onDeleteObject: (objectWithScope, cb) => cb(true),
    onRenameObject: (objectWithScope, newName, cb) => cb(true),
  };

  sortableList: any;
  containerObjectsList: ObjectWithContextList = [];
  projectObjectsList: ObjectWithContextList = [];
  state: StateType = {
    newObjectDialogOpen: false,
    renamedObjectWithScope: null,
    variablesEditedObject: null,
    searchText: '',
  };

  shouldComponentUpdate(nextProps: *, nextState: StateType) {
    return true;
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to objects list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (
      this.state.newObjectDialogOpen !== nextState.newObjectDialogOpen ||
      this.state.renamedObjectWithScope !== nextState.renamedObjectWithScope ||
      this.state.variablesEditedObject !== nextState.variablesEditedObject ||
      this.state.searchText !== nextState.searchText
    )
      return true;

    if (
      this.props.selectedObjectName !== nextProps.selectedObjectName ||
      this.props.disableSort !== nextProps.disableSort
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
    const { project, objectsContainer } = this.props;

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

    this.setState(
      {
        newObjectDialogOpen: false,
      },
      () => {
        if (this.props.onEditObject) {
          this.props.onEditObject(object);
        }
      }
    );
  };

  _onDelete = (objectWithScope: ObjectWithContext) => {
    const { object, global } = objectWithScope;
    const { project, objectsContainer } = this.props;

    //eslint-disable-next-line
    const answer = confirm(
      "Are you sure you want to remove this object? This can't be undone."
    );
    if (!answer) return;

    this.props.onDeleteObject(objectWithScope, doRemove => {
      if (!doRemove) return;

      if (global) {
        project.removeObject(object.getName());
      } else {
        objectsContainer.removeObject(object.getName());
      }

      this.forceUpdate();
    });
  };

  _onEditName = (objectWithScope: ?ObjectWithContext) => {
    this.setState(
      {
        renamedObjectWithScope: objectWithScope,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _onEditVariables = (object: any) => {
    this.setState({
      variablesEditedObject: object,
    });
  };

  _onRename = (objectWithScope: ObjectWithContext, newName: string) => {
    const { object } = objectWithScope;
    const { project, objectsContainer } = this.props;

    this.setState({
      renamedObjectWithScope: null,
    });

    if (object.getName() === newName) return;

    if (
      objectsContainer.hasObjectNamed(newName) ||
      project.hasObjectNamed(newName)
    ) {
      showWarningBox('Another object with this name already exists');
      return;
    }

    this.props.onRenameObject(objectWithScope, newName, doRename => {
      if (!doRename) return;

      object.setName(newName);
      this.forceUpdate();
    });
  };

  _onMove = (oldIndex: number, newIndex: number) => {
    console.log("on move with disableSort =", this.props.disableSort);
    if (this.props.disableSort) return;

    const { project, objectsContainer } = this.props;

    const isInContainerObjectsList =
      oldIndex < this.containerObjectsList.length;
    if (isInContainerObjectsList) {
      objectsContainer.moveObject(
        oldIndex,
        Math.min(newIndex, this.containerObjectsList.length - 1)
      );
    } else {
      const projectOldIndex = oldIndex - this.containerObjectsList.length;
      const projectNewIndex = newIndex - this.containerObjectsList.length;

      project.moveObject(
        projectOldIndex,
        Math.min(projectNewIndex, this.projectObjectsList.length - 1)
      );
    }

    if (this.props.onDrag) this.props.onDrag(null);
    this.forceUpdateList();
  };

  _onSortStart = (index: number) => {
    const { project, objectsContainer } = this.props;

    let object = null;
    const isInContainerObjectsList = index < this.containerObjectsList.length;
    if (isInContainerObjectsList) {
      object = objectsContainer.getObjectAt(index);
    } else {
      object = project.getObjectAt(index);
    }

    if (!object) return;

    if (this.props.onDrag) this.props.onDrag(object.getName());
  };

  forceUpdateList = () => {
    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  render() {
    const { project, objectsContainer } = this.props;
    const { searchText } = this.state;

    const lists = enumerateObjects(project, objectsContainer);
    this.containerObjectsList = filterObjectsList(
      lists.containerObjectsList,
      searchText
    );
    this.projectObjectsList = filterObjectsList(
      lists.projectObjectsList,
      searchText
    );
    const allObjectsList = filterObjectsList(lists.allObjectsList, searchText);
    const fullList = allObjectsList.concat({
      key: 'add-objects-row',
      object: null,
    });

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    console.log('RENDERList', this.props.disableSort);
    return (
      <Paper style={styles.container}>
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
                renamedObjectWithScope={this.state.renamedObjectWithScope}
                getThumbnail={this.props.getThumbnail}
                selectedObjectName={this.props.selectedObjectName}
                onObjectSelected={this.props.onObjectSelected}
                onEditObject={this.props.onEditObject}
                onAddNewObject={() =>
                  this.setState({ newObjectDialogOpen: true })}
                onEditName={this._onEditName}
                onEditVariables={this._onEditVariables}
                onDelete={this._onDelete}
                onRename={this._onRename}
                onSortStart={({ index }) => this._onSortStart(index)}
                onSortEnd={({ oldIndex, newIndex }) =>
                  this._onMove(oldIndex, newIndex)}
                disableSort={this.props.disableSort}
                helperClass="sortable-helper"
                distance={30}
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
            })}
        />
        {this.state.newObjectDialogOpen && (
          <NewObjectDialog
            open={this.state.newObjectDialogOpen}
            onClose={() => this.setState({ newObjectDialogOpen: false })}
            onChoose={this.addObject}
            project={project}
          />
        )}
        {this.state.variablesEditedObject && (
          <VariablesEditorDialog
            open={!!this.state.variablesEditedObject}
            variablesContainer={
              this.state.variablesEditedObject &&
              this.state.variablesEditedObject.getVariables()
            }
            onCancel={() => this._onEditVariables(null)}
            onApply={() => this._onEditVariables(null)}
            emptyExplanationMessage="When you add variables to an object, any instance of the object put on the scene or created during the game will have these variables attached to it."
            emptyExplanationSecondMessage="For example, you can have a variable called Life representing the health of the object."
          />
        )}
      </Paper>
    );
  }
}
