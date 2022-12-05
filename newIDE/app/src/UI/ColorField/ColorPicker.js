// @flow
// Inspired by https://github.com/LoicMahieu/material-ui-color-picker

import * as React from 'react';
import { SketchPicker } from 'react-color';
import Popover from '@material-ui/core/Popover';
import muiZIndex from '@material-ui/core/styles/zIndex';
import { type RGBColor } from '../../Utils/ColorTransformer';

export type ColorResult = {
  rgb: RGBColor,
};

type ColorChangeHandler = (color: ColorResult) => void;

type Props = {|
  color: ?RGBColor,
  style?: Object,
  onChange?: ColorChangeHandler,
  onChangeComplete?: ColorChangeHandler,
  disableAlpha?: boolean,
  disabled?: boolean,
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
  disabled: {
    opacity: 0.2,
    cursor: 'default',
  },
  popover: {
    // Ensure the popover is above everything (modal, dialog, snackbar, tooltips, etc).
    // There will be only one ColorPicker opened at a time, so it's fair to put the
    // highest z index. If this is breaking, check the z-index of material-ui.
    zIndex: muiZIndex.tooltip + 100,
  },
};

const ColorPicker = ({
  color,
  style,
  onChange,
  onChangeComplete,
  disableAlpha,
  disabled,
}: Props) => {
  const swatchRef = React.useRef<?HTMLDivElement>(null);
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

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
        style={{
          ...styles.swatch,
          ...(disabled ? styles.disabled : {}),
        }}
        onClick={handleClick}
        ref={swatchRef}
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
      {displayColorPicker && swatchRef.current ? (
        <Popover
          open
          onClose={handleClose}
          anchorEl={swatchRef.current}
          style={styles.popover}
        >
          <SketchPicker
            color={displayedColor}
            onChange={onChange}
            onChangeComplete={onChangeComplete}
            disableAlpha={disableAlpha}
          />
        </Popover>
      ) : null}
    </div>
  );
};

export default ColorPicker;
