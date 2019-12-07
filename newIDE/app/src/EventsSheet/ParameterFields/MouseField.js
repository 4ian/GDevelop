import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type ParameterInlineRendererProps } from './ParameterInlineRenderer.flow';
import React, { Component } from 'react';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

export default class MouseField extends Component {
  focus() {}

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
        value={value}
        ref={field => (this._field = field)}
        onChange={(e, i, value) => this.props.onChange(value)}
        errorText={value ? undefined : <Trans>You must select a button</Trans>}
      >
        <SelectOption value="Left" primaryText={t`Left (primary)`} />
        <SelectOption value="Right" primaryText={t`Right (secondary)`} />
        <SelectOption
          value="Middle"
          primaryText={t`Middle (Auxiliary button, usually the wheel button)`}
        />
        {/* TODO: Add support for these buttons in the game engine
         <SelectOption
          value="XButton1"
          primaryText={t`Special button #1`}
        />
        <SelectOption
          value="XButton2"
          primaryText={t`Special button #2`}
        /> */}
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
