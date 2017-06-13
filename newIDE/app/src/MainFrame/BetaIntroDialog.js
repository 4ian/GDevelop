import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

export default class BetaIntroDialog extends Component {
  _onOpenGithub() {
    shell.openExternal('https://github.com/4ian/GD');
  }

  _onOpenTrello() {
    shell.openExternal('https://trello.com/b/qf0lM7k8/gdevelop-roadmap');
  }

  render() {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        label="Follow the Roadmap on Trello"
        primary={false}
        onTouchTap={this._onOpenTrello}
      />,
      <FlatButton
        label="Contribute on GitHub"
        primary={false}
        onTouchTap={this._onOpenGithub}
      />,
      <FlatButton label="Ok" primary={true} onTouchTap={onClose} />,
    ];

    return (
      <Dialog actions={actions} modal={true} open={open}>
        <div>
          <p>
            This is a
            {' '}
            <b>beta version</b>
            {' '}
            of GDevelop 5. It is unfinished and you can only edit scenes of existing games or examples.
          </p>
          <p>
            You can still export your game to upload it online in a few clicks!
          </p>
        </div>
      </Dialog>
    );
  }
}
