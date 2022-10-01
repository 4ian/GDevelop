// @flow
import * as React from 'react';
import TextField from '../UI/TextField';
import ColorPicker, { type ColorResult } from '../UI/ColorField/ColorPicker';
import {
  type RGBColor,
  hexToRGBColor,
  rgbColorToHex,
  rgbToHexNumber,
} from '../Utils/ColorTransformer';

const styles = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  picker: {
    position: 'absolute',
    right: '8px',
    top: '19px',
  },
  pickerNoLabel: {
    position: 'absolute',
    right: '8px',
    top: '8px',
  },
};

type Props = {|
  fullWidth?: boolean,
  disableAlpha?: boolean,
  id?: string,
  floatingLabelText?: string | React.Node,
  helperMarkdownText?: ?string,
  onChange: (RGBColor | null) => void,
  color: RGBColor | null,
|};

const hexToNullableRGBColor = (color: string): RGBColor | null => {
  return /^#{0,1}[0-9a-fA-F]{6}$/.test(color) ? hexToRGBColor(color) : null;
};

const areSameColor = (
  color1: RGBColor | null,
  color2: RGBColor | null
): boolean => {
  return (
    (color1 && rgbToHexNumber(color1.r, color1.g, color1.b)) !==
    (color2 && rgbToHexNumber(color2.r, color2.g, color2.b))
  );
};

/**
 * Very similar to ColorField but it uses a #123456 format.
 */
export const HexColorField = ({
  fullWidth,
  disableAlpha,
  id,
  floatingLabelText,
  helperMarkdownText,
  onChange,
  color,
}: Props) => {
  const [colorString, setColorString] = React.useState<string>(
    color ? rgbColorToHex(color.r, color.g, color.b) : ''
  );

  // It keeps the inputted text if the color has not changed.
  if (areSameColor(color, hexToNullableRGBColor(colorString))) {
    setColorString(color ? rgbColorToHex(color.r, color.g, color.b) : '');
  }

  const handleTextChange = (newStringColor: string) => {
    const oldColor = hexToNullableRGBColor(colorString);
    const newColor = hexToNullableRGBColor(newStringColor);
    setColorString(newStringColor);
    if (newColor !== oldColor) {
      onChange(newColor);
    }
  };

  const handlePickerChange = (color: ColorResult) => {
    setColorString(rgbColorToHex(color.rgb.r, color.rgb.g, color.rgb.b));
    onChange(color.rgb);
  };

  return (
    <div
      style={{
        ...styles.container,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      <TextField
        id={id}
        fullWidth={disableAlpha}
        floatingLabelText={floatingLabelText}
        floatingLabelFixed
        helperMarkdownText={helperMarkdownText}
        type="text"
        hintText={'#ff8844'}
        value={colorString}
        onChange={event => handleTextChange(event.target.value)}
      />
      <div style={floatingLabelText ? styles.picker : styles.pickerNoLabel}>
        <ColorPicker
          disableAlpha={true}
          onChangeComplete={handlePickerChange}
          color={hexToNullableRGBColor(colorString)}
        />
      </div>
    </div>
  );
};
