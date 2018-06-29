import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class OperatorField extends Component {
  focus() {}

  render() {
    const { parameterMetadata } = this.props;
    const description = parameterMetadata
      ? parameterMetadata.getDescription()
      : undefined;

    return (
      <SelectField
        fullWidth
        floatingLabelText={description}
        value={this.props.value}
        onChange={(e, i, value) => this.props.onChange(value)}
        ref={field => (this._field = field)}
      >
        <MenuItem value="=" primaryText="= (set to)" />
        <MenuItem value="+" primaryText="+ (add)" />
        <MenuItem value="-" primaryText="- (substract)" />
        <MenuItem value="*" primaryText="* (multiply by)" />
        <MenuItem value="/" primaryText="/ (divide by)" />
      </SelectField>
    );
  }
}
