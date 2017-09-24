import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Remove from 'material-ui/svg-icons/content/remove';
import ObjectSelector from '../ObjectsList/ObjectSelector';

const styles = {
  newObjectSelector: {
    marginLeft: 10,
    marginRight: 10,
  },
};

export default class ObjectsGroupEditor extends Component {
  state = {
    newObjectName: '',
  };

  removeObject = objectName => {
    const { group } = this.props;

    group.removeObject(objectName);
    this.forceUpdate();
  };

  addObject = objectName => {
    const { group } = this.props;

    group.addObject(objectName);
    this.setState({
      newObjectName: '',
    });
  };

  render() {
    const { group, project, layout } = this.props;

    return (
      <div>
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
        <ObjectSelector
          style={styles.newObjectSelector}
          project={project}
          layout={layout}
          value={this.state.newObjectName}
          onChange={name => this.setState({ newObjectName: name })}
          onChoose={this.addObject}
          openOnFocus
          hintText="Choose an object to add to the group"
          fullWidth
        />
      </div>
    );
  }
}
