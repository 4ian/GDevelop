import React from 'react';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import ObjectsRenderingService from '../ObjectsRendering/ObjectsRenderingService';
import mapFor from '../Utils/MapFor';

export default class ProjectManager extends React.Component {
  _renderObjectListItem(project, object) {
    const objectName = object.getName();

    return (<ListItem
      key={object.ptr}
      primaryText={objectName}
      leftAvatar={<Avatar
        src={ObjectsRenderingService.getThumbnail(project, object)}
        style={{borderRadius: 0}}
      />}
      onTouchTap={() => this.props.onObjectSelected(objectName)}
    />)
  }

  render() {
    const { project, objectsContainer } = this.props;

    const containerObjectsList = mapFor(0, objectsContainer.getObjectsCount(), (i) => {
      const object = objectsContainer.getObjectAt(i);
      return this._renderObjectListItem(project, object);
    });

    const projectObjectsList = project === objectsContainer ? null : mapFor(0, project.getObjectsCount(), (i) => {
      const object = project.getObjectAt(i);
      return this._renderObjectListItem(project, object);
    });

    return (
      <List>
        {containerObjectsList}
        {projectObjectsList}
      </List>
    );
  }
}
