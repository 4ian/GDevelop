// @flow
import * as React from 'react';
import SemiControlledTextField from '../../UI/SemiControlledTextField';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';

export default class DefaultField extends React.Component<
  ParameterFieldProps,
  void
> {
  _field: ?any = null;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SemiControlledTextField
        margin={this.props.isInline ? 'none' : 'dense'}
        commitOnBlur
        value={this.props.value}
        floatingLabelText={description}
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        onChange={(text: string) => this.props.onChange(text)}
        ref={(field) => (this._field = field)}
        fullWidth
      />
    );
  }
}

export const renderInlineDefaultField = ({
  value,
  parameterMetadata,
  MissingParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value && !parameterMetadata.isOptional()) {
    return <MissingParameterValue />;
  }

  return value;
};
