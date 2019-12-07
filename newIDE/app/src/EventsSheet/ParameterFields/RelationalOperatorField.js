// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

export default class RelationalOperatorField extends Component<ParameterFieldProps> {
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
        <SelectOption value="=" primaryText={t`= (equal to)`} />
        <SelectOption value="<" primaryText={t`< (less than)`} />
        <SelectOption value=">" primaryText={t`> (greater than)`} />
        <SelectOption value="<=" primaryText={t`≤ (less or equal to)`} />
        <SelectOption value=">=" primaryText={t`≥ (greater or equal to)`} />
        <SelectOption value="!=" primaryText={t`≠ (not equal to)`} />
      </SelectField>
    );
  }
}

export const renderInlineRelationalOperator = ({
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
    value !== '<' &&
    value !== '>' &&
    value !== '<=' &&
    value !== '>=' &&
    value !== '!='
  ) {
    return <InvalidParameterValue>{value}</InvalidParameterValue>;
  }

  if (value === '<=') return '\u2264';
  if (value === '>=') return '\u2265';
  else if (value === '!=') return '\u2260';

  return value;
};
