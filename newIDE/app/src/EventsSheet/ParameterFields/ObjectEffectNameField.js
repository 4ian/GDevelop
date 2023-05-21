// @flow
import * as React from 'react';
import intersection from 'lodash/intersection';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { enumerateEffectNames } from '../../EffectsList/EnumerateEffects';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { mapVector } from '../../Utils/MapFor';

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectEffectNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
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
      const objectOrGroupName = getLastObjectParameterValue({
        instructionMetadata,
        instruction,
        expressionMetadata,
        expression,
        parameterIndex,
      });
      if (!objectOrGroupName || !project) {
        return [];
      }

      const object = getObjectByName(project, scope.layout, objectOrGroupName);
      if (object) {
        return enumerateEffectNames(object.getEffects())
          .sort()
          .map(effectName => ({
            kind: 'Text',
            completion: `"${effectName}"`,
          }));
      }
      const group = getObjectGroupByName(
        project,
        scope.layout,
        objectOrGroupName
      );
      if (group) {
        const effectsNamesByObject: string[][] = mapVector(
          group.getAllObjectsNames(),
          objectName => {
            const object = getObjectByName(project, scope.layout, objectName);
            if (!object) {
              return null;
            }
            return enumerateEffectNames(object.getEffects());
          }
        ).filter(Boolean);
        return intersection(...effectsNamesByObject)
          .sort()
          .map(effectName => ({
            kind: 'Text',
            completion: `"${effectName}"`,
          }));
      }

      return [];
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
