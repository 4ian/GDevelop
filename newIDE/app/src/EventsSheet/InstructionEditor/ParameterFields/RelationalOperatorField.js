import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

export default class RelationalOperatorField extends Component {
  render() {
    return (
      <SelectField
        fullWidth
        floatingLabelText={this.props.parameterMetadata.getDescription()}
        value={this.props.value}
        onChange={(e, i, value) => this.props.onChange(value)}
      >
        <MenuItem value="=" primaryText="= (equal to)" />
        <MenuItem value="<" primaryText="< (less than)" />
        <MenuItem value=">" primaryText="> (greater than)" />
        <MenuItem value="<=" primaryText="<= (less or equal to)" />
        <MenuItem value=">=" primaryText=">= (greater or equal to)" />
        <MenuItem value="!=" primaryText="!= (different than)" />
      </SelectField>
    );
  }
}
