// @flow
import React, { Component } from 'react';
import GenericExpressionField from './GenericExpressionField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';

export const getParameterChoices = (
  parameterMetadata: ?gdParameterMetadata
): Array<ExpressionAutocompletion> => {
  if (!parameterMetadata) {
    return [];
  }

  try {
    return JSON.parse(parameterMetadata.getExtraInfo()).map(choice => ({
      kind: 'Text',
      completion: `"${choice}"`,
    }));
  } catch (exception) {
    console.error(
      'The parameter seems misconfigured, as an array of choices could not be extracted - verify that your properly wrote a list of choices in JSON format. Full exception is:',
      exception
    );
  }

  return [];
};

export default class StringWithSelectorField extends Component<
  ParameterFieldProps,
  {||}
> {
  _field: ?GenericExpressionField;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    return (
      <GenericExpressionField
        expressionType="string"
        onGetAdditionalAutocompletions={expression =>
          getParameterChoices(this.props.parameterMetadata).filter(
            ({ completion }) => completion.indexOf(expression) === 0
          )
        }
        ref={field => (this._field = field)}
        {...this.props}
      />
    );
  }
}
