import React from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { mapFor } from '../Utils/MapFor';
import ObjectRow from './ObjectRow';
import AddObjectRow from './AddObjectRow';
import NewObjectDialog from './NewObjectDialog';
import newNameGenerator from '../Utils/NewNameGenerator';

const listItemHeight = 56;

export default class ObjectsList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newObjectDialogOpen: false,
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

    this.setState({
      newObjectDialogOpen: false,
    }, () => {
      if (this.props.onEditObject) {
        this.props.onEditObject(object);
      }
    });
  };

  render() {
    const { project, objectsContainer, freezeUpdate } = this.props;

    const containerObjectsList = mapFor(
      0,
      objectsContainer.getObjectsCount(),
      i => objectsContainer.getObjectAt(i)
    );

    const projectObjectsList = project === objectsContainer
      ? null
      : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i));

    const allObjectsList = projectObjectsList
      ? containerObjectsList.concat(projectObjectsList)
      : containerObjectsList;
    const fullList = allObjectsList.concat('add-objects-row');

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
              key={listKey}
              height={height}
              rowCount={fullList.length}
              rowHeight={listItemHeight}
              rowRenderer={({ index, key, style }) =>
                fullList[index] === 'add-objects-row'
                  ? <AddObjectRow
                      key={key}
                      style={style}
                      onAdd={() => this.setState({ newObjectDialogOpen: true })}
                    />
                  : <ObjectRow
                      key={fullList[index].ptr}
                      project={project}
                      object={fullList[index]}
                      style={style}
                      freezeUpdate={freezeUpdate}
                      onEditObject={this.props.onEditObject}
                      getThumbnail={this.props.getThumbnail}
                      onObjectSelected={this.props.onObjectSelected}
                    />}
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
