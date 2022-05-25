// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import TextField from '../UI/TextField';
import ColorPicker, { type ColorResult } from '../UI/ColorField/ColorPicker';
import {
  type RGBColor,
  hexToRGBColor,
  rgbColorToHex,
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

type State = {|
  color: string,
|};

const hexToNullableRGBColor = (color: string): RGBColor | null => {
  return /^#{0,1}[0-9a-fA-F]{6}$/.test(color) ? hexToRGBColor(color) : null;
};

// TODO Decide what to do with this component.
// Should it be merged back with ColorField?
// The only difference is the format of the string representation,
// but they probably have distinct usages:
// - ColorField is for color properties and parameters
// - this one is for a color thant won't be used in events and
// should use the common #123456 format.
export class HexColorField extends React.Component<Props, State> {
  state = {
    color: this.props.color
      ? rgbColorToHex(
          this.props.color.r,
          this.props.color.g,
          this.props.color.b
        )
      : '',
  };

  _textField: ?TextField = null;

  _handleChange = (color: string) => {
    const oldColor = hexToNullableRGBColor(this.state.color);
    const newColor = hexToNullableRGBColor(color);
    this.setState({ color });
    if (newColor !== oldColor) {
      this.props.onChange(newColor);
    }
  };

  _handlePickerChange = (color: ColorResult) => {
    const hexString = rgbColorToHex(color.rgb.r, color.rgb.g, color.rgb.b);
    this.setState({ color: hexString });
    this.props.onChange(color.rgb);
  };

  render() {
    return (
      <div
        style={{
          ...styles.container,
          width: this.props.fullWidth ? '100%' : undefined,
        }}
      >
        <TextField
          id={this.props.id}
          fullWidth={this.props.disableAlpha}
          floatingLabelText={this.props.floatingLabelText}
          floatingLabelFixed
          helperMarkdownText={this.props.helperMarkdownText}
          type="text"
          hintText={t`Code like #ff8844`}
          value={this.state.color}
          onChange={event => this._handleChange(event.target.value)}
          ref={textField => (this._textField = textField)}
        />
        <div
          style={
            this.props.floatingLabelText ? styles.picker : styles.pickerNoLabel
          }
        >
          <ColorPicker
            disableAlpha={true}
            onChangeComplete={this._handlePickerChange}
            color={hexToNullableRGBColor(this.state.color)}
          />
        </div>
      </div>
    );
  }
}
