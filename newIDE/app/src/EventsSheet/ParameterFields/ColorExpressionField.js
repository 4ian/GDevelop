// @flow
import * as React from 'react';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import GenericExpressionField from './GenericExpressionField';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { rgbStringAndAlphaToRGBColor } from '../../Utils/ColorTransformer';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ParameterColorField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: { selectAll?: boolean }) => {
        if (field.current) field.current.focus({ selectAll });
      },
    }));

    return (
      <GenericExpressionField
        expressionType="string"
        ref={field}
        renderExtraButton={({ style }) => (
          <ColorPicker
            style={style}
            disableAlpha
            color={rgbStringAndAlphaToRGBColor(props.value)}
            onChangeComplete={color => {
              props.onChange(
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
        {...props}
      />
    );
  }
);
