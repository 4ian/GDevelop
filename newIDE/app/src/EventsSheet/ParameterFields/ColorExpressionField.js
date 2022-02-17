// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { rgbStringAndAlphaToRGBColor } from '../../Utils/ColorTransformer';

export default class ParameterColorField extends Component<ParameterFieldProps> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
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
            color={rgbStringAndAlphaToRGBColor(this.props.value)}
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
