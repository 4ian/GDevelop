import React from 'react';
import { ListItem } from 'material-ui/List';
import { AutoSizer, List } from 'react-virtualized';
import Avatar from 'material-ui/Avatar';
import ObjectsRenderingService
  from '../ObjectsRendering/ObjectsRenderingService';
import mapFor from '../Utils/MapFor';

const listItemHeight = 56;

export default class ObjectsList extends React.Component {
  shouldComponentUpdate() {
    // Rendering the component can be costly as it ask for the thumbnails of
    // every objects, so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !this.props.freezeUpdate;
  }

  _renderObjectRow(project, object, key, style) {
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

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
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
