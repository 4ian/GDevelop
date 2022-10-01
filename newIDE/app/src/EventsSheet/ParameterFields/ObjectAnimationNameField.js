// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { mapFor } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default class ObjectAnimationNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  getAnimationNames(): Array<ExpressionAutocompletion> {
    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = this.props;

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
        const animationName = spriteConfiguration.getAnimation(index).getName();
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
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          this.getAnimationNames().filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
