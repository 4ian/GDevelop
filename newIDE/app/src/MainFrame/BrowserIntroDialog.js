import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import Window from '../Utils/Window';
import FlatButton from 'material-ui/FlatButton';

export default class BetaIntroDialog extends Component {
  _onOpenWebsite() {
    Window.openExternalURL('http://gdevelop-app.com');
  }

  render() {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        label={<Trans>Download full GDevelop desktop version</Trans>}
        primary={false}
        onClick={this._onOpenWebsite}
      />,
      <FlatButton label={<Trans>Ok</Trans>} primary={true} onClick={onClose} />,
    ];

    return (
      <Dialog actions={actions} open={open} onRequestClose={onClose}>
        <div>
          <p>
            <Trans>
              This is a version of GDevelop 5 that you can try online.
            </Trans>
          </p>
          <p>
            Choose a <b>new project to create</b> and then <b>open the scene</b>{' '}
            to make changes to the game. You can{' '}
            <b>launch a preview of your game</b> at any time!
          </p>
          <p>
            <Trans>
              Download the full version of GDevelop to create your own game
              without limits!
            </Trans>
          </p>
        </div>
      </Dialog>
    );
  }
}
