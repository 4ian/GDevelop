import React, { Component } from 'react';
import Popper from '@material-ui/core/Popper';
import Background from '../UI/Background';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Column, Line } from '../UI/Grid';

const styles = {
  popover: {
    paddingBottom: 10,
    overflowY: 'auto',

    // Restrict size in case of extra small or large popover (though this should not happen)
    minHeight: 30,
    maxHeight: 400,
    maxWidth: 600,
    minWidth: 300, // Avoid extra small popover for some parameters like relational operator

    // When displayed in an events sheet that has Mosaic windows (see `EditorMosaic`) next to it,
    // it could be displayed behind them, because they have a z-index of 1 :/ Use a z-index of 2
    // then. Only one InlinePopover should be shown at a time anyway.
    zIndex: 2,
  },
};

export default class InlinePopover extends Component {
  render() {
    return (
      <ClickAwayListener onClickAway={this.props.onRequestClose}>
        <Popper
          open={this.props.open}
          anchorEl={this.props.anchorEl}
          style={styles.popover}
          placement="bottom"
        >
          <Background>
            <Column expand>
              <Line>
                {this.props.children}
              </Line>
            </Column>
          </Background>
        </Popper>
      </ClickAwayListener>
    );
  }
}
