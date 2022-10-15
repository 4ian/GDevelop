// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import TextField from '../TextField';
import ColorPicker, { type ColorResult } from './ColorPicker';
import {
  rgbStringAndAlphaToRGBColor,
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
  onChange: (string, ?number) => void,
  color: string,
  alpha?: number,
|};

type State = {|
  color: string,
  alpha: number,
|};

export default class ColorField extends React.Component<Props, State> {
  state = {
    color: this.props.color,
    // alpha can be equal to 0, so we have to check if it is not undefined
    alpha:
      !this.props.disableAlpha && this.props.alpha !== undefined
        ? this.props.alpha
        : 1,
  };

  _textField: ?TextField = null;

  _handleChange = (color: string, alpha: number) => {
    this.setState({ color, alpha });
  };

  _handleBlur = () => {
    // change alpha value to be within allowed limits (0-1)
    let alpha = parseFloat(this.state.alpha);
    if (alpha < 0) alpha = 0;
    if (alpha > 1) alpha = 1;
    this.setState({ alpha });
    this.props.onChange(this.state.color, alpha);
  };

  _handlePickerChange = (color: ColorResult) => {
    const rgbString = rgbColorToRGBString(color.rgb);
    const alpha = this.props.disableAlpha ? 1 : color.rgb.a;
    this.setState({ color: rgbString, alpha });
    this.props.onChange(rgbString, alpha);
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
          style={!this.props.disableAlpha ? { width: '60%' } : undefined}
          floatingLabelText={this.props.floatingLabelText}
          floatingLabelFixed
          helperMarkdownText={this.props.helperMarkdownText}
          type="text"
          translatableHintText={t`Text in the format R;G;B, like 100;200;180`}
          value={this.state.color}
          onChange={event =>
            this._handleChange(event.target.value, this.state.alpha)
          }
          onBlur={this._handleBlur}
          ref={textField => (this._textField = textField)}
        />
        {!this.props.disableAlpha && (
          <TextField
            id={`${this.props.id || ''}-alpha`}
            floatingLabelText="Alpha"
            floatingLabelFixed
            style={{ width: '30%' }}
            translatableHintText={t`Number between 0 and 1`}
            value={this.state.alpha.toString()}
            onChange={(event, value) =>
              this._handleChange(this.state.color, parseFloat(value))
            }
            onBlur={this._handleBlur}
            ref={textField => (this._textField = textField)}
            type="number"
            step={0.1}
          />
        )}
        <div style={styles.picker}>
          <ColorPicker
            disableAlpha={this.props.disableAlpha}
            onChangeComplete={this._handlePickerChange}
            color={rgbStringAndAlphaToRGBColor(
              this.state.color,
              this.state.alpha
            )}
          />
        </div>
      </div>
    );
  }
}
