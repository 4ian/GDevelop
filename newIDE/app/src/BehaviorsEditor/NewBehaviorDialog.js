// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from 'material-ui/FlatButton';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import { Line } from '../UI/Grid';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import {
  type EnumeratedBehaviorMetadata,
  enumerateBehaviorsMetadata,
} from './EnumerateBehaviorsMetadata';

const styles = {
  icon: { borderRadius: 0 },
  disabledItem: { opacity: 0.6 },
};

const BehaviorListItem = ({
  behaviorMetadata,
  onClick,
  disabled,
}: {|
  behaviorMetadata: EnumeratedBehaviorMetadata,
  onClick: () => void,
  disabled: boolean,
|}) => (
  <ListItem
    leftAvatar={
      <Avatar src={behaviorMetadata.iconFilename} style={styles.icon} />
    }
    key={behaviorMetadata.type}
    primaryText={behaviorMetadata.fullName}
    secondaryText={<p>{behaviorMetadata.description}</p>}
    secondaryTextLines={2}
    onClick={onClick}
    style={disabled ? styles.disabledItem : undefined}
    disabled={disabled}
  />
);

type Props = {|
  project: gdProject,
  objectType: string,
  open: boolean,
  onClose: () => void,
  onChoose: (type: string, defaultName: string) => void,
|};
type State = {|
  behaviorMetadata: Array<EnumeratedBehaviorMetadata>,
  showDeprecated: boolean,
|};

export default class NewBehaviorDialog extends Component<Props, State> {
  state = { ...this._loadFrom(this.props.project), showDeprecated: false };

  _loadFrom(
    project: gdProject
  ): {| behaviorMetadata: Array<EnumeratedBehaviorMetadata> |} {
    const platform = project.getCurrentPlatform();
    return {
      behaviorMetadata:
        project && platform
          ? enumerateBehaviorsMetadata(platform, project)
          : [],
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

  _showDeprecated = (showDeprecated: boolean = true) => {
    this.setState({
      showDeprecated,
    });
  };

  render() {
    const { project, open, onClose, objectType } = this.props;
    const { showDeprecated, behaviorMetadata } = this.state;
    if (!open || !project) return null;

    const actions = [
      <FlatButton
        key="close"
        label={<Trans>Close</Trans>}
        primary={false}
        onClick={onClose}
      />,
    ];

    const deprecatedBehaviorsInformation = getDeprecatedBehaviorsInformation();

    const behaviors = behaviorMetadata.filter(
      ({ type }) => !deprecatedBehaviorsInformation[type]
    );
    const deprecatedBehaviors = behaviorMetadata.filter(
      ({ type }) => !!deprecatedBehaviorsInformation[type]
    );

    const chooseBehavior = (
      i18n: I18nType,
      { type, defaultName }: EnumeratedBehaviorMetadata
    ) => {
      if (deprecatedBehaviorsInformation[type]) {
        showMessageBox(i18n._(deprecatedBehaviorsInformation[type].warning));
      }

      return this.props.onChoose(type, defaultName);
    };

    const canBehaviorBeUsed = (
      behaviorMetadata: EnumeratedBehaviorMetadata
    ) => {
      // An empty object type means the base object, i.e: any object.
      return (
        behaviorMetadata.objectType === '' ||
        behaviorMetadata.objectType === objectType
      );
    };

    return (
      <I18n>
        {({ i18n }) => (
          <Dialog
            title={<Trans>Add a new behavior to the object</Trans>}
            actions={actions}
            secondaryActions={<HelpButton helpPagePath="/behaviors" />}
            open={open}
            noMargin
            autoScrollBodyContent
          >
            <List>
              {behaviors.map((behaviorMetadata, index) => (
                <BehaviorListItem
                  key={index}
                  behaviorMetadata={behaviorMetadata}
                  onClick={() => chooseBehavior(i18n, behaviorMetadata)}
                  disabled={!canBehaviorBeUsed(behaviorMetadata)}
                />
              ))}
              {showDeprecated && (
                <Subheader>
                  Deprecated (old, prefer not to use anymore)
                </Subheader>
              )}
              {showDeprecated &&
                deprecatedBehaviors.map((behaviorMetadata, index) => (
                  <BehaviorListItem
                    key={index}
                    behaviorMetadata={behaviorMetadata}
                    onClick={() => chooseBehavior(i18n, behaviorMetadata)}
                    disabled={!canBehaviorBeUsed(behaviorMetadata)}
                  />
                ))}
            </List>
            <Line justifyContent="center" alignItems="center">
              {!showDeprecated ? (
                <FlatButton
                  key="toggle-experimental"
                  icon={<Visibility />}
                  primary={false}
                  onClick={() => this._showDeprecated(true)}
                  label={<Trans>Show deprecated (old) behaviors</Trans>}
                />
              ) : (
                <FlatButton
                  key="toggle-experimental"
                  icon={<VisibilityOff />}
                  primary={false}
                  onClick={() => this._showDeprecated(false)}
                  label={<Trans>Show deprecated (old) behaviors</Trans>}
                />
              )}
            </Line>
          </Dialog>
        )}
      </I18n>
    );
  }
}
