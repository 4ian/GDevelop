import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';

export default class ToolbarIcon extends Component {
  render() {
    return (
      <IconButton
        {...this.props}
      >
        <img alt={this.props.tooltip} src={this.props.src} />
      </IconButton>
    );
  }
}
