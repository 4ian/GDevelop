// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateLayouts } from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default class SceneNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const layoutNames: Array<ExpressionAutocompletion> = this.props.project
      ? enumerateLayouts(this.props.project).map(layout => ({
          kind: 'Text',
          completion: `"${layout.getName()}"`,
        }))
      : [];

    return (
      <GenericExpressionField
        expressionType="string"
        additionalAutocompletions={expression =>
          layoutNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
