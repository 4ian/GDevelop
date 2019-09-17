import { t } from '@lingui/macro';
import React, { Component } from 'react';
import SelectField from '../../UI/SelectField';
import SelectOption from '../../UI/SelectOption';

export default class OperatorField extends Component {
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
        fullWidth
        floatingLabelFixed
        floatingLabelText={description}
        value={this.props.value}
        onChange={(e, i, value) => this.props.onChange(value)}
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
