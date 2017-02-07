import React from 'react';
import {List, ListItem} from 'material-ui/List';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import mapFor from '../Utils/MapFor';

export default class ProjectManager extends React.Component {
  render() {
    const { objectsContainer } = this.props;

    return (
      <List>
        {mapFor(0, objectsContainer.getObjectsCount(), (i) => {
          const object = objectsContainer.getObjectAt(i);
          const objectName = object.getName();

          return (<ListItem
            key={i}
            primaryText={objectName}
            leftIcon={<ContentInbox />}
            onTouchTap={() => this.props.onObjectSelected(objectName)}
          />);
        })}
      </List>
    );
  }
}
