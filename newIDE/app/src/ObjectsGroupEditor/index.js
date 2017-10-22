import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Remove from 'material-ui/svg-icons/content/remove';
import ObjectSelector from '../ObjectsList/ObjectSelector';
import EmptyMessage from '../UI/EmptyMessage';
const gd = global.gd;

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

  _renderExplanation() {
    const { group, project, layout } = this.props;

    let type = undefined;
    group
      .getAllObjectsNames()
      .toJSArray()
      .forEach(objectName => {
        const objectType = gd.getTypeOfObject(
          project,
          layout,
          objectName,
          false
        );
        if (type === undefined || objectType === type) type = objectType;
        else type = '';
      });

    let message = '';
    if (type === undefined) {
      message = 'This group is empty';
    } else if (type === '') {
      message =
        "This group contains objects of different kinds. You'll only be able to use actions and conditions common to all objects with this group.";
    } else {
      message = `This group contains objects of the same kind (${type}). You can use actions and conditions related to this kind of objects in events with this group.`;
    }

    return <EmptyMessage>{message}</EmptyMessage>;
  }

  render() {
    const { group, project, layout } = this.props;

    return (
      <div>
        {this._renderExplanation()}
        <List>
          {group
            .getAllObjectsNames()
            .toJSArray()
            .map(objectName => {
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
          noGroups
          hintText="Choose an object to add to the group"
          fullWidth
        />
      </div>
    );
  }
}
