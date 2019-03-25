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
import { mapFor } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
import { Line } from '../UI/Grid';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';

const styles = {
  icon: { borderRadius: 0 },
};

type EnumeratedBehaviorMetadata = {|
  extension: gdPlatformExtension,
  behaviorMetadata: gdBehaviorMetadata,
  type: string,
  defaultName: string,
  fullName: string,
  description: string,
  iconFilename: string,
|};

const BehaviorListItem = ({
  behaviorMetadata,
  onClick,
}: {|
  behaviorMetadata: EnumeratedBehaviorMetadata,
  onClick: () => void,
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
  />
);

type Props = {|
  project: gdProject,
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
    const { project, open, onClose } = this.props;
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
