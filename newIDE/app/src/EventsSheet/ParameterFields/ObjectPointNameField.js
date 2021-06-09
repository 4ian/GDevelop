// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
import getObjectByName from '../../Utils/GetObjectByName';
import { getLastObjectParameterValue } from './ParameterMetadataTools';
import { getAllPointNames } from '../../ObjectEditor/Editors/SpriteEditor/Utils/SpriteObjectHelper';

const gd: libGDevelop = global.gd;

export default class ObjectPointNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  getPointNames(
    props: Readonly<any> & Readonly<{ children?: React.ReactNode }>
  ): Array<ExpressionAutocompletion> {
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
    if (!objectName) {
      return [];
    }

    const object = getObjectByName(project, scope.layout, objectName);
    if (!object) {
      return [];
    }

    const spriteObject = gd.asSpriteObject(object);
    if (!spriteObject) {
      return [];
    }

    return getAllPointNames(spriteObject).map(pointName => ({
      kind: 'Text',
      completion: `"${pointName}"`,
    }));
  }

  render() {
    const pointsNames = this.getPointNames(this.props);

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          pointsNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
