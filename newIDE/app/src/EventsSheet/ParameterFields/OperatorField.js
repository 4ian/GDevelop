// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

export default class OperatorField extends Component<ParameterFieldProps> {
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
        value={this.props.value}
        onChange={(e, i, value: string) => this.props.onChange(value)}
        ref={field => (this._field = field)}
        hintText={t`Choose an operator`}
      >
        <SelectOption value="=" primaryText={t`= (set to)`} />
        <SelectOption value="+" primaryText={t`+ (add)`} />
        <SelectOption value="-" primaryText={t`- (subtract)`} />
        <SelectOption value="*" primaryText={t`* (multiply by)`} />
        <SelectOption value="/" primaryText={t`/ (divide by)`} />
      </SelectField>
    );
  }
}

export const renderInlineOperator = ({
  value,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose an operator</Trans>
      </InvalidParameterValue>
    );
  }

  if (
    value !== '=' &&
    value !== '+' &&
    value !== '-' &&
    value !== '*' &&
    value !== '/'
  ) {
    return <InvalidParameterValue>{value}</InvalidParameterValue>;
  }

  return value;
};
