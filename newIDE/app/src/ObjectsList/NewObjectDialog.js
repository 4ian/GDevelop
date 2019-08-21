// @flow
import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from '../UI/FlatButton';
import Avatar from 'material-ui/Avatar';
import Subheader from 'material-ui/Subheader';
import { List, ListItem } from 'material-ui/List';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import {
  enumerateObjectTypes,
  type EnumeratedObjectMetadata,
} from './EnumerateObjects';
import HelpButton from '../UI/HelpButton';
import { getExperimentalObjects } from '../Hints';
import { Line } from '../UI/Grid';

const styles = {
  icon: { borderRadius: 0 },
};

const ObjectListItem = ({
  objectMetadata,
  onClick,
}: {|
  objectMetadata: EnumeratedObjectMetadata,
  onClick: () => void,
|}) => {
  if (objectMetadata.name === '') {
    // Base object is an "abstract" object
    return null;
  }

  return (
    <ListItem
      leftAvatar={
        <Avatar src={objectMetadata.iconFilename} style={styles.icon} />
      }
      key={objectMetadata.name}
      primaryText={objectMetadata.fullName}
      secondaryText={<p>{objectMetadata.description}</p>}
      secondaryTextLines={2}
      onClick={onClick}
    />
  );
};

type Props = {|
  project: gdProject,
  open: boolean,
  onClose: () => void,
  onChoose: string => void,
|};

type State = {|
  objectMetadata: Array<EnumeratedObjectMetadata>,
  showExperimental: boolean,
|};

export default class NewObjectDialog extends Component<Props, State> {
  state = { ...this._loadFrom(this.props.project), showExperimental: false };

  _loadFrom(project: gdProject) {
    if (!project || !project.getCurrentPlatform()) {
      return { objectMetadata: [] };
    }

    return {
      objectMetadata: enumerateObjectTypes(project),
    };
  }

  componentWillReceiveProps(newProps: Props) {
    if (
      (!this.props.open && newProps.open) ||
      (newProps.open && this.props.project !== newProps.project)
    ) {
      this.setState(this._loadFrom(newProps.project));
    }
  }

  _showExperimental = (showExperimental: boolean = true) => {
    this.setState({
      showExperimental,
    });
  };

  render() {
    const { project, open, onClose, onChoose } = this.props;
    const { objectMetadata, showExperimental } = this.state;
    if (!open || !project) return null;

    const experimentalObjectsInformation = getExperimentalObjects();

    const objects = objectMetadata.filter(
      ({ name }) => !experimentalObjectsInformation[name]
    );
    const experimentalObjects = objectMetadata.filter(
      ({ name }) => !!experimentalObjectsInformation[name]
    );

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
          {objects.map(objectMetadata => (
            <ObjectListItem
              key={objectMetadata.name}
              objectMetadata={objectMetadata}
              onClick={() => onChoose(objectMetadata.name)}
            />
          ))}
          {showExperimental && (
            <Subheader>
              Experimental (make sure to read the documentation page)
            </Subheader>
          )}
          {showExperimental &&
            experimentalObjects.map(objectMetadata => (
              <ObjectListItem
                key={objectMetadata.name}
                objectMetadata={objectMetadata}
                onClick={() => onChoose(objectMetadata.name)}
              />
            ))}
        </List>
        <Line justifyContent="center" alignItems="center">
          {!showExperimental ? (
            <FlatButton
              key="toggle-experimental"
              icon={<Visibility />}
              primary={false}
              onClick={() => this._showExperimental(true)}
              label={<Trans>Show experimental objects</Trans>}
            />
          ) : (
            <FlatButton
              key="toggle-experimental"
              icon={<VisibilityOff />}
              primary={false}
              onClick={() => this._showExperimental(false)}
              label={<Trans>Hide experimental objects</Trans>}
            />
          )}
        </Line>
      </Dialog>
    );
  }
}
