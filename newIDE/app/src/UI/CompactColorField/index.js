// @flow

import * as React from 'react';
import classNames from 'classnames';
import classes from './CompactColorField.module.css';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import ColorPicker, { type ColorResult } from '../ColorField/ColorPicker';
import {
  rgbColorToRGBString,
  rgbStringAndAlphaToRGBColor,
} from '../../Utils/ColorTransformer';
import CompactTextField from '../CompactTextField';

export type CompactColorFieldProps = {|
  color: string,
  onChange: (newValue: string, alpha?: number) => void,
  id?: string,
  disabled?: boolean,
  errored?: boolean,
  placeholder?: string,
  alpha?: number,
  disableAlpha: true, // Support for alpha is not implemented yet.
|};

export const CompactColorField = ({
  color,
  alpha,
  disableAlpha,
  onChange,
  id,
  disabled,
  errored,
  placeholder,
}: CompactColorFieldProps): React.MixedElement => {
  const idToUse = React.useRef<string>(id || makeTimestampedId());
  const [focused, setFocused] = React.useState<boolean>(false);
  const [colorValue, setColorValue] = React.useState<string>(color);
  // alpha can be equal to 0, so we have to check if it is not undefined
  const [alphaValue, setAlphaValue] = React.useState<number>(
    // $FlowFixMe[constant-condition]
    !disableAlpha && alpha !== undefined ? alpha : 1
  );

  const handleChange = (newColor: string, newAlpha: number) => {
    setColorValue(newColor);
    setAlphaValue(newAlpha);
  };

  const handleBlur = () => {
    // change alpha value to be within allowed limits (0-1)
    let newAlpha = parseFloat(alphaValue);
    if (newAlpha < 0) newAlpha = 0;
    if (newAlpha > 1) newAlpha = 1;
    setAlphaValue(newAlpha);
    onChange(colorValue, newAlpha);
  };

  const handlePickerChange = (color: ColorResult) => {
    const rgbString = rgbColorToRGBString(color.rgb);
    // $FlowFixMe[constant-condition]
    const newAlpha = disableAlpha ? 1 : color.rgb.a;
    setColorValue(rgbString);
    if (newAlpha) setAlphaValue(newAlpha);
    onChange(rgbString, newAlpha);
  };

  console.log('CompactColorField update', color);

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.disabled]: disabled,
        [classes.errored]: errored,
      })}
    >
      <div
        className={classNames({
          [classes.compactColorField]: true,
        })}
      >
        <CompactTextField
          id={idToUse.current}
          type="text"
          value={focused ? colorValue : color}
          onFocus={event => {
            setFocused(true);
            setColorValue(color);
          }}
          onChange={newColor => handleChange(newColor, alphaValue)}
          onBlur={event => {
            if (color !== event.currentTarget.value) {
              handleChange(event.currentTarget.value, alphaValue);
            }
            setFocused(false);
            handleBlur();
          }}
        />
        <ColorPicker
          size="compact"
          disableAlpha={disableAlpha}
          onChangeComplete={handlePickerChange}
          color={rgbStringAndAlphaToRGBColor(
            focused ? colorValue : color,
            alpha
          )}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
