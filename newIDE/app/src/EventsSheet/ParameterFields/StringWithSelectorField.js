// @flow
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SemiControlledAutoComplete from '../../UI/SemiControlledAutoComplete';

const getChoices = (parameterMetadata: ?gdParameterMetadata) => {
  if (!parameterMetadata) {
    return [];
  }

  try {
    return JSON.parse(parameterMetadata.getExtraInfo());
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
  _field: ?any;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { value, onChange, isInline, parameterMetadata } = this.props;

    return (
      <SemiControlledAutoComplete
        margin={this.props.isInline ? 'none' : 'dense'}
        floatingLabelText={
          parameterMetadata ? parameterMetadata.getDescription() : undefined
        }
        fullWidth
        value={value}
        onChange={onChange}
        dataSource={getChoices(parameterMetadata).map(choice => ({
          text: '"' + choice + '"',
          value: '"' + choice + '"',
        }))}
        openOnFocus={!isInline}
        ref={field => (this._field = field)}
      />
    );
  }
}
