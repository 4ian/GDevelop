import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class BetaIntroDialog extends Component {
  _onOpenWebsite() {
    window.open('http://compilgames.net', '_blank');
  }

  render() {
    const { open, onClose } = this.props;
    const actions = [
      <FlatButton
        label="Download full GDevelop desktop version"
        primary={false}
        onClick={this._onOpenWebsite}
      />,
      <FlatButton label="Ok" primary={true} onClick={onClose} />,
    ];

    return (
      <Dialog actions={actions} open={open} onRequestClose={onClose}>
        <div>
          <p>
            This is a <b>beta version</b> of GDevelop 5 that you can try online.
          </p>
          <p>
            Choose a <b>new project to create</b> and then <b>open the scene</b>{' '}
            to make changes to the game. You can{' '}
            <b>launch a preview of your game</b> at any time!
          </p>
          <p>
            Download the full version of GDevelop to create your own game
            without limits!
          </p>
        </div>
      </Dialog>
    );
  }
}
