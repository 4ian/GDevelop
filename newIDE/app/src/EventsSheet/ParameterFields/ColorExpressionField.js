// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
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
        onExtractAdditionalErrors={(
          expression: string,
          expressioNode: gdExpressionNode
        ) => {
          if (expression.trim().startsWith('"\\"')) {
            return 'A color is a text in the format R;G;B, like 100;200;180 (numbers going from 0 to 255). You need to surround the text with quotes, but the text itself should not contain a quote inside.';
          }

          return null;
        }}
        {...this.props}
      />
    );
  }
}
