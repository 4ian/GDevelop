import React, { Component } from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import ObjectRow from './ObjectRow';
import NewObjectDialog from './NewObjectDialog';
import VariablesEditorDialog from '../VariablesList/VariablesEditorDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { makeAddItem } from '../UI/ListAddItem';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { enumerateObjects } from './EnumerateObjects';

const listItemHeight = 48;
const styles = {
  container: { flex: 1, display: 'flex', height: '100%' },
};

const AddObjectRow = makeAddItem(ListItem);

const SortableObjectRow = SortableElement(props => {
  const { style, ...otherProps } = props;
  return <div style={style}><ObjectRow {...otherProps} /></div>;
});

const SortableAddObjectRow = SortableElement(props => {
  return <AddObjectRow {...props} />;
});

class ObjectsList extends Component {
  forceUpdateGrid() {
    if (this.list) this.list.forceUpdateGrid();
  }

  render() {
    let { height, width, fullList, project, selectedObjectName } = this.props;

    return (
      <List
        ref={list => this.list = list}
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
                onClick={this.props.onAddObject}
                primaryText="Click to add an object"
              />
            );
          }

          const nameBeingEdited = this.props.renamedObjectWithScope &&
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
              editingName={nameBeingEdited}
              getThumbnail={this.props.getThumbnail}
              selected={objectWithScope.object.getName() === selectedObjectName}
              onObjectSelected={this.props.onObjectSelected}
            />
          );
        }}
        width={width}
      />
    );
  }
}

const SortableObjectsList = SortableContainer(ObjectsList, { withRef: true });

export default class ObjectsListContainer extends React.Component {
  static defaultProps = {
    onDeleteObject: (objectWithScope, cb) => cb(true),
    onRenameObject: (objectWithScope, newName, cb) => cb(true),
  };

  constructor(props) {
    super(props);

    this.containerObjectsList = [];
    this.projectObjectsList = [];
    this.state = {
      newObjectDialogOpen: false,
      renamedObjectWithScope: false,
      variablesEditedObject: null,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // The component is costly to render, so avoid any re-rendering as much
    // as possible.
    // We make the assumption that no changes to objects list is made outside
    // from the component.
    // If a change is made, the component won't notice it: you have to manually
    // call forceUpdate.

    if (
      this.state.newObjectDialogOpen !== nextState.newObjectDialogOpen ||
      this.state.renamedObjectWithScope !== nextState.renamedObjectWithScope ||
      this.state.variablesEditedObject !== nextState.variablesEditedObject
    )
      return true;

    if (this.props.selectedObjectName !== nextProps.selectedObjectName)
      return true;

    if (
      this.props.project !== nextProps.project ||
      this.props.objectsContainer !== nextProps.objectsContainer
    )
      return true;

    return false;
  }

  addObject = objectType => {
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

  _onDelete = objectWithScope => {
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

  _onEditName = objectWithScope => {
    this.setState(
      {
        renamedObjectWithScope: objectWithScope,
      },
      () => this.sortableList.getWrappedInstance().forceUpdateGrid()
    );
  };

  _onEditVariables = object => {
    this.setState({
      variablesEditedObject: object,
    });
  };

  _onRename = (objectWithScope, newName) => {
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

  _onMove = (oldIndex, newIndex) => {
    const { project, objectsContainer } = this.props;

    const isInContainerObjectsList = oldIndex <
      this.containerObjectsList.length;
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

    this.forceUpdate();
    this.sortableList.getWrappedInstance().forceUpdateGrid();
  };

  render() {
    const { project, objectsContainer } = this.props;

    const lists = enumerateObjects(project, objectsContainer);
    this.containerObjectsList = lists.containerObjectsList;
    this.projectObjectsList = lists.projectObjectsList;
    const allObjectsList = lists.allObjectsList;
    const fullList = allObjectsList.concat({
      key: 'add-objects-row',
      object: null,
    });

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;
    console.log('Render');

    return (
      <Paper style={styles.container}>
        <AutoSizer>
          {({ height, width }) => (
            <SortableObjectsList
              key={listKey}
              ref={sortableList => this.sortableList = sortableList}
              fullList={fullList}
              project={project}
              width={width}
              height={height}
              renamedObjectWithScope={this.state.renamedObjectWithScope}
              getThumbnail={this.props.getThumbnail}
              selectedObjectName={this.props.selectedObjectName}
              onObjectSelected={this.props.onObjectSelected}
              onEditObject={this.props.onEditObject}
              onAddObject={() => this.setState({ newObjectDialogOpen: true })}
              onEditName={this._onEditName}
              onEditVariables={this._onEditVariables}
              onDelete={this._onDelete}
              onRename={this._onRename}
              onSortEnd={({ oldIndex, newIndex }) =>
                this._onMove(oldIndex, newIndex)}
              helperClass="sortable-helper"
              distance={30}
            />
          )}
        </AutoSizer>
        {this.state.newObjectDialogOpen &&
          <NewObjectDialog
            open={this.state.newObjectDialogOpen}
            onClose={() => this.setState({ newObjectDialogOpen: false })}
            onChoose={this.addObject}
            project={project}
          />}
        {this.state.variablesEditedObject &&
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
          />}
      </Paper>
    );
  }
}
