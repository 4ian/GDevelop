// @flow
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';
import Window from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const app = electron ? electron.remote.app : null;
const gd = global.gd;

const styles = {
  content: { padding: 24 },
};

export type UpdateStatus = {
  message: string,
  status:
    | 'checking-for-update'
    | 'update-available'
    | 'update-not-available'
    | 'error'
    | 'download-progress'
    | 'update-downloaded'
    | 'unknown',
};

type Props = {
  open: boolean,
  onClose: Function,
  updateStatus: UpdateStatus,
};

const getUpdateString = (status: string) => {
  if (status === 'checking-for-update') return 'Checking for update...';
  if (status === 'update-available') return 'Update available';
  if (status === 'update-not-available')
    return "No update available. You're using the latest version!";
  if (status === 'error') return 'Error while checking update';
  if (status === 'download-progress')
    return 'A new update is being downloaded...';
  if (status === 'update-downloaded')
    return 'A new update will be installed after you quit and relaunch GDevelop';
  return '';
};

export default class AboutDialog extends Component<Props, *> {
  gdVersionString = '';
  appVersionString = '';

  constructor() {
    super();
    this.gdVersionString = gd ? gd.VersionWrapper.fullString() : 'Unknown';
    this.appVersionString = app ? app.getVersion() : '5';
  }

  render() {
    const { open, onClose, updateStatus } = this.props;
    const actions = [
      <FlatButton
        label="GDevelop Website"
        primary={false}
        onClick={() => Window.openExternalURL('http://compilgames.net')}
      />,
      <FlatButton label="Close" primary={false} onClick={onClose} />,
    ];

    return (
      <Dialog
        actions={actions}
        onRequestClose={onClose}
        open={open}
        contentStyle={{
          maxWidth: 535,
        }}
        noMargin
      >
        <Column noMargin>
          <img
            src="res/GD-logo.png"
            alt="GDevelop logo"
            width="535"
            height="283"
          />
          <div style={styles.content}>
            <Line>
              GDevelop {this.appVersionString} based on GDevelop.js{' '}
              {this.gdVersionString}
            </Line>
            <Line>{getUpdateString(updateStatus.status)}</Line>
          </div>
        </Column>
      </Dialog>
    );
  }
}
