// Inspired by https://github.com/LoicMahieu/material-ui-color-picker

import React, { Component } from 'react';
import { SketchPicker } from 'react-color';

const styles = {
  color: {
    width: '36px',
    height: '14px',
    borderRadius: '2px',
  },
  swatch: {
    padding: '5px',
    background: '#fff',
    borderRadius: '1px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  popover: {
    position: 'fixed',
    zIndex: '2',
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
};

class ColorPicker extends Component {
  state = {
    displayColorPicker: false,
  };

  open = () => {
    this.setState({ displayColorPicker: true });
  };

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleChange = color => {
    this.setState({ color: color.rgb });
  };

  render() {
    return (
      <div style={this.props.style}>
        <div style={styles.swatch} onClick={this.handleClick}>
          <div
            style={{
              ...styles.color,
              background: `rgba(${this.props.color.r}, ${this.props.color
                .g}, ${this.props.color.b}, ${this.props.color.a})`,
            }}
          />
        </div>
        {this.state.displayColorPicker ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.handleClose} />
            <SketchPicker {...this.props} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ColorPicker;
