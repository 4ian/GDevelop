// @flow
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';
import { enumerateObjectTypes } from '../../ObjectsList/EnumerateObjects';

export default class ObjectTypeField extends Component<ParameterFieldProps> {
  _field: ?SelectField;

  focus() {
    if (this._field && this._field.focus) this._field.focus();
  }

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SelectField
        margin={this.props.isInline ? 'none' : 'dense'}
        fullWidth
        floatingLabelText={description}
        helperMarkdownText={
          parameterMetadata ? parameterMetadata.getLongDescription() : undefined
        }
        value={this.props.value}
        onChange={(e, i, value: string) => this.props.onChange(value)}
        ref={field => (this._field = field)}
        hintText={t`Choose an object type`}
      >
        {enumerateObjectTypes(this.props.project).map(({ fullName, name }) => (
          <SelectOption key={name} value={name} primaryText={fullName} />
        ))}
      </SelectField>
    );
  }
}

export const renderInlineObjectType = ({
  value,
}: ParameterInlineRendererProps) => value || 'Base object';
