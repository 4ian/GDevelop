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

export default class AboutDialog extends Component {
  constructor() {
    super();
    this.gdVersionString = gd ? gd.VersionWrapper.fullString() : 'Unknown';
    this.appVersionString = app ? app.getVersion() : '5';
  }

  render() {
    const { open, onClose } = this.props;
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
          </div>
        </Column>
      </Dialog>
    );
  }
}
