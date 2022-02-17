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

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function LayerEffectParameterNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: (selectAll: boolean = false) => {
        if (field.current) field.current.focus(selectAll);
      },
    }));

    const getEffectParameterNames = (): Array<ExpressionAutocompletion> => {
      const { project, scope, instruction, expression, parameterIndex } = props;

      const { layout } = scope;
      if (!layout || !project) return [];

      const layerName = tryExtractStringLiteralContent(
        getPreviousParameterValue({
          instruction,
          expression,
          parameterIndex: parameterIndex ? parameterIndex - 1 : null,
        })
      );
      if (layerName == null || !layout.hasLayerNamed(layerName)) return [];
      const layer = layout.getLayer(layerName);

      const effectName = tryExtractStringLiteralContent(
        getPreviousParameterValue({
          instruction,
          expression,
          parameterIndex,
        })
      );
      if (!effectName || !layer.getEffects().hasEffectNamed(effectName)) {
        return [];
      }
      const effect = layer.getEffects().getEffect(effectName);

      const effectType = effect.getEffectType();
      const effectMetadata = gd.MetadataProvider.getEffectMetadata(
        project.getCurrentPlatform(),
        effectType
      );
      const properties = effectMetadata.getProperties();
      const parameterNames = properties.keys().toJSArray();

      return parameterNames.sort().map(parameterName => ({
        kind: 'Text',
        completion: `"${parameterName}"`,
      }));
    };

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getEffectParameterNames().filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        {...props}
      />
    );
  }
);
