import React, { Component } from 'react';
import Popover from 'material-ui/Popover';

const styles = {
  popover: {
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    maxWidth: 600,
    height: 80,
    overflowY: 'hidden',
  },
  contentContainer: {
    overflow: 'hidden',
  },
};

export default class InlinePopover extends Component {
  render() {
    return (
      <Popover
        open={this.props.open}
        anchorEl={this.props.anchorEl}
        style={styles.popover}
        anchorOrigin={{ horizontal: 'middle', vertical: 'bottom' }}
        targetOrigin={{ horizontal: 'middle', vertical: 'top' }}
        onRequestClose={this.props.onRequestClose}
      >
        <div style={styles.contentContainer}>{this.props.children}</div>
      </Popover>
    );
  }
}
