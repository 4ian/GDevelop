import React, { Component } from 'react';
import Popper from '@material-ui/core/Popper';
import Background from '../UI/Background';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Column, Line } from '../UI/Grid';
import { shouldCloseOrCancel } from '../UI/KeyboardShortcuts/InteractionKeys';

const styles = {
  popover: {
    paddingBottom: 10,
    overflowY: 'auto',

    // Never show a horizontal scrollbar
    overflowX: 'hidden',

    // Restrict size in case of extra small or large popover (though this should not happen)
    minHeight: 30,
    maxHeight: 400,
    maxWidth: 600,
    minWidth: 300, // Avoid extra small popover for some parameters like relational operator

    // When displayed in an events sheet that has Mosaic windows (see `EditorMosaic`) next to it,
    // it could be displayed behind them, because they have a z-index of 1, and 4 for the window titles :/
    // use a z-index of 5 then. Only one InlinePopover should be shown at a time anyway.
    zIndex: 5,
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
          onKeyDown={event => {
            // Much like a dialog, offer a way to close the popover
            // with a key.
            // Note that the content of the popover can capture the event
            // and stop its propagation (for example, the GenericExpressionField
            // when showing autocompletion), which is fine.
            if (shouldCloseOrCancel(event)) {
              this.props.onRequestClose();
            }
          }}
        >
          <Background>
            <Column expand>
              <Line>{this.props.children}</Line>
            </Column>
          </Background>
        </Popper>
      </ClickAwayListener>
    );
  }
}
