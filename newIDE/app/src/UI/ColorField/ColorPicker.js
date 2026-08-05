// @flow
// Inspired by https://github.com/LoicMahieu/material-ui-color-picker

import * as React from 'react';
import { SketchPicker } from 'react-color';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import muiZIndex from '@material-ui/core/styles/zIndex';
import { type RGBColor } from '../../Utils/ColorTransformer';
import PortalContainerContext from '../PortalContainerContext';
import { shouldCloseOrCancel } from '../KeyboardShortcuts/InteractionKeys';

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
  /**
   * Prevent opening the picker and dim the swatch.
   */
  disabled?: boolean,
  size?: 'compact',
  initiallyOpen?: boolean,
  /**
   * Prevent opening the picker, but keep the swatch fully visible: use this
   * when the color is only previewed and edited from somewhere else.
   */
  readOnly?: boolean,
|};

const styles = {
  color: {
    width: '100%',
    height: '100%',
    borderRadius: '2px',
    textAlign: 'center',
    fontSize: '10px',
  },
  swatch: {
    padding: '2px',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
  },
  disabled: {
    opacity: 0.2,
    cursor: 'default',
  },
  readOnly: {
    cursor: 'inherit',
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
  size,
  initiallyOpen,
  readOnly,
}: Props): React.Node => {
  const [swatchElement, setSwatchElement] = React.useState<?HTMLDivElement>(
    null
  );
  const [displayColorPicker, setDisplayColorPicker] = React.useState(
    !!initiallyOpen && !disabled && !readOnly
  );
  const portalContainer = React.useContext(PortalContainerContext);

  const handleClick = () => {
    if (disabled || readOnly) return;
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  React.useEffect(
    () => {
      if (!displayColorPicker || !swatchElement) return;

      const pickerDocument = swatchElement.ownerDocument;
      const onKeyDown = (event: KeyboardEvent) => {
        if (!shouldCloseOrCancel(event)) return;
        event.stopPropagation();
        setDisplayColorPicker(false);
      };
      pickerDocument.addEventListener('keydown', onKeyDown, true);
      return () =>
        pickerDocument.removeEventListener('keydown', onKeyDown, true);
    },
    [displayColorPicker, swatchElement]
  );

  const displayedColor = color
    ? color
    : {
        r: 200,
        g: 200,
        b: 200,
        a: 1,
      };

  return (
    <>
      <div
        style={{
          ...styles.swatch,
          ...(disabled ? styles.disabled : readOnly ? styles.readOnly : {}),
          width: size === 'compact' ? 16 : 38,
          height: size === 'compact' ? 16 : 18,
          ...style,
        }}
        onClick={handleClick}
        ref={setSwatchElement}
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
      {displayColorPicker && swatchElement ? (
        <ClickAwayListener
          mouseEvent="onMouseDown"
          onClickAway={event => {
            if (!swatchElement.contains((event.target: any))) handleClose();
          }}
        >
          <Popper
            open
            anchorEl={swatchElement}
            container={portalContainer}
            style={styles.popover}
            placement="bottom-start"
          >
            <SketchPicker
              // $FlowFixMe[incompatible-type]
              color={displayedColor}
              // $FlowFixMe[incompatible-type]
              onChange={onChange}
              onChangeComplete={onChangeComplete}
              disableAlpha={disableAlpha}
            />
          </Popper>
        </ClickAwayListener>
      ) : null}
    </>
  );
};

export default ColorPicker;
