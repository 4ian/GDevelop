// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type ParameterFieldProps } from './ParameterFieldCommons';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import SelectField, { type SelectFieldInterface } from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

export default class MouseField extends Component<ParameterFieldProps> {
  _field: ?SelectFieldInterface;

  focus() {
    if (this._field) this._field.focus();
  }

  render() {
    const { parameterMetadata, value } = this.props;
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
        value={value}
        ref={field => (this._field = field)}
        onChange={(e, i, value) => this.props.onChange(value)}
      >
        <SelectOption value="Left" primaryText={t`Left (primary)`} />
        <SelectOption value="Right" primaryText={t`Right (secondary)`} />
        <SelectOption
          value="Middle"
          primaryText={t`Middle (Auxiliary button, usually the wheel button)`}
        />
      </SelectField>
    );
  }
}

export const renderInlineMouse = ({
  value,
  InvalidParameterValue,
}: ParameterInlineRendererProps) => {
  return value ? (
    value
  ) : (
    <InvalidParameterValue isEmpty>
      <Trans>Choose a mouse button</Trans>
    </InvalidParameterValue>
  );
};
