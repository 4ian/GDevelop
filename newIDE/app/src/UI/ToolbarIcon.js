import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';

export default class ToolbarIcon extends Component {
  render() {
    const { src, tooltip, ...otherProps } = this.props;

    return (
      <IconButton
        {...otherProps}
        iconStyle={{
          //Properly align icons with the rest of the toolbar
          marginLeft: -4,
          marginTop: -4,
          filter: this.props.disabled ? 'grayscale(100%)' : undefined,
        }}
      >
        <img title={tooltip} alt={tooltip} src={src} width={32} height={32} />
      </IconButton>
    );
  }
}
