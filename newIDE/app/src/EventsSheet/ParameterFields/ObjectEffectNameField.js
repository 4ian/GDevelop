// @flow
import * as React from 'react';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { enumerateEffectNames } from '../../EffectsList/EnumerateEffects';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectEffectNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: (selectAll: boolean = false) => {
        if (field.current) field.current.focus(selectAll);
      },
    }));

    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = props;

    const getEffectNames = (): Array<ExpressionAutocompletion> => {
      const objectName = getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      });
      if (!objectName || !project) {
        return [];
      }

      const object = getObjectByName(project, scope.layout, objectName);
      if (!object) {
        return [];
      }

      return enumerateEffectNames(object.getEffects())
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
