// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

const operatorLabels = {
  '=': t`= (equal to)`,
  '<': t`< (less than)`,
  '>': t`> (greater than)`,
  '<=': t`≤ (less or equal to)`,
  '>=': t`≥ (greater or equal to)`,
  '!=': t`≠ (not equal to)`,
};

const mapTypeToOperators: { [string]: Array<string> } = {
  unknown: Object.keys(operatorLabels),
  number: ['=', '<', '>', '<=', '>=', '!='],
  time: ['<', '>', '<=', '>='],
  string: ['=', '!='],
  color: ['=', '!='],
};

export default class RelationalOperatorField extends Component<ParameterFieldProps> {
  _field: ?SelectFieldInterface;
  focus() {
    if (this._field && this._field.focus) this._field.focus();
  }

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    const comparedValueType = parameterMetadata
      ? parameterMetadata.getExtraInfo()
      : 'unknown';
    const operators =
      mapTypeToOperators[comparedValueType] || mapTypeToOperators.unknown;

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
        hintText={t`Choose an operator`}
      >
        {operators.map(operator => (
          <SelectOption
            key={operator}
            value={operator}
            primaryText={operatorLabels[operator]}
          />
        ))}
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
