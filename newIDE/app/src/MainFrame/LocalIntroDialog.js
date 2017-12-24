import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const shell = electron ? electron.shell : null;

export default class LocalIntroDialog extends Component {
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
        onClick={this._onOpenTrello}
      />,
      <FlatButton
        label="Contribute on GitHub"
        primary={false}
        onClick={this._onOpenGithub}
      />,
      <FlatButton label="Ok" primary={true} onClick={onClose} />,
    ];

    return (
      <Dialog actions={actions} open={open}>
        <div>
          <p>
            This is a <b>beta version</b> of GDevelop 5. Some parts of the
            software are still incomplete or missing.
          </p>
          <p>Any feedback on the forum or contribution on GitHub is welcome!</p>
        </div>
      </Dialog>
    );
  }
}
