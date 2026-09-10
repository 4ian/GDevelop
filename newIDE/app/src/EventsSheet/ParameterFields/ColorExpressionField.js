// @flow
import * as React from 'react';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { renderInlineDefaultField } from './DefaultField';
import GenericExpressionField from './GenericExpressionField';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { rgbStringAndAlphaToRGBColor } from '../../Utils/ColorTransformer';

const inlineColorPickerStyle = {
  width: 'var(--icon-size)',
  height: 'var(--icon-size)',
  verticalAlign: 'sub',
  pointerEvents: 'none', // Prevents the color picker from being interactive in the inline renderer, otherwise the focus is steal by the popover react component and the color picker is visible but unsusable.
};

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ColorExpressionField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
    }));

    return (
      <GenericExpressionField
        expressionType="string"
        ref={field}
        renderExtraButton={({ style, onChange }) => (
          <ColorPicker
            style={style}
            disableAlpha
            color={rgbStringAndAlphaToRGBColor(props.value)}
            onChangeComplete={color => {
              onChange(
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
): React.ComponentType<{
  ...ParameterFieldProps,
  +ref?: React.RefSetter<ParameterFieldInterface>,
}>);

/**
 * Display the color of the parameter next to its value, as a small square.
 * This is only a preview: the color is edited by opening the parameter, like
 * any other one.
 */
export const renderInlineColor = (
  props: ParameterInlineRendererProps
): React.Node => {
  const rgbColor = props.expressionIsValid
    ? rgbStringAndAlphaToRGBColor(props.value)
    : null;
  if (!rgbColor) return renderInlineDefaultField(props);

  return (
    <>
      {renderInlineDefaultField(props)}{' '}
      <ColorPicker
        size="compact"
        color={rgbColor}
        style={inlineColorPickerStyle}
      />
    </>
  );
};
