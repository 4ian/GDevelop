// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import TextField from '../TextField';
import ColorPicker, { type ColorResult } from './ColorPicker';
import {
  rgbStringToRGBColor,
  rgbColorToRGBString,
} from '../../Utils/ColorTransformer';

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
};

type Props = {|
  fullWidth?: boolean,
  disableAlpha?: boolean,
  id?: string,
  floatingLabelText?: string | React.Node,
  helperMarkdownText?: ?string,
  onChange: string => void,
  color: string,
|};

type State = {|
  value: string,
|};

export default class ColorField extends React.Component<Props, State> {
  state = {
    value: this.props.color,
  };

  _textField: ?TextField = null;

  _handleChange = (value: string) => {
    this.setState({ value });
  };

  _handleBlur = () => {
    this.props.onChange(this.state.value);
  };

  _handlePickerChange = (color: ColorResult) => {
    const rgbString = rgbColorToRGBString(color.rgb);
    this.setState({ value: rgbString });
    this.props.onChange(rgbString);
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
          fullWidth
          floatingLabelText={this.props.floatingLabelText}
          floatingLabelFixed
          helperMarkdownText={this.props.helperMarkdownText}
          type="text"
          hintText={t`Text in the format R;G;B, like 100;200;180`}
          value={this.state.value}
          onChange={event => this._handleChange(event.target.value)}
          onBlur={this._handleBlur}
          ref={textField => (this._textField = textField)}
        />
        <div style={styles.picker}>
          <ColorPicker
            disableAlpha={this.props.disableAlpha}
            onChangeComplete={this._handlePickerChange}
            color={rgbStringToRGBColor(this.state.value)}
          />
        </div>
      </div>
    );
  }
}
