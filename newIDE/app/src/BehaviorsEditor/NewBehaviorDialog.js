import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';

const styles = {
  icon: { borderRadius: 0 },
};

export default class NewBehaviorDialog extends Component {
  constructor(props) {
    super(props);
    this.state = { ...this._loadFrom(props.project) };
  }

  _loadFrom(project) {
    if (!project || !project.getCurrentPlatform()) {
      return { behaviorMetadata: [] };
    }

    const platform = project.getCurrentPlatform();
    const extensionsList = platform.getAllPlatformExtensions();

    return {
      behaviorMetadata: flatten(
        mapFor(0, extensionsList.size(), i => {
          const extension = extensionsList.at(i);

          return extension
            .getBehaviorsTypes()
            .toJSArray()
            .map(behaviorType => ({
              behaviorType,
              behaviorMetadata: extension.getBehaviorMetadata(behaviorType),
            }))
            .map(({ behaviorType, behaviorMetadata }) => ({
              extension,
              behaviorMetadata,
              type: behaviorType,
              defaultName: behaviorMetadata.getDefaultName(),
              fullName: behaviorMetadata.getFullName(),
              description: behaviorMetadata.getDescription(),
              iconFilename: behaviorMetadata.getIconFilename(),
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
      <FlatButton
        key="close"
        label="Close"
        primary={false}
        onClick={onClose}
      />,
    ];

    return (
      <Dialog
        title="Add a new behavior to the object"
        actions={actions}
        secondaryActions={<HelpButton helpPagePath="/behaviors" />}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        <List>
          {this.state.behaviorMetadata.map(behaviorMetadata => {
            return (
              <ListItem
                leftAvatar={
                  <Avatar
                    src={behaviorMetadata.iconFilename}
                    style={styles.icon}
                  />
                }
                key={behaviorMetadata.type}
                primaryText={behaviorMetadata.fullName}
                secondaryText={<p>{behaviorMetadata.description}</p>}
                secondaryTextLines={2}
                onClick={() =>
                  this.props.onChoose(
                    behaviorMetadata.type,
                    behaviorMetadata.defaultName
                  )}
              />
            );
          })}
        </List>
      </Dialog>
    );
  }
}
