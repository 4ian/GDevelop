// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { enumerateExternalLayouts } from '../../ProjectManager/EnumerateProjectItems';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export default class ExternalLayoutNameField extends Component<
  ParameterFieldProps,
  void
> {
  _field: ?GenericExpressionField;

  focus(selectAll: boolean = false) {
    if (this._field) this._field.focus(selectAll);
  }

  render() {
    const externalLayoutNames: Array<ExpressionAutocompletion> = this.props
      .project
      ? enumerateExternalLayouts(this.props.project).map(externalLayout => ({
          kind: 'Text',
          completion: `"${externalLayout.getName()}"`,
        }))
      : [];

    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          externalLayoutNames.filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
