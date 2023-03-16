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
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default React.forwardRef<ParameterFieldProps, ParameterFieldInterface>(
  function ObjectAnimationNameField(props: ParameterFieldProps, ref) {
    const field = React.useRef<?GenericExpressionField>(null);
    React.useImperativeHandle(ref, () => ({
      focus: ({ selectAll = false }: { selectAll?: boolean }) => {
        if (field.current) field.current.focus({ selectAll });
      },
    }));

    const getAnimationNames = (): Array<ExpressionAutocompletion> => {
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
      if (!objectName || !project) {
        return [];
      }

      const object = getObjectByName(project, scope.layout, objectName);
      if (!object) {
        return [];
      }

      if (object.getType() === 'Sprite') {
        const spriteConfiguration = gd.asSpriteConfiguration(
          object.getConfiguration()
        );

        return mapFor(0, spriteConfiguration.getAnimationsCount(), index => {
          const animationName = spriteConfiguration
            .getAnimation(index)
            .getName();
          return animationName.length > 0 ? animationName : null;
        })
          .filter(Boolean)
          .sort()
          .map(animationName => ({
            kind: 'Text',
            completion: `"${animationName}"`,
          }));
      }

      return [];
    };

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getAnimationNames().filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field}
        {...props}
      />
    );
  }
);
