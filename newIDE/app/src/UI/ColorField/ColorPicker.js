// @flow
// Inspired by https://github.com/LoicMahieu/material-ui-color-picker

import * as React from 'react';
import { SketchPicker } from 'react-color';

type RGBColor = {|
  r: number,
  g: number,
  b: number,
  a?: number,
|};

type ColorResult = {
  rgb: RGBColor,
};

type ColorChangeHandler = (color: ColorResult) => void;

type Props = {|
  color: ?RGBColor,
  style?: Object,
  onChange?: ColorChangeHandler,
  onChangeComplete?: ColorChangeHandler,
  disableAlpha?: boolean,
|};

type State = {|
  displayColorPicker: boolean,
|};

const styles = {
  color: {
    width: '36px',
    height: '14px',
    borderRadius: '2px',
    textAlign: 'center',
    fontSize: '10px',
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
    transform: 'translateX(-174px)',
  },
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
};

class ColorPicker extends React.Component<Props, State> {
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

  render() {
    const { style, color, ...otherProps } = this.props;

    const displayedColor = color
      ? color
      : {
          r: 200,
          g: 200,
          b: 200,
          a: 1,
        };

    return (
      <div style={style}>
        <div style={styles.swatch} onClick={this.handleClick}>
          <div
            style={{
              ...styles.color,
              background: `rgba(${displayedColor.r}, ${displayedColor.g}, ${
                displayedColor.b
              }, ${displayedColor.a || 1})`,
            }}
          >
            {color ? null : '?'}
          </div>
        </div>
        {this.state.displayColorPicker ? (
          <div style={styles.popover}>
            <div style={styles.cover} onClick={this.handleClose} />
            <SketchPicker color={displayedColor} {...otherProps} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default ColorPicker;
