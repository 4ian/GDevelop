import { t } from '@lingui/macro';
import React, { Component } from 'react';
import TextField from '../TextField';
import ColorPicker from './ColorPicker';
import { rgbStringToRGBColor } from '../../Utils/ColorTransformer';

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

export default class ColorField extends Component {
  state = {
    value: this.props.color,
  };

  _handleChange = (value: string) => {
    this.setState({ value });
  };

  _handleBlur = () => {
    this.props.onChange(this.state.value);
  };

  _handlePickerChange = (color: Object) => {
    const rgbString = `${color.rgb.r};${color.rgb.g};${color.rgb.b}`;
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
          fullWidth
          floatingLabelText={this.props.floatingLabelText}
          floatingLabelFixed
          helperMarkdownText={this.props.helperMarkdownText}
          type="text"
          hintText={t`Text in the format R;G;B, like 100;200;180`}
          value={this.state.value}
          onChange={event => this._handleChange(event.target.value)}
          onBlur={this._handleBlur}
          ref={textField => (this.textField = textField)}
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
