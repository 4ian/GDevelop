// @flow
import * as React from 'react';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import GenericExpressionField from './GenericExpressionField';
import { renderInlineDefaultField } from './DefaultField';
import ColorPicker from '../../UI/ColorField/ColorPicker';
import { rgbStringAndAlphaToRGBColor } from '../../Utils/ColorTransformer';

const inlineColorPickerStyle = {
  width: 'var(--icon-size)',
  height: 'var(--icon-size)',
  verticalAlign: 'sub',
};

let wasSwatchClicked = false;

export default (React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ColorExpressionField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);

    const [shouldOnlyShowColorPicker] = React.useState(() => {
      const openedFromSwatchClick = wasSwatchClicked;
      wasSwatchClicked = false;
      return !!props.isInline && openedFromSwatchClick;
    });

    const focus: FieldFocusFunction = options => {
      if (!shouldOnlyShowColorPicker && field.current)
        field.current.focus(options);
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
            initiallyOpen={shouldOnlyShowColorPicker}
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
      <span onClick={() => (wasSwatchClicked = true)}>
        <ColorPicker
          size="compact"
          disableAlpha
          readOnly
          color={rgbColor}
          style={inlineColorPickerStyle}
        />
      </span>
    </>
  );
};
