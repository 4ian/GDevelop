import React, { Component } from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';

export default class LocalCreateDialog extends Component {
  render() {
    const { open, onClose } = this.props;
    if (!open) return null;

    const actions = [
      <FlatButton label="Close" primary={false} onTouchTap={onClose} />,
    ];

    return (
      <Dialog
        title="Create a new game"
        actions={actions}
        modal={true}
        open={open}
      >
        <Column noMargin>
          <Line>
            Choose the game to use as a starter:
          </Line>
          <Line>
            <Column expand>
              <FlatButton
                label="Platformer"
                fullWidth
                primary
                onClick={() => this.props.onOpen('internal://platformer')}
              />
              <FlatButton
                label="Space Shooter - coming soon!"
                fullWidth
                primary
                disabled
              />
            </Column>
          </Line>
        </Column>
      </Dialog>
    );
  }
}
