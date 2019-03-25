import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { enumerateObjectTypes } from './EnumerateObjects';
import HelpButton from '../UI/HelpButton';

const styles = {
  icon: { borderRadius: 0 },
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

    return {
      objectMetadata: enumerateObjectTypes(project),
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

    return (
      <Dialog
        title={<Trans>Add a new object</Trans>}
        secondaryActions={<HelpButton helpPagePath="/objects" />}
        actions={
          <FlatButton
            label={<Trans>Close</Trans>}
            primary={false}
            onClick={onClose}
          />
        }
        onRequestClose={onClose}
        open={open}
        noMargin
        autoScrollBodyContent
      >
        <List>
          {this.state.objectMetadata.map(objectMetadata => {
            if (objectMetadata.name === '') {
              // Base object is an "abstract" object
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
                secondaryText={<p>{objectMetadata.description}</p>}
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
