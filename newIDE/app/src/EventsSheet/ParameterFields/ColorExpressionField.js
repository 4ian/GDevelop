// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldProps.flow';
import GenericExpressionField from './GenericExpressionField';
import ColorPicker from '../../UI/ColorField/ColorPicker';

const parseColor = (rgbColor: string) => {
  const colors = rgbColor.replace(/"/g, '').split(';');
  if (colors.length !== 3) {
    return null;
  }

  const r = parseInt(colors[0], 10);
  const g = parseInt(colors[1], 10);
  const b = parseInt(colors[2], 10);

  // Check if parsing of number was done properly (if not,
  // we receive NaN which is not equal to itself).
  // eslint-disable-next-line
  if (r !== r || g !== g || b !== b) return null;

  return {
    r,
    g,
    b,
    a: 255,
  };
};

export default class ParameterColorField extends Component<ParameterFieldProps> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        ref={field => (this._field = field)}
        renderExtraButton={({ style }) => (
          <ColorPicker
            style={style}
            disableAlpha
            color={parseColor(this.props.value)}
            onChangeComplete={color => {
              this.props.onChange(
                '"' + color.rgb.r + ';' + color.rgb.g + ';' + color.rgb.b + '"'
              );
            }}
          />
        )}
        {...this.props}
      />
    );
  }
}
