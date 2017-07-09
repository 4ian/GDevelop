import React from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { mapFor } from '../Utils/MapFor';
import ObjectRow from './ObjectRow';
import AddObjectRow from './AddObjectRow';
import NewObjectDialog from './NewObjectDialog';
import newNameGenerator from '../Utils/NewNameGenerator';

const listItemHeight = 56;

export default class ObjectsList extends React.Component {
  static defaultProps = {
    onDeleteObject: (objectWithScope, cb) => cb(true),
    onRenameObject: (objectWithScope, newName, cb) => cb(true),
  };

  constructor(props) {
    super(props);

    this.state = {
      newObjectDialogOpen: false,
      renamedObjectWithScope: false,
    };
  }

  addObject = objectType => {
    const { project, objectsContainer } = this.props;

    const name = newNameGenerator(
      'MyObject',
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
      () => this.list.forceUpdateGrid()
    );
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
      alert('Another object with this name already exists');
      return;
    }

    this.props.onRenameObject(objectWithScope, newName, doRename => {
      if (!doRename) return;

      object.setName(newName);
      this.forceUpdate();
    });
  };

  render() {
    const { project, objectsContainer, freezeUpdate } = this.props;

    const containerObjectsList = mapFor(
      0,
      objectsContainer.getObjectsCount(),
      i => objectsContainer.getObjectAt(i)
    ).map(object => ({ object, global: false }));

    const projectObjectsList = project === objectsContainer
      ? []
      : mapFor(0, project.getObjectsCount(), i =>
          project.getObjectAt(i)).map(object => ({ object, global: true }));

    const allObjectsList = projectObjectsList
      ? containerObjectsList.concat(projectObjectsList)
      : containerObjectsList;
    const fullList = allObjectsList.concat({
      key: 'add-objects-row',
      object: null,
    });

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    return (
      <div style={{ flex: 1, display: 'flex', height: '100%' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              style={{ backgroundColor: 'white' }}
              ref={list => this.list = list}
              key={listKey}
              height={height}
              rowCount={fullList.length}
              rowHeight={listItemHeight}
              rowRenderer={({ index, key, style }) => {
                const objectWithScope = fullList[index];
                if (objectWithScope.key === 'add-objects-row') {
                  return (
                    <AddObjectRow
                      key={key}
                      style={style}
                      onAdd={() => this.setState({ newObjectDialogOpen: true })}
                    />
                  );
                }

                const nameBeingEdited = this.state.renamedObjectWithScope &&
                  this.state.renamedObjectWithScope.object ===
                    objectWithScope.object &&
                  this.state.renamedObjectWithScope.global ===
                    objectWithScope.global;

                return (
                  <ObjectRow
                    key={objectWithScope.object.ptr}
                    project={project}
                    object={objectWithScope.object}
                    style={style}
                    freezeUpdate={freezeUpdate}
                    onEdit={
                      this.props.onEditObject
                        ? () => this.props.onEditObject(objectWithScope.object)
                        : undefined
                    }
                    onEditName={() => this._onEditName(objectWithScope)}
                    onDelete={() => this._onDelete(objectWithScope)}
                    onRename={newName =>
                      this._onRename(objectWithScope, newName)}
                    editingName={nameBeingEdited}
                    getThumbnail={this.props.getThumbnail}
                    onObjectSelected={this.props.onObjectSelected}
                  />
                );
              }}
              width={width}
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
      </div>
    );
  }
}
