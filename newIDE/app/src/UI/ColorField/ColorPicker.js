// @flow
// Inspired by https://github.com/LoicMahieu/material-ui-color-picker

import * as React from 'react';
import { SketchPicker } from 'react-color';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import muiZIndex from '@material-ui/core/styles/zIndex';

export type RGBColor = {|
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
    // Ensure the popper is above everything (modal, dialog, snackbar, tooltips, etc).
    // There will be only one ColorPicker opened at a time, so it's fair to put the
    // highest z index. If this is breaking, check the z-index of material-ui.
    zIndex: muiZIndex.tooltip + 100,
  },
};

class ColorPicker extends React.Component<Props, State> {
  _swatch = React.createRef<HTMLDivElement>();
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
        <div
          style={styles.swatch}
          onClick={this.handleClick}
          ref={this._swatch}
        >
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
        {this.state.displayColorPicker && this._swatch.current ? (
          <ClickAwayListener onClickAway={this.handleClose}>
            <Popper
              open
              anchorEl={this._swatch.current}
              style={styles.popover}
              placement="bottom"
            >
              <SketchPicker color={displayedColor} {...otherProps} />
            </Popper>
          </ClickAwayListener>
        ) : null}
      </div>
    );
  }
}

export default ColorPicker;
