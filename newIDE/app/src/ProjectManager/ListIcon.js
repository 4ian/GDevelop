import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';

export default class ListIcon extends Component {
  render() {
    return (
      <IconButton
        {...this.props}
        iconStyle={{
          //Properly align icons with the rest of the list
          marginLeft: -16,
          marginTop: -16,
          filter: this.props.disabled ? 'grayscale(100%)' : undefined,
        }}
      >
        <img alt={this.props.tooltip} src={this.props.src} />
      </IconButton>
    );
  }
}
