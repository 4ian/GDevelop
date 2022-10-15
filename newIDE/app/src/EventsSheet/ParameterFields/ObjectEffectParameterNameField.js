// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import {
  getLastObjectParameterValue,
  getPreviousParameterValue,
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectEffectParameterNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: (selectAll: boolean = false) => {
        if (field.current) field.current.focus(selectAll);
      },
    }));

    const getEffectParameterNames = (): Array<ExpressionAutocompletion> => {
      const {
        project,
        scope,
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      } = props;

      const objectName = getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      });
      const effectName = tryExtractStringLiteralContent(
        getPreviousParameterValue({
          instruction,
          expression,
          parameterIndex,
        })
      );
      if (!objectName || !project || !effectName) {
        return [];
      }

      const object = getObjectByName(project, scope.layout, objectName);
      if (!object || !object.getEffects().hasEffectNamed(effectName)) {
        return [];
      }
      const effect = object.getEffects().getEffect(effectName);

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
