import React from 'react';
import { ListItem } from 'material-ui/List';
import { AutoSizer, List } from 'react-virtualized';
import Avatar from 'material-ui/Avatar';
import ObjectsRenderingService
  from '../ObjectsRendering/ObjectsRenderingService';
import mapFor from '../Utils/MapFor';

const listItemHeight = 56;

export default class ObjectsList extends React.Component {
  _renderObjectRow(project, object, key, style) {
    if (this.props.freezeUpdate) return;
    const objectName = object.getName();

    return (
      <ListItem
        style={style}
        key={object.ptr}
        primaryText={objectName}
        leftAvatar={
          <Avatar
            src={ObjectsRenderingService.getThumbnail(project, object)}
            style={{ borderRadius: 0 }}
          />
        }
        onTouchTap={() => this.props.onObjectSelected(objectName)}
      />
    );
  }

  render() {
    const { project, objectsContainer } = this.props;

    const containerObjectsList = mapFor(
      0,
      objectsContainer.getObjectsCount(),
      i => objectsContainer.getObjectAt(i)
    );

    const projectObjectsList = project === objectsContainer
      ? null
      : mapFor(0, project.getObjectsCount(), i => project.getObjectAt(i));

    const fullList = projectObjectsList
      ? containerObjectsList.concat(projectObjectsList)
      : containerObjectsList;

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects.
    const listKey = project.ptr + ';' + objectsContainer.ptr;

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            key={listKey}
            height={height}
            rowCount={fullList.length}
            rowHeight={listItemHeight}
            rowRenderer={({ index, key, style }) =>
              this._renderObjectRow(project, fullList[index], key, style)}
            width={width}
          />
        )}
      </AutoSizer>
    );
  }
}
