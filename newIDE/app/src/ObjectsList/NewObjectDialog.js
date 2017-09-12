import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';

const styles = {
  icon: { borderRadius: 0 },
  content: {
    padding: 0,
  },
};

export default class NewObjectDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this._loadFrom(props.project) };
  }

  _loadFrom(project) {
    if (!project || !project.getCurrentPlatform()) {
      return { objectMetadata: [] };
    }

    const platform = project.getCurrentPlatform();
    const extensionsList = platform.getAllPlatformExtensions();

    return {
      objectMetadata: flatten(
        mapFor(0, extensionsList.size(), i => {
          const extension = extensionsList.at(i);

          return extension
            .getExtensionObjectsTypes()
            .toJSArray()
            .map(objectType => extension.getObjectMetadata(objectType))
            .map(objectMetadata => ({
              extension,
              objectMetadata,
              name: objectMetadata.getName(),
              fullName: objectMetadata.getFullName(),
              description: objectMetadata.getDescription(),
              iconFilename: objectMetadata.getIconFilename(),
            }));
        })
      ),
    };
  }

  componentWillReceiveProps(newProps) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.layout));
    }
  }

  render() {
    const { project, open, onClose } = this.props;
    if (!open || !project) return null;

    const actions = [
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    return (
      <Dialog
        title="Add a new object"
        actions={actions}
        modal
        open={open}
        bodyStyle={styles.content}
        autoScrollBodyContent
      >
        <List>
          {this.state.objectMetadata.map(objectMetadata => {
            if (objectMetadata.name === '') { // Base object is an "abstract" object
              return null;
            }

            return (
              <ListItem
                leftAvatar={
                  <Avatar
                    src={objectMetadata.iconFilename}
                    style={styles.icon}
                  />
                }
                key={objectMetadata.name}
                primaryText={objectMetadata.fullName}
                secondaryText={
                  <p>
                    {objectMetadata.description}
                  </p>
                }
                secondaryTextLines={2}
                onClick={() => this.props.onChoose(objectMetadata.name)}
              />
            );
          })}
        </List>
      </Dialog>
    );
  }
}
