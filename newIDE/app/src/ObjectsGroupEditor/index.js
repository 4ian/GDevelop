import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Remove from 'material-ui/svg-icons/content/remove';

export default class ObjectsGroupEditor extends Component {
  removeObject(objectName) {
    const { group } = this.props;

    group.removeObject(objectName);
    this.forceUpdate();
  }

  render() {
    const { group } = this.props;

    return (
      <List>
        {group.getAllObjectsNames().toJSArray().map(objectName => {
          return (
            <ListItem
              key={objectName}
              primaryText={objectName}
              rightIconButton={
                <IconButton onClick={() => this.removeObject(objectName)}>
                  <Remove />
                </IconButton>
              }
            />
          );
        })}
      </List>
    );
  }
}
