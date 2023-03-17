// @flow
import * as React from 'react';
import uniq from 'lodash/uniq';
import GenericExpressionField from './GenericExpressionField';
import {
  type ParameterFieldProps,
  type ParameterFieldInterface,
  type FieldFocusFunction,
} from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import {
  getLastObjectParameterValue,
  getPreviousParameterValue,
  tryExtractStringLiteralContent,
} from './ParameterMetadataTools';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { mapVector } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectEffectParameterNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    const focus: FieldFocusFunction = options => {
      if (field.current) field.current.focus(options);
    };
    React.useImperativeHandle(ref, () => ({
      focus,
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

      const objectOrGroupName = getLastObjectParameterValue({
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
      if (!objectOrGroupName || !project || !effectName) {
        return [];
      }

      let effectType: string | null = null;
      const object = getObjectByName(project, scope.layout, objectOrGroupName);
      if (object && object.getEffects().hasEffectNamed(effectName)) {
        effectType = object
          .getEffects()
          .getEffect(effectName)
          .getEffectType();
      }

      if (!effectType) {
        const group = getObjectGroupByName(
          project,
          scope.layout,
          objectOrGroupName
        );
        if (group) {
          // If the instruction targets a group, we check that the effect behind
          // the effect name on every object of the group is of the same type.
          const effectTypes: Array<string | null> = mapVector(
            group.getAllObjectsNames(),
            objectName => {
              const object = getObjectByName(project, scope.layout, objectName);
              if (!object) {
                // If object not found, we consider this as an error.
                return null;
              }
              if (!object.getEffects().hasEffectNamed(effectName)) {
                return null;
              }
              return object
                .getEffects()
                .getEffect(effectName)
                .getEffectType();
            }
          );
          if (
            effectTypes.every(type => !!type) &&
            uniq(effectTypes).length === 1
          ) {
            effectType = effectTypes[0];
          }
        }
      }

      if (!effectType) return [];

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
