// @flow
import type { Node } from 'React';
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

  render(): Node {
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
  useAssignmentOperators,
}: ParameterInlineRendererProps): string | Node => {
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
