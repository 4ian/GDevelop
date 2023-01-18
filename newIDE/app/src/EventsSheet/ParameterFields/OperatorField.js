// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import React, { Component } from 'react';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

const operatorLabels = {
  '=': t`= (set to)`,
  '+': t`+ (add)`,
  '-': t`- (subtract)`,
  '*': t`* (multiply by)`,
  '/': t`/ (divide by)`,
};

const mapTypeToOperators = {
  unknown: Object.keys(operatorLabels),
  number: ['=', '+', '-', '*', '/'],
  string: ['=', '+'],
  color: ['=', '+'],
};

export default class OperatorField extends Component<ParameterFieldProps> {
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
        translatableHintText={t`Choose an operator`}
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

export const renderInlineOperator = ({
  value,
  InvalidParameterValue,
  useAssignmentOperators,
}: ParameterInlineRendererProps) => {
  if (!value) {
    return (
      <InvalidParameterValue isEmpty>
        <Trans>Choose an operator</Trans>
      </InvalidParameterValue>
    );
  }

  if (useAssignmentOperators) {
    if (value === '=') return '=';
    else if (value === '+') return '+=';
    else if (value === '-') return '-=';
    else if (value === '/') return '/=';
    else if (value === '*') return '*=';
  } else {
    if (value === '=') return <Trans>set to</Trans>;
    else if (value === '+') return <Trans>add</Trans>;
    else if (value === '-') return <Trans>subtract</Trans>;
    else if (value === '/') return <Trans>divide by</Trans>;
    else if (value === '*') return <Trans>multiply by</Trans>;
  }

  return <InvalidParameterValue>{value}</InvalidParameterValue>;
};
