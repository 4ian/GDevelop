// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import {
  getPreviousParameterValue,
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';
import { enumerateEffectNames } from '../../EffectsList/EnumerateEffects';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LayerEffectNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: (selectAll: boolean = false) => {
        if (field.current) field.current.focus(selectAll);
      },
    }));

    const getEffectNames = (): Array<ExpressionAutocompletion> => {
      const { scope, instruction, expression, parameterIndex } = props;

      const { layout } = scope;
      if (!layout) return [];

      const layerName = tryExtractStringLiteralContent(
        getPreviousParameterValue({
          instruction,
          expression,
          parameterIndex,
        })
      );
      if (layerName == null || !layout.hasLayerNamed(layerName)) return [];
      const layer = layout.getLayer(layerName);

      return enumerateEffectNames(layer.getEffects())
        .sort()
        .map(effectName => ({
          kind: 'Text',
          completion: `"${effectName}"`,
        }));
    };

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getEffectNames().filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        {...props}
      />
    );
  }
);
