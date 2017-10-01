import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';

export default class LocalCreateDialog extends Component {
  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>Choose a game to use as a starter:</p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
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
    );
  }
}
