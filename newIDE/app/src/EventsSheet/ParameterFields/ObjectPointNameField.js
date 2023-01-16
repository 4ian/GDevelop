// @flow
import React, { Component } from 'react';
import intersection from 'lodash/intersection';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { getAllPointNames } from '../../ObjectEditor/Editors/SpriteEditor/Utils/SpriteObjectHelper';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import { mapVector } from '../../Utils/MapFor';

const gd: libGDevelop = global.gd;

export default class ObjectPointNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  getPointNames(): Array<ExpressionAutocompletion> {
    const {
      project,
      scope,
      instructionMetadata,
      instruction,
      expressionMetadata,
      expression,
      parameterIndex,
    } = this.props;

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
    if (object && object.getType() === 'Sprite') {
      const spriteConfiguration = gd.asSpriteConfiguration(
        object.getConfiguration()
      );

      return getAllPointNames(spriteConfiguration)
        .map(pointName => (pointName.length > 0 ? pointName : null))
        .filter(Boolean)
        .sort()
        .map(pointName => ({
          kind: 'Text',
          completion: `"${pointName}"`,
        }));
    }

    const group = getObjectGroupByName(
      project,
      scope.layout,
      objectOrGroupName
    );
    if (group) {
      // If the instruction targets a group, we check that every object of the
      // group is a sprite and get the points that they all have in common.
      const pointsNamesByObject = mapVector(
        group.getAllObjectsNames(),
        objectName => {
          const object = getObjectByName(project, scope.layout, objectName);
          if (!object || object.getType() !== 'Sprite') {
            return null;
          }
          const spriteConfiguration = gd.asSpriteConfiguration(
            object.getConfiguration()
          );

          return getAllPointNames(spriteConfiguration)
            .map(pointName => (pointName.length > 0 ? pointName : null))
            .filter(Boolean);
        }
      );

      if (pointsNamesByObject.some(pointsNames => !pointsNames)) return [];

      // Flow fears that pointsNamesByObject contains null values but this
      // possibility should be handled above.
      // $FlowExpectedError[incompatible-call]
      return intersection<string>(...pointsNamesByObject)
        .sort()
        .map(pointName => ({
          kind: 'Text',
          completion: `"${pointName}"`,
        }));
    }

    return [];
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          this.getPointNames().filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
