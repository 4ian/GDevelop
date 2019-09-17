import React, { Component } from 'react';
import Popper from '@material-ui/core/Popper';
import Background from '../UI/Background';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import { Column } from '../UI/Grid';

const styles = {
  popover: {
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    maxWidth: 600,
    height: 80,
    overflowY: 'hidden',
    minWidth: 300, // Avoid extra small popover for some parameters like relational operator
  },
  contentContainer: {
    overflow: 'hidden',
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
            <Column>
              <div style={styles.contentContainer}>{this.props.children}</div>
            </Column>
          </Background>
        </Popper>
      </ClickAwayListener>
    );
  }
}
